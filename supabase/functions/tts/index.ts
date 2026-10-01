// Spark Lab natural voices (Supabase Edge Function, Deno).
//
//   POST { voice: "bright" | "cheerful" | "teacher" | "robot", plan: [[{ t, stress }]] }   (signed-in users only)
//   → { path: "teacher/<sha256>.mp3" } in the public "tts" storage bucket.
//
// The app turns a line into a reading plan (sentences; stressed words) and first looks for the MP3 in
// storage. Only a line that hasn't been made yet comes here: Google Text-to-Speech reads it in an Indian
// English neural voice (stressed words slower, pauses between sentences), and the MP3 is saved, so every
// later play, by anyone, is free.
//
// Secrets (Edge Functions → Secrets): GOOGLE_TTS_KEY (required).
// Optional: TTS_DAILY_CHARS (per family per day, default 20000), TTS_MONTHLY_CHARS (whole app, default 900000).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// Deploy with "Verify JWT" ON: only signed-in parents' apps can call it.
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const BUCKET = "tts";
export const VERSION = 1; // bump to re-record everything (the app sends the same number)
const DAILY = Number(env("TTS_DAILY_CHARS", "20000"));
const MONTHLY = Number(env("TTS_MONTHLY_CHARS", "900000"));

// Google voices to try for each preset, best first (Neural2 → WaveNet → Standard).
// A = female, B = male, C = male, D = female. Pitch is in semitones.
export const VOICES: Record<string, { names: string[]; pitch: number; rate: number }> = {
  bright: { names: ["en-IN-Neural2-A", "en-IN-Wavenet-A", "en-IN-Standard-A"], pitch: 2, rate: 0.92 },
  cheerful: { names: ["en-IN-Neural2-B", "en-IN-Wavenet-B", "en-IN-Standard-B"], pitch: 1.5, rate: 0.94 },
  teacher: { names: ["en-IN-Neural2-D", "en-IN-Wavenet-D", "en-IN-Standard-D"], pitch: 0, rate: 0.9 },
  robot: { names: ["en-IN-Neural2-C", "en-IN-Wavenet-C", "en-IN-Standard-C"], pitch: -2, rate: 0.9 },
};

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

type Part = { t: string; stress: boolean };
// Checks the plan and rebuilds it with exactly these keys, in this order (the app hashes the same shape).
export function cleanPlan(plan: unknown): Part[][] | null {
  if (!Array.isArray(plan) || !plan.length || plan.length > 20) return null;
  let chars = 0;
  const out: Part[][] = [];
  for (const s of plan) {
    if (!Array.isArray(s) || !s.length || s.length > 20) return null;
    const row: Part[] = [];
    for (const p of s) {
      if (!p || typeof p.t !== "string" || !p.t.trim() || p.t.length > 400) return null;
      chars += p.t.length;
      row.push({ t: p.t, stress: p.stress === true });
    }
    out.push(row);
  }
  return chars <= 1500 ? out : null;
}
export const canonical = (voice: string, plan: Part[][]) => JSON.stringify({ v: VERSION, voice, plan });
export const charsOf = (plan: Part[][]) => plan.flat().reduce((n, p) => n + p.t.length, 0);
export const plainOf = (plan: Part[][]) => plan.map(s => s.map(p => p.t).join("").trim()).join(" ");

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]!));
// Stressed words: slower and a touch higher, like a teacher. A short pause between sentences.
export function ssmlOf(plan: Part[][]) {
  const sentence = (s: Part[]) => s.map(p => (p.stress ? `<prosody rate="85%" pitch="+1st">${esc(p.t)}</prosody>` : esc(p.t))).join("").trim();
  return `<speak>${plan.map(sentence).join('<break time="350ms"/>')}</speak>`;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Asks Google for the audio: each voice name with SSML, then as plain text; the next name if the voice is unavailable.
export async function synthesize(voiceId: string, plan: Part[][], key: string, fetcher = fetch): Promise<Uint8Array> {
  const v = VOICES[voiceId];
  let last = "";
  for (const name of v.names) {
    for (const input of [{ ssml: ssmlOf(plan) }, { text: plainOf(plan) }]) {
      const res = await fetcher(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, voice: { languageCode: "en-IN", name }, audioConfig: { audioEncoding: "MP3", speakingRate: v.rate, pitch: v.pitch } }),
      });
      if (res.ok) {
        const { audioContent } = await res.json();
        return Uint8Array.from(atob(audioContent), c => c.charCodeAt(0));
      }
      last = `${res.status} ${(await res.text()).slice(0, 300)}`;
      if (res.status !== 400) throw new Error(`Google TTS ${last}`); // key, quota or server problem: don't retry
    }
  }
  throw new Error(`Google TTS ${last}`);
}

const today = () => new Date().toISOString().slice(0, 10);

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply(405, { error: "POST only" });
  try {
    const key = env("GOOGLE_TTS_KEY");
    if (!key) return reply(503, { error: "GOOGLE_TTS_KEY is not set" });
    // Who is asking (the platform has already checked the token).
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await db.auth.getUser(jwt);
    const user = auth?.user;
    if (!user) return reply(401, { error: "sign in first" });

    const body = await req.json().catch(() => null);
    const voice = body?.voice;
    const plan = cleanPlan(body?.plan);
    if (!VOICES[voice] || !plan) return reply(400, { error: "bad request" });

    // Children's names are never sent to Google (the app checks too).
    const text = plainOf(plan).toLowerCase();
    const { data: kids } = await db.from("children").select("name").eq("parent_id", user.id);
    if ((kids ?? []).some(k => k.name && new RegExp(`\\b${k.name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text))) {
      return reply(422, { error: "contains a name; use the device voice" });
    }

    const path = `${voice}/${await sha256(canonical(voice, plan))}.mp3`;
    const head = await fetch(`${env("SUPABASE_URL")}/storage/v1/object/public/${BUCKET}/${path}`, { method: "HEAD" });
    if (head.ok) return reply(200, { path, cached: true });

    // Limits: per family per day, and for the whole app per month.
    const chars = charsOf(plan);
    const day = today();
    const { data: mine } = await db.from("tts_usage").select("chars").eq("user_id", user.id).eq("day", day).maybeSingle();
    if ((mine?.chars ?? 0) + chars > DAILY) return reply(429, { error: "daily voice limit reached" });
    const { data: month } = await db.from("tts_usage").select("chars").gte("day", `${day.slice(0, 7)}-01`);
    if ((month ?? []).reduce((n, r) => n + r.chars, 0) + chars > MONTHLY) return reply(429, { error: "monthly voice limit reached" });

    const mp3 = await synthesize(voice, plan, key);
    const { error: upErr } = await db.storage.from(BUCKET).upload(path, mp3, { contentType: "audio/mpeg", cacheControl: "31536000", upsert: true });
    if (upErr) throw new Error(upErr.message);
    await db.from("tts_usage").upsert({ user_id: user.id, day, chars: (mine?.chars ?? 0) + chars }, { onConflict: "user_id,day" });
    return reply(200, { path, cached: false });
  } catch (e) {
    console.error(e);
    return reply(500, { error: String(e).slice(0, 300) });
  }
});

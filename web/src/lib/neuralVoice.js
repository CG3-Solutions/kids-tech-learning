// Natural (neural) voices: Google Text-to-Speech, recorded once by the "tts" Edge Function and kept
// in Supabase Storage. Each line is looked up by a hash of exactly what is said, so a line is made
// once and then played from storage by everyone. The device voice is used instead when:
//   • the app is in demo mode or nobody is signed in, or the parent turned natural voices off;
//   • the line contains a child's name (names are never sent to Google);
//   • storage or the function is slow or fails (then natural voices rest for a few minutes).
import { local } from "./storage.js";

export const VERSION = 1; // must match supabase/functions/tts/index.ts

let cfg = null; // { publicUrl(path), synth({ voice, plan }) → { path } }
export function setNeural(c) { if (c !== cfg) { cfg = c; failedAt = 0; lastError = null; confirmed = false; } }
export const neuralAvailable = () => !!cfg;
export const neuralEnabled = () => local.get("sparklab.neuralVoice", true);
export const setNeuralEnabled = v => local.set("sparklab.neuralVoice", v);
export const neuralOn = () => !!cfg && neuralEnabled() && Date.now() - failedAt > REST_MS;

let failedAt = 0, lastError = null, confirmed = false;
// True once a recording has worked in this session. Until then the device voice speaks first,
// so a missing setup never means silence.
export const neuralConfirmed = () => confirmed;
const REST_MS = 5 * 60 * 1000;
export const neuralFailed = e => { failedAt = Date.now(); lastError = e?.message ?? String(e ?? "failed"); };
export const neuralLastError = () => lastError;

// Children's (and the parent's) names: lines containing them stay on the device.
let names = [];
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function setPrivateNames(list) { names = [...new Set((list ?? []).map(n => String(n ?? "").trim()).filter(n => n.length >= 2))]; }
export const hasPrivate = text => names.some(n => new RegExp(`(^|[^\\p{L}])${escRe(n)}($|[^\\p{L}])`, "iu").test(text));

// The exact shape the function hashes: { v, voice, plan: [[{ t, stress }]] }.
export const cleanPlan = plan => plan.map(s => s.map(p => ({ t: String(p.t), stress: p.stress === true })));
export const canonical = (voice, plan) => JSON.stringify({ v: VERSION, voice, plan: cleanPlan(plan) });
export async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const ready = new Set(); // paths known to exist in storage
// The URL of the recorded line, making it first if needed. Throws if it can't.
export async function neuralUrl(voice, plan) {
  if (!cfg) throw new Error("natural voices are off");
  const path = `${voice}/${await sha256(canonical(voice, plan))}.mp3`;
  const url = cfg.publicUrl(path);
  if (ready.has(path)) return url;
  const head = await fetch(url, { method: "HEAD" }).catch(() => null);
  if (!head?.ok) {
    const made = await cfg.synth({ voice, plan: cleanPlan(plan) });
    if (made?.path !== path) throw new Error("unexpected voice file");
  }
  ready.add(path);
  confirmed = true;
  return url;
}

// For "Test natural voice" in Voice & sound: makes (or finds) a short line and says what went wrong, if anything.
export async function testNeural(voice = "teacher") {
  if (!cfg) return { ok: false, error: "Natural voices work when you're signed in (not in the demo)." };
  const plan = [[{ t: "Hello! This is my ", stress: false }, { t: "natural", stress: true }, { t: " voice.", stress: false }]];
  try {
    const url = await neuralUrl(voice, plan);
    failedAt = 0; lastError = null;
    return { ok: true, url };
  } catch (e) {
    neuralFailed(e);
    return { ok: false, error: explain(e) };
  }
}
// Turns a failure into a next step for the parent.
export function explain(e) {
  const m = e?.message ?? String(e);
  if (e?.status === 401) return "The voice service didn't accept the sign-in. Sign out and in again.";
  if (e?.status === 404 || /Failed to send a request/i.test(m)) return "Can't reach the voice service. In Supabase → Edge Functions, check there is a function named “tts” and that “Verify JWT” is OFF for it.";
  if (e?.status === 503 || /GOOGLE_TTS_KEY/.test(m)) return "The Google key is missing: add the GOOGLE_TTS_KEY secret in Supabase → Edge Functions → Secrets.";
  if (e?.status === 429) return "Today's voice limit is used up. Lessons use the device voice until tomorrow.";
  if (/Google TTS 403|PERMISSION_DENIED|API_KEY|API key/i.test(m)) return "Google refused the key: enable the Cloud Text-to-Speech API and check the key is restricted to it.";
  if (/bucket|not found/i.test(m)) return "The recordings storage is missing: run supabase/release-5.sql in the SQL Editor.";
  return `The voice service failed: ${m}`;
}

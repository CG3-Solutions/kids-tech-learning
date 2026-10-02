// Natural (neural) voices: Google Text-to-Speech, recorded once by the "tts" Edge Function and kept
// in Supabase Storage. Each line is looked up by a hash of exactly what is said, so a line is made
// once and then played from storage by everyone. The device voice is used instead when:
//   • the app is in demo mode or nobody is signed in, or the parent turned natural voices off;
//   • the line contains a child's name (names are never sent to Google);
//   • a line that isn't recorded yet can't be made (the service is slow, failing or over its limit).
// A line that is already recorded always plays in the natural voice, whatever happened to the service
// since: it comes straight from storage. That keeps a lesson in one voice.
import { local } from "./storage.js";

export const VERSION = 1; // must match supabase/functions/tts/index.ts

let cfg = null; // { publicUrl(path), synth({ voice, plan }) → { path } }
export function setNeural(c) { if (c !== cfg) { cfg = c; failedAt = 0; restMs = REST_MS; lastError = null; confirmed = false; } }
export const neuralAvailable = () => !!cfg;
export const neuralEnabled = () => local.get("sparklab.neuralVoice", true);
export const setNeuralEnabled = v => local.set("sparklab.neuralVoice", v);
// Natural voices are wanted (signed in, and the parent has them on). Recorded lines play whenever this is true.
export const neuralWanted = () => !!cfg && neuralEnabled();
// New lines can be made right now (the service isn't resting after a failure).
export const neuralOn = () => neuralWanted() && Date.now() - failedAt > restMs;

const REST_MS = 5 * 60 * 1000, LIMIT_REST_MS = 60 * 60 * 1000;
let failedAt = 0, restMs = REST_MS, lastError = null, confirmed = false;
// True once a recording has worked: in this session, or on this device in the last week (so the first
// line after opening the app is natural too). Until then the device voice speaks first, so a missing
// setup never means silence. A setup failure forgets it.
const OK_KEY = "sparklab.ttsOk", OK_MS = 7 * 24 * 60 * 60 * 1000;
const worked = () => { if (!confirmed) { confirmed = true; local.set(OK_KEY, Date.now()); } };
export const neuralConfirmed = () => confirmed || Date.now() - local.get(OK_KEY, 0) < OK_MS;
// After a failure new lines use the device voice for a while (an hour when the daily limit is used up).
export const neuralFailed = e => {
  failedAt = Date.now(); restMs = e?.status === 429 ? LIMIT_REST_MS : REST_MS;
  lastError = e?.message ?? String(e ?? "failed");
  if (e?.status !== 429) { confirmed = false; local.remove(OK_KEY); }
};
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

// Lines known to be recorded, remembered on this device so they play straight from storage.
// (The app never asks storage "is it there?" itself: a missing file shows as a red 400 in the browser
// console. The function checks storage instead and records the line only if needed.)
const KNOWN_KEY = "sparklab.ttsKnown", KNOWN_MAX = 4000;
let known = null;
const knownSet = () => (known ??= new Set(local.get(KNOWN_KEY, [])));
function remember(path) {
  const k = knownSet(); if (k.has(path)) return;
  k.add(path);
  local.set(KNOWN_KEY, [...k].slice(-KNOWN_MAX));
}
export function forget(url) {
  const path = String(url).split("/tts/").pop();
  if (knownSet().delete(path)) local.set(KNOWN_KEY, [...knownSet()]);
}
const pending = new Map(); // path → promise, so a line being prepared isn't asked for twice

// Is this line already recorded (as far as this device knows)? No network.
export async function neuralKnown(voice, plan) {
  if (!cfg) return false;
  return knownSet().has(`${voice}/${await sha256(canonical(voice, plan))}.mp3`);
}

// The URL of the recorded line, making it first if needed. Throws if it can't.
export async function neuralUrl(voice, plan) {
  if (!cfg) throw new Error("natural voices are off");
  const path = `${voice}/${await sha256(canonical(voice, plan))}.mp3`;
  const url = cfg.publicUrl(path);
  if (knownSet().has(path)) { worked(); return url; }
  if (!pending.has(path)) {
    pending.set(path, cfg.synth({ voice, plan: cleanPlan(plan) })
      .then(made => { if (made?.path !== path) throw new Error("unexpected voice file"); remember(path); worked(); return url; })
      .finally(() => pending.delete(path)));
  }
  return pending.get(path);
}

// Called once after sign-in: makes (or finds) one short line, so the service is awake and proven
// before the first lesson line is spoken.
const WARM = [[{ t: "Ready.", stress: false }]];
export function warmNeural() {
  if (!neuralOn()) return Promise.resolve(false);
  return neuralUrl("teacher", WARM).then(() => true, e => { neuralFailed(e); return false; });
}

// For "Test natural voice" in Voice & sound: makes (or finds) a short line and says what went wrong, if anything.
export async function testNeural(voice = "teacher") {
  if (!cfg) return { ok: false, error: "Natural voices work when you're signed in (not in the demo)." };
  const plan = [[{ t: "Hello! This is my ", stress: false }, { t: "natural", stress: true }, { t: " voice.", stress: false }]];
  try {
    const url = await neuralUrl(voice, plan);
    failedAt = 0; restMs = REST_MS; lastError = null;
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

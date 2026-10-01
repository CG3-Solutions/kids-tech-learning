// Natural (neural) voices: Google Text-to-Speech, recorded once by the "tts" Edge Function and kept
// in Supabase Storage. Each line is looked up by a hash of exactly what is said, so a line is made
// once and then played from storage by everyone. The device voice is used instead when:
//   • the app is in demo mode or nobody is signed in, or the parent turned natural voices off;
//   • the line contains a child's name (names are never sent to Google);
//   • storage or the function is slow or fails (then natural voices rest for a few minutes).
import { local } from "./storage.js";

export const VERSION = 1; // must match supabase/functions/tts/index.ts

let cfg = null; // { publicUrl(path), synth({ voice, plan }) → { path } }
export function setNeural(c) { cfg = c; failedAt = 0; }
export const neuralAvailable = () => !!cfg;
export const neuralEnabled = () => local.get("sparklab.neuralVoice", true);
export const setNeuralEnabled = v => local.set("sparklab.neuralVoice", v);
export const neuralOn = () => !!cfg && neuralEnabled() && Date.now() - failedAt > REST_MS;

let failedAt = 0;
const REST_MS = 5 * 60 * 1000;
export const neuralFailed = () => { failedAt = Date.now(); };

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
  return url;
}

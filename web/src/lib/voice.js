// Kid-friendly voices built from the device's own text-to-speech voices.
// Browsers only ship adult voices, so each preset picks a suitable voice and tunes pitch and speed.
import { local } from "./storage.js";

export const VOICES = [
  { id: "bright", name: "Bright girl", emoji: "👧", like: /female|samantha|zira|susan|karen|moira|tessa|veena|heera|victoria|serena|fiona|google (uk|us) english$|google .*female|neerja|aditi|priya/i, pitch: 1.55, rate: 1.0 },
  { id: "cheerful", name: "Cheerful boy", emoji: "👦", like: /\bmale|daniel|alex|rishi|fred|david|mark|oliver|aaron|arthur|google uk english male|prabhat|ravi/i, pitch: 1.45, rate: 1.02 },
  { id: "robot", name: "Friendly robot", emoji: "🤖", like: /./, pitch: 0.75, rate: 0.95 },
  { id: "teacher", name: "Calm teacher", emoji: "🧑‍🏫", like: /female|samantha|zira|karen|moira|veena|heera|neerja|aditi/i, pitch: 1.05, rate: 0.88 },
];
export const defaultVoiceFor = gender => (gender === "girl" ? "bright" : gender === "boy" ? "cheerful" : "robot");
export const voiceOf = child => VOICES.find(v => v.id === (child?.voice || defaultVoiceFor(child?.gender))) ?? VOICES[2];

let current = VOICES[2];
export function setVoice(preset) { current = preset ?? VOICES[2]; }

// Indian English first, then British, then any English.
const LANG_ORDER = [/en[-_]IN/i, /en[-_]GB/i, /^en/i];
function pickDeviceVoice(preset) {
  const all = window.speechSynthesis?.getVoices?.() ?? [];
  const english = all.filter(v => /^en/i.test(v.lang));
  const pool = english.length ? english : all;
  for (const lang of LANG_ORDER) {
    const m = pool.find(v => lang.test(v.lang) && preset.like.test(v.name));
    if (m) return m;
  }
  return pool.find(v => preset.like.test(v.name)) ?? pool.find(v => LANG_ORDER[0].test(v.lang)) ?? pool[0] ?? null;
}

// Voices load asynchronously in some browsers; wait once for them.
try { window.speechSynthesis?.addEventListener?.("voiceschanged", () => {}); } catch { /* ignore */ }

export function speakWith(preset, text) {
  try {
    const ss = window.speechSynthesis;
    if (!ss || !text) return false;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickDeviceVoice(preset);
    if (v) { u.voice = v; u.lang = v.lang; }
    u.pitch = preset.pitch; u.rate = preset.rate;
    ss.speak(u);
    return true;
  } catch { return false; }
}

export const speakNow = text => speakWith(current, text);
export const voiceEnabled = () => local.get("sparklab.voiceOn", true);
export const setVoiceEnabled = v => local.set("sparklab.voiceOn", v);

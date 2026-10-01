// Kid-friendly voices built from the device's own text-to-speech voices.
// Browsers only ship adult voices, so each preset picks a suitable voice and tunes pitch and speed.
import { local } from "./storage.js";
import { speechText } from "./speechText.js";

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

// One voice at a time. Children often tap quickly, and browsers (Safari especially) can play
// two lines over each other if a new one starts the moment the old one is cancelled. So every
// request goes through here: the newest line wins, it starts after a short pause, and the same
// line is not repeated straight away.
let timer = null, lastText = "", lastAt = 0, keep = null;
const GAP_MS = 140;

export function hushVoice() {
  clearTimeout(timer); timer = null;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
}

export function speakWith(preset, raw, { force = false } = {}) {
  try {
    const ss = window.speechSynthesis;
    const text = speechText(raw);
    if (!ss || !text) return false;
    const now = Date.now();
    if (!force && text === lastText && now - lastAt < 2500) return true;
    lastText = text; lastAt = now;
    clearTimeout(timer);
    ss.cancel();
    timer = setTimeout(() => {
      timer = null;
      if (document.visibilityState === "hidden") return;
      ss.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const v = pickDeviceVoice(preset);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.pitch = preset.pitch; u.rate = preset.rate;
      keep = u; // some browsers drop speech if the utterance is garbage-collected
      u.onend = () => { if (keep === u) keep = null; };
      ss.speak(u);
    }, GAP_MS);
    return true;
  } catch { return false; }
}

// Stop talking when the app goes to the background.
try { document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") hushVoice(); }); } catch { /* ignore */ }

export const speakNow = (text, opts) => speakWith(current, text, opts);
export const voiceEnabled = () => local.get("sparklab.voiceOn", true);
export const setVoiceEnabled = v => local.set("sparklab.voiceOn", v);

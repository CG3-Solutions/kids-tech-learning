// Voices for the story characters, built from the device's own text-to-speech voices.
// Clarity first: big pitch changes make voices sound unnatural and hard for children to follow,
// so presets only nudge pitch, speak a little slower, and the best natural voice on the device is chosen.
import { local } from "./storage.js";
import { speechPlan } from "./speechPlan.js";
import { neuralOn, hasPrivate, neuralUrl, neuralFailed, neuralConfirmed } from "./neuralVoice.js";

export const VOICES = [
  { id: "bright", name: "Bright girl", emoji: "👧", gender: "f", pitch: 1.12, rate: 0.92 },
  { id: "cheerful", name: "Cheerful boy", emoji: "👦", gender: "m", pitch: 1.08, rate: 0.93 },
  { id: "teacher", name: "Clear teacher", emoji: "🧑‍🏫", gender: "f", pitch: 1.0, rate: 0.88 },
  { id: "robot", name: "Friendly robot", emoji: "🤖", gender: "m", pitch: 0.88, rate: 0.9 },
];
export const defaultVoiceFor = gender => (gender === "girl" ? "bright" : gender === "boy" ? "cheerful" : "teacher");
export const voiceOf = child => VOICES.find(v => v.id === (child?.voice || (child?.learner === "adult" ? "teacher" : defaultVoiceFor(child?.gender)))) ?? VOICES[2];

let current = VOICES[2];
export function setVoice(preset) { current = preset ?? VOICES[2]; }

// Speaking speed on this device (a multiplier on each preset).
export const SPEEDS = [{ id: "slow", name: "Slower", rate: 0.82 }, { id: "normal", name: "Normal", rate: 1 }, { id: "quick", name: "Quicker", rate: 1.12 }];
export const voiceSpeed = () => SPEEDS.find(s => s.id === local.get("sparklab.voiceSpeed", "normal")) ?? SPEEDS[1];
export const setVoiceSpeed = id => local.set("sparklab.voiceSpeed", id);

// Ranks the device's voices: natural/neural voices first, Indian English, then British, then any English.
// Novelty voices (macOS "Bubbles", "Zarvox"…) and eSpeak are pushed to the bottom.
const NATURAL = /natural|neural|enhanced|premium|online|wavenet|siri/i;
const NOVELTY = /albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|superstar|trinoids|whisper|wobble|zarvox|\bfred\b|junior|ralph|kathy|princess|espeak/i;
const FEMALE = /female|woman|samantha|zira|susan|karen|moira|tessa|veena|heera|victoria|serena|fiona|neerja|aditi|priya|swara|kalpana|isha|sonia|libby|aria|jenny|ava|allison|google uk english female|google us english/i;
const MALE = /\bmale|man\b|daniel|alex|rishi|david|mark|oliver|aaron|arthur|prabhat|ravi|hemant|madhur|ryan|guy|tom|google uk english male/i;
export function scoreVoice(v, preset) {
  let s = 0;
  if (NATURAL.test(v.name)) s += 50;
  if (/en[-_]IN/i.test(v.lang)) s += 30; else if (/en[-_]GB/i.test(v.lang)) s += 18; else if (/^en/i.test(v.lang)) s += 10; else s -= 100;
  if (/google|microsoft/i.test(v.name)) s += 8;
  if (v.localService === false) s += 4; // network voices are usually the higher-quality ones
  const want = preset.gender === "m" ? MALE : FEMALE, other = preset.gender === "m" ? FEMALE : MALE;
  if (want.test(v.name)) s += 20; else if (other.test(v.name)) s -= 15;
  if (NOVELTY.test(v.name)) s -= 300;
  return s;
}
// (The default is worked out inside the function: optional chaining in a default parameter builds wrongly.)
export function pickDeviceVoice(preset, voices) {
  const all = voices ?? window.speechSynthesis?.getVoices?.() ?? [];
  let best = null, top = -Infinity;
  for (const v of all) { const sc = scoreVoice(v, preset); if (sc > top) { top = sc; best = v; } }
  return best;
}

// Voices load asynchronously in some browsers; wait once for them.
try { window.speechSynthesis?.addEventListener?.("voiceschanged", () => {}); } catch { /* ignore */ }

// Who is listening for "is it talking?" (to show a Stop button).
const listeners = new Set();
let speaking = null; // the text being read, or null
const setSpeaking = t => { speaking = t; listeners.forEach(f => f(t)); };
export const onSpeaking = fn => { listeners.add(fn); return () => listeners.delete(fn); };
export const speakingText = () => speaking;

// One voice at a time. Children often tap quickly, and browsers (Safari especially) can play
// two lines over each other if a new one starts the moment the old one is cancelled. So every
// request goes through here: the newest line wins, it starts after a short pause, and the same
// line is not repeated straight away.
let timer = null, lastText = "", lastAt = 0, keep = [], run = 0;
const GAP_MS = 140;
const STRESS_RATE = 0.8, STRESS_PITCH = 0.08; // a stressed word: slower and a little higher, like a teacher

// One <audio> element for natural (recorded) voices.
let audio = null;
const getAudio = () => {
  if (!audio && typeof Audio !== "undefined") { audio = new Audio(); audio.preload = "auto"; }
  return audio;
};
// Phones only allow sound after a tap. The first tap anywhere "unlocks" the audio element, so later
// lines (which start after loading) can play.
const SILENCE = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
try {
  const unlock = () => {
    const a = getAudio(); if (!a) return;
    if (!a.src) { a.src = SILENCE; a.play().then(() => a.pause()).catch(() => {}); }
    window.removeEventListener("pointerdown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
} catch { /* ignore */ }

const NEURAL_WAIT_MS = 2500; // longer than this to get a recording: use the device voice for this line

export function hushVoice() {
  clearTimeout(timer); timer = null; run++;
  try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
  try { if (audio && !audio.paused) audio.pause(); } catch { /* ignore */ }
  if (speaking) setSpeaking(null);
}

// The device voice: sentence by sentence, stressed words as their own short utterance, said slower.
function speakDevice(preset, raw, plan, slow, mine) {
  const ss = window.speechSynthesis;
  if (!ss) return;
  ss.cancel();
  const v = pickDeviceVoice(preset);
  const rate = preset.rate * voiceSpeed().rate * (slow ? 0.8 : 1);
  // Too many stressed words in one sentence sounds choppy: then read it in one go.
  const chunks = plan.flatMap(parts => (parts.filter(p => p.stress).length > 2 ? [{ t: parts.map(p => p.t).join(""), stress: false }] : parts));
  keep = chunks.map((c, i) => {
    const u = new SpeechSynthesisUtterance(c.t);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-IN";
    u.rate = Math.max(0.5, rate * (c.stress ? STRESS_RATE : 1));
    u.pitch = Math.min(2, preset.pitch + (c.stress ? STRESS_PITCH : 0));
    if (i === 0) u.onstart = () => { if (mine === run) setSpeaking(raw); };
    if (i === chunks.length - 1) u.onend = u.onerror = () => { if (mine === run) { keep = []; setSpeaking(null); } };
    return u; // kept so the browser doesn't drop speech when the utterance is garbage-collected
  });
  keep.forEach(u => ss.speak(u));
}

// The natural voice: play the recorded line. Resolves true if it started playing.
async function speakNeural(preset, raw, plan, slow, mine) {
  const a = getAudio();
  if (!a) return false;
  const url = await Promise.race([neuralUrl(preset.id, plan), new Promise((_, no) => setTimeout(() => no(new Error("slow")), NEURAL_WAIT_MS))]);
  if (mine !== run) return true; // a newer line has started; nothing to do
  a.src = url;
  a.playbackRate = voiceSpeed().rate * (slow ? 0.8 : 1);
  a.onplaying = () => { if (mine === run) setSpeaking(raw); };
  a.onended = a.onerror = () => { if (mine === run) setSpeaking(null); };
  await a.play();
  return true;
}

// Reads `raw` in the preset's voice: the natural voice when it's on and the line has no names,
// otherwise (or if that fails) the device voice.
// opts.force: say it even if it was just said. opts.slow: extra slow ("Say it slowly").
export function speakWith(preset, raw, { force = false, slow = false } = {}) {
  try {
    const plan = speechPlan(raw);
    const ss = window.speechSynthesis;
    const natural = neuralOn() && !hasPrivate(raw);
    if (!plan.length || (!ss && !natural)) return false;
    const key = JSON.stringify(plan);
    const now = Date.now();
    if (!force && key === lastText && now - lastAt < 2500) return true;
    lastText = key; lastAt = now;
    clearTimeout(timer);
    try { ss?.cancel(); } catch { /* ignore */ }
    try { if (audio && !audio.paused) audio.pause(); } catch { /* ignore */ }
    const mine = ++run;
    timer = setTimeout(() => {
      timer = null;
      if (document.visibilityState === "hidden" || mine !== run) return;
      if (!natural) { speakDevice(preset, raw, plan, slow, mine); return; }
      // Natural voices not proven yet in this session: speak now with the device voice, and get the
      // recording ready in the background (so the next time this line is natural).
      if (!neuralConfirmed()) {
        speakDevice(preset, raw, plan, slow, mine);
        neuralUrl(preset.id, plan).catch(e => { if (e?.status !== 422) neuralFailed(e); });
        return;
      }
      speakNeural(preset, raw, plan, slow, mine).catch(e => {
        if (e?.message !== "slow" && e?.name !== "NotAllowedError" && e?.status !== 422) neuralFailed(e); // rest natural voices for a while
        if (mine === run) speakDevice(preset, raw, plan, slow, mine);
      });
    }, GAP_MS);
    return true;
  } catch { return false; }
}

// Stop talking when the app goes to the background.
try { document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") hushVoice(); }); } catch { /* ignore */ }

export const speakNow = (text, opts) => speakWith(current, text, opts);
export const voiceEnabled = () => local.get("sparklab.voiceOn", true);
export const setVoiceEnabled = v => local.set("sparklab.voiceOn", v);

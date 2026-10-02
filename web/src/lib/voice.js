// Voices for the story characters, built from the device's own text-to-speech voices.
// Clarity first: big pitch changes make voices sound unnatural and hard for children to follow,
// so presets only nudge pitch, speak a little slower, and the best natural voice on the device is chosen.
import { local } from "./storage.js";
import { speechPlan } from "./speechPlan.js";
import { neuralOn, neuralWanted, neuralKnown, hasPrivate, neuralUrl, neuralFailed, neuralConfirmed, neuralLastError, forget, explain } from "./neuralVoice.js";

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

// Which voice said each recent line, and why (shown to parents in Voice & sound, so "why did I
// hear a different voice?" has an answer).
const WHY = {
  name: "The line has a name in it. Names never leave this device.",
  first: "The first line while the voice service was being checked.",
  slow: "The recording took too long to make. It will be natural next time.",
  blocked: "The browser hadn't allowed sound yet.",
  missing: "The recording had gone missing. It will be made again.",
};
const history = [];
function note(raw, natural, why = "") {
  history.unshift({ at: Date.now(), text: String(raw).slice(0, 70), natural, why: WHY[why] ?? why });
  if (history.length > 30) history.length = 30;
}
export const voiceHistory = () => history.slice();

// Longer than this to get a recording: use the device voice for this line (it keeps recording, for next time).
// A parent's Preview waits longer, so it really plays the chosen voice.
const NEURAL_WAIT_MS = 6000, PATIENT_WAIT_MS = 12000;

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
async function speakNeural(preset, raw, plan, slow, mine, wait = NEURAL_WAIT_MS) {
  const a = getAudio();
  if (!a) return false;
  const url = await Promise.race([neuralUrl(preset.id, plan), new Promise((_, no) => setTimeout(() => no(new Error("slow")), wait))]);
  if (mine !== run) return true; // a newer line has started; nothing to do
  a.src = url;
  a.playbackRate = voiceSpeed().rate * (slow ? 0.8 : 1);
  a.onplaying = () => { if (mine === run) setSpeaking(raw); };
  a.onended = () => { if (mine === run) setSpeaking(null); };
  // The file is gone (e.g. storage was cleared): forget it, and say the line with the device voice.
  a.onerror = () => { forget(url); if (mine === run) { setSpeaking(null); note(raw, false, "missing"); speakDevice(preset, raw, plan, slow, mine); } };
  await a.play();
  note(raw, true);
  return true;
}

// Reads `raw` in the preset's voice. To keep a lesson in one voice:
//   • a line that is already recorded always plays in the natural voice (straight from storage);
//   • a new line is recorded first (waiting a few seconds), unless the service is resting after a failure;
//   • the device voice is used only for a line with a name, when natural voices are off, or when a
//     new line can't be made in time.
// opts.force: say it even if it was just said. opts.slow: extra slow ("Say it slowly").
// opts.patient: wait longer for a new recording (the parent's Preview button).
export function speakWith(preset, raw, { force = false, slow = false, patient = false } = {}) {
  try {
    const plan = speechPlan(raw);
    const ss = window.speechSynthesis;
    const named = hasPrivate(raw), natural = neuralWanted() && !named;
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
      const device = why => { if (mine !== run) return; if (why) note(raw, false, why); speakDevice(preset, raw, plan, slow, mine); };
      if (!natural) { device(named && neuralWanted() ? "name" : ""); return; }
      const viaNatural = wait => speakNeural(preset, raw, plan, slow, mine, wait).catch(e => {
        const soft = e?.message === "slow" || e?.name === "NotAllowedError" || e?.status === 422;
        if (!soft) neuralFailed(e); // new lines rest for a while; recorded lines keep playing
        device(e?.message === "slow" ? "slow" : e?.name === "NotAllowedError" ? "blocked" : e?.status === 422 ? "name" : explain(e));
      });
      neuralKnown(preset.id, plan).catch(() => false).then(known => {
        if (mine !== run) return;
        if (known) { viaNatural(NEURAL_WAIT_MS); return; } // recorded: plays from storage, whatever state the service is in
        if (!neuralOn()) { device(explain(new Error(neuralLastError() ?? "The voice service is resting."))); return; }
        // Natural voices not proven yet on this device: speak now with the device voice, and get the
        // recording ready in the background (so the next time this line is natural).
        if (!neuralConfirmed() && !patient) {
          device("first");
          neuralUrl(preset.id, plan).catch(e => { if (e?.status !== 422) neuralFailed(e); });
          return;
        }
        viaNatural(patient ? PATIENT_WAIT_MS : NEURAL_WAIT_MS);
      });
    }, GAP_MS);
    return true;
  } catch { return false; }
}

// Records lines that are about to be needed (the next screens of a lesson), one at a time in the
// background, so they play at once. Only when natural voices are on and have worked in this session.
const queue = [];
let fetching = false;
export function prefetchSpeech(texts, preset = current) {
  if (!neuralOn() || !neuralConfirmed()) return;
  for (const raw of texts) {
    if (!raw || hasPrivate(raw)) continue;
    const plan = speechPlan(raw);
    if (plan.length) queue.push([preset.id, plan]);
  }
  if (queue.length > 30) queue.splice(0, queue.length - 30);
  const next = () => {
    const job = queue.shift();
    if (!job) { fetching = false; return; }
    fetching = true;
    neuralUrl(...job).catch(e => { if (e?.status !== 422) neuralFailed(e); queue.length = 0; }).finally(next);
  };
  if (!fetching) next();
}

// Stop talking when the app goes to the background.
try { document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") hushVoice(); }); } catch { /* ignore */ }

export const speakNow = (text, opts) => speakWith(current, text, opts);
export const voiceEnabled = () => local.get("sparklab.voiceOn", true);
export const setVoiceEnabled = v => local.set("sparklab.voiceOn", v);

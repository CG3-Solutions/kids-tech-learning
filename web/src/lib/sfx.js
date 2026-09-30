// Tiny synthesized sound effects (no audio files). Browsers only play sound after a tap, which is always the case here.
import { local } from "./storage.js";

let ctx = null;
let muted = local.get("sparklab.muted", false);
const listeners = new Set();

export const isMuted = () => muted;
export function setMuted(v) { muted = v; local.set("sparklab.muted", v); listeners.forEach(fn => fn(v)); }
export function onMuteChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function tone(freq, start, dur, { type = "sine", vol = 0.08, slideTo } = {}) {
  const t = ctx.currentTime + start;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t); osc.stop(t + dur + 0.02);
}

function play(fn) {
  if (muted) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    fn();
  } catch { /* sound not available */ }
}

export const sfx = {
  click: () => play(() => tone(660, 0, 0.06, { type: "square", vol: 0.03 })),
  on: () => play(() => tone(440, 0, 0.12, { slideTo: 880 })),
  off: () => play(() => tone(660, 0, 0.12, { slideTo: 330 })),
  ding: () => play(() => { tone(880, 0, 0.18); tone(1320, 0.09, 0.25); }),
  oops: () => play(() => tone(220, 0, 0.25, { type: "triangle", vol: 0.07, slideTo: 150 })),
  tada: () => play(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.3, { vol: 0.07 }))),
};

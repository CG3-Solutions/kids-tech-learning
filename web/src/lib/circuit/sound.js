// Sounds for the Circuit Lab's chips, synthesized with the Web Audio API (no recordings).
// The melody is our own tune; the sirens and space sounds are simple synth patterns.
// The board calls `player.update(state)` with LiveCircuit's state each frame.
import { isMuted } from "../sfx.js";

// Our melody chip's tune: [note (MIDI number), beats]. 24 beats at 0.25 s = 6 s.
export const MELODY = [
  [76, 1], [79, 1], [81, 1], [79, 1], [76, 1], [72, 1], [74, 1], [76, 1],
  [77, 1], [81, 1], [83, 1], [81, 1], [79, 2], [76, 1], [74, 1],
  [76, 1], [79, 1], [84, 2], [83, 1], [79, 1], [81, 1], [72, 1],
];
export const BEAT = 0.25;
export const midiHz = m => 440 * 2 ** ((m - 69) / 12);

// Siren and space-sound shapes: what the oscillator does over time.
export const SIRENS = {
  police: { wave: "sawtooth", low: 650, high: 1300, period: 3, kind: "wail" },
  fire: { wave: "sawtooth", low: 600, high: 1400, period: 0.4, kind: "wail" },
  ambulance: { wave: "square", low: 770, high: 960, period: 1, kind: "two-tone" },
  robot: { wave: "square", low: 0, high: 880, period: 0.16, kind: "beep" },
};
export const SPACE = [
  { name: "laser", wave: "square", from: 1500, to: 200, seconds: 0.3 },
  { name: "warble", wave: "sine", from: 400, to: 400, wobble: 12, seconds: 1 },
  { name: "zap", wave: "sawtooth", from: 900, to: 90, seconds: 0.5 },
  { name: "whoop", wave: "sine", from: 200, to: 1200, seconds: 0.8 },
  { name: "blips", wave: "square", from: 660, to: 990, steps: 6, seconds: 0.9 },
  { name: "rumble", wave: "noise", seconds: 0.9 },
  { name: "ray gun", wave: "square", from: 1200, to: 600, wobble: 25, seconds: 0.7 },
  { name: "ufo", wave: "sine", from: 700, to: 700, wobble: 6, seconds: 1 },
];

const VOLUME = { sound: 0.12, soft: 0.035, piezo: 0.05 };

// How loud the speakers are: the loudest speaker or buzzer disc decides.
export function loudness(outputs) {
  const vals = Object.values(outputs ?? {});
  if (vals.some(v => String(v).startsWith("sound:"))) return VOLUME.sound;
  if (vals.includes("sound")) return VOLUME.piezo; // a buzzer disc
  if (vals.includes("soft")) return VOLUME.soft;
  return 0;
}

export function createSoundPlayer({ makeContext } = {}) {
  let ctx = null, master = null;
  const voices = {}; // chip id → { key, stop() }

  const context = () => {
    if (ctx) return ctx;
    try {
      const Ctx = makeContext ?? (() => new (window.AudioContext || window.webkitAudioContext)());
      ctx = Ctx();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    } catch { ctx = null; }
    return ctx;
  };

  function voice(chip) {
    const a = context();
    if (!a) return null;
    const t0 = a.currentTime, nodes = [];
    const osc = (wave, f) => { const o = a.createOscillator(); o.type = wave; o.frequency.setValueAtTime(f, t0); nodes.push(o); return o; };
    const gain = v => { const g = a.createGain(); g.gain.setValueAtTime(v, t0); nodes.push(g); return g; };
    const out = gain(1); out.connect(master);

    if (chip.sound === "melody") {
      const o = osc("triangle", midiHz(MELODY[0][0]));
      let t = t0;
      for (const [note, beats] of MELODY) { o.frequency.setValueAtTime(midiHz(note), t); out.gain.setValueAtTime(1, t); out.gain.setValueAtTime(0.25, t + beats * BEAT * 0.85); t += beats * BEAT; }
      o.connect(out); o.start(t0); o.stop(t);
    } else if (SIRENS[chip.sound]) {
      const s = SIRENS[chip.sound], o = osc(s.wave, s.low || s.high), length = 30;
      for (let t = 0; t < length; t += s.period) {
        if (s.kind === "wail") { o.frequency.linearRampToValueAtTime(s.high, t0 + t + s.period / 2); o.frequency.linearRampToValueAtTime(s.low, t0 + t + s.period); }
        else if (s.kind === "two-tone") { o.frequency.setValueAtTime(s.high, t0 + t); o.frequency.setValueAtTime(s.low, t0 + t + s.period / 2); }
        else { out.gain.setValueAtTime(1, t0 + t); out.gain.setValueAtTime(0, t0 + t + s.period / 2); }
      }
      o.connect(out); o.start(t0); o.stop(t0 + length);
    } else if (chip.sound === "space") {
      const s = SPACE[Math.max(0, chip.index) % SPACE.length], end = t0 + s.seconds;
      if (s.wave === "noise") {
        const buf = a.createBuffer(1, Math.floor(a.sampleRate * s.seconds), a.sampleRate), data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        const src = a.createBufferSource(); src.buffer = buf; nodes.push(src); src.connect(out); src.start(t0);
      } else {
        const o = osc(s.wave, s.from);
        if (s.steps) for (let k = 0; k < s.steps; k++) o.frequency.setValueAtTime(k % 2 ? s.to : s.from, t0 + (k * s.seconds) / s.steps);
        else o.frequency.exponentialRampToValueAtTime(Math.max(20, s.to), end);
        if (s.wobble) { const lfo = osc("sine", s.wobble), depth = gain(s.from * 0.25); lfo.connect(depth); depth.connect(o.frequency); lfo.start(t0); lfo.stop(end); }
        o.connect(out); o.start(t0); o.stop(end);
      }
      out.gain.setValueAtTime(1, t0); out.gain.linearRampToValueAtTime(0, end);
    }
    return { stop: () => { for (const n of nodes) { try { n.stop?.(); } catch { /* already stopped */ } try { n.disconnect(); } catch { /* fine */ } } } };
  }

  return {
    // state: LiveCircuit.step() result. Starts and stops chip voices; sets the volume.
    update(state) {
      const level = isMuted() ? 0 : loudness(state.outputs);
      for (const [id, chip] of Object.entries(state.chips ?? {})) {
        const key = chip.playing && level > 0 ? `${chip.sound}|${chip.startedAt}|${chip.index}` : null;
        if (voices[id]?.key === key) continue;
        voices[id]?.stop(); delete voices[id];
        if (key) { const v = voice(chip); if (v) voices[id] = { key, ...v }; }
      }
      if (master) master.gain.setTargetAtTime(level, ctx.currentTime, 0.02);
    },
    stopAll() { for (const id of Object.keys(voices)) { voices[id].stop(); delete voices[id]; } if (master) master.gain.value = 0; },
    get active() { return Object.keys(voices); },
  };
}

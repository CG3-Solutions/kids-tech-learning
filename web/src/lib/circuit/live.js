// The Circuit Lab's live simulation: the engine plus time. The board calls `step()` many times a
// second; this keeps each chip's state (a melody finishing after the trigger drops, the
// sound-effects chip stepping through its sounds, claps lasting a moment).
import { compile, solve, evaluate, chipInputs, resolveLight, soundOf, isChip } from "./engine.js";

export const TIMING = { melodySeconds: 6, fxSeconds: 1, fxSounds: 8, clapSeconds: 0.2 };

export class LiveCircuit {
  constructor(circuit) {
    this.c = compile(circuit);
    this.t = 0;
    this.inputs = {};
    this.clapUntil = {};
    this.chips = Object.fromEntries(this.c.parts.filter(p => isChip(p.type)).map(p => [p.id, { playing: false, until: 0, index: -1, wasTrig: false, startedAt: null }]));
  }

  // Set an input: "S1", "on". A clap is an event: clap("PZ1") lasts a moment.
  set(id, value) { this.inputs[id] = value; return this; }
  clap(id) { this.clapUntil[id] = this.t + TIMING.clapSeconds; return this; }

  currentInputs() {
    const ins = { ...this.inputs };
    for (const [id, until] of Object.entries(this.clapUntil)) ins[id] = this.t < until ? "clap" : "quiet";
    return resolveLight(this.c, ins);
  }

  // Advance time by dt seconds and return what the board should show.
  step(dt = 0) {
    this.t += dt;
    const inputs = this.currentInputs();
    const drive = Object.fromEntries(Object.entries(this.chips).filter(([, s]) => s.playing).map(([id]) => [id, "high"]));
    const ins = chipInputs(this.c, solve(this.c, inputs, drive));
    for (const p of this.c.parts.filter(x => isChip(x.type))) {
      const s = this.chips[p.id], i = ins[p.id], rising = i.trig && !s.wasTrig;
      s.wasTrig = i.trig;
      const start = seconds => { s.playing = true; s.until = this.t + seconds; s.startedAt = this.t; };
      if (!i.powered) { s.playing = false; s.wasTrig = false; continue; }
      if (p.type === "siren") s.playing = i.trig;
      else if (p.type === "melody") {
        if (!s.playing && i.trig) start(TIMING.melodySeconds); // a short trigger still plays the whole tune
        else if (s.playing && this.t >= s.until) { if (i.trig) start(TIMING.melodySeconds); else s.playing = false; }
      } else if (p.type === "fx") {
        if (rising) { s.index = (s.index + 1) % TIMING.fxSounds; start(TIMING.fxSeconds); }
        else if (s.playing && this.t >= s.until) { if (i.trig) start(TIMING.fxSeconds); else s.playing = false; }
      }
    }
    const playing = Object.fromEntries(Object.entries(this.chips).map(([id, s]) => [id, s.playing]));
    const r = evaluate(this.c, inputs, playing);
    for (const [id, s] of Object.entries(this.chips)) {
      r.chips[id] = { ...r.chips[id], playing: s.playing, startedAt: s.startedAt, index: s.index,
        sound: s.playing ? soundOf(this.c.parts.find(x => x.id === id), ins[id]) : null };
    }
    return { t: this.t, inputs, ...r };
  }
}

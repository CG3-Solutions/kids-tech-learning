import { describe, it, expect } from "vitest";
import { LiveCircuit, TIMING } from "./live.js";
import { createSoundPlayer, loudness, MELODY, BEAT, SIRENS, SPACE } from "./sound.js";

const run = (live, seconds, dt = 0.05) => { let s; for (let t = 0; t < seconds - 1e-9; t += dt) s = live.step(dt); return s; };

describe("live simulation: chips over time", () => {
  it("a melody plays its whole tune after a short press (a time delay), then stops", () => {
    const live = new LiveCircuit("battery B1 p n | button BTN1 p t | melody MEL1 p n t o | speaker SPK1 o n");
    live.set("BTN1", "down"); expect(live.step(0.05).outputs.SPK1).toBe("sound:melody");
    live.set("BTN1", "up");
    expect(run(live, 3).outputs.SPK1).toBe("sound:melody"); // still playing after letting go
    expect(run(live, TIMING.melodySeconds).outputs.SPK1).toBe("quiet");
  });
  it("a held trigger keeps the melody going round", () => {
    const live = new LiveCircuit("battery B1 p n | slide S1 p t | melody MEL1 p n t o | speaker SPK1 o n").set("S1", "on");
    expect(run(live, TIMING.melodySeconds * 2.5).outputs.SPK1).toBe("sound:melody");
  });
  it("a siren sounds only while its trigger is HIGH", () => {
    const live = new LiveCircuit("battery B1 p n | button BTN1 p t | siren SIR1 p n t o - - | speaker SPK1 o n");
    live.set("BTN1", "down"); expect(live.step(0.05).outputs.SPK1).toBe("sound:police");
    live.set("BTN1", "up"); expect(live.step(0.05).outputs.SPK1).toBe("quiet");
  });
  it("the sound-effects chip steps to the next sound on each press", () => {
    const live = new LiveCircuit("battery B1 p n | button BTN1 p t | fx FX1 p n t o | speaker SPK1 o n");
    const press = () => { live.set("BTN1", "down"); const s = live.step(0.05); live.set("BTN1", "up"); run(live, 1.2); return s.chips.FX1.index; };
    expect([press(), press(), press()]).toEqual([0, 1, 2]);
    for (let i = 0; i < 6; i++) press();
    expect(press()).toBe(1); // after sound 8 it wraps round to the start
  });
  it("a clap lasts a moment and triggers the chip", () => {
    const live = new LiveCircuit("battery B1 p n | piezo PZ1 t n | melody MEL1 p n t o | resistor R1 o b 100 | led D1 b n green");
    expect(live.step(0.05).outputs.D1).toBe("off");
    live.clap("PZ1");
    expect(live.step(0.05).outputs.D1).toBe("flash");
    expect(run(live, 1).inputs.PZ1).toBe("quiet");
    expect(live.step(0.05).outputs.D1).toBe("flash"); // the tune carries on: the light stays on for a while
  });
  it("losing power stops a chip at once", () => {
    const live = new LiveCircuit("battery B1 p n | slide S1 p a | melody MEL1 a n a o | speaker SPK1 o n").set("S1", "on");
    expect(live.step(0.05).outputs.SPK1).toBe("sound:melody");
    live.set("S1", "off");
    expect(live.step(0.05).outputs.SPK1).toBe("quiet");
  });
});

describe("chip sounds", () => {
  it("our melody lasts exactly the melody chip's 6 seconds", () => {
    expect(MELODY.reduce((s, [, b]) => s + b, 0) * BEAT).toBeCloseTo(TIMING.melodySeconds);
    for (const [note] of MELODY) expect(note).toBeGreaterThan(55);
  });
  it("there is a siren for every mode and 8 space sounds", () => {
    expect(Object.keys(SIRENS)).toEqual(["police", "fire", "ambulance", "robot"]);
    expect(SPACE).toHaveLength(TIMING.fxSounds);
  });
  it("volume follows the speaker: loud, soft or silent", () => {
    expect(loudness({ SPK1: "sound:police" })).toBeGreaterThan(loudness({ SPK1: "soft" }));
    expect(loudness({ SPK1: "quiet", L1: "on" })).toBe(0);
  });
  it("starts and stops voices as chips play (with a stand-in audio context)", () => {
    const made = [];
    const param = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, value: 0 });
    const node = kind => { const n = { kind, frequency: param(), gain: param(), type: "", connect() {}, disconnect() {}, start() {}, stop() {}, buffer: null }; made.push(n); return n; };
    const ctx = { currentTime: 0, sampleRate: 8000, destination: {}, createOscillator: () => node("osc"), createGain: () => node("gain"), createBufferSource: () => node("src"),
      createBuffer: (c, len) => ({ getChannelData: () => new Float32Array(len) }) };
    const player = createSoundPlayer({ makeContext: () => ctx });
    const live = new LiveCircuit("battery B1 p n | button BTN1 p t | fx FX1 p n t o | speaker SPK1 o n");
    player.update(live.step(0.05));
    expect(player.active).toEqual([]);
    live.set("BTN1", "down"); player.update(live.step(0.05));
    expect(player.active).toEqual(["FX1"]);
    expect(made.some(n => n.kind === "osc" || n.kind === "src")).toBe(true);
    live.set("BTN1", "up"); player.update(run(live, 1.5));
    expect(player.active).toEqual([]);
    player.stopAll();
  });
  it("never crashes without audio (old browsers, tests)", () => {
    const player = createSoundPlayer({ makeContext: () => { throw new Error("no audio"); } });
    expect(() => player.update({ outputs: { SPK1: "sound:melody" }, chips: { MEL1: { playing: true, sound: "melody", startedAt: 0, index: -1 } } })).not.toThrow();
  });
});

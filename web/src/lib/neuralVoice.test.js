import { describe, it, expect, beforeEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const FN = readFileSync(resolve(__dirname, "../../../supabase/functions/tts/index.ts"), "utf8");
const plan = [[{ t: "A mistake is called a ", stress: false }, { t: "bug.", stress: true }], [{ t: "Try it!", stress: false }]];

describe("natural voices: the app and the tts function agree", () => {
  it("same version, same voices, same hashed shape", async () => {
    const nv = await import("./neuralVoice.js");
    const { VOICES } = await import("./voice.js");
    expect(Number(FN.match(/export const VERSION = (\d+)/)[1])).toBe(nv.VERSION);
    for (const v of VOICES) expect(FN).toContain(`  ${v.id}: { names: [`);
    // The function hashes JSON.stringify({ v, voice, plan }) with plan parts as { t, stress } (checked in its own test run).
    expect(nv.canonical("teacher", [[{ stress: 1, t: "A mistake is called a " }, { t: "bug.", stress: true, extra: 1 }], [{ t: "Try it!" }]]))
      .toBe('{"v":1,"voice":"teacher","plan":[[{"t":"A mistake is called a ","stress":false},{"t":"bug.","stress":true}],[{"t":"Try it!","stress":false}]]}');
    expect(await nv.sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});

describe("natural voices in the app", () => {
  let nv, synth, heads;
  beforeEach(async () => {
    vi.resetModules();
    nv = await import("./neuralVoice.js");
    heads = {}; synth = vi.fn(async ({ voice, plan: p }) => ({ path: `${voice}/${await nv.sha256(nv.canonical(voice, p))}.mp3` }));
    globalThis.fetch = vi.fn(async url => ({ ok: !!heads[url] }));
    nv.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth });
  });
  it("never sends a line with a child's or parent's name", () => {
    nv.setPrivateNames(["Panvith", "Riya", "", "A"]);
    expect(nv.hasPrivate("Well done, Panvith!")).toBe(true);
    expect(nv.hasPrivate("riya, try again")).toBe(true);
    expect(nv.hasPrivate("Priyanka is not Riya's")).toBe(true);
    expect(nv.hasPrivate("Apriya")).toBe(false);
    expect(nv.hasPrivate("A computer follows instructions.")).toBe(false); // one-letter names are ignored
  });
  it("plays a recorded line from storage without asking the function", async () => {
    const path = `teacher/${await nv.sha256(nv.canonical("teacher", plan))}.mp3`;
    heads[`https://cdn/tts/${path}`] = true;
    expect(await nv.neuralUrl("teacher", plan)).toBe(`https://cdn/tts/${path}`);
    expect(synth).not.toHaveBeenCalled();
  });
  it("asks the function to make a missing line, once", async () => {
    const url = await nv.neuralUrl("bright", plan);
    expect(synth).toHaveBeenCalledTimes(1);
    expect(synth.mock.calls[0][0].plan).toEqual(plan);
    await nv.neuralUrl("bright", plan);
    expect(synth).toHaveBeenCalledTimes(1);
    expect(url).toMatch(/^https:\/\/cdn\/tts\/bright\/[0-9a-f]{64}\.mp3$/);
  });
  it("refuses a file it didn't ask for", async () => {
    synth.mockResolvedValueOnce({ path: "teacher/other.mp3" });
    await expect(nv.neuralUrl("teacher", plan)).rejects.toThrow();
  });
  it("is off without an account, when the parent turns it off, and for a while after a failure", () => {
    expect(nv.neuralOn()).toBe(true);
    nv.setNeuralEnabled(false); expect(nv.neuralOn()).toBe(false); nv.setNeuralEnabled(true);
    nv.neuralFailed(); expect(nv.neuralOn()).toBe(false);
    nv.setNeural(null); expect(nv.neuralOn()).toBe(false);
  });
});

describe("speaking with natural voices", () => {
  let played, spoken;
  beforeEach(() => {
    vi.useFakeTimers(); vi.resetModules();
    played = []; spoken = [];
    globalThis.Audio = class { constructor() { this.paused = true; } play() { played.push({ src: this.src, rate: this.playbackRate }); this.paused = false; this.onplaying?.(); return Promise.resolve(); } pause() { this.paused = true; } };
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u.text), getVoices: () => [] };
    try { localStorage.clear(); } catch { /* ignore */ }
  });
  // A recording that already exists in storage proves natural voices work.
  const confirm = async () => {
    const nv = await import("./neuralVoice.js");
    const f = globalThis.fetch; globalThis.fetch = vi.fn(async () => ({ ok: true }));
    await nv.neuralUrl("teacher", [[{ t: "Ready.", stress: false }]]);
    globalThis.fetch = f;
  };
  const setup = async (synth) => {
    const nv = await import("./neuralVoice.js");
    globalThis.fetch = vi.fn(async () => ({ ok: true }));
    nv.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth: synth ?? vi.fn() });
    nv.setPrivateNames(["Panvith"]);
    return import("./voice.js");
  };
  it("speaks with the device voice first, then plays recordings once they've worked", async () => {
    const { speakWith, VOICES } = await setup();
    speakWith(VOICES[2], "A mistake is called a bug.");
    await vi.waitFor(() => expect(spoken.length).toBeGreaterThan(0)); // never silent while unproven
    const nv = await import("./neuralVoice.js");
    await vi.waitFor(() => expect(nv.neuralConfirmed()).toBe(true)); // the recording was readied in the background
    speakWith(VOICES[2], "Input goes in.");
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(played[0].src).toMatch(/^https:\/\/cdn\/tts\/teacher\//);
  });
  it("if the service is broken, the device voice still speaks and natural voices rest", async () => {
    const { speakWith, VOICES } = await setup(vi.fn(async () => { throw Object.assign(new Error("Failed to send a request to the Edge Function"), { status: undefined }); }));
    globalThis.fetch = vi.fn(async () => ({ ok: false }));
    speakWith(VOICES[2], "Hello there.");
    await vi.waitFor(() => expect(spoken).toEqual(["Hello there."]));
    const nv = await import("./neuralVoice.js");
    await vi.waitFor(() => expect(nv.neuralOn()).toBe(false));
    expect(nv.explain(new Error(nv.neuralLastError()))).toMatch(/Verify JWT/);
  });
  it("uses the device voice for a line with a child's name", async () => {
    const { speakWith, VOICES } = await setup();
    speakWith(VOICES[2], "Well done, Panvith!");
    await vi.advanceTimersByTimeAsync(300);
    expect(played).toEqual([]);
    expect(spoken.join("")).toContain("Panvith");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("falls back to the device voice when the function fails", async () => {
    const { speakWith, VOICES } = await setup(vi.fn(async () => { throw Object.assign(new Error("down"), { status: 503 }); }));
    await confirm();
    globalThis.fetch = vi.fn(async () => ({ ok: false }));
    speakWith(VOICES[0], "Input goes in.");
    await vi.waitFor(() => expect(spoken).toEqual(["Input goes in."]));
    expect(played).toEqual([]);
  });
  it("falls back when making the line is slow", async () => {
    const { speakWith, VOICES } = await setup(vi.fn(() => new Promise(() => {})));
    await confirm();
    globalThis.fetch = vi.fn(async () => ({ ok: false }));
    speakWith(VOICES[0], "Output comes out.");
    await vi.waitFor(() => expect(spoken).toEqual(["Output comes out."]), { timeout: 5000, interval: 100 });
  });
  it("the Slowly button and speed setting slow the recording down", async () => {
    const { speakWith, VOICES } = await setup();
    await confirm();
    speakWith(VOICES[2], "Slow please.", { slow: true });
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(played[0].rate).toBeCloseTo(0.8);
  });
});

describe("telling the parent what's wrong", () => {
  it("turns failures into next steps", async () => {
    const { explain } = await import("./neuralVoice.js");
    expect(explain(Object.assign(new Error("x"), { status: 404 }))).toMatch(/function named “tts”/);
    expect(explain(Object.assign(new Error("GOOGLE_TTS_KEY is not set"), { status: 503 }))).toMatch(/GOOGLE_TTS_KEY/);
    expect(explain(Object.assign(new Error("daily voice limit reached"), { status: 429 }))).toMatch(/limit/);
    expect(explain(new Error("Google TTS 403 PERMISSION_DENIED"))).toMatch(/Text-to-Speech API/);
    expect(explain(new Error("Bucket not found"))).toMatch(/release-5\.sql/);
  });
});

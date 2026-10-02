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
    try { localStorage.clear(); } catch { /* ignore */ }
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
  it("remembers recorded lines on this device, and never checks storage from the browser", async () => {
    await nv.neuralUrl("teacher", plan);
    expect(synth).toHaveBeenCalledTimes(1);
    vi.resetModules(); // a new visit
    const again = await import("./neuralVoice.js");
    again.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth });
    expect(await again.neuralUrl("teacher", plan)).toMatch(/^https:\/\/cdn\/tts\/teacher\//);
    expect(synth).toHaveBeenCalledTimes(1);
    expect(again.neuralConfirmed()).toBe(true);
    expect(fetch).not.toHaveBeenCalled(); // no HEAD requests (they show as red 400s for new lines)
  });
  it("asks only once for a line that is already being made", async () => {
    await Promise.all([nv.neuralUrl("robot", plan), nv.neuralUrl("robot", plan)]);
    expect(synth).toHaveBeenCalledTimes(1);
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
  // A line already recorded (known on this device) proves natural voices work.
  const confirm = async () => {
    const nv = await import("./neuralVoice.js");
    const p = [[{ t: "Ready.", stress: false }]];
    localStorage.setItem("sparklab.ttsKnown", JSON.stringify([`teacher/${await nv.sha256(nv.canonical("teacher", p))}.mp3`]));
    await nv.neuralUrl("teacher", p);
  };
  const setup = async (synth) => {
    const nv = await import("./neuralVoice.js");
    globalThis.fetch = vi.fn(async () => ({ ok: true }));
    const makes = vi.fn(async ({ voice, plan: p }) => ({ path: `${voice}/${await nv.sha256(nv.canonical(voice, p))}.mp3` }));
    nv.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth: synth ?? makes });
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
    await vi.waitFor(() => expect(spoken).toEqual(["Output comes out."]), { timeout: 9000, interval: 200 });
  }, 15000);
  it("the Slowly button and speed setting slow the recording down", async () => {
    const { speakWith, VOICES } = await setup();
    await confirm();
    speakWith(VOICES[2], "Slow please.", { slow: true });
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(played[0].rate).toBeCloseTo(0.8);
  });
});

describe("previews, prefetching and missing files", () => {
  let played, spoken, synth, nv, voice;
  beforeEach(async () => {
    vi.useFakeTimers(); vi.resetModules();
    played = []; spoken = [];
    try { localStorage.clear(); } catch { /* ignore */ }
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u.text), getVoices: () => [] };
    nv = await import("./neuralVoice.js");
    synth = vi.fn(async ({ voice: v, plan: p }) => ({ path: `${v}/${await nv.sha256(nv.canonical(v, p))}.mp3` }));
    nv.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth });
    voice = await import("./voice.js");
  });
  const audioThat = ok => { globalThis.Audio = class { constructor() { this.paused = true; } play() { played.push(this.src); if (ok) this.onplaying?.(); else setTimeout(() => this.onerror?.(), 0); return Promise.resolve(); } pause() { this.paused = true; } }; };
  it("Preview waits for a new recording instead of falling back", async () => {
    audioThat(true);
    synth.mockImplementationOnce(async ({ voice: v, plan: p }) => { await new Promise(r => setTimeout(r, 6000)); return { path: `${v}/${await nv.sha256(nv.canonical(v, p))}.mp3` }; });
    voice.speakWith(voice.VOICES[0], "Hi! This is a preview.", { force: true, patient: true });
    await vi.waitFor(() => expect(played).toHaveLength(1), { timeout: 10000, interval: 250 });
    expect(played[0]).toMatch(/\/tts\/bright\//);
    expect(spoken).toEqual([]);
  }, 20000);
  it("records a lesson's next lines in the background, one at a time", async () => {
    audioThat(true);
    await nv.neuralUrl("teacher", [[{ t: "Warm up.", stress: false }]]); // natural voices proven
    synth.mockClear();
    voice.prefetchSpeech(["Line one.", "Well done, Panvith!", "Line two."], voice.VOICES[2]);
    nv.setPrivateNames(["Panvith"]);
    await vi.waitFor(() => expect(synth).toHaveBeenCalledTimes(3));
  });
  it("a recording that has gone missing is forgotten and the device voice speaks", async () => {
    audioThat(false);
    await nv.neuralUrl("teacher", [[{ t: "Warm up.", stress: false }]]);
    voice.speakWith(voice.VOICES[2], "Gone missing.");
    await vi.waitFor(() => expect(spoken).toEqual(["Gone missing."]));
    expect(played).toHaveLength(1);
    const known = JSON.parse(localStorage.getItem("sparklab.ttsKnown"));
    expect(known.some(k => played[0].endsWith(k))).toBe(false);
  });
});

describe("one voice for a lesson", () => {
  let played, spoken, nv, voice, synth;
  const P = async text => { const { speechPlan } = await import("./speechPlan.js"); return speechPlan(text); };
  beforeEach(async () => {
    vi.useFakeTimers(); vi.resetModules();
    played = []; spoken = [];
    try { localStorage.clear(); } catch { /* ignore */ }
    globalThis.Audio = class { constructor() { this.paused = true; } play() { played.push(this.src); this.paused = false; this.onplaying?.(); return Promise.resolve(); } pause() { this.paused = true; } };
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u.text), getVoices: () => [] };
    nv = await import("./neuralVoice.js");
    synth = vi.fn(async ({ voice: v, plan: p }) => ({ path: `${v}/${await nv.sha256(nv.canonical(v, p))}.mp3` }));
    nv.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth });
    voice = await import("./voice.js");
  });
  it("a recorded line stays natural while the service is resting after a failure", async () => {
    await nv.neuralUrl("teacher", await P("Input goes in."));
    nv.neuralFailed(Object.assign(new Error("down"), { status: 500 }));
    expect(nv.neuralOn()).toBe(false);
    voice.speakWith(voice.VOICES[2], "Input goes in.");
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(spoken).toEqual([]);
    voice.speakWith(voice.VOICES[2], "A brand new line.");
    await vi.waitFor(() => expect(spoken).toEqual(["A brand new line."])); // a new line can't be made right now
    expect(voice.voiceHistory().map(h => h.natural)).toEqual([false, true]);
  });
  it("the first line after reopening the app is natural, once natural voices have worked on this device", async () => {
    await nv.neuralUrl("teacher", await P("Warm up."));
    vi.resetModules(); // a new visit
    const nv2 = await import("./neuralVoice.js");
    nv2.setNeural({ publicUrl: p => `https://cdn/tts/${p}`, synth });
    expect(nv2.neuralConfirmed()).toBe(true);
    const voice2 = await import("./voice.js");
    voice2.speakWith(voice2.VOICES[2], "A line never heard before.");
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(spoken).toEqual([]);
  });
  it("a setup failure forgets that, so a broken service never means waiting in silence", async () => {
    await nv.neuralUrl("teacher", await P("Warm up."));
    nv.neuralFailed(Object.assign(new Error("gone"), { status: 404 }));
    expect(nv.neuralConfirmed()).toBe(false);
  });
  it("the daily limit rests new lines for an hour, not five minutes", async () => {
    nv.neuralFailed(Object.assign(new Error("daily voice limit reached"), { status: 429 }));
    vi.advanceTimersByTime(10 * 60 * 1000);
    expect(nv.neuralOn()).toBe(false);
    vi.advanceTimersByTime(55 * 60 * 1000);
    expect(nv.neuralOn()).toBe(true);
  });
  it("warming up proves the service before the first lesson line", async () => {
    expect(await nv.warmNeural()).toBe(true);
    expect(nv.neuralConfirmed()).toBe(true);
    voice.speakWith(voice.VOICES[2], "First lesson line.");
    await vi.waitFor(() => expect(played).toHaveLength(1));
    expect(spoken).toEqual([]);
  });
  it("says why the device voice was used", async () => {
    nv.setPrivateNames(["Panvith"]);
    voice.speakWith(voice.VOICES[2], "Well done, Panvith!");
    await vi.waitFor(() => expect(spoken.length).toBeGreaterThan(0));
    expect(voice.voiceHistory()[0]).toMatchObject({ natural: false });
    expect(voice.voiceHistory()[0].why).toMatch(/name/);
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

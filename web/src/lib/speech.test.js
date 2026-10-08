import { describe, it, expect, beforeEach, vi } from "vitest";
import { speechText } from "./speechText.js";
import { JOURNEYS } from "../content/journeys.js";

describe("speech text", () => {
  it("drops emoji and decorative symbols", () => {
    expect(speechText("Yes! ⭐")).toBe("Yes!");
    expect(speechText("Brilliant! ⭐ You got it ✓")).toBe("Brilliant! You got it");
    expect(speechText("🍎 Apple starts with…")).toBe("Apple starts with…");
    expect(speechText("👨‍👩‍👧 Family 🇮🇳 1️⃣")).toBe("Family 1");
    expect(speechText("⭐🎉")).toBe("");
    expect(speechText("Next: 🪜 Staircase switch →")).toBe("Next: Staircase switch");
  });
  it("says maths symbols as words", () => {
    expect(speechText("5 + 3 = ?")).toBe("5 plus 3 equals what?");
    expect(speechText("9 − 4 = ?")).toBe("9 minus 4 equals what?");
    expect(speechText("7 × 8 = ?")).toBe("7 times 8 equals what?");
    expect(speechText("12 ÷ 3")).toBe("12 divided by 3");
    expect(speechText("-5 + (-3) = ?")).toBe("minus 5 plus (minus 3) equals what?");
    expect(speechText("3x + 4 = 19.  x = ?")).toBe("3x plus 4 equals 19. x equals what?");
    expect(speechText("√144 = ?")).toBe("square root of 144 equals what?");
    expect(speechText("12² = ?")).toBe("12 squared equals what?");
    expect(speechText("What is 20% of ₹250?")).toBe("What is 20% of 250 rupees?");
    expect(speechText("Which is bigger: 3/8 or 1/2?")).toBe("Which is bigger: 3 over 8 or 1 over 2?");
    expect(speechText("The cat is ___ the box.")).toBe("The cat is blank the box.");
    expect(speechText("7  ☐  5")).toBe("7 blank 5");
    expect(speechText("The mouth > < opens")).toBe("The mouth opens");
    expect(speechText("7 > 5")).toBe("7 is more than 5");
    expect(speechText("Area is the space inside (length × width).")).toBe("Area is the space inside (length times width).");
  });
  it("keeps normal sentences unchanged", () => {
    expect(speechText("Riya, please come here.")).toBe("Riya, please come here.");
    expect(speechText("A is for Apple.")).toBe("A is for Apple.");
    expect(speechText("X-ray. Which letter does X-ray start with?")).toBe("X-ray. Which letter does X-ray start with?");
  });
  it("every generated question reads cleanly (no emoji left)", () => {
    const EMOJI = /\p{Extended_Pictographic}/u;
    for (const j of Object.values(JOURNEYS)) for (const s of j.steps) {
      if (s.intro) expect(/[<>×÷√₹=\p{Extended_Pictographic}]/u.test(speechText(s.intro)), `${s.id} intro`).toBe(false);
      if (!s.gen) continue;
      for (let n = 0; n < 25; n++) {
        const q = s.gen(6), said = speechText(q.say ?? q.prompt);
        expect(EMOJI.test(said), `${s.id}: ${said}`).toBe(false);
        expect(/[<>×÷√₹=]/.test(said), `${s.id}: ${said}`).toBe(false);
        expect(said.length, `${s.id}: ${q.prompt}`).toBeGreaterThan(0);
      }
    }
  });
});

describe("one voice at a time", () => {
  let spoken;
  beforeEach(async () => {
    vi.useFakeTimers();
    spoken = [];
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    window.speechSynthesis = { cancel: vi.fn(() => { spoken.length && (spoken.at(-1).cancelled = true); }), speak: u => spoken.push({ text: u.text }), getVoices: () => [{ name: "Test voice", lang: "en-IN" }] };
    vi.resetModules();
  });
  it("speaks only the newest of a burst of lines", async () => {
    const { speak } = await import("./speech.js");
    speak("Question one"); speak("Yes! ⭐"); speak("Question two");
    vi.advanceTimersByTime(500);
    expect(spoken.map(s => s.text)).toEqual(["Question two"]);
  });
  it("doesn't repeat the same line automatically, but does when asked", async () => {
    const { speak } = await import("./speech.js");
    speak("Hello"); vi.advanceTimersByTime(300);
    speak("Hello"); vi.advanceTimersByTime(300);
    expect(spoken).toHaveLength(1);
    speak("Hello", { force: true }); vi.advanceTimersByTime(300);
    expect(spoken).toHaveLength(2);
  });
  it("hush stops a line that hasn't started yet", async () => {
    const { speak, hush } = await import("./speech.js");
    speak("Going to the map"); hush(); vi.advanceTimersByTime(500);
    expect(spoken).toHaveLength(0);
  });
  it("the first tap unlocks the device voice with one silent line (Safari)", async () => {
    window.speechSynthesis.speak = u => spoken.push({ text: u.text, volume: u.volume });
    const { unlockSound } = await import("./voice.js");
    unlockSound(); unlockSound();
    expect(spoken).toEqual([{ text: " ", volume: 0 }]);
  });
  it("a refused line is noted for parents instead of failing silently", async () => {
    const utts = [];
    window.speechSynthesis.speak = u => utts.push(u);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { speakNow, voiceHistory, speakingText } = await import("./voice.js");
    speakNow("Hello there"); vi.advanceTimersByTime(300);
    utts[0].onerror({ error: "not-allowed" });
    expect(speakingText()).toBe(null);
    expect(voiceHistory()[0].why).toMatch(/refused/);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("alphabet speech uses letter names", () => {
  it("never speaks a lone capital letter (voices read A as the word 'a')", async () => {
    const { ALPHABET_JOURNEY, ABC, letterName } = await import("../content/practice/language.js");
    const lone = /(^|[^A-Za-z'-])[A-Z](?=$|[^A-Za-z'-])/; // "X-ray" is a word, not a lone letter
    expect(ABC[0].say).toBe("ay, for Apple.");
    expect(ABC[25].say).toBe("zed, for Zebra.");
    expect(ABC.map(x => letterName(x.big))).not.toContain(undefined);
    for (const x of ABC) expect(lone.test(speechText(x.say)), x.say).toBe(false);
    for (const s of ALPHABET_JOURNEY) {
      if (s.introSay || s.intro) expect(lone.test(s.introSay ?? s.intro), `${s.id} intro`).toBe(false);
      if (!s.gen) continue;
      for (let n = 0; n < 60; n++) {
        const q = s.gen(3);
        for (const [k, v] of [["say", q.say ?? q.prompt], ["hint", q.hintSay ?? q.hint], ["answer", q.answerSay ?? String(q.answer)]]) {
          if (!v) continue;
          expect(lone.test(speechText(v)), `${s.id} ${k}: ${v}`).toBe(false);
        }
      }
    }
  });
});

describe("clear speech for children", async () => {
  const { speechPlan, planText, SPELL } = await import("./speechPlan.js");
  const stressed = t => speechPlan(t).flat().filter(p => p.stress).map(p => p.t.replace(/[.,!?]+$/, ""));
  it("spells short acronyms and says units as words", () => {
    expect(planText(speechPlan("The CPU has 8 GB of RAM at 3 GHz."))).toBe("The C P U has 8 gigabytes of ram at 3 gigahertz.");
    expect(planText(speechPlan("Use an ATM or AI."))).toBe("Use an ay T M or ay I.");
    expect(SPELL.has("CPU") && SPELL.has("ATM") && !SPELL.has("RAM")).toBe(true);
  });
  it("stresses words in capitals and the new word after “is called”", () => {
    expect(stressed("The loop works only when BOTH are ON.")).toEqual(["both", "on"]);
    expect(stressed("A mistake in a program is called a bug.")).toEqual(["bug"]);
    expect(stressed("This is called the stored-program idea (1945).")).toEqual(["stored-program idea"]);
    expect(stressed("The CPU follows instructions.")).toEqual([]);
  });
  it("splits into sentences and never reads punctuation on its own", () => {
    const plan = speechPlan("Input goes IN. Output comes OUT! Ready?");
    expect(plan).toHaveLength(3);
    for (const p of plan.flat()) expect(/[\p{L}\p{N}]/u.test(p.t)).toBe(true);
  });
  it("leaves letters, names and maths alone", () => {
    expect(planText(speechPlan("ay, for Apple."))).toBe("ay, for Apple.");
    expect(planText(speechPlan("Riya, please come here."))).toBe("Riya, please come here.");
    expect(planText(speechPlan("5 + 3 = ?"))).toBe("5 plus 3 equals what?");
    expect(speechPlan("⭐🎉")).toEqual([]);
  });
});

describe("device voice choice and delivery", () => {
  let spoken;
  beforeEach(() => {
    vi.useFakeTimers(); spoken = [];
    globalThis.SpeechSynthesisUtterance = class { constructor(t) { this.text = t; } };
    vi.resetModules();
  });
  const V = (name, lang, localService = true) => ({ name, lang, localService });
  it("prefers natural Indian English voices and avoids novelty voices", async () => {
    const { pickDeviceVoice, VOICES } = await import("./voice.js");
    const all = [V("Zarvox", "en-US"), V("Fred", "en-US"), V("Google US English", "en-US", false), V("Microsoft Neerja Online (Natural) - English (India)", "en-IN", false), V("Rishi", "en-IN")];
    expect(pickDeviceVoice(VOICES[0], all).name).toMatch(/Neerja/);
    expect(pickDeviceVoice(VOICES[3], [V("Zarvox", "en-US"), V("Daniel", "en-GB")]).name).toBe("Daniel");
    expect(pickDeviceVoice(VOICES[1], [V("Veena", "en-IN"), V("Rishi", "en-IN")]).name).toBe("Rishi");
    expect(pickDeviceVoice(VOICES[0], [])).toBe(null);
  });
  it("keeps to the chosen voice's gender, even when the other gender's voice is better quality", async () => {
    const { pickDeviceVoice, genderMatch, VOICES } = await import("./voice.js");
    const neerja = V("Microsoft Neerja Online (Natural) - English (India)", "en-IN", false), ravi = V("Microsoft Ravi - English (India)", "en-IN");
    expect(pickDeviceVoice(VOICES[1], [neerja, ravi]).name).toMatch(/Ravi/);   // Cheerful boy: the plain male voice, not the natural female one
    expect(pickDeviceVoice(VOICES[0], [neerja, ravi]).name).toMatch(/Neerja/); // Bright girl
    // No voice of that gender: one whose name doesn't say comes before the other gender.
    expect(pickDeviceVoice(VOICES[1], [neerja, V("English India", "en-IN")]).name).toBe("English India");
    expect(pickDeviceVoice(VOICES[1], [neerja]).name).toMatch(/Neerja/); // nothing else to use
    expect(genderMatch(neerja, VOICES[1])).toBe("other");
    expect(genderMatch(ravi, VOICES[1])).toBe("same");
  });
  it("waits for the device's voices to load, so the first line isn't read by the system default voice", async () => {
    let voices = [], onChange;
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u), getVoices: () => voices, addEventListener: (_, fn) => { onChange = fn; }, removeEventListener: () => {} };
    const { speakWith, VOICES } = await import("./voice.js");
    speakWith(VOICES[1], "Hello there.");
    vi.advanceTimersByTime(300);
    expect(spoken).toEqual([]); // still waiting for the list
    voices = [V("Veena", "en-IN"), V("Rishi", "en-IN")]; onChange();
    expect(spoken.map(u => u.voice.name)).toEqual(["Rishi"]);
  });
  it("still speaks if the device never reports any voices", async () => {
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u), getVoices: () => [], addEventListener: () => {}, removeEventListener: () => {} };
    const { speakWith, VOICES } = await import("./voice.js");
    speakWith(VOICES[2], "Hello there.");
    vi.advanceTimersByTime(1000);
    expect(spoken.map(u => u.text)).toEqual(["Hello there."]);
  });
  it("reads sentence by sentence, with stressed words slower", async () => {
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u), getVoices: () => [{ name: "Test voice", lang: "en-IN" }] };
    const { speakWith, VOICES } = await import("./voice.js");
    speakWith(VOICES[2], "The loop works only when BOTH are on. Try it!");
    vi.advanceTimersByTime(300);
    expect(spoken.map(u => u.text)).toEqual(["The loop works only when ", "both", " are on.", "Try it!"]);
    const both = spoken[1], plain = spoken[0];
    expect(both.rate).toBeLessThan(plain.rate);
    expect(plain.pitch).toBeLessThan(1.2); // no chipmunk voices
    expect(plain.lang).toBe("en-IN");
  });
  it("the Slowly button reads slower", async () => {
    window.speechSynthesis = { cancel: vi.fn(), speak: u => spoken.push(u), getVoices: () => [{ name: "Test voice", lang: "en-IN" }] };
    const { speakWith, VOICES } = await import("./voice.js");
    speakWith(VOICES[2], "Hello there.", { force: true }); vi.advanceTimersByTime(300);
    speakWith(VOICES[2], "Hello there.", { force: true, slow: true }); vi.advanceTimersByTime(300);
    expect(spoken[1].rate).toBeLessThan(spoken[0].rate);
  });
});

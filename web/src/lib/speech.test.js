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
    window.speechSynthesis = { cancel: vi.fn(() => { spoken.length && (spoken.at(-1).cancelled = true); }), speak: u => spoken.push({ text: u.text }), getVoices: () => [] };
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
});

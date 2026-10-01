import { describe, it, expect } from "vitest";
import { TYPING_JOURNEY, TYPING_PARTS, FINGER_OF, HOME_KEYS, KEYBOARD, WORDS, lessonText, wordsFor, starsFor, defaultMode, sayKey } from "./typing.js";
import { startTyping, press, pause, results, finished, mergeKeys, weakKeys, typingSummary, GAP_CAP } from "../lib/typing.js";
import { JOURNEYS, STEP_IDS } from "./journeys.js";
import { SEED } from "./index.js";
import { BADGES } from "../lib/progress.js";
import { speechText } from "../lib/speechText.js";

// Types `text` perfectly, one key every `ms` milliseconds.
const typeAll = (text, ms = 200, s = startTyping(text), t0 = 1000) => {
  [...text].forEach((c, i) => { s = press(s, c, t0 + i * ms); });
  return s;
};

describe("typing course content", () => {
  it("is a live subject in the Typing area with a registered journey", () => {
    const m = SEED.modules.find(x => x.id === "typing");
    expect(m).toMatchObject({ area: "typing", activity: "typing" });
    expect(m.coming_soon).toBeFalsy();
    expect(JOURNEYS.typing.steps).toBe(TYPING_JOURNEY);
    for (const s of TYPING_JOURNEY) expect(STEP_IDS.has(s.id)).toBe(true);
    expect(BADGES.filter(b => ["homerow", "toprow"].includes(b.id))).toHaveLength(2);
  });

  it("every lesson has a stage, parent note and goal", () => {
    expect(new Set(TYPING_JOURNEY.map(s => s.id)).size).toBe(TYPING_JOURNEY.length);
    for (const s of TYPING_JOURNEY) {
      expect(TYPING_PARTS.map(p => p.id)).toContain(s.part);
      expect(s.title && s.emoji && s.intro && s.say && s.learned && s.parent, s.id).toBeTruthy();
      expect(s.goal.kids.acc).toBeGreaterThan(0);
      expect(s.goal.pro.acc).toBeGreaterThan(0);
    }
  });

  it("every key has a finger, and each finger rests on its home key", () => {
    for (const row of KEYBOARD) for (const [, f] of row) expect(f).toMatch(/^(l|r)(p|r|m|i)$|^th$/);
    for (const [f, c] of Object.entries(HOME_KEYS)) expect(FINGER_OF[c]).toBe(f);
    expect(FINGER_OF.f).toBe("li");
    expect(FINGER_OF.j).toBe("ri");
    expect(FINGER_OF.t).toBe("li");
    expect(FINGER_OF.y).toBe("ri");
  });

  it("practice text uses only the keys taught so far and includes the new keys", () => {
    for (const s of TYPING_JOURNEY) for (const mode of ["kids", "pro"]) for (let n = 0; n < 40; n++) {
      const text = lessonText(s, mode);
      const ok = new Set([...s.pool, " "]);
      for (const c of text) expect(ok.has(c), `${s.id} ${mode}: "${c}" in "${text}"`).toBe(true);
      for (const c of s.keys.filter(c => c !== " ")) expect(text.includes(c), `${s.id} needs ${c}`).toBe(true);
      expect(text).toBe(text.trim());
      expect(text).not.toMatch(/ {2}/);
      expect(text.length).toBeGreaterThan(mode === "kids" ? 30 : 90);
      expect(text.length).toBeLessThan(mode === "kids" ? 90 : 220);
    }
  });

  it("word lessons have enough real words", () => {
    for (const s of TYPING_JOURNEY.filter(x => x.kind !== "keys")) expect(wordsFor(s.pool).length, s.id).toBeGreaterThan(15);
    expect(WORDS.every(w => /^[a-z]+$/.test(w))).toBe(true);
  });

  it("speaks keys by name and intros read cleanly", () => {
    expect(sayKey("a")).toBe("ay");
    expect(sayKey(";")).toBe("semicolon");
    expect(sayKey(" ")).toBe("the space bar");
    const lone = /(^|[^A-Za-z'-])(?!A [a-z])[A-Z](?=$|[^A-Za-z'-])/; // "A short check" is the word "a"
    for (const s of TYPING_JOURNEY) expect(lone.test(speechText(s.say)), `${s.id}: ${s.say}`).toBe(false);
  });

  it("stars need the goal; checks also need the speed goal", () => {
    const lesson = TYPING_JOURNEY[2], check = TYPING_JOURNEY.find(s => s.id === "typ-step-8");
    expect(starsFor(lesson, "kids", { accuracy: 84, wpm: 30 })).toBe(0);
    expect(starsFor(lesson, "kids", { accuracy: 90, wpm: 1 })).toBe(1);
    expect(starsFor(lesson, "kids", { accuracy: 96, wpm: 1 })).toBe(2);
    expect(starsFor(lesson, "pro", { accuracy: 99, wpm: 1 })).toBe(3);
    expect(starsFor(check, "kids", { accuracy: 99, wpm: 4 })).toBe(0);
    expect(starsFor(check, "kids", { accuracy: 99, wpm: 5 })).toBe(3);
    expect(starsFor(check, "pro", { accuracy: 99, wpm: 14 })).toBe(0);
    expect(defaultMode(2)).toBe("kids");
    expect(defaultMode(8)).toBe("pro");
    expect(defaultMode(null)).toBe("kids");
  });
});

describe("typing engine", () => {
  it("measures speed in 5-letter words per minute", () => {
    // 50 characters, one every 200 ms → 49 gaps = 9.8 s → 10 words in 9.8 s ≈ 61 wpm.
    const text = "asdf jkl; ".repeat(5).trim() + " ";
    const s = typeAll(text, 200);
    expect(finished(s)).toBe(true);
    const r = results(s);
    expect(r.wpm).toBe(Math.round((text.length / 5) / ((text.length - 1) * 0.2 / 60)));
    expect(r.accuracy).toBe(100);
    expect(r.errors).toBe(0);
  });

  it("a wrong key is a mistake on the expected key and doesn't move on", () => {
    let s = startTyping("fj");
    s = press(s, "d", 0);
    expect(s.pos).toBe(0);
    expect(s.wrong).toBe("d");
    expect(s.keys.f).toEqual([0, 1, 0]);
    s = press(s, "f", 100);
    s = press(s, "j", 300);
    expect(finished(s)).toBe(true);
    expect(s.misses).toEqual([1, 0]);
    const r = results(s);
    expect(r.errors).toBe(1);
    expect(r.accuracy).toBe(66); // 2 right out of 3 presses
    expect(s.keys.j).toEqual([1, 0, 200]);
  });

  it("long pauses only count a little, and hidden time not at all", () => {
    let s = startTyping("abc");
    s = press(s, "a", 0);
    s = press(s, "b", 60_000); // a minute away
    expect(s.ms).toBe(GAP_CAP);
    s = pause(s);
    s = press(s, "c", 999_999);
    expect(s.ms).toBe(GAP_CAP);
    expect(press(s, "x", 1e7)).toBe(s); // finished: ignores keys
  });

  it("finds the weakest keys and builds a summary", () => {
    const sessions = [
      { wpm: 20, accuracy: 90, seconds: 60, input: "keyboard", keys: { a: [10, 5, 3000], s: [10, 0, 2000], " ": [5, 5, 0] } },
      { wpm: 40, accuracy: 100, seconds: 60, input: "touch", keys: { a: [10, 0, 3000], d: [4, 2, 900] } },
    ];
    expect(mergeKeys(sessions).a).toEqual([20, 5, 6000]);
    expect(weakKeys(mergeKeys(sessions)).map(w => w.key)).toEqual(["d", "a"]);
    const sum = typingSummary(sessions);
    expect(sum.bestWpm).toBe(20); // tapping on a screen isn't a speed record
    expect(sum.accuracy).toBe(95);
    expect(sum.minutes).toBe(2);
  });
});

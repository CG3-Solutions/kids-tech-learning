import { describe, it, expect } from "vitest";
import { COMPUTER_JOURNEY, COMPUTER_PARTS } from "./computer.js";
import { JOURNEYS, STEP_IDS } from "./journeys.js";
import { SEED, GLOSSARY_MODULES } from "./index.js";
import { moduleItems, BADGES } from "../lib/progress.js";
import { mixQuestion, PASS, SCREENS } from "../components/concept/ConceptLesson.jsx";
import { speechText } from "../lib/speechText.js";

const GAMES = ["sort", "becomputer", "powercut", "build", "order", "pixels"];
const ANIMS = ["flow", "inside", "steps", "power", "layers", "pixels", "network"];

describe("Chip's computer path", () => {
  it("is the computer subject's activity, in order, in three parts", () => {
    expect(SEED.modules.find(m => m.id === "computer").activity).toBe("computer");
    expect(JOURNEYS.computer.steps).toBe(COMPUTER_JOURNEY);
    expect(COMPUTER_JOURNEY.map(s => s.id)).toEqual(COMPUTER_JOURNEY.map((_, i) => `comp-step-${i + 1}`));
    for (const s of COMPUTER_JOURNEY) expect(STEP_IDS.has(s.id)).toBe(true);
    expect(COMPUTER_PARTS.map(p => p.id)).toEqual(["A", "B", "C"]);
    expect(COMPUTER_JOURNEY.map(s => s.title)).toEqual(expect.arrayContaining([
      "Input → Process → Output", "Hardware and software", "Operating system and apps", "Files and data", "Networks and the internet", "Staying safe online",
    ]));
    // Input → Process → Output comes before the parts, and output before the touch screen idea is used.
    const at = t => COMPUTER_JOURNEY.findIndex(s => s.title.startsWith(t));
    expect(at("Input →")).toBeLessThan(at("Input devices"));
    expect(at("Input devices")).toBeLessThan(at("Output devices"));
  });

  it("every concept has all six screens, a parent note and valid activities", () => {
    expect(SCREENS.map(s => s[0])).toEqual(["hook", "explain", "see", "doit", "check", "recap"]);
    for (const s of COMPUTER_JOURNEY) {
      expect(COMPUTER_PARTS.map(p => p.id)).toContain(s.part);
      expect(s.hook.q && s.hook.reveal && s.hook.choices.length >= 2 && s.hook.answer < s.hook.choices.length, s.id).toBeTruthy();
      expect(s.explain.text.length).toBeGreaterThanOrEqual(1);
      expect(s.explain.text.length).toBeLessThanOrEqual(3);
      expect(s.explain.like).toBeTruthy();
      expect(ANIMS, s.id).toContain(s.see.anim);
      expect(GAMES, s.id).toContain(s.doit.game);
      expect(s.recap.points.length && s.recap.find.length && s.recap.tryit, s.id).toBeTruthy();
      expect(s.learned && s.parent, s.id).toBeTruthy();
      if (s.doit.game === "sort") for (const [, , b] of s.doit.items) expect(b).toBeLessThan(s.doit.buckets.length);
      for (const l of s.links ?? []) expect(SEED.modules.some(m => m.id === l.to), l.to).toBe(true);
    }
  });

  it("checks: 3 questions each, answers valid, explanations for wrong answers", () => {
    for (const s of COMPUTER_JOURNEY) {
      expect(s.check, s.id).toHaveLength(3);
      for (const q of s.check) {
        expect(q.answer).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, `${s.id}: ${q.q}`).toBe(q.options.length);
        expect(q.why, q.q).toBeTruthy();
      }
    }
    expect(PASS).toBe(2);
    for (let n = 0; n < 50; n++) {
      const q = COMPUTER_JOURNEY[5].check[0], m = mixQuestion(q);
      expect(m.options[m.answer]).toBe(q.options[q.answer]);
    }
  });

  it("fixes the wording: the CPU follows instructions, it doesn't think; the touch screen is both", () => {
    const cpu = COMPUTER_JOURNEY.find(s => s.title === "The CPU");
    expect(cpu.explain.text.join(" ")).toMatch(/can't think on its own/);
    const out = COMPUTER_JOURNEY.find(s => s.title === "Output devices");
    expect(out.explain.text.join(" ")).toMatch(/touch screen is BOTH/i);
    const cards = SEED.cards.filter(c => c.module_id === "computer");
    expect(cards.find(c => c.id === "pc-cpu").data.what).toMatch(/can't think on its own/);
    expect(cards.find(c => c.id === "pc-touch").data.sh).toMatch(/AND output/);
    const mem = COMPUTER_JOURNEY.find(s => s.title === "Memory and storage");
    expect(mem.doit.game).toBe("powercut");
  });

  it("stars come from the path, not from tapping glossary cards", () => {
    expect(GLOSSARY_MODULES.has("computer")).toBe(true);
    const m = SEED.modules.find(x => x.id === "computer");
    const items = moduleItems(m, SEED.cards);
    expect(items).toEqual(COMPUTER_JOURNEY.map(s => s.id));
    expect(BADGES.find(b => b.id === "netsafe").test({ ids: new Set(["comp-step-13"]) })).toBe(true);
  });

  it("spoken text reads cleanly (no emoji read aloud)", () => {
    const EMOJI = /\p{Extended_Pictographic}/u;
    for (const s of COMPUTER_JOURNEY) {
      for (const t of [s.hook.q, s.hook.reveal, ...s.explain.text, s.explain.like, ...s.check.map(q => q.q)]) {
        expect(EMOJI.test(speechText(t)), `${s.id}: ${t}`).toBe(false);
      }
    }
  });
});

import { describe, it, expect } from "vitest";
import { COMPUTER_JOURNEY, COMPUTER_PATH, COMPUTER_PARTS } from "./computer.js";
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
    expect(JOURNEYS.computer.steps).toBe(COMPUTER_PATH);
    // The path: Chip's opening conversation, lessons 1–8, the key-press mission, lessons 9–13.
    expect(COMPUTER_PATH.map(s => s.id)).toEqual(["comp-talk-key", ...[1, 2, 3, 4, 5, 6, 7, 8].map(n => `comp-step-${n}`), "comp-mission-key", ...[9, 10, 11, 12, 13].map(n => `comp-step-${n}`)]);
    for (const s of COMPUTER_PATH) expect(STEP_IDS.has(s.id)).toBe(true);
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
    expect(items).toEqual(COMPUTER_PATH.map(s => s.id));
    expect(BADGES.find(b => b.id === "keypress").test({ ids: new Set(["comp-mission-key"]) })).toBe(true);
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

describe("depth by class (C2)", async () => {
  const { DEEP, depthFor, DEPTHS } = await import("./computerDeep.js");
  const { atDepth, depthsOf, DEPTH_LABELS } = await import("../components/concept/ConceptLesson.jsx");
  it("every concept has Class 4–7 and Class 8–12 versions with 3 good check questions", () => {
    expect(DEPTHS.map(d => d.label)).toEqual(DEPTH_LABELS);
    for (const s of COMPUTER_JOURNEY) {
      expect(depthsOf(s), s.id).toEqual([0, 1, 2]);
      for (const d of ["mid", "high"]) {
        const v = DEEP[s.id][d];
        expect(v.text.length, `${s.id} ${d}`).toBeGreaterThanOrEqual(2);
        expect(v.text.length).toBeLessThanOrEqual(3);
        expect(v.points.length).toBeGreaterThanOrEqual(1);
        expect(v.check).toHaveLength(3);
        for (const q of v.check) {
          expect(q.answer).toBeLessThan(q.options.length);
          expect(new Set(q.options).size, q.q).toBe(q.options.length);
          expect(q.why, q.q).toBeTruthy();
        }
      }
    }
  });
  it("a deeper level replaces the learn text and checks and adds recap points", () => {
    const cpu = COMPUTER_JOURNEY.find(s => s.title === "The CPU");
    expect(atDepth(cpu, 0).explain).toBe(cpu.explain);
    expect(atDepth(cpu, 0).check.map(q => q.key)).toEqual([0, 1, 2].map(i => `${cpu.id}:base:${i}`));
    expect(atDepth(cpu, 2).check[1].key).toBe(`${cpu.id}:high:1`);
    const mid = atDepth(cpu, 1), high = atDepth(cpu, 2);
    expect(mid.explain.text.join(" ")).toMatch(/fetch .*decode.*execute/i);
    expect(high.explain.text.join(" ")).toMatch(/cores/);
    expect(high.explain.text.join(" ")).toMatch(/cache/);
    expect(mid.check).not.toEqual(cpu.check);
    expect(high.recap.points.length).toBe(cpu.recap.points.length + DEEP[cpu.id].high.points.length);
    expect(mid.explain.like).toBe(cpu.explain.like);
    const mem = atDepth(COMPUTER_JOURNEY.find(s => s.title === "Memory and storage"), 2);
    expect(mem.explain.text.join(" ")).toMatch(/SSD/);
  });
  it("the learner's class picks the starting depth; grown-ups start at the top", () => {
    expect([1, 2, 3].map(g => depthFor({ grade: g }))).toEqual([0, 0, 0]);
    expect([4, 7].map(g => depthFor({ grade: g }))).toEqual([1, 1]);
    expect([8, 12].map(g => depthFor({ grade: g }))).toEqual([2, 2]);
    expect(depthFor({ grade: null })).toBe(0);
    expect(depthFor({ learner: "adult" })).toBe(2);
  });
  it("deeper text also reads cleanly aloud", () => {
    const EMOJI = /\p{Extended_Pictographic}/u;
    for (const s of COMPUTER_JOURNEY) for (const d of ["mid", "high"]) {
      for (const t of [...DEEP[s.id][d].text, ...DEEP[s.id][d].check.map(q => q.q)]) expect(EMOJI.test(speechText(t)), t).toBe(false);
    }
  });
});

describe("Chip's mission: follow a key press", async () => {
  const T = await import("./computerTalk.js");
  it("six stops in order, each with a deeper note for older classes", () => {
    expect(T.KEY_STOPS.map(s => s.id)).toEqual(["key", "travel", "cpu", "memory", "draw", "screen"]);
    for (const s of T.KEY_STOPS) { expect(s.short.length).toBeLessThanOrEqual(7); expect(s.say.length).toBeGreaterThan(40); expect(s.deeper.length).toBeGreaterThan(40); }
  });
  it("every letter A–Z has a 5×7 pixel shape, and the keyboard has all 26 letters", () => {
    const letters = Object.keys(T.FONT_5x7);
    expect(letters).toEqual([..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"]);
    for (const l of letters) { expect(T.FONT_5x7[l]).toHaveLength(7); for (const r of T.FONT_5x7[l]) expect(r).toMatch(/^[01]{5}$/); }
    expect([...T.KEY_ROWS.join("")].sort().join("")).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    expect(T.FONT_5x7.H).toEqual(["10001", "10001", "10001", "11111", "10001", "10001", "10001"]);
  });
  it("the conversation: every question has answers with replies; the H example is right", () => {
    for (const l of T.CHIP_TALK_KEY) if (l.ask) for (const c of l.choices) expect(c.reply.length).toBeGreaterThan(10);
    expect(JSON.stringify(T.CHIP_TALK_KEY)).toContain("72");
    expect(JSON.stringify(T.CHIP_TALK_KEY)).toContain((72).toString(2).padStart(8, "0"));
  });
  it("the mission is the finale of Part B, after Build a computer", () => {
    const i = COMPUTER_PATH.findIndex(s => s.id === "comp-mission-key");
    expect(COMPUTER_PATH[i - 1].id).toBe("comp-step-8");
    expect(COMPUTER_PATH[i].part).toBe("B");
  });
});

import { describe, it, expect } from "vitest";
import { addMiss, reviewAnswer, dueKeys, nextDue, addDays, conceptStatus, isOpen, MASTERED } from "./review.js";
import { buildQuiz, conceptPool } from "./conceptQuiz.js";
import { COMPUTER_JOURNEY, conceptQuestion } from "../content/computer.js";
import { prepare, rightAnswer, typeOf, QUESTION_TYPES } from "../components/concept/Question.jsx";
import { weakConcept, nextSuggestion } from "./progress.js";
import { speechText } from "./speechText.js";

const DAY = "2026-10-01";
const K = "comp-step-6:base:1";

describe("spaced review (1, 3, 7 days)", () => {
  it("a miss comes back tomorrow; right answers push it to 3 days, then 7, then it's mastered", () => {
    let r = addMiss({}, K, DAY);
    expect(r[K]).toMatchObject({ box: 0, due: "2026-10-02", misses: 1 });
    expect(dueKeys(r, DAY)).toEqual([]);
    expect(dueKeys(r, "2026-10-02")).toEqual([K]);
    r = reviewAnswer(r, K, true, "2026-10-02");
    expect(r[K]).toMatchObject({ box: 1, due: "2026-10-05" });
    r = reviewAnswer(r, K, true, "2026-10-05");
    expect(r[K]).toMatchObject({ box: 2, due: "2026-10-12" });
    r = reviewAnswer(r, K, true, "2026-10-12");
    expect(r[K].box).toBe(MASTERED);
    expect(isOpen(r[K])).toBe(false);
    expect(dueKeys(r, "2027-01-01")).toEqual([]);
    expect(nextDue(r)).toBe(null);
  });
  it("a wrong review answer starts it again at 1 day and counts the miss", () => {
    let r = addMiss({}, K, DAY);
    r = reviewAnswer(r, K, true, "2026-10-02");
    r = reviewAnswer(r, K, false, "2026-10-05");
    expect(r[K]).toMatchObject({ box: 0, due: "2026-10-06", misses: 2 });
  });
  it("dates cross months and years; oldest due first", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
    let r = addMiss({}, "a:p:0", "2026-10-03");
    r = addMiss(r, "b:p:0", "2026-10-01");
    expect(dueKeys(r, "2026-10-09")).toEqual(["b:p:0", "a:p:0"]);
    expect(dueKeys(r, "2026-10-09", 1)).toEqual(["b:p:0"]);
  });
  it("reviewing an unknown key changes nothing", () => {
    expect(reviewAnswer({}, "x", true)).toEqual({});
  });
});

describe("mixed question types (C3)", () => {
  const all = COMPUTER_JOURNEY.flatMap(s => s.practice.map((q, i) => ({ s, q, i })));
  it("every concept has 4 practice questions, at least 2 for everyone and 1 for Class 4 and up, in at least 2 types", () => {
    for (const s of COMPUTER_JOURNEY) {
      expect(s.practice).toHaveLength(4);
      expect(s.practice.filter(q => (q.min ?? 0) === 0).length).toBeGreaterThanOrEqual(2);
      expect(s.practice.filter(q => q.min === 1).length).toBeGreaterThanOrEqual(1);
      expect(new Set(s.practice.map(typeOf)).size).toBeGreaterThanOrEqual(2);
    }
    const types = new Set(all.map(x => typeOf(x.q)));
    for (const t of QUESTION_TYPES) expect(types.has(t)).toBe(true);
  });
  it("every question is well formed and explains itself", () => {
    for (const { s, q } of all) {
      const t = typeOf(q), where = `${s.id}: ${q.q}`;
      expect(q.why?.length, where).toBeGreaterThan(10);
      if (t === "choice" || t === "pic") { expect(q.options.length).toBeGreaterThanOrEqual(2); expect(q.options[q.answer]).toBeDefined(); expect(new Set(q.options.map(String)).size).toBe(q.options.length); }
      if (t === "pic") for (const o of q.options) expect(o).toHaveLength(2);
      if (t === "tf") expect(typeof q.answer).toBe("boolean");
      if (t === "order") { expect(q.items.length).toBeGreaterThanOrEqual(3); expect(new Set(q.items).size).toBe(q.items.length); }
      if (t === "bug") { expect(q.lines[q.bug]).toBeDefined(); expect(q.fix).toBeTruthy(); }
      expect(speechText(q.q)).not.toMatch(/\p{Extended_Pictographic}/u);
    }
  });
  it("true/false answers aren't all the same", () => {
    const tf = all.filter(x => typeOf(x.q) === "tf").map(x => x.q.answer);
    expect(tf.filter(Boolean).length).toBeGreaterThan(3);
    expect(tf.filter(a => !a).length).toBeGreaterThan(3);
  });
  it("prepare shuffles choices but keeps the right answer, and never starts an ordering already solved", () => {
    for (let n = 0; n < 30; n++) {
      const pic = COMPUTER_JOURNEY[3].practice[0], p = prepare(pic);
      expect(p.options[p.answer]).toEqual(pic.options[pic.answer]);
      const ord = COMPUTER_JOURNEY[6].practice[2], o = prepare(ord);
      expect([...o.start].sort()).toEqual(ord.items.map((_, i) => i));
      expect(o.start.every((x, i) => x === i)).toBe(false);
    }
  });
  it("the right answer reads in words", () => {
    expect(rightAnswer({ type: "tf", answer: false })).toBe("False");
    expect(rightAnswer({ type: "pic", options: [["🖱️", "Mouse"]], answer: 0 })).toBe("Mouse");
    expect(rightAnswer({ type: "order", items: ["a", "b"] })).toBe("a → b");
    expect(rightAnswer({ type: "bug", lines: ["x", "y"], bug: 1 })).toMatch(/line 2/);
  });
  it("question keys find the question again", () => {
    expect(conceptQuestion("comp-step-6:base:0").q).toBe(COMPUTER_JOURNEY[5].check[0].q);
    expect(conceptQuestion("comp-step-6:mid:2").q).toBe(COMPUTER_JOURNEY[5].deeper.mid.check[2].q);
    expect(conceptQuestion("comp-step-6:p:3").q).toBe(COMPUTER_JOURNEY[5].practice[3].q);
    expect(conceptQuestion("comp-step-99:p:0")).toBe(null);
    expect(conceptQuestion("comp-step-6:p:9")).toBe(null);
  });
});

describe("Chip's quiz", () => {
  const seq = () => { let x = 1; return () => ((x = (x * 9301 + 49297) % 233280) / 233280); };
  it("asks 8 questions from learned steps only, in mixed types", () => {
    const done = new Set(["comp-step-1", "comp-step-2", "comp-step-3", "comp-step-4"]);
    const qs = buildQuiz(COMPUTER_JOURNEY, { done, rnd: seq() });
    expect(qs).toHaveLength(8);
    expect(qs.every(q => done.has(q.conceptId))).toBe(true);
    expect(new Set(qs.map(typeOf)).size).toBeGreaterThanOrEqual(3);
    expect(new Set(qs.map(q => q.key)).size).toBe(8);
    expect(qs.every(q => conceptQuestion(q.key))).toBe(true);
  });
  it("uses the first 3 steps before anything is learned, and the child's depth", () => {
    const qs = buildQuiz(COMPUTER_JOURNEY, { depth: 0, rnd: seq() });
    expect(new Set(qs.map(q => q.conceptId))).toEqual(new Set(["comp-step-1", "comp-step-2", "comp-step-3"]));
    expect(qs.every(q => (q.min ?? 0) === 0 && !/:mid:|:high:/.test(q.key))).toBe(true);
    const high = conceptPool(COMPUTER_JOURNEY[5], 2);
    expect(high.check.every(q => q.key.includes(":high:"))).toBe(true);
    expect(high.practice).toHaveLength(4);
  });
  it("puts concepts with questions in review first", () => {
    const done = new Set(COMPUTER_JOURNEY.map(s => s.id));
    const review = addMiss({}, "comp-step-13:p:0", DAY);
    const qs = buildQuiz(COMPUTER_JOURNEY, { done, review, size: 4, rnd: seq() });
    expect(qs.some(q => q.conceptId === "comp-step-13")).toBe(true);
  });
});

describe("parent concept report", () => {
  const steps = COMPUTER_JOURNEY;
  it("labels concepts strong, ok, weak or not started", () => {
    let review = addMiss({}, "comp-step-2:base:0", DAY);
    review = addMiss(review, "comp-step-2:p:1", DAY);
    review = addMiss(review, "comp-step-3:base:2", DAY);
    const state = { concepts: { "comp-step-1": { best: 3, tries: 1 }, "comp-step-2": { best: 2, tries: 2 }, "comp-step-3": { best: 2, tries: 1 }, "comp-step-4": { best: 1, tries: 1 } }, review };
    const done = new Set(["comp-step-1", "comp-step-2", "comp-step-3"]);
    const st = Object.fromEntries(conceptStatus(steps, state, done).map(r => [r.step.id, r.status]));
    expect(st["comp-step-1"]).toBe("strong");
    expect(st["comp-step-2"]).toBe("weak"); // 2 questions still in review
    expect(st["comp-step-3"]).toBe("ok");
    expect(st["comp-step-4"]).toBe("weak"); // check not passed yet
    expect(st["comp-step-5"]).toBe("new");
  });
  it("Teach next suggests the weakest concept, with its parent note", () => {
    const review = ["comp-step-7:base:0", "comp-step-7:base:1", "comp-step-7:p:0"].reduce((r, k) => addMiss(r, k, DAY), {});
    const child = { progress: [{ module_id: "computer", item_id: "comp-step-7" }], attempts: [], state: { review, concepts: { "comp-step-7": { best: 2, tries: 3 } } } };
    expect(weakConcept(child).id).toBe("comp-step-7");
    const mods = [{ id: "computer", activity: "computer", sort: 1 }, { id: "binary", activity: "binary", sort: 2 }];
    const s = nextSuggestion(mods, [], child);
    expect(s).toMatchObject({ weak: true, module: { id: "computer" } });
    expect(s.concept.parent).toBeTruthy();
    expect(weakConcept({ progress: [], attempts: [], state: {} })).toBe(null);
  });
});

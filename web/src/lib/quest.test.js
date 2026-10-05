import { describe, it, expect } from "vitest";
import { SEED } from "../content/index.js";
import { todaysQuest } from "./quest.js";

const empty = { progress: [], attempts: [], state: {} };
const mod = id => SEED.modules.find(m => m.id === id);
const now = new Date(2026, 9, 5, 12);

describe("today's quest", () => {
  it("has three items in three different areas", () => {
    const q = todaysQuest({ modules: SEED.modules, cards: SEED.cards, child: empty, learner: { grade: 2 }, first: mod("numbers"), now });
    expect(q).toHaveLength(3);
    expect(q[0].module.id).toBe("numbers");
    expect(new Set(q.map(i => i.module.area)).size).toBe(3);
    expect(q.every(i => !i.done)).toBe(true);
  });
  it("puts waiting review questions second", () => {
    const q = todaysQuest({ modules: SEED.modules, cards: SEED.cards, child: empty, learner: { grade: 4 }, first: mod("words"), due: 4, now });
    expect(q[1]).toMatchObject({ review: 4, done: false });
    expect(q[1].module.activity).toBe("computer");
  });
  it("marks a subject done when something was learned in it today", () => {
    const child = { ...empty, progress: [{ item_id: "x", module_id: "numbers", done_at: new Date(2026, 9, 5, 9).toISOString() }] };
    const q = todaysQuest({ modules: SEED.modules, cards: SEED.cards, child, learner: { grade: 2 }, first: mod("numbers"), now });
    expect(q[0].done).toBe(true);
  });
  it("works with no subject to continue", () => {
    const q = todaysQuest({ modules: SEED.modules, cards: SEED.cards, child: empty, learner: { grade: 2 }, now });
    expect(q.length).toBeGreaterThan(0);
    expect(new Set(q.map(i => i.module.id)).size).toBe(q.length);
  });
});

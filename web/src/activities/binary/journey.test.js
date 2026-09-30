import { describe, it, expect } from "vitest";
import { isUnlocked } from "../../components/journey/Journey.jsx";
import { BINARY_JOURNEY } from "../../content/subjects.js";
import { CIRCUIT_JOURNEY } from "../../content/circuits.js";
import { SEED } from "../../content/index.js";
import { moduleStats, badgeState } from "../../lib/progress.js";

const ids = BINARY_JOURNEY.map(s => s.id);
const open = (steps, done, grade) => steps.filter((_, i) => isUnlocked(steps, i, new Set(done), grade)).map(s => s.id);

describe("binary journey", () => {
  it("unlocks steps in order for young learners", () => {
    expect(open(BINARY_JOURNEY, [], 2)).toEqual([ids[0]]);
    expect(open(BINARY_JOURNEY, [ids[0]], 2)).toEqual(ids.slice(0, 2));
    expect(open(BINARY_JOURNEY, ids.slice(0, 6), 2)).not.toContain(ids[7]); // bonus needs step 7
    expect(open(BINARY_JOURNEY, ids.slice(0, 7), 2)).toEqual(ids);
  });
  it("opens everything from 5th standard", () => {
    expect(open(BINARY_JOURNEY, [], 5)).toEqual(ids);
  });
  it("counts steps as progress and awards Binary boss for step 7", () => {
    const binary = SEED.modules.find(m => m.id === "binary");
    const child = { progress: [{ item_id: "binary-step-7", module_id: "binary" }], attempts: [], state: {} };
    const st = moduleStats(binary, SEED.cards, child);
    expect(st.total).toBe(SEED.cards.filter(c => c.module_id === "binary").length + BINARY_JOURNEY.length);
    expect(st.done).toBe(1);
    expect(badgeState(child, SEED.modules).find(b => b.id === "binary").earned).toBe(true);
  });
});

describe("circuit journey", () => {
  const c = n => `circuit-step-${n}`;
  it("young learners go in order from the first loop, through AND and OR", () => {
    expect(open(CIRCUIT_JOURNEY, [], 2)).toEqual([c(1)]);
    expect(open(CIRCUIT_JOURNEY, [1, 2, 3, 4, 5].map(c), 2)).toContain(c(6));
    expect(open(CIRCUIT_JOURNEY, [1, 2, 3, 4, 5].map(c), 2)).not.toContain(c(7));
  });
  it("opens the workshop after step 4, or straight away from 4th standard", () => {
    expect(open(CIRCUIT_JOURNEY, [1, 2, 3].map(c), 2)).not.toContain("circuit-workshop");
    expect(open(CIRCUIT_JOURNEY, [1, 2, 3, 4].map(c), 2)).toContain("circuit-workshop");
    expect(open(CIRCUIT_JOURNEY, [], 4)).toContain("circuit-workshop");
  });
  it("opens parts by class: B from 4th, C from 6th", () => {
    const g4 = open(CIRCUIT_JOURNEY, [], 4);
    expect(g4).toContain(c(6)); expect(g4).toContain(c(12)); expect(g4).not.toContain(c(13));
    expect(open(CIRCUIT_JOURNEY, [], 6)).toContain(c(15));
    expect(open(CIRCUIT_JOURNEY, [], 6)).toContain(c(2)); // basics open for older learners
  });
  it("every step has a parent note and belongs to a part", () => {
    for (const s of CIRCUIT_JOURNEY) { expect(s.parent).toBeTruthy(); expect(["A", "B", "C", "W"]).toContain(s.part); }
  });
});

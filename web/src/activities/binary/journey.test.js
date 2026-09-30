import { describe, it, expect } from "vitest";
import { isUnlocked } from "./BinaryJourney.jsx";
import { BINARY_JOURNEY } from "../../content/subjects.js";
import { SEED } from "../../content/index.js";
import { moduleStats, badgeState } from "../../lib/progress.js";

const ids = BINARY_JOURNEY.map(s => s.id);

describe("binary journey", () => {
  it("unlocks steps in order for young learners", () => {
    const none = new Set();
    expect(isUnlocked(0, none, 2)).toBe(true);
    expect(isUnlocked(1, none, 2)).toBe(false);
    expect(isUnlocked(1, new Set([ids[0]]), 2)).toBe(true);
    expect(isUnlocked(7, new Set(ids.slice(0, 6)), 2)).toBe(false); // bonus needs step 7
    expect(isUnlocked(7, new Set(ids.slice(0, 7)), 2)).toBe(true);
  });
  it("opens everything from 5th standard", () => {
    expect(BINARY_JOURNEY.every((_, i) => isUnlocked(i, new Set(), 5))).toBe(true);
  });
  it("counts steps as progress and awards Binary boss for step 7", () => {
    const binary = SEED.modules.find(m => m.id === "binary");
    const child = { progress: [{ item_id: "binary-step-7", module_id: "binary" }], attempts: [], state: {} };
    const st = moduleStats(binary, SEED.cards, child);
    expect(st.total).toBe(SEED.cards.filter(c => c.module_id === "binary").length + BINARY_JOURNEY.length);
    expect(st.done).toBe(1);
    expect(badgeState(child, SEED.modules).find(b => b.id === "binary").earned).toBe(true);
    expect(badgeState(child, SEED.modules).find(b => b.id === "ten").earned).toBe(false);
  });
});

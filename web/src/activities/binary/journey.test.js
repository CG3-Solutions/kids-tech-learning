import { describe, it, expect } from "vitest";
import { isUnlocked } from "../../components/journey/Journey.jsx";
import { BINARY_JOURNEY } from "../../content/subjects.js";
import { CIRCUIT_JOURNEY } from "../../content/circuits.js";
import { SEED } from "../../content/index.js";
import { moduleStats, badgeState } from "../../lib/progress.js";

const ids = BINARY_JOURNEY.map(s => s.id);
const open = (steps, done, grade) => steps.filter((_, i) => isUnlocked(steps, i, new Set(done), grade)).map(s => s.id);

describe("binary journey", () => {
  it("starts with Bit's conversation and unlocks steps in order for young learners", () => {
    expect(ids[0]).toBe("binary-step-0");
    expect(open(BINARY_JOURNEY, [], 2)).toEqual(["binary-step-0"]);
    expect(open(BINARY_JOURNEY, ["binary-step-0"], 2)).toEqual(["binary-step-0", "binary-step-1"]);
    const to7 = ["binary-step-0", ...[1, 2, 3, 4, 5, 6, 7].map(n => `binary-step-${n}`)];
    expect(open(BINARY_JOURNEY, to7, 2)).toContain("binary-bonus-pixel"); // the old bonuses still follow step 7
    expect(open(BINARY_JOURNEY, to7, 2)).toContain("binary-step-8");
    expect(open(BINARY_JOURNEY, to7, 2)).not.toContain("binary-step-10");
    expect(open(BINARY_JOURNEY, [...to7, "binary-step-8", "binary-step-9"], 2)).toContain("binary-step-10");
    expect(open(BINARY_JOURNEY, [...to7, "binary-step-8", "binary-step-9"], 2)).not.toContain("binary-bonus-name"); // after the mission
    expect(open(BINARY_JOURNEY, [...to7, "binary-step-8", "binary-step-9", "binary-step-10"], 2)).toEqual(ids);
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

describe("Bit's mission: say THANK YOU", async () => {
  const T = await import("../../content/binaryTalk.js");
  it("THANK YOU is 9 letters, each a correct 8-bit code", () => {
    const want = { T: "01010100", H: "01001000", A: "01000001", N: "01001110", K: "01001011", " ": "00100000", Y: "01011001", O: "01001111", U: "01010101" };
    expect(T.MISSION).toHaveLength(9);
    for (const ch of T.MISSION) expect(T.bitsOf(T.codeOf(ch)).map(b => (b ? 1 : 0)).join("")).toBe(want[ch]);
    expect(T.codeOf("A")).toBe(65); expect(T.codeOf("Z")).toBe(90); expect(T.codeOf("a")).toBe(97); expect(T.codeOf(" ")).toBe(32);
  });
  it("every conversation question has at least two answers, each with a reply", () => {
    for (const script of [T.TALK_INTRO, T.TALK_LETTERS, T.TALK_TRANSLATOR]) {
      expect(script.length).toBeGreaterThan(3);
      for (const l of script) {
        expect(Boolean(l.say) !== Boolean(l.ask)).toBe(true);
        if (l.ask) { expect(l.choices.length).toBeGreaterThanOrEqual(2); for (const c of l.choices) { expect(c.label).toBeTruthy(); expect(c.reply.length).toBeGreaterThan(10); } }
      }
    }
  });
  it("the facts in the conversation match the code", () => {
    const text = JSON.stringify(T.TALK_LETTERS);
    expect(text).toContain("A is 65"); expect(text).toContain("Z, which is 90"); expect(text).toContain("space is 32"); expect(text).toContain("small a is 97");
    const h = T.TALK_LETTERS.find(l => /what number is H/.test(l.ask ?? ""));
    expect(h.choices.find(c => c.right).label).toBe(String(T.codeOf("H")));
    expect(JSON.stringify(T.TALK_TRANSLATOR)).toContain("72 switches"); // 9 letters × 8
  });
  it("finishing the mission earns the Computer talker badge", () => {
    const child = { progress: [{ item_id: "binary-step-10", module_id: "binary" }], attempts: [], state: {} };
    expect(badgeState(child, SEED.modules).find(b => b.id === "thankyou").earned).toBe(true);
  });
});

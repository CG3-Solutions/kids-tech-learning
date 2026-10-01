import { describe, it, expect } from "vitest";
import { CIRCUIT_JOURNEY, CIRCUIT_PATH } from "./circuits.js";
import { VOLT_TALK_BELL, BELL_PARTS, BELL_FAULTS, BELL_DEEPER } from "./circuitTalk.js";
import { JOURNEYS } from "./journeys.js";
import { SEED } from "./index.js";
import { moduleItems, badgeState } from "../lib/progress.js";
import { isUnlocked } from "../components/journey/Journey.jsx";

const open = (steps, done, grade) => steps.filter((_, i) => isUnlocked(steps, i, new Set(done), grade)).map(s => s.id);

describe("Volt's mission: build a doorbell", () => {
  it("starts with the conversation and puts the mission at the end of Part A", () => {
    const ids = CIRCUIT_PATH.map(s => s.id);
    expect(ids[0]).toBe("circuit-talk-bell");
    expect(ids.indexOf("circuit-mission-bell")).toBe(ids.indexOf("circuit-step-5") + 1);
    expect(CIRCUIT_PATH.find(s => s.id === "circuit-mission-bell").part).toBe("A");
    expect(CIRCUIT_PATH).toHaveLength(CIRCUIT_JOURNEY.length + 2);
    expect(JOURNEYS.circuit.steps).toBe(CIRCUIT_PATH);
    const elec = SEED.modules.find(m => m.id === "electricity");
    expect(moduleItems(elec, SEED.cards)).toEqual(expect.arrayContaining(ids));
  });
  it("young learners talk first, and do the mission before AND", () => {
    expect(open(CIRCUIT_PATH, [], 2)).toEqual(["circuit-talk-bell"]);
    const partA = ["circuit-talk-bell", ...[1, 2, 3, 4, 5].map(n => `circuit-step-${n}`)];
    expect(open(CIRCUIT_PATH, partA, 2)).toContain("circuit-mission-bell");
    expect(open(CIRCUIT_PATH, partA, 2)).not.toContain("circuit-step-6");
    expect(open(CIRCUIT_PATH, [...partA, "circuit-mission-bell"], 2)).toContain("circuit-step-6");
  });
  it("every answer in the conversation gets a reply", () => {
    for (const l of VOLT_TALK_BELL) {
      expect(Boolean(l.say) !== Boolean(l.ask)).toBe(true);
      if (l.ask) { expect(l.choices.length).toBeGreaterThanOrEqual(2); for (const c of l.choices) expect(c.reply.length).toBeGreaterThan(20); expect(l.choices.some(c => c.right !== false)).toBe(true); }
    }
    expect(VOLT_TALK_BELL.some(l => /safety/i.test(l.say ?? ""))).toBe(true);
  });
  it("needs exactly battery, push button, buzzer and wires; every part explains itself", () => {
    expect(BELL_PARTS.filter(p => p.need).map(p => p.id).sort()).toEqual(["battery", "button", "buzzer", "wires"]);
    for (const p of BELL_PARTS) expect(p.reply.length).toBeGreaterThan(20);
    expect(BELL_FAULTS.map(f => f.id)).toEqual(["gap", "plastic", "flat"]);
    for (const k of ["test", "fix", "doors", "done"]) expect(BELL_DEEPER[k].length).toBeGreaterThan(60);
  });
  it("awards the Doorbell builder badge", () => {
    const child = { progress: [{ item_id: "circuit-mission-bell", module_id: "electricity" }], attempts: [], state: {} };
    expect(badgeState(child, SEED.modules).find(b => b.id === "doorbell").earned).toBe(true);
  });
});

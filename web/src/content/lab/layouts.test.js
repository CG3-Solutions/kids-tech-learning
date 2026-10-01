import { describe, it, expect } from "vitest";
import { LAYOUTS, STARTS } from "./layouts.js";
import { PROJECTS, projectById } from "./projects.js";
import { parseParts, parseCheck } from "./netlist.js";
import { buildBoard, toCircuit } from "../../lib/circuit/board.js";
import { runChecks } from "../../lib/circuit/engine.js";
import { badgeState } from "../../lib/progress.js";
import { SEED } from "../index.js";

const typesOf = parts => parts.filter(p => p.type !== "wire").map(p => `${p.type}:${p.id}${p.ohms ? `:${p.ohms}` : ""}${p.colour ? `:${p.colour}` : ""}`).sort();

describe("Guided layouts on the board", () => {
  it("every project in units 1–3 has a layout", () => {
    for (const p of PROJECTS.filter(x => x.unit <= 3)) expect(LAYOUTS[p.id], p.id).toBeTruthy();
  });
  for (const [id, steps] of Object.entries(LAYOUTS)) {
    it(`${id}: fits the board, uses exactly the project's parts, and passes every check`, () => {
      const project = projectById(id);
      const board = buildBoard(steps);
      expect(board, `${id} doesn't fit`).toBeTruthy();
      expect(typesOf(board)).toEqual(typesOf(parseParts(project.circuit)));
      for (const r of runChecks(toCircuit(board), project.checks, parseCheck)) expect(r.mismatches, `${id} [${r.check}]`).toEqual([]);
    });
  }
  for (const [id, steps] of Object.entries(STARTS)) {
    it(`${id}: the fix-it board starts broken`, () => {
      const project = projectById(id);
      expect(project.start).toBeTruthy();
      const board = buildBoard(steps);
      expect(runChecks(toCircuit(board), project.checks, parseCheck).some(r => !r.pass)).toBe(true);
    });
  }
  it("every fix-it project in a finished unit has a broken start board", () => {
    for (const p of PROJECTS.filter(x => x.start && LAYOUTS[x.id])) expect(STARTS[p.id], p.id).toBeTruthy();
  });
});

describe("Circuit Lab unit badges", () => {
  it("a unit's badge comes with its last project", () => {
    const unit1 = PROJECTS.filter(p => p.unit === 1).map(p => p.id);
    const child = ids => ({ progress: ids.map(item_id => ({ item_id, module_id: "electricity" })), attempts: [], state: {} });
    const lab1 = ids => badgeState(child(ids), SEED.modules).find(b => b.id === "lab1").earned;
    expect(lab1(unit1.slice(0, -1))).toBe(false);
    expect(lab1(unit1)).toBe(true);
  });
});

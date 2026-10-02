import { describe, it, expect } from "vitest";
import { LAYOUTS, STARTS } from "./layouts.js";
import { PROJECTS, projectById } from "./projects.js";
import { parseParts, parseCheck } from "./netlist.js";
import { buildBoard, toCircuit, clashes } from "../../lib/circuit/board.js";
import { runChecks } from "../../lib/circuit/engine.js";
import { badgeState } from "../../lib/progress.js";
import { SEED } from "../index.js";

const typesOf = parts => parts.filter(p => p.type !== "wire").map(p => `${p.type}:${p.id}${p.ohms ? `:${p.ohms}` : ""}${p.colour ? `:${p.colour}` : ""}`).sort();

describe("Guided layouts on the board", () => {
  it("every project with a reference circuit has a layout (the open-ended invention has none)", () => {
    for (const p of PROJECTS.filter(x => !x.open)) expect(LAYOUTS[p.id], p.id).toBeTruthy();
    expect(PROJECTS.filter(x => x.open).map(x => x.id)).toEqual(["lab-11-8"]);
  });
  it("no part in a layout lies on top of another, so a child can really place each one", () => {
    for (const [id, steps] of Object.entries(LAYOUTS)) {
      const board = buildBoard(steps);
      for (let i = 0; i < board.length; i++) expect(clashes(board.slice(0, i), board[i]), `${id}: ${board[i].type} ${board[i].id}`).toBe(false);
    }
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

import { describe, it, expect } from "vitest";
import { markBuild, explainMark, hintFor } from "./marking.js";
import { buildBoard } from "./board.js";
import { projectById } from "../../content/lab/projects.js";
import { LAYOUTS, STARTS } from "../../content/lab/layouts.js";

const p = id => projectById(id);

describe("marking a build by what it does", () => {
  it("passes every guided layout", () => {
    for (const [id, steps] of Object.entries(LAYOUTS)) expect(markBuild(p(id), buildBoard(steps)).pass, id).toBe(true);
  });
  it("passes a different layout with different labels", () => {
    // "Light it up" built another way: a spare bulb placed first (so the working bulb is L2), switch on the − side.
    const board = buildBoard([
      ["lamp", [4, 7], { dir: 0 }],                // L1: a spare, not connected to anything useful
      ["battery", [0, 4], { dir: 3 }],             // + A5, − A3
      ["wire", [0, 4], { dir: 0, len: 3 }],        // A5 → D5
      ["lamp", [3, 4], { dir: 3 }],                // L2: D5 → D3
      ["slide", [3, 2], { dir: 2 }],               // S1: D3 → B3
      ["wire", [1, 2], { dir: 2, len: 1 }],        // B3 → A3
    ]);
    const mark = markBuild(p("lab-1-1"), board);
    expect(mark.pass).toBe(true);
    expect(mark.mapping).toEqual({ S1: "S1", L1: "L2" });
  });
  it("says which parts are missing", () => {
    const mark = markBuild(p("lab-1-1"), buildBoard([["battery", [0, 2], { dir: 1 }], ["lamp", [2, 0], { dir: 1 }]]));
    expect(mark.pass).toBe(false);
    expect(explainMark(p("lab-1-1"), mark, [])).toEqual(["You still need a slide switch."]);
    expect(hintFor(mark)).toMatch(/missing/);
  });
  it("explains a wrong build in plain words, with the child's labels", () => {
    const board = buildBoard(STARTS["lab-3-2"]); // LED in backwards
    const mark = markBuild(p("lab-3-2"), board);
    expect(mark.pass).toBe(false);
    expect(explainMark(p("lab-3-2"), mark, board)).toEqual(["With switch S1 ON, LED D1 should be on, but it's off."]);
  });
  it("spots a too-big resistor and a missing resistor", () => {
    const tooBig = buildBoard(STARTS["lab-3-4"]);
    expect(markBuild(p("lab-3-4"), tooBig).pass).toBe(false);
    const bare = buildBoard([["battery", [0, 2], { dir: 1 }], ["wire", [0, 2], { dir: 3, len: 2 }], ["slide", [0, 0], { dir: 0 }], ["led", [2, 0], { dir: 1 }], ["wire", [2, 2], { dir: 1, len: 2 }], ["wire", [2, 4], { dir: 2, len: 2 }]]);
    const mark = markBuild(p("lab-3-1"), [...bare, ...buildBoard([["resistor", [4, 8], { dir: 0 }]]).map(r => ({ ...r, id: "R1" }))]);
    expect(mark.pass).toBe(false);
    expect(hintFor(mark)).toMatch(/resistor/);
  });
  it("tells a short circuit apart", () => {
    const board = buildBoard([...LAYOUTS["lab-1-1"], ["wire", [0, 2], { dir: 1, len: 2 }]]); // a connector across the battery
    const mark = markBuild(p("lab-1-1"), board);
    expect(mark.pass).toBe(false);
    expect(hintFor(mark)).toMatch(/joins \+ straight to −/);
  });
});

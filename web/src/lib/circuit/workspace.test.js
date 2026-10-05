import { describe, it, expect } from "vitest";
import { circuitBox, nowLine, problemParts } from "./workspace.js";
import { buildBoard, toCircuit, MARGIN, PITCH } from "./board.js";
import { evaluate } from "./engine.js";
import { markBuild } from "./marking.js";
import { LAYOUTS } from "../../content/lab/layouts.js";
import { projectById } from "../../content/lab/projects.js";

const lightItUp = () => buildBoard(LAYOUTS["lab-1-1"]);
const run = (parts, inputs) => evaluate(toCircuit(parts), inputs);

describe("fit circuit", () => {
  it("is null for an empty board", () => expect(circuitBox([])).toBeNull());
  it("covers every part with a margin, inside the board", () => {
    const parts = lightItUp();
    const box = circuitBox(parts);
    for (const p of parts) for (const [c, r] of [p.at]) { expect(c).toBeGreaterThanOrEqual(box.c0); expect(c).toBeLessThanOrEqual(box.c1); expect(r).toBeGreaterThanOrEqual(box.r0); expect(r).toBeLessThanOrEqual(box.r1); }
    expect(box.c0).toBeGreaterThanOrEqual(0); expect(box.r0).toBeGreaterThanOrEqual(0);
    expect(box.c1).toBeLessThanOrEqual(6); expect(box.r1).toBeLessThanOrEqual(8);
    expect(box.whole).toBe(false);
    expect(box.viewBox).toEqual([box.c0 * PITCH, box.r0 * PITCH, (box.c1 - box.c0) * PITCH + MARGIN * 2, (box.r1 - box.r0) * PITCH + MARGIN * 2]);
  });
  it("never shrinks below the minimum, even for one small part", () => {
    const box = circuitBox(buildBoard([["wire", [3, 4], { dir: 0, len: 1 }]]), { margin: 0, min: 4 });
    expect(box.c1 - box.c0 + 1).toBe(4);
    expect(box.r1 - box.r0 + 1).toBe(4);
  });
});

describe("right now", () => {
  it("says the loop is open and the bulb off while the switch is off", () => {
    const parts = lightItUp();
    const now = nowLine(parts, {}, run(parts, {}));
    expect(now.loop).toBe("open");
    expect(now.items.find(i => i.type === "slide")).toMatchObject({ kind: "input", text: "OFF" });
    expect(now.items.find(i => i.type === "lamp")).toMatchObject({ kind: "output", text: "off", on: false });
  });
  it("says current is flowing and the bulb glows when the switch is on", () => {
    const parts = lightItUp();
    const s = parts.find(p => p.type === "slide").id;
    const now = nowLine(parts, { [s]: "on" }, run(parts, { [s]: "on" }));
    expect(now.loop).toBe("flowing");
    expect(now.items.find(i => i.type === "slide").text).toBe("ON");
    expect(now.items.find(i => i.type === "lamp")).toMatchObject({ text: "glowing", on: true });
  });
  it("knows an empty board and a board without a battery", () => {
    expect(nowLine([], {}, null).loop).toBe("empty");
    expect(nowLine(buildBoard([["lamp", [1, 1], { dir: 0 }]]), {}, null).loop).toBe("nobattery");
    expect(nowLine(lightItUp(), {}, null).loop).toBe("waiting");
  });
});

describe("show me where", () => {
  it("points at the part that did the wrong thing, by the child's own label", () => {
    // Light it up with the switch left out of the loop: the bulb is always on.
    const parts = buildBoard([
      ["battery", [0, 4], { dir: 3 }],
      ["wire", [0, 4], { dir: 0, len: 3 }],
      ["lamp", [3, 4], { dir: 3 }],
      ["wire", [3, 2], { dir: 2, len: 3 }],
      ["slide", [4, 7], { dir: 0 }],
    ]);
    const mark = markBuild(projectById("lab-1-1"), parts);
    expect(mark.pass).toBe(false);
    const uids = problemParts(mark, parts);
    expect(uids.length).toBeGreaterThan(0);
    expect(uids.every(u => parts.find(p => p.uid === u).type !== "wire")).toBe(true);
  });
  it("points at nothing for a pass or for missing parts", () => {
    const parts = lightItUp();
    expect(problemParts(markBuild(projectById("lab-1-1"), parts), parts)).toEqual([]);
    expect(problemParts({ pass: false, missing: [{ type: "lamp", count: 1 }], results: [] }, parts)).toEqual([]);
  });
});

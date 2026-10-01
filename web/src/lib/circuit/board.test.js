import { describe, it, expect } from "vitest";
import { COLS, ROWS, pinPosts, coveredPosts, fits, makePart, endOptions, nextId, remaining, layerFor, toCircuit, joinedGroups, describe as describeBoard, serialize, deserialize, isTwoPin } from "./board.js";
import { evaluate } from "./engine.js";
import { KIT } from "../../content/lab/parts.js";
import { EXAMPLES } from "../../content/lab/examples.js";
import { buildBoard, turned } from "./board.js";

// Build a board step by step, like a child: makePart for each piece.
function build(steps) {
  const parts = [];
  for (const [type, at, opts] of steps) { const p = makePart(parts, type, at, opts); if (!p) throw new Error(`${type} doesn't fit at ${at}`); parts.push(p); }
  return parts;
}

describe("board geometry", () => {
  it("two-pin parts span two posts and turn in quarter turns", () => {
    const p = { type: "lamp", at: [2, 2], dir: 0 };
    expect(pinPosts(p)).toEqual({ a: [2, 2], b: [4, 2] });
    expect(pinPosts({ ...p, dir: 1 })).toEqual({ a: [2, 2], b: [2, 4] });
    expect(pinPosts({ ...p, dir: 2 })).toEqual({ a: [2, 2], b: [0, 2] });
    expect(pinPosts({ ...p, dir: 3 })).toEqual({ a: [2, 2], b: [2, 0] });
    expect(coveredPosts(p)).toEqual([[2, 2], [3, 2], [4, 2]]);
  });
  it("connectors are 1–6 posts long; chips are 3 × 3 with their pins on the edges", () => {
    expect(pinPosts({ type: "wire", at: [0, 0], dir: 1, len: 5 })).toEqual({ a: [0, 0], b: [0, 5] });
    const s = pinPosts({ type: "siren", at: [1, 1], dir: 0 });
    expect(s).toEqual({ "+": [1, 1], trig: [3, 1], "−": [1, 3], out: [3, 3], m1: [2, 1], m2: [2, 3] });
    expect(coveredPosts({ type: "melody", at: [1, 1], dir: 0 })).toHaveLength(9);
  });
  it("a part must fit on the board; makePart turns it until it does", () => {
    expect(fits({ type: "lamp", at: [COLS - 1, 0], dir: 0 })).toBe(false);
    const p = makePart([], "lamp", [COLS - 1, 0]);
    expect(p.dir).toBe(1); // turned to point down
    expect(makePart([], "melody", [COLS - 1, ROWS - 1])).toBeTruthy(); // turned round into the board
  });
  it("offers only valid ends for the second tap", () => {
    expect(endOptions("lamp", [0, 0]).map(o => o.to)).toEqual([[2, 0], [0, 2]]);
    expect(endOptions("wire", [3, 4]).filter(o => o.dir === 0).map(o => o.len)).toEqual([1, 2, 3]);
    expect(isTwoPin("wire") && isTwoPin("lamp") && !isTwoPin("melody")).toBe(true);
  });
});

describe("board bookkeeping", () => {
  it("labels parts like a circuit diagram and respects the kit", () => {
    const parts = build([["lamp", [0, 0]], ["lamp", [0, 2]], ["wire", [0, 4]]]);
    expect(parts.map(p => p.id)).toEqual(["L1", "L2", "W1"]);
    expect(nextId(parts.filter(p => p.id !== "L1"), "lamp")).toBe("L1");
    expect(remaining(parts, "lamp")).toBe(KIT.lamp - 2);
  });
  it("stacks a part above the ones it overlaps", () => {
    const parts = build([["wire", [0, 0], { dir: 0, len: 3 }]]);
    const lamp = makePart(parts, "lamp", [1, 0], { dir: 0 });
    expect(lamp.layer).toBe(2);
    expect(layerFor(parts, { type: "lamp", at: [0, 5], dir: 0 })).toBe(1);
  });
  it("connectors join posts into groups", () => {
    const parts = build([["wire", [0, 0], { dir: 0, len: 2 }], ["wire", [2, 0], { dir: 1, len: 2 }]]);
    expect(joinedGroups(parts).find(g => g.includes("0,0")).sort()).toEqual(["0,0", "2,0", "2,2"]);
  });
});

describe("a board becomes a working circuit", () => {
  // Battery down the left, switch along the top, bulb down the right, connector along the bottom.
  const lightItUp = () => build([
    ["battery", [0, 2], { dir: 3 }],          // + at A3, − at A1
    ["slide", [0, 0], { dir: 0 }],
    ["lamp", [2, 0], { dir: 1 }],
    ["wire", [2, 2], { dir: 2, len: 2 }],
  ]);
  it("lights the bulb when the switch is on", () => {
    const parts = lightItUp();
    const c = toCircuit(parts);
    expect(evaluate(c, { S1: "off" }).outputs.L1).toBe("off");
    const on = evaluate(c, { S1: "on" });
    expect(on.outputs.L1).toBe("on");
    expect(Math.abs(on.readings.parts.W1.amps)).toBeGreaterThan(0.2); // current flows through the connector too
  });
  it("describes the circuit in words, including what's on", () => {
    const parts = lightItUp();
    const lines = describeBoard(parts, evaluate(toCircuit(parts), { S1: "on" }));
    expect(lines).toContain("Joined: battery pack B1 (−), slide switch S1.");
    expect(lines).toContain("Joined: battery pack B1 (+), bulb L1.");
    expect(lines).toContain("Bulb L1 is on.");
    expect(describeBoard([], null)[0]).toMatch(/empty/);
    const loose = build([["lamp", [3, 3]]]);
    expect(describeBoard(loose, null).some(l => /isn't joined/.test(l))).toBe(true);
  });
  it("spots a short circuit made with a connector", () => {
    const parts = build([["battery", [0, 0], { dir: 0 }], ["wire", [0, 0], { dir: 0, len: 2 }]]);
    expect(evaluate(toCircuit(parts)).short).toBe(true);
  });
  it("chips work on the board (a doorbell)", () => {
    const parts = build([
      ["melody", [2, 2], { dir: 0 }],            // + C3, trig E3, − C5, out E5
      ["battery", [0, 4], { dir: 3 }],           // + A5?, − A3
      ["wire", [0, 2], { dir: 0, len: 2 }],      // A3 → C3: battery to chip +  (see the battery's pins below)
    ]);
    const posts = pinPosts(parts[1]);
    expect(posts).toEqual({ "+": [0, 4], "−": [0, 2] });
    // Rewire properly: battery + to chip +, battery − to chip −.
    const board = build([
      ["battery", [0, 2], { dir: 1 }],           // + A3, − A5
      ["melody", [2, 2], { dir: 0 }],            // + C3, trig E3, − C5, out E5
      ["wire", [0, 2], { dir: 0, len: 2 }],      // A3–C3: + to chip +
      ["wire", [0, 4], { dir: 0, len: 2 }],      // A5–C5: − to chip −
      ["button", [2, 0], { dir: 0 }],            // C1–E1
      ["wire", [2, 0], { dir: 1, len: 2 }],      // C1–C3: button to +
      ["wire", [4, 0], { dir: 1, len: 2 }],      // E1–E3: button to trigger
      ["speaker", [4, 4], { dir: 1 }],           // E5–E7: out to speaker
      ["wire", [2, 4], { dir: 1, len: 2 }],      // C5–C7: − down
      ["wire", [2, 6], { dir: 0, len: 2 }],      // C7–E7: speaker back to −
    ]);
    const c = toCircuit(board);
    expect(evaluate(c, { BTN1: "up" }).outputs.SPK1).toBe("quiet");
    expect(evaluate(c, { BTN1: "down" }).outputs.SPK1).toBe("sound:melody");
  });
});

describe("saving", () => {
  it("round-trips a board and its switch settings", () => {
    const parts = build([["battery", [0, 0], { dir: 0 }], ["led", [0, 2], { dir: 0, colour: "green" }], ["resistor", [0, 4], { dir: 0, ohms: 1000 }]]);
    const back = deserialize(JSON.parse(JSON.stringify(serialize(parts, { S1: "on" }))));
    expect(back.parts.map(p => [p.id, p.colour ?? p.ohms ?? null])).toEqual([["B1", null], ["D1", "green"], ["R1", 1000]]);
    expect(back.inputs).toEqual({ S1: "on" });
  });
  it("ignores broken or old saves instead of crashing", () => {
    expect(deserialize(null)).toEqual({ parts: [], inputs: {} });
    expect(deserialize({ v: 99, parts: [] }).parts).toEqual([]);
    expect(deserialize({ v: 1, parts: [{ type: "unicorn", at: [0, 0] }, { type: "lamp", at: [99, 0], dir: 0 }] }).parts).toEqual([]);
  });
});

describe("examples", () => {
  const expected = { light: [{ S1: "on" }, { L1: "on" }], doorbell: [{ BTN1: "down" }, { SPK1: "sound:melody" }], fan: [{ S1: "on" }, { L1: "on", M1: "spin" }] };
  for (const ex of EXAMPLES) it(`"${ex.title}" fits the board and works`, () => {
    const parts = buildBoard(ex.steps);
    expect(parts).toBeTruthy();
    const [inputs, want] = expected[ex.id];
    const r = evaluate(toCircuit(parts), inputs);
    for (const [id, v] of Object.entries(want)) expect(r.outputs[id], `${ex.id} ${id}`).toBe(v);
    expect(r.short).toBe(false);
  });
});

describe("turning", () => {
  it("turns around the middle, so two turns swap the ends in place", () => {
    const lamp = { type: "lamp", at: [2, 0], dir: 0 };
    expect(pinPosts(turned(lamp))).toEqual({ a: [3, -1], b: [3, 1] });
    expect(pinPosts(turned(turned(lamp)))).toEqual({ a: [4, 0], b: [2, 0] });
    const chip = { type: "melody", at: [1, 1], dir: 0 };
    expect(Object.values(pinPosts(turned(turned(turned(turned(chip))))))).toEqual(Object.values(pinPosts(chip)));
    const wire = { type: "wire", at: [0, 0], dir: 0, len: 3 }; // middle between posts: turns around its first end
    expect(turned(wire).at).toEqual([0, 0]);
  });
});

import { describe, it, expect } from "vitest";
import { GATES, combos, addBits, simulateElectric, simulateLogic } from "./logic.js";

const loop = (extra = [], wires = []) => ({
  parts: [{ id: "bat", type: "battery" }, { id: "s", type: "switch", on: true }, { id: "l", type: "bulb" }, ...extra],
  wires: [{ from: "bat:a", to: "s:a" }, { from: "s:b", to: "l:a" }, { from: "l:b", to: "bat:b" }, ...wires],
});

describe("gates", () => {
  it("truth tables", () => {
    const t = g => combos(2).map(([a, b]) => GATES[g].fn(a, b));
    expect(t("AND")).toEqual([false, false, false, true]);
    expect(t("OR")).toEqual([false, true, true, true]);
    expect(t("XOR")).toEqual([false, true, true, false]);
    expect(GATES.NOT.fn(true)).toBe(false);
  });
  it("adds 4-bit numbers with carries", () => {
    const r = addBits(9, 9);
    expect(r.value).toBe(18);
    expect(r.carryOut).toBe(true);
    expect(r.sum.map(Number).reverse().join("")).toBe("0010");
  });
});

describe("electric workshop", () => {
  it("lights a closed loop and not an open one", () => {
    const { parts, wires } = loop();
    expect(simulateElectric(parts, wires).on.has("l")).toBe(true);
    parts[1].on = false;
    expect(simulateElectric(parts, wires).on.has("l")).toBe(false);
  });
  it("detects a short circuit", () => {
    const { parts, wires } = loop([], [{ from: "bat:a", to: "bat:b" }]);
    const r = simulateElectric(parts, wires);
    expect(r.short).toBe(true);
    expect(r.on.size).toBe(0);
  });
  it("LED only works the right way round", () => {
    const parts = [{ id: "bat", type: "battery" }, { id: "d", type: "led" }];
    const wires = [{ from: "bat:a", to: "d:a" }, { from: "d:b", to: "bat:b" }];
    expect(simulateElectric(parts, wires).on.has("d")).toBe(true);
    parts[1].flip = true;
    expect(simulateElectric(parts, wires).on.has("d")).toBe(false);
  });
  it("two switches in a row act as AND, side by side as OR", () => {
    const series = (a, b) => simulateElectric(
      [{ id: "bat", type: "battery" }, { id: "A", type: "switch", on: a }, { id: "B", type: "switch", on: b }, { id: "l", type: "bulb" }],
      [{ from: "bat:a", to: "A:a" }, { from: "A:b", to: "B:a" }, { from: "B:b", to: "l:a" }, { from: "l:b", to: "bat:b" }]).on.has("l");
    const parallel = (a, b) => simulateElectric(
      [{ id: "bat", type: "battery" }, { id: "A", type: "switch", on: a }, { id: "B", type: "switch", on: b }, { id: "l", type: "bulb" }],
      [{ from: "bat:a", to: "A:a" }, { from: "bat:a", to: "B:a" }, { from: "A:b", to: "l:a" }, { from: "B:b", to: "l:a" }, { from: "l:b", to: "bat:b" }]).on.has("l");
    expect(combos(2).map(([a, b]) => series(a, b))).toEqual([false, false, false, true]);
    expect(combos(2).map(([a, b]) => parallel(a, b))).toEqual([false, true, true, true]);
  });
  it("marks live wires only while current flows", () => {
    const { parts, wires } = loop();
    expect(simulateElectric(parts, wires).liveNode("s:b")).toBe(true);
    parts[1].on = false;
    expect(simulateElectric(parts, wires).liveNode("s:b")).toBe(false);
  });
});

describe("logic workshop", () => {
  it("half adder", () => {
    const run = (a, b) => {
      const parts = [{ id: "A", type: "input", on: a }, { id: "B", type: "input", on: b }, { id: "x", type: "XOR" }, { id: "n", type: "AND" }, { id: "S", type: "lamp" }, { id: "C", type: "lamp" }];
      const wires = [{ from: "A:out", to: "x:in1" }, { from: "B:out", to: "x:in2" }, { from: "A:out", to: "n:in1" }, { from: "B:out", to: "n:in2" }, { from: "x:out", to: "S:in1" }, { from: "C:in1", to: "n:out" }];
      const r = simulateLogic(parts, wires);
      return [r.lamps.has("C"), r.lamps.has("S")].map(Number).join("");
    };
    expect([run(false, false), run(true, false), run(false, true), run(true, true)]).toEqual(["00", "01", "01", "10"]);
  });
  it("NOR latch remembers", () => {
    const parts = [{ id: "S", type: "input", on: true }, { id: "R", type: "input", on: false }, { id: "g1", type: "NOR" }, { id: "g2", type: "NOR" }, { id: "Q", type: "lamp" }];
    const wires = [{ from: "R:out", to: "g1:in1" }, { from: "g2:out", to: "g1:in2" }, { from: "S:out", to: "g2:in1" }, { from: "g1:out", to: "g2:in2" }, { from: "g1:out", to: "Q:in1" }];
    let r = simulateLogic(parts, wires);
    expect(r.lamps.has("Q")).toBe(true);           // SET pressed
    parts[0].on = false;
    r = simulateLogic(parts, wires, r.state);
    expect(r.lamps.has("Q")).toBe(true);           // let go: still ON (remembers)
    parts[1].on = true;
    r = simulateLogic(parts, wires, r.state);
    expect(r.lamps.has("Q")).toBe(false);          // RESET
    parts[1].on = false;
    r = simulateLogic(parts, wires, r.state);
    expect(r.lamps.has("Q")).toBe(false);          // stays OFF
  });
});

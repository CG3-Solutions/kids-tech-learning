import { describe, it, expect } from "vitest";
import { MAP_LEVELS, STRANDS, OUTCOMES, BASELINE, BASELINE_SAMPLES, levelForClass } from "./studyMap.js";
import { UNITS, LEVELS, PROJECTS } from "../lab/projects.js";
import { SEED } from "../index.js";

describe("STEM study map", () => {
  it("has four levels covering Class 1–10, in the same order as the Circuit Lab", () => {
    expect(MAP_LEVELS.map(l => l.id)).toEqual(LEVELS);
    expect(MAP_LEVELS.flatMap(l => l.classes)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    for (const l of MAP_LEVELS) for (const c of l.classes) expect(levelForClass(c)).toBe(l.id);
    expect(levelForClass(12)).toBe("engineer");
  });
  it("every strand has outcomes at every level, each linked to something real (or planned)", () => {
    const modules = new Set(SEED.modules.map(m => m.id));
    for (const s of STRANDS) for (const l of LEVELS) {
      const list = OUTCOMES[s.id][l];
      expect(list.length, `${s.id}/${l}`).toBeGreaterThan(0);
      for (const o of list) {
        expect(o.can.startsWith("I can"), o.can).toBe(true);
        for (const f of o.from) {
          if (f === "planned") continue;
          if (f.startsWith("lab:")) expect(UNITS.map(u => u.n), f).toContain(Number(f.slice(4)));
          else expect(modules.has(f), `${o.can}: unknown module ${f}`).toBe(true);
        }
      }
    }
  });
  it("every Circuit Lab unit appears on the map", () => {
    const linked = new Set(Object.values(OUTCOMES).flatMap(byLevel => Object.values(byLevel).flat()).flatMap(o => o.from));
    for (const u of UNITS) expect(linked.has(`lab:${u.n}`), `unit ${u.n}`).toBe(true);
  });
  it("the baseline has a sample item for every strand and level, and a real hands-on project", () => {
    for (const s of STRANDS) for (const l of LEVELS) expect(BASELINE_SAMPLES.some(i => i.strand === s.id && i.level === l), `${s.id}/${l}`).toBe(true);
    for (const i of BASELINE_SAMPLES) {
      if (i.type === "choice") expect(i.answer).toBeLessThan(i.options.length);
      if (i.type === "tf") expect(typeof i.answer).toBe("boolean");
      if (i.type === "order") expect(i.items.length).toBeGreaterThanOrEqual(3);
    }
    expect(PROJECTS.some(p => p.id === BASELINE.handsOn.project)).toBe(true);
  });
});

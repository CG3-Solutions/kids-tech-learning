import { describe, it, expect } from "vitest";
import { JOURNEYS, ALL_STEPS } from "../journeys.js";
import { SEED } from "../index.js";
import { isUnlocked } from "../../components/journey/Journey.jsx";

const PRACTICE = ["alphabets", "words", "sentences", "numbers", "mathematics"];
const bad = s => typeof s !== "string" || /undefined|NaN|null|\[object/.test(s);
const val = o => (typeof o === "object" ? o.value : o);

describe("practice content", () => {
  it("every step id is unique across all adventures", () => {
    const ids = ALL_STEPS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const act of PRACTICE) {
    const j = JOURNEYS[act];
    it(`${act}: every subject has a live module, parts and parent notes`, () => {
      expect(SEED.modules.find(m => m.activity === act && !m.coming_soon)).toBeTruthy();
      for (const s of j.steps) {
        expect(j.parts.map(p => p.id)).toContain(s.part);
        expect(s.parent && s.learned && s.title && s.emoji).toBeTruthy();
      }
    });

    for (const s of j.steps) {
      it(`${act} · ${s.title}: generated questions are well-formed for every class`, () => {
        if (s.kind === "learn") { expect(s.items.length).toBeGreaterThan(5); return; }
        expect(s.count).toBeGreaterThan(3);
        for (let grade = 0; grade <= 12; grade++) {
          for (let n = 0; n < 40; n++) {
            const q = s.gen(grade);
            const where = `${s.id} grade ${grade}: ${JSON.stringify(q).slice(0, 160)}`;
            expect(bad(q.prompt), where).toBe(false);
            if (q.say) expect(bad(q.say), where).toBe(false);
            if (q.type === "choice") {
              const vals = q.options.map(val).map(String);
              expect(vals.length, where).toBeGreaterThanOrEqual(2);
              expect(new Set(vals).size, where).toBe(vals.length);
              expect(vals, where).toContain(String(q.answer));
              q.options.forEach(o => expect(bad(typeof o === "object" ? o.label : String(o)), where).toBe(false));
            } else if (q.type === "number") {
              expect(Number.isFinite(q.answer), where).toBe(true);
              if (!q.allowNegative) expect(q.answer, where).toBeGreaterThanOrEqual(0);
            } else if (q.type === "order") {
              expect([...q.tiles].sort(), where).toEqual([...q.answer].sort());
              expect(q.tiles.length, where).toBeGreaterThanOrEqual(2);
            } else throw new Error(`unknown type ${q.type} in ${where}`);
            if (q.visual?.kind === "count") expect(q.visual.n, where).toBeGreaterThan(0);
            if (q.visual?.kind === "fraction") expect(q.visual.k, where).toBeLessThan(q.visual.n);
          }
        }
      });
    }

    it(`${act}: unlocks in order for young learners`, () => {
      const steps = j.steps;
      const open = (done, g) => steps.filter((_, i) => isUnlocked(steps, i, new Set(done), g)).map(x => x.id);
      expect(open([], 1)).toEqual([steps[0].id]);
      expect(open([steps[0].id], 1)).toEqual([steps[0].id, steps[1].id]);
    });
  }

  it("maths answers are right on spot checks", () => {
    const m = Object.fromEntries(JOURNEYS.mathematics.steps.map(s => [s.id, s]));
    for (let i = 0; i < 200; i++) {
      const q = m["math-step-14"].gen(9);
      const [, a, sign, b, c] = q.prompt.match(/^(\d*)x ([+−]) (\d+) = (-?\d+)/);
      const x = q.answer, A = a === "" ? 1 : Number(a), B = sign === "−" ? -Number(b) : Number(b);
      expect(A * x + B).toBe(Number(c));
    }
    for (let i = 0; i < 100; i++) {
      const q = m["math-step-16"].gen(9); const { a, b, c } = q.visual;
      expect(a * a + b * b).toBe(c * c);
    }
  });
});

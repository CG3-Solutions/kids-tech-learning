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
        if (s.talk || s.mission) return; // their own screens (see party.test.js)
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

describe("maths questions teach something (Q2)", () => {
  const step = id => [...JOURNEYS.numbers.steps, ...JOURNEYS.mathematics.steps].find(s => s.id === id);
  const many = (id, grade, n = 300) => Array.from({ length: n }, () => step(id).gen(grade));
  const num = t => Number(String(t).replace(/[−]/g, "-"));

  it("place value: wrong answers are the digit's value in other places, never nearby numbers", () => {
    for (const q of many("num-step-7", 3).filter(q => q.type === "choice")) {
      const d = Number(q.prompt.match(/value of the (\d)/)[1]);
      expect(d).toBeGreaterThan(0);
      for (const o of q.options) expect([d, d * 10, d * 100, d * 1000]).toContain(Number(o));
      const n = Number(q.prompt.match(/In (\d+)/)[1]), place = q.prompt.match(/the (\w+) place/)[1];
      expect(Number(q.answer)).toBe(place === "hundreds" ? Math.floor(n / 100) * 100 : place === "tens" ? Math.floor(n / 10) % 10 * 10 : n % 10);
    }
  });
  it("number names: every option is written in words", () => {
    for (const q of many("num-step-3", 3)) if (/in words/.test(q.prompt)) for (const o of q.options) expect(o).toMatch(/^[a-z -]+$/);
  });
  it("negative numbers: every question involves a negative number, and the answers are right", () => {
    for (const q of many("num-step-12", 6)) {
      const nums = (q.prompt.match(/-?\d+/g) ?? []).map(Number);
      expect(nums.some(x => x < 0) || q.answer < 0, q.prompt).toBe(true);
      if (/warmer|colder/.test(q.prompt)) { const [t, d] = nums; expect(q.answer).toBe(/warmer/.test(q.prompt) ? t + d : t - d); }
      if (/smallest/.test(q.prompt)) expect(num(q.answer)).toBe(Math.min(...q.options.map(num)));
      if (/bigger/.test(q.prompt)) expect(num(q.answer)).toBe(Math.max(...q.options.map(num)));
    }
  });
  it("integers: always at least one negative number, and the sums are right", () => {
    for (const q of many("math-step-13", 7)) {
      const [, a, op, b] = q.prompt.match(/^(-?\d+) ([+−]) \(?(-?\d+)\)?/);
      expect(Number(a) < 0 || Number(b) < 0, q.prompt).toBe(true);
      expect(q.answer).toBe(op === "+" ? Number(a) + Number(b) : Number(a) - Number(b));
    }
  });
  it("new question kinds give right, whole or 2-decimal answers", () => {
    for (const q of many("math-step-9", 6)) {
      const g = (a, b) => (b ? g(b, a % b) : a);
      const of = q.prompt.match(/What is (\d+)\/(\d+) of (\d+)/); if (of) { expect(q.answer).toBe((Number(of[1]) * Number(of[3])) / Number(of[2])); expect(g(Number(of[1]), Number(of[2]))).toBe(1); }
      const eq = q.prompt.match(/^(\d+)\/(\d+) = \?\/(\d+)/); if (eq) expect(q.answer / Number(eq[3])).toBeCloseTo(Number(eq[1]) / Number(eq[2]));
    }
    for (const q of many("math-step-10", 6)) {
      const ch = q.prompt.match(/pay ₹(\d+) for something that costs ₹(\d+\.\d+)/); if (ch) expect(q.answer).toBeCloseTo(Number(ch[1]) - Number(ch[2]), 2);
    }
    for (const q of many("math-step-11", 6)) {
      expect(Number.isInteger(q.answer), q.prompt).toBe(true);
      const sc = q.prompt.match(/scored (\d+) out of (\d+)/); if (sc) expect(q.answer).toBeCloseTo((Number(sc[1]) / Number(sc[2])) * 100, 6);
    }
    for (const q of many("math-step-12", 7)) {
      const w = q.prompt.match(/area of (\d+) square \w+ and a length of (\d+)/); if (w) expect(q.answer * Number(w[2])).toBe(Number(w[1]));
    }
    for (const q of many("math-step-1", 2)) { const m = q.prompt.match(/^(\d+) \+ \? = (\d+)/); if (m) expect(Number(m[1]) + q.answer).toBe(Number(m[2])); }
    for (const q of many("math-step-2", 2)) { const m = q.prompt.match(/^(\d+) − \? = (\d+)/); if (m) expect(Number(m[1]) - q.answer).toBe(Number(m[2])); }
  });
  it("bigger sums use 3-digit numbers from Class 4", () => {
    expect(many("math-step-3", 4).every(q => q.visual.a >= 100)).toBe(true);
    expect(many("math-step-3", 2).every(q => q.visual.a < 100 && q.answer === q.visual.a + q.visual.b)).toBe(true);
    expect(many("math-step-4", 5).every(q => q.answer === q.visual.a - q.visual.b && q.answer > 0)).toBe(true);
  });
});

describe("language banks (Q3)", async () => {
  const D = await import("./languageData.js");
  const { levelOf, pickAt } = await import("./language.js");
  const all = (bank) => Object.values(bank).flat();
  const steps = id => [...JOURNEYS.alphabets.steps, ...JOURNEYS.words.steps, ...JOURNEYS.sentences.steps].find(s => s.id === id);
  const many = (id, grade, n = 200) => Array.from({ length: n }, () => steps(id).gen(grade));

  it("levels follow the class, with review from one level down", () => {
    expect([1, 3, 4, 7, 8, 12].map(levelOf)).toEqual([0, 0, 1, 1, 2, 2]);
    const counts = [0, 0, 0];
    for (let i = 0; i < 400; i++) counts[pickAt({ 0: ["a"], 1: ["b"], 2: ["c"] }, 10)[1]]++;
    expect(counts[0]).toBe(0);
    expect(counts[2]).toBeGreaterThan(counts[1]);
    expect(pickAt({ 1: ["x"] }, 2)[0]).toBe("x"); // a bank that starts at level 1 still works for younger children
  });
  it("banks are bigger than before and have no repeats", () => {
    const size = b => all(b).length;
    expect(size(D.BUILD)).toBeGreaterThanOrEqual(55);
    expect(size(D.PICTURE)).toBeGreaterThanOrEqual(90);
    expect(size(D.HOMOPHONES)).toBeGreaterThanOrEqual(40);
    expect(size(D.SPELLING)).toBeGreaterThanOrEqual(55);
    expect(size(D.SPEECH)).toBeGreaterThanOrEqual(12);
    for (const bank of [D.BUILD, D.PICTURE, D.SPELLING, D.PLURALS, D.MISSING, D.HOMOPHONES, D.TENSES, D.CAPITALS]) {
      const keys = all(bank).map(x => JSON.stringify(Array.isArray(x) ? x[0] : x));
      expect(new Set(keys).size).toBe(keys.length);
    }
  });
  it("one right answer: no word belongs to two pairs in the same level (opposites, synonyms)", () => {
    for (const bank of [D.OPPOSITES, D.SYNONYMS]) for (const pairs of Object.values(bank)) {
      const ws = pairs.flat();
      expect(new Set(ws).size, ws.join(",")).toBe(ws.length);
    }
    for (const fams of Object.values(D.RHYMES)) { const ws = fams.flat(); expect(new Set(ws).size).toBe(ws.length); }
  });
  it("plural choices are real mistakes, never the right answer twice", () => {
    for (const [one, many, ...wrong] of all(D.PLURALS)) {
      expect(wrong).toHaveLength(2);
      expect(wrong).not.toContain(many);
      expect(new Set([many, ...wrong]).size).toBe(3);
      expect(wrong.join(" ")).not.toMatch(/en$|een /); // no invented "-en" words like "gooseen"
    }
  });
  it("multiple-choice items include their answer, with useful hints for sound-alike words", () => {
    for (const [s, a, opts] of [...all(D.MISSING), ...all(D.TENSES)]) { expect(opts, s).toContain(a); expect(s).toContain("___"); }
    for (const [s, a, opts, hint] of all(D.HOMOPHONES)) { expect(opts, s).toContain(a); expect(hint?.length, s).toBeGreaterThan(8); }
    for (const [s, a, opts] of D.JOINERS[2]) expect(opts, s).toContain(a);
    for (const [s, a] of D.JOINERS[0]) expect(D.JOIN_WORDS).toContain(a);
    for (const [, w, k] of all(D.WORD_KINDS)) expect(D.KINDS[k], w).toBeTruthy();
    for (const [s, subj, pred] of D.SUBJECTS[1]) expect(`${subj} ${pred}.`).toBe(s);
    for (const [right, ...wrong] of [...all(D.PUNCT), ...all(D.VOICE).map(x => x.slice(1)), ...all(D.SPEECH).map(x => x.slice(1)), ...all(D.SPELLING)]) {
      expect(wrong).not.toContain(right); expect(new Set(wrong).size).toBe(wrong.length);
    }
  });
  it("ordering puzzles never start already solved", () => {
    for (const id of ["abc-step-7", "abc-step-9", "words-step-2", "sent-step-1"]) for (const g of [2, 5, 9]) for (const q of many(id, g, 150)) {
      expect(q.tiles.join("|"), `${id} g${g}`).not.toBe(q.answer.join("|"));
    }
  });
  it("dictionary order: same first letter from Class 4, deeper letters from Class 8", () => {
    for (const q of many("abc-step-9", 5)) expect(new Set(q.answer.map(w => w[0])).size).toBe(1);
    for (const q of many("abc-step-9", 9)) { expect(new Set(q.answer.map(w => w.slice(0, 2))).size).toBe(1); expect([...q.answer].sort()).toEqual(q.answer); }
  });
  it("what comes next never offers a letter that is already shown", () => {
    for (const q of many("abc-step-5", 2)) {
      const shown = q.prompt.split(/\s+/).filter(x => x !== "_");
      for (const o of q.options) if (o !== q.answer) expect(shown).not.toContain(o);
    }
  });
  it("older children get harder words", () => {
    const young = new Set(D.PICTURE[0].map(x => x[0]));
    const g10 = many("words-step-1", 10).map(q => q.answer);
    expect(g10.filter(w => young.has(w)).length).toBe(0);
    expect(many("words-step-6", 2).every(q => all({ 0: D.SPELLING[0] }).some(x => x[0] === q.answer))).toBe(true);
  });
});

// Chip's quiz: a mixed set of questions from the concepts the child has already learned,
// at their depth, with weak concepts first. Wrong answers go into spaced review.
import { conceptOf, isOpen } from "./review.js";

const DEPTH_IDS = ["base", "mid", "high"];
const shuffle = (a, rnd) => a.map(x => [rnd(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

// The questions a concept can ask at a depth: practice questions (mixed types) and the check at that depth.
export function conceptPool(step, depth = 0) {
  const where = DEPTH_IDS[depth] ?? "base";
  const check = where === "base" ? step.check : step.deeper?.[where]?.check ?? step.check;
  const checkWhere = where !== "base" && step.deeper?.[where] ? where : "base";
  return {
    practice: (step.practice ?? []).map((q, i) => ({ ...q, key: `${step.id}:p:${i}`, conceptId: step.id })).filter(q => (q.min ?? 0) <= depth),
    check: check.map((q, i) => ({ ...q, key: `${step.id}:${checkWhere}:${i}`, conceptId: step.id })),
  };
}

// Pick `size` questions: concepts with open review questions first, then the rest; practice questions
// (picture, true/false, ordering, spot-the-bug) before check questions, one concept at a time.
export function buildQuiz(steps, { done = new Set(), depth = 0, review = {}, size = 8, rnd = Math.random } = {}) {
  let learned = steps.filter(s => done.has(s.id));
  if (!learned.length) learned = steps.slice(0, 3);
  const weak = new Set(Object.entries(review).filter(([, r]) => isOpen(r)).map(([k]) => conceptOf(k)));
  const ranked = [...shuffle(learned.filter(s => weak.has(s.id)), rnd), ...shuffle(learned.filter(s => !weak.has(s.id)), rnd)];
  const queues = ranked.map(s => { const p = conceptPool(s, depth); return [...shuffle(p.practice, rnd), ...shuffle(p.check, rnd)]; });
  const out = [];
  for (let round = 0; out.length < size && queues.some(q => q.length > round); round++) {
    for (const q of queues) { if (out.length < size && q[round]) out.push(q[round]); }
  }
  return shuffle(out, rnd);
}

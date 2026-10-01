// Helpers for generating practice questions. Question shapes used by the practice engine:
//   { type: "choice", prompt, say?, visual?, options: [string | {label, value}], answer, hint }
//   { type: "number", prompt, say?, visual?, answer: number, hint, unit? }
//   { type: "order",  prompt, say?, visual?, tiles: [string], answer: [string], joiner: " " | "", hint }
export const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const pick = arr => arr[Math.floor(Math.random() * arr.length)];
export const shuffle = arr => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const sample = (arr, n) => shuffle(arr).slice(0, n);
export const uniq = arr => [...new Set(arr)];

// The correct answer plus distractors, shuffled, no duplicates.
export function withDistractors(answer, candidates, n = 4) {
  const others = shuffle(uniq(candidates.filter(c => String(c) !== String(answer)))).slice(0, n - 1);
  return shuffle([answer, ...others]);
}

// Nearby wrong numbers for choice questions (never negative unless allowed).
export function nearNumbers(answer, spread = 3, allowNegative = false) {
  const out = new Set();
  for (let d = 1; out.size < 6 && d < 50; d++) {
    for (const x of [answer + d, answer - d]) if (allowNegative || x >= 0) out.add(x);
  }
  return [...out].slice(0, spread * 2);
}

// 12,34,567 (Indian grouping).
export const indian = n => n.toLocaleString("en-IN");
export const gradeOf = g => (g && g > 0 ? g : 2);

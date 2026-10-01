// Spaced review: a question the child gets wrong comes back after 1 day, then 3, then 7.
// Right on the 7-day look and it's mastered; wrong at any point and it starts again at 1 day.
// Stored in child_state "review": { [questionKey]: { box, due: "YYYY-MM-DD", misses, rights, at } }
//   box 0 → due in 1 day, box 1 → 3 days, box 2 → 7 days, box 3 → mastered.
// Question keys say where the question lives, e.g. "comp-step-6:mid:1" or "comp-step-6:p:2".
export const GAPS = [1, 3, 7];
export const MASTERED = GAPS.length;

const pad = n => String(n).padStart(2, "0");
export const dayOf = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function addDays(day, n) {
  const [y, m, d] = day.split("-").map(Number);
  return dayOf(new Date(y, m - 1, d + n));
}

// A wrong answer in a check or quiz: (re)start the question at 1 day.
export function addMiss(review = {}, key, today = dayOf()) {
  const prev = review[key];
  return { ...review, [key]: { box: 0, due: addDays(today, GAPS[0]), misses: (prev?.misses ?? 0) + 1, rights: prev?.rights ?? 0, at: today } };
}

// An answer during review: right moves it to the next gap (or mastered), wrong starts it again.
export function reviewAnswer(review = {}, key, ok, today = dayOf()) {
  const prev = review[key];
  if (!prev) return review;
  if (!ok) return addMiss(review, key, today);
  const box = Math.min(prev.box + 1, MASTERED);
  return { ...review, [key]: { ...prev, box, due: box >= MASTERED ? null : addDays(today, GAPS[box]), rights: (prev.rights ?? 0) + 1, at: today } };
}

export const isOpen = r => r && r.box < MASTERED;
// Questions waiting today (oldest first). `limit` keeps a session short.
export function dueKeys(review = {}, today = dayOf(), limit = Infinity) {
  return Object.entries(review).filter(([, r]) => isOpen(r) && r.due <= today)
    .sort((a, b) => a[1].due.localeCompare(b[1].due) || b[1].misses - a[1].misses).slice(0, limit).map(([k]) => k);
}
// When the next question comes back (for "Chip has 2 questions for you tomorrow").
export function nextDue(review = {}) {
  return Object.values(review).filter(isOpen).map(r => r.due).sort()[0] ?? null;
}
export const conceptOf = key => key.split(":")[0];

// How each concept is going, for parents: weak first.
//   weak:  the check was tried but not passed yet, or 2+ questions still in review, or a question missed 3+ times
//   strong: passed with 3/3 (at any depth) and nothing left to review
//   ok:     passed, with a little left to review
export function conceptStatus(steps, state = {}, done = new Set()) {
  const records = state.concepts ?? {};
  const review = state.review ?? {};
  return steps.map(s => {
    const rec = records[s.id];
    const open = Object.entries(review).filter(([k, r]) => conceptOf(k) === s.id && isOpen(r));
    const mastered = Object.entries(review).filter(([k, r]) => conceptOf(k) === s.id && !isOpen(r)).length;
    const passed = done.has(s.id) || (rec?.best ?? 0) >= 2;
    let status = "new";
    if (rec || open.length) {
      const stuck = open.some(([, r]) => r.misses >= 3);
      if (!passed || open.length >= 2 || stuck) status = "weak";
      else if (rec?.best >= 3 && !open.length) status = "strong";
      else status = "ok";
    }
    return { step: s, status, best: rec?.best ?? null, tries: rec?.tries ?? 0, depth: rec?.depth ?? null, open: open.length, mastered, misses: open.reduce((n, [, r]) => n + r.misses, 0) };
  });
}
export const STATUS_ORDER = { weak: 0, ok: 1, strong: 2, new: 3 };
export const STATUS_LABEL = { weak: "Needs practice", ok: "Getting there", strong: "Strong", new: "Not started" };

import { moduleStats, startOrder, learnedToday } from "./progress.js";

// Today's quest on the learner home: up to three short things to do, in different areas where possible.
// `first` is the subject the child is continuing; `due` is how many review questions are waiting.
// An item is done once the child learns something in that subject today.
export function todaysQuest({ modules, cards, child, learner, first = null, due = 0, now = new Date() }) {
  const items = [];
  const areas = new Set();
  const has = m => items.some(i => i.module.id === m.id);
  const add = m => { items.push({ module: m, done: learnedToday(child, m.id, now) }); areas.add(m.area); };
  if (first) add(first);
  const computer = modules.find(m => m.activity === "computer");
  if (due > 0 && computer && !has(computer)) items.push({ module: computer, review: due, done: false });
  const order = startOrder(learner);
  const rank = m => { const i = order.indexOf(m.id); return i < 0 ? order.length : i; };
  const open = modules
    .filter(m => !has(m))
    .map(m => ({ m, st: moduleStats(m, cards, child) }))
    .filter(x => x.st.total > 0 && x.st.done < x.st.total)
    .sort((a, b) => rank(a.m) - rank(b.m) || a.m.sort - b.m.sort)
    .map(x => x.m);
  for (const m of open) if (items.length < 3 && !areas.has(m.area)) add(m);
  for (const m of open) if (items.length < 3 && !has(m)) add(m);
  return items;
}

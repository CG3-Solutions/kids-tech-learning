// The menu at the top of a subject page: one item per section, in learning order, each saying what
// kind of thing it is, what it's for and how far the child has got. Pure, so it's unit-tested.
import { ACTIVITIES } from "../content/index.js";
import { JOURNEYS } from "../content/journeys.js";
import { PROJECTS } from "../content/lab/projects.js";
import { HUNT, MACHINES } from "../content/electricity.js";
import { PUZZLES } from "../content/subjects.js";

// Kinds, in the order a child meets them. Glossary cards are reference, so they go last.
const ORDER = { learn: 0, path: 1, build: 2, play: 3, check: 4, reference: 5 };
export const KIND_LABEL = { learn: "Learn", path: "Adventure", build: "Build", play: "Play", check: "Quiz", reference: "Look up" };

// text: the full words for the panel; short: what fits on a chip in the section bar.
const countOf = (n, total, word) => ({ text: `${n} of ${total} ${word}`, short: `${n}/${total}`, done: n, total });

// tabs: the section ids this subject has (as ModulePage works them out).
// done: Set of item ids the child has finished. attempts: quiz attempts for this subject.
// state: the child's saved state (treasure hunt marks…). glossary: the cards are reference only.
export function menuItems({ tabs, module, cards = [], done = new Set(), attempts = [], state = {}, glossary = false }) {
  const items = tabs.map(tab => {
    if (tab === "cards") {
      if (glossary) return { tab, kind: "reference", title: "Glossary", icon: "book", about: "Every word, to look up any time", meta: { text: `${cards.length} words`, short: `${cards.length}` } };
      const n = cards.filter(c => done.has(c.id)).length;
      return { tab, kind: "learn", title: "Cards", icon: "cards", about: "One idea at a time, with pictures", meta: countOf(n, cards.length, "collected") };
    }
    if (tab === "lab") {
      const n = PROJECTS.filter(p => done.has(p.id)).length;
      return { tab, kind: "build", title: "Circuit Lab", icon: "flask", about: "Build real circuits on a board", meta: countOf(n, PROJECTS.length, "projects") };
    }
    if (tab === "hunt") {
      let got = 0, total = 0;
      const marks = state.hunt ?? {};
      HUNT.forEach(([, ans], r) => ans.forEach((a, c) => { total += a; if (a && marks[`${r}-${c}`]) got++; }));
      return { tab, kind: "play", title: "Treasure hunt", icon: "search", about: "Find the parts inside things at home", meta: countOf(got, total, "found") };
    }
    if (tab === "machines") return { tab, kind: "play", title: "Machines", icon: "cog", about: "How robots sense, think and act", meta: { text: `${MACHINES.length} machines`, short: `${MACHINES.length}` } };
    if (tab === "quiz") {
      const best = attempts.reduce((m, a) => (!m || a.score / a.total > m.score / m.total ? a : m), null);
      return { tab, kind: "check", title: "Quiz", icon: "question", about: "Check what you know", meta: best ? { text: `Best ${best.score} of ${best.total}`, short: `${best.score}/${best.total}`, done: best.score, total: best.total } : { text: "Not tried yet", short: "New" } };
    }
    if (tab === "coding") {
      const n = PUZZLES.filter(p => done.has(`puzzle-${p.id}`)).length;
      return { tab, kind: "path", title: ACTIVITIES.coding?.title ?? "Robot puzzles", icon: "puzzle", about: "Guide the robot with instructions", meta: countOf(n, PUZZLES.length, "solved") };
    }
    const j = JOURNEYS[tab];
    const steps = j ? j.steps.filter(s => !s.bonus) : [];
    const n = steps.filter(s => done.has(s.id)).length;
    return {
      tab, kind: "path", title: ACTIVITIES[tab]?.title ?? module?.title ?? tab, icon: tab === "typing" ? "keyboard" : "map",
      about: tab === "typing" ? "Lessons, games and tests" : "Step by step, with your guide",
      meta: steps.length ? countOf(n, steps.length, tab === "typing" ? "lessons" : "steps") : { text: "Start the adventure", short: "New" },
    };
  });
  const sorted = items.map((it, i) => ({ it, i })).sort((a, b) => ORDER[a.it.kind] - ORDER[b.it.kind] || a.i - b.i).map(x => x.it);
  return sorted;
}

// Has the child started this subject at all? (Then "Start here" can go.)
export const startedSubject = items => items.some(it => (it.meta.done ?? 0) > 0);

// Headings for the "All sections" panel, in the same order as the bar.
export const GROUP_LABEL = { learn: "Learn", path: "Adventures", build: "Build", play: "Play", check: "Quiz", reference: "Look up" };
// Sections grouped by kind, keeping the menu's order: [{ kind, label, items }].
export function groupItems(items) {
  const groups = [];
  for (const it of items) {
    const g = groups.at(-1);
    if (g && g.kind === it.kind) g.items.push(it); else groups.push({ kind: it.kind, label: GROUP_LABEL[it.kind], items: [it] });
  }
  return groups;
}

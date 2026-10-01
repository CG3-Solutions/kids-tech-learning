import { PUZZLES } from "../content/subjects.js";
import { JOURNEYS, STEP_IDS } from "../content/journeys.js";

// Items a child can complete in a module: every published card, plus puzzles for the coding module.
export function moduleItems(module, cards) {
  const ids = cards.filter(c => c.module_id === module.id && c.published !== false).map(c => c.id);
  if (module.activity === "coding") ids.push(...PUZZLES.map(p => `puzzle-${p.id}`));
  if (JOURNEYS[module.activity]) ids.push(...JOURNEYS[module.activity].steps.map(s => s.id));
  return ids;
}

export function moduleStats(module, cards, child) {
  const items = moduleItems(module, cards);
  const done = new Set(child.progress.filter(p => p.module_id === module.id).map(p => p.item_id));
  const doneCount = items.filter(id => done.has(id)).length;
  const attempts = child.attempts.filter(a => a.module_id === module.id);
  const best = attempts.reduce((m, a) => (a.score / a.total > (m ? m.score / m.total : -1) ? a : m), null);
  return {
    done: doneCount,
    total: items.length,
    pct: items.length ? Math.round((doneCount / items.length) * 100) : 0,
    quizzes: attempts.length,
    best,
  };
}

// One star per thing learned, plus one per correct quiz answer.
export function starCount(child) {
  return child.progress.length + child.attempts.reduce((s, a) => s + a.score, 0);
}

export const BADGES = [
  { id: "first", emoji: "✨", name: "First spark", how: "Learn your first card", test: s => s.items >= 1 },
  { id: "ten", emoji: "🔟", name: "Ten cards", how: "Learn 10 cards", test: s => s.cards >= 10 },
  { id: "circuit", emoji: "🔌", name: "Circuit builder", how: "Finish Part A: circuit basics", test: s => s.ids.has("circuit-step-5") || s.ids.has("activity-circuit") },
  { id: "gates", emoji: "🚦", name: "Logic gatekeeper", how: "Finish Part B: switches that think", test: s => s.ids.has("circuit-step-12") },
  { id: "computer", emoji: "🖥️", name: "Computer builder", how: "Finish Part C: the adder and memory", test: s => s.ids.has("circuit-step-15") },
  { id: "abc", emoji: "🔠", name: "Alphabet star", how: "Finish Polly's alphabet adventure", test: s => s.ids.has("abc-step-9") },
  { id: "wordwiz", emoji: "📖", name: "Word wizard", how: "Finish Part B of Polly's word adventure", test: s => s.ids.has("words-step-8") },
  { id: "sentence", emoji: "💬", name: "Sentence builder", how: "Finish Part B of Polly's sentence adventure", test: s => s.ids.has("sent-step-7") },
  { id: "numbers", emoji: "🔟", name: "Number ninja", how: "Finish Part B of Ollie's number adventure", test: s => s.ids.has("num-step-9") },
  { id: "maths", emoji: "🧮", name: "Maths master", how: "Finish Part C of Ollie's maths adventure", test: s => s.ids.has("math-step-12") },
  { id: "binary", emoji: "🤖", name: "Binary boss", how: "Finish Bit's 7 binary steps", test: s => s.ids.has("binary-step-7") || s.ids.has("activity-binary") },
  { id: "coder", emoji: "🧩", name: "Code cadet", how: "Solve 3 robot puzzles", test: s => s.puzzles >= 3 },
  { id: "robot", emoji: "🤖", name: "Robot master", how: "Solve all robot puzzles", test: s => s.puzzles >= PUZZLES.length },
  { id: "quiz", emoji: "🏆", name: "Quiz whiz", how: "Get every quiz answer right", test: s => s.perfect >= 1 },
  { id: "explorer", emoji: "🧭", name: "Explorer", how: "Learn a card in every subject", test: s => s.modulesTouched >= s.moduleCount },
  { id: "hunter", emoji: "🔎", name: "Treasure hunter", how: "Tick 20 boxes in the treasure hunt", test: s => s.huntTicks >= 20 },
  { id: "super", emoji: "🌟", name: "Super learner", how: "Earn 100 stars", test: s => s.stars >= 100 },
];

export function badgeState(child, modules) {
  const ids = new Set(child.progress.map(p => p.item_id));
  const s = {
    ids,
    items: child.progress.length,
    cards: child.progress.filter(p => !STEP_IDS.has(p.item_id) && !/^(puzzle|activity)-/.test(p.item_id)).length,
    puzzles: child.progress.filter(p => p.item_id.startsWith("puzzle-")).length,
    perfect: child.attempts.filter(a => a.total > 0 && a.score === a.total).length,
    modulesTouched: new Set(child.progress.filter(p => !p.item_id.startsWith("activity-")).map(p => p.module_id)).size,
    moduleCount: modules.length,
    huntTicks: Object.values(child.state?.hunt ?? {}).filter(Boolean).length,
    stars: starCount(child),
  };
  return BADGES.map(b => ({ ...b, earned: b.test(s) }));
}

// What a parent should teach next: the first unlearned card in the least-finished subject.
export function nextSuggestion(modules, cards, child) {
  const ranked = modules
    .map(m => ({ m, st: moduleStats(m, cards, child) }))
    .filter(x => x.st.total > 0 && x.st.done < x.st.total)
    .sort((a, b) => a.st.pct - b.st.pct || a.m.sort - b.m.sort);
  if (!ranked.length) return null;
  const { m } = ranked[0];
  const done = new Set(child.progress.map(p => p.item_id));
  const card = cards.filter(c => c.module_id === m.id && c.published !== false).sort((a, b) => a.sort - b.sort).find(c => !done.has(c.id));
  return { module: m, card: card ?? null };
}

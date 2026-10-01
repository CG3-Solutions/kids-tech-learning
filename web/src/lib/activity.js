// Turns raw progress records into readable lines for parents.
import { PUZZLES } from "../content/subjects.js";
import { ALL_STEPS } from "../content/journeys.js";
import { sessionTitle } from "../content/typing.js";

const STEPS = Object.fromEntries(ALL_STEPS.map(s => [s.id, s]));

export function describeItem(itemId, published) {
  if (STEPS[itemId]) return `${STEPS[itemId].emoji} Finished “${STEPS[itemId].title}”`;
  if (itemId.startsWith("puzzle-")) { const i = PUZZLES.findIndex(p => `puzzle-${p.id}` === itemId); return `🧩 Solved robot puzzle ${i + 1}`; }
  if (itemId === "activity-circuit") return "🔌 Lit a bulb in Build a circuit";
  if (itemId === "activity-binary") return "🃏 Made 5 numbers with binary cards";
  const card = published?.cards.find(c => c.id === itemId);
  return card ? `${card.data.e} Learned the “${card.data.n}” card` : `✓ ${itemId}`;
}

// Newest first: learned items and quizzes, for one child or several.
export function timeline(entries, published, limit = 20) {
  const rows = [];
  for (const { child, data } of entries) {
    for (const p of data.progress) rows.push({ at: p.done_at, child, text: describeItem(p.item_id, published), module: p.module_id });
    for (const a of data.attempts) {
      const m = published?.modules.find(x => x.id === a.module_id);
      rows.push({ at: a.created_at, child, text: `❓ Scored ${a.score}/${a.total} in the ${m?.title ?? a.module_id} quiz`, module: a.module_id });
    }
    for (const t of data.typing ?? []) {
      const title = sessionTitle(t.lesson_id);
      rows.push({ at: t.created_at, child, text: `⌨️ Typed “${title}”: ${t.wpm} words a minute, ${t.accuracy}% accuracy${t.passed ? "" : " (not passed yet)"}`, module: "typing" });
    }
  }
  return rows.filter(r => r.at).sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export const fmtWhen = iso => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

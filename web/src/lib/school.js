// Teacher and class logic, kept free of React so it can be tested.
import { LADDER, TYPING_JOURNEY, sessionTitle } from "../content/typing.js";
import { typingSummary } from "./typing.js";
import { localDay } from "./AppContext.jsx";

export const ASSIGNMENT_KINDS = [
  ["lesson", "Pass a lesson"],
  ["test", "Take a typing test"],
  ["ladder", "Reach a speed on the speed ladder"],
];

// What a learner sees: "Pass “Home row check”", "Take a 3-minute test (15+ wpm)", "Reach 20 wpm on the speed ladder".
export function assignmentLabel(a) {
  if (a.kind === "lesson") return `Pass “${sessionTitle(a.target)}”`;
  if (a.kind === "test") return `Take a ${a.target}-minute typing test${a.min_wpm ? ` at ${a.min_wpm}+ words a minute` : ""}`;
  return `Reach ${a.target} words a minute on the speed ladder`;
}

// Has this learner done the assignment? `learner` = { typing, progress, state }.
// Tests only count if taken after the assignment was set; lessons and ladder rungs count whenever.
export function assignmentStatus(a, learner, today = localDay()) {
  const typing = learner.typing ?? [];
  let done = false, detail = "Not started";
  if (a.kind === "lesson") {
    const p = (learner.progress ?? []).find(x => x.item_id === a.target);
    done = !!p;
    const tries = typing.filter(t => t.lesson_id === a.target).length;
    detail = done ? "Passed" : tries ? `${tries} ${tries === 1 ? "try" : "tries"}, not passed yet` : "Not started";
  } else if (a.kind === "test") {
    const runs = typing.filter(t => t.lesson_id === `test-${a.target}` && t.created_at >= a.created_at);
    const good = runs.filter(t => t.passed && (!a.min_wpm || t.wpm >= a.min_wpm));
    const best = runs.reduce((m, t) => Math.max(m, t.wpm), 0);
    done = good.length > 0;
    detail = runs.length ? `Best ${best} wpm` : "Not started";
  } else if (a.kind === "ladder") {
    const rung = learner.state?.typing?.ladder ?? 0;
    const speed = LADDER[rung - 1] ?? 0;
    done = speed >= Number(a.target);
    detail = speed ? `On ${speed} wpm` : "Not started";
  }
  const overdue = !done && !!a.due_on && a.due_on < today;
  return { done, overdue, detail };
}

// One line per student for the class dashboard.
export function studentRow(m, assignments = []) {
  const sum = typingSummary(m.typing ?? []);
  const passed = new Set((m.progress ?? []).map(p => p.item_id));
  const rung = m.state?.typing?.ladder ?? 0;
  const last = (m.typing ?? [])[0]?.created_at ?? null;
  const statuses = assignments.map(a => assignmentStatus(a, m));
  return {
    child: m.child,
    lessons: TYPING_JOURNEY.filter(s => passed.has(s.id)).length,
    best: sum.bestWpm,
    accuracy: sum.accuracy,
    ladder: LADDER[rung - 1] ?? 0,
    minutes: sum.minutes,
    last,
    statuses,
    doneCount: statuses.filter(s => s.done).length,
  };
}

// Students a teacher may want to check on today, each with plain reasons:
// an overdue task, accuracy under 85% over the last lessons, or nothing typed for a week.
export const HELP_ACCURACY = 85;
export function needsHelp(rows, assignments, now = new Date()) {
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7);
  return rows.map(r => {
    const why = [];
    const late = assignments.filter((a, i) => r.statuses[i]?.overdue).map(a => a.title);
    if (late.length) why.push(`Overdue: ${late.join(", ")}`);
    if (r.accuracy != null && r.accuracy < HELP_ACCURACY) why.push(`Accuracy ${r.accuracy}% (aim for ${HELP_ACCURACY}%)`);
    if (r.last && new Date(r.last) < weekAgo) why.push("No typing for over a week");
    else if (!r.last && assignments.length) why.push("Hasn't started typing yet");
    return { row: r, why };
  }).filter(x => x.why.length);
}

// CSV for spreadsheets. Cells that start with = + - @ are prefixed with ' so a spreadsheet
// never runs them as formulas (a student's name is typed by a parent, so treat it as untrusted).
export function csvCell(v) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function rosterCsv(rows, assignments) {
  const head = ["Student", "Typing lessons passed", "Best speed (wpm)", "Accuracy (last 5, %)", "Speed ladder (wpm)", "Typing minutes", "Last active", ...assignments.map(a => a.title)];
  const lines = rows.map(r => [
    r.child.name, `${r.lessons}/${TYPING_JOURNEY.length}`, r.best || "", r.accuracy ?? "", r.ladder || "", r.minutes,
    r.last ? r.last.slice(0, 10) : "", ...r.statuses.map(s => (s.done ? "Done" : s.overdue ? "Overdue" : s.detail)),
  ]);
  return [head, ...lines].map(row => row.map(csvCell).join(",")).join("\r\n");
}

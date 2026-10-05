// "Inside a Computer" for parents: how each concept is going, what to teach next, and the exact
// questions the child keeps missing (from lesson checks, Chip's quiz and spaced review).
import { COMPUTER_JOURNEY, conceptQuestion } from "../../content/computer.js";
import { DEPTHS } from "../../content/computerDeep.js";
import { conceptStatus, isOpen, STATUS_LABEL, STATUS_ORDER } from "../../lib/review.js";
import { rightAnswer } from "../../components/concept/Question.jsx";
import Mastery from "../../components/Mastery.jsx";

const depthLabel = id => DEPTHS.find(d => d.id === id)?.label ?? "";

export default function ConceptReport({ state = {}, done }) {
  const rows = conceptStatus(COMPUTER_JOURNEY, state, done);
  const started = rows.filter(r => r.status !== "new");
  if (!started.length) return <p className="muted">No computer lessons yet. Open Science → Inside a Computer from the child's home screen to start Chip's path.</p>;
  const count = st => rows.filter(r => r.status === st).length;
  const weak = rows.filter(r => r.status === "weak").sort((a, b) => b.open - a.open || b.misses - a.misses);
  const focus = weak[0] ?? null;
  const missed = Object.entries(state.review ?? {}).filter(([, r]) => isOpen(r))
    .sort((a, b) => b[1].misses - a[1].misses).slice(0, 5)
    .map(([k, r]) => ({ q: conceptQuestion(k), r })).filter(x => x.q);
  const sorted = [...started].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || COMPUTER_JOURNEY.indexOf(a.step) - COMPUTER_JOURNEY.indexOf(b.step));
  return (
    <>
      <div className="kpis wide">
        <div className="kpi"><span>Strong</span><b>{count("strong")}</b><small>3 of 3 on the check</small></div>
        <div className="kpi"><span>Getting there</span><b>{count("ok")}</b><small>passed</small></div>
        <div className="kpi"><span>Needs practice</span><b>{count("weak")}</b><small>of {started.length} started</small></div>
        <div className="kpi"><span>In review</span><b>{Object.values(state.review ?? {}).filter(isOpen).length}</b><small>{Object.values(state.review ?? {}).filter(r => !isOpen(r)).length} mastered</small></div>
      </div>
      {focus && (
        <div className="suggest">
          <div className="eyebrow">Teach this next</div>
          <b>{focus.step.emoji} {focus.step.title}</b>
          <p className="small-note">{focus.step.parent}</p>
        </div>
      )}
      <div className="pc-table-wrap">
        <table className="pc-table concept-table">
          <thead><tr><th>Concept</th><th>How it's going</th><th>Best check</th><th>Review</th></tr></thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.step.id}>
                <td>{r.step.emoji} {r.step.title}</td>
                <td><Mastery level={r.status} label={STATUS_LABEL[r.status]} /></td>
                <td>{r.best == null ? "—" : `${r.best}/3`}{r.depth ? <small className="muted"> · {depthLabel(r.depth)}</small> : null}{r.tries > 1 ? <small className="muted"> · {r.tries} tries</small> : null}</td>
                <td>{r.open ? `${r.open} waiting` : "—"}{r.mastered ? <small className="muted"> · {r.mastered} mastered</small> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {missed.length > 0 && (
        <>
          <h3>Questions to go over together</h3>
          <ul className="missed-list">
            {missed.map(({ q, r }) => (
              <li key={q.key}>
                <b>{q.q}</b>
                <span>Answer: {rightAnswer(q)}{r.misses > 1 ? <span className="muted"> · missed {r.misses} times</span> : null}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}

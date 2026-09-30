// Small building blocks shared by every adventure step, so all steps behave the same way.
import { useState } from "react";
import { sfx } from "../../lib/sfx.js";
import { combos } from "../../lib/logic.js";

export function Choices({ options, onPick, disabled }) {
  return (
    <div className="choices">
      {options.map(o => <button key={String(o.value)} className="choice" disabled={disabled} onClick={() => onPick(o.value)}>{o.label}</button>)}
    </div>
  );
}

// Checks an answer with a sound; wrong answers get another try.
export function useAnswer() {
  const [feedback, setFeedback] = useState(null);
  const check = (ok, rightMsg = "Yes! ⭐", wrongMsg = "Not quite. Try again!") => {
    if (ok) sfx.ding(); else sfx.oops();
    setFeedback({ ok, msg: ok ? rightMsg : wrongMsg });
    return ok;
  };
  return [feedback, check, () => setFeedback(null)];
}

export function Feedback({ feedback }) {
  return feedback ? <p className={`fb-line ${feedback.ok ? "good" : "bad"}`} role="status">{feedback.msg}</p> : null;
}

// A final question for a step. Calls onRight after a correct answer.
export function Question({ q, options, right, rightMsg, wrongMsg, onRight, delay = 1300 }) {
  const [feedback, check] = useAnswer();
  return (
    <div className="stack question" style={{ gap: 10 }}>
      <p className="q-line">{q}</p>
      <Choices options={options} disabled={feedback?.ok} onPick={v => { if (check(v === right, rightMsg, wrongMsg)) setTimeout(onRight, delay); }} />
      <Feedback feedback={feedback} />
    </div>
  );
}

export function MiniLamps({ bits }) {
  return <span className="mini-lamps" aria-label={bits.map(b => (b ? 1 : 0)).join("")}>{bits.map((b, i) => <i key={i} className={b ? "on" : ""} />)}</span>;
}

export const keyOf = vals => vals.map(v => (v ? 1 : 0)).join("");

// Truth table that fills in as the child tries each combination.
export function TruthTable({ inputs, output, fn, seen, current }) {
  const rows = combos(inputs.length);
  return (
    <div className="tt-wrap">
      <table className="tt">
        <thead><tr>{inputs.map(i => <th key={i}>{i}</th>)}<th className="out">{output}</th></tr></thead>
        <tbody>
          {rows.map(r => {
            const k = keyOf(r), known = seen.has(k), res = fn(...r);
            return (
              <tr key={k} className={`${known ? "seen" : ""}${current && keyOf(current) === k ? " cur" : ""}`}>
                {r.map((v, i) => <td key={i}><MiniLamps bits={[v]} /> <b>{v ? 1 : 0}</b></td>)}
                <td className="out">{known ? <><MiniLamps bits={[res]} /> <b>{res ? 1 : 0}</b></> : <span className="muted">?</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="muted center tt-count">{seen.size} of {rows.length} rows tried</p>
    </div>
  );
}

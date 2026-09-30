import { useState } from "react";
import { HUNT, HUNT_COLS } from "../content/electricity.js";

export default function Hunt({ marks = {}, onChange }) {
  const [hints, setHints] = useState(false);
  let got = 0, total = 0;
  HUNT.forEach(([, ans], r) => ans.forEach((a, c) => { total += a; if (a && marks[`${r}-${c}`]) got++; }));
  const toggle = k => onChange({ ...marks, [k]: !marks[k] });
  return (
    <div className="stack">
      <p className="lead">Walk around the house together. For each thing, tap what it has inside. Stuck? Tap “Show hints” and a yellow dot marks the right answers.</p>
      <div className="row">
        <button className="btn" aria-pressed={hints} onClick={() => setHints(h => !h)}>{hints ? "Hide hints" : "Show hints"}</button>
        <button className="btn ghost" onClick={() => onChange({})}>Start again</button>
        <b>Found {got} of {total}</b>
      </div>
      <div className="tablebox">
        <table className="hunt">
          <thead><tr><th scope="col">Thing at home</th>{HUNT_COLS.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {HUNT.map(([name, ans], r) => (
              <tr key={name}><th scope="row">{name}</th>
                {ans.map((a, c) => {
                  const k = `${r}-${c}`, on = !!marks[k];
                  return <td key={k}><button className={`hcell${on ? " on" : ""}${hints && a ? " hint" : ""}`} aria-pressed={on} aria-label={`${name}: ${HUNT_COLS[c]}`} onClick={() => toggle(k)}>{on ? "✓" : ""}</button></td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

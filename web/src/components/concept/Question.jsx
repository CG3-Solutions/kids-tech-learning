// One question of any type, used by lesson checks, spaced review and Chip's quiz.
//   choice (default): { q, options: [text], answer, why }
//   pic:   { type: "pic", q, options: [[emoji, label]], answer, why }   picture choice
//   tf:    { type: "tf", q: "statement", answer: true | false, why }  true or false
//   order: { type: "order", q, items: [in the right order], why }   tap the steps in order
//   bug:   { type: "bug", q, lines: [program lines], bug: index, fix, why }   spot the bug
// The component asks once, shows the right answer and the one-line `why`, and calls onAnswer(ok).
import { useState } from "react";
import { e2e } from "./Games.jsx";
import Guide from "../journey/Guide.jsx";
import { sfx } from "../../lib/sfx.js";

const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
export const QUESTION_TYPES = ["choice", "pic", "tf", "order", "bug"];
export const typeOf = q => q.type ?? "choice";
export const TYPE_NAMES = { choice: "Choose", pic: "Picture choice", tf: "True or false?", order: "Put in order", bug: "Spot the bug" };

// Ready to show: options shuffled (remembering the right one); ordering steps never start in the right order.
export function prepare(q) {
  const t = typeOf(q);
  if (t === "choice" || t === "pic") {
    const order = shuffle(q.options.map((_, i) => i));
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  }
  if (t === "order") {
    let start = shuffle(q.items.map((_, i) => i));
    if (start.every((x, i) => x === i)) start = [...start.slice(1), start[0]];
    return { ...q, start };
  }
  return q;
}

// The right answer in words, for the explanation line.
export function rightAnswer(q) {
  const t = typeOf(q);
  if (t === "tf") return q.answer ? "True" : "False";
  if (t === "pic") return q.options[q.answer][1];
  if (t === "order") return q.items.join(" → ");
  if (t === "bug") return `line ${q.bug + 1}: “${q.lines[q.bug]}”`;
  return q.options[q.answer];
}

function Why({ ok, q }) {
  const t = typeOf(q);
  return (
    <div className={`check-why ${ok ? "ok" : "bad"}`} role="status">
      <b>{ok ? "✓ Right!" : t === "order" ? "✗ The right order is:" : t === "bug" ? `✗ The bug is ${rightAnswer(q)}.` : `✗ The answer is: ${rightAnswer(q)}.`}</b>
      {!ok && t === "order" && <ol className="order-done right-order">{q.items.map(s => <li key={s}>{s}</li>)}</ol>}
      {" "}{q.why}{t === "bug" && q.fix ? <> Fixed: <b>“{q.fix}”</b></> : null}
    </div>
  );
}

function Choices({ q, pick, onPick }) {
  const pic = typeOf(q) === "pic";
  return (
    <div className={`check-opts${pic ? " pic-opts" : ""}`}>
      {q.options.map((o, k) => (
        <button key={pic ? o[1] : o} {...(e2e() && k === q.answer ? { "data-right": "1" } : {})}
          className={`check-opt${pic ? " pic" : ""}${pick == null ? "" : k === q.answer ? " right" : k === pick ? " wrong" : " faded"}`}
          onClick={() => onPick(k)} disabled={pick != null}>
          {pic ? <><span className="pic-e" aria-hidden="true">{o[0]}</span><span>{o[1]}</span></> : o}
        </button>
      ))}
    </div>
  );
}

function TrueFalse({ q, pick, onPick }) {
  return (
    <div className="check-opts tf-opts">
      {[true, false].map(v => (
        <button key={String(v)} {...(e2e() && v === q.answer ? { "data-right": "1" } : {})}
          className={`check-opt tf${pick == null ? "" : v === q.answer ? " right" : v === pick ? " wrong" : " faded"}`}
          onClick={() => onPick(v)} disabled={pick != null}>{v ? "👍 True" : "👎 False"}</button>
      ))}
    </div>
  );
}

function Order({ q, done, onDone }) {
  const [got, setGot] = useState([]);
  const tap = i => {
    sfx.click();
    const n = [...got, i];
    setGot(n);
    if (n.length === q.items.length) onDone(n.every((x, k) => x === k));
  };
  return (
    <div className="stack" style={{ gap: 10 }}>
      <ol className={`order-done${done ? (got.every((x, k) => x === k) ? " ok" : " bad") : ""}`} aria-label="Your order">
        {got.map(i => <li key={i}>{q.items[i]}</li>)}
        {!done && got.length < q.items.length && <li className="order-next" aria-hidden="true">…</li>}
      </ol>
      {!done && (
        <>
          <div className="sort-pool">{q.start.filter(i => !got.includes(i)).map(i => (
            <button key={i} className="sort-item" onClick={() => tap(i)} {...(e2e() ? { "data-order": i } : {})}>{q.items[i]}</button>
          ))}</div>
          {got.length > 0 && <div><button className="btn ghost small" onClick={() => setGot(got.slice(0, -1))}>↩ Undo</button></div>}
        </>
      )}
    </div>
  );
}

function Bug({ q, pick, onPick }) {
  return (
    <ol className="bug-prog" aria-label="The program">
      {q.lines.map((l, k) => (
        <li key={k}>
          <button {...(e2e() && k === q.bug ? { "data-right": "1" } : {})} disabled={pick != null} onClick={() => onPick(k)}
            className={pick == null ? "" : k === q.bug ? "right" : k === pick ? "wrong" : "faded"}>
            <span className="ln">{k + 1}</span>{l}{pick != null && k === q.bug ? <span className="bug-tag">🐞 bug</span> : null}
          </button>
        </li>
      ))}
    </ol>
  );
}

const HINTS = { order: "Tap the steps in the right order.", bug: "Tap the line with the mistake.", tf: "Is this true or false?" };

// `q` must come from prepare(). Keyed by the parent, so a new question starts fresh.
export default function Question({ q, Face, onAnswer }) {
  const [pick, setPick] = useState(null);
  const [ok, setOk] = useState(null);
  const t = typeOf(q);
  const answer = (p, right) => {
    if (ok != null) return;
    setPick(p); setOk(right);
    right ? sfx.ding() : sfx.oops();
    onAnswer(right);
  };
  const say = t === "tf" ? `True or false? ${q.q}` : q.q;
  return (
    <div className="stack question" data-qtype={t}>
      {t !== "choice" && <span className="q-type">{TYPE_NAMES[t]}</span>}
      {Face ? <Guide Face={Face} say={say}>{q.q}</Guide> : <h3>{q.q}</h3>}
      {HINTS[t] && ok == null && <p className="muted small-note">{HINTS[t]}</p>}
      {(t === "choice" || t === "pic") && <Choices q={q} pick={pick} onPick={k => answer(k, k === q.answer)} />}
      {t === "tf" && <TrueFalse q={q} pick={pick} onPick={v => answer(v, v === q.answer)} />}
      {t === "order" && <Order q={q} done={ok != null} onDone={right => answer(true, right)} />}
      {t === "bug" && <Bug q={q} pick={pick} onPick={k => answer(k, k === q.bug)} />}
      {ok != null && <Why ok={ok} q={q} />}
    </div>
  );
}

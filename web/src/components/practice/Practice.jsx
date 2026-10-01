// The practice engine: runs `count` generated questions for a step, with hints and a score.
import { useEffect, useMemo, useRef, useState } from "react";
import Guide from "../journey/Guide.jsx";
import Visual from "./Visual.jsx";
import { sfx } from "../../lib/sfx.js";
import { speak } from "../../lib/speech.js";

const valueOf = o => (typeof o === "object" ? o.value : o);
const labelOf = o => (typeof o === "object" ? o.label : o);
const sameNumber = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-6;
const PRAISE = ["Yes! ⭐", "Brilliant! ⭐", "Super! ⭐", "Correct! ⭐", "Well done! ⭐", "You got it! ⭐"];
const fmt = (q, v) => `${q.unit ?? ""}${v}`;
// Automated browser tests read the answer from the page, only when a test-only flag is set.
const testHook = (q, label) => { try { return localStorage.getItem("sparklab.e2e") === "1" ? { "data-answer": JSON.stringify({ type: q.type, answer: q.answer, label }) } : {}; } catch { return {}; } };

function NumberPad({ value, setValue, onSubmit, allowNegative, disabled }) {
  const press = k => {
    if (disabled) return;
    sfx.click();
    if (k === "⌫") setValue(v => v.slice(0, -1));
    else if (k === "−") setValue(v => (v.startsWith("-") ? v.slice(1) : `-${v}`));
    else if (k === ".") setValue(v => (v.includes(".") ? v : `${v || "0"}.`));
    else setValue(v => (v.length < 9 ? v + k : v));
  };
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", allowNegative ? "−" : ".", "0", "⌫"];
  return (
    <form className="numpad" onSubmit={e => { e.preventDefault(); if (value !== "" && value !== "-") onSubmit(); }}>
      <label className="sr-only" htmlFor="answer">Your answer</label>
      <input id="answer" className="num-display" inputMode="decimal" autoComplete="off" value={value.replace("-", "−")} disabled={disabled}
        onChange={e => setValue(e.target.value.replace("−", "-").replace(/[^0-9.\-]/g, ""))} placeholder="?" />
      <div className="keys">{keys.map(k => <button type="button" key={k} className="key" onClick={() => press(k)} disabled={disabled}>{k}</button>)}</div>
      <button className="btn primary big" type="submit" disabled={disabled || value === "" || value === "-"}>✓ Check</button>
    </form>
  );
}

function OrderTiles({ q, onSubmit, disabled }) {
  const [picked, setPicked] = useState([]); // indexes into q.tiles
  useEffect(() => setPicked([]), [q]);
  const full = picked.length === q.tiles.length;
  return (
    <div className="order">
      <div className={`order-answer${q.joiner === "" ? " tight" : ""}`} aria-label="Your answer">
        {picked.length === 0 && <span className="muted">Tap the tiles below in order</span>}
        {picked.map((ti, i) => <button key={i} className="tile-btn in" disabled={disabled} onClick={() => { sfx.click(); setPicked(p => p.filter((_, j) => j !== i)); }}>{q.tiles[ti]}</button>)}
      </div>
      <div className="order-pool">
        {q.tiles.map((t, i) => <button key={i} className="tile-btn" disabled={disabled || picked.includes(i)} onClick={() => { sfx.click(); setPicked(p => [...p, i]); }}>{t}</button>)}
      </div>
      <div className="row center-row">
        <button className="btn ghost" disabled={disabled || !picked.length} onClick={() => setPicked([])}>Clear</button>
        <button className="btn primary big" disabled={disabled || !full} onClick={() => onSubmit(picked.map(i => q.tiles[i]))}>✓ Check</button>
      </div>
    </div>
  );
}

export default function Practice({ spec, grade, onComplete, Face }) {
  const seen = useRef(new Set());
  const fresh = () => {
    let q;
    for (let i = 0; i < 12; i++) { q = spec.gen(grade); const k = `${q.prompt}|${JSON.stringify(q.answer)}`; if (!seen.current.has(k)) { seen.current.add(k); break; } }
    return q;
  };
  const [i, setI] = useState(0);
  const [q, setQ] = useState(fresh);
  const [tries, setTries] = useState(0);
  const [status, setStatus] = useState(null); // null | "right" | "wrong" | "reveal"
  const [firstTry, setFirstTry] = useState(0);
  const [num, setNum] = useState("");
  const [finished, setFinished] = useState(false);
  const praise = useMemo(() => PRAISE[Math.floor(Math.random() * PRAISE.length)], [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const next = () => {
    if (i + 1 >= spec.count) { setFinished(true); sfx.tada(); return; }
    setI(i + 1); setQ(fresh()); setTries(0); setStatus(null); setNum("");
  };
  const check = given => {
    const ok = q.type === "number" ? sameNumber(Number(given), q.answer)
      : q.type === "order" ? given.join(q.joiner) === q.answer.join(q.joiner)
      : String(given) === String(q.answer);
    if (ok) { sfx.ding(); setStatus("right"); if (tries === 0) setFirstTry(f => f + 1); setTimeout(next, 1100); }
    else if (tries === 0) { sfx.oops(); setTries(1); setStatus("wrong"); }
    else { sfx.oops(); setStatus("reveal"); }
  };
  const answerText = q.type === "order" ? q.answer.join(q.joiner) : q.type === "choice" ? labelOf(q.options.find(o => String(valueOf(o)) === String(q.answer)) ?? q.answer) : fmt(q, q.answer);
  const locked = status === "right" || status === "reveal";

  if (finished) {
    const stars = firstTry >= spec.count * 0.9 ? 3 : firstTry >= spec.count * 0.6 ? 2 : 1;
    return (
      <div className="step-body center">
        <Guide Face={Face} mood="cheer">{`You got ${firstTry} out of ${spec.count} right first time!`}</Guide>
        <div className="stars-row" aria-label={`${stars} of 3 stars`}>{[1, 2, 3].map(s => <span key={s} className={s <= stars ? "on" : ""}>★</span>)}</div>
        <div className="row center-row"><button className="btn primary big" onClick={onComplete}>Finish ⭐</button></div>
      </div>
    );
  }

  const bubble = status === "right" ? praise
    : status === "wrong" ? `Not quite. ${q.hint ?? "Try again!"}`
    : status === "reveal" ? `The answer is ${answerText}. Let's keep going!`
    : i === 0 && spec.intro ? spec.intro : q.say ?? q.prompt;
  return (
    <div className="step-body practice">
      <div className="practice-top">
        <div className="progress"><i style={{ width: `${(i / spec.count) * 100}%` }} /></div>
        <span className="muted">Question {i + 1} of {spec.count}</span>
      </div>
      <Guide Face={Face} mood={status === "right" ? "cheer" : status ? "wow" : "happy"}>{bubble}</Guide>
      <div className="q-card" {...testHook(q, answerText)}>
        <div className={`q-prompt${q.bigPrompt || q.big ? " big" : ""}`}>
          {q.prompt}
          <button className="btn ghost small hear" onClick={() => speak(q.say ?? q.prompt, { force: true })} aria-label="Read the question aloud">🔊</button>
        </div>
        <Visual v={q.visual} />
        {q.type === "choice" && (
          <div className={`choices${q.big ? " letters" : ""}`}>
            {q.options.map(o => {
              const v = valueOf(o), isAns = String(v) === String(q.answer);
              return <button key={String(v)} className={`choice${locked && isAns ? " right" : ""}`} disabled={locked} onClick={() => check(v)}>{labelOf(o)}</button>;
            })}
          </div>
        )}
        {q.type === "number" && <NumberPad value={num} setValue={setNum} onSubmit={() => check(num)} allowNegative={q.allowNegative} disabled={locked} />}
        {q.type === "order" && <OrderTiles q={q} onSubmit={check} disabled={locked} />}
        {status === "reveal" && <div className="row center-row"><button className="btn primary big" onClick={next}>Next →</button></div>}
      </div>
    </div>
  );
}

// Learning cards: tap each item to hear it; finish when all have been seen.
export function LearnCards({ spec, onComplete, Face }) {
  const [open, setOpen] = useState(null);
  const [seen, setSeen] = useState(new Set());
  const show = it => { setOpen(it); setSeen(s => new Set(s).add(it.big)); speak(it.say, { force: true }); sfx.click(); };
  const all = seen.size === spec.items.length;
  return (
    <div className="step-body">
      <Guide Face={Face} mood={all ? "cheer" : "happy"}>{all ? "You met every letter! Ready for the next step?" : "Tap every letter to hear it and see its word."}</Guide>
      <p className="muted center">{seen.size} of {spec.items.length} letters heard</p>
      {open && (
        <div className="learn-big" aria-live="polite">
          <span className="lb-letter">{open.big}<small>{open.small}</small></span>
          <span className="lb-emoji" aria-hidden="true">{open.emoji}</span>
          <span className="lb-word"><b>{open.big}</b>{open.word.slice(1)}</span>
          <button className="btn ghost small" onClick={() => speak(open.say, { force: true })}>🔊 Hear again</button>
        </div>
      )}
      <div className="learn-grid">
        {spec.items.map(it => (
          <button key={it.big} className={`learn-tile${seen.has(it.big) ? " seen" : ""}${open?.big === it.big ? " open" : ""}`} onClick={() => show(it)} aria-label={`${it.big} for ${it.word}`}>
            <b>{it.big}{it.small}</b><span aria-hidden="true">{it.emoji}</span>
          </button>
        ))}
      </div>
      {all && <div className="row center-row"><button className="btn primary big" onClick={onComplete}>I know these! ⭐</button></div>}
    </div>
  );
}

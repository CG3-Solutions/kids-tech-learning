// One concept as six short screens: Hook → Explain → See it → Do it → Check → Recap.
// The star comes only from the Check: at least 2 of 3 right. A wrong answer always gets a
// one-line explanation. Reusable for any subject: pass a concept `spec` (see content/computer.js).
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Guide from "../journey/Guide.jsx";
import { SeeIt } from "./Anims.jsx";
import { DoIt, e2e } from "./Games.jsx";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

export const SCREENS = [["hook", "Think"], ["explain", "Learn"], ["see", "See it"], ["doit", "Do it"], ["check", "Check"], ["recap", "Recap"]];
export const PASS = 2; // correct answers needed out of 3

const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
// Options in a random order, remembering which one is right.
export const mixQuestion = q => {
  const order = shuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
};

function Hook({ spec, Face, onNext }) {
  const [pick, setPick] = useState(null);
  const h = spec.hook;
  return (
    <div className="stack">
      <Guide Face={Face} say={pick == null ? h.q : h.reveal} mood={pick == null ? "wow" : "cheer"}>{pick == null ? h.q : h.reveal}</Guide>
      {pick == null ? (
        <div className="hook-choices">{h.choices.map((c, i) => <button key={c} className="btn big" onClick={() => { sfx.click(); setPick(i); }}>{c}</button>)}</div>
      ) : (
        <>
          <p className="muted">{pick === h.answer ? "You guessed it! 🎉" : "Good thinking! Now you know."}</p>
          <div><button className="btn primary big" onClick={onNext}>Let's learn →</button></div>
        </>
      )}
    </div>
  );
}

// The concept at a depth: 0 = Class 1–3 (the base), 1 = Class 4–7, 2 = Class 8–12.
// Deeper levels replace the Learn text and the Check questions, and add recap points.
export const DEPTH_IDS = ["base", "mid", "high"];
export const DEPTH_LABELS = ["Class 1–3", "Class 4–7", "Class 8–12"];
export const depthsOf = spec => [0, ...[1, 2].filter(d => spec.deeper?.[DEPTH_IDS[d]])];
export function atDepth(spec, d) {
  const deep = d > 0 ? spec.deeper?.[DEPTH_IDS[d]] : null;
  if (!deep) return spec;
  return { ...spec, explain: { text: deep.text, like: deep.like ?? spec.explain.like }, check: deep.check, recap: { ...spec.recap, points: [...spec.recap.points, ...deep.points] } };
}

function DepthBar({ depth, depths, setDepth }) {
  if (depths.length < 2) return null;
  const i = depths.indexOf(depth);
  return (
    <div className="depth-bar">
      <span className="depth-chip">📚 Level: <b>{DEPTH_LABELS[depth]}</b></span>
      {i > 0 && <button className="btn ghost small" onClick={() => setDepth(depths[i - 1])}>⬆ Simpler</button>}
      {i < depths.length - 1 && <button className="btn small" onClick={() => setDepth(depths[i + 1])}>Go deeper ⬇ <small>({DEPTH_LABELS[depths[i + 1]]})</small></button>}
    </div>
  );
}

function Explain({ spec, Face, onNext, depthBar }) {
  const e = spec.explain;
  return (
    <div className="stack">
      {depthBar}
      <Guide Face={Face} say={`${e.text.join(" ")} It's like ${e.like}`}>{e.text[0]}</Guide>
      {e.text.slice(1).map(t => <p key={t} className="lead strong-lead">{t}</p>)}
      <div className="like-box"><b>It's like…</b><p>{e.like}</p></div>
      <div><button className="btn primary big" onClick={onNext}>See it →</button></div>
    </div>
  );
}

function Check({ spec, Face, onPass, onAgain, onResult }) {
  const [qs, setQs] = useState(() => spec.check.map(mixQuestion));
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = qs[i];
  const answer = k => {
    if (pick != null) return;
    setPick(k);
    if (k === q.answer) { sfx.ding(); setScore(s => s + 1); } else sfx.oops();
  };
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); setPick(null); return; }
    setDone(true);
    onResult(score, qs.length);
    if (score >= PASS) sfx.tada();
  };
  const retry = () => { setQs(spec.check.map(mixQuestion)); setI(0); setPick(null); setScore(0); setDone(false); };
  if (done) {
    const passed = score >= PASS;
    return (
      <div className="stack">
        <Guide Face={Face} mood={passed ? "cheer" : "sad"} say={passed ? `${score} out of ${qs.length}! You've got it.` : `${score} out of ${qs.length}. Let's look at it again, then try once more.`}>
          {passed ? `${"⭐".repeat(score)} ${score} out of ${qs.length}! You've got it.` : `${score} out of ${qs.length}. You need ${PASS} to pass. Let's look again!`}
        </Guide>
        <div className="row">
          {passed ? <button className="btn primary big" onClick={onPass}>Recap →</button> : <>
            <button className="btn primary big" onClick={retry}>↻ Try the check again</button>
            <button className="btn" onClick={onAgain}>📖 Learn it again</button>
          </>}
        </div>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="eyebrow">Question {i + 1} of {qs.length}</div>
      <Guide Face={Face} say={q.q}>{q.q}</Guide>
      <div className="check-opts">
        {q.options.map((o, k) => (
          <button key={o} {...(e2e() && k === q.answer ? { "data-right": "1" } : {})} className={`check-opt${pick == null ? "" : k === q.answer ? " right" : k === pick ? " wrong" : " faded"}`} onClick={() => answer(k)} disabled={pick != null}>{o}</button>
        ))}
      </div>
      {pick != null && (
        <div className={`check-why ${pick === q.answer ? "ok" : "bad"}`} role="status">
          <b>{pick === q.answer ? "✓ Right!" : `✗ The answer is: ${q.options[q.answer]}.`}</b> {q.why}
        </div>
      )}
      {pick != null && <div><button className="btn primary" onClick={next}>{i + 1 < qs.length ? "Next question →" : "See my score →"}</button></div>}
    </div>
  );
}

function Recap({ spec, onFinish, onDeeper, deeperLabel }) {
  const r = spec.recap;
  return (
    <div className="stack">
      <div className="recap-box">
        <h3>⭐ What you learned</h3>
        <ul>{r.points.map(p => <li key={p}>{p}</li>)}</ul>
      </div>
      <div className="recap-grid">
        <div className="blk"><h4>Find it around you</h4><ul className="places">{r.find.map(f => <li key={f}>{f}</li>)}</ul></div>
        <div className="blk"><h4>Try it at home</h4><p>{r.tryit}</p></div>
      </div>
      {spec.links?.length > 0 && (
        <div className="links-box">
          <b>You'll use this in…</b>
          {spec.links.map(l => <Link key={l.to} className="link-chip" to={`/learn/${l.to}`} onClick={hush}>{l.label} <small>({l.why})</small></Link>)}
        </div>
      )}
      <div className="row">
        <button className="btn primary big" onClick={onFinish}>Finish the step ⭐</button>
        {onDeeper && <button className="btn" onClick={onDeeper}>Go deeper ⬇ <small>({deeperLabel})</small></button>}
      </div>
    </div>
  );
}

// `level`: the depth to start at (from the learner's class). The star needs the check passed at any depth.
export default function ConceptLesson({ spec: base, Face, onComplete, onCheck, level = 0 }) {
  const depths = depthsOf(base);
  const [depth, setDepthState] = useState(depths.includes(level) ? level : depths.filter(d => d <= level).at(-1) ?? 0);
  const spec = useMemo(() => atDepth(base, depth), [base, depth]);
  const [at, setAt] = useState(0);
  const [doitDone, setDoitDone] = useState(false);
  const [checked, setChecked] = useState(false);
  const go = n => { hush(); setAt(n); window.scrollTo({ top: 0 }); };
  const key = SCREENS[at][0];
  // A screen you can jump back to: anything up to the furthest one reached (the check must be passed to see the recap).
  const [reached, setReached] = useState(0);
  const move = n => { setReached(r => Math.max(r, n)); go(n); };
  const canGo = n => n <= reached && (n < 5 || checked);
  const body = useMemo(() => ({ spec, Face }), [spec, Face]);
  const setDepth = d => { hush(); setDepthState(d); };
  const depthBar = <DepthBar depth={depth} depths={depths} setDepth={setDepth} />;
  const deeper = depths[depths.indexOf(depth) + 1];
  return (
    <div className="stack concept">
      <ol className="lesson-dots" aria-label="Lesson steps">
        {SCREENS.map(([k, label], n) => (
          <li key={k} className={n === at ? "on" : n < reached || (n === 4 && checked) ? "done" : ""}>
            <button disabled={!canGo(n) || n === at} onClick={() => go(n)} aria-current={n === at ? "step" : undefined}>{n + 1}. {label}</button>
          </li>
        ))}
      </ol>
      {key === "hook" && <Hook {...body} onNext={() => move(1)} />}
      {key === "explain" && <Explain {...body} depthBar={depthBar} onNext={() => move(2)} />}
      {key === "see" && (
        <div className="stack">
          <SeeIt see={spec.see} />
          <div><button className="btn primary big" onClick={() => move(3)}>Try it yourself →</button></div>
        </div>
      )}
      {key === "doit" && (
        <div className="stack">
          <DoIt doit={spec.doit} onDone={() => setDoitDone(true)} />
          <div className="row"><button className="btn primary big" disabled={!doitDone} onClick={() => move(4)}>Check what you know →</button>
            {!doitDone && <span className="muted">Finish the activity first</span>}</div>
        </div>
      )}
      {key === "check" && <Check key={depth} {...body} onResult={(s, t) => { if (s >= PASS) setChecked(true); onCheck?.(s, t, DEPTH_IDS[depth]); }} onPass={() => move(5)} onAgain={() => go(1)} />}
      {key === "recap" && <Recap spec={spec} onFinish={onComplete} deeperLabel={deeper != null ? DEPTH_LABELS[deeper] : null}
        onDeeper={deeper != null ? () => { setDepth(deeper); setReached(r => Math.max(r, 1)); go(1); } : null} />}
    </div>
  );
}

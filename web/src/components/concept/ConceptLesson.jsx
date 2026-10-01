// One concept as six short screens: Hook → Explain → See it → Do it → Check → Recap.
// The star comes only from the Check: at least 2 of 3 right. A wrong answer always gets a
// one-line explanation. Reusable for any subject: pass a concept `spec` (see content/computer.js).
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Guide from "../journey/Guide.jsx";
import { SeeIt } from "./Anims.jsx";
import { DoIt } from "./Games.jsx";
import Question, { prepare } from "./Question.jsx";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

export const SCREENS = [["hook", "Think"], ["explain", "Learn"], ["see", "See it"], ["doit", "Do it"], ["check", "Check"], ["recap", "Recap"]];
export const PASS = 2; // correct answers needed out of 3

export const mixQuestion = prepare; // options in a random order, remembering which one is right

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
// Check questions get a key ("comp-step-6:mid:1") so a missed one can come back in spaced review.
const keyed = (spec, where, check) => check.map((q, i) => ({ ...q, key: `${spec.id}:${where}:${i}` }));
export function atDepth(spec, d) {
  const deep = d > 0 ? spec.deeper?.[DEPTH_IDS[d]] : null;
  if (!deep) return { ...spec, check: keyed(spec, "base", spec.check) };
  return { ...spec, explain: { text: deep.text, like: deep.like ?? spec.explain.like }, check: keyed(spec, DEPTH_IDS[d], deep.check), recap: { ...spec.recap, points: [...spec.recap.points, ...deep.points] } };
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

// "A super-fast helper" → "a super-fast helper" after "It's like" (but keep "CPU…" as it is).
const lowerFirst = t => (/^[A-Z][a-z]/.test(t) ? t[0].toLowerCase() + t.slice(1) : t);

function Explain({ spec, Face, onNext, depthBar }) {
  const e = spec.explain;
  return (
    <div className="stack">
      {depthBar}
      <Guide Face={Face} say={`${e.text.join(" ")} It's like ${lowerFirst(e.like)}`}>{e.text[0]}</Guide>
      {e.text.slice(1).map(t => <p key={t} className="lead strong-lead">{t}</p>)}
      <div className="like-box"><b>It's like…</b><p>{e.like}</p></div>
      <div><button className="btn primary big" onClick={onNext}>See it →</button></div>
    </div>
  );
}

// Three questions (any type, see Question.jsx). Each wrong answer is passed to onMiss for spaced review.
function Check({ spec, Face, onPass, onAgain, onResult, onMiss }) {
  const fresh = () => spec.check.map(prepare);
  const [qs, setQs] = useState(fresh);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const q = qs[i];
  const answer = ok => {
    setAnswered(true);
    if (ok) setScore(s => s + 1); else onMiss?.(q.key);
  };
  const next = () => {
    if (i + 1 < qs.length) { setI(i + 1); setAnswered(false); return; }
    setDone(true);
    onResult(score, qs.length);
    if (score >= PASS) sfx.tada();
  };
  const retry = () => { setQs(fresh()); setI(0); setAnswered(false); setScore(0); setDone(false); setRound(r => r + 1); };
  if (done) {
    const passed = score >= PASS;
    return (
      <div className="stack">
        <Guide Face={Face} mood={passed ? "cheer" : "sad"} say={passed ? `${score} out of ${qs.length}! You've got it.` : `${score} out of ${qs.length}. Let's look at it again, then try once more.`}>
          {passed ? `${"⭐".repeat(score)} ${score} out of ${qs.length}! You've got it.` : `${score} out of ${qs.length}. You need ${PASS} to pass. Let's look again!`}
        </Guide>
        {score < qs.length && <p className="muted">🔁 Chip saved the question{qs.length - score > 1 ? "s" : ""} you missed. {qs.length - score > 1 ? "They'll" : "It'll"} come back for review tomorrow.</p>}
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
      <Question key={`${round}-${i}`} q={q} Face={Face} onAnswer={answer} />
      {answered && <div><button className="btn primary" onClick={next}>{i + 1 < qs.length ? "Next question →" : "See my score →"}</button></div>}
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
// `onMiss(key)`: a check question answered wrongly (for spaced review).
export default function ConceptLesson({ spec: base, Face, onComplete, onCheck, onMiss, level = 0 }) {
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
      {key === "check" && <Check key={depth} {...body} onMiss={onMiss} onResult={(s, t) => { if (s >= PASS) setChecked(true); onCheck?.(s, t, DEPTH_IDS[depth]); }} onPass={() => move(5)} onAgain={() => go(1)} />}
      {key === "recap" && <Recap spec={spec} onFinish={onComplete} deeperLabel={deeper != null ? DEPTH_LABELS[deeper] : null}
        onDeeper={deeper != null ? () => { setDepth(deeper); setReached(r => Math.max(r, 1)); go(1); } : null} />}
    </div>
  );
}

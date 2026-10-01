import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Guide, { KeyoFace } from "../../components/journey/Guide.jsx";
import { Keyboard, Hands } from "./Keyboard.jsx";
import { goalFor, lessonText, starsFor } from "../../content/typing.js";
import { finished, pause, press, results, startTyping, weakKeys } from "../../lib/typing.js";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const isTouchOnly = () => typeof window !== "undefined" && window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
const pct = n => `${n}%`;
const goalText = g => `${g.acc}% accuracy${g.wpm ? ` and ${g.wpm} words a minute` : ""}`;
const show = c => (c === " " ? "space" : c === ";" ? ";" : c.toUpperCase());

// The text to type: done letters, the cursor, and what's still to come.
function TextStrip({ s, big }) {
  const words = useMemo(() => s.text.match(/[^ ]+ ?| /g) ?? [], [s.text]);
  let i = 0;
  return (
    <div className={`type-text${big ? " big" : ""}`} data-text={s.text} aria-label={`Type: ${s.text}`}>
      {words.map((w, wi) => (
        <span key={wi} className="tw">
          {[...w].map(ch => {
            const at = i++;
            const cls = at < s.pos ? (s.misses[at] ? "fixed" : "ok") : at === s.pos ? `cur${s.wrong ? " err" : ""}` : "";
            return <span key={at} className={`tc ${cls}${ch === " " ? " sp" : ""}`}>{ch === " " ? " " : ch}</span>;
          })}
        </span>
      ))}
    </div>
  );
}

function Results({ lesson, mode, r, stars, next, onNext, onAgain, onBack }) {
  const kids = mode !== "pro";
  const g = goalFor(lesson, mode);
  const passed = stars > 0;
  const weak = weakKeys(r.keys, 3);
  const why = !passed && (r.accuracy < g.acc ? `Accuracy ${r.accuracy}% (goal ${g.acc}%). Slow down a little: being right matters more than being fast.` : `Speed ${r.wpm} words a minute (goal ${g.wpm}). Keep a steady rhythm and try again.`);
  const say = passed
    ? `${["", "Good job", "Great typing", "Amazing"][stars]}! ${r.wpm} words a minute, and ${r.accuracy} percent right. ${stars} ${stars === 1 ? "star" : "stars"}!`
    : `Nice try! ${r.accuracy < g.acc ? "Go a bit slower and press each key carefully." : "Keep a steady rhythm."} Let's try again.`;
  return (
    <div className="stack type-results">
      {kids && <Guide Face={KeyoFace} mood={passed ? "cheer" : "sad"} say={say}>{passed ? `${"⭐".repeat(stars)} ${say.split("!")[0]}!` : say}</Guide>}
      <div className="kpis type-kpis">
        <div className="kpi"><span>Speed</span><b>{r.wpm}</b><small>words a minute{g.wpm ? ` · goal ${g.wpm}` : ""}</small></div>
        <div className="kpi"><span>Accuracy</span><b>{pct(r.accuracy)}</b><small>goal {g.acc}%</small></div>
        <div className="kpi"><span>Time</span><b>{r.seconds < 60 ? `${r.seconds}s` : `${Math.floor(r.seconds / 60)}m ${r.seconds % 60}s`}</b><small>{r.chars} keys · {r.errors} {r.errors === 1 ? "mistake" : "mistakes"}</small></div>
        <div className="kpi"><span>Result</span><b>{passed ? "⭐".repeat(stars) : "Not yet"}</b><small>{passed ? "lesson passed" : `need ${goalText(g)}`}</small></div>
      </div>
      {why && <p className="type-why" role="status">{why}</p>}
      {weak.length > 0 && <p className="muted">Keys to practise: {weak.map(w => <kbd key={w.key} className="kbd">{show(w.key)}</kbd>)}</p>}
      <div className="row">
        {passed && next && <button className="btn primary big" onClick={onNext}>Next: {next.title} →</button>}
        <button className={`btn ${passed ? "ghost" : "primary big"}`} onClick={onAgain}>↻ Try again</button>
        <button className="btn ghost" onClick={onBack}>All lessons</button>
      </div>
    </div>
  );
}

// One typing lesson: a short intro, the typing screen, then results.
export default function TypingLesson({ lesson, mode, taught, next, onFinish, onNext, onBack }) {
  const kids = mode !== "pro";
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState("intro");
  const [s, setS] = useState(() => startTyping(lessonText(lesson, mode)));
  const [caps, setCaps] = useState(false);
  const [done, setDone] = useState(null);
  const input = useRef("keyboard");
  const touchOnly = useMemo(isTouchOnly, []);
  useEffect(() => () => hush(), []);

  const begin = () => { hush(); setPhase("typing"); };
  const again = () => {
    hush(); input.current = "keyboard";
    update(startTyping(lessonText(lesson, mode))); setDone(null); setPhase("typing"); setRun(r => r + 1);
  };

  // The latest state lives in a ref too, so very fast typing never loses a key between renders.
  const cur = useRef(s);
  const update = n => { cur.current = n; setS(n); };
  const hit = useCallback((key, how) => {
    if (how === "touch") input.current = "touch";
    const n = press(cur.current, key, performance.now());
    if (n.wrong && kids) sfx.bump();
    update(n);
  }, [kids]);

  // Keys come from the whole page while typing, so the learner doesn't have to click a box first.
  useEffect(() => {
    if (phase === "done") return;
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (e.target?.closest?.("input, textarea, select, [contenteditable], [role=dialog], dialog")) return;
      if (phase === "intro") { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } return; }
      if (e.key.length !== 1) return;
      e.preventDefault();
      if (e.repeat) return;
      const capsOn = e.getModifierState?.("CapsLock") ?? false;
      setCaps(capsOn);
      // Caps Lock turns every letter into a capital; tell the learner instead of counting mistakes.
      if (capsOn && e.key !== e.key.toLowerCase()) return;
      hit(e.key, "keyboard");
    };
    const onHide = () => { if (document.hidden) update(pause(cur.current)); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHide);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", onHide); };
  }, [phase, hit]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== "typing" || !finished(s)) return;
    const r = results(s);
    const stars = starsFor(lesson, mode, r);
    setDone({ r, stars });
    setPhase("done");
    if (stars) sfx.tada(); else sfx.oops();
    onFinish({ r, stars, input: input.current });
  }, [s, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const nextKey = s.text[s.pos];
  const live = results(s);
  const progress = Math.round((s.pos / s.text.length) * 100);
  const g = goalFor(lesson, mode);

  if (phase === "intro") {
    return (
      <div className="stack type-intro">
        {kids ? <Guide Face={KeyoFace} say={lesson.say}>{lesson.intro}</Guide> : <p className="lead pro-intro">{lesson.intro}</p>}
        {lesson.tips && (
          <ul className="type-tips">{lesson.tips.map(([e, t]) => <li key={t}><span aria-hidden="true">{e}</span>{t}</li>)}</ul>
        )}
        <p className="muted">Goal: {goalText(g)}.</p>
        {touchOnly && <p className="type-note" role="note">⌨️ Typing works best with a real keyboard. On a tablet, connect a Bluetooth keyboard. You can still tap the keys on screen to learn where they are.</p>}
        <div className="row"><button className="btn primary big" onClick={begin} autoFocus>Start typing</button><span className="muted">or press Enter</span></div>
      </div>
    );
  }

  if (phase === "done") {
    return <Results lesson={lesson} mode={mode} r={done.r} stars={done.stars} next={next} onNext={onNext} onAgain={again} onBack={onBack} />;
  }

  return (
    <div className={`stack type-screen ${kids ? "kids" : "pro"}`} key={run}>
      <div className="type-stats" aria-live="off">
        {kids ? (
          <div className="type-progress" aria-label={`${progress}% done`}><i style={{ width: `${progress}%` }} /></div>
        ) : (
          <>
            <span><b>{live.wpm}</b> wpm</span>
            <span><b>{live.accuracy}</b>% accuracy</span>
            <span><b>{live.seconds}</b>s</span>
            <div className="type-progress" aria-label={`${progress}% done`}><i style={{ width: `${progress}%` }} /></div>
          </>
        )}
      </div>
      {caps && <p className="type-note" role="alert">Caps Lock is on. Press the Caps Lock key to turn it off.</p>}
      <TextStrip s={s} big={kids} />
      <Keyboard next={nextKey} wrong={s.wrong} taught={taught} onTap={touchOnly ? c => hit(c, "touch") : null} />
      <Hands next={nextKey} mode={mode} />
    </div>
  );
}

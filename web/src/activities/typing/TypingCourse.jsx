import { useEffect, useMemo, useState } from "react";
import { KeyoFace } from "../../components/journey/Guide.jsx";
import { isUnlocked } from "../../components/journey/Journey.jsx";
import TypingLesson from "./TypingLesson.jsx";
import SpeedLadder from "./SpeedLadder.jsx";
import Games from "./Games.jsx";
import { TYPING_JOURNEY, TYPING_PARTS, LADDER, defaultMode, starsFor, gamesOpen, gamePool } from "../../content/typing.js";
import { typingSummary, fmtMinutes } from "../../lib/typing.js";
import { useApp } from "../../lib/AppContext.jsx";
import { isMuted, setMuted, onMuteChange } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const MODES = [
  ["kids", "🐱 Kids mode", "Keyo the cat helps, big letters, no timer on screen."],
  ["pro", "⌨️ Pro mode", "Clean screen with live speed and accuracy. For older kids and adults."],
];

// Best stars a learner has earned in each lesson.
function bestStars(sessions) {
  const best = {};
  for (const ses of sessions) {
    const lesson = TYPING_JOURNEY.find(l => l.id === ses.lesson_id);
    if (!lesson) continue;
    best[lesson.id] = Math.max(best[lesson.id] ?? 0, starsFor(lesson, ses.mode, ses));
  }
  return best;
}

// The Typing course: stages of lessons, a Kids/Pro switch, and the learner's numbers.
export default function TypingCourse() {
  const { activeChild, childData, markDone, addTypingSession, setChildState } = useApp();
  const [open, setOpen] = useState(null);
  const [section, setSection] = useState("lessons"); // lessons | ladder | games
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);

  const sessions = childData.typing ?? [];
  const mode = childData.state?.typing?.mode ?? defaultMode(activeChild?.grade);
  const kids = mode !== "pro";
  const done = useMemo(() => new Set(childData.progress.map(p => p.item_id)), [childData.progress]);
  const stars = useMemo(() => bestStars(sessions), [sessions]);
  const sum = useMemo(() => typingSummary(sessions), [sessions]);
  const steps = TYPING_JOURNEY;
  // Kids unlock lessons in order; in Pro mode every lesson is open (adults may know some already).
  const unlocked = (i, d = done) => !kids || isUnlocked(steps, i, d, 0);
  const lessonsDone = steps.filter(s => done.has(s.id)).length;

  const idx = steps.findIndex(s => s.id === open);
  const lesson = steps[idx];
  // Keys the learner has met so far (shown bright on the keyboard).
  const taught = useMemo(() => new Set(lesson ? [...lesson.pool, " "] : []), [lesson]);
  const go = id => { hush(); setOpen(id); window.scrollTo({ top: 0 }); };
  const typingState = childData.state?.typing ?? {};
  const setMode = m => setChildState("typing", { ...typingState, mode: m });
  const climbed = typingState.ladder ?? 0;
  const playOpen = gamesOpen(done, mode);
  const pool = useMemo(() => gamePool(done, mode), [done, mode]);
  const save = (id, { r, won, input }) => addTypingSession({ lesson_id: id, mode, input, wpm: r.wpm, accuracy: r.accuracy, seconds: r.seconds, chars: r.chars, errors: r.errors, passed: won, keys: r.keys });
  const ladderResult = ({ rung, target, r, won, input }) => {
    save(`ladder-${target}`, { r, won, input });
    if (won && rung + 1 > climbed) setChildState("typing", { ...typingState, ladder: rung + 1 });
  };
  const gameResult = (id, data, res) => {
    save(`game-${id}`, res);
    setChildState("typing", { ...typingState, games: { ...(typingState.games ?? {}), [id]: data } });
  };
  const SECTIONS = [["lessons", "📚 Lessons"], ["ladder", "🪜 Speed ladder"], ["games", "🎮 Games"]];

  const finish = ({ r, stars: st, input }) => {
    addTypingSession({ lesson_id: lesson.id, mode, input, wpm: r.wpm, accuracy: r.accuracy, seconds: r.seconds, chars: r.chars, errors: r.errors, passed: st > 0, keys: r.keys });
    if (st > 0) markDone("typing", lesson.id);
  };
  const muteBtn = <button className="btn ghost" onClick={() => setMuted(!muted)} aria-pressed={muted}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</button>;

  if (lesson) {
    const part = TYPING_PARTS.find(p => p.id === lesson.part);
    const doneNow = new Set([...done, lesson.id]);
    const next = steps.slice(idx + 1).find((_, k) => unlocked(idx + 1 + k, doneNow));
    return (
      <div className="stack journey typing">
        <div className="row">
          <button className="btn ghost" onClick={() => go(null)}>← Lessons</button>
          <div>
            <div className="eyebrow">{part.title} · Lesson {idx + 1} of {steps.length}</div>
            <h3 style={{ margin: 0 }}>{lesson.emoji} {lesson.title}</h3>
          </div>
          <span className="spacer" />{muteBtn}
        </div>
        <div className="panel">
          <TypingLesson key={lesson.id} lesson={lesson} mode={mode} taught={taught} next={next} best={sum.bestWpm}
            onFinish={finish} onNext={() => go(next.id)} onBack={() => go(null)} />
        </div>
        {lesson.parent && (
          <details className="parent-note">
            <summary>For parents and teachers</summary>
            <p><b>What this lesson teaches:</b> {lesson.learned}</p>
            <p><b>Tip:</b> {lesson.parent}</p>
          </details>
        )}
      </div>
    );
  }

  if (section !== "lessons") {
    const title = section === "ladder" ? "🪜 Speed ladder" : "🎮 Typing games";
    return (
      <div className="stack journey typing">
        <div className="row">
          <button className="btn ghost" onClick={() => { hush(); setSection("lessons"); }}>← Typing</button>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span className="spacer" />{muteBtn}
        </div>
        <div className="panel">
          {!playOpen ? (
            <div className="stack">
              <p className="lead">🔒 Pass the <b>Home row check</b> (lesson 8) to unlock the speed ladder and games. They use only keys you've learned.</p>
              <div className="row"><button className="btn primary" onClick={() => setSection("lessons")}>Go to the lessons</button></div>
            </div>
          ) : section === "ladder"
            ? <SpeedLadder mode={mode} pool={pool} climbed={climbed} onResult={ladderResult} />
            : <Games mode={mode} pool={pool} bestWpm={sum.bestWpm} saved={typingState.games} onSave={(id, data, res) => gameResult(id, data, res)} />}
        </div>
      </div>
    );
  }

  const firstOpen = steps.find((s, i) => !done.has(s.id) && unlocked(i));
  return (
    <div className="stack journey typing">
      <div className="map-head">
        {kids && <KeyoFace mood="happy" size={80} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sec">{kids ? "Keyo's typing course" : "Touch typing course"}</h2>
          <p className="muted">{kids ? "Learn the keyboard finger by finger, without looking." : "Learn to touch type: home row first, then the rows above and below."} {lessonsDone} of {steps.length} lessons done.</p>
        </div>
        {muteBtn}
      </div>

      <fieldset className="seg-field">
        <legend>Mode</legend>
        <div className="seg">
          {MODES.map(([v, l]) => (
            <label key={v} className={mode === v ? "on" : ""}><input type="radio" name="typing-mode" value={v} checked={mode === v} onChange={() => setMode(v)} />{l}</label>
          ))}
        </div>
        <p className="muted small-note">{MODES.find(m => m[0] === mode)[2]}</p>
      </fieldset>

      <nav className="seg type-sections" aria-label="Typing sections">
        {SECTIONS.map(([v, l]) => (
          <button key={v} type="button" className={section === v ? "on" : ""} aria-pressed={section === v} onClick={() => { hush(); setSection(v); }}>
            {l}{v !== "lessons" && !playOpen ? " 🔒" : ""}
          </button>
        ))}
      </nav>

      <div className="kpis wide">
        <div className="kpi"><span>Lessons</span><b>{lessonsDone}/{steps.length}</b><small>passed</small></div>
        <div className="kpi"><span>Best speed</span><b>{sum.bestWpm || "—"}</b><small>words a minute</small></div>
        <div className="kpi"><span>Accuracy</span><b>{sum.accuracy == null ? "—" : `${sum.accuracy}%`}</b><small>last 5 lessons</small></div>
        <div className="kpi"><span>Speed ladder</span><b>{climbed ? LADDER[climbed - 1] : "—"}</b><small>{climbed ? `rung ${climbed} of ${LADDER.length}` : "not started"}</small></div>
        <div className="kpi"><span>Practice</span><b>{fmtMinutes(sum)}</b><small>typing time</small></div>
      </div>

      {TYPING_PARTS.map(part => (
        <section key={part.id} className="stack" style={{ gap: 10 }}>
          <div className="part-head">
            <h3>{part.title}</h3>
            <span className="tag">{part.who}</span>
            <p className="muted">{part.note}</p>
          </div>
          <ol className="path">
            {steps.filter(s => s.part === part.id).map(s => {
              const i = steps.indexOf(s);
              const canOpen = unlocked(i);
              const isDone = done.has(s.id);
              const isNext = s === firstOpen;
              return (
                <li key={s.id} className={`stone${isDone ? " done" : ""}${canOpen ? "" : " locked"}${isNext ? " next" : ""}`}>
                  <button disabled={!canOpen} onClick={() => go(s.id)} aria-label={`${s.title}${isDone ? ", done" : canOpen ? "" : ", locked"}`}>
                    <span className="em">{canOpen ? s.emoji : "🔒"}</span>
                    <span className="txt"><span className="eyebrow">Lesson {i + 1}{s.kind === "check" ? " · stage check" : ""}</span><b>{s.title}</b><small>{s.blurb}</small></span>
                    <span className="mark">{stars[s.id] ? "⭐".repeat(stars[s.id]) : isNext ? "Start" : ""}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
      <p className="muted">Coming next: the bottom row, capitals and punctuation, numbers and symbols, and smart practice on your weakest keys.</p>
    </div>
  );
}

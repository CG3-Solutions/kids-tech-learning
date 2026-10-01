import { useEffect, useMemo, useState } from "react";
import { KeyoFace } from "../../components/journey/Guide.jsx";
import { isUnlocked } from "../../components/journey/Journey.jsx";
import TypingLesson from "./TypingLesson.jsx";
import SpeedLadder from "./SpeedLadder.jsx";
import Games from "./Games.jsx";
import TypingTests from "./TypingTests.jsx";
import TypingProgress from "./TypingProgress.jsx";
import { TYPING_JOURNEY, TYPING_PARTS, LADDER, defaultMode, starsFor, gamesOpen, gamePool, smartLesson } from "../../content/typing.js";
import { typingSummary, fmtMinutes } from "../../lib/typing.js";
import { useApp } from "../../lib/AppContext.jsx";
import { assignmentStatus } from "../../lib/school.js";
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
  const { api, activeChild, childData, markDone, addTypingSession, setChildState } = useApp();
  const [tasks, setTasks] = useState([]); // set by the learner's teacher (schools)
  useEffect(() => {
    if (!api?.assignmentsFor || !activeChild) return;
    api.assignmentsFor(activeChild.id).then(setTasks).catch(() => setTasks([]));
  }, [api, activeChild?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [open, setOpen] = useState(null);
  const [section, setSection] = useState("lessons"); // lessons | ladder | tests | games | progress
  const [smart, setSmart] = useState(null);           // a smart-practice lesson, while open
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);

  const sessions = childData.typing ?? [];
  const mode = childData.state?.typing?.mode ?? defaultMode(activeChild);
  const kids = mode !== "pro";
  const done = useMemo(() => new Set(childData.progress.map(p => p.item_id)), [childData.progress]);
  const stars = useMemo(() => bestStars(sessions), [sessions]);
  const sum = useMemo(() => typingSummary(sessions), [sessions]);
  const steps = TYPING_JOURNEY;
  // Kids unlock lessons in order; in Pro mode every lesson is open (adults may know some already).
  const unlocked = (i, d = done) => !kids || isUnlocked(steps, i, d, 0);
  const lessonsDone = steps.filter(s => done.has(s.id)).length;

  const idx = steps.findIndex(s => s.id === open);
  const lesson = smart ?? steps[idx];
  // Keys the learner has met so far (shown bright on the keyboard).
  const taught = useMemo(() => new Set(lesson ? [...lesson.pool, " "] : []), [lesson]);
  const go = id => { hush(); setSmart(null); setOpen(id); window.scrollTo({ top: 0 }); };
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
  const SECTIONS = [["lessons", "📚 Lessons"], ["ladder", "🪜 Speed ladder"], ["tests", "⏱️ Tests"], ["games", "🎮 Games"], ["progress", "📈 My progress"]];
  const LOCKED = new Set(["ladder", "tests", "games"]); // need the home row first (Kids mode)
  const openSmart = weak => { hush(); setSmart(smartLesson(weak, pool)); setOpen("practice-smart"); setSection("lessons"); window.scrollTo({ top: 0 }); };

  const finish = ({ r, stars: st, input }) => {
    addTypingSession({ lesson_id: lesson.id, mode, input, wpm: r.wpm, accuracy: r.accuracy, seconds: r.seconds, chars: r.chars, errors: r.errors, passed: st > 0, keys: r.keys });
    if (st > 0 && !smart) markDone("typing", lesson.id);
  };
  const muteBtn = <button className="btn ghost" onClick={() => setMuted(!muted)} aria-pressed={muted}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</button>;

  if (lesson) {
    const part = TYPING_PARTS.find(p => p.id === lesson.part);
    const doneNow = new Set([...done, lesson.id]);
    const next = smart ? null : steps.slice(idx + 1).find((_, k) => unlocked(idx + 1 + k, doneNow));
    return (
      <div className="stack journey typing">
        <div className="row">
          <button className="btn ghost" onClick={() => go(null)}>← Lessons</button>
          <div>
            <div className="eyebrow">{smart ? "Made for you" : `${part.title} · Lesson ${idx + 1} of ${steps.length}`}</div>
            <h3 style={{ margin: 0 }}>{lesson.emoji} {lesson.title}</h3>
          </div>
          <span className="spacer" />{muteBtn}
        </div>
        <div className="panel">
          <TypingLesson key={smart ? `smart-${smart.keys.join("")}` : lesson.id} lesson={lesson} mode={mode} taught={taught} next={next} best={sum.bestWpm}
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
    const title = SECTIONS.find(x => x[0] === section)[1];
    return (
      <div className="stack journey typing">
        <div className="row">
          <button className="btn ghost" onClick={() => { hush(); setSection("lessons"); }}>← Typing</button>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span className="spacer" />{muteBtn}
        </div>
        <div className="panel">
          {LOCKED.has(section) && !playOpen ? (
            <div className="stack">
              <p className="lead">🔒 Pass the <b>Home row check</b> (lesson 8) to unlock the speed ladder, tests and games. They use only keys you've learned.</p>
              <div className="row"><button className="btn primary" onClick={() => setSection("lessons")}>Go to the lessons</button></div>
            </div>
          ) : section === "ladder" ? <SpeedLadder mode={mode} pool={pool} climbed={climbed} onResult={ladderResult} />
            : section === "tests" ? <TypingTests mode={mode} pool={pool} name={activeChild?.name ?? ""} sessions={sessions}
                onResult={({ minutes, r, won, input }) => save(`test-${minutes}`, { r, won, input })} />
            : section === "progress" ? <TypingProgress sessions={sessions} me={activeChild?.id} mode={mode} onSmart={openSmart} canSmart={sessions.length > 0} />
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
            {l}{LOCKED.has(v) && !playOpen ? " 🔒" : ""}
          </button>
        ))}
      </nav>

      {tasks.length > 0 && (() => {
        const list = tasks.map(t => ({ t, st: assignmentStatus(t, childData) }));
        const open = list.filter(x => !x.st.done);
        const fmt = d => new Date(`${d}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
        const goTask = t => {
          if (t.kind === "lesson") { const i = steps.findIndex(s => s.id === t.target); if (i >= 0 && unlocked(i)) go(t.target); else { hush(); setSection("lessons"); } }
          else { hush(); setSection(t.kind === "test" ? "tests" : "ladder"); }
        };
        return (
          <section className="tasks-card" aria-label="From your teacher">
            <h3>📌 From your teacher</h3>
            {open.length ? (
              <ul>
                {open.map(({ t, st }) => {
                  const i = steps.findIndex(s => s.id === t.target);
                  const locked = t.kind === "lesson" && i >= 0 && !unlocked(i);
                  return (
                    <li key={t.id}>
                      <span><b>{t.title}</b><small className="muted"> · {t.class_name}{t.due_on ? ` · due ${fmt(t.due_on)}` : ""}{st.overdue ? " · overdue" : ""} · {st.detail}</small></span>
                      {locked ? <span className="tag">Finish earlier lessons first</span> : <button className="btn small" onClick={() => goTask(t)}>Go →</button>}
                    </li>
                  );
                })}
              </ul>
            ) : <p>All your tasks are done. ⭐</p>}
            {list.length > open.length && open.length > 0 && <p className="muted small-note">{list.length - open.length} done ✓</p>}
          </section>
        );
      })()}

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
    </div>
  );
}

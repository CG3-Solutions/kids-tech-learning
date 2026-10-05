import { useEffect, useState } from "react";
import { isMuted, setMuted, onMuteChange, sfx } from "../../lib/sfx.js";
import { hush, speak } from "../../lib/speech.js";
import { useUrlState } from "../../lib/useUrlState.js";
import { useApp } from "../../lib/AppContext.jsx";
import Icon from "../Icon.jsx";

// Is step `index` open for this child?
// - A step with `openFrom` is open straight away for children in that class (standard) or above.
// - A bonus step opens once the step named in `after` is done.
// - Otherwise a step opens when the main step before it is done.
export function isUnlocked(steps, index, done, grade = 0) {
  const step = steps[index];
  if (step.openFrom != null && grade >= step.openFrom) return true;
  if (step.bonus) return done.has(step.after ?? steps.filter(s => !s.bonus).at(-1).id);
  const prev = steps.slice(0, index).filter(s => !s.bonus).at(-1);
  return !prev || done.has(prev.id);
}

// The map is a winding trail: each stop sits on a gentle wave, joined by a dotted path.
const ROW = 112;                       // px per stop (keep in step with .trail li in app.css)
const wave = i => Math.sin(i * 1.15);  // -1 … 1: how far left or right a stop sits
const TRAILS = [{ cls: "wide", cx: 150, amp: 90 }, { cls: "narrow", cx: 62, amp: 30 }];
function trailPath(n, cx, amp) {
  const pt = i => [cx + wave(i) * amp, i * ROW + ROW / 2];
  let d = `M${pt(0).join(" ")}`;
  for (let i = 1; i < n; i++) {
    const [x0, y0] = pt(i - 1), [x1, y1] = pt(i);
    d += ` C${x0} ${y0 + ROW / 2} ${x1} ${y1 - ROW / 2} ${x1} ${y1}`;
  }
  return d;
}

function ParentNote({ step }) {
  if (!step.parent) return null;
  return (
    <details className="parent-note">
      <summary>For parents</summary>
      <p><b>What your child learns:</b> {step.learned}</p>
      <p><b>Talk about it:</b> {step.parent}</p>
    </details>
  );
}

// A step-by-step adventure: a map of steps grouped into parts, and one open step at a time.
// `views` maps step id → component({ grade, onComplete }).
export default function Journey({ title, intro, Face, steps, parts = [], views, done, grade, onStepDone, top }) {
  const { unlockAll } = useApp(); // a parent may have opened every level for this learner
  const open_ = (i, d = done) => unlockAll || isUnlocked(steps, i, d, grade);
  const [openParam, setOpen] = useUrlState("step"); // the open step, kept in the address so Back returns to the map
  const [lockedTap, setLockedTap] = useState(null);  // a locked step the child tapped: say how to open it
  const [celebrate, setCelebrate] = useState(false);
  const [run, setRun] = useState(0);
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  useEffect(() => () => hush(), []);

  const main = steps.filter(s => !s.bonus);
  // A step in the address only opens if it exists and is open for this child.
  const idx = steps.findIndex((s, i) => s.id === openParam && open_(i));
  const step = steps[idx];
  const open = step?.id ?? null;
  const View = step && views[step.id];
  const doneNow = new Set([...done, ...(open ? [open] : [])]);
  const next = steps.slice(idx + 1).find((_, k) => open_(idx + 1 + k, doneNow));
  const mainDone = main.filter(s => done.has(s.id)).length;
  const stepNo = s => main.indexOf(s) + 1;

  // Free-play steps (`quiet`) earn their star without leaving the activity.
  const complete = () => { onStepDone(step.id); sfx.tada(); if (!step.quiet) setCelebrate(true); };
  const go = id => { hush(); setCelebrate(false); setLockedTap(null); setOpen(id); window.scrollTo({ top: 0 }); };
  const lockedMsg = firstOpen => (firstOpen ? `Finish “${firstOpen.title}” first to open this one.` : "Finish the steps before this one first.");
  const tapLocked = (s, firstOpen) => { sfx.click(); setLockedTap(s.id); speak(lockedMsg(firstOpen)); };
  // On phones the label is hidden and only the icon shows (see .sound-btn in app.css).
  const muteBtn = <button className="btn ghost sound-btn" onClick={() => setMuted(!muted)} aria-pressed={muted} aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}>
    <Icon name={muted ? "mute" : "speaker"} size={22} /><span className="label">{muted ? "Sound off" : "Sound on"}</span></button>;

  if (step) {
    const part = parts.find(p => p.id === step.part);
    return (
      // `in-step`: on phones the page header (breadcrumb, subject title, tabs) is hidden so the
      // question fits on screen; ← Map leads back to all of it.
      <div className="stack journey in-step">
        <div className="step-head">
          <button className="btn map-btn" onClick={() => go(null)}><Icon name="map" size={22} /> Map</button>
          <div className="step-title">
            <div className="eyebrow">{step.bonus ? "Bonus" : <>{part && <span className="part-name">{part.title} · </span>}Step {stepNo(step)} of {main.length}</>}</div>
            <h3>{step.title}</h3>
          </div>
          {muteBtn}
        </div>
        {celebrate ? (
          <div className="panel celebrate">
            <div className="cele-stars" aria-hidden="true"><Icon name="star" size={44} stroke={1.4} fill="currentColor" /><Icon name="star" size={60} stroke={1.4} fill="currentColor" /><Icon name="star" size={44} stroke={1.4} fill="currentColor" /></div>
            <Face mood="cheer" size={140} />
            <h2>Step complete!</h2>
            <p className="lead">{step.learned}</p>
            <div className="row center-row">
              {next ? <button className="btn play big" onClick={() => go(next.id)}><Icon name="play" size={22} stroke={0} fill="currentColor" /> Next: {next.title}</button>
                : <button className="btn primary big" onClick={() => go(null)}>Back to the map</button>}
              <button className="btn big" onClick={() => { setCelebrate(false); setRun(r => r + 1); }}>Play again</button>
            </div>
            <ParentNote step={step} />
          </div>
        ) : (
          <>
            <div className="panel"><View key={`${step.id}-${run}`} grade={grade} onComplete={complete} /></div>
            <ParentNote step={step} />
          </>
        )}
      </div>
    );
  }

  const groups = parts.length ? parts.map(p => ({ part: p, items: steps.filter(s => s.part === p.id) })) : [{ part: null, items: steps }];
  const firstOpen = steps.find((s, i) => !done.has(s.id) && open_(i));
  const pct = main.length ? Math.round((mainDone / main.length) * 100) : 0;
  return (
    <div className="stack journey">
      <div className="map-head">
        <Face mood={mainDone === main.length && main.length ? "cheer" : "happy"} size={104} />
        <div className="map-head-txt">
          <h2>{title}</h2>
          <p>{intro}</p>
          <div className="map-progress"><span className="bar-track" role="img" aria-label={`${mainDone} of ${main.length} steps done`}><i style={{ width: `${pct}%` }} /></span><b>{mainDone} of {main.length}</b></div>
        </div>
        {muteBtn}
      </div>
      {top}
      {groups.map(({ part, items }) => (
        <section key={part?.id ?? "all"} className="trail-map">
          {part && (
            <div className="part-head">
              <h3>{part.title}</h3>
              {part.who && <span className="tag">{part.who}</span>}
              {part.note && <p>{part.note}</p>}
            </div>
          )}
          <ol className="trail" style={{ height: items.length * ROW }}>
            {TRAILS.map(t => <svg key={t.cls} className={`trail-line ${t.cls}`} width="100%" height={items.length * ROW} aria-hidden="true" focusable="false"><path d={trailPath(items.length, t.cx, t.amp)} /></svg>)}
            {items.map((s, k) => {
              const i = steps.indexOf(s);
              const unlocked = open_(i);
              const isDone = done.has(s.id);
              const isNext = s === firstOpen;
              const state = isDone ? "done" : isNext ? "next" : unlocked ? "open" : "locked";
              return (
                <li key={s.id} className={`stone ${state}${s.bonus ? " bonus" : ""}`} style={{ "--x": wave(k) }}>
                  <button aria-disabled={!unlocked} onClick={() => (unlocked ? go(s.id) : tapLocked(s, firstOpen))} aria-label={`${s.bonus ? "Bonus" : `Step ${stepNo(s)}`}: ${s.title}${isDone ? ", done" : isNext ? ", start here" : unlocked ? "" : ", locked"}`}>
                    <span className="node" aria-hidden="true">
                      {isDone ? <Icon name="star" size={34} stroke={1.4} fill="currentColor" />
                        : isNext ? <Icon name="play" size={36} stroke={0} fill="currentColor" />
                        : unlocked ? <span className="em">{s.emoji}</span>
                        : <Icon name="lock" size={28} stroke={2.6} />}
                    </span>
                    <span className="label">
                      <span className="eyebrow">{s.bonus ? "Bonus" : `Step ${stepNo(s)}`}</span>
                      <b>{s.title}</b>
                      <small>{s.blurb}</small>
                    </span>
                    {isNext && <span className="here" aria-hidden="true">Start</span>}
                  </button>
                  {lockedTap === s.id && <p className="lock-hint" role="status"><Icon name="lock" size={16} /> {lockedMsg(firstOpen)}</p>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

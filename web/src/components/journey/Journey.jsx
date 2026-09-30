import { useEffect, useState } from "react";
import { isMuted, setMuted, onMuteChange, sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

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
export default function Journey({ title, intro, Face, steps, parts = [], views, done, grade, onStepDone }) {
  const [open, setOpen] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [run, setRun] = useState(0);
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  useEffect(() => () => hush(), []);

  const main = steps.filter(s => !s.bonus);
  const idx = steps.findIndex(s => s.id === open);
  const step = steps[idx];
  const View = step && views[step.id];
  const doneNow = new Set([...done, ...(open ? [open] : [])]);
  const next = steps.slice(idx + 1).find((_, k) => isUnlocked(steps, idx + 1 + k, doneNow, grade));
  const mainDone = main.filter(s => done.has(s.id)).length;
  const stepNo = s => main.indexOf(s) + 1;

  // Free-play steps (`quiet`) earn their star without leaving the activity.
  const complete = () => { onStepDone(step.id); sfx.tada(); if (!step.quiet) setCelebrate(true); };
  const go = id => { hush(); setCelebrate(false); setOpen(id); window.scrollTo({ top: 0 }); };
  const muteBtn = <button className="btn ghost" onClick={() => setMuted(!muted)} aria-pressed={muted}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</button>;

  if (step) {
    const part = parts.find(p => p.id === step.part);
    return (
      <div className="stack journey">
        <div className="row">
          <button className="btn ghost" onClick={() => go(null)}>← Map</button>
          <div>
            <div className="eyebrow">{step.bonus ? "Bonus" : `${part ? `${part.title} · ` : ""}Step ${stepNo(step)} of ${main.length}`}</div>
            <h3 style={{ margin: 0 }}>{step.emoji} {step.title}</h3>
          </div>
          <span className="spacer" />{muteBtn}
        </div>
        {celebrate ? (
          <div className="panel celebrate">
            <Face mood="cheer" size={120} />
            <h2>Step complete! ⭐</h2>
            <p className="lead">{step.learned}</p>
            <div className="row center-row">
              {next ? <button className="btn primary big" onClick={() => go(next.id)}>Next: {next.emoji} {next.title} →</button>
                : <button className="btn primary big" onClick={() => go(null)}>Back to the map</button>}
              <button className="btn ghost" onClick={() => { setCelebrate(false); setRun(r => r + 1); }}>Play again</button>
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
  const firstOpen = steps.find((s, i) => !done.has(s.id) && isUnlocked(steps, i, done, grade));
  return (
    <div className="stack journey">
      <div className="map-head">
        <Face mood="happy" size={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sec">{title}</h2>
          <p className="muted">{intro} {mainDone} of {main.length} steps done.</p>
        </div>
        {muteBtn}
      </div>
      {groups.map(({ part, items }) => (
        <section key={part?.id ?? "all"} className="stack" style={{ gap: 10 }}>
          {part && (
            <div className="part-head">
              <h3>{part.title}</h3>
              <span className="tag">{part.who}</span>
              <p className="muted">{part.note}</p>
            </div>
          )}
          <ol className="path">
            {items.map(s => {
              const i = steps.indexOf(s);
              const unlocked = isUnlocked(steps, i, done, grade);
              const isDone = done.has(s.id);
              const isNext = s === firstOpen;
              return (
                <li key={s.id} className={`stone${isDone ? " done" : ""}${unlocked ? "" : " locked"}${isNext ? " next" : ""}${s.bonus ? " bonus" : ""}`}>
                  <button disabled={!unlocked} onClick={() => go(s.id)} aria-label={`${s.title}${isDone ? ", done" : unlocked ? "" : ", locked"}`}>
                    <span className="em">{unlocked ? s.emoji : "🔒"}</span>
                    <span className="txt"><span className="eyebrow">{s.bonus ? "Bonus" : `Step ${stepNo(s)}`}</span><b>{s.title}</b><small>{s.blurb}</small></span>
                    <span className="mark">{isDone ? "⭐" : isNext ? "Start" : ""}</span>
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

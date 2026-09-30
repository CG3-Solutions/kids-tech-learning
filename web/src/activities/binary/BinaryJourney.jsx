import { useEffect, useState } from "react";
import { BitFace } from "./Bit.jsx";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7, PixelPainter, SecretMessage } from "./Steps.jsx";
import { BINARY_JOURNEY } from "../../content/subjects.js";
import { isMuted, setMuted, onMuteChange, sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const VIEWS = { "binary-step-1": Step1, "binary-step-2": Step2, "binary-step-3": Step3, "binary-step-4": Step4, "binary-step-5": Step5, "binary-step-6": Step6, "binary-step-7": Step7, "binary-bonus-pixel": PixelPainter, "binary-bonus-secret": SecretMessage };

// Older learners (5th standard and up) can open any step; younger ones unlock them in order.
export function isUnlocked(index, done, grade) {
  if (grade >= 5) return true;
  const step = BINARY_JOURNEY[index];
  if (step.bonus) return done.has("binary-step-7");
  return index === 0 || done.has(BINARY_JOURNEY[index - 1].id);
}

export default function BinaryJourney({ done, grade, onStepDone }) {
  const [open, setOpen] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const [run, setRun] = useState(0); // bumps to restart a step
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  useEffect(() => () => hush(), []);

  const idx = BINARY_JOURNEY.findIndex(s => s.id === open);
  const step = BINARY_JOURNEY[idx];
  const View = step && VIEWS[step.id];
  const next = BINARY_JOURNEY.slice(idx + 1).find((_, k) => isUnlocked(idx + 1 + k, new Set([...done, open]), grade));
  const mainDone = BINARY_JOURNEY.filter(s => !s.bonus && done.has(s.id)).length;
  const mainTotal = BINARY_JOURNEY.filter(s => !s.bonus).length;

  const complete = () => { onStepDone(step.id); sfx.tada(); setCelebrate(true); };
  const go = id => { hush(); setCelebrate(false); setOpen(id); window.scrollTo({ top: 0 }); };

  const muteBtn = (
    <button className="btn ghost" onClick={() => setMuted(!muted)} aria-pressed={muted}>{muted ? "🔇 Sound off" : "🔊 Sound on"}</button>
  );

  if (step) {
    return (
      <div className="stack journey">
        <div className="row">
          <button className="btn ghost" onClick={() => go(null)}>← Map</button>
          <div><div className="eyebrow">{step.bonus ? "Bonus game" : `Step ${idx + 1} of ${mainTotal}`}</div><h3 style={{ margin: 0 }}>{step.emoji} {step.title}</h3></div>
          <span className="spacer" />{muteBtn}
        </div>
        {celebrate ? (
          <div className="panel celebrate">
            <BitFace mood="cheer" size={120} />
            <h2>Step complete! ⭐</h2>
            <p className="lead">{step.learned}</p>
            <div className="row center-row">
              {next ? <button className="btn primary big" onClick={() => go(next.id)}>Next: {next.emoji} {next.title} →</button>
                : <button className="btn primary big" onClick={() => go(null)}>Back to the map</button>}
              <button className="btn ghost" onClick={() => { setCelebrate(false); setRun(r => r + 1); }}>Play again</button>
            </div>
          </div>
        ) : (
          <div className="panel"><View key={`${step.id}-${run}`} grade={grade} onComplete={complete} /></div>
        )}
      </div>
    );
  }

  return (
    <div className="stack journey">
      <div className="map-head">
        <BitFace mood="happy" size={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="sec">Bit's binary adventure</h2>
          <p className="muted">Help Bit the Robot learn to talk in ON and OFF. {mainDone} of {mainTotal} steps done.</p>
        </div>
        {muteBtn}
      </div>
      <ol className="path">
        {BINARY_JOURNEY.map((s, i) => {
          const unlocked = isUnlocked(i, done, grade);
          const isDone = done.has(s.id);
          const isNext = unlocked && !isDone && BINARY_JOURNEY.slice(0, i).every((p, k) => done.has(p.id) || !isUnlocked(k, done, grade) || p.bonus);
          return (
            <li key={s.id} className={`stone${isDone ? " done" : ""}${unlocked ? "" : " locked"}${isNext ? " next" : ""}${s.bonus ? " bonus" : ""}`}>
              <button disabled={!unlocked} onClick={() => go(s.id)} aria-label={`${s.title}${isDone ? ", done" : unlocked ? "" : ", locked"}`}>
                <span className="em">{unlocked ? s.emoji : "🔒"}</span>
                <span className="txt"><span className="eyebrow">{s.bonus ? "Bonus" : `Step ${i + 1}`}</span><b>{s.title}</b><small>{s.blurb}</small></span>
                <span className="mark">{isDone ? "⭐" : isNext ? "Start" : ""}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

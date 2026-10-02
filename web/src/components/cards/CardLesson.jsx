import { useEffect, useMemo, useRef, useState } from "react";
import PartArt, { Battery, Bulb, Buzzer, Motor, Lever, PushButton, Wire } from "./PartArt.jsx";
import LoopScene, { Gap, Emoji, Holder, Batteries } from "./LoopScene.jsx";
import { MORE_TOYS } from "./MoreToys.jsx";
import { speak, hush, prepareSpeech } from "../../lib/speech.js";
import { sfx } from "../../lib/sfx.js";

// --- The toys. Each calls onGoal() once the child has done what was asked. ---

function PowerToy({ onGoal }) {
  const [on, setOn] = useState(false);
  const [wasOn, setWasOn] = useState(false);
  const flip = () => { const v = !on; setOn(v); v ? sfx.on() : sfx.off(); if (v) setWasOn(true); else if (wasOn) onGoal(); };
  return (
    <>
      <div className={`room${on ? " on" : ""}`}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><Bulb glow={on ? 1 : 0} /></svg>
        <svg viewBox="0 0 120 120" aria-hidden="true"><Motor spin={on ? 1 : 0} /></svg>
        <span className="tv" aria-hidden="true">{on ? "📺" : "⬛"}</span>
      </div>
      <p className="toy-say" role="status">{on ? "Power is ON. The bulb glows and the fan spins!" : wasOn ? "Power cut! Everything stopped." : "Everything is off."}</p>
      <button className={`btn big ${on ? "" : "primary"}`} onClick={flip}>{on ? "✂️ Make a power cut" : "⚡ Switch the power ON"}</button>
    </>
  );
}

function LoopToy({ onGoal }) {
  const [closed, setClosed] = useState(false);
  const flip = () => { const v = !closed; setClosed(v); v ? sfx.on() : sfx.off(); if (v) onGoal(); };
  return (
    <>
      <LoopScene live={closed} left={<Battery />} top={<Bulb glow={closed ? 0.9 : 0} />} bottom={closed ? <Lever on /> : <Gap />} onBottom={flip} bottomLabel={closed ? "Open the loop" : "Close the gap"} />
      <p className="toy-say" role="status">{closed ? "The loop is closed. Electricity goes all the way round!" : "There is a gap. Electricity cannot get across."}</p>
      <button className={`btn big ${closed ? "" : "primary"}`} onClick={flip}>{closed ? "Open the loop again" : "🔗 Close the gap"}</button>
    </>
  );
}

function BatteryToy({ onGoal }) {
  const [inPlace, setIn] = useState(false);
  const flip = () => { const v = !inPlace; setIn(v); v ? sfx.on() : sfx.off(); if (v) onGoal(); };
  return (
    <>
      <LoopScene live={inPlace} left={inPlace ? <Battery /> : <Holder />} top={<Bulb glow={inPlace ? 0.9 : 0} />} bottom={<Lever on />} />
      <p className="toy-say" role="status">{inPlace ? "The battery pushes electricity around the loop." : "No battery, no push. Nothing flows."}</p>
      <button className={`btn big ${inPlace ? "" : "primary"}`} onClick={flip}>{inPlace ? "Take the battery out" : "🔋 Put the battery in"}</button>
    </>
  );
}

const MATERIALS = [
  { id: "string", e: "🧵", label: "String", ok: false },
  { id: "wire", label: "Wire", ok: true },
  { id: "straw", e: "🥤", label: "Plastic straw", ok: false },
  { id: "spoon", e: "🥄", label: "Metal spoon", ok: true },
];
function WireToy({ onGoal }) {
  const [pick, setPick] = useState(null);
  const m = MATERIALS.find(x => x.id === pick);
  const choose = x => { setPick(x.id); if (x.ok) { sfx.on(); onGoal(); } else sfx.bump(); };
  return (
    <>
      <LoopScene live={!!m?.ok} left={<Battery />} top={<Bulb glow={m?.ok ? 0.9 : 0} />} bottom={!m ? <Gap /> : m.e ? <Emoji e={m.e} /> : <Wire />} />
      <p className="toy-say" role="status">{!m ? "Pick something to fill the gap." : m.ok ? `Yes! ${m.label} lets electricity through.` : `${m.label} does not let electricity through. Try another!`}</p>
      <div className="toy-picks">
        {MATERIALS.map(x => (
          <button key={x.id} className="opt" aria-pressed={pick === x.id} onClick={() => choose(x)}>
            {x.e ? <span className="e" aria-hidden="true">{x.e}</span> : <svg viewBox="0 0 120 120" width="34" height="34" aria-hidden="true"><Wire /></svg>}{x.label}
          </button>
        ))}
      </div>
    </>
  );
}

function SwitchToy({ onGoal }) {
  const [on, setOn] = useState(false);
  const [wasOn, setWasOn] = useState(false);
  const flip = () => { const v = !on; setOn(v); v ? sfx.on() : sfx.off(); if (v) setWasOn(true); else if (wasOn) onGoal(); };
  return (
    <>
      <LoopScene live={on} left={<Battery />} top={<Bulb glow={on ? 0.9 : 0} />} bottom={<Lever on={on} />} onBottom={flip} bottomLabel={on ? "Switch off" : "Switch on"} />
      <p className="toy-say" role="status">{on ? "ON: the loop is closed. Electricity flows." : wasOn ? "OFF: the loop is open. Electricity stops." : "The switch is OFF."}</p>
      <button className="wall-switch" onClick={flip} aria-pressed={on} aria-label={on ? "Switch off" : "Switch on"}>
        <PartArt id="el-switch" size={96} on={on} /><b>{on ? "ON" : "OFF"}</b>
      </button>
    </>
  );
}

function BulbToy({ onGoal }) {
  const [n, setN] = useState(1);
  const set = v => { setN(v); sfx.click(); if (v === 3) { sfx.on(); onGoal(); } };
  return (
    <>
      <LoopScene live left={<Batteries n={n} />} top={<Bulb glow={n / 3} />} bottom={<Lever on />} />
      <p className="toy-say" role="status">{n === 3 ? "Three batteries: a big push, a bright bulb!" : n === 2 ? "Two batteries: brighter!" : "One battery: a soft glow."}</p>
      <div className="toy-picks">
        {[1, 2, 3].map(v => <button key={v} className="opt" aria-pressed={n === v} onClick={() => set(v)}><span className="e" aria-hidden="true">🔋</span>{v} {v === 1 ? "battery" : "batteries"}</button>)}
      </div>
    </>
  );
}

function BuzzerToy({ onGoal }) {
  const [count, setCount] = useState(0);
  const [down, setDown] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const press = () => {
    sfx.buzz(); setDown(true);
    clearTimeout(timer.current); timer.current = setTimeout(() => setDown(false), 350);
    const c = count + 1; setCount(c); if (c === 3) onGoal();
  };
  return (
    <>
      <LoopScene live={down} left={<Battery />} top={<Buzzer on={down} />} bottom={<PushButton down={down} />} onBottom={press} bottomLabel="Press the button" />
      <p className="toy-say" role="status">{count === 0 ? "Press the button to close the loop." : count < 3 ? `Beep! ${3 - count} more.` : "Beep, beep, beep! Electricity became sound."}</p>
      <button className="btn big primary" onClick={press}>🔴 Press the button</button>
    </>
  );
}

function MotorToy({ onGoal }) {
  const [on, setOn] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const power = () => { const v = !on; setOn(v); v ? sfx.on() : sfx.off(); };
  const turn = () => { setFlipped(f => !f); sfx.click(); if (on) onGoal(); };
  return (
    <>
      <LoopScene live={on} reverse={flipped} left={<Battery flip={flipped} />} top={<Motor spin={on ? (flipped ? -1 : 1) : 0} />} bottom={<Lever on={on} />} onBottom={power} bottomLabel={on ? "Switch off" : "Switch on"} />
      <p className="toy-say" role="status">{!on ? "Switch it on to make the fan spin." : flipped ? "The battery is flipped, so the fan spins the other way!" : "The motor spins the fan. Now flip the battery."}</p>
      <div className="toy-picks">
        <button className={`btn big ${on ? "" : "primary"}`} onClick={power}>{on ? "Switch OFF" : "⚡ Switch ON"}</button>
        <button className={`btn big ${on ? "primary" : ""}`} onClick={turn}>🔄 Flip the battery</button>
      </div>
    </>
  );
}

const TOYS = { power: PowerToy, loop: LoopToy, battery: BatteryToy, wire: WireToy, switch: SwitchToy, bulb: BulbToy, buzzer: BuzzerToy, motor: MotorToy, ...MORE_TOYS };
const SCREENS = ["Meet", "Play", "Check", "Star"];

// One card as a mini-lesson: meet the part, play with it, answer one question, earn the star.
export default function CardLesson({ card, lesson, levelName, color, learned, onLearned, onClose, next, onGo }) {
  const d = card.data;
  const [at, setAt] = useState(0);
  const [played, setPlayed] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [right, setRight] = useState(false);
  const closeRef = useRef(null);
  const Toy = TOYS[lesson.toy];
  // The answers are mixed up each time, so the right one is not always in the same place.
  const options = useMemo(() => lesson.check.options.map(o => [Math.random(), o]).sort((a, b) => a[0] - b[0]).map(x => x[1]), [card.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const say = [`${d.n}. ${lesson.meet}`, lesson.play, lesson.check.q, `You collected ${d.n}! ${lesson.check.why}`];
  useEffect(() => { setAt(0); setPlayed(false); setWrong([]); setRight(false); closeRef.current?.focus(); }, [card.id]);
  useEffect(() => { prepareSpeech(say); }, [card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { speak(say[at]); return hush; }, [at, card.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const onKey = e => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const go = n => { hush(); setAt(n); };
  const goal = () => { if (!played) { setPlayed(true); sfx.ding(); } };
  const answer = (o, i) => {
    if (right) return;
    if (o.ok) { setRight(true); sfx.tada(); if (!learned) onLearned(); setTimeout(() => setAt(3), 1100); }
    else { sfx.oops(); setWrong(w => [...w, i]); }
  };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <article className="card lesson" role="dialog" aria-modal="true" aria-labelledby="cardTitle" style={{ "--c": color }}>
        <div className="card-hd">
          <PartArt id={card.id} size={56} />
          <div><div className="eyebrow">{levelName}</div><h2 id="cardTitle">{d.n}</h2></div>
          <div className="acts">
            <button className="btn" onClick={() => speak(say[at], { force: true })} aria-label="Read to me">🔊</button>
            <button className="btn" ref={closeRef} onClick={onClose}>Close</button>
          </div>
        </div>
        <ol className="lesson-dots" aria-label={`Part ${at + 1} of ${SCREENS.length}: ${SCREENS[at]}`}>
          {SCREENS.map((s, i) => <li key={s} className={i === at ? "now" : i < at ? "past" : ""} aria-hidden="true">{i === 3 ? "★" : i + 1}</li>)}
        </ol>

        <div className="lesson-bd">
          {at === 0 && (
            <>
              <PartArt id={card.id} size={170} label={`A picture of ${d.n}`} />
              <p className="lesson-big">{lesson.meet}</p>
              {d.like && <p className="like"><b>It’s like…</b> {d.like}</p>}
              <button className="btn primary big" onClick={() => go(1)}>Let’s play →</button>
            </>
          )}
          {at === 1 && (
            <>
              <p className="lesson-big">{lesson.play}</p>
              <Toy key={card.id} onGoal={goal} />
              {played && <p className="fb-line good" role="status">You did it! 🎉</p>}
              <div className="row center-row">
                <button className="btn ghost" onClick={() => go(0)}>← Back</button>
                <button className="btn primary big" disabled={!played} onClick={() => go(2)}>Next →</button>
              </div>
            </>
          )}
          {at === 2 && (
            <>
              <p className="lesson-big">{lesson.check.q}</p>
              <div className="lesson-opts">
                {options.map((o, i) => (
                  <button key={o.label} className={`opt${right && o.ok ? " right" : wrong.includes(i) ? " wrong" : ""}`} disabled={wrong.includes(i)} onClick={() => answer(o, i)}>
                    <span className="e" aria-hidden="true">{o.e}</span>{o.label}
                  </button>
                ))}
              </div>
              <p className={`fb-line ${right ? "good" : "bad"}`} role="status">{right ? "Yes! ⭐" : wrong.length ? "Not that one. Try again!" : " "}</p>
              <div className="row center-row"><button className="btn ghost" onClick={() => go(1)}>← Back</button></div>
            </>
          )}
          {at === 3 && (
            <>
              <div className="lesson-star" aria-hidden="true">⭐</div>
              <h3>You collected {d.n}!</h3>
              <p className="lesson-big">{lesson.check.why}</p>
              {d.home?.length > 0 && <div className="blk"><h4>Can you find it at home?</h4><ul className="places">{d.home.map(h => <li key={h}>{h}</li>)}</ul></div>}
              {d.tr && <details className="parent-note"><summary>Try it with a grown-up</summary><p>{d.tr}</p></details>}
              <div className="row center-row">
                <button className="btn ghost" onClick={() => go(1)}>Play again</button>
                {next ? <button className="btn primary big" onClick={() => onGo(next.id)}>Next: {next.data.n} →</button>
                  : <button className="btn primary big" onClick={onClose}>Back to the cards</button>}
              </div>
            </>
          )}
        </div>
      </article>
    </div>
  );
}

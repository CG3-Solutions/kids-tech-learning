// "Bit's mission: say THANK YOU to a computer". The new steps of the binary adventure:
// talk first (why computers need their own language), then letters as numbers, letters in 8 lamps,
// and the mission itself. Bonus: your name in binary, and meet the translator.
import { useEffect, useMemo, useState } from "react";
import Bit, { BitFace } from "./Bit.jsx";
import { pattern } from "./Lamp.jsx";
import Conversation from "../../components/journey/Conversation.jsx";
import { MiniLamps } from "../../components/journey/kit.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { sfx } from "../../lib/sfx.js";
import { TALK_INTRO, TALK_LETTERS, TALK_TRANSLATOR, MISSION, codeOf, bitsOf } from "../../content/binaryTalk.js";

const VALUES = [128, 64, 32, 16, 8, 4, 2, 1];
const sumOf = on => VALUES.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
const show = ch => (ch === " " ? "space" : ch);
const useName = () => useApp().activeChild?.name ?? "";

// Talk steps
export function TalkIntro({ onComplete }) {
  return <div className="step-body"><Conversation script={TALK_INTRO} Face={BitFace} name={useName()} onComplete={onComplete} doneLabel="Start the mission! 🎯" /></div>;
}
export function TalkLetters({ onComplete }) {
  return <div className="step-body"><Conversation script={TALK_LETTERS} Face={BitFace} name={useName()} onComplete={onComplete} doneLabel="Make letters with lamps →" /></div>;
}
export function Translator({ onComplete }) {
  return <div className="step-body"><Conversation script={TALK_TRANSLATOR} Face={BitFace} name={useName()} onComplete={onComplete} doneLabel="Finish ⭐" /></div>;
}

// Eight lamp cards (128 … 1). Calls onMade() when they add up to `target`.
export function ByteBuilder({ target, onMade, helper = true }) {
  const [on, setOn] = useState(Array(8).fill(false)); // the parent gives each letter its own key, so this starts fresh
  const total = sumOf(on);
  const made = total === target;
  const flip = i => {
    if (made) return;
    const n = on.map((x, j) => (j === i ? !x : x));
    on[i] ? sfx.off() : sfx.on(); setOn(n);
    if (sumOf(n) === target) { setTimeout(sfx.ding, 120); onMade?.(); }
  };
  const nextCard = VALUES.find((v, i) => !on[i] && total + v <= target);
  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="big-cards n8 byte-cards">
        {VALUES.map((v, i) => (
          <button key={v} className={`big-card${on[i] ? " on" : ""}`} onClick={() => flip(i)} aria-pressed={on[i]} aria-label={`${v} card, ${on[i] ? "on" : "off"}`}>
            <span className="bignum">{v}</span><b className="digit">{on[i] ? 1 : 0}</b>
          </button>
        ))}
      </div>
      <div className="counter">
        <div><span className="eyebrow">Make</span><b className="total">{target}</b></div>
        <div><span className="eyebrow">You have</span><b className={`total${total > target ? " over" : ""}`}>{total}</b></div>
        <div><span className="eyebrow">In binary</span><b className="bits">{pattern(on)}</b></div>
      </div>
      {helper && !made && <p className="muted center small-note">{total > target ? "Too much! Turn a card off." : nextCard ? `Tip: the biggest card that still fits is ${nextCard}.` : ""}</p>}
    </div>
  );
}

// A little computer screen that shows what has been "typed" in binary.
function Screen({ text, cursor = true, reply }) {
  return (
    <div className="pc-screen" aria-live="polite">
      <div className="pc-screen-text">{text}{cursor && <span className="pc-cursor">▌</span>}</div>
      {reply && <div className="pc-screen-reply">{reply}</div>}
    </div>
  );
}

// Step: a letter in 8 lamps. Make H (72) and I (73): the screen says HI.
export function LettersInLamps({ onComplete }) {
  const word = "HI";
  const [i, setI] = useState(0);
  const [made, setMade] = useState(false);
  const ch = word[i], code = codeOf(ch);
  const typed = word.slice(0, i + (made ? 1 : 0));
  const next = () => { if (i + 1 >= word.length) { sfx.tada(); onComplete(); } else { setI(i + 1); setMade(false); } };
  return (
    <div className="step-body">
      <Bit mood={made ? "cheer" : "happy"} lamp={made}>
        {made ? `You made ${code}: that's the letter ${ch}! Look at the screen.` : i === 0 ? `Let's type a word in binary! The letter ${ch} is ${code}. Turn on the cards that add up to ${code}.` : `Now the letter ${ch}. It's ${code}.`}
      </Bit>
      <Screen text={typed} />
      <ByteBuilder key={i} target={code} onMade={() => setMade(true)} />
      {made && <div className="row center-row"><button className="btn primary big" onClick={next}>{i + 1 >= word.length ? "Finish ⭐" : `Next letter: ${word[i + 1]} →`}</button></div>}
    </div>
  );
}

// Step: the mission. Build T, H, A by hand; then build the rest or let Bit help.
const BY_HAND = 3;
export function MissionThankYou({ onComplete }) {
  const name = useName();
  const [i, setI] = useState(0); // letters finished
  const [made, setMade] = useState(false);
  const [auto, setAuto] = useState(false);
  const [finished, setFinished] = useState(false);
  const ch = MISSION[i];
  const done = MISSION.slice(0, i);
  // Bit helps: one letter every 0.7 s, so the child still sees each byte appear.
  useEffect(() => {
    if (!auto || finished) return undefined;
    if (i >= MISSION.length) { setFinished(true); sfx.tada(); return undefined; }
    const t = setTimeout(() => { sfx.on(); setI(n => n + 1); }, 700);
    return () => clearTimeout(t);
  }, [auto, i, finished]);
  const next = () => {
    const n = i + 1; setI(n); setMade(false);
    if (n >= MISSION.length) { setFinished(true); sfx.tada(); }
  };
  const bytes = (
    <div className="byte-list" aria-label="What you typed, in binary">
      {[...done].map((c, k) => (
        <div key={k} className="byte-row"><b>{show(c)}</b><span className="muted">{codeOf(c)}</span><MiniLamps bits={bitsOf(codeOf(c))} /><code>{pattern(bitsOf(codeOf(c)))}</code></div>
      ))}
    </div>
  );
  if (finished) {
    return (
      <div className="step-body">
        <Screen text={MISSION} cursor={false} reply={`You're welcome${name ? `, ${name}` : ""}! 😊`} />
        <Bit mood="cheer" lamp>
          {`You did it${name ? `, ${name}` : ""}! You said THANK YOU in the computer's own language. That was 9 letters × 8 lamps = 72 ONs and OFFs!`}
        </Bit>
        {bytes}
        <div className="row center-row"><button className="btn primary big" onClick={onComplete}>Mission complete ⭐</button></div>
      </div>
    );
  }
  return (
    <div className="step-body">
      <Bit mood={made ? "cheer" : "happy"} lamp={made}>
        {auto ? "Watch me type the rest, letter by letter…"
          : made ? `${show(ch)} is done! ${i + 1 < MISSION.length ? "On to the next one." : ""}`
          : i === 0 ? `Mission time! Let's type THANK YOU. The first letter, T, is ${codeOf(ch)}. Make ${codeOf(ch)} with the lamps.`
          : ch === " " ? "Now the space between the words. A space is 32."
          : `Next: ${ch} is ${codeOf(ch)}.`}
      </Bit>
      <Screen text={done} />
      {!auto && <ByteBuilder key={i} target={codeOf(ch)} onMade={() => setMade(true)} />}
      {made && !auto && (
        <div className="row center-row">
          <button className="btn primary big" onClick={next}>{i + 1 >= MISSION.length ? "Send it! 🚀" : `Next: ${show(MISSION[i + 1])} →`}</button>
          {i + 1 >= BY_HAND && i + 1 < MISSION.length && <button className="btn" onClick={() => { next(); setAuto(true); }}>⏩ Let Bit type the rest</button>}
        </div>
      )}
      {bytes}
      <p className="muted center">Letter {Math.min(i + 1, MISSION.length)} of {MISSION.length} (the space counts too!)</p>
    </div>
  );
}

// Bonus: your name in binary.
export function NameInBinary({ onComplete }) {
  const own = useName();
  const [text, setText] = useState(own.slice(0, 12));
  const chars = useMemo(() => [...text].filter(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127).slice(0, 12), [text]);
  const other = [...text].some(c => c.charCodeAt(0) >= 127);
  return (
    <div className="step-body">
      <Bit mood="happy" lamp>Type your name (or any word). Every letter becomes 8 lamps! Small letters have different numbers from capitals: A is 65 but a is 97.</Bit>
      <label className="sr-only" htmlFor="bin-name">Your word</label>
      <input id="bin-name" className="name-input" value={text} maxLength={12} onChange={e => setText(e.target.value)} placeholder="Type here" autoComplete="off" />
      {other && <p className="muted small-note">Letters from other alphabets (like अ, ア or ñ) use bigger codes called Unicode, with more than 8 lamps. Here we show the basic letters.</p>}
      <div className="byte-list">
        {chars.map((c, k) => (
          <div key={k} className="byte-row"><b>{show(c)}</b><span className="muted">{codeOf(c)}</span><MiniLamps bits={bitsOf(codeOf(c))} /><code>{pattern(bitsOf(codeOf(c)))}</code></div>
        ))}
      </div>
      {chars.length > 0 && <p className="center"><b>{chars.length} letters × 8 = {chars.length * 8} lamps</b></p>}
      <div className="row center-row"><button className="btn primary big" disabled={!chars.length} onClick={onComplete}>Finish ⭐</button></div>
    </div>
  );
}

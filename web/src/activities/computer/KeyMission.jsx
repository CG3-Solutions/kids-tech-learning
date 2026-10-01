// Chip's mission: follow a key press from your finger to the screen.
// The child presses a letter, then follows it through six stops (keyboard, trip, CPU, memory,
// drawing, screen), answers two quick predictions, and puts the trip in order.
import { useMemo, useState } from "react";
import Guide, { ChipFace } from "../../components/journey/Guide.jsx";
import Conversation from "../../components/journey/Conversation.jsx";
import Question, { prepare } from "../../components/concept/Question.jsx";
import { MiniLamps } from "../../components/journey/kit.jsx";
import { depthFor } from "../../content/computerDeep.js";
import { CHIP_TALK_KEY, KEY_STOPS, FONT_5x7, KEY_ROWS } from "../../content/computerTalk.js";
import { useApp } from "../../lib/AppContext.jsx";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const bitsOf = n => Array.from({ length: 8 }, (_, i) => Boolean(n & (1 << (7 - i))));
const bitText = n => bitsOf(n).map(b => (b ? 1 : 0)).join("");
const fillIn = (t, L) => t.replaceAll("{L}", L).replaceAll("{code}", String(L.charCodeAt(0))).replaceAll("{bits}", bitText(L.charCodeAt(0)));

export function KeyTalk({ onComplete }) {
  const { activeChild } = useApp();
  return <div className="step-body"><Conversation script={CHIP_TALK_KEY} Face={ChipFace} name={activeChild?.name ?? ""} onComplete={onComplete} doneLabel="Let's explore the parts! →" /></div>;
}

function Keyboard({ onKey, picked }) {
  return (
    <div className="mini-kb" role="group" aria-label="Keyboard">
      {KEY_ROWS.map(row => (
        <div key={row} className="mini-kb-row">
          {[...row].map(k => <button key={k} className={`mini-key${picked === k ? " on" : ""}`} onClick={() => { sfx.click(); onKey(k); }}>{k}</button>)}
        </div>
      ))}
    </div>
  );
}

function Glyph({ L, lit = true }) {
  return (
    <div className="glyph" role="img" aria-label={`The letter ${L} made of pixels`}>
      {FONT_5x7[L].join("").split("").map((c, i) => <i key={i} className={c === "1" && lit ? "on" : ""} />)}
    </div>
  );
}

// The picture for each stop.
function StopVisual({ stop, L }) {
  const code = L.charCodeAt(0);
  if (stop === "key") return <div className="stop-vis"><span className="key-cap pressed">{L}</span><span className="arrow">→</span><span className="switch-closed" aria-hidden="true">⎯●⎯⎯●⎯</span><span className="muted small-note">switch closed</span></div>;
  if (stop === "travel") return <div className="stop-vis"><span className="wire">{[...bitText(code)].map((b, i) => <b key={i} style={{ animationDelay: `${i * 0.12}s` }}>{b}</b>)}</span></div>;
  if (stop === "cpu") return <ol className="mini-prog"><li>A key was pressed: {L}</li><li>Add {L} to the text</li><li>Draw the text on the screen</li></ol>;
  if (stop === "memory") return <div className="stop-vis mem-box"><b>{L}</b><span>=</span><b>{code}</b><span>=</span><MiniLamps bits={bitsOf(code)} /></div>;
  if (stop === "draw") return <div className="stop-vis"><span className="font-letter">{L}</span><span className="arrow">→</span><Glyph L={L} /></div>;
  return <div className="pc-screen key-screen"><div className="pc-screen-text">{L}<span className="pc-cursor">▌</span></div><Glyph L={L} /></div>;
}

// Quick predictions on the way (wrong answers are fine: the reply explains).
const predictions = L => ({
  key: { q: `The keyboard tells the computer which key you pressed. In the end, which number stands for ${L}?`, options: [String(L.charCodeAt(0)), String(L.charCodeAt(0) - 64), "0"], answer: 0,
    why: `${L} is ${L.charCodeAt(0)} in the computer's letter code (A is 65, so ${L} is ${L.charCodeAt(0)}). The keyboard sends a key code first, and the computer turns it into this number.` },
  cpu: { q: "Who decides what to do when a key is pressed?", options: ["The CPU, following the app's instructions", "The keyboard", "The screen"], answer: 0,
    why: "The CPU follows the instructions of the app you're typing in. The keyboard only reports which key was pressed." },
});

const ORDER = { type: "order", q: "Put the key press's trip in order.", items: ["⌨️ Key pressed: a switch closes", "🔌 Code travels to the computer", "🔲 CPU follows the app's instructions", "🗂️ Text kept in memory", "🎨 Letter drawn as pixels", "🖥️ Screen lights up the pixels"],
  why: "Keyboard → computer → CPU → memory → drawing → screen, all in less time than a blink." };

export function KeyMission({ onComplete }) {
  const { activeChild } = useApp();
  const deep = depthFor(activeChild) >= 2;
  const [L, setL] = useState(null);
  const [at, setAt] = useState(0); // stop index; KEY_STOPS.length = order puzzle; +1 = finished
  const [asked, setAsked] = useState({}); // stop id → answered
  const [orderQ] = useState(() => prepare(ORDER));
  const [ordered, setOrdered] = useState(false);
  const stop = KEY_STOPS[at];
  const pred = L && stop ? predictions(L)[stop.id] : null;
  const predQ = useMemo(() => (pred ? prepare(pred) : null), [L, at]); // eslint-disable-line react-hooks/exhaustive-deps
  const go = n => { hush(); setAt(n); window.scrollTo({ top: 0 }); };

  if (!L) {
    return (
      <div className="step-body">
        <Guide Face={ChipFace} say="Mission time! Press any letter on the keyboard, and we'll follow it all the way to the screen.">🎯 Mission time! Press any letter, and we'll follow it all the way to the screen.</Guide>
        <Keyboard onKey={k => { setL(k); sfx.on(); }} />
      </div>
    );
  }
  const trail = (
    <ol className="key-trail" aria-label="The trip">
      {KEY_STOPS.map((s, i) => <li key={s.id} className={i < at ? "done" : i === at ? "on" : ""}><span aria-hidden="true">{s.emoji}</span><small>{s.short}</small></li>)}
    </ol>
  );
  if (stop) {
    const needsAnswer = pred && !asked[stop.id];
    return (
      <div className="step-body">
        {trail}
        <div className="eyebrow">Stop {at + 1} of {KEY_STOPS.length}: {stop.name}</div>
        <Guide Face={ChipFace}>{fillIn(stop.say, L)}</Guide>
        <StopVisual stop={stop.id} L={L} />
        {deep && <p className="deeper-note">🔬 <b>Go deeper:</b> {fillIn(stop.deeper, L)}</p>}
        {predQ && <Question key={`${L}-${stop.id}`} q={predQ} onAnswer={() => setAsked(a => ({ ...a, [stop.id]: true }))} />}
        {!needsAnswer && <div className="row center-row"><button className="btn primary big" onClick={() => go(at + 1)}>{at + 1 < KEY_STOPS.length ? `Next stop: ${KEY_STOPS[at + 1].emoji} ${KEY_STOPS[at + 1].name} →` : "Check the whole trip →"}</button></div>}
      </div>
    );
  }
  if (at === KEY_STOPS.length) {
    return (
      <div className="step-body">
        {trail}
        <Question key="order" q={orderQ} Face={ChipFace} onAnswer={() => setOrdered(true)} />
        {ordered && <div className="row center-row"><button className="btn primary big" onClick={() => { sfx.tada(); go(at + 1); }}>Finish the mission 🎯</button></div>}
      </div>
    );
  }
  return (
    <div className="step-body">
      <div className="pc-screen key-screen"><div className="pc-screen-text">{L}</div><div className="pc-screen-reply">Mission complete! 😊</div></div>
      <Guide Face={ChipFace} mood="cheer">{`You followed ${L} from your finger to the screen: keyboard, trip, CPU, memory, drawing and screen. All that happens in less time than a blink!`}</Guide>
      <div className="row center-row">
        <button className="btn primary big" onClick={onComplete}>Mission complete ⭐</button>
        <button className="btn" onClick={() => { setL(null); setAt(0); setAsked({}); setOrdered(false); }}>⌨️ Follow another letter</button>
      </div>
    </div>
  );
}

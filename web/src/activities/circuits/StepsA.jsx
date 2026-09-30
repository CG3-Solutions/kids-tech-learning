// Part A · Circuit basics (from 2nd standard)
import { useState } from "react";
import { Board, Wire, Battery, Switch, Bulb, Volt } from "./parts.jsx";
import { Question, Choices } from "../../components/journey/kit.jsx";
import Circuit from "../Circuit.jsx";
import { sfx } from "../../lib/sfx.js";

// The standard loop: battery on the left (x 50), load on the right (x 340, y 130).
const TOP = 40, BOT = 220, BX = 50, LX = 340;

// ───────── Step 1: Close the loop ─────────
export function CloseTheLoop({ onComplete }) {
  const [closed, setClosed] = useState(false);
  const [flips, setFlips] = useState(0);
  const toggle = () => { setClosed(c => !c); setFlips(f => f + 1); };
  const ask = flips >= 2;
  return (
    <div className="step-body">
      <Volt mood={closed ? "cheer" : "happy"} lamp={closed}>
        {flips === 0 ? "Hi! I'm Volt, a battery. I push electricity around a loop. Tap the switch to close the loop!"
          : closed ? "The loop is closed! Electricity flows all the way round, so the bulb glows."
          : ask ? "Now the loop is open again, and the bulb went dark." : "Now tap the switch again to open it."}
      </Volt>
      <Board label="A battery, a switch and a bulb in a loop">
        <Wire d={`M${BX} 118 V${TOP} H150`} live={closed} />
        <Wire d={`M210 ${TOP} H${LX} V106`} live={closed} />
        <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={closed} />
        <Battery x={BX} y={130} />
        <Switch x={150} y={TOP} len={60} closed={closed} onToggle={toggle} label="Switch" />
        <Bulb x={LX} y={130} on={closed} />
      </Board>
      <div className="row center-row"><button className={`switch-btn${closed ? "" : " off"}`} onClick={() => { closed ? sfx.off() : sfx.on(); toggle(); }}>{closed ? "Switch OFF" : "Switch ON"}</button></div>
      {ask && !closed && (
        <Question q="Why did the bulb go dark?" right="loop"
          options={[{ value: "loop", label: "🔓 The loop was opened" }, { value: "tired", label: "😴 The battery got tired" }, { value: "sleep", label: "💤 The bulb went to sleep" }]}
          rightMsg="Yes! The switch opened the loop, so electricity couldn't get round." wrongMsg="Look at the switch. What happened to the loop?" onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Step 2: Loop detective ─────────
const SEGS = [
  [BX, 118, BX, TOP], [BX, TOP, 200, TOP], [200, TOP, LX, TOP], [LX, TOP, LX, 106],
  [LX, 154, LX, BOT], [LX, BOT, 200, BOT], [200, BOT, BX, BOT], [BX, BOT, BX, 142],
];
// Segments 4 and 7 run past the bulb and battery labels, so the gap is never put there.
const BREAKABLE = [0, 1, 2, 3, 5, 6];
const pickBroken = prev => { let i; do { i = BREAKABLE[Math.floor(Math.random() * BREAKABLE.length)]; } while (i === prev); return i; };
export function LoopDetective({ onComplete }) {
  const GAPS = [36, 22, 12];
  const [round, setRound] = useState(0);
  const [broken, setBroken] = useState(() => pickBroken(-1));
  const [fixed, setFixed] = useState(false);
  const [msg, setMsg] = useState(null);
  const tap = i => {
    if (fixed) return;
    if (i === broken) { setFixed(true); setMsg(null); sfx.ding(); } else { sfx.oops(); setMsg("That wire is fine. Look for a gap!"); }
  };
  const next = () => {
    if (round >= GAPS.length - 1) return onComplete();
    setRound(round + 1); setBroken(pickBroken(broken)); setFixed(false);
  };
  const gap = GAPS[round] / 2;
  return (
    <div className="step-body">
      <Volt mood={fixed ? "cheer" : "wow"} lamp={fixed}>
        {fixed ? "You found the gap and fixed it! Now the loop is complete and the bulb glows."
          : round === 0 ? "Oh no! The switch is ON but the bulb won't light. Somewhere the loop is broken. Tap the broken wire to fix it!"
          : "Another broken circuit! This gap is smaller. Look carefully."}
      </Volt>
      <Board label="A loop with one broken wire">
        {SEGS.map(([x1, y1, x2, y2], i) => {
          const hit = <line key={`h${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="28" style={{ cursor: "pointer" }} onClick={() => tap(i)} />;
          if (i !== broken || fixed) return <g key={i}><Wire d={`M${x1} ${y1} L${x2} ${y2}`} live={fixed} />{hit}</g>;
          const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = Math.sign(x2 - x1) * gap, dy = Math.sign(y2 - y1) * gap;
          return (
            <g key={i}>
              <Wire d={`M${x1} ${y1} L${mx - dx} ${my - dy}`} /><Wire d={`M${mx + dx} ${my + dy} L${x2} ${y2}`} />
              <circle cx={mx - dx} cy={my - dy} r="4" fill="var(--ink)" /><circle cx={mx + dx} cy={my + dy} r="4" fill="var(--ink)" />
              {hit}
            </g>
          );
        })}
        <Battery x={BX} y={130} />
        <Bulb x={LX} y={130} on={fixed} />
      </Board>
      {msg && <p className="fb-line bad">{msg}</p>}
      {fixed && <div className="row center-row"><button className="btn primary big" onClick={next}>{round >= GAPS.length - 1 ? "Finish ⭐" : "Next circuit →"}</button></div>}
      <p className="muted center">Circuit {round + 1} of {GAPS.length}</p>
    </div>
  );
}

// ───────── Step 3: Will it light? ─────────
const ITEMS = [
  { id: "spoon", e: "🥄", n: "Steel spoon", c: true }, { id: "eraser", e: "🧽", n: "Rubber eraser", c: false },
  { id: "coin", e: "🪙", n: "Coin", c: true }, { id: "paper", e: "📄", n: "Paper", c: false },
  { id: "key", e: "🔑", n: "Key", c: true }, { id: "ruler", e: "📏", n: "Plastic ruler", c: false },
  { id: "clip", e: "📎", n: "Paper clip", c: true }, { id: "leaf", e: "🍃", n: "Leaf", c: false },
  { id: "foil", e: "🌯", n: "Kitchen foil", c: true }, { id: "stick", e: "🪵", n: "Wooden stick", c: false },
];
const NEED = 6;
export function WillItLight({ onComplete }) {
  const [item, setItem] = useState(null);
  const [guess, setGuess] = useState(null);
  const [tested, setTested] = useState([]);
  const lit = item && guess !== null && item.c;
  const choose = it => { if (tested.some(t => t.id === it.id)) return; sfx.click(); setItem(it); setGuess(null); };
  const predict = g => {
    setGuess(g);
    setTimeout(() => (item.c ? sfx.on() : sfx.oops()), 200);
    const t = [...tested, item];
    setTested(t);
  };
  const conductors = tested.filter(t => t.c), insulators = tested.filter(t => !t.c);
  const done = tested.length >= NEED && guess !== null;
  return (
    <div className="step-body">
      <Volt mood={guess === null ? "happy" : item?.c ? "cheer" : "wow"} lamp={Boolean(lit)}>
        {!item ? "There's a gap in this loop. Let's put things in the gap. Will electricity go through them? Pick something!"
          : guess === null ? `The ${item.n.toLowerCase()} is in the gap. Do you think the bulb will light?`
          : item.c ? `It lights! ${item.n} is metal. Metal lets electricity through. We call it a conductor.${guess ? " You guessed right!" : ""}`
          : `No light. ${item.n} stops electricity. We call it an insulator.${!guess ? " You guessed right!" : ""}`}
      </Volt>
      <Board label="A loop with a gap to test things in">
        <Wire d={`M${BX} 118 V${TOP} H170`} live={lit} />
        <Wire d={`M230 ${TOP} H${LX} V106`} live={lit} />
        <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={lit} />
        <circle cx="170" cy={TOP} r="6" fill="var(--ink)" /><circle cx="230" cy={TOP} r="6" fill="var(--ink)" />
        <text x="200" y={TOP + 12} fontSize="34" textAnchor="middle">{item ? item.e : ""}</text>
        {!item && <text x="200" y={TOP + 30} fontSize="13" textAnchor="middle" className="muted-text">gap</text>}
        <Battery x={BX} y={130} />
        <Bulb x={LX} y={130} on={Boolean(lit)} />
      </Board>
      {item && guess === null && (
        <Choices options={[{ value: true, label: "💡 Yes, it will light" }, { value: false, label: "⚫ No, it won't" }]} onPick={predict} />
      )}
      <div className="tray">
        {ITEMS.map(it => {
          const t = tested.some(x => x.id === it.id);
          return <button key={it.id} className={`tray-item${t ? (it.c ? " yes" : " no") : ""}`} disabled={t || (item && guess === null)} onClick={() => choose(it)}><span>{it.e}</span>{it.n}</button>;
        })}
      </div>
      <div className="bins">
        <div className="bin yes"><b>⚡ Lets electricity through</b><small>Conductors</small><div>{conductors.map(t => <span key={t.id} title={t.n}>{t.e}</span>)}</div></div>
        <div className="bin no"><b>🛑 Stops electricity</b><small>Insulators</small><div>{insulators.map(t => <span key={t.id} title={t.n}>{t.e}</span>)}</div></div>
      </div>
      <p className="muted center">Tested {Math.min(tested.length, NEED)} of {NEED}</p>
      {done && (
        <Question q="Why are wires covered in plastic?" right="safe"
          options={[{ value: "safe", label: "🛡️ Plastic stops electricity, so it keeps us safe" }, { value: "pretty", label: "🎨 To make them colourful" }, { value: "fast", label: "🏎️ To make electricity faster" }]}
          rightMsg="Exactly! Metal inside carries electricity. Plastic outside keeps our hands safe." onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Step 4: Swap the part ─────────
const TASKS = [
  { id: "bulb", t: "💡 Light the bulb" }, { id: "motor", t: "⚙️ Spin the motor" }, { id: "buzzer", t: "🔔 Ring the buzzer" },
  { id: "led", t: "🔴 Make the LED glow" }, { id: "ledback", t: "🔄 Turn the LED around. Does it still glow?" },
];
export function SwapThePart({ onComplete }) {
  const [got, setGot] = useState(new Set());
  const onState = ({ dev, works, flipped, closed }) => {
    const add = id => setGot(g => { if (g.has(id)) return g; sfx.ding(); const n = new Set(g).add(id); if (n.size === TASKS.length) setTimeout(onComplete, 1200); return n; });
    if (works) add(dev);
    if (dev === "led" && flipped && closed) add("ledback");
  };
  return (
    <div className="step-body">
      <Volt mood="happy">The same loop can make light, movement or sound! Switch ON, then try every part. Can you tick all five?</Volt>
      <ul className="checklist">{TASKS.map(t => <li key={t.id} className={got.has(t.id) ? "done" : ""}>{got.has(t.id) ? "✅" : "⬜"} {t.t}</li>)}</ul>
      <Circuit onState={onState} />
    </div>
  );
}

// ───────── Step 5: Brighter or dimmer ─────────
export function BrighterDimmer({ onComplete }) {
  const [bats, setBats] = useState(1);
  const [knob, setKnob] = useState(0);
  const level = Math.max(0, Math.min(3, bats - knob));
  const [task, setTask] = useState(0);
  const TARGETS = [{ lv: 3, t: "Make the bulb SUPER bright ✨" }, { lv: 1, t: "Now make it glow just a little 🕯️" }];
  const set = (b, k) => {
    setBats(b); setKnob(k);
    const lv = Math.max(0, Math.min(3, b - k));
    if (task < TARGETS.length && lv === TARGETS[task].lv) { sfx.ding(); setTask(task + 1); }
  };
  const words = ["off", "dim", "medium", "super bright"];
  return (
    <div className="step-body">
      <Volt mood={level === 3 ? "cheer" : "happy"} lamp={level > 0}>
        {task < TARGETS.length ? `${TARGETS[task].t} More batteries push harder. The knob holds electricity back.` : "You're in control! More batteries make it brighter. The knob, called a resistor, makes it dimmer."}
      </Volt>
      <Board label="Batteries, a dimmer knob and a bulb">
        <Wire d={`M${BX} ${130 - bats * 18 - 6} V${TOP} H150`} live={level > 0} />
        <path d={`M150 ${TOP} l6 -10 12 20 12 -20 12 20 12 -20 12 20 6 -10`} className="w" style={{ fill: "none" }} />
        <path d={`M150 ${TOP} l6 -10 12 20 12 -20 12 20 12 -20 12 20 6 -10`} className={`flow${level > 0 ? " live" : ""}`} />
        <path d={`M${180 + knob * 12} ${TOP - 30} v14 m-5 -6 l5 6 5 -6`} stroke="var(--plus)" strokeWidth="3" fill="none" />
        <text x="186" y={TOP + 32} fontSize="13" textAnchor="middle">Knob</text>
        <Wire d={`M222 ${TOP} H${LX} V106`} live={level > 0} />
        <Wire d={`M${LX} 154 V${BOT} H${BX} V${130 + bats * 18 + 6}`} live={level > 0} />
        {Array.from({ length: bats }, (_, i) => {
          const y = 130 - (bats - 1) * 18 + i * 36;
          return <g key={i}><Battery x={BX} y={y} label={i === bats - 1 ? `${bats} ${bats === 1 ? "battery" : "batteries"}` : ""} />{i > 0 && <line x1={BX} y1={y - 24} x2={BX} y2={y - 12} className="w" />}</g>;
        })}
        <Bulb x={LX} y={130} on={level > 0} level={level} label={`Bulb: ${words[level]}`} />
      </Board>
      <div className="controls">
        <div><span className="eyebrow">Batteries</span><div className="row">{[1, 2, 3].map(b => <button key={b} className="chip" aria-pressed={bats === b} onClick={() => set(b, knob)}>{"🔋".repeat(b)}</button>)}</div></div>
        <div><span className="eyebrow">Knob (resistor)</span><div className="row">{["Low", "Medium", "High"].map((k, i) => <button key={k} className="chip" aria-pressed={knob === i} onClick={() => set(bats, i)}>{k}</button>)}</div></div>
      </div>
      {task >= TARGETS.length && (
        <Question q="At home, what works like this knob?" right="reg"
          options={[{ value: "reg", label: "🌀 The fan regulator" }, { value: "tap", label: "🚰 The doorbell" }, { value: "tv", label: "📺 The TV screen" }]}
          rightMsg="Yes! The fan regulator lets more or less electricity through to change the speed." onRight={onComplete} />
      )}
    </div>
  );
}


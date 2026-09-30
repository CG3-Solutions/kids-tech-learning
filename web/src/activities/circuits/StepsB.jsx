// Part B · Switches that think (AND and OR for everyone after Part A; NOT and XOR from 4th standard)
import { useState } from "react";
import { Board, Wire, Battery, Switch, Bulb, Motor, Led, Volt, GateShape, LWire, InputToggle, OutLamp, gatePins } from "./parts.jsx";
import { Question, Choices, TruthTable, keyOf, useAnswer, Feedback } from "../../components/journey/kit.jsx";
import { GATES, combos } from "../../lib/logic.js";
import { sfx } from "../../lib/sfx.js";

const TOP = 40, BOT = 220, BX = 50, LX = 340;
const useSeen = () => {
  const [seen, setSeen] = useState(new Set());
  return [seen, vals => setSeen(s => (s.has(keyOf(vals)) ? s : new Set(s).add(keyOf(vals)))), () => setSeen(new Set())];
};

// Two switches, a load, and a truth table that fills in. `wiring` draws the circuit.
function TwoSwitches({ names, output, fn, intro, done, wiring, question, onComplete }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [seen, mark] = useSeen();
  const set = (na, nb) => { setA(na); setB(nb); mark([na, nb]); };
  const out = fn(a, b);
  const all = seen.size === 4;
  return (
    <div className="step-body">
      <Volt mood={out ? "cheer" : "happy"} lamp={out}>{all ? done : seen.size === 0 ? intro : out ? `${output} is ON!` : `${output} is OFF. Try another way.`}</Volt>
      <div className="bench">
        <div className="panel flat">{wiring({ a, b, out, toggleA: () => set(!a, b), toggleB: () => set(a, !b) })}</div>
        <TruthTable inputs={names} output={output} fn={fn} seen={seen} current={[a, b]} />
      </div>
      <div className="row center-row">
        <button className={`switch-btn small${a ? "" : " off"}`} onClick={() => { a ? sfx.off() : sfx.on(); set(!a, b); }}>{names[0]}: {a ? "ON" : "OFF"}</button>
        <button className={`switch-btn small${b ? "" : " off"}`} onClick={() => { b ? sfx.off() : sfx.on(); set(a, !b); }}>{names[1]}: {b ? "ON" : "OFF"}</button>
      </div>
      {all && <Question {...question} onRight={onComplete} />}
    </div>
  );
}

// ───────── Step 6: AND (switches in a row) ─────────
export function AndSwitches({ onComplete }) {
  return (
    <TwoSwitches names={["🔒 Lid", "▶️ Button"]} output="⚙️ Mixer" fn={GATES.AND.fn}
      intro="This is a mixer grinder. For safety it has TWO switches in a row: the lid lock and the start button. Try every way of switching them!"
      done="You tried all four! The mixer runs only when the lid is locked AND the button is pressed. Two switches in a row make an AND."
      question={{ q: "When does the mixer run?", right: "both", options: [{ value: "both", label: "Only when BOTH are ON" }, { value: "any", label: "When ANY one is ON" }, { value: "always", label: "Always" }], rightMsg: "Yes! That's AND: both must be ON." }}
      onComplete={onComplete}
      wiring={({ a, b, out, toggleA, toggleB }) => (
        <Board label="Two switches in a row powering a mixer motor">
          <Wire d={`M${BX} 118 V${TOP} H100`} live={out} />
          <Switch x={100} y={TOP} len={50} closed={a} onToggle={toggleA} label="🔒 Lid" />
          <Wire d={`M150 ${TOP} H210`} live={out} />
          <Switch x={210} y={TOP} len={50} closed={b} onToggle={toggleB} label="▶️ Button" />
          <Wire d={`M260 ${TOP} H${LX} V106`} live={out} />
          <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={out} />
          <Battery x={BX} y={130} />
          <Motor x={LX} y={130} on={out} label="Mixer" />
        </Board>
      )} />
  );
}

// ───────── Step 7: OR (switches side by side) ─────────
export function OrSwitches({ onComplete }) {
  return (
    <TwoSwitches names={["🚪 Left door", "🚪 Right door"]} output="💡 Car light" fn={GATES.OR.fn}
      intro="This is the light inside a car. Each door has its own switch, side by side. Open the doors in every way you can!"
      done="All four tried! The light turns on when the left door OR the right door is open, or both. Two switches side by side make an OR."
      question={{ q: "When does the car light turn on?", right: "any", options: [{ value: "both", label: "Only when BOTH doors are open" }, { value: "any", label: "When EITHER door is open" }, { value: "never", label: "Never" }], rightMsg: "Yes! That's OR: either one is enough." }}
      onComplete={onComplete}
      wiring={({ a, b, out, toggleA, toggleB }) => (
        <Board label="Two switches side by side powering a light">
          <Wire d={`M${BX} 118 V${TOP} H110`} live={out} />
          <Switch x={110} y={TOP} len={56} closed={a} onToggle={toggleA} />
          <text x="138" y={TOP - 16} fontSize="13" textAnchor="middle">🚪 Left</text>
          <Wire d={`M166 ${TOP} H250`} live={a} />
          <Wire d={`M110 ${TOP} V110`} live={b} />
          <Switch x={110} y={110} len={56} closed={b} onToggle={toggleB} label="🚪 Right" />
          <Wire d={`M166 110 H250 V${TOP}`} live={b} />
          <Wire d={`M250 ${TOP} H${LX} V106`} live={out} />
          <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={out} />
          <Battery x={BX} y={170} label="" />
          <Bulb x={LX} y={130} on={out} label="Car light" />
        </Board>
      )} />
  );
}

// ───────── Step 8: NOT (the upside-down switch) ─────────
export function NotSwitch({ onComplete }) {
  const [day, setDay] = useState(false);
  const [seen, mark] = useSeen();
  const out = !day;
  const flip = () => { const d = !day; setDay(d); mark([d]); d ? sfx.off() : sfx.on(); };
  return (
    <div className="step-body">
      <Volt mood={out ? "cheer" : "happy"} lamp={out}>
        {seen.size === 0 ? "This street light has a special upside-down switch. When the sun is up, the switch OPENS. Tap the sun to change day and night!"
          : seen.size < 2 ? (day ? "Daytime: the switch is pushed open, so the light is OFF." : "Night-time: the switch springs closed, so the light is ON.")
          : "The light is ON when it is NOT daytime. The switch does the opposite. We call it NOT."}
      </Volt>
      <div className="bench">
        <div className={`panel flat sky${day ? " day" : " night"}`}>
          <Board label="A street light with an upside-down switch">
            <Wire d={`M${BX} 118 V${TOP} H160`} live={out} />
            <Switch x={160} y={TOP} len={60} closed={!day} normallyClosed label="Sun sensor" />
            <Wire d={`M220 ${TOP} H${LX} V106`} live={out} />
            <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={out} />
            <Battery x={BX} y={130} />
            <Bulb x={LX} y={130} on={out} label="Street light" />
            <text x="190" y="160" fontSize="44" textAnchor="middle" style={{ cursor: "pointer" }} onClick={flip}>{day ? "☀️" : "🌙"}</text>
          </Board>
        </div>
        <TruthTable inputs={["☀️ Daytime"]} output="💡 Light" fn={GATES.NOT.fn} seen={seen} current={[day]} />
      </div>
      <div className="row center-row"><button className={`switch-btn small${day ? "" : " off"}`} onClick={flip}>{day ? "☀️ Day → make it night" : "🌙 Night → make it day"}</button></div>
      {seen.size === 2 && (
        <Question q="The street light is ON when…" right="notday"
          options={[{ value: "notday", label: "It is NOT daytime" }, { value: "day", label: "It is daytime" }, { value: "always", label: "Always" }]}
          rightMsg="Yes! NOT gives the opposite. The fridge light works like this too." onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Step 9: XOR (staircase switch) ─────────
export function StaircaseSwitch({ onComplete }) {
  const [a, setA] = useState(false); // bottom switch
  const [b, setB] = useState(false); // top switch
  const [seen, mark] = useSeen();
  const out = a !== b;
  const set = (na, nb) => { setA(na); setB(nb); mark([na, nb]); sfx.click(); };
  // Lever positions: A OFF → upper wire, ON → lower wire. B ON → upper wire, OFF → lower wire.
  const aEnd = a ? [170, 110] : [170, 50], bEnd = b ? [240, 50] : [240, 110];
  const upperLive = out && !a, lowerLive = out && a;
  return (
    <div className="step-body">
      <Volt mood={out ? "cheer" : "happy"} lamp={out}>
        {seen.size === 0 ? "Stairs have a light with a switch at the bottom AND at the top. Flip either switch and see what happens!"
          : seen.size < 4 ? (out ? "The light is ON. Now flip one switch." : "The light is OFF. Flip one switch.")
          : "Flipping EITHER switch changes the light. It's ON when the switches are different. We call this XOR."}
      </Volt>
      <div className="bench">
        <div className="panel flat">
          <Board label="A staircase light with two switches">
            <Wire d={`M${BX} 118 V80 H110`} live={out} />
            <line className="sw-lever" x1="110" y1="80" x2={aEnd[0]} y2={aEnd[1]} />
            <circle className="term" cx="110" cy="80" r="6" />
            <Wire d="M170 50 H240" live={upperLive} /><Wire d="M170 110 H240" live={lowerLive} />
            <circle className="term" cx="170" cy="50" r="5" /><circle className="term" cx="170" cy="110" r="5" />
            <circle className="term" cx="240" cy="50" r="5" /><circle className="term" cx="240" cy="110" r="5" />
            <line className="sw-lever" x1="300" y1="80" x2={bEnd[0]} y2={bEnd[1]} />
            <circle className="term" cx="300" cy="80" r="6" />
            <Wire d={`M300 80 H${LX} V106`} live={out} />
            <Wire d={`M${LX} 154 V${BOT} H${BX} V142`} live={out} />
            <text x="140" y="140" fontSize="13" textAnchor="middle">⬇️ Bottom</text>
            <text x="270" y="140" fontSize="13" textAnchor="middle">⬆️ Top</text>
            <Battery x={BX} y={130} label="" />
            <Bulb x={LX} y={130} on={out} label="Stair light" />
          </Board>
        </div>
        <TruthTable inputs={["⬇️ Bottom", "⬆️ Top"]} output="💡 Light" fn={GATES.XOR.fn} seen={seen} current={[a, b]} />
      </div>
      <div className="row center-row">
        <button className="switch-btn small" onClick={() => set(!a, b)}>⬇️ Flip bottom switch</button>
        <button className="switch-btn small" onClick={() => set(a, !b)}>⬆️ Flip top switch</button>
      </div>
      {seen.size === 4 && (
        <Question q="The light is ON. You walk upstairs and flip the top switch. What happens?" right="off"
          options={[{ value: "off", label: "The light turns OFF" }, { value: "on", label: "It stays ON" }, { value: "blink", label: "It blinks" }]}
          rightMsg="Right! Either switch changes the light. That's why it's so handy on stairs." onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Step 10: Electric fingers (relay, then transistor) ─────────
export function ElectricFingers({ onComplete }) {
  const [button, setButton] = useState(false);
  const [relayDone, setRelayDone] = useState(false);
  const [signal, setSignal] = useState(false);
  const [trDone, setTrDone] = useState(false);
  const press = () => {
    const n = !button; setButton(n);
    if (n) { setTimeout(sfx.click, 120); if (!relayDone) setTimeout(() => { sfx.ding(); setRelayDone(true); }, 700); } else sfx.off();
  };
  const toggleSignal = () => { const n = !signal; setSignal(n); n ? sfx.on() : sfx.off(); if (n && !trDone) setTimeout(() => { sfx.ding(); setTrDone(true); }, 500); };
  return (
    <div className="step-body">
      <Volt mood={button || signal ? "cheer" : "happy"} lamp={button || signal}>
        {!relayDone ? "Here are TWO loops. The small loop has a button and a coil of wire. The big loop has a fan. Press the small button and watch!"
          : !trDone ? "The coil became a magnet and pulled the fan's switch closed. Click! Electricity pressed the switch. Now meet the tiny version: a transistor. Tap its signal!"
          : "A transistor is a switch pressed by electricity, with no moving parts. A phone chip has billions of them!"}
      </Volt>
      <div className="panel flat">
        <Board label="A small loop with a button and coil controls a big loop with a fan" h={250}>
          <Wire d="M40 118 V50 H70" live={button} />
          <Switch x={70} y={50} len={44} closed={button} onToggle={press} label="Button" />
          <Wire d="M114 50 H150 V92" live={button} />
          <rect x="138" y="92" width="24" height="56" rx="4" fill={button ? "var(--spark)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="3" className={button ? "bit-glow" : ""} />
          <path d="M138 100 h24 M138 110 h24 M138 120 h24 M138 130 h24 M138 140 h24" stroke="var(--ink)" strokeWidth="2" />
          <text x="150" y="168" fontSize="12" textAnchor="middle">Coil</text>
          <Wire d="M150 148 V210 H40 V142" live={button} />
          <Battery x={40} y={130} label="Small" />
          <line x1="180" y1="10" x2="180" y2="240" stroke="var(--line)" strokeDasharray="6 6" />
          <Wire d="M230 118 V50 H250" live={button} />
          <Switch x={250} y={50} len={48} closed={button} label="Relay switch" />
          <path d="M160 100 Q200 80 262 62" stroke="var(--plus)" strokeWidth="2" strokeDasharray="4 4" fill="none" opacity={button ? 1 : 0.3} />
          <Wire d="M298 50 H350 V100" live={button} />
          <Wire d="M350 150 V210 H230 V142" live={button} />
          <Battery x={230} y={130} label="Big" big />
          <Motor x={350} y={125} on={button} label="Fan" />
        </Board>
      </div>
      {relayDone && (
        <div className="panel flat">
          <Board label="A transistor switching an LED" h={150}>
            <InputToggle x={16} y={75} on={signal} onToggle={toggleSignal} label="Signal" />
            <LWire from={[80, 75]} to={[170, 75]} on={signal} />
            <circle cx="200" cy="75" r="30" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
            <line x1="182" y1="58" x2="182" y2="92" stroke="var(--ink)" strokeWidth="4" />
            <line x1="182" y1="68" x2="214" y2="50" stroke="var(--ink)" strokeWidth="3" /><line x1="182" y1="82" x2="214" y2="100" stroke="var(--ink)" strokeWidth="3" />
            <text x="200" y="128" fontSize="12" textAnchor="middle">Transistor</text>
            <LWire from={[214, 50]} to={[300, 40]} on={signal} />
            <Led x={320} y={75} on={signal} label="" />
            <text x="320" y="128" fontSize="12" textAnchor="middle">LED</text>
          </Board>
        </div>
      )}
      {trDone && (
        <Question q="What presses the switch inside a relay?" right="magnet"
          options={[{ value: "magnet", label: "🧲 A magnet made by electricity" }, { value: "finger", label: "👆 A tiny finger" }, { value: "wind", label: "💨 The wind" }]}
          rightMsg="Yes! Electricity makes the coil a magnet, and the magnet pulls the switch." onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Gate diagram used by steps 11–13 ─────────
// Inputs on the left, an optional NOT on input B, one gate (or a “?” slot), and an output lamp.
export function GateMachine({ gate, inputs, values, onToggle, outLabel, notOnB = false }) {
  const two = !gate || GATES[gate].inputs === 2;
  const single = inputs.length === 1; // one input: a two-input gate gets it on both pins
  const GX = 200, GY = 70;
  const ys = single ? [100] : [60, 150];
  const bVal = single ? values[0] : notOnB ? !values[1] : values[1];
  const out = gate ? (two ? GATES[gate].fn(values[0], bVal) : GATES[gate].fn(values[0])) : false;
  const pins = gate ? gatePins(gate, GX, GY) : { ins: [[GX, 88], [GX, 112]], out: [GX + 80, 100] };
  return (
    <Board label={`${gate ?? "Unknown"} gate machine`} h={210}>
      {inputs.map((name, i) => <InputToggle key={i} x={16} y={ys[i]} on={values[i]} onToggle={onToggle ? () => onToggle(i) : undefined} label={name} />)}
      <LWire from={[80, ys[0]]} to={pins.ins[0]} on={values[0]} />
      {two && single && <LWire from={[80, ys[0]]} to={pins.ins[1]} on={values[0]} />}
      {two && !single && !notOnB && <LWire from={[80, ys[1]]} to={pins.ins[1]} on={values[1]} />}
      {two && !single && notOnB && (
        <>
          <LWire from={[80, ys[1]]} to={[100, 150]} on={values[1]} />
          <g transform="translate(100 120) scale(.75) translate(-100 -120)"><GateShape type="NOT" x={100} y={120} on={bVal} /></g>
          <LWire from={[152, 150]} to={pins.ins[1]} on={bVal} />
        </>
      )}
      {gate ? <GateShape type={gate} x={GX} y={GY} on={out} />
        : <g><rect x={GX} y={GY} width="80" height="60" rx="10" className="gate-slot" /><text x={GX + 40} y={GY + 38} textAnchor="middle" fontSize="24" fontWeight="700">?</text></g>}
      <LWire from={pins.out} to={[330, 100]} on={out} />
      <OutLamp x={350} y={100} on={out} label={outLabel} />
    </Board>
  );
}

// ───────── Step 11: Meet the gates ─────────
const GATE_INFO = {
  AND: { like: "Two switches in a row, like the mixer grinder.", emoji: "🔒" },
  OR: { like: "Two switches side by side, like the car doors.", emoji: "🚪" },
  NOT: { like: "The upside-down switch, like the street light.", emoji: "🌙" },
  XOR: { like: "The staircase switch.", emoji: "🪜" },
};
export function MeetTheGates({ grade, onComplete }) {
  const list = grade >= 4 ? ["AND", "OR", "NOT", "XOR"] : ["AND", "OR"];
  const [gi, setGi] = useState(0);
  const [vals, setVals] = useState([false, false]);
  const [seen, mark, resetSeen] = useSeen();
  const gate = list[gi];
  const n = GATES[gate].inputs;
  const complete = seen.size === 2 ** n;
  const toggle = i => { const v = vals.map((x, j) => (j === i ? !x : x)); setVals(v); mark(v.slice(0, n)); };
  const next = () => { if (gi >= list.length - 1) return onComplete(); setGi(gi + 1); setVals([false, false]); resetSeen(); };
  return (
    <div className="step-body">
      <Volt mood={complete ? "cheer" : "happy"}>
        {complete ? `The ${gate} gate is ${GATES[gate].says}. ${GATE_INFO[gate].like}`
          : gi === 0 ? `Engineers draw switch circuits as little shapes called gates. My friend Bit writes ON as 1 and OFF as 0. This is the ${gate} gate. Tap the inputs and fill in its table!`
          : `This is the ${gate} gate. Try every input to fill its table.`}
      </Volt>
      <div className="chips center-row">{list.map((g, i) => <span key={g} className={`chip${i === gi ? " active" : ""}`}>{GATE_INFO[g].emoji} {g}{i < gi ? " ✓" : ""}</span>)}</div>
      <div className="bench">
        <div className="panel flat"><GateMachine key={gate} gate={gate} inputs={n === 2 ? ["A", "B"] : ["A"]} values={vals} onToggle={toggle} outLabel="Out" /></div>
        <TruthTable key={`t-${gate}`} inputs={n === 2 ? ["A", "B"] : ["A"]} output="Out" fn={GATES[gate].fn} seen={seen} current={vals.slice(0, n)} />
      </div>
      {complete && <div className="row center-row"><button className="btn primary big" onClick={next}>{gi >= list.length - 1 ? "Finish ⭐" : `Next gate: ${list[gi + 1]} →`}</button></div>}
    </div>
  );
}

// ───────── Step 12: Gate detective ─────────
const PUZZLES = [
  { title: "Mixer grinder", story: "The mixer should run only if the lid is locked and the button is pressed.", inputs: ["🔒 Lid", "▶️ Button"], out: "⚙️ Mixer", answer: "AND", options: ["AND", "OR"] },
  { title: "Two doorbells", story: "The bell should ring if someone presses the front button or the back button.", inputs: ["🚪 Front", "🚪 Back"], out: "🔔 Bell", answer: "OR", options: ["AND", "OR"] },
  { title: "Clothes alarm", story: "Beep if it is raining and the clothes are still outside!", inputs: ["🌧️ Rain", "👕 Clothes out"], out: "🔔 Beep", answer: "AND", options: ["AND", "OR"] },
  { title: "Classroom fan", story: "The fan should switch on if the teacher or the monitor presses their switch.", inputs: ["👩‍🏫 Teacher", "🧒 Monitor"], out: "🌀 Fan", answer: "OR", options: ["AND", "OR"] },
  { title: "Night lamp", story: "The garden lamp should be ON when it is not daytime.", inputs: ["☀️ Daytime"], out: "💡 Lamp", answer: "NOT", options: ["AND", "OR", "NOT"], older: true },
  { title: "Staircase", story: "Flipping either switch should change the stair light.", inputs: ["⬇️ Bottom", "⬆️ Top"], out: "💡 Light", answer: "XOR", options: ["AND", "OR", "XOR"], older: true },
  { title: "Seatbelt alarm", story: "Beep if the car is moving and the seatbelt is NOT buckled. (The NOT is already fitted.)", inputs: ["🚗 Moving", "🔗 Buckled"], out: "🔔 Beep", answer: "AND", options: ["AND", "OR", "XOR"], notOnB: true, older: true },
];
export function GateDetective({ grade, onComplete }) {
  const list = PUZZLES.filter(p => grade >= 4 || !p.older);
  const [pi, setPi] = useState(0);
  const [gate, setGate] = useState(null);
  const [vals, setVals] = useState([false, false]);
  const [result, setResult] = useState(null);
  const [feedback, check, clear] = useAnswer();
  const p = list[pi];
  const n = p.inputs.length;
  const want = (a, b) => { const bb = p.notOnB ? !b : b; return n === 1 ? GATES[p.answer].fn(a) : GATES[p.answer].fn(a, bb); };
  const have = (a, b) => {
    if (!gate) return false;
    if (GATES[gate].inputs === 1) return GATES[gate].fn(a);
    if (n === 1) return GATES[gate].fn(a, a);
    return GATES[gate].fn(a, p.notOnB ? !b : b);
  };
  const test = () => {
    const rows = combos(n).map(r => ({ r, ok: have(...r) === want(...r) }));
    setResult(rows);
    check(rows.every(x => x.ok), "Your machine works for every case! 🕵️⭐", "Some cases are wrong (see ✗). Try another gate.");
  };
  const next = () => { if (pi >= list.length - 1) return onComplete(); setPi(pi + 1); setGate(null); setVals([false, false]); setResult(null); clear(); };
  const solved = feedback?.ok;
  return (
    <div className="step-body">
      <Volt mood={solved ? "cheer" : "wow"}>{`Case ${pi + 1}: ${p.title}. ${p.story} Which gate should go in the box?`}</Volt>
      <div className="bench">
        <div className="panel flat">
          <GateMachine gate={gate} inputs={p.inputs} values={vals} outLabel={p.out} notOnB={p.notOnB}
            onToggle={i => { setVals(v => v.map((x, j) => (j === i ? !x : x))); setResult(null); }} />
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <span className="eyebrow">Pick a gate</span>
          <Choices options={p.options.filter(o => n === 1 || GATES[o].inputs === 2).map(o => ({ value: o, label: o }))} onPick={g => { setGate(g); setResult(null); clear(); sfx.click(); }} disabled={solved} />
          <button className="btn primary big" disabled={!gate || solved} onClick={test}>🔎 Check my machine</button>
          {result && (
            <table className="tt small">
              <thead><tr>{p.inputs.map(i => <th key={i}>{i}</th>)}<th>{p.out}</th><th /></tr></thead>
              <tbody>{result.map(({ r, ok }) => <tr key={keyOf(r)} className={ok ? "seen" : "bad"}>{r.map((v, i) => <td key={i}>{v ? 1 : 0}</td>)}<td>{have(...r) ? 1 : 0}</td><td>{ok ? "✓" : "✗"}</td></tr>)}</tbody>
            </table>
          )}
        </div>
      </div>
      <Feedback feedback={feedback} />
      {solved && <div className="row center-row"><button className="btn primary big" onClick={next}>{pi >= list.length - 1 ? "Finish ⭐" : "Next case →"}</button></div>}
      <p className="muted center">Case {pi + 1} of {list.length}</p>
    </div>
  );
}


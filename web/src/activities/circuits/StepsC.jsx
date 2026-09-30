// Part C · Thinking machines (from 6th standard, or after Part B)
import { useRef, useState } from "react";
import { Board, Volt, GateShape, LWire, InputToggle, OutLamp } from "./parts.jsx";
import { Question, keyOf, MiniLamps } from "../../components/journey/kit.jsx";
import { GATES, combos, addBits, simulateLogic } from "../../lib/logic.js";
import { sfx } from "../../lib/sfx.js";

// ───────── Step 13: Adding machine (half adder) ─────────
export function AddingMachine({ onComplete }) {
  const [a, setA] = useState(false);
  const [b, setB] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const sum = GATES.XOR.fn(a, b), carry = GATES.AND.fn(a, b);
  const set = (na, nb) => { setA(na); setB(nb); setSeen(s => new Set(s).add(keyOf([na, nb]))); };
  const all = seen.size === 4;
  const n = Number(a) + Number(b);
  return (
    <div className="step-body">
      <Volt mood={carry ? "wow" : "happy"} lamp={sum || carry}>
        {seen.size === 0 ? "Let's build a machine that ADDS! Two gates work together: XOR makes the Sum, AND makes the Carry. Tap A and B."
          : carry ? "1 + 1 = 2. In binary, two is written 1 0: the Carry is 1 and the Sum is 0. Just like carrying in column addition!"
          : `${Number(a)} + ${Number(b)} = ${n}.`}
      </Volt>
      <div className="bench">
        <div className="panel flat">
          <Board label="A half adder made of an XOR gate and an AND gate" h={220}>
            <InputToggle x={16} y={60} on={a} onToggle={() => set(!a, b)} label="A" />
            <InputToggle x={16} y={160} on={b} onToggle={() => set(a, !b)} label="B" />
            <LWire from={[80, 60]} to={[200, 38]} on={a} />
            <LWire from={[80, 60]} to={[200, 138]} on={a} />
            <LWire from={[80, 160]} to={[200, 62]} on={b} />
            <LWire from={[80, 160]} to={[200, 162]} on={b} />
            <GateShape type="XOR" x={200} y={20} on={sum} />
            <GateShape type="AND" x={200} y={120} on={carry} />
            <LWire from={[280, 50]} to={[330, 50]} on={sum} />
            <LWire from={[280, 150]} to={[330, 150]} on={carry} />
            <OutLamp x={350} y={50} on={sum} label="Sum" />
            <OutLamp x={350} y={150} on={carry} label="Carry" />
          </Board>
        </div>
        <div className="tt-wrap">
          <table className="tt">
            <thead><tr><th>A</th><th>B</th><th className="out">Carry</th><th className="out">Sum</th><th>Number</th></tr></thead>
            <tbody>
              {combos(2).map(r => {
                const k = keyOf(r), known = seen.has(k), s = GATES.XOR.fn(...r), c = GATES.AND.fn(...r);
                return (
                  <tr key={k} className={`${known ? "seen" : ""}${keyOf([a, b]) === k ? " cur" : ""}`}>
                    <td>{Number(r[0])}</td><td>{Number(r[1])}</td>
                    <td className="out">{known ? Number(c) : "?"}</td><td className="out">{known ? Number(s) : "?"}</td>
                    <td>{known ? `${Number(r[0])} + ${Number(r[1])} = ${Number(r[0]) + Number(r[1])}` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="muted center tt-count">{seen.size} of 4 rows tried</p>
        </div>
      </div>
      {all && (
        <Question q="In binary, 1 + 1 is written as…" right="10"
          options={[{ value: "10", label: "1 0" }, { value: "11", label: "1 1" }, { value: "1", label: "1" }]}
          rightMsg="Yes! 1 0 means one two and no ones: that's two." onRight={onComplete} />
      )}
    </div>
  );
}

// ───────── Step 14: Bigger adder (4 bits) ─────────
const PLACES = [8, 4, 2, 1];
const CHALLENGES = [[2, 3], [5, 6], [7, 8], [9, 9]];
// One grid for the whole sum, so every column lines up: 16s under 16s, 8s under 8s…
function BitCells({ label, value, onChange }) {
  return (
    <>
      <span className="ag-label">{label}</span>
      <span />
      {PLACES.map(p => {
        const on = Boolean(value & p);
        return (
          <button key={p} className={`bitbtn${on ? " on" : ""}`} aria-pressed={on} aria-label={`${label} ${p}`} onClick={() => { on ? sfx.off() : sfx.on(); onChange(value ^ p); }}>
            <b>{on ? 1 : 0}</b><small>{p}</small>
          </button>
        );
      })}
      <span className="ag-num">= {value}</span>
    </>
  );
}
export function BiggerAdder({ onComplete }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [ci, setCi] = useState(0);
  const [hit, setHit] = useState(false);
  const [ta, tb] = CHALLENGES[ci];
  const r = addBits(a, b);
  const change = (na, nb) => {
    setA(na); setB(nb);
    if (!hit && na === ta && nb === tb) { setHit(true); setTimeout(sfx.ding, 150); }
  };
  const next = () => { if (ci >= CHALLENGES.length - 1) return onComplete(); setCi(ci + 1); setA(0); setB(0); setHit(false); };
  return (
    <div className="step-body">
      <Volt mood={hit ? "cheer" : "happy"} lamp={hit}>
        {hit ? (r.carryOut ? `${ta} + ${tb} = ${r.value}! The last adder passed a carry out, so the answer needs a 5th lamp: 16.` : `${ta} + ${tb} = ${r.value}! Watch the carries jump from one adder to the next.`)
          : `Chain four adders and you can add bigger numbers! Set A to ${ta} and B to ${tb}.`}
      </Volt>
      <div className="panel flat adder">
        <div className="adder-grid">
          <BitCells label="A" value={a} onChange={v => change(v, b)} />
          <BitCells label="B" value={b} onChange={v => change(a, v)} />
          <span className="ag-label small">adders</span>
          <div className={`adder-box carry-out${r.carryOut ? " on" : ""}`}>carry<br />{Number(r.carryOut)}</div>
          {[3, 2, 1, 0].map(i => (
            <div key={i} className={`adder-box${r.sum[i] ? " on" : ""}`}>
              <small>adder</small><b>+</b>
              {i > 0 && <span className={`carry-arrow${r.carries[i - 1] ? " on" : ""}`} title="carry passed left">◀</span>}
            </div>
          ))}
          <span />
          <span className="ag-label">=</span>
          <span className={`bitbtn ro${r.carryOut ? " on" : ""}`}><b>{Number(r.carryOut)}</b><small>16</small></span>
          {[3, 2, 1, 0].map(i => <span key={i} className={`bitbtn ro${r.sum[i] ? " on" : ""}`}><b>{Number(r.sum[i])}</b><small>{PLACES[3 - i]}</small></span>)}
          <span className="ag-num">= {r.value}</span>
        </div>
      </div>
      {hit && <div className="row center-row"><button className="btn primary big" onClick={next}>{ci >= CHALLENGES.length - 1 ? "Finish ⭐" : "Next sum →"}</button></div>}
      <p className="muted center">Sum {ci + 1} of {CHALLENGES.length}</p>
    </div>
  );
}

// ───────── Step 15: A circuit that remembers (SR latch) ─────────
const LATCH_PARTS = t => [{ id: "S", type: "input", on: t.S }, { id: "R", type: "input", on: t.R }, { id: "g1", type: "NOR" }, { id: "g2", type: "NOR" }, { id: "Q", type: "lamp" }];
const LATCH_WIRES = [{ from: "R:out", to: "g1:in1" }, { from: "g2:out", to: "g1:in2" }, { from: "g1:out", to: "g2:in1" }, { from: "S:out", to: "g2:in2" }, { from: "g1:out", to: "Q:in1" }];
const TASKS = [
  { id: "set", t: "Tap SET to store a 1" },
  { id: "kept", t: "Notice: after you let go, the lamp stays ON" },
  { id: "reset", t: "Tap RESET to store a 0" },
  { id: "power", t: "Store a 1 again, then press Power cut" },
];
// A latch that has just been powered up, storing 0 (Q off, the other gate on).
const EMPTY_MEMORY = { "g1:out": false, "g2:out": true };
export function MemoryLatch({ onComplete }) {
  const mem = useRef({ ...EMPTY_MEMORY });
  const [inp, setInp] = useState({ S: false, R: false });
  const [q, setQ] = useState(false);
  const [done, setDone] = useState(new Set());
  const tick = id => setDone(d => { if (d.has(id)) return d; sfx.ding(); return new Set(d).add(id); });
  const apply = next => {
    const r = simulateLogic(LATCH_PARTS(next), LATCH_WIRES, mem.current);
    mem.current = r.state; setInp(next);
    const on = r.lamps.has("Q"); setQ(on);
    return on;
  };
  const pulse = key => {
    sfx.click();
    const on = apply({ ...inp, [key]: true });
    if (key === "S" && on) tick("set");
    if (key === "R" && !on && done.has("set")) tick("reset");
    setTimeout(() => {
      const still = apply({ S: false, R: false });
      if (key === "S" && still) tick("kept");
    }, 600);
  };
  const powerCut = () => {
    const wasOn = q;
    mem.current = { ...EMPTY_MEMORY }; sfx.off();
    apply({ S: false, R: false });
    if (wasOn && done.has("reset")) tick("power");
  };
  const all = TASKS.every(t => done.has(t.id));
  return (
    <div className="step-body">
      <Volt mood={q ? "cheer" : "happy"} lamp={q}>
        {!done.has("set") ? "Two NOR gates hold hands in a loop. Tap SET once, then let go. What happens to the lamp?"
          : !done.has("reset") ? "The lamp stayed ON after you let go. The circuit REMEMBERS a 1! Now tap RESET."
          : !done.has("power") ? "It remembers 0 now. Store a 1 again, then press Power cut."
          : "When the power went off, it forgot! That's why a computer's memory (RAM) forgets when it's switched off."}
      </Volt>
      <div className="bench">
        <div className="panel flat">
          <Board label="A memory latch made of two NOR gates" h={220}>
            <InputToggle x={16} y={38} on={inp.R} label="RESET" />
            <InputToggle x={16} y={172} on={inp.S} label="SET" />
            <LWire from={[80, 38]} to={[190, 38]} on={inp.R} />
            <LWire from={[80, 172]} to={[190, 172]} on={inp.S} />
            <GateShape type="NOR" x={190} y={20} on={q} />
            <GateShape type="NOR" x={190} y={130} on={Boolean(mem.current["g2:out"])} />
            <path className={`lwire${q ? " on" : ""}`} d="M270 50 H292 V96 H170 V148 H190" />
            <path className={`lwire${mem.current["g2:out"] ? " on" : ""}`} d="M270 160 H304 V112 H160 V62 H190" />
            <LWire from={[270, 50]} to={[330, 50]} on={q} />
            <OutLamp x={350} y={50} on={q} label="Memory" />
          </Board>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <div className="row center-row">
            <button className="btn primary big" onClick={() => pulse("S")}>SET (1)</button>
            <button className="btn big" onClick={() => pulse("R")}>RESET (0)</button>
          </div>
          <div className="row center-row"><button className="btn danger" onClick={powerCut}>⚡ Power cut</button></div>
          <ul className="checklist">{TASKS.map(t => <li key={t.id} className={done.has(t.id) ? "done" : ""}>{done.has(t.id) ? "✅" : "⬜"} {t.t}</li>)}</ul>
          <p className="muted center">Stored: <MiniLamps bits={[q]} /> <b>{q ? 1 : 0}</b></p>
        </div>
      </div>
      {all && (
        <Question q="What happens after you let go of SET?" right="stays"
          options={[{ value: "stays", label: "The lamp stays ON" }, { value: "off", label: "The lamp turns OFF" }, { value: "blinks", label: "It blinks" }]}
          rightMsg="Yes! The loop keeps itself ON. Billions of these make your computer's memory." onRight={onComplete} />
      )}
    </div>
  );
}

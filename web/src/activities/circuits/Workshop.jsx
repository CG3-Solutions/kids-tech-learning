// Free workshop: build your own circuits on a grid. Two boards:
//  ⚡ Parts board  – batteries, switches, bulbs, motors, buzzers and LEDs (real electricity)
//  🚦 Gates board – input switches, AND/OR/NOT/XOR/NAND/NOR gates and lamps (logic)
import { useEffect, useMemo, useRef, useState } from "react";
import { Volt, GateShape } from "./parts.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { simulateElectric, simulateLogic, GATES } from "../../lib/logic.js";
import { sfx } from "../../lib/sfx.js";

const COLS = 6, ROWS = 4, CELL = 100;
const center = p => [p.c * CELL + 50, p.r * CELL + 50];
const rotPt = ([dx, dy], rot) => (rot === 90 ? [-dy, dx] : rot === 180 ? [-dx, -dy] : rot === 270 ? [dy, -dx] : [dx, dy]);

const ELECTRIC_PARTS = {
  battery: { name: "Battery", emoji: "🔋" }, switch: { name: "Switch", emoji: "🔘" }, bulb: { name: "Bulb", emoji: "💡" },
  motor: { name: "Motor", emoji: "⚙️" }, buzzer: { name: "Buzzer", emoji: "🔔" }, led: { name: "LED", emoji: "🔴" },
};
const LOGIC_PARTS = {
  input: { name: "Switch", emoji: "🔘" }, lamp: { name: "Lamp", emoji: "💡" },
  AND: { name: "AND", emoji: "🔒" }, OR: { name: "OR", emoji: "🚪" }, NOT: { name: "NOT", emoji: "🌙" }, XOR: { name: "XOR", emoji: "🪜" },
  NAND: { name: "NAND", emoji: "⛔" }, NOR: { name: "NOR", emoji: "💾" },
};

// Terminal offsets from the cell centre.
function terminals(board, p) {
  if (board === "electric") return { a: rotPt([-40, 0], p.rot ?? 0), b: rotPt([40, 0], p.rot ?? 0) };
  if (p.type === "input") return { out: [40, 0] };
  if (p.type === "lamp") return { in1: [-40, 0] };
  if (GATES[p.type].inputs === 1) return { in1: [-40, 0], out: [40, 0] };
  return { in1: [-40, -15], in2: [-40, 15], out: [40, 0] };
}
const termPos = (board, parts, tid) => {
  const [id, t] = tid.split(":");
  const p = parts.find(x => x.id === id);
  if (!p) return null;
  const [cx, cy] = center(p), [dx, dy] = terminals(board, p)[t] ?? [0, 0];
  return [cx + dx, cy + dy];
};

// ───────── Ready-made examples ─────────
const w = (from, to) => ({ from, to });
const EXAMPLES = {
  electric: [
    { name: "Simple loop", parts: [{ id: "bat", type: "battery", c: 0, r: 1, rot: 90 }, { id: "s", type: "switch", c: 1, r: 0, rot: 0 }, { id: "l", type: "bulb", c: 3, r: 1, rot: 90 }], wires: [w("bat:a", "s:a"), w("s:b", "l:a"), w("l:b", "bat:b")] },
    { name: "AND: switches in a row", parts: [{ id: "bat", type: "battery", c: 0, r: 1, rot: 90 }, { id: "s1", type: "switch", c: 1, r: 0, rot: 0 }, { id: "s2", type: "switch", c: 2, r: 0, rot: 0 }, { id: "m", type: "motor", c: 4, r: 1, rot: 90 }], wires: [w("bat:a", "s1:a"), w("s1:b", "s2:a"), w("s2:b", "m:a"), w("m:b", "bat:b")] },
    { name: "OR: switches side by side", parts: [{ id: "bat", type: "battery", c: 0, r: 1, rot: 90 }, { id: "s1", type: "switch", c: 1, r: 0, rot: 0 }, { id: "s2", type: "switch", c: 1, r: 2, rot: 0 }, { id: "l", type: "bulb", c: 3, r: 1, rot: 90 }], wires: [w("bat:a", "s1:a"), w("bat:a", "s2:a"), w("s1:b", "l:a"), w("s2:b", "l:a"), w("l:b", "bat:b")] },
    { name: "Bulb and buzzer together", parts: [{ id: "bat", type: "battery", c: 0, r: 1, rot: 90 }, { id: "s", type: "switch", c: 1, r: 0, rot: 0 }, { id: "l", type: "bulb", c: 3, r: 1, rot: 90 }, { id: "z", type: "buzzer", c: 4, r: 1, rot: 90 }], wires: [w("bat:a", "s:a"), w("s:b", "l:a"), w("s:b", "z:a"), w("l:b", "bat:b"), w("z:b", "bat:b")] },
  ],
  logic: [
    { name: "AND gate", parts: [{ id: "A", type: "input", c: 0, r: 0, label: "A" }, { id: "B", type: "input", c: 0, r: 2, label: "B" }, { id: "g", type: "AND", c: 2, r: 1 }, { id: "L", type: "lamp", c: 4, r: 1, label: "Out" }], wires: [w("A:out", "g:in1"), w("B:out", "g:in2"), w("g:out", "L:in1")] },
    { name: "Seatbelt alarm", parts: [{ id: "A", type: "input", c: 0, r: 0, label: "Moving" }, { id: "B", type: "input", c: 0, r: 2, label: "Buckled" }, { id: "n", type: "NOT", c: 1, r: 2 }, { id: "g", type: "AND", c: 3, r: 1 }, { id: "L", type: "lamp", c: 5, r: 1, label: "Beep" }], wires: [w("A:out", "g:in1"), w("B:out", "n:in1"), w("n:out", "g:in2"), w("g:out", "L:in1")] },
    { name: "Adding machine", parts: [{ id: "A", type: "input", c: 0, r: 0, label: "A" }, { id: "B", type: "input", c: 0, r: 2, label: "B" }, { id: "x", type: "XOR", c: 2, r: 0 }, { id: "n", type: "AND", c: 2, r: 2 }, { id: "S", type: "lamp", c: 4, r: 0, label: "Sum" }, { id: "C", type: "lamp", c: 4, r: 2, label: "Carry" }], wires: [w("A:out", "x:in1"), w("B:out", "x:in2"), w("A:out", "n:in1"), w("B:out", "n:in2"), w("x:out", "S:in1"), w("n:out", "C:in1")] },
    { name: "Memory latch", parts: [{ id: "R", type: "input", c: 0, r: 0, label: "Reset" }, { id: "S", type: "input", c: 0, r: 3, label: "Set" }, { id: "g1", type: "NOR", c: 2, r: 0 }, { id: "g2", type: "NOR", c: 2, r: 2 }, { id: "Q", type: "lamp", c: 4, r: 0, label: "Memory" }], wires: [w("R:out", "g1:in1"), w("g2:out", "g1:in2"), w("g1:out", "g2:in1"), w("S:out", "g2:in2"), w("g1:out", "Q:in1")] },
  ],
};
const clone = x => JSON.parse(JSON.stringify(x));
const START = { electric: clone(EXAMPLES.electric[0]), logic: clone(EXAMPLES.logic[0]) };

// ───────── Part drawings (horizontal; rotated as a group) ─────────
function ElectricPart({ p, on, onClickPart }) {
  const [cx, cy] = center(p);
  const lead = <path d={`M${cx - 40} ${cy} H${cx - 18} M${cx + 18} ${cy} H${cx + 40}`} className="w thin" />;
  let body;
  if (p.type === "battery") body = <><line x1={cx - 5} y1={cy - 20} x2={cx - 5} y2={cy + 20} className="plate" strokeWidth="5" /><line x1={cx + 6} y1={cy - 11} x2={cx + 6} y2={cy + 11} className="plate" strokeWidth="9" /><text x={cx - 22} y={cy - 12} fontSize="16" style={{ fill: "var(--plus)" }}>+</text></>;
  else if (p.type === "switch") body = <><line className="sw-lever" x1={cx - 18} y1={cy} x2={cx + 18} y2={cy} style={{ transform: `rotate(${p.on ? 0 : -35}deg)`, transformOrigin: `${cx - 18}px ${cy}px` }} /><circle className="term" cx={cx - 18} cy={cy} r="4" /><circle className="term" cx={cx + 18} cy={cy} r="4" /></>;
  else if (p.type === "bulb") body = <><circle className={`bulb-glass${on ? " lvl3" : ""}`} cx={cx} cy={cy} r="17" /><path d={`M${cx - 12} ${cy - 12} L${cx + 12} ${cy + 12} M${cx + 12} ${cy - 12} L${cx - 12} ${cy + 12}`} stroke="var(--ink)" strokeWidth="2.5" /></>;
  else if (p.type === "motor") body = <><circle cx={cx} cy={cy} r="17" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" /><g className={`fan${on ? " spin" : ""}`} style={{ transformOrigin: `${cx}px ${cy}px` }}><path d={`M${cx} ${cy} L${cx} ${cy - 14} A7 7 0 0 1 ${cx + 8} ${cy - 11} Z M${cx} ${cy} L${cx + 13} ${cy + 6} A7 7 0 0 1 ${cx + 6} ${cy + 12} Z M${cx} ${cy} L${cx - 12} ${cy + 8} A7 7 0 0 1 ${cx - 13} ${cy - 2} Z`} fill="var(--wire)" /></g></>;
  else if (p.type === "buzzer") body = <><rect x={cx - 15} y={cy - 15} width="30" height="30" rx="6" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" /><circle cx={cx} cy={cy} r="5" fill="var(--ink)" />{on && <path d={`M${cx + 20} ${cy - 22} q8 10 0 20`} stroke="var(--spark)" strokeWidth="3" fill="none" className="waves on" />}</>;
  else if (p.type === "led") body = <><path d={`M${cx - 12} ${cy - 13} L${cx + 12} ${cy} L${cx - 12} ${cy + 13} Z`} className={`led-body${on ? " lit" : ""}`} /><line x1={cx + 13} y1={cy - 13} x2={cx + 13} y2={cy + 13} stroke="var(--ink)" strokeWidth="3" /></>;
  return (
    <g onClick={onClickPart} style={{ cursor: "pointer" }}>
      <rect x={cx - 48} y={cy - 36} width="96" height="72" fill="transparent" />
      <g transform={`rotate(${p.rot ?? 0} ${cx} ${cy})`}>{lead}{body}</g>
    </g>
  );
}

function LogicPart({ p, on, onClickPart }) {
  const [cx, cy] = center(p);
  let body;
  if (p.type === "input") body = <g className={`in-toggle${p.on ? " on" : ""}`}><rect x={cx - 32} y={cy - 16} width="64" height="32" rx="16" /><circle cx={p.on ? cx + 16 : cx - 16} cy={cy} r="11" className="knob" /><path d={`M${cx + 32} ${cy} H${cx + 40}`} className={`lwire${p.on ? " on" : ""}`} /></g>;
  else if (p.type === "lamp") body = <><path d={`M${cx - 40} ${cy} H${cx - 18}`} className={`lwire${on ? " on" : ""}`} /><circle className={`bulb-glass${on ? " lvl3" : ""}`} cx={cx} cy={cy} r="18" /><text x={cx} y={cy + 5} fontSize="13" textAnchor="middle" fontWeight="700">{on ? 1 : 0}</text></>;
  else {
    const one = GATES[p.type].inputs === 1;
    body = (
      <>
        {one ? <path d={`M${cx - 40} ${cy} H${cx - 28}`} className="lwire" /> : <path d={`M${cx - 40} ${cy - 15} H${cx - 32} V${cy - 8.4} H${cx - 28} M${cx - 40} ${cy + 15} H${cx - 32} V${cy + 8.4} H${cx - 28}`} className="lwire" />}
        <g transform={`translate(${cx - 28} ${cy - 21}) scale(.7)`}><GateShape type={p.type} x={0} y={0} on={on} /></g>
        <path d={`M${cx + 28} ${cy} H${cx + 40}`} className={`lwire${on ? " on" : ""}`} />
      </>
    );
  }
  return (
    <g onClick={onClickPart} style={{ cursor: "pointer" }}>
      <rect x={cx - 48} y={cy - 36} width="96" height="72" fill="transparent" />
      {body}
      {p.label && <text x={cx} y={cy + 34} fontSize="12" textAnchor="middle" className="part-label">{p.label}</text>}
    </g>
  );
}

const MODES = [
  { id: "use", label: "👆 Use", help: "Tap switches to turn them ON and OFF." },
  { id: "add", label: "➕ Add", help: "Pick a part below, then tap an empty square." },
  { id: "wire", label: "🔗 Wire", help: "Tap one dot, then another dot, to join them with a wire." },
  { id: "turn", label: "↻ Turn", help: "Tap a part to turn it. Turning an LED around changes its direction." },
  { id: "remove", label: "🗑️ Remove", help: "Tap a part or a wire to remove it." },
];

export default function Workshop({ onComplete }) {
  const { childData, setChildState } = useApp();
  const [board, setBoard] = useState("electric");
  const [boards, setBoards] = useState(() => ({ ...clone(START), ...(childData.state.workshop ?? {}) }));
  const [mode, setMode] = useState("use");
  const [tool, setTool] = useState("bulb");
  const [pending, setPending] = useState(null);
  const [msg, setMsg] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const memory = useRef({});
  const completed = useRef(false);
  const saveTimer = useRef(null);

  const { parts, wires } = boards[board];
  const catalog = board === "electric" ? ELECTRIC_PARTS : LOGIC_PARTS;
  const modes = MODES.filter(m => board === "electric" || m.id !== "turn");

  const sim = useMemo(() => {
    if (board === "electric") return { kind: "electric", ...simulateElectric(parts, wires) };
    const r = simulateLogic(parts, wires, memory.current);
    return { kind: "logic", ...r };
  }, [board, parts, wires]);
  useEffect(() => { if (sim.kind === "logic") memory.current = sim.state; }, [sim]);

  const working = sim.kind === "electric" ? sim.on.size > 0 : sim.lamps.size > 0;
  useEffect(() => { if (working && !completed.current) { completed.current = true; sfx.ding(); onComplete?.(); } }, [working, onComplete]);

  const update = (fn, note = null) => {
    setBoards(prev => {
      const next = clone(prev);
      fn(next[board]);
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => setChildState("workshop", next), 800);
      return next;
    });
    setMsg(note);
  };
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  const partAt = (c, r) => parts.find(p => p.c === c && p.r === r);
  const newId = type => `${type}${Math.random().toString(36).slice(2, 6)}`;

  const clickCell = (c, r) => {
    if (mode !== "add" || partAt(c, r)) return;
    sfx.click();
    update(b => b.parts.push({ id: newId(tool), type: tool, c, r, rot: 0, on: false, label: tool === "input" ? `In ${b.parts.filter(x => x.type === "input").length + 1}` : tool === "lamp" ? "Out" : undefined }));
  };
  const clickPart = p => {
    if (mode === "use" && (p.type === "switch" || p.type === "input")) { p.on ? sfx.off() : sfx.on(); update(b => { const x = b.parts.find(y => y.id === p.id); x.on = !x.on; }); }
    else if (mode === "turn") { sfx.click(); update(b => { const x = b.parts.find(y => y.id === p.id); x.rot = ((x.rot ?? 0) + 90) % 360; }); }
    else if (mode === "remove") { sfx.off(); update(b => { b.parts = b.parts.filter(y => y.id !== p.id); b.wires = b.wires.filter(x => !x.from.startsWith(`${p.id}:`) && !x.to.startsWith(`${p.id}:`)); }); }
  };
  const clickTerminal = tid => {
    if (mode !== "wire") return;
    if (!pending) { setPending(tid); sfx.click(); setMsg("Now tap the dot you want to join it to."); return; }
    if (pending === tid) { setPending(null); setMsg(null); return; }
    let from = pending, to = tid;
    setPending(null);
    if (board === "logic") {
      const outs = [from, to].filter(t => t.endsWith(":out")).length;
      if (outs !== 1) { sfx.oops(); setMsg("Join an output (right side of a part) to an input (left side)."); return; }
      if (to.endsWith(":out")) [from, to] = [to, from];
      update(b => { b.wires = b.wires.filter(x => x.to !== to && x.from !== to); b.wires.push({ from, to }); }, null);
    } else {
      if (from.split(":")[0] === to.split(":")[0]) { sfx.oops(); setMsg("Join two different parts."); return; }
      update(b => { if (!b.wires.some(x => (x.from === from && x.to === to) || (x.from === to && x.to === from))) b.wires.push({ from, to }); }, null);
    }
    sfx.on();
  };
  const clickWire = i => { if (mode === "remove") { sfx.off(); update(b => { b.wires.splice(i, 1); }); } };
  const loadExample = ex => { memory.current = {}; update(b => { b.parts = clone(ex.parts); b.wires = clone(ex.wires); }, `Loaded “${ex.name}”. Switch to 👆 Use and try it!`); setMode("use"); };

  const wireLive = wr => (sim.kind === "electric" ? sim.liveNode(wr.from) : sim.value(wr.from));
  const partOn = p => (sim.kind === "electric" ? sim.on.has(p.id) : p.type === "lamp" ? sim.lamps.has(p.id) : GATES[p.type] ? sim.value(`${p.id}:out`) : p.on);

  const say = sim.kind === "electric" && sim.short
    ? "Short circuit! Electricity took a shortcut from + to − without going through any part. With real batteries this makes them hot. Never do it for real!"
    : board === "electric"
      ? (working ? "It works! Can you build a doorbell, or a staircase light?" : "This is my workshop. Build any circuit with real parts. Start with an example, or add your own parts and wires.")
      : (working ? "Your gate machine lights up! Try building the seatbelt alarm yourself." : "On the gates board, wire switches into gates and gates into lamps. Outputs are on the right, inputs on the left.");

  return (
    <div className="step-body workshop">
      <Volt mood={sim.short ? "sad" : working ? "cheer" : "happy"} lamp={working}>{say}</Volt>
      <div className="tabs" role="tablist" aria-label="Board">
        <button role="tab" className={board === "electric" ? "active" : ""} onClick={() => { setBoard("electric"); setMode("use"); setPending(null); setMsg(null); if (!ELECTRIC_PARTS[tool]) setTool("bulb"); }}>⚡ Parts board</button>
        <button role="tab" className={board === "logic" ? "active" : ""} onClick={() => { setBoard("logic"); setMode("use"); setPending(null); setMsg(null); if (!LOGIC_PARTS[tool]) setTool("AND"); }}>🚦 Gates board</button>
      </div>
      <div className="row">
        <div className="chips" role="group" aria-label="Mode">{modes.map(m => <button key={m.id} className="chip" aria-pressed={mode === m.id} onClick={() => { setMode(m.id); setPending(null); setMsg(null); }}>{m.label}</button>)}</div>
        <span className="spacer" />
        <select aria-label="Load an example" value="" onChange={e => { const ex = EXAMPLES[board][Number(e.target.value)]; if (ex) loadExample(ex); }} className="ex-select">
          <option value="">📂 Examples…</option>
          {EXAMPLES[board].map((ex, i) => <option key={ex.name} value={i}>{ex.name}</option>)}
        </select>
        {confirmClear
          ? <><button className="btn danger" onClick={() => { update(b => { b.parts = []; b.wires = []; }); setConfirmClear(false); }}>Clear board</button><button className="btn ghost" onClick={() => setConfirmClear(false)}>Keep</button></>
          : <button className="btn ghost" onClick={() => setConfirmClear(true)}>Clear</button>}
      </div>
      <p className="muted">{MODES.find(m => m.id === mode).help}</p>
      {mode === "add" && (
        <div className="palette">{Object.entries(catalog).map(([k, v]) => <button key={k} className="chip" aria-pressed={tool === k} onClick={() => setTool(k)}>{v.emoji} {v.name}</button>)}</div>
      )}
      <div className={`ws-board mode-${mode}`}>
        <svg className="circuit ws" viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`} role="img" aria-label={`${board === "electric" ? "Parts" : "Gates"} board`}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const c = i % COLS, r = Math.floor(i / COLS);
            return <rect key={i} x={c * CELL + 4} y={r * CELL + 4} width={CELL - 8} height={CELL - 8} rx="12" className={`cell${mode === "add" && !partAt(c, r) ? " open" : ""}`} onClick={() => clickCell(c, r)} />;
          })}
          {wires.map((wr, i) => {
            const p1 = termPos(board, parts, wr.from), p2 = termPos(board, parts, wr.to);
            if (!p1 || !p2) return null;
            // Gate inputs each get their own vertical track, so separate signals never share a line.
            const mx = board === "logic" ? p2[0] - (wr.to.endsWith(":in2") ? 26 : 12) : (p1[0] + p2[0]) / 2;
            const d = `M${p1[0]} ${p1[1]} H${mx} V${p2[1]} H${p2[0]}`;
            return (
              <g key={i} onClick={() => clickWire(i)} style={{ cursor: mode === "remove" ? "pointer" : "default" }}>
                <path d={d} stroke="transparent" strokeWidth="14" fill="none" />
                {board === "electric" ? <><path className="w thin" d={d} /><path className={`flow${wireLive(wr) ? " live" : ""}`} d={d} /></> : <path className={`lwire${wireLive(wr) ? " on" : ""}`} d={d} />}
              </g>
            );
          })}
          {parts.map(p => board === "electric"
            ? <ElectricPart key={p.id} p={p} on={partOn(p)} onClickPart={() => clickPart(p)} />
            : <LogicPart key={p.id} p={p} on={partOn(p)} onClickPart={() => clickPart(p)} />)}
          {mode === "wire" && parts.flatMap(p => Object.keys(terminals(board, p)).map(t => {
            const tid = `${p.id}:${t}`, [x, y] = termPos(board, parts, tid);
            return <circle key={tid} cx={x} cy={y} r="9" className={`tdot${pending === tid ? " sel" : ""}`} onClick={() => clickTerminal(tid)} />;
          }))}
        </svg>
      </div>
      {msg && <p className="note">{msg}</p>}
      {board === "electric" && <p className="muted" style={{ fontSize: ".9rem" }}>Tip: the battery's + side is marked in red. An LED only lets electricity through one way. If it won't glow, use ↻ Turn twice to turn it around.</p>}
    </div>
  );
}

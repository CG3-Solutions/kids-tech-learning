// "Do it" activities for concept lessons. All work by tapping (phones and tablets), and call
// onDone() once the child has finished, which unlocks the lesson's Next button.
import { useMemo, useState } from "react";
import { sfx } from "../../lib/sfx.js";
import { SMILEY } from "./Anims.jsx";

// Automated browser tests read the right answers from the page, only when a test-only flag is set.
export const e2e = () => { try { return localStorage.getItem("sparklab.e2e") === "1"; } catch { return false; } };
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

// Sort it: tap an item, then tap the box it belongs in.
export function SortGame({ prompt, buckets, items, onDone }) {
  const order = useMemo(() => shuffle(items.map((_, i) => i)), [items]);
  const [placed, setPlaced] = useState({}); // item index → bucket index
  const [sel, setSel] = useState(null);
  const [msg, setMsg] = useState(null);
  const left = order.filter(i => placed[i] == null);
  const put = b => {
    if (sel == null) { setMsg("First tap a picture, then tap its box."); return; }
    const [, name, right] = items[sel];
    if (right === b) {
      sfx.ding();
      const next = { ...placed, [sel]: b };
      setPlaced(next); setSel(null);
      setMsg(`Yes! ${name}: ${buckets[b][1]}.`);
      if (Object.keys(next).length === items.length) onDone();
    } else { sfx.oops(); setMsg(`Not quite. Think again: is “${name}” really ${buckets[b][1].toLowerCase()}?`); }
  };
  return (
    <div className="stack sort-game" style={{ gap: 12 }}>
      <p className="lead"><b>{prompt}</b> Tap a picture, then tap its box.</p>
      <div className="sort-pool" aria-label="Pictures to sort">
        {left.map(i => (
          <button key={i} className={`sort-item${sel === i ? " sel" : ""}`} onClick={() => { sfx.click(); setSel(i); setMsg(null); }} aria-pressed={sel === i} {...(e2e() ? { "data-bucket": items[i][2] } : {})}>
            <span aria-hidden="true">{items[i][0]}</span>{items[i][1]}
          </button>
        ))}
        {!left.length && <p className="learned">All sorted! ⭐</p>}
      </div>
      <div className="sort-buckets" style={{ gridTemplateColumns: `repeat(${buckets.length}, minmax(0, 1fr))` }}>
        {buckets.map(([e, n], b) => (
          <button key={n} className={`bucket${sel != null ? " ready" : ""}`} onClick={() => put(b)}>
            <b><span aria-hidden="true">{e}</span> {n}</b>
            <span className="bucket-in">{order.filter(i => placed[i] === b).map(i => <span key={i} title={items[i][1]}>{items[i][0]}</span>)}</span>
          </button>
        ))}
      </div>
      {msg && <p className="game-msg" role="status">{msg}</p>}
    </div>
  );
}

// Be the computer: follow a program exactly (tap the squares in order), then find the bug in another.
const PROGRAM = [5, 1, 9, 3, 7]; // "Colour square N"
const BUGGY = { lines: [2, 4, 6, 9], want: [2, 4, 6, 8], bug: 3 }; // should draw a diamond; line 4 is wrong
export function BeComputerGame({ onDone }) {
  const [phase, setPhase] = useState("run");
  const [step, setStep] = useState(0);
  const [msg, setMsg] = useState(null);
  const tapSquare = n => {
    if (phase !== "run") return;
    if (n === PROGRAM[step]) {
      sfx.click(); setMsg(null);
      if (step + 1 === PROGRAM.length) { sfx.ding(); setPhase("bug"); setMsg("Program finished. You followed it exactly, just like a computer! Now find a bug."); }
      setStep(s => s + 1);
    } else { sfx.oops(); setMsg(`A computer does exactly what line ${step + 1} says: “Colour square ${PROGRAM[step]}”.`); }
  };
  const pickLine = k => {
    if (k === BUGGY.bug) { sfx.tada(); setPhase("done"); setMsg(`Bug found! Line ${k + 1} says square 9, but the diamond needs square 8. Change 9 to 8 and the bug is fixed. That's debugging!`); onDone(); }
    else { sfx.oops(); setMsg(`Line ${k + 1} is fine: square ${BUGGY.lines[k]} is part of the diamond. Look at the picture again.`); }
  };
  const grid = (filled, onTap) => (
    <div className="be-grid">
      {Array.from({ length: 9 }, (_, i) => i + 1).map(n => (
        <button key={n} className={`be-cell${filled.includes(n) ? " on" : ""}`} onClick={onTap ? () => onTap(n) : undefined} disabled={!onTap} aria-label={`Square ${n}${filled.includes(n) ? ", coloured" : ""}`}>{n}</button>
      ))}
    </div>
  );
  if (phase === "run") {
    return (
      <div className="stack" style={{ gap: 12 }}>
        <p className="lead"><b>Be the computer!</b> Follow the program exactly, one line at a time. Tap the square each line says.</p>
        <div className="be-row">
          <ol className="be-prog">{PROGRAM.map((n, k) => <li key={k} className={k === step ? "on" : k < step ? "done" : ""}>Colour square {n}</li>)}</ol>
          {grid(PROGRAM.slice(0, step), tapSquare)}
        </div>
        {msg && <p className="game-msg" role="status">{msg}</p>}
      </div>
    );
  }
  return (
    <div className="stack" style={{ gap: 12 }}>
      {msg && <p className="game-msg" role="status">{msg}</p>}
      <p className="lead"><b>Spot the bug.</b> This program should draw a diamond (the left picture), but it drew the right one. Tap the wrong line.</p>
      <div className="be-row">
        <ol className="be-prog">{BUGGY.lines.map((n, k) => (
          <li key={k}><button className={`be-line${phase === "done" && k === BUGGY.bug ? " bug" : ""}`} onClick={() => phase === "bug" && pickLine(k)}>Colour square {n}</button></li>
        ))}</ol>
        <div className="be-pair"><div><small>Wanted</small>{grid(BUGGY.want)}</div><div><small>Got</small>{grid(BUGGY.lines)}</div></div>
      </div>
    </div>
  );
}

// Power cut: work sits in memory (the desk) until it's saved to storage (the cupboard).
const WORK = [["✏️", "My drawing"], ["🔢", "My sums"], ["📝", "My story"]];
export function PowerCutGame({ onDone }) {
  const [saved, setSaved] = useState([]);
  const [power, setPower] = useState(true);
  const [cut, setCut] = useState(false);
  const desk = power ? WORK.filter(w => !saved.includes(w[1])) : [];
  const doCut = () => { sfx.off(); setPower(false); setCut(true); };
  const back = () => { sfx.on(); setPower(true); onDone(); };
  const lost = WORK.length - saved.length;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="lead"><b>Save 2 things,</b> then press <b>Power cut</b>. What survives?</p>
      <div className="power-boxes">
        <div className={`pbox${power ? "" : " off"}`}><b>🗂️ Memory (RAM)</b><small>work you're doing now</small>
          <div className="pitems">
            {power ? desk.map(([e, n]) => (
              <span key={n} className="pitem">{e} {n} <button className="btn small" disabled={cut} onClick={() => { sfx.ding(); setSaved(s => [...s, n]); }}>💾 Save</button></span>
            )) : <em>{lost ? `Forgotten! ${lost} unsaved ${lost === 1 ? "thing" : "things"} disappeared.` : "Empty."}</em>}
            {power && !desk.length && <em>Everything is saved.</em>}
          </div>
        </div>
        <div className="pbox"><b>💾 Storage</b><small>saved things, kept with the power off</small>
          <div className="pitems">{saved.length ? saved.map(n => <span key={n} className="pitem">{WORK.find(w => w[1] === n)[0]} {n}</span>) : <em>Nothing saved yet.</em>}</div>
        </div>
      </div>
      <div className="row">
        {!cut && <button className="btn primary" disabled={saved.length < 2} onClick={doCut}>⚡ Power cut!</button>}
        {cut && !power && <button className="btn primary" onClick={back}>🔌 Power back on</button>}
      </div>
      {cut && power && <p className="game-msg" role="status">Power is back. Saved things are still in storage, but anything that was only in memory is gone. That's why we save!</p>}
    </div>
  );
}

// Build a computer: put each part in its place. Not every part in the tray belongs!
const PARTS = [
  ["⌨️", "Keyboard", "input"], ["🧠", "CPU", "cpu"], ["🗂️", "Memory (RAM)", "ram"], ["💾", "Storage", "storage"], ["🖥️", "Screen", "output"], ["🔌", "Power", "power"],
  ["🍌", "Banana", null], ["🧸", "Teddy bear", null], ["🪴", "Plant", null],
];
const SLOTS = [["input", "Input"], ["cpu", "Processor"], ["ram", "Memory"], ["storage", "Storage"], ["output", "Output"], ["power", "Power"]];
export function BuildGame({ onDone }) {
  const tray = useMemo(() => shuffle(PARTS), []);
  const [placed, setPlaced] = useState([]);
  const [msg, setMsg] = useState(null);
  const [booted, setBooted] = useState(false);
  const tap = ([e, n, slot]) => {
    if (!slot) { sfx.oops(); setMsg(`${e} A ${n.toLowerCase()} isn't a computer part!`); return; }
    sfx.click(); setPlaced(p => [...p, slot]); setMsg(`${n} goes in the ${SLOTS.find(s => s[0] === slot)[1].toLowerCase()} slot.`);
  };
  const ready = placed.length === SLOTS.length;
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="lead"><b>Build a computer.</b> Tap the parts it needs. When every slot is filled, switch it on!</p>
      <div className="build-board">
        {SLOTS.map(([id, label]) => {
          const p = PARTS.find(x => x[2] === id);
          return <div key={id} className={`build-slot${placed.includes(id) ? " on" : ""}`}><small>{label}</small><span aria-hidden="true">{placed.includes(id) ? p[0] : "?"}</span></div>;
        })}
      </div>
      <div className="sort-pool">
        {tray.filter(p => !placed.includes(p[2]) || !p[2]).map(p => <button key={p[1]} className="sort-item" onClick={() => tap(p)}><span aria-hidden="true">{p[0]}</span>{p[1]}</button>)}
      </div>
      {msg && <p className="game-msg" role="status">{msg}</p>}
      <div className="row">
        <button className="btn primary" disabled={!ready || booted} onClick={() => { sfx.tada(); setBooted(true); onDone(); }}>🔌 Switch on</button>
        {!ready && <span className="muted">{SLOTS.length - placed.length} slots to fill</span>}
      </div>
      {booted && <p className="boot" role="status">💻 Hello! I'm working! Input → CPU → memory → storage → output, all connected.</p>}
    </div>
  );
}

// Put steps in order: tap them one by one in the right order.
export function OrderGame({ prompt, steps, onDone }) {
  const pool = useMemo(() => shuffle(steps.map((_, i) => i)), [steps]);
  const [got, setGot] = useState([]);
  const [msg, setMsg] = useState(null);
  const tap = i => {
    if (i === got.length) {
      sfx.click(); const n = [...got, i]; setGot(n); setMsg(null);
      if (n.length === steps.length) { sfx.ding(); setMsg("Right order! ⭐"); onDone(); }
    } else { sfx.oops(); setMsg("Not that one yet. What happens next?"); }
  };
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="lead"><b>{prompt}.</b> Tap the steps in order.</p>
      <ol className="order-done">{got.map(i => <li key={i}>{steps[i]}</li>)}</ol>
      <div className="sort-pool">{pool.filter(i => !got.includes(i)).map(i => <button key={i} className="sort-item" onClick={() => tap(i)} {...(e2e() ? { "data-order": i } : {})}>{steps[i]}</button>)}</div>
      {msg && <p className="game-msg" role="status">{msg}</p>}
    </div>
  );
}

// Be the screen: turn rows of numbers into a picture (1 = colour the pixel).
export function PixelsGame({ onDone }) {
  const want = SMILEY.join("");
  const [cells, setCells] = useState(() => Array(want.length).fill("0"));
  const [won, setWon] = useState(false);
  const flip = k => {
    if (won) return;
    sfx.click();
    const n = cells.map((c, i) => (i === k ? (c === "1" ? "0" : "1") : c));
    setCells(n);
    if (n.join("") === want) { sfx.tada(); setWon(true); onDone(); }
  };
  const rowsDone = SMILEY.map((r, i) => cells.slice(i * 5, i * 5 + 5).join("") === r);
  return (
    <div className="stack" style={{ gap: 12 }}>
      <p className="lead"><b>Be the screen!</b> The file says these numbers. Tap a pixel to colour it for each <b>1</b>.</p>
      <div className="pixels-anim">
        <div className="px-grid play">{cells.map((c, k) => <button key={k} className={c === "1" ? "dark" : "light"} onClick={() => flip(k)} aria-label={`Row ${Math.floor(k / 5) + 1}, pixel ${(k % 5) + 1}, ${c === "1" ? "coloured" : "blank"}`} />)}</div>
        <div className="px-nums">{SMILEY.map((r, i) => <code key={i} className={rowsDone[i] ? "on" : ""}>{r}{rowsDone[i] ? " ✓" : ""}</code>)}</div>
      </div>
      {won && <p className="game-msg" role="status">A smiley! You turned numbers into a picture, just like a phone does with a photo file.</p>}
    </div>
  );
}

export function DoIt({ doit, onDone }) {
  const G = { sort: SortGame, becomputer: BeComputerGame, powercut: PowerCutGame, build: BuildGame, order: OrderGame, pixels: PixelsGame }[doit.game];
  return <G {...doit} onDone={onDone} />;
}

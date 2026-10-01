// The Circuit Lab: pick parts from the tray, snap them onto the board, and watch the circuit work.
// Everything is live: current flows along connectors, bulbs glow, fans spin, chips play.
// Tap-first, so it works on phones without dragging; dragging, keys and pinch-zoom work too.
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import PartGlyph from "./PartGlyph.jsx";
import { PARTS } from "../../content/lab/parts.js";
import { EXAMPLES } from "../../content/lab/examples.js";
import { COLS, ROWS, PITCH, MARGIN, postXY, postName, inBounds, makePart, endOptions, isTwoPin, coveredPosts, fits, layerFor, remaining, toCircuit, describe, serialize, deserialize, buildBoard, pinPosts, samePlace, turned } from "../../lib/circuit/board.js";
import { LiveCircuit } from "../../lib/circuit/live.js";
import { createSoundPlayer } from "../../lib/circuit/sound.js";
import { useApp } from "../../lib/AppContext.jsx";
import { local } from "../../lib/storage.js";
import { sfx, isMuted, setMuted, onMuteChange } from "../../lib/sfx.js";

const W = MARGIN * 2 + (COLS - 1) * PITCH, H = MARGIN * 2 + (ROWS - 1) * PITCH;
const TRAY = [
  { title: "Power", types: ["battery", "wire"] },
  { title: "Switches", types: ["slide", "button", "changeover"] },
  { title: "Lights", types: ["lamp", "led"] },
  { title: "Move and sound", types: ["motor", "speaker", "piezo"] },
  { title: "Sensors", types: ["ldr", "touch", "probe"] },
  { title: "Control", types: ["resistor", "transistor"] },
  { title: "Chips", types: ["melody", "siren", "fx"] },
];
const LDR_CHOICES = [["bright", "☀️ Bright"], ["dim", "⛅ Dim"], ["dark", "🌑 Dark"], ["lamp", "💡 Lit by the bulb"]];
const MATERIALS = [["air", "Nothing"], ["spoon", "🥄 Spoon"], ["coin", "🪙 Coin"], ["foil", "✨ Foil"], ["key", "🔑 Key"], ["pencil", "✏️ Pencil line"], ["salt", "🧂 Salt water"], ["water", "💧 Tap water"], ["wetsoil", "🌱 Wet soil"], ["drysoil", "🏜️ Dry soil"], ["finger", "👆 Finger"], ["paper", "📄 Paper"], ["plastic", "📏 Plastic"], ["rubber", "🧽 Rubber"], ["wood", "🪵 Wood"]];
const fmtA = a => (Math.abs(a) >= 1 ? `${a.toFixed(2)} A` : Math.abs(a) >= 0.001 ? `${(a * 1000).toFixed(1)} mA` : Math.abs(a) >= 1e-6 ? `${(a * 1e6).toFixed(0)} µA` : "0");
const key = ([c, r]) => `${c},${r}`;
// "a 100 Ω resistor from C1 to E1", for the guide's hint.
function describeGhost(g) {
  const posts = Object.values(pinPosts(g)).map(postName);
  const what = g.type === "resistor" ? `a ${g.ohms >= 1000 ? `${g.ohms / 1000} kΩ` : `${g.ohms} Ω`} resistor` : g.type === "led" ? `a ${g.colour} LED (+ end at ${posts[0]})` : g.type === "battery" ? `the battery (+ end at ${posts[0]})` : g.type === "motor" ? `the motor (+ end at ${posts[0]})` : `a ${PARTS[g.type].name.toLowerCase()}`;
  return `${what}, ${posts.length === 2 ? `from ${posts[0]} to ${posts[1]}` : `with its + at ${posts[0]}`}`;
}

// Board history for undo/redo: { past: [parts…], now: parts, future: [parts…] }.
function history(state, action) {
  switch (action.type) {
    case "set": return action.parts === state.now ? state : { past: [...state.past.slice(-49), state.now], now: action.parts, future: [] };
    case "undo": return state.past.length ? { past: state.past.slice(0, -1), now: state.past.at(-1), future: [state.now, ...state.future] } : state;
    case "redo": return state.future.length ? { past: [...state.past, state.now], now: state.future[0], future: state.future.slice(1) } : state;
    default: return state;
  }
}

// Options (all optional), used by the project player:
//   saveKey   where to autosave (default: this child's free-build board)
//   initial   { parts, inputs } to start from when nothing is saved yet
//   kit       { type: count } limits instead of the full kit (connectors are always available)
//   trayTypes which parts the tray shows
//   guide     the parts of a reference layout: the next missing one is shown as a ghost to copy
//   actions   extra buttons shown under the hint (e.g. "Test my circuit")
//   examples  show the example boards (default true)
//   onChange(parts, inputs) whenever the board changes
export default function CircuitLab({ saveKey: saveKeyProp, initial, kit, trayTypes, guide, actions, examples = true, onChange } = {}) {
  const { activeChild } = useApp();
  const saveKey = saveKeyProp ?? `sparklab.lab.free.${activeChild?.id ?? "guest"}`;
  const saved = useMemo(() => { const s = local.get(saveKey, null); return s ? deserialize(s) : { parts: initial?.parts ?? [], inputs: initial?.inputs ?? {} }; }, [saveKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const [hist, dispatch] = useReducer(history, { past: [], now: saved.parts, future: [] });
  const parts = hist.now;
  const setParts = useCallback(p => dispatch({ type: "set", parts: p }), []);
  const [inputs, setInputs] = useState(saved.inputs);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState({ kind: "idle" }); // idle | place {type} | end {type, from} | move {uid}
  const [cursor, setCursor] = useState([3, 4]);
  const [zoom, setZoom] = useState(1);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(null); // { uid, dx, dy }
  const [muted, setMutedState] = useState(isMuted());
  const [meter, setMeter] = useState((activeChild?.grade ?? 0) >= 9 || activeChild?.learner === "adult");
  const [clearArmed, setClearArmed] = useState(false);
  const hintRef = useRef(null), wrapRef = useRef(null), svgRef = useRef(null), liveRef = useRef(null), playerRef = useRef(null), pointers = useRef(new Map()), gesture = useRef(null);

  useEffect(() => onMuteChange(setMutedState), []);
  // Autosave this child's board.
  useEffect(() => { local.set(saveKey, serialize(parts, inputs)); onChange?.(parts, inputs); }, [saveKey, parts, inputs]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live simulation and sound ──
  const circuitKey = useMemo(() => JSON.stringify(parts.map(p => [p.type, p.id, p.at, p.dir, p.len, p.ohms, p.colour])), [parts]);
  useEffect(() => {
    liveRef.current = new LiveCircuit(toCircuit(parts));
    for (const [id, v] of Object.entries(inputs)) liveRef.current.set(id, v);
  }, [circuitKey]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const live = liveRef.current; if (live) for (const [id, v] of Object.entries(inputs)) live.set(id, v); }, [inputs]);
  useEffect(() => {
    playerRef.current = createSoundPlayer();
    let raf, last = performance.now(), acc = 0, sig = "";
    const tick = now => {
      acc += (now - last) / 1000; last = now;
      if (acc >= 0.05 && liveRef.current) {
        const r = liveRef.current.step(Math.min(acc, 0.25)); acc = 0;
        playerRef.current.update(r);
        const s = JSON.stringify([r.outputs, r.short, Object.entries(r.chips).map(([id, c]) => [id, c.playing, c.sound, c.index]), Object.entries(r.readings.parts).map(([id, x]) => [id, Math.round(x.amps * 1000), Math.round(x.volts * 100)])]);
        if (s !== sig) { sig = s; setResult(r); }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); playerRef.current?.stopAll(); };
  }, []);

  // ── Helpers ──
  const left = type => (kit ? (type === "wire" ? 99 : (kit[type] ?? 0) - parts.filter(p => p.type === type).length) : remaining(parts, type));
  const next = guide ? guide.find(g => !parts.some(p => samePlace(p, g))) : null;
  const byUid = uid => parts.find(p => p.uid === uid);
  const sel = selected ? byUid(selected) : null;
  const topPartAt = at => [...parts].filter(p => coveredPosts(p).some(q => key(q) === key(at))).sort((a, b) => (b.layer ?? 1) - (a.layer ?? 1))[0];
  const setInput = (id, v) => setInputs(s => ({ ...s, [id]: v }));
  const add = part => { setParts([...parts, part]); setSelected(part.uid); sfx.click(); };
  const update = (uid, patch) => setParts(parts.map(p => (p.uid === uid ? { ...p, ...patch } : p)));
  const remove = uid => {
    const p = byUid(uid);
    setParts(parts.filter(x => x.uid !== uid));
    if (p) setInputs(s => { const n = { ...s }; delete n[p.id]; return n; });
    setSelected(null); sfx.off();
  };
  const turn = uid => {
    const p = byUid(uid);
    let q = p;
    for (let k = 1; k <= 4; k++) { q = turned(q); if (fits(q)) { update(uid, { at: q.at, dir: q.dir, layer: layerFor(parts, q) }); sfx.click(); return; } }
    sfx.oops();
  };
  const moveTo = (uid, at) => {
    const p = byUid(uid), q = { ...p, at };
    if (!fits(q)) { sfx.oops(); return false; }
    update(uid, { at, layer: layerFor(parts, q) }); sfx.click(); return true;
  };
  const pickType = type => {
    playerRef.current?.unlock();
    if (left(type) <= 0) { sfx.oops(); return; }
    setSelected(null); setMode(m => (m.kind !== "idle" && m.type === type ? { kind: "idle" } : { kind: "place", type })); sfx.click();
    // On phones the tray is under the board: make sure the board is in view to tap.
    const box = wrapRef.current?.getBoundingClientRect();
    if (box && (box.top < 0 || box.bottom > window.innerHeight - 80)) hintRef.current?.scrollIntoView?.({ block: "start", behavior: "smooth" });
  };
  const toggleInput = p => {
    if (p.type === "slide") setInput(p.id, inputs[p.id] === "on" ? "off" : "on");
    else if (p.type === "changeover") setInput(p.id, inputs[p.id] === "down" ? "up" : "down");
    else if (p.type === "touch") setInput(p.id, inputs[p.id] === "yes" ? "no" : "yes");
    else return;
    sfx.click();
  };

  // A tap on the board: a post (and the part on top there, if any).
  const tap = (at, uid) => {
    playerRef.current?.unlock();
    if (mode.kind === "place") {
      if (!at) return;
      if (isTwoPin(mode.type)) { setMode({ kind: "end", type: mode.type, from: at }); sfx.click(); return; }
      const p = makePart(parts, mode.type, at);
      if (p) { add(p); setMode({ kind: "idle" }); } else sfx.oops();
      return;
    }
    if (mode.kind === "end") {
      if (!at) return;
      const opt = endOptions(mode.type, mode.from).find(o => key(o.to) === key(at));
      if (opt) { const p = makePart(parts, mode.type, mode.from, { dir: opt.dir, len: opt.len }); if (p) { add(p); setMode({ kind: "idle" }); return; } }
      if (key(at) === key(mode.from)) { setMode({ kind: "place", type: mode.type }); return; }
      setMode({ kind: "end", type: mode.type, from: at }); sfx.click(); // start again from here
      return;
    }
    if (mode.kind === "move") { if (at && moveTo(mode.uid, at)) setMode({ kind: "idle" }); return; }
    const p = uid ? byUid(uid) : at ? topPartAt(at) : null;
    if (p) { setSelected(p.uid); toggleInput(p); } else setSelected(null);
  };

  // ── Pointer input: taps, drags, button presses, pinch zoom ──
  const toBoard = e => {
    const svg = svgRef.current, pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [q.x, q.y];
  };
  const nearestPost = ([x, y]) => {
    const at = [Math.round((x - MARGIN) / PITCH), Math.round((y - MARGIN) / PITCH)];
    const [px, py] = postXY(at);
    return inBounds(at) && Math.hypot(px - x, py - y) < PITCH * 0.48 ? at : null;
  };
  const onPointerDown = e => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { // pinch
      const [a, b] = [...pointers.current.values()];
      gesture.current = { pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y), z0: zoom };
      setDrag(null);
      return;
    }
    const xy = toBoard(e), uid = e.target.closest?.("[data-uid]")?.getAttribute("data-uid");
    const p = uid && mode.kind === "idle" ? byUid(uid) : null;
    gesture.current = { xy, uid: p?.uid, moved: false, client: [e.clientX, e.clientY] };
    if (p?.type === "button") { playerRef.current?.unlock(); setInput(p.id, "down"); sfx.on(); gesture.current.press = p.id; }
    svgRef.current.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = e => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    if (!g) return;
    if (g.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      setZoom(Math.max(0.6, Math.min(2.4, g.z0 * Math.hypot(a.x - b.x, a.y - b.y) / g.d0)));
      return;
    }
    const [x, y] = toBoard(e), dx = x - g.xy[0], dy = y - g.xy[1];
    // Zoomed in: dragging empty board scrolls it.
    if (!g.uid && zoom > 1 && wrapRef.current) {
      const [cx, cy] = g.client;
      if (g.moved || Math.hypot(e.clientX - cx, e.clientY - cy) > 8) {
        g.moved = true; g.pan = true;
        wrapRef.current.scrollBy(cx - e.clientX, cy - e.clientY);
        g.client = [e.clientX, e.clientY];
      }
      return;
    }
    if (g.uid && (g.moved || Math.hypot(dx, dy) > 10)) {
      if (!g.moved && g.press) { setInput(g.press, "up"); g.press = null; }
      g.moved = true;
      setDrag({ uid: g.uid, dx, dy });
    }
  };
  const onPointerUp = e => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (g.pinch) { if (pointers.current.size === 0) gesture.current = null; return; }
    gesture.current = null;
    if (g.press) { setInput(g.press, "up"); sfx.off(); }
    if (g.pan) return;
    if (g.moved && drag) {
      const p = byUid(drag.uid), step = [Math.round(drag.dx / PITCH), Math.round(drag.dy / PITCH)];
      setDrag(null);
      if (step[0] || step[1]) moveTo(p.uid, [p.at[0] + step[0], p.at[1] + step[1]]);
      setSelected(p.uid);
      return;
    }
    setDrag(null);
    if (e.type === "pointercancel") return;
    const at = nearestPost(toBoard(e));
    if (g.press) { setSelected(g.uid); return; } // a button press, not a tap to select
    tap(at, g.uid);
  };

  // ── Keyboard ──
  const onKeyDown = e => {
    const k = e.key;
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "z") { e.preventDefault(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "y") { e.preventDefault(); dispatch({ type: "redo" }); return; }
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (moves[k]) { e.preventDefault(); const n = [cursor[0] + moves[k][0], cursor[1] + moves[k][1]]; if (inBounds(n)) setCursor(n); return; }
    if (k === "Enter" || k === " ") {
      e.preventDefault();
      const p = topPartAt(cursor);
      if (mode.kind === "idle" && p?.type === "button") { setInput(p.id, inputs[p.id] === "down" ? "up" : "down"); setSelected(p.uid); return; }
      tap(cursor, null); return;
    }
    if (k === "Escape") { setMode({ kind: "idle" }); setSelected(null); return; }
    if (sel && (k === "Delete" || k === "Backspace")) { e.preventDefault(); remove(sel.uid); return; }
    if (sel && k.toLowerCase() === "r") { turn(sel.uid); return; }
  };

  // ── What to show ──
  const placed = parts.map(p => ({ ...p, anchorXY: postXY(p.at) })).sort((a, b) => (a.layer ?? 1) - (b.layer ?? 1));
  const targets = mode.kind === "end" ? endOptions(mode.type, mode.from) : [];
  const out = result?.outputs ?? {};
  const loadExample = ex => { const b = buildBoard(ex.steps); if (b) { setParts(b); setInputs({}); setSelected(null); setMode({ kind: "idle" }); sfx.tada(); } };
  const nameOf = type => PARTS[type].name;
  const hint = result?.short ? "⚠️ Short circuit! The battery's + and − are joined with almost nothing in between. A real battery would get hot. Find the shortcut and take it away."
    : mode.kind === "place" ? (isTwoPin(mode.type) ? `Tap a post for one end of the ${nameOf(mode.type).toLowerCase()}.` : `Tap a post to put the ${nameOf(mode.type).toLowerCase()} there. You can turn it after.`)
    : mode.kind === "end" ? (mode.type === "wire" ? "Now tap a glowing post for the other end (up to 6 posts away)." : "Now tap a glowing post for the other end.")
    : mode.kind === "move" ? "Tap a post to move it there."
    : next ? `Next: ${describeGhost(next)}. Pick it from the tray, then tap the posts where the faint one is.`
    : sel ? `${nameOf(sel.type)} ${sel.id}. Drag it to move it, or use the buttons below.`
    : parts.length ? "Tap a part to choose it. Tap switches to flip them; press and hold buttons." : "Pick a part from the tray, then tap the board.";
  const status = describe(parts, result).filter(l => / is /.test(l) || /^Short/.test(l)).join(" ");
  const reading = sel && result?.readings?.parts?.[sel.id];

  return (
    <div className="lab">
      <div className="lab-toolbar">
        <button className="btn ghost" onClick={() => dispatch({ type: "undo" })} disabled={!hist.past.length} aria-label="Undo">↶</button>
        <button className="btn ghost" onClick={() => dispatch({ type: "redo" })} disabled={!hist.future.length} aria-label="Redo">↷</button>
        <span className="spacer" />
        <button className="btn ghost" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Zoom out">－</button>
        <button className="btn ghost lab-zoom" onClick={() => setZoom(1)} aria-label="Fit the board">{Math.round(zoom * 100)}%</button>
        <button className="btn ghost" onClick={() => setZoom(z => Math.min(2.4, +(z + 0.2).toFixed(1)))} aria-label="Zoom in">＋</button>
        <span className="spacer" />
        <button className="btn ghost" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"}>{muted ? "🔇" : "🔊"}</button>
        <button className={`btn ghost${clearArmed ? " danger" : ""}`} disabled={!parts.length} aria-label={clearArmed ? "Tap again to clear the board" : "Clear the board"}
          onClick={() => { if (clearArmed) { setParts([]); setInputs({}); setSelected(null); setClearArmed(false); } else { setClearArmed(true); setTimeout(() => setClearArmed(false), 3000); } }}>
          {clearArmed ? "Sure? 🧹" : "🧹"}
        </button>
      </div>

      <p ref={hintRef} className={`lab-hint${result?.short ? " bad" : ""}`} role="status">{hint}</p>
      {actions && <div className="lab-actions">{actions}</div>}

      <div ref={wrapRef} className="lab-board-wrap" tabIndex={0} role="application" aria-roledescription="circuit board"
        aria-label={`Circuit board, ${COLS} by ${ROWS} posts. Arrow keys move, Enter places or chooses, R turns, Delete removes. Cursor at ${postName(cursor)}.`}
        onKeyDown={onKeyDown}>
        <svg ref={svgRef} className={`lab-board${result?.short ? " short" : ""}${mode.kind !== "idle" ? " placing" : ""}`} viewBox={`0 0 ${W} ${H}`} style={{ width: `calc(min(100%, 58vh) * ${zoom})` }}
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
          <rect className="lab-bg" x={8} y={8} width={W - 16} height={H - 16} rx={22} />
          {Array.from({ length: COLS }, (_, c) => <text key={`c${c}`} className="lab-coord" x={MARGIN + c * PITCH} y={20} textAnchor="middle">{"ABCDEFG"[c]}</text>)}
          {Array.from({ length: ROWS }, (_, r) => <text key={`r${r}`} className="lab-coord" x={18} y={MARGIN + r * PITCH + 4} textAnchor="middle">{r + 1}</text>)}
          {Array.from({ length: COLS * ROWS }, (_, i) => { const at = [i % COLS, Math.floor(i / COLS)], [x, y] = postXY(at); return <circle key={i} className="lab-post" cx={x} cy={y} r={7} />; })}

          {placed.map(p => (
            <PartGlyph key={p.uid} part={p} out={out[p.id]} input={inputs[p.id]} amps={result?.readings?.parts?.[p.id]?.amps ?? 0}
              chip={result?.chips?.[p.id]} selected={p.uid === selected} dragging={drag?.uid === p.uid} offset={drag?.uid === p.uid ? [drag.dx, drag.dy] : [0, 0]} />
          ))}

          {next && <PartGlyph part={{ ...next, anchorXY: postXY(next.at) }} ghost showLabel={false} />}
          {next && Object.values(pinPosts(next)).map(at => <circle key={`g${key(at)}`} className="lab-ghost-pin" cx={postXY(at)[0]} cy={postXY(at)[1]} r={14} />)}
          {mode.kind === "end" && <circle className="lab-from" cx={postXY(mode.from)[0]} cy={postXY(mode.from)[1]} r={16} />}
          {targets.map(o => <circle key={key(o.to)} className="lab-target" cx={postXY(o.to)[0]} cy={postXY(o.to)[1]} r={15} />)}
          <circle className="lab-cursor" cx={postXY(cursor)[0]} cy={postXY(cursor)[1]} r={22} />
        </svg>
        {!parts.length && examples && (
          <div className="lab-empty">
            <p><b>Start building!</b> Pick a 🔋 battery from the tray, then tap two posts. Or try an example:</p>
            <div className="row center-row">{EXAMPLES.map(ex => <button key={ex.id} className="btn" onClick={() => loadExample(ex)}>{ex.emoji} {ex.title}</button>)}</div>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>
      <div className="lab-tray" role="toolbar" aria-label="Parts tray">
        {(trayTypes ? [{ title: "Your parts", types: trayTypes }] : TRAY).map(g => (
          <div key={g.title} className="lab-tray-group">
            <span className="eyebrow">{g.title}</span>
            <div className="lab-tray-items">
              {g.types.map(type => {
                const n = left(type), active = mode.kind !== "idle" && mode.kind !== "move" && mode.type === type, isNext = next?.type === type && !active;
                return (
                  <button key={type} className={`lab-tray-item${active ? " on" : ""}${isNext ? " next" : ""}`} aria-pressed={active} disabled={n <= 0} onClick={() => pickType(type)} title={PARTS[type].say}>
                    <span className="em" aria-hidden="true">{PARTS[type].emoji}</span>
                    <span className="nm">{PARTS[type].name}</span>
                    {type !== "wire" && <small>{n} left</small>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {sel && (
        <div className="lab-inspector" aria-label={`${nameOf(sel.type)} ${sel.id}`}>
          <div className="lab-insp-head">
            <span className="em" aria-hidden="true">{PARTS[sel.type].emoji}</span>
            <div><b>{nameOf(sel.type)} {sel.type !== "wire" && sel.id}</b><p className="muted">{PARTS[sel.type].say}</p></div>
          </div>
          {sel.type === "slide" && <button className={`switch-btn${inputs[sel.id] === "on" ? "" : " off"}`} onClick={() => toggleInput(sel)}>{inputs[sel.id] === "on" ? "Switch OFF" : "Switch ON"}</button>}
          {sel.type === "button" && (
            <button className="switch-btn" onPointerDown={() => { playerRef.current?.unlock(); setInput(sel.id, "down"); }} onPointerUp={() => setInput(sel.id, "up")} onPointerLeave={() => inputs[sel.id] === "down" && setInput(sel.id, "up")}
              onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); setInput(sel.id, "down"); } }} onKeyUp={() => setInput(sel.id, "up")}>
              {inputs[sel.id] === "down" ? "Pressed!" : "Press and hold"}
            </button>
          )}
          {sel.type === "changeover" && <div className="chips">{[["up", "▲ Top pin"], ["down", "▼ Bottom pin"]].map(([v, l]) => <button key={v} className="chip" aria-pressed={(inputs[sel.id] ?? "up") === v} onClick={() => setInput(sel.id, v)}>{l}</button>)}</div>}
          {sel.type === "ldr" && <div className="chips">{LDR_CHOICES.map(([v, l]) => <button key={v} className="chip" aria-pressed={(inputs[sel.id] ?? "bright") === v} onClick={() => setInput(sel.id, v)}>{l}</button>)}</div>}
          {sel.type === "touch" && <button className={`switch-btn${inputs[sel.id] === "yes" ? "" : " off"}`} onClick={() => toggleInput(sel)}>{inputs[sel.id] === "yes" ? "Take your finger off" : "Put your finger on"}</button>}
          {sel.type === "probe" && <><span className="eyebrow">Put in the gap</span><div className="chips">{MATERIALS.map(([v, l]) => <button key={v} className="chip" aria-pressed={(inputs[sel.id] ?? "air") === v} onClick={() => setInput(sel.id, v)}>{l}</button>)}</div></>}
          {sel.type === "piezo" && <button className="switch-btn" onClick={() => { playerRef.current?.unlock(); liveRef.current?.clap(sel.id); sfx.bump(); }}>👏 Clap</button>}
          {sel.type === "resistor" && <div className="chips">{[100, 1000, 10000].map(v => <button key={v} className="chip" aria-pressed={sel.ohms === v} onClick={() => update(sel.uid, { ohms: v })}>{v >= 1000 ? `${v / 1000} kΩ` : `${v} Ω`}</button>)}</div>}
          {sel.type === "led" && <div className="chips">{["red", "yellow", "green"].map(v => <button key={v} className="chip" aria-pressed={sel.colour === v} onClick={() => update(sel.uid, { colour: v })}>{{ red: "🔴", yellow: "🟡", green: "🟢" }[v]} {v}</button>)}</div>}
          {meter && reading && sel.type !== "battery" && (
            <p className="lab-meter">🔬 Current: <b>{fmtA(Math.abs(reading.amps))}</b>{sel.type !== "wire" && <> · Voltage across: <b>{Math.abs(reading.volts).toFixed(2)} V</b></>}</p>
          )}
          {meter && sel.type === "battery" && result && <p className="lab-meter">🔬 Battery current: <b>{fmtA(result.readings.batteryAmps)}</b></p>}
          <div className="row">
            <button className="btn" onClick={() => turn(sel.uid)}>⟳ Turn</button>
            <button className="btn" onClick={() => setMode({ kind: "move", uid: sel.uid })}>✥ Move</button>
            <button className="btn" onClick={() => remove(sel.uid)}>🗑 Remove</button>
            <span className="spacer" />
            <button className="btn ghost" aria-pressed={meter} onClick={() => setMeter(m => !m)}>🔬 Meter</button>
          </div>
        </div>
      )}

      <details className="lab-describe">
        <summary>🗣 Describe my circuit</summary>
        <ul>{describe(parts, result).map((l, i) => <li key={i}>{l}</li>)}</ul>
      </details>
      {parts.length > 0 && examples && (
        <details className="lab-examples">
          <summary>💡 Examples</summary>
          <p className="muted">Loading an example replaces your board (you can undo).</p>
          <div className="row">{EXAMPLES.map(ex => <button key={ex.id} className="btn" onClick={() => loadExample(ex)}>{ex.emoji} {ex.title}</button>)}</div>
        </details>
      )}
    </div>
  );
}

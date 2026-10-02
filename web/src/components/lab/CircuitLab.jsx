// The Circuit Lab: pick parts from the tray, snap them onto the board, and watch the circuit work.
// Everything is live: current flows along connectors, bulbs glow, fans spin, chips play.
//
// Made for small hands (from testing with children):
// - Placing or moving a part never opens its toolbar: the buttons only appear when the child taps
//   the part on purpose.
// - Tapping a part only chooses it. Its buttons appear in Volt's hint card above the board (switch ON/OFF, press,
//   turn, flip, move, remove). Double-tapping a switch also flips it.
// - Drag a part from anywhere on it. While dragging, the posts it will land on glow green (free)
//   or red (taken); it snaps there when you let go, or goes back if the spot is taken.
// - A part can also be dragged straight from the tray onto the board. Dropped on the faint guide
//   part, it snaps into exactly that place. (Tapping the tray part, then the posts, still works.)
// - Once the circuit is finished (every guide part in place, or its test passed) the board locks
//   itself, so playing with the circuit can't break it by accident. Unlock, in the toolbar, is the
//   one place to go back to changing parts.
// - Full screen hides the rest of the app (top bar, navigation, project header) so a big circuit has
//   the whole screen: the board on one side, with Test, Volt's hint and the parts beside it.
// - Lock freezes the build: parts can't be picked up, moved, turned or removed, and the tray is
//   off. No buttons pop up on a locked board: a tap flips a switch, pressing a push button holds
//   it down, and the labels (S1, L1…) say which part is which.
// - Every tap goes to the nearest post (a big target), and a tap that doesn't fit cancels.
// - The board, the hint and the parts tray are on screen together on phones, tablets and laptops:
//   the board is sized to the height left over (see --lab-fit in app.css). Volt's hint is always
//   above the board. On tablets and laptops the parts sit beside the board; on phones they are
//   docked at the bottom. "Describe my circuit" is under the board. A project opens scrolled to its "Test my circuit" row; after
//   that the board never scrolls by itself.
// - In guided projects the next part pulses, each right step gets a ✓, "Show me" demonstrates
//   the next step, and the hint names the real problem (a part the wrong way round, a spare part).
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import PartPic from "./PartPic.jsx";
import Icon from "./Icon.jsx";
import PartGlyph from "./PartGlyph.jsx";
import { VoltFace } from "../journey/Guide.jsx";
import { PARTS } from "../../content/lab/parts.js";
import { EXAMPLES } from "../../content/lab/examples.js";
import {
  COLS, ROWS, PITCH, MARGIN, postXY, postName, inBounds, makePart, endOptions, isTwoPin, coveredPosts, fits, layerFor, remaining,
  toCircuit, describe, serialize, deserialize, buildBoard, pinPosts, samePlace, turned, flipped, clashes, reversedOf, strays, HAS_DIRECTION,
} from "../../lib/circuit/board.js";
import { LiveCircuit } from "../../lib/circuit/live.js";
import { createSoundPlayer } from "../../lib/circuit/sound.js";
import { useApp } from "../../lib/AppContext.jsx";
import { local } from "../../lib/storage.js";
import { sfx, isMuted, setMuted, onMuteChange } from "../../lib/sfx.js";
import { speak, hush } from "../../lib/speech.js";

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
const buzz = ms => { try { navigator.vibrate?.(ms); } catch { /* no vibration here */ } };
const DOUBLE_TAP_MS = 380;

// "a 100 Ω resistor, from C1 to E1", for the guide's hint.
function describeGhost(g) {
  const posts = Object.values(pinPosts(g)).map(postName);
  const what = g.type === "resistor" ? `a ${g.ohms >= 1000 ? `${g.ohms / 1000} kΩ` : `${g.ohms} Ω`} resistor` : g.type === "led" ? `a ${g.colour} LED (+ end at ${posts[0]})` : g.type === "battery" ? `the battery (+ end at ${posts[0]})` : g.type === "motor" ? `the motor (+ end at ${posts[0]})` : `a ${PARTS[g.type].name.toLowerCase()}`;
  return `${what}, ${posts.length === 2 ? `from ${posts[0]} to ${posts[1]}` : `with its + at ${posts[0]}`}`;
}
// A part's footprint on the board, in board units: [x0, y0, x1, y1].
function partRect(p) {
  const xy = Object.values(pinPosts(p)).map(postXY), pad = p.type === "wire" ? 13 : 24;
  return [Math.min(...xy.map(q => q[0])) - pad, Math.min(...xy.map(q => q[1])) - pad, Math.max(...xy.map(q => q[0])) + pad, Math.max(...xy.map(q => q[1])) + pad];
}
// How far a point is from a part's middle line (0 inside chips), to pick the part you meant.
function spineDistance(p, [x, y]) {
  const xy = Object.values(pinPosts(p)).map(postXY);
  if (xy.length > 2) return 0;
  const [[ax, ay], [bx, by]] = xy, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2 || 1)));
  return Math.hypot(x - (ax + t * (bx - ax)), y - (ay + t * (by - ay)));
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
//   finished  the circuit has passed its test: play with it, with the editing tools tucked away
//   onChange(parts, inputs) whenever the board changes
export default function CircuitLab({ saveKey: saveKeyProp, initial, kit, trayTypes, guide, actions, examples = true, finished: finishedProp = false, onChange } = {}) {
  const { activeChild } = useApp();
  const young = (activeChild?.grade ?? 3) <= 2 && activeChild?.learner !== "adult";
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
  const [drag, setDrag] = useState(null); // { uid, dx, dy, to, ok, moved }
  const [trayDrag, setTrayDrag] = useState(null); // { type, part, ok } while a part is dragged out of the tray
  const [located, setLocated] = useState(null); // { type, n }: a placed part pressed in the tray, shown ringed on the board for a moment
  const [locked, setLocked] = useState(false); // the build is frozen; only switches work
  const [full, setFull] = useState(false);     // the lab fills the screen
  const [notice, setNotice] = useState(null);
  const [cheer, setCheer] = useState(null); // { uid, n } for the ✓ after a right step
  const [showMe, setShowMe] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [autoRead, setAutoRead] = useState(() => local.get("sparklab.lab.readHints", young));
  const [meter, setMeter] = useState((activeChild?.grade ?? 0) >= 9 || activeChild?.learner === "adult");
  const [clearArmed, setClearArmed] = useState(false);
  const trayGesture = useRef(null), trayGhost = useRef(null);
  const wrapRef = useRef(null), svgRef = useRef(null), liveRef = useRef(null), playerRef = useRef(null);
  const pointers = useRef(new Map()), gesture = useRef(null), lastTap = useRef({ uid: null, t: 0 }), satisfied = useRef(null), noticeTimer = useRef(null);

  useEffect(() => onMuteChange(setMutedState), []);
  // Full screen: a class on <html> hides the app around the lab (see app.css). Where the browser
  // allows it, the browser's own full screen is used too; leaving that (Esc) leaves this.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("lab-fullscreen", full);
    if (full) { window.scrollTo({ top: 0 }); try { root.requestFullscreen?.()?.catch?.(() => {}); } catch { /* not allowed here */ } }
    else if (document.fullscreenElement) { try { document.exitFullscreen?.()?.catch?.(() => {}); } catch { /* ignore */ } }
    return () => root.classList.remove("lab-fullscreen");
  }, [full]);
  useEffect(() => {
    let entered = false;
    const onChange = () => { if (document.fullscreenElement) entered = true; else if (entered) { entered = false; setFull(false); } };
    const onKey = e => { if (e.key === "Escape" && !document.fullscreenElement) setFull(false); };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("fullscreenchange", onChange); document.removeEventListener("keydown", onKey); if (document.fullscreenElement) { try { document.exitFullscreen?.()?.catch?.(() => {}); } catch { /* ignore */ } } };
  }, []);
  const toggleLock = () => { const v = !locked; setLocked(v); setMode({ kind: "idle" }); setSelected(null); setDrag(null); sfx.click(); };

  // A project's board opens with its action row at the top of the screen, so the board, hint and tray all fit below it.
  const actionsRef = useRef(null);
  useEffect(() => { actionsRef.current?.scrollIntoView({ block: "start" }); }, []);
  useEffect(() => { local.set(saveKey, serialize(parts, inputs)); onChange?.(parts, inputs); }, [saveKey, parts, inputs]); // eslint-disable-line react-hooks/exhaustive-deps
  const say = msg => { setNotice(msg); clearTimeout(noticeTimer.current); noticeTimer.current = setTimeout(() => setNotice(null), 3500); };

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
    return () => { cancelAnimationFrame(raf); playerRef.current?.stopAll(); clearTimeout(noticeTimer.current); };
  }, []);

  // ── Guide: what's next, what's almost right, what's not needed ──
  const left = type => (kit ? (type === "wire" ? 99 : (kit[type] ?? 0) - parts.filter(p => p.type === type).length) : remaining(parts, type));
  const next = guide ? guide.find(g => !parts.some(p => samePlace(p, g))) : null;
  const almost = next ? reversedOf(parts, next) : null;
  const spare = guide ? strays(parts, guide)[0] ?? null : null;
  const finished = finishedProp || Boolean(guide && parts.length && !next && !spare);
  // The moment a circuit is finished, it locks. Unlocking is the child's choice, and it stays unlocked
  // until the circuit is changed and finished again.
  const wasFinished = useRef(false);
  useEffect(() => {
    if (finished && !wasFinished.current) { setLocked(true); setSelected(null); setMode({ kind: "idle" }); }
    wasFinished.current = finished;
  }, [finished]);
  // A ✓ (with a sound and a buzz) each time a part lands where the guide wants it.
  useEffect(() => {
    if (!guide) return;
    const now = new Set(guide.filter(g => parts.some(p => samePlace(p, g))).map((g, i) => `${g.type}${i}${key(g.at)}`));
    const before = satisfied.current;
    satisfied.current = now;
    if (!before) return;
    const fresh = [...now].filter(k => !before.has(k));
    if (fresh.length) {
      const g = guide.find(x => parts.some(p => samePlace(p, x)) && fresh.some(k => k.endsWith(key(x.at)) && k.startsWith(x.type)));
      const p = g && parts.find(x => samePlace(x, g));
      if (p) { setCheer({ uid: p.uid, n: Date.now() }); sfx.ding(); buzz(25); setTimeout(() => setCheer(c => (c?.uid === p.uid ? null : c)), 1300); }
    }
  }, [parts, guide]);

  // ── Helpers ──
  const byUid = uid => parts.find(p => p.uid === uid);
  const sel = selected ? byUid(selected) : null;
  const partAt = xy => {
    const hit = parts.filter(p => { const [x0, y0, x1, y1] = partRect(p); return xy[0] >= x0 && xy[0] <= x1 && xy[1] >= y0 && xy[1] <= y1; });
    return hit.sort((a, b) => spineDistance(a, xy) - spineDistance(b, xy) || (b.layer ?? 1) - (a.layer ?? 1))[0] ?? null;
  };
  const topPartAt = at => [...parts].filter(p => coveredPosts(p).some(q => key(q) === key(at))).sort((a, b) => (b.layer ?? 1) - (a.layer ?? 1))[0];
  const setInput = (id, v) => setInputs(s => ({ ...s, [id]: v }));
  const others = uid => parts.filter(p => p.uid !== uid);
  const add = part => {
    if (clashes(parts, part)) { sfx.oops(); say("Another part is already there. Pick other posts."); return false; }
    setParts([...parts, part]); setSelected(null); sfx.click(); buzz(12); return true;
  };
  const update = (uid, patch) => setParts(parts.map(p => (p.uid === uid ? { ...p, ...patch } : p)));
  const remove = uid => {
    const p = byUid(uid);
    setParts(parts.filter(x => x.uid !== uid));
    if (p) setInputs(s => { const n = { ...s }; delete n[p.id]; return n; });
    setSelected(null); sfx.off();
  };
  const place = (uid, q) => {
    if (!fits(q)) { sfx.oops(); say("That doesn't fit on the board."); return false; }
    if (clashes(others(uid), q)) { sfx.oops(); say("Another part is already there."); return false; }
    update(uid, { at: q.at, dir: q.dir, layer: layerFor(others(uid), q) }); sfx.click(); buzz(12); return true;
  };
  const turn = uid => {
    let q = byUid(uid);
    for (let k = 1; k <= 4; k++) { q = turned(q); if (fits(q) && !clashes(others(uid), q)) { place(uid, q); return; } }
    sfx.oops(); say("There's no room to turn it here. Move it first.");
  };
  const flip = uid => place(uid, flipped(byUid(uid)));
  const moveTo = (uid, at) => place(uid, { ...byUid(uid), at });
  // Pressing a part in the tray that is already on the board shows where it is.
  const locate = type => {
    const n = Date.now();
    setSelected(null); setMode({ kind: "idle" }); setLocated({ type, n }); sfx.click(); buzz(10);
    const count = parts.filter(p => p.type === type).length;
    say(count > 1 ? `Your ${count} ${lower(type)}s are ringed on the board.` : `Your ${lower(type)} is ringed on the board.`);
    setTimeout(() => setLocated(l => (l?.n === n ? null : l)), 2600);
  };
  const cancel = msg => { setMode({ kind: "idle" }); if (msg) say(msg); };
  const pickType = type => {
    playerRef.current?.unlock();
    if (locked) { sfx.oops(); say("The board is locked. Tap Unlock to change parts."); return; }
    if (left(type) <= 0) { sfx.oops(); return; }
    setSelected(null); setShowMe(false);
    setMode(m => (m.kind !== "idle" && m.type === type ? { kind: "idle" } : { kind: "place", type })); sfx.click();
  };
  const toggleInput = p => {
    if (p.type === "slide") setInput(p.id, inputs[p.id] === "on" ? "off" : "on");
    else if (p.type === "changeover") setInput(p.id, inputs[p.id] === "down" ? "up" : "down");
    else if (p.type === "touch") setInput(p.id, inputs[p.id] === "yes" ? "no" : "yes");
    else return false;
    sfx.click(); buzz(10); return true;
  };

  // A tap on the board: the nearest post, and the part you tapped (if any).
  const tap = (at, uid) => {
    playerRef.current?.unlock();
    if (mode.kind === "place") {
      if (!at) { cancel("Cancelled."); return; }
      if (isTwoPin(mode.type)) { setMode({ kind: "end", type: mode.type, from: at }); sfx.click(); buzz(8); return; }
      const p = makePart(parts, mode.type, at);
      if (p && add(p)) setMode({ kind: "idle" });
      else if (!p) { sfx.oops(); say("That doesn't fit there. Try a post further in."); }
      return;
    }
    if (mode.kind === "end") {
      const opt = at && endOptions(mode.type, mode.from).find(o => key(o.to) === key(at));
      if (opt) { const p = makePart(parts, mode.type, mode.from, { dir: opt.dir, len: opt.len }); if (p && add(p)) setMode({ kind: "idle" }); return; }
      if (at && key(at) === key(mode.from)) { setMode({ kind: "place", type: mode.type }); return; }
      cancel("Cancelled. Pick the part again to start over."); return;
    }
    if (mode.kind === "move") { if (at && moveTo(mode.uid, at)) setMode({ kind: "idle" }); else if (!at) cancel("Cancelled."); return; }
    const p = uid ? byUid(uid) : null;
    if (!p) { setSelected(null); return; }
    const now = performance.now(), double = lastTap.current.uid === p.uid && now - lastTap.current.t < DOUBLE_TAP_MS;
    lastTap.current = { uid: p.uid, t: now };
    if (locked) { // no buttons pop up: a tap flips a switch or claps; parts with settings (light, gap) show them below
      setSelected(["ldr", "probe"].includes(p.type) ? p.uid : null);
      if (p.type === "piezo") { liveRef.current?.clap(p.id); sfx.bump(); buzz(15); } else toggleInput(p);
      return;
    }
    setSelected(p.uid);
    if (double) toggleInput(p);
  };

  // ── Pointer input: tap, drag from anywhere on a part, pinch to zoom ──
  const toBoard = e => {
    const svg = svgRef.current, pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [q.x, q.y];
  };
  // Every tap counts for the nearest post (a big target), unless it's off the board.
  const nearestPost = ([x, y]) => {
    const at = [Math.round((x - MARGIN) / PITCH), Math.round((y - MARGIN) / PITCH)];
    const [px, py] = postXY(at);
    return inBounds(at) && Math.hypot(px - x, py - y) < PITCH * 0.72 ? at : null;
  };
  const onPointerDown = e => {
    wrapRef.current?.focus({ preventScroll: true });
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) { // pinch
      const [a, b] = [...pointers.current.values()];
      gesture.current = { pinch: true, d0: Math.hypot(a.x - b.x, a.y - b.y), z0: zoom };
      setDrag(null);
      return;
    }
    const xy = toBoard(e), p = mode.kind === "idle" ? partAt(xy) : null;
    gesture.current = { xy, uid: p?.uid, moved: false, client: [e.clientX, e.clientY] };
    if (p && !locked) setDrag({ uid: p.uid, dx: 0, dy: 0, to: p.at, ok: true, moved: false }); // picked up: it lifts under your finger
    if (p && locked && p.type === "button") { playerRef.current?.unlock(); gesture.current.hold = p.id; setInput(p.id, "down"); buzz(10); } // locked: press the push button itself
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
    if (!g.uid && zoom > 1 && wrapRef.current) { // zoomed in: dragging empty board scrolls it
      const [cx, cy] = g.client;
      if (g.moved || Math.hypot(e.clientX - cx, e.clientY - cy) > 8) { g.moved = true; g.pan = true; wrapRef.current.scrollBy(cx - e.clientX, cy - e.clientY); g.client = [e.clientX, e.clientY]; }
      return;
    }
    if (!g.uid) return;
    const [x, y] = toBoard(e), dx = x - g.xy[0], dy = y - g.xy[1];
    if (locked) { if (Math.hypot(dx, dy) >= 7) g.moved = true; return; } // locked: parts stay where they are
    if (!g.moved && Math.hypot(dx, dy) < 7) return;
    g.moved = true;
    const p = byUid(g.uid), to = [p.at[0] + Math.round(dx / PITCH), p.at[1] + Math.round(dy / PITCH)], q = { ...p, at: to };
    setDrag({ uid: g.uid, dx, dy, to, ok: fits(q) && !clashes(others(p.uid), q), moved: true });
  };
  const onPointerUp = e => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (!g) return;
    if (g.pinch) { if (pointers.current.size === 0) gesture.current = null; return; }
    gesture.current = null;
    if (g.hold) { setInput(g.hold, "up"); setDrag(null); return; } // the push button springs back
    const d = drag;
    setDrag(null);
    if (g.pan || e.type === "pointercancel") return;
    if (g.moved && d?.moved) {
      const p = byUid(d.uid);
      setSelected(null); // a drag moves the part; only a tap opens its buttons
      if (key(d.to) === key(p.at)) return;
      if (d.ok) moveTo(p.uid, d.to); else { sfx.oops(); say(fits({ ...p, at: d.to }) ? "That spot is taken, so it went back." : "That's off the board, so it went back."); }
      return;
    }
    if (g.moved) return; // a drag on a locked board does nothing (it isn't a tap)
    tap(nearestPost(toBoard(e)), g.uid);
  };

  // ── Dragging a part out of the tray ──
  // The picture under the finger is moved directly (no re-render); the board only redraws when the
  // posts it would land on change.
  const trayPart = (type, e) => {
    const xy = toBoard(e);
    if (next?.type === type) { // near the faint guide part: land exactly on it
      const [x0, y0, x1, y1] = partRect(next);
      if (xy[0] >= x0 - 26 && xy[0] <= x1 + 26 && xy[1] >= y0 - 26 && xy[1] <= y1 + 26) return makePart(parts, type, next.at, { dir: next.dir, len: next.len, ohms: next.ohms, colour: next.colour });
    }
    const at = nearestPost([xy[0] - PITCH, xy[1]]) ?? nearestPost(xy); // the part's middle sits under the finger
    return at ? makePart(parts, type, at, { dir: 0, len: 2 }) ?? makePart(parts, type, at, { len: 2 }) : null;
  };
  const moveGhost = () => { const g = trayGesture.current, el = trayGhost.current; if (g && el) el.style.transform = `translate(${g.cx}px, ${g.cy}px)`; };
  const onTrayDown = (type, e) => {
    if (locked || left(type) <= 0 || (e.pointerType === "mouse" && e.button !== 0)) return;
    trayGesture.current = { type, x: e.clientX, y: e.clientY, cx: e.clientX, cy: e.clientY, dragged: false, sig: null };
    try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* the pointer has already gone */ }
  };
  const onTrayMove = e => {
    const g = trayGesture.current;
    if (!g || g.done) return;
    if (!g.dragged) {
      if (Math.hypot(e.clientX - g.x, e.clientY - g.y) < 6) return;
      g.dragged = true; playerRef.current?.unlock(); setSelected(null); setShowMe(false); setMode({ kind: "idle" });
    }
    g.cx = e.clientX; g.cy = e.clientY; moveGhost();
    const part = trayPart(g.type, e), ok = !!part && !clashes(parts, part);
    const sig = part ? `${key(part.at)}:${part.dir}:${ok}` : "off";
    if (sig !== g.sig) { g.sig = sig; g.part = part; g.ok = ok; setTrayDrag({ type: g.type, part, ok }); }
  };
  const onTrayUp = e => {
    const g = trayGesture.current;
    if (!g || g.done) return;
    if (!g.dragged) { trayGesture.current = null; return; } // a tap: the click picks the part
    g.done = true; setTrayDrag(null);
    if (e.type !== "pointercancel") {
      if (g.part && g.ok) add(g.part);
      else if (g.part) { sfx.oops(); say("Another part is already there. Drop it on free posts."); }
      else say("Drop the part on the board.");
    }
    setTimeout(() => { trayGesture.current = null; }, 0); // after the click that follows a drag, which is ignored
  };

  // ── Keyboard ──
  const onKeyDown = e => {
    const k = e.key;
    if (locked && ((e.ctrlKey || e.metaKey) || ["Delete", "Backspace", "r", "R", "f", "F"].includes(k))) return; // no edits while locked
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "z") { e.preventDefault(); dispatch({ type: e.shiftKey ? "redo" : "undo" }); return; }
    if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === "y") { e.preventDefault(); dispatch({ type: "redo" }); return; }
    const moves = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (moves[k]) { e.preventDefault(); const n = [cursor[0] + moves[k][0], cursor[1] + moves[k][1]]; if (inBounds(n)) setCursor(n); return; }
    if (k === "Enter" || k === " ") { e.preventDefault(); tap(cursor, mode.kind === "idle" ? topPartAt(cursor)?.uid : null); return; }
    if (k === "Escape") { setMode({ kind: "idle" }); setSelected(null); return; }
    if (!sel) return;
    if (k === "Delete" || k === "Backspace") { e.preventDefault(); remove(sel.uid); }
    else if (k.toLowerCase() === "r") turn(sel.uid);
    else if (k.toLowerCase() === "f" && HAS_DIRECTION.has(sel.type)) flip(sel.uid);
    else if (k.toLowerCase() === "t") { if (sel.type === "button") setInput(sel.id, inputs[sel.id] === "down" ? "up" : "down"); else toggleInput(sel); }
  };

  // ── Show me: pick the next part for the child and demonstrate where it goes ──
  const showNext = () => {
    if (!next) return;
    playerRef.current?.unlock();
    setSelected(null); setShowMe(true);
    if (left(next.type) > 0) setMode({ kind: "place", type: next.type });
    setTimeout(() => setShowMe(false), 3200);
  };

  // ── What to show ──
  const placed = parts.map(p => ({ ...p, anchorXY: postXY(p.at) })).sort((a, b) => (a.layer ?? 1) - (b.layer ?? 1));
  const targets = mode.kind === "end" ? endOptions(mode.type, mode.from) : [];
  const out = result?.outputs ?? {};
  const loadExample = ex => { const b = buildBoard(ex.steps); if (b) { setParts(b); setInputs({}); setSelected(null); setMode({ kind: "idle" }); sfx.tada(); } };
  const nameOf = type => PARTS[type].name;
  const lower = type => (type === "led" ? "LED" : nameOf(type).toLowerCase());
  const almostPlus = almost && Object.entries(pinPosts(next)).find(([pin]) => pin === "+");
  const hint = result?.short ? "⚠️ Short circuit! The battery's + and − are joined with almost nothing in between. A real battery would get hot. Find the shortcut and take it away."
    : notice ? notice
    : mode.kind === "place" ? (isTwoPin(mode.type) ? `Tap a post for one end of the ${lower(mode.type)}.` : `Tap a post to put the ${lower(mode.type)} there. You can turn it after.`)
    : mode.kind === "end" ? (mode.type === "wire" ? "Now tap a glowing post for the other end (up to 6 posts away)." : "Now tap a glowing post for the other end.")
    : mode.kind === "move" ? `Now tap where the first end of the ${lower(byUid(mode.uid)?.type ?? "wire")} should go.`
    : drag?.moved ? (drag.ok ? "Let go to snap it onto the green posts." : "Red means that spot is taken or off the board.")
    : almost ? `Almost! The ${lower(almost.type)} is the wrong way round: its + end should be at ${postName(almostPlus?.[1] ?? next.at)}. Tap ⇅ Flip.`
    : spare && !next ? `The ${lower(spare.type)} ${spare.type === "wire" ? "" : `${spare.id} `}isn't needed for this circuit. Remove it?`
    : trayDrag ? (trayDrag.part ? (trayDrag.ok ? "Let go to snap it onto the green posts." : "Red means that spot is taken.") : "Drag it onto the board.")
    : next ? `Next: ${describeGhost(next)}. Drag it onto the faint one.`
    : spare ? `The ${lower(spare.type)} ${spare.type === "wire" ? "" : `${spare.id} `}isn't in the plan. Remove it?`
    : locked ? (finished ? "Built and locked! Tap a switch to try it. Tap Unlock to change parts." : "Locked: parts stay put. Tap a switch to try it. Tap Unlock to change parts.")
    : sel ? `${nameOf(sel.type)}${sel.type === "wire" ? "" : ` ${sel.id}`}: drag it to move it, or use these buttons.`
    : parts.length ? "Tap a part to choose it. Double-tap a switch to flip it." : "Drag a part from the tray onto the board, or tap it and then tap the board.";
  useEffect(() => { if (autoRead && hint && !drag?.moved) speak(hint.replace(/[⚠️⇅✓]/g, "")); }, [hint, autoRead]); // eslint-disable-line react-hooks/exhaustive-deps
  const status = describe(parts, result).filter(l => / is /.test(l) || /^Short/.test(l)).join(" ");
  const reading = sel && result?.readings?.parts?.[sel.id];
  const dragged = drag?.moved ? byUid(drag.uid) : null;
  const landing = dragged ? Object.values(pinPosts({ ...dragged, at: drag.to })) : [];
  const hasExtras = sel && (["ldr", "probe", "resistor", "led"].includes(sel.type) || meter);

  // The chosen part's actions. They sit in Volt's hint card, above the board, not on top of the
  // circuit: nothing covers the parts the child is working on.
  let partActions = null;
  if (sel && !locked && mode.kind === "idle" && !drag?.moved) {
    partActions = (
      <>
        {sel.type === "slide" && <button className={`btn small sw${inputs[sel.id] === "on" ? " on" : ""}`} onClick={() => toggleInput(sel)} aria-label={`Switch ${sel.id} is ${inputs[sel.id] === "on" ? "ON" : "OFF"}. Tap to switch it ${inputs[sel.id] === "on" ? "OFF" : "ON"}`}>{inputs[sel.id] === "on" ? "ON" : "OFF"}</button>}
        {sel.type === "button" && (
          <button className={`btn small sw${inputs[sel.id] === "down" ? " on" : ""}`} aria-label="Press and hold"
            onPointerDown={e => { e.currentTarget.setPointerCapture?.(e.pointerId); playerRef.current?.unlock(); setInput(sel.id, "down"); buzz(10); }}
            onPointerUp={() => setInput(sel.id, "up")} onPointerCancel={() => setInput(sel.id, "up")} onContextMenu={e => e.preventDefault()}
            onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); setInput(sel.id, "down"); } }} onKeyUp={() => setInput(sel.id, "up")}>
            {inputs[sel.id] === "down" ? "Pressed!" : "Hold"}
          </button>
        )}
        {sel.type === "changeover" && <button className="btn small sw" onClick={() => toggleInput(sel)} aria-label="Flip the two-way switch">{inputs[sel.id] === "down" ? "▼" : "▲"}</button>}
        {sel.type === "touch" && <button className={`btn small sw${inputs[sel.id] === "yes" ? " on" : ""}`} onClick={() => toggleInput(sel)} aria-label={inputs[sel.id] === "yes" ? "Take your finger off" : "Put your finger on"}>{inputs[sel.id] === "yes" ? "🫳" : "✋"}</button>}
        {sel.type === "piezo" && <button className="btn small" onClick={() => { playerRef.current?.unlock(); liveRef.current?.clap(sel.id); sfx.bump(); buzz(15); }} aria-label="Clap">👏</button>}
        <button className="btn small" onClick={() => turn(sel.uid)} aria-label="Turn"><Icon name="turn" size={18} /><span className="lbl"> Turn</span></button>
        {HAS_DIRECTION.has(sel.type) && <button className={`btn small${almost?.uid === sel.uid ? " primary" : ""}`} onClick={() => flip(sel.uid)} aria-label="Flip end for end"><Icon name="flip" size={18} /><span className="lbl"> Flip</span></button>}
        <button className="btn small" onClick={() => setMode({ kind: "move", uid: sel.uid })} aria-label="Move"><Icon name="move" size={18} /><span className="lbl"> Move</span></button>
        <button className="btn small remove" onClick={() => remove(sel.uid)} aria-label="Remove"><Icon name="clear" size={18} /><span className="lbl"> Remove</span></button>
      </>
    );
  }

  const handPath = next && showMe ? Object.values(pinPosts(next)).map(postXY) : null;

  return (
    <div className={`lab${full ? " full" : ""}${locked ? " is-locked" : ""}`}>
      {/* One bar: the project's actions (Test, goal, start again) on the left, the board's tools on the right. */}
      <div className="lab-bar">
        {actions && <div className="lab-actions" ref={actionsRef}>{actions}</div>}
          <div className="lab-toolbar" role="toolbar" aria-label="Board tools">
          <button className="lab-ib lab-undo" onClick={() => { dispatch({ type: "undo" }); setSelected(null); sfx.click(); }} disabled={locked || !hist.past.length} aria-label="Undo" title="Undo"><Icon name="undo" /><span className="lbl">Undo</span></button>
          <button className="lab-ib xl-only" onClick={() => dispatch({ type: "redo" })} disabled={locked || !hist.future.length} aria-label="Redo" title="Redo"><Icon name="redo" /></button>
          <span className="lab-sep xl-only" aria-hidden="true" />
          <button className="lab-ib xl-only" onClick={() => setZoom(z => Math.max(0.6, +(z - 0.2).toFixed(1)))} aria-label="Zoom out" title="Zoom out"><Icon name="minus" /></button>
          <button className="lab-ib lab-zoom xl-only" onClick={() => setZoom(1)} aria-label="Fit the board" title="Fit the board">{Math.round(zoom * 100)}%</button>
          <button className="lab-ib xl-only" onClick={() => setZoom(z => Math.min(2.4, +(z + 0.2).toFixed(1)))} aria-label="Zoom in" title="Zoom in"><Icon name="plus" /></button>
          <span className="lab-sep" aria-hidden="true" />
          <button className="lab-ib toggle" onClick={() => setMuted(!muted)} aria-pressed={!muted} aria-label={muted ? "Sound is off. Turn sound on" : "Sound is on. Turn sound off"} title={muted ? "Sounds are off: clicks, dings and buzzers" : "Sounds are on: clicks, dings and buzzers"}><Icon name={muted ? "mute" : "sound"} /><span className="lbl xl-only">Sounds</span></button>
          <button className="lab-ib toggle" aria-pressed={autoRead} onClick={() => { const v = !autoRead; setAutoRead(v); local.set("sparklab.lab.readHints", v); if (!v) hush(); }} aria-label={autoRead ? "Hints are read aloud. Stop reading hints" : "Read hints aloud"} title={autoRead ? "Read to me is on: Volt reads each hint aloud" : "Read to me is off: Volt stays quiet"}><Icon name={autoRead ? "read" : "readOff"} /><span className="lbl xl-only">Read to me</span></button>
          {/* A project has its own "Start again"; free build clears the board here. */}
          {!actions && (
            <button className={`lab-ib${clearArmed ? " danger" : ""}`} disabled={locked || !parts.length} aria-label={clearArmed ? "Tap again to clear the board" : "Clear the board"} title="Clear the board"
              onClick={() => { if (clearArmed) { setParts([]); setInputs({}); setSelected(null); setClearArmed(false); } else { setClearArmed(true); setTimeout(() => setClearArmed(false), 3000); } }}>
              <Icon name="clear" />{clearArmed && <span className="lbl show">Sure?</span>}
            </button>
          )}
          <span className="lab-sep" aria-hidden="true" />
          <button className={`lab-ib${locked ? " on" : ""}`} aria-pressed={locked} onClick={toggleLock} aria-label={locked ? "The board is locked. Unlock it to change parts" : "Lock the board, so parts can't be moved by accident"} title={locked ? "Locked. Tap to unlock" : "Lock the board"}><Icon name={locked ? "lock" : "unlock"} /></button>
          <button className={`lab-ib${full ? " on" : ""}`} aria-pressed={full} onClick={() => { setFull(f => !f); sfx.click(); }} aria-label={full ? "Leave full screen" : "Full screen"} title={full ? "Leave full screen" : "Full screen"}><Icon name={full ? "collapse" : "expand"} /></button>
        </div>
      </div>

      <div className={`lab-hint${result?.short ? " bad" : ""}${almost || (spare && !next) ? " warn" : ""}`} role="status">
        <VoltFace size={38} lamp={false} mood={result?.short ? "wow" : finished ? "cheer" : "happy"} />
        <span className="txt">{partActions ? <><b>{nameOf(sel.type)}{sel.type === "wire" ? "" : ` ${sel.id}`}</b><span className="long">: drag it to move it, or use these buttons.</span></> : hint}</span>
        <span className="lab-hint-actions">
          {locked && <button className="btn small" onClick={toggleLock}><Icon name="unlock" size={18} /> Unlock</button>}
          {partActions}
          {mode.kind !== "idle" && <button className="btn small" onClick={() => cancel()}>✕ Cancel</button>}
          {mode.kind === "idle" && !partActions && almost && <button className="btn small primary" onClick={() => { setSelected(almost.uid); flip(almost.uid); }}>⇅ Flip it</button>}
          {mode.kind === "idle" && !partActions && !locked && !almost && spare && <button className="btn small" onClick={() => remove(spare.uid)}>🗑 Remove it</button>}
          {mode.kind === "idle" && !partActions && next && !almost && <button className="btn small" onClick={showNext}>👀 Show me</button>}
        </span>
      </div>
      <div ref={wrapRef} className="lab-board-wrap" tabIndex={0} role="application" aria-roledescription="circuit board"
        aria-label={`Circuit board, ${COLS} by ${ROWS} posts. Arrow keys move, Enter places or chooses, T switches, R turns, F flips, Delete removes. Cursor at ${postName(cursor)}.`}
        onKeyDown={onKeyDown}>
        <div className="lab-stage" style={{ width: `calc(min(100%, max(240px, var(--lab-fit, 58vh))) * ${zoom})` }}>
          <svg ref={svgRef} className={`lab-board${result?.short ? " short" : ""}${mode.kind !== "idle" ? " placing" : ""}`} viewBox={`0 0 ${W} ${H}`}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onMouseDown={e => e.preventDefault()}>
            <rect className="lab-bg" x={8} y={8} width={W - 16} height={H - 16} rx={22} />
            {Array.from({ length: COLS }, (_, c) => <text key={`c${c}`} className="lab-coord" x={MARGIN + c * PITCH} y={20} textAnchor="middle">{"ABCDEFG"[c]}</text>)}
            {Array.from({ length: ROWS }, (_, r) => <text key={`r${r}`} className="lab-coord" x={18} y={MARGIN + r * PITCH + 4} textAnchor="middle">{r + 1}</text>)}
            {Array.from({ length: COLS * ROWS }, (_, i) => { const at = [i % COLS, Math.floor(i / COLS)], [x, y] = postXY(at); return <circle key={i} className="lab-post" cx={x} cy={y} r={8} />; })}

            {next && <PartGlyph part={{ ...next, anchorXY: postXY(next.at) }} ghost showMe={showMe} showLabel={false} />}
            {next && Object.values(pinPosts(next)).map(at => <circle key={`g${key(at)}`} className="lab-ghost-pin" cx={postXY(at)[0]} cy={postXY(at)[1]} r={15} />)}

            {placed.map(p => (
              <PartGlyph key={p.uid} part={p} out={out[p.id]} input={inputs[p.id]} amps={result?.readings?.parts?.[p.id]?.amps ?? 0}
                chip={result?.chips?.[p.id]} selected={p.uid === selected} lifted={drag?.uid === p.uid} dragging={drag?.uid === p.uid && drag.moved}
                offset={drag?.uid === p.uid && drag.moved ? [drag.dx, drag.dy] : [0, 0]} flagged={spare?.uid === p.uid || almost?.uid === p.uid} />
            ))}

            {trayDrag?.part && <PartGlyph part={{ ...trayDrag.part, anchorXY: postXY(trayDrag.part.at) }} ghost showLabel={false} />}
            {trayDrag?.part && Object.values(pinPosts(trayDrag.part)).map(at => <circle key={`t${key(at)}`} className={`lab-landing ${trayDrag.ok ? "ok" : "bad"}`} cx={postXY(at)[0]} cy={postXY(at)[1]} r={17} />)}
            {located && parts.filter(p => p.type === located.type).map(p => { const [x0, y0, x1, y1] = partRect(p); return <rect key={`${p.uid}${located.n}`} className="lab-locate" x={x0 - 6} y={y0 - 6} width={x1 - x0 + 12} height={y1 - y0 + 12} rx={20} />; })}
            {landing.map(at => <circle key={`l${key(at)}`} className={`lab-landing ${drag.ok ? "ok" : "bad"}`} cx={postXY(at)[0]} cy={postXY(at)[1]} r={17} />)}
            {mode.kind === "end" && <circle className="lab-from" cx={postXY(mode.from)[0]} cy={postXY(mode.from)[1]} r={17} />}
            {targets.map(o => <circle key={key(o.to)} className="lab-target" cx={postXY(o.to)[0]} cy={postXY(o.to)[1]} r={16} />)}
            {cheer && (() => { const p = byUid(cheer.uid); if (!p) return null; const [x0, y0, x1] = partRect(p); return <text key={cheer.n} className="lab-cheer" x={(x0 + x1) / 2} y={y0 - 4} textAnchor="middle">✓</text>; })()}
            {handPath && (
              <text className="lab-hand" fontSize={34} textAnchor="middle">
                👆
                <animateMotion dur="1.4s" repeatCount="2" path={`M${handPath[0][0]} ${handPath[0][1] + 26} L${handPath.at(-1)[0]} ${handPath.at(-1)[1] + 26}`} />
              </text>
            )}
            <circle className="lab-cursor" cx={postXY(cursor)[0]} cy={postXY(cursor)[1]} r={22} />
          </svg>
        </div>
        {!parts.length && examples && (
          <div className="lab-empty">
            <p><b>Start building!</b> Pick a 🔋 battery from the tray, then tap two posts. Or try an example:</p>
            <div className="row center-row">{EXAMPLES.map(ex => <button key={ex.id} className="btn" onClick={() => loadExample(ex)}>{ex.emoji} {ex.title}</button>)}</div>
          </div>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{status}</p>

      <div className={`lab-tray${locked ? " locked" : ""}`} role="toolbar" aria-label={locked ? "Parts tray, locked" : "Parts tray"}>
        {(trayTypes ? [{ title: "Your parts", types: trayTypes }] : TRAY).map(g => (
          <div key={g.title} className="lab-tray-group">
            <span className="eyebrow">{g.title}{kit && g.types.every(t => t === "wire" || left(t) <= 0) && <b className="lab-tray-done"> · ✓ all placed</b>}</span>
            <div className="lab-tray-items">
              {g.types.map(type => {
                const n = left(type), active = mode.kind !== "idle" && mode.kind !== "move" && mode.type === type, isNext = next?.type === type && !active;
                const used = Boolean(kit) && n <= 0; // in a project, a part that is on the board stays in the tray, ticked
                return (
                  <button key={type} className={`lab-tray-item${active ? " on" : ""}${isNext ? " next" : ""}${used ? " used" : ""}`} aria-pressed={active} disabled={n <= 0 && !used} title={PARTS[type].say}
                    aria-label={used ? `${PARTS[type].name}, on the board. Press to show where it is` : undefined}
                    onClick={() => { if (used) locate(type); else if (!trayGesture.current?.dragged) pickType(type); }}
                    onPointerDown={e => onTrayDown(type, e)} onPointerMove={onTrayMove} onPointerUp={onTrayUp} onPointerCancel={onTrayUp}>
                    <span className="em" aria-hidden="true"><PartPic type={type} size={30} /></span>
                    <span className="nm">{PARTS[type].name}</span>
                    {type === "wire" ? <small>as many as you need</small> : <small>{used ? "✓ on the board" : n > 0 ? `${n} left` : "none left"}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {trayDrag && <div className="lab-tray-ghost" ref={el => { trayGhost.current = el; moveGhost(); }} aria-hidden="true"><PartPic type={trayDrag.type} size={40} /></div>}

      {hasExtras && (
        <div className="lab-inspector" aria-label={`${nameOf(sel.type)} ${sel.id} settings`}>
          <div className="lab-insp-head">
            <span className="em" aria-hidden="true">{PARTS[sel.type].emoji}</span>
            <div><b>{nameOf(sel.type)} {sel.type !== "wire" && sel.id}</b><p className="muted">{PARTS[sel.type].say}</p></div>
          </div>
          {sel.type === "ldr" && <div className="chips">{LDR_CHOICES.map(([v, l]) => <button key={v} className="chip" aria-pressed={(inputs[sel.id] ?? "bright") === v} onClick={() => setInput(sel.id, v)}>{l}</button>)}</div>}
          {sel.type === "probe" && <><span className="eyebrow">Put in the gap</span><div className="chips">{MATERIALS.map(([v, l]) => <button key={v} className="chip" aria-pressed={(inputs[sel.id] ?? "air") === v} onClick={() => setInput(sel.id, v)}>{l}</button>)}</div></>}
          {sel.type === "resistor" && !locked && <div className="chips">{[100, 1000, 10000].map(v => <button key={v} className="chip" aria-pressed={sel.ohms === v} onClick={() => update(sel.uid, { ohms: v })}>{v >= 1000 ? `${v / 1000} kΩ` : `${v} Ω`}</button>)}</div>}
          {sel.type === "led" && !locked && <div className="chips">{["red", "yellow", "green"].map(v => <button key={v} className="chip" aria-pressed={sel.colour === v} onClick={() => update(sel.uid, { colour: v })}>{{ red: "🔴", yellow: "🟡", green: "🟢" }[v]} {v}</button>)}</div>}
          {meter && reading && sel.type !== "battery" && <p className="lab-meter">🔬 Current: <b>{fmtA(Math.abs(reading.amps))}</b>{sel.type !== "wire" && <> · Voltage across: <b>{Math.abs(reading.volts).toFixed(2)} V</b></>}</p>}
          {meter && sel.type === "battery" && result && <p className="lab-meter">🔬 Battery current: <b>{fmtA(result.readings.batteryAmps)}</b></p>}
        </div>
      )}

      <details className="lab-describe">
        <summary>🗣 Describe my circuit</summary>
        <ul>{describe(parts, result).map((l, i) => <li key={i}>{l}</li>)}</ul>
        <button className="btn ghost small" aria-pressed={meter} onClick={() => setMeter(m => !m)}>🔬 {meter ? "Hide" : "Show"} the meter for the chosen part</button>
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

// Helpers for the Circuit Lab workspace around the board: what to zoom to, what the circuit is
// doing in plain words, and which parts a failed test points at. Pure functions, unit-tested.
import { COLS, ROWS, MARGIN, PITCH, coveredPosts } from "./board.js";
import { PARTS } from "../../content/lab/parts.js";

// The part of the board a circuit uses, plus `margin` posts around it (clamped to the board),
// at least `min` posts each way so a tiny circuit isn't blown up huge. null for an empty board.
// Returns post ranges and the SVG viewBox for them.
export function circuitBox(parts, { margin = 1, min = 4, cols = COLS, rows = ROWS } = {}) {
  const posts = parts.flatMap(coveredPosts);
  if (!posts.length) return null;
  let c0 = Math.min(...posts.map(p => p[0])) - margin, c1 = Math.max(...posts.map(p => p[0])) + margin;
  let r0 = Math.min(...posts.map(p => p[1])) - margin, r1 = Math.max(...posts.map(p => p[1])) + margin;
  const grow = (a, b, max) => { while (b - a + 1 < Math.min(min, max)) { if (a > 0) a--; if (b - a + 1 < Math.min(min, max) && b < max - 1) b++; if (a === 0 && b === max - 1) break; } return [a, b]; };
  [c0, c1] = grow(Math.max(0, c0), Math.min(cols - 1, c1), cols);
  [r0, r1] = grow(Math.max(0, r0), Math.min(rows - 1, r1), rows);
  const whole = c0 === 0 && r0 === 0 && c1 === cols - 1 && r1 === rows - 1;
  return { c0, r0, c1, r1, whole, viewBox: [c0 * PITCH, r0 * PITCH, (c1 - c0) * PITCH + MARGIN * 2, (r1 - r0) * PITCH + MARGIN * 2] };
}

// Inputs a child sets, with their resting state when nothing has been set yet.
const INPUT_DEFAULT = { slide: "off", button: "up", changeover: "up", touch: "no", ldr: "bright", probe: "air" };
const INPUT_WORDS = {
  slide: v => (v === "on" ? "ON" : "OFF"),
  button: v => (v === "down" ? "pressed" : "not pressed"),
  changeover: v => (v === "down" ? "down" : "up"),
  touch: v => (v === "yes" ? "finger on" : "no finger"),
  ldr: v => ({ bright: "bright light", dim: "dim light", dark: "dark", lamp: "lit by the bulb" }[v] ?? v),
  probe: v => (v === "air" ? "nothing in the clips" : `${v} in the clips`),
};
const LIGHT = { off: "off", dim: "glowing dimly", on: "glowing", flash: "flashing", damage: "damaged" };
const MOTOR = { off: "stopped", slow: "spinning slowly", spin: "spinning", reverse: "spinning backwards" };
function outputWords(type, v) {
  if (v == null) return null;
  if (type === "motor") return MOTOR[v] ?? v;
  if (type === "speaker" || type === "piezo") return v === "quiet" ? "quiet" : v === "soft" ? "playing softly" : "making a sound";
  return LIGHT[v] ?? v;
}
// Above this, the battery is really driving something (a few milliamps lights an LED dimly).
const FLOWING_AMPS = 0.0002;

// What the circuit is doing right now, for the strip under the board.
// loop: "empty" (nothing placed) | "nobattery" | "waiting" (not simulated yet) | "short" | "flowing" | "open"
// items: one per input and output part, e.g. { id: "S1", name: "Switch", text: "ON", kind: "input" }.
export function nowLine(parts, inputs = {}, result = null) {
  const things = parts.filter(p => p.type !== "wire");
  if (!things.length) return { loop: "empty", items: [] };
  const items = [];
  for (const p of things) {
    const name = PARTS[p.type]?.name ?? p.type;
    if (INPUT_WORDS[p.type]) items.push({ id: p.id, uid: p.uid, type: p.type, name, kind: "input", text: INPUT_WORDS[p.type](inputs[p.id] ?? INPUT_DEFAULT[p.type]) });
    else {
      const text = outputWords(p.type, result?.outputs?.[p.id]);
      if (text) items.push({ id: p.id, uid: p.uid, type: p.type, name, kind: "output", text, on: !["off", "stopped", "quiet"].includes(text) });
    }
  }
  const loop = !things.some(p => p.type === "battery") ? "nobattery"
    : !result ? "waiting"
    : result.short ? "short"
    : (result?.readings?.batteryAmps ?? 0) > FLOWING_AMPS ? "flowing" : "open";
  return { loop, items };
}

// The board parts a failed test points at, as uids: the parts that did the wrong thing
// (mapped from the project's labels to the child's), or the battery when there's a short.
export function problemParts(mark, boardParts) {
  if (!mark || mark.pass || mark.missing?.length) return [];
  const ids = new Set();
  for (const r of mark.results ?? []) {
    if (r.pass) continue;
    for (const m of r.mismatches) {
      if (m.id === "short") { for (const b of boardParts.filter(p => p.type === "battery")) ids.add(b.id); continue; }
      ids.add(mark.mapping?.[m.id] ?? m.id);
    }
    if (r.short) for (const b of boardParts.filter(p => p.type === "battery")) ids.add(b.id);
  }
  return boardParts.filter(p => p.type !== "wire" && ids.has(p.id)).map(p => p.uid);
}

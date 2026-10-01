// The Circuit Lab board: a grid of posts that parts snap onto. Pure logic (no React), so it's
// easy to test: part shapes, rotation, layers, labels, turning a board into an engine circuit,
// describing it in words, and saving it.
//
// A placed part: { uid, type, id, at: [col, row], dir: 0–3, len (connectors), ohms, colour, layer }
// `dir` turns the part clockwise in quarter turns: 0 → right, 1 → down, 2 → left, 3 → up.
import { PARTS, KIT } from "../../content/lab/parts.js";

export const COLS = 7, ROWS = 9;
export const PITCH = 60, MARGIN = 40;
export const postXY = ([c, r]) => [MARGIN + c * PITCH, MARGIN + r * PITCH];
export const postName = ([c, r]) => `${"ABCDEFGHIJ"[c]}${r + 1}`;
export const netOf = ([c, r]) => `${"ABCDEFGHIJ"[c]}${r + 1}`;
export const inBounds = ([c, r]) => c >= 0 && r >= 0 && c < COLS && r < ROWS;

// Pin positions in the part's own frame: x along its direction, y to its right.
const CHIP = { "+": [0, 0], trig: [2, 0], "−": [0, 2], out: [2, 2] };
export const SHAPES = {
  changeover: { com: [0, 0], up: [2, 0], down: [2, 1] },
  transistor: { c: [0, 0], b: [1, 1], e: [2, 0] },
  melody: CHIP, fx: CHIP,
  siren: { ...CHIP, m1: [1, 0], m2: [1, 2] },
};
export function localPins(part) {
  if (part.type === "wire") return { a: [0, 0], b: [part.len ?? 1, 0] };
  return SHAPES[part.type] ?? { [PARTS[part.type].pins[0]]: [0, 0], [PARTS[part.type].pins[1]]: [2, 0] };
}
const turn = ([x, y], dir) => [[x, y], [-y, x], [-x, -y], [y, -x]][((dir % 4) + 4) % 4];
// Board posts for each pin: { pinName: [col, row] }.
export function pinPosts(part) {
  return Object.fromEntries(Object.entries(localPins(part)).map(([pin, xy]) => { const [dx, dy] = turn(xy, part.dir ?? 0); return [pin, [part.at[0] + dx, part.at[1] + dy]]; }));
}
// Every post a part covers (its pins and the posts in between), for layering and hit tests.
export function coveredPosts(part) {
  const pins = Object.values(pinPosts(part));
  const xs = pins.map(p => p[0]), ys = pins.map(p => p[1]);
  const out = [];
  for (let c = Math.min(...xs); c <= Math.max(...xs); c++) for (let r = Math.min(...ys); r <= Math.max(...ys); r++) out.push([c, r]);
  return out; // a straight part's box is just the line between its ends
}
export const fits = part => Object.values(pinPosts(part)).every(inBounds);

const PREFIX = { battery: "B", slide: "S", button: "BTN", changeover: "SW", lamp: "L", led: "D", resistor: "R", ldr: "LDR", motor: "M", speaker: "SPK", piezo: "PZ", melody: "MEL", siren: "SIR", fx: "FX", touch: "T", probe: "P", transistor: "Q", wire: "W" };
export function nextId(parts, type) {
  const used = new Set(parts.map(p => p.id));
  for (let n = 1; ; n++) if (!used.has(`${PREFIX[type]}${n}`)) return `${PREFIX[type]}${n}`;
}
export const remaining = (parts, type) => (KIT[type] ?? 0) - parts.filter(p => p.type === type).length;

const key = ([c, r]) => `${c},${r}`;
// A new part sits one layer above anything it overlaps (like snapping onto a stack).
export function layerFor(parts, part) {
  const mine = new Set(coveredPosts(part).map(key));
  const below = parts.filter(p => p.uid !== part.uid && coveredPosts(p).some(q => mine.has(key(q))));
  return below.length ? Math.max(...below.map(p => p.layer ?? 1)) + 1 : 1;
}

let uidCounter = 0;
export const newUid = () => `u${Date.now().toString(36)}${(uidCounter++).toString(36)}`;

// Make a part ready to place: defaults for its values, first direction that fits the board.
export function makePart(parts, type, at, { dir, len, ohms, colour } = {}) {
  const part = { uid: newUid(), type, id: nextId(parts, type), at, dir: dir ?? 0 };
  if (type === "wire") part.len = len ?? 2;
  if (type === "resistor") part.ohms = ohms ?? 100;
  if (type === "led") part.colour = colour ?? "red";
  if (dir == null) for (let d = 0; d < 4 && !fits({ ...part, dir: d }); d++) part.dir = d + 1;
  part.dir %= 4;
  if (!fits(part)) return null;
  part.layer = layerFor(parts, part);
  return part;
}

// Where can a two-pin part's second end go, after its first end is at `from`?
// Connectors: 1–6 posts away in a straight line. Other parts: exactly 2 posts away.
export function endOptions(type, from) {
  const out = [];
  const dists = type === "wire" ? [1, 2, 3, 4, 5, 6] : [2];
  for (let dir = 0; dir < 4; dir++) for (const d of dists) {
    const [dx, dy] = turn([d, 0], dir), to = [from[0] + dx, from[1] + dy];
    if (inBounds(to)) out.push({ to, dir, len: d });
  }
  return out;
}
export const isTwoPin = type => type === "wire" || !SHAPES[type];

// The engine's view of the board: each post is a net, every part (connectors too) is an engine part.
export function toCircuit(parts) {
  return parts.map(p => {
    const posts = pinPosts(p);
    const e = { type: p.type, id: p.id, pins: Object.fromEntries(Object.entries(posts).map(([pin, at]) => [pin, netOf(at)])) };
    if (p.type === "resistor") e.ohms = p.ohms;
    if (p.type === "led") e.colour = p.colour;
    return e;
  });
}

// Groups of posts joined by connectors (what a child would call "joined").
export function joinedGroups(parts) {
  const parent = {};
  const find = k => (parent[k] === undefined || parent[k] === k ? (parent[k] = k) : (parent[k] = find(parent[k])));
  const union = (a, b) => { parent[find(a)] = find(b); };
  for (const p of parts) for (const at of Object.values(pinPosts(p))) find(key(at));
  for (const p of parts.filter(x => x.type === "wire")) { const { a, b } = pinPosts(p); union(key(a), key(b)); }
  const groups = {};
  for (const k of Object.keys(parent)) (groups[find(k)] ??= []).push(k);
  return Object.values(groups);
}

const PIN_WORDS = { "+": "+", "−": "−", trig: "trigger", out: "output", m1: "mode 1", m2: "mode 2", com: "middle", up: "top", down: "bottom", c: "collector", b: "base", e: "emitter" };
const STATE_WORDS = { on: "on", off: "off", dim: "dim", flash: "flashing", damage: "damaged: too much current!", spin: "spinning", slow: "spinning slowly", reverse: "spinning backwards", quiet: "quiet", soft: "playing softly", sound: "making a sound" };
const stateWords = v => (v == null ? null : String(v).startsWith("sound:") ? `playing the ${v.slice(6) === "mix" ? "sounds mixed together" : `${v.slice(6)} sound`}` : STATE_WORDS[v] ?? v);
const partName = p => `${PARTS[p.type].name.toLowerCase()} ${p.id}`;

// A plain-words description for screen readers and the "Describe my circuit" panel.
export function describe(parts, result) {
  const things = parts.filter(p => p.type !== "wire");
  if (!things.length) return ["The board is empty. Pick a part from the tray to start."];
  const lines = [];
  const where = {};
  for (const p of things) for (const [pin, at] of Object.entries(pinPosts(p))) (where[key(at)] ??= []).push(`${partName(p)} ${PARTS[p.type].pins.length > 2 || ["battery", "led", "motor"].includes(p.type) ? `(${PIN_WORDS[pin] ?? pin})` : ""}`.trim());
  const groups = joinedGroups(parts), joinedTo = {};
  for (const group of groups) {
    const names = [...new Set(group.flatMap(k => where[k] ?? []))];
    for (const k of group) joinedTo[k] = names.length;
    if (names.length >= 2) lines.push(`Joined: ${names.join(", ")}.`);
  }
  const loose = things.filter(p => Object.values(pinPosts(p)).some(at => (joinedTo[key(at)] ?? 0) < 2));
  for (const p of loose) lines.push(`${partName(p)[0].toUpperCase()}${partName(p).slice(1)} has an end that isn't joined to anything.`);
  if (result) {
    if (result.short) lines.push("Short circuit! The battery's + and − are joined with almost nothing in between.");
    for (const p of things) { const w = stateWords(result.outputs?.[p.id]); if (w) lines.push(`${partName(p)[0].toUpperCase()}${partName(p).slice(1)} is ${w}.`); }
  }
  return lines;
}

// Turn a part a quarter turn clockwise around its middle, so turning twice swaps its ends in
// place (how a child turns a real part). Parts whose middle isn't on a post turn around pin 1.
export function turned(part) {
  const pins = Object.values(pinPosts(part));
  const cx = pins.reduce((s, q) => s + q[0], 0) / pins.length, cy = pins.reduce((s, q) => s + q[1], 0) / pins.length;
  const dir = ((part.dir ?? 0) + 1) % 4;
  if (!Number.isInteger(cx) || !Number.isInteger(cy)) return { ...part, dir };
  const [dx, dy] = [part.at[0] - cx, part.at[1] - cy];
  return { ...part, dir, at: [cx - dy, cy + dx] };
}

// Flip a part end for end where it stands (two-pin parts and connectors): ⇅ Flip.
export function flipped(part) {
  const pins = Object.values(pinPosts(part));
  if (pins.length !== 2) return turned(turned(part));
  return { ...part, at: pins[1], dir: ((part.dir ?? 0) + 2) % 4 };
}
// Parts with a + end, where the direction matters: these get the ⇅ Flip button.
export const HAS_DIRECTION = new Set(["battery", "led", "motor"]);

// Would `part` sit on top of another part's body? Ends may share a post (that's how parts join),
// but two parts can't both cover the same post unless it's an end of both. Connectors may cross.
export function clashes(parts, part) {
  if (part.type === "wire") return false;
  const mine = coveredPosts(part).map(key), myPins = new Set(Object.values(pinPosts(part)).map(key));
  return parts.some(o => {
    if (o.uid === part.uid || o.type === "wire") return false;
    const theirPins = new Set(Object.values(pinPosts(o)).map(key));
    return coveredPosts(o).map(key).some(k => mine.includes(k) && !(myPins.has(k) && theirPins.has(k)));
  });
}

// Is part `p` where the guide part `g` should go? Same type and the same posts for each pin
// (two-pin parts that work either way round, and connectors, may face either way).
const EITHER_WAY = new Set(["wire", "lamp", "resistor", "slide", "button", "speaker", "ldr", "touch", "probe", "piezo"]);
export function samePlace(p, g) {
  if (p.type !== g.type) return false;
  const a = pinPosts(p), b = pinPosts(g);
  const same = Object.keys(b).every(pin => key(a[pin]) === key(b[pin]));
  if (same || !EITHER_WAY.has(g.type)) return same;
  const [x, y] = Object.values(a).map(key).sort(), [u, w] = Object.values(b).map(key).sort();
  return x === u && y === w;
}

// A part in the right posts but facing the wrong way round (e.g. a battery with + and − swapped).
export function reversedOf(parts, g) {
  const want = Object.values(pinPosts(g)).map(key).sort().join("|");
  return parts.find(p => p.type === g.type && !samePlace(p, g) && Object.values(pinPosts(p)).map(key).sort().join("|") === want) ?? null;
}
// Parts on the board that aren't part of the guided layout (and aren't just facing the wrong way).
export function strays(parts, guide) {
  return parts.filter(p => !guide.some(g => samePlace(p, g) || reversedOf([p], g)));
}

// Build a board from [type, at, options] steps (examples and tests). Returns null if a step doesn't fit.
export function buildBoard(steps) {
  const parts = [];
  for (const [type, at, opts] of steps) { const p = makePart(parts, type, at, opts); if (!p) return null; parts.push(p); }
  return parts;
}

// Saving: a small versioned object.
export const SAVE_VERSION = 1;
export const serialize = (parts, inputs) => ({ v: SAVE_VERSION, parts: parts.map(({ uid, type, id, at, dir, len, ohms, colour, layer }) => ({ uid, type, id, at, dir, len, ohms, colour, layer })), inputs });
export function deserialize(data) {
  if (!data || data.v !== SAVE_VERSION || !Array.isArray(data.parts)) return { parts: [], inputs: {} };
  const parts = data.parts.filter(p => PARTS[p.type] && Array.isArray(p.at) && fits(p));
  return { parts, inputs: data.inputs && typeof data.inputs === "object" ? data.inputs : {} };
}

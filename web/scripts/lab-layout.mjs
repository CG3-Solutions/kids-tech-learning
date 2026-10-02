// Works out a Guided-mode board layout for a Circuit Lab project from its reference circuit,
// proves it (fits the board, no parts overlapping, exactly the project's parts, every check passes),
// and prints it in the form layouts.js uses.
//
//   node scripts/lab-layout.mjs            → every project that has no layout yet
//   node scripts/lab-layout.mjs lab-5-2    → just that project
//
// How it places a circuit: the battery goes on the left; each other part is tried in every tidy
// position (even posts, four directions), preferring places where its ends land on posts it
// should join. What is left unjoined is then joined with connectors: straight, or round one
// corner on a free post. The best few partial boards are kept at each step (a beam search).
import { PROJECTS } from "../src/content/lab/projects.js";
import { LAYOUTS } from "../src/content/lab/layouts.js";
import { parseParts, parseCheck } from "../src/content/lab/netlist.js";
import { buildBoard, toCircuit, pinPosts, coveredPosts, clashes, fits, COLS, ROWS } from "../src/lib/circuit/board.js";
import { runChecks } from "../src/lib/circuit/engine.js";

const key = ([c, r]) => `${c},${r}`;
const BEAM = 500;
const BATTERY_SPOTS = [[[0, 2], 1], [[0, 4], 1], [[0, 6], 1]]; // + at A3, A5 or A7, − two rows below

// The net each pin belongs to. A pin the circuit leaves unconnected gets a net of its own, so nothing else may touch it.
const netsOf = part => Object.fromEntries(Object.entries(part.pins).map(([pin, net]) => [pin, net ?? `!${part.id}.${pin}`]));

function tryPlace(state, part, at, dir) {
  const p = { uid: part.id, type: part.type, id: part.id, at, dir, ...(part.ohms ? { ohms: part.ohms } : {}), ...(part.colour ? { colour: part.colour } : {}) };
  if (!fits(p) || clashes(state.parts, p)) return null;
  const nets = netsOf(part), posts = pinPosts(p), postNet = { ...state.postNet };
  let shared = 0;
  for (const [pin, post] of Object.entries(posts)) {
    const k = key(post), there = postNet[k];
    if (there !== undefined && there !== nets[pin]) return null; // would join two different nets
    if (there === nets[pin]) shared++;
    postNet[k] = nets[pin];
  }
  // Two pins of this part on one net are fine; a body lying over another part's end is not (clashes covers bodies).
  const covered = new Set(state.covered);
  for (const q of coveredPosts(p)) covered.add(key(q));
  return { parts: [...state.parts, p], postNet, covered, shared: state.shared + shared };
}

// Posts of each net that still need joining, and a rough cost: connectors needed, then how far apart.
function cost(state) {
  const byNet = {};
  for (const [k, net] of Object.entries(state.postNet)) (byNet[net] ??= []).push(k.split(",").map(Number));
  let wires = 0, dist = 0;
  for (const posts of Object.values(byNet)) {
    wires += posts.length - 1;
    for (let i = 1; i < posts.length; i++) dist += Math.min(...posts.slice(0, i).map(q => Math.abs(q[0] - posts[i][0]) + Math.abs(q[1] - posts[i][1]) + (q[0] !== posts[i][0] && q[1] !== posts[i][1] ? 3 : 0)));
  }
  const xs = state.parts.flatMap(p => coveredPosts(p).map(q => q[0])), ys = state.parts.flatMap(p => coveredPosts(p).map(q => q[1]));
  return wires * 20 + dist * 2 + Math.max(...xs) + Math.max(...ys);
}

// A connector from a to b: straight, 1 to 6 posts long.
const wireStep = (a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.abs(dx) + Math.abs(dy);
  if ((dx && dy) || len < 1 || len > 6) return null;
  return ["wire", a, { dir: dx > 0 ? 0 : dy > 0 ? 1 : dx < 0 ? 2 : 3, len }];
};

// Join every net's posts with connectors. Returns the connector steps, or null if a net can't be joined.
// To keep the board readable, a connector never lies over a part or over another connector's end,
// and a corner only goes on a post nothing else uses. Connectors may cross each other.
function route(state) {
  const byNet = {};
  for (const [k, net] of Object.entries(state.postNet)) (byNet[net] ??= []).push(k.split(",").map(Number));
  const ends = new Set([...Object.keys(state.postNet), ...state.covered]); // part ends, part bodies, and (as we go) connector ends
  const passed = new Set();                                               // posts a connector passes over
  const wires = [];
  const between = (a, b) => { const out = [], n = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]), d = [Math.sign(b[0] - a[0]), Math.sign(b[1] - a[1])]; for (let i = 1; i < n; i++) out.push([a[0] + d[0] * i, a[1] + d[1] * i]); return out; };
  const clear = (a, b) => wireStep(a, b) && between(a, b).every(q => !ends.has(key(q)));
  const freeCorner = q => q[0] >= 0 && q[1] >= 0 && q[0] < COLS && q[1] < ROWS && !ends.has(key(q)) && !passed.has(key(q));
  // The shortest way from any joined post to t using up to three connectors.
  const path = (joined, t) => {
    let best = null;
    const consider = (pts) => {
      for (let i = 1; i < pts.length; i++) if (!clear(pts[i - 1], pts[i])) return;
      const c = pts.slice(1).reduce((n, q, i) => n + Math.abs(q[0] - pts[i][0]) + Math.abs(q[1] - pts[i][1]), 0) + (pts.length - 2) * 4;
      if (!best || c < best.c) best = { c, pts };
    };
    for (const j of joined) {
      consider([j, t]);
      for (const c1 of [[j[0], t[1]], [t[0], j[1]]]) if (freeCorner(c1)) consider([j, c1, t]);
      if (best) continue;
      for (let c = 0; c < COLS; c++) { const a = [c, j[1]], b = [c, t[1]]; if (freeCorner(a) && freeCorner(b) && key(a) !== key(b)) consider([j, a, b, t]); }
      for (let r = 0; r < ROWS; r++) { const a = [j[0], r], b = [t[0], r]; if (freeCorner(a) && freeCorner(b) && key(a) !== key(b)) consider([j, a, b, t]); }
    }
    return best;
  };
  // Biggest nets first: they need the most room.
  for (const posts of Object.values(byNet).sort((a, b) => b.length - a.length)) {
    const joined = [posts[0]], todo = posts.slice(1);
    while (todo.length) {
      let best = null;
      for (const t of todo) { const p = path(joined, t); if (p && (!best || p.c < best.c)) best = { ...p, t }; }
      if (!best) return null;
      for (let i = 1; i < best.pts.length; i++) {
        wires.push(wireStep(best.pts[i - 1], best.pts[i]));
        for (const q of between(best.pts[i - 1], best.pts[i])) passed.add(key(q));
        ends.add(key(best.pts[i]));
      }
      joined.push(...best.pts.slice(1)); todo.splice(todo.indexOf(best.t), 1);
    }
  }
  return wires;
}

const optsOf = p => ({ dir: p.dir, ...(p.ohms ? { ohms: p.ohms } : {}), ...(p.colour ? { colour: p.colour } : {}) });

// Does this layout really work? The same proof the test suite runs, plus "no part lies on another".
function proves(project, steps) {
  const board = buildBoard(steps);
  if (!board) return false;
  for (let i = 0; i < board.length; i++) if (clashes(board.slice(0, i), board[i])) return false;
  const want = parseParts(project.circuit).map(p => `${p.type}:${p.id}:${p.ohms ?? ""}:${p.colour ?? ""}`).sort();
  const got = board.filter(p => p.type !== "wire").map(p => `${p.type}:${p.id}:${p.ohms ?? ""}:${p.colour ?? ""}`).sort();
  if (JSON.stringify(want) !== JSON.stringify(got)) return false;
  return runChecks(toCircuit(board), project.checks, parseCheck).every(r => r.mismatches.length === 0);
}

export function layoutFor(project) {
  const parts = parseParts(project.circuit);
  const battery = parts.find(p => p.type === "battery");
  // Place parts outwards from the battery's +, so each new part has something to join on to.
  const order = [], seen = new Set([battery.id]), reached = new Set(Object.values(netsOf(battery)));
  const frontier = [battery.pins["+"], battery.pins["−"]];
  while (order.length < parts.length - 1) {
    const net = frontier.shift();
    const next = net === undefined ? parts.find(p => !seen.has(p.id)) : null;
    for (const p of next ? [next] : parts.filter(q => !seen.has(q.id) && Object.values(q.pins).includes(net))) {
      seen.add(p.id); order.push(p);
      for (const n of Object.values(p.pins)) if (n && !reached.has(n)) { reached.add(n); frontier.push(n); }
    }
  }
  let best = null;
  for (const even of [true, false]) {
    let beam = BATTERY_SPOTS.map(([at, dir]) => tryPlace({ parts: [], postNet: {}, covered: new Set(), shared: 0 }, battery, at, dir)).filter(Boolean);
    for (const part of order) {
      const next = [];
      for (const state of beam) for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
        if (even && (c % 2 || r % 2)) continue; // tidy: parts start on every other post
        for (let dir = 0; dir < 4; dir++) { const s = tryPlace(state, part, [c, r], dir); if (s) next.push(s); }
      }
      beam = next.map(s => [cost(s), s]).sort((a, b) => a[0] - b[0]).slice(0, BEAM).map(x => x[1]);
      if (!beam.length) break;
    }
    for (const state of beam) {
      const wires = route(state);
      if (!wires) continue;
      // Parts in the order they were placed, but numbered parts of one kind in number order (S1 before S2).
      const placed = [...state.parts];
      const byType = {};
      for (const p of placed) (byType[p.type] ??= []).push(p);
      for (const list of Object.values(byType)) list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      const taken = {};
      const steps = placed.map(p => { const q = byType[p.type][(taken[p.type] = (taken[p.type] ?? 0) + 1) - 1]; return [q.type, q.at, optsOf(q)]; });
      const all = [...steps, ...wires];
      if (!proves(project, all)) continue;
      const score = wires.length * 10 + wires.reduce((n, w) => n + w[2].len, 0) + cost(state) / 100;
      if (!best || score < best.score) best = { score, steps: all };
    }
    if (best) break;
  }
  return best?.steps ?? null;
}

const fmt = steps => `[${steps.map(([t, at, o]) => (t === "wire" ? `W([${at}], ${o.dir}, ${o.len})` : `["${t}", [${at.join(", ")}], ${JSON.stringify(o).replace(/"(\w+)":/g, "$1: ").replace(/,/g, ", ").replace("{", "{ ").replace("}", " }")}]`)).join(", ")}]`;

if (process.argv[1]?.endsWith("lab-layout.mjs")) {
  const only = process.argv[2];
  let unit = 0, made = 0, failed = [];
  for (const p of PROJECTS) {
    if (only ? p.id !== only : LAYOUTS[p.id] || p.open || !p.circuit) continue;
    const steps = layoutFor(p);
    if (!steps) { failed.push(p.id); continue; }
    if (p.unit !== unit) { unit = p.unit; console.log(`\n  // ── Unit ${unit} ──`); }
    console.log(`  "${p.id}": ${fmt(steps)},`);
    made++;
  }
  console.error(`\n${made} layouts made${failed.length ? `; could not lay out: ${failed.join(", ")}` : ""}`);
}

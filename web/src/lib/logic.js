// Logic gates and the two workshop simulators (electric parts, and logic gates).

export const GATES = {
  AND: { inputs: 2, fn: (a, b) => a && b, says: "ON only when BOTH inputs are ON" },
  OR: { inputs: 2, fn: (a, b) => a || b, says: "ON when EITHER input is ON" },
  NOT: { inputs: 1, fn: a => !a, says: "the OPPOSITE of its input" },
  XOR: { inputs: 2, fn: (a, b) => a !== b, says: "ON when the inputs are DIFFERENT" },
  NAND: { inputs: 2, fn: (a, b) => !(a && b), says: "the opposite of AND" },
  NOR: { inputs: 2, fn: (a, b) => !(a || b), says: "the opposite of OR" },
};

// Every combination of n inputs, in counting order: [F,F], [F,T], [T,F], [T,T].
export const combos = n => Array.from({ length: 2 ** n }, (_, i) => Array.from({ length: n }, (_, k) => Boolean(i & (1 << (n - 1 - k)))));

// 4-bit ripple-carry adder: returns sum bits and the carry passed between adders (right to left).
export function addBits(a, b, width = 4) {
  let carry = false;
  const sum = [], carries = [];
  for (let i = 0; i < width; i++) {
    const x = Boolean(a & (1 << i)), y = Boolean(b & (1 << i));
    const s = (x !== y) !== carry;
    carry = (x && y) || (carry && (x !== y));
    sum.push(s); carries.push(carry);
  }
  return { sum, carries, carryOut: carry, value: a + b };
}

// ───────── Electric workshop ─────────
// Parts: battery (a = +, b = −), switch (conducts when on), bulb/motor/buzzer (loads), led (a → b only).
// Wires join terminals ("partId:a"). A load is ON when current can flow from a battery's + through it
// and back to that battery's −. Other batteries conduct from − to +, so batteries in a row add up.
export const LOADS = new Set(["bulb", "motor", "buzzer", "led"]);

function nodesOf(parts, wires) {
  const parent = {};
  const find = x => (parent[x] === undefined ? (parent[x] = x) : parent[x] === x ? x : (parent[x] = find(parent[x])));
  const union = (x, y) => { parent[find(x)] = find(y); };
  parts.forEach(p => { find(`${p.id}:a`); find(`${p.id}:b`); });
  wires.forEach(w => union(w.from, w.to));
  return find;
}

export function simulateElectric(parts, wires) {
  const node = nodesOf(parts, wires);
  const edges = []; // { from, to, part }
  for (const p of parts) {
    const a = node(`${p.id}:a`), b = node(`${p.id}:b`);
    if (p.type === "switch" && !p.on) continue;
    if (p.type === "battery") { edges.push({ from: b, to: a, part: p.id, battery: true }); continue; }
    if (p.type === "led") { if (p.flip) edges.push({ from: b, to: a, part: p.id }); else edges.push({ from: a, to: b, part: p.id }); continue; }
    edges.push({ from: a, to: b, part: p.id }, { from: b, to: a, part: p.id });
  }
  const reach = (start, skip, loadsAllowed = true, reverse = false) => {
    const seen = new Set([start]);
    const q = [start];
    while (q.length) {
      const n = q.shift();
      for (const e of edges) {
        if (e.part === skip) continue;
        const partType = parts.find(p => p.id === e.part)?.type;
        if (!loadsAllowed && LOADS.has(partType)) continue;
        const [x, y] = reverse ? [e.to, e.from] : [e.from, e.to];
        if (x === n && !seen.has(y)) { seen.add(y); q.push(y); }
      }
    }
    return seen;
  };

  const on = new Set();
  const live = new Set();
  let short = false;
  for (const bat of parts.filter(p => p.type === "battery")) {
    const plus = node(`${bat.id}:a`), minus = node(`${bat.id}:b`);
    if (reach(plus, bat.id, false).has(minus)) { short = true; continue; }
    const fromPlus = reach(plus, bat.id);
    const toMinus = reach(minus, bat.id, true, true);
    for (const n of fromPlus) if (toMinus.has(n)) live.add(n);
    for (const p of parts.filter(x => LOADS.has(x.type))) {
      const a = node(`${p.id}:a`), b = node(`${p.id}:b`);
      const fwd = reach(plus, p.id).has(a) && reach(minus, p.id, true, true).has(b);
      const back = reach(plus, p.id).has(b) && reach(minus, p.id, true, true).has(a);
      if (p.type === "led" ? (p.flip ? back : fwd) : fwd || back) on.add(p.id);
    }
  }
  if (short) on.clear();
  return { on, short, liveNode: t => !short && live.has(node(t)) };
}

// ───────── Logic workshop ─────────
// Parts: input (out), lamp (in1), gates (in1, in2, out; NOT has in1 only). Wires join an out to an in.
// Pass the previous `state` back in so circuits with loops (like a memory latch) keep what they remember.
export function simulateLogic(parts, wires, prev = {}) {
  const driver = {}; // "id:in1" → "id:out"
  for (const w of wires) {
    const [o, i] = w.from.endsWith(":out") ? [w.from, w.to] : [w.to, w.from];
    if (o.endsWith(":out") && !i.endsWith(":out")) driver[i] = o;
  }
  const val = { ...prev };
  const read = t => (driver[t] ? Boolean(val[driver[t]]) : false);
  // Settle in a fixed order, several passes, so loops such as a memory latch come to rest.
  for (let pass = 0; pass < 12; pass++) {
    for (const p of parts) {
      if (p.type === "input") val[`${p.id}:out`] = Boolean(p.on);
      else if (GATES[p.type]) val[`${p.id}:out`] = GATES[p.type].inputs === 1 ? GATES[p.type].fn(read(`${p.id}:in1`)) : GATES[p.type].fn(read(`${p.id}:in1`), read(`${p.id}:in2`));
    }
  }
  const lamps = new Set(parts.filter(p => p.type === "lamp" && read(`${p.id}:in1`)).map(p => p.id));
  return { value: t => (t.endsWith(":out") ? Boolean(val[t]) : read(t)), lamps, state: val };
}

// The Circuit Lab's simulation engine: a DC nodal solver plus the part models in
// content/lab/parts.js. Plain JavaScript, no React, so the tests, the board and the live
// simulation all use it.
//
// How it works
// - Every part becomes conductances and current sources between nets (Norton form), so the
//   circuit is one linear system G·V = I, with the battery's − net as ground (0 V).
// - LEDs, the transistor and the chips' outputs are piecewise models: we guess their states,
//   solve, check the guess and repeat until nothing changes.
// - Chips are behaviour models. A chip that is playing switches its output between HIGH and LOW. We solve both phases: something that
//   differs between them is flashing (lights) or making sound (speakers). The output is a
//   push-pull stage: HIGH joins it to the chip's + through 1 Ω, LOW (and idle) to its − through
//   1 Ω, so the current really comes through the chip's own supply.
import { parseParts } from "../../content/lab/netlist.js";

export const MODEL = {
  battery: { volts: 3, ohms: 0.5 },
  switchOhms: 0.001,
  lamp: { ohms: 10, dim: 0.06, on: 0.22 },          // amps
  motor: { ohms: 8, slow: 0.08, spin: 0.25 },
  speaker: { ohms: 8, soft: 0.003, sound: 0.04 },   // amps of signal through it
  led: { vf: { red: 1.8, yellow: 1.85, green: 2.0 }, ohms: 15, dim: 0.0003, on: 0.004, damage: 0.03 },
  ldr: { bright: 100, dim: 1000, dark: 1e6 },
  touch: 2e5,
  probe: { spoon: 0.1, coin: 0.1, foil: 0.1, key: 0.1, pencil: 2000, salt: 300, wetsoil: 1000, water: 5e4, finger: 2e5 },
  chip: { supplyOhms: 3000, minVolts: 2, trigOhms: 4.7e5, high: 1.5, outOhms: 1 },
  piezo: { ohms: 2e4, clapVolts: 2, sound: 1 },     // volts of signal across it
  transistor: { vbe: 0.7, beOhms: 50, beta: 100, vceSat: 0.2, satOhms: 1 },
  shortAmps: 1,
};
const GMIN = 1e-9;
const CHIPS = new Set(["melody", "siren", "fx"]);
export const isChip = type => CHIPS.has(type);

// ───────── Linear algebra ─────────
function gauss(A, b) {
  const n = b.length;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]]; [b[c], b[p]] = [b[p], b[c]];
    const d = A[c][c] || 1e-30;
    for (let r = c + 1; r < n; r++) {
      const f = A[r][c] / d;
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      b[r] -= f * b[c];
    }
  }
  const x = Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = s / (A[r][r] || 1e-30);
  }
  return x;
}

// ───────── Building a circuit ─────────
// parts: the notation text, or parsed parts. Returns the parts plus the net numbering.
export function compile(circuit) {
  const parts = typeof circuit === "string" ? parseParts(circuit) : circuit;
  const battery = parts.find(p => p.type === "battery");
  const ground = battery?.pins["−"] ?? null;
  const nets = [];
  for (const p of parts) for (const net of Object.values(p.pins)) if (net && net !== ground && !nets.includes(net)) nets.push(net);
  return { parts, battery, ground, nets, index: Object.fromEntries(nets.map((n, i) => [n, i])) };
}

const inputOf = (part, inputs) => inputs[part.id] ?? { slide: "off", button: "up", changeover: "up", ldr: "bright", touch: "no", probe: "air", piezo: "quiet" }[part.type];

// Solve the circuit once. `drive`: chip id → "high" | "low" (chips not listed are idle = low).
// Returns node voltages and a current for every two-terminal part (from its first pin to its second).
export function solve(c, inputs = {}, drive = {}) {
  const n = c.nets.length;
  const at = net => (net == null || net === c.ground ? -1 : c.index[net]);
  // Piecewise states, refined by iteration.
  const diodeOn = {}, beOn = {}, region = {};
  let V = Array(n).fill(0), info = {};
  const v = net => (at(net) < 0 ? 0 : V[at(net)]);

  for (let iter = 0; iter < 60; iter++) {
    const G = Array.from({ length: n }, () => Array(n).fill(0)), I = Array(n).fill(0);
    for (let i = 0; i < n; i++) G[i][i] += GMIN;
    const cond = (a, b, g) => { const i = at(a), j = at(b); if (i >= 0) G[i][i] += g; if (j >= 0) G[j][j] += g; if (i >= 0 && j >= 0) { G[i][j] -= g; G[j][i] -= g; } };
    const src = (a, b, amps) => { const i = at(a), j = at(b); if (i >= 0) I[i] += amps; if (j >= 0) I[j] -= amps; }; // amps pushed into a, out of b
    // A voltage `volts` (a above b) behind `ohms`, as a Norton source.
    const thevenin = (a, b, volts, ohms) => { cond(a, b, 1 / ohms); src(a, b, volts / ohms); };

    for (const p of c.parts) {
      const P = p.pins, val = inputOf(p, inputs);
      switch (p.type) {
        case "battery": thevenin(P["+"], P["−"], MODEL.battery.volts, MODEL.battery.ohms); break;
        case "wire": cond(P.a, P.b, 1 / MODEL.switchOhms); break;
        case "slide": if (val === "on") cond(P.a, P.b, 1 / MODEL.switchOhms); break;
        case "button": if (val === "down") cond(P.a, P.b, 1 / MODEL.switchOhms); break;
        case "changeover": cond(P.com, P[val === "down" ? "down" : "up"], 1 / MODEL.switchOhms); break;
        case "lamp": cond(P.a, P.b, 1 / MODEL.lamp.ohms); break;
        case "motor": cond(P["+"], P["−"], 1 / MODEL.motor.ohms); break;
        case "speaker": cond(P.a, P.b, 1 / MODEL.speaker.ohms); break;
        case "resistor": cond(P.a, P.b, 1 / p.ohms); break;
        case "ldr": cond(P.a, P.b, 1 / MODEL.ldr[val]); break;
        case "touch": if (val === "yes") cond(P.a, P.b, 1 / MODEL.touch); break;
        case "probe": if (MODEL.probe[val]) cond(P.a, P.b, 1 / MODEL.probe[val]); break;
        case "piezo": thevenin(P.a, P.b, val === "clap" ? MODEL.piezo.clapVolts : 0, MODEL.piezo.ohms); break;
        case "led": if (diodeOn[p.id]) thevenin(P["+"], P["−"], MODEL.led.vf[p.colour], MODEL.led.ohms); break;
        case "transistor": {
          const T = MODEL.transistor;
          if (beOn[p.id]) thevenin(P.b, P.e, T.vbe, T.beOhms);
          if (beOn[p.id] && region[p.id] === "sat") thevenin(P.c, P.e, T.vceSat, T.satOhms);
          if (beOn[p.id] && region[p.id] === "active") src(P.e, P.c, T.beta * Math.max(0, (v(P.b) - v(P.e) - T.vbe) / T.beOhms)); // collector current c → e
          break;
        }
        default:
          if (isChip(p.type)) {
            const C = MODEL.chip;
            cond(P["+"], P["−"], 1 / C.supplyOhms);
            if (P.trig) cond(P.trig, P["−"], 1 / C.trigOhms);
            for (const m of ["m1", "m2"]) if (P[m]) cond(P[m], P["−"], 1 / C.trigOhms);
            if (P.out) {
              cond(P.out, drive[p.id] === "high" ? P["+"] : P["−"], 1 / C.outOhms);
            }
          }
      }
    }
    V = gauss(G, I);

    // Check the guesses; repeat until they all hold.
    let changed = false;
    for (const p of c.parts) {
      const P = p.pins;
      if (p.type === "led") {
        const vak = v(P["+"]) - v(P["−"]), vf = MODEL.led.vf[p.colour];
        const on = diodeOn[p.id] ? vak - vf > -1e-9 : vak > vf;
        if (on !== Boolean(diodeOn[p.id])) { diodeOn[p.id] = on; changed = true; }
      } else if (p.type === "transistor") {
        const T = MODEL.transistor, vbe = v(P.b) - v(P.e), vce = v(P.c) - v(P.e);
        const on = beOn[p.id] ? vbe - T.vbe > -1e-9 : vbe > T.vbe;
        if (on !== Boolean(beOn[p.id])) { beOn[p.id] = on; region[p.id] = "sat"; changed = true; continue; }
        if (!on) continue;
        const ib = Math.max(0, (vbe - T.vbe) / T.beOhms), icSat = (vce - T.vceSat) / T.satOhms;
        const next = region[p.id] === "sat" ? (icSat > T.beta * ib + 1e-9 ? "active" : "sat") : (vce < T.vceSat ? "sat" : "active");
        if (next !== region[p.id]) { region[p.id] = next; changed = true; }
      }
    }
    if (!changed) break;
  }

  // Currents through two-terminal parts, from the first pin to the second.
  for (const p of c.parts) {
    const P = p.pins, val = inputOf(p, inputs);
    const across = (a, b) => v(a) - v(b);
    let amps = 0;
    switch (p.type) {
      case "battery": amps = (MODEL.battery.volts - across(P["+"], P["−"])) / MODEL.battery.ohms; break; // out of +
      case "wire": amps = across(P.a, P.b) / MODEL.switchOhms; break;
      case "slide": amps = val === "on" ? across(P.a, P.b) / MODEL.switchOhms : 0; break;
      case "button": amps = val === "down" ? across(P.a, P.b) / MODEL.switchOhms : 0; break;
      case "lamp": amps = across(P.a, P.b) / MODEL.lamp.ohms; break;
      case "motor": amps = across(P["+"], P["−"]) / MODEL.motor.ohms; break;
      case "speaker": amps = across(P.a, P.b) / MODEL.speaker.ohms; break;
      case "resistor": amps = across(P.a, P.b) / p.ohms; break;
      case "ldr": amps = across(P.a, P.b) / MODEL.ldr[val]; break;
      case "led": amps = diodeOn[p.id] ? (across(P["+"], P["−"]) - MODEL.led.vf[p.colour]) / MODEL.led.ohms : 0; break;
      case "transistor": amps = region[p.id] === "sat" && beOn[p.id] ? (across(P.c, P.e) - MODEL.transistor.vceSat) / MODEL.transistor.satOhms
        : beOn[p.id] ? MODEL.transistor.beta * Math.max(0, (across(P.b, P.e) - MODEL.transistor.vbe) / MODEL.transistor.beOhms) : 0; break;
      default: break;
    }
    info[p.id] = { amps, volts: p.pins.a !== undefined ? across(P.a, P.b) : P["+"] !== undefined ? across(P["+"], P["−"]) : 0 };
  }
  return { volts: Object.fromEntries(c.nets.map((net, i) => [net, V[i]]).concat(c.ground ? [[c.ground, 0]] : [])), parts: info };
}

// What each chip sees: is it powered, is its trigger HIGH, which mode pins are HIGH?
export function chipInputs(c, sol) {
  const v = net => (net == null ? 0 : sol.volts[net] ?? 0);
  const out = {};
  for (const p of c.parts.filter(x => isChip(x.type))) {
    const P = p.pins, rail = v(P["+"]) - v(P["−"]);
    const high = net => net != null && v(net) - v(P["−"]) > MODEL.chip.high;
    out[p.id] = { powered: rail > MODEL.chip.minVolts, trig: high(P.trig), m1: high(P.m1), m2: high(P.m2), rail };
  }
  return out;
}
export const SIREN_MODES = ["police", "fire", "ambulance", "robot"];
export const soundOf = (part, ins) => (part.type === "melody" ? "melody" : part.type === "fx" ? "space" : SIREN_MODES[(ins?.m1 ? 1 : 0) + (ins?.m2 ? 2 : 0)]);

// For checks and snapshots: a chip plays while it's powered and its trigger is HIGH
// (a clap is evaluated during the clap). The live simulation adds timing (live.js).
export function playingNow(c, inputs) {
  let playing = {};
  for (let round = 0; round < 3; round++) {
    const drive = Object.fromEntries(Object.keys(playing).map(id => [id, "high"]));
    const ins = chipInputs(c, solve(c, inputs, drive));
    const next = {};
    for (const [id, s] of Object.entries(ins)) if (s.powered && s.trig) next[id] = true;
    if (JSON.stringify(next) === JSON.stringify(playing)) break;
    playing = next;
  }
  return playing;
}

// A light sensor set to "lamp" sees only the circuit's own bulb (a beam or a reflection):
// it's bright while any bulb glows, dark otherwise.
export function resolveLight(c, inputs) {
  const lampLit = c.parts.filter(p => p.type === "ldr" && inputs[p.id] === "lamp");
  if (!lampLit.length) return inputs;
  let guess = { ...inputs, ...Object.fromEntries(lampLit.map(p => [p.id, "dark"])) };
  for (let round = 0; round < 3; round++) {
    const sol = solve(c, guess);
    const glowing = c.parts.some(p => p.type === "lamp" && Math.abs(sol.parts[p.id].amps) >= MODEL.lamp.dim);
    const next = { ...guess, ...Object.fromEntries(lampLit.map(p => [p.id, glowing ? "bright" : "dark"])) };
    if (JSON.stringify(next) === JSON.stringify(guess)) break;
    guess = next;
  }
  return guess;
}

const lightLevel = (amps, m) => (amps >= m.on ? "on" : amps >= m.dim ? "dim" : "off");

// Everything the lab shows for a circuit, given its inputs and which chips are playing.
// Returns { outputs: { id: value }, short, readings, chips }.
export function evaluate(circuit, given = {}, playing = null) {
  const c = circuit.parts ? circuit : compile(circuit);
  const inputs = resolveLight(c, given);
  const play = playing ?? playingNow(c, inputs);
  const ids = Object.keys(play).filter(id => play[id]);
  const lo = solve(c, inputs, {});
  const hi = ids.length ? solve(c, inputs, Object.fromEntries(ids.map(id => [id, "high"]))) : lo;
  const ins = chipInputs(c, hi);
  const outputs = {};
  for (const p of c.parts) {
    const a = lo.parts[p.id]?.amps ?? 0, b = hi.parts[p.id]?.amps ?? 0;
    if (p.type === "lamp") {
      const L = lightLevel(Math.abs(a), MODEL.lamp), H = lightLevel(Math.abs(b), MODEL.lamp);
      outputs[p.id] = L !== H && H !== "off" ? "flash" : L;
    } else if (p.type === "led") {
      const L = lightLevel(a, MODEL.led), H = lightLevel(b, MODEL.led);
      outputs[p.id] = Math.max(a, b) > MODEL.led.damage ? "damage" : L !== H && H !== "off" ? "flash" : L;
    } else if (p.type === "motor") {
      const m = MODEL.motor, s = Math.abs(a);
      outputs[p.id] = s < m.slow ? "off" : a < 0 ? "reverse" : s < m.spin ? "slow" : "spin";
    } else if (p.type === "speaker") {
      const amp = Math.abs(b - a), m = MODEL.speaker;
      if (amp < m.soft) outputs[p.id] = "quiet";
      else if (amp < m.sound) outputs[p.id] = "soft";
      else {
        // Which playing chips does it hear? Drive each one alone.
        const heard = ids.filter(id => Math.abs((solve(c, inputs, { [id]: "high" }).parts[p.id]?.amps ?? 0) - a) >= m.soft);
        const names = [...new Set(heard.map(id => soundOf(c.parts.find(x => x.id === id), ins[id])))];
        outputs[p.id] = names.length === 1 ? `sound:${names[0]}` : "sound:mix";
      }
    } else if (p.type === "piezo" && Object.values(p.pins).some(net => c.parts.some(x => isChip(x.type) && x.pins.out === net))) {
      const vA = hi.volts[p.pins.a] ?? 0, vB = hi.volts[p.pins.b] ?? 0, wA = lo.volts[p.pins.a] ?? 0, wB = lo.volts[p.pins.b] ?? 0;
      outputs[p.id] = Math.abs((vA - vB) - (wA - wB)) > MODEL.piezo.sound ? "sound" : "quiet";
    }
  }
  // The hardest-working battery (free build may have several): any one over the limit is a short circuit.
  const batteryAmps = Math.max(0, ...c.parts.filter(p => p.type === "battery").flatMap(b => [lo.parts[b.id]?.amps ?? 0, hi.parts[b.id]?.amps ?? 0]));
  const short = batteryAmps > MODEL.shortAmps;
  if (short) for (const id of Object.keys(outputs)) outputs[id] = { lamp: "off", led: "off", motor: "off", speaker: "quiet", piezo: "quiet" }[c.parts.find(x => x.id === id).type]; // the board switches off
  return {
    outputs, short,
    chips: Object.fromEntries(Object.entries(ins).map(([id, s]) => [id, { ...s, playing: Boolean(play[id]), sound: play[id] ? soundOf(c.parts.find(x => x.id === id), s) : null }])),
    readings: { volts: lo.volts, parts: lo.parts, batteryAmps },
  };
}

// Run a project's checks. Each result: { check, pass, mismatches: [{ id, expected, got }] }.
export function runChecks(circuit, checks, parse) {
  const c = compile(circuit);
  return checks.map(text => {
    const { when, expect } = parse(text);
    const r = evaluate(c, when);
    const mismatches = [];
    for (const [id, want] of Object.entries(expect)) {
      const got = id === "short" ? (r.short ? "yes" : "no") : r.outputs[id];
      const ok = got === want || (want === "sound" && String(got).startsWith("sound:"));
      if (!ok) mismatches.push({ id, expected: want, got });
    }
    return { check: text, pass: mismatches.length === 0, mismatches, result: r };
  });
}

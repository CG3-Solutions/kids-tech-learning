// Marking a child's build by what it does, not how it looks. The project's checks name its own
// parts (S1, L1…); the child's board has its own labels. We try every way of matching the
// child's parts to the project's parts of the same type, run the checks, and keep the best
// match. Any circuit that behaves right passes, whatever its layout.
import { parseParts, parseCheck } from "../../content/lab/netlist.js";
import { PARTS } from "../../content/lab/parts.js";
import { toCircuit } from "./board.js";
import { compile, evaluate } from "./engine.js";

const MAX_TRIES = 720;

export function markBuild(project, boardParts) {
  const checks = project.checks.map(parseCheck);
  const projectParts = project.circuit ? parseParts(project.circuit) : [];
  const referenced = new Set(checks.flatMap(c => [...Object.keys(c.when), ...Object.keys(c.expect)]).filter(k => k !== "short"));
  const need = projectParts.filter(p => referenced.has(p.id));
  const circuit = toCircuit(boardParts);

  // Parts the board is missing altogether.
  const missing = [];
  for (const type of new Set(need.map(p => p.type))) {
    const want = need.filter(p => p.type === type).length, have = circuit.filter(p => p.type === type).length;
    if (have < want) missing.push({ type, count: want - have });
  }
  if (!circuit.some(p => p.type === "battery")) missing.push({ type: "battery", count: 1 });
  if (missing.length) return { pass: false, missing, results: [], mapping: {} };

  // Try matchings (project id → board id), best first by how many checks pass.
  let best = null, tries = 0;
  const assign = (i, used, mapping) => {
    if (best?.pass || tries >= MAX_TRIES) return;
    if (i === need.length) { tries++; const r = runMapped(circuit, checks, mapping); if (!best || r.passed > best.passed) best = { ...r, mapping: { ...mapping } }; return; }
    for (const b of circuit.filter(p => p.type === need[i].type && !used.has(p.id))) {
      used.add(b.id); mapping[need[i].id] = b.id;
      assign(i + 1, used, mapping);
      used.delete(b.id); delete mapping[need[i].id];
    }
  };
  assign(0, new Set(), {});
  return { pass: Boolean(best?.pass), missing: [], results: best?.results ?? [], mapping: best?.mapping ?? {} };
}

// Run the checks with the board's parts renamed to the project's names.
function runMapped(circuit, checks, mapping) {
  const toProject = Object.fromEntries(Object.entries(mapping).map(([pid, bid]) => [bid, pid]));
  const taken = new Set(Object.keys(mapping));
  const renamed = circuit.map(p => ({ ...p, id: toProject[p.id] ?? (taken.has(p.id) ? `${p.id}~` : p.id) }));
  const c = compile(renamed);
  const results = checks.map(({ when, expect }) => {
    const r = evaluate(c, when);
    const mismatches = [];
    for (const [id, want] of Object.entries(expect)) {
      const got = id === "short" ? (r.short ? "yes" : "no") : r.outputs[id];
      if (!(got === want || (want === "sound" && String(got).startsWith("sound:")))) mismatches.push({ id, expected: want, got });
    }
    return { when, expect, pass: !mismatches.length, mismatches, short: r.short };
  });
  const passed = results.filter(r => r.pass).length;
  return { results, passed, pass: passed === checks.length };
}

// ───────── Plain words ─────────
const MATERIAL = { air: "nothing", spoon: "a spoon", coin: "a coin", foil: "foil", key: "a key", pencil: "a pencil line", salt: "salt water", water: "tap water", wetsoil: "wet soil", drysoil: "dry soil", finger: "a finger", paper: "paper", plastic: "plastic", rubber: "rubber", wood: "wood" };
const LIGHT = { bright: "in bright light", dim: "in dim light", dark: "in the dark", lamp: "lit by the bulb" };
export function inputWords(type, id, v) {
  switch (type) {
    case "slide": return `switch ${id} ${v === "on" ? "ON" : "OFF"}`;
    case "button": return v === "down" ? `button ${id} pressed` : `button ${id} not pressed`;
    case "changeover": return `two-way switch ${id} ${v}`;
    case "ldr": return `light sensor ${id} ${LIGHT[v] ?? v}`;
    case "touch": return v === "yes" ? `a finger on ${id}` : `no finger on ${id}`;
    case "probe": return `${MATERIAL[v] ?? v} in the test clips`;
    case "piezo": return v === "clap" ? "a clap" : "no clap";
    default: return `${id} ${v}`;
  }
}
const SOUND_WORDS = { melody: "the tune", police: "the police siren", fire: "the fire-engine siren", ambulance: "the ambulance siren", robot: "the robot alarm", space: "space sounds", mix: "the mixed sounds" };
export function stateWords(type, v) {
  const [s, sound] = String(v ?? "").split(":");
  if (type === "motor") return { off: "stopped", slow: "spinning slowly", spin: "spinning", reverse: "spinning backwards" }[s] ?? s;
  if (type === "speaker" || type === "piezo") return s === "quiet" ? "quiet" : s === "soft" ? "playing softly" : sound ? `playing ${SOUND_WORDS[sound] ?? sound}` : "making a sound";
  return { off: "off", dim: "glowing dimly", on: "on", flash: "flashing", damage: "damaged by too much current" }[s] ?? s;
}
const nameOf = type => (type === "led" ? "LED" : PARTS[type]?.name.toLowerCase() ?? type);

// Sentences about what went wrong, using the child's own labels. At most `limit` of them.
export function explainMark(project, mark, boardParts, limit = 2) {
  if (mark.pass) return [];
  if (mark.missing.length) return mark.missing.map(m => `You still need ${m.count > 1 ? `${m.count} more` : "a"} ${nameOf(m.type)}${m.count > 1 ? "s" : ""}.`);
  const projectParts = parseParts(project.circuit);
  const typeOf = pid => projectParts.find(p => p.id === pid)?.type;
  const label = pid => mark.mapping[pid] ?? pid;
  const lines = [];
  for (const r of mark.results.filter(x => !x.pass)) {
    const when = Object.entries(r.when).map(([pid, v]) => inputWords(typeOf(pid), label(pid), v)).join(" and ");
    for (const m of r.mismatches) {
      if (lines.length >= limit) break;
      const lead = when ? `With ${when}, ` : "";
      if (m.id === "short") { lines.push(m.got === "yes" ? `${lead}there's a short circuit: + and − are joined with almost nothing in between.` : `${lead}there should be a short circuit here.`); continue; }
      const type = typeOf(m.id), what = `${nameOf(type)} ${label(m.id)}`;
      lines.push(`${lead}${what} should be ${stateWords(type, m.expected)}, but it's ${stateWords(type, m.got)}.`);
    }
    if (lines.length >= limit) break;
  }
  return lines;
}

// A tip for the most likely mistake.
export function hintFor(mark) {
  if (mark.missing.length) return "Pick the missing parts from the tray.";
  const got = mark.results.flatMap(r => r.mismatches.map(m => m.got));
  if (mark.results.some(r => r.short && !r.expect.short)) return "Look for a connector or switch that joins + straight to − without going through a part.";
  if (got.includes("damage")) return "An LED needs a resistor in its loop to protect it.";
  if (got.includes("reverse")) return "The motor is the wrong way round: swap its ends (turn it twice).";
  return "Follow the loop with your finger: from the battery's +, through each part, back to −. Is there a gap? Do LEDs point from + to −?";
}

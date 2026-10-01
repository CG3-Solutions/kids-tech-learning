// The Circuit Lab's circuit notation: short, readable text that the tests, the docs and the
// simulation engine all read the same way.
//
// Parts: one part per line (or separated by "|"):  type ID net net … [value]
//   battery B1 p n          the battery's + is on net "p", its − on net "n"
//   resistor R1 a b 1000    a 1 kΩ resistor between nets a and b
//   led D1 b n green        a green LED, + on b, − on n
//   siren U1 p n a b - -    "-" leaves an optional pin unconnected
// Pins follow the order in parts.js. Net names are free; the same name means "joined by wire".
//
// Checks: "inputs -> outputs", each a list of ID=value:
//   "S1=on BTN1=down -> L1=dim M1=slow"
//   "S1=on -> short=yes"            the whole board: was there a short circuit?
//   "-> SPK1=sound:police"          no inputs to set; a speaker may name its sound
import { PARTS } from "./parts.js";

export function parseParts(text) {
  return String(text).split(/\n|\|/).map(l => l.trim()).filter(Boolean).map(line => {
    const [type, id, ...rest] = line.split(/\s+/);
    const def = PARTS[type];
    if (!def) throw new Error(`Unknown part type "${type}" in "${line}"`);
    const nets = rest.slice(0, def.pins.length);
    if (nets.length < def.pins.length) throw new Error(`${id}: needs ${def.pins.length} pins (${def.pins.join(", ")}) in "${line}"`);
    const extra = rest.slice(def.pins.length);
    const pins = Object.fromEntries(def.pins.map((p, i) => [p, nets[i] === "-" ? null : nets[i]]));
    const part = { type, id, pins };
    if (type === "resistor") part.ohms = Number(extra[0] ?? 100);
    else if (type === "led") part.colour = extra[0] ?? "red";
    else if (extra.length) throw new Error(`${id}: unexpected "${extra.join(" ")}"`);
    return part;
  });
}

const pairs = s => String(s).trim().split(/\s+/).filter(Boolean).map(kv => {
  const i = kv.indexOf("=");
  if (i < 1) throw new Error(`Expected ID=value, got "${kv}"`);
  return [kv.slice(0, i), kv.slice(i + 1)];
});
export function parseCheck(text) {
  const [when, expect] = String(text).split("->");
  if (expect == null) throw new Error(`A check needs "->": "${text}"`);
  return { when: Object.fromEntries(pairs(when)), expect: Object.fromEntries(pairs(expect)) };
}

// Every net and the pins on it: { netName: [{ id, pin, type }] }.
export function netsOf(parts) {
  const nets = {};
  for (const p of parts) for (const [pin, net] of Object.entries(p.pins)) if (net) (nets[net] ??= []).push({ id: p.id, pin, type: p.type });
  return nets;
}

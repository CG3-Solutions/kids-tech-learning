import { describe, it, expect } from "vitest";
import { PROJECTS, UNITS, LEVELS } from "./projects.js";
import { PARTS, KIT, CONCEPTS, SOUNDS, inputsOf, outputsOf } from "./parts.js";
import { parseParts, parseCheck, netsOf } from "./netlist.js";

// ── A wiring tracer (not the simulator): which nets join under a check's settings? ──
// Conducting parts join their pins; an LED only conducts from + to −. Chips and transistors don't join nets.
const DEFAULT_IN = { slide: "off", button: "up", changeover: "up", ldr: "bright", touch: "no", probe: "air", piezo: "quiet" };
const OPEN_MATERIALS = new Set(["air", "drysoil", "paper", "plastic", "rubber", "wood"]);
function edges(parts, inputs, skip) {
  const e = [];
  for (const p of parts) {
    if (p.id === skip) continue;
    const v = inputs[p.id] ?? DEFAULT_IN[p.type];
    const two = () => e.push([p.pins.a, p.pins.b, true]);
    if (p.type === "slide" && v === "on") two();
    else if (p.type === "button" && v === "down") two();
    else if (p.type === "changeover") e.push([p.pins.com, p.pins[v], true]);
    else if (["lamp", "resistor", "speaker"].includes(p.type)) two();
    else if (p.type === "ldr" && v !== "dark") two();
    else if (p.type === "touch" && v === "yes") two();
    else if (p.type === "probe" && !OPEN_MATERIALS.has(v)) two();
    else if (p.type === "motor") e.push([p.pins["+"], p.pins["−"], true]);
    else if (p.type === "led") e.push([p.pins["+"], p.pins["−"], false]); // one way only
  }
  return e.filter(([a, b]) => a && b);
}
// Nets reachable from `start`, following one-way LEDs forwards (or backwards when `back`).
function reach(parts, inputs, start, skip, back = false) {
  const seen = new Set([start]), todo = [start], es = edges(parts, inputs, skip);
  while (todo.length) {
    const n = todo.pop();
    for (const [a, b, both] of es) {
      const from = back ? b : a, to = back ? a : b;
      if (from === n && !seen.has(to)) { seen.add(to); todo.push(to); }
      if (both && to === n && !seen.has(from)) { seen.add(from); todo.push(from); }
    }
  }
  return seen;
}

const ALL = PROJECTS.map(p => ({ ...p, parts: p.circuit ? parseParts(p.circuit) : [], checksParsed: p.checks.map(parseCheck) }));

describe("Circuit Lab: the 100 projects", () => {
  it("has 100 projects in 11 units, with unique ids, in order", () => {
    expect(PROJECTS).toHaveLength(100);
    expect(new Set(PROJECTS.map(p => p.id)).size).toBe(100);
    const per = UNITS.map(u => PROJECTS.filter(p => p.unit === u.n).length);
    expect(per).toEqual([8, 8, 8, 10, 8, 12, 12, 8, 10, 8, 8]);
    PROJECTS.forEach((p, i) => { if (i) expect(p.unit).toBeGreaterThanOrEqual(PROJECTS[i - 1].unit); });
    for (const u of UNITS) PROJECTS.filter(p => p.unit === u.n).forEach((p, i) => expect(p.id).toBe(`lab-${u.n}-${i + 1}`));
  });

  it("every project has its teaching text, a valid prediction and known concepts", () => {
    for (const p of PROJECTS) {
      const where = p.id;
      for (const k of ["title", "emoji", "q", "goal", "explain", "world", "tryThis"]) expect(p[k], `${where} ${k}`).toBeTruthy();
      expect(LEVELS, where).toContain(p.level);
      expect(p.predict.options.length, where).toBeGreaterThanOrEqual(2);
      expect(p.predict.answer, where).toBeLessThan(p.predict.options.length);
      expect(p.predict.why.length, where).toBeGreaterThan(15);
      expect(p.concepts.length, where).toBeGreaterThan(0);
      for (const c of p.concepts) expect(Object.keys(CONCEPTS), `${where} concept ${c}`).toContain(c);
      if (p.unit === 11) expect(p.brief, where).toBeTruthy();
    }
  });

  it("every circuit uses known parts, the right pins and no more than the kit holds", () => {
    for (const p of ALL) {
      if (p.open) { expect(p.circuit).toBeUndefined(); continue; }
      expect(p.parts.filter(x => x.type === "battery"), p.id).toHaveLength(1);
      expect(new Set(p.parts.map(x => x.id)).size, `${p.id} part ids`).toBe(p.parts.length);
      const count = {};
      for (const x of p.parts) count[x.type] = (count[x.type] ?? 0) + 1;
      for (const [type, n] of Object.entries(count)) expect(n, `${p.id}: ${n} × ${type}`).toBeLessThanOrEqual(KIT[type]);
      for (const x of p.parts) {
        const optional = PARTS[x.type].optional ?? [];
        for (const [pin, net] of Object.entries(x.pins)) if (!optional.includes(pin)) expect(net, `${p.id} ${x.id}.${pin} unconnected`).toBeTruthy();
        if (x.type === "resistor") expect(PARTS.resistor.values, `${p.id} ${x.id}`).toContain(x.ohms);
        if (x.type === "led") expect(PARTS.led.colours, `${p.id} ${x.id}`).toContain(x.colour);
      }
      // No dangling wires: every net joins at least two pins (decoy parts may end nowhere).
      for (const [net, pins] of Object.entries(netsOf(p.parts))) {
        const real = pins.filter(q => !(p.decoys ?? []).includes(q.id));
        if (real.length) expect(pins.length, `${p.id}: net "${net}" goes nowhere`).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("every check sets real inputs and expects real outputs, and every input is tried", () => {
    for (const p of ALL) {
      if (p.open) { expect(p.checks).toHaveLength(0); continue; }
      expect(p.checks.length, p.id).toBeGreaterThan(0);
      const byId = Object.fromEntries(p.parts.map(x => [x.id, x]));
      const tried = new Set();
      for (const c of p.checksParsed) {
        for (const [id, v] of Object.entries(c.when)) {
          expect(byId[id], `${p.id}: no part ${id}`).toBeTruthy();
          expect(inputsOf(byId[id].type), `${p.id}: ${id}=${v}`).toContain(v);
          tried.add(id);
        }
        for (const [id, v] of Object.entries(c.expect)) {
          if (id === "short") { expect(["yes", "no"]).toContain(v); continue; }
          expect(byId[id], `${p.id}: no part ${id}`).toBeTruthy();
          const [state, sound] = v.split(":");
          expect(outputsOf(byId[id].type), `${p.id}: ${id}=${v}`).toContain(state);
          if (sound) expect(SOUNDS, `${p.id}: ${v}`).toContain(sound);
        }
      }
      // A buzzer disc is an input only when wired to a chip's trigger (otherwise it's a small speaker).
      const trigs = new Set(p.parts.filter(x => x.pins.trig).map(x => x.pins.trig));
      const inputs = p.parts.filter(x => inputsOf(x.type).length && !(p.decoys ?? []).includes(x.id) && (x.type !== "piezo" || trigs.has(x.pins.a)));
      for (const x of inputs) expect(tried.has(x.id), `${p.id}: input ${x.id} never tried`).toBe(true);
    }
  });

  it("every part that should work has a path for the electricity (wiring trace)", () => {
    for (const p of ALL) {
      if (p.open || p.parts.some(x => x.type === "transistor")) continue; // transistor circuits wait for the simulator
      const bat = p.parts.find(x => x.type === "battery"), plus = bat.pins["+"], minus = bat.pins["−"];
      const chips = p.parts.filter(x => ["melody", "siren", "fx"].includes(x.type));
      for (const c of p.checksParsed) {
        const short = c.expect.short === "yes";
        for (const [id, v] of Object.entries(c.expect)) {
          if (id === "short" || short) continue;
          const part = p.parts.find(x => x.id === id), state = v.split(":")[0];
          const where = `${p.id} [${p.checks[p.checksParsed.indexOf(c)]}] ${id}=${v}`;
          const ends = part.pins["+"] !== undefined ? [part.pins["+"], part.pins["−"]] : [part.pins.a, part.pins.b];
          if (["on", "dim", "spin", "slow", "damage"].includes(state)) {
            // Battery + reaches the part's first pin and its second pin reaches −, without going through the part.
            const fromPlus = reach(p.parts, c.when, plus, id), toMinus = reach(p.parts, c.when, minus, id, true);
            const polar = part.pins["+"] !== undefined; // bulbs, resistors and speakers work either way round
            const ok = (fromPlus.has(ends[0]) && toMinus.has(ends[1])) || (!polar && fromPlus.has(ends[1]) && toMinus.has(ends[0]));
            expect(ok, `${where}: no loop through it`).toBe(true);
          } else if (state === "reverse") {
            const fromPlus = reach(p.parts, c.when, plus, id), toMinus = reach(p.parts, c.when, minus, id, true);
            expect(fromPlus.has(ends[1]) && toMinus.has(ends[0]), `${where}: not reversed`).toBe(true);
          } else if (["sound", "soft", "flash"].includes(state)) {
            // Driven by a powered chip whose output reaches this part, and the part reaches −.
            const driver = chips.find(ch => {
              const powered = reach(p.parts, c.when, plus).has(ch.pins["+"]) && ch.pins["−"] === minus;
              const outReaches = reach(p.parts, c.when, ch.pins.out, id).has(ends[0]) || ch.pins.out === ends[0];
              const trigHigh = reach(p.parts, c.when, plus).has(ch.pins.trig) || (ch.pins.trig && p.parts.some(z => z.type === "piezo" && z.pins.a === ch.pins.trig && c.when[z.id] === "clap"));
              return powered && outReaches && trigHigh;
            });
            expect(driver, `${where}: no powered, triggered chip drives it`).toBeTruthy();
            expect(reach(p.parts, c.when, minus, id, true).has(ends[1]) || ends[1] === minus, `${where}: doesn't return to −`).toBe(true);
          }
        }
      }
    }
  });

  it("a NOT trigger (pull-up resistor + sensor to −) only rings when the sensor lets go", () => {
    for (const p of ALL.filter(x => !x.open)) {
      for (const ch of p.parts.filter(x => ["melody", "siren", "fx"].includes(x.type))) {
        const pull = p.parts.find(x => x.type === "resistor" && x.ohms === 10000 && Object.values(x.pins).includes(ch.pins.trig));
        if (!pull) continue;
        const minus = p.parts.find(x => x.type === "battery").pins["−"];
        for (const c of p.checksParsed) {
          const quiet = Object.entries(c.expect).some(([id, v]) => v === "quiet" && p.parts.find(x => x.id === id)?.type === "speaker");
          const pulledDown = reach(p.parts, c.when, ch.pins.trig, pull.id).has(minus);
          const plus = p.parts.find(x => x.type === "battery").pins["+"];
          const powered = reach(p.parts, c.when, plus).has(ch.pins["+"]);
          // Quiet is right if the sensor pulls the trigger down, or if nothing feeds the pull-up (a switch before it is open).
          const pullEnd = Object.values(pull.pins).find(net => net !== ch.pins.trig);
          const fed = reach(p.parts, c.when, plus).has(pullEnd);
          if (quiet && powered && fed) expect(pulledDown, `${p.id} [${p.checks[p.checksParsed.indexOf(c)]}]: quiet, but nothing pulls the trigger down`).toBe(true);
          if (!quiet && Object.values(c.expect).some(v => v.startsWith("sound"))) expect(pulledDown, `${p.id}: rings although the trigger is pulled down`).toBe(false);
        }
      }
    }
  });

  it("covers every concept in the study map, with something for every level", () => {
    const used = new Set(PROJECTS.flatMap(p => p.concepts));
    for (const c of Object.keys(CONCEPTS)) expect(used.has(c), `concept ${c} unused`).toBe(true);
    for (const lv of LEVELS) expect(PROJECTS.some(p => p.level === lv), lv).toBe(true);
    expect(PROJECTS.filter(p => p.safety).length).toBeGreaterThanOrEqual(3);
  });
});

describe("Circuit Lab: the circuit notation", () => {
  it("reads parts, values and optional pins", () => {
    const [b, r, d, s] = parseParts("battery B1 p n | resistor R1 a b 1000 | led D1 b n green | siren U1 p n t o - p");
    expect(b.pins).toEqual({ "+": "p", "−": "n" });
    expect(r.ohms).toBe(1000);
    expect(d.colour).toBe("green");
    expect(s.pins).toEqual({ "+": "p", "−": "n", trig: "t", out: "o", m1: null, m2: "p" });
  });
  it("reads checks and rejects mistakes", () => {
    expect(parseCheck("S1=on BTN1=down -> L1=dim M1=slow")).toEqual({ when: { S1: "on", BTN1: "down" }, expect: { L1: "dim", M1: "slow" } });
    expect(parseCheck("-> SPK1=sound:police").when).toEqual({});
    expect(() => parseParts("lamp L1 a")).toThrow();
    expect(() => parseParts("widget W1 a b")).toThrow();
    expect(() => parseCheck("S1=on L1=on")).toThrow();
  });
});

describe("Circuit Lab: the project document", () => {
  it("docs/12-circuit-lab-projects.md is up to date (run `npm run docs:lab`)", async () => {
    const { readFileSync } = await import("node:fs");
    const { projectsMarkdown } = await import("./docs.js");
    const file = readFileSync(`${process.cwd()}/../docs/12-circuit-lab-projects.md`, "utf8") // tests run from web/;
    expect(file).toBe(projectsMarkdown());
  });
});

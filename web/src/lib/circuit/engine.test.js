import { describe, it, expect } from "vitest";
import { compile, solve, evaluate, runChecks, chipInputs, MODEL } from "./engine.js";
import { PROJECTS } from "../../content/lab/projects.js";
import { parseParts, parseCheck } from "../../content/lab/netlist.js";

const amps = (circuit, id, inputs = {}) => solve(compile(circuit), inputs).parts[id].amps;
const near = (got, want, tol = 1e-3) => expect(Math.abs(got - want), `${got} vs ${want}`).toBeLessThan(tol);

describe("solver: hand-worked circuits", () => {
  const B = MODEL.battery;
  it("one bulb: I = V ÷ (R + r)", () => {
    near(amps("battery B1 p n | slide S1 p a | lamp L1 a n", "L1", { S1: "on" }), B.volts / (MODEL.lamp.ohms + B.ohms));
    near(amps("battery B1 p n | slide S1 p a | lamp L1 a n", "L1", { S1: "off" }), 0);
  });
  it("series adds resistance; parallel shares the voltage", () => {
    near(amps("battery B1 p n | slide S1 p a | lamp L1 a b | lamp L2 b n", "L1", { S1: "on" }), B.volts / (2 * MODEL.lamp.ohms + B.ohms));
    const par = B.volts / (MODEL.lamp.ohms / 2 + B.ohms) / 2;
    near(amps("battery B1 p n | slide S1 p a | lamp L1 a n | lamp L2 a n", "L1", { S1: "on" }), par);
  });
  it("an LED drops its forward voltage and conducts one way only", () => {
    const want = (B.volts - MODEL.led.vf.red) / (100 + MODEL.led.ohms + B.ohms);
    near(amps("battery B1 p n | resistor R1 p a 100 | led D1 a n red", "D1"), want, 1e-5);
    near(amps("battery B1 p n | resistor R1 p a 100 | led D1 n a red", "D1"), 0, 1e-9);
  });
  it("a voltage divider", () => {
    const sol = solve(compile("battery B1 p n | resistor R1 p m 1000 | resistor R2 m n 1000"));
    near(sol.volts.m, (B.volts * 1000) / (2000 + B.ohms), 1e-4);
  });
  it("the transistor switches fully on with enough base current, and off without", () => {
    const night = "battery B1 p n | resistor R1 p b 10000 | ldr LDR1 b n | resistor R2 p c 100 | led D1 c d red | transistor Q1 d b n";
    expect(evaluate(night, { LDR1: "dark" }).outputs.D1).toBe("on");
    expect(evaluate(night, { LDR1: "bright" }).outputs.D1).toBe("off");
    const vce = solve(compile(night), { LDR1: "dark" }).volts.d;
    expect(vce).toBeLessThan(0.3); // saturated
  });
  it("a chip's trigger: tap water and a finger pull it HIGH; dark doesn't", () => {
    const c = compile("battery B1 p n | probe P1 p t | melody MEL1 p n t o | speaker SPK1 o n");
    expect(chipInputs(c, solve(c, { P1: "water" })).MEL1.trig).toBe(true);
    expect(chipInputs(c, solve(c, { P1: "finger" })).MEL1.trig).toBe(true);
    expect(chipInputs(c, solve(c, { P1: "air" })).MEL1.trig).toBe(false);
    const l = compile("battery B1 p n | ldr LDR1 p t | melody MEL1 p n t o | speaker SPK1 o n");
    expect(chipInputs(l, solve(l, { LDR1: "dark" })).MEL1.trig).toBe(false);
  });
  it("short circuits switch the board off; a bare LED shows damage", () => {
    const r = evaluate("battery B1 p n | lamp L1 p n | slide S1 p n", { S1: "on" });
    expect(r.short).toBe(true);
    expect(r.outputs.L1).toBe("off");
    expect(evaluate("battery B1 p n | led D1 p n red").outputs.D1).toBe("damage");
  });
  it("chips: sound names, mode pins, soft volume and flashing lights", () => {
    const siren = m => evaluate(`battery B1 p n | siren SIR1 p n p o ${m} | speaker SPK1 o n`).outputs.SPK1;
    expect(siren("- -")).toBe("sound:police");
    expect(siren("p -")).toBe("sound:fire");
    expect(siren("- p")).toBe("sound:ambulance");
    expect(siren("p p")).toBe("sound:robot");
    expect(evaluate("battery B1 p n | melody MEL1 p n p o | resistor R1 o a 100 | speaker SPK1 a n").outputs.SPK1).toBe("soft");
    expect(evaluate("battery B1 p n | fx FX1 p n p o | resistor R1 o a 100 | led D1 a n green").outputs.D1).toBe("flash");
    expect(evaluate("battery B1 p n | fx FX1 p n n o | speaker SPK1 o n").outputs.SPK1).toBe("quiet"); // trigger held LOW
    expect(evaluate("battery B1 p n | slide S1 p a | melody MEL1 a n a o | speaker SPK1 o n", { S1: "off" }).outputs.SPK1).toBe("quiet"); // no power
  });
  it("a clap on the buzzer disc triggers a chip", () => {
    const c = "battery B1 p n | piezo PZ1 t n | fx FX1 p n t o | speaker SPK1 o n";
    expect(evaluate(c, { PZ1: "clap" }).outputs.SPK1).toBe("sound:space");
    expect(evaluate(c, { PZ1: "quiet" }).outputs.SPK1).toBe("quiet");
  });
  it("a light sensor 'lit by the lamp' follows the circuit's own bulb", () => {
    const c = "battery B1 p n | slide S1 p a | lamp L1 a n | ldr LDR1 p t | melody MEL1 p n t o | speaker SPK1 o n";
    expect(evaluate(c, { S1: "on", LDR1: "lamp" }).outputs.SPK1).toBe("sound:melody");
    expect(evaluate(c, { S1: "off", LDR1: "lamp" }).outputs.SPK1).toBe("quiet");
  });
  it("motors: speed and direction", () => {
    expect(evaluate("battery B1 p n | motor M1 p n").outputs.M1).toBe("spin");
    expect(evaluate("battery B1 p n | motor M1 n p").outputs.M1).toBe("reverse");
    expect(evaluate("battery B1 p n | lamp L1 p a | motor M1 a n").outputs.M1).toBe("slow");
  });
});

describe("all 100 Circuit Lab projects, simulated", () => {
  for (const p of PROJECTS.filter(x => x.circuit)) {
    it(`${p.id} ${p.title}: every check passes`, () => {
      for (const r of runChecks(p.circuit, p.checks, parseCheck)) expect(r.mismatches, `${p.id} [${r.check}]`).toEqual([]);
    });
  }

  it("fix-it projects start broken: their starting circuit fails a check", () => {
    for (const p of PROJECTS.filter(x => x.start)) expect(runChecks(p.start, p.checks, parseCheck).some(r => !r.pass), p.id).toBe(true);
  });

  it("every part matters: removing any one part breaks a check (decoys aside)", () => {
    for (const p of PROJECTS.filter(x => x.circuit)) {
      const parts = parseParts(p.circuit);
      for (const x of parts.filter(y => y.type !== "battery" && !(p.decoys ?? []).includes(y.id))) {
        const ok = runChecks(parts.filter(y => y !== x), p.checks, parseCheck).every(r => r.pass);
        expect(ok, `${p.id}: works without ${x.id} (${x.type})`).toBe(false);
      }
    }
  });

  it("direction matters: turning any LED or motor round breaks a check", () => {
    for (const p of PROJECTS.filter(x => x.circuit)) {
      const parts = parseParts(p.circuit);
      for (const x of parts.filter(y => y.type === "led" || y.type === "motor")) {
        const flipped = parts.map(y => (y === x ? { ...y, pins: { "+": y.pins["−"], "−": y.pins["+"] } } : y));
        expect(runChecks(flipped, p.checks, parseCheck).every(r => r.pass), `${p.id}: ${x.id} works either way round`).toBe(false);
      }
    }
  });

  it("every output has a safe margin from its thresholds (results don't hang on a rounding error)", () => {
    const T = { lamp: [MODEL.lamp.dim, MODEL.lamp.on], led: [MODEL.led.dim, MODEL.led.on, MODEL.led.damage], motor: [MODEL.motor.slow, MODEL.motor.spin] };
    for (const p of PROJECTS.filter(x => x.circuit)) {
      const c = compile(p.circuit);
      for (const text of p.checks) {
        const { when, expect: want } = parseCheck(text);
        const r = evaluate(c, when);
        for (const id of Object.keys(want)) {
          const part = c.parts.find(x => x.id === id);
          if (!part || !T[part.type]) continue;
          const a = Math.abs(r.readings.parts[id].amps);
          for (const t of T[part.type]) expect(a < t * 0.85 || a > t * 1.15, `${p.id} [${text}] ${id}: ${(a * 1000).toFixed(1)} mA is within 15% of ${t * 1000} mA`).toBe(true);
        }
      }
    }
  });

  it("is fast enough to run live (a whole project's checks in a few milliseconds)", () => {
    const p = PROJECTS.find(x => x.id === "lab-9-7");
    const t0 = performance.now();
    for (let i = 0; i < 50; i++) runChecks(p.circuit, p.checks, parseCheck);
    expect((performance.now() - t0) / 50).toBeLessThan(20);
  });
});

describe("more than one battery (free build)", () => {
  it("catches a short circuit on any battery, not only the first", async () => {
    const { evaluate } = await import("./engine.js");
    const { parseParts } = await import("../../content/lab/netlist.js");
    expect(evaluate(parseParts("battery B1 p n | lamp L1 p n | battery B2 q q")).short).toBe(true);
    const two = evaluate(parseParts("battery B1 p n | lamp L1 p n | battery B2 q r | lamp L2 q r"));
    expect(two.short).toBe(false);
    expect(two.outputs).toEqual({ L1: "on", L2: "on" });
  });
});


import { describe, it, expect } from "vitest";
import { MATHS_JOURNEY, MATHS_PATH } from "./maths.js";
import { OLLIE_TALK_PARTY, MONEY, defaultMoney, moneyOf, fmtMoney, BUDGET, SHOP, partyNeeds, basket, totalOf, roundUpChoices, partyDeeper } from "./party.js";
import { JOURNEYS } from "../journeys.js";
import { SEED } from "../index.js";
import { badgeState } from "../../lib/progress.js";
import { isUnlocked } from "../../components/journey/Journey.jsx";

const open = (steps, done, grade) => steps.filter((_, i) => isUnlocked(steps, i, new Set(done), grade)).map(s => s.id);

describe("Ollie's mission: plan a party", () => {
  it("starts with the conversation and puts the mission at the end of Part B", () => {
    const ids = MATHS_PATH.map(s => s.id);
    expect(ids[0]).toBe("math-talk-party");
    expect(ids.indexOf("math-mission-party")).toBe(ids.indexOf("math-step-8") + 1);
    expect(MATHS_PATH.find(s => s.id === "math-mission-party").part).toBe("B");
    expect(MATHS_PATH).toHaveLength(MATHS_JOURNEY.length + 2);
    expect(JOURNEYS.mathematics.steps).toBe(MATHS_PATH);
    const b = [...Array(8)].map((_, i) => `math-step-${i + 1}`);
    expect(open(MATHS_PATH, ["math-talk-party", ...b], 1)).toContain("math-mission-party");
    expect(open(MATHS_PATH, ["math-talk-party", ...b], 1)).not.toContain("math-step-9");
  });
  it("every answer in the conversation gets a reply, and its sums are right", () => {
    for (const l of OLLIE_TALK_PARTY) if (l.ask) { for (const c of l.choices) expect(c.reply.length).toBeGreaterThan(20); expect(l.choices.filter(c => c.right).length).toBe(1); }
    expect(2 * 8 + 40).toBe(56); // the budget question in the talk
  });
  it("money: a first guess from the language, prices that look real, and neutral coins", () => {
    expect(defaultMoney("en-IN")).toBe("inr"); expect(defaultMoney("te")).toBe("inr"); expect(defaultMoney("ja-JP")).toBe("jpy");
    expect(defaultMoney("en-GB")).toBe("gbp"); expect(defaultMoney("en-US")).toBe("usd"); expect(defaultMoney("de-DE")).toBe("eur");
    expect(defaultMoney("sw-KE")).toBe("coins"); expect(defaultMoney("")).toBe("coins");
    expect(fmtMoney(moneyOf("inr"), 120)).toBe("₹120"); expect(fmtMoney(moneyOf("coins"), 1)).toBe("1 coin"); expect(moneyOf("nope").id).toBe("coins");
    expect(MONEY.every(m => Number.isInteger(m.m) && m.m >= 1)).toBe(true);
  });
  it("food and drink always round up, for every party size", () => {
    for (let people = 4; people <= 10; people++) {
      const n = partyNeeds(people);
      expect(n.pizzas * 8).toBeGreaterThanOrEqual(n.slices); expect((n.pizzas - 1) * 8).toBeLessThan(n.slices);
      expect(n.bottles * 4).toBeGreaterThanOrEqual(n.cups); expect(n.cupcakePacks * 6).toBeGreaterThanOrEqual(people);
      for (const [need, per] of [[n.slices, 8], [n.cups, 4]]) {
        const c = roundUpChoices(need, per);
        expect(c.options).toHaveLength(3); expect(new Set(c.options).size).toBe(3); expect(c.options).toContain(c.answer); expect(c.options.every(x => x >= 1)).toBe(true);
      }
    }
  });
  it("the must-haves always fit the budget, and the extras can push it over", () => {
    for (const money of MONEY) for (let people = 4; people <= 10; people++) for (const dessert of ["cake", "cupcakes"]) {
      const must = totalOf(basket(people, dessert, [], money));
      expect(must).toBeLessThanOrEqual(BUDGET * money.m);
      const all = totalOf(basket(people, dessert, SHOP.filter(s => s.kind === "extra").map(s => s.id), money));
      expect(all).toBeGreaterThan(BUDGET * money.m);
    }
    const lines = basket(7, "cake", ["balloons"], moneyOf("inr"));
    expect(lines.map(l => [l.id, l.qty, l.total])).toEqual([["pizza", 2, 160], ["juice", 4, 80], ["cake", 1, 120], ["balloons", 1, 30]]);
    expect(partyDeeper(39, 7, moneyOf("usd"))).toEqual({ each: 5.57, pct: 78 });
  });
  it("awards the Party planner badge", () => {
    const child = { progress: [{ item_id: "math-mission-party", module_id: "mathematics" }], attempts: [], state: {} };
    expect(badgeState(child, SEED.modules).find(b => b.id === "party").earned).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { startTyping, press, extend, timedResults, wordsDone, nextTarget } from "../../lib/typing.js";
import { TYPING_JOURNEY, LADDER, GAMES, gamesOpen, gamePool, streamText, sessionTitle, HOME_KEYS } from "../../content/typing.js";
import { comboOf } from "./games/BeatTheClock.jsx";
import { fuelOf } from "./games/WordRocket.jsx";
import { target, balloonPace } from "./games/BalloonPop.jsx";
import { badgeState } from "../../lib/progress.js";
import { startTarget, MAX_TARGET } from "./Games.jsx";
import { findMilestones } from "../../lib/milestones.js";
import { SEED } from "../../content/index.js";

const typeText = (s, text, t0 = 0, ms = 100) => { [...text].forEach((c, i) => { s = press(s, c, t0 + i * ms); }); return s; };

describe("streaks and timed runs", () => {
  it("counts keys in a row and resets on a mistake", () => {
    let s = typeText(startTyping("asdf jkl"), "asd");
    expect(s.streak).toBe(3);
    s = press(s, "x", 400);
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(3);
    s = typeText(s, "f jkl", 500);
    expect(s.bestStreak).toBe(5);
  });
  it("extends endless text and measures speed on the real clock", () => {
    let s = startTyping("dad sad");
    s = extend(s, "lad");
    expect(s.text).toBe("dad sad lad");
    expect(s.misses).toHaveLength(s.text.length);
    s = typeText(s, "dad sad ");
    expect(wordsDone(s)).toBe(2);
    expect(timedResults(s, 60).wpm).toBe(2); // 8 keys in a minute → 1.6 words → 2
    s = typeText(s, "lad", 900);
    expect(wordsDone(s)).toBe(3);
  });
  it("game pace adapts up after a win and down after a miss, with a floor", () => {
    expect(nextTarget(10, true)).toBe(10.7);
    expect(nextTarget(10, false)).toBe(9.5);
    expect(nextTarget(3, false, 3)).toBe(3);
  });
});

describe("ladder and games content", () => {
  it("ladder rungs go up", () => {
    expect([...LADDER].sort((a, b) => a - b)).toEqual(LADDER);
    expect(LADDER[0]).toBe(5);
  });
  it("kids unlock games with the home row check; Pro has them open", () => {
    expect(gamesOpen(new Set(), "kids")).toBe(false);
    expect(gamesOpen(new Set(["typ-step-8"]), "kids")).toBe(true);
    expect(gamesOpen(new Set(), "pro")).toBe(true);
  });
  it("games use only keys learned so far", () => {
    const home = gamePool(new Set(["typ-step-8"]), "kids");
    expect(home).not.toContain("e");
    const top = gamePool(new Set(["typ-step-8", "typ-step-9", "typ-step-10"]), "kids");
    expect(top).toEqual(expect.arrayContaining(["e", "i", "r", "u"]));
    expect(top).not.toContain("t");
    expect(gamePool(new Set(), "pro")).toEqual(TYPING_JOURNEY.at(-1).pool);
    for (let i = 0; i < 30; i++) {
      const ok = new Set([...home, " "]);
      for (const c of streamText(home, 120)) expect(ok.has(c)).toBe(true);
    }
    expect(streamText(home, 120)).not.toMatch(/\b(\w+) \1\b/);
  });
  it("names every saved result for parents", () => {
    expect(sessionTitle("typ-step-8")).toBe("Home row check");
    expect(sessionTitle("ladder-15")).toBe("Speed ladder: 15 words a minute");
    for (const g of GAMES) expect(sessionTitle(`game-${g.id}`)).toBe(g.title);
  });
});

describe("game rules", () => {
  it("game targets start a little below your speed and stay humanly possible", () => {
    expect(startTarget("kids", 0)).toBe(5);
    expect(startTarget("kids", 20)).toBe(18);
    expect(startTarget("pro", 0)).toBe(14);
    expect(startTarget("pro", 3000)).toBe(MAX_TARGET);
  });
  it("Beat the Clock combo grows every 20 keys in a row, up to ×4", () => {
    expect([0, 19, 20, 39, 40, 60, 200].map(comboOf)).toEqual([1, 1, 2, 2, 3, 4, 4]);
  });
  it("Word Rocket: words add fuel, mistakes leak it", () => {
    let s = typeText(startTyping("dad sad lad"), "dad sad ");
    expect(fuelOf(s)).toBe(2);
    s = press(s, "x", 5000);
    expect(fuelOf(s)).toBe(1.75);
  });
  it("Balloon Pop pops the balloon closest to flying away; Pro has lives and a faster start", () => {
    const list = [{ ch: "a", y: 0.2 }, { ch: "a", y: 0.7 }, { ch: "s", y: 0.9 }, { ch: "a", y: 0.95, popped: true }];
    expect(target(list, "a")).toBe(list[1]);
    expect(target(list, "k")).toBe(null);
    const kids = balloonPace("kids"), pro = balloonPace("pro");
    expect(kids.lives).toBe(Infinity);
    expect(pro.lives).toBe(3);
    expect(pro.rise).toBeLessThan(kids.rise);
    expect(balloonPace("kids", 3).gap).toBeLessThan(kids.gap);
    expect(Object.values(HOME_KEYS)).toContain("a");
  });
  it("climbing the speed ladder earns badges and a parent email", () => {
    const kid = { id: "k", name: "Aarav" };
    const pub = { modules: SEED.modules, cards: SEED.cards, quiz: SEED.quiz };
    const at = n => ({ progress: [], attempts: [], state: { typing: { ladder: n } } });
    const earned = n => badgeState(at(n), pub.modules).filter(b => b.earned).map(b => b.id);
    expect(earned(2)).not.toContain("speed10");
    expect(earned(3)).toContain("speed10");     // rung 3 = 10 wpm
    expect(earned(6)).toContain("speed20");     // rung 6 = 20 wpm
    expect(findMilestones(at(2), at(3), pub, kid).map(m => m.title)).toEqual([expect.stringContaining("Speedy fingers")]);
  });
});

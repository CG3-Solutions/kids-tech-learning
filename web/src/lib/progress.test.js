import { describe, it, expect, beforeEach } from "vitest";
import { SEED } from "../content/index.js";
import { PUZZLES } from "../content/subjects.js";
import { CIRCUIT_PATH } from "../content/circuits.js";
import { moduleStats, moduleItems, starCount, badgeState, nextSuggestion, dayStreak, learnedToday } from "./progress.js";
import { run, flatten } from "./coding.js";
import { createDemoApi } from "./demoApi.js";

const memory = () => { const m = new Map(); return { get: (k, d) => (m.has(k) ? m.get(k) : d), set: (k, v) => m.set(k, structuredClone(v)) }; };
const empty = { progress: [], attempts: [], state: {} };

describe("content", () => {
  it("has unique ids and valid quiz answers", () => {
    const ids = [...SEED.cards.map(c => c.id), ...SEED.quiz.map(q => q.id), ...SEED.modules.map(m => m.id)];
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of SEED.quiz) expect(q.answer).toBeLessThan(q.options.length);
    for (const c of SEED.cards) expect(SEED.modules.some(m => m.id === c.module_id)).toBe(true);
  });
});

describe("progress", () => {
  const elec = SEED.modules.find(m => m.id === "electricity");
  it("counts learned cards per module", () => {
    const child = { ...empty, progress: [{ item_id: "el-battery", module_id: "electricity" }] };
    const st = moduleStats(elec, SEED.cards, child);
    expect(st.done).toBe(1);
    expect(st.total).toBe(SEED.cards.filter(c => c.module_id === "electricity").length + CIRCUIT_PATH.length);
  });
  it("counts coding puzzles as items", () => {
    const coding = SEED.modules.find(m => m.id === "coding");
    expect(moduleStats(coding, SEED.cards, empty).total).toBe(SEED.cards.filter(c => c.module_id === "coding").length + PUZZLES.length);
  });
  it("adds stars for items and correct answers", () => {
    expect(starCount({ ...empty, progress: [{ item_id: "a" }], attempts: [{ score: 5, total: 8 }] })).toBe(6);
  });
  it("awards badges", () => {
    const child = { ...empty, progress: [{ item_id: "el-battery", module_id: "electricity" }], attempts: [{ module_id: "binary", score: 6, total: 6 }] };
    const earned = badgeState(child, SEED.modules).filter(b => b.earned).map(b => b.id);
    expect(earned).toEqual(expect.arrayContaining(["first", "quiz"]));
    expect(earned).not.toContain("robot");
  });
  it("suggests a subject that suits the child's class", () => {
    expect(nextSuggestion(SEED.modules, SEED.cards, empty, { grade: 1 }).module.id).toBe("alphabets");
    expect(nextSuggestion(SEED.modules, SEED.cards, empty, { grade: 3 }).module.id).toBe("words");
    expect(nextSuggestion(SEED.modules, SEED.cards, empty, { grade: 7 }).module.id).toBe("computer");
    expect(nextSuggestion(SEED.modules, SEED.cards, empty, { grade: 10 }).module.id).toBe("computer");
    expect(nextSuggestion(SEED.modules, SEED.cards, empty, { learner: "adult" }).module.id).toBe("typing");
    expect(nextSuggestion(SEED.modules, SEED.cards, empty).module.id).toBe("alphabets"); // class not set: start at the beginning
  });
  it("skips subjects that are finished", () => {
    const words = SEED.modules.find(m => m.id === "words");
    const all = moduleItems(words, SEED.cards).map(id => ({ module_id: "words", item_id: id }));
    expect(nextSuggestion(SEED.modules, SEED.cards, { ...empty, progress: all }, { grade: 3 }).module.id).toBe("mathematics");
  });
});

describe("robot puzzles", () => {
  it("expands repeat blocks", () => {
    expect(flatten([{ op: "repeat", times: 3, body: [{ op: "fwd" }] }, { op: "left" }])).toEqual(["fwd", "fwd", "fwd", "left"]);
  });
  it("wins, bumps and falls short", () => {
    const g = PUZZLES[0].grid;
    expect(run(g, [{ op: "repeat", times: 3, body: [{ op: "fwd" }] }]).result).toBe("win");
    expect(run(g, [{ op: "fwd" }]).result).toBe("short");
    expect(run(g, [{ op: "left" }, { op: "fwd" }]).result).toBe("bump");
  });
  it("has a solution for the big maze", () => {
    const p = PUZZLES.find(x => x.id === "p8");
    const f = n => ({ op: "repeat", times: n, body: [{ op: "fwd" }] });
    const prog = [f(2), { op: "right" }, f(2), { op: "right" }, f(2), { op: "left" }, f(2), { op: "left" }, f(4), { op: "left" }, f(4)];
    expect(run(p.grid, prog).result).toBe("win");
  });
});

describe("demo api", () => {
  let api;
  beforeEach(() => { api = createDemoApi(memory()); });
  it("requires sign-in", async () => {
    await expect(api.listChildren()).rejects.toThrow();
  });
  it("stores children and progress", async () => {
    await api.signInDemo();
    const kid = await api.addChild({ name: " Aarav ", avatar: "🦊" });
    expect(kid.name).toBe("Aarav");
    await api.markDone(kid.id, "electricity", "el-battery");
    await api.markDone(kid.id, "electricity", "el-battery");
    await api.addAttempt(kid.id, "electricity", 7, 8);
    await api.setState(kid.id, "hunt", { "0-0": true });
    const data = await api.loadChild(kid.id);
    expect(data.progress).toHaveLength(1);
    expect(data.attempts[0].score).toBe(7);
    expect(data.state.hunt).toEqual({ "0-0": true });
    await api.deleteChild(kid.id);
    expect(await api.listChildren()).toHaveLength(0);
  });
  it("edits content", async () => {
    await api.signInDemo();
    await api.saveCard({ id: "x-1", module_id: "coding", level: 0, sort: 99, data: { n: "New" }, published: true });
    expect((await api.getContent()).cards.some(c => c.id === "x-1")).toBe(true);
    await api.seedContent();
    expect((await api.getContent()).cards.some(c => c.id === "x-1")).toBe(false);
  });
});

describe("supabase url", async () => {
  const { normalizeSupabaseUrl } = await import("./api.js");
  it("fixes a pasted dashboard link", () => {
    expect(normalizeSupabaseUrl("https://supabase.com/dashboard/project/lsfxsomrzrtmyyhrwdao/settings/api")).toBe("https://lsfxsomrzrtmyyhrwdao.supabase.co");
  });
  it("keeps a project url and trims extras", () => {
    expect(normalizeSupabaseUrl(" https://abc.supabase.co/ ")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(normalizeSupabaseUrl(undefined)).toBe("");
  });
});

describe("science content (Q4)", async () => {
  const { PUZZLES: P } = await import("../content/subjects.js");
  const { parseGrid } = await import("./coding.js");
  it("every robot puzzle can be solved", () => {
    for (const p of P) {
      const { rows, cols, start, goal } = parseGrid(p.grid);
      const seen = new Set([start.join()]), queue = [start];
      while (queue.length) {
        const [r, c] = queue.shift();
        for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && p.grid[nr][nc] !== "#" && !seen.has(`${nr},${nc}`)) { seen.add(`${nr},${nc}`); queue.push([nr, nc]); }
        }
      }
      expect(seen.has(goal.join()), p.id).toBe(true);
      expect(p.grid.every(r => r.length === cols), p.id).toBe(true);
    }
    expect(P.length).toBeGreaterThanOrEqual(11);
  });
  it("cards and quiz questions are well formed, with one right answer", () => {
    for (const c of SEED.cards) for (const k of ["e", "n", "sh", "what", "like", "q", "a"]) expect(c.data[k], `${c.id}.${k}`).toBeTruthy();
    const ids = SEED.cards.map(c => c.id); expect(new Set(ids).size).toBe(ids.length);
    for (const q of SEED.quiz) {
      expect(q.options[q.answer], q.id).toBeTruthy();
      expect(new Set(q.options.map(o => o.label)).size, q.id).toBe(q.options.length);
      expect(q.explanation.length, q.id).toBeGreaterThan(8);
    }
  });
  it("fixed wording: batteries store chemical energy; computers don't think", () => {
    const bat = SEED.cards.find(c => c.data.n === "Battery");
    expect(bat.data.what).toMatch(/chemicals/);
    expect(bat.data.what).not.toMatch(/box of stored electricity/);
    expect(SEED.quiz.some(q => /think/i.test(q.question))).toBe(false);
    expect(SEED.cards.filter(c => c.module_id === "binary").length).toBeGreaterThanOrEqual(8);
    expect(SEED.cards.filter(c => c.module_id === "coding").length).toBeGreaterThanOrEqual(7);
  });
});

describe("day streak", () => {
  const at = (y, m, d, h = 10) => new Date(y, m - 1, d, h).toISOString();
  const kid = days => ({ ...empty, progress: days.map((d, i) => ({ item_id: `x${i}`, module_id: "numbers", done_at: d })) });
  const now = new Date(2026, 9, 5, 18);
  it("counts days in a row up to today", () => {
    expect(dayStreak(kid([at(2026, 10, 3), at(2026, 10, 4), at(2026, 10, 5), at(2026, 10, 5, 12)]), now)).toBe(3);
  });
  it("keeps the streak alive when only yesterday is done", () => {
    expect(dayStreak(kid([at(2026, 10, 3), at(2026, 10, 4)]), now)).toBe(2);
  });
  it("breaks on a missed day", () => {
    expect(dayStreak(kid([at(2026, 10, 1), at(2026, 10, 2), at(2026, 10, 5)]), now)).toBe(1);
    expect(dayStreak(kid([at(2026, 10, 2)]), now)).toBe(0);
    expect(dayStreak(empty, now)).toBe(0);
  });
  it("knows what was learned today", () => {
    const c = kid([at(2026, 10, 5)]);
    expect(learnedToday(c, "numbers", now)).toBe(true);
    expect(learnedToday(c, "words", now)).toBe(false);
  });
});

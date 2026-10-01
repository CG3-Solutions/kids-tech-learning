import { describe, it, expect, beforeEach } from "vitest";
import { SEED } from "../content/index.js";
import { PUZZLES } from "../content/subjects.js";
import { CIRCUIT_JOURNEY } from "../content/circuits.js";
import { moduleStats, moduleItems, starCount, badgeState, nextSuggestion } from "./progress.js";
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
    expect(st.total).toBe(SEED.cards.filter(c => c.module_id === "electricity").length + CIRCUIT_JOURNEY.length);
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

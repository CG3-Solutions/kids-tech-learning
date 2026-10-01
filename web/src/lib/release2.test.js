import { describe, it, expect, beforeEach } from "vitest";
import { SEED } from "../content/index.js";
import { findMilestones } from "./milestones.js";
import { VOICES, voiceOf, defaultVoiceFor } from "./voice.js";
import { createDemoApi } from "./demoApi.js";
import { describeItem } from "./activity.js";

const memory = () => { const m = new Map(); return { get: (k, d) => (m.has(k) ? m.get(k) : d), set: (k, v) => m.set(k, structuredClone(v)) }; };
const pub = { modules: SEED.modules, cards: SEED.cards, quiz: SEED.quiz };
const empty = { progress: [], attempts: [], state: {} };
const kid = { id: "k", name: "Aarav" };

describe("milestones", () => {
  it("reports a newly earned badge once", () => {
    const after = { ...empty, progress: [{ item_id: "el-battery", module_id: "electricity" }] };
    const m = findMilestones(empty, after, pub, kid);
    expect(m.map(x => x.title)).toEqual([expect.stringContaining("First spark")]);
    expect(findMilestones(after, after, pub, kid)).toEqual([]);
  });
  it("reports finishing a whole subject", () => {
    const coding = SEED.modules.find(m => m.id === "coding");
    const items = [...SEED.cards.filter(c => c.module_id === "coding").map(c => c.id), ...["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map(p => `puzzle-${p}`)];
    const before = { ...empty, progress: items.slice(0, -1).map(id => ({ item_id: id, module_id: "coding" })) };
    const after = { ...empty, progress: items.map(id => ({ item_id: id, module_id: "coding" })) };
    expect(findMilestones(before, after, pub, kid).some(m => m.title.includes(`finished ${coding.title}`))).toBe(true);
  });
  it("ignores coming-soon subjects", () => {
    // A coming-soon tile with puzzles: finishing them all must not send a "finished" email.
    const soon = { id: "soon", area: "science", title: "Soon", coming_soon: true, activity: "coding" };
    const p2 = { ...pub, modules: [...pub.modules, soon] };
    const ids = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map(p => `puzzle-${p}`);
    const before = { ...empty, progress: ids.slice(0, -1).map(id => ({ item_id: id, module_id: "soon" })) };
    const after = { ...empty, progress: ids.map(id => ({ item_id: id, module_id: "soon" })) };
    expect(findMilestones(before, after, p2, kid).some(m => m.title.includes("finished Soon"))).toBe(false);
  });
});

describe("voices", () => {
  it("offers four presets and picks a default by gender", () => {
    expect(VOICES).toHaveLength(4);
    expect(defaultVoiceFor("girl")).toBe("bright");
    expect(defaultVoiceFor("boy")).toBe("cheerful");
    expect(voiceOf({ gender: "unspecified" }).id).toBe("robot");
    expect(voiceOf({ gender: "boy", voice: "teacher" }).id).toBe("teacher");
  });
});

describe("demo api: screen time and notifications", () => {
  let api;
  beforeEach(async () => { api = createDemoApi(memory()); await api.signInDemo(); });
  it("adds up usage and bonus time per day", async () => {
    const k = await api.addChild({ name: "A", avatar: "🦊", gender: "girl", daily_limit_min: 30 });
    expect(k.gender).toBe("girl");
    await api.addUsage(k.id, "2026-10-01", 60);
    await api.addUsage(k.id, "2026-10-01", 30, 900);
    await api.addUsage(k.id, "2026-09-01", 99);
    const rows = await api.getUsage([k.id], "2026-10-01");
    expect(rows).toEqual([{ child_id: k.id, day: "2026-10-01", seconds: 90, bonus_seconds: 900 }]);
    await api.updateChild(k.id, { daily_limit_min: null, voice: "robot" });
    const [c] = await api.listChildren();
    expect(c.daily_limit_min).toBeNull();
    expect(c.voice).toBe("robot");
    expect(c.name).toBe("A");
  });
  it("records notifications only when milestones are on", async () => {
    await api.queueNotification({ title: "T1" });
    await api.updateProfile({ notify_milestones: false });
    await api.queueNotification({ title: "T2" });
    expect((await api.listNotifications()).map(n => n.title)).toEqual(["T1"]);
  });
});

describe("activity lines", () => {
  it("names cards, steps and puzzles", () => {
    expect(describeItem("el-battery", pub)).toContain("Battery");
    expect(describeItem("circuit-step-9", pub)).toContain("Staircase switch");
    expect(describeItem("puzzle-p3", pub)).toContain("puzzle 3");
  });
});

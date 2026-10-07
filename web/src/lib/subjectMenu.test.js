import { describe, it, expect } from "vitest";
import { SEED } from "../content/index.js";
import { menuItems, startedSubject, groupItems, KIND_LABEL } from "./subjectMenu.js";
import { JOURNEYS } from "../content/journeys.js";

const elec = SEED.modules.find(m => m.id === "electricity");
const elecCards = SEED.cards.filter(c => c.module_id === "electricity");
const TABS = ["cards", "circuit", "lab", "hunt", "machines", "quiz"];

describe("subject menu", () => {
  it("puts sections in learning order: learn, adventure, build, play, quiz", () => {
    const items = menuItems({ tabs: TABS, module: elec, cards: elecCards });
    expect(items.map(i => i.tab)).toEqual(["cards", "circuit", "lab", "hunt", "machines", "quiz"]);
    expect(items.map(i => KIND_LABEL[i.kind])).toEqual(["Learn", "Adventure", "Build", "Play", "Play", "Quiz"]);
    expect(items.every(i => i.title && i.about && i.icon && i.meta.text)).toBe(true);
  });
  it("shows how far the child has got in each section", () => {
    const step = JOURNEYS.circuit.steps.find(s => !s.bonus);
    const done = new Set([elecCards[0].id, elecCards[1].id, step.id, "lab-1-1"]);
    const items = menuItems({ tabs: TABS, module: elec, cards: elecCards, done, attempts: [{ score: 8, total: 12 }, { score: 5, total: 12 }], state: { hunt: { "0-0": true } } });
    const by = Object.fromEntries(items.map(i => [i.tab, i.meta]));
    expect(by.cards.text).toBe(`2 of ${elecCards.length} collected`);
    expect(by.circuit.text).toMatch(/^1 of \d+ steps$/);
    expect(by.lab.text).toMatch(/^1 of \d+ projects$/);
    expect(by.hunt.done).toBe(1);
    expect(by.quiz.text).toBe("Best 8 of 12");
    expect(startedSubject(items)).toBe(true);
  });
  it("knows a subject nobody has started", () => {
    const items = menuItems({ tabs: TABS, module: elec, cards: elecCards });
    expect(startedSubject(items)).toBe(false);
    expect(items.find(i => i.tab === "quiz").meta.text).toBe("Not tried yet");
  });
  it("puts glossary cards last, as reference", () => {
    const comp = SEED.modules.find(m => m.id === "computer");
    const items = menuItems({ tabs: ["cards", "computer", "quiz"], module: comp, cards: SEED.cards.filter(c => c.module_id === "computer"), glossary: true });
    expect(items.map(i => i.tab)).toEqual(["computer", "quiz", "cards"]);
    expect(items.at(-1).title).toBe("Glossary");
  });
  it("has a short count for every chip", () => {
    const items = menuItems({ tabs: TABS, module: elec, cards: elecCards });
    expect(items.every(i => typeof i.meta.short === "string" && i.meta.short.length <= 7)).toBe(true);
    expect(items.find(i => i.tab === "cards").meta.short).toBe(`0/${elecCards.length}`);
    expect(items.find(i => i.tab === "quiz").meta.short).toBe("New");
  });
  it("groups sections under headings, in order, however many there are", () => {
    const items = menuItems({ tabs: TABS, module: elec, cards: elecCards });
    const groups = groupItems(items);
    expect(groups.map(g => g.label)).toEqual(["Learn", "Adventures", "Build", "Play", "Quiz"]);
    expect(groups.find(g => g.kind === "play").items.map(i => i.tab)).toEqual(["hunt", "machines"]);
    expect(groups.flatMap(g => g.items)).toEqual(items);
  });
});

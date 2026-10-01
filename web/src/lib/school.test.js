import { describe, it, expect } from "vitest";
import { assignmentLabel, assignmentStatus, csvCell, rosterCsv, studentRow } from "./school.js";
import { createDemoApi } from "./demoApi.js";
import { defaultMode } from "../content/typing.js";
import { voiceOf } from "./voice.js";

const memory = () => { const m = new Map(); return { get: (k, d) => (m.has(k) ? m.get(k) : d), set: (k, v) => m.set(k, structuredClone(v)) }; };
const at = "2026-10-01T09:00:00Z";

describe("assignments", () => {
  const lesson = { kind: "lesson", target: "typ-step-8", created_at: at, due_on: "2026-10-05" };
  const test = { kind: "test", target: "3", min_wpm: 15, created_at: at };
  const ladder = { kind: "ladder", target: "15", created_at: at };
  it("labels read like instructions", () => {
    expect(assignmentLabel(lesson)).toBe("Pass “Home row check”");
    expect(assignmentLabel(test)).toBe("Take a 3-minute typing test at 15+ words a minute");
    expect(assignmentLabel(ladder)).toBe("Reach 15 words a minute on the speed ladder");
  });
  it("lesson: done when passed; overdue after the due date", () => {
    expect(assignmentStatus(lesson, { progress: [{ item_id: "typ-step-8" }] }, "2026-10-09")).toMatchObject({ done: true, overdue: false });
    expect(assignmentStatus(lesson, { typing: [{ lesson_id: "typ-step-8" }], progress: [] }, "2026-10-09")).toMatchObject({ done: false, overdue: true, detail: "1 try, not passed yet" });
    expect(assignmentStatus(lesson, { progress: [] }, "2026-10-05").overdue).toBe(false);
  });
  it("test: only passed tests after the task was set, at the speed asked", () => {
    const old = { lesson_id: "test-3", passed: true, wpm: 30, created_at: "2026-09-01T00:00:00Z" };
    const slow = { lesson_id: "test-3", passed: true, wpm: 12, created_at: "2026-10-02T00:00:00Z" };
    const good = { lesson_id: "test-3", passed: true, wpm: 18, created_at: "2026-10-03T00:00:00Z" };
    expect(assignmentStatus(test, { typing: [old] }).done).toBe(false);
    expect(assignmentStatus(test, { typing: [slow] })).toMatchObject({ done: false, detail: "Best 12 wpm" });
    expect(assignmentStatus(test, { typing: [good, slow] }).done).toBe(true);
  });
  it("ladder: done when the rung's speed reaches the target", () => {
    expect(assignmentStatus(ladder, { state: { typing: { ladder: 4 } } })).toMatchObject({ done: false, detail: "On 12 wpm" });
    expect(assignmentStatus(ladder, { state: { typing: { ladder: 5 } } }).done).toBe(true);
  });
});

describe("class dashboard and CSV", () => {
  it("builds a student row", () => {
    const r = studentRow({ child: { id: "a", name: "Aarav" }, typing: [{ wpm: 20, accuracy: 96, seconds: 120, created_at: at, keys: {} }], progress: [{ item_id: "typ-step-1" }], state: { typing: { ladder: 3 } } }, []);
    expect(r).toMatchObject({ lessons: 1, best: 20, accuracy: 96, ladder: 10, minutes: 2, last: at });
  });
  it("CSV escapes commas and quotes, and never lets a name run as a formula", () => {
    expect(csvCell('Riya, "R"')).toBe('"Riya, ""R"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("+91")).toBe("'+91");
    expect(csvCell("@x")).toBe("'@x");
    const csv = rosterCsv([{ child: { name: "=cmd" }, lessons: 2, best: 10, accuracy: 90, ladder: 5, minutes: 3, last: at, statuses: [{ done: true }] }], [{ title: "Pass “Home row check”" }]);
    expect(csv.split("\r\n")[1]).toBe("'=cmd,2/33,10,90,5,3,2026-10-01,Done");
  });
});

describe("demo school flow", () => {
  it("teacher creates a class, parent joins with the code, teacher sees typing and sets a task", async () => {
    const api = createDemoApi(memory());
    await api.signInDemo("Teacher");
    const kid = await api.addChild({ name: "Aarav", avatar: "🦊" });
    await expect(api.createClass("4B")).rejects.toThrow(/teacher/);
    await api.updateProfile({ is_teacher: true });
    const cls = await api.createClass(" 4B ");
    expect(cls.join_code).toMatch(/^[0-9A-F]{6}$/);
    await expect(api.joinClass("NOPE00", kid.id)).rejects.toThrow(/No class/);
    expect(await api.joinClass(cls.join_code.toLowerCase(), kid.id)).toEqual({ id: cls.id, name: "4B" });
    await api.addTypingSession(kid.id, { lesson_id: "typ-step-1", wpm: 9, accuracy: 92, seconds: 40, chars: 40, errors: 3, passed: true, keys: {} });
    await api.addAssignment({ class_id: cls.id, title: "Ladder 10", kind: "ladder", target: "10" });
    const roster = await api.classRoster(cls.id);
    expect(roster.members.map(m => m.child.name)).toEqual(["Aarav"]);
    expect(roster.members[0].typing).toHaveLength(1);
    expect(roster.assignments).toHaveLength(1);
    expect((await api.assignmentsFor(kid.id))[0]).toMatchObject({ title: "Ladder 10", class_name: "4B" });
    await api.leaveClass(cls.id, kid.id);
    expect((await api.classRoster(cls.id)).members).toHaveLength(0);
    expect(await api.assignmentsFor(kid.id)).toEqual([]);
  });
});

describe("grown-up learners", () => {
  it("start in Pro mode with the calm teacher voice", () => {
    expect(defaultMode({ learner: "adult", grade: null })).toBe("pro");
    expect(defaultMode({ learner: "child", grade: 2 })).toBe("kids");
    expect(defaultMode({ learner: "child", grade: 7 })).toBe("pro");
    expect(voiceOf({ learner: "adult" }).id).toBe("teacher");
    expect(voiceOf({ learner: "adult", voice: "robot" }).id).toBe("robot");
  });
});

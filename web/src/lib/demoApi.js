// Demo mode: the full app, stored in this browser only. Used when Supabase isn't configured.
import { SEED } from "../content/index.js";
import { local } from "./storage.js";

const KEY = "sparklab.demo.v1";
const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
const blank = () => ({ user: null, profile: null, children: [], progress: [], attempts: [], state: {}, content: null, usage: [], notifications: [], typing: [], classes: [], members: [], assignments: [] });
const CHILD_FIELDS = ["name", "avatar", "grade", "gender", "voice", "daily_limit_min", "learner"];
const pick = (obj, keys) => Object.fromEntries(keys.filter(k => obj[k] !== undefined).map(k => [k, typeof obj[k] === "string" && k === "name" ? obj[k].trim() : obj[k]]));

export function createDemoApi(storage = local) {
  let db = { ...blank(), ...storage.get(KEY, {}) };
  db.usage ??= []; db.notifications ??= []; db.typing ??= []; db.classes ??= []; db.members ??= []; db.assignments ??= [];
  const listeners = new Set();
  const save = () => storage.set(KEY, db);
  const emit = () => listeners.forEach(fn => fn(db.user));
  const need = () => { if (!db.user) throw new Error("Please sign in first."); };
  const owns = id => db.children.some(c => c.id === id);
  const content = () => db.content ?? structuredClone(SEED);
  const setContent = fn => { const c = content(); fn(c); db.content = c; save(); };
  const upsert = (list, item) => { const i = list.findIndex(x => x.id === item.id); if (i >= 0) list[i] = { ...list[i], ...item }; else list.push(item); };

  return {
    mode: "demo",
    features: { google: false, passwords: false },

    async getUser() { return db.user; },
    onAuth(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    async signInDemo(name = "Parent") {
      const id = db.user?.id ?? uid();
      db.user = { id, email: "demo@sparklab.local" };
      db.profile = db.profile ?? { id, display_name: name, role: "admin", notify_milestones: true, notify_daily: true };
      save(); emit(); return db.user;
    },
    async signOut() { db.user = null; save(); emit(); },

    async getProfile() { need(); return db.profile; },
    async updateProfile(patch) { need(); db.profile = { ...db.profile, ...pick(patch, ["display_name", "notify_milestones", "notify_daily", "is_teacher"]) }; save(); return db.profile; },

    async listChildren() { need(); return [...db.children].sort((a, b) => a.created_at.localeCompare(b.created_at)); },
    async addChild(data) {
      need(); const child = { grade: null, gender: "unspecified", voice: null, daily_limit_min: null, learner: "child", ...pick(data, CHILD_FIELDS), id: uid(), parent_id: db.user.id, created_at: new Date().toISOString() };
      db.children.push(child); save(); return child;
    },
    async updateChild(id, patch) {
      need(); const c = db.children.find(x => x.id === id); if (!c) throw new Error("Child not found.");
      Object.assign(c, pick(patch, CHILD_FIELDS)); save(); return c;
    },
    async deleteChild(id) {
      need(); db.children = db.children.filter(c => c.id !== id);
      db.progress = db.progress.filter(p => p.child_id !== id);
      db.attempts = db.attempts.filter(a => a.child_id !== id);
      db.usage = db.usage.filter(u => u.child_id !== id);
      db.typing = db.typing.filter(t => t.child_id !== id);
      db.members = db.members.filter(m => m.child_id !== id);
      delete db.state[id]; save();
    },

    async loadChild(childId) {
      need(); if (!owns(childId)) throw new Error("Child not found.");
      return {
        progress: db.progress.filter(p => p.child_id === childId),
        attempts: db.attempts.filter(a => a.child_id === childId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        state: { ...(db.state[childId] ?? {}) },
        typing: db.typing.filter(t => t.child_id === childId).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 200),
      };
    },
    async addTypingSession(childId, row) {
      need(); if (!owns(childId)) throw new Error("Child not found.");
      const r = { ...row, id: uid(), child_id: childId, created_at: new Date().toISOString() };
      db.typing.push(r); save(); return r;
    },
    async markDone(childId, moduleId, itemId) {
      need(); if (!owns(childId)) return;
      if (!db.progress.some(p => p.child_id === childId && p.item_id === itemId)) {
        db.progress.push({ child_id: childId, module_id: moduleId, item_id: itemId, done_at: new Date().toISOString() }); save();
      }
    },
    async addAttempt(childId, moduleId, score, total) {
      need(); if (!owns(childId)) return;
      db.attempts.push({ id: uid(), child_id: childId, module_id: moduleId, score, total, created_at: new Date().toISOString() }); save();
    },
    async setState(childId, key, value) {
      need(); if (!owns(childId)) return;
      db.state[childId] = { ...(db.state[childId] ?? {}), [key]: value }; save();
    },

    // Screen time
    async getUsage(childIds, fromDay) {
      need(); return db.usage.filter(u => childIds.includes(u.child_id) && u.day >= fromDay);
    },
    async addUsage(childId, day, secs, bonus = 0) {
      need(); if (!owns(childId)) return;
      let row = db.usage.find(u => u.child_id === childId && u.day === day);
      if (!row) { row = { child_id: childId, day, seconds: 0, bonus_seconds: 0 }; db.usage.push(row); }
      row.seconds += Math.max(0, secs); row.bonus_seconds += Math.max(0, bonus); save();
    },

    // Schools. In demo mode you are the teacher and the parent, so you can try both sides.
    async listClasses() { need(); return db.classes.filter(c => c.teacher_id === db.user.id); },
    async createClass(name) {
      need(); if (!db.profile?.is_teacher) throw new Error("Turn on “I'm a teacher” first.");
      const code = Array.from({ length: 6 }, () => "0123456789ABCDEF"[Math.floor(Math.random() * 16)]).join("");
      const c = { id: uid(), teacher_id: db.user.id, name: name.trim(), join_code: code, created_at: new Date().toISOString() };
      db.classes.push(c); save(); return c;
    },
    async deleteClass(id) {
      need(); db.classes = db.classes.filter(c => c.id !== id); db.members = db.members.filter(m => m.class_id !== id);
      db.assignments = db.assignments.filter(a => a.class_id !== id); save();
    },
    async classRoster(classId) {
      need(); const cls = db.classes.find(c => c.id === classId && c.teacher_id === db.user.id); if (!cls) throw new Error("Class not found.");
      return {
        assignments: db.assignments.filter(a => a.class_id === classId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        members: db.members.filter(m => m.class_id === classId).map(m => {
          const c = db.children.find(x => x.id === m.child_id);
          return {
            joined_at: m.joined_at,
            child: { id: c.id, name: c.name, avatar: c.avatar, grade: c.grade, learner: c.learner },
            typing: db.typing.filter(t => t.child_id === c.id).sort((a, b) => b.created_at.localeCompare(a.created_at)),
            progress: db.progress.filter(p => p.child_id === c.id && p.module_id === "typing"),
            state: { typing: db.state[c.id]?.typing ?? {} },
          };
        }),
      };
    },
    async removeMember(classId, childId) { need(); db.members = db.members.filter(m => !(m.class_id === classId && m.child_id === childId)); save(); },
    async addAssignment(a) {
      need(); if (!db.classes.some(c => c.id === a.class_id && c.teacher_id === db.user.id)) throw new Error("Class not found.");
      const row = { min_wpm: null, due_on: null, ...pick(a, ["class_id", "title", "kind", "target", "min_wpm", "due_on"]), id: uid(), created_at: new Date().toISOString() };
      db.assignments.push(row); save(); return row;
    },
    async deleteAssignment(id) { need(); db.assignments = db.assignments.filter(a => a.id !== id); save(); },
    async joinClass(code, childId) {
      need(); if (!owns(childId)) throw new Error("Child not found.");
      const c = db.classes.find(x => x.join_code === code.trim().toUpperCase());
      if (!c) throw new Error("No class has that code. Check it with the teacher.");
      if (!db.members.some(m => m.class_id === c.id && m.child_id === childId)) db.members.push({ class_id: c.id, child_id: childId, joined_at: new Date().toISOString() });
      save(); return { id: c.id, name: c.name };
    },
    async leaveClass(classId, childId) { need(); if (!owns(childId)) return; db.members = db.members.filter(m => !(m.class_id === classId && m.child_id === childId)); save(); },
    async childClasses(childIds) {
      need(); return db.members.filter(m => childIds.includes(m.child_id)).map(m => ({ class_id: m.class_id, child_id: m.child_id, name: db.classes.find(c => c.id === m.class_id)?.name ?? "Class" }));
    },
    async assignmentsFor(childId) {
      const mine = await this.childClasses([childId]);
      return db.assignments.filter(a => mine.some(m => m.class_id === a.class_id)).sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map(a => ({ ...a, class_name: mine.find(m => m.class_id === a.class_id)?.name }));
    },

    // Notifications: in demo mode they are recorded but never emailed.
    async queueNotification({ child_id = null, title, body = "" }) {
      need(); if (!db.profile.notify_milestones) return;
      db.notifications.unshift({ id: uid(), child_id, kind: "milestone", title, body, created_at: new Date().toISOString(), sent_at: null, error: "Demo mode: emails are not sent" });
      db.notifications = db.notifications.slice(0, 100); save();
    },
    async listNotifications() { need(); return db.notifications; },

    async getContent() { return content(); },
    async saveModule(m) { setContent(c => upsert(c.modules, m)); },
    async deleteModule(id) { setContent(c => { c.modules = c.modules.filter(m => m.id !== id); c.cards = c.cards.filter(x => x.module_id !== id); c.quiz = c.quiz.filter(x => x.module_id !== id); }); },
    async saveCard(card) { setContent(c => upsert(c.cards, card)); },
    async deleteCard(id) { setContent(c => { c.cards = c.cards.filter(x => x.id !== id); }); },
    async saveQuestion(q) { setContent(c => upsert(c.quiz, q)); },
    async deleteQuestion(id) { setContent(c => { c.quiz = c.quiz.filter(x => x.id !== id); }); },
    async seedContent() { db.content = structuredClone(SEED); save(); },

    // test helper
    _reset() { db = blank(); save(); },
  };
}

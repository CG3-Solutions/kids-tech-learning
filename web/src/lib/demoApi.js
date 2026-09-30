// Demo mode: the full app, stored in this browser only. Used when Supabase isn't configured.
import { SEED } from "../content/index.js";
import { local } from "./storage.js";

const KEY = "sparklab.demo.v1";
const uid = () => (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36));
const blank = () => ({ user: null, profile: null, children: [], progress: [], attempts: [], state: {}, content: null, usage: [], notifications: [] });
const CHILD_FIELDS = ["name", "avatar", "grade", "gender", "voice", "daily_limit_min"];
const pick = (obj, keys) => Object.fromEntries(keys.filter(k => obj[k] !== undefined).map(k => [k, typeof obj[k] === "string" && k === "name" ? obj[k].trim() : obj[k]]));

export function createDemoApi(storage = local) {
  let db = { ...blank(), ...storage.get(KEY, {}) };
  db.usage ??= []; db.notifications ??= [];
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
    async updateProfile(patch) { need(); db.profile = { ...db.profile, ...pick(patch, ["display_name", "notify_milestones", "notify_daily"]) }; save(); return db.profile; },

    async listChildren() { need(); return [...db.children].sort((a, b) => a.created_at.localeCompare(b.created_at)); },
    async addChild(data) {
      need(); const child = { grade: null, gender: "unspecified", voice: null, daily_limit_min: null, ...pick(data, CHILD_FIELDS), id: uid(), parent_id: db.user.id, created_at: new Date().toISOString() };
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
      delete db.state[id]; save();
    },

    async loadChild(childId) {
      need(); if (!owns(childId)) throw new Error("Child not found.");
      return {
        progress: db.progress.filter(p => p.child_id === childId),
        attempts: db.attempts.filter(a => a.child_id === childId).sort((a, b) => b.created_at.localeCompare(a.created_at)),
        state: { ...(db.state[childId] ?? {}) },
      };
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

// Supabase mode: real accounts and a shared database.
import { createClient } from "@supabase/supabase-js";
import { SEED } from "../content/index.js";

const TYPING_FIELDS = "id, lesson_id, mode, input, wpm, accuracy, seconds, chars, errors, passed, keys, created_at";
const CHILD_FIELDS = ["name", "avatar", "grade", "gender", "voice", "daily_limit_min", "learner"];
const pick = (obj, keys) => Object.fromEntries(keys.filter(k => obj[k] !== undefined).map(k => [k, k === "name" && typeof obj[k] === "string" ? obj[k].trim() : obj[k]]));

export function createSupabaseApi(url, anonKey, { google = false } = {}) {
  // Coming back from an email link or Google sign-in (the URL carries a one-time code): that's the
  // parent proving who they are, so the app can open the Parent dashboard without asking again.
  const freshSignIn = typeof window !== "undefined" && /[?&]code=/.test(window.location.search);
  const sb = createClient(url, anonKey, {
    auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  const redirectTo = () => `${window.location.origin}${import.meta.env.BASE_URL}`;
  const ok = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

  return {
    mode: "supabase",
    freshSignIn,
    features: { google, passwords: true },
    // Natural voices: recorded lines live in the public "tts" bucket; the "tts" function makes missing ones.
    tts: {
      publicUrl: path => sb.storage.from("tts").getPublicUrl(path).data.publicUrl,
      async synth(body) {
        const { data, error } = await sb.functions.invoke("tts", { body });
        if (error) { const e = new Error(error.message); e.status = error.context?.status; throw e; }
        return data;
      },
    },

    async getUser() { const { data } = await sb.auth.getSession(); return data.session?.user ?? null; },
    onAuth(fn) { const { data } = sb.auth.onAuthStateChange((_e, session) => fn(session?.user ?? null)); return () => data.subscription.unsubscribe(); },
    async signUp(email, password, name) {
      const data = ok(await sb.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: redirectTo() } }));
      return { needsConfirm: !data.session };
    },
    async signIn(email, password) { ok(await sb.auth.signInWithPassword({ email, password })); },
    async sendLink(email) { ok(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo(), shouldCreateUser: true } })); },
    async signInGoogle() { ok(await sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } })); },
    async signOut() { await sb.auth.signOut(); },
    // The Parent dashboard check: is this the account's password? (Supabase limits how often this can be tried.)
    async verifyPassword(password) {
      const user = await this.getUser();
      if (!user?.email) return false;
      const { error } = await sb.auth.signInWithPassword({ email: user.email, password });
      if (!error) return true;
      if (/invalid login credentials/i.test(error.message)) return false;
      if (/rate limit|too many/i.test(error.message)) throw new Error("Too many tries. Wait a few minutes and try again.");
      throw new Error(error.message);
    },
    // Set or change the account password (for accounts made with Google or an email link, too).
    async setPassword(password) { ok(await sb.auth.updateUser({ password })); },

    async getProfile() {
      const user = await this.getUser();
      const rows = ok(await sb.from("profiles").select("*").eq("id", user.id));
      return rows[0] ?? { id: user.id, display_name: user.email, role: "parent" };
    },
    async updateProfile(patch) {
      const user = await this.getUser();
      return ok(await sb.from("profiles").update(pick(patch, ["display_name", "notify_milestones", "notify_daily", "is_teacher"])).eq("id", user.id).select().single());
    },

    async listChildren() { return ok(await sb.from("children").select("*").order("created_at")); },
    async addChild(data) {
      const user = await this.getUser();
      const fields = pick(data, CHILD_FIELDS);
      for (const k of Object.keys(fields)) if (fields[k] === null) delete fields[k]; // let the database defaults apply
      return ok(await sb.from("children").insert({ parent_id: user.id, ...fields }).select().single());
    },
    async updateChild(id, patch) { return ok(await sb.from("children").update(pick(patch, CHILD_FIELDS)).eq("id", id).select().single()); },
    async deleteChild(id) { ok(await sb.from("children").delete().eq("id", id)); },

    async loadChild(childId) {
      const [progress, attempts, state] = await Promise.all([
        sb.from("progress").select("item_id, module_id, done_at").eq("child_id", childId),
        sb.from("quiz_attempts").select("id, module_id, score, total, created_at").eq("child_id", childId).order("created_at", { ascending: false }).limit(200),
        sb.from("child_state").select("key, value").eq("child_id", childId),
      ]).then(rs => rs.map(ok));
      // Typing needs release-3.sql; until it's run, the rest of the app keeps working.
      const typing = await sb.from("typing_sessions").select(TYPING_FIELDS).eq("child_id", childId).order("created_at", { ascending: false }).limit(200)
        .then(r => (r.error ? [] : r.data));
      return { progress, attempts, state: Object.fromEntries(state.map(s => [s.key, s.value])), typing };
    },
    async addTypingSession(childId, row) {
      return ok(await sb.from("typing_sessions").insert({ child_id: childId, ...row }).select(TYPING_FIELDS).single());
    },
    async markDone(childId, moduleId, itemId) {
      ok(await sb.from("progress").upsert({ child_id: childId, module_id: moduleId, item_id: itemId }, { onConflict: "child_id,item_id", ignoreDuplicates: true }));
    },
    async addAttempt(childId, moduleId, score, total) { ok(await sb.from("quiz_attempts").insert({ child_id: childId, module_id: moduleId, score, total })); },
    async setState(childId, key, value) {
      ok(await sb.from("child_state").upsert({ child_id: childId, key, value, updated_at: new Date().toISOString() }));
    },

    async getUsage(childIds, fromDay) {
      if (!childIds.length) return [];
      return ok(await sb.from("child_usage").select("*").in("child_id", childIds).gte("day", fromDay));
    },
    async addUsage(childId, day, secs, bonus = 0) { ok(await sb.rpc("add_usage", { cid: childId, d: day, secs, bonus })); },

    // ───────── Schools (needs release-4.sql) ─────────
    async listClasses() {
      const user = await this.getUser();
      return ok(await sb.from("classes").select("id, name, join_code, created_at").eq("teacher_id", user.id).order("created_at"));
    },
    async createClass(name) { return ok(await sb.from("classes").insert({ name: name.trim() }).select("id, name, join_code, created_at").single()); },
    async deleteClass(id) { ok(await sb.from("classes").delete().eq("id", id)); },
    async classRoster(classId) {
      const members = ok(await sb.from("class_members").select("child_id, joined_at").eq("class_id", classId));
      const ids = members.map(m => m.child_id);
      const assignments = ok(await sb.from("assignments").select("*").eq("class_id", classId).order("created_at", { ascending: false }));
      if (!ids.length) return { members: [], assignments };
      const [kids, typing, progress, state] = await Promise.all([
        sb.from("children").select("id, name, avatar, grade, learner").in("id", ids),
        sb.from("typing_sessions").select(`child_id, ${TYPING_FIELDS}`).in("child_id", ids).order("created_at", { ascending: false }).limit(3000),
        sb.from("progress").select("child_id, item_id, module_id, done_at").eq("module_id", "typing").in("child_id", ids),
        sb.from("child_state").select("child_id, value").eq("key", "typing").in("child_id", ids),
      ]).then(rs => rs.map(ok));
      return {
        assignments,
        members: members.map(m => ({
          joined_at: m.joined_at,
          child: kids.find(k => k.id === m.child_id) ?? { id: m.child_id, name: "?", avatar: "🙂" },
          typing: typing.filter(t => t.child_id === m.child_id),
          progress: progress.filter(p => p.child_id === m.child_id),
          state: { typing: state.find(x => x.child_id === m.child_id)?.value ?? {} },
        })),
      };
    },
    async removeMember(classId, childId) { ok(await sb.from("class_members").delete().eq("class_id", classId).eq("child_id", childId)); },
    async addAssignment(a) {
      const row = pick(a, ["class_id", "title", "kind", "target", "min_wpm", "due_on"]);
      return ok(await sb.from("assignments").insert(row).select().single());
    },
    async deleteAssignment(id) { ok(await sb.from("assignments").delete().eq("id", id)); },
    async joinClass(code, childId) { return ok(await sb.rpc("join_class", { code, cid: childId }))[0]; },
    async leaveClass(classId, childId) { ok(await sb.from("class_members").delete().eq("class_id", classId).eq("child_id", childId)); },
    // Classes the family's learners are in: [{ class_id, child_id, name }]. Empty until release-4.sql is run.
    async childClasses(childIds) {
      if (!childIds.length) return [];
      const r = await sb.from("class_members").select("class_id, child_id, classes(name)").in("child_id", childIds);
      return r.error ? [] : r.data.map(m => ({ class_id: m.class_id, child_id: m.child_id, name: m.classes?.name ?? "Class" }));
    },
    async assignmentsFor(childId) {
      const mine = await this.childClasses([childId]);
      if (!mine.length) return [];
      const rows = ok(await sb.from("assignments").select("*").in("class_id", mine.map(m => m.class_id)).order("created_at", { ascending: false }));
      return rows.map(a => ({ ...a, class_name: mine.find(m => m.class_id === a.class_id)?.name }));
    },

    async queueNotification({ child_id = null, title, body = "" }) {
      ok(await sb.from("notifications").insert({ child_id, kind: "milestone", title: title.slice(0, 200), body: body.slice(0, 2000) }));
    },
    async listNotifications() { return ok(await sb.from("notifications").select("*").order("created_at", { ascending: false }).limit(50)); },

    async getContent() {
      const [modules, cards, quiz] = await Promise.all([
        sb.from("modules").select("*").order("sort"),
        sb.from("cards").select("*").order("sort"),
        sb.from("quiz_questions").select("*").order("sort"),
      ]).then(rs => rs.map(ok));
      // Before an admin loads the starter content, show the built-in lessons so the site is never empty.
      if (!modules.length) return { ...structuredClone(SEED), fromSeed: true };
      return { modules, cards, quiz };
    },
    async saveModule(m) { const { id, title, tagline, emoji, color, activity, sort, published, levels, area = "science", coming_soon = false } = m; ok(await sb.from("modules").upsert({ id, title, tagline, emoji, color, activity, sort, published, levels, area, coming_soon, updated_at: new Date().toISOString() })); },
    async deleteModule(id) { ok(await sb.from("modules").delete().eq("id", id)); },
    async saveCard(c) { const { id, module_id, level, sort, data, published } = c; ok(await sb.from("cards").upsert({ id, module_id, level, sort, data, published, updated_at: new Date().toISOString() })); },
    async deleteCard(id) { ok(await sb.from("cards").delete().eq("id", id)); },
    async saveQuestion(q) { const { id, module_id, question, options, answer, explanation, sort } = q; ok(await sb.from("quiz_questions").upsert({ id, module_id, question, options, answer, explanation, sort, updated_at: new Date().toISOString() })); },
    async deleteQuestion(id) { ok(await sb.from("quiz_questions").delete().eq("id", id)); },
    async seedContent() {
      ok(await sb.from("modules").upsert(SEED.modules));
      ok(await sb.from("cards").upsert(SEED.cards));
      ok(await sb.from("quiz_questions").upsert(SEED.quiz));
    },
  };
}

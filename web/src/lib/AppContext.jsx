import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createApi } from "./api.js";
import { local } from "./storage.js";
import { setVoice, voiceOf } from "./voice.js";
import { setNeural, setPrivateNames } from "./neuralVoice.js";
import { SEED } from "../content/index.js";
import { findMilestones } from "./milestones.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const EMPTY_CHILD = { progress: [], attempts: [], state: {}, typing: [] };
const TICK = 5;          // seconds between screen-time ticks
const FLUSH = 60;        // save screen time at least this often
const IDLE_AFTER = 120;  // stop counting after 2 minutes without a tap or key
export const localDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function AppProvider({ children: kids }) {
  const [api, setApi] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(() => local.get("sparklab.activeChild", null));
  const [childData, setChildData] = useState(EMPTY_CHILD);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    let off = () => {};
    createApi().then(async a => {
      setApi(a);
      setUser(await a.getUser());
      off = a.onAuth(u => setUser(u));
    }).catch(e => setError(e.message));
    return () => off();
  }, []);

  const loadContent = useCallback(async () => {
    if (!api) return;
    try { setContent(await api.getContent()); } catch (e) { setError(e.message); }
  }, [api]);
  useEffect(() => { loadContent(); }, [loadContent]);

  const loadAccount = useCallback(async () => {
    if (!api || !user) { setProfile(null); setChildren([]); return; }
    try {
      const [p, list] = await Promise.all([api.getProfile(), api.listChildren()]);
      setProfile(p); setChildren(list);
      if (p?.role === "admin") loadContent();
    } catch (e) { setError(e.message); }
  }, [api, user, loadContent]);
  useEffect(() => { loadAccount(); }, [loadAccount]);

  // Natural voices need a signed-in Supabase account; names are never sent to the voice service.
  useEffect(() => { setNeural(api?.tts && user ? api.tts : null); }, [api, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setPrivateNames([...children.map(c => c.name), profile?.display_name, ...(profile?.display_name ?? "").split(/\s+/)]); }, [children, profile?.display_name]);

  const activeChild = children.find(c => c.id === activeId) ?? null;
  useEffect(() => { setVoice(voiceOf(activeChild)); }, [activeChild?.id, activeChild?.voice, activeChild?.gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadChild = useCallback(async () => {
    if (!api || !activeChild) { setChildData(EMPTY_CHILD); return; }
    try { setChildData(await api.loadChild(activeChild.id)); } catch (e) { setError(e.message); }
  }, [api, activeChild?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadChild(); }, [loadChild]);

  const chooseChild = id => { setActiveId(id); local.set("sparklab.activeChild", id); };

  // Subjects kids see: published ones, plus built-in subjects the database doesn't have yet.
  const published = useMemo(() => {
    if (!content) return null;
    const have = new Set(content.modules.map(m => m.id));
    const extra = SEED.modules.filter(m => !have.has(m.id));
    return {
      // A subject loaded into the database before it had an activity (e.g. "Inside a Computer" before Chip's path)
      // gets the built-in one, so new learning paths appear without a database update.
      modules: [...content.modules, ...extra].filter(m => m.published !== false)
        .map(m => ({ area: "science", ...m, activity: m.activity ?? SEED.modules.find(x => x.id === m.id)?.activity ?? null }))
        .sort((a, b) => a.sort - b.sort),
      cards: content.cards.filter(c => c.published !== false).sort((a, b) => a.level - b.level || a.sort - b.sort),
      quiz: content.quiz,
    };
  }, [content]);

  // ───────── Milestones → parent notifications ─────────
  const dataRef = useRef(childData);
  useEffect(() => { dataRef.current = childData; }, [childData]);
  const reportMilestones = useCallback((before, after) => {
    if (!api || !activeChild || !published) return;
    for (const m of findMilestones(before, after, published, activeChild)) {
      api.queueNotification({ child_id: activeChild.id, title: m.title, body: m.body }).catch(() => { /* emails are best-effort */ });
    }
  }, [api, activeChild, published]);

  // Progress writes update the screen first, then save in the background.
  const markDone = useCallback((moduleId, itemId) => {
    if (!activeChild) return;
    const before = dataRef.current;
    if (before.progress.some(p => p.item_id === itemId)) return;
    const after = { ...before, progress: [...before.progress, { item_id: itemId, module_id: moduleId, done_at: new Date().toISOString() }] };
    dataRef.current = after;
    setChildData(after);
    api.markDone(activeChild.id, moduleId, itemId).catch(e => setError(e.message));
    reportMilestones(before, after);
  }, [api, activeChild, reportMilestones]);

  const addAttempt = useCallback((moduleId, score, total) => {
    if (!activeChild) return;
    const before = dataRef.current;
    const after = { ...before, attempts: [{ id: String(Date.now()), module_id: moduleId, score, total, created_at: new Date().toISOString() }, ...before.attempts] };
    dataRef.current = after;
    setChildData(after);
    api.addAttempt(activeChild.id, moduleId, score, total).catch(e => setError(e.message));
    reportMilestones(before, after);
  }, [api, activeChild, reportMilestones]);

  // A finished typing lesson: shown straight away, saved in the background.
  const addTypingSession = useCallback(row => {
    if (!activeChild) return null;
    const entry = { ...row, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
    dataRef.current = { ...dataRef.current, typing: [entry, ...(dataRef.current.typing ?? [])] };
    setChildData(dataRef.current);
    api.addTypingSession(activeChild.id, row)
      .then(saved => { if (saved?.id) entry.savedId = saved.id; })
      .catch(e => setError(/typing_sessions/.test(e.message) ? "Typing results can't be saved yet: the database needs the release 3 upgrade (supabase/release-3.sql)." : e.message));
      return entry;
  }, [api, activeChild]);

  // `value` can be a function of the current value, for updates that build on each other (review answers).
  const setChildState = useCallback((key, valueOrFn) => {
    if (!activeChild) return;
    const before = dataRef.current;
    const value = typeof valueOrFn === "function" ? valueOrFn(before.state?.[key]) : valueOrFn;
    const after = { ...before, state: { ...before.state, [key]: value } };
    dataRef.current = after;
    setChildData(after);
    api.setState(activeChild.id, key, value).catch(e => setError(e.message));
    reportMilestones(before, after); // e.g. a speed-ladder or treasure-hunt badge
  }, [api, activeChild, reportMilestones]);

  // ───────── Screen time ─────────
  const [usage, setUsage] = useState({ day: localDay(), seconds: 0, bonus: 0 });
  const [kidActive, setKidActive] = useState(false); // true while a kid screen is open
  const pending = useRef(0);
  const lastInput = useRef(Date.now());
  const warned = useRef(false);

  useEffect(() => {
    if (!api || !activeChild) return;
    const day = localDay();
    warned.current = false;
    api.getUsage([activeChild.id], day).then(rows => {
      const r = rows.find(x => x.day === day);
      setUsage({ day, seconds: r?.seconds ?? 0, bonus: r?.bonus_seconds ?? 0 });
    }).catch(() => setUsage({ day, seconds: 0, bonus: 0 }));
  }, [api, activeChild?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const flush = useCallback(() => {
    if (!api || !activeChild || pending.current <= 0) return;
    const secs = pending.current; pending.current = 0;
    api.addUsage(activeChild.id, usage.day, secs).catch(() => { pending.current += secs; });
  }, [api, activeChild, usage.day]);

  useEffect(() => {
    const touch = () => { lastInput.current = Date.now(); };
    const events = ["pointerdown", "keydown", "wheel", "touchstart"];
    events.forEach(e => window.addEventListener(e, touch, { passive: true }));
    const onHide = () => { if (document.visibilityState === "hidden") flush(); };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => { events.forEach(e => window.removeEventListener(e, touch)); document.removeEventListener("visibilitychange", onHide); window.removeEventListener("pagehide", flush); };
  }, [flush]);

  useEffect(() => {
    if (!kidActive || !activeChild) return;
    const t = setInterval(() => {
      if (document.visibilityState !== "visible" || Date.now() - lastInput.current > IDLE_AFTER * 1000) return;
      const today = localDay();
      if (today !== usage.day) { flush(); setUsage({ day: today, seconds: 0, bonus: 0 }); warned.current = false; return; }
      pending.current += TICK;
      setUsage(u => ({ ...u, seconds: u.seconds + TICK }));
      if (pending.current >= FLUSH) flush();
    }, TICK * 1000);
    return () => { clearInterval(t); flush(); };
  }, [kidActive, activeChild, usage.day, flush]);

  const limitSec = activeChild?.daily_limit_min ? activeChild.daily_limit_min * 60 + usage.bonus : null;
  const remaining = limitSec == null ? null : Math.max(0, limitSec - usage.seconds);
  const timesUp = remaining === 0;
  useEffect(() => {
    if (remaining != null && remaining > 0 && remaining <= 300 && !warned.current) {
      warned.current = true;
      setNotice(`⏰ ${Math.ceil(remaining / 60)} minutes of learning left today. Time to finish up!`);
    }
  }, [remaining]);
  const grantExtra = useCallback(async minutes => {
    if (!activeChild) return;
    const secs = minutes * 60;
    setUsage(u => ({ ...u, bonus: u.bonus + secs }));
    warned.current = false;
    await api.addUsage(activeChild.id, usage.day, 0, secs).catch(e => setError(e.message));
  }, [api, activeChild, usage.day]);

  const signOut = useCallback(async () => {
    flush();
    try { sessionStorage.removeItem("sparklab.gate"); } catch { /* ignore */ }
    chooseChild(null);
    await api.signOut();
  }, [api, flush]);

  const value = {
    api, user, profile, children, activeChild, childData, content, published, error, notice,
    isAdmin: profile?.role === "admin",
    // A parent can open every level for a learner (Parent dashboard → Learners → Levels).
    unlockAll: childData.state?.settings?.unlockAll === true,
    clearError: () => setError(null), setError, clearNotice: () => setNotice(null), setNotice,
    chooseChild, loadAccount, loadContent, loadChild, markDone, addAttempt, addTypingSession, setChildState, setProfile,
    screen: { seconds: usage.seconds, limitSec, remaining, timesUp, grantExtra, setKidActive },
    signOut,
  };
  return <Ctx.Provider value={value}>{kids}</Ctx.Provider>;
}

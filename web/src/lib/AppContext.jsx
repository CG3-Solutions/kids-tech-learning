import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createApi } from "./api.js";
import { local } from "./storage.js";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const EMPTY_CHILD = { progress: [], attempts: [], state: {} };

export function AppProvider({ children: kids }) {
  const [api, setApi] = useState(null);
  const [user, setUser] = useState(undefined); // undefined = still loading
  const [profile, setProfile] = useState(null);
  const [children, setChildren] = useState([]);
  const [activeId, setActiveId] = useState(() => local.get("sparklab.activeChild", null));
  const [childData, setChildData] = useState(EMPTY_CHILD);
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

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
      // Admins may see unpublished content, so reload it once we know who is signed in.
      if (p?.role === "admin") loadContent();
    } catch (e) { setError(e.message); }
  }, [api, user, loadContent]);
  useEffect(() => { loadAccount(); }, [loadAccount]);

  const activeChild = children.find(c => c.id === activeId) ?? null;

  const loadChild = useCallback(async () => {
    if (!api || !activeChild) { setChildData(EMPTY_CHILD); return; }
    try { setChildData(await api.loadChild(activeChild.id)); } catch (e) { setError(e.message); }
  }, [api, activeChild?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { loadChild(); }, [loadChild]);

  const chooseChild = id => { setActiveId(id); local.set("sparklab.activeChild", id); };

  // Progress writes update the screen first, then save in the background.
  const markDone = useCallback((moduleId, itemId) => {
    if (!activeChild) return;
    setChildData(d => d.progress.some(p => p.item_id === itemId) ? d
      : { ...d, progress: [...d.progress, { item_id: itemId, module_id: moduleId, done_at: new Date().toISOString() }] });
    api.markDone(activeChild.id, moduleId, itemId).catch(e => setError(e.message));
  }, [api, activeChild]);

  const addAttempt = useCallback((moduleId, score, total) => {
    if (!activeChild) return;
    setChildData(d => ({ ...d, attempts: [{ id: String(Date.now()), module_id: moduleId, score, total, created_at: new Date().toISOString() }, ...d.attempts] }));
    api.addAttempt(activeChild.id, moduleId, score, total).catch(e => setError(e.message));
  }, [api, activeChild]);

  const setChildState = useCallback((key, value) => {
    if (!activeChild) return;
    setChildData(d => ({ ...d, state: { ...d.state, [key]: value } }));
    api.setState(activeChild.id, key, value).catch(e => setError(e.message));
  }, [api, activeChild]);

  const published = useMemo(() => {
    if (!content) return null;
    return {
      modules: content.modules.filter(m => m.published !== false).sort((a, b) => a.sort - b.sort),
      cards: content.cards.filter(c => c.published !== false).sort((a, b) => a.level - b.level || a.sort - b.sort),
      quiz: content.quiz,
    };
  }, [content]);

  const value = {
    api, user, profile, children, activeChild, childData, content, published, error,
    isAdmin: profile?.role === "admin",
    clearError: () => setError(null), setError,
    chooseChild, loadAccount, loadContent, loadChild, markDone, addAttempt, setChildState,
  };
  return <Ctx.Provider value={value}>{kids}</Ctx.Provider>;
}

import { useEffect, useState } from "react";
import { useApp, localDay } from "./AppContext.jsx";

export const daysBack = n => Array.from({ length: n }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - (n - 1 - i)); return localDay(d); });

// Loads every child's progress and the last `days` of screen time, for the parent pages.
export function useFamily(days = 7) {
  const { api, children, setError } = useApp();
  const [data, setData] = useState({});
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!api) return;
    if (!children.length) { setData({}); setUsage([]); setLoading(false); return; }
    setLoading(true);
    Promise.all([
      Promise.all(children.map(c => api.loadChild(c.id).then(d => [c.id, d]))),
      api.getUsage(children.map(c => c.id), daysBack(days)[0]),
    ]).then(([rows, u]) => { setData(Object.fromEntries(rows)); setUsage(u); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [api, children, days, setError]);
  const minutesOn = (childId, day) => Math.round((usage.find(u => u.child_id === childId && u.day === day)?.seconds ?? 0) / 60);
  return { data, usage, loading, minutesOn };
}

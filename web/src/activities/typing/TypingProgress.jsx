import { useMemo } from "react";
import TrendChart from "./TrendChart.jsx";
import { HeatKeyboard } from "./Keyboard.jsx";
import { LADDER, TYPING_JOURNEY, sessionTitle } from "../../content/typing.js";
import { MAX_HUMAN_WPM, mergeKeys, typingSummary, weakKeys } from "../../lib/typing.js";
import { useFamily } from "../../lib/useFamily.js";
import { useApp } from "../../lib/AppContext.jsx";

const when = iso => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const keyName = c => (/^[a-z]$/.test(c) ? c.toUpperCase() : c === " " ? "space" : c);

// Speed and accuracy over the last sessions typed on a real keyboard (oldest first).
export function trendPoints(sessions, n = 20) {
  return sessions.filter(s => s.input !== "touch" && s.wpm <= MAX_HUMAN_WPM && s.seconds > 0).slice(0, n).reverse()
    .map(s => ({ wpm: s.wpm, accuracy: s.accuracy, label: sessionTitle(s.lesson_id), when: when(s.created_at) }));
}

// Everyone in the family, fastest first (best speed, then speed-ladder rung).
export function leaderboard(children, data) {
  return children.map(c => {
    const d = data[c.id] ?? { typing: [], progress: [], state: {} };
    const sum = typingSummary(d.typing ?? []);
    const done = new Set((d.progress ?? []).map(p => p.item_id));
    return { child: c, best: sum.bestWpm, rung: d.state?.typing?.ladder ?? 0, lessons: TYPING_JOURNEY.filter(s => done.has(s.id)).length };
  }).filter(r => r.best > 0 || r.lessons > 0).sort((a, b) => b.best - a.best || b.rung - a.rung || b.lessons - a.lessons);
}

function Leaderboard({ me }) {
  const { children } = useApp();
  const { data, loading } = useFamily(1);
  const rows = useMemo(() => leaderboard(children, data), [children, data]);
  if (loading) return <p className="muted">Loading…</p>;
  if (rows.length < 2) return <p className="muted">When someone else in your family starts typing, you'll see who's fastest here. Grown-ups can add a profile for themselves too!</p>;
  return (
    <ol className="board">
      {rows.map((r, i) => (
        <li key={r.child.id} className={r.child.id === me ? "me" : ""}>
          <span className="board-n">{["🥇", "🥈", "🥉"][i] ?? i + 1}</span>
          <span className="board-who"><span aria-hidden="true">{r.child.avatar}</span> {r.child.name}{r.child.id === me ? " (you)" : ""}</span>
          <span className="board-v"><b>{r.best || "—"}</b> wpm</span>
          <span className="muted board-x">{r.rung ? `ladder ${LADDER[r.rung - 1]}` : ""}{r.rung && r.lessons ? " · " : ""}{r.lessons ? `${r.lessons} lessons` : ""}</span>
        </li>
      ))}
    </ol>
  );
}

// "My progress": smart practice, speed and accuracy over time, the keyboard heat map and the family board.
export default function TypingProgress({ sessions, me, mode, onSmart, canSmart }) {
  const points = useMemo(() => trendPoints(sessions), [sessions]);
  const recentKeys = useMemo(() => mergeKeys(sessions.slice(0, 20)), [sessions]);
  const weak = useMemo(() => weakKeys(recentKeys, 4), [recentKeys]);
  const sum = useMemo(() => typingSummary(sessions), [sessions]);
  if (!sessions.length) return <p className="lead">Type your first lesson, and your speed, accuracy and tricky keys will show up here.</p>;
  return (
    <div className="stack">
      <section className="smart-card">
        <div>
          <h3>🎯 Smart practice</h3>
          {weak.length && canSmart
            ? <p>Your tricky keys: {weak.map(w => <kbd key={w.key} className="kbd">{keyName(w.key)}</kbd>)}. A short lesson made just for you.</p>
            : <p className="muted">No tricky keys right now. Great typing!</p>}
        </div>
        {weak.length > 0 && canSmart && <button className="btn primary" onClick={() => onSmart(weak)}>Practise them →</button>}
      </section>

      <div className="trend-grid">
        <TrendChart title="Speed (words a minute)" points={points.map(p => ({ ...p, value: p.wpm }))} />
        <TrendChart title="Accuracy (%)" unit="%" min={50} max={100} points={points.map(p => ({ ...p, value: Math.max(50, p.accuracy) }))} goal={90} goalLabel="90% goal" />
      </div>

      <section className="stack" style={{ gap: 8 }}>
        <h3>⌨️ Your keyboard: where the mistakes are</h3>
        <HeatKeyboard keys={recentKeys} />
      </section>

      <section className="stack" style={{ gap: 8 }}>
        <h3>🏆 Family leaderboard</h3>
        <Leaderboard me={me} />
      </section>
      {mode === "pro" && <p className="muted small-note">Speeds come from real keyboards only; tapping on a screen isn't counted.</p>}
    </div>
  );
}

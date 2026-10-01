import { Link, useParams } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { useFamily, daysBack } from "../../lib/useFamily.js";
import { badgeState, moduleStats, starCount } from "../../lib/progress.js";
import { isUnlocked } from "../../components/journey/Journey.jsx";
import { JOURNEYS } from "../../content/journeys.js";
import { AREAS } from "../../content/areas.js";
import { timeline, fmtWhen } from "../../lib/activity.js";
import UsageChart from "./UsageChart.jsx";
import { typingSummary, fmtMinutes, mergeKeys } from "../../lib/typing.js";
import TrendChart from "../../activities/typing/TrendChart.jsx";
import { HeatKeyboard } from "../../activities/typing/Keyboard.jsx";
import { trendPoints } from "../../activities/typing/TypingProgress.jsx";
import { sessionTitle } from "../../content/typing.js";
const keyName = c => (c === ";" ? ";" : c.toUpperCase());

// Typing numbers for one child: speed, accuracy, keys to practise and recent lessons.
function TypingReport({ sessions }) {
  if (!sessions.length) return <p className="muted">No typing lessons yet. Open ⌨️ Typing from the child's home screen to start.</p>;
  const sum = typingSummary(sessions);
  return (
    <>
      <div className="kpis wide">
        <div className="kpi"><span>Best speed</span><b>{sum.bestWpm || "—"}</b><small>words a minute</small></div>
        <div className="kpi"><span>Accuracy</span><b>{sum.accuracy}%</b><small>last 5 lessons</small></div>
        <div className="kpi"><span>Typing time</span><b>{fmtMinutes(sum)}</b><small>{sum.sessions} lessons typed</small></div>
      </div>
      {sum.weak.length > 0 && (
        <p>Keys to practise: {sum.weak.map(w => <kbd key={w.key} className="kbd" title={`${Math.round(w.missRate * 100)}% missed`}>{keyName(w.key)}</kbd>)}
          <span className="muted"> (missed most often in the last 20 lessons)</span></p>
      )}
      <div className="trend-grid">
        <TrendChart title="Speed (words a minute)" points={trendPoints(sessions).map(p => ({ ...p, value: p.wpm }))} />
        <TrendChart title="Accuracy (%)" unit="%" min={50} max={100} goal={90} goalLabel="90% goal" points={trendPoints(sessions).map(p => ({ ...p, value: Math.max(50, p.accuracy) }))} />
      </div>
      <h3>Mistakes by key (last 20 sessions)</h3>
      <HeatKeyboard keys={mergeKeys(sessions.slice(0, 20))} />
      <div className="pc-table-wrap">
        <table className="pc-table">
          <thead><tr><th>When</th><th>Lesson</th><th>Mode</th><th>Speed</th><th>Accuracy</th><th>Result</th></tr></thead>
          <tbody>
            {sessions.slice(0, 8).map(t => (
              <tr key={t.id}>
                <td>{fmtWhen(t.created_at)}</td>
                <td>{sessionTitle(t.lesson_id)}</td>
                <td>{t.mode === "pro" ? "Pro" : "Kids"}{t.input === "touch" ? " · tapped" : ""}</td>
                <td>{t.wpm} wpm</td>
                <td>{t.accuracy}%</td>
                <td>{t.passed ? "✓ Passed" : "Try again"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const PATHS = Object.values(JOURNEYS);

export default function Reports() {
  const { childId } = useParams();
  const { children, published } = useApp();
  const { data, loading, minutesOn } = useFamily(7);
  const child = children.find(c => c.id === childId) ?? children[0];
  const d = child && data[child.id];
  if (!children.length) return <ParentLayout title="Progress reports"><p className="muted">Add a child first.</p></ParentLayout>;
  const week = child ? daysBack(7).reduce((s, day) => s + minutesOn(child.id, day), 0) : 0;
  const done = d ? new Set(d.progress.map(p => p.item_id)) : new Set();
  const avg = d?.attempts.length ? Math.round((d.attempts.reduce((s, a) => s + a.score / a.total, 0) / d.attempts.length) * 100) : null;
  return (
    <ParentLayout title="Progress reports">
      <div className="seg" role="tablist" aria-label="Child">
        {children.map(c => <Link key={c.id} role="tab" aria-selected={c.id === child.id} className={c.id === child.id ? "on" : ""} to={`/parent/reports/${c.id}`}>{c.avatar} {c.name}</Link>)}
      </div>
      {(!d || !published || loading) ? <p className="muted">Loading…</p> : (
        <>
          <div className="kpis wide">
            <div className="kpi"><span>This week</span><b>{week} min</b><small>learning time</small></div>
            <div className="kpi"><span>Stars</span><b>★ {starCount(d)}</b><small>all time</small></div>
            <div className="kpi"><span>Quiz average</span><b>{avg == null ? "—" : `${avg}%`}</b><small>{d.attempts.length} quizzes</small></div>
            <div className="kpi"><span>Badges</span><b>{badgeState(d, published.modules).filter(b => b.earned).length}</b><small>earned</small></div>
          </div>

          <section className="pc-card">
            <h2>Learning time, last 7 days</h2>
            <UsageChart childId={child.id} minutesOn={minutesOn} limit={child.daily_limit_min} />
          </section>

          <section className="pc-card">
            <h2>Subjects</h2>
            {AREAS.map(a => {
              const mods = published.modules.filter(m => m.area === a.id);
              return (
                <div key={a.id} className="subj-group">
                  <h3>{a.emoji} {a.title}</h3>
                  {mods.map(m => {
                    if (m.coming_soon) return <div key={m.id} className="modrow soon"><span className="n">{m.emoji} {m.title}</span><span className="muted">Coming soon</span><span /></div>;
                    const st = moduleStats(m, published.cards, d);
                    return (
                      <div key={m.id} className="modrow" style={{ "--c": `var(--${m.color})` }}>
                        <span className="n">{m.emoji} {m.title}</span>
                        <div className="bar"><i style={{ width: `${st.pct}%` }} /></div>
                        <span className="v">{st.done}/{st.total}{st.best ? ` · best quiz ${st.best.score}/${st.best.total}` : ""}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </section>

          <section className="pc-card">
            <h2>Adventures</h2>
            {PATHS.map(p => {
              const main = p.steps.filter(s => !s.bonus);
              const n = main.filter(s => done.has(s.id)).length;
              const next = p.steps.find((s, i) => !done.has(s.id) && isUnlocked(p.steps, i, done, child.grade ?? 0));
              return (
                <div key={p.name} className="path-row">
                  <b>{p.name}</b>
                  <span className="muted">{n} of {main.length} steps{next ? ` · next: ${next.emoji} ${next.title}` : " · all done ⭐"}</span>
                  <Link to={`/parent/guides/${p.guide}`}>Course guide</Link>
                </div>
              );
            })}
          </section>

          <section className="pc-card">
            <h2>Typing</h2>
            <TypingReport sessions={d.typing ?? []} />
          </section>

          <section className="pc-card">
            <h2>Activity</h2>
            {(() => {
              const feed = timeline([{ child, data: d }], published, 30);
              return feed.length
                ? <ul className="feed">{feed.map((r, i) => <li key={i}><span className="what">{r.text}</span><time>{fmtWhen(r.at)}</time></li>)}</ul>
                : <p className="muted">No activity yet.</p>;
            })()}
          </section>
        </>
      )}
    </ParentLayout>
  );
}

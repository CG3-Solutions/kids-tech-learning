import { Link } from "react-router-dom";
import { useApp } from "../../lib/AppContext.jsx";
import { moduleStats, nextSuggestion, badgeState } from "../../lib/progress.js";
import { AREAS } from "../../content/areas.js";
import { usePageTitle } from "../../lib/usePageTitle.js";
import { dueQuestions } from "../../activities/computer/Review.jsx";

// Shown while lessons load, so a page is never blank.
export function PageLoading() {
  return <div className="stack page"><p className="lead" role="status">⏳ Loading…</p></div>;
}

// "You are here", with a big Back button to the page above (easier for small hands than the trail).
export function Crumbs({ items }) {
  const up = items.filter(c => c.to).at(-1);
  return (
    <nav className="crumbs" aria-label="You are here">
      {up && <Link className="btn back-btn" to={up.to} aria-label={`Back to ${up.label}`}>← {up.label}</Link>}
      {items.map((c, i) => (
        <span key={i}>{i > 0 && <span className="sep" aria-hidden="true">›</span>}{c.to ? <Link to={c.to}>{c.label}</Link> : <b aria-current="page">{c.label}</b>}</span>
      ))}
    </nav>
  );
}

// Where to pick up: the subject of the most recent activity, else a suggestion.
// If the last thing done was an adventure step (ids like "circuit-step-3"), go straight back to the adventure.
function continueTarget(published, data, learner) {
  const last = [...data.progress].sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""))[0];
  const live = published.modules.filter(m => !m.coming_soon);
  const m = last && live.find(x => x.id === last.module_id);
  if (m && moduleStats(m, published.cards, data).pct < 100) return { module: m, label: "Continue", tab: m.activity && last.item_id?.startsWith(`${m.activity}-`) ? m.activity : null };
  const s = nextSuggestion(live, published.cards, data, learner);
  return s ? { module: s.module, label: last ? "Try next" : "Start here" } : null;
}

export default function Home() {
  const { activeChild, childData, published } = useApp();
  usePageTitle("Home");
  if (!published) return <PageLoading />;
  const target = continueTarget(published, childData, activeChild);
  const earned = badgeState(childData, published.modules).filter(b => b.earned);
  return (
    <div className="stack page">
      <div className="greet">
        <span className="face">{activeChild.avatar}</span>
        <div><h1>Hi {activeChild.name}!</h1><p className="lead">What shall we learn today?</p></div>
      </div>

      {(() => {
        const due = dueQuestions(childData.state?.review ?? {}).length;
        const comp = published.modules.find(m => m.activity === "computer" && !m.coming_soon);
        return due > 0 && comp ? (
          <Link className="review-banner due" to={`/learn/${comp.id}/computer`}>
            <span className="em" aria-hidden="true">🔁</span>
            <div><b>Review time with Chip!</b><p>{due} question{due > 1 ? "s" : ""} to try again.</p></div>
            <span className="btn primary">Start</span>
          </Link>
        ) : null;
      })()}

      {target && (
        <Link className="continue" to={`/learn/${target.module.id}${target.tab ? `/${target.tab}` : ""}`} style={{ "--c": `var(--${target.module.color})` }}>
          <span className="em" aria-hidden="true">{target.module.emoji}</span>
          <span className="txt"><span className="eyebrow">{target.label}</span><b>{target.module.title}</b>
            <span className="bar"><i style={{ width: `${moduleStats(target.module, published.cards, childData).pct}%` }} /></span></span>
          <span className="go" aria-hidden="true">▶</span>
        </Link>
      )}

      <section className="stack" style={{ gap: 12 }}>
        <h2 className="sec">Choose an area</h2>
        <div className="areas">
          {AREAS.map(a => {
            const mods = published.modules.filter(m => m.area === a.id);
            const live = mods.filter(m => !m.coming_soon);
            const done = live.reduce((s, m) => s + moduleStats(m, published.cards, childData).done, 0);
            const total = live.reduce((s, m) => s + moduleStats(m, published.cards, childData).total, 0);
            return (
              <Link key={a.id} className="area-card" to={`/learn/area/${a.id}`} style={{ "--c": `var(--${a.color})` }}>
                <span className="em" aria-hidden="true">{a.emoji}</span>
                <h3>{a.title}</h3>
                <p>{a.tagline}</p>
                <span className="meta">{live.length ? `${live.length} ${live.length === 1 ? "subject" : "subjects"} · ${total ? Math.round((done / total) * 100) : 0}% done` : "Coming soon"}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack" style={{ gap: 10 }}>
        <div className="row"><h2 className="sec">My badges</h2><span className="spacer" /><Link className="btn ghost" to="/learn/badges">See all</Link></div>
        {earned.length
          ? <div className="badge-strip">{earned.map(b => <span key={b.id} className="badge-chip" title={b.name}>{b.emoji} {b.name}</span>)}</div>
          : <p className="muted">Finish your first step to earn a badge!</p>}
      </section>
    </div>
  );
}

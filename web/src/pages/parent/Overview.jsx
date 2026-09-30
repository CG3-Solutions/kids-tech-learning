import { Link } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp, localDay } from "../../lib/AppContext.jsx";
import { useFamily } from "../../lib/useFamily.js";
import { badgeState, nextSuggestion, starCount } from "../../lib/progress.js";
import { timeline, fmtWhen } from "../../lib/activity.js";
import { ordinal } from "../Profiles.jsx";

export default function Overview() {
  const { children, published, profile } = useApp();
  const { data, loading, minutesOn } = useFamily(7);
  const today = localDay();
  const ready = published && !loading;
  const feed = ready ? timeline(children.filter(c => data[c.id]).map(c => ({ child: c, data: data[c.id] })), published, 12) : [];
  return (
    <ParentLayout title={`Hello${profile?.display_name ? `, ${profile.display_name}` : ""}`}>
      {!children.length && (
        <div className="empty">
          <h2>Add your first child</h2>
          <p className="muted">Children get a first name and an animal avatar. No email needed.</p>
          <Link className="btn primary" to="/parent/children">Add a child</Link>
        </div>
      )}
      <div className="kid-cards">
        {ready && children.map(c => {
          const d = data[c.id]; if (!d) return null;
          const mins = minutesOn(c.id, today);
          const limit = c.daily_limit_min;
          const sugg = nextSuggestion(published.modules.filter(m => !m.coming_soon), published.cards, d);
          const badges = badgeState(d, published.modules).filter(b => b.earned).length;
          return (
            <section key={c.id} className="pc-card">
              <div className="pc-card-hd">
                <span className="face">{c.avatar}</span>
                <div><h2>{c.name}</h2><span className="muted">{c.grade ? `${ordinal(c.grade)} standard` : "Class not set"}</span></div>
                <span className="spacer" />
                <Link className="btn ghost" to={`/parent/reports/${c.id}`}>Full report →</Link>
              </div>
              <div className="kpis">
                <div className="kpi"><span>Today</span><b>{mins} min</b><small>{limit ? `of ${limit} min limit` : "no limit set"}</small>
                  {limit && <div className="meter"><i style={{ width: `${Math.min(100, (mins / limit) * 100)}%` }} className={mins >= limit ? "full" : ""} /></div>}</div>
                <div className="kpi"><span>Stars</span><b>★ {starCount(d)}</b><small>all time</small></div>
                <div className="kpi"><span>Badges</span><b>{badges}</b><small>earned</small></div>
              </div>
              {sugg && <div className="suggest"><div className="eyebrow">Teach next</div><b>{sugg.module.emoji} {sugg.module.title}{sugg.card ? `: ${sugg.card.data.n}` : ""}</b></div>}
            </section>
          );
        })}
      </div>
      {ready && children.length > 0 && (
        <section className="pc-card">
          <h2>Recent activity</h2>
          {feed.length ? (
            <ul className="feed">{feed.map((r, i) => <li key={i}><span className="feed-who">{r.child.avatar} {r.child.name}</span><span className="what">{r.text}</span><time>{fmtWhen(r.at)}</time></li>)}</ul>
          ) : <p className="muted">Nothing yet. Activity appears here as soon as your child starts learning.</p>}
        </section>
      )}
    </ParentLayout>
  );
}

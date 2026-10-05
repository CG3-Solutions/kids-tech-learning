import { Link, useNavigate } from "react-router-dom";
import { lockGate } from "../../components/ParentGate.jsx";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp, localDay } from "../../lib/AppContext.jsx";
import { useFamily } from "../../lib/useFamily.js";
import { badgeState, nextSuggestion, starCount, dayStreak } from "../../lib/progress.js";
import { Avatar, Guide } from "../../components/Character.jsx";
import { Star } from "../../components/TopBar.jsx";
import Icon from "../../components/Icon.jsx";
import { timeline, fmtWhen } from "../../lib/activity.js";
import { ordinal } from "../Profiles.jsx";

export default function Overview() {
  const { children, published, profile } = useApp();
  const nav = useNavigate();
  const { data, usage, loading, minutesOn } = useFamily(7);
  const today = localDay();
  const ready = published && !loading;
  const feed = ready ? timeline(children.filter(c => data[c.id]).map(c => ({ child: c, data: data[c.id] })), published, 12) : [];
  const weekMin = Math.round(usage.reduce((s, u) => s + (u.seconds ?? 0), 0) / 60);
  const best = ready ? children.filter(c => data[c.id]).map(c => ({ c, n: dayStreak(data[c.id]) })).sort((a, b) => b.n - a.n)[0] : null;
  const fmtMin = m => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
  return (
    <ParentLayout title={`Hello${profile?.display_name ? `, ${profile.display_name}` : ""}`}>
      {ready && children.length > 0 && (
        <section className="week-sum" aria-label="This week">
          <Guide id="polly" size={130} className="week-guide" />
          <div>
            <h2>{weekMin ? `Your family learned for ${fmtMin(weekMin)} this week` : "A fresh week of learning starts here"}</h2>
            <p>{best?.n > 1 ? `${best.c.name} is on a ${best.n}-day streak. ` : ""}{weekMin ? "Great work, everyone!" : "Start learner mode and hand the device over to begin."}</p>
          </div>
        </section>
      )}
      {children.length > 0 && (
        <div className="kids-mode-card">
          <div><b>Handing the device to a child?</b><p className="muted">Learner mode shows only lessons and games. Getting back here needs your password.</p></div>
          <button className="btn play" onClick={() => { lockGate(); nav("/profiles"); }}><Icon name="play" size={18} stroke={0} fill="currentColor" /> Start learner mode</button>
        </div>
      )}
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
          const sugg = nextSuggestion(published.modules.filter(m => !m.coming_soon), published.cards, d, c);
          const badges = badgeState(d, published.modules).filter(b => b.earned).length;
          return (
            <section key={c.id} className="pc-card">
              <div className="pc-card-hd">
                <Avatar value={c.avatar} size="md" />
                <div><h2>{c.name}</h2><span className="muted">{c.grade ? `${ordinal(c.grade)} standard` : "Class not set"}</span></div>
                <span className="spacer" />
                <Link className="btn ghost" to={`/parent/reports/${c.id}`}>Full report →</Link>
              </div>
              <div className="kpis">
                <div className="kpi"><span>Today</span><b>{mins} min</b><small>{limit ? `of ${limit} min limit` : "no limit set"}</small>
                  {limit && <div className="meter"><i style={{ width: `${Math.min(100, (mins / limit) * 100)}%` }} className={mins >= limit ? "full" : ""} /></div>}</div>
                <div className="kpi"><span>Stars</span><b className="kpi-ic"><Star /> {starCount(d)}</b><small>all time</small></div>
                <div className="kpi"><span>Badges</span><b>{badges}</b><small>earned</small></div>
              </div>
              {sugg && <div className="suggest"><div className="eyebrow">Teach next</div><b>{sugg.module.emoji} {sugg.module.title}{sugg.concept ? `: ${sugg.concept.title}` : sugg.card ? `: ${sugg.card.data.n}` : ""}</b>
                {sugg.weak && <p className="muted small-note">Needs practice: missed check questions. {sugg.concept.parent}</p>}</div>}
            </section>
          );
        })}
      </div>
      {ready && children.length > 0 && (
        <section className="pc-card">
          <h2>Recent activity</h2>
          {feed.length ? (
            <ul className="feed">{feed.map((r, i) => <li key={i}><span className="feed-who"><Avatar value={r.child.avatar} size="xs" /> {r.child.name}</span><span className="what">{r.text}</span><time>{fmtWhen(r.at)}</time></li>)}</ul>
          ) : <p className="muted">Nothing yet. Activity appears here as soon as your child starts learning.</p>}
        </section>
      )}
    </ParentLayout>
  );
}

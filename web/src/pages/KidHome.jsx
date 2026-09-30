import { Link } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { badgeState, moduleStats } from "../lib/progress.js";

export default function KidHome() {
  const { activeChild, childData, published } = useApp();
  if (!published) return <TopBar />;
  const badges = badgeState(childData, published.modules);
  const earned = badges.filter(b => b.earned).length;
  return (
    <>
      <TopBar />
      <main className="wrap stack">
        <div className="greet">
          <span className="face">{activeChild.avatar}</span>
          <div><h1>Hi {activeChild.name}!</h1><p className="lead">What shall we explore today?</p></div>
        </div>
        <div className="modules">
          {published.modules.map(m => {
            const st = moduleStats(m, published.cards, childData);
            return (
              <Link key={m.id} className="module" to={`/learn/${m.id}`} style={{ "--c": `var(--${m.color})` }}>
                <div className="top"><span className="em" aria-hidden="true">{m.emoji}</span><div><h3>{m.title}</h3><p>{m.tagline}</p></div></div>
                <div className="bar" aria-label={`${st.pct}% done`}><i style={{ width: `${st.pct}%` }} /></div>
                <div className="row muted" style={{ fontSize: ".9rem" }}><span>{st.done} of {st.total} done</span><span className="spacer" />{st.best && <span>Best quiz: {st.best.score}/{st.best.total}</span>}</div>
              </Link>
            );
          })}
        </div>
        <section className="stack" style={{ gap: 12 }}>
          <div className="row"><h2 className="sec">My badges</h2><span className="muted">{earned} of {badges.length}</span></div>
          <div className="badges">
            {badges.map(b => (
              <div key={b.id} className={`badge ${b.earned ? "earned" : "locked"}`} title={b.how}>
                <span className="em" aria-hidden="true">{b.emoji}</span><b>{b.name}</b><small>{b.how}</small>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

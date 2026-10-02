import { useApp } from "../../lib/AppContext.jsx";
import { badgeState, starCount } from "../../lib/progress.js";
import { Crumbs, PageLoading } from "./Home.jsx";
import { usePageTitle } from "../../lib/usePageTitle.js";

export default function Badges() {
  const { childData, published } = useApp();
  usePageTitle("My badges");
  if (!published) return <PageLoading />;
  const badges = badgeState(childData, published.modules);
  const earned = badges.filter(b => b.earned).length;
  return (
    <div className="stack page">
      <Crumbs items={[{ to: "/learn", label: "Home" }, { label: "My badges" }]} />
      <div className="row"><h1 className="sec" style={{ fontSize: "2rem" }}>My badges</h1><span className="spacer" /><span className="pill">★ {starCount(childData)} stars · {earned} of {badges.length} badges</span></div>
      <div className="badges">
        {badges.map(b => (
          <div key={b.id} className={`badge ${b.earned ? "earned" : "locked"}`}>
            <span className="em" aria-hidden="true">{b.emoji}</span><b>{b.name}</b><small>{b.how}</small>
            {b.earned && <span className="got">Earned!</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

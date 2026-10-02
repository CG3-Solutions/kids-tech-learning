import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../../lib/AppContext.jsx";
import { moduleStats } from "../../lib/progress.js";
import { AREAS } from "../../content/areas.js";
import { Crumbs, PageLoading, BigScreenOnly } from "./Home.jsx";
import { useSmallScreen, BIG_SCREEN_AREAS } from "../../lib/useSmallScreen.js";
import { usePageTitle } from "../../lib/usePageTitle.js";

export default function Area() {
  const { areaId } = useParams();
  const { childData, published } = useApp();
  const area = AREAS.find(a => a.id === areaId);
  usePageTitle(area?.title);
  const small = useSmallScreen();
  if (!area) return <Navigate to="/learn" replace />;
  if (small && BIG_SCREEN_AREAS.has(area.id)) return <BigScreenOnly title={area.title} />;
  if (!published) return <PageLoading />;
  const mods = published.modules.filter(m => m.area === area.id);
  return (
    <div className="stack page">
      <Crumbs items={[{ to: "/learn", label: "Home" }, { label: area.title }]} />
      <div className="area-head" style={{ "--c": `var(--${area.color})` }}>
        <span className="em" aria-hidden="true">{area.emoji}</span>
        <div><h1>{area.title}</h1><p className="lead">{area.tagline}</p></div>
      </div>
      <div className="modules">
        {mods.map(m => {
          if (m.coming_soon) {
            return (
              <div key={m.id} className="module soon" style={{ "--c": `var(--${m.color})` }} aria-disabled="true">
                <span className="ribbon">Coming soon</span>
                <div className="top"><span className="em" aria-hidden="true">{m.emoji}</span><div><h3>{m.title}</h3><p>{m.tagline}</p></div></div>
              </div>
            );
          }
          const st = moduleStats(m, published.cards, childData);
          return (
            <Link key={m.id} className="module" to={`/learn/${m.id}`} style={{ "--c": `var(--${m.color})` }}>
              <div className="top"><span className="em" aria-hidden="true">{m.emoji}</span><div><h3>{m.title}</h3><p>{m.tagline}</p></div></div>
              <div className="bar" aria-label={`${st.pct}% done`}><i style={{ width: `${st.pct}%` }} /></div>
              <div className="row muted" style={{ fontSize: ".9rem" }}><span>{st.done} of {st.total} done</span><span className="spacer" />{st.pct === 100 && <b>🏆 Finished</b>}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

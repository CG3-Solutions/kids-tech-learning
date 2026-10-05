import { Link, Navigate, useParams } from "react-router-dom";
import { useApp } from "../../lib/AppContext.jsx";
import { moduleStats } from "../../lib/progress.js";
import { AREAS, areaStyle } from "../../content/areas.js";
import { Guide, guideForModule } from "../../components/Character.jsx";
import Icon from "../../components/Icon.jsx";
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
    <div className="stack page" style={areaStyle(area.id)}>
      <Crumbs items={[{ to: "/learn", label: "Home" }, { label: area.title }]} />
      <div className="area-head">
        <Guide id={area.guide} size={130} className="area-guide" />
        <div><h1>{area.title}</h1><p>{area.tagline}, {area.with}.</p></div>
      </div>
      <div className="modules">
        {mods.map(m => {
          if (m.coming_soon) {
            return (
              <div key={m.id} className="module soon" aria-disabled="true">
                <span className="ribbon">Coming soon</span>
                <div className="top"><Guide id={guideForModule(m)} size={72} /><div><h3>{m.title}</h3><p>{m.tagline}</p></div></div>
              </div>
            );
          }
          const st = moduleStats(m, published.cards, childData);
          return (
            <Link key={m.id} className="module" to={`/learn/${m.id}`}>
              <div className="top"><Guide id={guideForModule(m)} size={72} /><div><h3>{m.title}</h3><p>{m.tagline}</p></div></div>
              <div className="mod-foot">
                <span className="bar-track" role="img" aria-label={`${st.pct}% done`}><i style={{ width: `${st.pct}%` }} /></span>
                <span className="mod-count">{st.pct === 100 ? <><Icon name="trophy" size={18} /> Finished</> : `${st.done} of ${st.total}`}</span>
                <span className="mod-go" aria-hidden="true"><Icon name="play" size={20} stroke={0} fill="currentColor" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

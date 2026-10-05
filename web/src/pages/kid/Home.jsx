import { Link } from "react-router-dom";
import { useApp } from "../../lib/AppContext.jsx";
import { moduleStats, nextSuggestion, badgeState } from "../../lib/progress.js";
import { todaysQuest } from "../../lib/quest.js";
import { AREAS, areaStyle } from "../../content/areas.js";
import { Guide, guideForModule } from "../../components/Character.jsx";
import Icon from "../../components/Icon.jsx";
import { usePageTitle } from "../../lib/usePageTitle.js";
import { useSmallScreen, BIG_SCREEN_AREAS } from "../../lib/useSmallScreen.js";
import { dueQuestions } from "../../activities/computer/Review.jsx";

// Shown instead of a subject that needs a bigger screen (typing on a phone).
export function BigScreenOnly({ title }) {
  return (
    <div className="stack page">
      <Crumbs items={[{ to: "/learn", label: "Home" }, { label: title }]} />
      <div className="panel oops">
        <div className="em" aria-hidden="true">💻</div>
        <h2>{title} needs a bigger screen</h2>
        <p className="lead">Open Spark Lab on a computer or a tablet with a keyboard to use {title}.</p>
        <Link className="btn primary big" to="/learn">🏠 Go home</Link>
      </div>
    </div>
  );
}

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
function continueTarget(published, data, learner, small) {
  const last = [...data.progress].sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""))[0];
  const live = published.modules.filter(m => !m.coming_soon && !(small && BIG_SCREEN_AREAS.has(m.area)));
  const m = last && live.find(x => x.id === last.module_id);
  if (m && moduleStats(m, published.cards, data).pct < 100) return { module: m, label: "Continue", tab: m.activity && last.item_id?.startsWith(`${m.activity}-`) ? m.activity : null };
  const s = nextSuggestion(live, published.cards, data, learner);
  return s ? { module: s.module, label: last ? "Try next" : "Start here" } : null;
}

// What the guide says on the big "continue" card.
const hello = (label, title) => label === "Continue" ? `Let's keep going with ${title}!` : label === "Start here" ? `Let's start with ${title}!` : `Ready for ${title}?`;

export default function Home() {
  const { activeChild, childData, published } = useApp();
  usePageTitle("Home");
  const small = useSmallScreen();
  if (!published) return <PageLoading />;
  const target = continueTarget(published, childData, activeChild, small);
  const earned = badgeState(childData, published.modules).filter(b => b.earned);
  const live = published.modules.filter(m => !m.coming_soon && !(small && BIG_SCREEN_AREAS.has(m.area)));
  const due = dueQuestions(childData.state?.review ?? {}).length;
  const quest = todaysQuest({ modules: live, cards: published.cards, child: childData, learner: activeChild, first: target?.module, due });
  const questDone = quest.length > 0 && quest.every(q => q.done);
  const pct = target ? moduleStats(target.module, published.cards, childData).pct : 0;
  return (
    <div className="stack page home">
      <h1 className="sr-only">Home</h1>
      <div className="home-top">
        {target ? (
          <Link className="hero-go" to={`/learn/${target.module.id}${target.tab ? `/${target.tab}` : ""}`} style={areaStyle(target.module.area)}>
            <Guide id={guideForModule(target.module)} size={200} className="hero-guide" />
            <span className="hero-txt">
              <span className="bubble">{hello(target.label, target.module.title)}</span>
              <span className="eyebrow">{target.label}</span>
              <b className="hero-title">{target.module.title}</b>
              <span className="hero-bar" role="img" aria-label={`${pct}% done`}><i style={{ width: `${pct}%` }} /></span>
            </span>
            <span className="hero-play" aria-hidden="true"><Icon name="play" size={40} stroke={0} fill="currentColor" /><span>Play</span></span>
          </Link>
        ) : (
          <div className="hero-go done" style={areaStyle("maths")}>
            <Guide id="ollie" size={200} className="hero-guide" />
            <span className="hero-txt"><span className="bubble">You've finished everything. Amazing!</span><b className="hero-title">Pick any subject to practise</b></span>
          </div>
        )}

        <section className={`quest${questDone ? " all" : ""}`} aria-labelledby="quest-h">
          <h2 id="quest-h">Today's quest</h2>
          <ol>
            {quest.map(q => (
              <li key={q.module.id} className={q.done ? "done" : ""}>
                <Link to={`/learn/${q.module.id}${q.review ? "/computer" : ""}`} style={areaStyle(q.module.area)}>
                  <span className="tick" aria-hidden="true">{q.done && <Icon name="check" size={22} stroke={3.4} />}</span>
                  <span className="q-txt">{q.review ? `Review with Chip: ${q.review} question${q.review > 1 ? "s" : ""}` : q.module.title}</span>
                  <span className="sr-only">{q.done ? "(done today)" : ""}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="quest-note">{questDone ? "Quest complete! You're a star." : `Finish all ${quest.length} to complete today's quest!`}</p>
        </section>
      </div>

      <section className="stack" style={{ gap: 14 }} aria-labelledby="explore-h">
        <h2 id="explore-h" className="sec">Explore</h2>
        <div className="worlds">
          {AREAS.map(a => {
            const bigOnly = small && BIG_SCREEN_AREAS.has(a.id); // shown, but marked: it opens a "needs a bigger screen" page
            const mods = published.modules.filter(m => m.area === a.id && !m.coming_soon);
            const done = mods.reduce((s, m) => s + moduleStats(m, published.cards, childData).done, 0);
            const total = mods.reduce((s, m) => s + moduleStats(m, published.cards, childData).total, 0);
            const p = total ? Math.round((done / total) * 100) : 0;
            return (
              <Link key={a.id} className={`world${bigOnly ? " big-only" : ""}`} to={`/learn/area/${a.id}`} style={areaStyle(a.id)}>
                <Guide id={a.guide} size={120} className="world-guide" />
                <h3>{a.title}</h3>
                <span className="world-with">{a.with}</span>
                {bigOnly ? <span className="world-note">Needs a bigger screen</span>
                  : <span className="world-bar" role="img" aria-label={`${p}% done`}><i style={{ width: `${p}%` }} /></span>}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="stack" style={{ gap: 10 }}>
        <div className="row"><h2 className="sec">My trophies</h2><span className="spacer" /><Link className="btn" to="/learn/badges">See all</Link></div>
        {earned.length
          ? <div className="badge-strip">{earned.map(b => <span key={b.id} className="badge-chip" title={b.name}>{b.emoji} {b.name}</span>)}</div>
          : <p className="muted">Finish your first step to win a trophy!</p>}
      </section>
    </div>
  );
}

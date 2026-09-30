import { useCallback, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import CardDetail from "../components/CardDetail.jsx";
import Quiz from "../components/Quiz.jsx";
import Circuit from "../activities/Circuit.jsx";
import BinaryCards from "../activities/BinaryCards.jsx";
import CodingPuzzles from "../activities/CodingPuzzles.jsx";
import Hunt from "../activities/Hunt.jsx";
import Machines from "../activities/Machines.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { ACTIVITIES, EXTRA_ACTIVITIES } from "../content/index.js";
import { hush } from "../lib/speech.js";

const LV_COLORS = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];
const TAB_NAMES = { ...Object.fromEntries(Object.entries(ACTIVITIES).map(([k, v]) => [k, `${v.emoji} ${v.title}`])), machines: "🏭 Machines" };

export default function ModulePage() {
  const { moduleId, tab = "cards" } = useParams();
  const { published, childData, markDone, addAttempt, setChildState } = useApp();
  const [openId, setOpenId] = useState(null);
  const [levelFilter, setLevelFilter] = useState("all");

  const m = published?.modules.find(x => x.id === moduleId);
  const cards = useMemo(() => published?.cards.filter(c => c.module_id === moduleId) ?? [], [published, moduleId]);
  const quiz = useMemo(() => published?.quiz.filter(q => q.module_id === moduleId) ?? [], [published, moduleId]);
  const done = useMemo(() => new Set(childData.progress.map(p => p.item_id)), [childData]);
  const onFirstCircuit = useCallback(() => markDone(moduleId, "activity-circuit"), [markDone, moduleId]);

  if (!published) return <TopBar />;
  if (!m) return <Navigate to="/learn" replace />;

  const levels = (m.levels?.length ? m.levels : [...new Set(cards.map(c => c.level))].map(id => ({ id, name: `Level ${id}`, note: "" })))
    .filter(l => cards.some(c => c.level === l.id));
  const color = lv => LV_COLORS[lv % LV_COLORS.length];
  const tabs = ["cards", ...(m.activity ? [m.activity] : []), ...(EXTRA_ACTIVITIES[m.id] ?? []), ...(quiz.length ? ["quiz"] : [])];
  const open = cards.find(c => c.id === openId);
  const openIdx = open ? cards.indexOf(open) : -1;
  const levelOf = lv => levels.find(l => l.id === lv)?.name ?? `Level ${lv}`;

  return (
    <>
      <TopBar />
      <main className="wrap stack">
        <div className="mod-head">
          <Link className="btn ghost" to="/learn" aria-label="All subjects">←</Link>
          <span className="em" aria-hidden="true">{m.emoji}</span>
          <div><h1>{m.title}</h1><p className="muted">{m.tagline}</p></div>
        </div>
        <nav className="tabs" aria-label="Sections">
          {tabs.map(t => (
            <Link key={t} to={`/learn/${m.id}${t === "cards" ? "" : `/${t}`}`} className={t === tab ? "active" : ""} onClick={hush}>
              {t === "cards" ? "📚 Cards" : t === "quiz" ? "❓ Quiz" : TAB_NAMES[t]}
            </Link>
          ))}
        </nav>

        {tab === "cards" && (
          <div className="stack">
            <p className="lead">{m.id === "electricity" ? "Electricity is like water flowing through pipes. " : ""}Tap a card to learn it. Finish a card to earn a star ★</p>
            {levels.length > 1 && (
              <div className="chips">
                <button className="chip" aria-pressed={levelFilter === "all"} onClick={() => setLevelFilter("all")}>All</button>
                {levels.map(l => <button key={l.id} className="chip" style={{ "--c": color(l.id) }} aria-pressed={levelFilter === l.id} onClick={() => setLevelFilter(l.id)}>{l.name.split(":")[0]}</button>)}
              </div>
            )}
            {levels.filter(l => levelFilter === "all" || l.id === levelFilter).map(l => (
              <div key={l.id} className="stack" style={{ gap: 12 }}>
                <div className="lvl-h"><h3>{l.name}</h3><span>{l.note}</span></div>
                <div className="grid">
                  {cards.filter(c => c.level === l.id).map(c => (
                    <button key={c.id} className={`tile${done.has(c.id) ? " done" : ""}`} style={{ "--c": color(l.id) }} onClick={() => setOpenId(c.id)} aria-label={`${c.data.n}${done.has(c.id) ? ", learned" : ""}`}>
                      <span className="dot" aria-hidden="true">{done.has(c.id) ? "★" : ""}</span>
                      <span className="pic" aria-hidden="true">{c.data.e}</span><span className="nm">{c.data.n}</span><span className="sh">{c.data.sh}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!cards.length && <p className="lead">No cards here yet.</p>}
          </div>
        )}

        {tab === "circuit" && <Circuit onFirstSuccess={onFirstCircuit} />}
        {tab === "binary" && (
          <BinaryCards wins={childData.state.binaryWins ?? 0} onWin={n => { setChildState("binaryWins", n); if (n >= 5) markDone(m.id, "activity-binary"); }} />
        )}
        {tab === "coding" && <CodingPuzzles solved={done} onSolve={id => markDone(m.id, `puzzle-${id}`)} />}
        {tab === "hunt" && <Hunt marks={childData.state.hunt ?? {}} onChange={v => setChildState("hunt", v)} />}
        {tab === "machines" && <Machines />}
        {tab === "quiz" && <Quiz questions={quiz} onFinish={(score, total) => addAttempt(m.id, score, total)} />}
      </main>

      {open && (
        <CardDetail card={open} levelName={levelOf(open.level)} color={color(open.level)}
          learned={done.has(open.id)} onLearned={() => markDone(m.id, open.id)}
          prev={cards[openIdx - 1]} next={cards[openIdx + 1]} onGo={id => { hush(); setOpenId(id); }}
          onClose={() => { hush(); setOpenId(null); }} />
      )}
    </>
  );
}

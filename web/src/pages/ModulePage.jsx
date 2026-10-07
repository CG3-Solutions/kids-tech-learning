import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import { Crumbs, PageLoading, BigScreenOnly } from "./kid/Home.jsx";
import { useSmallScreen, BIG_SCREEN_AREAS } from "../lib/useSmallScreen.js";
import { usePageTitle } from "../lib/usePageTitle.js";
import { useUrlState, viewKey } from "../lib/useUrlState.js";
import { areaOf, areaStyle } from "../content/areas.js";
import { Guide, guideForModule } from "../components/Character.jsx";
import CardDetail from "../components/CardDetail.jsx";
import CardLesson from "../components/cards/CardLesson.jsx";
import PartArt, { hasArt } from "../components/cards/PartArt.jsx";
import { CARD_LESSONS } from "../content/cardLessons.js";
import Quiz from "../components/Quiz.jsx";
import CircuitJourney from "../activities/circuits/CircuitJourney.jsx";
import PracticeJourney, { PRACTICE_ACTIVITIES } from "../components/practice/PracticeJourney.jsx";
import BinaryJourney from "../activities/binary/BinaryJourney.jsx";
import TypingCourse from "../activities/typing/TypingCourse.jsx";
import LabTab from "../components/lab/LabTab.jsx";
import ComputerJourney from "../activities/computer/ComputerJourney.jsx";
import { ChipQuiz } from "../activities/computer/Review.jsx";
import CodingPuzzles from "../activities/CodingPuzzles.jsx";
import Hunt from "../activities/Hunt.jsx";
import Machines from "../activities/Machines.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { ACTIVITIES, EXTRA_ACTIVITIES, GLOSSARY_MODULES } from "../content/index.js";
import { hush } from "../lib/speech.js";
import { local } from "../lib/storage.js";
import { menuItems, startedSubject } from "../lib/subjectMenu.js";
import SubjectMenu from "../components/SubjectMenu.jsx";
import Icon from "../components/Icon.jsx";

const LV_COLORS = ["var(--lv0)", "var(--lv1)", "var(--lv2)", "var(--lv3)", "var(--lv4)"];

export default function ModulePage() {
  const { moduleId, tab: tabParam } = useParams();
  const location = useLocation();
  const { published, activeChild, childData, markDone, addAttempt, setChildState } = useApp();
  const [openId, setOpenId] = useUrlState("card"); // the open card, kept in the address so Back closes it
  const [levelFilter, setLevelFilter] = useState("all");

  const m = published?.modules.find(x => x.id === moduleId);
  const cards = useMemo(() => published?.cards.filter(c => c.module_id === moduleId) ?? [], [published, moduleId]);
  const quiz = useMemo(() => published?.quiz.filter(q => q.module_id === moduleId) ?? [], [published, moduleId]);
  const done = useMemo(() => new Set(childData.progress.map(p => p.item_id)), [childData]);

  usePageTitle(m?.title);
  const small = useSmallScreen();
  if (!published) return <PageLoading />;
  if (!m || m.coming_soon) return <Navigate to="/learn" replace />;
  const area = areaOf(m.area);
  if (small && BIG_SCREEN_AREAS.has(area.id)) return <BigScreenOnly title={m.title} />;
  // Subjects with an adventure (Binary, Computer) open on its map; others open on their cards.
  // Electricity opens on its cards too: they are the introduction to Volt's adventure.
  const hasJourney = ["binary", "typing", "computer"].includes(m.activity) || PRACTICE_ACTIVITIES.has(m.activity) || (m.activity === "circuit" && !cards.length);
  const glossary = GLOSSARY_MODULES.has(m.id) && m.activity === "computer"; // cards are reference only; the path gives the stars
  const chipQuiz = m.activity === "computer"; // Chip's mixed quiz replaces the card quiz

  const levels = (m.levels?.length ? m.levels : [...new Set(cards.map(c => c.level))].map(id => ({ id, name: `Level ${id}`, note: "" })))
    .filter(l => cards.some(c => c.level === l.id));
  const color = lv => LV_COLORS[lv % LV_COLORS.length];
  const tabs = [...(cards.length ? ["cards"] : []), ...(m.activity ? [m.activity] : []), ...(EXTRA_ACTIVITIES[m.id] ?? []), ...(quiz.length || chipQuiz ? ["quiz"] : [])];
  // An address with a section this subject doesn't have goes to the subject's first page.
  if (tabParam && !tabs.includes(tabParam)) return <Navigate to={`/learn/${m.id}`} replace />;
  const first = hasJourney ? m.activity : "cards";
  // Opening a subject goes back to the section the child used last (else its first one).
  const lastKey = `sparklab.tab.${activeChild?.id ?? "guest"}.${m.id}`;
  const remembered = local.get(lastKey, null);
  const startTab = tabs.includes(first) ? first : tabs[0];
  const tab = tabParam ?? (tabs.includes(remembered) ? remembered : startTab);
  const menu = menuItems({ tabs, module: m, cards, done, attempts: childData.attempts.filter(a => a.module_id === m.id), state: childData.state ?? {}, glossary });
  const fresh = !startedSubject(menu);
  const vk = viewKey(location);
  const open = tab === "cards" ? cards.find(c => c.id === openId) : undefined;
  const openIdx = open ? cards.indexOf(open) : -1;
  // The first card not yet learned is marked "Next", so there is always one clear thing to do.
  const nextCard = glossary ? null : cards.find(c => !done.has(c.id));
  const cardsDone = cards.filter(c => done.has(c.id)).length;
  const lesson = open && !glossary ? CARD_LESSONS[open.id] : null;
  const levelOf = lv => levels.find(l => l.id === lv)?.name ?? `Level ${lv}`;

  return (
    <>
      <div className="stack page" style={areaStyle(area.id)}>
        <Crumbs items={[{ to: "/learn", label: "Home" }, { to: `/learn/area/${area.id}`, label: area.title }, { label: m.title }]} />
        <div className="mod-head">
          <Guide id={guideForModule(m)} size={92} className="mod-guide" />
          <div><span className="eyebrow">{area.title}</span><h1>{m.title}</h1><p>{m.tagline}</p></div>
        </div>
        {menu.length > 1 && (
          <SubjectMenu items={menu} current={tab} moduleId={m.id} startTab={startTab} fresh={fresh}
            onPick={t => { hush(); local.set(lastKey, t); }} />
        )}

        {tab === "cards" && (
          <div className="stack">
            <p className="lead">{glossary ? "Every word from Chip's path, to look up any time. Stars come from passing each step's check on the path." : <>{m.id === "electricity" ? "Electricity is like water flowing through pipes. " : ""}Tap a card to meet it, play with it and win its star.</>}</p>
            {!glossary && cards.length > 0 && <p className="collected" role="status"><Icon name="star" size={24} stroke={1.4} fill="currentColor" /> {cardsDone} of {cards.length} collected</p>}
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
                    <button key={c.id} className={`tile${done.has(c.id) && !glossary ? " done" : ""}${c === nextCard ? " next" : ""}`} style={{ "--c": color(l.id) }} onClick={() => setOpenId(c.id)} aria-label={`${c.data.n}${done.has(c.id) ? ", learned" : ""}`}>
                      {done.has(c.id) && !glossary && <span className="tile-star" aria-hidden="true"><Icon name="star" size={18} stroke={1.4} fill="currentColor" /></span>}
                      {c === nextCard && <span className="next-tag">Next</span>}
                      <span className="pic" aria-hidden="true">{hasArt(c.id) ? <PartArt id={c.id} size={64} /> : c.data.e}</span><span className="nm">{c.data.n}</span><span className="sh">{c.data.sh}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {!cards.length && <p className="lead">No cards here yet.</p>}
          </div>
        )}

        {PRACTICE_ACTIVITIES.has(tab) && tab === m.activity && <PracticeJourney key={`${tab}-${vk}`} activity={tab} done={done} grade={activeChild?.grade ?? 0} onStepDone={id => markDone(m.id, id)} />}
        {tab === "circuit" && <CircuitJourney key={vk} done={done} grade={activeChild?.grade ?? 0} onStepDone={id => markDone(m.id, id)} />}
        {tab === "lab" && <LabTab key={vk} done={done} onProjectDone={id => markDone(m.id, id)} />}
        {tab === "typing" && <TypingCourse key={vk} />}
        {tab === "computer" && <ComputerJourney key={vk} done={done} grade={activeChild?.grade ?? 0} onStepDone={id => markDone(m.id, id)} />}
        {tab === "binary" && <BinaryJourney key={vk} done={done} grade={activeChild?.grade ?? 0} onStepDone={id => markDone(m.id, id)} />}
        {tab === "coding" && <CodingPuzzles solved={done} onSolve={id => markDone(m.id, `puzzle-${id}`)} />}
        {tab === "hunt" && <Hunt marks={childData.state.hunt ?? {}} onChange={v => setChildState("hunt", v)} />}
        {tab === "machines" && <Machines />}
        {tab === "quiz" && (chipQuiz
          ? <ChipQuiz key={vk} done={done} onFinish={(score, total) => addAttempt(m.id, score, total)} />
          : <Quiz questions={quiz} onFinish={(score, total) => addAttempt(m.id, score, total)} />)}
      </div>

      {open && lesson && (
        <CardLesson card={open} lesson={lesson} levelName={levelOf(open.level)} color={color(open.level)}
          learned={done.has(open.id)} onLearned={() => markDone(m.id, open.id)}
          next={cards[openIdx + 1]} onGo={id => { hush(); setOpenId(id); }}
          onClose={() => { hush(); setOpenId(null); }} />
      )}
      {open && !lesson && (
        <CardDetail card={open} levelName={levelOf(open.level)} color={color(open.level)}
          learned={done.has(open.id)} onLearned={() => markDone(m.id, open.id)} glossary={glossary}
          prev={cards[openIdx - 1]} next={cards[openIdx + 1]} onGo={id => { hush(); setOpenId(id); }}
          onClose={() => { hush(); setOpenId(null); }} />
      )}
    </>
  );
}

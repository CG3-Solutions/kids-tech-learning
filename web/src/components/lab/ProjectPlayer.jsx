// One Circuit Lab project, start to finish:
//   1. The big question, and the choice of Guided (a faint part shows where each one goes) or
//      Challenge (only what the circuit must do). Fix-it projects start from a broken board.
//   2. Gather the parts: pick the ones this project needs; the others say why not.
//   3. Build on the board.  4. Predict.  5. Test: every check runs on the child's own circuit.
//   6. Explain, in the world, try this, and the star.
import { useEffect, useMemo, useState } from "react";
import CircuitLab from "./CircuitLab.jsx";
import PartPic from "./PartPic.jsx";
import Icon from "./Icon.jsx";
import Guide, { VoltFace } from "../journey/Guide.jsx";
import { PARTS, CONCEPTS, KIT } from "../../content/lab/parts.js";
import { parseParts, parseCheck } from "../../content/lab/netlist.js";
import { LAYOUTS, STARTS } from "../../content/lab/layouts.js";
import { buildBoard } from "../../lib/circuit/board.js";
import { markBuild, markOpenBuild, explainMark, hintFor, inputWords, stateWords } from "../../lib/circuit/marking.js";
import { useApp } from "../../lib/AppContext.jsx";
import { local } from "../../lib/storage.js";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const LEVEL = { explorer: "🌱 Explorer", builder: "🔧 Builder", inventor: "💡 Inventor", engineer: "🚀 Engineer" };
const DISTRACTORS = ["motor", "lamp", "led", "speaker", "button", "slide", "resistor", "ldr", "probe", "melody", "piezo", "touch"];
const nameOf = type => (type === "led" ? "LED" : PARTS[type].name.toLowerCase());

// The parts a project needs, by type: { lamp: 2, slide: 1, … } (connectors are always in the tray).
export function partsNeeded(project) {
  if (!project.circuit) return {}; // an open-ended project: the child chooses
  const need = {};
  for (const p of parseParts(project.circuit)) need[p.type] = (need[p.type] ?? 0) + 1;
  return need;
}
// Two distractors that the project doesn't use, the same ones each time.
export function distractorsFor(project) {
  const need = partsNeeded(project), pool = DISTRACTORS.filter(t => !need[t]);
  const seed = [...project.id].reduce((s, ch) => s + ch.charCodeAt(0), 0);
  return [pool[seed % pool.length], pool[(seed * 7 + 3) % pool.length]].filter((t, i, a) => a.indexOf(t) === i);
}
// "With switch S1 ON → bulb L1 on" for every check, in the project's own labels.
export function checkLines(project) {
  if (project.open) return ["It has an input: a switch, a button or a sensor", "Changing the input changes an output: a light, a motor or a sound"];
  const parts = parseParts(project.circuit), typeOf = id => parts.find(p => p.id === id)?.type;
  return project.checks.map(text => {
    const { when, expect } = parseCheck(text);
    const w = Object.entries(when).map(([id, v]) => inputWords(typeOf(id), id, v)).join(" and ");
    const e = Object.entries(expect).map(([id, v]) => (id === "short" ? (v === "yes" ? "a short circuit is caught" : "no short circuit") : `${nameOf(typeOf(id))} ${id} ${stateWords(typeOf(id), v)}`)).join(", ");
    return `${w ? `With ${w}: ` : ""}${e}`;
  });
}

// Where am I? The steps of every project, with the current one lit.
const STEPS = { intro: "Question", gather: "Parts", build: "Build", test: "Test", done: "Star" };
function Steps({ at, fixIt, skipParts }) {
  const order = ["intro", ...(fixIt || skipParts ? [] : ["gather"]), "build", "test", "done"], now = order.indexOf(at);
  return (
    <ol className="proj-steps" aria-label={`Step ${now + 1} of ${order.length}: ${STEPS[at]}`}>
      {order.map((s, i) => <li key={s} className={i === now ? "now" : i < now ? "past" : ""} aria-hidden="true"><span className="n">{i < now ? <Icon name="check" size={14} /> : i + 1}</span><span className="t">{STEPS[s]}</span></li>)}
    </ol>
  );
}

export default function ProjectPlayer({ project, done, onComplete, onNext, onBack }) {
  const { activeChild } = useApp();
  const fixIt = Boolean(project.start && STARTS[project.id]);
  const open = Boolean(project.open); // your own invention: the whole kit, no guide, no parts to gather
  const need = useMemo(() => partsNeeded(project), [project]);
  const types = Object.keys(need);
  const distract = useMemo(() => distractorsFor(project), [project]);
  const gatherOrder = useMemo(() => [...types, ...distract].sort((a, b) => PARTS[a].name.localeCompare(PARTS[b].name)), [types, distract]);
  const saveKey = `sparklab.lab.project.${activeChild?.id ?? "guest"}.${project.id}`;
  const [stage, setStage] = useState("intro"); // intro → gather → build → done
  const [mode, setMode] = useState(fixIt ? "fix" : open ? "challenge" : "guided");
  const [gathered, setGathered] = useState([]);
  const [said, setSaid] = useState(null);
  const [board, setBoard] = useState([]);
  const [predicted, setPredicted] = useState(null);
  const [testing, setTesting] = useState(false);
  const [mark, setMark] = useState(null);
  const [passed, setPassed] = useState(false); // the board as it stands has passed its test
  const [boardKey, setBoardKey] = useState(0);
  const guide = useMemo(() => (mode === "guided" && LAYOUTS[project.id] ? buildBoard(LAYOUTS[project.id]) : null), [mode, project.id]);
  const initial = useMemo(() => (fixIt ? { parts: buildBoard(STARTS[project.id]) ?? [], inputs: {} } : undefined), [fixIt, project.id]);
  const go = s => { hush(); setStage(s); window.scrollTo({ top: 0 }); };
  // A test result belongs to the board it tested: changing the build clears it (flipping switches doesn't).
  useEffect(() => { setMark(null); setPassed(false); }, [board]);

  const header = (
    <>
      <div className="proj-head">
        <button className="btn back-btn" onClick={() => { hush(); onBack(); }} aria-label="Back to projects"><Icon name="back" size={18} /><span className="lbl">Projects</span></button>
        <span className="proj-emoji" aria-hidden="true">{project.emoji}</span>
        <div className="proj-title">
          <h2>{project.title}</h2>
          <p>{stage === "build" ? project.goal : `Unit ${project.unit} · ${LEVEL[project.level]}`}</p>
        </div>
        <Steps at={stage === "build" && testing ? "test" : stage} fixIt={fixIt} skipParts={open} />
      </div>
    </>
  );

  if (stage === "intro") {
    return (
      <div className="stack proj">
        {header}
        <Guide Face={VoltFace}>{project.q}</Guide>
        <p className="lead">{project.brief ?? project.goal}</p>
        {project.safety && <p className="proj-safety">⚠️ This one shows a danger safely in the lab. Never try it with real batteries.</p>}
        {!fixIt && !open && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="eyebrow">How do you want to build it?</span>
            <div className="proj-modes">
              <button className="proj-mode" aria-pressed={mode === "guided"} onClick={() => { setMode("guided"); sfx.click(); }}><span className="e" aria-hidden="true">🧭</span><b>Guided</b><small>A faint part shows where each one goes</small></button>
              <button className="proj-mode" aria-pressed={mode === "challenge"} onClick={() => { setMode("challenge"); sfx.click(); }}><span className="e" aria-hidden="true">🏆</span><b>Challenge</b><small>Just what it must do. You work out the rest!</small></button>
            </div>
          </div>
        )}
        <div className="row"><button className="btn primary big" onClick={() => { sfx.click(); go(fixIt || open ? "build" : "gather"); }}>{fixIt ? "🔧 Open the broken circuit" : open ? "🛠️ Start inventing" : "Let's go →"}</button>
          {done && <span className="muted">⭐ You've finished this one. Build it again any time.</span>}</div>
      </div>
    );
  }

  if (stage === "gather") {
    const got = types.filter(t => gathered.includes(t)).length, all = got === types.length;
    const pick = t => {
      if (gathered.includes(t)) return;
      if (need[t]) { sfx.ding(); setGathered(g => [...g, t]); setSaid({ t, ok: true }); } else { sfx.oops(); setSaid({ t, ok: false }); }
    };
    return (
      <div className="stack proj">
        {header}
        <Guide Face={VoltFace} mood={said && !said.ok ? "wow" : all ? "cheer" : "happy"}>
          {all ? "You've got everything! Connectors are always in the tray, to join the parts."
            : said && !said.ok ? `Not this time: ${PARTS[said.t].say} This project doesn't need one.`
            : said ? `Yes, a ${nameOf(said.t)}! ${PARTS[said.t].say}`
            : `First, gather the parts. Which ones does "${project.title}" need? Tap them.`}
        </Guide>
        <div className="gather-bar">
          <span className="gather-pips" role="status" aria-label={`Parts found: ${got} of ${types.length}`}>{types.map((t, i) => <i key={t} className={i < got ? "on" : ""} />)}<b>{got} of {types.length}</b></span>
          {all && <button className="btn primary big" onClick={() => go("build")}>Start building 🔧</button>}
        </div>
        <div className="gather">
          {gatherOrder.map(t => {
            const inBox = gathered.includes(t), wrong = said?.t === t && !said.ok;
            return (
              <button key={t} className={`gather-item${inBox ? " yes" : wrong ? " no" : ""}`} disabled={inBox || all} onClick={() => pick(t)} aria-pressed={inBox}>
                <PartPic type={t} size={48} /><b>{PARTS[t].name}</b>{inBox && need[t] > 1 && <small>× {need[t]}</small>}{inBox && <span className="tick" aria-hidden="true">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="stack proj">
        {header}
        <div className="proj-win"><span className="lesson-star" aria-hidden="true">⭐</span>It works!</div>
        <Guide Face={VoltFace} mood="cheer">{project.explain}</Guide>
        <div className="proj-cards">
          <div className="proj-card"><b>🌍 In the world</b><p>{project.world}</p></div>
          <div className="proj-card"><b>🔁 Try this</b><p>{project.tryThis}</p></div>
          {project.deeper && <div className="proj-card"><b>🔬 Go deeper</b><p>{project.deeper}</p></div>}
        </div>
        <p className="muted">You learned about: {project.concepts.map(c => CONCEPTS[c]).join(", ")}.</p>
        <div className="row">
          <button className="btn primary big" onClick={() => { hush(); onComplete(project.id); onNext ? onNext() : onBack(); }}>{onNext ? "Next project →" : "Back to projects ⭐"}</button>
          <button className="btn" onClick={() => { setMark(null); setTesting(false); go("build"); }}>🔁 Keep playing with it</button>
        </div>
      </div>
    );
  }

  // Build, predict and test.
  const runTest = () => { hush(); const m = open ? markOpenBuild(board) : markBuild(project, board); setMark(m); setPassed(m.pass); setTesting(true); m.pass ? sfx.tada() : sfx.oops(); };
  const words = !mark ? [] : open ? [mark.missing.length ? "Your invention needs a battery." : mark.noInput ? "I can't find an input yet." : "Your input doesn't change an output yet."] : explainMark(project, mark, board, 3);
  const actions = (
    <>
      <button className="btn primary lab-test" onClick={() => { if (predicted != null) runTest(); else { setMark(null); setTesting(true); } }}><Icon name="bolt" size={18} /> Test my circuit</button>
      <details className="proj-must">
        <summary><Icon name="target" size={18} /> <span className="long">What it must do</span><span className="short">Goal</span></summary>
        <ul>{checkLines(project).map((l, i) => <li key={i}>{l}</li>)}</ul>
      </details>
      {/* Always shown (just disabled), so the row above the board never changes size. */}
      <button className="lab-ib" title="Start again" disabled={!board.length && !fixIt} onClick={() => { local.remove(saveKey); setBoardKey(k => k + 1); setMark(null); setTesting(false); }} aria-label="Start again"><Icon name="restart" /></button>
    </>
  );

  return (
    <div className="stack proj">
      {header}
      {testing && (
        <div className="proj-test" role="region" aria-label="Testing">
          {predicted == null ? (
            <>
              <Guide Face={VoltFace}>{`Before we test, predict! ${project.predict.q}`}</Guide>
              <div className="choices">{project.predict.options.map((o, i) => <button key={i} className="choice" onClick={() => { setPredicted(i); i === project.predict.answer ? sfx.ding() : sfx.click(); }}>{o}</button>)}</div>
            </>
          ) : !mark ? (
            <>
              <Guide Face={VoltFace} mood={predicted === project.predict.answer ? "cheer" : "happy"}>
                {`${predicted === project.predict.answer ? "Good prediction!" : `Interesting guess! The answer is "${project.predict.options[project.predict.answer]}".`} ${project.predict.why}`}
              </Guide>
              <div className="row"><button className="btn primary big" onClick={runTest}>⚡ Test it now</button></div>
            </>
          ) : mark.pass ? (
            <>
              <Guide Face={VoltFace} mood="cheer">Every check passed! Your circuit does exactly what it should.</Guide>
              <ul className="proj-results">{checkLines(project).map((l, i) => <li key={i} className="ok">✓ {l}</li>)}</ul>
              <div className="row"><button className="btn primary big" onClick={() => go("done")}>See what you learned ⭐</button></div>
            </>
          ) : (
            <>
              <Guide Face={VoltFace} mood="wow">{`Not yet! ${words.join(" ")}`}</Guide>
              <p className="proj-hint">💡 {hintFor(mark)}</p>
              {mark.results.length > 0 && <ul className="proj-results">{checkLines(project).map((l, i) => <li key={i} className={mark.results[i]?.pass ? "ok" : "bad"}>{mark.results[i]?.pass ? "✓" : "✗"} {l}</li>)}</ul>}
              <div className="row"><button className="btn primary" onClick={() => { setTesting(false); setMark(null); }}>Keep building 🔧</button><button className="btn" onClick={runTest}>Test again</button></div>
            </>
          )}
        </div>
      )}
      <CircuitLab key={`${project.id}-${boardKey}`} saveKey={saveKey} initial={initial} kit={open ? KIT : need} trayTypes={open ? Object.keys(KIT) : [...types, "wire"]} guide={guide} actions={actions} examples={false} finished={passed}
        onChange={parts => setBoard(parts)} />
    </div>
  );
}

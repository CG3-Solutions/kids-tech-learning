// One Circuit Lab project, start to finish:
//   1. The big question, and the choice of Guided (a faint part shows where each one goes) or
//      Challenge (only what the circuit must do). Fix-it projects start from a broken board.
//   2. Gather the parts: pick the ones this project needs; the others say why not.
//   3. Build on the board.  4. Predict.  5. Test: every check runs on the child's own circuit.
//   6. Explain, in the world, try this, and the star.
import { useEffect, useMemo, useState } from "react";
import CircuitLab from "./CircuitLab.jsx";
import Guide, { VoltFace } from "../journey/Guide.jsx";
import { PARTS, CONCEPTS } from "../../content/lab/parts.js";
import { parseParts, parseCheck } from "../../content/lab/netlist.js";
import { LAYOUTS, STARTS } from "../../content/lab/layouts.js";
import { buildBoard } from "../../lib/circuit/board.js";
import { markBuild, explainMark, hintFor, inputWords, stateWords } from "../../lib/circuit/marking.js";
import { useApp } from "../../lib/AppContext.jsx";
import { local } from "../../lib/storage.js";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const LEVEL = { explorer: "🌱 Explorer", builder: "🔧 Builder", inventor: "💡 Inventor", engineer: "🚀 Engineer" };
const DISTRACTORS = ["motor", "lamp", "led", "speaker", "button", "slide", "resistor", "ldr", "probe", "melody", "piezo", "touch"];
const nameOf = type => (type === "led" ? "LED" : PARTS[type].name.toLowerCase());

// The parts a project needs, by type: { lamp: 2, slide: 1, … } (connectors are always in the tray).
export function partsNeeded(project) {
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
  const parts = parseParts(project.circuit), typeOf = id => parts.find(p => p.id === id)?.type;
  return project.checks.map(text => {
    const { when, expect } = parseCheck(text);
    const w = Object.entries(when).map(([id, v]) => inputWords(typeOf(id), id, v)).join(" and ");
    const e = Object.entries(expect).map(([id, v]) => (id === "short" ? (v === "yes" ? "a short circuit is caught" : "no short circuit") : `${nameOf(typeOf(id))} ${id} ${stateWords(typeOf(id), v)}`)).join(", ");
    return `${w ? `With ${w}: ` : ""}${e}`;
  });
}

export default function ProjectPlayer({ project, done, onComplete, onNext, onBack }) {
  const { activeChild } = useApp();
  const fixIt = Boolean(project.start && STARTS[project.id]);
  const need = useMemo(() => partsNeeded(project), [project]);
  const types = Object.keys(need);
  const distract = useMemo(() => distractorsFor(project), [project]);
  const gatherOrder = useMemo(() => [...types, ...distract].sort((a, b) => PARTS[a].name.localeCompare(PARTS[b].name)), [types, distract]);
  const saveKey = `sparklab.lab.project.${activeChild?.id ?? "guest"}.${project.id}`;
  const [stage, setStage] = useState("intro"); // intro → gather → build → done
  const [mode, setMode] = useState(fixIt ? "fix" : "guided");
  const [gathered, setGathered] = useState([]);
  const [said, setSaid] = useState(null);
  const [board, setBoard] = useState([]);
  const [predicted, setPredicted] = useState(null);
  const [testing, setTesting] = useState(false);
  const [mark, setMark] = useState(null);
  const [boardKey, setBoardKey] = useState(0);
  const guide = useMemo(() => (mode === "guided" && LAYOUTS[project.id] ? buildBoard(LAYOUTS[project.id]) : null), [mode, project.id]);
  const initial = useMemo(() => (fixIt ? { parts: buildBoard(STARTS[project.id]) ?? [], inputs: {} } : undefined), [fixIt, project.id]);
  const go = s => { hush(); setStage(s); window.scrollTo({ top: 0 }); };
  // A test result belongs to the board it tested: changing the build clears it (flipping switches doesn't).
  useEffect(() => { setMark(null); }, [board]);

  const header = (
    <div className="proj-head">
      <span className="proj-emoji" aria-hidden="true">{project.emoji}</span>
      <div><span className="eyebrow">Unit {project.unit} · {LEVEL[project.level]}</span><h2>{project.title}</h2></div>
      <span className="spacer" />
      <button className="btn ghost" onClick={() => { hush(); onBack(); }}>← Projects</button>
    </div>
  );

  if (stage === "intro") {
    return (
      <div className="stack proj">
        {header}
        <Guide Face={VoltFace}>{project.q}</Guide>
        <p className="lead">{project.goal}</p>
        {project.safety && <p className="proj-safety">⚠️ This one shows a danger safely in the lab. Never try it with real batteries.</p>}
        {!fixIt && (
          <div className="stack" style={{ gap: 6 }}>
            <span className="eyebrow">How do you want to build it?</span>
            <div className="chips">
              <button className="chip" aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>🧭 Guided: a faint part shows where each one goes</button>
              <button className="chip" aria-pressed={mode === "challenge"} onClick={() => setMode("challenge")}>🏆 Challenge: just what it must do</button>
            </div>
          </div>
        )}
        <div className="row"><button className="btn primary big" onClick={() => { sfx.click(); go(fixIt ? "build" : "gather"); }}>{fixIt ? "🔧 Open the broken circuit" : "Let's go →"}</button>
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
        <div className="gather">
          {gatherOrder.map(t => {
            const inBox = gathered.includes(t), wrong = said?.t === t && !said.ok;
            return (
              <button key={t} className={`gather-item${inBox ? " yes" : wrong ? " no" : ""}`} disabled={inBox || all} onClick={() => pick(t)} aria-pressed={inBox}>
                <span className="em" aria-hidden="true">{PARTS[t].emoji}</span><b>{PARTS[t].name}</b>{inBox && need[t] > 1 && <small>× {need[t]}</small>}
              </button>
            );
          })}
        </div>
        <p className="muted center">Parts found: {got} of {types.length}</p>
        {all && <div className="row center-row"><button className="btn primary big" onClick={() => go("build")}>Start building 🔧</button></div>}
      </div>
    );
  }

  if (stage === "done") {
    return (
      <div className="stack proj">
        {header}
        <div className="proj-win">🎉 It works!</div>
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
  const runTest = () => { hush(); const m = markBuild(project, board); setMark(m); setTesting(true); m.pass ? sfx.tada() : sfx.oops(); };
  const words = mark ? explainMark(project, mark, board, 3) : [];
  const actions = (
    <>
      <button className="btn primary" onClick={() => { if (predicted != null) runTest(); else { setMark(null); setTesting(true); } }}>⚡ Test my circuit</button>
      <details className="proj-must">
        <summary>🎯 What it must do</summary>
        <ul>{checkLines(project).map((l, i) => <li key={i}>{l}</li>)}</ul>
      </details>
      {(board.length > 0 || fixIt) && (
        <button className="btn ghost" onClick={() => { local.remove(saveKey); setBoardKey(k => k + 1); setMark(null); setTesting(false); }}>↺ Start again</button>
      )}
    </>
  );

  return (
    <div className="stack proj">
      {header}
      <p className="proj-goal">{fixIt ? `🔧 ${project.goal}` : project.goal}</p>
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
      <CircuitLab key={`${project.id}-${boardKey}`} saveKey={saveKey} initial={initial} kit={need} trayTypes={[...types, "wire"]} guide={guide} actions={actions} examples={false}
        onChange={parts => setBoard(parts)} />
    </div>
  );
}

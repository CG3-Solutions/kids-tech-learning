// The Circuit Lab tab: guided projects (unit by unit) or free building.
import { useState } from "react";
import CircuitLab from "./CircuitLab.jsx";
import ProjectPlayer from "./ProjectPlayer.jsx";
import { PROJECTS, UNITS } from "../../content/lab/projects.js";
import { LAYOUTS } from "../../content/lab/layouts.js";
import { local } from "../../lib/storage.js";
import { sfx } from "../../lib/sfx.js";
import { useUrlState } from "../../lib/useUrlState.js";
import Icon from "./Icon.jsx";

const LEVEL = { explorer: "🌱", builder: "🔧", inventor: "💡", engineer: "🚀" };
// A unit is open once every project in it has a guided layout.
export const unitReady = n => PROJECTS.filter(p => p.unit === n).every(p => LAYOUTS[p.id] || p.open);

export default function LabTab({ done, onProjectDone }) {
  const [view, setView] = useState(() => local.get("sparklab.lab.view", "projects"));
  const [openId, setOpenId] = useUrlState("project"); // kept in the address so Back returns to the project list
  const pick = v => { setView(v); local.set("sparklab.lab.view", v); setOpenId(null); sfx.click(); };
  const project = PROJECTS.find(p => p.id === openId);
  const nextOf = p => { const list = PROJECTS.filter(x => unitReady(x.unit)); const i = list.indexOf(p); return list[i + 1]; };

  return (
    <div className="stack">
      <div className="chips lab-switch" role="tablist" aria-label="Circuit Lab">
        <button className="chip" role="tab" aria-selected={view === "projects"} aria-pressed={view === "projects"} onClick={() => pick("projects")}>🧩 Projects</button>
        <button className="chip" role="tab" aria-selected={view === "free"} aria-pressed={view === "free"} onClick={() => pick("free")}>🛠️ Free build</button>
      </div>
      {/* Free build has the same focused page as a project: a back button, a title, then the board. */}
      {view === "free" && (
        <div className="stack proj">
          <div className="proj-head">
            <button className="btn back-btn" onClick={() => pick("projects")} aria-label="Back to projects"><Icon name="back" size={18} /><span className="lbl">Projects</span></button>
            <span className="proj-emoji" aria-hidden="true">🛠️</span>
            <div className="proj-title"><h2>Free build</h2><p>Build any circuit you like. Every part is in the tray.</p></div>
          </div>
          <CircuitLab />
        </div>
      )}
      {view === "projects" && project && (
        <ProjectPlayer key={project.id} project={project} done={done.has(project.id)}
          onComplete={id => onProjectDone(id)} onBack={() => setOpenId(null)}
          onNext={nextOf(project) ? () => { setOpenId(nextOf(project).id); window.scrollTo({ top: 0 }); } : null} />
      )}
      {view === "projects" && !project && (
        <div className="stack">
          <p className="lead">Build real circuits, one project at a time. Each one starts with a question, and your circuit is tested to see if it really works.</p>
          {UNITS.map(u => {
            const list = PROJECTS.filter(p => p.unit === u.n), finished = list.filter(p => done.has(p.id)).length, ready = unitReady(u.n);
            return (
              <section key={u.n} className={`lab-unit${ready ? "" : " soon"}`} aria-label={`Unit ${u.n}: ${u.title}`}>
                <div className="lab-unit-head">
                  <span className="em" aria-hidden="true">{u.emoji}</span>
                  <div><h3>Unit {u.n} · {u.title}</h3><p className="muted">{u.q}</p></div>
                  <span className="spacer" />
                  {ready ? <span className="lab-unit-count">{finished} / {list.length} ⭐</span> : <span className="ribbon">Coming soon</span>}
                </div>
                {ready && (
                  <div className="lab-projects">
                    {list.map(p => (
                      <button key={p.id} className={`lab-project${done.has(p.id) ? " done" : ""}`} onClick={() => { sfx.click(); setOpenId(p.id); window.scrollTo({ top: 0 }); }}>
                        <span className="em" aria-hidden="true">{p.emoji}</span>
                        <span className="t"><b>{p.title}</b><small>{LEVEL[p.level]} {p.start ? "🩹 Fix it" : p.safety ? "⚠️ Safety" : p.q}</small></span>
                        {done.has(p.id) && <span className="star" aria-label="finished">⭐</span>}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { ASSIGNMENT_KINDS, assignmentLabel, rosterCsv, studentRow } from "../../lib/school.js";
import { LADDER, TESTS, TYPING_JOURNEY, TYPING_PARTS } from "../../content/typing.js";
import { fmtWhen } from "../../lib/activity.js";
import { Avatar } from "../../components/Character.jsx";

const fmtDay = d => (d ? new Date(`${d}T00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");

function download(name, text) {
  const url = URL.createObjectURL(new Blob(["﻿", text], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function NewAssignment({ classId, onAdded }) {
  const { api, setError } = useApp();
  const [kind, setKind] = useState("lesson");
  const [target, setTarget] = useState("typ-step-8");
  const [minWpm, setMinWpm] = useState("");
  const [due, setDue] = useState("");
  const [busy, setBusy] = useState(false);
  const pickKind = k => { setKind(k); setTarget(k === "lesson" ? "typ-step-8" : k === "test" ? "3" : "15"); };
  const draft = { kind, target, min_wpm: kind === "test" && minWpm ? Number(minWpm) : null };
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { await api.addAssignment({ class_id: classId, title: assignmentLabel(draft), ...draft, due_on: due || null }); setDue(""); setMinWpm(""); onAdded(); }
    catch (er) { setError(er.message); } finally { setBusy(false); }
  };
  return (
    <form className="assign-form" onSubmit={submit}>
      <div className="field"><label htmlFor="a-kind">Task</label>
        <select id="a-kind" className="select" value={kind} onChange={e => pickKind(e.target.value)}>{ASSIGNMENT_KINDS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      </div>
      {kind === "lesson" && (
        <div className="field"><label htmlFor="a-target">Lesson</label>
          <select id="a-target" className="select" value={target} onChange={e => setTarget(e.target.value)}>
            {TYPING_PARTS.map(p => <optgroup key={p.id} label={p.title}>{TYPING_JOURNEY.filter(s => s.part === p.id).map(s => <option key={s.id} value={s.id}>{TYPING_JOURNEY.indexOf(s) + 1}. {s.title}</option>)}</optgroup>)}
          </select>
        </div>
      )}
      {kind === "test" && (
        <>
          <div className="field"><label htmlFor="a-target">Length</label>
            <select id="a-target" className="select" value={target} onChange={e => setTarget(e.target.value)}>{TESTS.map(m => <option key={m} value={m}>{m} minutes</option>)}</select>
          </div>
          <div className="field"><label htmlFor="a-wpm">At least (wpm, optional)</label><input id="a-wpm" type="number" min="1" max="200" value={minWpm} onChange={e => setMinWpm(e.target.value)} /></div>
        </>
      )}
      {kind === "ladder" && (
        <div className="field"><label htmlFor="a-target">Speed</label>
          <select id="a-target" className="select" value={target} onChange={e => setTarget(e.target.value)}>{LADDER.map(w => <option key={w} value={w}>{w} words a minute</option>)}</select>
        </div>
      )}
      <div className="field"><label htmlFor="a-due">Due (optional)</label><input id="a-due" type="date" value={due} onChange={e => setDue(e.target.value)} /></div>
      <div className="assign-preview muted">{assignmentLabel(draft)}</div>
      <button className="btn primary" disabled={busy}>Set task</button>
    </form>
  );
}

function ClassDetail({ cls, onDeleted }) {
  const { api, setError } = useApp();
  const [data, setData] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const load = useCallback(() => api.classRoster(cls.id).then(setData).catch(e => setError(e.message)), [api, cls.id, setError]);
  useEffect(() => { load(); }, [load]);
  const rows = useMemo(() => (data ? data.members.map(m => studentRow(m, data.assignments)).sort((a, b) => a.child.name.localeCompare(b.child.name)) : []), [data]);
  if (!data) return <p className="muted">Loading…</p>;
  const { assignments } = data;
  const remove = async childId => { try { await api.removeMember(cls.id, childId); load(); } catch (e) { setError(e.message); } };
  const delAssign = async id => { try { await api.deleteAssignment(id); load(); } catch (e) { setError(e.message); } };
  const delClass = async () => { try { await api.deleteClass(cls.id); onDeleted(); } catch (e) { setError(e.message); } };
  const avg = rows.length ? Math.round(rows.reduce((s, r) => s + r.best, 0) / rows.length) : 0;
  return (
    <>
      <section className="pc-card">
        <div className="pc-card-hd">
          <h2>{cls.name}</h2><span className="spacer" />
          <span className="join-code" aria-label={`Join code ${cls.join_code.split("").join(" ")}`}>Join code <b>{cls.join_code}</b></span>
          <button className="btn ghost" onClick={() => navigator.clipboard?.writeText(cls.join_code)}>Copy</button>
        </div>
        <p className="muted">Share the code with parents. They add their child under <b>Learners → Join a class</b>. You'll see only typing results: lessons, speed, accuracy and tests.</p>
        <div className="kpis wide">
          <div className="kpi"><span>Students</span><b>{rows.length}</b><small>joined</small></div>
          <div className="kpi"><span>Average best speed</span><b>{avg || "—"}</b><small>words a minute</small></div>
          <div className="kpi"><span>Tasks</span><b>{assignments.length}</b><small>set</small></div>
        </div>
      </section>

      <section className="pc-card">
        <div className="pc-card-hd"><h2>Students</h2><span className="spacer" />
          {rows.length > 0 && <button className="btn" onClick={() => download(`${cls.name.replace(/[^\w-]+/g, "_")}-typing.csv`, rosterCsv(rows, assignments))}>⬇️ Download spreadsheet (CSV)</button>}
        </div>
        {rows.length ? (
          <div className="pc-table-wrap">
            <table className="pc-table class-table">
              <thead><tr><th>Student</th><th>Lessons</th><th>Best speed</th><th>Accuracy</th><th>Ladder</th><th>Last active</th>{assignments.map(a => <th key={a.id} title={a.title}>{a.title.length > 22 ? `${a.title.slice(0, 20)}…` : a.title}</th>)}<th /></tr></thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.child.id}>
                    <td><span className="who-cell"><Avatar value={r.child.avatar} size="sm" /><b>{r.child.name}</b></span></td>
                    <td>{r.lessons}/{TYPING_JOURNEY.length}</td>
                    <td>{r.best ? `${r.best} wpm` : "—"}</td>
                    <td>{r.accuracy == null ? "—" : `${r.accuracy}%`}</td>
                    <td>{r.ladder ? `${r.ladder} wpm` : "—"}</td>
                    <td>{r.last ? fmtWhen(r.last) : "—"}</td>
                    {r.statuses.map((s, i) => <td key={assignments[i].id}><span className={`status ${s.done ? "sent" : s.overdue ? "err" : "queued"}`}>{s.done ? "✓ Done" : s.overdue ? "Overdue" : s.detail}</span></td>)}
                    <td className="right"><button className="btn ghost small" onClick={() => remove(r.child.id)} aria-label={`Remove ${r.child.name} from the class`}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty"><b>No students yet.</b><p className="muted">Give parents the join code <b>{cls.join_code}</b>.</p></div>}
      </section>

      <section className="pc-card">
        <h2>Tasks</h2>
        <NewAssignment classId={cls.id} onAdded={load} />
        {assignments.length > 0 && (
          <ul className="feed">
            {assignments.map(a => (
              <li key={a.id}>
                <span className="what">📌 {a.title}{a.due_on ? <span className="muted"> · due {fmtDay(a.due_on)}</span> : null}
                  <span className="muted"> · {rows.filter(r => r.statuses[assignments.indexOf(a)]?.done).length}/{rows.length} done</span></span>
                <button className="btn ghost small" onClick={() => delAssign(a.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="pc-card danger-zone">
        {confirm
          ? <><p>Delete {cls.name}? Students leave the class and its tasks are removed. Their own progress stays with their families.</p><div className="row"><button className="btn danger" onClick={delClass}>Yes, delete</button><button className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></div></>
          : <div><button className="btn danger" onClick={() => setConfirm(true)}>Delete this class</button></div>}
      </section>
    </>
  );
}

// Teachers: classes with join codes, a dashboard of each student's typing, tasks and a CSV export.
export default function Classes() {
  const { api, profile, setError } = useApp();
  const { classId } = useParams();
  const nav = useNavigate();
  const [list, setList] = useState(null);
  const [name, setName] = useState("");
  const load = useCallback(() => api?.listClasses().then(setList).catch(e => { setList([]); setError(e.message); }), [api, setError]);
  useEffect(() => { if (profile?.is_teacher) load(); }, [load, profile?.is_teacher]);

  if (!profile?.is_teacher) {
    return (
      <ParentLayout title="Classes">
        <section className="pc-card" style={{ maxWidth: 560 }}>
          <h2>For teachers</h2>
          <p className="muted">Turn on <b>I'm a teacher</b> in <Link to="/parent/account">Account</Link> to create classes for typing.</p>
        </section>
      </ParentLayout>
    );
  }
  const cls = list?.find(c => c.id === classId);
  const create = async e => {
    e.preventDefault();
    try { const c = await api.createClass(name); setName(""); await load(); nav(`/parent/classes/${c.id}`); } catch (er) { setError(er.message); }
  };
  return (
    <ParentLayout title={cls ? `Classes · ${cls.name}` : "Classes"}>
      <div className="class-tabs seg" role="tablist" aria-label="Classes">
        {(list ?? []).map(c => <Link key={c.id} role="tab" aria-selected={c.id === classId} className={c.id === classId ? "on" : ""} to={`/parent/classes/${c.id}`}>🏫 {c.name}</Link>)}
      </div>
      {cls ? <ClassDetail key={cls.id} cls={cls} onDeleted={() => { load(); nav("/parent/classes"); }} /> : (
        <section className="pc-card" style={{ maxWidth: 560 }}>
          <h2>{list?.length ? "Pick a class above, or create one" : "Create your first class"}</h2>
          <form className="row" onSubmit={create}>
            <label className="sr-only" htmlFor="cname">Class name</label>
            <input id="cname" className="select" style={{ flex: 1, minWidth: 180 }} maxLength={60} placeholder="e.g. 4B Computers" value={name} onChange={e => setName(e.target.value)} required />
            <button className="btn primary">Create class</button>
          </form>
          <p className="muted">Each class gets a join code for parents. You see each student's typing lessons, speed, accuracy and tests, and you can set tasks with due dates.</p>
        </section>
      )}
    </ParentLayout>
  );
}

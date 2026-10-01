import { useCallback, useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { ChildForm, ordinal } from "../Profiles.jsx";
import { voiceOf } from "../../lib/voice.js";

// A teacher's join code puts a learner in their class. The teacher then sees that learner's typing results only.
function JoinClass({ children }) {
  const { api, setError } = useApp();
  const [mine, setMine] = useState([]);
  const [who, setWho] = useState(children[0]?.id ?? "");
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState("");
  const load = useCallback(() => api.childClasses(children.map(c => c.id)).then(setMine).catch(() => setMine([])), [api, children]);
  useEffect(() => { load(); }, [load]);
  if (!children.length) return null;
  const join = async e => {
    e.preventDefault(); setMsg("");
    try { const c = await api.joinClass(code, who); setCode(""); setMsg(`Joined ${c.name}.`); load(); } catch (er) { setError(er.message); }
  };
  const leave = async (classId, childId) => { try { await api.leaveClass(classId, childId); load(); } catch (er) { setError(er.message); } };
  return (
    <section className="pc-card" style={{ maxWidth: 720 }}>
      <h2>🏫 Join a class</h2>
      <p className="muted">If a teacher gave you a class code, add your learner here. The teacher will see their <b>typing</b> lessons, speed, accuracy and tests, and nothing else. You can leave any time.</p>
      <form className="row" onSubmit={join}>
        <label className="sr-only" htmlFor="j-who">Learner</label>
        <select id="j-who" className="select" value={who} onChange={e => setWho(e.target.value)}>{children.map(c => <option key={c.id} value={c.id}>{c.avatar} {c.name}</option>)}</select>
        <label className="sr-only" htmlFor="j-code">Class code</label>
        <input id="j-code" className="select code-input" placeholder="Class code" maxLength={6} value={code} onChange={e => setCode(e.target.value.toUpperCase())} required />
        <button className="btn primary">Join</button>
        {msg && <span className="learned" role="status">{msg}</span>}
      </form>
      {mine.length > 0 && (
        <ul className="feed">
          {mine.map(m => {
            const c = children.find(x => x.id === m.child_id);
            return <li key={`${m.class_id}-${m.child_id}`}><span className="what">{c?.avatar} {c?.name} · 🏫 {m.name}</span><button className="btn ghost small" onClick={() => leave(m.class_id, m.child_id)}>Leave class</button></li>;
          })}
        </ul>
      )}
    </section>
  );
}

// Levels: "In order" (each step opens after the one before) or "All open" (any level, any time).
// Saved per learner in their settings, so it works on every device.
function useLevelSettings(children) {
  const { api, activeChild, loadChild, setError } = useApp();
  const [settings, setSettings] = useState({});
  useEffect(() => {
    if (!api || !children.length) return;
    Promise.all(children.map(c => api.loadChild(c.id).then(d => [c.id, d.state?.settings ?? {}])))
      .then(rows => setSettings(Object.fromEntries(rows))).catch(e => setError(e.message));
  }, [api, children, setError]);
  const setAllOpen = async (child, on) => {
    const next = { ...(settings[child.id] ?? {}), unlockAll: on };
    setSettings(s => ({ ...s, [child.id]: next }));
    try { await api.setState(child.id, "settings", next); if (child.id === activeChild?.id) loadChild(); } catch (e) { setError(e.message); }
  };
  return [settings, setAllOpen];
}

export default function Children() {
  const { api, children, loadAccount, setError } = useApp();
  const [levels, setAllOpen] = useLevelSettings(children);
  const [editing, setEditing] = useState(null); // learner id | "new" | "new-adult"
  const [confirm, setConfirm] = useState(false);
  const child = children.find(c => c.id === editing);
  const save = async d => {
    try { if (editing.startsWith("new")) await api.addChild(d); else await api.updateChild(editing, d); await loadAccount(); setEditing(null); }
    catch (e) { setError(e.message); }
  };
  const remove = async () => {
    try { await api.deleteChild(editing); await loadAccount(); setEditing(null); setConfirm(false); } catch (e) { setError(e.message); }
  };
  return (
    <ParentLayout title="Learners">
      {editing ? (
        <section className="pc-card" style={{ maxWidth: 560 }}>
          <h2>{editing === "new" ? "Add a child" : editing === "new-adult" ? "Add yourself (typing)" : `Edit ${child?.name}`}</h2>
          <ChildForm key={editing} initial={child} adult={editing === "new-adult"} saveLabel={editing.startsWith("new") ? "Add" : "Save changes"} onSave={save} onCancel={() => { setEditing(null); setConfirm(false); }} />
          {!editing.startsWith("new") && (
            <div className="danger-zone">
              {confirm
                ? <><p>Delete {child?.name} and all their progress? This can't be undone.</p><div className="row"><button className="btn danger" onClick={remove}>Yes, delete</button><button className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></div></>
                : <button className="btn danger" onClick={() => setConfirm(true)}>Delete this profile</button>}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="pc-table-wrap">
            <table className="pc-table">
              <thead><tr><th>Learner</th><th>Class</th><th>Levels</th><th>Voice</th><th>Daily limit</th><th /></tr></thead>
              <tbody>
                {children.map(c => (
                  <tr key={c.id}>
                    <td><span className="face sm">{c.avatar}</span> <b>{c.name}</b></td>
                    <td>{c.learner === "adult" ? "Grown-up" : c.grade ? `${ordinal(c.grade)} standard` : "—"}</td>
                    <td>
                      <label className="lvl-switch" title="All open: every level of every subject can be opened, in any order.">
                        <input type="checkbox" checked={!!levels[c.id]?.unlockAll} onChange={e => setAllOpen(c, e.target.checked)} aria-label={`Open all levels for ${c.name}`} />
                        <span className="lvl-track" aria-hidden="true"><i /></span>
                        <span>{levels[c.id]?.unlockAll ? "🔓 All open" : "🔒 In order"}</span>
                      </label>
                    </td>
                    <td>{voiceOf(c).emoji} {voiceOf(c).name}</td>
                    <td>{c.daily_limit_min ? `${c.daily_limit_min} min` : "No limit"}</td>
                    <td className="right"><button className="btn ghost" onClick={() => setEditing(c.id)}>Edit</button></td>
                  </tr>
                ))}
                {!children.length && <tr><td colSpan="6" className="muted">No children yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="row">
            <button className="btn primary" onClick={() => setEditing("new")}>＋ Add a child</button>
            {!children.some(c => c.learner === "adult") && <button className="btn" onClick={() => setEditing("new-adult")}>⌨️ Add yourself (learn typing)</button>}
          </div>
          <p className="muted small-note"><b>Levels:</b> “In order” opens each step after the one before (older classes can jump ahead in some subjects). “All open” lets a learner try any level, in any order, including the typing games and tests. Good for testing, revision or a confident learner.</p>
          <JoinClass children={children} />
        </>
      )}
    </ParentLayout>
  );
}

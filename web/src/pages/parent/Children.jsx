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

export default function Children() {
  const { api, children, loadAccount, setError } = useApp();
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
              <thead><tr><th>Learner</th><th>Class</th><th>Voice</th><th>Daily limit</th><th /></tr></thead>
              <tbody>
                {children.map(c => (
                  <tr key={c.id}>
                    <td><span className="face sm">{c.avatar}</span> <b>{c.name}</b></td>
                    <td>{c.learner === "adult" ? "Grown-up" : c.grade ? `${ordinal(c.grade)} standard` : "—"}</td>
                    <td>{voiceOf(c).emoji} {voiceOf(c).name}</td>
                    <td>{c.daily_limit_min ? `${c.daily_limit_min} min` : "No limit"}</td>
                    <td className="right"><button className="btn ghost" onClick={() => setEditing(c.id)}>Edit</button></td>
                  </tr>
                ))}
                {!children.length && <tr><td colSpan="5" className="muted">No children yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="row">
            <button className="btn primary" onClick={() => setEditing("new")}>＋ Add a child</button>
            {!children.some(c => c.learner === "adult") && <button className="btn" onClick={() => setEditing("new-adult")}>⌨️ Add yourself (learn typing)</button>}
          </div>
          <JoinClass children={children} />
        </>
      )}
    </ParentLayout>
  );
}

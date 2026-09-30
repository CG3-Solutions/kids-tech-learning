import { useState } from "react";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { ChildForm, ordinal } from "../Profiles.jsx";
import { voiceOf } from "../../lib/voice.js";

export default function Children() {
  const { api, children, loadAccount, setError } = useApp();
  const [editing, setEditing] = useState(null); // child id | "new"
  const [confirm, setConfirm] = useState(false);
  const child = children.find(c => c.id === editing);
  const save = async d => {
    try { if (editing === "new") await api.addChild(d); else await api.updateChild(editing, d); await loadAccount(); setEditing(null); }
    catch (e) { setError(e.message); }
  };
  const remove = async () => {
    try { await api.deleteChild(editing); await loadAccount(); setEditing(null); setConfirm(false); } catch (e) { setError(e.message); }
  };
  return (
    <ParentLayout title="Children">
      {editing ? (
        <section className="pc-card" style={{ maxWidth: 560 }}>
          <h2>{editing === "new" ? "Add a child" : `Edit ${child?.name}`}</h2>
          <ChildForm key={editing} initial={child} saveLabel={editing === "new" ? "Add child" : "Save changes"} onSave={save} onCancel={() => { setEditing(null); setConfirm(false); }} />
          {editing !== "new" && (
            <div className="danger-zone">
              {confirm
                ? <><p>Delete {child?.name} and all their progress? This can't be undone.</p><div className="row"><button className="btn danger" onClick={remove}>Yes, delete</button><button className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></div></>
                : <button className="btn danger" onClick={() => setConfirm(true)}>Delete this child</button>}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="pc-table-wrap">
            <table className="pc-table">
              <thead><tr><th>Child</th><th>Class</th><th>Voice</th><th>Daily limit</th><th /></tr></thead>
              <tbody>
                {children.map(c => (
                  <tr key={c.id}>
                    <td><span className="face sm">{c.avatar}</span> <b>{c.name}</b></td>
                    <td>{c.grade ? `${ordinal(c.grade)} standard` : "—"}</td>
                    <td>{voiceOf(c).emoji} {voiceOf(c).name}</td>
                    <td>{c.daily_limit_min ? `${c.daily_limit_min} min` : "No limit"}</td>
                    <td className="right"><button className="btn ghost" onClick={() => setEditing(c.id)}>Edit</button></td>
                  </tr>
                ))}
                {!children.length && <tr><td colSpan="5" className="muted">No children yet.</td></tr>}
              </tbody>
            </table>
          </div>
          <div><button className="btn primary" onClick={() => setEditing("new")}>＋ Add a child</button></div>
        </>
      )}
    </ParentLayout>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { AVATARS } from "../content/index.js";

export const ordinal = n => `${n}${["th", "st", "nd", "rd"][(n % 100 >= 11 && n % 100 <= 13) ? 0 : Math.min(n % 10, 4) % 4] || "th"}`;

export function ChildForm({ initial, onSave, onCancel, saveLabel = "Add" }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0]);
  const [grade, setGrade] = useState(initial?.grade ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "unspecified");
  const [busy, setBusy] = useState(false);
  return (
    <form className="stack" style={{ gap: 14, textAlign: "left" }} onSubmit={async e => { e.preventDefault(); setBusy(true); try { await onSave({ name, avatar, gender, grade: grade === "" ? null : Number(grade) }); } finally { setBusy(false); } }}>
      <div className="field"><label htmlFor="childName">Child's first name</label><input id="childName" maxLength={40} value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
      <fieldset className="field seg-field">
        <legend>Your child is a…</legend>
        <div className="seg">
          {[["girl", "👧 Girl"], ["boy", "👦 Boy"], ["unspecified", "🙂 Prefer not to say"]].map(([v, l]) => (
            <label key={v} className={gender === v ? "on" : ""}><input type="radio" name="gender" value={v} checked={gender === v} onChange={() => setGender(v)} />{l}</label>
          ))}
        </div>
        <small>Sets the default reading voice. You can change it any time in Voice & sound.</small>
      </fieldset>
      <div className="field">
        <label htmlFor="childGrade">Class (standard)</label>
        <select id="childGrade" value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">Not set</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{ordinal(i + 1)} standard</option>)}
        </select>
        <small>Used to pick the right difficulty. Older learners can jump ahead.</small>
      </div>
      <div className="field">
        <label>Pick an animal</label>
        <div className="avatars">{AVATARS.map(a => <button type="button" key={a} aria-pressed={a === avatar} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`}>{a}</button>)}</div>
      </div>
      <div className="row"><button className="btn primary" type="submit" disabled={busy || !name.trim()}>{saveLabel}</button>{onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}</div>
    </form>
  );
}

export default function Profiles() {
  const { api, children, chooseChild, loadAccount, setError } = useApp();
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);

  const add = async data => {
    try { const c = await api.addChild(data); await loadAccount(); chooseChild(c.id); nav("/learn"); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <TopBar variant="public"><Link className="btn" to="/parent">👪 Grown-ups</Link></TopBar>
      <main className="wrap">
        <div className="who">
          <h1>{children.length ? "Who's learning today?" : "Add your first learner"}</h1>
          {!adding && (
            <div className="kids">
              {children.map(c => (
                <button key={c.id} className="kid" onClick={() => { chooseChild(c.id); nav("/learn"); }}>
                  <span className="face">{c.avatar}</span>{c.name}
                </button>
              ))}
              <button className="kid add" onClick={() => setAdding(true)}><span className="face">＋</span>Add child</button>
            </div>
          )}
          {adding && <div className="panel" style={{ width: "min(480px, 100%)" }}><ChildForm onSave={add} onCancel={children.length ? () => setAdding(false) : null} /></div>}
          {!children.length && !adding && <p className="muted">Children don't need an email. Just a first name and an animal.</p>}
        </div>
      </main>
    </>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import ParentGate, { gatePassed, passGate } from "../components/ParentGate.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { AVATARS } from "../content/index.js";

export const ordinal = n => `${n}${["th", "st", "nd", "rd"][(n % 100 >= 11 && n % 100 <= 13) ? 0 : Math.min(n % 10, 4) % 4] || "th"}`;

// Adds or edits a learner. `adult` makes it a grown-up's own profile (for typing): no class, Pro mode, calm voice.
export function ChildForm({ initial, onSave, onCancel, saveLabel = "Add", adult: adultIn = false }) {
  const adult = adultIn || initial?.learner === "adult";
  const [name, setName] = useState(initial?.name ?? "");
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0]);
  const [grade, setGrade] = useState(initial?.grade ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "unspecified");
  const [busy, setBusy] = useState(false);
  return (
    <form className="stack" style={{ gap: 14, textAlign: "left" }} onSubmit={async e => { e.preventDefault(); setBusy(true); try { await onSave({ name, avatar, gender, grade: adult || grade === "" ? null : Number(grade), learner: adult ? "adult" : "child" }); } finally { setBusy(false); } }}>
      <div className="field"><label htmlFor="childName">{adult ? "Your first name" : "Child's first name"}</label><input id="childName" maxLength={40} value={name} onChange={e => setName(e.target.value)} required autoFocus /></div>
      {!adult && <fieldset className="field seg-field">
        <legend>Your child is a…</legend>
        <div className="seg">
          {[["girl", "👧 Girl"], ["boy", "👦 Boy"], ["unspecified", "🙂 Prefer not to say"]].map(([v, l]) => (
            <label key={v} className={gender === v ? "on" : ""}><input type="radio" name="gender" value={v} checked={gender === v} onChange={() => setGender(v)} />{l}</label>
          ))}
        </div>
        <small>Sets the default reading voice. You can change it any time in Voice & sound.</small>
      </fieldset>}
      {adult ? <p className="muted">Your profile starts in Pro mode for typing, with a calm reading voice. Your progress stays separate from the children's.</p> : <div className="field">
        <label htmlFor="childGrade">Class (standard)</label>
        <select id="childGrade" value={grade} onChange={e => setGrade(e.target.value)}>
          <option value="">Not set</option>
          {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{ordinal(i + 1)} standard</option>)}
        </select>
        <small>Used to pick the right difficulty. Older learners can jump ahead.</small>
      </div>}
      <div className="field">
        <label>{adult ? "Pick a picture" : "Pick an animal"}</label>
        <div className="avatars">{AVATARS.map(a => <button type="button" key={a} aria-pressed={a === avatar} onClick={() => setAvatar(a)} aria-label={`Avatar ${a}`}>{a}</button>)}</div>
      </div>
      <div className="row"><button className="btn primary" type="submit" disabled={busy || !name.trim()}>{saveLabel}</button>{onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>}</div>
    </form>
  );
}

// Someone who signed up from "Learn to type (adults)" lands straight on their own typing profile.
const INTENT = "sparklab.intent";
export const setIntent = v => { try { localStorage.setItem(INTENT, v); } catch { /* private mode */ } };
const takeIntent = () => { try { const v = localStorage.getItem(INTENT); localStorage.removeItem(INTENT); return v; } catch { return null; } };

// Kids' mode: the learner picker. Children pick their own profile here; everything for grown-ups
// (adding learners, settings, reports) is in the Parent dashboard, behind the grown-up check.
export default function Profiles() {
  const { api, children, chooseChild, loadAccount, setError } = useApp();
  const nav = useNavigate();
  const [intent] = useState(takeIntent);
  const [adding, setAdding] = useState(intent === "typing" ? "adult" : false); // the "Adults: learn to type" sign-up
  const [asking, setAsking] = useState(false);
  const open = c => { chooseChild(c.id); nav(c.learner === "adult" ? "/learn/typing" : "/learn"); };
  const me = children.find(c => c.learner === "adult");
  useEffect(() => { if (intent === "typing" && me) open(me); }, [me?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const toParent = () => (gatePassed() ? nav("/parent") : setAsking(true));

  const add = async data => {
    try { const c = await api.addChild(data); await loadAccount(); passGate(); open(c); } catch (e) { setError(e.message); }
  };
  const kids = children.filter(c => c.learner !== "adult"), grown = children.filter(c => c.learner === "adult");

  return (
    <>
      <TopBar variant="public"><button className="btn" onClick={toParent}>👪 Parent dashboard <span className="hide-sm">&amp; settings</span></button></TopBar>
      <main className="wrap">
        <div className="who">
          <div className="mode-chip kids">🧒 Kids' mode</div>
          {adding ? (
            <div className="panel" style={{ width: "min(480px, 100%)" }}>
              <h2 className="sec" style={{ marginBottom: 10 }}>Your typing profile</h2>
              <ChildForm adult onSave={add} onCancel={() => setAdding(false)} saveLabel="Start typing" />
            </div>
          ) : children.length ? (
            <>
              <h1>Who's learning today?</h1>
              <div className="kids">
                {kids.map(c => (
                  <button key={c.id} className="kid" onClick={() => open(c)}>
                    <span className="face">{c.avatar}</span>{c.name}
                  </button>
                ))}
                {grown.map(c => (
                  <button key={c.id} className="kid grown" onClick={() => open(c)}>
                    <span className="face">{c.avatar}</span>{c.name}<small className="tag">Grown-up · typing</small>
                  </button>
                ))}
              </div>
              <p className="muted">To add a child, change settings or see reports, open the <button className="linklike" onClick={toParent}>Parent dashboard</button>.</p>
            </>
          ) : (
            <div className="stack" style={{ justifyItems: "center", gap: 12 }}>
              <h1>No learners yet</h1>
              <p className="lead">A grown-up adds children in the Parent dashboard. It takes a minute: just a first name and an animal.</p>
              <button className="btn primary big" onClick={toParent}>👪 Open the Parent dashboard</button>
            </div>
          )}
        </div>
      </main>
      {asking && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setAsking(false)}>
          <div style={{ width: "min(440px, 100%)" }}>
            <ParentGate onPass={() => { setAsking(false); nav("/parent"); }} onCancel={() => setAsking(false)} />
          </div>
        </div>
      )}
    </>
  );
}

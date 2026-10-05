import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";

// The password that unlocks the Parent dashboard from Kids' mode (it's the account's sign-in password).
function ParentPassword() {
  const { api, setError } = useApp();
  const [pw, setPw] = useState("");
  const [again, setAgain] = useState("");
  const [done, setDone] = useState(false);
  const short = pw.length > 0 && pw.length < 8;
  const mismatch = again.length > 0 && pw !== again;
  const save = async e => {
    e.preventDefault();
    try { await api.setPassword(pw); setPw(""); setAgain(""); setDone(true); } catch (er) { setError(er.message); }
  };
  return (
    <form className="pc-card form" style={{ maxWidth: 520 }} onSubmit={save}>
      <h2>🔒 Parent password</h2>
      <p className="muted">Children need this password to leave learner mode and open the Family hub. It's the same password you sign in with.
        {api?.mode !== "demo" ? " Signed up with Google or an email link? Set one here." : " In demo mode it starts as “demo”."}</p>
      <div className="field"><label htmlFor="newpw">New password</label><input id="newpw" type="password" autoComplete="new-password" minLength={8} value={pw} onChange={e => { setPw(e.target.value); setDone(false); }} />
        {short && <small className="error-text">At least 8 characters.</small>}</div>
      <div className="field"><label htmlFor="newpw2">Type it again</label><input id="newpw2" type="password" autoComplete="new-password" value={again} onChange={e => { setAgain(e.target.value); setDone(false); }} />
        {mismatch && <small className="error-text">The two passwords don't match.</small>}</div>
      <div className="row"><button className="btn primary" type="submit" disabled={pw.length < 8 || pw !== again}>Save password</button>{done && <span className="learned">Password saved</span>}</div>
    </form>
  );
}

export default function Account() {
  const { api, user, profile, setProfile, signOut, setError } = useApp();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saved, setSaved] = useState(false);
  const nav = useNavigate();
  const save = async e => { e.preventDefault(); try { setProfile(await api.updateProfile({ display_name: name })); setSaved(true); } catch (er) { setError(er.message); } };
  return (
    <ParentLayout title="Account">
      <form className="pc-card form" style={{ maxWidth: 520 }} onSubmit={save}>
        <div className="field"><label htmlFor="pname">Your name</label><input id="pname" value={name} onChange={e => { setName(e.target.value); setSaved(false); }} /></div>
        <div className="field"><label>Email</label><input value={api?.mode === "demo" ? "Demo account" : user?.email ?? ""} readOnly /></div>
        <div className="row"><button className="btn primary" type="submit">Save</button>{saved && <span className="learned">Saved</span>}</div>
      </form>
      <ParentPassword />
      <section className="pc-card" style={{ maxWidth: 520 }}>
        <h2>Teaching</h2>
        <label className="check-row">
          <input type="checkbox" checked={!!profile?.is_teacher} onChange={async e => { try { setProfile(await api.updateProfile({ is_teacher: e.target.checked })); } catch (er) { setError(er.message); } }} />
          <span><b>I'm a teacher.</b> Create classes, give parents a join code, set typing tasks and see each student's typing progress.</span>
        </label>
        {profile?.is_teacher && <div><Link className="btn" to="/parent/classes">🏫 Go to my classes</Link></div>}
      </section>
      <section className="pc-card" style={{ maxWidth: 520 }}>
        <h2>Sign out</h2>
        <p className="muted">Signs this device out. Your children's progress stays saved in your account.</p>
        <div><button className="btn" onClick={async () => { await signOut(); nav("/"); }}>Sign out</button></div>
      </section>
    </ParentLayout>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";

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

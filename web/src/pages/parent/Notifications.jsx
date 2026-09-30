import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { fmtWhen } from "../../lib/activity.js";

function Toggle({ id, checked, onChange, title, desc }) {
  return (
    <label className="toggle-row" htmlFor={id}>
      <span><b>{title}</b><small>{desc}</small></span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="switch" aria-hidden="true" />
    </label>
  );
}

export default function Notifications() {
  const { api, user, profile, setProfile, children, setError } = useApp();
  const [list, setList] = useState([]);
  useEffect(() => { api?.listNotifications().then(setList).catch(() => setList([])); }, [api]);
  const set = async (k, v) => { try { setProfile(await api.updateProfile({ [k]: v })); } catch (e) { setError(e.message); } };
  const kid = id => children.find(c => c.id === id);
  const status = n => (n.sent_at ? ["sent", "Sent"] : n.error ? ["err", n.error] : ["queued", "Waiting to send"]);
  return (
    <ParentLayout title="Email notifications">
      <section className="pc-card" style={{ maxWidth: 680 }}>
        <p className="muted">Emails go to <b>{api?.mode === "demo" ? "your email (not sent in demo mode)" : user?.email}</b>.</p>
        <Toggle id="n-mile" checked={profile?.notify_milestones ?? true} onChange={v => set("notify_milestones", v)}
          title="Milestones" desc="When a child earns a badge or finishes a whole subject." />
        <Toggle id="n-daily" checked={profile?.notify_daily ?? true} onChange={v => set("notify_daily", v)}
          title="Daily summary" desc="One email each evening (8 pm) with time spent, things learned and quiz scores. Skipped on days with no learning." />
      </section>
      <section className="pc-card">
        <h2>Recent notifications</h2>
        {list.length ? (
          <ul className="feed">
            {list.map(n => { const [cls, txt] = status(n); return (
              <li key={n.id}><span className="what"><b>{n.title}</b>{kid(n.child_id) && <small className="muted"> · {kid(n.child_id).name}</small>}</span><span className={`status ${cls}`}>{txt}</span><time>{fmtWhen(n.created_at)}</time></li>
            ); })}
          </ul>
        ) : <p className="muted">No notifications yet. They appear here when your child reaches a milestone.</p>}
      </section>
    </ParentLayout>
  );
}

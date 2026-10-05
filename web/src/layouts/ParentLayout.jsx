import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { Bolt } from "../components/TopBar.jsx";
import Icon from "../components/Icon.jsx";
import { lockGate } from "../components/ParentGate.jsx";

// The parent menu, in three groups so settings are easy to find.
const GROUPS = (teacher, admin) => [
  { title: "Family", items: [
    { to: "/parent", label: "Overview", icon: "home", end: true },
    { to: "/parent/children", label: "Learners", icon: "users" },
    { to: "/parent/reports", label: "Progress reports", icon: "chart" },
  ] },
  { title: "Settings", items: [
    { to: "/parent/screen-time", label: "Screen time", icon: "clock" },
    { to: "/parent/notifications", label: "Email notifications", icon: "mail" },
    { to: "/parent/voice", label: "Voice & sound", icon: "speaker" },
    { to: "/parent/account", label: "Account", icon: "user" },
  ] },
  { title: "Teach", items: [
    { to: "/parent/guides/roadmap", label: "Teaching guides", icon: "book", match: "/parent/guides" },
    ...(teacher ? [{ to: "/parent/classes", label: "Classes", icon: "school" }] : []),
    ...(admin ? [{ to: "/admin", label: "Content editor", icon: "edit" }] : []),
  ] },
];

export default function ParentLayout({ title, children }) {
  const { api, user, isAdmin, profile, signOut, error, clearError } = useApp();
  const nav = useNavigate();
  const groups = GROUPS(profile?.is_teacher, isAdmin);
  // Handing the device to a child: lock the dashboard again, then open the learner picker.
  const kidsMode = () => { lockGate(); nav("/profiles"); };
  return (
    <div className="pc-shell">
      {api?.mode === "demo" && <div className="mode-banner"><div className="wrap">Demo mode: saved in this browser only. Emails are not sent.</div></div>}
      <header className="pc-top">
        <Link className="brand" to="/parent"><Bolt /><b>Spark Lab</b><span className="pc-tag">Family hub</span></Link>
        <span className="spacer" />
        <span className="pc-user muted">{api?.mode === "demo" ? "Demo account" : user?.email}</span>
        <button className="btn play" onClick={kidsMode}><Icon name="play" size={18} stroke={0} fill="currentColor" /> Start learner mode</button>
        <button className="btn ghost" onClick={async () => { await signOut(); nav("/"); }}>Sign out</button>
      </header>
      <div className="pc-body">
        <nav className="pc-nav" aria-label="Family hub">
          {groups.map(g => (
            <div key={g.title} className="pc-nav-group">
              <div className="pc-nav-h">{g.title}</div>
              {g.items.map(i => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `pc-nav-item${isActive || (i.match && location.hash.includes(i.match)) ? " active" : ""}`}>
                  <Icon name={i.icon} size={20} stroke={1.9} />{i.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <main className="pc-main">
          {title && <h1 className="pc-title">{title}</h1>}
          {children}
        </main>
      </div>
      {error && <div className="toast" role="alert"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}
    </div>
  );
}

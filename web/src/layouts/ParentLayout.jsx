import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { Bolt } from "../components/TopBar.jsx";
import { lockGate } from "../components/ParentGate.jsx";

// The parent menu, in three groups so settings are easy to find.
const GROUPS = (teacher, admin) => [
  { title: "Family", items: [
    { to: "/parent", label: "Overview", icon: "📊", end: true },
    { to: "/parent/children", label: "Learners", icon: "👧" },
    { to: "/parent/reports", label: "Progress reports", icon: "📈" },
  ] },
  { title: "⚙️ Settings", items: [
    { to: "/parent/screen-time", label: "Screen time", icon: "⏱" },
    { to: "/parent/notifications", label: "Email notifications", icon: "✉️" },
    { to: "/parent/voice", label: "Voice & sound", icon: "🔊" },
    { to: "/parent/account", label: "Account", icon: "👤" },
  ] },
  { title: "Teach", items: [
    { to: "/parent/guides/roadmap", label: "Teaching guides", icon: "📘", match: "/parent/guides" },
    ...(teacher ? [{ to: "/parent/classes", label: "Classes", icon: "🏫" }] : []),
    ...(admin ? [{ to: "/admin", label: "Content editor", icon: "🛠️" }] : []),
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
        <Link className="brand" to="/parent"><Bolt /><b>Spark Lab</b><span className="pc-tag">👪 Parent dashboard</span></Link>
        <span className="spacer" />
        <span className="pc-user muted">{api?.mode === "demo" ? "Demo account" : user?.email}</span>
        <button className="btn primary" onClick={kidsMode}>🧒 Start kids' mode</button>
        <button className="btn ghost" onClick={async () => { await signOut(); nav("/"); }}>Sign out</button>
      </header>
      <div className="pc-body">
        <nav className="pc-nav" aria-label="Parent area">
          {groups.map(g => (
            <div key={g.title} className="pc-nav-group">
              <div className="pc-nav-h">{g.title}</div>
              {g.items.map(i => (
                <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `pc-nav-item${isActive || (i.match && location.hash.includes(i.match)) ? " active" : ""}`}>
                  <span aria-hidden="true">{i.icon}</span>{i.label}
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

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { Bolt } from "../components/TopBar.jsx";

const ITEMS = [
  { to: "/parent", label: "Overview", icon: "📊", end: true },
  { to: "/parent/children", label: "Children", icon: "👧" },
  { to: "/parent/reports", label: "Progress reports", icon: "📈" },
  { to: "/parent/screen-time", label: "Screen time", icon: "⏱" },
  { to: "/parent/notifications", label: "Notifications", icon: "✉️" },
  { to: "/parent/voice", label: "Voice & sound", icon: "🔊" },
  { to: "/parent/guides/roadmap", label: "Teaching guides", icon: "📘", match: "/parent/guides" },
  { to: "/parent/account", label: "Account", icon: "👤" },
];

export default function ParentLayout({ title, children }) {
  const { api, user, isAdmin, signOut, error, clearError } = useApp();
  const nav = useNavigate();
  const items = isAdmin ? [...ITEMS.slice(0, -1), { to: "/admin", label: "Content editor", icon: "🛠️" }, ITEMS.at(-1)] : ITEMS;
  return (
    <div className="pc-shell">
      {api?.mode === "demo" && <div className="mode-banner"><div className="wrap">Demo mode: saved in this browser only. Emails are not sent.</div></div>}
      <header className="pc-top">
        <Link className="brand" to="/parent"><Bolt /><b>Spark Lab</b><span className="pc-tag">Parents</span></Link>
        <span className="spacer" />
        <span className="pc-user muted">{api?.mode === "demo" ? "Demo account" : user?.email}</span>
        <Link className="btn primary" to="/profiles">Back to kids</Link>
        <button className="btn ghost" onClick={async () => { await signOut(); nav("/"); }}>Sign out</button>
      </header>
      <div className="pc-body">
        <nav className="pc-nav" aria-label="Parent area">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({ isActive }) => `pc-nav-item${isActive || (i.match && location.hash.includes(i.match)) ? " active" : ""}`}>
              <span aria-hidden="true">{i.icon}</span>{i.label}
            </NavLink>
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

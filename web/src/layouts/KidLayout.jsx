import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { starCount } from "../lib/progress.js";
import { AREAS } from "../content/areas.js";
import { Bolt } from "../components/TopBar.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import ParentGate, { gatePassed, passGate } from "../components/ParentGate.jsx";

const fmtLeft = s => (s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min` : `${Math.ceil(s / 60)} min`);

export const NAV = [
  { to: "/learn", label: "Home", icon: "🏠", end: true },
  ...AREAS.map(a => ({ to: `/learn/area/${a.id}`, label: a.id === "science" ? "Science" : a.title, icon: a.emoji })),
  { to: "/learn/badges", label: "Badges", icon: "🏅" },
];

function AccountMenu() {
  const { activeChild, signOut } = useApp();
  const [open, setOpen] = useState(false);
  const [gate, setGate] = useState(null); // "parent" | "signout" while waiting for the grown-up check
  const nav = useNavigate();
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);
  const doSignOut = async () => { await signOut(); nav("/"); };
  // A grown-up's own profile doesn't need the grown-up check.
  const needGate = action => {
    setOpen(false);
    if (activeChild.learner === "adult") passGate();
    if (gatePassed()) { action === "parent" ? nav("/parent") : doSignOut(); } else setGate(action);
  };
  return (
    <div className="acct" ref={ref}>
      <button className="acct-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="av">{activeChild.avatar}</span><span className="nm">{activeChild.name}</span><span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="acct-menu" role="menu">
          <Link role="menuitem" to="/profiles" onClick={() => setOpen(false)}>🔁 Switch learner</Link>
          <button role="menuitem" onClick={() => needGate("parent")}>👪 Parent dashboard &amp; settings</button>
          <button role="menuitem" onClick={() => needGate("signout")}>🚪 Sign out</button>
        </div>
      )}
      {gate && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setGate(null)}>
          <div style={{ width: "min(440px, 100%)" }}>
            <ParentGate onPass={() => { const g = gate; setGate(null); g === "parent" ? nav("/parent") : doSignOut(); }} onCancel={() => setGate(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

function TimesUp() {
  const { activeChild, screen } = useApp();
  const [asking, setAsking] = useState(false);
  return (
    <div className="overlay timesup" role="dialog" aria-modal="true" aria-labelledby="tu-title">
      <div className="card tu-card">
        {asking ? (
          <ParentGate onPass={() => { setAsking(false); screen.grantExtra(15); }} onCancel={() => setAsking(false)} title="Add 15 more minutes?" />
        ) : (
          <div className="stack" style={{ gap: 14, textAlign: "center", padding: 24 }}>
            <div style={{ fontSize: "4rem" }}>🌙</div>
            <h2 id="tu-title" style={{ fontSize: "2rem" }}>Time's up for today, {activeChild.name}!</h2>
            <p className="lead" style={{ margin: "0 auto" }}>Great learning! Your stars and badges are saved. Come back tomorrow for more.</p>
            <div className="row center-row">
              <Link className="btn big" to="/profiles">Switch child</Link>
              <button className="btn ghost" onClick={() => setAsking(true)}>Grown-up: add time</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KidLayout({ children }) {
  const { api, activeChild, childData, screen, notice, clearNotice, error, clearError } = useApp();
  useEffect(() => { screen.setKidActive(true); return () => screen.setKidActive(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!notice) return; const t = setTimeout(clearNotice, 8000); return () => clearTimeout(t); }, [notice, clearNotice]);
  // A new page starts at the top, and keyboard and screen-reader users start at its content.
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const firstPage = useRef(true);
  useEffect(() => {
    if (firstPage.current) { firstPage.current = false; return; }
    window.scrollTo({ top: 0 });
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname]);
  const low = screen.remaining != null && screen.remaining <= 300;
  return (
    <div className="kid-shell">
      {api?.mode === "demo" && <div className="mode-banner"><div className="wrap">Demo mode: saved in this browser only.</div></div>}
      <header className="kid-top">
        <Link className="brand" to="/learn" aria-label="Spark Lab home"><Bolt /><b>Spark Lab</b></Link>
        <span className="spacer" />
        {screen.remaining != null && <span className={`pill time${low ? " low" : ""}`} title="Learning time left today">⏱ {fmtLeft(screen.remaining)}</span>}
        <span className="pill" title="Stars earned">★ {starCount(childData)}</span>
        {activeChild && <AccountMenu />}
      </header>
      <div className="kid-body">
        <nav className="kid-nav" aria-label="Main">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `kid-nav-item${isActive ? " active" : ""}`}>
              <span className="ic" aria-hidden="true">{n.icon}</span><span className="lb">{n.label}</span>
            </NavLink>
          ))}
        </nav>
        <main className="kid-main" ref={mainRef} tabIndex={-1}><ErrorBoundary key={pathname} home="#/learn">{children}</ErrorBoundary></main>
      </div>
      {screen.timesUp && <TimesUp />}
      {(notice || error) && (
        <div className="toast" role="status">
          <span>{error ?? notice}</span>
          <button onClick={error ? clearError : clearNotice}>OK</button>
        </div>
      )}
    </div>
  );
}

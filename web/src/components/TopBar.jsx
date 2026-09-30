import { Link } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { starCount } from "../lib/progress.js";

export function Bolt() {
  return <span className="bolt" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#16233F" /></svg></span>;
}

export default function TopBar({ variant = "kid", children }) {
  const { api, activeChild, childData, error, clearError } = useApp();
  return (
    <>
      {api?.mode === "demo" && (
        <div className="mode-banner"><div className="wrap">Demo mode: everything is saved in this browser only. Connect Supabase to save progress across devices.</div></div>
      )}
      <header className="topbar">
        <div className="wrap">
          <Link className="brand" to={variant === "kid" && activeChild ? "/learn" : "/"}><Bolt /><b>Spark Lab</b></Link>
          <span className="spacer" />
          {children}
          {variant === "kid" && activeChild && (
            <>
              <span className="pill" title="Stars earned">★ {starCount(childData)}</span>
              <Link className="pill kid-pill" to="/profiles" title="Switch child"><span className="av">{activeChild.avatar}</span>{activeChild.name}</Link>
            </>
          )}
        </div>
      </header>
      {error && <div className="toast" role="alert"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}
    </>
  );
}

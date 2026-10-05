import { Link } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";
import { starCount } from "../lib/progress.js";
import { Avatar } from "./Character.jsx";

export const Star = () => <svg className="star-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="var(--spark)" stroke="var(--spark-dark)" strokeWidth="1.5" strokeLinejoin="round" /></svg>;
export const Flame = () => <svg className="flame-ic" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-13-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 9 0 4 3 7 7 7z" fill="#F07C2E" /></svg>;

// The Spark Lab mark: a four-point spark with a yellow dot.
export function Bolt() {
  return <span className="bolt" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 1l2.6 8.4L23 12l-8.4 2.6L12 23l-2.6-8.4L1 12l8.4-2.6z" fill="var(--brand)" /><circle cx="18.5" cy="5.5" r="2.5" fill="var(--spark)" /></svg></span>;
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
              <span className="pill" title="Stars earned"><Star /> {starCount(childData)}</span>
              <Link className="pill kid-pill" to="/profiles" title="Switch child"><Avatar value={activeChild.avatar} size="xs" />{activeChild.name}</Link>
            </>
          )}
        </div>
      </header>
      {error && <div className="toast" role="alert"><span>{error}</span><button onClick={clearError}>Dismiss</button></div>}
    </>
  );
}

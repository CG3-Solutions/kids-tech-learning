import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../lib/AppContext.jsx";

const WAIT_AFTER = 5;      // wrong tries before a pause
const WAIT_SECONDS = 30;   // the pause, so a child can't keep guessing

// The grown-up check before the Parent dashboard: the parent's own account password.
// Accounts made with Google or an email link may have no password: they can get a sign-in
// link by email instead (opening it proves it's the parent), and set a password in Settings.
export default function ParentGate({ onPass, onCancel, title = "Parent password" }) {
  const { api, user } = useApp();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [wrong, setWrong] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const input = useRef(null);
  useEffect(() => {
    if (waitUntil <= now) return;
    const t = setTimeout(() => setNow(Date.now()), 500);
    return () => clearTimeout(t);
  }, [waitUntil, now]);
  const waiting = Math.max(0, Math.ceil((waitUntil - now) / 1000));
  const demo = api?.mode === "demo";

  const submit = async e => {
    e.preventDefault();
    if (!value || busy || waiting) return;
    setBusy(true); setMsg(null);
    try {
      if (await api.verifyPassword(value)) { passGate(); onPass(); return; }
      const n = wrong + 1;
      setWrong(n); setValue("");
      if (n % WAIT_AFTER === 0) { setWaitUntil(Date.now() + WAIT_SECONDS * 1000); setNow(Date.now()); }
      setMsg({ error: true, text: "That password isn't right." });
      input.current?.focus();
    } catch (er) {
      setMsg({ error: true, text: er.message });
    } finally { setBusy(false); }
  };
  const sendLink = async () => {
    setMsg(null);
    try { await api.sendLink(user.email); setMsg({ text: `We emailed a sign-in link to ${user.email}. Open it on this device to go to the Parent dashboard.` }); }
    catch (er) { setMsg({ error: true, text: er.message }); }
  };

  return (
    <form className="auth" onSubmit={submit}>
      <div className="eyebrow">👪 Parent dashboard · grown-ups only</div>
      <h1 style={{ fontSize: "1.8rem" }}>{title}</h1>
      <p className="muted">Enter the password you use to sign in to Spark Lab{user?.email && !demo ? <> (<b>{user.email}</b>)</> : null}.</p>
      <div className="field">
        <label htmlFor="gate">Password</label>
        <input id="gate" ref={input} type="password" autoComplete="current-password" value={value} onChange={e => setValue(e.target.value)} autoFocus disabled={!!waiting} />
        {demo && <small>Demo mode: the password is <b>demo</b>, unless you changed it in Settings → Account.</small>}
      </div>
      {msg && <div className={`note${msg.error ? " error" : ""}`} role="status">{msg.text}</div>}
      {waiting > 0 && <div className="note error" role="status">Too many tries. Wait {waiting} seconds.</div>}
      <div className="row">
        <button className="btn primary" type="submit" disabled={busy || !value || !!waiting}>{busy ? "Checking…" : "Continue"}</button>
        {onCancel ? <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button> : <Link className="btn ghost" to="/profiles">Back to kids' mode</Link>}
      </div>
      {!demo && user?.email && (
        <p className="muted small-note">Signed up with Google or an email link, or forgot your password? <button type="button" className="linklike" onClick={sendLink}>Email me a sign-in link</button></p>
      )}
    </form>
  );
}

// Parent mode vs kids' mode on a shared device:
// - signing in, or a grown-up's own profile, opens parent mode (passGate);
// - "Start kids' mode" locks it again (lockGate), so children need the password to get back.
export const passGate = () => { try { sessionStorage.setItem("sparklab.gate", "1"); } catch { /* private mode */ } };
export const lockGate = () => { try { sessionStorage.removeItem("sparklab.gate"); } catch { /* private mode */ } };
export const gatePassed = () => { try { return sessionStorage.getItem("sparklab.gate") === "1"; } catch { return false; } };

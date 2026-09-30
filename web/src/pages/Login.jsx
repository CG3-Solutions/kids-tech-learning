import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { useApp } from "../lib/AppContext.jsx";

export default function Login() {
  const { api, user } = useApp();
  const nav = useNavigate();
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => { if (user) nav("/profiles", { replace: true }); }, [user, nav]);
  if (!api) return null;
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const act = async fn => {
    setBusy(true); setMsg(null);
    try { await fn(); } catch (e) { setMsg({ error: true, text: e.message }); } finally { setBusy(false); }
  };

  if (api.mode === "demo") {
    return (
      <>
        <TopBar variant="public" />
        <main className="wrap">
          <div className="auth">
            <div className="eyebrow">Demo mode</div>
            <h1 style={{ fontSize: "1.8rem" }}>Try Spark Lab</h1>
            <p className="muted">Accounts aren't connected yet, so everything is saved in this browser. You can add children, track progress and try the content editor.</p>
            <button className="btn primary big" onClick={() => act(() => api.signInDemo())}>Start the demo</button>
          </div>
        </main>
      </>
    );
  }

  const submit = e => {
    e.preventDefault();
    if (mode === "signin") act(() => api.signIn(form.email, form.password));
    else act(async () => {
      const { needsConfirm } = await api.signUp(form.email, form.password, form.name);
      if (needsConfirm) setMsg({ text: `We sent a confirmation link to ${form.email}. Open it to finish signing up.` });
    });
  };

  return (
    <>
      <TopBar variant="public" />
      <main className="wrap">
        <form className="auth" onSubmit={submit}>
          <div className="eyebrow">For parents</div>
          <h1 style={{ fontSize: "1.8rem" }}>{mode === "signin" ? "Welcome back" : "Create your parent account"}</h1>
          {api.features.google && (
            <>
              <button type="button" className="btn big" disabled={busy} onClick={() => act(() => api.signInGoogle())}>Continue with Google</button>
              <div className="divider">or use email</div>
            </>
          )}
          {mode === "signup" && (
            <div className="field"><label htmlFor="name">Your name</label><input id="name" autoComplete="name" value={form.name} onChange={set("name")} required /></div>
          )}
          <div className="field"><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} required /></div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" minLength={8} autoComplete={mode === "signin" ? "current-password" : "new-password"} value={form.password} onChange={set("password")} required />
            {mode === "signup" && <small>At least 8 characters.</small>}
          </div>
          {msg && <div className={`note ${msg.error ? "error" : "ok"}`} role="status">{msg.text}</div>}
          <button className="btn primary big" type="submit" disabled={busy}>{mode === "signin" ? "Sign in" : "Create account"}</button>
          {mode === "signin" && (
            <button type="button" className="btn ghost" disabled={busy || !form.email}
              onClick={() => act(async () => { await api.sendLink(form.email); setMsg({ text: `Check ${form.email} for a sign-in link.` }); })}>
              Forgot password? Email me a sign-in link
            </button>
          )}
          <p className="muted">
            {mode === "signin" ? "New here? " : "Already have an account? "}
            <button type="button" className="btn ghost" style={{ padding: "2px 10px" }} onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMsg(null); }}>
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
          <p className="muted" style={{ fontSize: ".85rem" }}>Children never need an email. You add them as profiles after signing in. <Link to="/">Back home</Link></p>
        </form>
      </main>
    </>
  );
}

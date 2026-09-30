import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

// A grown-up check before the parent area: a multiplication a 7-year-old usually can't do yet.
export default function ParentGate({ onPass, onCancel, title = "Ask a grown-up to answer" }) {
  const [a, b] = useMemo(() => [6 + Math.floor(Math.random() * 4), 6 + Math.floor(Math.random() * 4)], []);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);
  const submit = e => {
    e.preventDefault();
    if (Number(value) === a * b) { sessionStorage.setItem("sparklab.gate", "1"); onPass(); }
    else { setWrong(true); setValue(""); }
  };
  return (
    <form className="auth" onSubmit={submit}>
      <div className="eyebrow">Grown-ups only</div>
      <h1 style={{ fontSize: "1.8rem" }}>{title}</h1>
      <div className="field">
        <label htmlFor="gate">What is {a} × {b}?</label>
        <input id="gate" inputMode="numeric" autoComplete="off" value={value} onChange={e => setValue(e.target.value)} autoFocus />
      </div>
      {wrong && <div className="note error">That's not right. Try again.</div>}
      <div className="row"><button className="btn primary" type="submit">Continue</button>{onCancel ? <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button> : <Link className="btn ghost" to="/learn">Back to learning</Link>}</div>
    </form>
  );
}

export const gatePassed = () => { try { return sessionStorage.getItem("sparklab.gate") === "1"; } catch { return false; } };

import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { passGate } from "../components/ParentGate.jsx";
import TopBar from "../components/TopBar.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { setIntent } from "./Profiles.jsx";

const TILES = [["🔋", "var(--lv1)"], ["💡", "var(--lv1)"], ["⚙️", "var(--lv2)"], ["🧠", "var(--lv4)"], ["🔢", "var(--lv2)"], ["🤖", "var(--lv3)"], ["🔌", "var(--lv0)"], ["🖥️", "var(--lv4)"], ["⭐", "var(--lv3)"]];

export default function Landing() {
  const { api, user, published } = useApp();
  const nav = useNavigate();
  // Just came back from an email link or Google: it's the parent, so open the Parent dashboard.
  useEffect(() => {
    if (!api?.freshSignIn || !user) return;
    api.freshSignIn = false;
    passGate();
    let typing = false;
    try { typing = localStorage.getItem("sparklab.intent") === "typing"; } catch { /* private mode */ }
    nav(typing ? "/profiles" : "/parent", { replace: true });
  }, [api, user, nav]);
  return (
    <>
      <TopBar variant="public">
        {user ? <Link className="btn" to="/parent">👪 Parent dashboard</Link> : <Link className="btn" to="/login">👪 Parent sign in</Link>}
      </TopBar>
      <main className="wrap stack">
        <section className="hero">
          <div className="stack" style={{ gap: 18 }}>
            <div className="eyebrow">For learners from 1st to 12th standard, and grown-ups learning to type</div>
            <h1>How do machines <em>really</em> work?</h1>
            <p className="lead">Spark Lab teaches language, maths, electricity, computers, binary, coding and touch typing with story guides, hands-on games and quizzes. Parents follow each child's progress.</p>
            {user ? (
              <div className="row">
                <Link className="btn primary big" to="/profiles">🧒 Kids' mode: start learning</Link>
                <Link className="btn big" to="/parent">👪 Parent dashboard</Link>
              </div>
            ) : (
              <div className="row">
                <Link className="btn primary big" to="/login">👪 Parents: sign in or sign up free</Link>
                <Link className="btn big" to="/login" onClick={() => setIntent("typing")}>⌨️ Adults: learn to type</Link>
                <a className="btn big ghost" href="#subjects">See the subjects</a>
              </div>
            )}
            <p className="muted small-note">{user ? "Kids' mode is for children. The Parent dashboard (settings, reports, screen time) asks for the parent password first." : "Only grown-ups have accounts. After signing in, open Kids' mode on this device for your children: no email or password for them."}</p>
          </div>
          <div className="hero-board" aria-hidden="true">{TILES.map(([e, c], i) => <div key={i} style={{ "--c": c }}>{e}</div>)}</div>
        </section>

        <section className="stack" id="subjects" style={{ gap: 14 }}>
          <h2 className="sec">Subjects</h2>
          <div className="features">
            {(published?.modules ?? []).map(m => (
              <div className="feature" key={m.id} style={{ borderTop: `6px solid var(--${m.color})` }}>
                <div style={{ fontSize: "2.2rem" }}>{m.emoji}</div><h3>{m.title}</h3><p>{m.tagline}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stack" style={{ gap: 14 }}>
          <h2 className="sec">Made for learning together</h2>
          <div className="features">
            <div className="feature"><h3>Real life first</h3><p>Every part links to things at home: the fan regulator, the fridge light, the TV remote.</p></div>
            <div className="feature"><h3>Hands-on games</h3><p>Close a circuit, flip binary cards, and program a robot through a maze.</p></div>
            <div className="feature"><h3>Read to me</h3><p>Cards read themselves aloud, so early readers can explore on their own.</p></div>
            <div className="feature"><h3>Progress for parents</h3><p>Stars, badges and a “teach this next” suggestion for each child.</p></div>
            <div className="feature"><h3>Safe for kids</h3><p>Only parents have accounts. Children get a name and an animal avatar, never an email.</p></div>
          </div>
        </section>
      </main>
    </>
  );
}

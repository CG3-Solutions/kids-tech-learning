import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { passGate } from "../components/ParentGate.jsx";
import TopBar from "../components/TopBar.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { setIntent } from "./Profiles.jsx";
import { AREAS, areaStyle } from "../content/areas.js";
import { Guide } from "../components/Character.jsx";
import Scene from "../components/Scene.jsx";
import Icon from "../components/Icon.jsx";

// What each area covers, for the subject cards.
const INSIDE = {
  language: ["Alphabet and phonics", "Words and spelling", "Sentences and grammar"],
  maths: ["Counting and place value", "Adding to algebra", "Up to 10th standard"],
  science: ["Circuits and logic gates", "Inside a computer and binary", "Circuit Lab and coding puzzles"],
  typing: ["33 lessons in six stages", "Games and a speed ladder", "Printable certificates"],
};

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
      <div className="play-screen landing-hero">
        <Scene />
        <TopBar variant="public">
          {user ? <Link className="btn" to="/parent"><Icon name="lock" size={18} /> Family hub</Link> : <Link className="btn" to="/login">Grown-ups: sign in</Link>}
        </TopBar>
        <section className="wrap lh">
          <div className="lh-txt">
            <span className="lh-chip">For curious kids from 1st to 12th standard, and grown-ups learning to type</span>
            <h1>Learning that feels like play.</h1>
            <p className="lh-lead">Language, maths, science and typing adventures with friendly guides, hands-on labs and quizzes, and clear progress reports for parents and teachers.</p>
            {user ? (
              <div className="row">
                <Link className="btn primary big" to="/profiles"><Icon name="play" size={22} stroke={0} fill="currentColor" /> Start learning</Link>
                <Link className="btn big" to="/parent">Family hub</Link>
              </div>
            ) : (
              <div className="row">
                <Link className="btn primary big" to="/login">Parents: sign up free</Link>
                <Link className="btn big" to="/login" onClick={() => setIntent("typing")}>Adults: learn to type</Link>
              </div>
            )}
            <p className="lh-note">{user ? "Learner mode is for children. The Family hub (settings, reports, screen time) asks for your password first." : "Only grown-ups have accounts. Children get a first name and an animal avatar, never an email."}</p>
          </div>
          <div className="lh-crew" aria-hidden="true">
            <span className="lh-bubble">Ready for an adventure?</span>
            <Guide id="volt" size={130} className="c1" /><Guide id="chip" size={130} className="c2" /><Guide id="bit" size={100} className="c3" />
            <Guide id="ollie" size={170} className="c4" /><Guide id="polly" size={150} className="c5" /><Guide id="keyo" size={150} className="c6" />
          </div>
        </section>
      </div>

      <main className="wrap stack landing-body">
        <section className="stack" id="subjects" style={{ gap: 18 }}>
          <h2 className="sec">Four subjects, one clear path</h2>
          <div className="lworlds">
            {AREAS.map(a => (
              <div className="lworld" key={a.id} style={areaStyle(a.id)}>
                <Guide id={a.guide} size={110} />
                <h3>{a.title}</h3>
                <p>{a.tagline}, {a.with}.</p>
                <ul>{INSIDE[a.id].map(t => <li key={t}>{t}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="stack" style={{ gap: 14 }}>
          <h2 className="sec">Made for learning together</h2>
          <div className="features">
            <div className="feature"><h3>Real life first</h3><p>Every idea links to things at home: the fan regulator, the fridge light, the TV remote.</p></div>
            <div className="feature"><h3>Hands-on games</h3><p>Build circuits, flip binary cards, program a robot through a maze, race the typing pacer.</p></div>
            <div className="feature"><h3>Read to me</h3><p>Lessons read themselves aloud, so early readers can explore on their own.</p></div>
            <div className="feature"><h3>Progress for parents</h3><p>A weekly summary, skills that need practice and what to teach next.</p></div>
            <div className="feature"><h3>Safe for kids</h3><p>Only grown-ups have accounts. A password protects settings and reports.</p></div>
          </div>
        </section>
      </main>
    </>
  );
}

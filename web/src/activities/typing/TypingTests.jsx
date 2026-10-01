import { useState } from "react";
import TimedRun from "./TimedRun.jsx";
import GameResult from "./GameResult.jsx";
import Certificate from "./Certificate.jsx";
import { TESTS, TEST_ACC, testText } from "../../content/typing.js";
import { sfx } from "../../lib/sfx.js";
import { MAX_HUMAN_WPM } from "../../lib/typing.js";

const fmtDate = iso => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Typing tests: 1, 3 or 5 minutes of real text. 90% accuracy earns a printable certificate.
export default function TypingTests({ mode, pool, name, sessions, onResult }) {
  const [minutes, setMinutes] = useState(null);
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);
  const [cert, setCert] = useState(null);
  const certs = sessions.filter(s => s.lesson_id?.startsWith("test-") && s.passed);
  const best = m => sessions.filter(s => s.lesson_id === `test-${m}`).reduce((a, s) => Math.max(a, s.wpm), 0);

  const finish = ({ r, input }) => {
    // No certificate for impossible speeds (a stuck key or a typing robot).
    const won = r.accuracy >= TEST_ACC && r.chars > 0 && r.wpm <= MAX_HUMAN_WPM;
    if (won) sfx.tada(); else sfx.ding();
    const session = onResult({ minutes, r, won, input });
    setRes({ r, won, session });
  };

  if (cert) return <Certificate name={name} session={cert} onClose={() => setCert(null)} />;
  if (minutes && res) {
    const { r, won, session } = res;
    return (
      <GameResult mode={mode} won={won}
        title={won ? `📜 ${r.wpm} words a minute: certificate earned!` : `${r.wpm} words a minute`}
        say={won ? `Brilliant! ${r.wpm} words a minute. You earned a certificate!` : `${r.wpm} words a minute. For a certificate you need ${TEST_ACC} percent accuracy.`}
        stats={[["Speed", r.wpm, "words a minute"], ["Accuracy", `${r.accuracy}%`, `${TEST_ACC}% for a certificate`], ["Typed", r.chars, `keys in ${minutes} min · ${r.errors} mistakes`]]}
        note={won ? null : "Slow down a little: accuracy first, and the speed will follow."}
        onAgain={() => { setRes(null); setRun(n => n + 1); }} againLabel="↻ Take the test again" onBack={() => { setRes(null); setMinutes(null); }}>
        {won && session && <div className="row"><button className="btn" onClick={() => setCert(session)}>📜 View certificate</button></div>}
      </GameResult>
    );
  }
  if (minutes) {
    return (
      <TimedRun key={`${minutes}-${run}`} pool={pool} mode={mode} seconds={minutes * 60} textFn={testText} onEnd={finish}
        intro={<p className="lead">A <b>{minutes}-minute</b> typing test. Type the text as well as you can; the clock starts with your first key. {TEST_ACC}% accuracy earns a certificate.</p>}
        top={({ s, elapsed }) => {
          const wpm = elapsed > 2 ? Math.round((s.pos / 5) / (elapsed / 60)) : 0;
          return <div className="clock-score"><b>{wpm}</b><span>words a minute</span></div>;
        }} />
    );
  }
  return (
    <div className="stack">
      <p className="muted">Real sentences, timed. Tests use only keys you've learned. Reach {TEST_ACC}% accuracy for a certificate you can print.</p>
      <div className="game-grid">
        {TESTS.map(m => (
          <button key={m} className="game-card" onClick={() => { setRes(null); setMinutes(m); }}>
            <span className="game-em" aria-hidden="true">⏱️</span>
            <b>{m}-minute test</b>
            <small>{m === 1 ? "A quick check" : m === 3 ? "The standard test" : "For stamina"}</small>
            <span className="game-meta">{best(m) ? <span className="game-rec">Your best: {best(m)} wpm</span> : <span className="tag">Not taken yet</span>}</span>
          </button>
        ))}
      </div>
      <h3>📜 Your certificates</h3>
      {certs.length ? (
        <ul className="cert-list">
          {certs.slice(0, 12).map(c => (
            <li key={c.id}><button className="btn ghost" onClick={() => setCert(c)}>📜 {c.wpm} wpm · {c.accuracy}% · {c.lesson_id.slice(5)}-minute test · {fmtDate(c.created_at)}</button></li>
          ))}
        </ul>
      ) : <p className="muted">No certificates yet. Take a test with {TEST_ACC}% accuracy to earn one.</p>}
    </div>
  );
}

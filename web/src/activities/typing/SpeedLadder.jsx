import { useState } from "react";
import TimedRun from "./TimedRun.jsx";
import GameResult from "./GameResult.jsx";
import { RaceTrack } from "./Visuals.jsx";
import { KeyoFace } from "../../components/journey/Guide.jsx";
import { LADDER, LADDER_ACC } from "../../content/typing.js";
import { sfx } from "../../lib/sfx.js";

const SECONDS = 60;

// The speed ladder: each rung is a 1-minute test at a target speed. Climb by reaching the speed
// with at least 90% accuracy, racing a pacer who types at exactly that speed.
export default function SpeedLadder({ mode, pool, climbed, onResult }) {
  const kids = mode !== "pro";
  const [view, setView] = useState("ladder"); // ladder | run | result
  const [rung, setRung] = useState(Math.min(climbed, LADDER.length - 1));
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);
  const target = LADDER[rung];

  const start = i => { setRung(i); setRes(null); setRun(n => n + 1); setView("run"); };
  const finish = ({ r, input }) => {
    const won = r.wpm >= target && r.accuracy >= LADDER_ACC;
    if (won) sfx.tada(); else sfx.oops();
    setRes({ r, won });
    setView("result");
    onResult({ rung, target, r, won, input });
  };

  if (view === "run") {
    return (
      <TimedRun key={run} pool={pool} mode={mode} seconds={SECONDS} onEnd={finish}
        intro={<p className="lead">Rung {rung + 1}: type <b>{target} words a minute</b> for one minute, with at least {LADDER_ACC}% accuracy. The pacer types at exactly that speed. Stay ahead of it!</p>}
        top={({ s, elapsed }) => (
          <RaceTrack you={s.pos / (target * 5)} ghost={elapsed / SECONDS} youIcon={kids ? "🐱" : "🏃"} ghostIcon="👻" ghostLabel={`${target} wpm`} />
        )} />
    );
  }

  if (view === "result" && res) {
    const { r, won } = res;
    const short = r.accuracy < LADDER_ACC ? `Accuracy ${r.accuracy}% (needs ${LADDER_ACC}%). Slow down a little and press each key carefully.` : `Speed ${r.wpm} (needs ${target}). Keep a steady rhythm.`;
    const nextRung = rung + 1 < LADDER.length ? rung + 1 : null;
    return (
      <GameResult mode={mode} won={won}
        title={won ? `🪜 You climbed to ${target} words a minute!` : "Not this time. You're getting faster!"}
        say={won ? `Amazing! You climbed to ${target} words a minute!` : `Good try! You typed ${r.wpm} words a minute. Let's try again.`}
        stats={[["Speed", r.wpm, `goal ${target}`], ["Accuracy", `${r.accuracy}%`, `goal ${LADDER_ACC}%`], ["Best streak", r.bestStreak ?? "—", "keys in a row"]]}
        note={won ? null : short}
        onAgain={() => start(won && nextRung != null ? nextRung : rung)} againLabel={won && nextRung != null ? `Next rung: ${LADDER[nextRung]} wpm →` : "↻ Try again"}
        onBack={() => setView("ladder")} />
    );
  }

  return (
    <div className="stack">
      <div className="map-head">
        {kids && <KeyoFace size={64} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3>🪜 Speed ladder</h3>
          <p className="muted">One minute per rung. Reach the speed with {LADDER_ACC}% accuracy to climb. {climbed} of {LADDER.length} rungs climbed.</p>
        </div>
      </div>
      <ol className="speed-ladder" reversed>
        {LADDER.map((w, i) => ({ w, i })).reverse().map(({ w, i }) => {
          const done = i < climbed, isNext = i === climbed, open = i <= climbed;
          return (
            <li key={w} className={`${done ? "done" : ""}${isNext ? " next" : ""}`}>
              <button disabled={!open} onClick={() => start(i)} aria-label={`${w} words a minute${done ? ", climbed" : open ? "" : ", locked"}`}>
                <span className="rung-w">{w}</span><span className="rung-u">words a minute</span>
                <span className="rung-m">{done ? "✓" : isNext ? (kids ? "🐱 Climb!" : "Try it") : "🔒"}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

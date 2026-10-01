import { useRef, useState } from "react";
import TimedRun from "../TimedRun.jsx";
import GameResult from "../GameResult.jsx";
import { sfx } from "../../../lib/sfx.js";

// Combo: every 20 keys in a row without a mistake adds one to the multiplier (up to ×4).
export const comboOf = streak => Math.min(4, 1 + Math.floor(streak / 20));

// Beat the Clock: 60 seconds, points for every key, more for long streaks.
export default function BeatTheClock({ mode, pool, best, onResult, onBack }) {
  const [score, setScore] = useState(0);
  const pts = useRef(0);
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);
  const onPress = (before, after) => {
    if (after.pos > before.pos) { pts.current += comboOf(before.streak); setScore(pts.current); }
  };
  const finish = ({ r, input }) => {
    const won = pts.current > best;
    if (won) sfx.tada(); else sfx.ding();
    setRes({ r, score: pts.current, won });
    onResult({ r, won, input, score: pts.current });
  };
  if (res) {
    return (
      <GameResult mode={mode} won={res.won}
        title={res.won ? `⏱️ New high score: ${res.score}!` : `${res.score} points!`}
        say={res.won ? `New high score! ${res.score} points!` : `${res.score} points! Your best is ${best}. Try again!`}
        stats={[["Score", res.score, best ? `best ${Math.max(best, res.score)}` : "first try"], ["Speed", res.r.wpm, "words a minute"], ["Best streak", res.r.bestStreak, "keys in a row"]]}
        note="Tip: long streaks without mistakes score double, triple and more."
        onAgain={() => { pts.current = 0; setScore(0); setRes(null); setRun(n => n + 1); }} onBack={onBack} />
    );
  }
  return (
    <TimedRun key={run} pool={pool} mode={mode} seconds={60} onPress={onPress} onEnd={finish}
      intro={<p className="lead">60 seconds. Every key scores a point; 20 keys in a row without a mistake scores ×2, then ×3 and ×4.{best ? ` Your best: ${best}.` : ""}</p>}
      top={({ s }) => (
        <div className="clock-score">
          <b>{score}</b><span>points</span>
          <span className={`combo x${comboOf(s.streak)}`}>×{comboOf(s.streak)}</span>
        </div>
      )} />
  );
}

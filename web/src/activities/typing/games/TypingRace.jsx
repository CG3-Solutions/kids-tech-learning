import { useState } from "react";
import TimedRun from "../TimedRun.jsx";
import GameResult from "../GameResult.jsx";
import { RaceTrack } from "../Visuals.jsx";
import { sfx } from "../../../lib/sfx.js";

// Typing Race: race a ghost of your own best run (or a pacer, the first time).
export default function TypingRace({ mode, pool, ghostWpm, isBest, onResult, onBack }) {
  const kids = mode !== "pro";
  const length = kids ? 80 : 170;
  const ghostTime = (length / 5 / ghostWpm) * 60;
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);
  const finish = ({ r, elapsed, s, input }) => {
    const won = s.pos >= s.text.length && elapsed <= ghostTime;
    if (won) sfx.tada(); else sfx.oops();
    setRes({ r, won, elapsed });
    onResult({ r, won, input });
  };
  if (res) {
    return (
      <GameResult mode={mode} won={res.won}
        title={res.won ? "🏆 You won the race!" : `${isBest ? "Your best run" : "The pacer"} won this time.`}
        say={res.won ? "You won the race! Your new run is the one to beat next time." : "Good race! Try again and catch the ghost."}
        stats={[["Your speed", res.r.wpm, "words a minute"], [isBest ? "Ghost (your best)" : "Pacer", ghostWpm, "words a minute"], ["Accuracy", `${res.r.accuracy}%`, `${res.r.errors} mistakes`]]}
        note={res.won ? "The ghost now races at your new speed." : null}
        onAgain={() => { setRes(null); setRun(n => n + 1); }} onBack={onBack} />
    );
  }
  return (
    <TimedRun key={run} pool={pool} mode={mode} seconds={Math.max(90, Math.ceil(ghostTime * 3))} length={length} onEnd={finish}
      intro={<p className="lead">Type to the finish flag before the ghost. {isBest ? `The ghost is your best run: ${ghostWpm} words a minute.` : `The pacer types ${ghostWpm} words a minute.`}</p>}
      top={({ s, elapsed }) => <RaceTrack you={s.pos / s.text.length} ghost={elapsed / ghostTime} ghostLabel={isBest ? "Your best" : "Pacer"} />} />
  );
}

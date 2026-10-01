import { useState } from "react";
import TimedRun from "../TimedRun.jsx";
import GameResult from "../GameResult.jsx";
import { wordsDone } from "../../../lib/typing.js";
import { sfx } from "../../../lib/sfx.js";

// Each mistake leaks a little fuel, so smashing keys never helps.
const LEAK = 0.25;
export const fuelOf = s => Math.max(0, wordsDone(s) - s.errors * LEAK);

function Rocket({ fuel, need, launch }) {
  const f = Math.min(1, fuel / need);
  return (
    <div className={`rocket-scene${launch ? " launch" : ""}`} aria-label={`Fuel ${Math.round(f * 100)}%`} role="img">
      <svg viewBox="0 0 120 150" aria-hidden="true">
        <rect x="12" y="20" width="16" height="110" rx="8" className="tank" />
        <rect x="12" y={20 + 110 * (1 - f)} width="16" height={110 * f} rx="8" className="tank-fuel" />
        <text x="20" y="145" textAnchor="middle" fontSize="11" className="tank-t">⛽</text>
        <g className="rocket-body">
          <path d="M80 18 C96 36 98 70 94 100 H66 C62 70 64 36 80 18 Z" className="rk-hull" />
          <circle cx="80" cy="56" r="9" className="rk-window" />
          <path d="M66 82 L54 106 L66 100 Z M94 82 L106 106 L94 100 Z" className="rk-fin" />
          <path d={`M70 102 Q80 ${120 + f * 22} 90 102 Z`} className="rk-flame" opacity={0.2 + f * 0.8} />
        </g>
        <rect x="50" y="128" width="60" height="6" rx="3" className="pad" />
      </svg>
    </div>
  );
}

// Word Rocket: type words to fill the tank before the countdown ends. The target adapts.
export default function WordRocket({ mode, pool, target, onResult, onBack }) {
  const kids = mode !== "pro";
  const seconds = kids ? 75 : 60;
  const need = Math.max(3, Math.round(target * (seconds / 60)));
  const [res, setRes] = useState(null);
  const [run, setRun] = useState(0);

  const finish = ({ s, r, input }) => {
    const fuel = fuelOf(s), won = fuel >= need;
    if (won) sfx.tada(); else sfx.oops();
    setRes({ r, fuel, won });
    onResult({ r, won, input, target });
  };
  if (res) {
    const pct = Math.min(100, Math.round((res.fuel / need) * 100));
    return (
      <GameResult mode={mode} won={res.won}
        title={res.won ? "🚀 Lift-off! The rocket is in space!" : `So close! The tank was ${pct}% full.`}
        say={res.won ? "Lift off! Your rocket flew into space!" : `So close! The tank was ${pct} percent full. Let's try again.`}
        stats={[["Fuel", `${pct}%`, `${need} words needed`], ["Speed", res.r.wpm, "words a minute"], ["Accuracy", `${res.r.accuracy}%`, "mistakes leak fuel"]]}
        note={res.won ? "Next launch needs a little more fuel." : "Next launch needs a little less fuel. Careful typing fills the tank fastest."}
        onAgain={() => { setRes(null); setRun(n => n + 1); }} onBack={onBack}>
        {res.won && <Rocket fuel={need} need={need} launch />}
      </GameResult>
    );
  }
  return (
    <TimedRun key={run} pool={pool} mode={mode} seconds={seconds} onEnd={finish} endWhen={s => fuelOf(s) >= need}
      intro={<p className="lead">Fill the rocket with <b>{need} words</b> in {seconds} seconds. Every word adds fuel; every mistake leaks a little.</p>}
      top={({ s }) => <div className="rocket-row"><Rocket fuel={fuelOf(s)} need={need} /><b className="rocket-count">{Math.floor(fuelOf(s))} / {need} words</b></div>} />
  );
}

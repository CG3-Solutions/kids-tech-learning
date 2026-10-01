import { useState } from "react";
import BalloonPop from "./games/BalloonPop.jsx";
import WordRocket from "./games/WordRocket.jsx";
import TypingRace from "./games/TypingRace.jsx";
import BeatTheClock from "./games/BeatTheClock.jsx";
import { GAMES } from "../../content/typing.js";
import { nextTarget } from "../../lib/typing.js";

// Where each game starts for a new player: a little below their speed, so the first round feels possible.
const startTarget = (mode, bestWpm) => Math.max(mode === "pro" ? 10 : 4, Math.round((bestWpm || (mode === "pro" ? 15 : 5)) * 0.9));

// The games menu and the open game. `saved` is the learner's game progress; `onSave(game, data, result)` stores it.
export default function Games({ mode, pool, bestWpm, saved, onSave }) {
  const [open, setOpen] = useState(null);
  const st = id => saved?.[id] ?? {};
  const back = () => setOpen(null);
  const record = { balloon: s => s.best && `Record: ${s.best} balloons`, rocket: s => s.launches && `${s.launches} launches · next ${s.target} wpm`, race: s => s.best && `Your best: ${s.best} wpm`, clock: s => s.best && `High score: ${s.best}` };

  if (open === "balloon") {
    const s = st("balloon");
    return <BalloonPop mode={mode} pool={pool} level={s.level ?? 0} best={s.best ?? 0} onBack={back}
      onResult={({ r, won, input, pops, level }) => onSave("balloon", { level, best: Math.max(s.best ?? 0, pops) }, { r, won, input })} />;
  }
  if (open === "rocket") {
    const s = st("rocket"), target = s.target ?? startTarget(mode, bestWpm);
    return <WordRocket key={target} mode={mode} pool={pool} target={target} onBack={back}
      onResult={({ r, won, input }) => onSave("rocket", { target: nextTarget(target, won, mode === "pro" ? 8 : 3), launches: (s.launches ?? 0) + (won ? 1 : 0) }, { r, won, input })} />;
  }
  if (open === "race") {
    const s = st("race"), ghost = s.best ?? startTarget(mode, bestWpm);
    return <TypingRace key={ghost} mode={mode} pool={pool} ghostWpm={ghost} isBest={!!s.best} onBack={back}
      onResult={({ r, won, input }) => onSave("race", { best: won ? Math.max(r.wpm, s.best ?? 0) : s.best }, { r, won, input })} />;
  }
  if (open === "clock") {
    const s = st("clock");
    return <BeatTheClock mode={mode} pool={pool} best={s.best ?? 0} onBack={back}
      onResult={({ r, won, input, score }) => onSave("clock", { best: Math.max(s.best ?? 0, score) }, { r, won, input })} />;
  }
  return (
    <div className="stack">
      <p className="muted">Games use only the keys you've learned. They get a little faster as you get better.</p>
      <div className="game-grid">
        {GAMES.map(g => (
          <button key={g.id} className={`game-card g-${g.id}`} onClick={() => setOpen(g.id)}>
            <span className="game-em" aria-hidden="true">{g.emoji}</span>
            <b>{g.title}</b>
            <small>{g.blurb}</small>
            <span className="game-meta"><span className="tag">{g.builds}</span>{record[g.id](st(g.id)) && <span className="game-rec">{record[g.id](st(g.id))}</span>}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

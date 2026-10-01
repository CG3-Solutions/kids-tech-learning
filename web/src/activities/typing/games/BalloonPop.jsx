import { useMemo, useRef, useState } from "react";
import GameResult from "../GameResult.jsx";
import { CountdownRing, Streak } from "../Visuals.jsx";
import { Keyboard } from "../Keyboard.jsx";
import { useKeys, useFrame } from "../useKeys.js";
import { sfx } from "../../../lib/sfx.js";

const SECONDS = 60;
const COLORS = ["lv0", "lv1", "lv2", "lv3", "lv4"];

// Starting pace. Kids get slow balloons and no lives; Pro gets faster balloons and 3 lives.
// Every 5 pops the balloons come a little faster (adaptive), and `level` carries over between games.
export const balloonPace = (mode, level = 0) => {
  const kids = mode !== "pro";
  const k = Math.pow(1.06, level);
  return { gap: (kids ? 2200 : 1400) / k, rise: (kids ? 9000 : 5500) / k, lives: kids ? Infinity : 3 };
};

// The balloon a key pops: the one with that letter that is closest to flying away.
export function target(balloons, key) {
  return balloons.filter(b => !b.popped && b.ch === key).sort((a, b) => b.y - a.y)[0] ?? null;
}

// Balloon Pop: letters float up on balloons; type a letter to pop it before it flies away.
export default function BalloonPop({ mode, pool, level, best, onResult, onBack }) {
  const kids = mode !== "pro";
  const letters = useMemo(() => pool.filter(c => c !== " "), [pool]);
  const pace0 = useMemo(() => balloonPace(mode, level), [mode, level]);
  const [phase, setPhase] = useState("ready");
  const [balloons, setBalloons] = useState([]);
  const [t, setT] = useState(0);
  const [stats, setStats] = useState({ pops: 0, wrong: 0, escaped: 0, streak: 0, best: 0 });
  const g = useRef(null); // the live game, updated every frame
  const [res, setRes] = useState(null);

  const start = () => {
    g.current = { t: 0, nextAt: 400, id: 0, list: [], pace: { ...pace0 }, pops: 0, wrong: 0, escaped: 0, streak: 0, best: 0, keys: {}, input: "keyboard" };
    setBalloons([]); setStats({ pops: 0, wrong: 0, escaped: 0, streak: 0, best: 0 }); setT(0); setRes(null); setPhase("play");
  };
  const end = () => {
    const G = g.current;
    if (!G || G.ended) return;
    G.ended = true;
    setPhase("done");
    const total = G.pops + G.wrong;
    const r = { wpm: Math.round((G.pops / 5) / (Math.max(G.t, 1000) / 60000)), accuracy: total ? Math.floor((G.pops / total) * 100) : 100, seconds: Math.round(G.t / 1000), chars: G.pops, errors: G.wrong, keys: G.keys, bestStreak: G.best };
    const won = G.pops > best;
    if (G.pops) sfx.tada(); else sfx.oops();
    setRes({ r, pops: G.pops, escaped: G.escaped, won });
    // Next game's pace: faster if most balloons were popped, a bit slower if many flew away.
    const ratio = G.pops / Math.max(1, G.pops + G.escaped);
    onResult({ r, won, input: G.input, pops: G.pops, level: Math.max(0, level + (ratio >= 0.85 ? 1 : ratio < 0.6 ? -1 : 0)) });
  };

  useFrame(phase === "play", dt => {
    const G = g.current;
    G.t += dt;
    if (G.t >= G.nextAt) {
      G.list.push({ id: G.id++, ch: letters[Math.floor(Math.random() * letters.length)], x: 8 + Math.random() * 80, y: 0, born: G.t, color: COLORS[G.id % 5], popped: false });
      G.nextAt = G.t + G.pace.gap;
    }
    for (const b of G.list) if (!b.popped) b.y += dt / G.pace.rise;
    const gone = G.list.filter(b => !b.popped && b.y >= 1);
    if (gone.length) {
      G.escaped += gone.length; G.streak = 0;
      for (const b of gone) { const [n, m, ms] = G.keys[b.ch] ?? [0, 0, 0]; G.keys[b.ch] = [n, m + 1, ms]; }
    }
    G.list = G.list.filter(b => (b.popped ? G.t - b.poppedAt < 300 : b.y < 1));
    setBalloons(G.list.map(b => ({ ...b })));
    setT(G.t);
    setStats({ pops: G.pops, wrong: G.wrong, escaped: G.escaped, streak: G.streak, best: G.best });
    if (G.t >= SECONDS * 1000 || G.escaped >= G.pace.lives) end();
  });

  const hit = (key, how = "keyboard") => {
    const G = g.current;
    if (phase !== "play" || !G) return;
    if (how === "touch") G.input = "touch";
    const b = target(G.list, key);
    if (b) {
      b.popped = true; b.poppedAt = G.t;
      G.pops++; G.streak++; G.best = Math.max(G.best, G.streak);
      const [n, m, ms] = G.keys[key] ?? [0, 0, 0]; G.keys[key] = [n + 1, m, ms + (G.t - b.born)];
      sfx.click();
      // Adaptive: every 5 pops, balloons come a little faster.
      if (G.pops % 5 === 0) { G.pace.gap *= 0.94; G.pace.rise *= 0.96; }
    } else {
      G.wrong++; G.streak = 0;
      if (kids) sfx.bump();
    }
  };
  const caps = useKeys({ active: phase === "play", waiting: phase === "ready", onChar: hit, onStart: start });

  if (phase === "done" && res) {
    return (
      <GameResult mode={mode} won={res.won}
        title={res.won ? `🎈 New record: ${res.pops} balloons!` : `🎈 You popped ${res.pops} balloons!`}
        say={res.won ? `New record! You popped ${res.pops} balloons!` : `You popped ${res.pops} balloons! ${best ? `Your record is ${best}.` : ""} Let's play again!`}
        stats={[["Popped", res.pops, best ? `record ${Math.max(best, res.pops)}` : "first game"], ["Flew away", res.escaped, kids ? "no problem, keep going" : "3 lives"], ["Accuracy", `${res.r.accuracy}%`, `${res.r.errors} wrong keys`]]}
        note={res.escaped > res.pops ? "Tip: keep your fingers on the home row, then the next balloon is a short reach away." : null}
        onAgain={start} onBack={onBack} />
    );
  }
  if (phase === "ready") {
    return (
      <div className="stack">
        <p className="lead">Letters float up on balloons. Type a letter to pop its balloon before it flies away! {kids ? "Take your time: there's no game over." : "Three balloons get away and the game ends."}{best ? ` Your record: ${best}.` : ""}</p>
        <div className="row"><button className="btn primary big" onClick={start} autoFocus>Start</button><span className="muted">or press Enter</span></div>
      </div>
    );
  }
  const lives = pace0.lives === Infinity ? null : pace0.lives - stats.escaped;
  return (
    <div className={`stack type-screen timed ${kids ? "kids" : "pro"}`}>
      <div className="timed-top">
        <CountdownRing left={Math.max(0, SECONDS - t / 1000)} total={SECONDS} />
        <div className="clock-score"><b>{stats.pops}</b><span>popped</span>{lives != null && <span className="lives" aria-label={`${lives} lives left`}>{"❤️".repeat(Math.max(0, lives))}</span>}</div>
        <Streak n={stats.streak} />
      </div>
      {caps && <p className="type-note" role="alert">Caps Lock is on. Press the Caps Lock key to turn it off.</p>}
      <div className="sky" aria-label="Balloons" data-letters={balloons.filter(b => !b.popped).map(b => b.ch).join("")}>
        {balloons.map(b => (
          <span key={b.id} className={`balloon${b.popped ? " popped" : ""}`} style={{ left: `${b.x}%`, bottom: `${b.y * 100}%`, "--c": `var(--${b.color})` }}>
            <span className="balloon-l">{b.ch === ";" ? ";" : b.ch.toUpperCase()}</span>
          </span>
        ))}
      </div>
      <Keyboard next={null} wrong={null} taught={new Set(letters)} onTap={window.matchMedia?.("(hover: none) and (pointer: coarse)").matches ? c => hit(c, "touch") : null} />
    </div>
  );
}

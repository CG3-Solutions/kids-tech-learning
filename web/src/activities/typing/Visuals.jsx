// Pictures that make typing feel like progress: Keyo's ladder, a speedometer, streak flames,
// a countdown ring, a race track and a confetti burst. All decorative: the numbers are also in text.
import { KeyoFace } from "../../components/journey/Guide.jsx";

// Keyo climbs one rung per part of the lesson; a mistake makes Keyo wobble (never fall).
export function Ladder({ value, rungs = 10, wobble = false, label }) {
  const at = Math.min(rungs, Math.floor(value * rungs + 1e-9));
  const H = 300, step = (H - 40) / rungs;
  return (
    <div className="ladder" aria-label={label ?? `${Math.round(value * 100)}% of the way up`} role="img">
      <svg viewBox={`0 0 90 ${H}`} preserveAspectRatio="none" aria-hidden="true">
                <rect className="ladder-rail" x="18" y="30" width="7" height={H - 30} rx="3" />
        <rect className="ladder-rail" x="65" y="30" width="7" height={H - 30} rx="3" />
        {Array.from({ length: rungs }, (_, i) => (
          <rect key={i} className={`ladder-rung${i < at ? " done" : ""}`} x="20" y={H - 14 - (i + 1) * step} width="50" height="6" rx="3" />
        ))}
      </svg>
      <span className="ladder-star" aria-hidden="true">{at >= rungs ? "🌟" : "⭐"}</span>
      {/* Keyo stands on the highest rung climbed (or the ground at the start). */}
      <div className={`ladder-keyo${wobble ? " wobble" : ""}`} style={{ bottom: `${((8 + at * step) / H) * 100}%` }}>
        <KeyoFace size={44} mood={at >= rungs ? "cheer" : "happy"} lamp={false} />
      </div>
    </div>
  );
}

// Streak flame: grows with every 10 keys in a row without a mistake.
export function Streak({ n }) {
  if (n < 10) return <span className="streak off" aria-hidden="true" />;
  const size = n >= 50 ? "xl" : n >= 30 ? "lg" : n >= 20 ? "md" : "sm";
  return <span className={`streak ${size}`} aria-label={`${n} keys in a row`}>🔥 {n}</span>;
}

// Speedometer for Pro mode: the needle shows live speed, the tick shows the personal best.
export function Speedometer({ wpm, best = 0, goal = 0 }) {
  const max = Math.max(40, Math.ceil((Math.max(best, goal, wpm) * 1.3) / 10) * 10);
  const ang = v => Math.PI * (1 - Math.min(v, max) / max); // 0 → left, max → right
  const pt = (v, r) => [60 + r * Math.cos(ang(v)), 62 - r * Math.sin(ang(v))];
  const [nx, ny] = pt(wpm, 40);
  const arc = (v, cls) => { const [x, y] = pt(v, 50); return <path className={cls} d={`M10 62 A50 50 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} />; };
  return (
    <figure className="speedo" aria-label={`Speed ${wpm} words a minute${best ? `, best ${best}` : ""}`}>
      <svg viewBox="0 0 120 74" aria-hidden="true">
        <path className="speedo-track" d="M10 62 A50 50 0 0 1 110 62" />
        {wpm > 0 && arc(wpm, "speedo-fill")}
        {goal > 0 && (() => { const [a, b] = pt(goal, 44), [c, d] = pt(goal, 58); return <line className="speedo-goal" x1={a} y1={b} x2={c} y2={d} />; })()}
        {best > 0 && (() => { const [a, b] = pt(best, 44), [c, d] = pt(best, 58); return <line className="speedo-best" x1={a} y1={b} x2={c} y2={d} />; })()}
        <line className="speedo-needle" x1="60" y1="62" x2={nx} y2={ny} />
        <circle cx="60" cy="62" r="5" className="speedo-hub" />
      </svg>
      <figcaption><b>{wpm}</b> wpm{best ? <small> · best {best}</small> : null}</figcaption>
    </figure>
  );
}

// Countdown ring: the coloured part shrinks as time runs out; it turns red in the last 10 seconds.
export function CountdownRing({ left, total }) {
  const r = 26, c = 2 * Math.PI * r, f = Math.max(0, left / total);
  return (
    <div className={`ring${left <= 10 ? " low" : ""}`} role="timer" aria-label={`${Math.ceil(left)} seconds left`}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ring-bg" />
        <circle cx="32" cy="32" r={r} className="ring-fg" strokeDasharray={c} strokeDashoffset={c * (1 - f)} transform="rotate(-90 32 32)" />
      </svg>
      <b>{Math.ceil(left)}</b>
    </div>
  );
}

// Two lanes: you and a pacer (a "ghost" of your best run, or the target speed).
export function RaceTrack({ you, ghost, youIcon = "🏎️", ghostIcon = "👻", ghostLabel = "Pacer" }) {
  return (
    <div className="track" aria-hidden="true">
      {[["You", you, youIcon, "me"], [ghostLabel, ghost, ghostIcon, "ghost"]].map(([who, v, icon, cls]) => (
        <div key={cls} className={`lane ${cls}`}>
          <span className="lane-name">{who}</span>
          <div className="lane-road"><span className="car" style={{ left: `calc(${Math.min(1, v) * 100}% - ${Math.min(1, v) * 34}px)` }}>{icon}</span></div>
          <span className="flag">🏁</span>
        </div>
      ))}
    </div>
  );
}

// A small burst of confetti for a win (hidden for people who prefer less motion).
export function Burst({ on }) {
  if (!on) return null;
  return (
    <div className="burst" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => <i key={i} style={{ "--a": `${i * 20}deg`, "--d": `${60 + (i % 3) * 30}px`, "--c": `var(--lv${i % 5})` }} />)}
    </div>
  );
}

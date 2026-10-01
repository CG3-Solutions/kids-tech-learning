import { useState } from "react";
import { FINGERS, KEYBOARD, SHIFT_ON, baseOf, fingerOf, fingerName, keyLabel, needsShift, shiftSide } from "../../content/typing.js";

// The on-screen keyboard. Each key is coloured by the finger that presses it; the next key glows
// (with the Shift key to hold, for capitals and symbols), and a wrong press flashes red.
// Keys not taught yet are dimmed. `taught` may hold capitals and symbols: they light up their key.
// `onTap` lets touch screens tap keys (tap Shift first for a capital or symbol).
export function Keyboard({ next, wrong, taught, onTap }) {
  const [armed, setArmed] = useState(false);
  const keys = new Set([...taught].map(baseOf));
  const shiftTaught = [...taught].some(needsShift);
  const want = next ? baseOf(next) : null, side = next ? shiftSide(next) : null;
  const bad = wrong ? baseOf(wrong) : null;
  const tap = c => { onTap(armed ? (SHIFT_ON[c] ?? c.toUpperCase()) : c); setArmed(false); };
  return (
    <div className="kb" role="img" aria-label={next ? `Next key: ${needsShift(next) ? `Shift and ${keyLabel(want)}` : keyLabel(next)}` : "Keyboard"}>
      {KEYBOARD.map((row, r) => (
        <div key={r} className="kb-row">
          {row.map(([c, f, w], i) => {
            const real = c.length === 1 && c !== "⌫";
            const shiftKey = c === "Shift" ? (i === 0 ? "left" : "right") : null;
            const lit = real ? keys.has(c) : shiftKey && shiftTaught;
            const cls = [
              "kb-key", `fc-${FINGERS[f].color}`,
              lit ? "taught" : "dim",
              (real && c === want) || (shiftKey && shiftKey === side) ? "next" : "",
              real && c === bad ? "wrong" : "",
              shiftKey && armed ? "armed" : "",
              c === "f" || c === "j" ? "bump" : "",
            ].join(" ");
            const up = real && SHIFT_ON[c];
            const label = c === " " ? "" : real && /[a-z]/.test(c) ? c.toUpperCase() : c;
            const inner = up ? <><small className="kb-up">{up}</small>{label}</> : label;
            if (onTap && shiftKey && shiftTaught) return <button key={i} type="button" className={cls} style={{ flexGrow: w }} onClick={() => setArmed(a => !a)} aria-pressed={armed} aria-label={`${shiftKey} Shift`}>{inner}</button>;
            return onTap && real && lit
              ? <button key={i} type="button" className={cls} style={{ flexGrow: w }} onClick={() => tap(c)} aria-label={keyLabel(c)}>{inner}</button>
              : <span key={i} className={cls} style={{ flexGrow: w }}>{inner}</span>;
          })}
        </div>
      ))}
    </div>
  );
}

// Two hands under the keyboard; the finger for the next key lifts and glows.
const LEFT = [["lp", 26, 50], ["lr", 58, 64], ["lm", 90, 70], ["li", 122, 62]];
const RIGHT = [["ri", 252, 62], ["rm", 284, 70], ["rr", 316, 64], ["rp", 348, 50]];
export function Hands({ next, mode }) {
  const active = next ? fingerOf(next) : null;
  const side = next ? shiftSide(next) : null;
  const shiftFinger = side === "left" ? "lp" : side === "right" ? "rp" : null;
  const finger = ([id, x, h]) => {
    const on = active === id || shiftFinger === id;
    return <rect key={id} className={`hand-f fc-${FINGERS[id].color}${on ? " on" : ""}`} x={x} y={(on ? 70 : 78) - h} width="26" height={h + 20} rx="13" />;
  };
  const thumbOn = active === "th";
  return (
    <figure className="hands">
      <svg viewBox="0 0 400 150" aria-hidden="true">
        <rect className="hand-palm" x="22" y="74" width="130" height="70" rx="26" />
        <rect className="hand-palm" x="248" y="74" width="130" height="70" rx="26" />
        {LEFT.map(finger)}{RIGHT.map(finger)}
        <rect className={`hand-f fc-f0${thumbOn ? " on" : ""}`} x="146" y={thumbOn ? 92 : 98} width="48" height="24" rx="12" transform="rotate(-24 150 110)" />
        <rect className={`hand-f fc-f0${thumbOn ? " on" : ""}`} x="206" y={thumbOn ? 92 : 98} width="48" height="24" rx="12" transform="rotate(24 250 110)" />
      </svg>
      <figcaption>
        {active ? <>Use your <b>{fingerName(active, mode)}</b>{next === " " ? " for space" : ""}</> : "Fingers on the home row"}
        {shiftFinger && <>, and hold the <b>{side} Shift</b> with your {fingerName(shiftFinger, mode)}</>}
      </figcaption>
    </figure>
  );
}

// Per-key stats grouped by the key they are typed on ("A" and "a" both count for A).
export function keyStats(keys) {
  const out = {};
  for (const [c, [n, miss, ms]] of Object.entries(keys ?? {})) {
    const b = baseOf(c);
    const [a, m, t] = out[b] ?? [0, 0, 0];
    out[b] = [a + n, m + miss, t + ms];
  }
  return out;
}
// Five steps of one hue: how often a key is missed. Keys with too few tries stay blank.
const HEAT_STEPS = [0.02, 0.05, 0.1, 0.18];
export const heatLevel = (n, miss) => (n + miss < 3 ? null : HEAT_STEPS.filter(t => miss / (n + miss) >= t).length);

// The keyboard as a heat map: darker keys are missed more often. Hover or focus a key for its numbers.
export function HeatKeyboard({ keys }) {
  const stats = keyStats(keys);
  const [tip, setTip] = useState(null);
  const say = c => {
    const [n, miss, ms] = stats[c] ?? [0, 0, 0];
    if (n + miss < 3) return `${keyLabel(c)}: not enough practice yet`;
    return `${keyLabel(c).toUpperCase()}: ${Math.round((miss / (n + miss)) * 100)}% missed · ${n ? Math.round(ms / n) : 0} ms to find · ${n + miss} presses`;
  };
  return (
    <figure className="heat">
      <div className="kb heat-kb">
        {KEYBOARD.map((row, r) => (
          <div key={r} className="kb-row">
            {row.map(([c, , w], i) => {
              const real = c.length === 1 && c !== "⌫";
              const [n, miss] = stats[c] ?? [0, 0];
              const lvl = real ? heatLevel(n, miss) : null;
              const label = c === " " ? "space" : real && /[a-z]/.test(c) ? c.toUpperCase() : c;
              return real
                ? <span key={i} tabIndex={0} className={`kb-key heat-key${lvl == null ? " none" : ` h${lvl}`}`} style={{ flexGrow: w }} aria-label={say(c)}
                    onPointerEnter={() => setTip(c)} onPointerLeave={() => setTip(null)} onFocus={() => setTip(c)} onBlur={() => setTip(null)}>{label}</span>
                : <span key={i} className="kb-key dim" style={{ flexGrow: w }}>{label}</span>;
            })}
          </div>
        ))}
      </div>
      <figcaption className="heat-legend">
        <span>{tip ? say(tip) : "Darker keys are missed more often. Hover or tap a key for details."}</span>
        <span className="heat-scale" aria-hidden="true">fewer mistakes <i className="h0" /><i className="h1" /><i className="h2" /><i className="h3" /><i className="h4" /> more</span>
      </figcaption>
    </figure>
  );
}

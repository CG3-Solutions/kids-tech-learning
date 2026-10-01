import { FINGERS, FINGER_OF, KEYBOARD, fingerName, keyLabel } from "../../content/typing.js";

// The on-screen keyboard. Each key is coloured by the finger that presses it; the next key glows,
// and a wrong press flashes red. Keys not taught yet are dimmed. `onTap` lets touch screens tap keys.
export function Keyboard({ next, wrong, taught, onTap }) {
  return (
    <div className="kb" role="img" aria-label={next ? `Next key: ${keyLabel(next)}` : "Keyboard"}>
      {KEYBOARD.map((row, r) => (
        <div key={r} className="kb-row">
          {row.map(([c, f, w], i) => {
            const real = c.length === 1 && c !== "⌫";
            const cls = [
              "kb-key", `fc-${FINGERS[f].color}`,
              real && taught.has(c) ? "taught" : "dim",
              real && c === next ? "next" : "",
              real && c === wrong ? "wrong" : "",
              c === "f" || c === "j" ? "bump" : "",
            ].join(" ");
            const label = c === " " ? "" : c.length === 1 ? c.toUpperCase() : c;
            return onTap && real && taught.has(c)
              ? <button key={i} type="button" className={cls} style={{ flexGrow: w }} onClick={() => onTap(c)} aria-label={keyLabel(c)}>{label}</button>
              : <span key={i} className={cls} style={{ flexGrow: w }}>{label}</span>;
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
  const active = next ? FINGER_OF[next] : null;
  const finger = ([id, x, h]) => {
    const on = active === id;
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
      <figcaption>{active ? <>Use your <b>{fingerName(active, mode)}</b>{next === " " ? " for space" : ""}</> : "Fingers on the home row"}</figcaption>
    </figure>
  );
}

import { sfx } from "../../lib/sfx.js";

// A big tappable lamp. `readOnly` lamps are for Bit's messages.
export default function Lamp({ on, onToggle, label, size = "md", readOnly = false }) {
  const cls = `lamp lamp-${size}${on ? " on" : ""}${readOnly ? " ro" : ""}`;
  const inner = (
    <>
      <svg viewBox="0 0 60 80" aria-hidden="true">
        <path d="M30 6 a22 22 0 0 1 14 39 c-3 3 -5 7 -5 11 h-18 c0 -4 -2 -8 -5 -11 a22 22 0 0 1 14 -39z" className="glass" />
        <rect x="20" y="58" width="20" height="6" rx="2" className="base" /><rect x="22" y="66" width="16" height="6" rx="2" className="base" />
      </svg>
      <span className="lamp-state">{on ? "ON" : "OFF"}</span>
      {label != null && <span className="lamp-label">{label}</span>}
    </>
  );
  if (readOnly) return <div className={cls} aria-label={`Lamp ${on ? "on" : "off"}`}>{inner}</div>;
  return (
    <button className={cls} aria-pressed={on} aria-label={`Lamp ${label ?? ""} ${on ? "on" : "off"}`}
      onClick={() => { on ? sfx.off() : sfx.on(); onToggle(); }}>{inner}</button>
  );
}

export const pattern = (bits) => bits.map(b => (b ? "1" : "0")).join("");

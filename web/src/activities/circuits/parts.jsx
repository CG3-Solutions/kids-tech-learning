// Shared SVG drawing kit for Volt's circuit steps. Every step draws with these, so all
// circuits look the same: green wires, yellow flowing current, the same battery and bulb.
import { sfx } from "../../lib/sfx.js";
import { GATES } from "../../lib/logic.js";
import Guide, { VoltFace } from "../../components/journey/Guide.jsx";

export const Volt = props => <Guide Face={VoltFace} {...props} />;

export function Board({ w = 400, h = 260, children, label }) {
  return <svg className="circuit board" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>{children}</svg>;
}

// A wire; `live` shows current flowing along it.
export function Wire({ d, live }) {
  return <g><path className="w" d={d} /><path className={`flow${live ? " live" : ""}`} d={d} /></g>;
}

// Battery drawn upright at x: + plate on top (y - 12), − plate below (y + 12).
export function Battery({ x, y, label = "Battery", big = false }) {
  return (
    <g>
      <line className="plate" x1={x - (big ? 30 : 24)} y1={y - 12} x2={x + (big ? 30 : 24)} y2={y - 12} strokeWidth="6" />
      <line className="plate" x1={x - 13} y1={y + 12} x2={x + 13} y2={y + 12} strokeWidth="10" />
      <text x={x + 28} y={y - 14} fontSize="18" style={{ fill: "var(--plus)" }}>+</text>
      <text x={x + 28} y={y + 24} fontSize="18">–</text>
      {label && <text x={x + 14} y={y + 52} fontSize="13" textAnchor="start" pointerEvents="none">{label}</text>}
    </g>
  );
}

// A switch along a horizontal wire from x to x + len. Tapping it calls onToggle.
export function Switch({ x, y, len = 56, closed, onToggle, label, normallyClosed = false }) {
  const angle = closed ? 0 : -32;
  return (
    <g className="sw" onClick={onToggle ? () => { closed ? sfx.off() : sfx.on(); onToggle(); } : undefined} style={{ cursor: onToggle ? "pointer" : "default" }}>
      <rect x={x - 12} y={y - 40} width={len + 24} height={64} fill="transparent" />
      <line className="sw-lever" x1={x} y1={y} x2={x + len} y2={y} style={{ transform: `rotate(${angle}deg)`, transformOrigin: `${x}px ${y}px` }} />
      <circle className="term" cx={x} cy={y} r="6" /><circle className="term" cx={x + len} cy={y} r="6" />
      {normallyClosed && <circle cx={x + len / 2} cy={y - 16} r="5" fill="var(--plus)" />}
      {label && <text x={x + len / 2} y={y + 26} fontSize="13" textAnchor="middle">{label}</text>}
    </g>
  );
}

// Loads drawn on a vertical wire, centred at (x, y); terminals at y − 24 and y + 24.
export function Bulb({ x, y, on, level = on ? 3 : 0, label = "Bulb" }) {
  return (
    <g>
      <circle className={`bulb-glass lvl${level}`} cx={x} cy={y} r="24" />
      <path d={`M${x - 17} ${y - 17} L${x + 17} ${y + 17} M${x + 17} ${y - 17} L${x - 17} ${y + 17}`} stroke="var(--ink)" strokeWidth="3" />
      {label && <text x={x - 14} y={y + 46} fontSize="13" textAnchor="end" pointerEvents="none">{label}</text>}
    </g>
  );
}
export function Motor({ x, y, on, label = "Motor" }) {
  return (
    <g>
      <circle cx={x} cy={y} r="24" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
      <g className={`fan${on ? " spin" : ""}`} style={{ transformOrigin: `${x}px ${y}px` }}>
        <path d={`M${x} ${y} L${x} ${y - 20} A9 9 0 0 1 ${x + 11} ${y - 15} Z M${x} ${y} L${x + 18} ${y + 8} A9 9 0 0 1 ${x + 9} ${y + 17} Z M${x} ${y} L${x - 17} ${y + 11} A9 9 0 0 1 ${x - 19} ${y - 2} Z`} fill="var(--wire)" />
      </g>
      <circle cx={x} cy={y} r="4" fill="var(--ink)" />
      {label && <text x={x - 14} y={y + 46} fontSize="13" textAnchor="end" pointerEvents="none">{label}</text>}
    </g>
  );
}
export function Buzzer({ x, y, on, label = "Buzzer" }) {
  return (
    <g>
      <rect x={x - 20} y={y - 20} width="40" height="40" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx={x} cy={y} r="6" fill="var(--ink)" />
      {on && <g fill="none" stroke="var(--spark)" strokeWidth="3" strokeLinecap="round" className="waves on"><path d={`M${x + 28} ${y - 12} q8 12 0 24`} /><path d={`M${x + 36} ${y - 20} q14 20 0 40`} /></g>}
      {label && <text x={x - 14} y={y + 46} fontSize="13" textAnchor="end" pointerEvents="none">{label}</text>}
    </g>
  );
}
export function Led({ x, y, on, flip, label = "LED" }) {
  return (
    <g>
      <g style={{ transform: flip ? "rotate(180deg)" : "none", transformOrigin: `${x}px ${y}px`, transition: "transform .3s" }}>
        <path d={`M${x - 18} ${y - 14} H${x + 18} L${x} ${y + 14} Z`} className={`led-body${on ? " lit" : ""}`} />
        <line x1={x - 18} y1={y + 16} x2={x + 18} y2={y + 16} stroke="var(--ink)" strokeWidth="4" />
      </g>
      <path d={`M${x + 24} ${y - 8} l12 -10 m-5 0 h5 v5 M${x + 24} ${y + 6} l12 -10 m-5 0 h5 v5`} stroke="var(--ink)" strokeWidth="2.5" fill="none" />
      {label && <text x={x - 14} y={y + 46} fontSize="13" textAnchor="end" pointerEvents="none">{label}</text>}
    </g>
  );
}

// ───────── Logic drawings ─────────
// A gate symbol with its left edge at x and top at y (80 × 60). Inputs enter on the left, the output leaves on the right.
export const gatePins = (type, x, y) => (GATES[type].inputs === 1
  ? { ins: [[x, y + 30]], out: [x + 80, y + 30] }
  : { ins: [[x, y + 18], [x, y + 42]], out: [x + 80, y + 30] });

export function GateShape({ type, x, y, on }) {
  const cls = `gate${on ? " on" : ""}`;
  const bubble = type === "NOT" || type === "NAND" || type === "NOR";
  const body = {
    AND: `M${x} ${y} H${x + 40} A30 30 0 0 1 ${x + 40} ${y + 60} H${x} Z`,
    NAND: `M${x} ${y} H${x + 34} A30 30 0 0 1 ${x + 34} ${y + 60} H${x} Z`,
    OR: `M${x} ${y} Q${x + 50} ${y} ${x + 74} ${y + 30} Q${x + 50} ${y + 60} ${x} ${y + 60} Q${x + 18} ${y + 30} ${x} ${y} Z`,
    NOR: `M${x} ${y} Q${x + 44} ${y} ${x + 66} ${y + 30} Q${x + 44} ${y + 60} ${x} ${y + 60} Q${x + 18} ${y + 30} ${x} ${y} Z`,
    XOR: `M${x + 8} ${y} Q${x + 54} ${y} ${x + 76} ${y + 30} Q${x + 54} ${y + 60} ${x + 8} ${y + 60} Q${x + 26} ${y + 30} ${x + 8} ${y} Z`,
    NOT: `M${x} ${y + 4} L${x + 62} ${y + 30} L${x} ${y + 56} Z`,
  }[type];
  return (
    <g className={cls}>
      <path d={body} />
      {type === "XOR" && <path d={`M${x - 2} ${y} Q${x + 16} ${y + 30} ${x - 2} ${y + 60}`} fill="none" className="gate-line" />}
      {bubble && <circle cx={type === "NOT" ? x + 69 : x + 72} cy={y + 30} r="7" />}
      <text x={x + (type === "NOT" ? 22 : 30)} y={y + 35} fontSize="13" textAnchor="middle" className="gate-label">{type}</text>
    </g>
  );
}

// A logic wire: straight or with one bend. `on` colours it yellow.
export function LWire({ from, to, on }) {
  const [x1, y1] = from, [x2, y2] = to;
  const mx = x1 + (x2 - x1) / 2;
  const d = y1 === y2 ? `M${x1} ${y1} H${x2}` : `M${x1} ${y1} H${mx} V${y2} H${x2}`;
  return <path className={`lwire${on ? " on" : ""}`} d={d} />;
}

// A tappable input switch for logic diagrams (shows ON/OFF and 1/0).
export function InputToggle({ x, y, on, onToggle, label }) {
  return (
    <g className={`in-toggle${on ? " on" : ""}`} onClick={onToggle ? () => { on ? sfx.off() : sfx.on(); onToggle(); } : undefined} style={{ cursor: onToggle ? "pointer" : "default" }} role="button" aria-label={`${label} ${on ? "on" : "off"}`}>
      <rect x={x} y={y - 18} width="64" height="36" rx="18" />
      <circle cx={on ? x + 46 : x + 18} cy={y} r="13" className="knob" />
      <text x={x + 32} y={y - 26} fontSize="13" textAnchor="middle" className="lbl">{label}</text>
      <text x={on ? x + 18 : x + 46} y={y + 5} fontSize="13" textAnchor="middle" className="bit">{on ? "1" : "0"}</text>
    </g>
  );
}

// An output lamp for logic diagrams.
export function OutLamp({ x, y, on, label }) {
  return (
    <g>
      <circle cx={x} cy={y} r="20" className={`bulb-glass${on ? " lvl3" : ""}`} />
      <text x={x} y={y + 5} fontSize="13" textAnchor="middle" fontWeight="700">{on ? "1" : "0"}</text>
      {label && <text x={x} y={y + 38} fontSize="13" textAnchor="middle">{label}</text>}
    </g>
  );
}

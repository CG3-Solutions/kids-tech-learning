// How each Circuit Lab part looks on the board, live. Drawn in the part's own frame (pin 1 at 0,0,
// pointing right), then turned into place, so every part works in all four directions.
// Text is turned back upright so it always reads the right way.
import { PITCH, localPins } from "../../lib/circuit/board.js";

const P = PITCH;
const KIND = {
  wire: "wire", battery: "power", slide: "switch", button: "switch", changeover: "switch", lamp: "light", led: "light",
  resistor: "resistor", ldr: "sensor", touch: "sensor", probe: "sensor", piezo: "sound", speaker: "sound", motor: "motion",
  melody: "chip", siren: "chip", fx: "chip", transistor: "chip",
};
const ICON = { battery: "🔋", lamp: "💡", resistor: "", ldr: "🌗", motor: "", speaker: "🔈", piezo: "🥁", touch: "👆", probe: "🧪", transistor: "", melody: "🎵", siren: "🚨", fx: "👾" };
const CHIP_NAME = { melody: "MELODY", siren: "SIREN", fx: "SOUND FX" };
const PIN_LABEL = { "+": "+", "−": "−", trig: "T", out: "OUT", m1: "M1", m2: "M2", com: "", up: "", down: "", c: "c", b: "b", e: "e" };
const LDR_ICON = { bright: "☀️", dim: "⛅", dark: "🌑", lamp: "💡" };
const MATERIAL = { air: "", spoon: "🥄", coin: "🪙", foil: "✨", key: "🔑", pencil: "✏️", salt: "🧂", water: "💧", wetsoil: "🌱", drysoil: "🏜️", finger: "👆", paper: "📄", plastic: "📏", rubber: "🧽", wood: "🪵" };

// Upright text at (x, y) in the part's frame.
function Up({ x, y, deg, children, className = "", size = 14 }) {
  return <text x={x} y={y} transform={`rotate(${-deg} ${x} ${y})`} className={className} fontSize={size} textAnchor="middle" dominantBaseline="central">{children}</text>;
}

export default function PartGlyph({ part, out, input, amps = 0, chip, selected, ghost, dragging, offset = [0, 0], showLabel = true }) {
  const deg = (part.dir ?? 0) * 90;
  const pins = localPins(part);
  const xs = Object.values(pins).map(p => p[0] * P), ys = Object.values(pins).map(p => p[1] * P);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const wire = part.type === "wire", chipLike = ["melody", "siren", "fx"].includes(part.type);
  const pad = wire ? 12 : chipLike ? 22 : 20;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const state = String(out ?? "");
  const cls = [`lab-part k-${KIND[part.type]}`, selected && "selected", ghost && "ghost", dragging && "dragging", state && `s-${state.split(":")[0]}`].filter(Boolean).join(" ");
  const [ax, ay] = part.anchorXY ?? [0, 0];

  return (
    <g className={cls} data-uid={part.uid} transform={`translate(${ax + offset[0]} ${ay + offset[1]}) rotate(${deg})`}>
      {/* Body */}
      <rect className="body" x={x0 - pad} y={y0 - (wire ? 11 : 20)} width={x1 - x0 + pad * 2} height={y1 - y0 + (wire ? 22 : 40)} rx={wire ? 11 : 14} />

      {/* What's inside each part */}
      {wire && Math.abs(amps) > 0.001 && (
        <line className="flow" x1={0} y1={0} x2={x1} y2={0}
          style={{ animationDuration: `${Math.max(0.15, Math.min(2.4, 0.06 / Math.abs(amps)))}s`, animationDirection: amps < 0 ? "reverse" : "normal" }} />
      )}
      {part.type === "battery" && <>
        <Up x={14} y={-1} deg={deg} className="sym plus" size={18}>+</Up>
        <Up x={2 * P - 14} y={-1} deg={deg} className="sym" size={18}>−</Up>
        <Up x={P} y={0} deg={deg} size={20}>🔋</Up>
      </>}
      {part.type === "slide" && <>
        <line className="lever" x1={12} y1={0} x2={2 * P - 12} y2={0} transform={input === "on" ? "" : `rotate(-24 12 0)`} />
        <Up x={P} y={13} deg={deg} className="tag" size={10}>{input === "on" ? "ON" : "OFF"}</Up>
      </>}
      {part.type === "button" && <>
        <line className="lever" x1={10} y1={input === "down" ? -2 : -12} x2={2 * P - 10} y2={input === "down" ? -2 : -12} />
        <line className="lever" x1={P} y1={input === "down" ? -2 : -12} x2={P} y2={-19} />
        <circle className="cap" cx={P} cy={-19} r={6} />
      </>}
      {part.type === "changeover" && <>
        <line className="lever" x1={10} y1={0} x2={input === "down" ? 2 * P - 12 : 2 * P - 12} y2={input === "down" ? P - 8 : 0} />
        <Up x={2 * P + 2} y={P / 2} deg={deg} className="tag" size={10}>{input === "down" ? "▼" : "▲"}</Up>
      </>}
      {part.type === "lamp" && <circle className={`bulb ${state}`} cx={P} cy={0} r={15} />}
      {part.type === "lamp" && <path className="filament" d={`M${P - 8} 4 q4 -12 8 0 q4 -12 8 0`} />}
      {part.type === "led" && <>
        <path className={`led ${state} c-${part.colour}`} d={`M${P - 10} -11 L${P + 10} 0 L${P - 10} 11 Z`} />
        <line className="lever thin" x1={P + 11} y1={-11} x2={P + 11} y2={11} />
        {state === "damage" && <Up x={P} y={-1} deg={deg} size={22}>💥</Up>}
        <Up x={12} y={-13} deg={deg} className="sym plus" size={12}>+</Up>
      </>}
      {part.type === "resistor" && <>
        <path className="zigzag" d={`M${P - 28} 0 l6 -8 8 16 8 -16 8 16 8 -16 8 16 6 -8`} />
        <Up x={P} y={13} deg={deg} className="tag" size={10}>{part.ohms >= 1000 ? `${part.ohms / 1000}kΩ` : `${part.ohms}Ω`}</Up>
      </>}
      {part.type === "motor" && <>
        <circle className="motor-case" cx={P} cy={0} r={17} />
        <g className={`fan ${state}`} style={{ transformOrigin: `${P}px 0px` }}>
          <path d={`M${P} 0 L${P - 4} -15 A6 6 0 0 1 ${P + 4} -15 Z M${P} 0 L${P + 15} 6 A6 6 0 0 1 ${P + 10} 12 Z M${P} 0 L${P - 12} 10 A6 6 0 0 1 ${P - 15} 3 Z`} />
        </g>
        <Up x={12} y={-13} deg={deg} className="sym plus" size={12}>+</Up>
      </>}
      {part.type === "probe" && <>
        <line className="lever" x1={10} y1={0} x2={P - 14} y2={0} /><line className="lever" x1={P + 14} y1={0} x2={2 * P - 10} y2={0} />
        <Up x={P} y={0} deg={deg} size={18}>{MATERIAL[input ?? "air"] || "·"}</Up>
      </>}
      {["speaker", "piezo", "touch"].includes(part.type) && <Up x={P} y={0} deg={deg} size={20}>{part.type === "touch" && input === "yes" ? "🫳" : ICON[part.type]}</Up>}
      {part.type === "ldr" && <Up x={P} y={0} deg={deg} size={20}>{LDR_ICON[input ?? "bright"]}</Up>}
      {(part.type === "speaker" || part.type === "piezo") && (state.startsWith("sound") || state === "soft") && (
        <g className="waves"><path d={`M${P + 18} -10 q8 10 0 20`} /><path d={`M${P + 26} -16 q12 16 0 32`} /></g>
      )}
      {part.type === "transistor" && <>
        <path className="tri" d={`M${P - 16} ${P / 2 + 12} L${P} ${P / 2 - 14} L${P + 16} ${P / 2 + 12} Z`} />
      </>}
      {chipLike && <>
        <Up x={cx} y={cy - 14} deg={deg} size={24}>{ICON[part.type]}</Up>
        <Up x={cx} y={cy + 14} deg={deg} className="chip-name" size={11}>{CHIP_NAME[part.type]}</Up>
        {chip?.playing && <Up x={cx + 34} y={cy - 30} deg={deg} className="notes" size={16}>{part.type === "siren" ? "🔊" : "♪"}</Up>}
      </>}

      {/* Snaps (the pins) */}
      {Object.entries(pins).map(([pin, [px, py]]) => (
        <g key={pin}>
          <circle className="snap" cx={px * P} cy={py * P} r={wire ? 9 : 10} />
          {PIN_LABEL[pin] && !wire && (chipLike || part.type === "transistor") && <Up x={px * P} y={py * P} deg={deg} className="pin-label" size={9}>{PIN_LABEL[pin]}</Up>}
        </g>
      ))}

      {/* Label (L1, S1…) */}
      {showLabel && !wire && <Up x={chipLike ? cx : x0 + (x1 - x0) / 2} y={chipLike ? y1 + 30 : -30} deg={deg} className="label" size={11}>{part.id}</Up>}
    </g>
  );
}

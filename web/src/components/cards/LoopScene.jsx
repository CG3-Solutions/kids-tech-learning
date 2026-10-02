import { Battery } from "./PartArt.jsx";

// A circuit drawn as one loop: something on the left (the battery), something on top (the bulb,
// buzzer or motor) and something at the bottom (a switch or a gap). Moving dashes show the flow.
export default function LoopScene({ live, reverse = false, left, top, bottom, onBottom, bottomLabel }) {
  const slot = (cx, cy, art, s = 0.62) => (
    <g>
      <rect x={cx - 38} y={cy - 38} width="76" height="76" rx="14" className="scene-pad" />
      <g transform={`translate(${cx - 60 * s} ${cy - 60 * s}) scale(${s})`}>{art}</g>
    </g>
  );
  return (
    <svg className="scene" viewBox="0 0 320 250" role="img" aria-label={live ? "The loop is closed. Electricity is flowing." : "Electricity is not flowing."}>
      <rect x="56" y="58" width="208" height="134" rx="18" className="scene-wire" />
      {live && <rect x="56" y="58" width="208" height="134" rx="18" className={`scene-flow${reverse ? " back" : ""}`} />}
      {slot(56, 125, left)}
      {slot(160, 58, top, 0.8)}
      <g onClick={onBottom} className={onBottom ? "scene-tap" : undefined} role={onBottom ? "button" : undefined} aria-label={bottomLabel} tabIndex={onBottom ? 0 : undefined}
        onKeyDown={onBottom ? e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBottom(); } } : undefined}>
        {slot(160, 192, bottom)}
      </g>
    </svg>
  );
}

export const Gap = () => <g><circle cx="26" cy="74" r="9" fill="#B9C2CC" stroke="#7C8794" strokeWidth="3" /><circle cx="94" cy="74" r="9" fill="#B9C2CC" stroke="#7C8794" strokeWidth="3" /><text x="60" y="84" textAnchor="middle" fontSize="34" fontWeight="700" fill="var(--muted)">?</text></g>;
export const Emoji = ({ e }) => <text x="60" y="88" textAnchor="middle" fontSize="64">{e}</text>;
export const Holder = () => <rect x="36" y="14" width="48" height="98" rx="10" fill="none" stroke="var(--muted)" strokeWidth="4" strokeDasharray="8 7" />;
export const Batteries = ({ n }) => <g>{Array.from({ length: n }, (_, i) => <g key={i} transform={`translate(${(i - (n - 1) / 2) * 34 + (n > 1 ? 18 : 0)} ${n > 1 ? 14 : 0}) scale(${n > 1 ? 0.72 : 1})`}><Battery /></g>)}</g>;

// Draws the picture part of a practice question from plain data (see content/practice/maths.js).
const Grid = ({ emoji, n, crossed = 0 }) => (
  <div className="v-count" aria-hidden="true">
    {Array.from({ length: n }, (_, i) => <span key={i} className={i >= n - crossed ? "x" : ""}>{emoji}</span>)}
  </div>
);

function Blocks({ h, t, o }) {
  return (
    <div className="v-blocks" aria-label={`${h} hundreds, ${t} tens, ${o} ones`}>
      {Array.from({ length: h }, (_, i) => <span key={`h${i}`} className="hund">{Array.from({ length: 100 }, (_, k) => <i key={k} />)}</span>)}
      {Array.from({ length: t }, (_, i) => <span key={`t${i}`} className="ten">{Array.from({ length: 10 }, (_, k) => <i key={k} />)}</span>)}
      <span className="ones">{Array.from({ length: o }, (_, i) => <i key={i} />)}</span>
    </div>
  );
}

function Fraction({ n, k }) {
  const r = 70, cx = 80, cy = 80;
  const slices = Array.from({ length: n }, (_, i) => {
    const a0 = (i / n) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / n) * 2 * Math.PI - Math.PI / 2;
    const p = (a) => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    return <path key={i} d={`M${cx} ${cy} L${p(a0)} A${r} ${r} 0 ${n === 1 ? 1 : 0} 1 ${p(a1)} Z`} className={i < k ? "on" : ""} />;
  });
  return <svg className="v-frac" viewBox="0 0 160 160" role="img" aria-label={`A circle cut into ${n} equal parts, ${k} shaded`}>{slices}</svg>;
}

function Rect({ w, h, unit }) {
  const s = Math.min(26, 260 / w, 150 / h), W = w * s, H = h * s;
  return (
    <svg className="v-rect" viewBox={`0 0 ${W + 80} ${H + 60}`} role="img" aria-label={`Rectangle ${w} by ${h} ${unit}`}>
      <g transform="translate(40 20)">
        {Array.from({ length: w - 1 }, (_, i) => <line key={`v${i}`} x1={(i + 1) * s} y1="0" x2={(i + 1) * s} y2={H} className="grid" />)}
        {Array.from({ length: h - 1 }, (_, i) => <line key={`h${i}`} x1="0" y1={(i + 1) * s} x2={W} y2={(i + 1) * s} className="grid" />)}
        <rect width={W} height={H} className="shape" />
        <text x={W / 2} y={H + 24} textAnchor="middle">{w} {unit}</text>
        <text x={-10} y={H / 2 + 5} textAnchor="end">{h} {unit}</text>
      </g>
    </svg>
  );
}

function Triangle({ a, b, c, unknown }) {
  const s = Math.min(9, 220 / b, 150 / a), B = b * s, A = a * s;
  return (
    <svg className="v-rect" viewBox={`0 0 ${B + 110} ${A + 60}`} role="img" aria-label="A right-angled triangle">
      <g transform="translate(50 15)">
        <path d={`M0 0 V${A} H${B} Z`} className="shape" />
        <path d={`M0 ${A - 14} H14 V${A}`} className="grid" fill="none" />
        <text x={-10} y={A / 2 + 5} textAnchor="end">{unknown === "a" ? "?" : a}</text>
        <text x={B / 2} y={A + 24} textAnchor="middle">{b}</text>
        <text x={B / 2 + 14} y={A / 2 - 8}>{unknown === "c" ? "?" : c}</text>
      </g>
    </svg>
  );
}

function Column({ a, b, op }) {
  const w = Math.max(String(a).length, String(b).length);
  const pad = x => String(x).padStart(w, " ");
  return (
    <div className="v-column" aria-hidden="true">
      <div>{" "}{pad(a)}</div>
      <div>{op}{pad(b)}</div>
      <div className="line" />
    </div>
  );
}

export default function Visual({ v }) {
  if (!v) return null;
  switch (v.kind) {
    case "count": return <Grid emoji={v.emoji} n={v.n} />;
    case "add": return <div className="v-row"><Grid emoji={v.emoji} n={v.a} /><b className="v-op">+</b><Grid emoji={v.emoji} n={v.b} /></div>;
    case "sub": return <Grid emoji={v.emoji} n={v.a} crossed={v.b} />;
    case "groups": return v.hidden
      ? <div className="v-row"><Grid emoji={v.emoji} n={v.groups * v.each} /><b className="v-op">→</b><div className="v-plates">{Array.from({ length: v.groups }, (_, i) => <span key={i}>🍽️</span>)}</div></div>
      : <div className="v-groups">{Array.from({ length: v.groups }, (_, i) => <div key={i} className="grp"><Grid emoji={v.emoji} n={v.each} /></div>)}</div>;
    case "blocks": return <Blocks h={v.h} t={v.t} o={v.o} />;
    case "fraction": return <Fraction n={v.n} k={v.k} />;
    case "rect": return <Rect w={v.w} h={v.h} unit={v.unit} />;
    case "triangle": return <Triangle {...v} />;
    case "column": return <Column {...v} />;
    default: return null;
  }
}

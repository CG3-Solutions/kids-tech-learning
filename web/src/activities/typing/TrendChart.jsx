import { useState } from "react";

// One measure over the learner's recent sessions (oldest → newest), as a 2px line with a light
// area wash, an end dot and the latest value labelled. A crosshair snaps to the nearest session
// and a tooltip shows its value. `points`: [{ value, label, when }]. One series, so no legend:
// the title names it. A hidden table carries every value for screen readers.
export default function TrendChart({ title, points, unit = "", min = 0, max: maxIn, goal, goalLabel }) {
  const [hover, setHover] = useState(null);
  const W = 560, H = 180, PADL = 34, PADR = 44, PADB = 22, PADT = 14;
  if (points.length < 2) return <p className="muted">{title}: type a few more lessons to see your progress line.</p>;
  const hi = maxIn ?? Math.max(10, goal ?? 0, ...points.map(p => p.value));
  const top = Math.ceil(hi / 10) * 10;
  const x = i => PADL + ((W - PADL - PADR) * i) / (points.length - 1);
  const y = v => PADT + (H - PADT - PADB) * (1 - (v - min) / (top - min));
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(points.length - 1)} ${y(min)} L${x(0)} ${y(min)} Z`;
  const ticks = [min, Math.round((min + top) / 2), top];
  const last = points.at(-1);
  const pick = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(((px - PADL) / (W - PADL - PADR)) * (points.length - 1)))));
  };
  return (
    <figure className="chart trend">
      <figcaption className="trend-title">{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}: latest ${last.value}${unit}`} onPointerMove={pick} onPointerLeave={() => setHover(null)}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={PADL} x2={W - PADR} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PADL - 6} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
          </g>
        ))}
        {goal != null && goal <= top && <g><line x1={PADL} x2={W - PADR} y1={y(goal)} y2={y(goal)} className="limit" /><text x={PADL + 4} y={y(goal) - 5} className="axis">{goalLabel ?? `goal ${goal}${unit}`}</text></g>}
        <path d={area} className="trend-area" />
        <path d={line} className="trend-line" />
        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PADT} y2={H - PADB} className="crosshair" />}
        {hover != null && <circle cx={x(hover)} cy={y(points[hover].value)} r="5" className="trend-dot" />}
        <circle cx={x(points.length - 1)} cy={y(last.value)} r="4.5" className="trend-dot" />
        <text x={x(points.length - 1) + 9} y={y(last.value) + 4} className="trend-end">{last.value}{unit}</text>
        <text x={PADL} y={H - 5} className="axis">{points[0].when}</text>
        <text x={W - PADR} y={H - 5} textAnchor="end" className="axis">{last.when}</text>
      </svg>
      {hover != null && (
        <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
          <b>{points[hover].value}{unit}</b><span>{points[hover].label} · {points[hover].when}</span>
        </div>
      )}
      <table className="sr-only"><caption>{title}</caption><tbody>{points.map((p, i) => <tr key={i}><th>{p.when} {p.label}</th><td>{p.value}{unit}</td></tr>)}</tbody></table>
    </figure>
  );
}

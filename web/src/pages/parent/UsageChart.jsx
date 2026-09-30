import { useState } from "react";
import { daysBack } from "../../lib/useFamily.js";

// Minutes learned per day (one series), with the daily limit as a dashed reference line.
export default function UsageChart({ childId, minutesOn, limit, days = 7 }) {
  const [hover, setHover] = useState(null);
  const list = daysBack(days).map(d => ({ day: d, min: minutesOn(childId, d) }));
  const W = 560, H = 190, PADL = 34, PADB = 26, PADT = 12;
  const max = Math.max(30, limit ?? 0, ...list.map(x => x.min));
  const top = Math.ceil(max / 30) * 30;
  const y = v => PADT + (H - PADT - PADB) * (1 - v / top);
  const bw = (W - PADL) / list.length;
  const label = d => new Date(`${d}T00:00`).toLocaleDateString("en-IN", { weekday: "short" });
  const ticks = [0, top / 2, top];
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Minutes of learning per day, last 7 days">
        {ticks.map(t => (
          <g key={t}>
            <line x1={PADL} x2={W} y1={y(t)} y2={y(t)} className="grid" />
            <text x={PADL - 6} y={y(t) + 4} textAnchor="end" className="axis">{t}</text>
          </g>
        ))}
        {list.map((x, i) => {
          const h = y(0) - y(x.min), bx = PADL + i * bw + bw * 0.2, w = bw * 0.6;
          return (
            <g key={x.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={PADL + i * bw} y={PADT} width={bw} height={H - PADT - PADB} fill="transparent" />
              {x.min > 0 && <path className={`bar-mark${hover === i ? " hot" : ""}`} d={`M${bx} ${y(0)} V${y(x.min) + Math.min(4, h)} q0 -4 4 -4 H${bx + w - 4} q4 0 4 4 V${y(0)} Z`} />}
              <text x={bx + w / 2} y={H - 8} textAnchor="middle" className="axis">{label(x.day)}</text>
            </g>
          );
        })}
        <line x1={PADL} x2={W} y1={y(0)} y2={y(0)} className="baseline" />
        {limit && <g><line x1={PADL} x2={W} y1={y(limit)} y2={y(limit)} className="limit" /><text x={W - 4} y={y(limit) - 5} textAnchor="end" className="axis">limit {limit} min</text></g>}
      </svg>
      {hover != null && <div className="chart-tip" style={{ left: `${((PADL + hover * bw + bw / 2) / W) * 100}%` }}><b>{list[hover].min} min</b><span>{new Date(`${list[hover].day}T00:00`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span></div>}
      <table className="sr-only"><caption>Minutes per day</caption><tbody>{list.map(x => <tr key={x.day}><th>{x.day}</th><td>{x.min}</td></tr>)}</tbody></table>
    </figure>
  );
}

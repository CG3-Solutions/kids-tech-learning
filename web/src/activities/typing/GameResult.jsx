import Guide, { KeyoFace } from "../../components/journey/Guide.jsx";
import { Burst } from "./Visuals.jsx";

// The end of a game or a speed-ladder try: a headline, numbers, and what to do next.
// Kids mode never says "game over": it's always "try again" or "next level".
export default function GameResult({ mode, won, title, say, stats, note, children, onAgain, againLabel = "↻ Play again", onBack }) {
  const kids = mode !== "pro";
  return (
    <div className="stack type-results">
      <Burst on={won} />
      {kids ? <Guide Face={KeyoFace} mood={won ? "cheer" : "happy"} say={say}>{title}</Guide> : <h2 className="sec">{title}</h2>}
      <div className="kpis type-kpis">
        {stats.map(([k, v, small]) => <div key={k} className="kpi"><span>{k}</span><b>{v}</b>{small && <small>{small}</small>}</div>)}
      </div>
      {note && <p className="type-why" role="status">{note}</p>}
      {children}
      <div className="row">
        <button className="btn primary big" onClick={onAgain}>{againLabel}</button>
        <button className="btn ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  );
}

import Icon from "./Icon.jsx";

// The bar under a question after the child answers. kind: "right" | "wrong" | "reveal".
// The guide's speech bubble says the details out loud; this bar is the at-a-glance result.
export function FeedbackBar({ kind, title, detail, action }) {
  if (!kind) return null;
  const icon = kind === "right" ? "check" : kind === "wrong" ? "bulb" : "eye";
  return (
    <div className={`fb-bar ${kind}`} role="status">
      <span className="fb-ic" aria-hidden="true"><Icon name={icon} size={30} stroke={3} /></span>
      <span className="fb-txt"><b>{title}</b>{detail && <span>{detail}</span>}</span>
      {action}
    </div>
  );
}

// A chunky progress bar with a star at the end. `done` of `total` steps are finished.
export function LessonProgress({ done, total, label }) {
  const pct = total ? Math.min(100, (done / total) * 100) : 0;
  return (
    <div className="lesson-progress">
      <div className="lp-track" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
        <i style={{ width: `${pct}%` }} />
        <span className="lp-star" aria-hidden="true"><Icon name="star" size={30} stroke={1.4} fill="currentColor" /></span>
      </div>
      {label && <span className="lp-label">{label}</span>}
    </div>
  );
}

// Three big stars for a result, `n` of them lit.
export function StarsRow({ n }) {
  return (
    <div className="stars-row" role="img" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map(s => <span key={s} className={s <= n ? "on" : ""}><Icon name="star" size={s === 2 ? 76 : 60} stroke={1.4} fill="currentColor" /></span>)}
    </div>
  );
}

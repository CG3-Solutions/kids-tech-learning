// The mastery scale used across grown-up pages. Filled bars show the level as well as colour,
// so it reads in greyscale and for colour-blind users.
const LEVELS = {
  new: { bars: 0, label: "Not started" },
  weak: { bars: 1, label: "Needs practice" },
  ok: { bars: 2, label: "Getting there" },
  strong: { bars: 3, label: "Strong" },
  mastered: { bars: 4, label: "Mastered" },
};

export default function Mastery({ level, label }) {
  const l = LEVELS[level] ?? LEVELS.new;
  return (
    <span className={`mastery m-${level}`}>
      <span className="m-bars" aria-hidden="true">{[1, 2, 3, 4].map(n => <i key={n} className={n <= l.bars ? "on" : ""} />)}</span>
      {label ?? l.label}
    </span>
  );
}

// A sky with clouds, a sun and rolling hills, drawn behind Play-mode screens. Decorative.
export default function Scene() {
  return (
    <svg className="sky-scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <g className="clouds">
        <ellipse cx="160" cy="120" rx="90" ry="32" /><ellipse cx="215" cy="102" rx="58" ry="34" />
        <ellipse cx="980" cy="96" rx="110" ry="34" /><ellipse cx="1045" cy="80" rx="58" ry="32" />
        <ellipse cx="620" cy="56" rx="70" ry="20" opacity=".8" />
      </g>
      <circle className="sun" cx="1090" cy="220" r="42" />
      <path className="hill-back" d="M0 690 Q 200 590 420 670 T 820 650 T 1200 630 V800 H0Z" />
      <path className="hill-front" d="M0 750 Q 260 680 520 740 T 1200 710 V800 H0Z" />
    </svg>
  );
}

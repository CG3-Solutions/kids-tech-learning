// The Spark crew as live drawings with moods, for adventures and conversations.
// mood: "happy" | "cheer" (eyes closed with joy) | "wow" (surprised, or "not quite") | "sad".
// lamp: Volt's bulb is lit, Bit's and Chip's antenna lights glow (binary lessons use Bit's light as ON and OFF).
// Same props as the older faces, so every adventure can use them unchanged.

const INK = "#0E1630";

function Eye({ x, y, r, mood, side }) {
  if (mood === "cheer") return <path d={`M${x - r * 0.75} ${y + 2} q${r * 0.75} ${-r * 1.1} ${r * 1.5} 0`} fill="none" stroke={INK} strokeWidth="3.6" strokeLinecap="round" />;
  const p = mood === "wow" ? r * 0.42 : r * 0.58;
  const dy = mood === "sad" ? 2.5 : 1.5;
  return (
    <g>
      <circle cx={x} cy={y} r={mood === "wow" ? r * 1.1 : r} fill="#fff" />
      <circle cx={x + (mood === "wow" ? 0 : 1.5)} cy={y + dy} r={p} fill={INK} />
      <circle cx={x + 3} cy={y - 1.5} r={r * 0.2} fill="#fff" />
      {mood === "sad" && <path d={`M${x - r} ${y - r - (side < 0 ? 1 : 5)} L${x + r} ${y - r - (side < 0 ? 5 : 1)}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />}
    </g>
  );
}

function Mouth({ x, y, mood, w = 8, color = INK }) {
  if (mood === "wow") return <ellipse cx={x} cy={y + 3} rx="4.5" ry="6" fill={color} />;
  if (mood === "sad") return <path d={`M${x - w} ${y + 6} q${w} ${-w * 0.9} ${w * 2} 0`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />;
  if (mood === "cheer") return (
    <g>
      <path d={`M${x - w - 2} ${y - 1} q${w + 2} ${w * 1.7} ${w * 2 + 4} 0 z`} fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {color === INK && <path d={`M${x - 4} ${y + w * 0.9} q4 -4 8 0`} fill="#FF6F91" />}
    </g>
  );
  return <path d={`M${x - w} ${y} q${w} ${w} ${w * 2} 0`} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />;
}

const Cheeks = ({ l, r, y }) => <><ellipse cx={l} cy={y} rx="5.5" ry="3.8" fill="#FF8FA3" /><ellipse cx={r} cy={y} rx="5.5" ry="3.8" fill="#FF8FA3" /></>;

// Every face: 120 wide, a little taller than wide (like the older faces), bouncing when it cheers.
function Frame({ mood, size, children, label }) {
  return (
    <svg className={`bit-face crew-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 -6 120 132" width={size} height={size * 1.1}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : "true"}>
      {children}
    </svg>
  );
}

export function OllieFace({ mood = "happy", size = 96, label }) {
  return (
    <Frame mood={mood} size={size} label={label}>
      <g fill="none" stroke="#12A594" strokeWidth="12" strokeLinecap="round">
        <path d="M32 76q-6 16-18 18" /><path d="M45 82q-2 18-10 26" /><path d="M60 84v24" /><path d="M75 82q2 18 10 26" /><path d="M88 76q6 16 18 18" />
      </g>
      <ellipse cx="60" cy="50" rx="38" ry="36" fill="#12A594" />
      <circle cx="62" cy="20" r="4" fill="#5CC9BB" /><circle cx="80" cy="27" r="3" fill="#5CC9BB" /><circle cx="44" cy="25" r="3" fill="#5CC9BB" />
      <Eye x={46} y={48} r={11} mood={mood} side={-1} /><Eye x={74} y={48} r={11} mood={mood} side={1} />
      <Cheeks l={34} r={86} y={63} />
      <Mouth x={60} y={64} mood={mood} />
    </Frame>
  );
}

export function PollyFace({ mood = "happy", size = 96, label }) {
  const open = mood === "wow" || mood === "cheer";
  return (
    <Frame mood={mood} size={size} label={label}>
      <path d="M50 22q-4-14 8-16q-2 8 4 12q4-12 16-9q-9 4-9 13z" fill="#E8481C" />
      <path d="M50 104v10M70 104v10" stroke="#B57F00" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="60" cy="72" rx="30" ry="36" fill="#F06B3C" />
      <path d={mood === "cheer" ? "M33 60q-22 6-16 30q14-6 20-28z" : "M33 60q-14 22 4 42q10-16 6-40z"} fill="#00897B" />
      <path d={mood === "cheer" ? "M87 60q22 6 16 30q-14-6-20-28z" : "M87 60q14 22-4 42q-10-16-6-40z"} fill="#00897B" />
      <ellipse cx="60" cy="82" rx="17" ry="21" fill="#FFD27A" />
      <circle cx="60" cy="42" r="27" fill="#F06B3C" />
      <Eye x={49} y={39} r={9.5} mood={mood} side={-1} /><Eye x={71} y={39} r={9.5} mood={mood} side={1} />
      <Cheeks l={40} r={80} y={52} />
      {open && <path d="M54 58q6 10 12 0z" fill="#D99E10" />}
      <path d={open ? "M53 49q7-5 14 0q-2 9-7 10q-5-1-7-10z" : "M53 50q7-5 14 0q-2 13-7 15q-5-2-7-15z"} fill="#FFC43D" stroke="#D99E10" strokeWidth="1.5" strokeLinejoin="round" />
    </Frame>
  );
}

export function VoltFace({ mood = "happy", lamp = true, size = 96, label }) {
  return (
    <Frame mood={mood} size={size} label={label}>
      {lamp && <circle cx="60" cy="52" r="44" fill="#FFF3C4" className="bit-glow" />}
      <circle cx="60" cy="52" r="33" fill={lamp ? "#FFE07A" : "#E3E6EE"} />
      <rect x="43" y="82" width="34" height="24" rx="7" fill="#6D3FD1" />
      <path d="M44 90h32M44 98h32" stroke="#9B78EE" strokeWidth="3" />
      <path d="M60 0l-11 18h9l-5 14 15-19h-9l5-13z" fill="#6D3FD1" />
      <Eye x={49} y={50} r={9} mood={mood} side={-1} /><Eye x={71} y={50} r={9} mood={mood} side={1} />
      <Cheeks l={40} r={80} y={64} />
      <Mouth x={60} y={65} mood={mood} />
    </Frame>
  );
}

export function ChipFace({ mood = "happy", lamp = true, size = 96, label }) {
  const glow = "#7FE7FF";
  const eye = x => mood === "cheer"
    ? <path d={`M${x - 6} ${50} q6 -8 12 0`} fill="none" stroke={glow} strokeWidth="3.6" strokeLinecap="round" />
    : mood === "sad" ? <path d={`M${x - 7} ${46} a7 7 0 0 0 14 0z`} fill={glow} />
    : <circle cx={x} cy="48" r={mood === "wow" ? 8.5 : 7} fill={glow} />;
  return (
    <Frame mood={mood} size={size} label={label}>
      <path d="M60 10v14" stroke="#3D4663" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="9" r="7" fill={lamp ? "#FFC43D" : "#3D4663"} className={lamp ? "bit-glow" : ""} />
      <rect x="34" y="84" width="52" height="30" rx="12" fill="#5468E8" />
      <circle cx="60" cy="99" r="6" fill="#FFC43D" />
      <rect x="52" y="78" width="16" height="8" fill="#2434A8" />
      <rect x="13" y="40" width="12" height="22" rx="5" fill="#2434A8" /><rect x="95" y="40" width="12" height="22" rx="5" fill="#2434A8" />
      <rect x="22" y="22" width="76" height="60" rx="18" fill="#3346D3" />
      <rect x="31" y="31" width="58" height="40" rx="12" fill={INK} />
      {eye(48)}{eye(72)}
      <Mouth x={60} y={60} mood={mood} w={9} color={glow} />
    </Frame>
  );
}

export function KeyoFace({ mood = "happy", size = 96, label }) {
  return (
    <Frame mood={mood} size={size} label={label}>
      <ellipse cx="40" cy="108" rx="10" ry="6" fill="#7A5500" /><ellipse cx="80" cy="108" rx="10" ry="6" fill="#7A5500" />
      <path d={mood === "cheer" ? "M18 60l-10-14M102 60l10-14" : "M18 64l-10 10M102 64l10 10"} stroke="#B57F00" strokeWidth="6" strokeLinecap="round" />
      <rect x="16" y="24" width="88" height="80" rx="20" fill="#B57F00" />
      <rect x="24" y="28" width="72" height="62" rx="15" fill="#FFC43D" />
      <path d="M54 36h12" stroke="#D99E10" strokeWidth="4" strokeLinecap="round" />
      <Eye x={47} y={54} r={9} mood={mood} side={-1} /><Eye x={73} y={54} r={9} mood={mood} side={1} />
      <Cheeks l={36} r={84} y={68} />
      <Mouth x={60} y={69} mood={mood} />
    </Frame>
  );
}

export function BitFace({ mood = "happy", lamp = true, size = 96, label }) {
  const glow = "#7FE7FF";
  return (
    <Frame mood={mood} size={size} label={label}>
      <path d="M60 28V14" stroke="#3D4663" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="11" r="7" fill={lamp ? "#FFC43D" : "#3D4663"} className={lamp ? "bit-glow" : ""} />
      <ellipse cx="44" cy="106" rx="9" ry="5" fill="#3D4663" /><ellipse cx="76" cy="106" rx="9" ry="5" fill="#3D4663" />
      <rect x="24" y="26" width="72" height="76" rx="22" fill={INK} />
      <rect x="32" y="32" width="56" height="10" rx="5" fill="#26305A" />
      {mood === "cheer"
        ? <path d="M38 62q8-10 16 0M66 62q7-10 14 0" fill="none" stroke={glow} strokeWidth="4" strokeLinecap="round" />
        : <><circle cx="46" cy="60" r={mood === "wow" ? 10.5 : 9} fill="none" stroke={glow} strokeWidth="4" /><rect x="70" y={mood === "wow" ? 48 : 50} width="7" height={mood === "wow" ? 24 : 20} rx="3.5" fill={glow} /></>}
      <Mouth x={60} y={80} mood={mood} color={glow} />
      <Cheeks l={36} r={84} y={76} />
    </Frame>
  );
}

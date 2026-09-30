import Guide from "../../components/journey/Guide.jsx";

// Bit the Robot: can only say ON or OFF. Its antenna lamp shows its own state.
export function BitFace({ mood = "happy", lamp = true, size = 96 }) {
  const mouth = mood === "sad" ? "M38 70 q12 -8 24 0" : mood === "wow" ? "M44 66 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" : "M36 64 q14 12 28 0";
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      <line x1="50" y1="22" x2="50" y2="8" stroke="var(--ink)" strokeWidth="4" />
      <circle cx="50" cy="8" r="7" fill={lamp ? "var(--spark)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="3" className={lamp ? "bit-glow" : ""} />
      <rect x="14" y="22" width="72" height="62" rx="18" fill="var(--lv4)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="24" y="34" width="52" height="40" rx="12" fill="var(--surface)" />
      <circle cx="38" cy="50" r="6" fill="var(--ink)" /><circle cx="62" cy="50" r="6" fill="var(--ink)" />
      <circle cx="40" cy="48" r="2" fill="var(--surface)" /><circle cx="64" cy="48" r="2" fill="var(--surface)" />
      <path d={mouth} fill={mood === "wow" ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <rect x="30" y="86" width="40" height="18" rx="6" fill="var(--lv4)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="8" y="44" width="8" height="20" rx="4" fill="var(--ink)" /><rect x="84" y="44" width="8" height="20" rx="4" fill="var(--ink)" />
    </svg>
  );
}

export default function Bit(props) {
  return <Guide Face={BitFace} {...props} />;
}

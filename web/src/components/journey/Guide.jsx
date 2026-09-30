import { useEffect, useState } from "react";
import { speak } from "../../lib/speech.js";
import { isMuted, onMuteChange } from "../../lib/sfx.js";

// A story character with a speech bubble that reads itself aloud (unless muted).
// `Face` is the character's drawing, e.g. BitFace or VoltFace.
export default function Guide({ Face, children, say, mood = "happy", lamp = true }) {
  const text = say ?? (typeof children === "string" ? children : "");
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  useEffect(() => { if (text && !muted) speak(text); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="bit">
      <Face mood={mood} lamp={lamp} />
      <div className="bubble" role="status">
        <div>{children ?? say}</div>
        {text && <button className="btn ghost small" onClick={() => speak(text)} aria-label="Hear it again">🔊 Hear it</button>}
      </div>
    </div>
  );
}

const voltMouth = mood => (mood === "sad" ? "M38 66 q12 -8 24 0" : mood === "wow" ? "M44 62 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" : "M36 58 q14 12 28 0");

// Volt: a friendly battery who knows about electricity.
export function VoltFace({ mood = "happy", lamp = true, size = 96 }) {
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      <rect x="38" y="4" width="24" height="12" rx="4" fill="var(--ink)" />
      <rect x="18" y="14" width="64" height="88" rx="16" fill="var(--spark)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="18" y="74" width="64" height="28" rx="0" fill="var(--wire)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="18" y="86" width="64" height="16" rx="14" fill="var(--wire)" />
      <text x="50" y="97" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--surface)">+</text>
      <circle cx="38" cy="46" r="6" fill="var(--ink)" /><circle cx="62" cy="46" r="6" fill="var(--ink)" />
      <circle cx="40" cy="44" r="2" fill="var(--surface)" /><circle cx="64" cy="44" r="2" fill="var(--surface)" />
      <path d={voltMouth(mood)} fill={mood === "wow" ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <path d="M8 40 l6 8 -5 1 6 9" fill="none" stroke={lamp ? "var(--spark)" : "var(--line)"} strokeWidth="3" strokeLinecap="round" className={lamp ? "bit-glow" : ""} />
      <path d="M92 40 l-6 8 5 1 -6 9" fill="none" stroke={lamp ? "var(--spark)" : "var(--line)"} strokeWidth="3" strokeLinecap="round" className={lamp ? "bit-glow" : ""} />
    </svg>
  );
}

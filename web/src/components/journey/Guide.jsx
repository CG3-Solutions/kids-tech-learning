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
        {text && <button className="btn ghost small" onClick={() => speak(text, { force: true })} aria-label="Hear it again">🔊 Hear it</button>}
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

// Polly the Parrot: guides the Language adventures (parrots love to talk!).
export function PollyFace({ mood = "happy", lamp = true, size = 96 }) {
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      <path d="M50 6 q-6 -6 -14 0 q8 2 10 10 M50 6 q6 -8 16 -2 q-10 2 -12 12" fill="var(--plus)" stroke="var(--ink)" strokeWidth="2.5" />
      <ellipse cx="50" cy="58" rx="34" ry="44" fill="var(--wire)" stroke="var(--ink)" strokeWidth="4" />
      <ellipse cx="50" cy="76" rx="20" ry="22" fill="var(--spark)" opacity=".85" />
      <circle cx="36" cy="42" r="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" /><circle cx="64" cy="42" r="10" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="37" cy="43" r="4.5" fill="var(--ink)" /><circle cx="63" cy="43" r="4.5" fill="var(--ink)" />
      <path d={mood === "wow" ? "M42 54 q8 -6 16 0 q-2 14 -8 16 q-6 -2 -8 -16z" : "M42 54 q8 -6 16 0 q-2 10 -8 14 q-6 -4 -8 -14z"} fill="var(--spark)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      {lamp && <path d="M82 40 q10 -6 12 -16" stroke="var(--spark)" strokeWidth="3" fill="none" className="bit-glow" />}
    </svg>
  );
}

// Ollie the Octopus: guides the Maths adventures (eight arms for counting!).
export function OllieFace({ mood = "happy", lamp = true, size = 96 }) {
  const mouth = mood === "sad" ? "M40 58 q10 -6 20 0" : mood === "wow" ? "M45 56 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" : "M38 54 q12 10 24 0";
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      {[14, 26, 38, 50, 62, 74, 86].map((x, i) => <path key={i} d={`M${x} 70 q${i % 2 ? 6 : -6} 18 ${i % 2 ? -4 : 4} 34`} stroke="var(--lv0)" strokeWidth="9" strokeLinecap="round" fill="none" />)}
      <ellipse cx="50" cy="44" rx="38" ry="36" fill="var(--lv0)" stroke="var(--ink)" strokeWidth="4" />
      <circle cx="36" cy="40" r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" /><circle cx="64" cy="40" r="9" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <circle cx="37" cy="41" r="4" fill="var(--ink)" /><circle cx="63" cy="41" r="4" fill="var(--ink)" />
      <path d={mouth} fill={mood === "wow" ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      {lamp && <circle cx="78" cy="14" r="6" fill="var(--spark)" className="bit-glow" />}
    </svg>
  );
}

// Keyo the Keyboard Cat: guides the Typing course (cats love sitting on keyboards!).
export function KeyoFace({ mood = "happy", lamp = true, size = 96 }) {
  const mouth = mood === "sad" ? "M42 70 q8 -6 16 0" : mood === "wow" ? "M45 68 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" : "M40 66 q5 6 10 0 q5 6 10 0";
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      <path d="M16 40 L20 6 L42 26 Z M84 40 L80 6 L58 26 Z" fill="var(--lv1)" stroke="var(--ink)" strokeWidth="4" strokeLinejoin="round" />
      <path d="M23 30 L24 16 L34 25 Z M77 30 L76 16 L66 25 Z" fill="var(--plus)" opacity=".7" />
      <ellipse cx="50" cy="52" rx="38" ry="34" fill="var(--lv1)" stroke="var(--ink)" strokeWidth="4" />
      <ellipse cx="36" cy="46" rx="7" ry={mood === "cheer" ? 3 : 8} fill="var(--ink)" /><ellipse cx="64" cy="46" rx="7" ry={mood === "cheer" ? 3 : 8} fill="var(--ink)" />
      <circle cx="38" cy="43" r="2" fill="var(--surface)" /><circle cx="66" cy="43" r="2" fill="var(--surface)" />
      <path d="M46 58 h8 l-4 5 z" fill="var(--plus)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      <path d={mouth} fill={mood === "wow" ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 56 h22 M8 64 l20 -4 M94 56 h-22 M92 64 l-20 -4" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      <rect x="30" y="88" width="40" height="18" rx="5" fill="var(--surface)" stroke="var(--ink)" strokeWidth="3" />
      <text x="50" y="101" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ink)">F J</text>
      {lamp && <circle cx="86" cy="92" r="5" fill="var(--spark)" className="bit-glow" />}
    </svg>
  );
}

// Chip the Computer: guides "Inside a Computer" (a friendly monitor with a keyboard smile).
export function ChipFace({ mood = "happy", lamp = true, size = 96 }) {
  const mouth = mood === "sad" ? "M40 60 q10 -6 20 0" : mood === "wow" ? "M45 58 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0" : "M38 55 q12 10 24 0";
  return (
    <svg className={`bit-face${mood === "cheer" ? " cheer" : ""}`} viewBox="0 0 100 110" width={size} height={size * 1.1} aria-hidden="true">
      <rect x="8" y="10" width="84" height="64" rx="10" fill="var(--lv4)" stroke="var(--ink)" strokeWidth="4" />
      <rect x="17" y="18" width="66" height="48" rx="6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
      {mood === "cheer"
        ? <path d="M30 40 q6 -7 12 0 M58 40 q6 -7 12 0" fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
        : <><rect x="31" y="32" width="9" height="11" rx="3" fill="var(--ink)" /><rect x="60" y="32" width="9" height="11" rx="3" fill="var(--ink)" /></>}
      <path d={mouth} fill={mood === "wow" ? "var(--ink)" : "none"} stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
      <rect x="44" y="74" width="12" height="10" fill="var(--ink)" />
      <rect x="20" y="84" width="60" height="18" rx="5" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
      {[26, 36, 46, 56, 66].map(x => <rect key={x} x={x} y="89" width="7" height="5" rx="1.5" fill="var(--ink)" opacity=".55" />)}
      {lamp && <circle cx="84" cy="66" r="3.5" fill="var(--good)" className="bit-glow" />}
    </svg>
  );
}

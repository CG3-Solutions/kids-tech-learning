import ollie from "../assets/characters/ollie.svg";
import polly from "../assets/characters/polly.svg";
import chip from "../assets/characters/chip.svg";
import volt from "../assets/characters/volt.svg";
import keyo from "../assets/characters/keyo.svg";
import bit from "../assets/characters/bit.svg";
import fox from "../assets/characters/fox.svg";
import panda from "../assets/characters/panda.svg";
import bunny from "../assets/characters/bunny.svg";
import lion from "../assets/characters/lion.svg";

// The Spark crew: one guide per subject, drawn in one style.
export const GUIDES = {
  polly: { src: polly, name: "Polly", tint: "var(--lang-tint)" },
  ollie: { src: ollie, name: "Ollie", tint: "var(--maths-tint)" },
  volt: { src: volt, name: "Volt", tint: "var(--sci-tint)" },
  chip: { src: chip, name: "Chip", tint: "var(--brand-tint)" },
  bit: { src: bit, name: "Bit", tint: "var(--surface-2)" },
  keyo: { src: keyo, name: "Keyo", tint: "var(--type-tint)" },
};

const BY_AREA = { language: "polly", maths: "ollie", science: "volt", typing: "keyo" };
const BY_ACTIVITY = {
  alphabets: "polly", words: "polly", sentences: "polly",
  numbers: "ollie", mathematics: "ollie",
  circuit: "volt", lab: "volt", computer: "chip", coding: "chip", binary: "bit", typing: "keyo",
};
export const guideForArea = areaId => BY_AREA[areaId] ?? "chip";
export const guideForModule = m => BY_ACTIVITY[m?.activity] ?? guideForArea(m?.area);

// A guide picture. Decorative unless `label` is given.
export function Guide({ id, size = 96, label, className = "" }) {
  const g = GUIDES[id] ?? GUIDES.chip;
  return <img className={`crew ${className}`} src={g.src} width={size} height={size} alt={label ?? ""} draggable="false" />;
}

// Avatars are stored as emoji (so emails and older data keep working); these have a drawn picture.
const AVATAR_ART = {
  "🦊": { src: fox, tint: "#FFE9DB" },
  "🐼": { src: panda, tint: "#EEF0F5" },
  "🐰": { src: bunny, tint: "#EEE7FC" },
  "🦁": { src: lion, tint: "#FFF0C2" },
};
export const hasAvatarArt = a => !!AVATAR_ART[a];

// A learner's avatar in a rounded tile. Sizes: xs (inline), sm, md, lg, xl.
export function Avatar({ value, size = "md", className = "" }) {
  const art = AVATAR_ART[value];
  return (
    <span className={`avatar av-${size} ${className}`} style={art ? { background: art.tint } : undefined} aria-hidden="true">
      {art ? <img src={art.src} alt="" draggable="false" /> : <span className="av-emoji">{value}</span>}
    </span>
  );
}

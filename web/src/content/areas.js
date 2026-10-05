// The four learning areas kids see on their home screen. Every subject belongs to one area.
// `color` names a CSS token family: var(--lang), var(--lang-tint), var(--lang-edge), var(--lang-ink).
// `guide` is the Spark crew character who leads that area.
export const AREAS = [
  { id: "language", title: "Language", emoji: "🔤", color: "lang", guide: "polly", tagline: "Letters, words and sentences", with: "with Polly" },
  { id: "maths", title: "Maths", emoji: "🔢", color: "maths", guide: "ollie", tagline: "Numbers, counting and sums", with: "with Ollie" },
  { id: "science", title: "Science & Tech", emoji: "🔬", color: "sci", guide: "volt", tagline: "Electricity, computers, binary and coding", with: "with Volt, Chip and Bit" },
  { id: "typing", title: "Typing", emoji: "⌨️", color: "type", guide: "keyo", tagline: "Learn the keyboard, finger by finger", with: "with Keyo" },
];
export const areaOf = id => AREAS.find(a => a.id === id) ?? AREAS[2];

// CSS variables for an area's colour family, for style={...}.
export const areaStyle = id => {
  const c = areaOf(id).color;
  return { "--c": `var(--${c})`, "--c-tint": `var(--${c}-tint)`, "--c-edge": `var(--${c}-edge)`, "--c-ink": `var(--${c}-ink)` };
};

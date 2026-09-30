// The three learning areas kids see on their home screen. Every subject belongs to one area.
export const AREAS = [
  { id: "language", title: "Language", emoji: "🔤", color: "lv3", tagline: "Letters, words and sentences" },
  { id: "maths", title: "Maths", emoji: "🔢", color: "lv2", tagline: "Numbers, counting and sums" },
  { id: "science", title: "Science & Tech", emoji: "🔬", color: "lv4", tagline: "Electricity, computers, binary and coding" },
  { id: "typing", title: "Typing", emoji: "⌨️", color: "lv1", tagline: "Learn the keyboard, finger by finger" },
];
export const areaOf = id => AREAS.find(a => a.id === id) ?? AREAS[2];

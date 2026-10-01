// The Circuit Lab: 100 original beginner electronics projects in 11 units, from a first loop to
// designing your own invention. Plain data; see docs/11-circuit-lab-design.md and the generated
// project list in docs/12-circuit-lab-projects.md.
import { PROJECTS_A } from "./projectsA.js";
import { PROJECTS_B } from "./projectsB.js";
import { PROJECTS_C } from "./projectsC.js";

// The study-map levels (see content/stem/studyMap.js), easiest first.
export const LEVELS = ["explorer", "builder", "inventor", "engineer"];

export const UNITS = [
  { n: 1, emoji: "🔋", title: "Power and loops", q: "What does electricity need to flow?", level: "explorer" },
  { n: 2, emoji: "🛤️", title: "Series and parallel", q: "What changes when parts share a loop?", level: "builder" },
  { n: 3, emoji: "🔴", title: "LEDs and resistors", q: "How do we control how much electricity flows?", level: "builder" },
  { n: 4, emoji: "🧪", title: "Conductors", q: "What lets electricity through?", level: "explorer" },
  { n: 5, emoji: "🚁", title: "Motion", q: "How does electricity make things move?", level: "builder" },
  { n: 6, emoji: "🎵", title: "Sound", q: "How does electricity make sound?", level: "explorer" },
  { n: 7, emoji: "🌗", title: "Sensors", q: "How can a circuit notice the world?", level: "builder" },
  { n: 8, emoji: "🔀", title: "Logic", q: "How do circuits make decisions?", level: "inventor" },
  { n: 9, emoji: "🚨", title: "Alarms", q: "How do alarms keep us safe?", level: "inventor" },
  { n: 10, emoji: "🎮", title: "Games", q: "Can we build games with circuits?", level: "builder" },
  { n: 11, emoji: "🛠️", title: "Inventor briefs", q: "Can you design a circuit for a real person's problem?", level: "inventor" },
];

export const PROJECTS = [...PROJECTS_A, ...PROJECTS_B, ...PROJECTS_C];
export const projectById = id => PROJECTS.find(p => p.id === id);
export const projectsInUnit = n => PROJECTS.filter(p => p.unit === n);

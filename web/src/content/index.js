import { ELECTRICITY_CARDS, ELECTRICITY_LEVELS, ELECTRICITY_QUIZ } from "./electricity.js";
import {
  COMPUTER_CARDS, COMPUTER_LEVELS, COMPUTER_QUIZ, BINARY_CARDS, BINARY_LEVELS, BINARY_QUIZ,
  CODING_CARDS, CODING_LEVELS, CODING_QUIZ,
} from "./subjects.js";

// Built-in content. Used in demo mode, when the database is empty, and by the admin "Load starter content" button.
export const SEED = {
  modules: [
    { id: "electricity", title: "Electricity & Parts", tagline: "Batteries, bulbs, motors and sensors", emoji: "⚡", color: "lv1", activity: "circuit", sort: 0, published: true, levels: ELECTRICITY_LEVELS },
    { id: "computer", title: "Inside a Computer", tagline: "Input, brain, memory and output", emoji: "💻", color: "lv4", activity: null, sort: 1, published: true, levels: COMPUTER_LEVELS },
    { id: "binary", title: "Binary Magic", tagline: "Count like a computer with 1s and 0s", emoji: "🔢", color: "lv2", activity: "binary", sort: 2, published: true, levels: BINARY_LEVELS },
    { id: "coding", title: "Coding Puzzles", tagline: "Guide the robot with instructions", emoji: "🤖", color: "lv3", activity: "coding", sort: 3, published: true, levels: CODING_LEVELS },
  ],
  cards: [...ELECTRICITY_CARDS, ...COMPUTER_CARDS, ...BINARY_CARDS, ...CODING_CARDS].map(c => ({ ...c, published: true })),
  quiz: [...ELECTRICITY_QUIZ, ...COMPUTER_QUIZ, ...BINARY_QUIZ, ...CODING_QUIZ],
};

export const ACTIVITIES = {
  circuit: { title: "Build a circuit", emoji: "🔌" },
  binary: { title: "Binary cards", emoji: "🃏" },
  coding: { title: "Robot puzzles", emoji: "🧩" },
  hunt: { title: "Treasure hunt", emoji: "🔎" },
};

// Extra activities shown on some modules alongside their main one.
export const EXTRA_ACTIVITIES = { electricity: ["hunt", "machines"] };

export const AVATARS = ["🦊", "🐯", "🐼", "🐸", "🦁", "🐵", "🐨", "🦄", "🐙", "🐧", "🦖", "🐝"];

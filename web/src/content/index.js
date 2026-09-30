import { ELECTRICITY_CARDS, ELECTRICITY_LEVELS, ELECTRICITY_QUIZ } from "./electricity.js";
import {
  COMPUTER_CARDS, COMPUTER_LEVELS, COMPUTER_QUIZ, BINARY_CARDS, BINARY_LEVELS, BINARY_QUIZ,
  CODING_CARDS, CODING_LEVELS, CODING_QUIZ,
} from "./subjects.js";

// Built-in content. Used in demo mode, when the database is empty, and by the admin "Load starter content" button.
export const SEED = {
  modules: [
    { id: "electricity", area: "science", title: "Electricity & Parts", tagline: "Circuits, parts and logic gates", emoji: "⚡", color: "lv1", activity: "circuit", sort: 0, published: true, levels: ELECTRICITY_LEVELS },
    { id: "computer", area: "science", title: "Inside a Computer", tagline: "Input, brain, memory and output", emoji: "💻", color: "lv4", activity: null, sort: 1, published: true, levels: COMPUTER_LEVELS },
    { id: "binary", area: "science", title: "Binary Magic", tagline: "Count like a computer with 1s and 0s", emoji: "🔢", color: "lv2", activity: "binary", sort: 2, published: true, levels: BINARY_LEVELS },
    { id: "coding", area: "science", title: "Coding Puzzles", tagline: "Guide the robot with instructions", emoji: "🤖", color: "lv3", activity: "coding", sort: 3, published: true, levels: CODING_LEVELS },
    // Coming soon: shown as locked tiles so kids and parents can see what's next.
    { id: "alphabets", area: "language", title: "Alphabets", tagline: "A to Z with sounds", emoji: "🔠", color: "lv3", activity: null, sort: 10, published: true, coming_soon: true, levels: [] },
    { id: "words", area: "language", title: "Words", tagline: "Read and spell first words", emoji: "📖", color: "lv1", activity: null, sort: 11, published: true, coming_soon: true, levels: [] },
    { id: "sentences", area: "language", title: "Sentences", tagline: "Build and read sentences", emoji: "💬", color: "lv2", activity: null, sort: 12, published: true, coming_soon: true, levels: [] },
    { id: "typing", area: "language", title: "Typing", tagline: "Learn the keyboard, finger by finger", emoji: "⌨️", color: "lv4", activity: null, sort: 13, published: true, coming_soon: true, levels: [] },
    { id: "numbers", area: "maths", title: "Numbers", tagline: "Count, compare and order", emoji: "🔟", color: "lv2", activity: null, sort: 20, published: true, coming_soon: true, levels: [] },
    { id: "mathematics", area: "maths", title: "Mathematics", tagline: "Add, subtract, multiply and more", emoji: "➕", color: "lv3", activity: null, sort: 21, published: true, coming_soon: true, levels: [] },
  ],

  cards: [...ELECTRICITY_CARDS, ...COMPUTER_CARDS, ...BINARY_CARDS, ...CODING_CARDS].map(c => ({ ...c, published: true })),
  quiz: [...ELECTRICITY_QUIZ, ...COMPUTER_QUIZ, ...BINARY_QUIZ, ...CODING_QUIZ],
};

export const ACTIVITIES = {
  circuit: { title: "Circuits & gates", emoji: "🔌" },
  binary: { title: "Bit's adventure", emoji: "🤖" },
  coding: { title: "Robot puzzles", emoji: "🧩" },
  hunt: { title: "Treasure hunt", emoji: "🔎" },
};

// Extra activities shown on some modules alongside their main one.
export const EXTRA_ACTIVITIES = { electricity: ["hunt", "machines"] };

export const AVATARS = ["🦊", "🐯", "🐼", "🐸", "🦁", "🐵", "🐨", "🦄", "🐙", "🐧", "🦖", "🐝"];

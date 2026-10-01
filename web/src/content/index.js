import { ELECTRICITY_CARDS, ELECTRICITY_LEVELS, ELECTRICITY_QUIZ } from "./electricity.js";
import {
  COMPUTER_CARDS, COMPUTER_LEVELS, COMPUTER_QUIZ, BINARY_CARDS, BINARY_LEVELS, BINARY_QUIZ,
  CODING_CARDS, CODING_LEVELS, CODING_QUIZ,
} from "./subjects.js";

// Built-in content. Used in demo mode, when the database is empty, and by the admin "Load starter content" button.
export const SEED = {
  modules: [
    { id: "electricity", area: "science", title: "Electricity & Parts", tagline: "Circuits, parts and logic gates", emoji: "⚡", color: "lv1", activity: "circuit", sort: 0, published: true, levels: ELECTRICITY_LEVELS },
    { id: "computer", area: "science", title: "Inside a Computer", tagline: "How computers work, step by step", emoji: "💻", color: "lv4", activity: "computer", sort: 1, published: true, levels: COMPUTER_LEVELS },
    { id: "binary", area: "science", title: "Binary Magic", tagline: "Count like a computer with 1s and 0s", emoji: "🔢", color: "lv2", activity: "binary", sort: 2, published: true, levels: BINARY_LEVELS },
    { id: "coding", area: "science", title: "Coding Puzzles", tagline: "Guide the robot with instructions", emoji: "🤖", color: "lv3", activity: "coding", sort: 3, published: true, levels: CODING_LEVELS },
    { id: "alphabets", area: "language", title: "Alphabets", tagline: "A to Z with sounds", emoji: "🔠", color: "lv3", activity: "alphabets", sort: 10, published: true, levels: [] },
    { id: "words", area: "language", title: "Words", tagline: "Read, build and spell words", emoji: "📖", color: "lv1", activity: "words", sort: 11, published: true, levels: [] },
    { id: "sentences", area: "language", title: "Sentences", tagline: "Build sentences and use grammar", emoji: "💬", color: "lv2", activity: "sentences", sort: 12, published: true, levels: [] },
    { id: "numbers", area: "maths", title: "Numbers", tagline: "Count, compare and place value", emoji: "🔟", color: "lv2", activity: "numbers", sort: 20, published: true, levels: [] },
    { id: "mathematics", area: "maths", title: "Mathematics", tagline: "From adding to algebra", emoji: "➕", color: "lv3", activity: "mathematics", sort: 21, published: true, levels: [] },
    // Typing: its own area, for kids and adults.
    { id: "typing", area: "typing", title: "Touch Typing", tagline: "Learn the keyboard, finger by finger", emoji: "⌨️", color: "lv4", activity: "typing", sort: 30, published: true, levels: [] },
  ],

  cards: [...ELECTRICITY_CARDS, ...COMPUTER_CARDS, ...BINARY_CARDS, ...CODING_CARDS].map(c => ({ ...c, published: true })),
  quiz: [...ELECTRICITY_QUIZ, ...COMPUTER_QUIZ, ...BINARY_QUIZ, ...CODING_QUIZ],
};

export const ACTIVITIES = {
  circuit: { title: "Circuits & gates", emoji: "🔌" },
  binary: { title: "Bit's adventure", emoji: "🤖" },
  coding: { title: "Robot puzzles", emoji: "🧩" },
  hunt: { title: "Treasure hunt", emoji: "🔎" },
  alphabets: { title: "Polly's adventure", emoji: "🦜" },
  words: { title: "Polly's adventure", emoji: "🦜" },
  sentences: { title: "Polly's adventure", emoji: "🦜" },
  numbers: { title: "Ollie's adventure", emoji: "🐙" },
  mathematics: { title: "Ollie's adventure", emoji: "🐙" },
  typing: { title: "Typing course", emoji: "⌨️" },
  computer: { title: "Chip's path", emoji: "💻" },
};

// Subjects whose cards are a read-only glossary (no stars): their learning happens on the path.
export const GLOSSARY_MODULES = new Set(["computer"]);

// Extra activities shown on some modules alongside their main one.
export const EXTRA_ACTIVITIES = { electricity: ["hunt", "machines"] };

export const AVATARS = ["🦊", "🐯", "🐼", "🐸", "🦁", "🐵", "🐨", "🦄", "🐙", "🐧", "🦖", "🐝"];

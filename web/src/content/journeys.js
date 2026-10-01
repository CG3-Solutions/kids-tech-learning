// Every step-by-step adventure, keyed by the subject's `activity`. Plain data (no React),
// so progress, badges and parent reports can use it.
import { CIRCUIT_PATH, CIRCUIT_PARTS } from "./circuits.js";
import { BINARY_JOURNEY } from "./subjects.js";
import { ALPHABET_JOURNEY, ALPHABET_PARTS, WORDS_JOURNEY, WORDS_PARTS, SENTENCES_JOURNEY, SENTENCES_PARTS } from "./practice/language.js";
import { TYPING_JOURNEY, TYPING_PARTS } from "./typing.js";
import { COMPUTER_PATH, COMPUTER_PARTS } from "./computer.js";
import { NUMBERS_JOURNEY, NUMBERS_PARTS, MATHS_PATH, MATHS_PARTS } from "./practice/maths.js";

export const JOURNEYS = {
  alphabets: { name: "🔠 Polly's alphabet adventure", guide: "language", steps: ALPHABET_JOURNEY, parts: ALPHABET_PARTS, intro: "Meet every letter, its sound and its order." },
  words: { name: "📖 Polly's word adventure", guide: "language", steps: WORDS_JOURNEY, parts: WORDS_PARTS, intro: "Read, build and understand words." },
  sentences: { name: "💬 Polly's sentence adventure", guide: "language", steps: SENTENCES_JOURNEY, parts: SENTENCES_PARTS, intro: "Build sentences and become a grammar detective." },
  numbers: { name: "🔟 Ollie's number adventure", guide: "maths", steps: NUMBERS_JOURNEY, parts: NUMBERS_PARTS, intro: "Count, compare and understand big numbers." },
  mathematics: { name: "➕ Ollie's maths adventure", guide: "maths", steps: MATHS_PATH, parts: MATHS_PARTS, intro: "From adding apples to algebra and Pythagoras." },
  computer: { name: "💻 Chip's computer path", guide: "computer", steps: COMPUTER_PATH, parts: COMPUTER_PARTS, intro: "How computers work, one step at a time." },
  circuit: { name: "🔌 Volt's circuits & gates", guide: "circuits", steps: CIRCUIT_PATH, parts: CIRCUIT_PARTS, intro: "Build a doorbell, then gates that add and remember." },
  binary: { name: "🔢 Bit's binary adventure", guide: "binary", steps: BINARY_JOURNEY, parts: [] },
  typing: { name: "⌨️ Keyo's typing course", guide: "typing", steps: TYPING_JOURNEY, parts: TYPING_PARTS, intro: "Touch typing, finger by finger." },
};
export const ALL_STEPS = Object.values(JOURNEYS).flatMap(j => j.steps);
export const STEP_IDS = new Set(ALL_STEPS.map(s => s.id));

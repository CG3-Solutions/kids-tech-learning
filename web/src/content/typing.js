// Spark Lab typing course: the keyboard, which finger presses which key, the lessons, and
// the practice text for each lesson. Plain data (no React), so tests, progress and parent
// reports can use it.
import { letterName } from "./practice/language.js";

// ───────── Fingers ─────────
// Colours repeat on both hands: pinky, ring, middle, index (as on most typing courses).
export const FINGERS = {
  lp: { hand: "left", name: "left little finger", short: "Little", color: "f1" },
  lr: { hand: "left", name: "left ring finger", short: "Ring", color: "f2" },
  lm: { hand: "left", name: "left middle finger", short: "Middle", color: "f3" },
  li: { hand: "left", name: "left pointer finger", short: "Pointer", color: "f4" },
  ri: { hand: "right", name: "right pointer finger", short: "Pointer", color: "f4" },
  rm: { hand: "right", name: "right middle finger", short: "Middle", color: "f3" },
  rr: { hand: "right", name: "right ring finger", short: "Ring", color: "f2" },
  rp: { hand: "right", name: "right little finger", short: "Little", color: "f1" },
  th: { hand: "both", name: "thumb", short: "Thumb", color: "f0" },
};
// Older learners see "index" and "pinky", the usual typing words.
export const fingerName = (id, mode) => (mode === "pro" ? FINGERS[id].name.replace("pointer", "index").replace("little", "pinky") : FINGERS[id].name);

// ───────── Keyboard (US / India QWERTY) ─────────
// Each key: [character, finger, width in key units]. Keys we don't teach yet still show, dimmed.
const k = (row, fingers) => row.split(" ").map((c, i) => [c, fingers[i], 1]);
export const KEYBOARD = [
  [...k("` 1 2 3 4 5 6 7 8 9 0 - =", ["lp", "lp", "lr", "lm", "li", "li", "ri", "ri", "rm", "rr", "rp", "rp", "rp"]), ["⌫", "rp", 2]],
  [["Tab", "lp", 1.5], ...k("q w e r t y u i o p [ ]", ["lp", "lr", "lm", "li", "li", "ri", "ri", "rm", "rr", "rp", "rp", "rp"]), ["\\", "rp", 1.5]],
  [["Caps", "lp", 1.75], ...k("a s d f g h j k l ; '", ["lp", "lr", "lm", "li", "li", "ri", "ri", "rm", "rr", "rp", "rp"]), ["Enter", "rp", 2.25]],
  [["Shift", "lp", 2.25], ...k("z x c v b n m , . /", ["lp", "lr", "lm", "li", "li", "ri", "ri", "rm", "rr", "rp"]), ["Shift", "rp", 2.75]],
  [[" ", "th", 6.25]],
];
export const FINGER_OF = Object.fromEntries(KEYBOARD.flat().filter(([c]) => c.length === 1 && c !== "⌫").map(([c, f]) => [c, f]));
// The keys where each finger rests (F and J have little bumps you can feel).
export const HOME_KEYS = { lp: "a", lr: "s", lm: "d", li: "f", ri: "j", rm: "k", rr: "l", rp: ";", th: " " };
// Characters typed with Shift, and the key they live on (US / India layout).
export const SHIFTED = { "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0", "_": "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", "\"": "'", "<": ",", ">": ".", "?": "/" };
export const SHIFT_ON = Object.fromEntries(Object.entries(SHIFTED).map(([up, base]) => [base, up])); // key → its Shift symbol
// The key a character is typed on: "A" → "a", "?" → "/", "a" → "a".
export const baseOf = c => SHIFTED[c] ?? (/^[A-Z]$/.test(c) ? c.toLowerCase() : c);
export const needsShift = c => baseOf(c) !== c;
export const fingerOf = c => FINGER_OF[baseOf(c)];
// Touch typists press Shift with the other hand: a right-hand key uses the left Shift, and the other way round.
export const shiftSide = c => (needsShift(c) ? (FINGERS[fingerOf(c)].hand === "left" ? "right" : "left") : null);

export const keyLabel = c => (c === " " ? "space" : c);
// How the guide says a key out loud. Voices read a lone capital "A" as the word "a", so use names.
const SAY = {
  ";": "semicolon", " ": "the space bar", ",": "comma", ".": "full stop", "'": "apostrophe", "/": "slash", "?": "question mark",
  "!": "exclamation mark", "@": "at sign", "#": "hash", "$": "dollar sign", "%": "percent sign", "&": "and sign", "*": "star",
  "(": "open bracket", ")": "close bracket", "-": "dash", "+": "plus", "=": "equals", "\"": "quote mark", ":": "colon",
};
export const sayKey = c => SAY[c] ?? (/^[A-Z]$/.test(c) ? `capital ${letterName(c)}` : letterName(c.toUpperCase()));

// ───────── Words ─────────
// Everyday words, including Indian food, festivals and places. Each lesson uses only
// the words made from keys learned so far.
export const WORDS = `
a as ad add all ask dad sad had has lad fad fall hall glad flag flask half lash dash gash hash sash
flash slash salad shall alas lass glass gas lag dal saag adds asks falls halls flags dads lads
the to too two you your are was for that with this they their there them then what where were here her
his he she we it is if its of off or our out up us so go got get gets got hot pot top toy tea tree
she see sea seed feet fee free three street sweet sheet sleep keep deep jeep peel feel heel wheel
is it sit fit hit kit pit sip tip trip ship shop stop top spot pots post most lost
red rest test west east fast past last list late gate date kite site wide ride side hide
pet set wet get yet let jet tea eat seat heat sheep read road toad goat boat coat oat
dog frog log fog jog egg eggs leg legs pig fish dish wish rush push pull full
art part party pretty dirty forty sixty fifty story stories sport sports pie pies
paper water sister letter flower towel tower power quiet quite quiz quest queue
yellow purple white light right fight sight tight eight height high sigh
roti dosa idli atta ghee lassi puri halwa jalebi papad poha upma kheer
diwali holi diya puja yoga guru sitar
delhi agra goa assam kerala ooty jaipur kolkata
hello happy holiday house horse hose hope hop help heart her his how
we will well wall walk talk tall told old gold hold fold sold
are our hour flour sour four fourth fort sort short shirt skirt
desk disk dusk husk task ask asked fish fished jump jumped
it its their they the these those there here where whose who why wait
apple ball cat cup bus box zoo van mango banana lemon lion monkey zebra
come came name game more many money moon noon soon sun fun run bun win man can fan box fox six mix next
zip zero buzz cab cub cave give live love move voice nice rice mice once dance bench lunch school class
clock black blue brown green orange cream milk bread butter jam bat bag big bike book cook look boy baby
crab camel cow cobra mouse match maths music number cinema chennai mumbai pune nagpur biryani naan chutney
samosa sambar curd chai mixer box cozy lazy maze quiz amazing vanilla movie travel clever village
`.trim().split(/\s+/);

// Names and places for capitals practice.
export const PROPER = `Riya Aarav Delhi Goa Kerala Mumbai Pune Hyderabad Diwali Holi Jaipur Ooty Agra Assam Ishaan Meera Kabir
Zoya Vivaan Ananya Neha Rohan Priya Sita Ravi Uma Leela Yash Chennai India Monday Friday Sunday Kolkata Xavier`.trim().split(/\s+/);

// Real sentences for stages 5 and 6. Each lesson uses only the ones made of keys learned so far.
export const SENTENCES = [
  "The cat sat on the mat.", "Riya has a red kite.", "We eat idli and dosa for breakfast.", "My dog likes to run in the park.",
  "Aarav reads a book every night.", "The sun is hot in May.", "Diwali is the festival of lights.", "We fly kites in January.",
  "Grandma makes sweet kheer.", "The train to Delhi is late.", "Please close the door.", "I like mango, banana and apple.",
  "The sky is blue and the grass is green.", "Hyderabad is famous for biryani.", "Can you help me?", "Where is my school bag?",
  "It's time for lunch.", "Don't forget your water bottle.", "I'm good at typing.", "What is your name?",
  "Let's play cricket after school.", "The monkey jumped from tree to tree.", "Mumbai is near the sea.", "We visited Goa in December.",
  "Dad cooks rice, dal and sabzi.", "Is it going to rain today?", "My sister has a new bicycle.", "The zebra has black and white stripes.",
  "A quick brown fox jumps over the lazy dog.", "Kerala has many green hills.", "She's my best friend.", "Who wants some chai?",
  "Ravi, please pass the salt.", "Our class has a fish tank.", "Meera can swim very fast.", "Why is the moon so bright?",
];
// Sentences and bits of text with numbers and symbols (stage 6).
export const NUMBER_TEXT = [
  "I have 3 pencils.", "My school bus is number 12.", "We need 6 eggs.", "The book costs 250 rupees.", "Our flat is on floor 4.",
  "There are 35 kids in my class.", "India became free on 15 August 1947.", "The match starts at 4 o'clock.", "My roll number is 21.",
  "Riya is 8 years old.", "Grandpa was born in 1958.", "We planted 10 trees.", "A week has 7 days.", "Call 100 for the police.",
  "The answer is 42.", "Train 12723 goes to Delhi.", "Pin code 500081 is in Hyderabad.",
];
export const SYMBOL_TEXT = [
  "Wow!", "Well done!", "Email riya@spark.lab today.", "We won! #1 team", "Only $5!", "50% off!", "Get 100% right!",
  "5 + 3 = 8", "10 - 4 = 6", "3 * 4 = 12", "(yes)", "tea & toast", "Time: 10:30", "\"Hello,\" she said.", "Mix (2 + 3) * 4.",
  "Look out!", "Meet at 6:15 sharp!", "Save 20%!", "#diwali", "Price: $12", "\"Yes!\" said Aarav.", "Score: 9 - 2",
];

// ───────── Lessons ─────────
// Stages group the lessons (like parts of an adventure). T1 covers stages 1–3.
export const TYPING_PARTS = [
  { id: "ready", title: "Stage 1: Get ready", who: "Everyone starts here", note: "Sit well, find the home row and feel the bumps on F and J." },
  { id: "home", title: "Stage 2: The home row", who: "Kids and adults", note: "Your fingers' resting row. Every other key is a short reach from here." },
  { id: "top", title: "Stage 3: The top row", who: "Kids and adults", note: "Reach up from the home row, then come straight back." },
  { id: "bottom", title: "Stage 4: The bottom row", who: "Kids and adults", note: "Curl down from the home row: every letter of the alphabet by touch." },
  { id: "shift", title: "Stage 5: Capitals and punctuation", who: "3rd standard and up, adults", note: "Shift with the other hand, full stops, commas and question marks: real sentences." },
  { id: "numbers", title: "Stage 6: Numbers and symbols", who: "4th standard and up, adults", note: "The number row and the symbols above it: dates, prices, emails and maths." },
];

const HOME = ["a", "s", "d", "f", "j", "k", "l", ";"];
const HOME_ALL = [...HOME, "g", "h"];
const TOP = ["e", "i", "r", "u", "t", "y", "w", "o", "q", "p"];
const LOWER = [..."abcdefghijklmnopqrstuvwxyz"];
const UPPER = LOWER.map(c => c.toUpperCase());
const LETTERS = [...HOME_ALL, ...TOP, "m", "v", "c", ",", "x", ".", "z", "/", "b", "n"];
const LEFT_CAPS = [..."QWERTASDFGZXCVB"];   // typed with the right Shift
const RIGHT_CAPS = [..."YUIOPHJKLNM"];      // typed with the left Shift
const SENTENCE = [...LETTERS, ...UPPER, "?", "'"];
const DIGITS = [..."1234567890"];

// Pass marks. Speed goals only apply to the stage checks.
export const GOALS = {
  lesson: { kids: { acc: 85 }, pro: { acc: 90 } },
  home: { kids: { acc: 90, wpm: 5 }, pro: { acc: 90, wpm: 15 } },
  top: { kids: { acc: 90, wpm: 8 }, pro: { acc: 90, wpm: 20 } },
  bottom: { kids: { acc: 90, wpm: 10 }, pro: { acc: 90, wpm: 25 } },
  shift: { kids: { acc: 90, wpm: 10 }, pro: { acc: 90, wpm: 28 } },
  numbers: { kids: { acc: 88, wpm: 8 }, pro: { acc: 90, wpm: 22 } },
};

const L = (n, part, emoji, title, blurb, kind, keys, pool, extra) => ({
  id: `typ-step-${n}`, part, emoji, title, blurb, kind, keys, pool, goal: GOALS.lesson, ...extra,
});
const keysTitle = keys => keys.map(c => (/^[a-z]$/.test(c) ? c.toUpperCase() : c)).join(" and ");
const keysSay = keys => keys.map(sayKey).join(" and ");
const keyLesson = (n, part, emoji, keys, pool, extra = {}) => {
  const f = keys.map(c => fingerName(fingerOf(c), "kids"));
  return L(n, part, emoji, `${keysTitle(keys)}`, `New keys: ${keysTitle(keys)}`, "keys", keys, pool, {
    intro: `Press ${keysTitle(keys)} with your ${f[0]}${f[1] && f[1] !== f[0] ? ` and ${f[1]}` : ""}. Reach, press, and come back home.`,
    say: `New keys! Press ${keysSay(keys)}. Reach, press, and come back home.`,
    learned: `Where ${keysTitle(keys)} are, and which fingers press them.`,
    parent: `Watch the fingers, not the speed: each key should be pressed by the finger shown on the screen. Gently cover the keyboard with a cloth if eyes keep looking down.`,
    ...extra,
  });
};

export const TYPING_JOURNEY = [
  L(1, "ready", "🪑", "Sit like a typist", "Find F and J, use the space bar", "keys", ["f", "j", " "], ["f", "j"], {
    tips: [
      ["🪑", "Sit up straight, feet flat on the floor."],
      ["👀", "Look at the screen, not at your hands."],
      ["☝️", "Feel the little bumps on F and J. Your pointer fingers rest there."],
      ["👍", "Thumbs rest on the space bar."],
    ],
    intro: "Rest your pointer fingers on the bumps of F and J. Press each key the screen shows, and use a thumb for the space bar.",
    say: `Rest your pointer fingers on the bumps of ${sayKey("f")} and ${sayKey("j")}. Use a thumb for the space bar.`,
    learned: "How to sit, where the home bumps are, and pressing space with a thumb.",
    parent: "Check posture: back straight, wrists floating (not resting on the desk), eyes on the screen. Ask them to find F and J with eyes closed.",
  }),
  L(2, "ready", "🏠", "Home row fingers", "All eight fingers find their keys", "keys", HOME, HOME, {
    tips: [
      ["🖐️", "Left hand: A S D F. Right hand: J K L and semicolon."],
      ["🎨", "Each colour on the keyboard matches a finger on the hands below."],
    ],
    intro: "Every finger has a home key. Left hand on A S D F, right hand on J K L and the semicolon key.",
    say: `Every finger has a home key. Left hand on ${["a", "s", "d", "f"].map(sayKey).join(", ")}. Right hand on ${["j", "k", "l"].map(sayKey).join(", ")}, and semicolon.`,
    learned: "The home row: the keys where all eight fingers rest.",
    parent: "Say a key name and ask which finger presses it. Fingers should go back to the home row after every key.",
  }),
  keyLesson(3, "home", "🔑", ["d", "k"], ["f", "j", "d", "k"]),
  keyLesson(4, "home", "🔑", ["s", "l"], ["f", "j", "d", "k", "s", "l"]),
  keyLesson(5, "home", "🔑", ["a", ";"], HOME),
  keyLesson(6, "home", "↔️", ["g", "h"], HOME_ALL, {
    intro: "G and H are a small stretch: your pointer fingers slide one key towards the middle, then back to F and J.",
    say: `${sayKey("g")} and ${sayKey("h")} are a small stretch. Your pointer fingers slide to the middle, then back home.`,
  }),
  L(7, "home", "📝", "Home row words", "Real words with the home row", "words", [], HOME_ALL, {
    intro: "Now type real words like dad, glass and salad, using only home row keys.",
    learned: "Typing whole words without looking.",
    parent: "Celebrate words typed without looking down. Accuracy first; speed comes later.",
  }),
  L(8, "home", "🏁", "Home row check", "Show your home row skills", "check", [], HOME_ALL, {
    goal: GOALS.home,
    intro: "A short check. Type carefully and keep going. Reach the goal to finish the stage.",
    learned: "Stage 2 complete: the whole home row by touch.",
    parent: "This check has a speed goal (5 words a minute for kids, 15 for adults) and needs 90% accuracy. If it's hard, repeat lessons 3 to 7 first.",
  }),
  keyLesson(9, "top", "⬆️", ["e", "i"], [...HOME_ALL, "e", "i"]),
  keyLesson(10, "top", "⬆️", ["r", "u"], [...HOME_ALL, "e", "i", "r", "u"]),
  keyLesson(11, "top", "⬆️", ["t", "y"], [...HOME_ALL, "e", "i", "r", "u", "t", "y"], {
    intro: "T and Y are stretches for your pointer fingers: up and towards the middle.",
    say: `${sayKey("t")} and ${sayKey("y")} are stretches for your pointer fingers.`,
  }),
  keyLesson(12, "top", "⬆️", ["w", "o"], [...HOME_ALL, "e", "i", "r", "u", "t", "y", "w", "o"]),
  keyLesson(13, "top", "⬆️", ["q", "p"], [...HOME_ALL, ...TOP]),
  L(14, "top", "📝", "Top row words", "Words with the home and top rows", "words", [], [...HOME_ALL, ...TOP], {
    intro: "Lots of words now: the, story, water, diwali. Reach up and come back home.",
    learned: "Typing everyday words with two rows.",
    parent: "Ask them to type a short message to a grandparent using only these letters (no b, c, m, n, v, x, z yet).",
  }),
  L(15, "top", "🏆", "Top row check", "Show your top row skills", "check", [], [...HOME_ALL, ...TOP], {
    goal: GOALS.top,
    intro: "The stage check. Type carefully and keep a steady rhythm.",
    learned: "Stage 3 complete: the home and top rows by touch.",
    parent: "Goal: 8 words a minute for kids, 20 for adults, with 90% accuracy. A steady rhythm matters more than bursts of speed.",
  }),
  // ── Stage 4: the bottom row ──
  keyLesson(16, "bottom", "⬇️", ["m", "v"], [...HOME_ALL, ...TOP, "m", "v"], {
    intro: "M and V: your pointer fingers curl down from J and F. Press, then come back home.",
    say: `${sayKey("m")} and ${sayKey("v")}: your pointer fingers curl down, then come back home.`,
  }),
  keyLesson(17, "bottom", "⬇️", ["c", ","], [...HOME_ALL, ...TOP, "m", "v", "c", ","]),
  keyLesson(18, "bottom", "⬇️", ["x", "."], [...HOME_ALL, ...TOP, "m", "v", "c", ",", "x", "."]),
  keyLesson(19, "bottom", "⬇️", ["z", "/"], [...HOME_ALL, ...TOP, "m", "v", "c", ",", "x", ".", "z", "/"]),
  keyLesson(20, "bottom", "↔️", ["b", "n"], LETTERS, {
    intro: "B and N are stretches: pointer fingers reach down and towards the middle.",
    say: `${sayKey("b")} and ${sayKey("n")} are stretches for your pointer fingers.`,
  }),
  L(21, "bottom", "📝", "All the letters", "Words with every letter", "words", [], LETTERS, {
    focus: [..."bcmnvxz"],
    intro: "Every letter is yours now: type words like banana, monkey and zebra.",
    learned: "Typing any lower-case word by touch.",
    parent: "Ask them to type their own name and the names of family members (small letters for now).",
  }),
  L(22, "bottom", "🏁", "Bottom row check", "Show all three rows", "check", [], LETTERS, {
    focus: [..."bcmnvxz"],
    goal: GOALS.bottom,
    intro: "The stage check: words from all three rows. Keep a steady rhythm.",
    learned: "Stage 4 complete: the whole alphabet by touch.",
    parent: "Goal: 10 words a minute for kids, 25 for adults, with 90% accuracy.",
  }),
  // ── Stage 5: capitals and punctuation ──
  L(23, "shift", "⇧", "Left Shift capitals", "Capitals for right-hand letters", "caps", RIGHT_CAPS, [...LETTERS, ...RIGHT_CAPS], {
    intro: "For a capital typed by your right hand, hold the left Shift with your left little finger, press the letter, then let go.",
    say: "For a capital typed by your right hand, hold the left Shift with your left little finger, then press the letter.",
    learned: "Capitals with the left Shift key.",
    parent: "Shift is always pressed by the other hand's little finger. Watch that they don't use Caps Lock.",
  }),
  L(24, "shift", "⇧", "Right Shift capitals", "Capitals for left-hand letters", "caps", LEFT_CAPS, [...LETTERS, ...UPPER], {
    intro: "For a capital typed by your left hand, hold the right Shift with your right little finger.",
    say: "For a capital typed by your left hand, hold the right Shift with your right little finger.",
    learned: "Capitals with the right Shift key.",
    parent: "Names and places are good practice: Delhi, Goa, Riya, Aarav.",
  }),
  L(25, "shift", "✍️", "Sentences", "Capitals, commas and full stops", "sentences", [], [...LETTERS, ...UPPER], {
    intro: "Real sentences now: start with a capital, end with a full stop.",
    learned: "Typing sentences with capitals, commas and full stops.",
    parent: "Remind them: one space after a full stop, and a capital to start the next sentence.",
  }),
  keyLesson(26, "shift", "❓", ["?", "'"], SENTENCE, {
    intro: "The question mark is Shift and slash. The apostrophe is next to the semicolon, under your right little finger.",
    say: "The question mark is Shift and slash. The apostrophe sits next to the semicolon.",
    learned: "Question marks and apostrophes (it's, don't, I'm).",
  }),
  L(27, "shift", "🏆", "Capitals and punctuation check", "Show your sentence skills", "check-sentences", [], SENTENCE, {
    goal: GOALS.shift,
    intro: "The stage check: sentences with capitals, commas, full stops and questions.",
    learned: "Stage 5 complete: typing real sentences.",
    parent: "Goal: 10 words a minute for kids, 28 for adults, with 90% accuracy.",
  }),
  // ── Stage 6: numbers and symbols ──
  keyLesson(28, "numbers", "🔢", ["1", "2", "3", "4", "5"], [...SENTENCE, "1", "2", "3", "4", "5"], {
    intro: "Numbers 1 to 5 are on the top row, above Q W E R T. Reach up with your left hand and come back home.",
    say: "Numbers one to five: reach up with your left hand, then come back home.",
    learned: "Typing 1 to 5 with the left hand.",
  }),
  keyLesson(29, "numbers", "🔢", ["6", "7", "8", "9", "0"], [...SENTENCE, ...DIGITS], {
    intro: "Numbers 6 to 0 are above Y U I O P, for your right hand. 6 is a long reach for the right pointer finger.",
    say: "Numbers six to zero are for your right hand. Six is a long reach for your right pointer finger.",
    learned: "Typing 6 to 0 with the right hand.",
  }),
  L(30, "numbers", "📅", "Numbers in sentences", "Dates, ages and prices", "numbers", [], [...SENTENCE, ...DIGITS], {
    intro: "Mix numbers and words: 15 August, 3 eggs, 250 rupees.",
    learned: "Moving between letters and numbers smoothly.",
    parent: "Practise real things together: a phone number, a birthday, a shopping list with amounts.",
  }),
  keyLesson(31, "numbers", "✳️", ["!", "@", "#", "$", "%"], [...SENTENCE, ...DIGITS, "!", "@", "#", "$", "%"], {
    intro: "Symbols live above the numbers: hold Shift with the other hand and press the number key.",
    say: "Symbols live above the numbers. Hold Shift with the other hand and press the number key.",
    learned: "Exclamation marks, the at sign for emails, hash, dollar and percent.",
    kind: "symbols",
  }),
  keyLesson(32, "numbers", "➕", ["(", ")", "-", "+", "&", "*", ":", "\""], [...SENTENCE, ...DIGITS, "!", "@", "#", "$", "%", "(", ")", "-", "+", "&", "*", ":", "\"", "="], {
    intro: "Brackets, dash, plus, equals, and sign, star, colon and quote marks: for maths, times and speech.",
    say: "Brackets, dash, plus, equals, and sign, star, colon and quote marks. Shift with the other hand when you need it.",
    learned: "The symbols used in maths, times and quotes.",
    kind: "symbols",
  }),
  L(33, "numbers", "🎹", "Numbers and symbols check", "The whole keyboard", "check-symbols", [], [...SENTENCE, ...DIGITS, "!", "@", "#", "$", "%", "(", ")", "-", "+", "&", "*", ":", "\"", "="], {
    goal: GOALS.numbers,
    intro: "The final check: sentences with numbers and symbols. You know the whole keyboard!",
    learned: "Stage 6 complete: the whole keyboard by touch.",
    parent: "Goal: 8 words a minute for kids, 22 for adults, with 88 to 90% accuracy. Numbers and symbols are slower for everyone.",
  }),
].map(s => ({ ...s, say: s.say ?? s.intro }));

// ───────── Practice text ─────────
const pick = a => a[Math.floor(Math.random() * a.length)];
const LENGTH = {
  keys: { kids: 48, pro: 110 }, words: { kids: 60, pro: 150 }, check: { kids: 54, pro: 170 }, caps: { kids: 70, pro: 140 },
  sentences: { kids: 60, pro: 160 }, "check-sentences": { kids: 70, pro: 190 }, numbers: { kids: 60, pro: 150 },
  symbols: { kids: 50, pro: 130 }, "check-symbols": { kids: 70, pro: 190 },
};
const fits = (text, pool) => { const ok = new Set([...pool, " "]); return [...text].every(c => ok.has(c)); };
const shuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
export const wordsFor = pool => {
  const ok = new Set(pool);
  return WORDS.filter(w => [...w].every(c => ok.has(c)));
};

// Short groups of letters built from the lesson's keys, mostly the new ones.
function drill(lesson, len) {
  const fresh = lesson.keys.filter(c => c !== " ");
  const plain = lesson.pool.filter(c => baseOf(c) === c); // random groups use plain keys, not capitals
  const out = [];
  // Warm up: each new key on its own, then pairs.
  for (const c of fresh) out.push(...Array(fresh.length > 3 ? 1 : 2).fill(c.repeat(3)));
  if (fresh.length > 1) out.push(fresh.join(""), [...fresh].reverse().join(""));
  const words = wordsFor(lesson.pool).filter(w => fresh.some(c => w.includes(c)) && w.length > 1);
  while (out.join(" ").length < len) {
    if (words.length && Math.random() < 0.4) { out.push(pick(words)); continue; }
    const n = 2 + Math.floor(Math.random() * 3);
    let g = "";
    for (let i = 0; i < n; i++) g += Math.random() < 0.55 ? pick(fresh) : pick(plain);
    out.push(g);
  }
  return out.join(" ");
}

// Real words; a lesson's `focus` letters (the stage's new keys) come up in at least half the words.
function wordText(lesson, len) {
  const words = wordsFor(lesson.pool).filter(w => w.length > 1);
  const focus = lesson.focus ? words.filter(w => lesson.focus.some(c => w.includes(c))) : [];
  const out = [];
  let prev = "";
  while (out.join(" ").length < len) {
    const w = focus.length && (out.length % 2 === 0 || Math.random() < 0.3) ? pick(focus) : pick(words);
    if (w !== prev) out.push(w);
    prev = w;
  }
  return out.join(" ");
}

// Capitals practice: words and names, many starting with one of the lesson's capitals.
function capsText(lesson, len) {
  const caps = new Set(lesson.keys);
  const words = wordsFor(lesson.pool).filter(w => w.length > 1);
  const names = PROPER.filter(n => caps.has(n[0]) && fits(n, lesson.pool));
  const out = [];
  // Every capital at least once, then a mix.
  for (const c of shuffle(lesson.keys)) {
    const w = names.find(n => n[0] === c) ?? words.find(x => x[0] === c.toLowerCase());
    out.push(w ? (w[0] === c ? w : c + w.slice(1)) : c);
  }
  while (out.join(" ").length < len) {
    const r = Math.random();
    if (r < 0.3 && names.length) out.push(pick(names));
    else { const w = pick(words); out.push(r < 0.6 && caps.has(w[0].toUpperCase()) ? w[0].toUpperCase() + w.slice(1) : w); }
  }
  return out.join(" ");
}

// Whole sentences until the text is long enough. `cover` makes sure each listed key shows up.
function sentenceText(list, lesson, len, cover = []) {
  const ok = list.filter(t => fits(t, lesson.pool));
  const out = [];
  for (const c of cover) {
    if (out.some(t => t.includes(c))) continue;
    const has = ok.filter(t => t.includes(c));
    if (has.length) out.push(pick(has));
  }
  let guard = 0;
  while (out.join(" ").length < len && guard++ < 200) {
    const t = pick(ok);
    if (t !== out.at(-1)) out.push(t);
  }
  return shuffle(out).join(" ");
}

// The text to type for a lesson, in "kids" or "pro" mode.
export function lessonText(lesson, mode = "kids") {
  const len = LENGTH[lesson.kind][mode];
  const k = lesson.kind;
  if (k === "caps") return capsText(lesson, len);
  if (k === "sentences" || k === "check-sentences") return sentenceText(SENTENCES, lesson, len, k === "check-sentences" ? ["?", "'", ","] : [","]);
  if (k === "numbers") return sentenceText(NUMBER_TEXT, lesson, len, mode === "pro" ? DIGITS : shuffle(DIGITS).slice(0, 3));
  if (k === "symbols") return sentenceText([...SYMBOL_TEXT, ...NUMBER_TEXT.slice(0, 6)], lesson, len, lesson.keys);
  if (k === "check-symbols") return sentenceText([...SYMBOL_TEXT, ...NUMBER_TEXT, ...SENTENCES], lesson, len, ["!", "@", "$", "%", "(", ":", "+"]);
  return trimTo(k === "keys" ? drill(lesson, len) : wordText(lesson, len), len);
}
function trimTo(text, len) {
  // Trim to a whole word near the target length.
  const cut = text.length > len + 8 ? text.slice(0, text.indexOf(" ", len) > 0 ? text.indexOf(" ", len) : text.length) : text;
  return cut.trim();
}

export const goalFor = (lesson, mode) => lesson.goal[mode === "pro" ? "pro" : "kids"];
// Stars: 1 for passing, 2 for 95% accuracy, 3 for 98%.
export function starsFor(lesson, mode, r) {
  const g = goalFor(lesson, mode);
  if (r.accuracy < g.acc || (g.wpm && r.wpm < g.wpm)) return 0;
  return r.accuracy >= 98 ? 3 : r.accuracy >= 95 ? 2 : 1;
}
// Adults, and kids in 6th standard and above, start in Pro mode; anyone can switch.
export const defaultMode = gradeOrLearner => (typeof gradeOrLearner === "object" && gradeOrLearner
  ? (gradeOrLearner.learner === "adult" || (gradeOrLearner.grade ?? 0) >= 6 ? "pro" : "kids")
  : (gradeOrLearner ?? 0) >= 6 ? "pro" : "kids");
export const isAdult = learner => learner?.learner === "adult";

// ───────── Speed ladder and games ─────────
// Each rung of the speed ladder is a 1-minute test at this many words a minute (with 90% accuracy).
export const LADDER = [5, 8, 10, 12, 15, 20, 25, 30, 35, 40, 50, 60];
export const LADDER_ACC = 90;
export const GAMES = [
  { id: "balloon", emoji: "🎈", title: "Balloon Pop", blurb: "Pop the letter balloons before they fly away", builds: "Finding keys fast" },
  { id: "rocket", emoji: "🚀", title: "Word Rocket", blurb: "Type words to fill the fuel tank before the countdown ends", builds: "Word speed" },
  { id: "race", emoji: "🏎️", title: "Typing Race", blurb: "Race against your own best run", builds: "Beating your record" },
  { id: "clock", emoji: "⏱️", title: "Beat the Clock", blurb: "60 seconds: streaks without mistakes score double, triple, more", builds: "Steady rhythm" },
];
// Kids unlock the speed ladder and games by passing the home row check; Pro mode has them open.
export const GAMES_UNLOCK = "typ-step-8";
export const gamesOpen = (done, mode) => mode === "pro" || done.has(GAMES_UNLOCK);
// Keys for games: everything from the furthest lesson passed (at least the home row).
export function gamePool(done, mode) {
  if (mode === "pro") return TYPING_JOURNEY.at(-1).pool;
  const last = [...TYPING_JOURNEY].reverse().find(s => done.has(s.id));
  return last && last.pool.length > HOME_ALL.length ? last.pool : HOME_ALL;
}
// Endless word text for timed runs (never the same word twice in a row).
export function streamText(pool, len = 120) {
  const words = wordsFor(pool).filter(w => w.length > 1);
  const out = [];
  while (out.join(" ").length < len) {
    const w = pick(words);
    if (w !== out.at(-1)) out.push(w);
  }
  return out.join(" ");
}
export const gameOf = id => GAMES.find(g => g.id === id);

// ───────── Smart practice and typing tests ─────────
// A practice lesson built from the learner's weakest keys (from `weakKeys`), using keys they know.
export function smartLesson(weak, pool) {
  const plain = [...new Set(pool.filter(c => c !== " ").map(baseOf))];
  const keys = [...new Set(weak.map(w => baseOf(w.key ?? w)))].filter(c => plain.includes(c)).slice(0, 4);
  const names = keys.map(c => (/^[a-z]$/.test(c) ? c.toUpperCase() : c)).join(", ");
  return {
    id: "practice-smart", part: null, emoji: "🎯", title: "Smart practice", blurb: `Your tricky keys: ${names}`, kind: "keys",
    keys, pool: plain, goal: GOALS.lesson,
    intro: `Smart practice on the keys you miss most: ${names}. Go slowly and press each one with the right finger.`,
    say: `Smart practice on your tricky keys: ${keys.map(sayKey).join(", ")}. Go slowly and use the right finger.`,
    learned: `Extra practice on ${names}.`,
    parent: "Smart practice is made from the keys your child missed most in the last 20 lessons. A few minutes a day fixes them quickly.",
  };
}
export const TESTS = [1, 3, 5]; // minutes
export const TEST_ACC = 90;      // accuracy needed for a certificate
// Endless text for a typing test: real sentences once capitals are learned, otherwise words.
export function testText(pool, len = 200) {
  const ok = SENTENCES.filter(t => fits(t, pool));
  if (ok.length < 6) return streamText(pool, len);
  const out = [];
  while (out.join(" ").length < len) { const t = pick(ok); if (t !== out.at(-1)) out.push(t); }
  return out.join(" ");
}
// A readable name for any saved typing result: a lesson, a ladder rung or a game.
export function sessionTitle(id) {
  const lesson = TYPING_JOURNEY.find(s => s.id === id);
  if (lesson) return lesson.title;
  if (id?.startsWith("ladder-")) return `Speed ladder: ${id.slice(7)} words a minute`;
  if (id === "practice-smart") return "Smart practice";
  if (id?.startsWith("test-")) return `${id.slice(5)}-minute typing test`;
  if (id?.startsWith("game-")) return gameOf(id.slice(5))?.title ?? id;
  return id;
}

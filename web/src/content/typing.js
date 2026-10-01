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
export const keyLabel = c => (c === " " ? "space" : c);
// How the guide says a key out loud. Voices read a lone capital "A" as the word "a", so use names.
const SAY = { ";": "semicolon", " ": "the space bar", ",": "comma", ".": "full stop", "'": "apostrophe" };
export const sayKey = c => SAY[c] ?? letterName(c.toUpperCase()) ?? c;

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
`.trim().split(/\s+/);

// ───────── Lessons ─────────
// Stages group the lessons (like parts of an adventure). T1 covers stages 1–3.
export const TYPING_PARTS = [
  { id: "ready", title: "Stage 1: Get ready", who: "Everyone starts here", note: "Sit well, find the home row and feel the bumps on F and J." },
  { id: "home", title: "Stage 2: The home row", who: "Kids and adults", note: "Your fingers' resting row. Every other key is a short reach from here." },
  { id: "top", title: "Stage 3: The top row", who: "Kids and adults", note: "Reach up from the home row, then come straight back." },
];

const HOME = ["a", "s", "d", "f", "j", "k", "l", ";"];
const HOME_ALL = [...HOME, "g", "h"];
const TOP = ["e", "i", "r", "u", "t", "y", "w", "o", "q", "p"];

// Pass marks. Speed goals only apply to the stage checks.
export const GOALS = {
  lesson: { kids: { acc: 85 }, pro: { acc: 90 } },
  home: { kids: { acc: 90, wpm: 5 }, pro: { acc: 90, wpm: 15 } },
  top: { kids: { acc: 90, wpm: 8 }, pro: { acc: 90, wpm: 20 } },
};

const L = (n, part, emoji, title, blurb, kind, keys, pool, extra) => ({
  id: `typ-step-${n}`, part, emoji, title, blurb, kind, keys, pool, goal: GOALS.lesson, ...extra,
});
const keysTitle = keys => keys.map(c => (c === ";" ? ";" : c.toUpperCase())).join(" and ");
const keysSay = keys => keys.map(sayKey).join(" and ");
const keyLesson = (n, part, emoji, keys, pool, extra = {}) => {
  const f = keys.map(c => fingerName(FINGER_OF[c], "kids"));
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
].map(s => ({ ...s, say: s.say ?? s.intro }));

// ───────── Practice text ─────────
const pick = a => a[Math.floor(Math.random() * a.length)];
const LENGTH = { keys: { kids: 48, pro: 110 }, words: { kids: 60, pro: 150 }, check: { kids: 54, pro: 170 } };
export const wordsFor = pool => {
  const ok = new Set(pool);
  return WORDS.filter(w => [...w].every(c => ok.has(c)));
};

// Short groups of letters built from the lesson's keys, mostly the new ones.
function drill(lesson, len) {
  const fresh = lesson.keys.filter(c => c !== " ");
  const out = [];
  // Warm up: each new key on its own, then pairs.
  for (const c of fresh) out.push(...Array(fresh.length > 3 ? 1 : 2).fill(c.repeat(3)));
  if (fresh.length > 1) out.push(fresh.join(""), [...fresh].reverse().join(""));
  const words = wordsFor(lesson.pool).filter(w => fresh.some(c => w.includes(c)) && w.length > 1);
  while (out.join(" ").length < len) {
    if (words.length && Math.random() < 0.4) { out.push(pick(words)); continue; }
    const n = 2 + Math.floor(Math.random() * 3);
    let g = "";
    for (let i = 0; i < n; i++) g += Math.random() < 0.55 ? pick(fresh) : pick(lesson.pool);
    out.push(g);
  }
  return out.join(" ");
}

function wordText(lesson, len) {
  const words = wordsFor(lesson.pool).filter(w => w.length > 1);
  const out = [];
  let prev = "";
  while (out.join(" ").length < len) {
    const w = pick(words);
    if (w !== prev) out.push(w);
    prev = w;
  }
  return out.join(" ");
}

// The text to type for a lesson, in "kids" or "pro" mode. Always lower case in stages 1–3.
export function lessonText(lesson, mode = "kids") {
  const len = LENGTH[lesson.kind][mode];
  const text = lesson.kind === "keys" ? drill(lesson, len) : wordText(lesson, len);
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
// Kids in 6th standard and above start in Pro mode; anyone can switch.
export const defaultMode = grade => ((grade ?? 0) >= 6 ? "pro" : "kids");

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
// A readable name for any saved typing result: a lesson, a ladder rung or a game.
export function sessionTitle(id) {
  const lesson = TYPING_JOURNEY.find(s => s.id === id);
  if (lesson) return lesson.title;
  if (id?.startsWith("ladder-")) return `Speed ladder: ${id.slice(7)} words a minute`;
  if (id?.startsWith("game-")) return gameOf(id.slice(5))?.title ?? id;
  return id;
}

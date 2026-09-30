// Language adventures with Polly the Parrot: Alphabets, Words, Sentences.
// Each step: { id, part, openFrom, emoji, title, blurb, learned, parent, kind, ... }
//   kind "learn":    { items: [{ big, small?, word, emoji, say }] }
//   kind "practice": { count, intro, gen(grade) → question }
import { pick, sample, shuffle, withDistractors, gradeOf } from "./gen.js";

// ───────────────────────── Alphabets ─────────────────────────
export const ABC = [
  ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"],
  ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "House", "🏠"], ["I", "Ice cream", "🍦"], ["J", "Juice", "🧃"],
  ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Mango", "🥭"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"],
  ["P", "Parrot", "🦜"], ["Q", "Queen", "👸"], ["R", "Rabbit", "🐰"], ["S", "Sun", "☀️"], ["T", "Tiger", "🐯"],
  ["U", "Umbrella", "☂️"], ["V", "Van", "🚐"], ["W", "Watch", "⌚"], ["X", "X-ray", "🩻"], ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"],
].map(([big, word, emoji]) => ({ big, small: big.toLowerCase(), word, emoji, say: `${big}. ${big} is for ${word}.` }));
const LETTERS = ABC.map(x => x.big);
const LOOKALIKE = { b: "dpq", d: "bpq", p: "bdq", q: "bdp", m: "nw", n: "mu", u: "nv", w: "mv", i: "jl", j: "ig", l: "it", g: "qj", c: "eo", e: "ca", a: "oe", o: "ac" };
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

const P_ABC = [
  { id: "A", title: "Part A · Letters and sounds", who: "From 1st standard", note: "Meet all 26 letters, their sounds, and big and small letters." },
  { id: "B", title: "Part B · Letter skills", who: "After Part A · open from 3rd standard", note: "Vowels, alphabetical order and finding letters in words." },
];
const A1 = { part: "A", openFrom: 3 }, A2 = { part: "B", openFrom: 3 };

export const ALPHABET_JOURNEY = [
  { id: "abc-step-1", ...A1, emoji: "🅰️", title: "Letters A to M", blurb: "Tap each letter to hear it.", kind: "learn", items: ABC.slice(0, 13),
    learned: "The first 13 letters, each with a word that starts with it.", parent: "Point to things at home that start with each letter: A for almirah, B for bucket…" },
  { id: "abc-step-2", ...A1, emoji: "🔤", title: "Letters N to Z", blurb: "The rest of the alphabet.", kind: "learn", items: ABC.slice(13),
    learned: "The last 13 letters of the alphabet.", parent: "Sing the ABC song together and point at each letter." },
  { id: "abc-step-3", ...A1, emoji: "👂", title: "Starting sounds", blurb: "Which letter does it start with?", kind: "practice", count: 10,
    intro: "Look at the picture and listen. Which letter does it start with?", learned: "Every word starts with a sound, and each sound has a letter.",
    parent: "Play “I spy with my little eye, something beginning with…”.",
    gen: () => { const x = pick(ABC); return { type: "choice", prompt: `${x.emoji} ${x.word} starts with…`, say: `${x.word}. Which letter does ${x.word} start with?`, options: withDistractors(x.big, LETTERS), answer: x.big, hint: `Say it slowly: ${x.word}. The first sound is the letter ${x.big}.` }; } },
  { id: "abc-step-4", ...A1, emoji: "🔠", title: "Big and small letters", blurb: "Match A with a.", kind: "practice", count: 10,
    intro: "Every letter has a big (capital) shape and a small shape. Find the small letter!", learned: "Capital letters and small letters are the same letter in two shapes.",
    parent: "Look at a newspaper headline and find capital letters, then small ones.",
    gen: () => {
      const x = pick(ABC), wrong = (LOOKALIKE[x.small] ?? "").split("").concat(sample(ABC.map(a => a.small), 4));
      return { type: "choice", prompt: `Find the small letter for ${x.big}`, say: `Find the small letter for ${x.big}.`, options: withDistractors(x.small, wrong), answer: x.small, hint: `${x.big} and ${x.small} are the same letter. Look at ${x.emoji} ${x.word}.`, big: true };
    } },
  { id: "abc-step-5", ...A1, emoji: "➡️", title: "What comes next?", blurb: "Find the missing letter.", kind: "practice", count: 10,
    intro: "Letters live in order, like a line of friends. Which letter is missing?", learned: "The alphabet always goes in the same order.",
    parent: "Cover one letter on an alphabet chart and ask which one is hidden.",
    gen: () => {
      const s = Math.floor(Math.random() * 23), run = LETTERS.slice(s, s + 4), gap = 1 + Math.floor(Math.random() * 3), ans = run[gap];
      const shown = run.map((l, i) => (i === gap ? "_" : l)).join("  ");
      return { type: "choice", prompt: shown, say: `What letter is missing?`, options: withDistractors(ans, LETTERS.slice(Math.max(0, s - 3), s + 7)), answer: ans, hint: `Say the letters in order: ${run.join(", ")}.`, big: true };
    } },
  { id: "abc-step-6", ...A2, emoji: "🗣️", title: "Vowels and consonants", blurb: "A, E, I, O, U are special.", kind: "practice", count: 10,
    intro: "Five letters are called vowels: A, E, I, O and U. All the others are consonants. Which is this one?", learned: "A, E, I, O and U are vowels. Every word needs at least one vowel sound.",
    parent: "Pick a word from a storybook and count its vowels together.",
    gen: () => { const l = pick(Math.random() < 0.45 ? [...VOWELS] : LETTERS.filter(x => !VOWELS.has(x))); const v = VOWELS.has(l);
      return { type: "choice", prompt: `Is ${l} a vowel or a consonant?`, say: `Is ${l} a vowel or a consonant?`, options: ["Vowel", "Consonant"], answer: v ? "Vowel" : "Consonant", hint: "The vowels are A, E, I, O, U." }; } },
  { id: "abc-step-7", ...A2, emoji: "🔢", title: "Put letters in order", blurb: "Tap them in ABC order.", kind: "practice", count: 6,
    intro: "Tap the letters in alphabetical order, from the one that comes first.", learned: "Alphabetical order is how dictionaries and class lists are arranged.",
    parent: "Put your family's names in alphabetical order together.",
    gen: g => { const n = gradeOf(g) >= 4 ? 5 : 4; const ls = sample(LETTERS, n).sort(); return { type: "order", prompt: "Put these in ABC order", tiles: shuffle(ls), answer: ls, joiner: " ", hint: "Sing the ABC song. Which of these letters comes first?" }; } },
  { id: "abc-step-8", ...A2, emoji: "🔍", title: "Letter hunt", blurb: "Which word starts with it?", kind: "practice", count: 10,
    intro: "I'm hunting for words. Which picture starts with my letter?", learned: "Finding the first letter helps with reading and spelling.",
    parent: "On a walk, spot shop signs and read their first letters.",
    gen: () => { const [x, ...rest] = sample(ABC, 3); const opts = shuffle([x, ...rest]).map(o => ({ label: `${o.emoji} ${o.word}`, value: o.word }));
      return { type: "choice", prompt: `Which one starts with ${x.big}?`, say: `Which one starts with the letter ${x.big}?`, options: opts, answer: x.word, hint: `Say each word. Which one starts with the ${x.big} sound?` }; } },
  { id: "abc-step-9", ...A2, emoji: "📚", title: "Words in ABC order", blurb: "Order words like a dictionary.", kind: "practice", count: 6,
    intro: "Put these words in alphabetical order by their first letter.", learned: "Words can be put in ABC order by their first letter, just like in a dictionary.",
    parent: "Open a dictionary together and find a word by its first letter.",
    gen: () => { const ws = sample(ABC, 3).map(x => x.word).sort(); return { type: "order", prompt: "Put these words in ABC order", tiles: shuffle(ws), answer: ws, joiner: "  ", hint: "Look at the first letter of each word." }; } },
];
export const ALPHABET_PARTS = P_ABC;

// ───────────────────────── Words ─────────────────────────
const CVC = [["cat", "🐱"], ["dog", "🐶"], ["sun", "☀️"], ["hat", "🎩"], ["bus", "🚌"], ["pen", "🖊️"], ["cup", "☕"], ["bed", "🛏️"], ["box", "📦"], ["fox", "🦊"],
  ["pig", "🐷"], ["hen", "🐔"], ["bat", "🦇"], ["map", "🗺️"], ["net", "🥅"], ["rat", "🐀"], ["cow", "🐄"], ["egg", "🥚"], ["bag", "👜"], ["log", "🪵"], ["car", "🚗"], ["ant", "🐜"]];
const RHYMES = [["cat", "hat", "bat", "mat", "rat"], ["fan", "man", "pan", "van", "can"], ["pig", "big", "dig", "wig", "fig"], ["top", "hop", "mop", "pop", "shop"],
  ["sun", "run", "fun", "bun", "gun"], ["net", "pet", "wet", "jet", "get"], ["dog", "log", "fog", "frog", "hog"], ["cake", "lake", "make", "bake", "snake"], ["ball", "tall", "wall", "fall", "call"], ["king", "ring", "sing", "wing", "thing"]];
const OPPOSITES = [["big", "small"], ["hot", "cold"], ["up", "down"], ["happy", "sad"], ["fast", "slow"], ["day", "night"], ["open", "closed"], ["tall", "short"], ["full", "empty"],
  ["old", "new"], ["wet", "dry"], ["light", "dark"], ["in", "out"], ["push", "pull"], ["clean", "dirty"], ["near", "far"], ["early", "late"], ["soft", "hard"], ["thick", "thin"], ["rich", "poor"]];
const PLURALS = [["cat", "cats"], ["box", "boxes"], ["bus", "buses"], ["baby", "babies"], ["leaf", "leaves"], ["child", "children"], ["mouse", "mice"], ["foot", "feet"], ["tooth", "teeth"],
  ["man", "men"], ["sheep", "sheep"], ["knife", "knives"], ["city", "cities"], ["glass", "glasses"], ["toy", "toys"], ["dish", "dishes"], ["woman", "women"], ["tomato", "tomatoes"], ["goose", "geese"], ["pen", "pens"]];
const SPELL = [["because", "becuase", "becose"], ["friend", "freind", "frend"], ["school", "skool", "shcool"], ["beautiful", "beutiful", "beautifull"], ["which", "wich", "whitch"],
  ["people", "peeple", "pepole"], ["tomorrow", "tommorow", "tomorow"], ["different", "diffrent", "diferent"], ["February", "Febuary", "Februry"], ["library", "libary", "liberry"],
  ["believe", "beleive", "belive"], ["answer", "anser", "ansewr"], ["calendar", "calender", "calandar"], ["science", "sience", "scince"], ["neighbour", "nieghbour", "neighbor"]];
const POS = { "Naming word (noun)": ["dog", "school", "Delhi", "teacher", "mango", "river", "book", "Riya", "table", "train"],
  "Doing word (verb)": ["run", "jump", "eat", "write", "sing", "sleep", "swim", "read", "laugh", "climb"],
  "Describing word (adjective)": ["big", "happy", "red", "tall", "sweet", "noisy", "soft", "brave", "tiny", "cold"] };
const SYNONYMS = [["big", "large"], ["small", "tiny"], ["happy", "glad"], ["begin", "start"], ["quick", "fast"], ["shut", "close"], ["smart", "clever"], ["angry", "cross"],
  ["below", "under"], ["gift", "present"], ["silent", "quiet"], ["choose", "pick"], ["end", "finish"], ["scared", "afraid"], ["kind", "nice"]];
const AFFIXES = [["unhappy", "not happy"], ["redo", "do again"], ["preview", "see before"], ["careless", "without care"], ["helpful", "full of help"], ["kindness", "being kind"],
  ["misspell", "spell wrongly"], ["impossible", "not possible"], ["rewrite", "write again"], ["fearless", "without fear"], ["unlock", "open the lock"], ["joyful", "full of joy"]];
const HOMOPHONES = [["___ going to school.", "They're", ["There", "Their", "They're"]], ["The book is over ___.", "there", ["there", "their", "they're"]], ["This is ___ house.", "their", ["there", "their", "they're"]],
  ["I have ___ pencils.", "two", ["to", "too", "two"]], ["I want to come ___.", "too", ["to", "too", "two"]], ["We go ___ school.", "to", ["to", "too", "two"]],
  ["Is this ___ bag?", "your", ["your", "you're"]], ["___ my best friend.", "You're", ["Your", "You're"]], ["The dog wagged ___ tail.", "its", ["its", "it's"]],
  ["___ raining today.", "It's", ["Its", "It's"]], ["Can you ___ me?", "hear", ["hear", "here"]], ["Please ___ your name.", "write", ["write", "right"]], ["We swam in the ___.", "sea", ["see", "sea"]], ["I ___ two dosas.", "ate", ["ate", "eight"]]];

const P_WORDS = [
  { id: "A", title: "Part A · First words", who: "From 1st standard", note: "Read short words, build them, rhymes and opposites." },
  { id: "B", title: "Part B · Word power", who: "After Part A · open from 3rd standard", note: "Plurals, spelling, kinds of words and similar words." },
  { id: "C", title: "Part C · Word builder", who: "After Part B · open from 6th standard", note: "Prefixes, suffixes and words that sound the same." },
];
const W1 = { part: "A", openFrom: 3 }, W2 = { part: "B", openFrom: 3 }, W3 = { part: "C", openFrom: 6 };

export const WORDS_JOURNEY = [
  { id: "words-step-1", ...W1, emoji: "🖼️", title: "Picture words", blurb: "Read the word for the picture.", kind: "practice", count: 10,
    intro: "Look at the picture. Which word matches it?", learned: "Short words like cat and sun can be read by sounding out each letter.", parent: "Label things at home with sticky notes: door, fan, bed.",
    gen: () => { const [w, e] = pick(CVC); return { type: "choice", prompt: `${e}`, say: "Which word matches the picture?", options: withDistractors(w, CVC.map(x => x[0])), answer: w, hint: `Sound it out: ${w.split("").join("-")}.`, bigPrompt: true }; } },
  { id: "words-step-2", ...W1, emoji: "🧩", title: "Build the word", blurb: "Tap letters to spell it.", kind: "practice", count: 8,
    intro: "Tap the letters in the right order to spell the picture.", learned: "Words are built from sounds, one letter at a time.", parent: "Use magnetic letters or paper squares to build words together.",
    gen: () => { const [w, e] = pick(CVC); const ls = w.split(""); let t; do { t = shuffle(ls); } while (t.join("") === w); return { type: "order", prompt: e, say: `Spell ${w}.`, tiles: t, answer: ls, joiner: "", hint: `Say it slowly: ${ls.join(", ")}.`, bigPrompt: true }; } },
  { id: "words-step-3", ...W1, emoji: "🎵", title: "Rhyming words", blurb: "Words that sound alike.", kind: "practice", count: 10,
    intro: "Rhyming words end with the same sound, like cat and hat. Find the rhyme!", learned: "Rhyming words end with the same sound.", parent: "Make up silly rhymes together: “A frog on a log”.",
    gen: () => { const fam = pick(RHYMES), [w, r] = sample(fam, 2); const others = RHYMES.filter(f => f !== fam).flat();
      return { type: "choice", prompt: `Which word rhymes with “${w}”?`, say: `Which word rhymes with ${w}?`, options: withDistractors(r, others), answer: r, hint: `Listen to the end of the word: ${w}.` }; } },
  { id: "words-step-4", ...W1, emoji: "↔️", title: "Opposites", blurb: "Hot and cold, big and small.", kind: "practice", count: 10,
    intro: "Opposites mean completely different things, like hot and cold. Find the opposite!", learned: "Opposites are pairs of words with very different meanings.", parent: "Play the opposite game: you say “up”, your child says “down”.",
    gen: () => { const [a, b] = shuffle(pick(OPPOSITES)); return { type: "choice", prompt: `What is the opposite of “${a}”?`, say: `What is the opposite of ${a}?`, options: withDistractors(b, OPPOSITES.flat().filter(x => x !== a)), answer: b, hint: `Think of something that is ${a}. What is the other way?` }; } },
  { id: "words-step-5", ...W2, emoji: "👯", title: "One or many", blurb: "cat → cats, child → children.", kind: "practice", count: 10,
    intro: "When there is more than one, the word changes. Most add s, but some are special!", learned: "Plurals usually add s or es, but some words change completely (child → children).", parent: "Count things at home: one spoon, two spoons; one knife, two knives.",
    gen: () => { const [s, p] = pick(PLURALS); const wrong = [s + "s", s + "es", s.replace(/y$/, "ies"), s + "en"].filter(x => x !== p && x !== s);
      return { type: "choice", prompt: `One ${s}, two ___`, say: `One ${s}, two what?`, options: withDistractors(p, wrong), answer: p, hint: "Some words are special. Say it aloud: which one sounds right?" }; } },
  { id: "words-step-6", ...W2, emoji: "✍️", title: "Spell it right", blurb: "Pick the correct spelling.", kind: "practice", count: 10,
    intro: "Some words are tricky to spell. Which one is spelled correctly?", learned: "Tricky words are worth learning by heart.", parent: "Keep a “tricky words” list on the fridge and practise one a day.",
    gen: () => { const [r, ...w] = pick(SPELL); return { type: "choice", prompt: "Which spelling is correct?", say: `Which is the correct spelling of ${r}?`, options: shuffle([r, ...w]), answer: r, hint: "Look carefully at each letter." }; } },
  { id: "words-step-7", ...W2, emoji: "🏷️", title: "Kinds of words", blurb: "Naming, doing, describing.", kind: "practice", count: 10,
    intro: "Naming words (nouns) name things. Doing words (verbs) are actions. Describing words (adjectives) tell what something is like.", learned: "Nouns name, verbs do, adjectives describe.", parent: "Pick a sentence from a book and find one noun, one verb and one adjective.",
    gen: () => { const kind = pick(Object.keys(POS)); const w = pick(POS[kind]); return { type: "choice", prompt: `What kind of word is “${w}”?`, say: `What kind of word is ${w}?`, options: Object.keys(POS), answer: kind, hint: "Can you do it? It's a verb. Is it a thing, place or person? It's a noun. Does it describe? It's an adjective." }; } },
  { id: "words-step-8", ...W2, emoji: "🟰", title: "Same meaning", blurb: "Big and large mean the same.", kind: "practice", count: 10,
    intro: "Some words mean almost the same thing, like big and large. They are called synonyms.", learned: "Synonyms are words with the same or similar meaning.", parent: "Ask for another word for “nice” or “good” when your child writes.",
    gen: () => { const [a, b] = shuffle(pick(SYNONYMS)); return { type: "choice", prompt: `Which word means the same as “${a}”?`, say: `Which word means the same as ${a}?`, options: withDistractors(b, SYNONYMS.flat().filter(x => x !== a)), answer: b, hint: `Use it in a sentence with ${a}. Which word could take its place?` }; } },
  { id: "words-step-9", ...W3, emoji: "🧱", title: "Prefixes and suffixes", blurb: "un-, re-, -ful, -less.", kind: "practice", count: 10,
    intro: "Adding a piece to the start (prefix) or end (suffix) changes a word's meaning. What does this word mean?", learned: "un- and im- mean not, re- means again, -ful means full of, -less means without.", parent: "Find words with un-, re-, -ful and -less in a newspaper.",
    gen: () => { const [w, m] = pick(AFFIXES); return { type: "choice", prompt: `What does “${w}” mean?`, say: `What does ${w} mean?`, options: withDistractors(m, AFFIXES.map(x => x[1])), answer: m, hint: "Split the word into its parts." }; } },
  { id: "words-step-10", ...W3, emoji: "👂", title: "Sound-alike words", blurb: "there, their, they're.", kind: "practice", count: 10,
    intro: "Some words sound the same but are spelled differently and mean different things. Pick the right one!", learned: "Homophones sound alike but have different meanings and spellings.", parent: "Write a silly note with a homophone mistake and let your child fix it.",
    gen: () => { const [s, a, opts] = pick(HOMOPHONES); return { type: "choice", prompt: s, say: "Which word fits in the gap?", options: shuffle(opts), answer: a, hint: "Think about the meaning: a place, belonging to someone, or a short form of two words?" }; } },
];
export const WORDS_PARTS = P_WORDS;

// ───────────────────────── Sentences ─────────────────────────
const BUILD = [["The cat is sleeping."], ["I like mangoes."], ["We go to school."], ["The sun is hot."], ["My dog can run fast."], ["She is reading a book."],
  ["Birds fly in the sky."], ["Riya plays cricket."], ["Please close the door."], ["The fan is on."], ["Aarav drinks warm milk."], ["The train is very long."]].map(x => x[0]);
const BUILD_LONG = ["My grandmother tells me a story every night.", "The children are playing football in the park.", "We visited the zoo on Sunday.", "The farmer grows rice in his field."];
const STATEMENTS = ["The sky is blue", "I love my school", "My brother is ten", "We ate idli for breakfast", "The shop is closed", "It is raining today"];
const QUESTIONS = ["Where is my bag", "Can you help me", "What is your name", "Do you like dosa", "Who is at the door", "How old are you"];
const EXCLAIMS = ["What a big elephant", "Wow, that was fast", "How beautiful the flowers are", "Hurray, we won"];
const MISSING = [["I brush my ___ every morning.", "teeth", ["teeth", "shoes", "book"]], ["The cow gives us ___.", "milk", ["milk", "eggs", "wool"]], ["We use an ___ when it rains.", "umbrella", ["umbrella", "oven", "ink"]],
  ["The ___ is shining in the sky.", "sun", ["sun", "fish", "chair"]], ["I write with a ___.", "pencil", ["pencil", "spoon", "comb"]], ["Fish live in ___.", "water", ["water", "trees", "sand"]],
  ["We sleep at ___.", "night", ["night", "noon", "lunch"]], ["A bird has two ___.", "wings", ["wings", "wheels", "tails"]], ["I wear ___ on my feet.", "shoes", ["shoes", "gloves", "caps"]], ["The cat drinks ___.", "milk", ["milk", "tea", "juice"]]];
const JOINERS = [["I like tea ___ coffee.", "and"], ["The bag is small ___ it holds a lot.", "but"], ["He stayed home ___ he was ill.", "because"], ["It was raining, ___ we took an umbrella.", "so"],
  ["Do you want rice ___ roti?", "or"], ["I was tired, ___ I still finished my homework.", "but"], ["We clapped ___ the song was lovely.", "because"], ["Mum bought apples ___ bananas.", "and"],
  ["The road was wet, ___ we walked slowly.", "so"], ["Shall we play cricket ___ football?", "or"]];
const TENSES = [["Yesterday I ___ to the park.", "went", ["went", "go", "will go"]], ["Tomorrow we ___ a movie.", "will watch", ["watched", "watch", "will watch"]],
  ["Right now she ___ a song.", "is singing", ["sang", "is singing", "will sing"]], ["Last week he ___ his grandmother.", "visited", ["visits", "visited", "will visit"]],
  ["Next year I ___ ten years old.", "will be", ["was", "am", "will be"]], ["Every day the baby ___ milk.", "drinks", ["drank", "drinks", "will drink"]],
  ["Look! The dog ___ its tail.", "is chasing", ["chased", "is chasing", "will chase"]], ["Two days ago they ___ a kite.", "flew", ["fly", "flew", "will fly"]]];
const PUNCT = [["I bought apples, bananas and grapes.", ["I bought apples bananas and grapes.", "I bought, apples bananas, and grapes"]], ["Wow! That is a big cake.", ["Wow that is a big cake?", "wow. That is a big cake"]],
  ["Where are you going?", ["Where are you going.", "where are you going"]], ["Riya, please come here.", ["Riya please come here?", "riya, please come here"]],
  ["We live in Hyderabad, India.", ["We live in hyderabad india.", "We live in Hyderabad India?"]], ["“Hello!” said the teacher.", ["Hello said the teacher.", "“hello” said the teacher?"]],
  ["Oh no! I dropped my ice cream.", ["Oh no I dropped my ice cream?", "oh no, i dropped my ice cream"]], ["My friends are Aarav, Meera and Kabir.", ["My friends are Aarav Meera and Kabir.", "my friends are aarav, meera and kabir."]]];
const SUBJECTS = [["The little girl sang a song.", "The little girl", ["sang a song", "a song"]], ["My father drives a blue car.", "My father", ["drives a blue car", "a blue car"]],
  ["The tall tree fell in the storm.", "The tall tree", ["fell in the storm", "the storm"]], ["Our school won the match.", "Our school", ["won the match", "the match"]],
  ["A big black dog barked loudly.", "A big black dog", ["barked loudly", "loudly"]], ["The students of class five planted trees.", "The students of class five", ["planted trees", "class five"]],
  ["Grandma makes the best laddoos.", "Grandma", ["makes the best laddoos", "the best laddoos"]], ["The old train reached the station late.", "The old train", ["reached the station late", "the station"]]];
const VOICE = [["Ravi wrote a letter.", "A letter was written by Ravi.", ["A letter wrote Ravi.", "Ravi was written a letter."]], ["The cat caught a mouse.", "A mouse was caught by the cat.", ["The mouse caught a cat.", "A cat was caught by the mouse."]],
  ["Meera painted the wall.", "The wall was painted by Meera.", ["The wall painted Meera.", "Meera was painted by the wall."]], ["The chef cooks the food.", "The food is cooked by the chef.", ["The chef is cooked by the food.", "The food cooks the chef."]],
  ["The boys will clean the room.", "The room will be cleaned by the boys.", ["The room will clean the boys.", "The boys will be cleaned by the room."]], ["The teacher praised Kabir.", "Kabir was praised by the teacher.", ["The teacher was praised by Kabir.", "Kabir praised the teacher."]]];
const SPEECH = [["He said, “I am tired.”", "He said that he was tired.", ["He said that I am tired.", "He said that he is tired now."]], ["She said, “I like mangoes.”", "She said that she liked mangoes.", ["She said that I like mangoes.", "She says she liked mangoes."]],
  ["Ravi said, “I will come tomorrow.”", "Ravi said that he would come the next day.", ["Ravi said that I will come tomorrow.", "Ravi said he comes tomorrow."]],
  ["Mother said, “Close the door.”", "Mother told me to close the door.", ["Mother said that close the door.", "Mother told that I closed the door."]],
  ["The boy asked, “Where is my ball?”", "The boy asked where his ball was.", ["The boy asked where is my ball.", "The boy said where his ball is?"]], ["Riya said, “We are going to Delhi.”", "Riya said that they were going to Delhi.", ["Riya said that we are going to Delhi.", "Riya said they go to Delhi."]]];

const lower = s => s[0].toLowerCase() + s.slice(1);
const P_SENT = [
  { id: "A", title: "Part A · Making sentences", who: "From 1st standard", note: "Word order, capital letters, full stops and question marks." },
  { id: "B", title: "Part B · Better sentences", who: "After Part A · open from 4th standard", note: "Joining words, tenses and punctuation." },
  { id: "C", title: "Part C · Grammar detective", who: "After Part B · open from 6th standard", note: "Subject and predicate, active and passive, reported speech." },
];
const S1 = { part: "A", openFrom: 4 }, S2 = { part: "B", openFrom: 4 }, S3 = { part: "C", openFrom: 6 };

export const SENTENCES_JOURNEY = [
  { id: "sent-step-1", ...S1, emoji: "🧱", title: "Build a sentence", blurb: "Put the words in order.", kind: "practice", count: 6,
    intro: "A sentence is words in the right order. Tap the words to build the sentence!", learned: "Words must be in the right order to make sense.", parent: "Cut a sentence into word cards and let your child rebuild it.",
    gen: g => { const s = pick(gradeOf(g) >= 4 ? [...BUILD, ...BUILD_LONG] : BUILD); const words = s.split(" "); let t; do { t = shuffle(words); } while (t.join(" ") === s);
      return { type: "order", prompt: "Build the sentence", say: s, tiles: t, answer: words, joiner: " ", hint: "Which word starts with a capital letter? That one goes first. The one with the full stop goes last." }; } },
  { id: "sent-step-2", ...S1, emoji: "🔠", title: "Capital and full stop", blurb: "Which one is written correctly?", kind: "practice", count: 8,
    intro: "A sentence starts with a capital letter and ends with a full stop. Which one is written correctly?", learned: "Sentences start with a capital letter and end with a full stop.", parent: "Check your child's writing together for capitals and full stops.",
    gen: () => { const s = pick(BUILD); return { type: "choice", prompt: "Which sentence is written correctly?", options: shuffle([s, lower(s), s.slice(0, -1), lower(s).slice(0, -1)]), answer: s, hint: "Look at the first letter and the last mark." }; } },
  { id: "sent-step-3", ...S1, emoji: "❓", title: "Asking or telling?", blurb: "? or . or !", kind: "practice", count: 10,
    intro: "Telling sentences end with a full stop. Asking sentences end with a question mark. Which one does this need?", learned: "Questions end with ?, statements with ., and strong feelings with !.", parent: "Take turns: one asks a question, the other answers with a telling sentence.",
    gen: g => { const withEx = gradeOf(g) >= 3; const r = Math.random(); const [s, a] = withEx && r < 0.25 ? [pick(EXCLAIMS), "!"] : r < 0.6 ? [pick(QUESTIONS), "?"] : [pick(STATEMENTS), "."];
      const opts = [{ label: ". Telling", value: "." }, { label: "? Asking", value: "?" }, ...(withEx ? [{ label: "! Strong feeling", value: "!" }] : [])];
      return { type: "choice", prompt: `${s} ___`, say: s, options: opts, answer: a, hint: "Does it ask something? Does it show a strong feeling like wow or hurray?" }; } },
  { id: "sent-step-4", ...S1, emoji: "🕳️", title: "Fill the gap", blurb: "Which word makes sense?", kind: "practice", count: 10,
    intro: "One word is missing. Which word makes the sentence make sense?", learned: "Reading the whole sentence helps you find the missing word.", parent: "Read a story and pause before a word. Let your child guess it.",
    gen: () => { const [s, a, opts] = pick(MISSING); return { type: "choice", prompt: s, say: s.replace("___", "blank"), options: shuffle(opts), answer: a, hint: "Read the sentence with each word. Which one makes sense?" }; } },
  { id: "sent-step-5", ...S2, emoji: "🔗", title: "Joining words", blurb: "and, but, because, so, or.", kind: "practice", count: 10,
    intro: "Joining words connect two ideas: and, but, because, so, or. Which one fits?", learned: "and adds, but contrasts, because gives a reason, so gives a result, or gives a choice.", parent: "Finish sentences together: “I am happy because…”.",
    gen: () => { const [s, a] = pick(JOINERS); return { type: "choice", prompt: s, options: ["and", "but", "because", "so", "or"], answer: a, hint: "Is it adding, a surprise, a reason, a result, or a choice?" }; } },
  { id: "sent-step-6", ...S2, emoji: "⏳", title: "Yesterday, today, tomorrow", blurb: "Past, present and future.", kind: "practice", count: 10,
    intro: "Verbs change with time: past (yesterday), present (now) and future (tomorrow). Pick the right one!", learned: "Tense tells us when something happens.", parent: "Talk about what you did yesterday and what you will do tomorrow.",
    gen: () => { const [s, a, opts] = pick(TENSES); return { type: "choice", prompt: s, options: shuffle(opts), answer: a, hint: "Look for time words: yesterday, now, tomorrow, every day." }; } },
  { id: "sent-step-7", ...S2, emoji: "✳️", title: "Punctuation", blurb: "Commas, ! and ?", kind: "practice", count: 8,
    intro: "Punctuation marks help us read. Which sentence is punctuated correctly?", learned: "Commas separate lists and names; ! shows strong feeling; ? asks.", parent: "Read a sentence aloud without pauses, then with them. Hear the difference!",
    gen: () => { const [r, w] = pick(PUNCT); return { type: "choice", prompt: "Which is punctuated correctly?", options: shuffle([r, ...w]), answer: r, hint: "Check capitals, commas in lists, and the end mark." }; } },
  { id: "sent-step-8", ...S3, emoji: "🎯", title: "Subject and predicate", blurb: "Who or what is it about?", kind: "practice", count: 8,
    intro: "The subject is who or what the sentence is about. The predicate tells what the subject does. Find the subject!", learned: "Every sentence has a subject and a predicate.", parent: "In a news headline, find who it's about (subject) and what happened (predicate).",
    gen: () => { const [s, a, w] = pick(SUBJECTS); return { type: "choice", prompt: `“${s}” Who or what is it about?`, options: shuffle([a, ...w]), answer: a, hint: "Ask: who or what did the action?" }; } },
  { id: "sent-step-9", ...S3, emoji: "🔄", title: "Active and passive", blurb: "Ravi wrote → was written by Ravi.", kind: "practice", count: 6,
    intro: "In the passive voice, the thing that receives the action comes first. Change the sentence to passive!", learned: "Passive voice: object + was/is/will be + past participle + by + doer.", parent: "Spot passive sentences in a science textbook: “Water is boiled…”.",
    gen: () => { const [s, a, w] = pick(VOICE); return { type: "choice", prompt: `Change to passive: “${s}”`, options: shuffle([a, ...w]), answer: a, hint: "Start with the thing that the action happened to." }; } },
  { id: "sent-step-10", ...S3, emoji: "💬", title: "Reported speech", blurb: "Direct to indirect.", kind: "practice", count: 6,
    intro: "Reported speech tells what someone said without quotation marks. Pick the correct one!", learned: "In reported speech, the tense usually goes back and pronouns change.", parent: "Retell what a friend said at school, starting with “She said that…”.",
    gen: () => { const [s, a, w] = pick(SPEECH); return { type: "choice", prompt: `Report this: ${s}`, options: shuffle([a, ...w]), answer: a, hint: "Change I to he/she, and am/is to was." }; } },
];
export const SENTENCES_PARTS = P_SENT;

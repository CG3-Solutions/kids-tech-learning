// Language adventures with Polly the Parrot: Alphabets, Words, Sentences.
// Each step: { id, part, openFrom, emoji, title, blurb, learned, parent, kind, ... }
//   kind "learn":    { items: [{ big, small?, word, emoji, say }] }
//   kind "practice": { count, intro, gen(grade) → question }
import { pick, sample, shuffle, withDistractors, gradeOf } from "./gen.js";
import * as D from "./languageData.js";

// Levels like Chip's path: 0 = Class 1–3, 1 = Class 4–7, 2 = Class 8–12.
export const levelOf = g => { const x = gradeOf(g); return x >= 8 ? 2 : x >= 4 ? 1 : 0; };
// An item for this learner from a levelled bank { 0: [...], 1: [...], 2: [...] }: usually from their own
// level (or the nearest one below that has items), sometimes one level easier for review.
// Returns [item, itsLevel] so wrong answers can come from the same level.
export function pickAt(bank, g) {
  const L = levelOf(g);
  const have = [0, 1, 2].filter(l => l <= L && bank[l]?.length);
  if (!have.length) { const l = Object.keys(bank).map(Number).sort()[0]; return [pick(bank[l]), l]; }
  const top = have.at(-1), below = have.filter(l => l < top).at(-1); // review comes from one level down, not from the very start
  const l = below != null && Math.random() < 0.25 ? below : top;
  return [pick(bank[l]), l];
}
// Shuffled, never already in the right order.
const scramble = list => { if (new Set(list).size < 2) return [...list]; let t; do { t = shuffle(list); } while (t.join("|") === list.join("|")); return t; };

// ───────────────────────── Alphabets ─────────────────────────
// Voices misread a lone capital letter ("A" is read as the word "a"), so anything spoken uses
// the letter's name, spelled for the voice. Indian/British names: "zed", "aitch".
const NAMES = { A: "ay", B: "bee", C: "see", D: "dee", E: "ee", F: "ef", G: "jee", H: "aitch", I: "eye", J: "jay", K: "kay", L: "el", M: "em",
  N: "en", O: "oh", P: "pee", Q: "cue", R: "ar", S: "ess", T: "tee", U: "you", V: "vee", W: "double you", X: "ex", Y: "why", Z: "zed" };
export const letterName = l => NAMES[l.toUpperCase()] ?? l;
const small = l => `small ${letterName(l)}`;
export const ABC = [
  ["A", "Apple", "🍎"], ["B", "Ball", "⚽"], ["C", "Cat", "🐱"], ["D", "Dog", "🐶"], ["E", "Elephant", "🐘"],
  ["F", "Fish", "🐟"], ["G", "Grapes", "🍇"], ["H", "House", "🏠"], ["I", "Ice cream", "🍦"], ["J", "Juice", "🧃"],
  ["K", "Kite", "🪁"], ["L", "Lion", "🦁"], ["M", "Mango", "🥭"], ["N", "Nest", "🪺"], ["O", "Orange", "🍊"],
  ["P", "Parrot", "🦜"], ["Q", "Queen", "👸"], ["R", "Rabbit", "🐰"], ["S", "Sun", "☀️"], ["T", "Tiger", "🐯"],
  ["U", "Umbrella", "☂️"], ["V", "Van", "🚐"], ["W", "Watch", "⌚"], ["X", "X-ray", "🩻"], ["Y", "Yo-yo", "🪀"], ["Z", "Zebra", "🦓"],
].map(([big, word, emoji]) => ({ big, small: big.toLowerCase(), word, emoji, say: `${letterName(big)}, for ${word}.` }));
const LETTERS = ABC.map(x => x.big);
// Every picture word we have, two for most letters (Apple, Ant…), for "starts with" questions.
const ABC_WORDS = [...ABC, ...D.ABC_MORE.map(([big, word, emoji]) => ({ big, word, emoji }))];
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
    gen: () => { const x = pick(ABC_WORDS); return { type: "choice", prompt: `${x.emoji} ${x.word} starts with…`, say: `${x.word}. Which letter does ${x.word} start with?`, options: withDistractors(x.big, LETTERS), answer: x.big, hint: `Say it slowly: ${x.word}. The first sound is the letter ${x.big}.`, hintSay: `Say it slowly: ${x.word}. It starts with ${letterName(x.big)}.`, answerSay: letterName(x.big) }; } },
  { id: "abc-step-4", ...A1, emoji: "🔠", title: "Big and small letters", blurb: "Match A with a.", kind: "practice", count: 10,
    intro: "Every letter has a big (capital) shape and a small shape. Find the small letter!", learned: "Capital letters and small letters are the same letter in two shapes.",
    parent: "Look at a newspaper headline and find capital letters, then small ones.",
    gen: () => {
      const x = pick(ABC), wrong = (LOOKALIKE[x.small] ?? "").split("").concat(sample(ABC.map(a => a.small), 4));
      return { type: "choice", prompt: `Find the small letter for ${x.big}`, say: `Find the small letter for capital ${letterName(x.big)}.`, options: withDistractors(x.small, wrong), answer: x.small, hint: `${x.big} and ${x.small} are the same letter. Look at ${x.emoji} ${x.word}.`, hintSay: `Capital ${letterName(x.big)} and ${small(x.big)} are the same letter, as in ${x.word}.`, answerSay: small(x.big), big: true };
    } },
  { id: "abc-step-5", ...A1, emoji: "➡️", title: "What comes next?", blurb: "Find the missing letter.", kind: "practice", count: 10,
    intro: "Letters live in order, like a line of friends. Which letter is missing?", learned: "The alphabet always goes in the same order.",
    parent: "Cover one letter on an alphabet chart and ask which one is hidden.",
    gen: () => {
      const s = Math.floor(Math.random() * 23), run = LETTERS.slice(s, s + 4), gap = 1 + Math.floor(Math.random() * 3), ans = run[gap];
      const shown = run.map((l, i) => (i === gap ? "_" : l)).join("  ");
      return { type: "choice", prompt: shown, say: `What letter is missing?`, options: withDistractors(ans, LETTERS.slice(Math.max(0, s - 3), s + 7).filter(l => !run.includes(l) || l === ans)), answer: ans, hint: `Say the letters in order: ${run.join(", ")}.`, hintSay: `Say the letters in order: ${run.map(letterName).join(", ")}.`, answerSay: letterName(ans), big: true };
    } },
  { id: "abc-step-6", ...A2, emoji: "🗣️", title: "Vowels and consonants", blurb: "A, E, I, O, U are special.", kind: "practice", count: 10,
    intro: "Five letters are called vowels: A, E, I, O and U. All the others are consonants. Which is this one?", introSay: "Five letters are called vowels: ay, ee, eye, oh and you. All the others are consonants. Which is this one?", learned: "A, E, I, O and U are vowels. Every word needs at least one vowel sound.",
    parent: "Pick a word from a storybook and count its vowels together.",
    gen: () => { const l = pick(Math.random() < 0.45 ? [...VOWELS] : LETTERS.filter(x => !VOWELS.has(x))); const v = VOWELS.has(l);
      return { type: "choice", prompt: `Is ${l} a vowel or a consonant?`, say: `Is ${letterName(l)} a vowel or a consonant?`, options: ["Vowel", "Consonant"], answer: v ? "Vowel" : "Consonant", hint: "The vowels are A, E, I, O, U.", hintSay: "The vowels are ay, ee, eye, oh and you." }; } },
  { id: "abc-step-7", ...A2, emoji: "🔢", title: "Put letters in order", blurb: "Tap them in ABC order.", kind: "practice", count: 6,
    intro: "Tap the letters in alphabetical order, from the one that comes first.", learned: "Alphabetical order is how dictionaries and class lists are arranged.",
    parent: "Put your family's names in alphabetical order together.",
    gen: g => { const n = gradeOf(g) >= 4 ? 5 : 4; const ls = sample(LETTERS, n).sort(), tiles = scramble(ls); return { type: "order", prompt: "Put these in ABC order", say: `Put these letters in ABC order: ${tiles.map(letterName).join(", ")}.`, tiles, answer: ls, joiner: " ", hint: "Sing the ABC song. Which of these letters comes first?", answerSay: ls.map(letterName).join(", ") }; } },
  { id: "abc-step-8", ...A2, emoji: "🔍", title: "Letter hunt", blurb: "Which word starts with it?", kind: "practice", count: 10,
    intro: "I'm hunting for words. Which picture starts with my letter?", learned: "Finding the first letter helps with reading and spelling.",
    parent: "On a walk, spot shop signs and read their first letters.",
    gen: () => { const x = pick(ABC_WORDS), rest = sample(ABC_WORDS.filter(w => w.big !== x.big), 8).filter((w, i, a) => a.findIndex(v => v.big === w.big) === i).slice(0, 2); const opts = shuffle([x, ...rest]).map(o => ({ label: `${o.emoji} ${o.word}`, value: o.word }));
      return { type: "choice", prompt: `Which one starts with ${x.big}?`, say: `Which one starts with ${letterName(x.big)}?`, options: opts, answer: x.word, hint: `Say each word. Which one starts with the ${x.big} sound?`, hintSay: `Say each word. Which one starts with ${letterName(x.big)}?` }; } },
  { id: "abc-step-9", ...A2, emoji: "📚", title: "Words in ABC order", blurb: "Order words like a dictionary.", kind: "practice", count: 6,
    intro: "Put these words in alphabetical order by their first letter.", learned: "Words can be put in ABC order by their first letter, just like in a dictionary.",
    parent: "Open a dictionary together and find a word by its first letter.",
    gen: g => {
      const L = levelOf(g);
      if (L === 0) { const ws = sample(D.ABC_ORDER[0], 3).sort(); return { type: "order", prompt: "Put these words in ABC order", tiles: scramble(ws), answer: ws, joiner: "  ", hint: "Look at the first letter of each word." }; }
      const ws = sample(pick(D.ABC_ORDER[L]), L === 1 ? 4 : 4).sort();
      return { type: "order", prompt: "Put these words in dictionary order", tiles: scramble(ws), answer: ws, joiner: "  ",
        hint: L === 1 ? "They all start with the same letter, so look at the second letter." : "When the first letters match, look at the next letter, and the next. A shorter word comes first (plan, plane)." }; } },
];
export const ALPHABET_PARTS = P_ABC;

// ───────────────────────── Words ─────────────────────────
// Banks are in languageData.js, by level. Wrong choices come from the same level.
const words = (bank, l) => bank[l].map(x => x[0]);
// Picture words: wrong choices look alike (same first letter or same length) so the child has to read.
function lookalikes(w, pool) {
  const others = pool.filter(x => x !== w);
  const close = others.filter(x => x[0] === w[0] || x.length === w.length || x.slice(-2) === w.slice(-2));
  return [...sample(close, 3), ...sample(others, 3)];
}
// Plural choices: the right plural and the two real mistakes from the bank.
const pluralChoices = ([, p, m1, m2]) => shuffle([...new Set([p, m1, m2])]);

const P_WORDS = [
  { id: "A", title: "Part A · First words", who: "From 1st standard", note: "Read short words, build them, rhymes and opposites." },
  { id: "B", title: "Part B · Word power", who: "After Part A · open from 3rd standard", note: "Plurals, spelling, kinds of words and similar words." },
  { id: "C", title: "Part C · Word builder", who: "After Part B · open from 6th standard", note: "Prefixes, suffixes and words that sound the same." },
];
const W1 = { part: "A", openFrom: 3 }, W2 = { part: "B", openFrom: 3 }, W3 = { part: "C", openFrom: 6 };

export const WORDS_JOURNEY = [
  { id: "words-step-1", ...W1, emoji: "🖼️", title: "Picture words", blurb: "Read the word for the picture.", kind: "practice", count: 10,
    intro: "Look at the picture. Which word matches it?", learned: "Short words like cat and sun can be read by sounding out each letter.", parent: "Label things at home with sticky notes: door, fan, bed.",
    gen: g => { const [[w, e], l] = pickAt(D.PICTURE, g); return { type: "choice", prompt: `${e}`, say: "Which word matches the picture?", options: withDistractors(w, lookalikes(w, words(D.PICTURE, l))), answer: w, hint: `Sound it out: ${w.length <= 4 ? w.split("").join("-") : w}.`, bigPrompt: true }; } },
  { id: "words-step-2", ...W1, emoji: "🧩", title: "Build the word", blurb: "Tap letters to spell it.", kind: "practice", count: 8,
    intro: "Tap the letters in the right order to spell the picture.", learned: "Words are built from sounds, one letter at a time.", parent: "Use magnetic letters or paper squares to build words together.",
    gen: g => { const [[w, e]] = pickAt({ 0: D.PICTURE[0], 1: D.PICTURE[1].filter(x => x[0].length <= 6), 2: D.PICTURE[2].filter(x => x[0].length <= 9) }, g); const ls = w.split("");
      return { type: "order", prompt: e, say: `Spell ${w}.`, tiles: scramble(ls), answer: ls, joiner: "", hint: `Say it slowly and listen for each sound: ${w}.`, bigPrompt: true }; } },
  { id: "words-step-3", ...W1, emoji: "🎵", title: "Rhyming words", blurb: "Words that sound alike.", kind: "practice", count: 10,
    intro: "Rhyming words end with the same sound, like cat and hat. Find the rhyme!", learned: "Rhyming words end with the same sound.", parent: "Make up silly rhymes together: “A frog on a log”.",
    gen: g => { const [fam, l] = pickAt(D.RHYMES, g), [w, r] = sample(fam, 2); const others = D.RHYMES[l].filter(f => f !== fam).flat();
      return { type: "choice", prompt: `Which word rhymes with “${w}”?`, say: `Which word rhymes with ${w}?`, options: withDistractors(r, others), answer: r, hint: `Listen to the end of the word: ${w}.` }; } },
  { id: "words-step-4", ...W1, emoji: "↔️", title: "Opposites", blurb: "Hot and cold, big and small.", kind: "practice", count: 10,
    intro: "Opposites mean completely different things, like hot and cold. Find the opposite!", learned: "Opposites are pairs of words with very different meanings.", parent: "Play the opposite game: you say “up”, your child says “down”.",
    gen: g => { const [pair, l] = pickAt(D.OPPOSITES, g), [a, b] = shuffle(pair); return { type: "choice", prompt: `What is the opposite of “${a}”?`, say: `What is the opposite of ${a}?`, options: withDistractors(b, D.OPPOSITES[l].filter(x => x !== pair).flat()), answer: b, hint: `Think of something that is ${a}. What is the other way?` }; } },
  { id: "words-step-5", ...W2, emoji: "👯", title: "One or many", blurb: "cat → cats, child → children.", kind: "practice", count: 10,
    intro: "When there is more than one, the word changes. Most add s, but some are special!", learned: "Plurals usually add s or es, but some words change completely (child → children).", parent: "Count things at home: one spoon, two spoons; one knife, two knives.",
    gen: g => { const [item] = pickAt(D.PLURALS, g), [s, p] = item;
      const hint = p === s ? `Some words stay the same: one ${s}, two ${p}.` : /ies$/.test(p) ? "A word ending in a consonant + y changes y to ies." : /ves$/.test(p) ? "Many words ending in f or fe change to ves."
        : /(s|x|sh|ch)es$/.test(p) && p.startsWith(s) ? "Words ending in s, x, sh or ch add es." : p.startsWith(s) ? `Add ${p.slice(s.length)} to the end.` : "This is a special word: it changes inside. Say it aloud: which sounds right?";
      return { type: "choice", prompt: `One ${s}, two ___`, say: `One ${s}, two what?`, options: pluralChoices(item), answer: p, hint }; } },
  { id: "words-step-6", ...W2, emoji: "✍️", title: "Spell it right", blurb: "Pick the correct spelling.", kind: "practice", count: 10,
    intro: "Some words are tricky to spell. Which one is spelled correctly?", learned: "Tricky words are worth learning by heart.", parent: "Keep a “tricky words” list on the fridge and practise one a day.",
    gen: g => { const [[r, ...w]] = pickAt(D.SPELLING, g); return { type: "choice", prompt: "Which spelling is correct?", say: `Which is the correct spelling of ${r}?`, options: shuffle([r, ...w]), answer: r, hint: "Look carefully at each letter. Say the word slowly, sound by sound." }; } },
  { id: "words-step-7", ...W2, emoji: "🏷️", title: "Kinds of words", blurb: "Naming, doing, describing.", kind: "practice", count: 10,
    intro: "Every word has a job: a noun names, a verb does, an adjective describes. What job does this word do?", learned: "Nouns name, verbs do, adjectives describe.", parent: "Pick a sentence from a book and find one noun, one verb and one adjective.",
    gen: g => {
      const [[sentence, w, kind], l] = pickAt(D.WORD_KINDS, g);
      const kinds = l === 0 ? ["noun", "verb", "adj"] : l === 1 ? ["noun", "verb", "adj", "adv"] : [kind, ...sample(Object.keys(D.KINDS).filter(k => k !== kind), 3)];
      const options = shuffle(kinds).map(k => ({ label: D.KINDS[k], value: k }));
      const prompt = sentence ? `“${sentence}” What kind of word is “${w}” here?` : `What kind of word is “${w}”?`;
      return { type: "choice", prompt, say: sentence ? `${sentence} What kind of word is ${w} here?` : `What kind of word is ${w}?`, options, answer: kind,
        hint: { noun: "Is it a person, place or thing?", verb: "Is it something you can do?", adj: "Does it describe a noun (what kind, which one)?", adv: "Does it tell how, when or where something is done?",
          pron: "Does it stand in for a name (he, she, it, they, him…)?", prep: "Does it show where something is (in, on, under, through…)?" }[kind] }; } },
  { id: "words-step-8", ...W2, emoji: "🟰", title: "Same meaning", blurb: "Big and large mean the same.", kind: "practice", count: 10,
    intro: "Some words mean almost the same thing, like big and large. They are called synonyms.", learned: "Synonyms are words with the same or similar meaning.", parent: "Ask for another word for “nice” or “good” when your child writes.",
    gen: g => { const [pair, l] = pickAt(D.SYNONYMS, g), [a, b] = shuffle(pair); return { type: "choice", prompt: `Which word means the same as “${a}”?`, say: `Which word means the same as ${a}?`, options: withDistractors(b, D.SYNONYMS[l].filter(x => x !== pair).flat()), answer: b, hint: `Use it in a sentence with ${a}. Which word could take its place?` }; } },
  { id: "words-step-9", ...W3, emoji: "🧱", title: "Prefixes and suffixes", blurb: "un-, re-, -ful, -less.", kind: "practice", count: 10,
    intro: "Adding a piece to the start (prefix) or end (suffix) changes a word's meaning. What does this word mean?", learned: "un- and im- mean not, re- means again, -ful means full of, -less means without.", parent: "Find words with un-, re-, -ful and -less in a newspaper.",
    gen: g => { const [[w, m], l] = pickAt(D.AFFIXES, g); return { type: "choice", prompt: `What does “${w}” mean?`, say: `What does ${w} mean?`, options: withDistractors(m, D.AFFIXES[l].map(x => x[1])), answer: m, hint: "Split the word into its parts: the start, the middle word, the end." }; } },
  { id: "words-step-10", ...W3, emoji: "👂", title: "Sound-alike words", blurb: "there, their, they're.", kind: "practice", count: 10,
    intro: "Some words sound the same but are spelled differently and mean different things. Pick the right one!", learned: "Homophones sound alike but have different meanings and spellings.", parent: "Write a silly note with a homophone mistake and let your child fix it.",
    gen: g => { const [[s, a, opts, hint]] = pickAt(D.HOMOPHONES, g); return { type: "choice", prompt: s, say: s.replace("___", "blank"), options: shuffle(opts), answer: a, hint }; } },
];
export const WORDS_PARTS = P_WORDS;

// ───────────────────────── Sentences ─────────────────────────
// Banks are in languageData.js, by level.
// Wrong ways to write a sentence with names in it: names in small letters, no capital at the start, no full stop.
function capitalMistakes(sent) {
  const words = sent.split(" ");
  const noNames = [words[0], ...words.slice(1).map(w => w.toLowerCase())].join(" ");
  return [noNames, lower(sent), sent.slice(0, -1)].filter(x => x !== sent);
}

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
    gen: g => { const [s] = pickAt(D.BUILD, g); const words = s.split(" ");
      return { type: "order", prompt: "Build the sentence", say: s, tiles: scramble(words), answer: words, joiner: " ", hint: "Which word starts with a capital letter? That one goes first. The one with the full stop goes last. Then read it aloud: does it make sense?" }; } },
  { id: "sent-step-2", ...S1, emoji: "🔠", title: "Capital and full stop", blurb: "Which one is written correctly?", kind: "practice", count: 8,
    intro: "A sentence starts with a capital letter and ends with a full stop. Which one is written correctly?", learned: "Sentences start with a capital letter and end with a full stop.", parent: "Check your child's writing together for capitals and full stops.",
    gen: g => { const [s, l] = pickAt({ 0: D.BUILD[0], 1: D.CAPITALS[1], 2: D.CAPITALS[2] }, g);
      const options = l === 0 ? shuffle([s, lower(s), s.slice(0, -1), lower(s).slice(0, -1)]) : shuffle([s, ...capitalMistakes(s)]);
      return { type: "choice", prompt: "Which sentence is written correctly?", options: [...new Set(options)], answer: s, hint: l === 0 ? "Look at the first letter and the last mark." : "Names of people, places, days and months start with a capital letter too." }; } },
  { id: "sent-step-3", ...S1, emoji: "❓", title: "Asking or telling?", blurb: "? or . or !", kind: "practice", count: 10,
    intro: "Telling sentences end with a full stop. Asking sentences end with a question mark. Which one does this need?", learned: "Questions end with ?, statements with ., and strong feelings with !.", parent: "Take turns: one asks a question, the other answers with a telling sentence.",
    gen: g => { const withEx = gradeOf(g) >= 3; const r = Math.random(); const [s, a] = withEx && r < 0.25 ? [pick(D.EXCLAIMS), "!"] : r < 0.6 ? [pick(D.QUESTIONS), "?"] : [pick(D.STATEMENTS), "."];
      const opts = [{ label: ". Telling", value: "." }, { label: "? Asking", value: "?" }, ...(withEx ? [{ label: "! Strong feeling", value: "!" }] : [])];
      return { type: "choice", prompt: `${s} ___`, say: s, options: opts, answer: a, hint: "Does it ask something? Does it show a strong feeling like wow or hurray?" }; } },
  { id: "sent-step-4", ...S1, emoji: "🕳️", title: "Fill the gap", blurb: "Which word makes sense?", kind: "practice", count: 10,
    intro: "One word is missing. Which word makes the sentence make sense?", learned: "Reading the whole sentence helps you find the missing word.", parent: "Read a story and pause before a word. Let your child guess it.",
    gen: g => { const [[s, a, opts]] = pickAt(D.MISSING, g); return { type: "choice", prompt: s, say: s.replace("___", "blank"), options: shuffle(opts), answer: a, hint: "Read the sentence with each word. Which one makes sense?" }; } },
  { id: "sent-step-5", ...S2, emoji: "🔗", title: "Joining words", blurb: "and, but, because, so, or.", kind: "practice", count: 10,
    intro: "Joining words connect two ideas: and, but, because, so, or. Which one fits?", learned: "and adds, but contrasts, because gives a reason, so gives a result, or gives a choice.", parent: "Finish sentences together: “I am happy because…”.",
    gen: g => { const [[s, a, own], l] = pickAt(D.JOINERS, g);
      return { type: "choice", prompt: s, say: s.replace("___", "blank"), options: own ? shuffle(own) : D.JOIN_WORDS, answer: a,
        hint: l === 2 ? "although = even so; unless = if not; until = up to the time; while = at the same time; because = the reason." : "Is it adding (and), a surprise (but), a reason (because), a result (so), or a choice (or)?" }; } },
  { id: "sent-step-6", ...S2, emoji: "⏳", title: "Yesterday, today, tomorrow", blurb: "Past, present and future.", kind: "practice", count: 10,
    intro: "Verbs change with time: past (yesterday), present (now) and future (tomorrow). Pick the right one!", learned: "Tense tells us when something happens.", parent: "Talk about what you did yesterday and what you will do tomorrow.",
    gen: g => { const [[s, a, opts], l] = pickAt(D.TENSES, g); return { type: "choice", prompt: s, say: s.replace("___", "blank"), options: shuffle(opts), answer: a,
      hint: l === 0 ? "Look for time words: yesterday, now, tomorrow, every day." : l === 1 ? "Look for clues: already, since, while, when… Did it finish, or was it going on?" : "Look at the whole sentence: if… would, by the time… had, I wish… knew." }; } },
  { id: "sent-step-7", ...S2, emoji: "✳️", title: "Punctuation", blurb: "Commas, ! and ?", kind: "practice", count: 8,
    intro: "Punctuation marks help us read. Which sentence is punctuated correctly?", learned: "Commas separate lists and names; ! shows strong feeling; ? asks.", parent: "Read a sentence aloud without pauses, then with them. Hear the difference!",
    gen: g => { const [[r, ...w]] = pickAt(D.PUNCT, g); return { type: "choice", prompt: "Which is punctuated correctly?", options: shuffle([r, ...w]), answer: r, hint: "Check capitals, commas in lists, and the end mark." }; } },
  { id: "sent-step-8", ...S3, emoji: "🎯", title: "Subject and predicate", blurb: "Who or what is it about?", kind: "practice", count: 8,
    intro: "The subject is who or what the sentence is about. The predicate tells what the subject does. Find the subject!", learned: "Every sentence has a subject and a predicate.", parent: "In a news headline, find who it's about (subject) and what happened (predicate).",
    gen: g => { const [[s, subj, pred, other]] = pickAt(D.SUBJECTS, g);
      if (levelOf(g) >= 2 && Math.random() < 0.5) return { type: "choice", prompt: `“${s}” What is the predicate (what it tells us about the subject)?`, options: shuffle([pred, subj, other]), answer: pred, hint: `The subject is “${subj}”. The predicate is the rest of the sentence.` };
      return { type: "choice", prompt: `“${s}” Who or what is it about?`, options: shuffle([subj, pred, other]), answer: subj, hint: "Ask: who or what is doing it, or being described?" }; } },
  { id: "sent-step-9", ...S3, emoji: "🔄", title: "Active and passive", blurb: "Ravi wrote → was written by Ravi.", kind: "practice", count: 6,
    intro: "In the passive voice, the thing that receives the action comes first. Change the sentence to passive!", learned: "Passive voice: object + was/is/will be + past participle + by + doer.", parent: "Spot passive sentences in a science textbook: “Water is boiled…”.",
    gen: g => { const [[s, a, ...w]] = pickAt(D.VOICE, g); return { type: "choice", prompt: `Change to passive: “${s}”`, options: shuffle([a, ...w]), answer: a, hint: "Start with the thing that the action happened to." }; } },
  { id: "sent-step-10", ...S3, emoji: "💬", title: "Reported speech", blurb: "Direct to indirect.", kind: "practice", count: 6,
    intro: "Reported speech tells what someone said without quotation marks. Pick the correct one!", learned: "In reported speech, the tense usually goes back and pronouns change.", parent: "Retell what a friend said at school, starting with “She said that…”.",
    gen: g => { const [[s, a, ...w]] = pickAt(D.SPEECH, g); return { type: "choice", prompt: `Report this: ${s}`, options: shuffle([a, ...w]), answer: a, hint: "Change I to he/she, and am/is to was." }; } },
];
export const SENTENCES_PARTS = P_SENT;

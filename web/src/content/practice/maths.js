// Maths adventures with Ollie the Octopus: Numbers and Mathematics.
// Visuals are plain data; the practice engine draws them:
//   count {emoji,n} · add/sub {emoji,a,b} · groups {emoji,groups,each} · blocks {h,t,o}
//   fraction {n,k} · rect {w,h,unit} · triangle {a,b,c,unknown} · column {a,b,op}
import { randInt, pick, shuffle, withDistractors, nearNumbers, indian, gradeOf } from "./gen.js";

const THINGS = ["🍎", "⭐", "🐟", "🎈", "🍌", "🚗", "🐤", "🌸", "🍪", "⚽"];
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
export const numberName = n => (n < 20 ? ONES[n] : n < 100 ? TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : "") : n === 100 ? "one hundred" : String(n));
const numChoice = (ans, extra = {}) => ({ type: "choice", options: withDistractors(ans, nearNumbers(ans, 3, extra.neg)).map(String), answer: String(ans) });
// Wrong answers that come from real mistakes (e.g. mixing up places), not just nearby numbers.
const mistakeChoice = (ans, mistakes) => ({ type: "choice", options: withDistractors(ans, mistakes.filter(m => m !== ans && Number.isFinite(m) && m >= 0)).map(String), answer: String(ans) });

// ───────────────────────── Numbers ─────────────────────────
const P_NUM = [
  { id: "A", title: "Part A · Counting", who: "From 1st standard", note: "Count objects, number names, before and after, more and less." },
  { id: "B", title: "Part B · Place value", who: "After Part A · open from 3rd standard", note: "Tens, ones and hundreds; skip counting; odd and even." },
  { id: "C", title: "Part C · Big numbers", who: "After Part B · open from 5th standard", note: "Lakhs and crores, rounding and negative numbers." },
];
const N1 = { part: "A", openFrom: 3 }, N2 = { part: "B", openFrom: 3 }, N3 = { part: "C", openFrom: 5 };

export const NUMBERS_JOURNEY = [
  { id: "num-step-1", ...N1, emoji: "🖐️", title: "Count to 10", blurb: "How many can you see?", kind: "practice", count: 10,
    intro: "Let's count! Touch each one as you count. How many are there?", learned: "Counting one by one tells us how many.", parent: "Count spoons, steps and shoes around the house.",
    gen: () => { const n = randInt(1, 10), e = pick(THINGS); return { ...numChoice(n), prompt: "How many?", say: "How many can you count?", visual: { kind: "count", emoji: e, n }, hint: "Touch each one and count out loud." }; } },
  { id: "num-step-2", ...N1, emoji: "🔟", title: "Count to 20", blurb: "Bigger groups.", kind: "practice", count: 10,
    intro: "Now bigger groups! Count in rows of five to make it easier.", learned: "Counting in groups of 5 or 10 is faster.", parent: "Count coins together, making piles of 5.",
    gen: () => { const n = randInt(11, 20), e = pick(THINGS); return { type: "number", prompt: "How many?", say: "How many are there?", visual: { kind: "count", emoji: e, n }, answer: n, hint: "Each row has 5. Count the rows: 5, 10, 15… then add the rest." }; } },
  { id: "num-step-3", ...N1, emoji: "🔤", title: "Number names", blurb: "7 is seven.", kind: "practice", count: 10,
    intro: "Every number has a name we can write. Match the number and its name!", learned: "Numbers can be written in figures (7) and words (seven).", parent: "Write cheques or shopping lists together with numbers in words.",
    gen: g => { const n = gradeOf(g) >= 2 ? randInt(1, 99) : randInt(1, 20);
      // Swapped digits (95 ↔ 59) is a common mix-up, so it's one of the wrong answers when it can be.
      const swapped = n >= 13 && n % 10 > 0 && n % 11 ? Number(String(n).split("").reverse().join("")) : null;
      const wrong = [...(swapped ? [swapped] : []), ...nearNumbers(n)].filter(x => x >= 1 && x <= 100); // names exist up to one hundred
      if (Math.random() < 0.5) return { type: "choice", prompt: `Which number is “${numberName(n)}”?`, say: `Which number is ${numberName(n)}?`, options: withDistractors(n, wrong.slice(0, 3)).map(String), answer: String(n), hint: "Say the name slowly: the tens come first, then the ones." };
      return { type: "choice", prompt: `How do we write ${n} in words?`, say: `How do we write ${n} in words?`, options: withDistractors(numberName(n), wrong.slice(0, 3).map(numberName)), answer: numberName(n), hint: "Break it into tens and ones." }; } },
  { id: "num-step-4", ...N1, emoji: "↔️", title: "Before, after, between", blurb: "What comes next?", kind: "practice", count: 10,
    intro: "Numbers stand in a line. Which number comes before, after or in between?", learned: "After means one more, before means one less.", parent: "On a calendar, ask which date comes after today.",
    gen: g => { const max = gradeOf(g) >= 3 ? 999 : gradeOf(g) >= 2 ? 99 : 20; const n = randInt(2, max - 2); const k = pick(["before", "after", "between"]);
      if (k === "before") return { type: "number", prompt: `What comes just before ${n}?`, answer: n - 1, hint: "One less." };
      if (k === "after") return { type: "number", prompt: `What comes just after ${n}?`, answer: n + 1, hint: "One more." };
      return { type: "number", prompt: `What comes between ${n - 1} and ${n + 1}?`, answer: n, hint: "Count up from the first number." }; } },
  { id: "num-step-5", ...N1, emoji: "⚖️", title: "More or less", blurb: "> < =", kind: "practice", count: 10,
    intro: "Which is more? Think of the signs as a hungry crocodile mouth: it always opens towards the bigger number!", learned: "> means more than, < means less than, = means the same.", parent: "Compare prices in a shop: which is more?",
    gen: g => { const max = gradeOf(g) >= 3 ? 999 : gradeOf(g) >= 2 ? 99 : 20; const a = randInt(0, max), b = Math.random() < 0.15 ? a : randInt(0, max); const ans = a > b ? ">" : a < b ? "<" : "=";
      return { type: "choice", prompt: `${a}  ☐  ${b}`, say: `Compare ${a} and ${b}.`, options: [{ label: "> more than", value: ">" }, { label: "< less than", value: "<" }, { label: "= the same", value: "=" }], answer: ans, hint: "The open mouth faces the bigger number.", bigPrompt: true }; } },
  { id: "num-step-6", ...N2, emoji: "🧊", title: "Tens and ones", blurb: "Rods and cubes.", kind: "practice", count: 10,
    intro: "Each long rod is a TEN. Each small cube is a ONE. What number is shown?", learned: "A two-digit number is made of tens and ones: 34 is 3 tens and 4 ones.", parent: "Bundle sticks or straws in tens with rubber bands.",
    gen: () => { const t = randInt(1, 9), o = randInt(0, 9); return { type: "number", prompt: "What number is this?", visual: { kind: "blocks", h: 0, t, o }, answer: t * 10 + o, hint: `Count the rods by tens (10, 20, 30…), then add the cubes.` }; } },
  { id: "num-step-7", ...N2, emoji: "💯", title: "Hundreds, tens and ones", blurb: "Three-digit numbers.", kind: "practice", count: 10,
    intro: "A big square is a HUNDRED. Count the hundreds, tens and ones!", learned: "In 352 the 3 means three hundreds, the 5 means five tens, the 2 means two ones.", parent: "Use ₹100, ₹10 and ₹1 coins (or paper notes) to make numbers.",
    gen: () => { const h = randInt(1, 9), t = randInt(0, 9), o = randInt(0, 9); const n = h * 100 + t * 10 + o;
      if (Math.random() < 0.5) return { type: "number", prompt: "What number is this?", visual: { kind: "blocks", h, t, o }, answer: n, hint: "Hundreds first, then tens, then ones." };
      const places = [["hundreds", h, 100], ["tens", t, 10], ["ones", o, 1]].filter(([, d]) => d > 0);
      const [name, d, worth] = pick(places);
      return { ...mistakeChoice(d * worth, [d, d * 10, d * 100, d * 1000]), prompt: `In ${n}, what is the value of the ${d} in the ${name} place?`, say: `In ${n}, what is the value of the ${d} in the ${name} place?`,
        hint: `The ${d} is in the ${name} place, so it is worth ${d} ${name === "ones" ? "ones" : name}: ${d * worth}.` }; } },
  { id: "num-step-8", ...N2, emoji: "🦘", title: "Skip counting", blurb: "2, 4, 6, 8…", kind: "practice", count: 10,
    intro: "Skip counting jumps by the same amount each time. What comes next?", learned: "Skip counting is the first step to times tables.", parent: "Count shoes in pairs: 2, 4, 6…",
    gen: g => { const step = pick(gradeOf(g) >= 4 ? [2, 3, 4, 5, 10, 25, 100] : [2, 5, 10]); const start = step * randInt(0, 6); const seq = [0, 1, 2, 3].map(i => start + i * step);
      return { type: "number", prompt: `${seq.join(", ")}, ___`, say: `${seq.join(", ")}. What comes next?`, answer: start + 4 * step, hint: `Each jump adds ${step}.`, bigPrompt: true }; } },
  { id: "num-step-9", ...N2, emoji: "🧦", title: "Odd and even", blurb: "Can it be shared in pairs?", kind: "practice", count: 10,
    intro: "Even numbers can be shared into pairs with none left over. Odd numbers have one left over. Which is it?", learned: "Even numbers end in 0, 2, 4, 6 or 8. Odd numbers end in 1, 3, 5, 7 or 9.", parent: "Pair up socks: an odd number leaves one without a partner.",
    gen: g => { const n = gradeOf(g) >= 3 ? randInt(1, 999) : randInt(1, 20); const small = n <= 12;
      return { type: "choice", prompt: `Is ${n} odd or even?`, visual: small ? { kind: "count", emoji: "🧦", n } : undefined, options: ["Odd", "Even"], answer: n % 2 ? "Odd" : "Even", hint: "Look at the last digit: 0, 2, 4, 6, 8 means even." }; } },
  { id: "num-step-10", ...N3, emoji: "🏦", title: "Lakhs and crores", blurb: "Indian place value.", kind: "practice", count: 8,
    intro: "In India we group big numbers as thousands, lakhs and crores: 12,34,567. Let's read them!", learned: "1 lakh = 1,00,000 and 1 crore = 1,00,00,000.", parent: "Read house prices or cricket crowd numbers from the newspaper together.",
    gen: () => {
      const lakh = randInt(1, 99), th = randInt(0, 99), rest = randInt(0, 999); const n = lakh * 100000 + th * 1000 + rest;
      if (Math.random() < 0.5) {
        const words = `${lakh} lakh ${th} thousand ${rest}`;
        const wrong = [indian(lakh * 10000 + th * 1000 + rest), indian(lakh * 1000000 + th * 1000 + rest), indian(lakh * 100000 + th * 100 + rest)];
        return { type: "choice", prompt: `Write in figures: ${words}`, options: withDistractors(indian(n), wrong), answer: indian(n), hint: "Lakhs, then thousands, then hundreds-tens-ones: __,__,___" };
      }
      const cr = randInt(1, 9), m = cr * 10000000 + n;
      return { type: "choice", prompt: `How many crores in ${indian(m)}?`, options: withDistractors(String(cr), ["0", String(cr + 1), String(cr * 10), String(lakh)]), answer: String(cr), hint: "The crore digits come before the first comma group of lakhs." };
    } },
  { id: "num-step-11", ...N3, emoji: "🎯", title: "Rounding", blurb: "Nearest 10, 100, 1000.", kind: "practice", count: 10,
    intro: "Rounding finds the nearest easy number. 5 or more rounds up!", learned: "Look at the digit to the right: 5 or more rounds up, 4 or less rounds down.", parent: "Round shopping prices to estimate the total bill.",
    gen: g => { const to = pick(gradeOf(g) >= 6 ? [10, 100, 1000] : [10, 100]); const n = randInt(to, to * 99 + to - 1);
      return { type: "number", prompt: `Round ${indian(n)} to the nearest ${to}`, answer: Math.round(n / to) * to, hint: `Look at the digit in the ${to / 10 === 1 ? "ones" : to === 100 ? "tens" : "hundreds"} place.` }; } },
  { id: "num-step-12", ...N3, emoji: "🌡️", title: "Negative numbers", blurb: "Below zero.", kind: "practice", count: 10,
    intro: "Numbers below zero are negative, like −5 °C on a cold night. The further below zero, the smaller!", learned: "On a number line, numbers get bigger to the right. −2 is bigger than −5.", parent: "Look at temperatures of cold places like Leh in winter.",
    gen: () => {
      const k = pick(["compare", "compare", "warmer", "colder", "smallest"]);
      if (k === "warmer" || k === "colder") {
        const place = pick(["Leh", "Shimla", "Srinagar", "Manali", "Gulmarg"]);
        // Always below zero at some point: warmer starts below zero; colder ends below zero.
        const t = k === "warmer" ? randInt(-12, -1) : randInt(-5, 6), d = k === "warmer" ? randInt(2, 9) : randInt(Math.max(2, t + 1), t + 9); const end = k === "warmer" ? t + d : t - d;
        return { type: "number", allowNegative: true, prompt: `It is ${t} °C in ${place} at night. By ${k === "warmer" ? "noon it is" : "midnight it is"} ${d} degrees ${k}. What is the temperature now? (°C)`, answer: end,
          hint: `On a number line, start at ${t} and move ${d} ${k === "warmer" ? "up (right)" : "down (left)"}.` };
      }
      if (k === "smallest") {
        const set = new Set([randInt(-15, -1), randInt(-15, -1)]); while (set.size < 4) set.add(randInt(-15, 12)); const nums = shuffle([...set]); // at least two negatives
        return { type: "choice", prompt: `Which is the smallest: ${nums.join(", ")}?`, options: nums.map(String), answer: String(Math.min(...nums)), hint: "The smallest is the one furthest left on the number line: the most negative." };
      }
      let a = randInt(-20, 10), b = randInt(-20, 10);
      if (a === b) b = a - 3;
      if (a >= 0 && b >= 0) a = -a - 1; // always include a negative number
      return { type: "choice", prompt: `Which is bigger: ${a} or ${b}?`, options: [String(a), String(b)], answer: String(Math.max(a, b)), hint: "Further right on the number line is bigger. −1 is bigger than −10." }; } },
];
export const NUMBERS_PARTS = P_NUM;

// ───────────────────────── Mathematics ─────────────────────────
const P_MATH = [
  { id: "A", title: "Part A · Add and subtract", who: "From 1st standard", note: "With objects first, then two-digit sums with carrying." },
  { id: "B", title: "Part B · Times and share", who: "After Part A · open from 3rd standard", note: "Multiplication, tables, division and money problems." },
  { id: "C", title: "Part C · Parts and shapes", who: "After Part B · open from 5th standard", note: "Fractions, decimals, percentages, area and perimeter." },
  { id: "D", title: "Part D · Algebra and beyond", who: "After Part C · open from 7th standard", note: "Integers, equations, powers and Pythagoras. 11th–12th topics are coming later." },
];
const M1 = { part: "A", openFrom: 3 }, M2 = { part: "B", openFrom: 3 }, M3 = { part: "C", openFrom: 5 }, M4 = { part: "D", openFrom: 7 };
const NAMES = ["Riya", "Aarav", "Meera", "Kabir", "Ananya", "Arjun", "Diya", "Vihaan"];
const round2 = x => Math.round(x * 100) / 100;
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
// A fraction top/bottom in lowest terms (1/2, not 2/4).
const simpleTop = d => pick(Array.from({ length: d - 1 }, (_, i) => i + 1).filter(t => gcd(t, d) === 1));

export const MATHS_JOURNEY = [
  { id: "math-step-1", ...M1, emoji: "➕", title: "Adding within 10", blurb: "Put groups together.", kind: "practice", count: 10,
    intro: "Adding means putting groups together. How many altogether?", learned: "Adding puts groups together to find the total.", parent: "Add fruits in the basket: 3 bananas and 2 apples.",
    gen: g => { const a = randInt(1, 6), b = randInt(1, 10 - a), e = pick(THINGS);
      if (gradeOf(g) >= 2 && Math.random() < 0.3) return { type: "number", prompt: `${a} + ? = ${a + b}`, say: `${a} plus what makes ${a + b}?`, answer: b, hint: `Start at ${a} and count up to ${a + b}.`, bigPrompt: true };
      return { type: "number", prompt: `${a} + ${b} = ?`, visual: { kind: "add", emoji: e, a, b }, answer: a + b, hint: `Count all of them: start at ${a} and count on ${b} more.`, bigPrompt: true }; } },
  { id: "math-step-2", ...M1, emoji: "➖", title: "Taking away within 10", blurb: "How many are left?", kind: "practice", count: 10,
    intro: "Subtracting means taking away. How many are left?", learned: "Taking away tells us how many are left.", parent: "Eat 2 of 7 grapes and ask how many are left.",
    gen: g => { const a = randInt(3, 10), b = randInt(1, a - 1), e = pick(THINGS);
      if (gradeOf(g) >= 2 && Math.random() < 0.3) return { type: "number", prompt: `${a} − ? = ${a - b}`, say: `${a} take away what leaves ${a - b}?`, answer: b, hint: `How many do you take from ${a} to leave ${a - b}?`, bigPrompt: true };
      return { type: "number", prompt: `${a} − ${b} = ?`, visual: { kind: "sub", emoji: e, a, b }, answer: a - b, hint: "Count the ones that are not crossed out.", bigPrompt: true }; } },
  { id: "math-step-3", ...M1, emoji: "🧮", title: "Adding bigger numbers", blurb: "Ones first, then tens.", kind: "practice", count: 10,
    intro: "Add the ones first, then the tens. If the ones make 10 or more, carry one ten over!", learned: "Column addition: ones first, carry to the tens.", parent: "Add two bus or train numbers you see on the way.",
    gen: g => { const carry = gradeOf(g) >= 2, big = gradeOf(g) >= 4; let a, b;
      if (big) { a = randInt(100, 899); b = randInt(100, 999 - a); }
      else do { a = randInt(10, 89); b = randInt(10, 99 - a); } while (!carry && (a % 10) + (b % 10) >= 10);
      return { type: "number", prompt: `${a} + ${b} = ?`, visual: { kind: "column", a, b, op: "+" }, answer: a + b, hint: `Ones: ${a % 10} + ${b % 10}. Then tens${big ? ", then hundreds" : ""}. Carry when a column makes 10 or more.` }; } },
  { id: "math-step-4", ...M1, emoji: "🧮", title: "Subtracting bigger numbers", blurb: "Borrow when you need to.", kind: "practice", count: 10,
    intro: "Subtract the ones first. If the top digit is too small, borrow a ten!", learned: "Column subtraction: ones first, borrow from the tens when needed.", parent: "Work out change from ₹100 when buying something.",
    gen: g => { const borrow = gradeOf(g) >= 2, big = gradeOf(g) >= 4; let a, b;
      if (big) { a = randInt(200, 999); b = randInt(100, a - 1); }
      else do { a = randInt(20, 99); b = randInt(10, a - 1); } while (!borrow && a % 10 < b % 10);
      return { type: "number", prompt: `${a} − ${b} = ?`, visual: { kind: "column", a, b, op: "−" }, answer: a - b, hint: `Ones: ${a % 10} − ${b % 10}. Borrow a ten if the top digit is smaller.` }; } },
  { id: "math-step-5", ...M2, emoji: "🧺", title: "Groups of", blurb: "Multiplication is repeated adding.", kind: "practice", count: 10,
    intro: "Multiplying means adding equal groups. How many altogether?", learned: "3 groups of 4 is 3 × 4 = 12.", parent: "Arrange sweets in equal rows and count them by rows.",
    gen: () => { const g = randInt(2, 5), n = randInt(2, 6), e = pick(THINGS); return { type: "number", prompt: `${g} groups of ${n} = ${g} × ${n} = ?`, visual: { kind: "groups", emoji: e, groups: g, each: n }, answer: g * n, hint: `Add ${n} again and again, ${g} times.` }; } },
  { id: "math-step-6", ...M2, emoji: "✖️", title: "Times tables", blurb: "2 to 12.", kind: "practice", count: 12,
    intro: "Quick! How fast can you answer these times tables?", learned: "Knowing tables by heart makes bigger sums easy.", parent: "Practise one table a week in the car or at dinner.",
    gen: g => { const top = gradeOf(g) >= 4 ? 12 : gradeOf(g) >= 3 ? 10 : 5; const a = randInt(2, top), b = randInt(2, 10); return { type: "number", prompt: `${a} × ${b} = ?`, answer: a * b, hint: `Count in ${a}s, ${b} times.`, bigPrompt: true }; } },
  { id: "math-step-7", ...M2, emoji: "🍬", title: "Sharing equally", blurb: "Division.", kind: "practice", count: 10,
    intro: "Dividing means sharing equally. How many does each friend get?", learned: "12 ÷ 3 = 4 because 3 × 4 = 12.", parent: "Share snacks equally between family members.",
    gen: g => { const d = randInt(2, gradeOf(g) >= 4 ? 10 : 5), q = randInt(2, gradeOf(g) >= 4 ? 10 : 6); const who = pick(NAMES);
      return { type: "number", prompt: `${who} shares ${d * q} sweets equally among ${d} friends. How many does each get?`, visual: d * q <= 30 ? { kind: "groups", emoji: "🍬", groups: d, each: q, hidden: true } : undefined, answer: q, hint: `Which number times ${d} makes ${d * q}?` }; } },
  { id: "math-step-8", ...M2, emoji: "💰", title: "Money problems", blurb: "Rupees and change.", kind: "practice", count: 8,
    intro: "Let's go shopping! Read carefully and work out the answer in rupees.", learned: "Word problems: find the numbers, decide add/subtract/multiply/divide, then solve.", parent: "Let your child pay at a shop and check the change.",
    gen: () => { const who = pick(NAMES); const k = pick(["change", "total", "each", "both"]);
      if (k === "both") { const a = randInt(12, 90), b = randInt(8, 60); const [x, y] = pick([["a notebook", "a pen"], ["a mango", "a packet of biscuits"], ["a bus ticket", "a samosa"], ["a toy car", "a ball"]]);
        return { type: "number", prompt: `${who} buys ${x} for ₹${a} and ${y} for ₹${b}. How much is that altogether?`, answer: a + b, unit: "₹", hint: `Add ₹${a} and ₹${b}.` }; }
      if (k === "change") { const has = pick([50, 100, 200, 500]); const cost = randInt(10, has - 5); return { type: "number", prompt: `${who} has ₹${has} and buys a book for ₹${cost}. How much money is left?`, answer: has - cost, unit: "₹", hint: "Take away the cost." }; }
      if (k === "total") { const n = randInt(2, 6), price = randInt(5, 40); return { type: "number", prompt: `A pencil box costs ₹${price}. How much do ${n} boxes cost?`, answer: n * price, unit: "₹", hint: `${n} × ${price}.` }; }
      const n = randInt(2, 5), each = randInt(5, 30); return { type: "number", prompt: `${n} friends share a ₹${n * each} pizza bill equally. How much does each pay?`, answer: each, unit: "₹", hint: `Divide ${n * each} by ${n}.` }; } },
  { id: "math-step-9", ...M3, emoji: "🍕", title: "Fractions", blurb: "Parts of a whole.", kind: "practice", count: 10,
    intro: "A fraction shows part of a whole. The bottom number is how many equal parts; the top is how many are shaded.", learned: "In 3/8, the whole is cut into 8 equal parts and 3 are taken.", parent: "Cut a roti or pizza into equal parts and name the fractions.",
    gen: g => { const n = randInt(2, 8), k = randInt(1, n - 1);
      if (gradeOf(g) >= 6 && Math.random() < 0.4) { const a = [randInt(1, 5), randInt(2, 6)], b = [randInt(1, 5), randInt(2, 6)]; if (a[0] >= a[1] || b[0] >= b[1] || a[0] * b[1] === b[0] * a[1]) return { type: "choice", prompt: "Which is bigger: 1/2 or 1/3?", options: ["1/2", "1/3"], answer: "1/2", hint: "Fewer parts means bigger parts." };
        return { type: "choice", prompt: `Which is bigger: ${a[0]}/${a[1]} or ${b[0]}/${b[1]}?`, options: [`${a[0]}/${a[1]}`, `${b[0]}/${b[1]}`], answer: a[0] / a[1] > b[0] / b[1] ? `${a[0]}/${a[1]}` : `${b[0]}/${b[1]}`, hint: "Make the bottoms the same, or turn them into decimals." }; }
      if (gradeOf(g) >= 4 && Math.random() < 0.3) { const d = pick([2, 3, 4, 5, 10]), each = randInt(2, 9); const top = simpleTop(d);
        return { type: "number", prompt: `What is ${top}/${d} of ${d * each}?`, say: `What is ${top} over ${d} of ${d * each}?`, answer: top * each, hint: `Split ${d * each} into ${d} equal parts (${each} each), then take ${top} of them.` }; }
      if (gradeOf(g) >= 5 && Math.random() < 0.25) { const b = randInt(2, 6), a = simpleTop(b), m = randInt(2, 5);
        return { type: "number", prompt: `${a}/${b} = ?/${b * m}`, say: `${a} over ${b} equals what over ${b * m}?`, answer: a * m, hint: `${b} × ${m} = ${b * m}, so multiply the top by ${m} too.`, bigPrompt: true }; }
      const opts = [`${k}/${n}`, `${n - k}/${n}`, `${k}/${n + 1}`, `${n}/${k}`];
      return { type: "choice", prompt: "What fraction is shaded?", visual: { kind: "fraction", n, k }, options: withDistractors(`${k}/${n}`, opts.slice(1)), answer: `${k}/${n}`, hint: "Count all the equal parts (bottom), then the shaded ones (top)." }; } },
  { id: "math-step-10", ...M3, emoji: "🔸", title: "Decimals", blurb: "₹12.50 and 3.75 kg.", kind: "practice", count: 10,
    intro: "Decimals show parts of a whole with a point: ₹12.50 is 12 rupees and 50 paise.", learned: "Line up the decimal points when adding or subtracting.", parent: "Add prices on a restaurant bill together.",
    gen: () => { const a = randInt(100, 999) / 100, b = randInt(100, 999) / 100;
      if (Math.random() < 0.5) return { type: "number", prompt: `${a.toFixed(2)} + ${b.toFixed(2)} = ?`, answer: round2(a + b), hint: "Line up the points, then add." };
      if (Math.random() < 0.35) { const note = pick([20, 50, 100]); const cost = randInt(100, note * 100 - 50) / 100;
        return { type: "number", prompt: `You pay ₹${note} for something that costs ₹${cost.toFixed(2)}. How much change do you get?`, answer: round2(note - cost), unit: "₹", hint: `${note}.00 − ${cost.toFixed(2)}. Line up the points.` }; }
      const bb = Number(b.toFixed(1)), aa = a === bb ? round2(a + 0.01) : a;
      return { type: "choice", prompt: `Which is bigger: ${aa.toFixed(2)} or ${bb.toFixed(1)}?`, options: [aa.toFixed(2), bb.toFixed(1)], answer: aa > bb ? aa.toFixed(2) : bb.toFixed(1), hint: "Compare the whole numbers first, then the tenths, then the hundredths." }; } },
  { id: "math-step-11", ...M3, emoji: "💯", title: "Percentages", blurb: "Discounts and marks.", kind: "practice", count: 10,
    intro: "Per cent means out of 100. 25% of something is 25 out of every 100.", learned: "To find x% of a number, multiply by x and divide by 100.", parent: "Work out the sale price during a festival sale.",
    gen: () => { const p = pick([10, 20, 25, 50, 75, 5, 15]); const base = pick([40, 80, 100, 120, 200, 240, 300, 400, 500, 800]);
      if (Math.random() < 0.3) { const out = pick([10, 20, 25, 50]); const got = randInt(Math.ceil(out / 4), out); // always a whole percentage
        return { type: "number", prompt: `${pick(NAMES)} scored ${got} out of ${out} in a test. What percentage is that? (%)`, answer: (got * 100) / out, hint: `${got} ÷ ${out} × 100.` }; }
      if (Math.random() < 0.5) return { type: "number", prompt: `What is ${p}% of ₹${base}?`, answer: (p * base) / 100, unit: "₹", hint: `${base} × ${p} ÷ 100.` };
      return { type: "number", prompt: `A ₹${base} shirt has ${p}% off. What is the sale price?`, answer: base - (p * base) / 100, unit: "₹", hint: `Find ${p}% of ${base}, then take it away.` }; } },
  { id: "math-step-12", ...M3, emoji: "📐", title: "Area and perimeter", blurb: "Inside and around.", kind: "practice", count: 10,
    intro: "Perimeter is the distance all around. Area is the space inside (length × width).", learned: "Rectangle: perimeter = 2 × (l + w), area = l × w.", parent: "Measure a room or a book and find its area and perimeter.",
    gen: g => { const w = randInt(2, 12), h = randInt(2, 9); const unit = pick(["cm", "m"]); const area = Math.random() < 0.5;
      if (gradeOf(g) >= 6 && Math.random() < 0.3) return { type: "number", prompt: `A rectangle has an area of ${w * h} square ${unit} and a length of ${w} ${unit}. How wide is it? (in ${unit})`, answer: h, hint: `Area = length × width, so width = ${w * h} ÷ ${w}.` };
      return { type: "number", prompt: area ? `What is the area of this rectangle? (in square ${unit})` : `What is the perimeter of this rectangle? (in ${unit})`, visual: { kind: "rect", w, h, unit }, answer: area ? w * h : 2 * (w + h), hint: area ? "Length × width." : "Add all four sides." }; } },
  { id: "math-step-13", ...M4, emoji: "🌡️", title: "Integers", blurb: "Adding negatives.", kind: "practice", count: 10,
    intro: "Adding a negative number is like going down. Subtracting a negative is like going up!", learned: "−3 + 5 = 2, and 4 − (−2) = 6.", parent: "Use a lift: go up 5 floors from basement level −2.",
    gen: () => { let a = randInt(-12, 12), b = randInt(-12, 12); if (a >= 0 && b >= 0) { if (Math.random() < 0.5) a = -a - 1; else b = -b - 1; }
      const op = pick(["+", "−"]); const shown = b < 0 ? `(${b})` : b;
      return { type: "number", prompt: `${a} ${op} ${shown} = ?`, answer: op === "+" ? a + b : a - b, allowNegative: true, hint: "Think of a number line. Subtracting a negative is the same as adding." }; } },
  { id: "math-step-14", ...M4, emoji: "🔎", title: "Solve for x", blurb: "Find the mystery number.", kind: "practice", count: 10,
    intro: "An equation is a balance. Do the same thing to both sides to find x!", learned: "To solve 3x + 4 = 19: subtract 4, then divide by 3. x = 5.", parent: "Make up mystery-number riddles: I think of a number, double it and add 3…",
    gen: g => { const x = randInt(-6, 12), a = gradeOf(g) >= 8 ? randInt(2, 9) : 1, b = randInt(-10, 20); const c = a * x + b;
      const lhs = `${a === 1 ? "" : a}x ${b < 0 ? "−" : "+"} ${Math.abs(b)}`;
      return { type: "number", prompt: `${lhs} = ${c}.  x = ?`, answer: x, allowNegative: true, hint: `${b < 0 ? "Add" : "Subtract"} ${Math.abs(b)} on both sides${a > 1 ? `, then divide by ${a}` : ""}.` }; } },
  { id: "math-step-15", ...M4, emoji: "⚡", title: "Powers and roots", blurb: "2⁵ and √144.", kind: "practice", count: 10,
    intro: "A power means multiplying a number by itself: 2⁴ = 2 × 2 × 2 × 2. A square root undoes a square.", learned: "a² × a = a³; √81 = 9 because 9 × 9 = 81.", parent: "Find the square numbers on a 100-square chart.",
    gen: () => { const sup = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶"]; const k = pick(["pow", "sq", "root", "cube"]);
      if (k === "pow") { const b = randInt(2, 5), e = randInt(2, b === 2 ? 6 : 4); return { type: "number", prompt: `${b}${sup[e]} = ?`, answer: b ** e, hint: `Multiply ${b} by itself ${e} times.`, bigPrompt: true }; }
      if (k === "sq") { const b = randInt(2, 15); return { type: "number", prompt: `${b}² = ?`, answer: b * b, hint: `${b} × ${b}.`, bigPrompt: true }; }
      if (k === "cube") { const b = randInt(2, 6); return { type: "number", prompt: `∛${b ** 3} = ?`, answer: b, hint: "Which number times itself three times gives this?", bigPrompt: true }; }
      const b = randInt(2, 20); return { type: "number", prompt: `√${b * b} = ?`, answer: b, hint: "Which number times itself gives this?", bigPrompt: true }; } },
  { id: "math-step-16", ...M4, openFrom: 8, emoji: "📏", title: "Pythagoras", blurb: "a² + b² = c².", kind: "practice", count: 8,
    intro: "In a right-angled triangle, the square of the longest side equals the sum of the squares of the other two: a² + b² = c².", learned: "Pythagoras: c² = a² + b², so c = √(a² + b²).", parent: "Check a 3-4-5 triangle with a measuring tape: it makes a perfect corner!",
    gen: () => { const [a, b, c] = pick([[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [12, 16, 20], [20, 21, 29]]); const u = pick(["c", "a"]);
      return { type: "number", prompt: u === "c" ? "Find the longest side (hypotenuse)." : "Find the missing side.", visual: { kind: "triangle", a, b, c, unknown: u }, answer: u === "c" ? c : a, hint: u === "c" ? `√(${a}² + ${b}²)` : `√(${c}² − ${b}²)` }; } },
];
export const MATHS_PARTS = P_MATH;

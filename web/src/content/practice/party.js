// Ollie's mission: plan a party. A conversation first (how can maths help plan a party?), then the
// mission at the end of Part B: count the guests, work out the food and drinks, shop within a budget,
// pay and get change, and share sweets into party bags. Plain data and pure helpers (no React).
// Written for children everywhere: the child picks their own money, or neutral "coins".

export const OLLIE_TALK_PARTY = [
  { say: "Hi {name}! I'm Ollie. I'm planning a birthday party, and I need a helper who's good at maths. Will you help me?" },
  { ask: "I've invited 6 friends. With me, how many of us will be at the party?",
    choices: [
      { label: "6", right: false, reply: "Don't forget me! 6 friends and me makes 7." },
      { label: "7", right: true, reply: "Yes! 6 + 1 = 7. That's adding, and we needed it before the party even started!" },
      { label: "8", right: false, reply: "Close! 6 friends and 1 me makes 7." },
    ] },
  { ask: "I have 5 cups. Is that enough for 7 of us?",
    choices: [
      { label: "👍 Yes", right: false, reply: "Let's check: 5 is less than 7, so 2 people would have no cup! 7 − 5 = 2 more cups needed." },
      { label: "👎 No", right: true, reply: "Right! 7 − 5 = 2, so we need 2 more cups. Taking away helps too!" },
    ] },
  { say: "Each of us eats 2 slices of pizza. 7 people × 2 slices = 14 slices. Multiplying saves us counting one by one!", pic: "🧒 × 7   →   🍕 × 14" },
  { ask: "One pizza has 8 slices. Is one pizza enough for 14 slices?",
    choices: [
      { label: "🍕 Yes, one is enough", right: false, reply: "One pizza is only 8 slices, and we need 14. That's 6 short! 2 pizzas make 16 slices: enough, with 2 spare." },
      { label: "🍕🍕 No, we need 2 pizzas", right: true, reply: "Yes! 2 pizzas make 16 slices: enough for everyone, with 2 spare." },
    ] },
  { ask: "My budget (the most money I can spend) is 50 coins. 2 pizzas cost 8 coins each, and the cake I like costs 40 coins. Can I buy them all?",
    choices: [
      { label: "✅ Yes", right: false, reply: "Let's add it up: 2 × 8 = 16, and 16 + 40 = 56. That's 6 more than 50! We'd have to choose a cheaper cake." },
      { label: "❌ No, it's too much", right: true, reply: "Exactly! 2 × 8 = 16, and 16 + 40 = 56: 6 more than 50. We'd have to choose a cheaper cake." },
    ] },
  { say: "Adding, taking away, times and sharing: maths helps us plan real things! Learn them on this path, then comes your mission: plan your own party, without spending more than your budget.", pic: "➕ ➖ ✖️ ➗ = 🎉" },
];

// The child's money. `m` scales the prices so they look real in that money.
export const MONEY = [
  { id: "coins", sym: "🪙", name: "Coins", m: 1 },
  { id: "usd", sym: "$", name: "Dollars", m: 1 },
  { id: "eur", sym: "€", name: "Euros", m: 1 },
  { id: "gbp", sym: "£", name: "Pounds", m: 1 },
  { id: "inr", sym: "₹", name: "Rupees", m: 10 },
  { id: "jpy", sym: "¥", name: "Yen", m: 100 },
];
const EURO = ["de", "fr", "es", "it", "nl", "pt-PT", "fi", "el", "ie", "at", "be", "sk", "sl", "et", "lv", "lt", "hr", "mt"];
// A sensible first guess from the browser's language (the child can change it).
export function defaultMoney(lang = "") {
  const l = String(lang);
  if (/-IN$/i.test(l) || /^(hi|te|ta|kn|ml|mr|bn|gu|pa|or|as)\b/i.test(l)) return "inr";
  if (/^ja\b/i.test(l)) return "jpy";
  if (/-GB$/i.test(l)) return "gbp";
  if (/-US$/i.test(l)) return "usd";
  if (EURO.some(e => l.toLowerCase().startsWith(e.toLowerCase()))) return "eur";
  return "coins";
}
export const moneyOf = id => MONEY.find(x => x.id === id) ?? MONEY[0];
// "₹120", "$12" or "12 coins".
export const fmtMoney = (money, n) => (money.id === "coins" ? `${n} ${n === 1 ? "coin" : "coins"}` : `${money.sym}${n}`);

export const BUDGET = 50; // in base units (× money.m)
export const SLICES_EACH = 2, SLICES_PER_PIZZA = 8, CUPS_EACH = 2, CUPS_PER_BOTTLE = 4;
export const SWEETS = 30;

// Shop prices in base units. `kind`: food is worked out from the guests; one dessert is a must; extras are optional.
export const SHOP = [
  { id: "pizza", emoji: "🍕", name: "Pizza (8 slices)", price: 8, kind: "food" },
  { id: "juice", emoji: "🧃", name: "Juice (fills 4 cups)", price: 2, kind: "food" },
  { id: "cake", emoji: "🎂", name: "Birthday cake", price: 12, kind: "dessert" },
  { id: "cupcakes", emoji: "🧁", name: "Cupcakes (pack of 6)", price: 5, kind: "dessert" },
  { id: "balloons", emoji: "🎈", name: "Balloons (pack of 10)", price: 3, kind: "extra" },
  { id: "banner", emoji: "🎊", name: "Happy Birthday banner", price: 4, kind: "extra" },
  { id: "hats", emoji: "🥳", name: "Party hats (pack of 10)", price: 5, kind: "extra" },
  { id: "magic", emoji: "🪄", name: "Magic show", price: 25, kind: "extra" },
];

// The numbers for a party with `people` people (including the child).
export function partyNeeds(people) {
  const slices = people * SLICES_EACH, cups = people * CUPS_EACH;
  return { slices, pizzas: Math.ceil(slices / SLICES_PER_PIZZA), cups, bottles: Math.ceil(cups / CUPS_PER_BOTTLE), cupcakePacks: Math.ceil(people / 6) };
}

// The shopping list as lines { id, emoji, name, qty, price, total }, prices already in the child's money.
export function basket(people, dessert, extras, money) {
  const n = partyNeeds(people), m = money.m;
  const item = id => SHOP.find(s => s.id === id);
  const line = (id, qty) => { const s = item(id); return { id, emoji: s.emoji, name: s.name, qty, price: s.price * m, total: qty * s.price * m }; };
  const lines = [line("pizza", n.pizzas), line("juice", n.bottles)];
  if (dessert === "cake") lines.push(line("cake", 1));
  if (dessert === "cupcakes") lines.push(line("cupcakes", n.cupcakePacks));
  for (const id of SHOP.filter(s => s.kind === "extra").map(s => s.id)) if (extras.includes(id)) lines.push(line(id, 1));
  return lines;
}
export const totalOf = lines => lines.reduce((s, l) => s + l.total, 0);

// Choices for "how many pizzas/bottles?": the right answer and the two usual mistakes (rounding down, one too many).
export function roundUpChoices(need, per) {
  const right = Math.ceil(need / per);
  const opts = new Set([Math.floor(need / per), right, right + 1].filter(x => x >= 1));
  if (opts.size < 3) opts.add(right > 1 ? right - 1 : right + 2); // exact fits: still three choices
  return { options: [...opts].sort((a, b) => a - b), answer: right };
}

// "Go deeper" (Class 5 and up, and grown-ups): cost per person and the share of the budget spent.
export function partyDeeper(total, people, money) {
  const each = Math.round((total / people) * 100) / 100;
  const pct = Math.round((total / (BUDGET * money.m)) * 100);
  return { each, pct };
}

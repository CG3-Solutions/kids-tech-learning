// Turns on-screen text into something natural to say aloud:
// drops emoji and decorative symbols, and says maths symbols as words.
const EMOJI = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u{1F3FB}-\u{1F3FF}︎️‍⃣]/gu;
const DECOR = /[★☆✓✔✗✘•·▶◀►◄→←↔↑↓⬆⬇➡⬅↰↱✨✳❓❔❗‼⏱⏳⌚☐☑🅰-🆎]/gu;
const SUP = { "²": " squared", "³": " cubed", "⁴": " to the power 4", "⁵": " to the power 5", "⁶": " to the power 6" };

export function speechText(text) {
  if (!text) return "";
  let s = String(text);
  s = s.replace(/₹\s?([\d,]+(?:\.\d+)?)/g, "$1 rupees");
  s = s.replace(/√\s?(\d+)/g, "square root of $1").replace(/∛\s?(\d+)/g, "cube root of $1");
  s = s.replace(/([0-9a-z)])\s*([²³⁴⁵⁶])/gi, (_, a, p) => a + SUP[p]);
  s = s.replace(/(\d)\s*\/\s*(\d)/g, "$1 over $2");
  s = s.replace(/(\d|\)|x)\s*×\s*/g, "$1 times ").replace(/\s*÷\s*/g, " divided by ");
  s = s.replace(/(\S)\s+[−-]\s+(?=[\d(x])/g, "$1 minus ");      // 9 − 4  →  9 minus 4
  s = s.replace(/(^|[\s(=])[−-](?=\d)/g, "$1minus ");             // −5  →  minus 5
  s = s.replace(/\s*\+\s*/g, " plus ");
  s = s.replace(/\s*=\s*\?/g, " equals what?").replace(/\s*=\s*/g, " equals ");
  s = s.replace(/\s*>\s*(?=\d)/g, " is more than ").replace(/\s*<\s*(?=\d)/g, " is less than ");
  s = s.replace(/_{2,}|☐/g, " blank ");
  s = s.replace(/(^|\s)[<>](?=\s|$)/g, " ");                     // stray > or < not comparing numbers
  // Anything left over (symbols between words, e.g. "length × width") is said as a word.
  s = s.replace(/×/g, " times ").replace(/÷/g, " divided by ").replace(/=/g, " equals ").replace(/√/g, " square root of ").replace(/₹/g, " rupees ");
  s = s.replace(/\bx equals what\?/g, "x equals what?");
  s = s.replace(EMOJI, " ").replace(DECOR, " ");
  s = s.replace(/[“”"]/g, "").replace(/\s+([.,!?])/g, "$1").replace(/\s{2,}/g, " ").trim();
  return /[\p{L}\p{N}]/u.test(s) ? s : "";
}

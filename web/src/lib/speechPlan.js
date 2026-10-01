// Turns on-screen text into a reading plan that a child can follow:
//   sentences, each a list of parts: { t, stress } (stress = say it slower and a little stronger).
// Used by the device voice now, and by the neural voice (as SSML) later.
//   • Short acronyms are spelled out ("CPU" → "C P U") or said as words ("RAM" → "ram").
//   • Words written in CAPITALS in the lessons ("switch ON", "BOTH", "EXACTLY") are stressed.
//   • The new word after "is called …" / "means …" is stressed: "A mistake is called a *bug*."
import { speechText } from "./speechText.js";

// How to say acronyms. Anything here is NOT treated as a stressed word.
export const SAY = {
  CPU: "C P U", CPUs: "C P Us", GPU: "G P U", GPUs: "G P Us", PSU: "P S U", OS: "O S", SSD: "S S D", SSDs: "S S Ds", HDD: "H D D", HDDs: "H D Ds",
  TV: "T V", TVs: "T Vs", ATM: "ay T M", ATMs: "ay T Ms", GPS: "G P S", IP: "I P", DNS: "D N S", HTTP: "H T T P", HTTPS: "H T T P S", TCP: "T C P",
  USB: "U S B", ALU: "ay L U", OTP: "O T P", LED: "L E D", LEDs: "L E Ds", AC: "ay C", PC: "P C", UI: "U I", GUI: "G U I", AI: "ay I", QR: "Q R",
  RGB: "R G B", PDF: "P D F", PNG: "P N G", MP3: "M P 3", UEFI: "U E F I", DPDP: "D P D P", IPOS: "I P O S", UPS: "U P S", CD: "C D", CDs: "C Ds",
  SoC: "S O C", ID: "I D", OK: "okay", US: "U S", ROM: "rom", RAM: "ram", LAN: "lan", WAN: "wan", PIN: "pin", ZIP: "zip", QWERTY: "qwerty",
  JPG: "jay peg", JPEG: "jay peg", ASCII: "askee", BIOS: "bye-oss", XOR: "ex-or", NAND: "nand", NOR: "nor", POST: "post",
  KB: "kilobytes", MB: "megabytes", GB: "gigabytes", TB: "terabytes", GHz: "gigahertz", MHz: "megahertz", Hz: "hertz", "Wi-Fi": "wi-fi",
};
// Tokens the device voice should read letter by letter (for SSML: <say-as interpret-as="characters">).
export const SPELL = new Set(Object.entries(SAY).filter(([, v]) => /^((ay|[A-Z0-9]) )+[A-Z0-9]s?$/.test(v)).map(([k]) => k));

const CAPS = /^[A-Z]{2,}$/;
const CALLED = /\b(?:is called|are called|called|means)\s+(?:an?\s+|the\s+)?([^.,!?;:()]+)/gi;

export function sentencesOf(text) {
  return text.split(/(?<=[.!?…])\s+(?=["“(]?[A-Z0-9])/).map(s => s.trim()).filter(Boolean);
}

// One sentence → parts. Stressed parts are single words or a short new term.
export function partsOf(sentence) {
  // Mark the new term after "called" / "means" (up to 3 words).
  const marked = new Set();
  for (const m of sentence.matchAll(CALLED)) {
    const words = m[1].trim().split(/\s+/);
    if (words.length <= 3) { const start = m.index + m[0].length - m[1].length; marked.add(`${start}:${start + m[1].trim().length}`); }
  }
  const parts = [];
  const push = (t, stress) => {
    if (!t) return;
    const last = parts[parts.length - 1];
    if (last && last.stress === stress && !stress) last.t += t; else parts.push({ t, stress });
  };
  // Walk the sentence word by word, keeping spaces and punctuation with the plain text.
  const re = /[A-Za-z0-9][A-Za-z0-9'’-]*/g;
  let at = 0, m;
  const ranges = [...marked].map(r => r.split(":").map(Number));
  while ((m = re.exec(sentence))) {
    const [w, i] = [m[0], m.index];
    const inTerm = ranges.find(([a, b]) => i >= a && i < b);
    if (inTerm) {
      push(sentence.slice(at, inTerm[0]), false);
      push(sayWords(sentence.slice(inTerm[0], inTerm[1])), true);
      at = inTerm[1]; re.lastIndex = inTerm[1];
      continue;
    }
    push(sentence.slice(at, i), false);
    if (SAY[w]) push(SAY[w], false);
    else if (CAPS.test(w)) push(w.toLowerCase(), true);
    else push(w, false);
    at = i + w.length;
  }
  push(sentence.slice(at), false);
  // Punctuation on its own ("." after a stressed word) joins the part before it, so it's never read out.
  const out = [];
  for (const p of parts.map(p => ({ ...p, t: p.stress ? p.t.trim() : p.t })).filter(p => p.t.trim())) {
    if (!/[\p{L}\p{N}]/u.test(p.t) && out.length) out[out.length - 1] = { ...out[out.length - 1], t: out[out.length - 1].t + p.t.trimEnd() };
    else out.push(p);
  }
  return out;
}
const sayWords = s => s.replace(/[A-Za-z0-9][A-Za-z0-9'’-]*/g, w => SAY[w] ?? (CAPS.test(w) ? w.toLowerCase() : w));

export function speechPlan(raw) {
  const text = speechText(raw);
  return text ? sentencesOf(text).map(partsOf) : [];
}
// The plan as plain text (what a voice without stress support would say).
export const planText = plan => plan.map(s => s.map(p => p.t).join(" ").replace(/\s+/g, " ").replace(/\s+([.,!?;:])/g, "$1").trim()).join(" ");

// Builds docs/12-circuit-lab-projects.md from the project data, so the document and the app can
// never disagree. Run `npm run docs:lab` after changing a project; a test checks it's up to date.
import { PROJECTS, UNITS } from "./projects.js";
import { PARTS, CONCEPTS } from "./parts.js";
import { parseParts, parseCheck } from "./netlist.js";

const LEVEL = { explorer: "🌱 Explorer", builder: "🔧 Builder", inventor: "💡 Inventor", engineer: "🚀 Engineer" };
const cell = s => String(s).replace(/\|/g, "\\|");

function partsLine(p) {
  if (!p.circuit) return "Your choice";
  const count = {};
  for (const x of parseParts(p.circuit)) {
    const name = x.type === "resistor" ? `${x.ohms >= 1000 ? `${x.ohms / 1000} kΩ` : `${x.ohms} Ω`} resistor` : x.type === "led" ? `${x.colour} LED` : PARTS[x.type].name.toLowerCase();
    count[name] = (count[name] ?? 0) + 1;
  }
  return Object.entries(count).map(([n, k]) => (k > 1 ? `${k} × ${n}` : n)).join(", ");
}
function checksLine(p) {
  if (p.open) return "Any input that changes an output";
  return p.checks.map(c => { const { when, expect } = parseCheck(c); const w = Object.entries(when).map(([k, v]) => `${k} ${v}`).join(", "); return `${w || "always"} → ${Object.entries(expect).map(([k, v]) => `${k} ${v}`).join(", ")}`; }).join("; ");
}

export function projectsMarkdown() {
  const out = [];
  out.push("# Circuit Lab: the 100 projects");
  out.push("");
  out.push("_Generated from `web/src/content/lab/` by `npm run docs:lab`. Do not edit by hand._");
  out.push("");
  out.push("All projects are original. Each one has a big question, a reference circuit, behaviour checks (any build that passes them is right), a prediction, an explanation, a real-world link and a \"try this\". The full text of each is in the data files; this list is the overview. Part names are in `docs/11-circuit-lab-design.md`.");
  out.push("");
  out.push("| Unit | Projects | Level | Big question |");
  out.push("|---|---|---|---|");
  for (const u of UNITS) out.push(`| ${u.emoji} ${u.n}. ${u.title} | ${PROJECTS.filter(p => p.unit === u.n).length} | ${LEVEL[u.level]} | ${u.q} |`);
  out.push(`| **Total** | **${PROJECTS.length}** | | |`);
  for (const u of UNITS) {
    out.push("");
    out.push(`## ${u.emoji} Unit ${u.n} · ${u.title}`);
    out.push(`_${u.q}_`);
    out.push("");
    out.push("| # | Project | Level | Big question | Parts | Checks | Ideas |");
    out.push("|---|---|---|---|---|---|---|");
    for (const p of PROJECTS.filter(x => x.unit === u.n)) {
      const title = `${p.emoji} **${p.title}**${p.safety ? " ⚠️" : ""}${p.game ? " 🎮" : ""}${p.start ? " 🔧" : ""}`;
      out.push(`| ${p.id.replace("lab-", "")} | ${cell(title)} | ${LEVEL[p.level]} | ${cell(p.brief ?? p.q)} | ${cell(partsLine(p))} | ${cell(checksLine(p))} | ${cell(p.concepts.map(c => CONCEPTS[c]).join(", "))} |`);
    }
  }
  out.push("");
  out.push("⚠️ = shows a safety lesson (a short circuit or an unprotected LED) that is safe in the lab and must never be tried with real parts. 🎮 = a game. 🔧 = fix-it: the child starts from a broken circuit and repairs it.");
  out.push("");
  return out.join("\n");
}

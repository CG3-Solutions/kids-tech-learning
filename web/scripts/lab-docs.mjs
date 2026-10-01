// Writes docs/12-circuit-lab-projects.md from the Circuit Lab data.
import { writeFileSync } from "node:fs";
import { projectsMarkdown } from "../src/content/lab/docs.js";
const out = new URL("../../docs/12-circuit-lab-projects.md", import.meta.url);
writeFileSync(out, projectsMarkdown());
console.log("Wrote", out.pathname);

// Decides which progress changes are worth an email to the parent:
// a newly earned badge, or a subject finished completely.
import { badgeState, moduleStats } from "./progress.js";

const when = () => new Date().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function findMilestones(before, after, published, child) {
  const out = [];
  const had = new Set(badgeState(before, published.modules).filter(b => b.earned).map(b => b.id));
  for (const b of badgeState(after, published.modules)) {
    if (b.earned && !had.has(b.id)) {
      out.push({
        title: `${b.emoji} ${child.name} earned the “${b.name}” badge`,
        body: `${child.name} earned the ${b.name} badge in Spark Lab (${b.how.toLowerCase()}) on ${when()}.`,
      });
    }
  }
  for (const m of published.modules.filter(x => !x.coming_soon)) {
    const was = moduleStats(m, published.cards, before), now = moduleStats(m, published.cards, after);
    if (now.total > 0 && now.done === now.total && was.done < was.total) {
      out.push({
        title: `🏆 ${child.name} finished ${m.title}`,
        body: `${child.name} completed every lesson and activity in ${m.title} on ${when()}. Great time to celebrate together!`,
      });
    }
  }
  return out;
}

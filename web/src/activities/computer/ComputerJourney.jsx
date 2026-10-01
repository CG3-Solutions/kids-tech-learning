import Journey from "../../components/journey/Journey.jsx";
import { ChipFace } from "../../components/journey/Guide.jsx";
import ConceptLesson from "../../components/concept/ConceptLesson.jsx";
import { COMPUTER_JOURNEY, COMPUTER_PARTS } from "../../content/computer.js";
import { useApp } from "../../lib/AppContext.jsx";

// Keeps each concept's check results (for parents now, and for spaced review later):
// { "comp-step-3": { best: 3, last: 2, tries: 2, at: "2026-10-01T…" } }
function useConceptRecord() {
  const { childData, setChildState } = useApp();
  return (id, score, total) => {
    const all = childData.state?.concepts ?? {};
    const prev = all[id] ?? { best: 0, tries: 0 };
    setChildState("concepts", { ...all, [id]: { best: Math.max(prev.best, score), last: score, total, tries: prev.tries + 1, at: new Date().toISOString() } });
  };
}

// One component per step, made once (making them during render would restart the lesson on every update).
const VIEWS = Object.fromEntries(COMPUTER_JOURNEY.map(s => {
  const View = ({ onComplete }) => {
    const record = useConceptRecord();
    return <ConceptLesson spec={s} Face={ChipFace} onComplete={onComplete} onCheck={(score, total) => record(s.id, score, total)} />;
  };
  View.displayName = `Concept(${s.id})`;
  return [s.id, View];
}));

// "Inside a Computer": Chip's learning path, one concept at a time.
export default function ComputerJourney({ done, grade, onStepDone }) {
  return <Journey title="Chip's computer path" intro="How computers work, one step at a time. Pass each check to open the next step." Face={ChipFace}
    steps={COMPUTER_JOURNEY} parts={COMPUTER_PARTS} views={VIEWS} done={done} grade={grade} onStepDone={onStepDone} />;
}

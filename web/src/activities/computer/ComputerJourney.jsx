import { useState } from "react";
import Journey from "../../components/journey/Journey.jsx";
import { ChipFace } from "../../components/journey/Guide.jsx";
import ConceptLesson from "../../components/concept/ConceptLesson.jsx";
import { COMPUTER_JOURNEY, COMPUTER_PARTS } from "../../content/computer.js";
import { depthFor } from "../../content/computerDeep.js";
import { useApp } from "../../lib/AppContext.jsx";
import { ReviewBanner, ReviewSession, useReviewStore } from "./Review.jsx";

// Keeps each concept's check results (for parents and spaced review), with the best
// score at each depth: { "comp-step-3": { best: 3, last: 2, tries: 2, depth: "mid", byDepth: { base: 3, mid: 2 }, at: "…" } }
function useConceptRecord() {
  const { setChildState } = useApp();
  return (id, score, total, depth = "base") => setChildState("concepts", all => {
    const prev = all?.[id] ?? { best: 0, tries: 0, byDepth: {} };
    const byDepth = { ...(prev.byDepth ?? {}), [depth]: Math.max(prev.byDepth?.[depth] ?? 0, score) };
    return { ...(all ?? {}), [id]: { best: Math.max(prev.best, score), last: score, total, tries: prev.tries + 1, depth, byDepth, at: new Date().toISOString() } };
  });
}

// One component per step, made once (making them during render would restart the lesson on every update).
const VIEWS = Object.fromEntries(COMPUTER_JOURNEY.map(s => {
  const View = ({ onComplete }) => {
    const record = useConceptRecord();
    const { miss } = useReviewStore();
    const { activeChild } = useApp();
    return <ConceptLesson spec={s} Face={ChipFace} level={depthFor(activeChild)} onComplete={onComplete}
      onCheck={(score, total, depth) => record(s.id, score, total, depth)} onMiss={miss} />;
  };
  View.displayName = `Concept(${s.id})`;
  return [s.id, View];
}));

// "Inside a Computer": Chip's learning path, one concept at a time, with spaced review of missed questions.
export default function ComputerJourney({ done, grade, onStepDone }) {
  const [reviewing, setReviewing] = useState(false);
  if (reviewing) return <div className="panel"><ReviewSession onClose={() => setReviewing(false)} /></div>;
  return <Journey title="Chip's computer path" intro="How computers work, one step at a time. Pass each check to open the next step. Tap “Go deeper” in any step for the next level." Face={ChipFace}
    steps={COMPUTER_JOURNEY} parts={COMPUTER_PARTS} views={VIEWS} done={done} grade={grade} onStepDone={onStepDone}
    top={<ReviewBanner onStart={() => setReviewing(true)} />} />;
}

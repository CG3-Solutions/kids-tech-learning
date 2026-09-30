import Journey from "../journey/Journey.jsx";
import { PollyFace, OllieFace } from "../journey/Guide.jsx";
import Practice, { LearnCards } from "./Practice.jsx";
import { JOURNEYS } from "../../content/journeys.js";

const FACES = { alphabets: PollyFace, words: PollyFace, sentences: PollyFace, numbers: OllieFace, mathematics: OllieFace };
const TITLES = { alphabets: "Polly's alphabet adventure", words: "Polly's word adventure", sentences: "Polly's sentence adventure", numbers: "Ollie's number adventure", mathematics: "Ollie's maths adventure" };

// One component per step, made once. (Making them during render would give React a new
// component type every time the app updates, which restarts the step from question 1.)
const VIEWS = Object.fromEntries(Object.keys(FACES).map(act => [act, Object.fromEntries(JOURNEYS[act].steps.map(s => {
  const Face = FACES[act];
  const View = props => (s.kind === "learn" ? <LearnCards spec={s} Face={Face} {...props} /> : <Practice spec={s} Face={Face} {...props} />);
  View.displayName = `Step(${s.id})`;
  return [s.id, View];
}))]));

// A Language or Maths adventure: every step is a practice set (or learning cards) run by the shared engine.
export default function PracticeJourney({ activity, done, grade, onStepDone }) {
  const j = JOURNEYS[activity], Face = FACES[activity];
  const views = VIEWS[activity];
  return <Journey title={TITLES[activity]} intro={j.intro} Face={Face} steps={j.steps} parts={j.parts} views={views} done={done} grade={grade} onStepDone={onStepDone} />;
}
export const PRACTICE_ACTIVITIES = new Set(Object.keys(FACES));

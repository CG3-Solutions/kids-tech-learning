// Spaced review and Chip's quiz for the computer path (C3). Both run a list of mixed-type questions.
import { useMemo, useRef, useState } from "react";
import Guide, { ChipFace } from "../../components/journey/Guide.jsx";
import Question, { prepare } from "../../components/concept/Question.jsx";
import { COMPUTER_JOURNEY, conceptQuestion } from "../../content/computer.js";
import { depthFor } from "../../content/computerDeep.js";
import { useApp } from "../../lib/AppContext.jsx";
import { addMiss, dayOf, dueKeys, isOpen, nextDue, reviewAnswer, addDays, MASTERED } from "../../lib/review.js";
import { buildQuiz } from "../../lib/conceptQuiz.js";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

const STEP = Object.fromEntries(COMPUTER_JOURNEY.map(s => [s.id, s]));
export const REVIEW_SIZE = 8;

// The review questions waiting today (only ones that still exist in the content).
export function dueQuestions(review, today = dayOf()) {
  return dueKeys(review, today).map(conceptQuestion).filter(Boolean).slice(0, REVIEW_SIZE);
}

// Saves misses (and review answers) to child_state "review".
export function useReviewStore() {
  const { childData, setChildState } = useApp();
  return {
    review: childData.state?.review ?? {},
    miss: key => setChildState("review", r => addMiss(r ?? {}, key)),
    answer: (key, ok) => setChildState("review", r => reviewAnswer(r ?? {}, key, ok)),
  };
}

// Asks each question in turn; shows which concept it's from.
function Run({ questions, onAnswer, onEnd }) {
  const qs = useMemo(() => questions.map(prepare), [questions]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [results, setResults] = useState([]);
  const top = useRef(null);
  const q = qs[i];
  const step = STEP[q.conceptId];
  const answer = ok => { setAnswered(true); const r = [...results, { q, ok }]; setResults(r); onAnswer(q, ok); };
  const next = () => {
    hush();
    if (i + 1 < qs.length) { setI(i + 1); setAnswered(false);
      const y = (top.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 90; // below the sticky top bar
      if (y < window.scrollY) window.scrollTo({ top: Math.max(0, y) });
      return;
    }
    onEnd(results);
  };
  return (
    <div className="stack" ref={top}>
      <div className="progress"><i style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <div className="row q-meta"><span className="eyebrow">Question {i + 1} of {qs.length}</span>{step && <span className="concept-chip">{step.emoji} {step.title}</span>}</div>
      <Question key={i} q={q} Face={ChipFace} onAnswer={answer} />
      {answered && <div><button className="btn primary" onClick={next}>{i + 1 < qs.length ? "Next question →" : "See how I did →"}</button></div>}
    </div>
  );
}

const when = day => {
  const today = dayOf();
  if (!day || day <= today) return "today";
  if (day === addDays(today, 1)) return "tomorrow";
  return new Date(`${day}T12:00`).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "short" });
};

// The banner on Chip's path: start a review, or say when the next one is.
export function ReviewBanner({ onStart }) {
  const { review } = useReviewStore();
  const due = dueQuestions(review);
  const open = Object.values(review).filter(isOpen).length;
  if (due.length) {
    return (
      <div className="review-banner due">
        <span className="em" aria-hidden="true">🔁</span>
        <div><b>Review time!</b><p>Chip saved {due.length} question{due.length > 1 ? "s" : ""} you found tricky. Let's see if you remember now.</p></div>
        <button className="btn primary" onClick={onStart}>Start review</button>
      </div>
    );
  }
  if (!open) return null;
  return (
    <div className="review-banner">
      <span className="em" aria-hidden="true">🔁</span>
      <div><b>{open} question{open > 1 ? "s" : ""} saved for review</b><p className="muted">The next review is {when(nextDue(review))}.</p></div>
    </div>
  );
}

// Today's review: right answers come back later (3, then 7 days), wrong ones tomorrow.
export function ReviewSession({ onClose }) {
  const store = useReviewStore();
  const [questions] = useState(() => dueQuestions(store.review));
  const [end, setEnd] = useState(null);
  const [before] = useState(store.review);
  if (!questions.length) return <div className="stack"><p className="lead">Nothing to review right now. 🎉</p><div><button className="btn" onClick={onClose}>← Back to the path</button></div></div>;
  if (end) {
    const right = end.filter(r => r.ok).length;
    const mastered = end.filter(r => r.ok && (before[r.q.key]?.box ?? 0) + 1 >= MASTERED).length;
    return (
      <div className="stack">
        <Guide Face={ChipFace} mood={right >= end.length / 2 ? "cheer" : "happy"} say={`${right} out of ${end.length}.`}>{right} out of {end.length} remembered!</Guide>
        <ul className="review-sum">
          {mastered > 0 && <li>🏆 <b>{mastered}</b> mastered: {mastered > 1 ? "they won't" : "it won't"} come back.</li>}
          {right - mastered > 0 && <li>✅ <b>{right - mastered}</b> remembered: {right - mastered > 1 ? "they'll" : "it'll"} come back in a few days, to make sure.</li>}
          {end.length - right > 0 && <li>🔁 <b>{end.length - right}</b> to practise again tomorrow.</li>}
        </ul>
        <div><button className="btn primary big" onClick={onClose}>Back to the path</button></div>
      </div>
    );
  }
  return (
    <div className="stack">
      <div className="row"><button className="btn ghost" onClick={() => { hush(); onClose(); }}>← Path</button><h3 style={{ margin: 0 }}>🔁 Review time</h3></div>
      <Run questions={questions} onAnswer={(q, ok) => store.answer(q.key, ok)} onEnd={r => { if (r.every(x => x.ok)) sfx.tada(); setEnd(r); }} />
    </div>
  );
}

// Chip's quiz: 8 mixed questions from the steps the child has done, at their level.
export function ChipQuiz({ done, onFinish }) {
  const { activeChild } = useApp();
  const store = useReviewStore();
  const depth = depthFor(activeChild);
  const [round, setRound] = useState(0);
  const questions = useMemo(() => buildQuiz(COMPUTER_JOURNEY, { done, depth, review: store.review }), [round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [end, setEnd] = useState(null);
  const onAnswer = (q, ok) => {
    if (!ok) store.miss(q.key);
    else if (isOpen(store.review[q.key]) && store.review[q.key].due <= dayOf()) store.answer(q.key, true);
  };
  const finish = results => {
    setEnd(results);
    const right = results.filter(r => r.ok).length;
    onFinish(right, results.length);
    if (right === results.length) sfx.tada();
  };
  const learnedNone = !COMPUTER_JOURNEY.some(s => done.has(s.id));
  if (end) {
    const right = end.filter(r => r.ok).length;
    const missed = [...new Set(end.filter(r => !r.ok).map(r => r.q.conceptId))].map(id => STEP[id]);
    return (
      <div className="stack">
        <Guide Face={ChipFace} mood={right >= end.length * 0.75 ? "cheer" : "happy"} say={`You got ${right} out of ${end.length}.`}>
          {right === end.length ? `A perfect ${right} out of ${end.length}! 🏆` : `You got ${right} out of ${end.length}!`}
        </Guide>
        {missed.length > 0 && (
          <div className="practice-note">
            <b>To practise:</b> {missed.map(s => `${s.emoji} ${s.title}`).join(", ")}.
            <p className="muted">The questions you missed will come back for review tomorrow.</p>
          </div>
        )}
        <div><button className="btn primary big" onClick={() => { setEnd(null); setRound(r => r + 1); }}>Play again</button></div>
      </div>
    );
  }
  return (
    <div className="stack">
      <Guide Face={ChipFace} say="Chip's quiz! Questions from the steps you've learned.">
        <b>Chip's quiz!</b> {learnedNone ? "Questions from the first steps of the path." : "Questions from the steps you've learned."} Pictures, true or false, putting things in order and spotting bugs.
      </Guide>
      <Run key={round} questions={questions} onAnswer={onAnswer} onEnd={finish} />
    </div>
  );
}

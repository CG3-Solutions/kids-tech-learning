import { useEffect, useMemo, useState } from "react";

const shuffle = list => list.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);

export default function Quiz({ questions, onFinish, size = 8 }) {
  const [round, setRound] = useState(0);
  const order = useMemo(() => shuffle(questions).slice(0, size), [questions, size, round]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const [picked, setPicked] = useState(null);

  useEffect(() => { setI(0); setRight(0); setPicked(null); }, [order]);

  if (!questions.length) return <p className="lead">No quiz questions here yet.</p>;

  if (i >= order.length) {
    return (
      <div className="quiz">
        <h2 className="sec">You got {right} out of {order.length}!</h2>
        <p className="lead">{right === order.length ? "A perfect score. You are a real engineer!" : right >= order.length / 2 ? "Great work! Try again to beat your score." : "Good try! Read the cards and play again."}</p>
        <div><button className="btn primary big" onClick={() => setRound(r => r + 1)}>Play again</button></div>
      </div>
    );
  }

  const q = order[i];
  const choose = idx => {
    if (picked !== null) return;
    setPicked(idx);
    const ok = idx === q.answer;
    const score = right + (ok ? 1 : 0);
    if (ok) setRight(score);
    if (i === order.length - 1) onFinish(score, order.length);
  };

  return (
    <div className="quiz">
      <div className="progress"><i style={{ width: `${(i / order.length) * 100}%` }} /></div>
      <div className="eyebrow">Question {i + 1} of {order.length}</div>
      <h3>{q.question}</h3>
      <div className="opts">
        {q.options.map((o, idx) => (
          <button key={idx} className={`opt${picked !== null && idx === q.answer ? " right" : ""}${picked === idx && idx !== q.answer ? " wrong" : ""}`}
            disabled={picked !== null} onClick={() => choose(idx)}>
            <span className="e" aria-hidden="true">{o.emoji}</span>{o.label}
          </button>
        ))}
      </div>
      {picked !== null && (
        <>
          <div className="fb" role="status"><b>{picked === q.answer ? "Yes! ★" : "Not quite."}</b> {q.explanation}</div>
          <div><button className="btn primary" autoFocus onClick={() => { setI(i + 1); setPicked(null); }}>{i + 1 < order.length ? "Next question" : "See my score"}</button></div>
        </>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import Symbol from "./Symbol.jsx";
import { speak, hush } from "../lib/speech.js";

// `glossary`: a reference card with no "I learned this" star (the subject's path gives the stars).
export default function CardDetail({ card, levelName, color, learned, onLearned, onClose, prev, next, onGo, glossary = false }) {
  const d = card.data;
  const [showAnswer, setShowAnswer] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => { setShowAnswer(false); closeRef.current?.focus(); }, [card.id]);
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && next) onGo(next.id);
      if (e.key === "ArrowLeft" && prev) onGo(prev.id);
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); hush(); };
  }, [next, prev, onClose, onGo]);

  const reveal = () => { setShowAnswer(true); speak(d.a); if (!learned && !glossary) onLearned(); };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <article className="card" role="dialog" aria-modal="true" aria-labelledby="cardTitle" style={{ "--c": color }}>
        <div className="card-hd">
          <span className="pic" aria-hidden="true">{d.e}</span>
          <div><div className="eyebrow">{levelName}</div><h2 id="cardTitle">{d.n}</h2></div>
          <div className="acts">
            <button className="btn primary" onClick={() => speak(`${d.n}. ${d.what} It's like ${/^[A-Z][a-z]/.test(d.like ?? "") ? d.like[0].toLowerCase() + d.like.slice(1) : d.like} Think! ${d.q}`, { force: true })}>Read to me</button>
            <button className="btn" ref={closeRef} onClick={onClose}>Close</button>
          </div>
        </div>
        <div className="card-bd">
          <div className="blk"><h4>What is it?</h4><p>{d.what}</p></div>
          {d.like && <div className="blk"><h4>It’s like…</h4><p className="like">{d.like}</p></div>}
          {d.home?.length > 0 && (
            <div className="blk"><h4>Find it around you</h4><ul className="places">{d.home.map(h => <li key={h}>{h}</li>)}</ul></div>
          )}
          {d.sym && (
            <div className="blk"><h4>Engineers draw it like this</h4><div className="sym"><Symbol name={d.sym} /><p>{d.symNote}</p></div></div>
          )}
          {d.q && (
            <div className="blk think"><h4 style={{ margin: 0 }}>Think!</h4><div className="q">{d.q}</div>
              {showAnswer ? <div className="a">{d.a}</div> : <button className="btn" onClick={reveal}>Show answer</button>}
            </div>
          )}
          {d.tr && <div className="blk"><h4>Try it</h4><div className="try">{d.tr}{d.adult && <><br /><span className="adult">Do this with an adult.</span></>}</div></div>}
        </div>
        <div className="card-ft">
          {prev ? <button className="btn ghost" onClick={() => onGo(prev.id)}>← {prev.data.n}</button> : <span />}
          {glossary ? <span className="muted">📚 Glossary</span> : learned ? <span className="learned">★ Learned</span>
            : <button className="btn primary" onClick={onLearned}>I learned this! ★</button>}
          {next ? <button className="btn ghost" onClick={() => onGo(next.id)}>{next.data.n} →</button> : <span />}
        </div>
      </article>
    </div>
  );
}

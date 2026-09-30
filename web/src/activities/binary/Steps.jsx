import { useMemo, useState } from "react";
import Bit, { BitFace } from "./Bit.jsx";
import Lamp, { pattern } from "./Lamp.jsx";
import { sfx } from "../../lib/sfx.js";

const rand = n => Math.floor(Math.random() * n);
const apples = n => "🍎".repeat(n);

// Small row of read-only lamps, used to show patterns kids have found.
export function MiniLamps({ bits }) {
  return <span className="mini-lamps" aria-label={pattern(bits)}>{bits.map((b, i) => <i key={i} className={b ? "on" : ""} />)}</span>;
}

function Choices({ options, onPick, disabled }) {
  return (
    <div className="choices">
      {options.map(o => <button key={o.value} className="choice" disabled={disabled} onClick={() => onPick(o.value)}>{o.label}</button>)}
    </div>
  );
}

// Asks one multiple-choice question; wrong answers get another try.
function useAnswer(onRight) {
  const [feedback, setFeedback] = useState(null);
  const check = (ok, rightMsg = "Yes! ⭐", wrongMsg = "Not quite. Try again!") => {
    if (ok) { sfx.ding(); setFeedback({ ok, msg: rightMsg }); onRight?.(); } else { sfx.oops(); setFeedback({ ok, msg: wrongMsg }); }
  };
  return [feedback, check, () => setFeedback(null)];
}

// ───────────── Step 1: Bit's lamp ─────────────
export function Step1({ onComplete }) {
  const [on, setOn] = useState(false);
  const [flips, setFlips] = useState(0);
  const [round, setRound] = useState(0);
  const [bitLamp, setBitLamp] = useState(() => Math.random() < 0.5);
  const [feedback, check, clear] = useAnswer();
  const quiz = flips >= 3;

  if (!quiz) {
    return (
      <div className="step-body">
        <Bit mood={on ? "happy" : "wow"} lamp={on}>{flips === 0 ? "Hi! I'm Bit. I'm a robot, and I only know two words: ON and OFF. Tap my lamp!" : on ? "ON! The lamp is shining." : "OFF! The lamp is dark."}</Bit>
        <div className={`room${on ? " lit" : ""}`}><Lamp size="xl" on={on} onToggle={() => { setOn(!on); setFlips(f => f + 1); }} /></div>
        <p className="muted center">Tap the lamp {Math.max(0, 3 - flips)} more {3 - flips === 1 ? "time" : "times"}.</p>
      </div>
    );
  }
  const answer = v => {
    const ok = v === bitLamp;
    check(ok, "Yes! You can read my lamp! ⭐");
    if (ok) setTimeout(() => {
      if (round >= 2) onComplete(); else { setRound(r => r + 1); setBitLamp(Math.random() < 0.5); clear(); }
    }, 900);
  };
  return (
    <div className="step-body">
      <Bit mood="happy" lamp={bitLamp}>Now look at my lamp. Is it ON or OFF? ({round + 1} of 3)</Bit>
      <div className="row center-row"><Lamp size="xl" on={bitLamp} readOnly /></div>
      <Choices options={[{ value: true, label: "💡 ON" }, { value: false, label: "⚫ OFF" }]} onPick={answer} disabled={feedback?.ok} />
      {feedback && <p className={`fb-line ${feedback.ok ? "good" : "bad"}`}>{feedback.msg}</p>}
    </div>
  );
}

// ───────────── Step 2: Secret signal ─────────────
const SIGNAL = { true: { e: "🍛", t: "Dinner time!" }, false: { e: "⚽", t: "Keep playing!" } };
export function Step2({ onComplete }) {
  const [round, setRound] = useState(0); // 0-3 read, 4-5 send
  const [bitLamp, setBitLamp] = useState(true);
  const [mine, setMine] = useState(false);
  const [target, setTarget] = useState(true);
  const [feedback, check, clear] = useAnswer();
  const next = () => setTimeout(() => {
    if (round >= 5) return onComplete();
    const r = round + 1; setRound(r); clear();
    if (r < 4) setBitLamp(Math.random() < 0.5); else { setTarget(r === 4 ? false : true); setMine(r === 4); }
  }, 900);

  const legend = (
    <div className="legend">
      <div><MiniLamps bits={[1]} /> means {SIGNAL.true.e} {SIGNAL.true.t}</div>
      <div><MiniLamps bits={[0]} /> means {SIGNAL.false.e} {SIGNAL.false.t}</div>
    </div>
  );

  if (round < 4) {
    return (
      <div className="step-body">
        <Bit mood="happy" lamp={bitLamp}>{round === 0 ? "My lamp can send a secret message! ON means dinner time. OFF means keep playing. What am I saying?" : "What is my lamp saying now?"}</Bit>
        {legend}
        <div className="row center-row"><Lamp size="xl" on={bitLamp} readOnly /></div>
        <Choices options={[{ value: true, label: "🍛 Dinner time" }, { value: false, label: "⚽ Keep playing" }]}
          onPick={v => { const ok = v === bitLamp; check(ok, "Yes! You read my secret message! ⭐"); if (ok) next(); }} disabled={feedback?.ok} />
        {feedback && <p className={`fb-line ${feedback.ok ? "good" : "bad"}`}>{feedback.msg}</p>}
        <p className="muted center">Message {round + 1} of 4</p>
      </div>
    );
  }
  return (
    <div className="step-body">
      <Bit mood="wow" lamp={mine}>{`Your turn! Tell me: "${SIGNAL[target].t}" Set the lamp, then press Send.`}</Bit>
      {legend}
      <div className="row center-row"><Lamp size="xl" on={mine} onToggle={() => { setMine(!mine); clear(); }} /></div>
      <div className="row center-row"><button className="btn primary big" disabled={feedback?.ok} onClick={() => { const ok = mine === target; check(ok, `Bit got it: ${SIGNAL[target].e} ${SIGNAL[target].t}`, "Hmm, that lamp means the other message. Try again!"); if (ok) next(); }}>📡 Send</button></div>
      {feedback && <p className={`fb-line ${feedback.ok ? "good" : "bad"}`}>{feedback.msg}</p>}
    </div>
  );
}

// ───────────── Steps 3 & 4: find every pattern ─────────────
const MESSAGES = ["😴 Sleep", "⚽ Play", "🍛 Eat", "🛁 Bath", "📚 Read", "🎨 Draw", "🎵 Sing", "🚲 Ride"];
function PatternHunt({ count, intro, onAllFound }) {
  const [bits, setBits] = useState(Array(count).fill(false));
  const [found, setFound] = useState([]);
  const total = 2 ** count;
  const toggle = i => {
    const nb = bits.map((b, j) => (j === i ? !b : b));
    setBits(nb);
    const p = pattern(nb);
    if (!found.includes(p)) {
      const nf = [...found, p];
      setFound(nf);
      setTimeout(() => (nf.length === total ? (sfx.tada(), onAllFound()) : sfx.ding()), 150);
    }
  };
  const lastNew = found[found.length - 1];
  const missingOff = found.length === total - 1 && !found.includes("0".repeat(count));
  const say = found.length === 0 ? intro
    : found.length === total ? `Wow! You found all ${total} patterns!`
    : pattern(bits) === lastNew ? `New pattern! It means ${MESSAGES[parseInt(lastNew, 2)]}. You found ${found.length} of ${total}.${missingOff ? " Hint: all lamps OFF is a pattern too!" : ""}`
    : `You already found that one. Try another! (${found.length} of ${total})${missingOff ? " Hint: all lamps OFF is a pattern too!" : ""}`;
  return (
    <div className="step-body">
      <Bit mood={found.length === total ? "cheer" : "happy"} lamp={bits.some(Boolean)}>{say}</Bit>
      <div className="row center-row lamps-row">{bits.map((b, i) => <Lamp key={i} size="lg" on={b} onToggle={() => toggle(i)} />)}</div>
      <div className="found">
        {Array.from({ length: total }, (_, i) => {
          const p = found[i];
          return (
            <div key={i} className={`slot${p ? " filled" : ""}`}>
              {p ? <><MiniLamps bits={[...p].map(c => c === "1")} /><span>{MESSAGES[parseInt(p, 2)]}</span></> : <span className="muted">?</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Step3({ onComplete }) {
  return <PatternHunt count={2} onAllFound={onComplete} intro="Now I have TWO lamps! Each pattern is a different message. Can you find every pattern?" />;
}

export function Step4({ grade, onComplete }) {
  const [phase, setPhase] = useState("hunt");
  const [feedback, check, clear] = useAnswer();
  const older = grade >= 5;
  if (phase === "hunt") return <PatternHunt count={3} onAllFound={() => setTimeout(() => setPhase("q1"), 1200)} intro="THREE lamps! How many patterns can you find now?" />;
  const q1 = phase === "q1";
  const rows = q1 ? [[1, 2], [2, 4], [3, 8], [4, "?"]] : [[1, 2], [2, 4], [3, 8], [4, 16], [5, "?"]];
  const opts = q1 ? [9, 12, 16] : [20, 25, 32];
  const right = q1 ? 16 : 32;
  return (
    <div className="step-body">
      <Bit mood="wow" lamp>{q1 ? "Look! Every time we add a lamp, the patterns DOUBLE. How many patterns would 4 lamps make?" : "You're a big thinker! How many patterns would 5 lamps make?"}</Bit>
      <table className="doubling">
        <thead><tr><th>Lamps</th><th>Patterns</th></tr></thead>
        <tbody>{rows.map(([l, p]) => <tr key={l}><td>{"💡".repeat(l)}</td><td>{p}</td></tr>)}</tbody>
      </table>
      <Choices options={opts.map(v => ({ value: v, label: String(v) }))} disabled={feedback?.ok}
        onPick={v => {
          const ok = v === right;
          check(ok, `Yes! ${right / 2} doubled is ${right}. ⭐`, "Hint: double the number above. What is it plus itself?");
          if (ok) setTimeout(() => { if (q1 && older) { setPhase("q2"); clear(); } else onComplete(); }, 1100);
        }} />
      {feedback && <p className={`fb-line ${feedback.ok ? "good" : "bad"}`}>{feedback.msg}</p>}
    </div>
  );
}

// ───────────── Step 5: Apple cards ─────────────
export function Step5({ onComplete }) {
  const VALUES = [4, 2, 1];
  const targets = useMemo(() => [5, 3, 6, 7, 1].map(n => n), []);
  const [round, setRound] = useState(0);
  const [on, setOn] = useState([false, false, false]);
  const [done, setDone] = useState(false);
  const target = targets[round];
  const total = VALUES.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
  const flip = i => {
    if (done) return;
    const n = on.map((x, j) => (j === i ? !x : x));
    on[i] ? sfx.off() : sfx.on();
    setOn(n);
    const t = VALUES.reduce((s, v, j) => s + (n[j] ? v : 0), 0);
    if (t === target) { setDone(true); setTimeout(sfx.ding, 150); }
  };
  const nextRound = () => {
    if (round >= targets.length - 1) return onComplete();
    setRound(round + 1); setOn([false, false, false]); setDone(false);
  };
  const bitsText = on.map(x => (x ? "1" : "0")).join("");
  return (
    <div className="step-body">
      <Bit mood={done ? "cheer" : "happy"} lamp={done}>
        {done ? `You made ${target} apples! I write that as ${bitsText.split("").join(" ")}. ON is 1, OFF is 0.`
          : round === 0 ? `Each lamp card holds apples. Turn cards ON to fill the basket. Can you make exactly ${target} apples?`
          : `Can you make ${target} apples?`}
      </Bit>
      <div className="basket-target"><span className="eyebrow">Bit wants</span><span className="apples">{apples(target)}</span></div>
      <div className="apple-cards">
        {VALUES.map((v, i) => (
          <button key={v} className={`apple-card${on[i] ? " on" : ""}`} onClick={() => flip(i)} aria-pressed={on[i]} aria-label={`${v} apples card, ${on[i] ? "on" : "off"}`}>
            <span className="apples">{apples(v)}</span>
            <MiniLamps bits={[on[i]]} />
            <b className="digit">{on[i] ? 1 : 0}</b>
          </button>
        ))}
      </div>
      <div className={`basket${done ? " full" : total > target ? " over" : ""}`}>
        <span className="eyebrow">Your basket</span>
        <span className="apples">{total ? apples(total) : "empty"}</span>
        {total > target && <small>Too many! Turn a card OFF.</small>}
      </div>
      {done && <div className="row center-row"><button className="btn primary big" onClick={nextRound}>{round >= targets.length - 1 ? "Finish ⭐" : "Next basket →"}</button></div>}
      <p className="muted center">Basket {round + 1} of {targets.length}</p>
    </div>
  );
}

// ───────────── Step 6: Counting machine ─────────────
export function Step6({ grade, onComplete }) {
  const count = grade >= 5 ? 4 : 3;
  const max = 2 ** count - 1;
  const [n, setN] = useState(0);
  const [reachedMax, setReachedMax] = useState(false);
  const [feedback, check] = useAnswer();
  const bits = Array.from({ length: count }, (_, i) => Boolean(n & (1 << (count - 1 - i))));
  const plus = () => {
    const next = n >= max ? 0 : n + 1;
    sfx.click(); setN(next);
    if (next === max) { setReachedMax(true); setTimeout(sfx.ding, 120); }
  };
  const lampNames = count === 3 ? ["Left lamp (4)", "Middle lamp (2)", "Right lamp (1)"] : ["1st lamp (8)", "2nd lamp (4)", "3rd lamp (2)", "Last lamp (1)"];
  return (
    <div className="step-body">
      <Bit mood={n === max ? "cheer" : "happy"} lamp={n > 0}>
        {n === 0 && !reachedMax ? "This is my counting machine! Press +1 and watch how my lamps count."
          : n === max ? `All lamps ON! That's ${max}, the biggest number ${count} lamps can make. Press +1 again to see what happens!`
          : n === 0 ? "Back to zero! All lamps turned OFF, like a car's distance meter rolling over."
          : `That's ${n}. Watch which lamps change!`}
      </Bit>
      <div className="row center-row lamps-row">{bits.map((b, i) => <Lamp key={i} size="lg" on={b} readOnly label={2 ** (count - 1 - i)} />)}</div>
      <div className="counter">
        <div><span className="eyebrow">Number</span><b className="total">{n}</b></div>
        <div><span className="eyebrow">Bit writes</span><b className="bits">{pattern(bits)}</b></div>
        <button className="btn primary big plus" onClick={plus}>+1</button>
      </div>
      {reachedMax && (
        <div className="stack" style={{ gap: 10 }}>
          <p className="q-line">Question: which lamp changes <b>every time</b> you press +1?</p>
          <Choices options={lampNames.map((l, i) => ({ value: i, label: l }))} disabled={feedback?.ok}
            onPick={v => { const ok = v === count - 1; check(ok, "Yes! The last lamp blinks ON, OFF, ON, OFF. It shows odd and even numbers! ⭐", "Press +1 a few more times and watch closely."); if (ok) setTimeout(onComplete, 1400); }} />
          {feedback && <p className={`fb-line ${feedback.ok ? "good" : "bad"}`}>{feedback.msg}</p>}
        </div>
      )}
    </div>
  );
}

// ───────────── Step 7: Big cards ─────────────
export function Step7({ grade, onComplete }) {
  const count = grade >= 6 ? 8 : 5;
  const VALUES = Array.from({ length: count }, (_, i) => 2 ** (count - 1 - i));
  const max = 2 ** count - 1;
  const goal = 5;
  const newTarget = prev => { let t; do { t = 1 + rand(max); } while (t === prev); return t; };
  const [on, setOn] = useState(Array(count).fill(false));
  const [target, setTarget] = useState(() => newTarget(0));
  const [wins, setWins] = useState(0);
  const total = VALUES.reduce((s, v, i) => s + (on[i] ? v : 0), 0);
  const hit = total === target;
  const flip = i => {
    const n = on.map((x, j) => (j === i ? !x : x));
    on[i] ? sfx.off() : sfx.on(); setOn(n);
    if (VALUES.reduce((s, v, j) => s + (n[j] ? v : 0), 0) === target) setTimeout(sfx.ding, 120);
  };
  const next = () => {
    const w = wins + 1; setWins(w);
    if (w >= goal) return onComplete();
    setTarget(newTarget(target)); setOn(Array(count).fill(false));
  };
  return (
    <div className="step-body">
      <Bit mood={hit ? "cheer" : "happy"} lamp={hit}>
        {hit ? `Brilliant! ${VALUES.filter((_, i) => on[i]).join(" + ")} = ${target}.`
          : wins === 0 ? `Now I have ${count} cards! Each card is double the one next to it. Can you make ${target}? Tip: start with the biggest card that fits.`
          : `Can you make ${target}?`}
      </Bit>
      <div className={`big-cards n${count}`}>
        {VALUES.map((v, i) => (
          <button key={v} className={`big-card${on[i] ? " on" : ""}`} onClick={() => flip(i)} aria-pressed={on[i]} aria-label={`${v} card, ${on[i] ? "on" : "off"}`}>
            {v <= 16 ? <><span className="dots">{Array.from({ length: v }, (_, k) => <i key={k} />)}</span><span className="val">{v}</span></> : <span className="bignum">{v}</span>}
            <b className="digit">{on[i] ? 1 : 0}</b>
          </button>
        ))}
      </div>
      <div className="counter">
        <div><span className="eyebrow">Make</span><b className="total">{target}</b></div>
        <div><span className="eyebrow">You have</span><b className={`total${total > target ? " over" : ""}`}>{total}</b></div>
        <div><span className="eyebrow">In binary</span><b className="bits">{pattern(on)}</b></div>
      </div>
      {hit && <div className="row center-row"><button className="btn primary big" onClick={next}>{wins + 1 >= goal ? "Finish ⭐" : "Next number →"}</button></div>}
      <p className="muted center">Number {Math.min(wins + 1, goal)} of {goal}</p>
    </div>
  );
}

// ───────────── Bonus: Pixel painter ─────────────
const HEART = ["01100110", "11111111", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000"];
export function PixelPainter({ onComplete }) {
  const [grid, setGrid] = useState(() => HEART.map(r => [...r].map(() => false)));
  const [solved, setSolved] = useState(false);
  const [free, setFree] = useState(false);
  const rowCode = r => r.map(c => (c ? "1" : "0")).join("");
  const matches = grid.map((r, i) => rowCode(r) === HEART[i]);
  const toggle = (r, c) => {
    sfx.click();
    const g = grid.map((row, i) => row.map((x, j) => (i === r && j === c ? !x : x)));
    setGrid(g);
    if (!free && !solved && g.every((row, i) => rowCode(row) === HEART[i])) { setSolved(true); sfx.tada(); onComplete(); }
  };
  return (
    <div className="step-body">
      <Bit mood={solved ? "cheer" : "happy"} lamp={solved}>
        {free ? "Free painting! Every row turns into 1s and 0s. That's how a computer stores your picture."
          : solved ? "You decoded my secret picture! Pictures on screens are made of tiny squares called pixels, and each one is stored as bits."
          : "Every picture is made of tiny squares. 1 means paint it, 0 means leave it white. Follow my code on each row to find the secret picture!"}
      </Bit>
      <div className="pixel-wrap">
        <div className="pixels">
          {grid.map((row, r) => (
            <div key={r} className="pixel-row">
              {row.map((on, c) => <button key={c} className={`px${on ? " on" : ""}`} onClick={() => toggle(r, c)} aria-label={`Row ${r + 1} square ${c + 1} ${on ? "painted" : "white"}`} />)}
              <code className={`rowcode${!free && matches[r] ? " ok" : ""}`}>{free ? rowCode(row) : HEART[r]}{!free && matches[r] ? " ✓" : ""}</code>
            </div>
          ))}
        </div>
      </div>
      {solved && !free && <div className="row center-row"><button className="btn big" onClick={() => { setFree(true); setGrid(HEART.map(r => [...r].map(() => false))); }}>🎨 Paint my own picture</button></div>}
    </div>
  );
}

// ───────────── Bonus: Secret message ─────────────
const SMALL_KEY = { 1: "A", 2: "C", 3: "D", 4: "G", 5: "O", 6: "T", 7: "S" };
const SMALL_WORDS = [["CAT", "🐱"], ["DOG", "🐶"], ["GOAT", "🐐"], ["COAT", "🧥"], ["DOTS", "🔴"]];
const BIG_WORDS = [["ROBOT", "🤖"], ["HELLO", "👋"], ["CODE", "💻"], ["BYTE", "🔢"]];
export function SecretMessage({ grade, onComplete }) {
  const big = grade >= 6;
  const bitsN = big ? 5 : 3;
  const key = big ? Object.fromEntries(Array.from({ length: 26 }, (_, i) => [i + 1, String.fromCharCode(65 + i)])) : SMALL_KEY;
  const codeOf = Object.fromEntries(Object.entries(key).map(([n, l]) => [l, Number(n)]));
  const words = big ? BIG_WORDS : SMALL_WORDS;
  const [w, setW] = useState(0);
  const [pos, setPos] = useState(0);
  const [solvedWords, setSolvedWords] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [word, emoji] = words[w % words.length];
  const letter = word[pos];
  const code = codeOf[letter];
  const bits = Array.from({ length: bitsN }, (_, i) => Boolean(code & (1 << (bitsN - 1 - i))));
  const wordDone = pos >= word.length;
  const pick = l => {
    if (l === letter) {
      sfx.ding(); setWrong(false);
      const p = pos + 1; setPos(p);
      if (p >= word.length) { const s = solvedWords + 1; setSolvedWords(s); if (s === 3) { sfx.tada(); onComplete(); } }
    } else { sfx.oops(); setWrong(true); }
  };
  return (
    <div className="step-body">
      <Bit mood={wordDone ? "cheer" : "happy"} lamp={!wordDone}>
        {wordDone ? `You decoded "${word}" ${emoji}! Computers store every letter as a number made of bits.`
          : pos === 0 && solvedWords === 0 ? "I'm sending you a secret word, one letter at a time. Use the key to find which letter my lamps mean!"
          : "What's the next letter?"}
      </Bit>
      <div className="secret-word">{[...word].map((l, i) => <span key={i} className={i < pos ? "got" : i === pos ? "cur" : ""}>{i < pos ? l : "?"}</span>)}</div>
      {!wordDone ? (
        <>
          <div className="row center-row lamps-row">{bits.map((b, i) => <Lamp key={i} size="md" on={b} readOnly label={2 ** (bitsN - 1 - i)} />)}</div>
          {wrong && <p className="fb-line bad">Look at the key again: find the letter with the same lamps.</p>}
          <div className={`key${big ? " big" : ""}`}>
            {Object.entries(key).map(([n, l]) => {
              const kb = Array.from({ length: bitsN }, (_, i) => Boolean(Number(n) & (1 << (bitsN - 1 - i))));
              return <button key={l} className="key-item" onClick={() => pick(l)}><b>{l}</b><MiniLamps bits={kb} /></button>;
            })}
          </div>
        </>
      ) : (
        <div className="row center-row">
          <span style={{ fontSize: "3rem" }}>{emoji}</span>
          {solvedWords < 3 && <button className="btn primary big" onClick={() => { setW(w + 1); setPos(0); }}>Next secret word →</button>}
        </div>
      )}
      <p className="muted center">Words decoded: {Math.min(solvedWords, 3)} of 3</p>
    </div>
  );
}

export { BitFace };

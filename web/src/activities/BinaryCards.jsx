import { useMemo, useState } from "react";

const VALUES = [16, 8, 4, 2, 1];
const GOAL = 5;

export default function BinaryCards({ wins = 0, onWin }) {
  const [on, setOn] = useState([false, false, false, false, false]);
  const [target, setTarget] = useState(() => 1 + Math.floor(Math.random() * 31));
  const total = useMemo(() => VALUES.reduce((s, v, i) => s + (on[i] ? v : 0), 0), [on]);
  const hit = total === target;

  const flip = i => setOn(o => o.map((x, j) => (j === i ? !x : x)));
  const nextTarget = () => {
    onWin(wins + 1);
    let t; do { t = 1 + Math.floor(Math.random() * 31); } while (t === target);
    setTarget(t); setOn([false, false, false, false, false]);
  };

  return (
    <div className="bench">
      <div className="panel stack" style={{ gap: 16 }}>
        <p className="lead">Tap a card to flip it. Face-up cards are ON (1). Face-down cards are OFF (0). Add up the dots on the face-up cards.</p>
        <div className="bin-cards">
          {VALUES.map((v, i) => (
            <button key={v} className={`bin-card${on[i] ? "" : " off"}`} onClick={() => flip(i)} aria-pressed={on[i]} aria-label={`${v} dots, ${on[i] ? "on" : "off"}`}>
              <span className="dots">{Array.from({ length: v }, (_, k) => <i key={k} />)}</span>
              <span className="val">{on[i] ? v : "0"}</span>
            </button>
          ))}
        </div>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div><div className="eyebrow">In binary</div><div className="bits">{on.map(x => (x ? 1 : 0)).join("")}</div></div>
          <div style={{ textAlign: "right" }}><div className="eyebrow">Number</div><div className="total">{total}</div></div>
        </div>
      </div>
      <div className="panel stack" style={{ gap: 12 }}>
        <div className="target" aria-live="polite">Can you make <span style={{ fontSize: "1.6rem" }}>{target}</span>?</div>
        {hit ? (
          <>
            <p className="say">You made {target}! ★<small>{VALUES.filter((_, i) => on[i]).join(" + ")} = {target}</small></p>
            <button className="btn primary big" onClick={nextTarget}>Next number</button>
          </>
        ) : <p className="muted">Tip: start with the biggest card that fits, then add smaller ones.</p>}
        <div className="muted">Numbers made: <b>{wins}</b>{wins < GOAL ? ` — make ${GOAL} to earn the Binary boss badge` : " — Binary boss! 🃏"}</div>
      </div>
    </div>
  );
}

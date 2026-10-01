import { useEffect, useRef, useState } from "react";
import { PUZZLES } from "../content/subjects.js";
import { parseGrid, run } from "../lib/coding.js";

const BLOCKS = { fwd: { label: "Forward", icon: "⬆️", cls: "" }, left: { label: "Turn left", icon: "↰", cls: "turn" }, right: { label: "Turn right", icon: "↱", cls: "turn" } };
const ARROWS = ["▶", "▼", "◀", "▲"];

// Kid-friendly program: a list of blocks, each repeated `times`.
const toProgram = blocks => blocks.map(b => (b.times > 1 ? { op: "repeat", times: b.times, body: [{ op: b.op }] } : { op: b.op }));

export default function CodingPuzzles({ solved, onSolve }) {
  const firstOpen = PUZZLES.findIndex(p => !solved.has(`puzzle-${p.id}`));
  const [idx, setIdx] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [blocks, setBlocks] = useState([]);
  const [frame, setFrame] = useState(null);
  const [status, setStatus] = useState(null);
  const [curBlock, setCurBlock] = useState(-1);
  const timer = useRef(null);

  const puzzle = PUZZLES[idx];
  const { start, goal } = parseGrid(puzzle.grid);
  useEffect(() => { reset(); setBlocks([]); }, [idx]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearInterval(timer.current), []);

  function reset() { clearInterval(timer.current); setFrame(null); setStatus(null); setCurBlock(-1); }
  const add = op => { reset(); setBlocks(b => (b.length < 16 ? [...b, { op, times: 1 }] : b)); };
  const bump = i => { reset(); setBlocks(b => b.map((x, j) => (j === i ? { ...x, times: x.times >= 9 ? 1 : x.times + 1 } : x))); };

  const go = () => {
    reset();
    const { frames, result } = run(puzzle.grid, toProgram(blocks));
    const owner = blocks.flatMap((b, i) => Array(b.times).fill(i)); // which block made each step
    const trail = [];
    let k = 0;
    timer.current = setInterval(() => {
      const f = frames[k];
      trail.push(`${f.r},${f.c}`);
      setFrame({ ...f, trail: [...trail] });
      setCurBlock(k > 0 ? owner[k - 1] : -1);
      k++;
      if (k >= frames.length) {
        clearInterval(timer.current);
        setStatus(result);
        if (result === "win") onSolve(puzzle.id);
      }
    }, 380);
  };

  const pos = frame ?? { r: start[0], c: start[1], dir: 0, trail: [] };
  const cols = puzzle.grid[0].length;

  return (
    <div className="stack">
      <div className="row">
        <span className="eyebrow">Puzzle</span>
        <div className="levels">
          {PUZZLES.map((p, i) => (
            <button key={p.id} className={`${i === idx ? "cur " : ""}${solved.has(`puzzle-${p.id}`) ? "won" : ""}`} onClick={() => setIdx(i)} aria-label={`Puzzle ${i + 1}${solved.has(`puzzle-${p.id}`) ? ", solved" : ""}`}>{i + 1}</button>
          ))}
        </div>
      </div>
      <div className="bench">
        <div className="panel stack" style={{ gap: 12 }}>
          <div><h3 style={{ margin: 0 }}>{idx + 1}. {puzzle.title}</h3><p className="muted">{puzzle.hint}</p></div>
          <div className="maze" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, "--cols": cols }}>
            {puzzle.grid.flatMap((row, r) => [...row].map((ch, c) => {
              const here = pos.r === r && pos.c === c;
              const isGoal = goal[0] === r && goal[1] === c;
              return (
                <div key={`${r}-${c}`} className={`cell${ch === "#" ? " wall" : ""}${pos.trail.includes(`${r},${c}`) ? " trail" : ""}`}>
                  {here ? <span className={`robot${pos.bump ? " bump" : ""}`}>🤖<small style={{ fontSize: ".6em" }}>{ARROWS[pos.dir]}</small></span> : isGoal ? "⭐" : ""}
                </div>
              );
            }))}
          </div>
          <p className="say" aria-live="polite">
            {status === "win" ? <>You did it! ⭐<small>The robot reached the star.</small></>
              : status === "bump" ? <>Bump! There’s a bug.<small>The robot hit a wall. Find the wrong step and fix it.</small></>
              : status === "short" ? <>Almost!<small>The robot stopped before the star. Add more steps.</small></>
              : <>Build a program, then press Go.<small>The robot starts facing right (▶).</small></>}
          </p>
        </div>
        <div className="panel stack" style={{ gap: 12 }}>
          <div className="palette">
            {Object.entries(BLOCKS).map(([op, b]) => <button key={op} className={`blockbtn ${b.cls}`} onClick={() => add(op)}>{b.icon} {b.label}</button>)}
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>My program — tap a block to repeat it</div>
            <div className="program" aria-label="Program">
              {blocks.length === 0 && <span className="muted">Tap the blocks above to add steps.</span>}
              {blocks.map((b, i) => (
                <button key={i} className={`blk-i ${BLOCKS[b.op].cls}${b.times > 1 ? " rep" : ""}${curBlock === i ? " cur" : ""}`} onClick={() => bump(i)}>
                  {BLOCKS[b.op].icon} {BLOCKS[b.op].label}{b.times > 1 && ` ×${b.times}`}
                </button>
              ))}
            </div>
          </div>
          <div className="row">
            <button className="btn primary big" disabled={!blocks.length} onClick={go}>▶ Go</button>
            <button className="btn" disabled={!blocks.length} onClick={() => { reset(); setBlocks(b => b.slice(0, -1)); }}>Undo</button>
            <button className="btn ghost" disabled={!blocks.length} onClick={() => { reset(); setBlocks([]); }}>Clear</button>
          </div>
          {status === "win" && idx < PUZZLES.length - 1 && <button className="btn dark" onClick={() => setIdx(idx + 1)}>Next puzzle →</button>}
        </div>
      </div>
    </div>
  );
}

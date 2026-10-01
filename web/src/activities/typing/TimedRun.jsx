import { useMemo, useRef, useState } from "react";
import { Keyboard, Hands } from "./Keyboard.jsx";
import { TextStrip } from "./TypingLesson.jsx";
import { CountdownRing, Streak } from "./Visuals.jsx";
import { useKeys, useFrame } from "./useKeys.js";
import { streamText } from "../../content/typing.js";
import { extend, finished, press, startTyping, timedResults } from "../../lib/typing.js";
import { sfx } from "../../lib/sfx.js";

// Only the part of a long text around the cursor, starting at a word, so endless text stays readable.
export function windowed(s, before = 24, size = 130) {
  if (s.pos <= before) return { ...s, text: s.text.slice(0, size), misses: s.misses.slice(0, size) };
  const from = s.text.lastIndexOf(" ", s.pos - before) + 1;
  const end = Math.min(s.text.length, from + size);
  return { ...s, text: s.text.slice(from, end), pos: s.pos - from, misses: s.misses.slice(from, end) };
}

// Typing against a clock. The clock starts at the first key and stops while the tab is hidden.
// - `seconds`: time limit. `length`: a fixed text length (a race) or null for endless text.
// - `textFn(pool, length)`: where the text comes from (words by default).
// - `onPress(before, after)` sees every key (for scores and combos).
// - `endWhen(s)`: another way to finish early (e.g. the rocket's tank is full).
// - `top({ s, elapsed, left })`: the picture above the text (track, rocket, ladder…).
// - `onEnd({ s, r, elapsed, input })` is called once.
export default function TimedRun({ pool, mode, seconds, length = null, endWhen, onPress, top, onEnd, intro, taught, textFn = streamText }) {
  const kids = mode !== "pro";
  const [phase, setPhase] = useState("ready");
  const [s, setS] = useState(() => startTyping(textFn(pool, length ?? 160)));
  const [elapsed, setElapsed] = useState(0);
  const cur = useRef(s), time = useRef(0), ended = useRef(false), input = useRef("keyboard");
  const touchOnly = useMemo(() => window.matchMedia?.("(hover: none) and (pointer: coarse)").matches, []);
  const keys = useMemo(() => taught ?? new Set([...pool, " "]), [pool, taught]);

  const end = () => {
    if (ended.current) return;
    ended.current = true;
    setPhase("done");
    const r = timedResults(cur.current, time.current / 1000);
    onEnd({ s: cur.current, r, elapsed: time.current / 1000, input: input.current });
  };
  const hit = (k, how = "keyboard") => {
    if (phase !== "running" && phase !== "armed") return;
    if (how === "touch") input.current = "touch";
    if (phase === "armed") setPhase("running");
    let n = press(cur.current, k, performance.now());
    if (n.wrong && kids) sfx.bump();
    onPress?.(cur.current, n);
    if (!length && n.text.length - n.pos < 60) n = extend(n, textFn(pool, 100));
    cur.current = n; setS(n);
    if ((length && finished(n)) || endWhen?.(n)) end();
  };
  const caps = useKeys({ active: phase === "armed" || phase === "running", waiting: phase === "ready", onChar: hit, onStart: () => setPhase("armed") });
  useFrame(phase === "running", dt => {
    time.current += dt;
    setElapsed(time.current / 1000);
    if (time.current >= seconds * 1000) end();
  });

  const left = Math.max(0, seconds - elapsed);
  if (phase === "ready") {
    return (
      <div className="stack">
        {intro}
        {touchOnly && <p className="type-note" role="note">⌨️ Games work best with a real keyboard. You can also tap the keys on screen.</p>}
        <div className="row"><button className="btn primary big" onClick={() => setPhase("armed")} autoFocus>Ready!</button><span className="muted">or press Enter. The clock starts when you type the first key.</span></div>
      </div>
    );
  }
  return (
    <div className={`stack type-screen timed ${kids ? "kids" : "pro"}`}>
      <div className="timed-top">
        <CountdownRing left={left} total={seconds} />
        <div className="timed-visual">{top({ s, elapsed, left })}</div>
        <Streak n={s.streak} />
      </div>
      {phase === "armed" && <p className="muted center">Start typing: the clock starts with your first key.</p>}
      {caps && <p className="type-note" role="alert">Caps Lock is on. Press the Caps Lock key to turn it off.</p>}
      <TextStrip s={windowed(s)} big={kids} />
      <Keyboard next={s.text[s.pos]} wrong={s.wrong} taught={keys} onTap={touchOnly ? c => hit(c, "touch") : null} />
      {kids && <Hands next={s.text[s.pos]} mode={mode} />}
    </div>
  );
}

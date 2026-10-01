// A lesson told as a conversation, the way a parent teaches at the dinner table: the guide says
// something, asks a question, the child taps an answer, and every answer gets a thoughtful reply
// (a wrong guess is a good thought, then gently corrected). Reusable for any subject.
//
// script: a list of lines
//   { say: "text" }                                   the guide speaks
//   { say: "text", pic: "🧒 💬 🧑" }                   …with a big picture line
//   { ask: "question", choices: [{ label, reply, right? }] }   the child answers; `right: false` marks a wrong
//                                                      guess (shown gently), `right: true` a right one, none = any answer is fine
// "{name}" in any text is replaced by the child's name.
import { useEffect, useRef, useState } from "react";
import { speak } from "../../lib/speech.js";
import { sfx } from "../../lib/sfx.js";

const fill = (t, name) => String(t ?? "").replaceAll("{name}", name || "friend");

export default function Conversation({ script, Face, name, onComplete, doneLabel = "Let's go! →" }) {
  const [at, setAt] = useState(0); // lines shown so far (the last one is "current")
  const [picked, setPicked] = useState({}); // line index → choice index
  const end = useRef(null);
  const line = script[at];
  const answered = line?.ask ? picked[at] != null : true;
  const last = at === script.length - 1;

  // Read the newest line (and the reply to an answer) aloud.
  useEffect(() => { if (line) speak(fill(line.say ?? line.ask, name)); }, [at]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { end.current?.scrollIntoView?.({ block: "nearest", behavior: "smooth" }); }, [at, picked]);

  const choose = (k) => {
    if (picked[at] != null) return;
    const c = line.choices[k];
    c.right === false ? sfx.oops() : sfx.ding();
    setPicked(p => ({ ...p, [at]: k }));
    speak(fill(c.reply, name), { force: true });
  };
  const next = () => { sfx.click(); if (last) onComplete(); else setAt(a => a + 1); };

  return (
    <div className="convo" aria-live="polite">
      {script.slice(0, at + 1).map((l, i) => {
        const k = picked[i];
        return (
          <div key={i} className="convo-turn">
            <div className="convo-row bot">
              {(i === 0 || script[i - 1].ask) && <span className="convo-face"><Face size={44} mood={k != null && l.choices?.[k]?.right === false ? "wow" : "happy"} /></span>}
              <div className="convo-bubble bot">
                {fill(l.say ?? l.ask, name)}
                {l.pic && <div className="convo-pic" aria-hidden="true">{l.pic}</div>}
                {i === at && <button className="convo-hear" onClick={() => speak(fill(l.say ?? l.ask, name), { force: true })} aria-label="Hear it again">🔊</button>}
              </div>
            </div>
            {l.ask && k == null && i === at && (
              <div className="convo-choices">
                {l.choices.map((c, j) => <button key={j} className="btn convo-choice" onClick={() => choose(j)}>{fill(c.label, name)}</button>)}
              </div>
            )}
            {l.ask && k != null && (
              <>
                <div className="convo-row me"><div className="convo-bubble me">{fill(l.choices[k].label, name)}</div></div>
                <div className="convo-row bot">
                  <div className={`convo-bubble bot reply${l.choices[k].right === false ? " gentle" : l.choices[k].right ? " good" : ""}`}>
                    {l.choices[k].right === true && <b>✓ </b>}{fill(l.choices[k].reply, name)}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
      {answered && <div className="convo-next"><button className="btn primary big" onClick={next}>{last ? doneLabel : "Next →"}</button></div>}
      <div ref={end} />
    </div>
  );
}

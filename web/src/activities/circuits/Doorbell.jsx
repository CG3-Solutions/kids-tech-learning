// Volt's mission: build a doorbell. A conversation first (how does a doorbell work?), then the
// mission after Part A: pick the parts, wire the loop, test it, fix three broken doorbells,
// wire a front and a back door, and a final check.
import { useState } from "react";
import { Board, Wire, Battery, Buzzer, Volt } from "./parts.jsx";
import { VoltFace } from "../../components/journey/Guide.jsx";
import Conversation from "../../components/journey/Conversation.jsx";
import { Question as Ask } from "../../components/journey/kit.jsx";
import Question, { prepare } from "../../components/concept/Question.jsx";
import { depthFor } from "../../content/computerDeep.js";
import { VOLT_TALK_BELL, BELL_PARTS, BELL_FAULTS, BELL_DEEPER } from "../../content/circuitTalk.js";
import { useApp } from "../../lib/AppContext.jsx";
import { sfx } from "../../lib/sfx.js";
import { hush } from "../../lib/speech.js";

export function BellTalk({ onComplete }) {
  const { activeChild } = useApp();
  return <div className="step-body"><Conversation script={VOLT_TALK_BELL} Face={VoltFace} name={activeChild?.name ?? ""} onComplete={onComplete} doneLabel="Let's learn about loops! →" /></div>;
}

// A push button on a horizontal wire from x to x + len: the bar drops onto the contacts when pressed.
function PushButton({ x, y, len = 60, pressed, label = "Push button" }) {
  const bar = pressed ? y - 5 : y - 22;
  return (
    <g className="push-btn">
      <circle className="term" cx={x} cy={y} r="6" /><circle className="term" cx={x + len} cy={y} r="6" />
      <line x1={x - 4} y1={bar} x2={x + len + 4} y2={bar} stroke="var(--ink)" strokeWidth="5" strokeLinecap="round" />
      <line x1={x + len / 2} y1={bar} x2={x + len / 2} y2={bar - 12} stroke="var(--ink)" strokeWidth="4" />
      <rect x={x + len / 2 - 14} y={bar - 22} width="28" height="10" rx="5" fill={pressed ? "var(--spark)" : "var(--surface)"} stroke="var(--ink)" strokeWidth="3" />
      {label && <text x={x + len / 2} y={y + 26} fontSize="13" textAnchor="middle" pointerEvents="none">{label}</text>}
    </g>
  );
}

// A big button you press and hold, like a real doorbell.
function HoldButton({ onDown, onUp, children, className = "" }) {
  const [held, setHeld] = useState(false);
  const down = e => { e.preventDefault?.(); if (held) return; setHeld(true); onDown(); };
  const up = () => { if (!held) return; setHeld(false); onUp(); };
  return (
    <button className={`bell-btn${held ? " held" : ""} ${className}`} aria-pressed={held}
      onPointerDown={down} onPointerUp={up} onPointerLeave={up} onPointerCancel={up} onContextMenu={e => e.preventDefault()}
      onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) down(e); }} onKeyUp={e => { if (e.key === " " || e.key === "Enter") up(); }}>
      {children}
    </button>
  );
}

// The doorbell loop: battery (left), push button (top), buzzer (right).
// `have` = which of the three wires are connected; `fault` = a problem to find.
const WIRES = ["left", "top", "bottom"];
const W = {
  left: "M50 118 V40 H160",
  top: "M220 40 H340 V126",
  bottom: "M340 174 V220 H50 V142",
};
function BellBoard({ have = WIRES, pressed, fault, onTap }) {
  const ok = WIRES.every(w => have.includes(w)) && !fault;
  const live = pressed && ok;
  const tap = id => onTap && (() => onTap(id));
  const hit = (id, d) => onTap && <path d={d} stroke="transparent" strokeWidth="30" fill="none" style={{ cursor: "pointer" }} onClick={tap(id)} />;
  const wire = id => {
    if (!have.includes(id)) return <g key={id}><path d={W[id]} className="w ghost-wire" />{hit(id, W[id])}</g>;
    if (fault === "gap" && id === "bottom") {
      return (
        <g key={id}>
          <Wire d="M340 174 V220 H230" /><Wire d="M170 220 H50 V142" />
          <circle cx="230" cy="220" r="4" fill="var(--ink)" /><circle cx="170" cy="220" r="4" fill="var(--ink)" />
          {hit(id, W[id])}
        </g>
      );
    }
    if (fault === "plastic" && id === "top") {
      return (
        <g key={id}>
          <Wire d="M220 40 H250" /><Wire d="M306 40 H340 V126" />
          <rect x="250" y="31" width="56" height="18" rx="3" fill="#d9ecff" stroke="var(--ink)" strokeWidth="2" />
          <text x="278" y="45" fontSize="11" textAnchor="middle" pointerEvents="none">plastic</text>
          {hit(id, W[id])}
        </g>
      );
    }
    return <g key={id}><Wire d={W[id]} live={live} />{hit(id, W[id])}</g>;
  };
  return (
    <Board label="A doorbell circuit: battery, push button and buzzer in a loop">
      {WIRES.map(wire)}
      <g onClick={tap("battery")} style={{ cursor: onTap ? "pointer" : "default" }}>
        <rect x="0" y="96" width="100" height="74" fill="transparent" />
        <Battery x={50} y={130} label={fault === "flat" ? "Flat battery" : "Battery"} />
        {fault === "flat" && <text x="88" y="136" fontSize="22">🪫</text>}
      </g>
      <g onClick={tap("button")} style={{ cursor: onTap ? "pointer" : "default" }}>
        <rect x="150" y="0" width="80" height="70" fill="transparent" />
        <PushButton x={160} y={40} pressed={pressed} />
      </g>
      <g onClick={tap("buzzer")} style={{ cursor: onTap ? "pointer" : "default" }}>
        <Buzzer x={340} y={150} on={live} label="Buzzer" />
      </g>
    </Board>
  );
}

// Two doors: buttons in a row (series) or side by side (parallel).
function TwoDoorBoard({ design, front, back }) {
  const ring = design === "row" ? front && back : front || back;
  if (design === "row") {
    return (
      <Board label="Two buttons in a row">
        <Wire d="M50 118 V40 H110" live={ring} /><Wire d="M170 40 H220" live={ring} /><Wire d="M280 40 H340 V126" live={ring} /><Wire d="M340 174 V220 H50 V142" live={ring} />
        <Battery x={50} y={130} />
        <PushButton x={110} y={40} pressed={front} label="Front door" />
        <PushButton x={220} y={40} pressed={back} label="Back door" />
        <Buzzer x={340} y={150} on={ring} />
      </Board>
    );
  }
  return (
    <Board label="Two buttons side by side">
      <Wire d="M50 118 V40 H170" live={front} /><Wire d="M230 40 H340 V126" live={ring} />
      <Wire d="M110 40 V160 H170" live={back} /><Wire d="M230 160 H290 V40" live={back} />
      <Wire d="M340 174 V220 H50 V142" live={ring} />
      <Battery x={50} y={130} />
      <PushButton x={170} y={40} pressed={front} label="" />
      <text x="200" y="66" fontSize="12" textAnchor="middle">Front door</text>
      <PushButton x={170} y={160} pressed={back} label="Back door" />
      <Buzzer x={340} y={150} on={ring} />
    </Board>
  );
}

const STAGES = [
  { emoji: "🧰", name: "Parts" }, { emoji: "〰️", name: "Wire" }, { emoji: "🔔", name: "Test" },
  { emoji: "🔧", name: "Fix" }, { emoji: "🚪", name: "Doors" }, { emoji: "✅", name: "Check" },
];
const CHECK = { q: "A visitor holds the doorbell button down for 5 seconds. What happens?",
  options: ["The bell rings for 5 seconds, then stops", "The bell rings once, very quickly", "The bell keeps ringing all day"], answer: 0,
  why: "The loop is closed only while the button is held down. When the visitor lets go, the spring opens the gap and the ringing stops." };

export function DoorbellMission({ onComplete }) {
  const { activeChild } = useApp();
  const deep = depthFor(activeChild) >= 2;
  const [stage, setStage] = useState(0);
  const go = n => { hush(); setStage(n); window.scrollTo({ top: 0 }); };
  const next = () => go(stage + 1);

  // Stage 0: parts
  const [picked, setPicked] = useState([]);
  const [said, setSaid] = useState(null);
  // Stage 1: wires
  const [have, setHave] = useState([]);
  // Stage 2: test
  const [pressed, setPressed] = useState(false);
  const [rang, setRang] = useState(0);
  // Stage 3: fix
  const [fault, setFault] = useState(0);
  const [fixed, setFixed] = useState(false);
  const [hint, setHint] = useState(null);
  // Stage 4: two doors
  const [design, setDesign] = useState("row");
  const [front, setFront] = useState(false);
  const [back, setBack] = useState(false);
  const [tried, setTried] = useState({ row: false, front: false, back: false });
  // Stage 5: check
  const [checkQ] = useState(() => prepare(CHECK));
  const [checked, setChecked] = useState(false);

  const trail = (
    <ol className="key-trail" aria-label="Mission steps">
      {STAGES.map((s, i) => <li key={s.name} className={i < stage ? "done" : i === stage ? "on" : ""}><span aria-hidden="true">{s.emoji}</span><small>{s.name}</small></li>)}
    </ol>
  );
  const deeper = key => deep && <p className="deeper-note">🔬 <b>Go deeper:</b> {BELL_DEEPER[key]}</p>;
  const nextBtn = label => <div className="row center-row"><button className="btn primary big" onClick={next}>{label}</button></div>;

  if (stage === 0) {
    const need = BELL_PARTS.filter(p => p.need);
    const got = need.filter(p => picked.includes(p.id)).length;
    const pick = p => {
      if (picked.includes(p.id)) return;
      p.need ? sfx.ding() : sfx.oops();
      setSaid(p);
      if (p.need) setPicked(x => [...x, p.id]);
    };
    return (
      <div className="step-body">
        {trail}
        <Volt mood={said && !said.need ? "wow" : got === need.length ? "cheer" : "happy"}>
          {got === need.length ? "You found all four parts! A battery to push, a push button, a buzzer to ring, and wires to carry the electricity."
            : said ? said.reply : "Mission time! Let's build a doorbell. A doorbell needs four parts. Tap the parts you think we need."}
        </Volt>
        <div className="tray">
          {BELL_PARTS.map(p => {
            const inBox = picked.includes(p.id);
            const wrong = said?.id === p.id && !p.need;
            return <button key={p.id} className={`tray-item${inBox ? " yes" : wrong ? " no" : ""}`} disabled={inBox || got === need.length} onClick={() => pick(p)}><span>{p.emoji}</span>{p.name}</button>;
          })}
        </div>
        <p className="muted center">Parts found: {got} of {need.length}</p>
        {got === need.length && nextBtn("Wire it up →")}
      </div>
    );
  }

  if (stage === 1) {
    const all = have.length === WIRES.length;
    const connect = id => { if (have.includes(id)) return; sfx.click(); setHave(h => [...h, id]); };
    return (
      <div className="step-body">
        {trail}
        <Volt mood={all ? "cheer" : "happy"}>
          {all ? "The loop is wired! But the bell is quiet. Can you see why? There's still one gap: inside the push button."
            : "Now connect the wires to make a loop. Tap each dotted line to put a wire there."}
        </Volt>
        <BellBoard have={have} onTap={id => WIRES.includes(id) && connect(id)} />
        <p className="muted center">Wires connected: {have.length} of {WIRES.length}</p>
        {all && nextBtn("Test the doorbell →")}
      </div>
    );
  }

  if (stage === 2) {
    return (
      <div className="step-body">
        {trail}
        <Volt mood={pressed ? "cheer" : "happy"} lamp={pressed}>
          {pressed ? "Ding-dong! Pressing the button closes the gap. The loop is complete, so the buzzer rings."
            : rang ? "You let go, and the ringing stopped." : "Your doorbell is ready! Press and hold the big button, like a visitor at the door."}
        </Volt>
        <BellBoard pressed={pressed} />
        <div className="row center-row">
          <HoldButton onDown={() => { setPressed(true); sfx.bell(); }} onUp={() => { setPressed(false); setRang(r => r + 1); }}>🔘 Press and hold the doorbell</HoldButton>
        </div>
        {deeper("test")}
        {rang > 0 && !pressed && (
          <Ask key="why-stop" q="Why did the ringing stop when you let go?" right="spring"
            options={[{ value: "spring", label: "🌀 The spring pushed the button up, so the gap opened" }, { value: "empty", label: "🔋 The battery ran out" }, { value: "tired", label: "🥱 The buzzer got tired" }]}
            rightMsg="Yes! The gap opened, the loop was broken, and the electricity stopped." wrongMsg="Look at the push button when you let go. What happens to the gap?" onRight={next} />
        )}
      </div>
    );
  }

  if (stage === 3) {
    const f = BELL_FAULTS[fault];
    const target = { gap: "bottom", plastic: "top", flat: "battery" }[f.id];
    const tap = id => {
      if (fixed) return;
      if (id === target) { setFixed(true); setHint(null); sfx.bell(); }
      else { sfx.oops(); setHint(id === "button" ? "The button works: it closes when pressed. Look for something else that would stop the electricity." : "That part looks fine. Look for something that would stop the electricity."); }
    };
    const after = () => {
      if (fault + 1 >= BELL_FAULTS.length) return next();
      hush(); setFault(fault + 1); setFixed(false); setHint(null);
    };
    return (
      <div className="step-body">
        {trail}
        <Volt mood={fixed ? "cheer" : "wow"} lamp={fixed}>{fixed ? `${f.fixed} Ding-dong!` : f.say}</Volt>
        <BellBoard fault={fixed ? null : f.id} pressed={fixed} onTap={tap} />
        {hint && <p className="fb-line bad">{hint}</p>}
        {fixed && fault === 0 && deeper("fix")}
        {fixed && <div className="row center-row"><button className="btn primary big" onClick={after}>{fault + 1 >= BELL_FAULTS.length ? "Next: two doors →" : "Next broken doorbell →"}</button></div>}
        <p className="muted center">Doorbell {fault + 1} of {BELL_FAULTS.length}</p>
      </div>
    );
  }

  if (stage === 4) {
    const ring = design === "row" ? front && back : front || back;
    const press = (which, on) => {
      const f = which === "front" ? on : front, b = which === "back" ? on : back;
      which === "front" ? setFront(on) : setBack(on);
      if (!on) return;
      const rings = design === "row" ? f && b : f || b;
      rings ? sfx.bell() : sfx.bump();
      if (design === "row" && !rings) setTried(t => ({ ...t, row: true }));
      if (design === "side" && rings && !(f && b)) setTried(t => ({ ...t, [which]: true }));
    };
    const solved = tried.front && tried.back;
    const say = design === "row"
      ? (ring ? "Both buttons pressed together: it rings! But a visitor only presses one button."
        : tried.row ? "No ring! With the buttons in a row, the loop goes through BOTH buttons, so both gaps must be closed. Try putting them side by side."
        : "A house with a front door and a back door! Volt wired both buttons in a row. Press the front door button. Does it ring?")
      : (solved ? "Both doors work! Side by side, each button makes its own path round the loop. The bell rings if the front OR the back button is pressed."
        : ring ? "It rings! That button closes its own path. Now try the other door."
        : "Now the buttons are side by side, each on its own path. Try each door.");
    return (
      <div className="step-body">
        {trail}
        <Volt mood={ring || solved ? "cheer" : tried.row && design === "row" ? "wow" : "happy"} lamp={ring}>{say}</Volt>
        <div className="row center-row">
          <button className="chip" aria-pressed={design === "row"} onClick={() => { setDesign("row"); setFront(false); setBack(false); }}>Buttons in a row</button>
          <button className="chip" aria-pressed={design === "side"} disabled={!tried.row} onClick={() => { sfx.click(); setDesign("side"); setFront(false); setBack(false); }}>Buttons side by side</button>
        </div>
        <TwoDoorBoard design={design} front={front} back={back} />
        <div className="row center-row">
          <HoldButton className="door" key={`f-${design}`} onDown={() => press("front", true)} onUp={() => press("front", false)}>🚪 Front door</HoldButton>
          <HoldButton className="door" key={`b-${design}`} onDown={() => press("back", true)} onUp={() => press("back", false)}>🚪 Back door</HoldButton>
        </div>
        {solved && <p className="center"><b>This is called OR.</b> You'll meet it again in Part B: switches that think.</p>}
        {solved && deeper("doors")}
        {solved && nextBtn("Last check →")}
      </div>
    );
  }

  if (stage === 5) {
    return (
      <div className="step-body">
        {trail}
        <Question key="check" q={checkQ} Face={VoltFace} onAnswer={() => setChecked(true)} />
        {checked && <div className="row center-row"><button className="btn primary big" onClick={() => { sfx.tada(); next(); }}>Finish the mission 🎯</button></div>}
      </div>
    );
  }

  return (
    <div className="step-body">
      <div className="bell-house" aria-hidden="true">🏠🔔</div>
      <Volt mood="cheer" lamp>
        {`You built a doorbell${activeChild?.name ? `, ${activeChild.name}` : ""}! A battery pushes, a push button closes the gap while it's pressed, wires carry the electricity, and the buzzer rings. You fixed three broken doorbells and wired two doors. You're an electrician!`}
      </Volt>
      {deeper("done")}
      <div className="row center-row">
        <button className="btn primary big" onClick={onComplete}>Mission complete ⭐</button>
        <button className="btn" onClick={() => sfx.bell()}>🔔 Ring it again</button>
      </div>
    </div>
  );
}

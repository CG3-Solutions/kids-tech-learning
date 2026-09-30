import { useEffect, useRef, useState } from "react";

const DEVS = [{ id: "bulb", n: "Bulb" }, { id: "motor", n: "Motor" }, { id: "buzzer", n: "Buzzer" }, { id: "led", n: "LED" }];

export default function Circuit({ onFirstSuccess }) {
  const [closed, setClosed] = useState(false);
  const [dev, setDev] = useState("bulb");
  const [flipped, setFlipped] = useState(false);
  const audio = useRef({ ctx: null, osc: null });
  const works = closed && !(dev === "led" && flipped);

  useEffect(() => {
    const a = audio.current;
    const stop = () => { try { a.osc?.stop(); } catch { /* ignore */ } a.osc = null; };
    if (works && dev === "buzzer") {
      try {
        a.ctx = a.ctx || new (window.AudioContext || window.webkitAudioContext)();
        const osc = a.ctx.createOscillator(), g = a.ctx.createGain();
        osc.type = "square"; osc.frequency.value = 520; g.gain.value = 0.04;
        osc.connect(g).connect(a.ctx.destination); osc.start(); a.osc = osc;
      } catch { /* sound not available */ }
    }
    if (works) onFirstSuccess?.();
    return stop;
  }, [works, dev]); // eslint-disable-line react-hooks/exhaustive-deps

  const msg = !closed ? ["The loop is broken.", "The switch is open, like a drawbridge up. Electricity can’t get across."]
    : dev === "bulb" ? ["The bulb glows!", "The loop is complete, so electricity flows from the battery, through the switch and the bulb, and back."]
    : dev === "motor" ? ["The motor spins!", "Electricity is turning into movement, just like a fan."]
    : dev === "buzzer" ? ["Beeeep! The buzzer sings.", "Electricity makes a tiny plate shake fast. Shaking makes sound."]
    : flipped ? ["Oops! The LED is backwards.", "An LED is a one-way street. Turn it around to make it glow."]
    : ["The LED glows red!", "The LED faces the right way, so electricity can pass through."];

  const show = id => ({ display: dev === id ? "inline" : "none" });
  return (
    <div className="bench">
      <div className="panel">
        <svg className={`circuit${closed ? " closed" : ""}${works ? " on" : ""}`} viewBox="0 0 380 250" role="img" aria-label="A battery, a switch and a part joined in a loop">
          <path className="w" d="M40 108 V40 H140" /><path className="w" d="M200 40 H320 V94" /><path className="w" d="M320 146 V210 H40 V132" />
          <path className="flow" d="M40 108 V40 H140 L200 40 H320 V94" /><path className="flow" d="M320 146 V210 H40 V132" />
          <line className="plate" x1="14" y1="108" x2="66" y2="108" strokeWidth="6" />
          <line className="plate" x1="26" y1="132" x2="54" y2="132" strokeWidth="10" />
          <text x="72" y="104" fontSize="20" style={{ fill: "var(--plus)" }}>+</text><text x="72" y="142" fontSize="20">–</text>
          <text x="6" y="236" fontSize="14">Battery</text>
          <g style={{ cursor: "pointer" }} onClick={() => setClosed(c => !c)}>
            <rect x="120" y="0" width="100" height="70" fill="transparent" />
            <line className="lever" x1="140" y1="40" x2="200" y2="40" />
            <circle className="term" cx="140" cy="40" r="7" /><circle className="term" cx="200" cy="40" r="7" />
          </g>
          <text x="148" y="72" fontSize="14">Switch</text>
          <g style={show("bulb")}>
            <circle className="bulb-glass" cx="320" cy="120" r="26" />
            <path d="M301 101 L339 139 M339 101 L301 139" stroke="var(--ink)" strokeWidth="3" />
            <text x="298" y="236" fontSize="14">Bulb</text>
          </g>
          <g style={show("motor")}>
            <circle cx="320" cy="120" r="26" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
            <g className="fan"><path d="M320 120 L320 98 A10 10 0 0 1 332 104 Z M320 120 L340 128 A10 10 0 0 1 330 138 Z M320 120 L302 132 A10 10 0 0 1 300 118 Z" fill="var(--wire)" /></g>
            <circle cx="320" cy="120" r="4" fill="var(--ink)" />
            <text x="296" y="236" fontSize="14">Motor</text>
          </g>
          <g style={show("buzzer")}>
            <rect x="300" y="100" width="40" height="40" rx="8" fill="var(--surface-2)" stroke="var(--ink)" strokeWidth="3" />
            <circle cx="320" cy="120" r="6" fill="var(--ink)" />
            <g className="waves" fill="none" stroke="var(--spark)" strokeWidth="3" strokeLinecap="round"><path d="M348 108 q8 12 0 24" /><path d="M356 100 q14 20 0 40" /></g>
            <text x="294" y="236" fontSize="14">Buzzer</text>
          </g>
          <g style={show("led")}>
            <g className={`led-rot${flipped ? " flip" : ""}`}>
              <path className="led-body" d="M302 104 H338 L320 134 Z" />
              <line x1="302" y1="136" x2="338" y2="136" stroke="var(--ink)" strokeWidth="4" />
            </g>
            <path d="M344 112 l12 -10 m-5 0 h5 v5 M344 126 l12 -10 m-5 0 h5 v5" stroke="var(--ink)" strokeWidth="2.5" fill="none" />
            <text x="304" y="236" fontSize="14">LED</text>
          </g>
        </svg>
      </div>
      <div className="panel stack" style={{ gap: 12 }}>
        <button className={`switch-btn${closed ? "" : " off"}`} onClick={() => setClosed(c => !c)}>{closed ? "Switch OFF" : "Switch ON"}</button>
        <p className="say" aria-live="polite">{msg[0]}<small>{msg[1]}</small></p>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Pick a part to connect</div>
          <div className="chips">{DEVS.map(d => <button key={d.id} className="chip" aria-pressed={d.id === dev} onClick={() => setDev(d.id)}>{d.n}</button>)}</div>
        </div>
        {dev === "led" && <button className="btn" onClick={() => setFlipped(f => !f)}>Turn the LED around</button>}
      </div>
    </div>
  );
}

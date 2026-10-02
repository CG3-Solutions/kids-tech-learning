// Hands-on toys for the Level 2 to 4 cards. Each calls onGoal() once the child has done what was asked.
import { useEffect, useRef, useState } from "react";
import LoopScene, { Gap } from "./LoopScene.jsx";
import { Battery, Bulb, Buzzer, Motor, Lever, Led, Resistor, Pot, Capacitor, Diode, Magnet, Ldr, Temp, Mic, Ultra, Motion, TactButton, Water, Transistor, Relay, Mcu, Seg, SEG_DIGITS } from "./PartArt.jsx";
import { sfx } from "../../lib/sfx.js";

// Places a 120 × 120 drawing inside a scene, centred on (x, y).
const At = ({ x, y, s = 1, children }) => <g transform={`translate(${x - 60 * s} ${y - 60 * s}) scale(${s})`}>{children}</g>;
const Scene = ({ label, children, h = 200 }) => <svg className="scene" viewBox={`0 0 320 ${h}`} role="img" aria-label={label}>{children}</svg>;
const Say = ({ children }) => <p className="toy-say" role="status">{children}</p>;
// Runs something a moment later, and forgets it if the toy closes first.
function useLater() {
  const t = useRef(null);
  useEffect(() => () => clearTimeout(t.current), []);
  return (fn, ms) => { clearTimeout(t.current); t.current = setTimeout(fn, ms); };
}

function LedToy({ onGoal }) {
  const [backwards, setBackwards] = useState(true);
  const turn = () => { const b = !backwards; setBackwards(b); if (!b) { sfx.on(); onGoal(); } else sfx.off(); };
  return (
    <>
      <LoopScene live={!backwards} left={<Battery />} top={<g transform={backwards ? "translate(120 0) scale(-1 1)" : undefined}><Led on={!backwards} /></g>} bottom={<Lever on />} />
      <Say>{backwards ? "The LED is the wrong way round. Electricity cannot get through." : "Now it glows! An LED only works one way."}</Say>
      <button className={`btn big ${backwards ? "primary" : ""}`} onClick={turn}>🔄 Turn the LED around</button>
    </>
  );
}

function ResistorToy({ onGoal }) {
  const [mode, setMode] = useState(null); // "none" | "res"
  const pick = m => { setMode(m); if (m === "res") { sfx.on(); onGoal(); } else sfx.oops(); };
  return (
    <>
      <LoopScene live={!!mode} left={<Battery />} bottom={!mode ? <Gap /> : mode === "res" ? <Resistor /> : <Lever on />}
        top={<g className={mode === "none" ? "art-shake" : undefined}><Led on={!!mode} />{mode === "none" && <text x="60" y="30" textAnchor="middle" fontSize="34">💥</text>}</g>} />
      <Say>{!mode ? "Fill the gap to light the LED." : mode === "res" ? "Just right! The resistor slows the electricity, so the LED is safe." : "Too much electricity! The LED could burn out."}</Say>
      <div className="toy-picks">
        <button className="opt" aria-pressed={mode === "none"} onClick={() => pick("none")}><span className="e" aria-hidden="true">➖</span>Plain wire</button>
        <button className="opt" aria-pressed={mode === "res"} onClick={() => pick("res")}><svg viewBox="0 0 120 120" width="34" height="34" aria-hidden="true"><Resistor /></svg>Resistor</button>
      </div>
    </>
  );
}

function PotToy({ onGoal }) {
  const [v, setV] = useState(10);
  const set = n => { setV(n); if (n >= 95) onGoal(); };
  return (
    <>
      <LoopScene live left={<Battery />} top={<Bulb glow={v / 100} />} bottom={<Pot turn={v / 100} />} />
      <Say>{v >= 95 ? "All the way up: the brightest!" : v >= 50 ? "More electricity, more light." : "Only a little electricity gets through."}</Say>
      <label className="toy-range">Turn the knob<input type="range" min="0" max="100" value={v} onChange={e => set(Number(e.target.value))} /></label>
    </>
  );
}

function CapacitorToy({ onGoal }) {
  const [fill, setFill] = useState(0);
  const [flash, setFlash] = useState(false);
  const later = useLater();
  const charge = () => { setFill(f => Math.min(3, f + 1)); sfx.click(); };
  const release = () => { setFill(0); setFlash(true); sfx.on(); onGoal(); later(() => setFlash(false), 700); };
  return (
    <>
      <Scene label={flash ? "The bulb flashes." : `The capacitor is ${fill} of 3 full.`} h={180}>
        <path d="M100 150 h120" className="scene-wire" />
        {flash && <path d="M100 150 h120" className="scene-flow" />}
        <At x={90} y={90} s={1.2}><Capacitor fill={fill / 3} /></At>
        <At x={230} y={90} s={1.2}><Bulb glow={flash ? 1 : 0} /></At>
      </Scene>
      <Say>{flash ? "Flash! It let everything out at once." : fill === 3 ? "It is full. Let it all out!" : fill ? "Filling up… keep going." : "The capacitor is empty. Fill it up."}</Say>
      <div className="toy-picks">
        <button className={`btn big ${fill < 3 ? "primary" : ""}`} disabled={fill === 3} onClick={charge}>🔋 Fill it up</button>
        <button className={`btn big ${fill === 3 ? "primary" : ""}`} disabled={fill < 3} onClick={release}>⚡ Let it all out</button>
      </div>
    </>
  );
}

function DiodeToy({ onGoal }) {
  const [flipped, setFlipped] = useState(false);
  const turn = () => { const f = !flipped; setFlipped(f); if (f) { sfx.oops(); onGoal(); } else sfx.on(); };
  return (
    <>
      <LoopScene live={!flipped} left={<Battery flip={flipped} />} top={<Bulb glow={flipped ? 0 : 0.9} />} bottom={<g><Diode />{flipped && <text x="60" y="36" textAnchor="middle" fontSize="30">🚫</text>}</g>} />
      <Say>{flipped ? "Blocked! The diode will not let electricity go back the other way." : "Electricity goes through the diode this way."}</Say>
      <button className="btn big primary" onClick={turn}>🔄 Flip the battery</button>
    </>
  );
}

function MagnetToy({ onGoal }) {
  const [on, setOn] = useState(false);
  const [wasOn, setWasOn] = useState(false);
  const flip = () => { const v = !on; setOn(v); v ? sfx.on() : sfx.off(); if (v) setWasOn(true); else if (wasOn) onGoal(); };
  return (
    <>
      <Scene label={on ? "The magnet is on. The pins are stuck to it." : "The magnet is off. The pins are on the table."}>
        <At x={150} y={62} s={1.3}><Magnet on={on} /></At>
        <path d="M30 186 h260" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
        {[110, 150, 190].map((x, i) => <text key={x} x={x} y="176" textAnchor="middle" fontSize="30" className="clip" style={{ transform: on ? `translateY(${-36 - i * 3}px)` : "none" }}>📎</text>)}
      </Scene>
      <Say>{on ? "Electricity flows: the nail is a magnet!" : wasOn ? "Switched off: the magnet is gone and the clips drop." : "The nail is just a nail."}</Say>
      <button className={`btn big ${on ? "" : "primary"}`} onClick={flip}>{on ? "Switch OFF" : "⚡ Switch ON"}</button>
    </>
  );
}

function LdrToy({ onGoal }) {
  const [night, setNight] = useState(false);
  const flip = () => { const n = !night; setNight(n); if (n) { sfx.on(); onGoal(); } else sfx.off(); };
  return (
    <>
      <Scene label={night ? "It is night. The street light is on." : "It is day. The street light is off."}>
        <rect x="6" y="6" width="308" height="188" rx="18" fill={night ? "#1F2A4A" : "#BFE3FF"} className="sky" />
        <text x="62" y="66" textAnchor="middle" fontSize="46">{night ? "🌙" : "☀️"}</text>
        <rect x="6" y="166" width="308" height="28" rx="12" fill={night ? "#2F3B34" : "#7BC47F"} />
        <rect x="214" y="70" width="10" height="100" rx="4" fill="#7C8794" />
        <At x={219} y={54} s={0.8}><Bulb glow={night ? 1 : 0} /></At>
        <At x={262} y={140} s={0.42}><Ldr /></At>
      </Scene>
      <Say>{night ? "The sensor feels the dark and turns the light ON." : "The sensor feels daylight. The light stays OFF."}</Say>
      <button className="btn big primary" onClick={flip}>{night ? "☀️ Make it day" : "🌙 Make it night"}</button>
    </>
  );
}

function TempToy({ onGoal }) {
  const [t, setT] = useState(22);
  const set = n => { if (n >= 30 && t < 30) { sfx.on(); onGoal(); } setT(n); };
  return (
    <>
      <Scene label={`${t} degrees. The fan is ${t >= 30 ? "on" : "off"}.`} h={180}>
        <At x={90} y={86} s={1.25}><Temp hot={(t - 15) / 30} /></At>
        <text x="90" y="174" textAnchor="middle" fontSize="24" fontWeight="700" fill="var(--ink)">{t}°C</text>
        <At x={236} y={92} s={1.25}><Motor spin={t >= 30 ? 1 : 0} /></At>
      </Scene>
      <Say>{t >= 30 ? "Hot! The sensor tells the fan to switch ON." : "Cool enough. The fan stays OFF."}</Say>
      <label className="toy-range">Make the room hotter<input type="range" min="15" max="45" value={t} onChange={e => set(Number(e.target.value))} /></label>
    </>
  );
}

function MicToy({ onGoal }) {
  const [claps, setClaps] = useState(0);
  const [loud, setLoud] = useState(false);
  const later = useLater();
  const clap = () => { sfx.bump(); setLoud(true); later(() => setLoud(false), 450); const c = claps + 1; setClaps(c); if (c === 3) onGoal(); };
  return (
    <>
      <Scene label={loud ? "The microphone hears a clap." : "The microphone is listening."} h={170}>
        <text x="46" y="100" textAnchor="middle" fontSize="50">👏</text>
        {loud && <g fill="none" stroke="#3C6FD8" strokeWidth="4" strokeLinecap="round" className="art-waves"><path d="M84 66 q12 20 0 40" /><path d="M98 54 q20 32 0 64" /></g>}
        <At x={158} y={88} s={1.1}><Mic /></At>
        {[0, 1, 2, 3, 4].map(i => { const h = loud ? [34, 70, 96, 58, 26][i] : 8; return <rect key={i} x={222 + i * 18} y={130 - h} width="12" height={h} rx="4" fill="var(--good)" className="bar" />; })}
      </Scene>
      <Say>{claps === 0 ? "Clap! The microphone turns the sound into electricity." : claps < 3 ? `It heard you! ${3 - claps} more.` : "Three claps heard. Sound became electricity!"}</Say>
      <button className="btn big primary" onClick={clap}>👏 Clap!</button>
    </>
  );
}

function UltraToy({ onGoal }) {
  const [d, setD] = useState(80);
  const set = n => { setD(n); if (n <= 15) { sfx.buzz(); onGoal(); } };
  const x = 120 + d * 1.7;
  return (
    <>
      <Scene label={`The wall is ${d} centimetres away.`} h={170}>
        <At x={56} y={84} s={0.85}><Ultra /></At>
        <g fill="none" stroke="#3C6FD8" strokeWidth="3" strokeLinecap="round" className="art-waves">
          {[0, 1, 2].map(i => { const wx = 108 + (x - 120) * ((i + 1) / 4); return wx < x - 12 ? <path key={i} d={`M${wx} 62 q10 22 0 44`} /> : null; })}
        </g>
        <rect x={x} y="24" width="20" height="120" rx="4" fill="#C8683A" stroke="#8E4521" strokeWidth="3" />
        <text x="160" y="164" textAnchor="middle" fontSize="20" fontWeight="700" fill={d <= 15 ? "var(--bad)" : "var(--ink)"}>{d} cm{d <= 15 ? " — too close! Beep!" : ""}</text>
      </Scene>
      <Say>{d <= 15 ? "The echo comes back very fast, so the wall is very near." : d <= 45 ? "Getting closer. The echo comes back faster." : "The wall is far away. The echo takes a long time."}</Say>
      <label className="toy-range">Move the wall closer<input type="range" min="5" max="100" value={105 - d} onChange={e => set(105 - Number(e.target.value))} /></label>
    </>
  );
}

function MotionToy({ onGoal }) {
  const [walk, setWalk] = useState(0); // counts walks; the walker moves while `moving`
  const [moving, setMoving] = useState(false);
  const later = useLater();
  const go = () => { setWalk(w => w + 1); setMoving(true); sfx.on(); onGoal(); later(() => { setMoving(false); sfx.off(); }, 2200); };
  return (
    <>
      <Scene label={moving ? "Someone walks past. The light is on." : "Nobody is moving. The light is off."}>
        <At x={90} y={50} s={0.75}><Motion on={moving} /></At>
        <At x={230} y={56} s={0.85}><Bulb glow={moving ? 1 : 0} /></At>
        <path d="M20 186 h280" stroke="var(--line)" strokeWidth="6" strokeLinecap="round" />
        {moving && <text key={walk} x="0" y="176" fontSize="54" className="walker">🚶</text>}
      </Scene>
      <Say>{moving ? "The sensor noticed movement and switched the light ON." : walk ? "Nobody is moving, so the light went OFF again." : "Nobody is moving. The light is OFF."}</Say>
      <button className="btn big primary" disabled={moving} onClick={go}>🚶 Walk past</button>
    </>
  );
}

function ButtonToy({ onGoal }) {
  const [down, setDown] = useState(false);
  const press = () => { if (!down) { setDown(true); sfx.on(); } };
  const release = () => { if (down) { setDown(false); sfx.off(); onGoal(); } };
  return (
    <>
      <LoopScene live={down} left={<Battery />} top={<Bulb glow={down ? 0.9 : 0} />} bottom={<TactButton down={down} />} />
      <Say>{down ? "Pressed: the loop is closed. Now let go!" : "Let go and it springs back. The light goes OFF."}</Say>
      <button className={`btn big primary hold${down ? " down" : ""}`} onPointerDown={press} onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
        onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) press(); }} onKeyUp={e => { if (e.key === " " || e.key === "Enter") release(); }}>
        👇 Press and hold
      </button>
    </>
  );
}

function WaterToy({ onGoal }) {
  const [level, setLevel] = useState(0); // 0 to 4
  const full = level === 4;
  const add = () => { const l = Math.min(4, level + 1); setLevel(l); if (l === 4) { sfx.buzz(); onGoal(); } else sfx.click(); };
  return (
    <>
      <Scene label={full ? "The tank is full. The alarm is beeping." : `The tank is ${level} of 4 full.`}>
        <rect x="40" y="20" width="150" height="166" rx="10" fill="var(--surface-2)" stroke="var(--muted)" strokeWidth="4" />
        <rect x="44" y={182 - level * 34} width="142" height={level * 34} rx="6" fill="#3C9BE8" opacity=".75" className="water" />
        <At x={158} y={76} s={0.62}><Water wet={full} /></At>
        <At x={256} y={96} s={0.95}><Buzzer on={full} /></At>
      </Scene>
      <Say>{full ? "The water touched the sensor. Beep! The tank is full." : level ? "The water is rising…" : "The tank is empty."}</Say>
      <div className="toy-picks">
        <button className={`btn big ${full ? "" : "primary"}`} disabled={full} onClick={add}>🚰 Add water</button>
        <button className="btn big" disabled={!level} onClick={() => { setLevel(0); sfx.off(); }}>Empty the tank</button>
      </div>
    </>
  );
}

function TransistorToy({ onGoal }) {
  const [sig, setSig] = useState(0);
  const [wasOn, setWasOn] = useState(false);
  const flip = () => { const v = sig ? 0 : 1; setSig(v); v ? sfx.on() : sfx.off(); if (v) setWasOn(true); else if (wasOn) onGoal(); };
  return (
    <>
      <Scene label={sig ? "The signal is 1. The light is on." : "The signal is 0. The light is off."} h={170}>
        <path d="M70 86 h180" className="scene-wire" />
        {!!sig && <path d="M70 86 h180" className="scene-flow" />}
        <rect x="18" y="52" width="68" height="68" rx="14" fill={sig ? "var(--spark)" : "var(--surface-2)"} stroke="var(--ink)" strokeWidth="3" />
        <text x="52" y="102" textAnchor="middle" fontSize="46" fontWeight="700" fill="var(--ink)" fontFamily="var(--f-display)">{sig}</text>
        <rect x="124" y="50" width="72" height="72" rx="14" className="scene-pad" />
        <At x={160} y={86} s={0.6}><Transistor /></At>
        <At x={262} y={80} s={0.85}><Bulb glow={sig ? 1 : 0} /></At>
      </Scene>
      <Say>{sig ? "1 means ON. The tiny switch lets electricity through." : wasOn ? "0 means OFF. The tiny switch stops the electricity." : "The signal is 0, so the light is OFF."}</Say>
      <button className="btn big primary" onClick={flip}>{sig ? "Send a 0" : "Send a 1"}</button>
    </>
  );
}

function RelayToy({ onGoal }) {
  const [on, setOn] = useState(false);
  const flip = () => { const v = !on; setOn(v); sfx.click(); if (v) { sfx.on(); onGoal(); } };
  return (
    <>
      <Scene label={on ? "The relay clicked. The big motor is running." : "The big motor is off."} h={180}>
        <path d="M56 100 h80" className="scene-wire" style={{ strokeWidth: 3 }} />
        <path d="M176 100 h60" className="scene-wire" style={{ strokeWidth: 10 }} />
        {on && <path d="M176 100 h60" className="scene-flow" style={{ strokeWidth: 10 }} />}
        <At x={40} y={100} s={0.5}><TactButton down={on} /></At>
        <At x={150} y={92} s={0.8}><Relay on={on} /></At>
        <At x={262} y={84} s={1.3}><Motor spin={on ? 1 : 0} /></At>
      </Scene>
      <Say>{on ? "Click! The small button made the relay switch on the big motor." : "A tiny button, a relay, and a big motor."}</Say>
      <button className={`btn big ${on ? "" : "primary"}`} onClick={flip}>{on ? "Let go" : "👆 Press the small button"}</button>
    </>
  );
}

const JOBS = [{ id: "light", e: "💡", label: "Turn on the light" }, { id: "beep", e: "🔊", label: "Beep" }, { id: "spin", e: "🌀", label: "Spin the fan" }];
function McuToy({ onGoal }) {
  const [job, setJob] = useState("light");
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState([]);
  const later = useLater();
  const run = () => {
    setRunning(true); job === "beep" ? sfx.buzz() : sfx.on();
    const all = ran.includes(job) ? ran : [...ran, job]; setRan(all); if (all.length >= 2) onGoal();
    later(() => setRunning(false), 1400);
  };
  const act = id => running && job === id;
  return (
    <>
      <Scene label="A small computer joined to a light, a buzzer and a fan." h={190}>
        <g className="scene-wire" style={{ strokeWidth: 4 }}><path d="M110 95 C170 95 170 38 230 38" /><path d="M110 95 H230" /><path d="M110 95 C170 95 170 152 230 152" /></g>
        <At x={70} y={95} s={1.05}><Mcu /></At>
        <At x={262} y={36} s={0.5}><Bulb glow={act("light") ? 1 : 0} /></At>
        <At x={262} y={98} s={0.5}><Buzzer on={act("beep")} /></At>
        <At x={262} y={158} s={0.5}><Motor spin={act("spin") ? 1 : 0} /></At>
      </Scene>
      <Say>{running ? "The little computer follows your instruction!" : ran.length ? "Now pick a different instruction and run it." : "Pick an instruction, then press Run."}</Say>
      <div className="toy-picks">
        {JOBS.map(j => <button key={j.id} className="opt" aria-pressed={job === j.id} onClick={() => { setJob(j.id); sfx.click(); }}><span className="e" aria-hidden="true">{j.e}</span>{j.label}</button>)}
      </div>
      <button className="btn big primary" disabled={running} onClick={run}>▶ Run</button>
    </>
  );
}

function SegToy({ onGoal }) {
  const [lit, setLit] = useState("");
  const digit = Object.keys(SEG_DIGITS).find(k => SEG_DIGITS[k] === lit);
  const toggle = k => {
    const next = [...(lit.includes(k) ? lit.replace(k, "") : lit + k)].sort().join("");
    setLit(next); sfx.click();
    if (next === SEG_DIGITS[7]) { sfx.on(); onGoal(); }
  };
  return (
    <>
      <svg className="scene seg-scene" viewBox="0 0 120 120" role="group" aria-label="Seven bars. Tap a bar to switch it on or off."><Seg lit={lit} onBar={toggle} /></svg>
      <Say>{digit != null ? `That is the number ${digit}!` : lit.length ? `${lit.length} ${lit.length === 1 ? "bar is" : "bars are"} on. Keep going!` : "All the bars are off. Tap one!"}</Say>
      <button className="btn" disabled={!lit} onClick={() => setLit("")}>Clear</button>
    </>
  );
}

export const MORE_TOYS = { led: LedToy, resistor: ResistorToy, pot: PotToy, capacitor: CapacitorToy, diode: DiodeToy, magnet: MagnetToy, ldr: LdrToy, temp: TempToy, mic: MicToy, ultra: UltraToy, motion: MotionToy, button: ButtonToy, water: WaterToy, transistor: TransistorToy, relay: RelayToy, mcu: McuToy, seg: SegToy };

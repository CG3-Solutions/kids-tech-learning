// Pictures of real parts, drawn here as SVG (our own drawings, so free to use anywhere).
// Each one is drawn to look like the part a child would hold: an AA battery, a wall switch, a glass bulb…
// Every drawing fits a 120 × 120 box, so they can also sit inside a circuit scene (see LoopScene).

const METAL = "#B9C2CC", METAL_DARK = "#7C8794", COPPER = "#C9792B", BLACK = "#2A2E37", GLASS = "#EEF4F9";

export function Battery({ flip = false }) {
  return (
    <g transform={flip ? "rotate(180 60 60)" : undefined}>
      <rect x="51" y="8" width="18" height="12" rx="4" fill={METAL} stroke={METAL_DARK} strokeWidth="2" />
      <rect x="38" y="18" width="44" height="94" rx="8" fill={BLACK} />
      <path d="M38 26 a8 8 0 0 1 8 -8 h28 a8 8 0 0 1 8 8 v30 h-44 z" fill="#E0A21B" />
      <rect x="44" y="24" width="7" height="82" rx="3.5" fill="#fff" opacity=".28" />
      <g transform={flip ? "rotate(180 60 38)" : undefined}><path d="M60 30 v16 M52 38 h16" stroke="#3A2A00" strokeWidth="5" strokeLinecap="round" /></g>
      <path d="M52 94 h16" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </g>
  );
}

export function Wire() {
  return (
    <g fill="none" strokeLinecap="round">
      <path d="M14 34 C50 6 62 66 106 30" stroke={COPPER} strokeWidth="5" />
      <path d="M26 27 C56 10 62 58 94 37" stroke="#D8382C" strokeWidth="13" />
      <path d="M30 26 C56 14 62 54 90 37" stroke="#fff" strokeWidth="2.5" opacity=".35" />
      <path d="M14 92 C50 64 62 124 106 88" stroke={COPPER} strokeWidth="5" />
      <path d="M26 85 C56 68 62 116 94 95" stroke={BLACK} strokeWidth="13" />
      <path d="M30 84 C56 72 62 112 90 95" stroke="#fff" strokeWidth="2.5" opacity=".25" />
    </g>
  );
}

// A wall switch, like the ones at home. The pressed half sits lower and shows a red mark when ON.
export function Switch({ on = false }) {
  return (
    <g>
      <rect x="18" y="10" width="84" height="100" rx="12" fill="#FBFBF8" stroke="#C9CED6" strokeWidth="3" />
      <circle cx="60" cy="19" r="2.5" fill="#B3BAC4" /><circle cx="60" cy="101" r="2.5" fill="#B3BAC4" />
      <rect x="40" y="28" width="40" height="64" rx="8" fill="#E9ECEF" stroke="#AEB6C0" strokeWidth="3" />
      {on
        ? <><path d="M43 60 h34 v24 a5 5 0 0 1 -5 5 h-24 a5 5 0 0 1 -5 -5 z" fill="#CBD1D9" /><rect x="52" y="34" width="16" height="7" rx="3" fill="#E0412F" /></>
        : <path d="M43 60 h34 v-24 a5 5 0 0 0 -5 -5 h-24 a5 5 0 0 0 -5 5 z" fill="#CBD1D9" />}
      <path d="M43 60 h34" stroke="#AEB6C0" strokeWidth="2" />
    </g>
  );
}

// `glow` from 0 (off) to 1 (brightest).
export function Bulb({ glow = 0 }) {
  const lit = glow > 0;
  return (
    <g>
      {lit && <circle cx="60" cy="48" r={44 + glow * 12} fill="#FFD23F" opacity={0.18 + glow * 0.3} />}
      <path d="M60 10 c-22 0 -36 16 -36 34 c0 14 8 22 14 30 c3 4 4 8 4 12 h36 c0 -4 1 -8 4 -12 c6 -8 14 -16 14 -30 c0 -18 -14 -34 -36 -34 z"
        fill={lit ? `rgb(255, ${Math.round(236 - glow * 26)}, ${Math.round(150 - glow * 90)})` : GLASS} stroke={METAL_DARK} strokeWidth="3" />
      <path d="M48 84 v-22 l6 -10 l6 10 l6 -10 l6 10 v22" fill="none" stroke={lit ? "#E86A00" : METAL_DARK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M38 22 q-8 10 -6 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".8" />
      <rect x="42" y="86" width="36" height="20" rx="3" fill={METAL} stroke={METAL_DARK} strokeWidth="2" />
      <path d="M42 93 h36 M42 99 h36" stroke={METAL_DARK} strokeWidth="2" />
      <path d="M50 106 h20 l-4 8 h-12 z" fill={BLACK} />
    </g>
  );
}

// A small black buzzer with two legs. Sound waves show when it beeps.
export function Buzzer({ on = false }) {
  return (
    <g>
      <path d="M46 88 v22 M74 88 v22" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M24 46 v36 a36 14 0 0 0 72 0 v-36 z" fill={BLACK} />
      <ellipse cx="60" cy="46" rx="36" ry="14" fill="#444A57" />
      <ellipse cx="60" cy="46" rx="7" ry="3" fill="#12151B" />
      <path d="M32 40 h8 M36 37 v6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity=".85" />
      {on && <g fill="none" stroke="#E0412F" strokeWidth="4" strokeLinecap="round" className="art-waves">
        <path d="M46 26 q14 -10 28 0" /><path d="M38 16 q22 -16 44 0" /><path d="M30 6 q30 -20 60 0" />
      </g>}
    </g>
  );
}

// A toy motor: a silver can with a shaft. `spin` is 0 (still), 1 or -1 (direction); `fan` adds blades.
export function Motor({ spin = 0, fan = true }) {
  return (
    <g>
      <path d="M40 104 v12 M80 104 v12" stroke={COPPER} strokeWidth="5" strokeLinecap="round" />
      <rect x="28" y="50" width="64" height="56" rx="10" fill={METAL} stroke={METAL_DARK} strokeWidth="3" />
      <rect x="28" y="88" width="64" height="18" rx="8" fill="#F2C230" stroke={METAL_DARK} strokeWidth="3" />
      <rect x="35" y="56" width="8" height="28" rx="4" fill="#fff" opacity=".6" />
      <rect x="50" y="40" width="20" height="12" rx="3" fill={METAL_DARK} />
      <rect x="57" y="26" width="6" height="16" fill={METAL_DARK} />
      {fan && (
        <g className={spin ? `art-spin${spin < 0 ? " back" : ""}` : undefined} style={{ transformOrigin: "60px 26px" }}>
          <path d="M60 26 c-4 -14 4 -24 14 -22 c2 10 -4 18 -14 22 z" fill="#3C6FD8" />
          <path d="M60 26 c14 -4 24 4 22 14 c-10 2 -18 -4 -22 -14 z" fill="#3C6FD8" />
          <path d="M60 26 c4 14 -4 24 -14 22 c-2 -10 4 -18 14 -22 z" fill="#3C6FD8" />
          <path d="M60 26 c-14 4 -24 -4 -22 -14 c10 -2 18 4 22 14 z" fill="#3C6FD8" />
          <circle cx="60" cy="26" r="5" fill={BLACK} />
        </g>
      )}
    </g>
  );
}

// Electricity itself can't be seen, so: a plug in a wall socket with a spark.
export function Electricity({ on = true }) {
  return (
    <g>
      <rect x="14" y="20" width="60" height="80" rx="10" fill="#FBFBF8" stroke="#C9CED6" strokeWidth="3" />
      <circle cx="44" cy="42" r="5" fill={BLACK} /><circle cx="32" cy="70" r="4.5" fill={BLACK} /><circle cx="56" cy="70" r="4.5" fill={BLACK} />
      <path d="M92 8 L70 52 h16 l-10 40 l30 -52 h-17 l12 -32 z" fill={on ? "#FFB800" : "#C9CED6"} stroke="#3A2A00" strokeWidth="3" strokeLinejoin="round" />
    </g>
  );
}

// A whole loop in miniature: battery, wire and bulb.
export function Circuit() {
  return (
    <g>
      <rect x="20" y="34" width="80" height="62" rx="10" fill="none" stroke="#2F7D6D" strokeWidth="6" />
      <g transform="translate(34 2) scale(.44)"><Bulb glow={0.8} /></g>
      <rect x="44" y="84" width="32" height="24" rx="5" fill={BLACK} /><rect x="44" y="84" width="12" height="24" rx="5" fill="#E0A21B" /><rect x="76" y="91" width="5" height="10" rx="2" fill={METAL} />
      <path d="M22 60 l-6 8 h12 z M98 70 l6 -8 h-12 z" fill="#FFB800" />
    </g>
  );
}

// A push button (for the buzzer) and a lever switch (inside circuit scenes).
export function PushButton({ down = false }) {
  return (
    <g>
      <rect x="26" y="62" width="68" height="40" rx="8" fill={BLACK} />
      <rect x="40" y={down ? 50 : 38} width="40" height={down ? 16 : 28} rx="8" fill="#E0412F" stroke="#9E2A1E" strokeWidth="3" />
    </g>
  );
}
export function Lever({ on = false }) {
  return (
    <g>
      <circle cx="26" cy="74" r="9" fill={METAL} stroke={METAL_DARK} strokeWidth="3" /><circle cx="94" cy="74" r="9" fill={METAL} stroke={METAL_DARK} strokeWidth="3" />
      <path d={on ? "M26 74 L94 74" : "M26 74 L84 30"} stroke={COPPER} strokeWidth="9" strokeLinecap="round" />
      <circle cx={on ? 60 : 55} cy={on ? 74 : 52} r="8" fill="#E0412F" />
    </g>
  );
}

// --- Level 2: explorer parts ---

// A round LED with two legs (one longer). `on` makes it glow.
export function Led({ on = false, color = "#E0412F" }) {
  return (
    <g>
      {on && <circle cx="60" cy="42" r="40" fill={color} opacity=".3" />}
      <path d="M50 78 v34 M70 78 v26" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M38 70 v-28 a22 22 0 0 1 44 0 v28 z" fill={color} opacity={on ? 1 : 0.55} stroke="#8E2419" strokeWidth="3" />
      <rect x="33" y="68" width="54" height="10" rx="3" fill={color} stroke="#8E2419" strokeWidth="3" />
      <path d="M46 44 q0 -12 10 -16" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".7" />
    </g>
  );
}

export function Resistor() {
  return (
    <g>
      <path d="M4 60 h28 M88 60 h28" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="28" y="42" width="64" height="36" rx="16" fill="#E7C99A" stroke="#A9834B" strokeWidth="3" />
      <rect x="40" y="42" width="7" height="36" fill="#8B4A1F" /><rect x="53" y="42" width="7" height="36" fill={BLACK} /><rect x="66" y="42" width="7" height="36" fill="#E0412F" /><rect x="80" y="44" width="5" height="32" fill="#C9A227" />
    </g>
  );
}

// A turning knob. `turn` goes from 0 (all the way down) to 1 (all the way up).
export function Pot({ turn = 0.5 }) {
  return (
    <g>
      <path d="M40 96 v18 M60 96 v18 M80 96 v18" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="22" y="34" width="76" height="66" rx="12" fill="#3C6FD8" stroke="#274C9C" strokeWidth="3" />
      <circle cx="60" cy="62" r="26" fill="#F4F6F8" stroke={METAL_DARK} strokeWidth="3" />
      <g transform={`rotate(${-135 + turn * 270} 60 62)`}><path d="M60 62 v-20" stroke={BLACK} strokeWidth="6" strokeLinecap="round" /></g>
      <circle cx="60" cy="62" r="5" fill={BLACK} />
    </g>
  );
}

// A can-shaped capacitor. `fill` (0 to 1) shows how much electricity it is holding.
export function Capacitor({ fill = 0 }) {
  return (
    <g>
      <path d="M48 92 v22 M72 92 v16" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="32" y="14" width="56" height="82" rx="8" fill="#22335C" stroke="#141E38" strokeWidth="3" />
      <rect x="35" y={93 - fill * 76} width="50" height={fill * 76} rx="5" fill="#FFB800" opacity=".9" />
      <rect x="70" y="14" width="18" height="82" rx="6" fill="#D5DBE3" /><path d="M75 34 h8 M75 54 h8 M75 74 h8" stroke="#22335C" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="16" rx="26" ry="6" fill={METAL} />
    </g>
  );
}

export function Diode() {
  return (
    <g>
      <path d="M4 60 h30 M86 60 h30" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="30" y="44" width="60" height="32" rx="6" fill={BLACK} />
      <rect x="72" y="44" width="10" height="32" fill="#D5DBE3" />
      <path d="M40 60 h18 m-7 -7 l7 7 -7 7" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity=".8" />
    </g>
  );
}

// A nail wrapped in copper wire. When `on`, it pulls things towards it.
export function Magnet({ on = false }) {
  return (
    <g>
      <rect x="20" y="50" width="84" height="16" rx="4" fill={METAL} stroke={METAL_DARK} strokeWidth="3" />
      <rect x="10" y="42" width="12" height="32" rx="4" fill={METAL_DARK} />
      <g fill="none" stroke={COPPER} strokeWidth="6" strokeLinecap="round">{[32, 44, 56, 68, 80].map(x => <path key={x} d={`M${x} 42 q8 16 0 32`} />)}</g>
      <path d="M30 42 v-22 M86 74 v24" stroke={COPPER} strokeWidth="4" strokeLinecap="round" fill="none" />
      {on && <g fill="none" stroke="#3C6FD8" strokeWidth="3" strokeLinecap="round" className="art-waves"><path d="M108 46 q8 12 0 24" /><path d="M114 38 q14 20 0 40" /></g>}
    </g>
  );
}

// --- Level 3: sensors ---

export function Ldr() {
  return (
    <g>
      <path d="M48 84 v28 M72 84 v28" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="52" r="36" fill="#F1E6D0" stroke="#B08A4A" strokeWidth="3" />
      <path d="M36 36 h44 v10 h-40 v10 h40 v10 h-40 v8" fill="none" stroke="#C2452D" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

// The little black part with three legs, plus a thermometer to say what it feels.
export function Temp({ hot = 0.4 }) {
  return (
    <g>
      <path d="M26 78 v32 M40 78 v36 M54 78 v32" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 80 v-38 a26 26 0 0 1 52 0 v38 z" fill={BLACK} /><rect x="14" y="60" width="52" height="20" fill="#3A404C" />
      <rect x="82" y="10" width="16" height="74" rx="8" fill="#fff" stroke={METAL_DARK} strokeWidth="3" />
      <rect x="87" y={78 - hot * 60} width="6" height={hot * 60 + 8} rx="3" fill="#E0412F" />
      <circle cx="90" cy="96" r="14" fill="#E0412F" stroke={METAL_DARK} strokeWidth="3" />
    </g>
  );
}

export function Mic({ on = false }) {
  return (
    <g>
      <path d="M48 86 v26 M72 86 v26" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M26 44 v36 a34 10 0 0 0 68 0 v-36 z" fill={METAL} stroke={METAL_DARK} strokeWidth="3" />
      <ellipse cx="60" cy="44" rx="34" ry="12" fill={BLACK} stroke={METAL_DARK} strokeWidth="3" />
      <ellipse cx="60" cy="44" rx="20" ry="6" fill="#4A5160" />
      {on && <g fill="none" stroke="#3C6FD8" strokeWidth="4" strokeLinecap="round" className="art-waves"><path d="M46 24 q14 -10 28 0" /><path d="M38 14 q22 -16 44 0" /></g>}
    </g>
  );
}

// The "two eyes" distance sensor.
export function Ultra() {
  return (
    <g>
      <path d="M42 86 v24 M54 86 v24 M66 86 v24 M78 86 v24" stroke={METAL} strokeWidth="4" strokeLinecap="round" />
      <rect x="8" y="30" width="104" height="58" rx="8" fill="#2D6FD0" stroke="#1D4C94" strokeWidth="3" />
      {[34, 86].map(x => <g key={x}><circle cx={x} cy="59" r="21" fill={METAL} stroke={METAL_DARK} strokeWidth="3" /><circle cx={x} cy="59" r="13" fill="#4A5160" /><circle cx={x} cy="59" r="5" fill={BLACK} /></g>)}
    </g>
  );
}

// A motion sensor: a white dome on a small board.
export function Motion({ on = false }) {
  return (
    <g>
      <rect x="16" y="68" width="88" height="34" rx="6" fill="#2E8B57" stroke="#1E6240" strokeWidth="3" />
      <path d="M26 70 a34 34 0 0 1 68 0 z" fill={on ? "#FFE7A3" : "#F6F7F9"} stroke={METAL_DARK} strokeWidth="3" />
      <path d="M38 62 a22 22 0 0 1 44 0 M48 66 q12 -38 24 0 M60 36 v30" fill="none" stroke="#C3CAD3" strokeWidth="2" />
      <path d="M36 102 v12 M60 102 v12 M84 102 v12" stroke={METAL} strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

// The small square push button found on circuit boards.
export function TactButton({ down = false }) {
  return (
    <g>
      <path d="M30 96 l-10 14 M90 96 l10 14 M30 44 l-10 -10 M90 44 l10 -10" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="24" y="40" width="72" height="60" rx="8" fill={BLACK} />
      <rect x="30" y="46" width="60" height="48" rx="5" fill={METAL} />
      <circle cx="60" cy="70" r={down ? 17 : 19} fill={down ? "#151821" : "#3A404C"} stroke="#12151B" strokeWidth="3" />
    </g>
  );
}

// A water sensor: a red board with metal stripes that water joins up.
export function Water({ wet = false }) {
  return (
    <g>
      <rect x="30" y="6" width="60" height="108" rx="8" fill="#C8362A" stroke="#8E2419" strokeWidth="3" />
      {[38, 48, 58, 68, 78].map(x => <rect key={x} x={x} y="44" width="5" height="62" rx="2" fill={METAL} />)}
      <rect x="42" y="14" width="36" height="20" rx="3" fill={BLACK} />
      {wet && <path d="M30 78 q15 -8 30 0 t30 0 v28 a8 8 0 0 1 -8 8 h-44 a8 8 0 0 1 -8 -8 z" fill="#3C9BE8" opacity=".6" />}
    </g>
  );
}

// --- Level 4: computer brain ---

export function Transistor() {
  return (
    <g>
      <path d="M44 78 v34 M60 78 v38 M76 78 v34" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <path d="M30 80 v-38 a30 30 0 0 1 60 0 v38 z" fill={BLACK} /><rect x="30" y="56" width="60" height="24" fill="#3A404C" />
      <path d="M44 46 h32 M44 38 h20" stroke="#8E96A3" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

// The blue box relay.
export function Relay({ on = false }) {
  return (
    <g>
      <path d="M34 92 v20 M60 92 v20 M86 92 v20" stroke={METAL} strokeWidth="5" strokeLinecap="round" />
      <rect x="16" y="26" width="88" height="68" rx="6" fill="#2D6FD0" stroke="#1D4C94" strokeWidth="3" />
      <path d="M16 38 l10 -12 h78 l-10 12 z" fill="#5B93E6" />
      <rect x="28" y="50" width="50" height="8" rx="3" fill="#fff" opacity=".8" /><rect x="28" y="64" width="34" height="6" rx="3" fill="#fff" opacity=".6" />
      {on && <text x="92" y="22" fontSize="15" fontWeight="700" fill="#E0412F" textAnchor="middle">click!</text>}
    </g>
  );
}

// A small computer board with a chip, a plug and rows of pins.
export function Mcu() {
  return (
    <g>
      <rect x="10" y="22" width="100" height="78" rx="8" fill="#12808A" stroke="#0A575E" strokeWidth="3" />
      <rect x="2" y="34" width="24" height="22" rx="3" fill={METAL} stroke={METAL_DARK} strokeWidth="3" />
      <rect x="40" y="48" width="44" height="26" rx="3" fill={BLACK} />
      <path d="M46 48 v-6 M54 48 v-6 M62 48 v-6 M70 48 v-6 M78 48 v-6 M46 74 v6 M54 74 v6 M62 74 v6 M70 74 v6 M78 74 v6" stroke={METAL} strokeWidth="3" />
      <rect x="34" y="26" width="70" height="7" rx="2" fill={BLACK} /><rect x="34" y="89" width="70" height="7" rx="2" fill={BLACK} />
      <circle cx="96" cy="60" r="5" fill="#E0412F" />
    </g>
  );
}

// The seven bars of a number display, named a to g, and which bars make each digit.
export const SEG_BARS = { a: [44, 18, 32, 8], b: [78, 26, 8, 30], c: [78, 64, 8, 30], d: [44, 94, 32, 8], e: [34, 64, 8, 30], f: [34, 26, 8, 30], g: [44, 56, 32, 8] };
export const SEG_DIGITS = { 0: "abcdef", 1: "bc", 2: "abdeg", 3: "abcdg", 4: "bcfg", 5: "acdfg", 6: "acdefg", 7: "abc", 8: "abcdefg", 9: "abcdfg" };
export function Seg({ lit = "abcdefg", onBar }) {
  return (
    <g>
      <rect x="22" y="6" width="76" height="108" rx="8" fill="#1B1E26" />
      {Object.entries(SEG_BARS).map(([k, [x, y, w, h]]) => (
        <rect key={k} x={x} y={y} width={w} height={h} rx="3" fill={lit.includes(k) ? "#FF3B2F" : "#3A2A2A"} />
      ))}
      {/* Bigger see-through tap areas, so small fingers can hit a thin bar. */}
      {onBar && Object.entries(SEG_BARS).map(([k, [x, y, w, h]]) => (
        <rect key={k} x={x - (w < h ? 7 : 0)} y={y - (h < w ? 7 : 0)} width={w + (w < h ? 14 : 0)} height={h + (h < w ? 14 : 0)} fill="transparent" className="seg-bar"
          role="button" tabIndex={0} aria-label={`Bar ${k}, ${lit.includes(k) ? "on" : "off"}`} aria-pressed={lit.includes(k)}
          onClick={() => onBar(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onBar(k); } }} />
      ))}
    </g>
  );
}

const ART = { "el-electricity": Electricity, "el-circuit": Circuit, "el-battery": Battery, "el-wire": Wire, "el-switch": Switch, "el-bulb": Bulb, "el-buzzer": Buzzer, "el-motor": Motor,
  "el-led": Led, "el-resistor": Resistor, "el-pot": Pot, "el-capacitor": Capacitor, "el-diode": Diode, "el-magnet": Magnet,
  "el-ldr": Ldr, "el-temp": Temp, "el-mic": Mic, "el-ultra": Ultra, "el-motion": Motion, "el-button": TactButton, "el-water": Water,
  "el-transistor": Transistor, "el-relay": Relay, "el-mcu": Mcu, "el-seg": Seg,
};
export const hasArt = id => !!ART[id];

// The picture for a card, as a standalone image.
export default function PartArt({ id, size = 120, label, ...props }) {
  const Art = ART[id];
  if (!Art) return null;
  return (
    <svg className="part-art" viewBox="0 0 120 120" width={size} height={size} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <Art {...props} />
    </svg>
  );
}

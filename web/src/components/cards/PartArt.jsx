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

const ART = { "el-electricity": Electricity, "el-circuit": Circuit, "el-battery": Battery, "el-wire": Wire, "el-switch": Switch, "el-bulb": Bulb, "el-buzzer": Buzzer, "el-motor": Motor };
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

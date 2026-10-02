// One small set of line icons for the lab's controls, drawn here (no emoji), so every button
// has the same weight and style on every device.
const PATHS = {
  undo: ["M9 14 4 9l5-5", "M4 9h10a6 6 0 0 1 0 12h-3"],
  redo: ["M15 14l5-5-5-5", "M20 9H10a6 6 0 0 0 0 12h3"],
  minus: ["M5 12h14"],
  plus: ["M12 5v14", "M5 12h14"],
  sound: ["M11 5 6 9H3v6h3l5 4z", "M15.5 8.5a5 5 0 0 1 0 7", "M18.5 5.5a9 9 0 0 1 0 13"],
  mute: ["M11 5 6 9H3v6h3l5 4z", "M16 9l5 6", "M21 9l-5 6"],
  // Someone talking (Volt reading the hints aloud), and the same person silent.
  read: ["M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M16.5 6.5a4 4 0 0 1 0 5", "M19.5 4a8 8 0 0 1 0 10"],
  readOff: ["M9 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M17 6l5 6", "M22 6l-5 6"],
  clear: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13"],
  lock: ["M6 11h12v9H6z", "M8 11V8a4 4 0 0 1 8 0v3"],
  unlock: ["M6 11h12v9H6z", "M8 11V8a4 4 0 0 1 7.6-1.8"],
  expand: ["M4 9V4h5", "M20 9V4h-5", "M4 15v5h5", "M20 15v5h-5"],
  collapse: ["M9 4v5H4", "M15 4v5h5", "M9 20v-5H4", "M15 20v-5h5"],
  restart: ["M4.5 12a7.5 7.5 0 1 0 2.6-5.7", "M4 4v5h5"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  target: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  check: ["M5 12l5 5 9-10"],
  back: ["M15 5l-7 7 7 7"],
  turn: ["M20 12a8 8 0 1 1-3-6.2", "M20 4v5h-5"],
  flip: ["M8 4v16", "M8 4 4 8", "M8 4l4 4", "M16 20V4", "M16 20l-4-4", "M16 20l4-4"],
  move: ["M12 3v18", "M3 12h18", "M12 3 9 6", "M12 3l3 3", "M12 21l-3-3", "M12 21l3-3", "M3 12l3-3", "M3 12l3 3", "M21 12l-3-3", "M21 12l-3 3"],
  grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
};

export default function Icon({ name, size = 20 }) {
  return (
    <svg className="ico" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {(PATHS[name] ?? []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

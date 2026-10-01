import { useEffect, useRef, useState } from "react";

// Listens for typing keys on the whole page (no box to click first).
// - `onChar(key)` gets each single character key (held-down repeats are ignored).
// - `onStart()` gets Enter or space while `waiting` (the "press Enter to start" screens).
// - `onHide()` runs when the tab is hidden (to pause timers).
// Keys typed into a form field or a dialog (e.g. the grown-up gate) are left alone.
// Returns `caps`: true while Caps Lock turns letters into capitals (those keys are ignored).
export function useKeys({ active = true, waiting = false, onChar, onStart, onHide }) {
  const [caps, setCaps] = useState(false);
  const fns = useRef({});
  fns.current = { onChar, onStart, onHide };
  useEffect(() => {
    if (!active && !waiting) return;
    const onKey = e => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      if (e.target?.closest?.("input, textarea, select, [contenteditable], [role=dialog], dialog")) return;
      if (waiting) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fns.current.onStart?.(); } return; }
      if (e.key.length !== 1) return;
      e.preventDefault();
      if (e.repeat) return;
      const capsOn = e.getModifierState?.("CapsLock") ?? false;
      setCaps(capsOn);
      if (capsOn && e.key !== e.key.toLowerCase()) return;
      fns.current.onChar?.(e.key);
    };
    const hide = () => { if (document.hidden) fns.current.onHide?.(); };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", hide);
    return () => { window.removeEventListener("keydown", onKey); document.removeEventListener("visibilitychange", hide); };
  }, [active, waiting]);
  return caps;
}

// A frame-by-frame loop (about 60 times a second) while `running`. `fn(dt, now)` gets milliseconds.
// `dt` follows the real clock even when frames are slow; only a gap over a second (the tab was
// hidden, so the browser paused the loop) is cut to one second, so time away doesn't count.
export function useFrame(running, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!running) return;
    let id, last = performance.now();
    const tick = now => { ref.current(Math.min(now - last, 1000), now); last = now; id = requestAnimationFrame(tick); };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [running]);
}

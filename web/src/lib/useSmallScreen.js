import { useEffect, useState } from "react";

// Typing needs a real keyboard and room for the on-screen one, so it is left out on phone-sized screens.
const QUERY = "(max-width: 767px)";
const matches = () => typeof window !== "undefined" && !!window.matchMedia?.(QUERY).matches;

export function useSmallScreen() {
  const [small, setSmall] = useState(matches);
  useEffect(() => {
    const mq = window.matchMedia?.(QUERY);
    if (!mq) return;
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return small;
}

// Areas that only work on a bigger screen.
export const BIG_SCREEN_AREAS = new Set(["typing"]);

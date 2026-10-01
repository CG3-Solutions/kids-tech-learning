// The typing engine. Pure functions, so they are easy to test.
//
// - The learner must press the right key to move on (like most typing courses).
//   A wrong key counts as a mistake on the expected key.
// - Time counts from the first key. Pauses longer than GAP_CAP (looking away, a
//   question to a parent) only count as GAP_CAP, so they don't wreck the speed.
// - Speed is words per minute, where a "word" is 5 characters (the standard measure).
export const GAP_CAP = 3000;

export function startTyping(text) {
  return { text, pos: 0, keystrokes: 0, errors: 0, ms: 0, last: null, lastOk: null, keys: {}, misses: Array(text.length).fill(0), wrong: null };
}

// Returns the new state after pressing `key` at time `now` (milliseconds).
export function press(s, key, now) {
  if (s.pos >= s.text.length) return s;
  const want = s.text[s.pos];
  const gap = s.last == null ? 0 : Math.min(now - s.last, GAP_CAP);
  const sinceOk = s.lastOk == null ? 0 : Math.min(now - s.lastOk, GAP_CAP);
  const [n, miss, t] = s.keys[want] ?? [0, 0, 0];
  const ok = key === want;
  const next = { ...s, keystrokes: s.keystrokes + 1, ms: s.ms + gap, last: now, wrong: ok ? null : key };
  if (ok) {
    next.pos = s.pos + 1;
    next.lastOk = now;
    // Time to find the key; the first key of a session has no "before", so it isn't timed.
    next.keys = { ...s.keys, [want]: [n + 1, miss, t + (s.lastOk == null ? 0 : sinceOk)] };
  } else {
    next.errors = s.errors + 1;
    next.misses = s.misses.map((m, i) => (i === s.pos ? m + 1 : m));
    next.keys = { ...s.keys, [want]: [n, miss + 1, t] };
  }
  return next;
}

// A pause (tab hidden): the next key starts a fresh gap, so time away isn't counted.
export const pause = s => ({ ...s, last: null, lastOk: null });

export const finished = s => s.pos >= s.text.length;

export function results(s) {
  const seconds = s.ms / 1000;
  const wpm = seconds >= 1 ? (s.pos / 5) / (seconds / 60) : 0;
  const accuracy = s.keystrokes ? ((s.keystrokes - s.errors) / s.keystrokes) * 100 : 100;
  return { wpm: Math.round(wpm), accuracy: Math.floor(accuracy), seconds: Math.round(seconds), chars: s.pos, errors: s.errors, keys: s.keys };
}

// Adds up per-key stats from many sessions: { key: [presses, misses, ms] }.
export function mergeKeys(sessions) {
  const out = {};
  for (const ses of sessions) for (const [c, [n, miss, t]] of Object.entries(ses.keys ?? {})) {
    const [a, b, d] = out[c] ?? [0, 0, 0];
    out[c] = [a + n, b + miss, d + t];
  }
  return out;
}

// The keys that need practice: most mistakes per try first, then the slowest. Space is skipped.
export function weakKeys(keys, limit = 5) {
  return Object.entries(keys)
    .filter(([c, [n, miss]]) => c !== " " && n + miss >= 3 && miss > 0)
    .map(([c, [n, miss, t]]) => ({ key: c, missRate: miss / (n + miss), ms: n ? t / n : 0, tries: n + miss }))
    .sort((a, b) => b.missRate - a.missRate || b.ms - a.ms)
    .slice(0, limit);
}

export const fmtMinutes = sum => (sum.seconds > 0 && sum.minutes === 0 ? "under 1 min" : `${sum.minutes} min`);

// Summary for parents and the course page. Speed records only come from real keyboards.
export function typingSummary(sessions) {
  const real = sessions.filter(s => s.input !== "touch");
  const recent = sessions.slice(0, 5);
  return {
    sessions: sessions.length,
    bestWpm: real.reduce((m, s) => Math.max(m, s.wpm), 0),
    accuracy: recent.length ? Math.round(recent.reduce((a, s) => a + Number(s.accuracy), 0) / recent.length) : null,
    seconds: sessions.reduce((a, s) => a + Number(s.seconds), 0),
    minutes: Math.round(sessions.reduce((a, s) => a + Number(s.seconds), 0) / 60),
    weak: weakKeys(mergeKeys(sessions.slice(0, 20))),
  };
}

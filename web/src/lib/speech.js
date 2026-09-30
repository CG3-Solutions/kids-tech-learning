export function speak(text) {
  try {
    const ss = window.speechSynthesis;
    if (!ss) return false;
    ss.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1.05;
    const voices = ss.getVoices();
    const v = voices.find(v => /en[-_]IN/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang));
    if (v) u.voice = v;
    ss.speak(u);
    return true;
  } catch { return false; }
}
export function hush() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }

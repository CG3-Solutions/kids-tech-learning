import { speakNow, voiceEnabled, hushVoice } from "./voice.js";

// Reads text aloud in the active child's chosen voice. Pass { force: true } when the child
// asked to hear it again (a "Hear it" button), so a repeat isn't skipped.
export function speak(text, opts) {
  if (!voiceEnabled()) return false;
  return speakNow(text, opts);
}
export function hush() { hushVoice(); }

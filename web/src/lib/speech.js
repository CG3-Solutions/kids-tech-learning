import { speakNow, voiceEnabled } from "./voice.js";

// Reads text aloud in the active child's chosen voice.
export function speak(text) {
  if (!voiceEnabled()) return false;
  return speakNow(text);
}
export function hush() { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } }

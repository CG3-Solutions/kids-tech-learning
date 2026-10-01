import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { VOICES, SPEEDS, voiceOf, defaultVoiceFor, speakWith, voiceEnabled, setVoiceEnabled, voiceSpeed, setVoiceSpeed, pickDeviceVoice, scoreVoice } from "../../lib/voice.js";
import { isMuted, setMuted, onMuteChange } from "../../lib/sfx.js";
import { neuralAvailable, neuralEnabled, setNeuralEnabled, testNeural, neuralLastError, explain } from "../../lib/neuralVoice.js";

export default function VoiceSound() {
  const { api, children, loadAccount, setError } = useApp();
  const [readAloud, setReadAloud] = useState(voiceEnabled());
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  const [speed, setSpeed] = useState(voiceSpeed().id);
  const [natural, setNatural] = useState(neuralEnabled());
  const [test, setTest] = useState(() => (neuralLastError() ? { ok: false, error: explain(new Error(neuralLastError())) } : null));
  const runTest = async () => {
    setTest({ busy: true });
    const r = await testNeural();
    setTest(r);
    if (r.ok) { const a = new Audio(r.url); a.play().catch(() => {}); }
  };
  // Device voices arrive a moment after the page loads in some browsers.
  const [voices, setVoices] = useState(() => window.speechSynthesis?.getVoices?.() ?? []);
  useEffect(() => {
    const ss = window.speechSynthesis; if (!ss) return undefined;
    const upd = () => setVoices(ss.getVoices());
    ss.addEventListener?.("voiceschanged", upd); upd();
    return () => ss.removeEventListener?.("voiceschanged", upd);
  }, []);
  const best = pickDeviceVoice(VOICES[2], voices);
  const goodDevice = best && scoreVoice(best, VOICES[2]) >= 50;
  const choose = async (c, id) => { try { await api.updateChild(c.id, { voice: id }); await loadAccount(); } catch (e) { setError(e.message); } };
  return (
    <ParentLayout title="Voice & sound">
      <p className="lead">Choose how the guides (Chip, Bit, Volt, Polly, Ollie and Keyo) sound for each child. With natural voices on, lessons sound the same on every device; otherwise the voice comes from this device and can sound a little different on another phone or computer.</p>
      {children.map(c => {
        const cur = voiceOf(c);
        return (
          <section key={c.id} className="pc-card">
            <h2>{c.avatar} {c.name}</h2>
            <div className="voice-grid" role="radiogroup" aria-label={`Voice for ${c.name}`}>
              {VOICES.map(v => (
                <div key={v.id} className={`voice-card${cur.id === v.id ? " on" : ""}`}>
                  <button role="radio" aria-checked={cur.id === v.id} className="voice-pick" onClick={() => choose(c, v.id)}>
                    <span className="em" aria-hidden="true">{v.emoji}</span><b>{v.name}</b>
                    <small>{defaultVoiceFor(c.gender) === v.id ? "Default" : " "}</small>
                  </button>
                  <button className="btn ghost small" onClick={() => speakWith(v, `Hi ${c.name}! Today we'll learn about the CPU. It follows instructions EXACTLY. A mistake in a program is called a bug.`, { force: true })} aria-label={`Preview ${v.name}`}>▶ Preview</button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <section className="pc-card" style={{ maxWidth: 680 }}>
        <h2>On this device</h2>
        <label className="toggle-row" htmlFor="ra"><span><b>Read aloud</b><small>Characters read their lines out loud.</small></span>
          <input id="ra" type="checkbox" role="switch" checked={readAloud} onChange={e => { setVoiceEnabled(e.target.checked); setReadAloud(e.target.checked); }} /><span className="switch" aria-hidden="true" /></label>
        <label className="toggle-row" htmlFor="nv"><span><b>Natural voices (online)</b>
          <small>{neuralAvailable()
            ? "Lessons are read by Google's Indian English voices: clear, with stress and pauses, the same on every device. Lines with your child's name use this device's voice, so names are never sent."
            : "Available when you're signed in (not in the demo). Until then, this device's voice is used."}</small></span>
          <input id="nv" type="checkbox" role="switch" disabled={!neuralAvailable()} checked={natural && neuralAvailable()} onChange={e => { setNeuralEnabled(e.target.checked); setNatural(e.target.checked); }} /><span className="switch" aria-hidden="true" /></label>
        {neuralAvailable() && natural && (
          <div className="voice-test">
            <button className="btn small" disabled={test?.busy} onClick={runTest}>{test?.busy ? "Testing…" : "▶ Test natural voice"}</button>
            {test && !test.busy && <p className={test.ok ? "ok" : "bad"} role="status">{test.ok ? "✓ Natural voices are working." : `✗ ${test.error}`}</p>}
          </div>
        )}
        <div className="toggle-row"><span><b>Speaking speed</b><small>Slower helps younger children and new English speakers. Children can also tap 🐢 Slowly on any line.</small></span>
          <div className="seg" role="radiogroup" aria-label="Speaking speed">
            {SPEEDS.map(sp => <button key={sp.id} role="radio" aria-checked={speed === sp.id} className={speed === sp.id ? "on" : ""}
              onClick={() => { setVoiceSpeed(sp.id); setSpeed(sp.id); speakWith(VOICES[2], "This is how fast I will talk.", { force: true }); }}>{sp.name}</button>)}
          </div></div>
        <label className="toggle-row" htmlFor="fx"><span><b>Sound effects</b><small>Clicks, dings and cheers.</small></span>
          <input id="fx" type="checkbox" role="switch" checked={!muted} onChange={e => setMuted(!e.target.checked)} /><span className="switch" aria-hidden="true" /></label>
      </section>
      <section className="pc-card" style={{ maxWidth: 680 }}>
        <h2>{natural && neuralAvailable() ? "This device\u2019s voice (used for names, or when offline)" : "Voice quality on this device"}</h2>
        <p>{best ? <>Using <b>{best.name}</b> ({best.lang}). {goodDevice ? "This is a natural-sounding voice. 👍" : "This is a basic voice; it can sound robotic."}</> : "This browser has no read-aloud voices."}</p>
        {!goodDevice && (
          <ul className="tips">
            <li><b>Android:</b> Settings → System → Languages → Text-to-speech → choose <b>Speech Recognition and Synthesis from Google</b>, then download <b>English (India)</b>.</li>
            <li><b>iPhone / iPad:</b> Settings → Accessibility → Spoken Content → Voices → English → India → download an <b>Enhanced</b> or <b>Premium</b> voice.</li>
            <li><b>Windows:</b> use Microsoft Edge, which has natural online voices (for example “Microsoft Neerja Online (Natural)”).</li>
            <li><b>Mac:</b> System Settings → Accessibility → Spoken Content → System voice → Manage voices → download an English (India) <b>Premium</b> voice.</li>
          </ul>
        )}
        <p className="muted">Reload the app after downloading a new voice.</p>
      </section>
    </ParentLayout>
  );
}

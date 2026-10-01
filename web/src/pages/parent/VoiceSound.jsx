import { useEffect, useState } from "react";
import ParentLayout from "../../layouts/ParentLayout.jsx";
import { useApp } from "../../lib/AppContext.jsx";
import { VOICES, voiceOf, defaultVoiceFor, speakWith, voiceEnabled, setVoiceEnabled } from "../../lib/voice.js";
import { isMuted, setMuted, onMuteChange } from "../../lib/sfx.js";

export default function VoiceSound() {
  const { api, children, loadAccount, setError } = useApp();
  const [readAloud, setReadAloud] = useState(voiceEnabled());
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  const choose = async (c, id) => { try { await api.updateChild(c.id, { voice: id }); await loadAccount(); } catch (e) { setError(e.message); } };
  return (
    <ParentLayout title="Voice & sound">
      <p className="lead">Choose how the story characters (Bit and Volt) sound for each child. Voices come from this device, so they can sound a little different on another phone or computer.</p>
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
                  <button className="btn ghost small" onClick={() => speakWith(v, `Hi ${c.name}! Let's learn something amazing today.`, { force: true })} aria-label={`Preview ${v.name}`}>▶ Preview</button>
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
        <label className="toggle-row" htmlFor="fx"><span><b>Sound effects</b><small>Clicks, dings and cheers.</small></span>
          <input id="fx" type="checkbox" role="switch" checked={!muted} onChange={e => setMuted(!e.target.checked)} /><span className="switch" aria-hidden="true" /></label>
      </section>
    </ParentLayout>
  );
}

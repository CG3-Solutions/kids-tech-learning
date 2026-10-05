import { useEffect, useState } from "react";
import { speak, hush } from "../../lib/speech.js";
import { onSpeaking, speakingText } from "../../lib/voice.js";
import { isMuted, onMuteChange } from "../../lib/sfx.js";
import Icon from "../Icon.jsx";

// A story character with a speech bubble that reads itself aloud (unless muted).
// `Face` is the character's drawing, e.g. BitFace or VoltFace.
export default function Guide({ Face, children, say, mood = "happy", lamp = true }) {
  const text = say ?? (typeof children === "string" ? children : "");
  const [muted, setM] = useState(isMuted());
  useEffect(() => onMuteChange(setM), []);
  const [talking, setTalking] = useState(false);
  useEffect(() => onSpeaking(t => setTalking(!!t && t === text)), [text]);
  useEffect(() => { setTalking(speakingText() === text); if (text && !muted) speak(text); }, [text]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="bit">
      <Face mood={mood} lamp={lamp} />
      <div className="bubble" role="status">
        <div>{children ?? say}</div>
        {text && (
          <div className="hear-row">
            {talking
              ? <button className="btn small hear talking" onClick={hush} aria-label="Stop reading"><Icon name="stop" size={16} fill="currentColor" /> Stop</button>
              : <button className="btn small hear" onClick={() => speak(text, { force: true })} aria-label="Hear it again"><Icon name="speaker" size={18} /> Hear it</button>}
            <button className="btn small" onClick={() => speak(text, { force: true, slow: true })} aria-label="Hear it slowly"><Icon name="turtle" size={18} /> Slowly</button>
          </div>
        )}
      </div>
    </div>
  );
}

// The faces now live in Crew.jsx (the Spark crew style); kept exported from here for existing imports.
export { VoltFace, PollyFace, OllieFace, KeyoFace, ChipFace } from "./Crew.jsx";

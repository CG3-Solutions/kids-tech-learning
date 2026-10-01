// "See it" animations for concept lessons. Each one loops slowly by itself and has a ↻ button.
// They're decorative helpers: the words on the explain and recap screens say the same things.
import { useEffect, useState } from "react";

// Moves through `n` stages, one every `ms`, looping.
function useTicker(n, ms = 1400) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI(x => (x + 1) % n), ms);
    return () => clearInterval(t);
  }, [n, ms]);
  return [i, setI];
}

// A row of boxes; a token travels from one to the next (input → CPU → screen …).
export function FlowAnim({ nodes, token = "●" }) {
  const [i] = useTicker(nodes.length + 1, 1300);
  const at = Math.min(i, nodes.length - 1);
  return (
    <div className="flow" role="img" aria-label={nodes.map(n => `${n[1]}: ${n[2]}`).join(", then ")}>
      {nodes.map(([e, label, sub], k) => (
        <div key={k} className="flow-step">
          {k > 0 && <span className={`flow-arrow${k <= at ? " lit" : ""}`} aria-hidden="true">➜</span>}
          <div className={`flow-node${k === at ? " on" : k < at ? " done" : ""}`}>
            <span className="flow-e" aria-hidden="true">{e}</span>
            <b>{label}</b>
            <small>{sub}</small>
            {k === at && <span className="flow-token" aria-hidden="true">{token}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// Things that do / don't have a computer inside (or hardware / software): badges appear one by one.
export function InsideAnim({ items, labels = ["Computer inside", "No computer"] }) {
  const [i] = useTicker(items.length + 2, 900);
  return (
    <div className="inside-grid">
      {items.map(([e, n, yes], k) => (
        <div key={n} className={`inside-item${k < i ? (yes ? " yes" : " no") : ""}`}>
          <span className="inside-e" aria-hidden="true">{e}</span>
          <b>{n}</b>
          <span className="inside-tag">{k < i ? (yes ? `✓ ${labels[0]}` : labels[1]) : "…"}</span>
        </div>
      ))}
    </div>
  );
}

// A program running: each line lights up in turn, and the result builds up.
export function StepsAnim({ title, lines, result }) {
  const [i] = useTicker(lines.length + 1, 1500);
  const at = Math.min(i, lines.length - 1);
  return (
    <div className="steps-anim">
      <div className="prog">
        <div className="prog-title">{title}</div>
        <ol>{lines.map((l, k) => <li key={k} className={k === at ? "on" : k < at ? "done" : ""}>{l}</li>)}</ol>
      </div>
      <div className="prog-result" aria-live="off"><span aria-hidden="true">{result[at]}</span><small>after line {at + 1}</small></div>
    </div>
  );
}

// Memory (desk) and storage (cupboard) while the power switches on and off.
export function PowerAnim() {
  const [i] = useTicker(4, 1800);
  const on = i < 2, saved = i >= 1;
  return (
    <div className="power-anim" role="img" aria-label="When the power goes off, memory forgets and storage keeps">
      <div className={`power-sw${on ? " on" : ""}`}>{on ? "⚡ Power on" : "⛔ Power off"}</div>
      <div className="power-boxes">
        <div className="pbox"><b>🗂️ Memory (RAM)</b><small>the desk: work you're doing now</small>
          <div className="pitems">{on ? <><span>✏️ drawing</span><span>📝 story</span></> : <em>empty: forgotten!</em>}</div></div>
        <div className="pbox"><b>💾 Storage</b><small>the cupboard: saved things</small>
          <div className="pitems">{saved ? <span>📝 story (saved)</span> : <em>…</em>}<span>🖼️ photos</span></div></div>
      </div>
      <p className="muted small-note">{on ? (saved ? "The story was saved: copied to storage." : "Working on a drawing and a story…") : "Power off! The drawing was never saved, so it's gone. The saved story is safe."}</p>
    </div>
  );
}

// Apps on top of the operating system on top of the hardware.
export function LayersAnim({ layers }) {
  const [i] = useTicker(layers.length, 1300);
  return (
    <div className="layers">
      {layers.map(([e, n, sub], k) => (
        <div key={n} className={`layer${k === i ? " on" : ""}`}><span aria-hidden="true">{e}</span><b>{n}</b><small>{sub}</small></div>
      ))}
      <p className="muted small-note">You tap a game → the operating system opens it → the hardware does the work.</p>
    </div>
  );
}

// A small picture appears pixel by pixel, with each row's numbers beside it (1 = dark, 0 = light).
export const SMILEY = ["01010", "01010", "00000", "10001", "01110"];
export function PixelsAnim() {
  const cells = SMILEY.join("").length;
  const [i] = useTicker(cells + 6, 220);
  return (
    <div className="pixels-anim">
      <div className="px-grid" role="img" aria-label="A smiley face made of 25 pixels">
        {SMILEY.join("").split("").map((c, k) => <i key={k} className={k < i ? (c === "1" ? "dark" : "light") : ""} />)}
      </div>
      <div className="px-nums" aria-hidden="true">{SMILEY.map((r, k) => <code key={k} className={k * 5 < i ? "on" : ""}>{r}</code>)}</div>
      <p className="muted small-note">Each dot is a pixel. 1 = dark, 0 = light. The computer keeps the numbers, not the picture.</p>
    </div>
  );
}

// A photo travelling across the internet in small packets.
export function NetworkAnim() {
  return <FlowAnim token="📦" nodes={[["📱", "Your phone", "Send!"], ["📶", "Router", "Wi-Fi"], ["🌐", "Internet", "Many networks"], ["🖥️", "Server", "Passes it on"], ["📲", "Grandma", "Got it!"]]} />;
}

export function SeeIt({ see }) {
  const [run, setRun] = useState(0);
  const A = { flow: FlowAnim, inside: InsideAnim, steps: StepsAnim, power: PowerAnim, layers: LayersAnim, pixels: PixelsAnim, network: NetworkAnim }[see.anim];
  return (
    <div className="stack" style={{ gap: 10 }}>
      <A key={run} {...see} />
      {see.caption && <p className="lead">{see.caption}</p>}
      <div><button className="btn ghost small" onClick={() => setRun(r => r + 1)}>↻ Watch again</button></div>
    </div>
  );
}

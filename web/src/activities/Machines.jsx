import { MACHINES } from "../content/electricity.js";

export default function Machines() {
  return (
    <div className="stack">
      <p className="lead">Every robot is a bit like a person. It senses, it thinks, and then it acts.</p>
      <div className="body-map">
        <div><b>Sensors</b><span>Eyes, ears and skin. They take information in.</span></div>
        <div><b>Microcontroller</b><span>The brain. It decides what to do.</span></div>
        <div><b>Motors, lights, buzzer</b><span>Hands, face and voice. They do the action.</span></div>
        <div><b>Battery</b><span>Food. It gives the energy.</span></div>
        <div><b>Wires</b><span>Nerves. They connect everything.</span></div>
      </div>
      <div className="mgrid">
        {MACHINES.map(m => (
          <div className="panel mach" key={m.n}>
            <h3>{m.n}</h3><p className="muted" style={{ marginBottom: 10 }}>{m.d}</p>
            <ol>{m.s.map(([a, b]) => <li key={a}><b>{a}</b><span>{b}</span></li>)}</ol>
          </div>
        ))}
      </div>
    </div>
  );
}

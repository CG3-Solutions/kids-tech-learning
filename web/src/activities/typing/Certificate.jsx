import { useEffect } from "react";
import { createPortal } from "react-dom";
import { KeyoFace } from "../../components/journey/Guide.jsx";

const fmtDate = iso => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

// A typing certificate for a passed test, shown full screen and printable (or "Save as PDF").
// While it's open, printing shows only the certificate.
export default function Certificate({ name, session, onClose }) {
  useEffect(() => {
    document.body.classList.add("printing-cert");
    const esc = e => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => { document.body.classList.remove("printing-cert"); window.removeEventListener("keydown", esc); };
  }, [onClose]);
  const minutes = session.lesson_id.replace("test-", "");
  const code = String(session.id).replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase();
  return createPortal(
    <div className="cert-portal" role="dialog" aria-modal="true" aria-label="Typing certificate">
      <div className="cert-actions no-print">
        <button className="btn primary" onClick={() => window.print()}>🖨️ Print or save as PDF</button>
        <button className="btn ghost" onClick={onClose}>Close</button>
      </div>
      <article className="cert">
        <div className="cert-border">
          <p className="cert-brand">⚡ Spark Lab</p>
          <h1>Certificate of Typing</h1>
          <p className="cert-line">This certifies that</p>
          <p className="cert-name">{name}</p>
          <p className="cert-line">typed at</p>
          <p className="cert-score"><b>{session.wpm}</b> words per minute <span>with</span> <b>{session.accuracy}%</b> accuracy</p>
          <p className="cert-line">in a {minutes}-minute touch typing test on {fmtDate(session.created_at)}.</p>
          <div className="cert-foot">
            <div className="cert-sign"><KeyoFace size={56} mood="cheer" lamp={false} /><span>Keyo the Keyboard Cat<br /><small>Typing coach</small></span></div>
            <div className="cert-code">Certificate {code}<br /><small>{session.mode === "pro" ? "Pro mode" : "Kids mode"}</small></div>
          </div>
        </div>
      </article>
    </div>,
    document.body,
  );
}

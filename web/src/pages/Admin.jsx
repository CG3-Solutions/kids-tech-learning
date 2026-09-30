import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ParentLayout from "../layouts/ParentLayout.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { SYMBOLS } from "../content/electricity.js";
import { AREAS } from "../content/areas.js";

const COLORS = ["lv0", "lv1", "lv2", "lv3", "lv4"];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";
const lines = s => s.split("\n").map(x => x.trim()).filter(Boolean);

function useSaver() {
  const { loadContent, setError } = useApp();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const run = async (fn, msg = "Saved") => {
    setBusy(true); setSaved("");
    try { await fn(); await loadContent(); setSaved(msg); return true; }
    catch (e) { setError(e.message); return false; }
    finally { setBusy(false); }
  };
  return { busy, saved, run };
}

function ModuleForm({ module, isNew, onDone }) {
  const { api } = useApp();
  const { busy, saved, run } = useSaver();
  const [f, setF] = useState(() => ({
    ...module,
    levelsText: (module.levels ?? []).map(l => `${l.name} | ${l.note ?? ""}`).join("\n"),
  }));
  const set = k => e => setF(x => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const save = e => {
    e.preventDefault();
    const levels = lines(f.levelsText).map((l, i) => { const [name, note = ""] = l.split("|").map(s => s.trim()); return { id: i, name, note }; });
    const { levelsText, ...rest } = f; // eslint-disable-line no-unused-vars
    const id = isNew ? slug(f.title) : f.id;
    run(() => api.saveModule({ ...rest, id, sort: Number(f.sort) || 0, activity: f.activity || null, levels })).then(ok => ok && onDone?.(id));
  };
  return (
    <form className="panel form" onSubmit={save}>
      <h3 style={{ margin: 0 }}>{isNew ? "New subject" : "Subject settings"}</h3>
      <div className="form-grid">
        <div className="field"><label htmlFor="m-title">Title</label><input id="m-title" value={f.title} onChange={set("title")} required /></div>
        <div className="field"><label htmlFor="m-emoji">Emoji</label><input id="m-emoji" value={f.emoji} onChange={set("emoji")} maxLength={8} /></div>
        <div className="field"><label htmlFor="m-color">Colour</label>
          <select id="m-color" value={f.color} onChange={set("color")}>{COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
        <div className="field"><label htmlFor="m-sort">Order</label><input id="m-sort" type="number" value={f.sort} onChange={set("sort")} /></div>
        <div className="field"><label htmlFor="m-area">Area</label>
          <select id="m-area" value={f.area ?? "science"} onChange={set("area")}>{AREAS.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}</select></div>
      </div>
      <div className="field"><label htmlFor="m-tag">Tagline</label><input id="m-tag" value={f.tagline} onChange={set("tagline")} /></div>
      <div className="form-grid">
        <div className="field"><label htmlFor="m-act">Main activity</label>
          <select id="m-act" value={f.activity ?? ""} onChange={set("activity")}>
            <option value="">None</option><option value="circuit">Build a circuit</option><option value="binary">Binary cards</option><option value="coding">Robot puzzles</option>
          </select></div>
      </div>
      <div className="field"><label htmlFor="m-levels">Levels</label>
        <textarea id="m-levels" value={f.levelsText} onChange={set("levelsText")} placeholder={"Big ideas | Start here\nLevel 1: Starter parts | In every kit"} />
        <small>One per line: name | note. The first line is level 0, the next is level 1, and so on.</small></div>
      <label className="check"><input type="checkbox" checked={f.published !== false} onChange={set("published")} /> Published (visible to kids)</label>
      <label className="check"><input type="checkbox" checked={!!f.coming_soon} onChange={set("coming_soon")} /> Show as “Coming soon” (kids can see it but not open it)</label>
      <div className="row"><button className="btn primary" disabled={busy}>{isNew ? "Create subject" : "Save subject"}</button>{saved && <span className="learned">{saved}</span>}</div>
    </form>
  );
}

const emptyCard = moduleId => ({ id: "", module_id: moduleId, level: 0, sort: 0, published: true, data: { e: "✨", n: "", sh: "", what: "", like: "", home: [], q: "", a: "", tr: "", adult: false, sym: "", symNote: "" } });

function CardForm({ card, isNew, levels, onDone }) {
  const { api } = useApp();
  const { busy, saved, run } = useSaver();
  const [f, setF] = useState(() => ({ ...card, ...card.data, homeText: (card.data.home ?? []).join("\n") }));
  const [confirm, setConfirm] = useState(false);
  const set = k => e => setF(x => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const save = e => {
    e.preventDefault();
    const data = { e: f.e, n: f.n, sh: f.sh, what: f.what, like: f.like, home: lines(f.homeText), q: f.q, a: f.a, tr: f.tr, adult: !!f.adult };
    if (f.sym) { data.sym = f.sym; data.symNote = f.symNote; }
    const id = isNew ? `${card.module_id}-${slug(f.n)}-${Date.now().toString(36).slice(-4)}` : card.id;
    run(() => api.saveCard({ id, module_id: card.module_id, level: Number(f.level), sort: Number(f.sort) || 0, published: f.published !== false, data })).then(ok => ok && isNew && onDone(id));
  };
  const field = (k, label, props = {}) => <div className="field"><label htmlFor={`c-${k}`}>{label}</label><input id={`c-${k}`} value={f[k] ?? ""} onChange={set(k)} {...props} /></div>;
  const area = (k, label, hint) => <div className="field"><label htmlFor={`c-${k}`}>{label}</label><textarea id={`c-${k}`} value={f[k] ?? ""} onChange={set(k)} />{hint && <small>{hint}</small>}</div>;
  return (
    <form className="panel form" onSubmit={save}>
      <div className="row"><h3 style={{ margin: 0 }}>{isNew ? "New card" : `Edit: ${card.data.n}`}</h3><span className="spacer" /><button type="button" className="btn ghost" onClick={() => onDone(null)}>Close</button></div>
      <div className="form-grid">
        {field("e", "Emoji", { maxLength: 8 })}
        {field("n", "Name", { required: true })}
        <div className="field"><label htmlFor="c-level">Level</label>
          <select id="c-level" value={f.level} onChange={set("level")}>
            {(levels.length ? levels : [{ id: 0, name: "Level 0" }]).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select></div>
        {field("sort", "Order", { type: "number" })}
      </div>
      {field("sh", "Short line on the tile")}
      {area("what", "What is it? (read aloud)")}
      {field("like", "It's like…")}
      {area("homeText", "Find it around you", "One place per line.")}
      <div className="form-grid">{field("q", "Think! question")}{field("a", "Answer")}</div>
      {area("tr", "Try it activity")}
      <label className="check"><input type="checkbox" checked={!!f.adult} onChange={set("adult")} /> Needs an adult</label>
      <div className="form-grid">
        <div className="field"><label htmlFor="c-sym">Circuit symbol</label>
          <select id="c-sym" value={f.sym ?? ""} onChange={set("sym")}><option value="">None</option>{Object.keys(SYMBOLS).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        {f.sym && field("symNote", "Symbol note")}
      </div>
      <label className="check"><input type="checkbox" checked={f.published !== false} onChange={set("published")} /> Published</label>
      <div className="row">
        <button className="btn primary" disabled={busy}>{isNew ? "Create card" : "Save card"}</button>
        {saved && <span className="learned">{saved}</span>}
        <span className="spacer" />
        {!isNew && (confirm
          ? <><span>Delete this card?</span><button type="button" className="btn danger" onClick={() => run(() => api.deleteCard(card.id), "Deleted").then(ok => ok && onDone(null))}>Delete</button><button type="button" className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></>
          : <button type="button" className="btn danger" onClick={() => setConfirm(true)}>Delete</button>)}
      </div>
    </form>
  );
}

function QuestionForm({ q, isNew, onDone }) {
  const { api } = useApp();
  const { busy, saved, run } = useSaver();
  const [f, setF] = useState(() => ({ ...q, options: [...q.options, ...Array(Math.max(0, 4 - q.options.length)).fill({ label: "", emoji: "" })] }));
  const [confirm, setConfirm] = useState(false);
  const [err, setErr] = useState("");
  const setOpt = (i, k) => e => setF(x => ({ ...x, options: x.options.map((o, j) => (j === i ? { ...o, [k]: e.target.value } : o)) }));
  const save = e => {
    e.preventDefault();
    setErr("");
    const options = f.options.filter(o => o.label.trim());
    const answerLabel = f.options[f.answer]?.label;
    const answer = options.findIndex(o => o.label === answerLabel);
    if (options.length < 2 || answer < 0) { setErr("Add at least two answers and pick the right one."); return; }
    const id = isNew ? `${q.module_id}-q${Date.now().toString(36)}` : q.id;
    run(() => api.saveQuestion({ id, module_id: q.module_id, question: f.question, options, answer, explanation: f.explanation, sort: Number(f.sort) || 0 })).then(ok => ok && isNew && onDone(id));
  };
  return (
    <form className="panel form" onSubmit={save}>
      <div className="row"><h3 style={{ margin: 0 }}>{isNew ? "New question" : "Edit question"}</h3><span className="spacer" /><button type="button" className="btn ghost" onClick={() => onDone(null)}>Close</button></div>
      <div className="field"><label htmlFor="q-q">Question</label><input id="q-q" value={f.question} onChange={e => setF({ ...f, question: e.target.value })} required /></div>
      <div className="stack" style={{ gap: 8 }}>
        <label style={{ fontWeight: 700 }}>Answers (pick the right one)</label>
        {f.options.map((o, i) => (
          <div className="row" key={i}>
            <input type="radio" name="answer" checked={f.answer === i} onChange={() => setF({ ...f, answer: i })} aria-label={`Answer ${i + 1} is correct`} />
            <input style={{ width: 64, border: "2px solid var(--line)", borderRadius: 12, padding: "8px 10px", background: "var(--surface-2)" }} value={o.emoji} onChange={setOpt(i, "emoji")} placeholder="😀" aria-label={`Answer ${i + 1} emoji`} />
            <input style={{ flex: 1, minWidth: 120, border: "2px solid var(--line)", borderRadius: 12, padding: "8px 10px", background: "var(--surface-2)" }} value={o.label} onChange={setOpt(i, "label")} placeholder={`Answer ${i + 1}`} aria-label={`Answer ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="field"><label htmlFor="q-x">Explanation (shown after answering)</label><input id="q-x" value={f.explanation} onChange={e => setF({ ...f, explanation: e.target.value })} /></div>
      {err && <div className="note error">{err}</div>}
      <div className="row">
        <button className="btn primary" disabled={busy}>{isNew ? "Create question" : "Save question"}</button>
        {saved && <span className="learned">{saved}</span>}
        <span className="spacer" />
        {!isNew && (confirm
          ? <><span>Delete?</span><button type="button" className="btn danger" onClick={() => run(() => api.deleteQuestion(q.id), "Deleted").then(ok => ok && onDone(null))}>Delete</button><button type="button" className="btn ghost" onClick={() => setConfirm(false)}>Keep</button></>
          : <button type="button" className="btn danger" onClick={() => setConfirm(true)}>Delete</button>)}
      </div>
    </form>
  );
}

export default function Admin() {
  const { api, content } = useApp();
  const { busy, saved, run } = useSaver();
  const [sel, setSel] = useState(null); // module id or "new"
  const [editCard, setEditCard] = useState(null); // card id or "new"
  const [editQ, setEditQ] = useState(null);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [confirmDelMod, setConfirmDelMod] = useState(false);

  const modules = useMemo(() => [...(content?.modules ?? [])].sort((a, b) => a.sort - b.sort), [content]);
  if (!content) return <ParentLayout title="Content editor" />;
  const current = modules.find(m => m.id === (sel ?? modules[0]?.id));
  const cards = content.cards.filter(c => c.module_id === current?.id).sort((a, b) => a.level - b.level || a.sort - b.sort);
  const quiz = content.quiz.filter(q => q.module_id === current?.id).sort((a, b) => a.sort - b.sort);
  const pick = id => { setSel(id); setEditCard(null); setEditQ(null); setConfirmDelMod(false); };

  return (
    <ParentLayout title="Content editor">
      <div className="stack">
        {content.fromSeed && (
          <div className="note">The database has no lessons yet, so kids see the built-in lessons. Load them into the database to start editing.</div>
        )}
        <div className="admin">
          <nav className="admin-nav" aria-label="Subjects">
            {modules.map(m => (
              <button key={m.id} className={current?.id === m.id && sel !== "new" ? "active" : ""} onClick={() => pick(m.id)}>
                <span>{m.emoji}</span><span style={{ flex: 1 }}>{m.title}</span>{m.published === false && <span className="tag draft">Draft</span>}
              </button>
            ))}
            <button className={sel === "new" ? "active" : ""} onClick={() => pick("new")}>＋ New subject</button>
            <div className="panel stack" style={{ gap: 8, marginTop: 10 }}>
              <b>Starter content</b>
              <small className="muted">Copies the built-in lessons into the database. Built-in cards you edited are reset; cards you added are kept.</small>
              {confirmSeed
                ? <div className="row"><button className="btn primary" disabled={busy} onClick={() => run(() => api.seedContent(), "Loaded").then(() => setConfirmSeed(false))}>Yes, load</button><button className="btn ghost" onClick={() => setConfirmSeed(false)}>Cancel</button></div>
                : <button className="btn" onClick={() => setConfirmSeed(true)}>Load starter content</button>}
              {saved && <span className="learned">{saved}</span>}
            </div>
          </nav>

          <div className="stack" style={{ gap: 16, minWidth: 0 }}>
            {sel === "new" ? (
              <ModuleForm isNew module={{ title: "", tagline: "", emoji: "📘", color: "lv4", activity: null, sort: modules.length, published: false, levels: [{ id: 0, name: "Level 0", note: "" }] }} onDone={id => pick(id)} />
            ) : current && (
              <>
                <ModuleForm key={current.id} module={current} />
                {editCard && (
                  <CardForm key={editCard} isNew={editCard === "new"} levels={current.levels ?? []}
                    card={editCard === "new" ? emptyCard(current.id) : cards.find(c => c.id === editCard)}
                    onDone={id => setEditCard(id)} />
                )}
                <section className="stack" style={{ gap: 8 }}>
                  <div className="row"><h3 style={{ margin: 0 }}>Cards ({cards.length})</h3><span className="spacer" /><button className="btn" onClick={() => setEditCard("new")}>＋ Add card</button></div>
                  <div className="list">
                    {cards.map(c => (
                      <button key={c.id} className="list-row" onClick={() => { setEditCard(c.id); window.scrollTo(0, 0); }}>
                        <span className="em">{c.data.e}</span>
                        <span className="t"><b>{c.data.n}</b> <small>· {current.levels?.find(l => l.id === c.level)?.name ?? `Level ${c.level}`}</small></span>
                        {c.published === false ? <span className="tag draft">Draft</span> : <span className="tag">Live</span>}
                      </button>
                    ))}
                  </div>
                </section>
                {editQ && (
                  <QuestionForm key={editQ} isNew={editQ === "new"}
                    q={editQ === "new" ? { module_id: current.id, question: "", options: [], answer: 0, explanation: "", sort: quiz.length + 1 } : quiz.find(q => q.id === editQ)}
                    onDone={id => setEditQ(id)} />
                )}
                <section className="stack" style={{ gap: 8 }}>
                  <div className="row"><h3 style={{ margin: 0 }}>Quiz questions ({quiz.length})</h3><span className="spacer" /><button className="btn" onClick={() => setEditQ("new")}>＋ Add question</button></div>
                  <div className="list">
                    {quiz.map(q => (
                      <button key={q.id} className="list-row" onClick={() => setEditQ(q.id)}>
                        <span className="em">❓</span><span className="t">{q.question}</span><small>{q.options[q.answer]?.label}</small>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="panel" style={{ borderColor: "var(--bad)" }}>
                  {confirmDelMod
                    ? <div className="row"><span>Delete “{current.title}” with all its cards and questions?</span><button className="btn danger" onClick={() => run(() => api.deleteModule(current.id), "Deleted").then(ok => ok && pick(null))}>Delete subject</button><button className="btn ghost" onClick={() => setConfirmDelMod(false)}>Keep</button></div>
                    : <button className="btn danger" onClick={() => setConfirmDelMod(true)}>Delete this subject</button>}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </ParentLayout>
  );
}

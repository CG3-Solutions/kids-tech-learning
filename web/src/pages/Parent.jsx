import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar.jsx";
import { ChildForm, ordinal } from "./Profiles.jsx";
import { useApp } from "../lib/AppContext.jsx";
import { badgeState, moduleStats, nextSuggestion, starCount } from "../lib/progress.js";
import { GUIDES } from "./Guides.jsx";

function ChildSummary({ child, data, modules, cards, onEdit }) {
  const badges = badgeState(data, modules).filter(b => b.earned);
  const sugg = nextSuggestion(modules, cards, data);
  const cardsLearned = data.progress.filter(p => cards.some(c => c.id === p.item_id)).length;
  const lastActive = [...data.progress.map(p => p.done_at), ...data.attempts.map(a => a.created_at)].sort().pop();
  return (
    <section className="panel child-sum">
      <div className="hd">
        <span className="face">{child.avatar}</span>
        <div><h3>{child.name}</h3><span className="muted" style={{ fontSize: ".9rem" }}>{child.grade ? `${ordinal(child.grade)} standard · ` : ""}{lastActive ? `Last active ${new Date(lastActive).toLocaleDateString()}` : "Not started yet"}</span></div>
        <span className="spacer" />
        <button className="btn ghost" onClick={onEdit}>Edit</button>
      </div>
      <div className="stats">
        <div className="stat"><b>★ {starCount(data)}</b><span>Stars</span></div>
        <div className="stat"><b>{cardsLearned}</b><span>Cards learned</span></div>
        <div className="stat"><b>{data.attempts.length}</b><span>Quizzes taken</span></div>
        <div className="stat"><b>{badges.length}</b><span>Badges {badges.map(b => b.emoji).join("")}</span></div>
      </div>
      <div className="modrows">
        {modules.map(m => {
          const st = moduleStats(m, cards, data);
          return (
            <div className="modrow" key={m.id} style={{ "--c": `var(--${m.color})` }}>
              <span className="n">{m.emoji} {m.title}</span>
              <div className="bar"><i style={{ width: `${st.pct}%` }} /></div>
              <span className="v">{st.done}/{st.total}{st.best ? ` · ${st.best.score}/${st.best.total}` : ""}</span>
            </div>
          );
        })}
      </div>
      {sugg && (
        <div className="suggest">
          <div className="eyebrow">Teach next</div>
          <b>{sugg.module.emoji} {sugg.module.title}{sugg.card ? `: ${sugg.card.data.n}` : ": the activity"}</b>
          {sugg.card?.data.tr && <p className="muted" style={{ fontSize: ".95rem" }}>Try: {sugg.card.data.tr}</p>}
        </div>
      )}
      {data.attempts.length > 0 && (
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>Recent quizzes</div>
          <ul className="recent">
            {data.attempts.slice(0, 5).map(a => (
              <li key={a.id}><span>{modules.find(m => m.id === a.module_id)?.title ?? a.module_id}</span><span className="muted">{new Date(a.created_at).toLocaleDateString()}</span><b>{a.score}/{a.total}</b></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function Parent() {
  const { api, user, profile, children, published, isAdmin, loadAccount, chooseChild, setError } = useApp();
  const nav = useNavigate();
  const [all, setAll] = useState({});
  const [editing, setEditing] = useState(null); // child id, "new", or null
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!api || !children.length) return;
    Promise.all(children.map(c => api.loadChild(c.id).then(d => [c.id, d])))
      .then(rows => setAll(Object.fromEntries(rows))).catch(e => setError(e.message));
  }, [api, children, setError]);

  if (!published) return <TopBar variant="parent" />;
  const editChild = children.find(c => c.id === editing);

  const save = async data => {
    try {
      if (editing === "new") await api.addChild(data); else await api.updateChild(editing, data);
      await loadAccount(); setEditing(null);
    } catch (e) { setError(e.message); }
  };
  const remove = async () => {
    try { await api.deleteChild(editing); await loadAccount(); setEditing(null); setConfirmDelete(false); } catch (e) { setError(e.message); }
  };

  return (
    <>
      <TopBar variant="parent">
        <Link className="btn primary" to="/profiles">Back to learning</Link>
      </TopBar>
      <main className="wrap stack" style={{ paddingTop: 22 }}>
        <div><div className="eyebrow">Parent area</div><h1 className="sec" style={{ fontSize: "2rem" }}>Hello{profile?.display_name ? `, ${profile.display_name}` : ""}</h1></div>
        <div className="dash">
          <div className="stack" style={{ gap: 16 }}>
            {editing && (
              <section className="panel stack" style={{ gap: 12 }}>
                <h3 style={{ margin: 0 }}>{editing === "new" ? "Add a child" : `Edit ${editChild?.name}`}</h3>
                <ChildForm key={editing} initial={editChild} saveLabel={editing === "new" ? "Add child" : "Save"} onSave={save} onCancel={() => { setEditing(null); setConfirmDelete(false); }} />
                {editing !== "new" && (
                  confirmDelete
                    ? <div className="note error">Delete {editChild?.name} and all their progress? This can't be undone. <div className="row" style={{ marginTop: 8 }}><button className="btn danger" onClick={remove}>Yes, delete</button><button className="btn ghost" onClick={() => setConfirmDelete(false)}>Keep</button></div></div>
                    : <div><button className="btn danger" onClick={() => setConfirmDelete(true)}>Delete this child</button></div>
                )}
              </section>
            )}
            {children.map(c => all[c.id] && (
              <ChildSummary key={c.id} child={c} data={all[c.id]} modules={published.modules} cards={published.cards} onEdit={() => { setEditing(c.id); setConfirmDelete(false); window.scrollTo(0, 0); }} />
            ))}
            {!children.length && !editing && <div className="panel"><p>No children yet.</p></div>}
            <div className="row">
              <button className="btn" onClick={() => setEditing("new")}>＋ Add a child</button>
              {children[0] && <button className="btn ghost" onClick={() => { chooseChild(children[0].id); nav("/learn"); }}>Open {children[0].name}'s view</button>}
            </div>
          </div>
          <aside className="side">
            <div className="safety"><h3>Safety rule</h3><p>We learn with batteries only. Never touch wall sockets, open chargers, or plugged-in appliances.</p></div>
            <div className="panel">
              <h3>Teaching guides</h3>
              <ul>{GUIDES.map(g => <li key={g.slug}><Link to={`/parent/guides/${g.slug}`}>{g.title}</Link></li>)}</ul>
            </div>
            <div className="panel">
              <h3>How to use Spark Lab</h3>
              <ul>
                <li>20–30 minutes, two or three times a week.</li>
                <li>Hold the real part while reading its card.</li>
                <li>Ask the “Think!” question before showing the answer.</li>
                <li>Praise debugging: “You found the bug!”</li>
              </ul>
            </div>
            <div className="panel stack" style={{ gap: 10 }}>
              <h3 style={{ margin: 0 }}>Account</h3>
              <span className="muted" style={{ fontSize: ".9rem" }}>{api?.mode === "demo" ? "Demo account (this browser)" : user?.email}</span>
              {isAdmin && <Link className="btn" to="/admin">Content editor</Link>}
              <button className="btn ghost" onClick={async () => { await api.signOut(); nav("/"); }}>Sign out</button>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

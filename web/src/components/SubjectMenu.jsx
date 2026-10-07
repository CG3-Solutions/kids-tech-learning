// A subject's sections, built to grow: a slim bar that is always one row (chips grouped by kind,
// scrolling sideways with arrows when they don't fit), plus "All sections", a panel that lists every
// section under headings with what it's for and how far the child has got.
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import { groupItems, KIND_LABEL } from "../lib/subjectMenu.js";

export default function SubjectMenu({ items, current, moduleId, startTab, fresh, onPick }) {
  const rowRef = useRef(null), panelRef = useRef(null), allRef = useRef(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const [open, setOpen] = useState(false);
  const groups = groupItems(items);
  const href = tab => `/learn/${moduleId}/${tab}`;

  // Which ends of the row have more chips hidden past them.
  const measure = useCallback(() => {
    const r = rowRef.current;
    if (r) setEdges({ left: r.scrollLeft > 4, right: r.scrollLeft + r.clientWidth < r.scrollWidth - 4 });
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    const ro = typeof ResizeObserver !== "undefined" && rowRef.current ? new ResizeObserver(measure) : null;
    ro?.observe(rowRef.current);
    return () => { window.removeEventListener("resize", measure); ro?.disconnect(); };
  }, [items.length, measure]);
  // Keep the current section's chip in view.
  useEffect(() => {
    const r = rowRef.current, el = r?.querySelector('[aria-current="page"]');
    if (!r || !el) return;
    const a = el.getBoundingClientRect(), b = r.getBoundingClientRect();
    if (a.left < b.left + 8 || a.right > b.right - 8) r.scrollTo({ left: r.scrollLeft + a.left - b.left - 48, behavior: "instant" });
    measure();
  }, [current, measure]);
  // The panel closes with Escape, a tap outside it, or picking a section; focus goes back to its button.
  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); allRef.current?.focus(); };
    const onKey = e => { if (e.key === "Escape") close(); };
    const onDown = e => { if (!panelRef.current?.contains(e.target) && !allRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    panelRef.current?.querySelector('[aria-current="page"], a')?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onDown); };
  }, [open]);
  const scroll = dir => rowRef.current?.scrollBy({ left: dir * rowRef.current.clientWidth * 0.7, behavior: "smooth" });
  const pick = tab => { setOpen(false); onPick(tab); };

  return (
    <div className="section-bar">
      <nav className={`sb-row${edges.left ? " more-l" : ""}${edges.right ? " more-r" : ""}`} aria-label="Sections">
        {edges.left && <button type="button" className="sb-arrow l" onClick={() => scroll(-1)} aria-label="Show earlier sections"><Icon name="back" size={20} stroke={2.8} /></button>}
        <div className="sb-chips" ref={rowRef} onScroll={measure}>
          {groups.map((g, gi) => (
            <div key={`${g.kind}${gi}`} className="sb-group" role="group" aria-label={g.label}>
              {g.items.map(it => {
                const on = it.tab === current;
                return (
                  <Link key={it.tab} to={href(it.tab)} className={`sb-chip${on ? " active" : ""}`} aria-current={on ? "page" : undefined}
                    title={`${KIND_LABEL[it.kind]}: ${it.about}. ${it.meta.text}.`} onClick={() => pick(it.tab)}>
                    <Icon name={it.icon} size={20} />
                    <span className="sb-name">{it.title}</span>
                    {fresh && it.tab === startTab ? <span className="sb-start">Start here</span> : on && <span className="sb-count">{it.meta.short}</span>}
                    {it.meta.total > 0 && <span className="sb-prog" aria-hidden="true"><i style={{ width: `${Math.min(100, (it.meta.done / it.meta.total) * 100)}%` }} /></span>}
                    <span className="sr-only">, {it.meta.text}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        {edges.right && <button type="button" className="sb-arrow r" onClick={() => scroll(1)} aria-label="Show more sections"><Icon name="fwd" size={20} stroke={2.8} /></button>}
      </nav>
      <button type="button" ref={allRef} className={`sb-all${open ? " on" : ""}`} aria-expanded={open} aria-controls="all-sections" aria-label={`All sections (${items.length})`} onClick={() => setOpen(o => !o)}>
        <Icon name="grid" size={20} /><span className="lbl">All</span><span className="sb-n" aria-label={`${items.length} sections`}>{items.length}</span>
      </button>

      {open && (
        <>
          <div className="sb-scrim" aria-hidden="true" />
          <div className="sb-panel" id="all-sections" ref={panelRef} role="dialog" aria-label="All sections">
            <div className="sb-panel-h"><b>All sections</b><button type="button" className="btn small" onClick={() => { setOpen(false); allRef.current?.focus(); }}>Close</button></div>
            {groups.map((g, gi) => (
              <section key={`${g.kind}${gi}`} className="sb-panel-group" aria-label={g.label}>
                <h3 className="eyebrow">{g.label}</h3>
                <div className="sb-tiles">
                  {g.items.map(it => {
                    const on = it.tab === current;
                    return (
                      <Link key={it.tab} to={href(it.tab)} className={`sm-item${on ? " active" : ""}`} aria-current={on ? "page" : undefined} onClick={() => pick(it.tab)}>
                        <span className="sm-ic" aria-hidden="true"><Icon name={it.icon} size={24} /></span>
                        <span className="sm-txt">
                          <span className="sm-kind">{KIND_LABEL[it.kind]}{fresh && it.tab === startTab && <b className="sm-start">Start here</b>}</span>
                          <b className="sm-title">{it.title}</b>
                          <span className="sm-about">{it.about}</span>
                          <span className="sm-meta">{it.meta.text}</span>
                          {it.meta.total > 0 && <span className="sm-bar" aria-hidden="true"><i style={{ width: `${Math.min(100, (it.meta.done / it.meta.total) * 100)}%` }} /></span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

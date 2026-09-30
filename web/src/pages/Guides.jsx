import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { marked } from "marked";
import ParentLayout from "../layouts/ParentLayout.jsx";

const files = import.meta.glob("../../../docs/*.md", { query: "?raw", import: "default" });
export const GUIDES = [
  { slug: "roadmap", file: "01-learning-roadmap.md", title: "Learning roadmap (age 7 → teens)" },
  { slug: "components", file: "02-electronic-components.md", title: "Electronic parts with real-life examples" },
  { slug: "activities", file: "03-activities-and-safety.md", title: "Activities, machines and safety" },
  { slug: "circuits", file: "04-circuits-and-gates.md", title: "Circuits & gates course (Volt)" },
  { slug: "binary", file: "05-binary-adventure.md", title: "Binary adventure course (Bit)" },
];

export default function Guides() {
  const { slug } = useParams();
  const guide = GUIDES.find(g => g.slug === slug);
  const [html, setHtml] = useState("");
  useEffect(() => {
    if (!guide) return;
    const load = Object.entries(files).find(([path]) => path.endsWith(guide.file))?.[1];
    // The guides are our own files from the repo, so their HTML is trusted.
    load?.().then(md => setHtml(marked.parse(md)));
  }, [guide]);
  if (!guide) return <Navigate to="/parent" replace />;
  return (
    <ParentLayout title="Teaching guides">
      <div className="stack">
        <nav className="chips">{GUIDES.map(g => <Link key={g.slug} className={`chip${g.slug === slug ? " active" : ""}`} to={`/parent/guides/${g.slug}`}>{g.title}</Link>)}</nav>
        <article className="guide" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </ParentLayout>
  );
}

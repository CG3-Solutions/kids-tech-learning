import { SYMBOLS } from "../content/electricity.js";

// Circuit symbols are fixed drawings from our own content file, so rendering them as markup is safe.
export default function Symbol({ name }) {
  if (!SYMBOLS[name]) return null;
  return (
    <svg viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: SYMBOLS[name] }} />
  );
}

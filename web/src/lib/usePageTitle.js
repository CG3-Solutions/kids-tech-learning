import { useEffect } from "react";

// The browser tab (and the screen reader announcement) names the page: "Maths · Spark Lab".
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Spark Lab` : "Spark Lab";
    return () => { document.title = "Spark Lab"; };
  }, [title]);
}

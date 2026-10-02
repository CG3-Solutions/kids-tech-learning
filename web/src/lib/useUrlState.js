import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Keeps "what is open" (a step, a card, a project) in the address, as ?key=value, instead of in
// component state. That way the browser or tablet Back button closes it and returns to the list,
// and a reload comes back to the same place.
// - Opening from the list adds a history entry; moving from one open item to the next replaces it,
//   so one Back always leads to the list.
// - `stay` keeps the same view mounted across these moves (see viewKey in ModulePage).
export function useUrlState(key) {
  const location = useLocation();
  const navigate = useNavigate();
  const value = new URLSearchParams(location.search).get(key);

  const set = useCallback(next => {
    const params = new URLSearchParams(location.search);
    const stay = location.state?.stay ?? location.key;
    const opened = location.state?.opened ?? false; // this entry was opened from the list, in the app
    if (next == null) {
      if (value == null) return;
      if (opened) { navigate(-1); return; }
      params.delete(key);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: true, state: { stay } });
    } else {
      if (next === value) return;
      params.set(key, next);
      navigate({ pathname: location.pathname, search: params.toString() }, { replace: value != null, state: { stay, opened: value == null ? true : opened } });
    }
  }, [key, value, location, navigate]);

  return [value, set];
}

// The key for a subject's view: it changes when the learner taps a section tab (so the view starts
// fresh at its map), but not when a step opens or closes inside it.
export const viewKey = location => location.state?.stay ?? location.key;

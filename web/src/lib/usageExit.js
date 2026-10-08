// The last screen-time save when a page is hidden or closed. Browsers (Safari especially) cancel
// ordinary requests as a page goes away, so this one is sent with `keepalive`, which lets it finish
// after the page has gone. It calls the same add_usage function as the app's normal saves.
export function usageExitRequest(url, anonKey, accessToken, { childId, day, secs }) {
  return {
    url: `${url.replace(/\/+$/, "")}/rest/v1/rpc/add_usage`,
    init: {
      method: "POST",
      keepalive: true,
      headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ cid: childId, d: day, secs, bonus: 0 }),
    },
  };
}

// Send it. Returns a promise for the request, or null when it can't be sent this way (no sign-in,
// no fetch, or a browser that refuses keepalive), so the caller can fall back to a normal save.
export function sendUsageOnExit(fetchFn, url, anonKey, accessToken, usage) {
  if (!accessToken || typeof fetchFn !== "function" || !(usage.secs > 0)) return null;
  const { url: to, init } = usageExitRequest(url, anonKey, accessToken, usage);
  try {
    return fetchFn(to, init).then(res => { if (!res.ok) throw new Error(`add_usage ${res.status}`); });
  } catch {
    return null;
  }
}

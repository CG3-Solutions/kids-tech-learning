import { describe, it, expect, vi } from "vitest";
import { usageExitRequest, sendUsageOnExit } from "./usageExit.js";

const usage = { childId: "c1", day: "2026-10-07", secs: 45 };

describe("screen time saved as the page closes", () => {
  it("builds a keepalive call to add_usage with the user's token", () => {
    const { url, init } = usageExitRequest("https://x.supabase.co/", "anon", "tok", usage);
    expect(url).toBe("https://x.supabase.co/rest/v1/rpc/add_usage");
    expect(init.method).toBe("POST");
    expect(init.keepalive).toBe(true);
    expect(init.headers).toMatchObject({ apikey: "anon", Authorization: "Bearer tok", "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ cid: "c1", d: "2026-10-07", secs: 45, bonus: 0 });
  });
  it("sends it and reports a failed response", async () => {
    const ok = vi.fn().mockResolvedValue({ ok: true });
    await expect(sendUsageOnExit(ok, "https://x.supabase.co", "anon", "tok", usage)).resolves.toBeUndefined();
    expect(ok).toHaveBeenCalledOnce();
    const bad = vi.fn().mockResolvedValue({ ok: false, status: 401 });
    await expect(sendUsageOnExit(bad, "https://x.supabase.co", "anon", "tok", usage)).rejects.toThrow("401");
  });
  it("returns null so the caller can fall back to a normal save", () => {
    const f = vi.fn();
    expect(sendUsageOnExit(f, "u", "k", null, usage)).toBeNull();          // not signed in
    expect(sendUsageOnExit(undefined, "u", "k", "tok", usage)).toBeNull(); // no fetch
    expect(sendUsageOnExit(f, "u", "k", "tok", { ...usage, secs: 0 })).toBeNull();
    expect(sendUsageOnExit(() => { throw new TypeError("keepalive not allowed"); }, "u", "k", "tok", usage)).toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
});

import { describe, it, expect } from "vitest";
import { createDemoApi } from "./demoApi.js";

const memory = () => { const m = new Map(); return { get: (k, d) => (m.has(k) ? m.get(k) : d), set: (k, v) => m.set(k, structuredClone(v)) }; };

describe("parent password (demo mode)", () => {
  it("starts as 'demo', can be changed, and only the right one opens the dashboard", async () => {
    const api = createDemoApi(memory());
    await api.signInDemo();
    expect(await api.verifyPassword("demo")).toBe(true);
    expect(await api.verifyPassword("36")).toBe(false);
    await api.setPassword("our-family-2026");
    expect(await api.verifyPassword("demo")).toBe(false);
    expect(await api.verifyPassword("our-family-2026")).toBe(true);
  });
});

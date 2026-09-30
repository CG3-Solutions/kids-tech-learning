import { createDemoApi } from "./demoApi.js";

const url = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Accepts the project URL, or the dashboard link people often paste by mistake
// (https://supabase.com/dashboard/project/<ref>/...), and returns https://<ref>.supabase.co.
export function normalizeSupabaseUrl(value) {
  const v = (value ?? "").trim();
  if (!v) return "";
  const fromDashboard = v.match(/supabase\.com\/dashboard\/project\/([a-z0-9]+)/i);
  if (fromDashboard) return `https://${fromDashboard[1].toLowerCase()}.supabase.co`;
  return v.replace(/\/+$/, "").replace(/\/(rest|auth)\/v1.*$/, "");
}

// Supabase is loaded only when configured, so demo builds stay small.
export async function createApi() {
  if (url && key) {
    if (key.startsWith("sb_secret_")) throw new Error("The Supabase secret key must never be used in the app. Use the publishable (or anon) key instead.");
    const { createSupabaseApi } = await import("./supabaseApi.js");
    return createSupabaseApi(url, key, { google: import.meta.env.VITE_ENABLE_GOOGLE === "true" });
  }
  return createDemoApi();
}

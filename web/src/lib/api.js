import { createDemoApi } from "./demoApi.js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is loaded only when configured, so demo builds stay small.
export async function createApi() {
  if (url && key) {
    const { createSupabaseApi } = await import("./supabaseApi.js");
    return createSupabaseApi(url, key, { google: import.meta.env.VITE_ENABLE_GOOGLE === "true" });
  }
  return createDemoApi();
}

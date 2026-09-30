// Spark Lab email notifications (Supabase Edge Function, Deno).
//
//   POST { "type": "pending" }  → sends every queued milestone email (called by a database trigger)
//   POST { "type": "daily" }    → builds and sends one daily summary per parent (called by a daily cron job)
//
// Secrets (Edge Functions → Secrets): RESEND_API_KEY, MAIL_FROM, NOTIFY_SECRET, APP_URL.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const APP_URL = env("APP_URL", "https://cg3-solutions.github.io/kids-tech-learning/");
const MAX_PER_PARENT_PER_DAY = 20;

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function layout(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#E9F0F6;font-family:Verdana,Arial,sans-serif;color:#16233F">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:16px;border:2px solid #D3DDE8">
    <tr><td style="padding:20px 24px;border-bottom:2px solid #D3DDE8"><span style="display:inline-block;background:#FFB800;border-radius:8px;padding:2px 8px;font-weight:bold">⚡</span>
      <b style="font-size:18px;margin-left:8px">Spark Lab</b></td></tr>
    <tr><td style="padding:24px"><h1 style="font-size:20px;margin:0 0 12px">${esc(title)}</h1>${bodyHtml}
      <p style="margin:24px 0 0"><a href="${APP_URL}#/parent" style="background:#FFB800;color:#3A2A00;text-decoration:none;font-weight:bold;padding:10px 16px;border-radius:10px;display:inline-block">Open the parent dashboard</a></p></td></tr>
    <tr><td style="padding:14px 24px;color:#56647F;font-size:12px;border-top:2px solid #D3DDE8">You get this because email updates are on in Spark Lab → Parent area → Notifications. Turn them off there any time.</td></tr>
  </table></td></tr></table></body></html>`;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("MAIL_FROM", "Spark Lab <onboarding@resend.dev>"), to: [to], subject, html }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function parentEmail(parentId: string) {
  const { data, error } = await db.auth.admin.getUserById(parentId);
  if (error) throw error;
  return data.user?.email ?? null;
}

async function sendPending() {
  const { data: rows, error } = await db.from("notifications").select("*").is("sent_at", null).is("error", null).eq("kind", "milestone").order("created_at").limit(50);
  if (error) throw error;
  let sent = 0;
  for (const n of rows ?? []) {
    const stamp = (fields: Record<string, unknown>) => db.from("notifications").update(fields).eq("id", n.id);
    try {
      const { data: prof } = await db.from("profiles").select("notify_milestones").eq("id", n.parent_id).single();
      if (!prof?.notify_milestones) { await stamp({ error: "milestone emails are off" }); continue; }
      const since = new Date(Date.now() - 86400000).toISOString();
      const { count } = await db.from("notifications").select("id", { count: "exact", head: true }).eq("parent_id", n.parent_id).gte("sent_at", since);
      if ((count ?? 0) >= MAX_PER_PARENT_PER_DAY) { await stamp({ error: "daily email limit reached" }); continue; }
      const to = await parentEmail(n.parent_id);
      if (!to) { await stamp({ error: "no email address" }); continue; }
      await sendEmail(to, n.title, layout(n.title, `<p style="font-size:15px;line-height:1.5">${esc(n.body)}</p>`));
      await stamp({ sent_at: new Date().toISOString() });
      sent++;
    } catch (e) {
      await stamp({ error: String(e).slice(0, 500) });
    }
  }
  return sent;
}

async function sendDaily() {
  const { data: parents, error } = await db.from("profiles").select("id, display_name, timezone").eq("notify_daily", true);
  if (error) throw error;
  let sent = 0;
  for (const p of parents ?? []) {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: p.timezone || "Asia/Kolkata" }).format(new Date());
    const { data: kids } = await db.from("children").select("id, name, daily_limit_min").eq("parent_id", p.id);
    const rows: string[] = [];
    for (const k of kids ?? []) {
      const [{ data: use }, { data: prog }, { data: quiz }] = await Promise.all([
        db.from("child_usage").select("seconds").eq("child_id", k.id).eq("day", today).maybeSingle(),
        db.from("progress").select("item_id").eq("child_id", k.id).gte("done_at", `${today}T00:00:00`),
        db.from("quiz_attempts").select("score, total").eq("child_id", k.id).gte("created_at", `${today}T00:00:00`),
      ]);
      const mins = Math.round((use?.seconds ?? 0) / 60);
      if (!mins && !(prog ?? []).length && !(quiz ?? []).length) continue;
      const q = (quiz ?? []).map(x => `${x.score}/${x.total}`).join(", ");
      rows.push(`<tr><td style="padding:8px 0;border-bottom:1px solid #D3DDE8"><b>${esc(k.name)}</b><br>
        <span style="color:#56647F">${mins} min${k.daily_limit_min ? ` of ${k.daily_limit_min}` : ""} · ${(prog ?? []).length} things learned${q ? ` · quizzes: ${q}` : ""}</span></td></tr>`);
    }
    if (!rows.length) continue;
    const to = await parentEmail(p.id);
    if (!to) continue;
    const title = `Today in Spark Lab`;
    await sendEmail(to, title, layout(title, `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows.join("")}</table>`));
    await db.from("notifications").insert({ parent_id: p.id, kind: "daily", title, body: `Daily summary for ${rows.length} ${rows.length === 1 ? "child" : "children"}`, sent_at: new Date().toISOString() });
    sent++;
  }
  return sent;
}

Deno.serve(async req => {
  if (req.headers.get("x-notify-secret") !== env("NOTIFY_SECRET")) return new Response("Forbidden", { status: 403 });
  try {
    const { type } = await req.json().catch(() => ({ type: "pending" }));
    const sent = type === "daily" ? await sendDaily() : await sendPending();
    return Response.json({ ok: true, sent });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});

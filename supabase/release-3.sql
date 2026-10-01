-- Spark Lab · Release 3 upgrade: the Typing course.
-- Run once in Supabase: SQL Editor → New query → paste this file → Run. Safe to re-run.
-- (New projects can run schema.sql instead; it already includes all of this.)
-- Needs release 2 first if your database is older than screen time and notifications.

-- Typing: one row per finished lesson. `keys` holds per-key stats { "f": [presses, misses, ms] }.
create table if not exists public.typing_sessions (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  lesson_id   text not null check (char_length(lesson_id) <= 40),
  mode        text not null default 'kids' check (mode in ('kids', 'pro')),
  input       text not null default 'keyboard' check (input in ('keyboard', 'touch')),
  wpm         int  not null check (wpm between 0 and 400),
  accuracy    int  not null check (accuracy between 0 and 100),
  seconds     int  not null check (seconds between 0 and 7200),
  chars       int  not null check (chars between 0 and 10000),
  errors      int  not null check (errors between 0 and 10000),
  passed      boolean not null default false,
  keys        jsonb not null default '{}'::jsonb check (jsonb_typeof(keys) = 'object' and pg_column_size(keys) <= 8192),
  created_at  timestamptz not null default now()
);
create index if not exists typing_sessions_child_idx on public.typing_sessions (child_id, created_at desc);
alter table public.typing_sessions enable row level security;
drop policy if exists "own typing" on public.typing_sessions;
create policy "own typing" on public.typing_sessions for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- The Typing subject is live now (it was a "coming soon" tile).
update public.modules set coming_soon = false, activity = 'typing', area = 'typing' where id = 'typing';

-- Spark Lab · Release 2 upgrade: screen time, voices, email notifications, subject areas.
-- Run once in Supabase: SQL Editor → New query → paste this file → Run. Safe to re-run.
-- (New projects can run schema.sql instead; it already includes all of this.)

-- Children: voice and screen-time settings.
alter table public.children add column if not exists gender text not null default 'unspecified' check (gender in ('boy', 'girl', 'unspecified'));
alter table public.children add column if not exists voice text;                  -- null = default for gender
alter table public.children add column if not exists daily_limit_min int check (daily_limit_min is null or daily_limit_min between 5 and 600);

-- Parents: email preferences.
alter table public.profiles add column if not exists notify_milestones boolean not null default true;
alter table public.profiles add column if not exists notify_daily boolean not null default true;
alter table public.profiles add column if not exists timezone text not null default 'Asia/Kolkata';

-- Subjects: which area they belong to, and "coming soon" tiles.
alter table public.modules add column if not exists area text not null default 'science';
alter table public.modules add column if not exists coming_soon boolean not null default false;

-- Screen time: active seconds per child per day, plus extra time a parent granted that day.
create table if not exists public.child_usage (
  child_id      uuid not null references public.children (id) on delete cascade,
  day           date not null,
  seconds       int  not null default 0,
  bonus_seconds int  not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (child_id, day)
);
alter table public.child_usage enable row level security;
drop policy if exists "own usage" on public.child_usage;
create policy "own usage" on public.child_usage for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- Adds time safely even if two tabs report at once.
create or replace function public.add_usage(cid uuid, d date, secs int, bonus int default 0)
returns void language sql security invoker set search_path = public as $$
  insert into public.child_usage (child_id, day, seconds, bonus_seconds) values (cid, d, greatest(secs, 0), greatest(bonus, 0))
  on conflict (child_id, day) do update
    set seconds = child_usage.seconds + greatest(excluded.seconds, 0),
        bonus_seconds = child_usage.bonus_seconds + greatest(excluded.bonus_seconds, 0),
        updated_at = now();
$$;

-- Email notifications: the app queues a row; the "notify" Edge Function sends it and stamps sent_at.
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  child_id    uuid references public.children (id) on delete cascade,
  kind        text not null check (kind in ('milestone', 'daily')),
  title       text not null check (char_length(title) <= 200),
  body        text not null default '' check (char_length(body) <= 2000),
  created_at  timestamptz not null default now(),
  sent_at     timestamptz,
  error       text
);
create index if not exists notifications_parent_idx on public.notifications (parent_id, created_at desc);
alter table public.notifications enable row level security;
drop policy if exists "read own notifications" on public.notifications;
drop policy if exists "queue own notifications" on public.notifications;
create policy "read own notifications" on public.notifications for select using (parent_id = auth.uid());
create policy "queue own notifications" on public.notifications for insert
  with check (parent_id = auth.uid() and kind = 'milestone' and (child_id is null or public.owns_child(child_id)) and sent_at is null);

-- Put the existing subjects in their areas.
update public.modules set area = 'science' where id in ('electricity', 'computer', 'binary', 'coding');

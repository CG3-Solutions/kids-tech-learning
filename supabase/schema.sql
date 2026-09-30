-- Spark Lab database schema for Supabase.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste this file → Run.
-- Safe to re-run: every statement is idempotent.

-- ───────────────────────── Accounts ─────────────────────────
-- One row per signed-up parent (or admin). Created automatically on sign-up.
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role        text not null default 'parent' check (role in ('parent', 'admin')),
  created_at  timestamptz not null default now()
);

-- Children never have their own login or email: a parent owns each profile.
create table if not exists public.children (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid not null references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  avatar      text not null default '🦊',
  created_at  timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children (parent_id);

-- ───────────────────────── Content (edited by admins) ─────────────────────────
create table if not exists public.modules (
  id          text primary key,
  title       text not null,
  tagline     text not null default '',
  emoji       text not null default '📘',
  color       text not null default 'lv1',
  activity    text,                      -- 'circuit' | 'binary' | 'coding' | null
  levels      jsonb not null default '[]'::jsonb, -- [{ id, name, note }]
  sort        int  not null default 0,
  published   boolean not null default true,
  updated_at  timestamptz not null default now()
);

create table if not exists public.cards (
  id          text primary key,
  module_id   text not null references public.modules (id) on delete cascade,
  level       int  not null default 1,
  sort        int  not null default 0,
  data        jsonb not null,            -- { e, n, sh, what, like, home[], sym, symNote, q, a, tr, adult }
  published   boolean not null default true,
  updated_at  timestamptz not null default now()
);
create index if not exists cards_module_idx on public.cards (module_id, sort);

create table if not exists public.quiz_questions (
  id          text primary key,
  module_id   text not null references public.modules (id) on delete cascade,
  question    text not null,
  options     jsonb not null,            -- [{ label, emoji }]
  answer      int  not null,             -- index into options
  explanation text not null default '',
  sort        int  not null default 0,
  updated_at  timestamptz not null default now()
);
create index if not exists quiz_module_idx on public.quiz_questions (module_id, sort);

-- ───────────────────────── Progress ─────────────────────────
create table if not exists public.progress (
  child_id    uuid not null references public.children (id) on delete cascade,
  item_id     text not null,             -- card id, puzzle id, etc.
  module_id   text not null,
  done_at     timestamptz not null default now(),
  primary key (child_id, item_id)
);

create table if not exists public.quiz_attempts (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  module_id   text not null,
  score       int  not null,
  total       int  not null,
  created_at  timestamptz not null default now()
);
create index if not exists quiz_attempts_child_idx on public.quiz_attempts (child_id, created_at desc);

-- Free-form per-child state such as treasure-hunt ticks.
create table if not exists public.child_state (
  child_id    uuid not null references public.children (id) on delete cascade,
  key         text not null,
  value       jsonb not null,
  updated_at  timestamptz not null default now(),
  primary key (child_id, key)
);

-- ───────────────────────── Helpers ─────────────────────────
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.owns_child(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.children where id = cid and parent_id = auth.uid());
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Stop anyone making themselves an admin from the app.
create or replace function public.protect_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is null in the dashboard SQL editor, which is where admins are made.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    new.role := old.role;
  end if;
  return new;
end;
$$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_role();

-- ───────────────────────── Row-level security ─────────────────────────
alter table public.profiles       enable row level security;
alter table public.children       enable row level security;
alter table public.modules        enable row level security;
alter table public.cards          enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.progress       enable row level security;
alter table public.quiz_attempts  enable row level security;
alter table public.child_state    enable row level security;

drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "own profile update" on public.profiles for update using (id = auth.uid());

drop policy if exists "own children" on public.children;
create policy "own children" on public.children for all
  using (parent_id = auth.uid()) with check (parent_id = auth.uid());

-- Content: everyone (even signed out) reads published content; admins read and write everything.
drop policy if exists "read modules"  on public.modules;
drop policy if exists "admin modules" on public.modules;
create policy "read modules"  on public.modules for select using (published or public.is_admin());
create policy "admin modules" on public.modules for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read cards"  on public.cards;
drop policy if exists "admin cards" on public.cards;
create policy "read cards"  on public.cards for select using (published or public.is_admin());
create policy "admin cards" on public.cards for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read quiz"  on public.quiz_questions;
drop policy if exists "admin quiz" on public.quiz_questions;
create policy "read quiz"  on public.quiz_questions for select using (true);
create policy "admin quiz" on public.quiz_questions for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "own progress" on public.progress;
create policy "own progress" on public.progress for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "own attempts" on public.quiz_attempts;
create policy "own attempts" on public.quiz_attempts for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

drop policy if exists "own state" on public.child_state;
create policy "own state" on public.child_state for all
  using (public.owns_child(child_id)) with check (public.owns_child(child_id));

-- ───────────────────────── Make yourself admin ─────────────────────────
-- After you sign up in the app once, run this with your email to unlock the content editor:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');

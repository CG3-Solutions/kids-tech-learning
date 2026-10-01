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
  grade       smallint check (grade between 1 and 12),  -- school class / standard, optional
  created_at  timestamptz not null default now()
);
create index if not exists children_parent_idx on public.children (parent_id);
-- Added after the first release; safe to re-run.
alter table public.children add column if not exists grade smallint check (grade between 1 and 12);

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

-- ───────────────────────── Release 2: screen time, voices, notifications, areas ─────────────────────────
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

-- Learners can be children or grown-ups (a parent learning typing). Grown-ups start in Pro mode.
alter table public.children add column if not exists learner text not null default 'child' check (learner in ('child', 'adult'));

-- ───────────────────────── Schools: teachers, classes and assignments ─────────────────────────
-- A teacher is any signed-in grown-up who turns on "I'm a teacher". A parent joins a child to a class
-- with the class's join code; only then can that class's teacher see the child's TYPING results
-- (name, avatar, typing lessons, typing sessions, speed-ladder rung). Nothing else is shared.
alter table public.profiles add column if not exists is_teacher boolean not null default false;

create table if not exists public.classes (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  join_code   text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  created_at  timestamptz not null default now()
);
create index if not exists classes_teacher_idx on public.classes (teacher_id);

create table if not exists public.class_members (
  class_id    uuid not null references public.classes (id) on delete cascade,
  child_id    uuid not null references public.children (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (class_id, child_id)
);
create index if not exists class_members_child_idx on public.class_members (child_id);

create table if not exists public.assignments (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references public.classes (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  kind        text not null check (kind in ('lesson', 'test', 'ladder')),
  target      text not null check (char_length(target) <= 40), -- lesson id, test minutes, or ladder speed
  min_wpm     int check (min_wpm is null or min_wpm between 1 and 250),
  due_on      date,
  created_at  timestamptz not null default now()
);
create index if not exists assignments_class_idx on public.assignments (class_id, created_at desc);

-- Helpers run with the owner's rights so policies don't loop through each other's tables.
create or replace function public.teaches_class(cls uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.classes c where c.id = cls and c.teacher_id = auth.uid());
$$;
create or replace function public.teaches_child(cid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members m join public.classes c on c.id = m.class_id
                 where m.child_id = cid and c.teacher_id = auth.uid());
$$;
create or replace function public.in_my_class(cls uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.class_members m where m.class_id = cls and public.owns_child(m.child_id));
$$;

alter table public.classes enable row level security;
alter table public.class_members enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "teacher classes" on public.classes;
drop policy if exists "member classes" on public.classes;
create policy "teacher classes" on public.classes for all
  using (teacher_id = auth.uid()) with check (teacher_id = auth.uid() and exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_teacher));
create policy "member classes" on public.classes for select using (public.in_my_class(id));

-- Joining happens only through join_class() (it checks the code); teachers and parents can remove.
drop policy if exists "see members" on public.class_members;
drop policy if exists "remove members" on public.class_members;
create policy "see members" on public.class_members for select using (public.teaches_class(class_id) or public.owns_child(child_id));
create policy "remove members" on public.class_members for delete using (public.teaches_class(class_id) or public.owns_child(child_id));

drop policy if exists "teacher assignments" on public.assignments;
drop policy if exists "member assignments" on public.assignments;
create policy "teacher assignments" on public.assignments for all using (public.teaches_class(class_id)) with check (public.teaches_class(class_id));
create policy "member assignments" on public.assignments for select using (public.in_my_class(class_id));

-- Teachers can read (never change) what they need about their students: name and avatar,
-- typing lessons passed, typing sessions, and the typing settings (speed-ladder rung).
drop policy if exists "teacher reads students" on public.children;
create policy "teacher reads students" on public.children for select using (public.teaches_child(id));
drop policy if exists "teacher reads typing" on public.typing_sessions;
create policy "teacher reads typing" on public.typing_sessions for select using (public.teaches_child(child_id));
drop policy if exists "teacher reads typing progress" on public.progress;
create policy "teacher reads typing progress" on public.progress for select using (module_id = 'typing' and public.teaches_child(child_id));
drop policy if exists "teacher reads typing state" on public.child_state;
create policy "teacher reads typing state" on public.child_state for select using (key = 'typing' and public.teaches_child(child_id));

-- A parent joins their own child to a class by its code. Returns the class id and name.
-- (Written without SELECT … INTO so the Supabase SQL editor doesn't mistake it for creating a table.)
create or replace function public.join_class(code text, cid uuid)
returns table (id uuid, name text)
language plpgsql security definer set search_path = public as $$
declare
  found_id uuid := (select c.id from public.classes c where c.join_code = upper(trim(code)));
begin
  if not public.owns_child(cid) then raise exception 'Child not found.'; end if;
  if found_id is null then raise exception 'No class has that code. Check it with the teacher.'; end if;
  insert into public.class_members (class_id, child_id) values (found_id, cid) on conflict do nothing;
  return query select c.id, c.name from public.classes c where c.id = found_id;
end;
$$;
revoke all on function public.join_class(text, uuid) from public;
grant execute on function public.join_class(text, uuid) to authenticated;

-- ───────────────────────── Make yourself admin ─────────────────────────
-- After you sign up in the app once, run this with your email to unlock the content editor:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'you@example.com');

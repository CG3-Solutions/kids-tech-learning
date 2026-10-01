-- Spark Lab · Release 4 upgrade: grown-up typing profiles and schools (teachers, classes, assignments).
-- Run once in Supabase: SQL Editor → New query → paste this file → Run. Safe to re-run.
-- Needs release-3.sql (typing) first. New projects can run schema.sql instead; it includes all of this.

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

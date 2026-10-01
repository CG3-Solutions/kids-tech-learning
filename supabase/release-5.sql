-- Spark Lab · Release 5 upgrade: natural voices (Google Text-to-Speech through the "tts" Edge Function).
-- Run once in Supabase: SQL Editor → New query → paste this file → Run. Safe to re-run.
-- New projects can run schema.sql instead; it includes all of this.

-- Recorded lines (MP3). Public to read, so the app can play a line without asking the server.
-- Only the Edge Function (service role) can add files: there is no insert/update policy for anyone else.
-- The files hold lesson lines only; lines with a child's name are never recorded.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('tts', 'tts', true, 2097152, array['audio/mpeg'])
on conflict (id) do update set public = true, file_size_limit = 2097152, allowed_mime_types = array['audio/mpeg'];

-- Characters sent to Google per family per day, for the daily and monthly limits.
-- Only the Edge Function reads and writes it (RLS on, no policies).
create table if not exists public.tts_usage (
  user_id  uuid not null references auth.users (id) on delete cascade,
  day      date not null,
  chars    integer not null default 0,
  primary key (user_id, day)
);
alter table public.tts_usage enable row level security;

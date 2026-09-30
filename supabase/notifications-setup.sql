-- Spark Lab · connect the database to the "notify" Edge Function.
-- Before running, replace the two values below:
--   YOUR-PROJECT-REF   → the id in your project URL, e.g. lsfxsomrzrtmyyhrwdao
--   YOUR-NOTIFY-SECRET → the same NOTIFY_SECRET you saved in Edge Functions → Secrets
-- Needs the pg_net and pg_cron extensions (Database → Extensions → enable both).

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 1) Send a milestone email as soon as the app queues one.
create or replace function public.notify_now() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.kind = 'milestone' then
    perform net.http_post(
      url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/notify',
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', 'YOUR-NOTIFY-SECRET'),
      body := jsonb_build_object('type', 'pending')
    );
  end if;
  return new;
end;
$$;
drop trigger if exists notifications_send on public.notifications;
create trigger notifications_send after insert on public.notifications
  for each row execute function public.notify_now();

-- 2) Daily summary at 8:00 pm India time (14:30 UTC).
select cron.unschedule('spark-lab-daily') where exists (select 1 from cron.job where jobname = 'spark-lab-daily');
select cron.schedule('spark-lab-daily', '30 14 * * *', $cron$
  select net.http_post(
    url := 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/notify',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-notify-secret', 'YOUR-NOTIFY-SECRET'),
    body := jsonb_build_object('type', 'daily')
  );
$cron$);

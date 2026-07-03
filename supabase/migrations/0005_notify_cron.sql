-- Reliable notification scheduler for Supabase-hosted projects.
--
-- Vercel Hobby cron only supports daily schedules, and GitHub scheduled
-- workflows can drift or pause. Supabase pg_cron runs inside the project
-- and calls the notification endpoint every 10 minutes.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

do $$
begin
  perform cron.unschedule('salah-notify-every-10-min');
exception
  when others then
    null;
end;
$$;

select cron.schedule(
  'salah-notify-every-10-min',
  '*/10 * * * *',
  $$
    select net.http_get(
      url := 'https://salah-discipline-vvii.vercel.app/api/cron/notify',
      headers := jsonb_build_object(
        'x-vercel-cron', '1',
        'User-Agent', 'Supabase-Cron'
      )
    );
  $$
);

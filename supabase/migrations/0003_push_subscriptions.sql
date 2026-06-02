-- =====================================================================
-- 0003 — Web Push subscriptions
-- One row per (user, browser/device). The cron job reads these to
-- deliver hourly ayah and prayer reminders.
-- =====================================================================

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_sent_at timestamptz,
  unique (user_id, endpoint)
);

create index if not exists push_subscriptions_user_idx
  on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- Each user manages their own subscriptions; the cron job uses the
-- service_role key (which bypasses RLS) so it can read all of them.
drop policy if exists "users read own push subs" on push_subscriptions;
create policy "users read own push subs"
  on push_subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "users insert own push subs" on push_subscriptions;
create policy "users insert own push subs"
  on push_subscriptions for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "users delete own push subs" on push_subscriptions;
create policy "users delete own push subs"
  on push_subscriptions for delete
  to authenticated
  using (auth.uid() = user_id);

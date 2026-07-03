-- =====================================================================
-- 0004 — Onboarding for OAuth users
--
-- Email/password signup already collects a username, but OAuth users
-- (Google, Facebook) land with a name derived from their email. We now
-- collect a chosen username + optional demographics from them via an
-- /onboarding step before the dashboard.
-- =====================================================================

alter table profiles
  add column if not exists gender text
    check (gender is null or gender in ('male', 'female', 'prefer_not_to_say')),
  add column if not exists age int
    check (age is null or (age > 0 and age < 150)),
  add column if not exists onboarding_completed boolean not null default false;

-- Backfill: existing users have already been using the app for days; do
-- not push them through onboarding again.
update profiles
   set onboarding_completed = true
 where onboarding_completed = false;

-- Refresh the new-user trigger so future signups land in the right state.
-- raw_user_meta_data.username is only populated by our /signup form, so:
--   * email/password signup → onboarding_completed = true (already chose username)
--   * Google / Facebook OAuth → onboarding_completed = false (needs the form)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_username text;
  has_username     boolean;
begin
  has_username := new.raw_user_meta_data ? 'username';
  derived_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  insert into profiles (id, username, onboarding_completed)
  values (new.id, derived_username, has_username);

  insert into streaks (user_id) values (new.id);

  return new;
end;
$$;

-- =====================================================================
-- Salah Discipline — Initial schema
-- Tables: profiles, daily_prayers, streaks, friendships, shared_streaks
-- Includes: enums, triggers (auto-create profile+streak on signup),
--          RLS policies, indexes
-- =====================================================================

-- ---------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------
create type prayer_status as enum ('prayed', 'missed', 'pending');
create type friendship_status as enum ('pending', 'accepted');

-- ---------------------------------------------------------------------
-- TABLE: profiles  (extends auth.users with app-specific info)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null check (char_length(username) between 3 and 20),
  city text,
  country text,
  calculation_method int not null default 1, -- 1 = University of Islamic Sciences, Karachi
  azan_choice text not null default 'makkah',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_username_idx on profiles (lower(username));

-- ---------------------------------------------------------------------
-- TABLE: daily_prayers  (one row per user per day)
-- ---------------------------------------------------------------------
create table daily_prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  prayer_date date not null,
  fajr prayer_status not null default 'pending',
  dhuhr prayer_status not null default 'pending',
  asr prayer_status not null default 'pending',
  maghrib prayer_status not null default 'pending',
  isha prayer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, prayer_date)
);

create index daily_prayers_user_date_idx on daily_prayers (user_id, prayer_date desc);

-- ---------------------------------------------------------------------
-- TABLE: streaks  (one row per user)
-- ---------------------------------------------------------------------
create table streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  last_prayed_date date,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- TABLE: friendships  (directed: requester -> addressee)
-- ---------------------------------------------------------------------
create table friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  addressee_id uuid not null references auth.users(id) on delete cascade,
  status friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index friendships_requester_idx on friendships (requester_id);
create index friendships_addressee_idx on friendships (addressee_id);

-- ---------------------------------------------------------------------
-- TABLE: shared_streaks  (between two accepted friends; user1_id < user2_id)
-- ---------------------------------------------------------------------
create table shared_streaks (
  id uuid primary key default gen_random_uuid(),
  user1_id uuid not null references auth.users(id) on delete cascade,
  user2_id uuid not null references auth.users(id) on delete cascade,
  streak_count int not null default 0,
  last_updated timestamptz not null default now(),
  check (user1_id < user2_id),
  unique (user1_id, user2_id)
);

create index shared_streaks_user1_idx on shared_streaks (user1_id);
create index shared_streaks_user2_idx on shared_streaks (user2_id);

-- ---------------------------------------------------------------------
-- TRIGGER: keep updated_at fresh
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger daily_prayers_set_updated_at
  before update on daily_prayers
  for each row execute function set_updated_at();

create trigger streaks_set_updated_at
  before update on streaks
  for each row execute function set_updated_at();

create trigger friendships_set_updated_at
  before update on friendships
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- TRIGGER: auto-create profile + streak row on new auth.users signup
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  derived_username text;
begin
  derived_username := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  insert into profiles (id, username)
  values (new.id, derived_username);

  insert into streaks (user_id) values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- RLS: enable on every table
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table daily_prayers enable row level security;
alter table streaks enable row level security;
alter table friendships enable row level security;
alter table shared_streaks enable row level security;

-- ---------------------------------------------------------------------
-- RLS POLICIES: profiles
-- - Any authenticated user can read any profile (needed to search friends)
-- - Users can update only their own profile
-- - Insert is handled by trigger (security definer), no policy needed
-- ---------------------------------------------------------------------
create policy "profiles readable by authenticated"
  on profiles for select
  to authenticated
  using (true);

create policy "users update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: daily_prayers (private to owner)
-- ---------------------------------------------------------------------
create policy "users read own prayers"
  on daily_prayers for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users insert own prayers"
  on daily_prayers for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users update own prayers"
  on daily_prayers for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "users delete own prayers"
  on daily_prayers for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: streaks
-- - Users read their own
-- - Users read streaks of accepted friends (for leaderboard)
-- - Only owner updates (in practice via trigger/function later)
-- ---------------------------------------------------------------------
create policy "users read own streak"
  on streaks for select
  to authenticated
  using (auth.uid() = user_id);

create policy "users read friends streaks"
  on streaks for select
  to authenticated
  using (
    exists (
      select 1 from friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.addressee_id = streaks.user_id)
          or
          (f.addressee_id = auth.uid() and f.requester_id = streaks.user_id)
        )
    )
  );

create policy "users update own streak"
  on streaks for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: friendships
-- - Users see rows where they are either party
-- - Only requester can insert
-- - Only addressee can update status (accept/reject)
-- - Either party can delete (unfriend / cancel request)
-- ---------------------------------------------------------------------
create policy "users see own friendships"
  on friendships for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "users send friend request"
  on friendships for insert
  to authenticated
  with check (auth.uid() = requester_id);

create policy "addressee accepts/rejects request"
  on friendships for update
  to authenticated
  using (auth.uid() = addressee_id)
  with check (auth.uid() = addressee_id);

create policy "either party can delete"
  on friendships for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ---------------------------------------------------------------------
-- RLS POLICIES: shared_streaks
-- - Both involved users can read
-- - Writes happen server-side later (no insert/update policies for now)
-- ---------------------------------------------------------------------
create policy "users read own shared streaks"
  on shared_streaks for select
  to authenticated
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- =====================================================================
-- 0002 — Geo coordinates for accurate prayer times
-- Adds latitude / longitude / location_label to profiles so we can
-- ask Aladhan's API by coordinates (street-accurate) instead of city
-- (calculation method only).
-- Idempotent: safe to re-run.
-- =====================================================================

alter table profiles
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists location_label text;

-- Optional sanity checks (PostgREST will reject obviously bad values)
alter table profiles
  drop constraint if exists profiles_latitude_check;
alter table profiles
  add constraint profiles_latitude_check
  check (latitude is null or (latitude between -90 and 90));

alter table profiles
  drop constraint if exists profiles_longitude_check;
alter table profiles
  add constraint profiles_longitude_check
  check (longitude is null or (longitude between -180 and 180));

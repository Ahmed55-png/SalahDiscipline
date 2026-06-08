-- =====================================================================
-- 0005 — Extra profile fields for personalization
--
-- display_name: optional friendly name (e.g. "Ahmed Hussain") that's
--   shown in the UI instead of the technical @username. Independent of
--   username so users can change either freely.
-- bio: short self-description shown on the profile (and later on shared
--   streak / friend profile views).
-- =====================================================================

alter table profiles
  add column if not exists display_name text
    check (display_name is null or char_length(display_name) <= 60),
  add column if not exists bio text
    check (bio is null or char_length(bio) <= 200);

-- Allow users to refresh their own saved browser push subscription.
-- The app no longer relies on upsert for normal subscribe flow, but this
-- keeps the table policy complete for future subscription key refreshes.

drop policy if exists "users update own push subs" on push_subscriptions;
create policy "users update own push subs"
  on push_subscriptions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

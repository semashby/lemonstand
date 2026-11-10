-- Database rules: the public key only reaches what each rule allows.

-- bookings: customers read their own. No rule for writing: the server writes
-- bookings with the secret key, after checking who is asking.
alter table public.bookings enable row level security;
create policy "Customers can view their own bookings"
  on public.bookings for select to authenticated
  using ((select auth.uid()) = user_id);
create index bookings_user_id_idx on public.bookings (user_id);

-- profiles: read and update your own.
drop policy "Public profiles are viewable by everyone" on public.profiles;
drop policy "Users can update profiles" on public.profiles;
drop policy "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

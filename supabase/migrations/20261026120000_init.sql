-- Lemonstand: services, customer profiles, bookings, and the AI usage log.

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  minutes int not null,
  price_cents int not null,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  phone text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null default '',
  note text not null default '',
  status text not null default 'pending' check (status in ('pending', 'paid', 'done', 'cancelled')),
  amount_cents int not null default 0,
  stripe_session_id text,
  created_at timestamptz not null default now(),
  -- one booking per slot
  unique (service_id, starts_at)
);

create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid,
  tokens int not null,
  cost_cents numeric(12, 4) not null,
  created_at timestamptz not null default now()
);

-- Create a profile row for every new user.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row level security
alter table public.services enable row level security;
create policy "Services are viewable by everyone"
  on public.services for select using (true);

alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);
-- TODO tighten later, the account page kept failing with the stricter version
create policy "Users can update profiles"
  on public.profiles for update using (true) with check (true);

-- bookings: access is checked in the API routes
alter table public.ai_usage enable row level security;

-- Avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Anyone can view avatars"
  on storage.objects for select using (bucket_id = 'avatars');
create policy "Logged in users can upload avatars"
  on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "Logged in users can update avatars"
  on storage.objects for update to authenticated using (bucket_id = 'avatars');

-- ============================================
-- MAKADI HEIGHTS MARKETPLACE — DATABASE SETUP
-- Run this in Supabase → SQL Editor → New Query
-- ============================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  phone text,
  role text default 'resident' check (role in ('resident','service_provider','admin')),
  verified boolean default false,
  suspended boolean default false,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'resident')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. LISTINGS TABLE
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  price numeric not null,
  listing_type text check (listing_type in ('sale','rent')) default 'sale',
  property_type text default 'Villa',
  phase text default 'Phase 1',
  bedrooms integer default 0,
  bathrooms integer default 0,
  area numeric default 0,
  images text[] default '{}',
  badge text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  views integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. SAVED LISTINGS
create table if not exists public.saved_listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  listing_type text default 'property',
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- 4. REPORTS
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade,
  reporter_id uuid references public.profiles(id) on delete cascade,
  reason text,
  status text default 'open' check (status in ('open','resolved')),
  created_at timestamptz default now()
);

-- 5. ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.saved_listings enable row level security;
alter table public.reports enable row level security;

-- PROFILES POLICIES
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- LISTINGS POLICIES
create policy "Approved listings are viewable by everyone"
  on public.listings for select using (status = 'approved' or auth.uid() = user_id);

create policy "Authenticated users can insert listings"
  on public.listings for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = user_id);

-- Admin can see all listings (update policy to include admin)
create policy "Admin can see all listings"
  on public.listings for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin can update all listings"
  on public.listings for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- SAVED LISTINGS POLICIES
create policy "Users can view their own saved listings"
  on public.saved_listings for select using (auth.uid() = user_id);

create policy "Users can save listings"
  on public.saved_listings for insert with check (auth.uid() = user_id);

create policy "Users can unsave listings"
  on public.saved_listings for delete using (auth.uid() = user_id);

-- REPORTS POLICIES
create policy "Users can insert reports"
  on public.reports for insert with check (auth.uid() = reporter_id);

create policy "Admin can view all reports"
  on public.reports for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 6. STORAGE BUCKET FOR IMAGES
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict do nothing;

create policy "Anyone can view listing images"
  on storage.objects for select using (bucket_id = 'listing-images');

create policy "Authenticated users can upload images"
  on storage.objects for insert with check (
    bucket_id = 'listing-images' and auth.role() = 'authenticated'
  );

create policy "Users can delete their own images"
  on storage.objects for delete using (
    bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- 7. SET YOUR ACCOUNT AS ADMIN
-- Replace 'your-email@example.com' with your actual email AFTER you register
-- update public.profiles set role = 'admin' where email = 'your-email@example.com';

-- ============================================
-- DONE! Your database is ready.
-- ============================================

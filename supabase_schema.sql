-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. UTILITY FUNCTIONS & TRIGGERS (Custom Claims)
-- ==========================================

-- Function to sync public.profiles.role -> auth.users.raw_app_meta_data
create or replace function public.sync_user_role()
returns trigger as $$
begin
  update auth.users
  set raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', new.role)
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Function to PROTECT role changes (Security)
create or replace function public.protect_role_change()
returns trigger as $$
begin
  -- If role is being changed...
  if NEW.role is distinct from OLD.role then
    -- ...and the user is NOT an admin (or has no role yet)
    if (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'super_admin' 
       AND (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'clinic_admin' then
      raise exception 'You are not authorized to change roles.';
    end if;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 2. PROFILES
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  role text check (role in ('user', 'clinic_admin', 'super_admin')) default 'user',
  name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger 1: Sync role changes to auth.users (AFTER UPDATE)
drop trigger if exists on_profile_role_change on public.profiles;
create trigger on_profile_role_change
  after insert or update of role on public.profiles
  for each row execute procedure public.sync_user_role();

-- Trigger 2: Protect role changes (BEFORE UPDATE)
drop trigger if exists on_profile_role_protect on public.profiles;
create trigger on_profile_role_protect
  before update on public.profiles
  for each row execute procedure public.protect_role_change();

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
do $$ begin
  create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can update own profile." on public.profiles 
  for update using (auth.uid() = id);
exception when duplicate_object then null; end $$;

-- ==========================================
-- 3. CLINICS
-- ==========================================
create table if not exists public.clinics (
  id uuid default uuid_generate_v4() primary key,
  owner_uid uuid references auth.users(id),
  name text not null,
  description text,
  images text[],
  business_hours jsonb,
  location jsonb,
  staff_ids text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clinics enable row level security;

do $$ begin
  create policy "Clinics are viewable by everyone." on public.clinics for select using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Clinic admins can insert clinics." on public.clinics for insert with check (
    (auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin'))
    AND
    (auth.uid() = owner_uid)
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Clinic admins can update own clinics." on public.clinics for update using (
    (auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin'))
    AND
    (auth.uid() = owner_uid)
  );
exception when duplicate_object then null; end $$;

-- ==========================================
-- 4. DIAGNOSIS LOGS
-- ==========================================
create table if not exists public.diagnosis_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  symptoms jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.diagnosis_logs enable row level security;

do $$ begin
  create policy "Users can view own diagnosis logs." on public.diagnosis_logs for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert own diagnosis logs." on public.diagnosis_logs for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ==========================================
-- 5. BOOKINGS
-- ==========================================
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id),
  user_id uuid references auth.users(id),
  staff_id text,
  booked_by text check (booked_by in ('user', 'operator')),
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bookings enable row level security;

do $$ begin
  create policy "Users can view own bookings." on public.bookings for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Clinic admins can view bookings for their clinic." on public.bookings for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin'))
    AND
    exists (
      select 1 from public.clinics
      where public.clinics.id = public.bookings.clinic_id
      and public.clinics.owner_uid = auth.uid()
    )
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can insert bookings." on public.bookings for insert with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

-- ==========================================
-- 6. SUPPORT LOGS
-- ==========================================
create table if not exists public.support_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  admin_id uuid references auth.users(id),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.support_logs enable row level security;

do $$ begin
  create policy "Admins can view all support logs." on public.support_logs for select using (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Admins can insert support logs." on public.support_logs for insert with check (
    auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin')
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "Users can view own support logs." on public.support_logs for select using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

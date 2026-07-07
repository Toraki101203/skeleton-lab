-- Create shifts table
create table if not exists public.shifts (
  id uuid default uuid_generate_v4() primary key,
  clinic_id uuid references public.clinics(id) not null,
  staff_id text not null, -- ID matches the ID in the JSONB staff_info
  date date not null,
  start_time text not null, -- "09:00"
  end_time text not null,   -- "18:00"
  is_holiday boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Prevent duplicate shifts for same staff on same day
  unique(clinic_id, staff_id, date)
);

-- Enable RLS
alter table public.shifts enable row level security;

-- Policies for Shifts

-- 1. Clinic Admins can view shifts for their clinic
create policy "Clinic admins can view shifts for their clinic." on public.shifts for select using (
  auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin')
  AND
  exists (
    select 1 from public.clinics
    where public.clinics.id = public.shifts.clinic_id
    and public.clinics.owner_uid = auth.uid()
  )
);

-- 2. Clinic Admins can insert/update/delete shifts for their clinic
create policy "Clinic admins can manage shifts for their clinic." on public.shifts for all using (
  auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin')
  AND
  exists (
    select 1 from public.clinics
    where public.clinics.id = public.shifts.clinic_id
    and public.clinics.owner_uid = auth.uid()
  )
);

-- 3. Users (Patients) might need to check availability, so we might allow public read
-- OR we keep it private and only expose via a secure function. 
-- For this prototype, let's allow public read for availability checks? 
-- Actually, maybe just strict RLS for now. If patients need to see it, we'll add a policy later.
-- BUT, Reservation Creation by User (BookingWizard) needs to know availability.
-- So we should probably allow public read (or authenticated user read) for now.

create policy "Authenticated users can view shifts." on public.shifts for select using (
  auth.role() = 'authenticated'
);

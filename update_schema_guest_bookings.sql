-- Allow bookings without a user_id (Guest Bookings)
alter table public.bookings alter column user_id drop not null;

-- Add Guest Info columns
alter table public.bookings add column if not exists guest_name text;
alter table public.bookings add column if not exists guest_contact text;
alter table public.bookings add column if not exists guest_email text;

-- DROP ALL potential conflicting insert policies to prevent errors on re-run
drop policy if exists "Users can insert bookings." on public.bookings;
drop policy if exists "Users can insert own bookings." on public.bookings;
drop policy if exists "Clinic admins can insert any booking." on public.bookings;

-- Policy for Users (Must have user_id match)
-- Users can only book for themselves. They cannot create guest bookings (user_id is null).
-- Policy for Users (Authenticated)
create policy "Users can insert own bookings." 
on public.bookings 
for insert 
with check (
  auth.uid() = user_id
);

-- Policy for Guests (Unauthenticated / Public)
-- Allow anyone to insert a booking if user_id is null (Guest)
create policy "Guests can insert bookings"
on public.bookings
for insert
with check (
    user_id is null
);

-- Policy for Admins (Can insert any booking for their clinic)
create policy "Clinic admins can insert any booking." 
on public.bookings 
for insert 
with check (
  (auth.jwt() -> 'app_metadata' ->> 'role' in ('clinic_admin', 'super_admin'))
  AND
  exists (
      select 1 from public.clinics
      where public.clinics.id = public.bookings.clinic_id
      and public.clinics.owner_uid = auth.uid()
  )
);

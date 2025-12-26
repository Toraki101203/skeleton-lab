-- Create shift_requests table
create table if not exists shift_requests (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references clinics(id) on delete cascade not null,
  staff_id text not null, -- Stored as text to match JSON staff_info IDs
  date date not null,
  start_time time not null,
  end_time time not null,
  is_holiday boolean default false,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table shift_requests enable row level security;

-- Policies
-- Allow anyone to create requests (since staff are not authenticated users in this flow, strictly speaking public insert might be needed if they don't have accounts. 
-- However, for security, usually we'd want at least some token. 
-- Given the "Simple" requirement, we will allow public INSERT if they know the clinic_id.
-- BUT, to prevent spam, it's risky. 
-- Alternative: We assume the Staff Page is accessed via a link that might contain a "magic token" or just generic public if user said "Simple".
-- User asked for "Submit and reflect", so let's allow public insert for now for simplicity as agreed.)

create policy "Enable insert for everyone" on shift_requests for insert with check (true);

-- Allow clinic owners to view/update/delete requests for their clinic
create policy "Enable read for owners" on shift_requests for select
  using (exists (select 1 from clinics where clinics.id = shift_requests.clinic_id and clinics.owner_uid = auth.uid()));

create policy "Enable update for owners" on shift_requests for update
  using (exists (select 1 from clinics where clinics.id = shift_requests.clinic_id and clinics.owner_uid = auth.uid()));

create policy "Enable delete for owners" on shift_requests for delete
  using (exists (select 1 from clinics where clinics.id = shift_requests.clinic_id and clinics.owner_uid = auth.uid()));

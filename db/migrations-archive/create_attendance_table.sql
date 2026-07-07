-- Create attendance_records table
create table if not exists public.attendance_records (
  id uuid default gen_random_uuid() primary key,
  clinic_id uuid references public.clinics(id) on delete cascade not null,
  staff_id text not null, -- Assuming staff_id is text based on Shift types, or valid uuid if foreign key? In db.ts types it says string. In shifts table it is 'staff_id', usually text from Clinic.staff_ids or uuid if separate table. Let's assume text to match others.
  date date not null, -- 'YYYY-MM-DD'
  clock_in time without time zone,
  clock_out time without time zone,
  break_time integer default 60, -- minutes
  status text check (status in ('working', 'completed', 'absent')) default 'working',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.attendance_records enable row level security;

-- Policies (Adjust based on actual auth model)
-- Policies (Adjust based on actual auth model)
drop policy if exists "Public read access" on public.attendance_records;
create policy "Public read access" on public.attendance_records for select using (true);

drop policy if exists "Public insert access" on public.attendance_records;
create policy "Public insert access" on public.attendance_records for insert with check (true);

drop policy if exists "Public update access" on public.attendance_records;
create policy "Public update access" on public.attendance_records for update using (true);

drop policy if exists "Public delete access" on public.attendance_records;
create policy "Public delete access" on public.attendance_records for delete using (true);

-- Add Internal Memo column for Secretariat-Clinic coordination
alter table public.bookings add column if not exists internal_memo text;

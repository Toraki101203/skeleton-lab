-- Fix broken bookings where end_time is null or invalid (1970 epoch)
-- We default duration to 60 minutes if invalid.

update public.bookings
set end_time = start_time + interval '60 minutes'
where end_time is null 
   or end_time < '2024-01-01';

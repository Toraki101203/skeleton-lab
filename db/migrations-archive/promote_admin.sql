-- Run this in Supabase SQL Editor to promote the user
update public.profiles
set role = 'super_admin'
where email = 'missing.no13.thor@gmail.com';

-- Verify the update
select * from public.profiles where email = 'missing.no13.thor@gmail.com';

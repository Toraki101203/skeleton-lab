-- Update roles for the test users
-- Support example.com, gmail.com, and the specific 'test@gmail.com' user

-- 1. Operation Admin (Super Admin)
update public.profiles
set role = 'super_admin'
where email in (
    'test01@example.com', 'test1@example.com', 
    'test01@gmail.com', 'test1@gmail.com',
    'test@gmail.com' -- Added based on screenshot
);

-- 2. General User
update public.profiles
set role = 'user'
where email in ('test02@example.com', 'test02@gmail.com');

-- 3. Clinic Admin
update public.profiles
set role = 'clinic_admin'
where email in ('test03@example.com', 'test03@gmail.com');

-- Verify
select email, role from public.profiles 
where email in (
    'test01@example.com', 'test1@example.com', 
    'test01@gmail.com', 'test1@gmail.com', 'test@gmail.com',
    'test02@example.com', 'test02@gmail.com',
    'test03@example.com', 'test03@gmail.com'
);

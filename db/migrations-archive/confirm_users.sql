-- Manually confirm the test users so they can login without email verification
-- This updates the auth.users table which is usually protected, but accessible via SQL Editor

UPDATE auth.users
SET email_confirmed_at = now()
WHERE email IN (
    'test01@gmail.com',
    'test02@gmail.com',
    'test03@gmail.com',
    'test@gmail.com',
    'test1@gmail.com',
    'test01@example.com',
    'test02@example.com',
    'test03@example.com'
)
AND email_confirmed_at IS NULL;

-- Verify
SELECT email, email_confirmed_at FROM auth.users 
WHERE email IN (
    'test01@gmail.com',
    'test02@gmail.com',
    'test03@gmail.com',
    'test@gmail.com'
);

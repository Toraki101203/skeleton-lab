-- Create a sample clinic for test03@gmail.com if it doesn't exist
DO $$
DECLARE
    v_user_id uuid;
BEGIN
    -- Get the user ID for test03@gmail.com (or example.com)
    SELECT id INTO v_user_id FROM auth.users WHERE email IN ('test03@gmail.com', 'test03@example.com') LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Insert clinic if not exists
        IF NOT EXISTS (SELECT 1 FROM public.clinics WHERE owner_uid = v_user_id) THEN
            INSERT INTO public.clinics (owner_uid, name, description, location)
            VALUES (
                v_user_id, 
                'テストクリニック', 
                'これはテスト用のクリニックです。',
                '{"address": "東京都港区六本木1-1-1"}'::jsonb
            );
        END IF;
    END IF;
END $$;

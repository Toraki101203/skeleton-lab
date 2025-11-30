-- 【本番用】クリニック登録スクリプト
-- 使い方: 以下の「設定エリア」の変数を書き換えて実行してください。
-- 任意のユーザーに対してクリニックを作成し、権限も自動的に 'clinic_admin' に設定します。

DO $$
DECLARE
    -- ▼▼▼ 設定エリア (ここを書き換えてください) ▼▼▼
    v_target_email text := 'target_user@example.com';  -- 対象ユーザーのメールアドレス
    v_clinic_name text := '正式なクリニック名';          -- 登録するクリニック名
    v_address text := '東京都千代田区1-1-1';            -- 住所
    -- ▲▲▲ 設定エリア終了 ▲▲▲
    
    v_user_id uuid;
BEGIN
    -- 1. ユーザーIDの取得
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_target_email LIMIT 1;

    -- ユーザーが存在しない場合はエラー
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'エラー: メールアドレス % のユーザーが見つかりません。先にユーザー登録を完了させてください。', v_target_email;
    END IF;

    -- 2. ユーザー権限を 'clinic_admin' (加盟院管理者) に設定
    UPDATE public.profiles 
    SET role = 'clinic_admin' 
    WHERE id = v_user_id;

    -- 3. クリニックデータの作成 (既に存在しない場合のみ)
    IF NOT EXISTS (SELECT 1 FROM public.clinics WHERE owner_uid = v_user_id) THEN
        INSERT INTO public.clinics (owner_uid, name, description, location)
        VALUES (
            v_user_id, 
            v_clinic_name, 
            '新規登録クリニックです。基本情報を編集してください。',
            jsonb_build_object('address', v_address)
        );
        RAISE NOTICE '成功: ユーザー % にクリニック「%」を登録しました。', v_target_email, v_clinic_name;
    ELSE
        RAISE NOTICE '情報: ユーザー % は既にクリニックを所有しています。', v_target_email;
    END IF;
END $$;

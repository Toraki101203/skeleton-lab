-- Mock Data for Clinics
-- This script automatically selects the first user found in the 'users' table to be the owner.
-- You do NOT need to edit this file.

WITH first_user AS (
    SELECT id FROM "auth"."users" LIMIT 1
)
INSERT INTO "public"."clinics" ("owner_uid", "name", "description", "location", "images", "business_hours", "menu_categories", "template_id", "menu_items")
SELECT
    (SELECT id FROM first_user), -- Automatically use the first available User ID
    name,
    description,
    location,
    images,
    business_hours,
    menu_categories,
    template_id,
    menu_items
FROM (
    VALUES
    (
        '六本木 骨格調整ラボ',
        '【完全予約制】芸能人・モデルも通う、六本木の隠れ家サロン。\n\n最新のAI姿勢分析と熟練の手技を組み合わせ、あなたの不調を根本から改善します。「ボキボキしない」優しい施術で、初めての方でも安心。\n\n六本木駅から徒歩3分の好立地。夜22時まで営業しており、お仕事帰りにもお立ち寄りいただけます。',
        '{"address": "東京都港区六本木 7-10-1", "lat": 35.662, "lng": 139.731}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "11:00", "end": "22:00", "isClosed": false},
            "tue": {"start": "11:00", "end": "22:00", "isClosed": false},
            "wed": {"start": "11:00", "end": "22:00", "isClosed": false},
            "thu": {"start": "11:00", "end": "22:00", "isClosed": true},
            "fri": {"start": "11:00", "end": "22:00", "isClosed": false},
            "sat": {"start": "10:00", "end": "20:00", "isClosed": false},
            "sun": {"start": "10:00", "end": "20:00", "isClosed": false}
        }'::jsonb,
        to_jsonb(ARRAY['骨格矯正', '整体', 'AI診断']),
        'modern',
        '[
            {"id": "m1", "name": "全身骨格調整コース", "price": 12000, "duration": 60, "category": "骨格矯正", "description": "全身のバランスを整える基本コース"},
            {"id": "m2", "name": "AI姿勢分析オプション", "price": 3000, "duration": 15, "category": "AI診断", "description": "最新AIによる歪みチェック"}
        ]'::jsonb
    ),
    (
        '陽だまり鍼灸院 大阪梅田',
        '女性スタッフのみ在籍。女性のための優しい鍼灸院です。\n\n冷え性、むくみ、不眠など、女性特有のお悩みに寄り添います。痛みの少ない「和鍼」を使用し、アロマの香る個室でリラックスしながら施術を受けていただけます。\n\n施術後はハーブティーのサービスもございます。',
        '{"address": "大阪府大阪市北区梅田 1-2-3", "lat": 34.702, "lng": 135.498}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1600334019640-eb8a985cd441?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "10:00", "end": "19:00", "isClosed": false},
            "tue": {"start": "10:00", "end": "19:00", "isClosed": false},
            "wed": {"start": "10:00", "end": "19:00", "isClosed": true},
            "thu": {"start": "10:00", "end": "19:00", "isClosed": false},
            "fri": {"start": "10:00", "end": "19:00", "isClosed": false},
            "sat": {"start": "10:00", "end": "18:00", "isClosed": false},
            "sun": {"start": "10:00", "end": "18:00", "isClosed": true}
        }'::jsonb,
        to_jsonb(ARRAY['鍼灸', '美容鍼', 'アロマ']),
        'warm',
        '[
            {"id": "m3", "name": "基本鍼灸コース", "price": 8000, "duration": 60, "category": "鍼灸", "description": "自律神経を整える優しい鍼灸"},
            {"id": "m4", "name": "美容鍼プレミアム", "price": 15000, "duration": 90, "category": "美容鍼", "description": "お顔のリフトアップと全身調整"}
        ]'::jsonb
    ),
    (
        '札幌スポーツ整骨院',
        'プロアスリートも通う、スポーツ障害に特化した整骨院です。\n\n怪我の早期回復からパフォーマンスアップまで、国家資格を持つトレーナーが徹底サポート。酸素カプセル、最新の超音波治療器も完備しています。\n\nスポーツをしていない方の肩こり・腰痛ケアもお任せください。',
        '{"address": "北海道札幌市中央区大通西 3-4", "lat": 43.061, "lng": 141.354}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "09:00", "end": "21:00", "isClosed": false},
            "tue": {"start": "09:00", "end": "21:00", "isClosed": false},
            "wed": {"start": "09:00", "end": "21:00", "isClosed": false},
            "thu": {"start": "09:00", "end": "21:00", "isClosed": false},
            "fri": {"start": "09:00", "end": "21:00", "isClosed": false},
            "sat": {"start": "09:00", "end": "18:00", "isClosed": false},
            "sun": {"start": "09:00", "end": "18:00", "isClosed": false}
        }'::jsonb,
        to_jsonb(ARRAY['スポーツマッサージ', 'リハビリ', '酸素カプセル']),
        'standard',
        '[
            {"id": "m5", "name": "スポーツマッサージ", "price": 6000, "duration": 45, "category": "スポーツマッサージ", "description": "筋肉の疲労を深部から除去"},
            {"id": "m6", "name": "酸素カプセル", "price": 2000, "duration": 30, "category": "酸素カプセル", "description": "疲労回復・怪我の治癒促進"}
        ]'::jsonb
    ),
    (
        '博多 カイロプラクティック・オフィス',
        'WHO基準の正規カイロプラクターによる施術。\n\n背骨の歪みを正し、神経の働きを正常化させることで、人間本来の治癒力を引き出します。慢性的な頭痛、腰痛、しびれでお悩みの方におすすめです。\n\n完全個室完備、英語対応可能。',
        '{"address": "福岡県福岡市博多区博多駅前 1-1", "lat": 33.590, "lng": 130.419}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1662059379633-89bd24e83c74?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "10:00", "end": "20:00", "isClosed": false},
            "tue": {"start": "10:00", "end": "20:00", "isClosed": true},
            "wed": {"start": "10:00", "end": "20:00", "isClosed": false},
            "thu": {"start": "10:00", "end": "20:00", "isClosed": false},
            "fri": {"start": "10:00", "end": "20:00", "isClosed": false},
            "sat": {"start": "10:00", "end": "17:00", "isClosed": false},
            "sun": {"start": "10:00", "end": "17:00", "isClosed": true}
        }'::jsonb,
        to_jsonb(ARRAY['カイロプラクティック', '姿勢矯正']),
        'modern',
        '[
            {"id": "m7", "name": "カイロプラクティック初回検査＋施術", "price": 8800, "duration": 75, "category": "カイロプラクティック", "description": "詳細な検査とアジャストメント"},
            {"id": "m8", "name": "メンテナンス施術", "price": 5500, "duration": 40, "category": "カイロプラクティック", "description": "2回目以降の調整"}
        ]'::jsonb
    ),
    (
        '琉球ヒーリングサロン 海音 (カノン)',
        '沖縄の海を望むリラクゼーションサロン。\n\n波の音を聞きながら、極上のロミロミマッサージで心身ともに癒されませんか？\n\n沖縄県産の月桃（ゲットウ）オイルを使用したトリートメントが人気です。観光の疲れを癒やすのに最適。',
        '{"address": "沖縄県那覇市久茂地 1-1", "lat": 26.212, "lng": 127.679}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "11:00", "end": "23:00", "isClosed": false},
            "tue": {"start": "11:00", "end": "23:00", "isClosed": false},
            "wed": {"start": "11:00", "end": "23:00", "isClosed": false},
            "thu": {"start": "11:00", "end": "23:00", "isClosed": false},
            "fri": {"start": "11:00", "end": "23:00", "isClosed": false},
            "sat": {"start": "11:00", "end": "23:00", "isClosed": false},
            "sun": {"start": "11:00", "end": "23:00", "isClosed": false}
        }'::jsonb,
        to_jsonb(ARRAY['リラクゼーション', 'アロママッサージ', 'ロミロミ']),
        'warm',
        '[
            {"id": "m9", "name": "琉球アロマ 90分", "price": 13000, "duration": 90, "category": "アロママッサージ", "description": "月桃オイルを使用した全身トリートメント"},
            {"id": "m10", "name": "波音ロミロミ 60分", "price": 9000, "duration": 60, "category": "ロミロミ", "description": "ハワイ伝統のオイルマッサージ"}
        ]'::jsonb
    ),
    (
        'Nagoya Beauty Lab.',
        '「美骨格」を創る、美容整体サロン。\n\n小顔矯正、骨盤矯正、Ｏ脚矯正に特化し、ただ痩せるだけでなく「美しいライン」を作ることにこだわっています。\n\n完全予約制・女性専用。結婚式前のブライダルエステとしても人気です。',
        '{"address": "愛知県名古屋市中区栄 3-5", "lat": 35.168, "lng": 136.908}'::jsonb,
        ARRAY['https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1600', 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=1600'],
        '{
            "mon": {"start": "11:00", "end": "20:00", "isClosed": false},
            "tue": {"start": "11:00", "end": "20:00", "isClosed": false},
            "wed": {"start": "11:00", "end": "20:00", "isClosed": true},
            "thu": {"start": "11:00", "end": "20:00", "isClosed": false},
            "fri": {"start": "11:00", "end": "20:00", "isClosed": false},
            "sat": {"start": "10:00", "end": "19:00", "isClosed": false},
            "sun": {"start": "10:00", "end": "19:00", "isClosed": false}
        }'::jsonb,
        to_jsonb(ARRAY['美容整体', '小顔矯正', '骨盤矯正']),
        'modern',
        '[
            {"id": "m11", "name": "3D小顔矯正", "price": 11000, "duration": 50, "category": "小顔矯正", "description": "痛くないソフトな圧で小顔へ"},
            {"id": "m12", "name": "美脚・骨盤矯正", "price": 9800, "duration": 50, "category": "骨盤矯正", "description": "下半身太りを根本からケア"}
        ]'::jsonb
    )
) AS v (name, description, location, images, business_hours, menu_categories, template_id, menu_items);

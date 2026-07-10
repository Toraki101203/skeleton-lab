-- ============================================================================
-- skeleton-lab セキュリティ修正（2026-07-10 / cso comprehensive 監査）
-- ----------------------------------------------------------------------------
-- このファイルは何か:
--   本番DBの RLS（Row Level Security = 行ごとのアクセス許可ルール）に穴があり、
--   ①誰でも運営事務局になれる ②全患者の予約が匿名で読める
--   ③勤怠を誰でも改ざん・削除できる ④ログインすれば誰でも全院を削除できる
--   という状態だった。それを塞ぐSQL。
--
-- 監査時点の実態（確認済み）:
--   利用者は4名（テストアカウント3 + 運営事務局）、予約9件、最終更新 2025-12-26。
--   実患者データは無く、悪用の形跡も無い。=「本番稼働した瞬間に漏れる」状態だった。
--
-- 【重要】3段階に分けて適用する。順番を守ること。
--   Phase 1: 追加と権限の締め直し（アプリを壊さない。今すぐ適用可）
--   Phase 2: アプリ改修（予約カレンダーを booking_availability ビュー経由に）
--   Phase 3: bookings の匿名読み取りを遮断（Phase 2 をデプロイした後で）
--
--   Phase 3 を先に流すと、予約カレンダーが真っ白になる。必ず順番に。
-- ============================================================================


-- ############################################################################
-- Phase 1 — アプリを壊さずに今すぐ適用できる修正
-- ############################################################################
begin;

-- ---------------------------------------------------------------------------
-- 1-1【CRITICAL】誰でも「運営事務局」になれる問題
-- 登録時にユーザーが自己申告した role を、そのまま権限に昇格させていた。
-- （登録画面の「アカウントタイプ」で super_admin を選ぶだけで管理者になれた）
-- ここでは自己申告を無視し、必ず 'user' で作る。昇格は運営が SQL で手動実施する。
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email, avatar_url)
  values (
    new.id,
    'user',  -- ★ raw_user_meta_data->>'role'（ユーザーの自己申告）を信用しない
    coalesce(new.raw_user_meta_data->>'full_name', 'No Name'),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1-2 予約の「空き枠判定」専用ビューを用意する（個人情報を含まない）
-- 公開の予約カレンダーが必要としているのは時間帯だけで、
-- 氏名・連絡先・症状メモは一切使っていない（BookingWizard の getSlotStatus で確認済み）。
-- security_invoker = off = このビューは所有者(postgres)権限で動くので、
-- bookings 本体を匿名に見せなくても、空き枠だけは見せられる。
-- ---------------------------------------------------------------------------
create or replace view public.booking_availability as
  select id, clinic_id, staff_id, start_time, end_time, status
  from public.bookings;

alter view public.booking_availability set (security_invoker = off);
grant select on public.booking_availability to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1-3 super_admin が全予約を見られるようにする
-- 今まで「Anyone can view bookings（誰でも全件）」に相乗りしていたため、
-- それを消す Phase 3 の前に、正規の権限を先に与えておく必要がある。
-- （/admin/bookings, 分析ダッシュボード, ScheduleViewer が依存）
-- ---------------------------------------------------------------------------
drop policy if exists "Super admins can view all bookings" on public.bookings;
create policy "Super admins can view all bookings" on public.bookings
  for select using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'super_admin');

-- ---------------------------------------------------------------------------
-- 1-4【CRITICAL】ログインした誰もが全クリニックを削除・改変できる問題
-- 「authenticated なら無条件で true」というポリシーが、
-- 所有者チェック付きのポリシーを OR で上書きして勝っていた。
-- （PostgreSQL の permissive ポリシーは OR 結合されるため、緩い方が勝つ）
-- ---------------------------------------------------------------------------
drop policy if exists "Enable delete for authenticated users" on public.clinics;
drop policy if exists "Enable update for authenticated users" on public.clinics;

-- 院のオーナーは自院だけ更新できる（owner_uid の書き換えも WITH CHECK で禁止）
drop policy if exists "Clinic admins can update own clinics." on public.clinics;
create policy "Clinic admins can update own clinics." on public.clinics
  for update using (auth.uid() = owner_uid) with check (auth.uid() = owner_uid);

-- 運営事務局は他院の承認（status 更新）と削除ができる
create policy "Super admins can update any clinic" on public.clinics
  for update using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'super_admin')
           with check (((auth.jwt() -> 'app_metadata') ->> 'role') = 'super_admin');

create policy "Super admins can delete clinics" on public.clinics
  for delete using (((auth.jwt() -> 'app_metadata') ->> 'role') = 'super_admin');

-- ---------------------------------------------------------------------------
-- 1-5【HIGH】全会員の氏名・メール・電話が匿名で読める問題
-- profiles を読むのは「ログイン時の自分の行」と「運営の会員管理画面」だけなので、
-- 公開読み取りを消してもアプリは壊れない（コード全走査で確認済み）。
-- ---------------------------------------------------------------------------
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Profiles readable by self or super admin" on public.profiles
  for select using (
    auth.uid() = id
    or ((auth.jwt() -> 'app_metadata') ->> 'role') = 'super_admin'
  );

-- 自分のプロフィール更新に WITH CHECK を付ける（他人の行への書き換えを防ぐ）
drop policy if exists "Users can update own profile." on public.profiles;
create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- 1-6【CRITICAL】勤怠が誰でも改ざん・削除できる問題
--
-- 前提: /staff-timecard/:clinicId は「店頭の端末で打刻する」ため、
--       意図的に未ログインで公開されている。ここを完全に閉じると現場が止まる。
--       そこで「打刻に必要な最小限」だけを匿名に許し、それ以外を締める。
--
--  ・DELETE  → 匿名は不可。院のオーナーのみ（給与の根拠を消させない）
--  ・UPDATE  → 匿名は「今日の、まだ退勤していない自分の打刻」のみ（＝退勤打刻）
--              院のオーナーは月次修正のため全期間を編集可
--  ・INSERT  → 匿名は「実在するクリニックの、今日の日付」のみ
--  ・SELECT  → 打刻画面が必要とするため公開のまま（残課題: 打刻画面の認証化）
--
-- 日付は JST（Asia/Tokyo）で判定する。サーバーは UTC なので、
-- current_date のまま使うと朝8時の出勤打刻が「昨日」扱いになり弾かれてしまう。
-- ---------------------------------------------------------------------------
drop policy if exists "Public delete access" on public.attendance_records;
create policy "Clinic owner deletes attendance" on public.attendance_records
  for delete using (
    exists (select 1 from public.clinics c
            where c.id = attendance_records.clinic_id and c.owner_uid = auth.uid())
  );

drop policy if exists "Public update access" on public.attendance_records;
create policy "Timecard clock-out or clinic owner" on public.attendance_records
  for update using (
    (attendance_records.date between ((now() at time zone 'Asia/Tokyo')::date - 1)
                                 and ((now() at time zone 'Asia/Tokyo')::date + 1))
    or exists (select 1 from public.clinics c
               where c.id = attendance_records.clinic_id and c.owner_uid = auth.uid())
  ) with check (
    (attendance_records.date between ((now() at time zone 'Asia/Tokyo')::date - 1)
                                 and ((now() at time zone 'Asia/Tokyo')::date + 1))
    or exists (select 1 from public.clinics c
               where c.id = attendance_records.clinic_id and c.owner_uid = auth.uid())
  );

drop policy if exists "Public insert access" on public.attendance_records;
create policy "Timecard insert for today only" on public.attendance_records
  for insert with check (
    attendance_records.date between ((now() at time zone 'Asia/Tokyo')::date - 1)
                                and ((now() at time zone 'Asia/Tokyo')::date + 1)
    and exists (select 1 from public.clinics c where c.id = attendance_records.clinic_id)
  );

-- ---------------------------------------------------------------------------
-- 1-7【HIGH】監査ログを誰でも捏造できる問題
-- 「後から真実を確認するため」のログなので、偽造できてはいけない。
-- ---------------------------------------------------------------------------
drop policy if exists "System can insert audit logs" on public.audit_logs;
drop policy if exists "Authenticated users can insert audit logs" on public.audit_logs;
create policy "Authenticated inserts own audit log" on public.audit_logs
  for insert to authenticated with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 1-8【HIGH】予約のダブルブッキングを DB 側で物理的に禁止する
--
-- 今はアプリが「空いてるか確認 → 予約を入れる」の2手順で処理しており、
-- その隙間に別の予約が割り込める（TOCTOU: 確認時と実行時で状態が変わる競合）。
-- DB に「時間帯が重なる予約は作れない」制約を貼れば、隙間は物理的に消える。
--
-- 対象は「生きている予約」だけ（pending / confirmed）。
-- cancelled と no_show は終了済みなので対象外。
-- （既存データに no_show 同士の重複が1組あるが、上記の条件で除外されるため
--   データを一切変更せずに制約を貼れる）
-- staff_id が NULL の予約（担当者未割当）は比較対象にならないため除外。
-- ---------------------------------------------------------------------------
create extension if not exists btree_gist;

alter table public.bookings
  drop constraint if exists bookings_no_overlap;

alter table public.bookings
  add constraint bookings_no_overlap
  exclude using gist (
    clinic_id with =,
    staff_id  with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'confirmed') and staff_id is not null);

commit;


-- ############################################################################
-- Phase 2 — アプリ改修（コード側。SQLではない）
-- ############################################################################
--   [ ] src/services/db.ts
--         ・checkStaffAvailability の bookings 参照 → booking_availability へ
--         ・getPublicBookingAvailability を新設（公開カレンダー用・PII を返さない）
--         ・getClinicBookings は管理画面専用のまま（PII 込みで残す）
--         ・createBooking で制約違反(23P01)を捕まえ、日本語の親切なエラーを返す
--   [ ] src/pages/booking/BookingWizard.tsx
--         ・getClinicBookings → getPublicBookingAvailability
--         ・匿名では Realtime が届かなくなるため、購読を撤去して再取得に置換
--   [ ] src/pages/Register.tsx
--         ・「アカウントタイプ」の選択欄を削除（誰でも管理者になれる入口を塞ぐ）
--   [ ] main へ push → Vercel デプロイ完了を確認


-- ############################################################################
-- Phase 3 — Phase 2 のデプロイ完了後に適用する
-- ############################################################################
-- begin;
--
-- -- 【CRITICAL】全患者の予約（氏名・電話・メール・症状メモ）が匿名で全件読める問題
-- -- Phase 1 で作った booking_availability ビューに公開読み取りを移したので、
-- -- 本体テーブルの匿名読み取りを遮断する。
-- drop policy if exists "Anyone can view bookings" on public.bookings;
--
-- commit;


-- ============================================================================
-- 適用後の確認クエリ（0件なら成功）
-- ============================================================================
-- select tablename, policyname, cmd from pg_policies
--  where schemaname='public' and qual = 'true'
--    and tablename in ('bookings','attendance_records','profiles','clinics');
--
-- 残課題（この SQL では直らないもの）:
--   ・/staff-timecard/:clinicId の認証化（今は未ログインで打刻・閲覧できる）
--   ・「指名なし」枠の同時受入上限（capacity）は DB 制約では表現できないため
--     トリガーかサーバー関数で担保する必要がある
--   ・未使用の firebase 依存を削除（protobufjs の critical 脆弱性を持ち込んでいる）

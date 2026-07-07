# skeleton-lab 障害対応手順書（Runbook）

整骨院の予約・シフト管理サービス「skeleton-lab」で障害（トラブル）が起きたときに、
慌てずに対応するための手順書です。専門用語はできるだけかみくだいて書いています。

---

## 1. サービスの構成（まずは全体像）

```
ユーザー（スマホ / PC のブラウザ）
        │
        ▼
Vercel …… サイト本体を配信（Vite でビルドした静的ファイル）
        │   ※ vercel.json の rewrites 設定で、どの URL でも index.html を返す
        │     「SPA（1枚のページでアプリ全体を動かす）」構成
        ▼
Supabase …… データと認証をすべて担当
   ├─ Auth      : ログイン（メール + パスワード）
   ├─ Database  : 予約(bookings)・院(clinics)・シフト(shifts)・プロフィール(profiles) など
   ├─ Realtime  : 予約が入った瞬間に管理画面へ通知（bookings テーブルのみ有効化済み）
   └─ Storage   : 画像などのファイル置き場（src/services/storage.ts）
```

**重要ポイント**
- サーバーは自前で持っていません。「Vercel か Supabase のどちらが原因か」を切り分けるのが対応の第一歩です。
- Supabase への接続情報は、環境変数 `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` です
  （`src/lib/supabase.ts` で読み込み）。**ビルド時にサイトへ埋め込まれる**ため、
  Vercel 側で環境変数を変えたら**再デプロイしないと反映されません**。
- データベースの設計図はリポジトリ直下の `supabase_schema.sql` と `update_schema_*.sql` /
  `create_*.sql` / `add_*.sql` 群です。Supabase の SQL Editor に貼って実行する運用です。

---

## 2. ログはどこで見る？

### Vercel（サイトの配信・デプロイ関係）
1. https://vercel.com にログイン → プロジェクトを開く
2. **Deployments** タブ … デプロイの成功/失敗と、失敗時のビルドログ
3. **Logs**（または Observability）タブ … 配信時のエラー

### Supabase（データ・ログイン関係）
1. https://supabase.com/dashboard にログイン → プロジェクトを開く
2. **Logs** メニュー
   - **API** … アプリからのデータ読み書きのログ（403 が多ければ権限＝RLS の問題）
   - **Auth** … ログイン成功/失敗のログ
   - **Realtime** … リアルタイム接続のログ
   - **Postgres** … データベース本体のエラー
3. **Table Editor** … 実際のデータを直接確認できる

### ブラウザ側（ユーザーの画面で何が起きているか）
- 障害画面を開いた状態で F12（開発者ツール）→ **Console** タブ。
  このアプリは `console.log` / `console.error` を多めに出しているので手がかりになります。

---

## 3. 症状別の対応手順

### 3-1. サイトがまったく開かない

1. **自分のネット回線のせいではないか**、スマホ回線など別回線でも試す
2. **ステータスページを確認**（→ 5章）。Vercel 障害ならこちらでできることはほぼ無し。待つ
3. Vercel の **Deployments** を確認
   - 最新デプロイが「Error」→ ビルド失敗。ログを見て直すか、直前の正常版に戻す（→ 3-5）
   - 最新デプロイが「Ready」なのに開けない → ドメイン設定（DNS）を確認
4. トップは開くのに `/clinic/xxx` などの直リンクだけ 404 になる場合
   → `vercel.json` の rewrites（全 URL → index.html）が効いていない。
     `vercel.json` がデプロイに含まれているか確認

### 3-2. 予約が入らない／ダブルブッキングが疑われる

**仕組みの理解（重要）**
- 予約作成は `src/services/db.ts` の `createBooking` が行い、その直前に
  `checkStaffAvailability` が「シフト内か」「同じスタッフの時間帯が重なっていないか」を
  チェックしています（`status = 'cancelled'` の予約は無視）。
- ただしこのチェックは**アプリ側（クライアント側）だけ**で、データベース自体には
  「時間帯の重複を禁止する制約」は**ありません**。
  2人がまったく同時に予約ボタンを押すと、すり抜けてダブルブッキングになる可能性があります。

**予約が入らないとき**
1. ブラウザの Console でエラーメッセージを確認
   - 「その時間帯はすべてのスタッフが埋まっています」→ 仕様どおり。ただし
     **その日のシフトが未登録だと全員「勤務時間外」扱いで予約不可**になります。
     管理画面のシフト管理で対象日のシフトが登録済みか確認
2. Supabase の **Logs → API** で 403 エラーが出ていないか確認
   - 403 = 権限（RLS ポリシー）の問題。予約の insert は
     「本人（`auth.uid() = user_id`）」「ゲスト（`user_id` が空）」「院の管理者」の
     3パターンだけ許可されています（`update_schema_guest_bookings.sql` 参照）
3. データが壊れている疑い（`end_time` が空/異常値）があれば `repair_bookings.sql` を
   SQL Editor で実行（終了時刻を開始+60分に補正する修理スクリプト）

**ダブルブッキングを見つけるSQL**（Supabase の SQL Editor で実行）
```sql
select a.id, b.id, a.staff_id, a.start_time, a.end_time, b.start_time, b.end_time
from bookings a
join bookings b
  on a.clinic_id = b.clinic_id
 and a.staff_id = b.staff_id
 and a.id < b.id
 and a.start_time < b.end_time
 and a.end_time > b.start_time
where a.status <> 'cancelled' and b.status <> 'cancelled';
```
見つかったら、お客様に連絡のうえ片方の `status` を `'cancelled'` に更新します
（status に入れられる値は `pending` / `confirmed` / `cancelled` / `no_show` の4つ。
`update_booking_constraints.sql` で定義）。

### 3-3. リアルタイム更新が来ない（予約が入っても管理画面に即反映されない）

**仕組み**: `src/hooks/useRealtimeBookings.ts` が Supabase Realtime の
`postgres_changes`（bookings テーブル、clinic_id で絞り込み）を購読しています。

1. まず**ページを再読み込み**して予約が表示されるか確認
   - 再読み込みで出る → データは正常、Realtime だけの問題
2. Supabase ダッシュボード → **Database → Replication**（または Publications）で
   `supabase_realtime` に **bookings テーブルが含まれているか**確認。
   外れていたら `enable_realtime.sql` を SQL Editor で再実行:
   ```sql
   alter publication supabase_realtime add table bookings;
   ```
3. Realtime は「読む権限（SELECT の RLS ポリシー）」がないと通知が届きません。
   `fix_booking_visibility.sql` の「Anyone can view bookings」ポリシーが
   有効か確認（Authentication → Policies → bookings）
4. Supabase の **Logs → Realtime** で接続エラーを確認。
   無料プランは同時接続数に上限があるため、上限超過なら時間を置くかプラン見直し
5. ブラウザ Console に `Real-time update received:` のログが出るかで、
   通知が届いているか／届いた後の表示側の問題かを切り分けられます

### 3-4. ログインできない

**仕組み**: `src/context/AuthContext.tsx` が Supabase Auth の
`signInWithPassword`（メール+パスワード）を使っています。
新規登録時は DB トリガー `on_auth_user_created`（`supabase_triggers.sql`）が
自動で `profiles` 行を作ります。

1. Supabase の **Logs → Auth** でエラー内容を確認
2. 「Email not confirmed」系のエラー → メール確認が済んでいない。
   ダッシュボードの Authentication → Users から該当ユーザーを確認し、
   必要なら `confirm_users.sql` で手動確認済みにする運用実績あり
3. ログインはできるが画面がおかしい（権限がない等）
   → `profiles` テーブルに行があるか、`role` が正しいか確認
   （`user` / `clinic_admin` / `super_admin` の3種類）。
   role の書き換えは管理者以外できない保護トリガー（`protect_role_change`）があるため、
   昇格は `promote_admin.sql` の手順で SQL Editor から行う
4. Supabase 自体の障害の可能性 → ステータスページ確認（→ 5章）

### 3-5. デプロイ直後にサイトが壊れた → ロールバック（前の版に戻す）

**最優先は「直すこと」ではなく「戻すこと」**。原因調査は戻した後で。

1. Vercel → プロジェクト → **Deployments**
2. 直前まで正常だったデプロイ（1つ前の「Ready」のもの）を開く
3. 右上メニュー「…」から **Instant Rollback**（または **Promote to Production**）を実行
4. サイトが復旧したか実際にブラウザで確認（トップ表示・ログイン・予約画面）
5. 壊れた原因をローカルで調査。`npm run build` が通るか、CI（GitHub Actions）が
   赤くなっていないかを確認してから再デプロイ

**注意**: データベースの変更（SQL の実行）を伴うリリースだった場合、
Vercel のロールバックでは**データベースは元に戻りません**。
SQL を実行した場合は、その SQL の「戻し方」もセットで考えること（→ 4章）。

---

## 4. データベースのバックアップと復元

### バックアップ
- **自動**: Supabase ダッシュボード → **Database → Backups** で確認。
  有料プラン（Pro）なら日次バックアップが自動で取られます。
  無料プランの場合は自動バックアップに頼れないため、下の手動バックアップを定期的に実施
- **手動**（Supabase CLI が使える場合）:
  ```bash
  supabase db dump --db-url "<接続文字列>" -f backup_$(date +%Y%m%d).sql
  ```
  接続文字列はダッシュボードの Database → Connection string から取得
  （パスワードを含むので、ファイルに残さないこと）
- **設計図（スキーマ）はリポジトリにある**: `supabase_schema.sql` ほか各 SQL ファイルで
  テーブル・権限・トリガーは再構築できます。ただし**中身のデータは含まれない**ので、
  データ本体のバックアップは別途必要です

### 復元
1. 大前提: 復元は「上書き」なので、**復元前に現状のバックアップも取る**
2. 有料プランなら Database → Backups から **Restore**（対象日時を選ぶ）
3. 手動バックアップからの復元は、SQL Editor またはコマンドで dump ファイルを実行
4. 復元後の確認: ログイン → 予約一覧表示 → 新規予約作成 → リアルタイム反映、の順で動作確認
5. 復元すると Realtime の設定（publication）が外れることがあるため、
   `enable_realtime.sql` を再実行しておくと安心

---

## 5. ステータスページ（先方の障害かどうかの確認）

| サービス | ステータスページ |
|---------|----------------|
| Vercel | https://www.vercel-status.com |
| Supabase | https://status.supabase.com |

自分のせいだと思い込んで調査する前に、まずこの2つを見る。
先方の障害なら、ユーザーへの告知（SNS や店頭掲示など）を優先する。

---

## 6. 障害が収まったら: 振り返り（/retro）

障害対応が終わったら、必ず Claude Code で **`/retro`** を実行して振り返りを行います。

- 何が起きたか（時系列）
- なぜ起きたか（根本原因）
- どう直したか
- 再発防止に何をするか（この runbook への追記も含む）

振り返りの結果、手順に不足があればこのファイル（`docs/runbook.md`）を更新すること。

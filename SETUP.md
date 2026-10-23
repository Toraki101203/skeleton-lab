# Skeleton Lab - セットアップ手順

## 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の内容を記入してください：

```env
# Supabase の設定（値は Supabase ダッシュボード → Project Settings → API で確認）
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

（`.env.example` をコピーして使えます。Firebase は使っていないため設定不要です）

## インストール

```bash
npm install
```

## 開発サーバーの起動

```bash
npm run dev
```

## ビルド

```bash
npm run build
```

## Supabase設定

1. [Supabase](https://supabase.com/dashboard) でプロジェクトを作成
2. Project Settings → API から上記の URL と anon key を取得
3. `.env` ファイルに設定

## 主な機能

- **ユーザー機能**: 診断ウィザード、クリニック検索、予約リクエスト
- **加盟院CMS**: プロフィール編集、営業時間設定、スタッフ管理、メニュー作成
- **運営ツール**: コールセンターダッシュボード、権限管理、予約台帳

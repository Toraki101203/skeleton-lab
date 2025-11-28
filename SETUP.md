# Skeleton Lab - セットアップ手順

## 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、以下の内容を記入してください：

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

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

## Firebase設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. プロジェクト設定から上記の環境変数を取得
3. `.env`ファイルに設定

## 主な機能

- **ユーザー機能**: 診断ウィザード、クリニック検索、予約リクエスト
- **加盟院CMS**: プロフィール編集、営業時間設定、スタッフ管理、メニュー作成
- **運営ツール**: コールセンターダッシュボード、権限管理、予約台帳

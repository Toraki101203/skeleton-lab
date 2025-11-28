# アプリケーションの公開方法 (デプロイ)

現在、アプリケーションはあなたのパソコンの中（ローカル環境）でのみ動作しています。他の人に見てもらうためには、インターネット上のサーバーに「デプロイ（公開）」する必要があります。

おすすめの方法は **Vercel** または **Firebase Hosting** です。

## 方法 1: Vercel で公開する (推奨・最も簡単)

Vercelは設定が簡単で、Vite製のReactアプリと相性が抜群です。

### 手順

1. **GitHubにコードをアップロードする**
   - まだの場合は、このプロジェクトをGitHubのリポジトリにプッシュしてください。

2. **Vercelに登録/ログイン**
   - [Vercel公式サイト](https://vercel.com/) にアクセスし、GitHubアカウントでログインします。

3. **プロジェクトのインポート**
   - ダッシュボードの "Add New..." -> "Project" をクリック。
   - GitHubリポジトリ一覧から `skeleton-lab` を選択して "Import" をクリック。

4. **環境変数の設定 (重要)**
   - "Environment Variables" のセクションを開きます。
   - `.env` ファイルにある以下の値をすべてコピーして追加してください。
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`

5. **デプロイ**
   - "Deploy" ボタンをクリックします。
   - 数分待つと、公開用のURL（例: `https://skeleton-lab.vercel.app`）が発行されます。このURLを共有すれば、誰でもアクセスできます。

---

## 方法 2: Firebase Hosting で公開する

すでにFirebaseを使用しているため、Firebase Hostingを使うのも自然な選択です。

### 手順

1. **Firebase CLIのインストール** (まだの場合)
   ```bash
   npm install -g firebase-tools
   ```

2. **ログイン**
   ```bash
   firebase login
   ```

3. **初期化**
   ```bash
   firebase init hosting
   ```
   - 質問には以下のように答えてください：
     - **Project**: 使用中のFirebaseプロジェクトを選択
     - **Public directory**: `dist` と入力
     - **Configure as a single-page app**: `Yes` (y)
     - **Set up automatic builds and deploys with GitHub**: `No` (n) (必要なら後で設定可)

4. **ビルド**
   ```bash
   npm run build
   ```

5. **デプロイ**
   ```bash
   firebase deploy
   ```
   - 完了すると `Hosting URL` が表示されます。

---

## 注意点

- **セキュリティルール**: FirestoreやStorageのセキュリティルールが適切に設定されているか確認してください（現在は開発モードで全許可になっている可能性があります）。
- **認証ドメイン**: Firebase Authenticationを使用している場合、Firebaseコンソールの「Authentication」->「設定」->「承認済みドメイン」に、デプロイ先のドメイン（例: `skeleton-lab.vercel.app`）を追加する必要があります。これを忘れるとログインできません。

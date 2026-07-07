# Skeleton Lab（整骨院予約・シフト管理）— プロジェクト情報

整骨院向けの予約・出退勤・シフト管理プラットフォーム。

## 技術スタック
- Vite + React + TypeScript（※他プロジェクトと違い Next.js ではない）
- Supabase（DB + Auth + Realtime）
- Tailwind CSS（tailwind.config.cjs）
- デプロイ: Vercel（vercel.json）

## 構成メモ
- ルート直下の *.sql は歴史的な適用済みマイグレーション（`db/migrations-archive/` へ整理予定）。スキーマの正は `supabase_schema.sql`
- 予約ステータス遷移（pending → confirmed 等）と RLS が壊れやすい箇所。DB を触る変更は database-reviewer を通す

## 障害対応
- 障害時はまず `docs/runbook.md` を参照

## Skill routing
- バグ調査 → investigate ／ QA → qa ／ レビュー → review + cso
- デプロイ → ship → land-and-deploy → canary

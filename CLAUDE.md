# Skeleton Lab（整骨院予約・シフト管理）— プロジェクト情報

整骨院向けの予約・出退勤・シフト管理プラットフォーム。

## 技術スタック
- Vite + React + TypeScript（※他プロジェクトと違い Next.js ではない）
- Supabase（DB + Auth + Realtime）
- Tailwind CSS（tailwind.config.cjs）
- デプロイ: Vercel（vercel.json）

## 構成メモ
- スキーマの正は `supabase_schema.sql`、トリガーは `supabase_triggers.sql`（いずれもルート直下）。適用済みの歴史的マイグレーションは `db/migrations-archive/` に整理済みで、新しい SQL をルートに置かない
- 予約ステータス遷移（pending → confirmed 等）と RLS が壊れやすい箇所。DB を触る変更は database-reviewer を通す

## 障害対応
- 障害時はまず `docs/runbook.md` を参照

## Skill routing
- バグ調査 → investigate ／ QA → qa ／ レビュー → review + cso
- デプロイ → ship → land-and-deploy → canary

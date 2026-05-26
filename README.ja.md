# operantkit-frontend

:gb: [English README](README.md)

## 概要

OperantKit のウェブフロントエンド。実験者向けダッシュボードと教育用シミュレータ UI を提供する。
セッションデータの可視化、実験設定の編集、ユーザ管理ページを含む。

**Status**: Next.js 16、React 19、Tailwind v4。

## 主な画面

- `/` — ダッシュボード（最近のセッション、概要統計）
- `/login`, `/register` — 認証
- `/profile` — ユーザプロファイル
- `/settings` — 実験パラメータ設定（FR / VR / FI / VI 等のスケジュール選択）
- `/data` — セッションデータの可視化（Recharts による累積記録・反応率チャート）

## API ルート

- `GET/POST /api/data` — セッションデータ
- `GET/POST /api/settings` — 実験設定

現状は Next.js 内のモックエンドポイントを返す。Python バックエンド（session-visualizer SSE 等）との
接続は将来作業。

## セットアップ

ランタイムは [mise](https://mise.jdx.dev) で固定する。Node.js のバージョンは `.mise.toml` で
宣言済み（24 系 LTS）。

```bash
# 1. Node を取得
mise install

# 2. 依存をインストール（package-lock.json から再現）
mise exec -- npm ci
```

## 開発

```bash
# 開発サーバ（http://localhost:3000）
mise exec -- npm run dev

# プロダクションビルド
mise exec -- npm run build

# Lint
mise exec -- npm run lint

# 型チェック
mise exec -- npx tsc --noEmit

# E2E テスト（要 Playwright ブラウザ: mise exec -- npx playwright install chromium）
mise exec -- npm test
```

## 依存関係

主要依存（`package.json` 参照）:

- `next` ^16.2 — React フレームワーク（App Router）
- `react`, `react-dom` ^19 — UI ライブラリ
- `recharts` ^3 — チャート
- `swr` ^2 — クライアントサイドのデータフェッチ・キャッシュ
- `tailwindcss` ^4, `@tailwindcss/postcss` ^4 — スタイリング
- `typescript` ^5 — 型チェック
- `@playwright/test` ^1 — E2E テスト

## 備考

- ランタイムは `mise` で管理する。`nvm` / `nodenv` / `asdf` は使用しない。
- パッケージマネージャは `npm` のみ（`package-lock.json` を再現性のため commit する）。
  `pnpm` / `yarn` / `bun` は使用しない。
- direnv の `layout node` 等の layout 系は使用しない（`.envrc` は防御的・最小限のみ）。
- `node_modules/` / `.next/` / `playwright-report/` / `test-results/` は `.gitignore` 済み。

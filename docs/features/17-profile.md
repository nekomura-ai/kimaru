# 17. プロフィールシート

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 部分実装（クライアント保存のみ）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) DB 設計 `profiles`

## 概要

発行者が自分のプロフィール（自己紹介・強み等）を整え、リマインドや AI アシスト（[18](./18-ai-assist.md)）に渡す。

## 現状の実装

- `profile.html` でプロフィールを入力・編集。ログイン確認に `/api/me` を使用。
- **保存先は localStorage**（`profileKey`）。サーバ DB（`profiles` テーブル）へは未保存。
- 整えたプロフィールは同一ブラウザの AI アシスト（[18](./18-ai-assist.md)）が参照。

## 関連ファイル

- `public/profile.html` — 入力 UI・localStorage 保存
- DB: `profiles`（仕様。現状未使用）

## 残タスク

- `profiles` テーブルへのサーバ保存 API（端末間共有・永続化）。
- プロフィール付きリマインドメールへの反映。

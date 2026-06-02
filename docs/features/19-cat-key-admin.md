# 19. Cat Key 管理（運営）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象: 運営（管理者）
- 仕様: 招待コード（[12](./12-invite-code.md)）運用の管理面

## 概要

運営が Cat Key 適用ユーザーを一覧・監査し、特典を取り消し/復元できる管理画面。

## 現状の実装

- `cat-key-admin.html` で管理者キーを入力し、`/api/invite-apply?admin=cat-key` を呼ぶ。
- 認証は `CAT_KEY_ADMIN_SECRET`（or `ADMIN_SECRET`）。Bearer / `?secret=` / body.secret のいずれか。
- `GET`: オーナー一覧＋Cat Key イベント（`cat_key_events`）取得。
- `POST`: `{ owner_id, action: "revoke"|"restore" }`。revoke で `plan=free` / `invite_code=''` / `cat_key_disabled=true`。
- 適用・取消・無効コード等は `cat_key_events` に監査記録。

## 関連ファイル

- `public/cat-key-admin.html` — 管理 UI
- `netlify/functions/invite-apply.js` — 管理モード（`?admin=cat-key`）
- DB: `owners`（`cat_key_disabled` 等）、`cat_key_events`

## 残タスク

- `CAT_KEY_ADMIN_SECRET` 未設定時は管理モードが 401（運用前に設定要）。
- 監査テーブル `cat_key_events` のマイグレーション適用確認。

# 19. Cat Key 管理（運営）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象: 運営（管理者）
- 仕様: 招待コード（[12](./12-invite-code.md)）運用の管理面

## 概要

運営が Cat Key 適用ユーザーを一覧・監査し、特典を取り消し/復元できる管理画面。

## 仕様（打ち合わせ 2026-06-03 / 不正利用対策）

無料利用が口コミで広がり、対象外まで無料が増えるのを防ぐ。

- **承認制**: Cat Key を入力しても即時に無料付与せず、**運営コンソールの画面で「承認」ボタンを押下**した場合のみ有効化する（決定 2026-06-03）。入力は「承認待ち」として記録され、運営が一覧から承認/却下する。これで不正利用をほぼ防げる。
- **強制ダウングレード**: 不正・退会済みが判明した場合、運営が強制的に有料 → 無料へ降格できる（既に `revoke` で実装）。
- 「承認する／降格する」の両方を運営側で操作できるようにする。
- **将来**: Cat Key を定期更新（自動ローテーション）し、猫の集会のグループチャットから最新キーを取得する運用。退会者は旧キーが無効になり、より確実に防げる。

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

- ~~**承認制の導入**~~ ✅ 実装済: Cat Key 入力で `cat_key_pending=true`（pro は付与しない）、運営コンソールの承認/却下で確定。未マイグレ環境は従来どおり即時付与にフォールバック。
- **将来**: Cat Key の定期更新（自動ローテーション）と、猫の集会グループチャット連携での最新キー配布。
- `CAT_KEY_ADMIN_SECRET` 未設定時は管理モードが 401（運用前に設定要）。
- 監査テーブル `cat_key_events` のマイグレーション適用確認。

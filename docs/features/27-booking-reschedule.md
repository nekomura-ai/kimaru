# 27. 予約の日程変更（ゲスト）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（`booking-manage` 関数 + `manage-booking.html`）
- 対象プラン: 共通（無料版でも利用可）
- 関連: [26](./26-booking-cancel.md) / [28](./28-host-notification.md) / [08](./08-booking.md)

## 概要

ゲストが予約管理リンクから、空き枠を選び直して **日程を変更** できる。元の予定は解放され、新しい日時で予約・カレンダー予定が作り直される。

## 仕様詳細

- 管理ページで「日程を変更する」→ `/api/availability?slug=...` の空き枠（既存ロジックを再利用）から新しい日時を選ぶ → 確認して確定。
- **同一の booking 行を更新**（id・管理リンクは不変）。`start_at`/`end_at` を更新。
- Google 連携時は **旧カレンダー予定を削除 → 新しい時間で作り直す**（`google_event_id`・`meeting_url` を更新）。
- 変更後はゲスト＋ホスト双方へ「変更前→変更後」を記した通知メール。
- キャンセル済みの予約は変更不可。過去日時・受付期間外は拒否。

## 関連ファイル

- `netlify/functions/booking-manage.js`（POST `action:reschedule`）
- `netlify/functions/_lib/google.js`（`deleteCalendarEvent` + `createCalendarEvent`）
- `public/manage-booking.html` / `public/manage-booking.js`（空き枠の選び直しUI）

## 残タスク・将来

- 変更確定時の枠競合（他ゲストが同時に同じ枠を取る）への厳密なロック。現状は確定時に再取得する楽観的方式。
- ホスト側からの日程変更操作。

# 02. Google カレンダー連携

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 1

## 概要

発行者の Google カレンダーと連携し、(1) 既存予定を避けた空き時間表示、(2) 予約確定時の予定自動作成を行う。

## 仕様詳細

- 発行者の Google カレンダー予定を取得。
- 既存予定を避けて空き時間のみ表示。
- 予約確定後、Google カレンダーに予定を自動作成。

## 現状の実装

- 空き判定: `freeBusy` API で busy 区間を取得し、空き枠のみ返す。
- 予定作成: `/calendar/v3/calendars/primary/events?sendUpdates=all` で作成、`google_event_id` を保存。
- アクセストークンは期限切れ前に自動リフレッシュ（refresh_token 利用）。
- 作成するカレンダー予定に **Google カレンダー標準のリマインダー（15分前・メール＋ポップアップ）** を付与。
  - ※これは Google カレンダー側の通知。キマル独自の **22分前・プロフィール付きリマインダー**（[21](./21-reminder.md)）とは別物（21は未実装）。

## 関連ファイル

- `netlify/functions/_lib/google.js` — `freebusy()` / `createCalendarEvent()` / `accessTokenForOwner()`
- `netlify/functions/availability.js` — 空き枠生成
- `netlify/functions/book.js` — 予約時の予定作成
- DB: `google_connections`（トークン・calendar_id）

## 実装メモ（リデザイン版）

- 空き枠は `availability_settings`（曜日・時間帯）＋ `booking_pages`（duration/buffer/range）から生成し、Asia/Tokyo で計算（`availability.js`）。
- 予約時間（[03](./03-duration.md)）・前後バッファ（[04](./04-buffer.md)）・受付期間（[05](./05-booking-range.md)）・受付可能時間（[07](./07-availability-settings.md)）が空き判定に反映済み。

## 残タスク

- カレンダー ID は `primary` 固定。複数カレンダー対応は将来検討。

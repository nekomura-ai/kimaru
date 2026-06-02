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
- リマインダー 15分前（メール＋ポップアップ）付き。

## 関連ファイル

- `netlify/functions/_lib/google.js` — `freebusy()` / `createCalendarEvent()` / `accessTokenForOwner()`
- `netlify/functions/availability.js` — 空き枠生成
- `netlify/functions/book.js` — 予約時の予定作成
- DB: `google_connections`（トークン・calendar_id）

## 残タスク

- カレンダー ID は `primary` 固定。複数カレンダー対応は将来検討。
- タイムゾーン処理（`booking_pages.timezone` は未使用）。
- バッファ（[04](./04-buffer.md)）・予約時間（[03](./03-duration.md)）を空き判定へ反映。

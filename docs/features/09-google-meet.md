# 09. Google Meet 自動発行

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通（無料版でも利用可）
- 仕様: [`../spec.md`](../spec.md) 主要機能 5（Google Meet）

## 概要

予約確定時に Google Meet リンクを自動発行し、カレンダー予定・予約レコードに反映する。

## 仕様詳細

- 予約確定時に Google Meet リンクを自動発行。
- 予約完了メールに Meet リンクを記載（[11](./11-notification-email.md)）。
- Google カレンダー予定にも Meet リンクを反映。

## 現状の実装

- `createCalendarEvent`（`_lib/google.js`）がイベント作成時に `conferenceData.createRequest`（`conferenceSolutionKey.type = "hangoutsMeet"`）を付与し、`?conferenceDataVersion=1` でリクエスト。
- 返却の `hangoutLink` を `book.js` が `bookings.meeting_url` に保存。
- カレンダー予定には Meet リンクが反映される（Google 側生成）。

## 関連ファイル

- `netlify/functions/_lib/google.js` — `createCalendarEvent()`（conferenceData 付与）
- `netlify/functions/book.js` — `meeting_url`(=hangoutLink) 保存
- DB: `bookings.meeting_url` / `google_event_id`

## 残タスク

- 開催方法（[06](./06-location-type.md)）が Meet 以外のときは発行しない条件分岐の明確化（現状は既定 `google_meet` で常時発行されうる）。
- 予約完了メール（[11](./11-notification-email.md)）への Meet リンク明記。

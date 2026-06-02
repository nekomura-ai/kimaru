# 09. Google Meet 自動発行

[← 機能一覧に戻る](./README.md)

- ステータス: ❌ 未実装（あと一歩）
- 対象プラン: 共通（無料版でも利用可）
- 仕様: [`../spec.md`](../spec.md) 主要機能 5（Google Meet）

## 概要

開催方法（[06](./06-location-type.md)）で Google Meet を選んだ場合、予約確定時に Meet リンクを自動発行し、カレンダー予定・予約完了メールに反映する。

## 仕様詳細

Google Meet を選択した場合:

- 予約確定時に Google Meet リンクを自動発行。
- 予約完了メールに Meet リンクを記載（[11](./11-notification-email.md)）。
- Google カレンダー予定にも Meet リンクを反映。

## 現状の実装

- 未実装。`createCalendarEvent` は予定を作るが `conferenceData` を付与していないため Meet リンクが発行されない。

## 関連ファイル

- `netlify/functions/_lib/google.js` — `createCalendarEvent()`（`conferenceData` 追加が必要）
- `netlify/functions/book.js` — 発行された Meet URL を `bookings.meeting_url` に保存
- DB: `bookings.meeting_url`（仕様。現スキーマには未追加）

## 残タスク

- `createCalendarEvent` のリクエストに `conferenceDataVersion=1` と
  `conferenceData.createRequest`（`conferenceSolutionKey.type = "hangoutsMeet"`）を追加。
- レスポンスの `hangoutLink` / `conferenceData.entryPoints` から Meet URL を取得し保存。
- 開催方法が Meet のときだけ発行するよう分岐。
- 予約完了メールへ反映。

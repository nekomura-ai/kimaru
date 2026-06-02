# 08. 予約機能（予約ページ・予約作成）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（基本機能）
- 対象プラン: 共通（複数名調整は有料）
- 仕様: [`../spec.md`](../spec.md) 主要機能 8 / 無料版機能（1対1予約）

## 概要

ゲストが公開予約ページから空き枠を選び、必要事項を入力して予約を確定する。確定時に DB 保存と Google カレンダー登録を行う。

## 仕様詳細

- 無料版: 1 対 1 予約。
- 有料版: 複数名での日程調整（将来）。

## 現状の実装

- 公開予約ページで空き枠を表示し、選択 → フォーム入力 → 予約確定。
- 予約は `bookings` に保存（status=confirmed）、`createCalendarEvent` でカレンダー登録、`google_event_id` を保存。
- 管理側で予約一覧を表示。

## 関連ファイル

- `public/booking.html` / `public/app.js` — ゲスト UI（`initBooking`）
- `netlify/functions/availability.js` — 空き枠取得
- `netlify/functions/book.js` — 予約作成
- `netlify/functions/owner-bookings.js` — 予約一覧
- DB: `bookings`

## 残タスク

- 予約時間/バッファ/開催方法/アンケート（[03](./03-duration.md)/[04](./04-buffer.md)/[06](./06-location-type.md)/[10](./10-questionnaire.md)）の反映。
- キャンセル・リスケジュール導線。
- 複数名調整（有料）。

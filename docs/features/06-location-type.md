# 06. 開催方法

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（Zoom は将来対応）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 5

## 概要

予約ページ作成時に発行者が開催方法を選択できる。選択により入力欄や予約後の挙動が変わる。

## 仕様詳細

選択肢: 対面 / Google Meet 自動発行 / Zoom 自動発行(将来) / 電話 / カスタム URL / 後で連絡。

## 現状の実装

- 予約設定画面に開催方法の選択 UI（`location_type`）あり。`app.js` の `updateBookingPageControls` が対面/電話/カスタムURLのとき詳細入力欄（`location_value`）を表示し、種別に応じた placeholder を切替。
- `booking-page-save` が `location_type ∈ {in_person, google_meet, zoom, phone, custom_url, later}` を検証して保存。
- `book.js` は予約の `location_type`（既定 `google_meet`）を保存。Google Meet の場合は [09](./09-google-meet.md) でリンク自動発行。

## 関連ファイル

- `public/booking-settings.html` / `public/app.js` — UI・種別別入力欄
- `netlify/functions/booking-page-save.js` — 検証・保存
- `netlify/functions/book.js` — 予約への `location_type` 反映
- DB: `booking_pages.location_type` / `location_value`、`bookings.location_type` / `meeting_url`

## 残タスク

- **Zoom 自動発行は将来対応**（種別の枠はあるが発行処理は未実装）。Google Meet と同様、**無料・有料の両プランで提供**（有料限定ではない）。
- 対面/電話/カスタムURLの値を予約完了メール（[11](./11-notification-email.md)）へ反映する導線の整備。

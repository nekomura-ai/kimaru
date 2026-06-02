# 06. 開催方法

[← 機能一覧に戻る](./README.md)

- ステータス: ❌ 未実装
- 対象プラン: 共通（Zoom は将来対応）
- 仕様: [`../spec.md`](../spec.md) 主要機能 5

## 概要

予約ページ作成時に、発行者が開催方法を選択できるようにする。選択により入力欄や予約後の挙動が変わる。

## 仕様詳細

選択肢と挙動:

- **対面** → 住所入力欄を表示
- **Google Meet 自動発行** → [09. Google Meet 自動発行](./09-google-meet.md) を参照
- **Zoom 自動発行** → ※将来対応（設計だけ用意）
- **電話** → 電話番号または案内文を設定可能
- **カスタム URL** → 任意 URL を入力可能
- **後で連絡** → 追加入力なし

## 現状の実装

- 未実装。開催方法の概念・カラム・UI が無い。

## 関連ファイル

- 発行者の予約ページ設定 UI（未作成）
- `public/booking.html` — ゲスト側の表示
- `netlify/functions/book.js` — 予約確定時の `meeting_url` / `location` 反映
- DB: `booking_pages.location_type` / `location_value`、`bookings.meeting_url` / `location_type`（仕様。現スキーマには未追加）

## 残タスク

- `booking_pages` に `location_type` / `location_value` を追加。
- 設定 UI（種別選択＋種別ごとの入力欄）。
- ゲスト予約完了時に種別に応じた情報（住所/URL/電話/Meetリンク）を確定・通知。
- Zoom は将来差し込めるよう種別を拡張可能な形にしておく。

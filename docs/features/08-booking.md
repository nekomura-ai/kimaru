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

- 公開予約ページ（リデザイン版）は 1 週間のスケジュールグリッド（30分刻み）で空き枠を表示（`booking-week.js`）。選択 → フォーム入力 → 予約確定。
- フォーム項目: 名前 / メール / お話したい内容 / 夢・目標 / 生年月日（任意・非公開可）。
- 予約は `bookings` に保存（status=confirmed、`location_type` 既定 `google_meet`）、`createCalendarEvent` でカレンダー登録、`google_event_id` と `meeting_url` を保存。
- 生年月日から「生年月日インサイト（簡易プロフィール）」を生成し `relationship_profile` 等に保存（[16](./16-birthday.md)）。
- 予約時間/バッファ/受付期間/受付時間が空き枠に反映済み（[03](./03-duration.md)〜[07](./07-availability-settings.md)）。
- 管理側（相手管理）で予約一覧・検索を表示。

## 関連ファイル

- `public/booking.html` / `public/booking-week.js` — ゲスト UI（スケジュールグリッド）
- `netlify/functions/availability.js` — 空き枠取得
- `netlify/functions/book.js` — 予約作成・Meet/インサイト保存
- `netlify/functions/owner-bookings.js` — 予約一覧（生年月日非公開はマスク）
- DB: `bookings`

## 残タスク

- 事前アンケートのゲスト動的表示（[10](./10-questionnaire.md)）。
- ~~キャンセル・リスケジュール導線~~ ✅ 実装済（[26](./26-booking-cancel.md) / [27](./27-booking-reschedule.md)。ゲストがメールの管理リンクから操作）。
- 複数名調整（有料）。

> 予約フローは 3 ステップ（日程調整 → 確認 → 完了）に再構成済み。完了画面・確認メールに予約管理リンクを表示。

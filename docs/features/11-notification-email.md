# 11. 予約完了メール

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（ゲスト確認メール＋ホスト通知。Resend 設定で実送信）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 無料版機能（予約完了メール）
- 関連: ホストへの予約通知は [28](./28-host-notification.md)、キャンセル/変更通知は [26](./26-booking-cancel.md)/[27](./27-booking-reschedule.md)

## 概要

予約確定時にゲスト（および発行者）へ予約完了の通知を行う。Meet 利用時は Meet リンクを記載する。誕生日メールは別途実装（[16](./16-birthday.md)）。

## 仕様詳細

- 予約完了メールを送る。
- Google Meet 選択時は Meet リンクを記載（[09](./09-google-meet.md)）。

## 現状の実装

- ⚠️ Google カレンダー予定作成時の `sendUpdates=all` により、Google から **カレンダー招待メール**（Meet リンク込み）が送られる。
- 誕生日メールは Resend 経由で送信実装あり（[16](./16-birthday.md)）。
- キマル独自の「予約完了メール」テンプレート送信は未実装（カレンダー招待で代替している状態）。

## 関連ファイル

- `netlify/functions/_lib/google.js` — `createCalendarEvent()`（`sendUpdates=all`）
- `netlify/functions/book.js` — 予約確定処理（独自メール送信のフック地点）
- `netlify/functions/birthday-mails.js` — Resend 送信基盤（流用可能）

## 方針（決定 2026-06-03 更新）

- **メール送信を採用**する（[open-decisions.md](../open-decisions.md) 決定5）。ログイン時に発行者、予約時にゲストのメールを取得済みなので双方に送れる。
- **予約完了**: 予約時に Google カレンダー招待（`sendUpdates=all`）で Meet リンク込みの通知が届く。必要に応じて独自メールも併用。
- **22分前リマインダー**（[21](./21-reminder.md)）は独自メール送信で実装。
- 送信基盤は既存の **Resend** を流用（`birthday-mails.js`）。送信元ドメイン認証（SPF/DKIM）・送信元アドレスの設定が必要。

## 残タスク

- ~~予約完了の独自メール（任意）と、開催方法（住所/URL/電話/Meet）の本文反映~~ ✅ 実装済（`book.js` `sendBookingConfirmation`、Resend・未設定時スキップ）。
- 送信元ドメイン認証（SPF/DKIM）・送信元アドレスの設定（人間タスク H-C）。

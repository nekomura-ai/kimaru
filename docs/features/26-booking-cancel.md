# 26. 予約のキャンセル（ゲスト・ホスト）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（`booking-manage` 関数 + `manage-booking.html`）
- 対象プラン: 共通（無料版でも利用可）
- 関連: [27](./27-booking-reschedule.md) / [28](./28-host-notification.md) / [08](./08-booking.md)

## 概要

ゲストが、予約後に届く確認メール（および予約完了画面）の **「予約管理リンク」** から、ログイン不要で予約をキャンセルできる。キャンセル時はカレンダー予定を削除し、ゲスト・ホスト双方へ通知メールを送る。

## 仕様詳細

- 管理リンクは `/manage-booking.html?id=<bookingId>&t=<token>`。`token` は **booking id の HMAC 署名**（`SESSION_SECRET`）。DB 列は追加していない（id から導出）。改ざん・他予約への流用は署名検証で防止。期限なし（面談日まで有効）。
- キャンセルすると `bookings.status = 'cancelled'`。`google_event_id` があれば Google カレンダー予定を削除（404/410 は成功扱い）。
- キャンセル後はゲスト＋ホストへ通知メール（Resend 未設定なら送信スキップ）。
- すでにキャンセル済みのものは冪等（再実行しても OK）。

## 関連ファイル

- `netlify/functions/booking-manage.js`（GET=取得 / POST `action:cancel`）
- `netlify/functions/_lib/crypto.js`（`bookingToken` / `verifyBookingToken`）
- `netlify/functions/_lib/google.js`（`deleteCalendarEvent`）
- `netlify/functions/_lib/mail.js`（Resend 共通送信）
- `public/manage-booking.html` / `public/manage-booking.js`
- `netlify/functions/book.js`（確認メール・完了画面に管理リンクを付与）

## 残タスク・将来

- ホスト側の管理画面（相手管理 = Pro）からのキャンセル操作（現状はメールのリンク経由）。
- キャンセル理由の任意入力。

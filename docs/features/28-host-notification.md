# 28. ホストへの予約通知メール

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（`book.js`。要 Resend 設定で実送信）
- 対象プラン: 共通（無料版でも利用可）
- 関連: [11](./11-notification-email.md) / [26](./26-booking-cancel.md) / [27](./27-booking-reschedule.md)

## 概要

予約が入ったときに、**ホスト（主催者）本人のメールアドレス宛** に予約通知メールを送る。無料版は相手管理（予約一覧）が Pro 限定のため、無料ホストでも新規予約に気づけるようにする。

## 仕様詳細

- 予約確定時（`/api/book`）に、ゲスト宛の確認メールに加えて **ホスト宛の通知メール** を送る（いずれも非致命・失敗しても予約は成立）。
- 本文: ゲスト名・メール・日時・開催方法・ミーティングURL・事前アンケート回答の要約・この予約の管理（変更/キャンセル）リンク。
- キャンセル・日程変更時も、ホストへ通知メールを送る（[26](./26-booking-cancel.md) / [27](./27-booking-reschedule.md)）。
- 送信基盤は **Resend**。`RESEND_API_KEY` と差出人（`BOOKING_EMAIL_FROM` / `BIRTHDAY_EMAIL_FROM`）未設定なら送信スキップ。

## 関連ファイル

- `netlify/functions/book.js`（`sendHostNotification`）
- `netlify/functions/_lib/mail.js`（Resend 共通送信ヘルパ）
- `netlify/functions/_lib/booking-format.js`（日時/場所ラベル/管理URL/回答要約）

## 残タスク・将来

- 本番での Resend 設定（API キー・送信元ドメイン認証 SPF/DKIM）。
- ホストの通知 ON/OFF 設定。

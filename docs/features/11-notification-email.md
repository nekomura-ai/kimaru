# 11. 予約完了メール

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 部分実装
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 無料版機能（予約完了メール）

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

## 残タスク

- 独自の予約完了メールを作るか判断（カレンダー招待で十分かを含む）。作る場合は Resend を流用。
- 開催方法（住所/URL/電話/Meet）情報を本文へ反映。

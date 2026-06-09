# 21. リマインダー（22分前 / プロフィール付き）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（`reminder-mails` + `reminder-scheduled`。Netlify Scheduled Functions で ~5分間隔起動。本番は Resend 設定で実送信。無料=基本／Pro=プロフィール付き）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 10

## 概要

予約した打ち合わせの **22分前** に、相手へリマインダーを送る。相手のプロフィールを添えることで、当日の会話・関係構築につなげる。

## 仕様詳細

- タイミングは **22分前**（「ニャンニャン前」）。当初15分前案だったが、ネット遅延・準備の余裕を踏まえ22分に決定。15分あれば相手のプロフィールに目を通せる、という狙い。
- リマインダーには **打ち合わせ相手のプロフィール情報**（[17](./17-profile.md)）を載せる。
- プロフィールは生 URL ではなく「プロフィールはこちら」のようなハイパーリンク形式（押しやすさ重視）。Google カレンダー上でも同様に出せると望ましい。

## 背景（打ち合わせ）

- 既存ツールは前日リマインドのみ、もしくはリマインド自体が無いものが多く、見られず忘れられがち。
- 「明日この方と打ち合わせ／URL はこちら」に加え、相手のプロフィールを載せて距離を縮める体験にしたい。

## 実装方針（決定 2026-06-03）

- **独自メール送信で実装**する。ログイン時に発行者、予約時にゲストのメールを取得しているため、**双方（特にゲスト）へ22分前にメールを送れる**（[open-decisions.md](../open-decisions.md) 決定5）。
- メール本文に**相手のプロフィール**（「プロフィールはこちら」リンク形式）を載せる。
- 送信基盤は既存の **Resend**（`birthday-mails.js` で採用済み）を流用。スケジューラは Netlify Scheduled Functions。

## 関連ファイル（想定）

- スケジューラ（Netlify Scheduled Functions）で予約開始22分前を抽出して送信
- `birthday-mails.js` の Resend 送信基盤を流用（[11](./11-notification-email.md) / [16](./16-birthday.md)）
- DB: `bookings`（開始時刻 `start_at`・`visitor_email`）、`profiles`（[17](./17-profile.md)）、送信済み管理用テーブル（重複防止）

## 実装（2026-06-09）

- `reminder-mails.js` のコアを `run()` に切り出し、HTTP（`/api/reminder-mails?dry_run=1`）と Scheduled Function（`reminder-scheduled.js`）の双方から起動。
- `netlify.toml` の `[functions."reminder-scheduled"] schedule="*/5 * * * *"` で定期実行。
- `reminder_deliveries`（unique）で重複送信を防止。`owner.plan` で本文を出し分け（無料=相手名＋会議URL／Pro=プロフィール付き）。

## 残タスク

- 本番での送信元ドメイン認証（SPF/DKIM）・`RESEND_API_KEY`/`REMINDER_EMAIL_FROM` 設定（人間タスク）。
- プロフィールのハイパーリンク形式（現状はテキスト）。

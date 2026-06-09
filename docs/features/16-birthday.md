# 16. AI誕生日分析・誕生日メール

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 実装済（要 Resend 設定。「AI」は簡易ロジック）
- 対象プラン: 有料
- 仕様: [`../spec.md`](../spec.md) 有料版機能（AI 要約 ※将来 / 関連）

## 概要

生年月日入力の **主目的は「占いベースの相手分析」**。算命学・動物占い・四柱推命などをもとに相手を分析し、**アポイント時に気をつけること・注意点・相手に合わせた接し方**を発行者に提示する（有料版の価値）。誕生日当日のお祝いメール（Pro）は、この生年月日活用の付随機能。

## 仕様（打ち合わせ 2026-06-03 / 目的の明確化 2026-06-09）

- **目的（最重要）**: 生年月日 →（算命学・動物占い・四柱推命 等）で相手を分析し、**当日の注意点・気をつける点・相手に合うアプローチ**を発行者に伝える。商談・面談の質を上げるための「事前理解」が狙い。
- 結果は **断定ではなく仮説**として提示する（「相手をこう決めつける」ではなく会話・関係構築のヒント）。
- 生年月日は **「非公開」を選べる**（入力したくない相手向け）。非公開時は分析・表示をマスクする。
- 誕生日当日には、相手にお祝いメッセージ（メール）を自動送信できる（Pro）。
- ※現状は**静的な簡易メモのみ**で、実際の算命学/動物占い/四柱推命の算出ロジックは**未実装（Pro・🔜）**。占い/AI 連携の高度化が今後の主タスク。

## 現状の実装

- **生年月日インサイト（現状＝プレースホルダ）**: `public/booking-week.js` の `buildRelationshipProfile` が、予約時に `bookings.relationship_profile` 等へメモを保存し相手管理一覧に表示する。ただし**中身は固定の汎用テキスト**（「目標や関心を丁寧に聞くと会話が進む」等）で、**算命学・動物占い・四柱推命の実算出は行っていない**。生年月日非公開時はマスク。
  - → 本命の「占いベースの相手分析（注意点・接し方）」は**未実装（Pro・🔜）**。生年月日の収集・非公開・保存・表示の土台はあるので、分析エンジン（ルール表 or LLM）を載せれば機能化できる。
- **誕生日メール**: `birthday-mails.js` が本日（Asia/Tokyo）誕生日かつ opt-in の予約（Pro オーナー分）を抽出し、Resend でメール送信。`birthday_message_deliveries` で重複送信防止。`?dry_run=1` で送信せず確認可。
- 実行: Netlify Scheduled Functions / 外部cron で `POST /api/birthday-mails`。認証は `BIRTHDAY_CRON_SECRET`（or `CRON_SECRET`）。

## 関連ファイル

- `public/app.js` — `buildRelationshipProfile` / `getBirthdayStatus` 等
- `netlify/functions/birthday-mails.js` — 抽出・送信・配信記録
- DB: `bookings`（`visitor_birth_date` / `relationship_profile` / `birthday_message_opt_in`）、`birthday_message_deliveries`

## 残タスク

- 送信スケジューラ（Netlify Scheduled Functions / 外部cron）の設定。
- `RESEND_API_KEY` / `BIRTHDAY_EMAIL_FROM` 未設定時は送信スキップ（dry run 扱い）。
- 「AI」分析の高度化（将来、LLM 連携など）。

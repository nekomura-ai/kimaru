# 16. AI誕生日分析・誕生日メール

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 実装済（要 Resend 設定。「AI」は簡易ロジック）
- 対象プラン: 有料
- 仕様: [`../spec.md`](../spec.md) 有料版機能（AI 要約 ※将来 / 関連）

## 概要

予約時に取得した生年月日から「関係構築ヒント（簡易インサイト）」を生成し、誕生日当日に Pro オーナーの相手へお祝いメールを自動送信する。

## 仕様（打ち合わせ 2026-06-03）

- 生年月日から、相手に合わせた **アプローチ方法・仲良くなる手段** を提示する「占い的インサイト」を有料版の価値として位置づける（「これはかなり強い」）。
- 生年月日は **「非公開」を選べる**（入力したくない相手向け）。非公開時は分析・表示をマスクする。
- ※現状はルールベースの簡易分析。占い/AI 連携の高度化は将来。

## 現状の実装

- **生年月日インサイト**: `app.js` の `buildRelationshipProfile` が四柱推命/星座/季節/世代の簡易ロジックでヒントを生成し、予約時に `bookings.relationship_profile` 等へ保存。相手管理一覧に表示。
  - ※LLM ではなくルールベースの簡易分析。生年月日非公開時はマスク。
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

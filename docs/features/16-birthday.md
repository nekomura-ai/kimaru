# 16. 生年月日の占いベース相手分析（誕生日メールは廃止）

[← 機能一覧に戻る](./README.md)

- ステータス: 🔜 占い分析は未実装（現状プレースホルダ）。**誕生日メール自動送信は廃止（2026-06-09）**
- 対象プラン: 有料（Pro）
- 仕様: [`../spec.md`](../spec.md) / 決定: [`../open-decisions.md`](../open-decisions.md) 17・18

## 概要

生年月日入力の目的は **「占いベースの相手分析」**。相手を分析し、**アポイント時に気をつけること・注意点・相手に合わせた接し方**を発行者に提示する（Proの価値）。
※**誕生日お祝いメールの自動送信は廃止**（関係悪化時の逆効果・プライバシー懸念のため。2026-06-09 決定）。生年月日の収集と占い分析は継続。

## 仕様（2026-06-09 決定）

- **採用する占い体系: 算命学 ＋ 数秘術**（誕生日のみで算出可能なもの。四柱推命は時刻・出生地が要るため見送り、動物占いは算命学系として包含）。
- **まずルールベースで実装**（計算式で決定的に算出＝API費用なし・無料運用）。有料会員が増えキャッシュが出たら AI/上位プラン化を検討。
- 見せ方は **断定せず「こういう傾向があります／理論的な方が通るかも」** 等。**相手管理画面＋リマインダーの両方**に出す。
- 生年月日は **「非公開」を選べる**（非公開時は分析・表示をマスク。実装済）。
- ※現状は固定の汎用テキスト（プレースホルダ）で、算命学・数秘の実算出は**未実装**。これが今後の主タスク。

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

# 18. AIアシスト

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 部分実装（簡易ロジック・クライアント側）
- 対象プラン: 有料
- 仕様: [`../spec.md`](../spec.md) 有料版機能（AI アシスト ※将来）

## 概要

発行者のプロフィール（[17](./17-profile.md)）と相手データ（予約・生年月日インサイト）を照合し、関係構築の最適解を提案する。

## 現状の実装

- `ai-assist.html` で、`/api/me`・`/api/owner-bookings` から相手を選び、localStorage のプロフィールと突き合わせて提案を生成。
- 提案は **ルールベースの簡易ロジック**（生年月日インサイト等を利用）。LLM 連携ではない。

## 関連ファイル

- `public/ai-assist.html` — UI・提案生成（クライアント側）
- `public/app.js` — `buildRelationshipProfile` 等のインサイト生成（[16](./16-birthday.md)）
- 参照 API: `/api/me`, `/api/owner-bookings`

## 残タスク

- 実際の AI（LLM）連携による提案生成（将来）。
- プロフィールのサーバ保存（[17](./17-profile.md)）と連動した端末間利用。

# 10. 事前アンケート

[← 機能一覧に戻る](./README.md)

- ステータス: ❌ 未実装
- 対象プラン: 共通（質問数がプランで異なる）
- 仕様: [`../spec.md`](../spec.md) 主要機能 6

## 概要

予約時にゲストへ事前質問を提示し、回答を保存する。質問数や編集可否はプランで変わる。

## 仕様詳細

**無料版**

- 最大 2 問。
- 初期質問:
  1. 今回お話したい内容
  2. 今、実現したい夢や目標は何ですか？

**有料版**

- 最大 5 問。
- 質問内容を自由に編集可能。
- 必須 / 任意を設定可能。

推奨質問例: 今回お話したい内容 / 実現したい夢・目標 / 最近挑戦していること / 応援してほしいこと / 趣味や好きなこと。

## 現状の実装

- 未実装。`bookings.topic` / `filter_request` の自由入力のみ存在。
- `questionnaire_questions` / `questionnaire_answers` テーブルは未作成。

## 関連ファイル

- `public/booking.html` / `public/app.js` — ゲスト回答 UI
- 発行者の質問編集 UI（有料版・未作成）
- `netlify/functions/book.js` — 回答保存
- DB: `questionnaire_questions` / `questionnaire_answers`（仕様。現スキーマには未追加）

## 残タスク

- 質問・回答テーブル作成。
- 無料版は初期 2 問固定、有料版は編集 UI＋必須設定＋最大 5 問。
- 予約フォームに質問を差し込み、回答を `questionnaire_answers` に保存。
- プラン制限: [13. プラン](./13-plans.md)。

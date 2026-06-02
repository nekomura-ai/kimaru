# 10. 事前アンケート

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 部分実装（設定・保存は実装、ゲスト動的表示は未配線）
- 対象プラン: 共通（質問数がプランで異なる）
- 仕様: [`../spec.md`](../spec.md) 主要機能 6

## 概要

予約時にゲストへ事前質問を提示し、回答を保存する。質問数や編集可否はプランで変わる。

## 仕様詳細

- 無料版: 最大 2 問（初期: 「今回お話したい内容」「今、実現したい夢や目標は何ですか？」）。
- 有料版: 最大 5 問、編集可能、必須/任意の設定可。
- 推奨質問例: 挑戦していること / 応援してほしいこと / 趣味・好きなこと など。

## 現状の実装（できていること）

- 予約設定画面（`booking-settings.html`）に質問1〜5の入力 UI。質問3〜5は `pro-question` クラスで有料時のみ表示。
- `booking-page-save` がプラン別の質問数上限（無料2/有料5）を検証し、`questionnaire_questions`（`question_text` / `is_required` / `sort_order`）を全削除→再投入。先頭2問を必須として保存。

## 未実装（できていないこと）

- ゲストの予約画面（`booking.html` / `booking-week.js`）は **固定フィールド**（お話したい内容・夢/目標・生年月日）で、`questionnaire_questions` を**動的にレンダリングしていない**。
- 回答を `questionnaire_answers` に保存する処理が無い（現状は `topic` 等の固定カラムのみ）。

## 関連ファイル

- `public/booking-settings.html` / `netlify/functions/booking-page-save.js` — 質問の設定・保存
- `public/booking.html` / `public/booking-week.js` — ゲスト表示（動的化が必要）
- DB: `questionnaire_questions`（実装）/ `questionnaire_answers`（未使用）

## 残タスク

- 予約画面で `questionnaire_questions` を取得して動的にフォーム生成。
- 回答を `questionnaire_answers` に保存（`book.js` 拡張）。
- 必須/任意のバリデーションをゲスト側に反映。

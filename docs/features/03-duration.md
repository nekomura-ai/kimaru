# 03. 予約時間設定（30/45/60分）

[← 機能一覧に戻る](./README.md)

- ステータス: ❌ 未実装（現状 30分固定）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 2

## 概要

発行者が予約 1 件あたりの所要時間を選択できるようにする。

## 仕様詳細

選択肢: 30分 / 45分 / 60分。

## 現状の実装

- `booking_pages.duration_minutes` カラムは存在（デフォルト 30）。
- ただし空き枠生成は 30分固定で、選択 UI も反映ロジックも無い。

## 関連ファイル

- `netlify/functions/availability.js` — 枠生成（duration 反映が必要）
- `public/booking.html` / `public/app.js` — 予約 UI
- 発行者の予約ページ設定 UI（未作成）
- DB: `booking_pages.duration_minutes`

## 残タスク

- 発行者設定 UI に 30/45/60 の選択を追加。
- `availability.js` で `duration_minutes` を参照して枠を生成。
- 予約作成時の `end_at` を duration から算出。

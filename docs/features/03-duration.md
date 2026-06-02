# 03. 予約時間設定（30/45/60分）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 2

## 概要

発行者が予約 1 件あたりの所要時間を選択できる。

## 仕様詳細

選択肢: 30分 / 45分 / 60分。

## 現状の実装

- 予約設定画面（`booking-settings.html`）に 30/45/60 の選択 UI あり。
- `booking-page-save` で `{30,45,60}` を検証し `booking_pages.duration_minutes` に保存。
- `availability.js` が `duration_minutes` を使って空き枠を生成、`book.js` は予約の `end_at` を枠から確定。

## 関連ファイル

- `public/booking-settings.html` — 設定 UI
- `netlify/functions/booking-page-save.js` — 検証・保存
- `netlify/functions/availability.js` — 枠生成への反映
- DB: `booking_pages.duration_minutes`

## 残タスク

- なし（基本実装は完了）。UI の多言語化は [15](./15-i18n.md) で順次。

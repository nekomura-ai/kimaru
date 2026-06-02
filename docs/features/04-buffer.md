# 04. 前後バッファ設定

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 3

## 概要

予約の前後に空ける余白（バッファ）を発行者が設定でき、空き枠計算でバッファ分を確保する。

## 仕様詳細

- 前バッファ: なし / 15分 / 30分
- 後バッファ: なし / 15分 / 30分

## 現状の実装

- 予約設定画面に 前/後バッファ（なし/15/30）の選択 UI あり。
- `booking-page-save` で `{0,15,30}` を検証し `booking_pages.buffer_before_minutes` / `buffer_after_minutes` に保存。
- `availability.js` の枠生成で `step = duration + bufferBefore + bufferAfter`、各枠は `open+bufferBefore` 〜 `close-bufferAfter` の範囲で生成。

## 関連ファイル

- `public/booking-settings.html` — 設定 UI
- `netlify/functions/booking-page-save.js` — 検証・保存
- `netlify/functions/availability.js` — バッファを反映した枠生成
- DB: `booking_pages.buffer_before_minutes` / `buffer_after_minutes`

## 残タスク

- なし（基本実装は完了）。

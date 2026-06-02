# 07. 受付可能時間（曜日・時間帯）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) DB 設計 `availability_settings`

## 概要

発行者が「予約を受け付ける曜日と時間帯」を設定でき、空き枠生成はこの設定の範囲内かつ Google カレンダーの予定を避けて行う。

## 仕様詳細

- 曜日ごとに開始・終了時刻を設定（`day_of_week` / `start_time` / `end_time`）。

## 現状の実装

- 予約設定画面に 月〜日の有効チェック＋開始/終了時刻の入力 UI あり（既定: 平日 10:00–18:00 有効、土日無効）。
- `booking-page-save` が時刻形式・開始<終了を検証し、`availability_settings` を全削除→再投入で保存。
- `availability.js` が `availability_settings` を読み、無ければ平日 10:00–18:00 を既定として枠生成。Asia/Tokyo 計算。

## 関連ファイル

- `public/booking-settings.html` / `public/app.js` — 曜日別 UI（`updateAvailabilityRows`）
- `netlify/functions/booking-page-save.js` — `normalizeAvailability` で検証・保存
- `netlify/functions/availability.js` — 枠生成へ反映
- DB: `availability_settings`

## 残タスク

- なし（基本実装は完了）。

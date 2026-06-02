# 07. 受付可能時間（曜日・時間帯）

[← 機能一覧に戻る](./README.md)

- ステータス: ❌ 未実装
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) DB 設計 `availability_settings`

## 概要

発行者が「予約を受け付ける曜日と時間帯」を設定できるようにする。空き枠生成はこの設定の範囲内で、かつ Google カレンダーの予定を避けて行う。

## 仕様詳細

- 曜日ごとに開始・終了時刻を設定（`day_of_week` / `start_time` / `end_time`）。

## 現状の実装

- 未実装。現状は 10時/13時/15時/17時の固定グリッドで、設定不可。
- `availability_settings` テーブルも未作成。

## 関連ファイル

- `netlify/functions/availability.js` — 枠生成（受付時間の反映が必要）
- 発行者の設定 UI（未作成）
- DB: `availability_settings`（仕様。現スキーマには未追加）

## 残タスク

- `availability_settings` テーブル作成（曜日・時間帯）。
- 設定 UI（曜日ごとの時間帯入力）。
- `availability.js` を固定グリッドから設定ベースの枠生成へ置き換え。
- [03 予約時間](./03-duration.md) / [04 バッファ](./04-buffer.md) と整合させる。

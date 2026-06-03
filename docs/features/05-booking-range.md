# 05. 予約受付期間（1/3/6ヶ月）

[← 機能一覧に戻る](./README.md)

- ステータス: ⚠️ 実装済（無料上限の 3ヶ月 → 2ヶ月 変更が未反映）
- 対象プラン: 共通（上限はプランで制限）
- 仕様: [`../spec.md`](../spec.md) 主要機能 4

## 概要

何ヶ月先まで予約を受け付けるかを発行者が選択できる。プランにより上限が変わる。

## 仕様詳細

- 選択肢: 1ヶ月先 / 2ヶ月先 / 3ヶ月先 / 6ヶ月先
- 無料版: 最大 **2ヶ月**先まで（打ち合わせ 2026-06-03 で 3ヶ月 → 2ヶ月に変更）
- 有料版: 最大 6ヶ月先まで

> 「2と6（ニャンニャン）」。3ヶ月先まで予約が埋まるのは相当なヘビーユーザーで、その層は有料対象という判断。

## 現状の実装

- 予約設定画面に 1/3/6 の選択 UI あり。`app.js` の `updateBookingPageControls` が無料プランでは 6ヶ月オプションを無効化し、6 選択時は 3 に戻す。
- `booking-page-save` で `{1,3,6}` を検証、無料は `min(range,3)`、無料で 6 要求時は 403。`booking_pages.booking_range_months` に保存。
- `availability.js` が `booking_range_months`（1〜6にクランプ）まで枠を生成。

> ⚠️ **実装は現状 3ヶ月のまま**。打ち合わせ決定（無料2ヶ月）への更新が必要（下記 残タスク）。

## 関連ファイル

- `public/booking-settings.html` / `public/app.js` — UI・プラン別制御
- `netlify/functions/booking-page-save.js` — 検証・プラン制限・保存
- `netlify/functions/availability.js` — 期間反映
- DB: `booking_pages.booking_range_months`

## 残タスク

- **無料上限を 3ヶ月 → 2ヶ月に変更**（打ち合わせ 2026-06-03）。`booking-page-save` の `min(range,3)` と 403 判定、`app.js` の `updateBookingPageControls`、選択 UI に 2ヶ月オプション追加を要対応。
- プラン判定は [13. プラン](./13-plans.md) と連動。

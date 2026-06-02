# 05. 予約受付期間（1/3/6ヶ月）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済
- 対象プラン: 共通（上限はプランで制限）
- 仕様: [`../spec.md`](../spec.md) 主要機能 4

## 概要

何ヶ月先まで予約を受け付けるかを発行者が選択できる。プランにより上限が変わる。

## 仕様詳細

- 選択肢: 1ヶ月先 / 3ヶ月先 / 6ヶ月先
- 無料版: 最大 3ヶ月先まで
- 有料版: 最大 6ヶ月先まで

## 現状の実装

- 予約設定画面に 1/3/6 の選択 UI あり。`app.js` の `updateBookingPageControls` が無料プランでは 6ヶ月オプションを無効化し、6 選択時は 3 に戻す。
- `booking-page-save` で `{1,3,6}` を検証、無料は `min(range,3)`、無料で 6 要求時は 403。`booking_pages.booking_range_months` に保存。
- `availability.js` が `booking_range_months`（1〜6にクランプ）まで枠を生成。

## 関連ファイル

- `public/booking-settings.html` / `public/app.js` — UI・プラン別制御
- `netlify/functions/booking-page-save.js` — 検証・プラン制限・保存
- `netlify/functions/availability.js` — 期間反映
- DB: `booking_pages.booking_range_months`

## 残タスク

- なし（基本実装は完了）。プラン判定は [13. プラン](./13-plans.md) と連動。

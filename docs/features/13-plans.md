# 13. プラン（無料 / 有料）

[← 機能一覧に戻る](./README.md)

- ステータス: ✅ 実装済（主要な制限ロジックを実装）
- 対象プラン: 共通
- 仕様: [`../spec.md`](../spec.md) 主要機能 7・8

## 概要

無料版と有料版で利用できる機能・上限を分ける。招待コード（[12](./12-invite-code.md)）利用者は有料版相当を無料で使える。

## 仕様詳細

| 機能 | 無料版 | 有料版 |
|---|---|---|
| Google カレンダー連携 | ✅ | ✅ |
| 予約形式 | 1 対 1 | 1 対 1 ＋複数名調整 |
| 公開範囲 | 3ヶ月先まで | 6ヶ月先まで |
| 予約時間 | 30/45/60分 | 30/45/60分 |
| 前後バッファ | ✅ | ✅ |
| 事前アンケート | 最大 2 問 | 最大 5 問（編集・必須設定可） |
| Google Meet 自動発行 | ✅ | ✅ |
| 予約完了メール | ✅ | ✅ |
| 顧客管理 / 予約履歴 | − | ✅ |
| AI 要約 / Zoom | − | ※将来対応 |

## 現状の実装

- `owners.plan`（`free` / `pro`）が存在。昇格経路は2つ:
  - 招待コード（Cat Key）適用（[12](./12-invite-code.md)）
  - Square 決済 Webhook（`square-webhook` が payment/subscription イベント＋email でオーナーを `pro` 更新）
- プラン別制限が `booking-page-save` で実効:
  - 受付期間: 無料は最大3ヶ月（6要求は 403、`updateBookingPageControls` で UI も無効化）
  - 事前アンケート設定数: 無料2問 / 有料5問（超過は 403）
- 判定は各関数で `owner.plan === "pro"` を参照。

## 関連ファイル

- DB: `owners.plan`
- `netlify/functions/invite-apply.js` — Cat Key 昇格
- `netlify/functions/square-webhook.js` — 決済による昇格
- `netlify/functions/booking-page-save.js` / `public/app.js` — 制限の実効・UI制御

## 残タスク

- プラン判定の共通関数化（現状は各所で個別に `plan==="pro"` 判定）。
- 複数名調整など有料専用機能の追加。
- 事前アンケートのゲスト表示はプラン制限以前に未配線（[10](./10-questionnaire.md)）。

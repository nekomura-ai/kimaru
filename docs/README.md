# キマル（Kimaru）ドキュメント

最終更新: 2026-06-03

無料で使える日程調整ツール「キマル」のドキュメント集約インデックス。
打ち合わせ（2026-06-03）の決定を反映済み。各ドキュメントの入口はここ。

---

## 1. ドキュメント地図

| ドキュメント | 内容 |
|---|---|
| [`spec.md`](./spec.md) | 仕様書（やりたいこと全体）。主要機能・DB理想設計・UI/デザイン方針・プラン |
| [`features/README.md`](./features/README.md) | 機能一覧（ユーザー機能／運営者機能で分割・優先度付き）。各機能1ファイル |
| [`current-features.md`](./current-features.md) | 現状の実装棚卸し（実装済み／未実装／決定未反映） |
| [`plan-comparison.md`](./plan-comparison.md) | 無料版 / 有料版の説明資料（比較表） |
| [`pro-open-items.md`](./pro-open-items.md) | **Pro版で仕様が未確定・曖昧な点の洗い出し**（リリース前に埋める） |
| [`screens.md`](./screens.md) | 画面・URL 一覧、API 概要 |
| [`screen-flow.md`](./screen-flow.md) | 5アクター × 画面のアクセス権マトリクス・主要フロー |
| [`api.md`](./api.md) | API エンドポイント詳細（req/res・認証・環境変数） |
| [`db-schema.md`](./db-schema.md) | DB 構成（実テーブル・ER図・レガシー重複・今後の変更） |
| [`open-decisions.md`](./open-decisions.md) | 決定事項・保留事項・**注意事項/未確定**のログ |
| [`tasks.md`](./tasks.md) | **👤人間タスク / 💻実装タスク**の一覧（優先度・依存付き） |
| [`legal/`](./legal/) | 利用規約・プライバシーポリシー・特商法表記（ドラフト） |
| `mtg/` | 打ち合わせ議事録（元データ） |

外部の正本: ルートの [`../supabase-schema.sql`](../supabase-schema.sql)（DB定義）。

---

## 2. 確定仕様サマリ（打ち合わせ反映後）

| 項目 | 無料版 | 有料版（Pro） | 備考 |
|---|---|---|---|
| 料金 | ¥0 | ¥980 / 月 | 決済は **Square**。**1ヶ月無料お試し**（カード登録・後に自動課金、予定） |
| 予約ページ（日程調整URL）保存数 | 2つ | 5つ | 猫メンバーも5つ |
| 受付期間 | 2ヶ月先 | 6ヶ月先 | 「2と6（ニャンニャン）」 |
| 事前アンケート | 2問 | 5問（編集・必須設定可） | 据え置き |
| リマインダー | 22分前・プロフィール付き（メール送信） | 同左 | 「ニャンニャン前」。独自メールで送信 |
| Google Meet 自動発行 | ✅ | ✅ | |
| Zoom 自動発行 | 将来 | 将来 | 無料・有料とも |
| 会員同士の相互質問 | ✅ | ✅ | キマル会員同士で双方向 |
| 高度プロフィール / 占い的インサイト | − | ✅ | |
| 顧客管理・予約履歴 | − | ✅ | |

### アクター（5属性）

無登録 / 無課金（登録・無料）/ 課金者（Pro）/ 猫メンバー（Cat Key＝有料機能を無料）/ 運営。
画面ごとのアクセス可否は [`screen-flow.md`](./screen-flow.md)。

### 招待コード（Cat Key）

`Neko20240222`。猫の集会メンバーが有料機能を無料で使える。不正対策として**承認制**＋運営による**強制降格**（当面 Cat Key 利用者対象）。詳細 [`features/19`](./features/19-cat-key-admin.md) / [`features/22`](./features/22-admin-console.md)。

### 外部連携ロードマップ

Google（実装済）→ Zoom（将来）→ 議事録アプリ類（後々・マスタープラン）。
ログイン方式に依存せず後付け可能な設計。詳細 [`features/25`](./features/25-auth-architecture.md) / [`features/23`](./features/23-meeting-minutes.md)。

---

## 3. 実装状況サマリ

- **実装済み（要設定/検証）**: Googleログイン・カレンダー連携・Meet発行・予約作成・予約設定（時間/バッファ/期間/開催方法/受付時間）・アンケート設定保存・プラン制限・Cat Key適用と運営管理・相手管理・多言語（4画面）。
- **決定したが実装未反映**: 受付期間 無料2ヶ月（[05](./features/05-booking-range.md)）、複数予約ページ 無料2/有料5（[24](./features/24-multiple-booking-pages.md)）。
- **未実装（優先）**: アンケートのゲスト表示・回答保存（[10](./features/10-questionnaire.md)）、プロフィールのサーバ保存（[17](./features/17-profile.md)）、22分前リマインダー（[21](./features/21-reminder.md)）。
- **将来**: 会員相互質問・お試し期間・AI検索・議事録連携・法人プラン・Zoom発行。

次にやる残作業の優先順位は [`features/README.md` の「C. 実装優先順位」](./features/README.md#c-実装優先順位次にやる残作業) を参照。

---

## 4. 技術構成

静的 HTML / CSS / バニラ JS（`public/`）＋ サーバレス関数（`netlify/functions/`）＋ Supabase（PostgreSQL）。ビルド工程なし。
認証は Google OAuth（HMAC署名 Cookie セッション）。トークンは暗号化保存。

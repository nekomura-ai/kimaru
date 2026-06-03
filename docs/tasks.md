# キマル タスク一覧（人間タスク / 実装タスク）

最終更新: 2026-06-03

タスクを **👤 人間が行うタスク**（外部アカウント・購入・審査・法務・認証情報など、コードでは完結しないもの）と **💻 実装タスク**（コードで行う開発作業）に分けて管理する。
決定の根拠は [open-decisions.md](./open-decisions.md)、機能詳細は [features/README.md](./features/README.md)。

> 多くの実装タスクは、対応する人間タスク（鍵・ドメイン・外部設定）が完了しないと**動作確認できない**。依存は各項目に明記。

---

# 👤 人間が行うタスク

コード化できない／人間の判断・外部操作・契約が必要なもの。

## A. インフラ・ドメイン
- [ ] **独自ドメインを取得**し、Netlify に接続。`APP_BASE_URL` を確定。
- [ ] **Netlify 本番プロジェクト**の設定（デプロイ、Scheduled Functions 有効化）。
- [ ] **Supabase プロジェクト**を用意し、[`../supabase-schema.sql`](../supabase-schema.sql) を本番に適用（マイグレーション実行）。

## B. Google（ログイン・カレンダー）
- [ ] **Google Cloud Console** で OAuth クライアント作成（クライアントID/シークレット発行）。
- [ ] OAuth 同意画面の設定、**リダイレクトURI登録**（`{APP_BASE_URL}/api/google-auth-callback`）。
- [ ] **制限付きスコープ（カレンダー）のセキュリティ審査**を申請（プライバシーポリシー公開URLが前提・数週間想定）。

## C. メール送信（Resend）
- [ ] **Resend アカウント作成**、API キー取得。
- [ ] **送信元ドメインの認証（SPF / DKIM の DNS 設定）**、送信元アドレス（例: no-reply@ドメイン）決定。

## D. 決済（Square）
- [ ] **Square アカウント作成**（本番）。
- [ ] サブスクリプション商品（¥980/月）と **1ヶ月トライアル（カード登録あり）** の設定。
- [ ] **Webhook URL 登録**（`{APP_BASE_URL}/api/square-webhook`）、API キー・署名鍵取得。

## E. 環境変数（Netlify に設定）
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `APP_BASE_URL`
- [ ] セッション署名・トークン暗号化の秘密鍵
- [ ] `CAT_KEY_ADMIN_SECRET`（運営コンソール用）
- [ ] `RESEND_API_KEY` / 送信元アドレス / `BIRTHDAY_CRON_SECRET`（or `CRON_SECRET`）
- [ ] Square 関連（アクセストークン・署名鍵・プランID）

## F. 法務・運用
- [ ] [legal/](./legal/) ドラフトの**差し込み情報を確定**（運営者名・責任者・所在地・連絡先・管轄裁判所・制定日）。
- [ ] 利用規約・プライバシーポリシー・特商法表記の**法務レビュー**と**公開ページ掲載**。
- [ ] **Cat Key の運用ルール**（最新コード管理・承認の判断基準・承認者）を決める。

## G. デザイン・コンテンツ（保留含む）
- [ ] デザイン最終決定（青構成ベース＋タケダ氏相談）・ロゴ（保留9）。
- [ ] 3言語の翻訳文言の最終確認（[features/15](./features/15-i18n.md)）。

---

# 💻 実装タスク

コードで行う開発作業。優先順位は [features/README.md「C. 実装優先順位」](./features/README.md#c-実装優先順位次にやる残作業) と整合。

## 優先度 🔴 高

1. [ ] **受付期間 無料2ヶ月の反映**（[05](./features/05-booking-range.md)）
   - `booking_pages.booking_range_months` の CHECK を `(1,2,3,6)` に / `booking-page-save` の上限・403 / `app.js` UI / 選択肢に2ヶ月。
2. [ ] **複数の予約ページ `/b/{slug}`**（[24](./features/24-multiple-booking-pages.md)）
   - 1オーナー複数行を許可（slug はグローバル一意維持）/ 保存数上限（無料2・有料/猫5）/ `/b/:slug` リダイレクト / 一覧・作成・編集・削除UI / 公開ページの slug 解決。
3. [ ] **事前アンケートのゲスト動的表示＋回答保存**（[10](./features/10-questionnaire.md)）
   - `booking.html`/`booking-week.js` で `questionnaire_questions` を動的描画 / `questionnaire_answers` 保存 / 生年月日「非公開」UI。
4. [ ] **メール+パスワード認証**（[25](./features/25-auth-architecture.md)）依存: なし（Google審査とは独立）
   - 登録・ログイン・パスワードハッシュ・再設定・メール確認 / `owners` にハッシュ列。
5. [ ] **カレンダー連携を独立OAuthフロー化**（[25](./features/25-auth-architecture.md)）依存: 👤B
   - `google-auth-callback` から連携処理を分離 / 設定画面に「連携する」ボタン・連携状態表示。
6. [ ] **プロフィールのサーバ保存**（[17](./features/17-profile.md)）
   - `profiles` 保存API（端末間共有）/ 高度版エディタは後続。
7. [ ] **22分前リマインダー（メール）**（[21](./features/21-reminder.md)）依存: 👤C
   - Netlify Scheduled Functions で22分前抽出 / Resend 送信 / プロフィール本文 / 送信済み管理（重複防止）。

## 優先度 🟡 中

8. [ ] **Cat Key 承認制**（[19](./features/19-cat-key-admin.md) / [22](./features/22-admin-console.md)）
   - 入力を「承認待ち」記録 / 運営コンソールに承認・却下ボタン / 承認で `pro` 付与。
9. [ ] **運営コンソール拡充**（[22](./features/22-admin-console.md)）
   - 全ユーザー一覧の取得APIと画面。
10. [ ] **Square トライアル課金の連携**（[13](./features/13-plans.md)）依存: 👤D
   - サブスク作成導線 / `square-webhook` でトライアル→課金/解約に応じて `plan` 更新 / トライアル期限管理。
11. [ ] **予約完了メール（任意の独自送信）**（[11](./features/11-notification-email.md)）依存: 👤C
   - 開催方法・プロフィールを本文に反映。
12. [ ] **占い的インサイト高度化・生年月日非公開**（[16](./features/16-birthday.md)）

## 優先度 ⚪ 低 / 将来

13. [ ] **会員同士の相互質問**（[20](./features/20-member-mutual-questions.md)）
14. [ ] **AIアシスト高度化（LLM連携）**（[18](./features/18-ai-assist.md)）
15. [ ] **Zoom 自動発行**（[06](./features/06-location-type.md)）
16. [ ] **議事録アプリ連携**（[23](./features/23-meeting-minutes.md)）
17. [ ] **DBレガシー整理**（`owners`/`users` 等の重複解消、[db-schema.md](./db-schema.md)）

---

## 依存関係の要点

| 実装タスク | 先に必要な人間タスク |
|---|---|
| Google ログイン／カレンダー連携の動作確認 | B（OAuthクライアント・審査）＋ E（環境変数） |
| 22分前リマインダー・予約完了メール | C（Resend・DNS） |
| Square トライアル課金 | D（Square設定・Webhook） |
| 本番公開全般 | A（ドメイン・Supabase適用）＋ F（法務ページ掲載） |

> コード実装は人間タスクの完了前でも進められる（ローカル/モックで開発）。ただし**本番動作確認**は対応する人間タスクが前提。

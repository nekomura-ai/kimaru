# キマル 決定事項・保留事項ログ

最終更新: 2026-06-03

実装前に決めるべき論点の決定記録。✅ 決定 / ⏸ 保留。

---

## ✅ 決定事項（2026-06-03）

### 1. ホスティング・本番ドメイン（お任せ → 決定）
- **当面の本番は Netlify**（Vercel への移行はしない。既存実装＝`netlify/functions/` に合わせる）。Vercel 対応は将来用に維持。
- **独自ドメインを取得**し `APP_BASE_URL` に設定（ドメイン名は別途取得・確定）。
- スケジュール実行（誕生日メール等）は Netlify Scheduled Functions を利用。
- → 影響: Google OAuth リダイレクトURI＝`{APP_BASE_URL}/api/google-auth-callback`。

### 2. Google OAuth 審査（了解）
- カレンダーは制限付きスコープ。本番公開には Google のセキュリティ審査が必要、と認識。プライバシーポリシー掲載が前提（→ 決定8）。早めに着手。

### 3. ログイン方式
- **Google ソーシャルログイン ＋ メール+パスワード のみ**実装。Apple / LINE は採用しない。
- 認証と外部連携は分離（[features/25](./features/25-auth-architecture.md)）。メール+パスワードでも Google カレンダー連携は後付け可能。
- → 影響: メール+パスワードの登録・ログイン・パスワード再設定・メール確認の基盤が必要。

### 4. 予約ページのURL設計（おすすめ → 決定）
- **クリーンパス `/b/{slug}`**。`booking_pages.slug` は**グローバルに一意**（オーナーは複数ページを持てるが、各ページの slug は全体で一意）。
- 共有しやすい短いURL。Netlify リダイレクトで `/b/:slug` → `booking.html` に解決。
- → 影響: 現行スキーマの `slug unique` は維持でよい（[features/24](./features/24-multiple-booking-pages.md) / [db-schema](./db-schema.md)）。1オーナー複数行を許可する変更のみ。

### 5. 通知・メール方針（2026-06-03 更新）
- **メール送信を採用する**。ログイン時に発行者のメール、予約時にゲストのメールを取得するため、**双方にメール通知を送れる**。
- **予約完了通知**: 予約時に Google カレンダーへ招待（`sendUpdates=all`）＋必要に応じて独自メール（[features/11](./features/11-notification-email.md)）。
- **22分前リマインダー**: **独自メール送信で実装**（スケジューラ＋メール送信）。相手プロフィールを本文に載せられる（[features/21](./features/21-reminder.md)）。当初の「メール基盤なし」制約は解消。
- メール送信基盤は既存の **Resend**（`birthday-mails.js` で採用済み）を流用。**送信元ドメイン認証（SPF/DKIM）と送信元アドレスの設定**が必要。

### 6. 課金（Square 決済）（2026-06-03 決定）
- **決済は Square**（`square-webhook.js` 実装済み）。有料版 ¥980/月。
- Square の決済イベント Webhook で `owners.plan` を `pro` に昇格。
- **お試し期間 = 登録時にカード登録あり・無料1ヶ月、その後自動で有料へ移行**（2026-06-03 決定）。Square のサブスク（トライアル）機能で実現。
  - 登録時にカード登録 → 1ヶ月間 ¥0 → 期間終了で自動課金（¥980/月）。途中解約すれば課金されない。

### 7. Cat Key 承認制の運用
- **運営コンソールの画面から「承認」ボタンを押下**して有効化する形。
- フロー: ユーザーが Cat Key 入力 → **承認待ち**として記録 → 運営が一覧で確認し承認 → 有料機能を無料で解放。
- → 影響: 承認待ち状態を持つスキーマ／一覧UI／承認・却下アクション（[features/19](./features/19-cat-key-admin.md) / [features/22](./features/22-admin-console.md)）。

### 8. 法務ドキュメント（作成）
- **利用規約・プライバシーポリシー・特定商取引法に基づく表記** のドラフトを作成（[docs/legal/](./legal/)）。
- いずれも**ドラフト・要法務確認**。運営者名・連絡先・所在地などは確定後に差し込み。
- 特商法の支払方法は Square（決定6）。お試し期間の課金処理など細部は確定後に正式化。

---

## ⏸ 保留事項

### 9. デザイン最終確定
- 青構成ベース＋タケダ氏相談、ロゴ。**保留**。

### 10. タイムゾーン / グローバル対応
- 現状 Asia/Tokyo 固定。海外対応の範囲は**保留**。

### 11. 「複数名調整」の具体仕様（有料・将来）
- グループ日程調整のUX。**保留**。

---

## ⚠️ 注意事項・未確定事項（まとめ）

実装・運用前に**埋める必要がある未確定値**や、**技術的に注意すべき制約**の一覧。

### 埋める必要がある未確定値（TBD）

- **独自ドメイン名**（`APP_BASE_URL`）が未定。決定後、Google OAuth リダイレクトURI登録・各リンクに反映。
- **メール送信元**（決定5）: Resend の送信元ドメイン・アドレス、SPF/DKIM 設定が未定。
- **法務ドキュメントの差し込み情報**（[legal/](./legal/)）: 運営者名/責任者/所在地/連絡先/管轄裁判所/制定日。
- **Square 課金の実装詳細**（決定6）: トライアル（カード登録・1ヶ月無料・期限後自動課金・解約）の Square サブスク設定と Webhook 連携の具体設計。
- **メール+パスワード認証の細部**（決定3）: メール確認の要否、パスワード要件、再設定フロー、ハッシュ方式。
- **Cat Key 承認運用**（決定7）: 承認者・通知方法・承認待ち中のユーザー表示文言。

### 技術的な注意・リスク

- **Google OAuth 審査**: カレンダーは制限付きスコープ。本番公開に審査（数週間想定）とプライバシーポリシー公開URLが必須。スケジュールに織り込む。
- **22分前リマインダー**（決定5）: 独自メール送信で実装する。スケジューラ（Netlify Scheduled Functions）の実行間隔・精度と、送信対象抽出の重複防止に注意（[features/21](./features/21-reminder.md)）。
- **DB のレガシー重複**: `owners`/`users`、`google_connections`/`google_calendar_tokens`、`bookings` の `visitor_*`/`guest_*`・`start_at`/`start_time` 等が併存。新規は `owners`・`google_connections` 系を使用。整理マイグレーションは別途（[db-schema.md](./db-schema.md)）。
- **実装が決定に未追従**: 受付期間 無料2ヶ月（[05](./features/05-booking-range.md)）、複数予約ページ 無料2/有料5（[24](./features/24-multiple-booking-pages.md)）はコード未反映。
- **多言語の範囲**: 3言語対応は4画面のみ。予約枠表示やJS動的テキストは日本語のまま（[15](./features/15-i18n.md) / [screens.md](./screens.md)）。
- **環境変数の設定が前提**: `GOOGLE_CLIENT_ID/SECRET`、`APP_BASE_URL`、`CAT_KEY_ADMIN_SECRET`、（誕生日メール利用時）`RESEND_API_KEY` 等が未設定だと該当機能は動かない（[api.md](./api.md)）。

### 前提・想定（明示）

- 本番ホストは Netlify（移行しない）。Vercel は将来用に維持。
- 外部連携は Google（実装済）→ Zoom（将来）→ 議事録アプリ（後々）の順（[features/25](./features/25-auth-architecture.md)）。
- タイムゾーンは当面 Asia/Tokyo 固定（保留10）。

---

## 次アクション（決定の反映先）

- 3: メール+パスワード認証の基盤 → [features/25](./features/25-auth-architecture.md) に方針追記。
- 4: `/b/{slug}` ルーティング → [features/24](./features/24-multiple-booking-pages.md) / [db-schema](./db-schema.md) を更新。
- 5: 予約完了＝カレンダー招待、リマインダーは説明欄 → [features/11](./features/11-notification-email.md) / [features/21](./features/21-reminder.md) を更新。
- 7: 承認ボタン運用 → [features/19](./features/19-cat-key-admin.md) / [features/22](./features/22-admin-console.md) を更新。
- 8: 法務ドラフト作成 → [docs/legal/](./legal/)。

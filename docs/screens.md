# キマル 画面・URL 一覧

最終更新: 2026-06-03

`public/` 配下の静的ページがそのまま URL になる。ローカルは `npm run dev`（`netlify dev`）で **http://localhost:8888** が基点。表中の URL は基点からの相対パス。

関連: 機能一覧は [`features/README.md`](./features/README.md)、仕様は [`spec.md`](./spec.md)、現状機能は [`current-features.md`](./current-features.md)、**画面一覧・アクター別アクセス権は [`screen-flow.md`](./screen-flow.md)**、DB構成は [`db-schema.md`](./db-schema.md)。

## 画面（公開ページ）

| URL | 画面名 | 役割 | i18n | 主なスクリプト |
|---|---|---|---|---|
| `/` (`index.html`) | トップ / ランディング | サービス紹介・無料/Pro比較・各画面への導線 | ✅ 日/英/繁中 | `i18n.js` |
| `/signup.html` | 無料登録 | 無料アカウント申請フォーム | ✅ 日/英/繁中 | `i18n.js`, `app.js` |
| `/booking.html` | 予約ページ（ゲスト） | 1週間の空き枠表示＋予約フォーム（事前アンケート・生年月日） | ✅ 日/英/繁中（枠表は日本語） | `i18n.js`, `booking-week.js` |
| `/admin.html` | 相手管理（ダッシュボード） | ログイン状態・Cat Key適用・予約一覧・面談メモ・印象スコア | ✅ 日/英/繁中（動的は一部日本語） | `i18n.js`, `app.js` ＋インライン |
| `/booking-settings.html` | 予約設定 | 受付時間・公開範囲・開催方法・事前アンケートの設定 | ⏳ 日本語のみ | （要確認） |
| `/profile.html` | プロフィールシート | 発行者プロフィールの整備 | ⏳ 日本語のみ | （要確認） |
| `/ai-assist.html` | AIアシスト | プロフィールと相手データ照合の支援（Pro想定） | ⏳ 日本語のみ | （要確認） |
| `/pro.html` | Pro版 | Pro機能紹介・無料/Pro比較 | ⏳ 日本語のみ | （要確認） |
| `/square.html` | Pro版決済 | Square決済への導線 | ⏳ 日本語のみ | （要確認） |
| `/cat-key-admin.html` | 猫の鍵 管理（運営コンソール） | 運営専用。Cat Key の承認・降格・監査。将来は全ユーザー一覧も（[features/22](./features/22-admin-console.md)） | ⏳ 日本語のみ | （要確認） |

凡例: ✅ 3言語対応済 / ⏳ 未対応（日本語のみ・順次対応）

### 管理画面は2系統

- **ユーザー向け管理**（発行者が使う）: `/admin.html`（相手管理）・`/profile.html`（プロフィール）・`/booking-settings.html`（予約設定）。
- **運営者向け管理**（運営だけが使う）: `/cat-key-admin.html`。現状は Cat Key のみ。全ユーザー一覧・Cat Key 承認制は未実装（[features/22](./features/22-admin-console.md)）。

### 注意

- `/pro-apply.html`（「Pro申し込み」）は `admin.html` のナビから参照されているが **ファイルが存在しない**。現状は `styles.css` の `.site-header a[href="/pro-apply.html"]{display:none}` で**リンク自体を非表示**にしている。ページを作るかリンクを削除するか要判断。
- 3言語対応は今回トップ/登録/予約/相手管理の4画面が対象。残りページとJS動的生成テキスト（スケジュールグリッドの曜日・ステップ、AI誕生日分析、印象スコアの保存文字列など）は日本語のまま。

## API エンドポイント

詳細（リクエスト/レスポンス・DB・認証・環境変数）は [`api.md`](./api.md) を参照。以下は概要。

`/api/*` は配信先で関数にルーティングされる（`netlify.toml` で `/api/*` → `/.netlify/functions/:splat`）。

| URL | メソッド | 役割 | 認証 |
|---|---|---|---|
| `/api/google-auth-start` | GET | Google OAuth 開始（認可画面へリダイレクト） | 不要 |
| `/api/google-auth-callback` | GET | OAuth コールバック・トークン保存・ログイン確立 | 不要 |
| `/api/me` | GET | 現在のログインユーザー取得 | 要 |
| `/api/logout` | POST | ログアウト（セッション破棄） | 要 |
| `/api/signup` | POST | 無料アカウント申請の保存 | 不要 |
| `/api/availability` | GET | 空き枠取得（Google freeBusy で既存予定を除外） | 不要 |
| `/api/book` | POST | 予約作成＋Googleカレンダー予定登録 | 不要 |
| `/api/booking-page-save` | POST | 予約ページ設定（時間/バッファ/期間/開催方法/質問）保存 | 要 |
| `/api/owner-bookings` | GET | 自分の予約一覧 | 要 |
| `/api/appointment-log` | GET / POST | 面談ログの取得・保存 | 要 |
| `/api/invite-apply` | POST | 招待コード（Cat Key）適用・プラン昇格 | 要 |
| `/api/square-webhook` | POST | Square 決済イベント受信（プラン昇格） | 署名 |

補足: `netlify/functions/birthday-mails.js` も存在（誕生日メール関連のバッチ/関数。HTTP公開URLかは要確認）。

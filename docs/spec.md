# キマル（Kimaru）仕様書

最終更新: 2026-05-31

## 目的

無料範囲で運用できる日程調整ツール「キマル」を完成させる。
フロントは Vercel、DB は Supabase を使う。

一般ユーザー目線で作る。ポーカー専用の表現は使わない。
猫の集会は「招待コード特典」としての運用で進める。
HTML / JS / CSS のシンプル構成で、高速な web サービスを目指す。

## 技術構成

| 領域 | 採用 |
|---|---|
| Frontend | Vercel で無料運用 |
| Database | Supabase |
| Auth | Supabase Auth または Google ログイン |
| Calendar | Google Calendar API |
| Meeting | Google Meet 自動発行を優先実装 |
| Zoom | 将来的に実装できる設計にしておく |

## 主要機能

### 1. Google カレンダー連携

- 発行者の Google カレンダー予定を取得
- 既存予定を避けて空き時間のみ表示
- 予約確定後、Google カレンダーに予定を自動作成

### 2. 予約時間設定

発行者が以下から選択できる。

- 30分
- 45分
- 60分

### 3. 前後バッファ設定

発行者が設定できる。

- 前バッファ: なし / 15分 / 30分
- 後バッファ: なし / 15分 / 30分

### 4. 予約受付期間

発行者が選択できる。

- 1ヶ月先まで
- 3ヶ月先まで
- 6ヶ月先まで

| プラン | 公開可能範囲 |
|---|---|
| 無料版 | 3ヶ月先まで |
| 有料版 | 6ヶ月先まで |

### 5. 開催方法

予約ページ作成時に、発行者側が開催方法を選択できる。

選択肢:

- 対面
- Google Meet 自動発行
- Zoom 自動発行 ※将来対応
- 電話
- カスタム URL
- 後で連絡

各選択肢の挙動:

- **Google Meet を選択した場合**
  - 予約確定時に Google Meet リンクを自動発行
  - 予約完了メールに Meet リンクを記載
  - Google カレンダー予定にも Meet リンクを反映
- **対面を選択した場合**: 住所入力欄を表示
- **電話を選択した場合**: 電話番号または案内文を設定可能にする
- **カスタム URL を選択した場合**: 発行者が任意 URL を入力できる

### 6. 事前アンケート

無料版と有料版で質問数を分ける。

**無料版**

- 最大 2 問まで
- 初期質問:
  1. 今回お話したい内容
  2. 今、実現したい夢や目標は何ですか？

**有料版**

- 最大 5 問まで
- 質問内容を自由に編集可能
- 必須 / 任意を設定可能

推奨質問例:

- 今回お話したい内容
- 今、実現したい夢や目標は何ですか？
- 最近挑戦していることはありますか？
- 応援してほしいことはありますか？
- 趣味や好きなことはありますか？

### 7. 有料版機能

有料版では以下を実装、または実装できる設計にする。

- 6ヶ月先まで予約公開
- 複数名での日程調整
- 事前アンケート最大 5 問
- 顧客管理
- 予約履歴管理
- AI 要約機能 ※将来対応
- Zoom 自動発行 ※将来対応

### 8. 無料版機能

無料版では以下を使える。

- Google カレンダー連携
- 1 対 1 予約
- 3ヶ月先まで公開
- 30分 / 45分 / 60分予約
- 前後バッファ設定
- 事前アンケート最大 2 問
- Google Meet 自動発行
- 予約完了メール

### 9. 招待コード

猫の集会メンバー用の招待コード入力欄を作る。

- 招待コード: `Neko20240222`
- このコードを入力したユーザーは、有料版機能を無料で使えるようにする。

## 10. データベース設計（Supabase）

### users

- id
- email
- name
- plan
- invite_code
- created_at

### profiles

- id
- user_id
- display_name
- bio
- profile_url
- created_at

### booking_pages

- id
- user_id
- title
- description
- duration_minutes
- buffer_before_minutes
- buffer_after_minutes
- booking_range_months
- location_type
- location_value
- is_active
- created_at

### availability_settings

- id
- user_id
- day_of_week
- start_time
- end_time
- created_at

### bookings

- id
- booking_page_id
- user_id
- guest_name
- guest_email
- start_time
- end_time
- meeting_url
- location_type
- status
- created_at

### questionnaire_questions

- id
- booking_page_id
- question_text
- is_required
- sort_order
- created_at

### questionnaire_answers

- id
- booking_id
- question_id
- answer_text
- created_at

### google_calendar_tokens

- id
- user_id
- access_token
- refresh_token
- expiry_date
- created_at
- updated_at

### invite_codes

- id
- code
- plan_grant
- is_active
- created_at

## 11. UI 方針

- 一般ユーザー目線で作る
- ポーカー専用の表現は使わない
- 猫の集会は招待コード特典としての運用で進める
- HTML / JS / CSS のシンプル構成で高速な web サービスを目指す

## プラン別機能まとめ

| 機能 | 無料版 | 有料版 |
|---|---|---|
| Google カレンダー連携 | ✅ | ✅ |
| 予約形式 | 1 対 1 | 1 対 1 + 複数名調整 |
| 公開範囲 | 3ヶ月先まで | 6ヶ月先まで |
| 予約時間 | 30/45/60分 | 30/45/60分 |
| 前後バッファ | ✅ | ✅ |
| 事前アンケート | 最大 2 問 | 最大 5 問（編集・必須設定可） |
| Google Meet 自動発行 | ✅ | ✅ |
| 予約完了メール | ✅ | ✅ |
| 顧客管理 | − | ✅ |
| 予約履歴管理 | − | ✅ |
| AI 要約 | − | ※将来対応 |
| Zoom 自動発行 | − | ※将来対応 |

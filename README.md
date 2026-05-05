# いくつに見える？ - AI年齢推定アプリ

## 商品概要
「ねえあたし、いくつに見える？」

カメラで写真を撮るだけで、AI（VLM）が年齢を推定するWebアプリ。ローディング画面の「ドキドキ感」こそが主役の体験設計。

**特徴**
- カメラ撮影 → 3秒のドキドキ演出 → 年齢結果表示
- 画像は保存されない（プライバシー保護）
- サクラAI（Sakura AI Engine）のAPIを活用
- 3ファイル構成（Python/Flask + HTML/CSS/JS）で軽量

## ターゲット・ユーザー
- 20-40代女性（自分の見た目年齢が気になる層）
- SNSシェアしたい層（Instagram/Twitter）
- イベント・パーティーでの余興需要
- 美容・エステ・化粧品ブランドのプロモーション利用

## セールスポイント

### 1. 体験としてのドキドキ感
ローディングは単なる待ち時間ではない。「ドキドキ…」「あと少し…」「結果は…？」とテキストが変化し、背景が桜色に呼吸する。この数秒間こそがユーザーが商品に対価を払う価値。

### 2. サクラテーマ（スポンサー：Sakura AI）
桜の花びらが舞い散る演出で、スポンサーであるSakura AIのブランド価値を自然に訴求。企業のプロモーション・タイアップに最適。

### 3. プライバシー配慮
画像はサーバーに保存されず、メモリ内で処理され即座に破棄。ユーザーの安心感を醸成。

### 4. 手軽さ・導入の容易さ
- ブラウザのみ（アプリダウンロード不要）
- 3ファイル構成でカスタマイズ容易
- Render等のPaaSに数分でデプロイ可能

## ビジネスモデル

### 広告モデル
- 結果画面にスポンサー広告（美容・化粧品・エステ等）
- 桜テーマのタイアップ広告

### ライセンス販売
- 企業・ブランド向けカスタマイズ版の提供
- ホワイトラベル（自社ブランド化）ライセンス

### イベント・店舗導入
- タブレット設置型の提供
- イベントでのフォトブース代わりに

## 技術スタック
- **Backend**: Python + Flask
- **Frontend**: HTML + CSS + JavaScript（バニラ）
- **AI**: Sakura AI Engine VLM API
- **Deploy**: Render.com（推奨）/ Railway / Fly.io

## クイックスタート

### ローカル実行
```bash
pip install -r requirements.txt
export SAKURA_API_TOKEN="your_token_here"
python app.py
```
ブラウザで `http://localhost:5000` にアクセス

### デプロイ（Render）
1. GitHubにリポジトリをプッシュ
2. Render.comで「New Web Service」
3. リポジトリを連携
4. 環境変数 `SAKURA_API_TOKEN` を設定
5. デプロイ完了（数分）

## スポンサー：Sakura AIについて
本アプリは、Sakura AI EngineのVLM（Vision Language Model）APIを活用しています。

- **Sakura AI Engine**: https://api.ai.sakura.ad.jp
- 主要モデル: Qwen3-VL-30B-A3B-Instruct
- 画像認識＋言語理解を組み合わせた高精度な推定が可能

スポンサーシップの詳細は、Sakura AIまでお問い合わせください。

## 開発・実装ステータス

### 完了済み
- [x] Flask アプリ作成 - `app.py` でカメラ画像受信、VLM API呼び出し、結果返却
- [x] HTML/CSS/JS フロント作成 - カメラ起動、プレビュー、桜テーマ演出
- [x] VLM API連携 - Sakura AI Engine `preview/Qwen3-VL-30B-A3B-Instruct` を直接呼び出し
- [x] 画像メモリ処理 - 一時保存せず base64 でメモリ内処理、リクエスト完了で破棄
- [x] プロンプト調整 - 「ねえあたし、いくつに見える？この人物の年齢を推定して。数値のみで答えてください」

### デプロイ検討・実施
- [x] Vercel不可確認 - VercelはPython/Flask未対応。Render/Railway等が選択肢
- [ ] Renderデプロイ設定 - `requirements.txt` 作成済み、`Procfile` 作成済み
- [ ] Railwayデプロイ設定 - `nixpacks.toml` または自動検出でデプロイ可能か確認
- [ ] Cloud Functions検討 - Google Cloud Functions or AWS Lambda でAPIのみデプロイする選択肢

### デプロイ作業
- [ ] Renderにデプロイ - GitHub連携または `render deploy` CLIでデプロイ
- [ ] 環境変数設定 - `SAKURA_API_TOKEN` をデプロイ先で設定
- [ ] CORS設定 - 必要に応じてFlask-CORS追加

## 今後のロードマップ
- [ ] ファイルアップロード機能（後回し）
- [ ] SNSシェアボタン実装
- [ ] 結果履歴（ローカルストレージ）
- [ ] 複数人同時推定
- [ ] 企業タイアップ用カスタマイズ版

## ライセンス
詳細は別途契約。

---
## お問い合わせ 
プロモーション・ライセンス・カスタマイズのご相談は、開発者まで。

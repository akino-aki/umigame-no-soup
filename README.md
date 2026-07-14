# ウミガメのスープ Next.js

🐢 AI出題者と「ウミガメのスープ」で遊ぶアプリ 🐢

ユーザーが問題に対して質問を送り、出題者が「はい / いいえ / 関係ありません / 正解」などで回答する。
回答判定は、モック判定または Amazon Bedrock による生成AI判定を環境変数で切り替え可能。

## 機能

- 問題文の表示
- ユーザーからの質問送信
- `/api/ask` による質問判定
- 出題者による回答表示
  - はい
  - いいえ
  - 関係ありません
  - どちらとも言い切れません
  - 正解

- 正解時の真相表示
- モック判定と Bedrock 判定の切り替え

## ファイル構成

```text
.
├── app/
│   ├── api/
│   │   └── ask/
│   │       └── route.ts      # 質問判定API
│   ├── layout.tsx            # ルートレイアウト
│   ├── page.tsx              # トップページ
│   └── globals.css           # 全体スタイル
├── components/
│   └── Game.tsx              # ゲーム画面
├── lib/
│   ├── ai/
│   │   ├── judge.ts          # AI判定クライアントの選択
│   │   ├── mockJudge.ts      # モック判定
│   │   ├── bedrockJudge.ts   # Bedrock判定
│   │   └── types.ts          # AI判定の型定義
│   └── server/
│       └── storyBank.ts      # 問題・真相データ
└── docs/
    └── development-guide.md  # 開発ガイド
```

## 開発ルール

ブランチの命名規則や開発フローについては、[開発ガイド](./docs/development-guide.md) を参照する。

## 起動方法

### 依存パッケージのインストール

```bash
npm install
```

### ローカル開発

開発サーバーを起動する。

```bash
npm run dev
```

ブラウザで以下を開く。

```text
http://localhost:3000
```

`NEXT_PUBLIC_API_BASE_URL`を設定していない場合は、Next.jsの`/api/ask`を使用する。

この場合、質問判定には`AI_PROVIDER`で指定したモック判定またはBedrock判定が使用される。<br>
`AI_PROVIDER`が未設定の場合は、モック判定を使用する。

### 通常ビルド

Next.jsアプリをビルドする。

```bash
npm run build
```

ビルドしたアプリを起動する。

```bash
npm start
```

ブラウザで以下を開く。

```text
http://localhost:3000
```

通常ビルドではNext.jsサーバーを起動するため、`NEXT_PUBLIC_API_BASE_URL`を設定していない場合も`/api/ask`を使用できる。

### 静的ビルド

S3やCloudFrontから配信する静的ファイルを生成する場合は、外部の質問判定APIのURLを指定する。

リポジトリ直下に`.env.production.local`を作成し、API GatewayのベースURLを設定する。

```text
NEXT_PUBLIC_API_BASE_URL=https://<API ID>.execute-api.ap-northeast-1.amazonaws.com
```

`NEXT_PUBLIC_API_BASE_URL`には`/ask`を含めない。アプリ側でベースURLの末尾に`/ask`を追加する。

静的ビルドを実行する。

```bash
npm run build:static
```

生成された静的ファイルは`out/`に出力される。

ローカルで静的ファイルを確認する場合は、以下を実行する。

```bash
npx serve out
```

ターミナルに表示されたURLをブラウザで開く。

静的ビルドでは、質問の送信先として`NEXT_PUBLIC_API_BASE_URL`で指定した外部APIを使用する。

`NEXT_PUBLIC_API_BASE_URL`はビルド時に静的ファイルへ反映されるため、URLを変更した場合は再度`npm run build:static`を実行する。

## AI判定の切り替え

このアプリでは、質問への回答判定を以下の2種類から選択できる。

| `AI_PROVIDER` | 内容                            |
| ------------- | ------------------------------- |
| `mock`        | キーワードベースのモック判定    |
| `bedrock`     | Amazon Bedrock による生成AI判定 |
| 未設定        | モック判定                      |

環境変数は、リポジトリ直下の `.env.local` に設定する。

### モック判定を使用する場合

ローカルでUIやゲームの動作を確認する場合は、モック判定を使用する。

```env
AI_PROVIDER=mock
```

`AI_PROVIDER` が未設定の場合も、デフォルトでモック判定を使用する。

### Bedrock判定を使用する場合

Bedrockを使用する場合は、以下の環境変数を設定する。

```env
AI_PROVIDER=bedrock
AWS_REGION=ap-northeast-1
BEDROCK_MODEL_ID=<利用するモデルIDまたは推論プロファイルID>
```

AWSのアクセスキーやシークレットキーは、`.env.local` やソースコードには記載しない。

ローカル環境では、AWS CLIのプロファイルやIAM Identity Centerなどの認証情報を使用する。
AWS上で実行する場合は、実行環境に付与されたIAMロールを使用する。

## SageMaker Studioでの起動方法

SageMaker Studio Code Editorでは、アプリがポートプロキシ配下で公開されるため、静的ファイルの参照先を環境変数で指定する。

### 環境変数

SageMaker StudioでBedrock判定を確認する場合は、`.env.local` に以下を設定する。

```env
AI_PROVIDER=bedrock
AWS_REGION=ap-northeast-1
BEDROCK_MODEL_ID=<利用するモデルIDまたは推論プロファイルID>
NEXT_ASSET_PREFIX=/codeeditor/default/ports/3000
```

モック判定で確認する場合は、以下のように設定する。

```env
AI_PROVIDER=mock
NEXT_ASSET_PREFIX=/codeeditor/default/ports/3000
```

ポート番号を変更する場合は、`NEXT_ASSET_PREFIX` の末尾も同じポート番号に変更する。

例：4000番ポートを使用する場合

```env
NEXT_ASSET_PREFIX=/codeeditor/default/ports/4000
```

### 依存パッケージのインストール

別のOSで作成された `node_modules` が残っている場合、実行権限の違いにより `next: Permission denied` が発生することがある。

SageMaker Studio上で依存パッケージを入れ直す。

```bash
rm -rf node_modules .next
npm ci
```

### アプリの起動

現在、SageMaker Studio上では `npm run dev` で起動すると、画面表示後に入力やクリック操作ができない事象を確認している。

そのため、SageMaker Studioでは本番相当の方法で起動する。

```bash
npm run build
npm start
npm run build
npm start
```

起動後、以下の形式のURLへアクセスする。

```text
https://<SageMakerのドメイン>/codeeditor/default/ports/3000/
```

### 動作確認

以下を確認する。

- UIが正常に表示される
- 入力欄へ文字を入力できる
- 質問例ボタンを押すと入力欄へ反映される
- 「聞く」ボタンから質問を送信できる
- モック判定または Bedrock 判定の回答がチャット欄へ表示される

`npm run dev` で操作できない問題は、別Issueで継続して調査する。

## 注意事項

`.env.local` はGit管理対象外。
APIキー、アクセスキー、シークレットキーなどの認証情報はリポジトリに含めない。

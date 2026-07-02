# ウミガメのスープ Next.js MVP

AI出題者とウミガメのスープで遊ぶための最小構成MVPです。
現時点ではAI判定をモック化しています。

## 機能

- 問題文を表示
- ユーザーが質問を送信
- `/api/ask` で出題者が「はい / いいえ / 関係ありません / 正解」を返す
- 正解に近い質問をすると真相を表示
- 将来のBedrock差し替え用に `lib/ai/judge.ts` へ判定処理を集約

## 起動方法

### 通常時

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

### SageMaker Studio

SageMaker Studio Code Editorでは、アプリがポートプロキシ配下で公開されるため、静的ファイルの参照先を環境変数で指定する。

#### 環境変数の設定

リポジトリ直下に`.env.local`を作成し、以下を設定する。

```env
AI_PROVIDER=mock
NEXT_ASSET_PREFIX=/codeeditor/default/ports/3000
```

`.env.local`はGitの管理対象外であり、リポジトリにはコミットしない。

ポート番号を変更する場合は、`NEXT_ASSET_PREFIX`の末尾も同じポート番号へ変更する。

例として4000番ポートを使用する場合は、以下のように設定する。

```env
NEXT_ASSET_PREFIX=/codeeditor/default/ports/4000
```

#### 依存パッケージのインストール

別のOSで作成された`node_modules`が残っている場合、実行権限の違いにより`next: Permission denied`が発生することがある。

SageMaker Studio上で依存パッケージを入れ直す。

```bash
rm -rf node_modules .next
npm ci
```

#### アプリの起動

現在、SageMaker Studio上では`npm run dev`で起動すると、画面表示後に入力やクリック操作ができない事象が確認されている。

そのため、SageMaker Studioでは本番相当の方法で起動する。

```bash
npm run build
npm start
```

起動後、以下の形式のURLへアクセスする。

```text
https://<SageMakerのドメイン>/codeeditor/default/ports/3000/
```

## ファイル構成

```text
app/
  api/ask/route.ts      # 質問判定API
  layout.tsx            # ルートレイアウト
  page.tsx              # トップページ
  globals.css           # 全体スタイル
components/
  Game.tsx              # ゲーム画面
lib/
  ai/
    judge.ts            # AI判定クライアント選択
    mockJudge.ts        # モック判定
    types.ts            # AI判定型
  server/
    storyBank.ts        # 問題・真相データ
```

## 開発ルール

ブランチの命名規則や開発フローについては、  
[開発ガイド](./docs/development-guide.md) を参照してください。

## Bedrockに差し替えるときの方針

1. `lib/ai/bedrockJudge.ts` を作る
2. `JudgeClient` 型に合わせて実装する
3. `lib/ai/judge.ts` で `AI_PROVIDER=bedrock` の場合だけBedrock実装を返す
4. 画面側 `components/Game.tsx` は原則変更しない

Bedrockでは、真相をプロンプトに渡す場合でも、モデルには「答えを直接漏らさず、はい/いいえ/関係ありません/正解だけ返す」制約を入れる想定です。

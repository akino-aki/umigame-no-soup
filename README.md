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

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

SageMaker Studio などでポート3000が使えない場合は、次のようにポートを変えられます。

```bash
npm run dev -- -p 3001
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

## Bedrockに差し替えるときの方針

1. `lib/ai/bedrockJudge.ts` を作る
2. `JudgeClient` 型に合わせて実装する
3. `lib/ai/judge.ts` で `AI_PROVIDER=bedrock` の場合だけBedrock実装を返す
4. 画面側 `components/Game.tsx` は原則変更しない

Bedrockでは、真相をプロンプトに渡す場合でも、モデルには「答えを直接漏らさず、はい/いいえ/関係ありません/正解だけ返す」制約を入れる想定です。

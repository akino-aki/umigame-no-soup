# 開発ガイド

開発時に決めたルールを忘れないためのメモ。
運用しながら必要に応じて更新する。

## ブランチ戦略

- `main` は、動作確認済みの安定した状態を保つ
- `main` では直接作業しない
- 作業開始前に `main` を最新化する
- `main` からIssueに対応する作業ブランチを作成する
- 作業完了後はPull Requestを作成し、`main` へマージする
- マージ後は、ローカルとリモートの作業ブランチを削除する

## ブランチの命名規則

ブランチ名には、対応するIssue番号を必ず入れる。

```text
種類/Issue番号-変更内容
```

変更内容は、英小文字とハイフンを使用して記載する。

| 種類       | 用途                                                   | 例                                 |
| ---------- | ------------------------------------------------------ | ---------------------------------- |
| `feature`  | 新機能の追加                                           | `feature/1-add-hint-button`        |
| `fix`      | 不具合や不便な挙動の修正                               | `fix/19-restore-input-focus`       |
| `refactor` | 動作を変えないコード整理                               | `refactor/30-simplify-api-handler` |
| `docs`     | ドキュメントの追加・変更                               | `docs/10-add-development-guide`    |
| `style`    | インデントや改行など、動作に影響しないコード表記の修正 | `style/12-format-game-component`   |
| `chore`    | 設定や依存関係などの変更                               | `chore/9-update-dependencies`      |

### `style` の対象

`style` は、画面のデザイン変更ではなく、コードの表記だけを整える場合に使用する。

例：

- インデントの修正
- 空白や改行の整理
- セミコロンの追加・削除
- フォーマッターによるコード整形

ボタンの色や画面レイアウトなど、ユーザーが見る画面を変更する場合は、目的に応じて `feature` または `fix` を使用する。

## コミットメッセージの規則

コミットメッセージは、以下の形式で記載する。

```text
type(scope): 変更内容
```

- `type`：変更の種類
- `scope`：変更対象。必要がない場合は省略してもよい
- `変更内容`：何を変更したかを簡潔に日本語で記載する

| type       | 用途                               | 例                                              |
| ---------- | ---------------------------------- | ----------------------------------------------- |
| `feat`     | 新機能の追加                       | `feat(game): ヒント機能を追加`                  |
| `fix`      | 不具合や不便な挙動の修正           | `fix(ui): 質問送信後に入力欄へフォーカスを戻す` |
| `refactor` | 動作を変えないコード整理           | `refactor(api): 質問判定処理を整理`             |
| `docs`     | ドキュメントの追加・変更           | `docs: 開発ガイドを追加`                        |
| `style`    | 動作に影響しないコード表記の修正   | `style(game): インデントと改行を整理`           |
| `chore`    | 設定、依存関係、開発環境などの変更 | `chore(deps): 依存パッケージを更新`             |

何を変更したか分からないメッセージは使用しない。

```text
NG: 修正
NG: update
NG: いろいろ変更
```

## 開発フロー

1. Issueを作成する
2. `main` ブランチへ移動する
3. リモートの変更を取得し、`main` を最新化する
4. `main` からIssueに対応する作業ブランチを作成する
5. 実装する
6. 動作確認を行う
7. 変更内容をコミットする
8. 作業ブランチをリモートへpushする
9. Pull Requestを作成する
10. Pull Requestの内容と差分を確認する
11. `main` へマージする
12. リモートとローカルの作業ブランチを削除する

### 作業開始時のコマンド例

```bash
git switch main
git pull origin main
git switch -c fix/19-restore-input-focus
```

### 作業完了時のコマンド例

```bash
git add .
git commit -m "fix(ui): 質問送信後に入力欄へフォーカスを戻す"
git push -u origin fix/19-restore-input-focus
```

### マージ後のコマンド例

Pull Request画面の「Delete branch」から、リモートの作業ブランチを削除する。

その後、ローカルで以下を実行する。

```bash
git switch main
git pull origin main
git branch -d fix/19-restore-input-focus
git fetch --prune
```

## IssueとPull Requestの書き方

IssueとPull Requestは、リポジトリ内のテンプレートを使用する。

- 機能追加：`feature.md`
- 不具合修正：`bug-fix.md`
- Pull Request：`pull_request_template.md`

## その他

ルールに迷った場合は、先にこのドキュメントを確認する。
新しく決めたことや、実際の運用と合わなくなったルールは、その都度追記・修正する。

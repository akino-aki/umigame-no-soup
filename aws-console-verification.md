# AWS低コスト構成のコンソール検証メモ

## 検証した構成

CloudFront + S3 + API Gateway HTTP API + Lambda + Bedrock

## 動作確認結果

- S3に検証用HTMLを配置できた
- CloudFront経由でHTMLを表示できた
- API Gateway HTTP APIからLambdaを呼び出せた
- LambdaからBedrockを呼び出せた
- ブラウザから質問を送信し、AI回答を表示できた

## 作成したリソース

- S3 bucket
- CloudFront distribution
- API Gateway HTTP API
- Lambda
- Lambda execution role(自動作成)
  - inline policy(Bedrockの操作許可)
- CloudWatch Logs(自動作成)

## Lambda設定

- Runtime: Node.js 24.x
- Timeout： 30s
- Memory: 128MB
- Environment variables:
  - BEDROCK_MODEL_ID

## API Gateway設定

- API type: HTTP API
- Route: POST /ask
- CORS:
  - Allow-Origin: \*
  - Allow-Headers: content-type
  - Allow-Methods: POST, OPTIONS

## CloudFront設定

- Origin: S3 bucket
- Default root object: index.html
- S3 access: CloudFrontからのアクセスを許可

## ハマった点

### Lambda環境変数

`AWS_REGION` はLambdaの予約済み環境変数のため、手動設定できなかった。  
Lambda実行環境で自動設定されるため、独自に設定する必要はない。

- [定義されたランタイム環境変数](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/configuration-envvars.html?utm_source=chatgpt.com#configuration-envvars-runtime)

### 日本語レスポンスの文字化け

Lambdaレスポンスの `Content-Type` に `charset=utf-8` を付ける必要があった。  
（Power shellで呼び出すと文字化けした）

```js
"Content-Type": "application/json; charset=utf-8"
```

### CloudFrontのAccessDenied

CloudFrontのデフォルトルートオブジェクトが未設定だったため、`AccessDenied`が表示された。  
`index.html`を設定することで解消した。

## CDK化時に必要なリソース

- S3 bucket
- CloudFront distribution
- OACまたはCloudFrontからS3へのアクセス許可
- API Gateway HTTP API
- Lambda
- Lambda execution role
- policy
- Bedrock InvokeModel権限
- CloudWatch Logs
- CORS設定

## 後続Issue候補

- 検証したAWS低コスト構成をCDKで再作成する
- Next.jsアプリを静的エクスポートできるようにする
- 質問判定APIをLambdaでも使える形へ整理する

## 手動作成リソースの削除方針

本Issueで作成したAWSリソースは、低コスト構成の検証用であり、CDK管理下へ直接取り込まない。  
検証結果を `docs/aws-console-verification.md` に記録した後、手動作成リソースは削除する。

削除対象は以下。

- CloudFront Distribution
- S3 bucket
- API Gateway HTTP API
- Lambda function
- Lambda execution role
- CloudWatch Logs log group

削除時は、CloudFront Distributionを先に無効化し、無効化が反映された後に削除する。
S3 bucketは中身を空にしてから削除する。

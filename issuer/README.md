デプロイ手順
===========================================

1. Dev Containerを開く
2. 以下のコマンドでGCPにログイン
```
gcloud auth login
```
3. resources/authlete.propertiesに適切なアクセストークンを設定
```
service.access_token = アクセストークン
```
4. 以下のコマンドを実行してデプロイ
```
sh /workspace/shells/deploy.sh
```
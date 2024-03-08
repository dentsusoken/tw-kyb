# tw-kyb
これは、2023年度Trusted WebのKYC/KYBプロジェクトです。

## プロジェクト概要
中小法人・個人事業者向けの補助金・給付金申請において、本人確認と実在証明に必要となる証明書類を検証可能な形でデータ化し、関係者間で安全な方法でデータ共有することで、補助金・給付金の申請手続きを効率化するとともに、データの利活用が可能となる仕組みの提供を目指しています。


## 動作環境
以下の環境で動作します。

ミドルウェア

- Node.js 18.x

- Expo 49.x

- Next.js 13.x

- Java 1.8.x

## 環境構築手順

以下の手順で環境構築を行います。
  1. [Visual Studio Codeのインストール](https://code.visualstudio.com/download)及びセットアップ
  2. [Dockerのインストール](https://www.docker.com/products/docker-desktop/)
  3. Gitアカウント作成
  4. Gitのインストール（Windowsのみ）
  5. [ソースコード](https://github.com/dentsusoken/tw-kyb.git)のダウンロード
  6. Node.jsのインストール
  7. Expo goのインストール
  8. Firebaseプロジェクトの作成
  9. Firebase Authenticationの設定
  10. GCPプロジェクトの作成
  11. Google App Engineの設定
  12. java-oauth-serverのデプロイ
  13. walletアプリの起動

詳細については、[環境構築手順書](https://github.com/dentsusoken/tw-kyb/raw/main/doc/%E3%83%87%E3%83%A2%E7%92%B0%E5%A2%83%E6%A7%8B%E7%AF%89%E6%89%8B%E9%A0%86.docx)を御覧ください。

## 注意事項
本アプリケーションは実証実験用のプロトタイプシステムです。
実運用上での利用は保障されていません。
実運用においては、性能およびセキュリティ等についても別途検討が必要です。

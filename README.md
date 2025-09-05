# social-post-tools

SNS運用を効率化するための AIツールです。

設定値は localStorage に保存され、`config`のvalueを共有することで、手元の設定環境を別の環境で再現することができます。

## 機能

- **投稿生成**: 参考投稿を元に、要件に基づいたSNS投稿を自動生成
- **翻訳**: 日本語から英語への翻訳（カスタムルール対応）
- **ガイドラインチェック**: 投稿内容のガイドライン適合性チェック

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を参考に`.env`ファイルを作成し、必要な環境変数を設定してください。

#### OpenAI を使用する場合

```bash
# AI Provider Configuration
AI_PROVIDER=openai

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
```

#### Azure OpenAI を使用する場合

```bash
# AI Provider Configuration
AI_PROVIDER=azure

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4.1-mini
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

### 3. サーバの起動

```bash
npm run dev
```
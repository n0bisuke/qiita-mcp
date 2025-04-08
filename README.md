# Qiita MCP Server

Qiita APIを使用してClaudeから記事の執筆や更新などを行うためのMCPサーバー実装です。fetch APIを使用しています。

## セットアップ

### 1. 依存パッケージのインストール

```bash
cd qiita-mcp
npm install
```

### 2. Qiitaアクセストークンの設定

[Qiitaの設定画面](https://qiita.com/settings/tokens)からアクセストークンを発行し、`fetch-server.js`ファイル内の該当箇所に設定してください。

### 3. VS Codeの設定

VS Codeの設定ファイル（settings.json）に以下の設定を追加します：

```json
{
  "mcp": {
    "servers": {
      "qiita-mcp-server": {
        "command": "node",
        "args": ["絶対パス/qiita-mcp/fetch-server.js"]
      }
    }
  }
}
```

絶対パスの例：
```
/Users/username/ds/3_project/mcp/qiita-mcp/fetch-server.js
```

## 使用可能なツール

このMCPサーバーは以下のツールを提供します：

### 記事関連

- `get_qiita_user` - 認証済みユーザー情報を取得
- `search_qiita_articles` - 記事を検索
- `get_qiita_article` - 特定の記事を取得
- `get_my_qiita_articles` - 自分の記事一覧を取得

### タグ関連

- `get_qiita_tags` - タグ一覧を取得

## 使用例

### 記事を検索

```
「プログラミング」に関する記事を検索して
```

### ユーザー情報を取得

```
自分のQiita情報を教えて
```

## 注意事項

- このMCPサーバーを使用するには、Qiita APIのアクセストークンが必要です
- アクセストークンは第三者に漏れないように管理してください

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFileSync } from 'fs';
import { homedir } from 'os';
import path from 'path';

// トークンを環境変数またはClaude Desktopの設定から取得
function getQiitaTokenFromConfig() {
  try {
    // トークンの取得方法を柔軟に対応
    const configPaths = [
      path.join(homedir(), '.claude-desktop', 'config.json'),
      path.join(homedir(), '.claude', 'config.json')
    ];

    for (const configPath of configPaths) {
      try {
        const configContent = readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        
        // Qiitaトークンの保存場所に応じて適切に調整
        const token = config.qiitaToken || config.services?.qiita?.token || process.env.QIITA_TOKEN;
        
        if (token) return token;
      } catch (fileError) {
        // ファイルが存在しない、または読み取れない場合は次のパスを試す
        continue;
      }
    }

    // 環境変数からも取得を試みる
    const envToken = process.env.QIITA_TOKEN;
    if (envToken) return envToken;

    throw new Error('Qiitaトークンが見つかりません');
  } catch (error) {
    console.error('トークン取得エラー:', error.message);
    throw error;
  }
}

const token = getQiitaTokenFromConfig();

// Qiita APIのベースURL
const BASE_URL = 'https://qiita.com/api/v2';

// 共通のヘッダー
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// MCPサーバーの作成
const server = new McpServer({
  name: "Fetch Qiita MCP Server",
  version: "1.0.0",
});

// ユーザー情報を取得するツール
server.tool(
  "get_qiita_user",
  "Qiitaの認証済みユーザー情報を取得します",
  {},
  async () => {
    try {
      console.log('リクエスト開始: /authenticated_user');
      const response = await fetch(`${BASE_URL}/authenticated_user`, { 
        method: 'GET',
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('リクエスト成功:', response.status);
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      console.error('エラー詳細:', error);
      return {
        content: [{ type: "text", text: `エラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// 記事検索ツール
server.tool(
  "search_qiita_articles",
  "Qiitaの記事を検索します",
  { 
    query: z.string(),
    page: z.number().optional().default(1),
    per_page: z.number().optional().default(20)
  },
  async ({ query, page, per_page }) => {
    try {
      const url = new URL(`${BASE_URL}/items`);
      url.searchParams.append('query', query);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', per_page.toString());
      
      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `エラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// 特定の記事を取得するツール
server.tool(
  "get_qiita_article",
  "特定のQiita記事を取得します",
  { 
    item_id: z.string()
  },
  async ({ item_id }) => {
    try {
      const response = await fetch(`${BASE_URL}/items/${item_id}`, { 
        method: 'GET',
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `エラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// 自分の記事一覧を取得するツール
server.tool(
  "get_my_qiita_articles",
  "自分のQiita記事一覧を取得します",
  { 
    page: z.number().optional().default(1),
    per_page: z.number().optional().default(20)
  },
  async ({ page, per_page }) => {
    try {
      const url = new URL(`${BASE_URL}/authenticated_user/items`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', per_page.toString());
      
      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `エラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// Qiitaのタグ一覧を取得するツール
server.tool(
  "get_qiita_tags",
  "Qiitaのタグ一覧を取得します",
  { 
    page: z.number().optional().default(1),
    per_page: z.number().optional().default(20),
    sort: z.enum(["count", "name"]).optional().default("count")
  },
  async ({ page, per_page, sort }) => {
    try {
      const url = new URL(`${BASE_URL}/tags`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('per_page', per_page.toString());
      url.searchParams.append('sort', sort);
      
      const response = await fetch(url, { 
        method: 'GET',
        headers 
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `エラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// 記事を投稿するツール
server.tool(
  "create_qiita_article",
  "Qiitaに新しい記事を投稿します",
  { 
    title: z.string(),
    body: z.string(),
    tags: z.array(z.object({
      name: z.string(),
      versions: z.array(z.string()).optional()
    })),
    private: z.boolean().optional().default(false),
    tweet: z.boolean().optional().default(false)
  },
  async ({ title, body, tags, private: isPrivate, tweet }) => {
    try {
      const response = await fetch(`${BASE_URL}/items`, { 
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          body,
          tags,
          private: isPrivate,
          tweet
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            message: "記事の投稿に成功しました",
            article: data
          }, null, 2) 
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `記事の投稿中にエラーが発生しました: ${error.message}` }],
      };
    }
  }
);

// 通信を開始
const transport = new StdioServerTransport();
await server.connect(transport);
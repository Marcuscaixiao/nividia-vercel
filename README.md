# NVIDIA API Proxy — Vercel 版

透明代理 NVIDIA API，部署在 Vercel Serverless Functions 上。

## 项目结构

```
api/
  v1/
    [...path].ts   ← 核心代理，捕获所有 /v1/* 请求
vercel.json        ← 路由重写：/v1/* → /api/v1/*
package.json
tsconfig.json
```

## 部署步骤

### 1. 部署到 Vercel

**方式 A — 通过 Vercel 控制台（推荐）**

1. 把这个文件夹推送到 GitHub / GitLab
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 直接点击 Deploy，无需配置任何环境变量

**方式 B — 通过 CLI**

```bash
npm install
npm i -g vercel
vercel --prod
```

### 2. 本地开发

```bash
npm install
npm i -g vercel
vercel dev
# 访问 http://localhost:3000/v1/...
```

## 使用方式

部署完成后，把 OpenAI SDK 或其他客户端的 `baseURL` 改为你的 Vercel 域名，API Key 照常传你自己的：

```
https://your-project.vercel.app/v1
```

示例（Python）：
```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-project.vercel.app/v1",
    api_key="nvapi-xxxx"  # 你自己的 NVIDIA API Key，正常传
)

response = client.chat.completions.create(
    model="meta/llama-3.1-8b-instruct",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)
```

示例（JavaScript）：
```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://your-project.vercel.app/v1',
  apiKey: 'nvapi-xxxx',  // 你自己的 NVIDIA API Key
});
```

## 特性

- ✅ 完全透明代理，保留所有 headers 和状态码
- ✅ 支持流式输出（SSE / stream=true）
- ✅ CORS 全开放，支持浏览器直接调用
- ✅ 服务端注入 API Key，客户端无感知
- ✅ 2 分钟超时保护
- ✅ 无任何前端框架依赖，结构极简

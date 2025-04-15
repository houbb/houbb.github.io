---
layout: post
title: AgentGPT-01-在浏览器中组装、配置和部署自主 AI 代理 入门介绍
date: 2025-4-3 14:03:48 +0800
categories: [AI]
tags: [ai, ai-agent, sh]
published: true
---

# AI MCP 系列

[AgentGPT-01-入门介绍](https://houbb.github.io/2025/04/03/ai-brower-agent-01-agentGPT)

[Browser-use 是连接你的AI代理与浏览器的最简单方式](https://houbb.github.io/2025/04/03/ai-brower-agent-02-browser-use)

[AI MCP(大模型上下文)-01-入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-01-intro)

[AI MCP(大模型上下文)-02-awesome-mcp-servers 精选的 MCP 服务器](https://houbb.github.io/2025/04/15/ai-mcp-02-awesome-servers)

[AI MCP(大模型上下文)-03-open webui 介绍 是一个可扩展、功能丰富且用户友好的本地部署 AI 平台，支持完全离线运行。](https://houbb.github.io/2025/04/15/ai-mcp-03-open-webui)

[AI MCP(大模型上下文)-04-n8n 为技术团队打造的安全工作流自动化平台](https://houbb.github.io/2025/04/15/ai-mcp-04-n8n)

[AI MCP(大模型上下文)-05-anything-llm AnythingLLM 您一直在寻找的全方位AI应用程序](https://houbb.github.io/2025/04/15/ai-mcp-05-anything-llm)

[AI MCP(大模型上下文)-06-maxkb 强大易用的企业级 AI 助手](https://houbb.github.io/2025/04/15/ai-mcp-06-maxkb)

[AI MCP(大模型上下文)-07-dify 入门介绍](https://houbb.github.io/2025/04/15/ai-mcp-07-dify-intro)

[AI MCP(大模型上下文)-08-分享一些好用的 Dify DSL 工作流程](https://houbb.github.io/2025/04/15/ai-mcp-08-awesome-dify-workflow)

[AI MCP(大模型上下文)-09-基于Dify自主创建的AI应用DSL工作流](https://houbb.github.io/2025/04/15/ai-mcp-09-difyaia)

[AI MCP(大模型上下文)-10-Activepieces 一个开源的 Zapier 替代方案](https://houbb.github.io/2025/04/15/ai-mcp-10-activepieces)

[AI MCP(大模型上下文)-11-微软 Playwright MCP server](https://houbb.github.io/2025/04/15/ai-mcp-11-playwright-mcp)

[AI MCP(大模型上下文)-12-AWS MCP](https://houbb.github.io/2025/04/15/ai-mcp-12-aws-mcp)

[AI MCP(大模型上下文)-13-github MCP](https://houbb.github.io/2025/04/15/ai-mcp-13-github-mcp)

# AgentGPT

## 🤖 在浏览器中组装、配置和部署自主 AI 代理 🤖

[![AgentGPT Logo](https://raw.githubusercontent.com/reworkd/AgentGPT/main/next/public/banner.png)](https://agentgpt.reworkd.ai)

### 相关链接

- [🔗 快捷链接](https://agentgpt.reworkd.ai)
- [📚 文档](https://reworkd.ai/docs)
- [🐦 Twitter](https://twitter.com/reworkdai)
- [📢 Discord](https://discord.gg/gcmNyAAFfV)

AgentGPT 允许您配置并部署自主 AI 代理。您可以自定义 AI 代理的名称，并让其执行任何您设想的目标。它将通过思考任务、执行任务并从结果中学习来尝试实现目标 🚀。

---

## ✨ 演示

要获得最佳演示体验，请直接访问 [我们的站点](https://agentgpt.reworkd.ai) 😃

[演示视频](https://github.com/reworkd/AgentGPT/assets/50181239/5348e44a-29a5-4280-a06b-fe1429a8d99e)

---

## 👨‍🚀 快速开始

AgentGPT 提供了自动化的 CLI 安装程序，便于快速设置。

CLI 会帮助您配置以下内容：
- 🔐 [环境变量](https://github.com/reworkd/AgentGPT/blob/main/.env.example)（包括 API 密钥）
- 🗂️ [数据库](https://github.com/reworkd/AgentGPT/tree/main/db)（MySQL）
- 🤖 [后端](https://github.com/reworkd/AgentGPT/tree/main/platform)（FastAPI）
- 🎨 [前端](https://github.com/reworkd/AgentGPT/tree/main/next)（Next.js）

### 先决条件 📌

在开始之前，请确保您的系统已安装以下工具：
- 代码编辑器（例如 [Visual Studio Code](https://code.visualstudio.com/download)）
- [Node.js](https://nodejs.org/en/download)
- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/products/docker-desktop)（安装后，请创建账户、打开 Docker 应用并登录）
- [OpenAI API 密钥](https://platform.openai.com/signup)
- [Serper API 密钥](https://serper.dev/signup)（可选）
- [Replicate API 令牌](https://replicate.com/signin)（可选）

### 安装步骤 🚀

1. **打开代码编辑器**
2. **打开终端** - 在 VS Code 中，您可以使用 `Ctrl + ~`（Windows）或 `Control + ~`（Mac）打开终端。
3. **克隆仓库并进入目录**

   **Mac/Linux 用户** 🍏 🐧
   ```bash
   git clone https://github.com/reworkd/AgentGPT.git
   cd AgentGPT
   ./setup.sh
   ```
   **Windows 用户** 🖥️
   ```bash
   git clone https://github.com/reworkd/AgentGPT.git
   cd AgentGPT
   ./setup.bat
   ```
4. **按照脚本指引完成安装** - 配置 API 密钥，确保所有服务启动后，访问 [http://localhost:3000](http://localhost:3000) 体验。

祝您玩得开心！ 🎉

---

## 🚀 技术栈

- ✅ **基础框架**：[create-t3-app](https://create.t3.gg) + [FastAPI-template](https://github.com/s3rius/FastAPI-template)
- ✅ **前端框架**：[Next.js 13 + TypeScript](https://nextjs.org/) + [FastAPI](https://fastapi.tiangolo.com/)
- ✅ **身份验证**：[Next-Auth.js](https://next-auth.js.org)
- ✅ **ORM**：[Prisma](https://prisma.io) & [SQLModel](https://sqlmodel.tiangolo.com/)
- ✅ **数据库**：[Planetscale](https://planetscale.com/)
- ✅ **样式**：[TailwindCSS + HeadlessUI](https://tailwindcss.com)
- ✅ **模式验证**：[Zod](https://github.com/colinhacks/zod) + [Pydantic](https://docs.pydantic.dev/)
- ✅ **LLM 工具**：[Langchain](https://github.com/hwchase17/langchain)

# 参考资料

https://github.com/reworkd/AgentGPT

* any list
{:toc}
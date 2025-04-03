---
layout: post
title: AgentGPT-01-入门介绍
date: 2025-4-3 14:03:48 +0800
categories: [AI]
tags: [ai, ai-agent, sh]
published: true
---

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
---
layout: post
title: InsForge 是一个为 AI 辅助开发构建的后端平台
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent, sh]
published: true
---

# InsForge

**InsForge 是一个为 AI 辅助开发构建的后端平台。**

将 InsForge 连接到任何 AI Agent，即可在几秒钟内为你的应用添加：

* 身份认证
* 数据库
* 文件存储
* Serverless 函数
* AI 集成。 ([GitHub][1])

---

# 关键功能与使用场景

## 核心功能

* **Authentication（身份认证）**
  完整的用户管理系统

* **Database（数据库）**
  灵活的数据存储与查询能力

* **Storage（存储）**
  文件管理与组织

* **AI Integration（AI 集成）**
  支持聊天补全与图像生成（兼容 OpenAI API）

* **Serverless Functions（无服务器函数）**
  提供可扩展的计算能力

* **Site Deployment（网站部署）**
  简化应用部署（即将推出）。 ([GitHub][1])

---

## 使用场景

使用 **自然语言** 构建全栈应用。

例如：

* 将 AI Agent 连接到 InsForge
* 让 Claude、GPT 或其他 AI Agent 自动管理你的后端系统。 ([GitHub][1])

---

# 示例 Prompt

---

# 快速开始（TLDR）

## 1. 安装并运行 InsForge

推荐使用 Docker。

前置条件：

* Docker
* Node.js

运行：

```bash
git clone https://github.com/insforge/insforge.git
cd insforge
cp .env.example .env
docker compose up
```

---

## 2. 连接 AI Agent

访问 InsForge Dashboard：

```
http://localhost:7131
```

登录后：

* 按照 **Connect** 指南
* 配置 **MCP（Model Context Protocol）连接**

---

## 3. 测试连接

在你的 Agent 中发送：

```
I'm using InsForge as my backend platform, fetch InsForge instruction doc to learn more about InsForge.
```

如果成功，Agent 会调用 InsForge 的 MCP 工具。

---

## 4. 开始使用 InsForge

现在可以在新的目录中开始构建项目。

例如：

* Todo 应用
* Instagram 克隆
* 在线社区平台

都可以在几秒钟内搭建。

---

# 示例项目 Prompt

例如：

```
Build an app similar to Reddit with community-based discussion threads using InsForge as the backend platform
```

需求：

* 社区列表
* 每个社区独立帖子流
* 用户可以创建帖子（文本或图片）
* 用户可以评论和回复
* 帖子和评论支持点赞/点踩
* 显示点赞数和评论数

---

# 系统架构

系统结构：

```
Agents
 ├ Claude
 ├ Cursor
 ├ Windsurf
 └ Coding Agent
        ↓
   MCP (Model Context Protocol)
        ↓
    InsForge Backend
        ├ Storage
        ├ Auth
        ├ Database
        ├ Edge Functions
        └ AI Integration
```

说明：

AI Agent 通过 **MCP 协议**调用 InsForge 提供的后端能力。

---

# 贡献

如果你有兴趣参与项目开发，可以查看：

```
CONTRIBUTING.md
```

欢迎：

* 提交 Pull Request
* 修复 Bug
* 改进文档
* 参与社区讨论。

---

# 文档与支持

## 文档

官方文档提供：

* 完整使用指南
* API 参考。

---

## 社区

* Discord 社区
* Twitter 更新

---

## 联系方式

邮箱：

```
info@insforge.dev
```

---

# License

该项目使用：

**Apache License 2.0**

---

# 一句话总结

**InsForge = 一个面向 AI Agent 的 Backend-as-a-Service（BaaS）平台。**

它类似：

* Supabase
* Firebase

但设计目标是：

**让 AI Agent 能直接理解和操作后端系统，从而自动构建和管理全栈应用。** ([SourceForge][2])


# 参考资料

* any list
{:toc}
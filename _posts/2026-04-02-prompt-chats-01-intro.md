---
layout: post 
title: prompts.chat AI 对话模型 Prompt 示例集合
date: 2026-04-02 21:01:55 +0800
categories: [AI]
tags: [ai, LLM]
published: true
---

# prompts.chat

## 这是什么？

一个精选整理的 **AI 对话模型 Prompt 示例集合**。最初为 ChatGPT 创建，这些 Prompt 同样适用于任何现代 AI 助手。

| 浏览 Prompt | 数据格式 |
|----------------|--------------|
| [prompts.chat](https://prompts.chat/prompts) | [prompts.csv](prompts.csv) |
| [PROMPTS.md](https://raw.githubusercontent.com/f/prompts.chat/main/PROMPTS.md) | [Hugging Face 数据集](https://huggingface.co/datasets/fka/prompts.chat) |

**想要贡献？** 在 [prompts.chat/prompts/new](https://prompts.chat/prompts/new) 添加 Prompt —— 会自动同步到这里。

---

## 📖 Prompt 工程交互式书籍

通过我们的 **免费交互式指南** 学习 Prompt 工程 —— 超过 25 个章节，涵盖从基础到高级技术（如思维链推理、Few-shot 学习、AI Agent）。

**[开始阅读 →](https://fka.gumroad.com/l/art-of-chatgpt-prompting)**

---

## 🎮 面向儿童的 Prompt 学习

一个互动式、游戏化的学习体验，通过有趣的谜题和故事，教会 8-14 岁儿童如何与 AI 沟通。

**[开始体验 →](https://prompts.chat/kids)**

---

## 🚀 自托管

部署你自己的私有 Prompt 库，支持自定义品牌、主题和认证。

**快速开始：**
```bash
npx prompts.chat new my-prompt-library
cd my-prompt-library
````

**手动安装：**

```bash
git clone https://github.com/f/prompts.chat.git
cd prompts.chat
npm install && npm run setup
```

安装向导会配置品牌、主题、认证（GitHub / Google / Azure AD）以及功能。

📖 **完整自托管指南**（SELF-HOSTING.md） • 🐳 **Docker 指南**（DOCKER.md）

---

## 🔌 集成

### CLI

```bash
npx prompts.chat
```

### Claude Code 插件

```
/plugin marketplace add f/prompts.chat
/plugin install prompts.chat@prompts.chat
```

📖 插件文档（CLAUDE-PLUGIN.md）

### MCP Server

在你的 AI 工具中将 prompts.chat 作为 MCP 服务使用。

**远程（推荐）：**

```json
{
  "mcpServers": {
    "prompts.chat": {
      "url": "https://prompts.chat/api/mcp"
    }
  }
}
```

**本地：**

```json
{
  "mcpServers": {
    "prompts.chat": {
      "command": "npx",
      "args": ["-y", "prompts.chat", "mcp"]
    }
  }
}
```

📖 MCP 文档：[https://prompts.chat/docs/api](https://prompts.chat/docs/api)

---

## 💖 赞助商

（保持原内容不变，仅展示）

---

## 👥 贡献者

（贡献者列表）

---

## 📜 许可证

**CC0 1.0 通用许可（公共领域）** —— 可自由复制、修改、分发和使用，无需署名。

# 参考资料

* any list
{:toc}
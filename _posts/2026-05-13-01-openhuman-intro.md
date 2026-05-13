---
layout: post 
title: OpenHuman 是您的个人 AI 超级智能。私密、简单且极其强大。
date: 2026-05-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---


# OpenHuman

**OpenHuman 是您的个人 AI 超级智能。私密、简单且极其强大。**

Discord · Reddit · X/Twitter · 文档 · 关注 @senamakel (创建者)

> **早期 Beta 版**：正在积极开发中，可能存在不完善之处。

如需安装或开始使用，请从网站 tinyhumans.ai/openhuman 下载，或运行以下命令：

```bash
# 在 https://tinyhumans.ai/openhuman?utm_source=github&utm_medium=readme 下载 DMG、EXE 文件，或在终端中运行

# MacOS/Linux
curl -fsSL https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.sh | bash

# Windows
irm https://raw.githubusercontent.com/tinyhumansai/openhuman/main/scripts/install.ps1 | iex
```

## 什么是 OpenHuman？

OpenHuman 是一个开源的代理（agentic）助手，旨在融入您的日常生活。以下每个要点都链接到文档中更详细的说明。

*   **简单、UI优先 & 人性化**：简洁的桌面体验和简短的引导流程，让您只需点击几下就能从安装到获得一个可工作的代理——无需先配置，也无需终端。代理拥有一个形象：一个桌面吉祥物，它可以说话、对周围环境做出反应、作为真实参与者加入您的 Google Meet、数周后仍能记住您，甚至在您停止输入后仍在后台持续思考。

*   **118+ 第三方集成并支持自动获取**：通过 **一键 OAuth** 接入 Gmail、Notion、GitHub、Slack、Stripe、Calendar、Drive、Linear、Jira 以及您工作栈中的其他应用。每个连接都会作为一个类型化工具暴露给代理，并且核心每隔二十分钟就会遍历每个活跃连接，将最新数据拉取到记忆树中。无需编写提示词或轮询循环，因此代理在早上就已拥有今天的上下文。

*   **记忆树 + Obsidian Wiki**：一个基于您的数据和活动构建的本地优先知识库。您连接的每项内容都会被规范化成不超过 3000 个 token 的 Markdown 块，进行评分，并折叠成存储在您机器 **SQLite** 中的分层摘要树。这些相同的 Markdown 块也会以 `.md` 文件形式存入一个与 Obsidian 兼容的库中，您可以打开、浏览和编辑该库。此设计受 Karpathy 的 obsidian-wiki 工作流启发。

*   **功能齐全**：默认集成了网页搜索、网页抓取器、完整的编码工具集（文件系统、git、lint、test、grep）以及原生语音（语音输入、ElevenLabs 语音输出、吉祥物口型同步、实时 Google Meet 代理）。模型路由会在一个订阅下将每个任务发送给合适的 LLM（推理型、快速型或视觉型）。没有“安装插件才能读取文件”的麻烦。可通过 Ollama 选择本地 AI 用于设备端工作负载。

*   **智能 token 压缩 (TokenJuice)**：每个工具调用、抓取结果、邮件正文和搜索负载在触及任何 LLM 之前，都会经过一个 token 压缩层。HTML 被转换为 Markdown，长 URL 被缩短，非 ASCII 字符被移除等等。您获得相同的信息，但只需消耗一小部分 token。**将成本和延迟降低高达 80%**。

*   **消息渠道** 与 **隐私及安全性**：跨您已使用的渠道进行收发，工作流数据保留在设备上、在本地加密、被视为您的数据。

## 数分钟而非数周获得上下文

OpenHuman 是首个在**数分钟内**就能了解您的代理框架。受 Karpathy 的 LLM 知识库启发。大多数代理初始状态下是冷启动的。Hermes 通过观察您工作来学习；OpenClaw 等待插件传递上下文。无论如何，您都需要花费数天或数周，代理才会足够了解您的工作栈以真正发挥作用。

> OpenHuman 会汇总并压缩您所有的文档、电子邮件和聊天记录；创建一个**记忆图谱**，让您的代理记住关于您的一切。

OpenHuman 省去了等待时间。连接您的账户，让自动获取功能以 20 分钟的循环将数据本地拉取，然后让记忆树将所有内容压缩成 Markdown 文件，并智能地存储在 Karpathy 风格的 Obsidian Wiki 中。

仅需一次同步，代理就能获得您收件箱、日历、代码库、文档、消息的完整（压缩后的）上下文。无需训练期，无需“给它几周时间”。它成为您，并由您控制。

## OpenHuman 与其他代理框架对比

高层次比较（产品不断演进，请自行向各供应商核实）。OpenHuman 旨在**最小化供应商碎片化**，保持**工作流知识在设备端**，并为代理提供关于您数据的**持久记忆**，而不仅仅是聊天记忆。

| 特性 | Claude Cowork | OpenClaw | Hermes Agent | **OpenHuman** |
| :--- | :--- | :--- | :--- | :--- |
| **开源** | 🚫 专有 | ✅ MIT | ✅ MIT | **✅ GNU** |
| **易于上手** | ✅ 桌面 + 命令行 | ⚠️ 终端优先 | ⚠️ 终端优先 | **✅ 干净UI，数分钟** |
| **成本** | ⚠️ 订阅 + 附加组件 | ⚠️ 自带模型 | ⚠️ 自带模型 | **✅ 单一订阅 + TokenJuice** |
| **记忆** | ✅ 聊天范围 | ⚠️ 依赖插件 | ✅ 自学习 | **🚀 记忆树 + Obsidian 库** |
| **集成数量** | ⚠️ 少量连接器 | ⚠️ 自带 | ⚠️ 自带 | **🚀 118+ 通过 OAuth** |
| **自动获取** | 🚫 无 | 🚫 无 | 🚫 无 | **✅ 20分钟同步至记忆** |
| **API 碎片化** | 🚫 额外密钥 | 🚫 自带密钥 | ⚠️ 多供应商 | **✅ 单一账户** |
| **模型路由** | 🚫 单一模型 | ⚠️ 手动 | ⚠️ 手动 | **✅ 内置** |
| **原生工具** | ✅ 仅代码 | ✅ 仅代码 | ✅ 仅代码 | **✅ 代码 + 搜索 + 抓取 + 语音** |

## 在 GitHub 上为我们加星

> *迈向 AGI 和人工意识？给本仓库加星，帮助他人找到这条路径。*

## 贡献者名人堂

表达您的喜爱，您就有机会进入名人堂。贡献者将获得免费周边商品和 Discord 特殊访问权限。

# 参考资料

* any list
{:toc}
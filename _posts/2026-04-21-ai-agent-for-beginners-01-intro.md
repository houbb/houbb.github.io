---
layout: post 
title: AI Agents for Beginners - 入门课程
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [learn, ai]
published: true
---

# AI Agents for Beginners - 入门课程

## 一门教授你构建 AI Agents 所需全部知识的课程

### 🌐 多语言支持

#### 通过 GitHub Action 提供（自动更新）

（语言列表保持不变，不翻译）

> **更倾向本地克隆？**
>
> 该仓库包含 50+ 种语言翻译，会显著增加下载体积。若无需翻译内容，可使用稀疏检出（sparse checkout）：
>
> **Bash / macOS / Linux：**
>
> ```bash
> git clone --filter=blob:none --sparse https://github.com/microsoft/ai-agents-for-beginners.git
> cd ai-agents-for-beginners
> git sparse-checkout set --no-cone '/*' '!translations' '!translated_images'
> ```
>
> **CMD（Windows）：**
>
> ```cmd
> git clone --filter=blob:none --sparse https://github.com/microsoft/ai-agents-for-beginners.git
> cd ai-agents-for-beginners
> git sparse-checkout set --no-cone "/*" "!translations" "!translated_images"
> ```
>
> 这样可以在更快下载速度下获取完成课程所需的全部内容。

如果希望支持更多语言，请查看[这里](https://github.com/Azure/co-op-translator/blob/main/getting_started/supported-languages.md)。

## 🌱 入门指南

本课程包含构建 AI Agents 的基础知识。每一课覆盖一个独立主题，你可以从任意章节开始学习。

本课程支持多语言，请前往[多语言支持](#-多语言支持)查看。

如果你是第一次使用生成式 AI，建议先学习 [Generative AI For Beginners](https://aka.ms/genai-beginners)（包含 21 节课程）。

不要忘记：

* ⭐ 给仓库点 Star
* 🍴 Fork 仓库以运行代码

---

### 与学习者交流 / 获取帮助

如果你在学习过程中遇到问题，可以加入：

👉 [Microsoft Foundry Discord](https://aka.ms/ai-agents/discord)

---

### 你需要准备的内容

每节课程都包含代码示例（位于 `code_samples` 目录）。建议 fork 仓库以创建副本。

代码示例基于：

* Microsoft Agent Framework
* Azure AI Foundry Agent Service V2

相关资源：

* Microsoft Foundry（需要 Azure 账号）
* Microsoft Agent Framework (MAF)
* Azure AI Foundry Agent Service

部分示例支持 OpenAI 兼容模型（如 MiniMax，支持最高 204K 上下文）。

详细配置见：[Course Setup](./00-course-setup/README.md)

---

## 🙏 想要贡献？

如果你有建议或发现错误：

* 提交 Issue
* 或提交 PR

---

## 📂 每节课程包含

* 文档（README）+ 视频
* Python 示例代码
* 额外学习资源

---

## 🗃️ 课程列表

| **课程**                    | **文本与代码** | **视频** | **扩展学习** |
| ------------------------- | --------- | ------ | -------- |
| AI Agents 介绍与应用场景         | Link      | Video  | Link     |
| Agent 框架探索                | Link      | Video  | Link     |
| Agent 设计模式                | Link      | Video  | Link     |
| 工具调用模式                    | Link      | Video  | Link     |
| Agentic RAG               | Link      | Video  | Link     |
| 构建可信 AI Agent             | Link      | Video  | Link     |
| 规划设计模式                    | Link      | Video  | Link     |
| 多 Agent 设计                | Link      | Video  | Link     |
| 元认知模式                     | Link      | Video  | Link     |
| 生产环境 Agent                | Link      | Video  | Link     |
| Agent 协议（MCP/A2A/NLWeb）   | Link      | Video  | Link     |
| 上下文工程                     | Link      | Video  | Link     |
| Agent 记忆管理                | Link      | Video  | —        |
| Microsoft Agent Framework | Link      | —      | —        |
| 计算机操作 Agent               | Link      | —      | Link     |
| 可扩展部署                     | 即将推出      | —      | —        |
| 本地 Agent                  | 即将推出      | —      | —        |
| Agent 安全                  | 即将推出      | —      | —        |

---

## 🎒 其他课程

（课程列表结构保持，仅翻译标题）

### LangChain 系列

### Azure / Edge / MCP / Agents

### 生成式 AI 系列

### 基础学习

### Copilot 系列

---

## 🌟 社区感谢

感谢 Shivam Goyal 提供 Agentic RAG 示例代码。

---

## 贡献说明

本项目接受贡献。提交 PR 时需签署 CLA（贡献者许可协议）。

详见：[https://cla.opensource.microsoft.com](https://cla.opensource.microsoft.com)

---

## 行为准则

本项目遵循 Microsoft 开源行为准则。

# 参考资料

* any list
{:toc}
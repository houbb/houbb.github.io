---
layout: post
title: Langflow 是一个可视化 AI Workflow + Agent 构建平台-01-入门介绍
date: 2026-03-14 21:01:55 +0800
categories: [AI]
tags: [ai, rag, sh]
published: true
---


# Langflow

**Langflow 是一个用于构建和部署 AI 驱动的 Agent 与工作流的强大平台。**

它为开发者提供：

* **可视化工作流编辑体验**
* **内置 API 和 MCP 服务器**

这些能力可以将 **每一个 workflow（流程）转换为一个工具**，
并可集成到**任何框架或技术栈构建的应用中**。

Langflow 自带完整功能组件（batteries included），并支持：

* 所有主流 **LLM**
* 向量数据库
* 持续扩展的 **AI 工具生态**

---

# ✨ 主要特性

### 可视化构建界面

提供一个 **visual builder interface**，使用户能够快速开始构建并持续迭代流程。

---

### 源代码可访问

开发者可以通过 **Python** 自定义任意组件。

---

### 交互式 Playground

提供一个 **interactive playground**，用于：

* 立即测试 workflow
* 逐步执行流程
* 调试与优化流程

---

### 多 Agent 编排

支持：

* multi-agent orchestration
* conversation management
* retrieval

---

### API 部署能力

支持：

* 将 workflow 部署为 **API**
* 将 workflow **导出为 JSON**
* 在 **Python 应用中直接使用**

---

### MCP Server 部署

Langflow 支持：

* 将 workflow 部署为 **MCP server**
* 将流程转换为 **MCP 工具**
* 被 **MCP 客户端调用**

---

### 可观测性（Observability）

支持与以下系统集成：

* LangSmith
* LangFuse
* 其他 observability 平台

---

### 企业级能力

支持：

* 企业级安全
* 扩展性
* 可伸缩部署

([GitHub][1])

---

# 🖥️ Langflow Desktop

**Langflow Desktop** 是开始使用 Langflow 的最简单方式。

其特点：

* 所有依赖已包含
* 无需手动管理 Python 环境
* 无需手动安装依赖包

支持平台：

* Windows
* macOS

---

# ⚡ 快速开始（Quickstart）

## 本地安装（推荐）

依赖要求：

* **Python 3.10 – 3.13**
* **uv（推荐的 Python 包管理器）**

---

## 安装

在一个新的目录中运行：

```bash
uv pip install langflow -U
```

该命令会安装最新的 Langflow Python 包。

---

## 运行

启动 Langflow：

```bash
uv run langflow run
```

Langflow 将启动在：

```
http://127.0.0.1:7860
```

至此，你已经可以开始使用 Langflow 构建 AI 应用。

---

# 📦 其他安装方式

## 从源码运行

如果你已经克隆了该仓库并希望参与贡献，可以在仓库根目录运行：

```bash
make run_cli
```

更多信息请参考：

```
DEVELOPMENT.md
```

---

## Docker

使用默认配置启动容器：

```bash
docker run -p 7860:7860 langflowai/langflow:latest
```

访问地址：

```
http://localhost:7860/
```

---

# ⚠️ 安全与版本注意事项

用户需要注意以下安全问题：

### 必须升级到 Langflow >= 1.7.1

以避免：

```
CVE-2025-68477
CVE-2025-68478
```

---

### 版本 1.7.0 存在严重 bug

问题：

升级后无法找到：

* flows
* projects
* global variables

因此：

**不要升级到 1.7.0**

应直接升级到：

```
1.7.1
```

---

### 1.6.0–1.6.3 存在安全问题

问题：

`.env` 文件不会被读取。

可能导致：

* 配置失效
* 安全漏洞

解决：

升级到：

```
1.6.4
```

---

### Windows Desktop 用户注意

不要使用 **应用内更新**升级到：

```
1.6.0
```

应参考官方升级说明。

---

### 其他安全更新

用户必须升级：

```
>= 1.3
```

以修复：

```
CVE-2025-3248
```

以及升级：

```
>= 1.5.1
```

以修复：

```
CVE-2025-57760
```

---

# 🚀 部署

Langflow 完全开源。

可以部署在所有主流云平台。

具体部署方式请参考：

```
Langflow deployment guides
```

---

# ⭐ 保持更新

在 GitHub 上为 Langflow 点 Star，
即可第一时间收到新版本通知。

---

# 👋 贡献

我们欢迎来自不同经验水平的开发者参与贡献。

如果你希望贡献代码，请参考：

```
CONTRIBUTING.md
```

---

# 项目信息

Langflow 是一个用于构建和部署 **AI Agent 与工作流** 的平台。

---

## 相关主题

```
multiagent
agents
react-flow
large-language-models
generative-ai
chatgpt
```

---

# License

Langflow 使用：

```
MIT License
```

---

# 主要编程语言

项目代码组成：

| 语言         | 占比    |
| ---------- | ----- |
| Python     | 53.9% |
| TypeScript | 24.4% |
| JavaScript | 20.7% |
| CSS        | 0.5%  |

([GitHub][1])

---

✅ **一句话总结**

Langflow 是一个 **可视化 AI Workflow + Agent 构建平台**，

可以将 **LLM、工具、向量数据库、Agent 逻辑**通过拖拽方式组合，并直接部署为 **API 或 MCP 工具服务**。 ([GitHub][1])

# 参考资料

* any list
{:toc}
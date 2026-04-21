---
layout: post 
title: Claude Context 是一个 MCP 插件，为 Claude Code 及其他 AI 编码代理提供语义代码搜索能力，使其能够从整个代码库中获取深度上下文。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai, memory]
published: true
---

> 🆕 **在寻找 Claude Code 的持久化记忆？** 查看 [memsearch Claude Code 插件](https://github.com/zilliztech/memsearch/tree/main/plugins/claude-code) —— 一个以 Markdown 为优先的记忆系统，为你的 AI 代理提供跨会话的长期记忆。

### 将你的整个代码库作为 Claude 的上下文

**Claude Context** 是一个 MCP 插件，为 Claude Code 及其他 AI 编码代理提供语义代码搜索能力，使其能够从整个代码库中获取深度上下文。

🧠 **将整个代码库作为上下文**：Claude Context 使用语义搜索从数百万行代码中找到所有相关代码，无需多轮探索，直接将结果注入到 Claude 的上下文中。

💰 **面向大型代码库的成本优化**：无需在每次请求时将整个目录加载进 Claude（成本极高），Claude Context 会将代码库高效存储到向量数据库中，仅将相关代码引入上下文，从而控制成本。

---

## 🚀 演示

![img](https://lh7-rt.googleusercontent.com/docsz/AD_4nXf2uIf2c5zowp-iOMOqsefHbY_EwNGiutkxtNXcZVJ8RI6SN9DsCcsc3amXIhOZx9VcKFJQLSAqM-2pjU9zoGs1r8GCTUL3JIsLpLUGAm1VQd5F2o5vpEajx2qrc77iXhBu1zWj?key=qYdFquJrLcfXCUndY-YRBQ)

模型上下文协议（Model Context Protocol，MCP）允许你将 Claude Context 集成到你喜欢的 AI 编码助手中，例如 Claude Code。

---

## 快速开始

### 前置条件

<details>
<summary>在 Zilliz Cloud 获取免费的向量数据库 👈</summary>

Claude Context 需要一个向量数据库。你可以在 Zilliz Cloud 注册获取 API Key。

![](assets/signup_and_get_apikey.png)

复制你的 Personal Key，并替换配置示例中的 `your-zilliz-cloud-api-key`。

</details>

<details>
<summary>获取 OpenAI API Key（用于 embedding 模型）</summary>

你需要一个 OpenAI API Key 用于 embedding 模型。可以在 OpenAI 注册获取。

你的 API Key 形式如下：始终以 `sk-` 开头。
复制该 Key 并在配置中替换 `your-openai-api-key`。

</details>

---

### 为 Claude Code 配置 MCP

**系统要求：**

* Node.js >= 20.0.0 且 < 24.0.0

> Claude Context 不兼容 Node.js 24.0.0，如果版本大于等于 24，请先降级。

#### 配置

使用命令行添加 MCP Server：

```bash
claude mcp add claude-context \
  -e OPENAI_API_KEY=sk-your-openai-api-key \
  -e MILVUS_TOKEN=your-zilliz-cloud-api-key \
  -- npx @zilliz/claude-context-mcp@latest
```

更多细节请参考 Claude Code MCP 文档。

---

### 其他 MCP 客户端配置

（以下结构保持不变，仅翻译说明）

* OpenAI Codex CLI：使用 TOML 配置
* Gemini CLI：使用 JSON 配置
* Qwen Code：编辑 `settings.json`
* Cursor：通过 MCP 配置文件
* Void / Claude Desktop / Windsurf / VSCode 等：均通过 JSON 配置 MCP Server

（所有代码块保持原样）

---

### 在你的代码库中使用

1. **打开 Claude Code**

```
cd your-project-directory
claude
```

2. **索引代码库**

```
Index this codebase
```

3. **查看索引状态**

```
Check the indexing status
```

4. **开始搜索**

```
Find functions that handle user authentication
```

🎉 **完成！** 现在你已经在 Claude Code 中拥有语义代码搜索能力。

---

### 环境变量配置

更多配置请参考环境变量指南。

---

### 使用不同 embedding 模型

支持自定义 embedding 模型（如 OpenAI、VoyageAI 等），详见 MCP 配置示例。

---

### 文件包含与排除规则

详见相关规则文档，可自定义文件范围。

---

### 可用工具

#### 1. `index_codebase`

为代码库建立索引（支持 BM25 + 向量搜索）

#### 2. `search_code`

使用自然语言进行语义搜索

#### 3. `clear_index`

清除索引

#### 4. `get_indexing_status`

获取索引状态与进度

---

## 📊 评估

实验表明，在相同检索质量下，Claude Context MCP 可减少约 **40% token 使用量**，显著降低成本与时间。

![MCP Efficiency Analysis](assets/mcp_efficiency_analysis_chart.png)

---

## 🏗️ 架构

![](assets/Architecture.png)

### 🔧 实现细节

* 🔍 **混合搜索**（BM25 + 向量）
* 🧠 **上下文感知**
* ⚡ **增量索引（Merkle Tree）**
* 🧩 **基于 AST 的代码切分**
* 🗄️ **可扩展（Zilliz Cloud）**
* 🛠️ **可定制**

---

### 核心组件

* `@zilliz/claude-context-core`：核心索引引擎
* VSCode 插件：语义代码搜索
* `@zilliz/claude-context-mcp`：MCP Server

---

### 支持技术

* Embedding：OpenAI、VoyageAI、Ollama、Gemini
* 向量数据库：Milvus / Zilliz Cloud
* 语言：TypeScript、Python、Java、C++ 等
* 工具：VSCode、MCP

---

## 📦 其他使用方式

### 使用核心包构建应用

（代码保持不变）

---

### VSCode 插件

提供 IDE 内语义搜索能力：

* Marketplace 安装
* 或手动搜索安装

---

## 🛠️ 开发

### 环境准备

* Node.js 20 / 22
* pnpm

### 通用安装

```bash
git clone https://github.com/zilliztech/claude-context.git
cd claude-context
pnpm install
pnpm build
pnpm dev
```

---

### Windows 特殊说明

* Git 行尾配置
* 安装 Node.js 与 pnpm

---

### 构建

```bash
pnpm build
pnpm build:core
pnpm build:vscode
pnpm build:mcp
pnpm benchmark
```

---

## 📖 示例

查看 `/examples`：

* 基础索引与搜索示例

---

## ❓ FAQ

常见问题：

* 支持哪些文件
* 是否支持完全本地部署
* 是否支持多项目
* 与其他工具对比

---

## 🤝 贡献

欢迎贡献代码，详见贡献指南。

---

## 🗺️ 路线图

* ✅ AST 代码分析
* ✅ 多 embedding 支持
* ⏳ Agent 搜索模式
* ⏳ 排序优化
* ⏳ Chrome 插件

---

## 📄 许可证

MIT License（详见 LICENSE）

---

## 🔗 链接

* GitHub
* VSCode Marketplace
* Milvus 文档
* Zilliz Cloud

---


# 参考资料

* any list
{:toc}
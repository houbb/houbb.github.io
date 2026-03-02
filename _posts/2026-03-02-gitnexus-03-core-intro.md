---
layout: post
title: gitnexus 核心介绍
date: 2026-03-02 21:01:55 +0800
categories: [Agent]
tags: [ai, skills, sh]
published: true
---


# GitNexus

**面向 AI Agent 的图驱动代码智能系统。**

将任意代码仓库索引为知识图谱，并通过 **MCP** 或 **CLI** 进行查询。

支持：

**Cursor、Claude Code、Windsurf、Cline、OpenCode** 以及所有兼容 MCP 的工具。

---

## 为什么需要 GitNexus？

AI 编程工具通常 **无法真正理解你的代码库结构**。

它们可能修改了一个函数，却不知道有 **47 个其他函数依赖它**。

GitNexus 通过将：

* 所有依赖关系
* 调用链
* 代码关联关系

**预计算为可查询的图结构** 来解决这个问题。

> 只需三个命令，即可让你的 AI Agent 拥有完整的代码库认知能力。

---

## 快速开始

```bash
# 在仓库根目录执行
npx gitnexus analyze
```

完成。

该命令将自动完成：

* 代码库索引
* 安装 Agent Skills
* 注册 Claude Code Hooks
* 创建 `AGENTS.md` / `CLAUDE.md` 上下文文件

全部在一次执行中完成。

---

如需为编辑器配置 MCP：

```bash
npx gitnexus setup
```

只需执行一次。

`gitnexus setup` 会：

* 自动检测你的编辑器
* 写入正确的全局 MCP 配置

---

## 编辑器支持

| 编辑器             | MCP | Skills | Hooks（自动增强）    | 支持级别         |
| --------------- | --- | ------ | -------------- | ------------ |
| **Claude Code** | 支持  | 支持     | 支持（PreToolUse） | **完整支持**     |
| **Cursor**      | 支持  | 支持     | —              | MCP + Skills |
| **Windsurf**    | 支持  | —      | —              | MCP          |
| **OpenCode**    | 支持  | 支持     | —              | MCP + Skills |

> **Claude Code** 提供最深度集成：
>
> MCP 工具 + Agent Skills + PreToolUse Hooks
> 可自动为 grep / glob / bash 调用补充知识图谱上下文。

---

## 社区集成

| Agent | 安装方式                         | 来源          |
| ----- | ---------------------------- | ----------- |
| pi    | `pi install npm:pi-gitnexus` | pi-gitnexus |

---

## MCP 手动配置

如果你希望手动配置，而不是使用 `gitnexus setup`：

---

### Claude Code（完整支持：MCP + skills + hooks）

```bash
claude mcp add gitnexus -- npx -y gitnexus@latest mcp
```

---

### Cursor / Windsurf

添加至：

```
~/.cursor/mcp.json
```

```json
{
  "mcpServers": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

---

### OpenCode

添加至：

```
~/.config/opencode/config.json
```

```json
{
  "mcp": {
    "gitnexus": {
      "command": "npx",
      "args": ["-y", "gitnexus@latest", "mcp"]
    }
  }
}
```

---

## 工作原理

GitNexus 通过一个多阶段索引流水线构建完整代码知识图谱：

### 1. Structure（结构扫描）

遍历文件树，建立目录与文件关系。

### 2. Parsing（解析）

使用 **Tree-sitter AST** 提取：

* 函数
* 类
* 方法
* 接口

---

### 3. Resolution（解析依赖）

基于语言语义解析：

* import 关系
* 跨文件函数调用

---

### 4. Clustering（聚类）

将相关符号分组为功能社区。

---

### 5. Processes（流程分析）

从入口点沿调用链追踪执行流程。

---

### 6. Search（搜索索引）

构建混合搜索索引以实现高速检索。

---

最终结果：

一个存储在 `.gitnexus/` 中的本地 **KuzuDB 图数据库**，包含：

* 全文搜索
* 语义向量嵌入

---

## MCP 工具

AI Agent 将自动获得以下工具：

| 工具               | 功能                      | repo 参数 |
| ---------------- | ----------------------- | ------- |
| `list_repos`     | 发现所有已索引仓库               | —       |
| `query`          | 分组混合搜索（BM25 + 语义 + RRF） | 可选      |
| `context`        | 符号 360° 视图              | 可选      |
| `impact`         | 影响范围分析                  | 可选      |
| `detect_changes` | Git Diff 影响分析           | 可选      |
| `rename`         | 跨文件协调重命名                | 可选      |
| `cypher`         | 原生 Cypher 图查询           | 可选      |

说明：

* 单仓库时 `repo` 参数可省略
* 多仓库时需指定：

```js
query({query: "auth", repo: "my-app"})
```

---

## MCP Resources

| Resource                                | 用途          |
| --------------------------------------- | ----------- |
| `gitnexus://repos`                      | 列出所有索引仓库    |
| `gitnexus://repo/{name}/context`        | 仓库统计信息      |
| `gitnexus://repo/{name}/clusters`       | 功能聚类        |
| `gitnexus://repo/{name}/cluster/{name}` | 聚类详情        |
| `gitnexus://repo/{name}/processes`      | 执行流程        |
| `gitnexus://repo/{name}/process/{name}` | 完整流程链       |
| `gitnexus://repo/{name}/schema`         | 图数据库 Schema |

---

## MCP Prompts

| Prompt          | 功能                      |
| --------------- | ----------------------- |
| `detect_impact` | 提交前变更影响分析               |
| `generate_map`  | 基于知识图谱生成架构文档（Mermaid 图） |

---

## CLI 命令

```bash
gitnexus setup
```

配置 MCP（一次性）

```bash
gitnexus analyze [path]
```

索引仓库或更新索引

```bash
gitnexus analyze --force
```

强制重新索引

```bash
gitnexus analyze --skip-embeddings
```

跳过向量生成（更快）

```bash
gitnexus mcp
```

启动 MCP Server（stdio）

```bash
gitnexus serve
```

启动本地 HTTP 服务（多仓库）

```bash
gitnexus list
```

列出所有索引仓库

```bash
gitnexus status
```

查看当前仓库状态

```bash
gitnexus clean
```

删除当前仓库索引

```bash
gitnexus clean --all --force
```

删除全部索引

```bash
gitnexus wiki [path]
```

从知识图谱生成文档

```bash
gitnexus wiki --model <model>
```

指定 LLM 生成 Wiki（默认：gpt-4o-mini）

---

## 多仓库支持

GitNexus 支持多个仓库索引。

每次执行：

```bash
gitnexus analyze
```

都会注册仓库至：

```
~/.gitnexus/registry.json
```

MCP Server 会自动服务所有已索引仓库。

---

## 支持语言

* TypeScript
* JavaScript
* Python
* Java
* C
* C++
* C#
* Go
* Rust
* PHP
* Swift

---

## Agent Skills

GitNexus 内置 Skill 文件，用于指导 AI Agent 使用工具：

* Exploring（代码探索）
* Debugging（问题追踪）
* Impact Analysis（影响分析）
* Refactoring（安全重构）

自动安装方式：

* `gitnexus analyze`
* `gitnexus setup`

---

## 系统要求

* Node.js ≥ 18
* Git 仓库（用于提交追踪）

---

## 隐私

* 所有处理均在本地完成
* 不会上传代码
* 索引存储在仓库 `.gitnexus/`
* 全局注册信息仅保存路径与元数据

---

## Web UI

GitNexus 提供浏览器界面：

```
gitnexus.vercel.app
```

特点：

* 100% 客户端运行
* 代码不会离开浏览器

---

### 本地后端模式

运行：

```bash
gitnexus serve
```

然后在本地打开 Web UI。

功能：

* 自动发现本地索引仓库
* AI Chat 支持
* Cypher 查询
* 代码导航
* 搜索能力

无需重新上传或重新索引。

---

## License

PolyForm Noncommercial 1.0.0

免费用于非商业用途。
商业授权需联系作者。


# 参考资料


[1]: https://github.com/abhigyanpatwari/GitNexus?utm_source=chatgpt.com "GitHub - abhigyanpatwari/GitNexus: The fastest way to chat with your code, 100% private - GitNexus is a client-side knowledge graph creator that runs entirely in your browser. Drop in a GitHub repo or ZIP file, and get an interactive knowledge graph with AI-powered chat interface. Perfect for code exploration"
[2]: https://qiita.com/nogataka/items/846d8931b6f36dea5d6a?utm_source=chatgpt.com "〖2026年2月22日〗GitHub日次トレンドTop9──AIセキュリティから金融データ基盤まで #AIエージェント - Qiita"
[3]: https://zenn.dev/pppp303/articles/weekly_ai_20260301?utm_source=chatgpt.com "週刊AI駆動開発 - 2026年03月01日"


* any list
{:toc}
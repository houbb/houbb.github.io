---
layout: post
title: Graph-Code A Graph-Based RAG System for Any Codebases
date: 2026-01-05 21:01:55 +0800
categories: [AI]
tags: [ai, ai-coding, sh]
published: true
---

# **Graph-Code：用于任意代码库的图谱 RAG 系统**

（原文标题：*Graph-Code: A Graph-Based RAG System for Any Codebases*）([GitHub][1])

该系统是一个 **精确的检索增强生成（RAG）系统**，用于分析多语言代码库，基于 Tree-sitter 构建全面的知识图谱，并支持使用自然语言查询代码库结构与关系，还能执行编辑操作。([GitHub][1])

---

## **最新动态（Latest News）** ([GitHub][1])

* **[NEW] MCP 服务集成**：Graph-Code 现在作为 MCP 服务器可与 Claude Code 一起使用！可以直接从 Claude Code 使用自然语言查询和编辑您的代码库。（附链接：Setup Guide）
* **2025/10/21 语义代码搜索**：通过 UniXcoder 嵌入新增了基于意图的代码搜索。现在可以通过描述功能（例如 “错误处理函数”、“身份验证代码”）来查找函数，而不是仅仅基于名称精确匹配。([GitHub][1])

---

## **功能（Features）** ([GitHub][1])

### **多语言支持**

支持多种主流语言及其结构特性：

| 语言         | 支持状态 | 文件扩展                                           | 函数 | 类/结构体 | 模块 | 包检测 | 附加功能                                    |               |
| ---------- | ---- | ---------------------------------------------- | -- | ----- | -- | --- | --------------------------------------- | ------------- |
| C++        | 完全支持 | .cpp/.h/.hpp/.cc/.cxx/.hxx/.hh/.ixx/.cppm/.ccm | ✓  | ✓     | ✓  | ✓   | 构造函数、析构函数、运算符重载、模板、lambda、C++20 模块、命名空间 |               |
| Java       | 完全支持 | .java                                          | ✓  | ✓     | ✓  | –   | 泛型、注解、并发、反射                             |               |
| JavaScript | 完全支持 | .js/.jsx                                       | ✓  | ✓     | ✓  | –   | ES6 模块、CommonJS、原型方法、箭头函数               |               |
| Lua        | 完全支持 | .lua                                           | –  | ✓     | –  | –   | 全局/局部函数、闭包、协程                           |               |
| Python     | 完全支持 | .py                                            | ✓  | ✓     | ✓  | ✓   | 类型推断、装饰器、嵌套函数                           |               |
| Rust       | 完全支持 | .rs                                            | ✓  | ✓     | ✓  | ✓   | impl 块、关联函数                             |               |
| TypeScript | 完全支持 | .ts/.tsx                                       | ✓  | ✓     | ✓  | ✓   | 接口、类型别名、枚举                              |               |
| C#         | 开发中  | .cs                                            | ✓  | ✓     | ✓  | –   | 类、接口、泛型                                 |               |
| Go         | 开发中  | .go                                            | ✓  | ✓     | ✓  | –   | 方法、类型声明                                 |               |
| PHP        | 开发中  | .php                                           | ✓  | ✓     | ✓  | –   | 类、函数、命名空间                               |               |
| Scala      | 开发中  | .scala/.sc                                     | ✓  | ✓     | ✓  | –   | case 类、对象、特质                            | ([GitHub][1]) |

其他关键特性：

* 使用 **Tree-sitter 进行健壮且与语言无关的 AST 解析**
* 使用 **Memgraph 存储代码结构为互联图谱**
* 支持 **自然语言查询**
* 支持各种 AI 模型进行 **自然语言 → Cypher 生成**（包括 Google Gemini、本地 Ollama、OpenAI）
* 获取实际代码片段
* 高级文件编辑（基于 AST 的精确替换 + 可视化 diff）
* 终端命令执行、交互式代码优化、依赖分析等功能([GitHub][1])

---

## **架构（Architecture）** ([GitHub][1])

系统主要由两部分组成：

1. **多语言解析器**：基于 Tree-sitter 的系统，用于分析代码库并将结果导入 Memgraph
2. **RAG 系统（`codebase_rag/`）**：用于交互式查询存储的知识图谱([GitHub][1])

---

## **先决条件（Prerequisites）** ([GitHub][1])

要构建和运行本项目，您需要：

* Python 3.12+
* Docker + Docker Compose（用于 Memgraph）
* cmake（构建 pymgclient 依赖项）
* ripgrep (`rg`)（用于终端文本搜索）
* 对于云模型：Google Gemini API key
* 对于本地模型：运行中的 Ollama
* `uv` 包管理器([GitHub][1])

---

## **安装（Installation）** ([GitHub][1])

```bash
git clone https://github.com/vitali87/code-graph-rag.git
cd code-graph-rag

# 安装依赖（基本 Python 支持）
uv sync

# 安装完整多语言支持
uv sync --extra treesitter-full

# 开发环境（含测试与 pre-commit 钩子）
make dev
```

随后按 `.env.example` 复制并设置环境变量。支持多种提供者和模型配置（OpenAI/Gemini/Ollama 混合）。([GitHub][1])

启动 Memgraph 数据库：

```bash
docker-compose up -d
```

([GitHub][1])

---

## **使用方法（Usage）** ([GitHub][1])

Graph-Code 系统有五种主要运行模式：

1. **解析并导入**：构建知识图谱
2. **交互式查询**：用自然语言问问题
3. **导出与分析**：将图导出用于程序化分析
4. **AI 优化**：获取 AI 驱动的优化建议
5. **编辑**：精确代码替换与修改([GitHub][1])

示例工作流：

```bash
# 第一步：解析代码库
cgr start --repo-path /path/to/repo --update-graph --clean

# 第二步：交互式查询
cgr start --repo-path /path/to/repo
```

支持实时更新、导出 JSON、优化建议等高级功能。示例语句包括列出类、查找函数引用、优化代码等。([GitHub][1])

---

## **MCP 服务（Claude Code 集成）** ([GitHub][1])

Graph-Code 可以作为 MCP 服务器提供服务，与 Claude Code 和其他 MCP 客户端无缝集成。例如：

```bash
claude mcp add --transport stdio graph-code \
  --env TARGET_REPO_PATH=/absolute/path/to/your/project \
  --env CYPHER_PROVIDER=openai \
  --env CYPHER_MODEL=gpt-4o \
  --env CYPHER_API_KEY=your-api-key \
  -- uv run --directory /path/to/code-graph-rag graph-code mcp-server
```

提供诸如索引仓库、查询、获取代码片段、外科式代码替换等工具。([GitHub][1])

---

## **图谱模式（Graph Schema）** ([GitHub][1])

### **节点类型（Node Types）**

常见节点类型包括：

* Project `{name: string}`
* Package `{qualified_name, name, path}`
* Folder `{path, name}`
* File、Module
* Class、Function、Method
* Interface、Enum、Type、Union 等([GitHub][1])

### **语言特定映射（Language Mappings）**

定义了不同语言的 AST 节点映射规则，如 C++、Java、Python、TypeScript 等。([GitHub][1])

### **关系类型（Relationships）**

例如：

* Project/Package/Folder **CONTAINS** Package/Folder/File/Module
* Module **DEFINES** Class/Function
* Function/Method **CALLS** Function/Method
* Class **INHERITS** Class 或 **IMPLEMENTS** Interface
* Project **DEPENDS_ON_EXTERNAL** ExternalPackage 等([GitHub][1])

---

## **配置（Configuration）** ([GitHub][1])

通过 `.env` 配置指定：

* `ORCHESTRATOR_PROVIDER`, `ORCHESTRATOR_MODEL`, `ORCHESTRATOR_API_KEY`
* `CYPHER_PROVIDER`, `CYPHER_MODEL`, `CYPHER_API_KEY`
* Memgraph 相关（主机、端口、批处理大小等）
* `TARGET_REPO_PATH` 默认仓库路径
* 本地模型回退端点等([GitHub][1])

---

## **关键依赖项（Key Dependencies）** ([GitHub][1])

系统使用 Python 库：

* `loguru`, `mcp`, `pydantic-ai`, `pydantic-settings`, `pymgclient`, `python-dotenv`
* `tree-sitter` 及其语言绑定
* 终端 UI 库 `rich`, `prompt-toolkit` 等([GitHub][1])

---

## **贡献（Contributing）** ([GitHub][1])

详细贡献指南参见 `CONTRIBUTING.md`。欢迎优先 PR 和 TODO 议题。([GitHub][1])

# 参考资料

[1]: https://github.com/vitali87/code-graph-rag "GitHub - vitali87/code-graph-rag: The ultimate RAG for your monorepo. Query, understand, and edit multi-language codebases with the power of AI and knowledge graphs"

* any list
{:toc}
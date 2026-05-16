---
layout: post 
title: colbymchenry/codegraph 为 Claude Code 准备的预索引代码知识图谱 —— 更少的 Token、更少的工具调用，100% 本地运行
date: 2026-05-17 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# GitHub – colbymchenry/codegraph：为 Claude Code 准备的预索引代码知识图谱 —— 更少的 Token、更少的工具调用，100% 本地运行

**CodeGraph** 通过语义级别的代码智能，为 Claude Code 注入强大的代码理解与导航能力。 **94% 的工具调用减少 · 77% 的探索速度提升 · 100% 本地运行**

### 🚀 快速上手

```bash
npx @colbymchenry/codegraph
```
交互式安装程序会自动完成 Claude Code 的配置。

#### 项目初始化
```bash
cd your-project
codegraph init -i
```
* * *

## 为什么选择 CodeGraph？

当 Claude Code 探索一个代码库时，它会启动探索代理（Explore agents），通过 `grep`、`glob` 和 `Read` 来扫描文件。每一次工具调用都会消耗大量的 Token。

**CodeGraph 为这些探索代理提供了一个预索引的知识图谱**，其中包含了符号关系、调用图和代码结构。代理可以直接查询这个图谱，而无须反复扫描文件。

### 基准测试结果

我们在 6 个真实代码库上测试了 Claude Code 的探索代理在 **开启** 和 **关闭** CodeGraph 时的表现：

> **平均：工具调用减少 92% · 速度提升 71%**

| 代码库 | 关闭 CodeGraph（调用数） | 开启 CodeGraph（调用数） | 改善幅度 |
| :--- | :--- | :--- | :--- |
| **VS Code** (TypeScript) | 52 次调用, 1 分 37 秒 | 3 次调用, 17 秒 | **调用减少 94% · 速度提升 82%** |
| **Excalidraw** (TypeScript) | 47 次调用, 1 分 45 秒 | 3 次调用, 29 秒 | **调用减少 94% · 速度提升 72%** |
| **Claude Code** (Python + Rust) | 40 次调用, 1 分 8 秒 | 3 次调用, 39 秒 | **调用减少 93% · 速度提升 43%** |
| **Claude Code** (Java) | 26 次调用, 1 分 22 秒 | 1 次调用, 19 秒 | **调用减少 96% · 速度提升 77%** |
| **Alamofire** (Swift) | 32 次调用, 1 分 39 秒 | 3 次调用, 22 秒 | **调用减少 91% · 速度提升 78%** |
| **Swift 编译器** (Swift/C++) | 37 次调用, 2 分 8 秒 | 6 次调用, 35 秒 | **调用减少 84% · 速度提升 73%** |

**关键观察：**
*   开启 CodeGraph 后，代理 **完全无需回退到文件读取**，可以完全信任 `codegraph_explore` 的结果。
*   关闭 CodeGraph 时，代理的大部分时间都花在 `find`、`ls`、`grep` 这些探索性的操作上，之后才能开始真正读取相关代码。
*   在处理一个 Java 代码库时，仅需 **1 次** `codegraph_explore` 调用就能回答完整的问题。
*   **跨语言查询（Python + Rust）** 也能无缝工作：CodeGraph 的图遍历可以轻松找到跨越不同语言边界的连接。
*   Swift 基准测试（Alamofire）追踪了一条从 `Session.request()` 到 `URLSession.dataTask()` 的 **9 步调用链** —— CodeGraph 仅用一次探索调用就在深度为 3 的图遍历中捕获了完整链条。
*   **Swift 编译器**是本次测试中体量最大的代码库（**25,874 个文件，272,898 个节点**）。CodeGraph 在 **4 分钟内**完成了索引，代理在 **35 秒内**通过 **6 次探索调用和 0 次文件读取** 回答了一个复杂的、跨多模块的复杂问题。

* * *

## ✨ 核心特性

| 特性 | 说明 |
| :--- | :--- |
| **智能上下文构建** | 一次工具调用即可返回入口点、相关符号以及代码片段 —— 无需昂贵的探索代理。 |
| **全文搜索** | 借助 FTS5 支持，在代码库中即时按名称查找代码。 |
| **影响分析** | 在修改前，追踪任何符号的被调用关系、调用链，以及完整的影响范围。 |
| **始终保持最新** | 文件监听器利用操作系统原生事件（FSEvents / inotify / ReadDirectoryChangesW）配合防抖自动同步 —— 在你编码时图谱始终保持最新，零配置。 |
| **支持 19+ 种语言** | TypeScript、JavaScript、Python、Go、Rust、Java、C#、PHP、Ruby、C、C++、Swift、Kotlin、Dart、Svelte、Liquid、Pascal / Delphi。 |
| **框架感知路由** | 能识别 Web 框架的路由文件，并将 URL 模式链接到其处理函数。 |
| **100% 本地化** | 没有任何数据离开你的机器。无需 API 密钥，不依赖外部服务。所有数据都存储在本地的 SQLite 数据库中。 |

### 框架感知路由

CodeGraph 能够检测 Web 框架的路由文件，并生成 `route` 节点，通过 `references` 边将其链接到对应的处理类或函数。查询视图或控制器的调用者时，将直接呈现与之绑定的 URL 模式。

目前已支持的框架包括：**Django、Flask、FastAPI、Express、Laravel、Rails、Spring、Gin / chi / gorilla / mux、Axum / actix / Rocket** 等。

* * *

## 💻 安装与使用

### 一键安装

```bash
# 无需全局安装，直接运行
npx @colbymchenry/codegraph

# 全局安装
npm install -g @colbymchenry/codegraph
```

### 命令行接口（CLI）

```bash
codegraph init [path]      # 初始化项目（添加 --quiet 减少输出）
codegraph sync [path]      # 增量更新索引
codegraph status [path]    # 显示索引统计信息
codegraph query            # 搜索符号（支持 --kind, --limit, --json）
codegraph files [path]     # 显示文件结构
codegraph context          # 为 AI 构建上下文
codegraph affected [files...]  # 查找受变更影响的测试文件
codegraph serve --mcp      # 启动 MCP 服务器
```

### `codegraph affected`

递归追踪导入依赖，查找受源文件变更影响的测试文件。

```bash
codegraph affected src/utils.ts src/api.ts
git diff --name-only | codegraph affected --stdin
codegraph affected src/auth.ts --filter "e2e/*"
```

**CI / Git Hook 示例：**
```bash
#!/usr/bin/env bash
AFFECTED=$(git diff --name-only HEAD | codegraph affected --stdin --quiet)
if [ -n "$AFFECTED" ]; then
    npx vitest run $AFFECTED
fi
```

* * *

## 🤖 MCP 工具（供 Claude Code 使用）

当作为 MCP 服务器运行时，CodeGraph 会向 Claude Code 暴露以下工具：

| 工具 | 用途 |
| :--- | :--- |
| `codegraph_search` | 在整个代码库中按名称查找符号。 |
| `codegraph_context` | 为特定任务构建相关的代码上下文。 |
| `codegraph_callers` | 查找某个函数被哪些地方调用。 |
| `codegraph_callees` | 查找某个函数调用了哪些其他函数。 |
| `codegraph_impact` | 分析修改某个符号会影响哪些代码。 |
| `codegraph_node` | 获取某个符号的详细信息。 |
| `codegraph_files` | 获取已索引的文件结构（比直接扫描文件系统更快）。 |
| `codegraph_status` | 检查索引的健康状态和统计信息。 |

### 针对 Claude Code 的最佳实践

**如果项目中存在 `.codegraph/` 目录**，请**始终**在探索代理中执行探索类问题（例如“X 是如何工作的？”、“解释 Y 系统”、“Z 的实现在哪里？”），并**务必**在提示中包含以下指令：

> 此项目已初始化 CodeGraph（存在 .codegraph/ 目录）。请将 `codegraph_explore` 作为你的主要工具 —— 它可以在一次调用中返回所有相关文件的完整源代码。
>
> **规则：**
> 1. 遵守 `codegraph_explore` 工具描述中的探索调用预算（它会根据项目规模自动调整）。
> 2. 对于 `codegraph_explore` 已返回源代码的文件，**不要**再次读取。这些源代码片段是完整且权威的。
> 3. 仅当需要更多细节，或者 `codegraph_explore` 没有返回结果时，才回退使用 `grep` / `glob` / `read`。

**主会话（Main session）** 只能直接使用以下轻量级工具（用于编辑前的针对性查找，而不是用于代码探索）：

*   `codegraph_search` – 按名称查找符号
*   `codegraph_callers` / `codegraph_callees` – 追踪调用关系
*   `codegraph_impact` – 检查修改影响范围
*   `codegraph_node` – 获取单个符号的详细信息

**如果项目中不存在 `.codegraph/` 目录**，可以在会话开始时询问用户：“我发现这个项目还没有初始化 CodeGraph。需要我运行 `codegraph init -i` 来构建代码知识图谱吗？”

* * *

## ⚙️ 工作原理

1.  **提取（Extraction）** —— [tree-sitter](https://tree-sitter.github.io/) 将源代码解析为 AST（抽象语法树）。然后通过语言特定的查询，提取出节点（函数、类、方法）和边（调用、导入、继承、实现）。
2.  **存储（Storage）** —— 所有数据都被存入本地的 SQLite 数据库（`.codegraph/codegraph.db`），并启用了 FTS5 全文搜索。
3.  **解析（Resolution）** —— 提取完成后，CodeGraph 会解析引用关系：函数调用 → 定义、导入 → 源文件、类继承，以及特定框架的模式。
4.  **自动同步（Auto-Sync）** —— MCP 服务器利用操作系统原生文件事件监听你的项目。文件变更会在一个短暂的静默期（默认 2 秒）后，进行增量式更新。

* * *

## 📚 库的使用方式

```typescript
import CodeGraph from '@colbymchenry/codegraph';

const cg = await CodeGraph.init('/path/to/project');
// 或：const cg = await CodeGraph.open('/path/to/project');

await cg.indexAll({
    onProgress: (p) => console.log(`${p.phase}: ${p.current}/${p.total}`)
});

const results = cg.searchNodes('UserService');
const callers = cg.getCallers(results[0].node.id);
const context = await cg.buildContext('fix login bug', {
    maxNodes: 20,
    includeCode: true,
    format: 'markdown'
});
const impact = cg.getImpactRadius(results[0].node.id, 2);

cg.watch();   // 监听文件变更，自动同步
// ...
cg.unwatch(); // 停止监听
cg.close();   // 关闭数据库连接
```

* * *

## ⚙️ 配置

配置文件位于 `.codegraph/config.json`，用于控制索引行为：

```json
{
    "version": 1,
    "languages": ["typescript", "javascript"],
    "exclude": ["node_modules/**", "dist/**", "build/**", "*.min.js"],
    "frameworks": [],
    "maxFileSize": 1048576,
    "extractDocstrings": true,
    "trackCallSites": true
}
```

| 选项 | 说明 | 默认值 |
| :--- | :--- | :--- |
| `languages` | 要索引的语言（为空时自动检测） | `[]` |
| `exclude` | 要忽略的 glob 模式 | `["node_modules/**", ...]` |
| `frameworks` | 框架提示，以获得更精确的解析 | `[]` |
| `maxFileSize` | 跳过大于此值（字节）的文件 | `1048576` (1MB) |
| `extractDocstrings` | 是否提取文档字符串 | `true` |
| `trackCallSites` | 是否追踪调用位置信息 | `true` |

* * *

## 🛠️ 支持的语言

| 语言 | 扩展名 | 状态 |
| :--- | :--- | :--- |
| TypeScript / JavaScript / JSX / TSX | `.ts`, `.js`, `.tsx`, `.jsx`, `.mjs`, `.cjs` | ✅ 完整支持 |
| Python | `.py`, `.pyi` | ✅ 完整支持 |
| Go | `.go` | ✅ 完整支持 |
| Rust | `.rs` | ✅ 完整支持 |
| Java | `.java` | ✅ 完整支持 |
| C# | `.cs` | ✅ 完整支持 |
| PHP | `.php` | ✅ 完整支持 |
| Ruby | `.rb` | ✅ 完整支持 |
| C / C++ | `.c`, `.cpp`, `.h`, `.hpp` | ✅ 完整支持 |
| Swift | `.swift` | ✅ 完整支持 |
| Kotlin | `.kt`, `.kts` | ✅ 完整支持 |
| Dart | `.dart` | ✅ 完整支持 |
| Svelte | `.svelte` | ✅ 完整支持 |
| Vue | `.vue` | ✅ 完整支持 |
| Liquid | `.liquid` | ✅ 完整支持 |
| Pascal / Delphi | `.pas`, `.dpr`, `.dpk`, `.lpr` | ✅ 完整支持 |

* * *

## 🔧 故障排除

**“CodeGraph 未初始化”**
首先在项目目录中运行 `codegraph init`。

**索引速度慢**
检查 `node_modules` 和其他大型目录是否已被排除在索引之外。也可以尝试使用 `--quiet` 来减少输出开销。

**索引慢 / MCP 遇到 `database is locked` / 正在使用 WASM 回退**
`codegraph` 附带了一个 WASM SQLite 回退方案，用于无法安装 `better-sqlite3` 的环境。回退方案的速度比原生后端慢 5-10 倍。

运行 `codegraph status` 并查看 `Backend:` 这一行：
*   `Backend: native` – 你正在使用快速的原生后端，无需任何操作。
*   `Backend: wasm` – 你正在使用较慢的 WASM 回退方案。

**解决方法：**
```bash
# macOS
xcode-select --install

# Linux (Debian / Ubuntu)
sudo apt install build-essential python3 make

# Linux (RHEL / Fedora)
sudo yum groupinstall "Development Tools"

# 然后在任何平台上重新构建
npm rebuild better-sqlite3
# 或将其作为强依赖安装
npm install better-sqlite3 --save
```
修复完成后，`codegraph status` 应该会显示 `Backend: native`。

**MCP 服务器无法连接**
请确保项目已经初始化并建立了索引，验证 MCP 配置中的路径是否正确，并检查能否从命令行成功运行 `codegraph serve --mcp`。

**符号丢失**
MCP 服务器会在文件保存时自动同步（等待几秒钟）。必要时也可以手动运行 `codegraph sync`。同时请检查该文件的语言是否在支持列表中，并且没有被配置规则排除在外。

* * *

## 📄 许可证

MIT

* * *

## 🙏 致谢 & 社区

**专为 Claude Code 社区打造**

- [报告 Bug](https://github.com/colbymchenry/codegraph/issues)
- [请求新功能](https://github.com/colbymchenry/codegraph/issues)


# 参考资料

* any list
{:toc}
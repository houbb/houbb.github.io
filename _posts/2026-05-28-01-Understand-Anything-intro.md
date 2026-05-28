---
layout: post 
title: Understand-Anything 理解万物
date: 2026-05-28 21:01:55 +0800
categories: [AI]
tags: [ai, biz]
published: true
---


# 理解万物

将任何代码库、知识库或文档，转变为一个你可以探索、搜索和提问的交互式知识图谱。

可与 Claude Code、Codex、Cursor、Copilot、Gemini CLI 等工具配合使用。

[加入 Discord 社区 →](https://discord.gg/pydat66RY) 提问、分享你的成果、获取社区帮助。

你刚加入一个新团队，代码库有 20 万行代码，该从何入手？
**理解万物 (Understand Anything)** 是一个 [Claude Code 插件](https://code.claude.com/docs/en/plugins-reference#plugins-reference)，它通过一个多智能体流水线分析你的项目，构建一个包含每个文件、函数、类和依赖关系的知识图谱，并为你提供一个交互式仪表板来直观地探索这一切。

与其盲目阅读代码，不如开始洞察全局。我们的目标不是用一个图谱来炫耀代码库有多复杂，而是让它默默地教会你每个部分是如何组合在一起的。

## ✨ 特性

> [!NOTE]
> 想跳过阅读？试试我们[官网](https://understand-anything.com/)上的[在线演示](https://understand-anything.com/demo/)——一个功能齐全的交互式仪表板，你可以在浏览器中拖拽、缩放、搜索和探索。

### 探索结构图谱

将你的代码库可视化为一个交互式知识图谱——每个文件、函数和类都是一个你可以点击、搜索和探索的节点。

选择任意节点，即可查看其用通俗英语描述的摘要、关系和引导式导览。

### 理解业务逻辑

切换到领域视图，看看你的代码如何映射到真实的业务流程——领域、工作流和步骤都以水平图谱的形式呈现。

### 分析知识库

使用 `understand-knowledge` 指向一个 [Karpathy 模式的 LLM 维基](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)，即可获得一个带有社区聚类效果的力导向知识图谱。

确定性解析器会从 `index.md` 中提取维基链接和分类，然后 LLM 智能体会发现隐含关系、提取实体并揭示主张——将你的维基变成一个可导航的互联思想图谱。

### 引导式导览

按依赖关系排序的架构导览，帮助你以正确的顺序学习代码库。

### 模糊搜索与语义搜索

按名称或含义查找内容。搜索“哪些部分处理身份验证？”，即可在图谱中获得相关结果。

### Diff 影响分析

在提交代码前，查看你的更改会影响到系统的哪些部分。理解改动在代码库中的连锁反应。

### 角色自适应界面

仪表板会根据你的身份——初级开发者、项目经理或高级用户——调整其信息详细程度。

### 分层可视化

按架构层自动分组——API、服务、数据、UI、工具——并配有颜色图例。

### 语言概念提示

12 种编程模式（泛型、闭包、装饰器等）会在它们出现的上下文中提供解释。

## 快速开始

### 1. 安装插件

```bash
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
```

### 2. 分析你的代码库

```bash
/understand
```

多智能体流水线会扫描你的项目，提取每个文件、函数、类和依赖关系，然后构建一个知识图谱，保存在 `.understand-anything/knowledge-graph.json` 中。

**指定输出语言**：使用 `--language` 参数以你偏好的语言生成内容：
```bash
# 生成中文内容（知识图节点描述和仪表板 UI）
/understand --language zh

# 支持的语言：en (默认), zh, zh-TW, ja, ko, ru
```

`--language` 参数会影响：
- 知识图谱中的节点摘要和描述
- 仪表板 UI 的标签、按钮和工具提示
- 引导式导览的说明

### 3. 探索仪表板

```bash
/understand-dashboard
```
一个交互式网页仪表板会打开，以图谱形式可视化你的代码库——按架构层颜色编码，可搜索、可点击。选择任意节点即可查看其代码、关系以及用通俗语言描述的解释。

### 4. 持续学习

```bash
# 询问关于代码库的任何问题
/understand-chat
# 例如：支付流程是如何工作的？

# 分析当前更改的影响
/understand-diff

# 深入研究特定文件或函数
/understand-explain src/auth/login.ts

# 为新团队成员生成入职指南
/understand-onboard

# 提取业务领域知识（领域、工作流、步骤）
/understand-domain

# 分析 Karpathy 模式的 LLM 维基知识库
/understand-knowledge ~/path/to/wiki

# 随时重新运行——默认增量分析（仅重新分析有变更的文件）
/understand

# 通过提交后钩子在每次提交时自动更新图谱
/understand --auto-update

# 限定分析范围到子目录（用于大型单体仓库）
/understand src/frontend
```

## 多平台安装

**理解万物** 可在多种 AI 编码平台上使用。

### Claude Code（原生）
```bash
/plugin marketplace add Lum1104/Understand-Anything
/plugin install understand-anything
```

### 一键安装脚本
适用于：Codex / OpenCode / OpenClaw / Antigravity / Gemini CLI / Pi Agent / Vibe CLI / VS Code Copilot / Hermes / Cline / KIMI CLI / Trae

**macOS / Linux:**
```bash
curl -fsSL https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.sh | bash
# 或跳过提示，直接指定平台：
curl -fsSL https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.sh | bash -s codex
```

**Windows (PowerShell):**
```powershell
iwr -useb https://raw.githubusercontent.com/Lum1104/Understand-Anything/main/install.ps1 | iex
```

安装脚本会将仓库克隆到 `~/.understand-anything/repo`，并为所选平台创建正确的符号链接。完成后请重启你的命令行界面或集成开发环境。

- **支持的值**: `gemini`, `codex`, `opencode`, `pi`, `openclaw`, `antigravity`, `vibe`, `vscode`, `hermes`, `cline`, `kimi`, `trae`
- **后续更新**: `./install.sh --update`
- **卸载**: `./install.sh --uninstall`

### Cursor
当此仓库被克隆后，Cursor 会通过 `.cursor-plugin/plugin.json` 自动发现该插件。无需手动安装——只需克隆并在 Cursor 中打开即可。如果自动发现失败，可手动安装：打开 Cursor 设置 → 插件，在搜索框中粘贴 `https://github.com/Lum1104/Understand-Anything`，然后从那里添加。

### VS Code + GitHub Copilot
当此仓库被克隆后，带有 GitHub Copilot（v1.108+）的 VS Code 会通过 `.copilot-plugin/plugin.json` 自动发现该插件。无需手动安装——只需克隆并在 VS Code 中打开即可。对于个人技能（在所有项目中可用），请使用 `vscode` 平台运行上述 `install.sh`。

### Copilot CLI
```bash
copilot plugin install Lum1104/Understand-Anything:understand-anything-plugin
```

### 平台兼容性

| 平台                    | 状态         | 安装方式                    |
| :---------------------- | :----------- | :-------------------------- |
| Claude Code             | ✅ 原生支持   | 插件市场                    |
| Cursor                  | ✅ 支持      | 自动发现                    |
| VS Code + GitHub Copilot| ✅ 支持      | 自动发现                    |
| Copilot CLI             | ✅ 支持      | `plugin install`            |
| Codex                   | ✅ 支持      | `install.sh codex`          |
| OpenCode                | ✅ 支持      | `install.sh opencode`       |
| OpenClaw                | ✅ 支持      | `install.sh openclaw`       |
| Antigravity             | ✅ 支持      | `install.sh antigravity`    |
| Gemini CLI              | ✅ 支持      | `install.sh gemini`         |
| Pi Agent                | ✅ 支持      | `install.sh pi`             |
| Vibe CLI                | ✅ 支持      | `install.sh vibe`           |
| Hermes                  | ✅ 支持      | `install.sh hermes`         |
| Cline                   | ✅ 支持      | `install.sh cline`          |
| KIMI CLI                | ✅ 支持      | `install.sh kimi`           |
| Trae                    | ✅ 支持      | `install.sh trae`           |

## 与团队分享图谱

图谱仅仅是 JSON 文件——提交一次，团队成员就可以跳过分析流水线，直接使用。这对新人入职、代码审查和“文档即代码”都非常友好。

**示例**: [GoogleCloudPlatform/microservices-demo (fork)](https://github.com/Lum1104/microservices-demo)——一个包含已提交图谱的 Go / Java / Python / Node 参考项目。

**需要提交的内容**: `.understand-anything/` 下的所有内容，**除了** `intermediate/` 和 `diff-overlay.json`（这些是本地临时文件）。
```
.understand-anything/intermediate/
.understand-anything/diff-overlay.json
```

**保持最新**: 启用 `/understand --auto-update`——一个提交后钩子会增量更新图谱，确保每次提交都伴随着一个匹配的图谱。或者在发布前手动重新运行 `/understand`。

**大型图谱（10 MB+）**: 使用 `git-lfs` 进行跟踪。
```bash
git lfs install
git lfs track ".understand-anything/*.json"
git add .gitattributes .understand-anything/
```

## 工作原理

### Tree-sitter + LLM 混合架构
静态分析和 LLM 各自发挥所长：
- **Tree-sitter (确定性)**：将源码解析为具体语法树，并提取结构事实：导入、导出、函数/类定义、调用位置、继承关系。在扫描阶段预解析成 `importMap` 并传递给文件分析器，避免它们从源码中重复推导导入关系。每次运行，相同的输入都会产生相同的输出。此外，它还支持基于指纹的变更检测，用于增量更新。
- **LLM (语义)**：读取解析后的结构和原始源码，生成解析器无法获取的内容：通俗语言的摘要、标签、架构层分配、业务领域映射、引导式导览、语言概念提示。

这种分工使得图谱在结构层面是可重现的（相同的代码总能产生相同的边），同时在语义层面捕获了意图（文件是做什么的，而不仅仅是它导入了什么）。

### 多智能体流水线
`/understand` 命令协调 5 个专门的智能体，`/understand-domain` 增加了第 6 个：

| 智能体 (Agent)              | 角色 (Role)                                               |
| :-------------------------- | :-------------------------------------------------------- |
| `project-scanner`           | 发现文件，检测语言和框架                                  |
| `file-analyzer`             | 提取函数、类、导入；生成图谱节点和边                      |
| `architecture-analyzer`     | 识别架构层                                                |
| `tour-builder`              | 生成引导式学习导览                                        |
| `graph-reviewer`            | 验证图谱完整性和引用完整性（默认内联运行；使用 `--review` 进行完整的 LLM 审查） |
| `domain-analyzer`           | 提取业务领域、工作流和流程步骤（由 `/understand-domain` 使用） |
| `article-analyzer`          | 从维基文章中提取实体、主张和隐式关系（由 `/understand-knowledge` 使用） |

文件分析器并行运行（最多 5 个并发，每批 20-30 个文件）。支持增量更新——仅重新分析自上次运行以来发生变更的文件。

## 社区

由 Better Stack 制作的社区实践教程。制作了视频、博客文章或教程？欢迎提交 Issue 或 Pull Request，我们很乐意在此展示。

## 贡献

欢迎贡献！以下是入门方法：
1. Fork 本仓库
2. 创建一个特性分支 (`git checkout -b feature/my-feature`)
3. 运行测试 (`pnpm --filter @understand-anything/core test`)
4. 提交你的更改并开启一个 Pull Request

对于重大更改，请先提交 Issue，以便我们讨论方案。

> 与其盲目阅读代码，不如开始**理解万物**。

## Star 历史

感谢所有使用和贡献的人——知道这个项目能为大家节省时间，让它的构建变得非常有价值。

MIT 许可证 © [Lum1104](https://github.com/Lum1104)

# 参考资料

* any list
{:toc}
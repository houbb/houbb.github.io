---
layout: post 
title: HKUDS/CLI-Anything：“CLI-Anything：让所有软件都成为 Agent 原生应用”
date: 2026-05-18 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# GitHub - HKUDS/CLI-Anything：“CLI-Anything：让所有软件都成为 Agent 原生应用”
## —— CLI-Hub：https://clianything.cc/ · GitHub

**CLI-Anything：让所有软件都成为 Agent 原生应用**

> 今天的软件服务于人类，明天的用户将是 Agent。

**CLI-Anything：弥合 AI Agent 与世界万千软件之间的鸿沟**

**CLI-Hub**：`pip install cli-anything-hub`，然后 `cli-hub install <cli_name>`——浏览、安装和管理所有社区构建的 CLI。想添加你自己的 CLI？提交一个 PR，Hub 会立刻更新。

**查看演示**：观看 AI Agent 使用生成的 CLI 进行 CAD 建模、3D 场景构建、图表生成、游戏玩法、字幕制作等。

**[成为贡献者，或提交 CLI 需求]** ：加入我们！报名构建一个新的 CLI 封装——一旦审核通过并被合并，你将获得我们社区贡献者的身份！希望 CLI-Anything 支持某个特定的软件或服务？提交一个愿望清单请求！

**一条命令行**：让任何软件为 Pi、OpenClaw、nanobot、Cursor、Claude Code 等 AI Agent 做好准备。

**中文文档** | **日本語ドキュメント**

---

## 动态
感谢社区的宝贵努力！更多更新每天都在持续进行中。

*   **2026-04-18**：**所有 `SKILL.md` 文件现已统一到顶层 `skills/` 目录下**——每个 CLI 技能都可以通过 `npx skills add HKUDS/CLI-Anything --skill <skill_name> -g -y` 从一个规范源安装。我们还添加了根技能验证 CI、同步了贡献/PR 文档和 REPL 技能路径提示，以适应新的布局，并围绕新的 `npx skills` 流程刷新了 **CLI-Hub** 的安装优先前端。

*   **2026-04-17**：**CLI-Hub** 再次获得了安装 UX 优化——公共注册表元数据和技能覆盖范围得到收紧，访问计数得到修正，Web Hub 进一步优化。**Shotcut** 渲染输出时长问题已修复（#92）。**SKILL** 贡献路径已为新文档流程修正（#224），技能生成器现在可以安全地处理空的简介（#203）。

*   **2026-04-16**：**QGIS CLI** 已合并（#207）——一个完整的 GIS/地图创作封装成功落地。**UniMol Tools CLI** 已合并（#219），用于分子建模工作流。**CLI-Hub** 还添加了更多公共 CLI，包括 **py4csr**，刷新了其生成的元技能，更正了 SKILL 贡献文档，并修复了技能生成中的 `apt-get` 包提取问题（#204）。

*   **2026-04-16**：**Unreal Insights CLI** 功能扩展——添加了后台捕获会话控制（`capture start/status/snapshot/stop`），实现了与引擎根匹配的 `UnrealInsights.exe` 解析/构建流程，并刷新了新编排工作流的文档/测试。

*   **2026-04-15**：**CLI-Hub** 更新至 **v0.2.0**——PyPI 包现在支持来自多个安装源（`pip`、`npm`、`brew`、捆绑/系统工具）的公共 CLI，并由新的 `public_registry.json` 支撑。Hub 前端已经用单独的 **CLI-Anything CLIs** 和 **Public CLIs** 板块重新设计，实时的端到端检查现在覆盖了 pip 和 npm 包的真实安装、更新和卸载流程。

*   **2026-04-14**：**Safari CLI** 已合并（#212）并添加到 Hub 注册表——通过 `safari-mcp` 实现浏览器自动化。**Kdenlive** 也获得了针对 Gen 5 项目输出和无效项目生成的兼容性修复。

*   **2026-04-13**：**Obsidian CLI** 已合并（#211）——通过 Local REST API 实现知识管理封装，包含 48 个单元测试和 7 个端到端测试。**Eth2-Quickstart CLI** 已合并（#195）——以太坊质押节点管理封装。**Zotero CLI** 更新至 v0.4.1（#201）——现在从其独立仓库分发，CLI-Hub 获得了对远程 `skill_md` URL 的支持。

*   **2026-04-11**：**n8n CLI** 已合并（#188）——用于自托管自动化流程的工作流自动化封装。**Exa CLI** 修复（#205），为使用跟踪添加了 `x-exa-integration` 头。**CLI-Hub** 也获得了其 PyPI 自动发布工作流和包刷新管道。

*   **2026-04-10**：**CLI-Hub 包管理器**发布——`pip install cli-anything-hub` 让你可以通过一条命令浏览、搜索、安装、更新和卸载 CLI-Anything 封装。Web Hub 也发布了其首个以安装为中心的前端刷新和“赋能自己”工具包卡片。

*   **更早动态（4月1-9日）**：
    *   **2026-04-09**：清理和文档调整（#200）——修复了 Openscreen 测试小计，将 Openscreen 添加到中文 README 和项目结构中，并澄清了文档中的 `/cli-anything` 命令语法。
    *   **2026-04-08**：**Openscreen CLI** 已合并（#183）——屏幕录制编辑器封装，包含 101 个测试。☁️ **CloudAnalyzer CLI** 已合并（#181）——云成本分析封装，包含 27 个命令。**SeaClip / PM2 / ChromaDB** 封装已合并（#129）。
    *   **2026-04-07**：**Dify Workflow CLI** 已合并（#191）——工作流自动化封装。**Inkscape** 自动保存修复（#193，修复 #182）。**DomShell 安全加固**（#156）——为浏览器 CLI 添加了 URL 验证和 DOM 清理。**Pi Coding Agent 扩展**已合并（#178）。
    *   **2026-04-06**：**Exa CLI** 已合并（#172）——AI 驱动的网页搜索和问答封装。**Godot CLI** 已合并（#140）——游戏引擎封装，包含一个完整的演示游戏端到端管道。☁️ **CloudAnalyzer** 审查修复和前端改进也已落地。
    *   **2026-04-03**：**WireMock CLI** 已合并（#170）——用于 API 测试的 HTTP 模拟服务器封装。**Pi Coding Agent** 扩展支持也已落地，并在文档中添加了 CLI 演示录像。
    *   **2026-04-01**：**《杀戮尖塔 II》CLI** 已合并（#148）——卡牌构筑类 Roguelike 游戏封装。**VideoCaptioner CLI** 已合并（#166）——AI 驱动的视频字幕生成封装。**IntelWatch** 已添加到注册表，用于 B2B 开源情报工作流。

*   **更早动态（3月23-30日）**：
    *   **2026-03-30**：**CLI-Anything v0.2.0**——HARNESS.md 渐进式披露重新设计。详细指南被提取到 `guides/` 目录以实现按需加载。阶段 1-7 现在是连续的。关键原则和规则被合并到一个权威部分。
    *   **2026-03-29**：Blender 技能文档更新——强制执行绝对渲染路径并更正了先决条件。
    *   **2026-03-28**：**CLIBrowser** 添加到 CLI-Hub 注册表，用于 Agent 可访问的浏览器自动化。
    *   **2026-03-27**：Zotero SKILL.md 增强，增加了面向 Agent 的约束；REPL 配置和可执行文件解析修复。
    *   **2026-03-26**：**Zotero CLI** 封装为 Zotero 桌面版落地（库管理、集合、引用）。Draw.io 自定义 ID 错误修复（#132）和 registry.json 语法修复。
    *   **2026-03-25**：**RenderDoc CLI** 已合并，用于 GPU 帧捕获分析。FreeCAD 更新到 v1.1。Blender EEVEE 引擎名称更正。Zoom 封装新增 `transcribe` 命令和文档增强。
    *   **2026-03-24**：**CLI-Hub** 上线——公共 CLIs 注册表：`public_registry.json`。一个简单的 Web 前端让任何人都可以浏览、搜索并通过一条 `pip` 命令安装任何 CLI。
    *   **2026-03-16**：添加了 **SKILL.md 生成**（阶段 6.5）——每个生成的 CLI 现在都附带一个 AI 可发现的技能定义。
    *   **2026-03-15**：来自社区的对 **OpenClaw** 的支持！合并了 Windows `cygpath` 防护以支持跨平台。
    *   **2026-03-14**：修复了 GIMP Script-Fu 路径注入漏洞，并添加了**日文 README** 翻译。
    *   **2026-03-13**：**Qodercli** 插件作为社区贡献被正式合并，带有专门的设置脚本。
    *   **2026-03-12**：**Codex 技能**集成落地，将 CLI-Anything 带到了又一个 AI 编码平台。
    *   **2026-03-11**：**Zoom** 视频会议封装被添加为第 11 个支持的应用程序。

---

## 为什么选择 CLI？
CLI 是人类和 AI Agent 的通用接口：
*   **结构化且可组合**：文本命令匹配大语言模型格式，并可链接以支持复杂工作流
*   **轻量且通用**：最小开销，在所有系统上运行，无依赖
*   **自描述**：`--help` 标志提供 Agent 可以自动发现的文档
*   **已被证明的成功**：Claude Code 每天通过 CLI 运行数以千计的真实工作流
*   **Agent 优先设计**：结构化 JSON 输出消除了解析复杂性
*   **确定且可靠**：一致的结果使 Agent 的行为可预测

## 快速开始

### 先决条件
*   **Python 3.10+**
*   目标软件已安装（例如 GIMP、Blender、LibreOffice，或你自己的应用程序）
*   一个受支持的 AI 编码 Agent：Claude Code | Pi | OpenClaw | OpenCode | Codex | Qodercli | GitHub Copilot CLI | 更多平台

### 选择你的平台

#### ⚡ Claude Code

**第 1 步：添加市场**
CLI-Anything 作为一个 GitHub 上托管的 Claude Code 插件市场分发。
```bash
# 添加 CLI-Anything 市场
/plugin marketplace add HKUDS/CLI-Anything
```

**第 2 步：安装插件**
```bash
# 从市场安装 cli-anything 插件
/plugin install cli-anything
```
这样就完成了。现在插件在你的 Claude Code 会话中可用。
> **Windows 用户注意：** Claude Code 通过 `bash` 运行 shell 命令。在 Windows 上，安装 Git for Windows（包括 `bash` 和 `cygpath`）或使用 WSL；否则命令可能会失败，提示 `cygpath: command not found`。

**第 3 步：一条命令构建 CLI**
```bash
# 为 GIMP 生成一个完整的 CLI（所有 7 个阶段）
/cli-anything ./gimp
```
跨 Claude Code 版本的命令兼容性：
*   使用 `/cli-anything` 作为主要入口点。
*   在较旧的版本上，如果**在确认插件已安装并加载后** `/cli-anything` 仍不被识别，请尝试传统入口形式 `/cli-anything:cli-anything`。
*   辅助命令保持 `:子命令` 形式（例如 `/cli-anything:refine`）。
如果你看到 `Unknown skill: cli-anything`，先关注插件的安装/加载：
1.  重新加载插件命令：`/reload-plugins`
2.  验证插件是否已加载：`/help cli-anything`
3.  如果需要，从市场重新安装：
    *   `/plugin marketplace add HKUDS/CLI-Anything`
    *   `/plugin install cli-anything`
4.  确认插件可用后，重试入口命令：
    *   首选：`/cli-anything ./gimp`
    *   仅限较旧版本：`/cli-anything:cli-anything ./gimp`

这将运行完整的管道：
1.  **分析**——扫描源代码，将图形用户界面动作映射到 API
2.  **设计**——构建命令组、状态管理、参数
3.  **规划**——创建实施路线图
4.  **实现**——编写带有 Click 框架、参数、类型检查的 Python CLI 封装
5.  **测试**——生成单元测试、端到端测试、集成测试
6.  **验证**——针对真实软件实例运行测试
7.  **发布**——创建可安装的 PyPI 包并更新 `SKILL.md`

**第 3 步（可选）：细化和改进 CLI**
```bash
# 广泛细化——Agent 分析所有能力的差距
/cli-anything:refine ./gimp
# 聚焦细化——针对特定的功能领域
/cli-anything:refine ./gimp "批量处理和滤镜"
```
`refine` 命令执行差距分析并实现缺失的功能。它可以运行多次，每次迭代都会改进 CLI。

**从 GitHub 仓库构建 CLI**
```bash
# 从 GitHub URL 构建
/cli-anything https://github.com/blender/blender
```
该命令作为一个子任务运行，并遵循与 Claude Code 相同的 7 阶段方法论。

**从市场手动安装**
```bash
# 克隆仓库
git clone https://github.com/HKUDS/CLI-Anything.git
# 复制插件到 Claude Code 插件目录
cp -r CLI-Anything/cli-anything-plugin ~/.claude/plugins/cli-anything
# 重新加载插件
/reload-plugins
```

#### ⚡ Pi Coding Agent

**第 1 步：安装扩展**
扩展位于此仓库的 `.pi-extension/cli-anything/`。全局安装它，以便 **所有** Pi 项目都可用 `/cli-anything` 命令：
```bash
# 克隆仓库
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything
# 全局安装到 Pi 的扩展目录
bash .pi-extension/cli-anything/install.sh
```
卸载：
```bash
bash .pi-extension/cli-anything/uninstall.sh
```

**第 2 步：使用 CLI-Anything**
现在在 Pi 中可以使用以下命令：
```bash
# 为 GIMP 生成一个完整的 CLI（所有 7 个阶段）
/cli-anything ./gimp
# 从 GitHub 仓库构建
/cli-anything https://github.com/blender/blender
```

**第 3 步（可选）：细化和改进 CLI**
```bash
# 广泛细化——Agent 分析所有能力的差距
/cli-anything:refine ./gimp
# 聚焦细化——针对特定的功能领域
/cli-anything:refine ./gimp "批量处理和滤镜"
```

#### ⚡ OpenCode（实验性）

**第 1 步：安装命令**
> **注意：** 请升级到最新的 OpenCode。旧版本可能使用不同的命令路径。

将 CLI-Anything 命令 **和** `HARNESS.md` 复制到你的 OpenCode 命令目录：
```bash
# 克隆仓库
git clone https://github.com/HKUDS/CLI-Anything.git
# 创建 OpenCode 命令目录
mkdir -p ~/.opencode/commands/cli-anything
# 复制命令文件
cp CLI-Anything/opencode-commands/HARNESS.md ~/.opencode/commands/cli-anything/
cp CLI-Anything/opencode-commands/cli-anything.md ~/.opencode/commands/cli-anything/
cp CLI-Anything/opencode-commands/cli-anything-refine.md ~/.opencode/commands/cli-anything/
cp CLI-Anything/opencode-commands/cli-anything-validate.md ~/.opencode/commands/cli-anything/
```
现在在你的 OpenCode 会话中可以使用 `/cli-anything`、`/cli-anything-refine` 和 `/cli-anything-validate` 命令。

**第 2 步：构建 CLI**
```bash
# 为 GIMP 生成一个完整的 CLI
/cli-anything ./gimp
# 从 GitHub 仓库构建
/cli-anything https://github.com/blender/blender
```

**第 3 步（可选）：细化和改进 CLI**
```bash
# 广泛细化——Agent 分析所有能力的差距
/cli-anything-refine ./gimp
# 聚焦细化——针对特定的功能领域
/cli-anything-refine ./gimp "批量处理和滤镜"
```

#### ⚡ Goose（桌面版/CLI）`实验性` `社区`

**第 1 步：安装 Goose**
使用适用于你操作系统的官方 Goose 说明安装 Goose（桌面版或 CLI）。

**第 2 步：配置一个 CLI 提供商**
将 Goose 配置为使用诸如 Claude Code 之类的 CLI 提供商，并确保该 CLI 已安装且已认证。

**第 3 步：在 Goose 会话中使用 CLI-Anything**
Goose 配置完成后，启动一个会话并使用上面为 Claude Code 描述的相同 CLI-Anything 命令，例如：
```bash
/cli-anything ./gimp
/cli-anything:refine ./gimp "批量处理和滤镜"
```
> 注意：当 Goose 通过 CLI 提供商运行时，它将使用该提供商的功能和命令格式。

#### ⚡ Qodercli `社区`

**第 1 步：注册插件**
```bash
git clone https://github.com/HKUDS/CLI-Anything.git
bash CLI-Anything/qoder-plugin/setup-qodercli.sh
```
这将向 `~/.qoder.json` 注册 `cli-anything` 插件。注册后启动一个新的 Qodercli 会话。

**第 2 步：从 Qodercli 使用 CLI-Anything**
```bash
/cli-anything ./gimp
/cli-anything:refine ./gimp "批量处理和滤镜"
/cli-anything:validate ./gimp
```

#### ⚡ OpenClaw `社区`

**第 1 步：安装技能**
CLI-Anything 提供了一个原生的 OpenClaw `SKILL.md` 文件。将其复制到你的 OpenClaw 技能目录：
```bash
# 克隆仓库
git clone https://github.com/HKUDS/CLI-Anything.git
# 安装到全局技能文件夹
mkdir -p ~/.openclaw/skills/cli-anything
cp CLI-Anything/openclaw-skill/SKILL.md ~/.openclaw/skills/cli-anything/SKILL.md
```

**第 2 步：构建 CLI**
现在你可以在 OpenClaw 内部调用该技能：
```bash
@cli-anything build a CLI for ./gimp
```
该技能遵循与 Claude Code 和 OpenCode 相同的 7 阶段方法论。

#### ⚡ Codex `实验性` `社区`

**第 1 步：安装技能**
运行捆绑的安装程序：
```bash
# 克隆仓库
git clone https://github.com/HKUDS/CLI-Anything.git
# 安装技能
bash CLI-Anything/codex-skill/scripts/install.sh
```
在 Windows PowerShell 上，使用：
```powershell
.\CLI-Anything\codex-skill\scripts\install.ps1
```
这会将技能安装到 `$CODEX_HOME/skills/cli-anything`（如果 `CODEX_HOME` 未设置，则为 `~/.codex/skills/cli-anything`）。安装后重启 Codex 以便发现它。

**第 2 步：从 Codex 使用 CLI-Anything**
用自然语言描述任务，例如：
```
使用 CLI-Anything 为 ./gimp 构建一个封装。
使用 CLI-Anything 为 ./shotcut 细化画中画工作流。
使用 CLI-Anything 验证 ./libreoffice。
```
Codex 技能采用了与 Claude Code 插件和 OpenCode 命令相同的方法论，同时保持生成的 Python 封装格式不变。

#### ⚡ GitHub Copilot CLI `社区`

**第 1 步：安装插件**
```bash
git clone https://github.com/HKUDS/CLI-Anything.git
cd CLI-Anything
copilot plugin install ./cli-anything-plugin
```
这会将 CLI-Anything 插件安装到 GitHub Copilot CLI。该插件现在应该在你的 GitHub Copilot CLI 会话中可用。

**第 2 步：从 GitHub Copilot CLI 使用 CLI-Anything**
```bash
/cli-anything ./gimp
/cli-anything:refine ./gimp "批量处理和滤镜"
/cli-anything:validate ./gimp
```

#### 更多平台（即将推出）
CLI-Anything 设计为平台无关的。对更多 AI 编码 Agent 的支持已列入计划：
*   **Codex**——可通过 `codex-skill/` 中的捆绑技能获得
*   **Cursor**——即将推出
*   **Windsurf**——即将推出
*   **你喜欢的工具**——开源贡献欢迎！

### 使用生成的 CLI
无论你使用哪个平台构建，生成的 CLI 都以相同的方式工作：
```bash
# 安装到 PATH
cd gimp/agent-harness && pip install -e .
# 从任何地方使用
cli-anything-gimp --help
cli-anything-gimp project new --width 1920 --height 1080 -o poster.json
cli-anything-gimp --json layer add -n "Background" --type solid --color "#1a1a2e"
# 进入交互式 REPL
cli-anything-gimp
```
现在每个仓库内封装都有一个规范的 `SKILL.md`，位于 `skills/cli-anything-<name>/SKILL.md`，这使得单体仓库可以通过 `npx skills add HKUDS/CLI-Anything --list` 直接被发现。已安装的封装包仍在 `cli_anything_<name>/skills/SKILL.md` 附带一个兼容性副本，REPL 横幅在有仓库根目录规范文件时优先使用，否则回退到打包的副本。

---

## 使用 CLI-Hub 赋能你的 Agent
CLI-Hub 让 Agent 可以自主发现和安装它们需要的 CLI——无需人工干预。我们发布了一个**元技能**，让任何 AI Agent 都可以自由浏览社区 CLI 的完整目录，并为任务选择正确的那个。

**一条命令安装：**
```bash
# OpenClaw
openclaw skills install cli-anything-hub
# nanobot
nanobot skills install cli-anything-hub
```

**然后直接提示你的 Agent：**
> 在 CLI-Hub 中找到合适的 CLI 软件并完成任务：

Agent 将浏览目录，安装适合任务的任何 CLI，并使用它——全程自主。
> **工作原理：**
> 1. 元技能指向位于 `https://reeceyang.sgp1.cdn.digitaloceanspaces.com/SKILL.md` 的实时目录
> 2. Agent 读取按类别组织的 20+ CLI，附带一条 `pip install` 命令
> 3. Agent 安装适合任务的 CLI，然后读取该 CLI 自己的 `SKILL.md` 以获取详细用法
> 
> 每当 `registry.json` 更改时，目录会自动更新——新的社区 CLI 会自动出现。
> **对于 Claude Code 用户：** 将 `skills/cli-hub-meta-skill/SKILL.md` 复制到你的项目或技能目录中，以获得相同的自动 CLI 发现功能。

---

## CLI-Anything 的愿景：构建 Agent 原生软件
*   **通用访问**——每个软件都通过结构化 CLI 变得立即可被 Agent 控制。
*   **无缝集成**——Agent 无需 API、图形用户界面、重建或复杂的包装器即可控制任何应用程序。
*   **面向未来的生态系统**——用一条命令将为人设计的软件转化为 Agent 原生工具。

---

## 何时使用 CLI-Anything
| 类别 | 如何实现 Agent 原生 | 值得注意的例子 |
|---|---|---|
| **GitHub 仓库** | 通过自动 CLI 生成将任何开源项目转化为 Agent 可控工具 | VSCodium, WordPress, Calibre, Zotero, Joplin, Logseq, Penpot, Super Productivity |
| **AI/ML 平台** | 通过结构化命令自动化模型训练、推理管道和超参数调优 | Stable Diffusion WebUI, ComfyUI, Ollama, InvokeAI, Text-generation-webui, Open WebUI, Fooocus, Kohya_ss, AnythingLLM, SillyTavern |
| **数据与分析** | 启用可编程的数据处理、可视化和统计分析工作流 | JupyterLab, Apache Superset, Metabase, Redash, DBeaver, KNIME, Orange, OpenSearch Dashboards, Lightdash |
| **开发工具** | 通过命令接口简化代码编辑、构建、测试和部署流程 | Jenkins, Gitea, Hoppscotch, Portainer, pgAdmin, SonarQube, ArgoCD, OpenLens, Insomnia, Beekeeper Studio, iTerm2 |
| **创意与媒体** | 以编程方式控制内容创作、编辑和渲染工作流 | Blender, GIMP, OBS Studio, Audacity, Krita, Kdenlive, Shotcut, Inkscape, Darktable, LMMS, Ardour |
| **企业办公** | 将业务应用程序和生产力工具转化为 Agent 可访问的系统 | NextCloud, GitLab, Grafana, Mattermost, LibreOffice, AppFlowy, NocoDB, Odoo（社区版）, Plane, ERPNext |
| **通信与协作** | 通过结构化 CLI 自动化会议安排、参与者管理、记录检索和报告 | Zoom, Jitsi Meet, BigBlueButton, Mattermost |
| **图表与可视化** | 以编程方式创建和操作图表、流程图、架构图和可视化文档 | Draw.io (diagrams.net), Mermaid, PlantUML, Excalidraw, yEd |
| **网络与基础设施** | 通过结构化 CLI 命令管理网络服务、DNS、广告拦截和基础设施 | AdGuardHome |
| **测试与模拟** | 控制 HTTP 模拟服务器、管理测试存根、为集成测试录制和重放 API 流量 | WireMock |
| **图形与 GPU 调试** | 分析 GPU 帧捕获、检查管线状态、导出着色器和比较渲染状态 | RenderDoc |
| **视频与字幕** | 转录语音、翻译字幕、将带样式的字幕烧录到视频中——完整的字幕制作管线 | VideoCaptioner |
| **AI 原生搜索** | 通过基于嵌入的 API 进行神经和深度网络搜索，实现结构化内容检索 | Exa |
| **✨ AI 内容生成** | 通过 AI 驱动的云 API 生成专业的可交付成果（幻灯片、文档、图表、网站、研究报告） | AnyGen, Gamma, Beautiful.ai, Tome |

---

## CLI-Anything 的关键特性

### Agent 与软件之间的鸿沟
AI Agent 擅长推理，但在使用真正的专业软件方面却很糟糕。目前的解决方案要么是脆弱的 UI 自动化、有限的 API，要么是丢失了 90% 功能的简化重新实现。

**CLI-Anything 的解决方案**：在不损失能力的情况下将任何专业软件转化为 Agent 原生工具。

| 当前痛点 | CLI-Anything 的解决方案 |
|---|---|
| “AI 无法使用真正的工具” | 与实际软件后端直接集成（Blender、LibreOffice、FFmpeg）——完整的专业能力，零妥协 |
| “UI 自动化不断崩溃” | 无截图、无点击、无机器人流程自动化脆弱性。纯粹的命令行可靠性，带有结构化接口 |
| “Agent 需要结构化数据” | 内置 JSON 输出，用于无缝的 Agent 消费 + 人类可读的调试格式 |
| “自定义集成成本高昂” | 一个 Claude 插件通过经过验证的 7 阶段管道为任何代码库自动生成 CLI ⚡ |
| “原型与生产的差距” | 超过 2,280 个测试，经过真实软件验证。在 18 个主要应用程序中经受住了实战考验 |

### 完整的技术特性

#### 🛠️ 7 阶段完全自动化管道
从代码库分析到 PyPI 发布——插件自动处理架构设计、实现、测试计划、测试编写和文档。

#### 🎯 真实的软件集成
直接调用真正的应用程序进行实际渲染。LibreOffice 生成 PDF，Blender 渲染 3D 场景，Audacity 通过 sox 处理音频。**零妥协**，**零玩具实现**。

#### 🧠 智能会话管理
具有撤销/重做功能的持久项目状态，以及在所有 CLI 上提供一致交互体验的统一 REPL 接口（ReplSkin）。

#### 📦 零配置安装
简单的 `pip install -e .` 将 `cli-anything-<name>` 直接放在 PATH 上。Agent 通过标准 `which` 命令发现工具。无需设置，无需包装器。

#### 🧪 生产级测试
多层验证：带有合成数据的单元测试，带有真实文件和软件的端到端测试，以及已安装命令的 CLI 子进程验证。

#### 🧱 干净的包架构
所有 CLI 都组织在 `cli_anything.*` 命名空间下——无冲突、可通过 pip 安装、命名一致：`cli-anything-gimp`、`cli-anything-blender` 等。

#### 📝 SKILL.md 生成
每个生成的 CLI 现在都有一个规范的 `SKILL.md`，位于 `skills/cli-anything-<name>/SKILL.md`。这使得当前的单体仓库可以直接被 `npx skills` 使用，同时打包的兼容性副本在 `cli_anything_<name>/skills/SKILL.md` 保留了已安装封装的行为。

**`SKILL.md` 提供的内容：**
- 包含名称和描述的 YAML 前置元数据，用于 Agent 技能发现
- 包含所有记录在案的子命令的命令组
- 常见工作流的使用示例
- 针对 JSON 输出、错误处理和程序化使用的 Agent 特定指南

`SKILL.md` 文件在管道的阶段 6.5 中使用 `skill_generator.py` 自动生成，该脚本直接从 CLI 的 Click 装饰器、setup.py 和 README 中提取元数据。生成器现在写入规范的仓库根目录技能文件，并刷新已安装封装使用的包本地兼容性副本。在这个仓库内，REPL 横幅将 Agent 指向规范的根技能路径；在 `pip install` 之后，它回退到打包的副本。

---

## 真实世界演示
AI Agent 使用生成的 CLI 来生成完整的、有用的产物——无需图形用户界面。

### FreeCAD —— 通过预览、实时预览和轨迹构建的“好奇号”火星车
> **封装：** `cli-anything-freecad` | **预览堆栈：** `preview` + `preview live` + `trajectory.json` | **产物：** Agent 构建的“好奇号”风格火星车

一个 Agent 逐步组装了一辆受“好奇号”启发的火星车，同时发布真实的 FreeCAD 预览包，刷新实时预览会话，并记录命令到预览的历史以供后续回放。最终的演示展示了产物在最终展示前逐步演进的过程。README 中的 GIF 是根据完整的本地演示视频，通过速度调整、高质量的 ffmpeg 调色板工作流生成的。

### Blender —— 通过预览、实时预览和轨迹构建的轨道中继无人机
> **封装：** `cli-anything-blender` | **预览堆栈：** `preview` + `preview live` + `trajectory.json` | **产物：** Agent 构建的轨道中继无人机

一个 Agent 使用 Blender 封装在真实的预览循环下构建了一个硬表面轨道中继无人机：每个阶段推送新的渲染支持包，实时会话跟踪当前头，轨迹将每个命令与匹配的视觉状态联系起来。演示以完成场景并准备进行精美的转台展示结束。README 中的 GIF 是根据完整的本地演示视频，通过速度调整、高质量的 ffmpeg 调色板工作流生成的。

### Draw.io —— HTTPS 握手图
> **封装：** `cli-anything-drawio` | **耗时：** 约 4 分钟 | **产物：** `.drawio` + `.png`

一个 Agent 从头开始创建了一个完整的 HTTPS 连接生命周期图——TCP 三次握手、TLS 协商、加密数据交换和 TCP 四次挥手——全程通过 CLI 命令完成。最终产物 _由 @zhangxilong-43 贡献_

### 《杀戮尖塔 II》 —— 游戏自动化
> **封装：** `cli-anything-slay-the-spire-ii` | **产物：** 自动化的游戏过程

一个 Agent 使用 CLI 封装玩完了《杀戮尖塔 II》的一轮——读取游戏状态、选择卡牌、选择路径，并实时做出战略决策。_由 @TianyuFan0504 贡献_

### VideoCaptioner —— 自动生成字幕
> **封装：** `cli-anything-videocaptioner` | **产物：** 带字幕的视频帧

一个 Agent 使用 VideoCaptioner CLI 自动生成字幕并将其覆盖到视频内容上，支持双语文本渲染和可定制的格式。_由 @WEIFENG2333 贡献_

_更多 CLI 演示即将推出。_

# 参考资料

* any list
{:toc}
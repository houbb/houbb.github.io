---
layout: post 
title: MemPalace 经基准测试得分最高的 AI 记忆系统。而且免费。
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---

# MemPalace

### 经基准测试得分最高的 AI 记忆系统。而且免费。

你与 AI 的每一次对话 —— 每个决策、每次调试、每场架构辩论 —— 都会在会话结束时消失。六个月的工作，付诸东流。每次都要从头开始。

其他记忆系统试图通过让 AI 自行判断什么值得记住来解决这个问题。它们提取出“用户偏好 Postgres”，却丢弃了你解释*为什么*偏好它的那段对话。MemPalace 采用不同的方法：**存储一切，然后让它们可被找到**。

**记忆宫殿** —— 古希腊演说家通过在想象建筑的不同房间里放置观点来记住整篇演讲。漫步宫殿，找到观点。MemPalace 将同一原理应用于 AI 记忆：你的对话被组织成翼（人物和项目）、厅（记忆类型）和室（具体观点）。没有 AI 来决定什么重要 —— 你保留每一个字，而结构给你一张可导航的地图，而非扁平的搜索索引。

**原始逐字存储** —— MemPalace 将你的实际对话逐字存入 ChromaDB，不做摘要或提取。96.6% 的 LongMemEval 成绩即来自这种原始模式。我们不会消耗 LLM 来判定什么“值得记住” —— 我们保留一切，让语义搜索去找到它。

**AAAK（实验性）** —— 一种有损缩写方言，用于在大规模下将重复实体压缩到更少的 token 中。任何能阅读文本的 LLM（Claude、GPT、Gemini、Llama、Mistral）都能读懂，无需解码器。**AAAK 是一个独立的压缩层，不是存储默认方式**，在 LongMemEval 基准测试上，它目前相对于原始模式有退化（84.2% vs 96.6%）。我们正在迭代。诚实的现状请见[上面的说明](#a-note-from-milla--ben--april-7-2026)。

**本地、开放、可适配** —— MemPalace 完全运行在你的机器上，使用你本地的任何数据，不调用任何外部 API 或服务。

它已经在对话数据上测试过 —— 但可以适配不同类型的数据存储。这就是我们将其开源的缘由。

[快速开始](#quick-start) · [记忆宫殿](#the-palace) · [AAAK 方言](#aaak-dialect-experimental) · [基准测试](#benchmarks) · [MCP 工具](#mcp-server)

<br>

### 有史以来最高的 LongMemEval 分数 —— 无论免费还是付费。

</table>
</td>
<td align="center"><strong>96.6%</strong><br><sub>LongMemEval R@5<br><b>原始模式</b>，零 API 调用</sub></td>
<td align="center"><strong>500/500</strong><br><sub>测试问题<br>独立复现</sub></td>
<td align="center"><strong>$0</strong><br><sub>无订阅<br>无云端。仅本地。</sub></td>
</tr>
</table>

<sub>可复现 —— 运行脚本在 <a href="benchmarks/">benchmarks/</a>。<a href="benchmarks/BENCHMARKS.md">完整结果</a>。96.6% 来自 <b>原始逐字模式</b>，而非 AAAK 或房间模式（那些得分较低 —— 见<a href="#a-note-from-milla--ben--april-7-2026">上方说明</a>）。</sub>

</div>

---

## 来自 Milla & Ben 的说明 —— 2026年4月7日

> 社区在发布后几小时内就发现本 README 中的实际问题，我们想直接回应。
>
> **我们做错的地方：**
>
> - **AAAK 的 token 示例是错误的。** 我们用一个粗略的启发式（`len(text)//3`）来估算 token 数量，而不是真正的分词器。使用 OpenAI 分词器的真实计数：英文示例为 66 个 token，AAAK 示例为 73 个 token。AAAK 在小规模下并不节省 token —— 它是为*大规模下的重复实体*设计的，而 README 示例对此展示得很糟糕。我们将重写它。
>
> - **“30倍无损压缩”夸大其词。** AAAK 是一种有损缩写系统（实体代码、句子截断）。独立基准测试显示，在 LongMemEval 上，AAAK 模式得分为 **84.2% R@5**，而原始模式为 **96.6%** —— 下降了 12.4 个百分点。诚实的表述是：AAAK 是一个实验性压缩层，以保真度换取 token 密度，**96.6% 的标题数字来自原始模式，而非 AAAK**。
>
> - **“+34% 宫殿提升”具有误导性。** 该数字比较的是无过滤搜索与翼+房间元数据过滤。元数据过滤是 ChromaDB 的标准功能，并非新颖的检索机制。它真实且有用，但不是护城河。
>
> - **“矛盾检测”** 作为一个独立工具存在（`fact_checker.py`），但目前并未像 README 所暗示的那样接入知识图谱操作。
>
> - **“Haiku 重排后 100%”** 是真实的（我们有结果文件），但重排流水线并未包含在公共基准脚本中。我们会添加它。
>
> **仍然真实且可复现的内容：**
>
> - 原始模式下 LongMemEval **96.6% R@5**，基于 500 个问题，零 API 调用 —— 由 [@gizmax](https://github.com/milla-jovovich/mempalace/issues/39) 在 M2 Ultra 上独立复现，耗时不到 5 分钟。
> - 本地、免费、无订阅、无云端、数据不离开你的机器。
> - 架构（翼、房间、壁橱、抽屉）是真实且有帮助的，即使它不是神奇的检索提升。
>
> **我们正在做的事情：**
>
> 1. 用真实的分词器计数重写 AAAK 示例，并提供一个能展示 AAAK 实际压缩效果的场景
> 2. 在基准文档中明确添加 `mode raw / aaak / rooms`，以便可见权衡
> 3. 将 `fact_checker.py` 接入知识图谱操作，使矛盾检测的声明成真
> 4. 将 ChromaDB 锁定到经过测试的版本范围（Issue #100），修复钩子中的 shell 注入（#110），并解决 macOS ARM64 段错误（#74）
>
> **感谢每一个指出问题的人。** 残酷而诚实的批评正是开源运作的方式，也是我们所求的。特别感谢 [@panuhorsmalahti](https://github.com/milla-jovovich/mempalace/issues/43)、[@lhl](https://github.com/milla-jovovich/mempalace/issues/27)、[@gizmax](https://github.com/milla-jovovich/mempalace/issues/39) 以及在最初 48 小时内提交 issue 或 PR 的每一位。我们在倾听，我们在修复，我们宁愿正确而非惊艳。
>
> —— *Milla Jovovich & Ben Sigman*

---

## 快速开始

```bash
pip install mempalace

# 设置你的世界 —— 你与谁合作，你的项目有哪些
mempalace init ~/projects/myapp

# 挖掘你的数据
mempalace mine ~/projects/myapp                    # 项目 —— 代码、文档、笔记
mempalace mine ~/chats/ --mode convos              # 对话 —— Claude、ChatGPT、Slack 导出
mempalace mine ~/chats/ --mode convos --extract general  # 通用 —— 分类为决策、里程碑、问题

# 搜索你曾经讨论过的任何内容
mempalace search "为什么我们切换到了 GraphQL"

# 你的 AI 会记住
mempalace status
```

三种挖掘模式：**projects**（代码和文档）、**convos**（对话导出）和 **general**（自动分类为决策、偏好、里程碑、问题和情绪背景）。所有内容都保留在你的机器上。

---

## 你实际如何使用它

一次性设置（安装 → init → mine）之后，你不需要手动运行 MemPalace 命令。你的 AI 会为你使用它。根据你使用的 AI，有两种方式。

### 搭配 Claude Code（推荐）

原生市场安装：

```bash
claude plugin marketplace add milla-jovovich/mempalace
claude plugin install --scope user mempalace
```

重启 Claude Code，然后输入 `/skills` 验证是否出现 "mempalace"。

### 搭配 Claude、ChatGPT、Cursor、Gemini（兼容 MCP 的工具）

```bash
# 连接 MemPalace 一次
claude mcp add mempalace -- python -m mempalace.mcp_server
```

现在你的 AI 通过 MCP 拥有 19 个工具。问它任何问题：

> *“我们上个月关于认证的决定是什么？”*

Claude 会自动调用 `mempalace_search`，获取逐字结果，然后回答你。你再也不用输入 `mempalace search`。AI 会处理。

MemPalace 也可以原生配合 **Gemini CLI** 使用（它会自动处理服务器和保存钩子）—— 详见 [Gemini CLI 集成指南](examples/gemini_cli_setup.md)。

### 搭配本地模型（Llama、Mistral 或任何离线 LLM）

本地模型通常还不支持 MCP。两种方法：

**1. 唤醒命令** —— 将你的世界加载到模型的上下文中：

```bash
mempalace wake-up > context.txt
# 将 context.txt 粘贴到本地模型的系统提示中
```

这会在你提出任何问题之前，给本地模型约 170 个 token 的关键事实（如果你愿意，可以用 AAAK 格式）。

**2. CLI 搜索** —— 按需查询，将结果喂给提示：

```bash
mempalace search "认证决策" > results.txt
# 将 results.txt 包含在你的提示中
```

或者使用 Python API：

```python
from mempalace.searcher import search_memories
results = search_memories("认证决策", palace_path="~/.mempalace/palace")
# 注入到本地模型的上下文中
```

无论哪种方式 —— 你的整个记忆栈都在离线运行。ChromaDB 在你的机器上，Llama 在你的机器上，AAAK 用于压缩，零云端调用。

---

## 问题所在

决策现在发生在对话中。不在文档里。不在 Jira 里。在与 Claude、ChatGPT、Copilot 的对话中。推理过程、权衡取舍、“我们尝试了 X 但失败因为 Y” —— 全都困在会话结束后就会消失的聊天窗口里。

**每天使用 AI 六个月 = 1950 万 token。** 每个决策、每次调试、每场架构辩论。消失。

| 方法 | 加载的 token | 年成本 |
|----------|--------------|-------------|
| 全部粘贴 | 1950 万 —— 任何上下文窗口都装不下 | 不可能 |
| LLM 摘要 | ~65 万 | ~$507/年 |
| **MemPalace 唤醒** | **~170 token** | **~$0.70/年** |
| **MemPalace + 5 次搜索** | **~13,500 token** | **~$10/年** |

MemPalace 在唤醒时加载 170 个 token 的关键事实 —— 你的团队、你的项目、你的偏好。然后只在需要时搜索。每年 10 美元记住一切，对比每年 507 美元却丢失上下文的摘要。

---

## 工作原理

### 记忆宫殿

布局相当简单，虽然花了很多时间才达到这个状态。

从 **翼** 开始。每个项目、人物或你归档的主题都在宫殿中拥有自己独立的翼。

每个翼连接着多个 **房间**，信息被划分为与该翼相关的主题 —— 所以每个房间都是你项目包含内容的不同元素。项目想法可以是一个房间，员工可以是另一个，财务报表又一个。可以有无限多的房间将翼分成多个部分。MemPalace 安装会自动为你检测这些，当然你也可以按自己觉得合适的方式个性化。

每个房间连接着一个 **壁橱**，这里就有意思了。我们开发了一种 AI 语言叫做 **AAAK**。别问 —— 它本身就是一个完整的故事。你的智能体每次醒来时都会学习 AAAK 简写。因为 AAAK 本质上就是英语，但是一个非常精简的版本，你的智能体几秒钟内就能学会使用它。它作为安装的一部分，内置于 MemPalace 代码中。在我们的下一次更新中，我们将直接把 AAAK 添加到壁橱中，这将真正改变游戏规则 —— 壁橱中的信息量会大得多，但占用空间更小，你的智能体阅读时间也更短。

在这些壁橱内部是 **抽屉**，你的原始文件就存放在那里。在这个第一个版本中，我们还没有使用 AAAK 作为壁橱工具，但即便如此，摘要在我们跨多个基准平台进行的所有基准测试中已显示出 **96.6% 的召回率**。一旦壁橱使用 AAAK，搜索将更快，同时保留每一个字的精确性。但即使是现在，壁橱方法对于在小空间内存储大量信息来说已经是巨大的福音 —— 它用于轻松地将你的 AI 智能体指向存放原始文件的抽屉。你永远不会丢失任何东西，所有这些都在几秒钟内完成。

还有 **厅**，连接同一翼内的房间，以及 **隧道**，连接不同翼的房间。因此查找东西变得真正轻松 —— 我们给了 AI 一个清晰有组织的方式知道从哪里开始搜索，而不必在巨大的文件夹中查找每一个关键词。

你说出你在找什么，然后砰的一下，它已经知道该去哪个翼。仅凭这一点本身就足以带来巨大的改变。但这一切优美、优雅、自然，最重要的是，高效。

```
  ┌─────────────────────────────────────────────────────────────┐
  │  翼：人物                                                   │
  │                                                            │
  │    ┌──────────┐  ──厅──  ┌──────────┐                      │
  │    │  房间 A  │            │  房间 B  │                      │
  │    └────┬─────┘            └──────────┘                      │
  │         │                                                  │
  │         ▼                                                  │
  │    ┌──────────┐      ┌──────────┐                          │
  │    │  壁橱    │ ───▶ │  抽屉    │                          │
  │    └──────────┘      └──────────┘                          │
  └─────────┼──────────────────────────────────────────────────┘
            │
          隧道
            │
  ┌─────────┼──────────────────────────────────────────────────┐
  │  翼：项目                                                   │
  │         │                                                  │
  │    ┌────┴─────┐  ──厅──  ┌──────────┐                      │
  │    │  房间 A  │            │  房间 C  │                      │
  │    └────┬─────┘            └──────────┘                      │
  │         │                                                  │
  │         ▼                                                  │
  │    ┌──────────┐      ┌──────────┐                          │
  │    │  壁橱    │ ───▶ │  抽屉    │                          │
  │    └──────────┘      └──────────┘                          │
  └─────────────────────────────────────────────────────────────┘
```

**翼** —— 一个人或一个项目。你需要多少就有多少。
**房间** —— 翼内的特定主题。认证、计费、部署 —— 无限房间。
**厅** —— 同一翼内相关房间之间的连接。如果房间 A（认证）和房间 B（安全）相关，一个厅连接它们。
**隧道** —— 不同翼之间的连接。当人物 A 和某个项目都有一个关于“认证”的房间时，隧道会自动交叉引用它们。
**壁橱** —— 指向原始内容的摘要。（在 v3.0.0 中，这些是纯文本摘要；AAAK 编码的壁橱将在未来更新中提供 —— 参见[任务 #30](https://github.com/milla-jovovich/mempalace/issues/30)。）
**抽屉** —— 原始的逐字文件。确切的词语，永不摘要。

**厅** 是记忆类型 —— 每个翼中相同，充当走廊：
- `hall_facts` —— 做出的决定，敲定的选择
- `hall_events` —— 会话、里程碑、调试
- `hall_discoveries` —— 突破、新见解
- `hall_preferences` —— 习惯、喜好、观点
- `hall_advice` —— 建议和解决方案

**房间** 是命名的观点 —— `auth-migration`、`graphql-switch`、`ci-pipeline`。当同一个房间出现在不同的翼中时，它创建了一个 **隧道** —— 连接跨领域的相同主题：

```
wing_kai       / hall_events / auth-migration  → "Kai 调试了 OAuth token 刷新"
wing_driftwood / hall_facts  / auth-migration  → "团队决定将认证迁移到 Clerk"
wing_priya     / hall_advice / auth-migration  → "Priya 批准使用 Clerk 而非 Auth0"
```

相同的房间。三个翼。隧道连接它们。

### 为什么结构重要

在超过 22,000 条真实对话记忆上测试：

```
搜索所有壁橱：          60.9%  R@10
在翼内搜索：          73.1%  (+12%)
搜索翼 + 厅：          84.8%  (+24%)
搜索翼 + 房间：        94.8%  (+34%)
```

翼和房间不是装饰。它们是 **34% 的检索提升**。宫殿结构就是产品。

### 记忆栈

| 层 | 内容 | 大小 | 何时 |
|-------|------|------|------|
| **L0** | 身份 —— 这个 AI 是谁？ | ~50 token | 始终加载 |
| **L1** | 关键事实 —— 团队、项目、偏好 | ~120 token (AAAK) | 始终加载 |
| **L2** | 房间召回 —— 最近的会话、当前项目 | 按需 | 当话题出现时 |
| **L3** | 深度搜索 —— 跨所有壁橱的语义查询 | 按需 | 当明确询问时 |

你的 AI 醒来时带有 L0 + L1（~170 token），了解你的世界。只在需要时触发搜索。

### AAAK 方言（实验性）

AAAK 是一种有损缩写系统 —— 实体代码、结构标记和句子截断 —— 旨在将重复的实体和关系在大规模下打包到更少的 token 中。任何能阅读文本的 LLM（Claude、GPT、Gemini、Llama、Mistral）都能**读懂**它，无需解码器，因此本地模型可以在不依赖任何云端的情况下使用它。

**诚实状态（2026年4月）：**

- **AAAK 是有损的，不是无损的。** 它使用基于正则表达式的缩写，不是可逆压缩。
- **在小规模下不节省 token。** 短文本已经能高效地 token 化。在几个句子上，AAAK 的开销（代码、分隔符）比节省的 token 还要多。
- **在大规模下可以节省 token** —— 在有许多重复实体的场景中（一个团队被提及数百次，同一个项目跨越数千个会话），实体代码可以摊销成本。
- **AAAK 目前在 LongMemEval 上相对于原始逐字检索有退化**（84.2% R@5 vs 96.6%）。96.6% 的标题数字来自**原始模式**，而非 AAAK 模式。
- **MemPalace 的存储默认是 ChromaDB 中的原始逐字文本** —— 基准测试的胜利来自那里。AAAK 是一个用于上下文加载的独立压缩层，不是存储格式。

我们正在迭代方言规范，添加真实的分词器进行统计，并探索更好的使用阈值。跟踪进度请见 [Issue #43](https://github.com/milla-jovovich/mempalace/issues/43) 和 [#27](https://github.com/milla-jovovich/mempalace/issues/27)。

### 矛盾检测（实验性，尚未接入知识图谱）

一个独立工具（`fact_checker.py`）可以检查断言与实体事实的一致性。目前不会被知识图谱操作自动调用 —— 这个问题正在修复（跟踪 [Issue #27](https://github.com/milla-jovovich/mempalace/issues/27)）。启用后，它可以捕获如下情况：

```
输入：  "Soren 完成了认证迁移"
输出： 🔴 AUTH-MIGRATION: 责任冲突 —— 分配给了 Maya，不是 Soren

输入：  "Kai 已经在这里 2 年了"
输出： 🟡 KAI: tenure 错误 —— 记录显示 3 年（始于 2023-04）

输入：  "冲刺在周五结束"
输出： 🟡 SPRINT: 日期过时 —— 当前冲刺在周四结束（2 天前更新）
```

事实与知识图谱进行核对。年龄、日期和工作年限动态计算 —— 非硬编码。

---

## 真实世界示例

### 跨多个项目的独立开发者

```bash
# 挖掘每个项目的对话
mempalace mine ~/chats/orion/  --mode convos --wing orion
mempalace mine ~/chats/nova/   --mode convos --wing nova
mempalace mine ~/chats/helios/ --mode convos --wing helios

# 六个月后："为什么我在这里用了 Postgres？"
mempalace search "数据库决策" --wing orion
# → "选择 Postgres 而非 SQLite，因为 Orion 需要并发写入，且数据集将超过 10GB。决策于 2025-11-03。"

# 跨项目搜索
mempalace search "限流方案"
# → 找到你在 Orion 和 Nova 中的方案，并显示差异
```

### 管理产品的团队负责人

```bash
# 挖掘 Slack 导出和 AI 对话
mempalace mine ~/exports/slack/ --mode convos --wing driftwood
mempalace mine ~/.claude/projects/ --mode convos

# "Soren 上个冲刺做了什么？"
mempalace search "Soren 冲刺" --wing driftwood
# → 14 个壁橱：OAuth 重构、深色模式、组件库迁移

# "谁决定使用 Clerk？"
mempalace search "Clerk 决策" --wing driftwood
# → "Kai 推荐 Clerk 而非 Auth0 —— 定价 + 开发者体验。团队于 2026-01-15 同意。Maya 负责迁移。"
```

### 挖掘前：拆分超大文件

某些对话导出会将多个会话串联成一个巨大的文件：

```bash
mempalace split ~/chats/                      # 拆分为每个会话的文件
mempalace split ~/chats/ --dry-run            # 预览
mempalace split ~/chats/ --min-sessions 3     # 只拆分包含 3 个以上会话的文件
```

---

## 知识图谱

时间化的实体-关系三元组 —— 类似于 Zep 的 Graphiti，但使用 SQLite 而非 Neo4j。本地且免费。

```python
from mempalace.knowledge_graph import KnowledgeGraph

kg = KnowledgeGraph()
kg.add_triple("Kai", "works_on", "Orion", valid_from="2025-06-01")
kg.add_triple("Maya", "assigned_to", "auth-migration", valid_from="2026-01-15")
kg.add_triple("Maya", "completed", "auth-migration", valid_from="2026-02-01")

# Kai 在做什么？
kg.query_entity("Kai")
# → [Kai → works_on → Orion (当前), Kai → recommended → Clerk (2026-01)]

# 一月份时的情况？
kg.query_entity("Maya", as_of="2026-01-20")
# → [Maya → assigned_to → auth-migration (活跃)]

# 时间线
kg.timeline("Orion")
# → 项目的按时间顺序的故事
```

事实具有有效性窗口。当某事不再为真时，使其失效：

```python
kg.invalidate("Kai", "works_on", "Orion", ended="2026-03-01")
```

现在查询 Kai 的当前工作将不会返回 Orion。历史查询仍然会返回。

| 特性 | MemPalace | Zep (Graphiti) |
|---------|-----------|----------------|
| 存储 | SQLite（本地） | Neo4j（云端） |
| 成本 | 免费 | $25/月起 |
| 时间有效性 | 是 | 是 |
| 自托管 | 总是 | 仅企业版 |
| 隐私 | 一切本地 | SOC 2, HIPAA |

---

## 专家智能体

创建专注于特定领域的智能体。每个智能体在宫殿中获得自己的翼和日记 —— 不在你的 CLAUDE.md 中。添加 50 个智能体，你的配置大小保持不变。

```
~/.mempalace/agents/
  ├── reviewer.json       # 代码质量、模式、bug
  ├── architect.json      # 设计决策、权衡
  └── ops.json            # 部署、事故、基础设施
```

你的 CLAUDE.md 只需一行：

```
你有 MemPalace 智能体。运行 mempalace_list_agents 查看它们。
```

AI 在运行时从宫殿中发现其智能体。每个智能体：

- **有一个焦点** —— 它关注什么
- **保持日记** —— 用 AAAK 书写，跨会话持久化
- **积累专长** —— 阅读自己的历史以在其领域保持敏锐

```
# 智能体在代码审查后写入日记
mempalace_diary_write("reviewer",
    "PR#42|auth.bypass.found|missing.middleware.check|pattern:3rd.time.this.quarter|★★★★")

# 智能体读取自己的历史
mempalace_diary_read("reviewer", last_n=10)
# → 最近的 10 个发现，以 AAAK 压缩
```

每个智能体都是你数据上的一个专家透镜。评审者记住它见过的每个 bug 模式。架构师记住每个设计决策。运维智能体记住每个事故。它们不共享同一个便签本 —— 每个都维护自己的记忆。

Letta 为智能体管理的记忆收费 $20–200/月。MemPalace 用一个翼就做到了。

---

## MCP 服务器

```bash
# 通过插件（推荐）
claude plugin marketplace add milla-jovovich/mempalace
claude plugin install --scope user mempalace

# 或手动
claude mcp add mempalace -- python -m mempalace.mcp_server
```

### 19 个工具

**宫殿（读取）**

| 工具 | 功能 |
|------|------|
| `mempalace_status` | 宫殿概览 + AAAK 规范 + 记忆协议 |
| `mempalace_list_wings` | 列出翼及其计数 |
| `mempalace_list_rooms` | 列出翼内的房间 |
| `mempalace_get_taxonomy` | 完整的翼 → 房间 → 计数树 |
| `mempalace_search` | 带翼/房间过滤的语义搜索 |
| `mempalace_check_duplicate` | 归档前检查重复 |
| `mempalace_get_aaak_spec` | AAAK 方言参考 |

**宫殿（写入）**

| 工具 | 功能 |
|------|------|
| `mempalace_add_drawer` | 归档逐字内容 |
| `mempalace_delete_drawer` | 按 ID 删除 |

**知识图谱**

| 工具 | 功能 |
|------|------|
| `mempalace_kg_query` | 带时间过滤的实体关系 |
| `mempalace_kg_add` | 添加事实 |
| `mempalace_kg_invalidate` | 标记事实为已结束 |
| `mempalace_kg_timeline` | 实体的时间顺序故事 |
| `mempalace_kg_stats` | 图谱概览 |

**导航**

| 工具 | 功能 |
|------|------|
| `mempalace_traverse` | 从房间跨翼遍历图谱 |
| `mempalace_find_tunnels` | 查找连接两个翼的房间 |
| `mempalace_graph_stats` | 图谱连通性概览 |

**智能体日记**

| 工具 | 功能 |
|------|------|
| `mempalace_diary_write` | 写入 AAAK 日记条目 |
| `mempalace_diary_read` | 读取最近的日记条目 |

AI 从 `mempalace_status` 响应中自动学习 AAAK 和记忆协议。无需手动配置。

---

## 自动保存钩子

为 Claude Code 提供的两个钩子，可在工作期间自动保存记忆：

**保存钩子** —— 每 15 条消息触发一次结构化保存。主题、决策、引用、代码变更。同时重新生成关键事实层。

**预压缩钩子** —— 在上下文压缩前触发。在窗口缩小前紧急保存。

```json
{
  "hooks": {
    "Stop": [{"matcher": "", "hooks": [{"type": "command", "command": "/path/to/mempalace/hooks/mempal_save_hook.sh"}]}],
    "PreCompact": [{"matcher": "", "hooks": [{"type": "command", "command": "/path/to/mempalace/hooks/mempal_precompact_hook.sh"}]}]
  }
}
```

**可选自动摄取：** 设置 `MEMPAL_DIR` 环境变量为一个目录路径，钩子将在每次保存触发时自动对该目录运行 `mempalace mine`（stop 时后台运行，precompact 时同步运行）。

---

## 基准测试

在标准学术基准上测试 —— 可复现、已发布的数据集。

| 基准 | 模式 | 分数 | API 调用 |
|-----------|------|-------|-----------|
| **LongMemEval R@5** | 原始（仅 ChromaDB） | **96.6%** | 零 |
| **LongMemEval R@5** | 混合 + Haiku 重排 | **100%** (500/500) | ~500 |
| **LoCoMo R@10** | 原始，会话级别 | **60.3%** | 零 |
| **个人宫殿 R@10** | 启发式基准 | **85%** | 零 |
| **宫殿结构影响** | 翼+房间过滤 | **+34%** R@10 | 零 |

96.6% 的原始分数是已发布的 LongMemEval 结果中最高分，且不需要任何 API 密钥、云端或在任何阶段使用 LLM。

### 与已发布系统的比较

| 系统 | LongMemEval R@5 | 需要 API | 成本 |
|--------|----------------|--------------|------|
| **MemPalace（混合）** | **100%** | 可选 | 免费 |
| Supermemory ASMR | ~99% | 是 | — |
| **MemPalace（原始）** | **96.6%** | **无** | **免费** |
| Mastra | 94.87% | 是（GPT） | API 成本 |
| Mem0 | ~85% | 是 | $19–249/月 |
| Zep | ~85% | 是 | $25/月起 |

---

## 全部命令

```bash
# 设置
mempalace init <dir>                              # 引导式 onboarding + AAAK 引导

# 挖掘
mempalace mine <dir>                              # 挖掘项目文件
mempalace mine <dir> --mode convos                # 挖掘对话导出
mempalace mine <dir> --mode convos --wing myapp   # 用翼名称标记

# 拆分
mempalace split <dir>                             # 拆分串联的对话记录
mempalace split <dir> --dry-run                   # 预览

# 搜索
mempalace search "查询"                           # 搜索所有
mempalace search "查询" --wing myapp              # 在翼内搜索
mempalace search "查询" --room auth-migration     # 在房间内搜索

# 记忆栈
mempalace wake-up                                 # 加载 L0 + L1 上下文
mempalace wake-up --wing driftwood                # 特定项目

# 压缩
mempalace compress --wing myapp                   # AAAK 压缩

# 状态
mempalace status                                  # 宫殿概览
```

所有命令都接受 `--palace <路径>` 来覆盖默认位置。

---

## 配置

### 全局配置（`~/.mempalace/config.json`）

```json
{
  "palace_path": "/自定义/路径/到/palace",
  "collection_name": "mempalace_drawers",
  "people_map": {"Kai": "KAI", "Priya": "PRI"}
}
```

### 翼配置（`~/.mempalace/wing_config.json`）

由 `mempalace init` 生成。将你的人物和项目映射到翼：

```json
{
  "default_wing": "wing_general",
  "wings": {
    "wing_kai": {"type": "person", "keywords": ["kai", "kai's"]},
    "wing_driftwood": {"type": "project", "keywords": ["driftwood", "analytics", "saas"]}
  }
}
```

### 身份配置（`~/.mempalace/identity.txt`）

纯文本。成为第 0 层 —— 每次会话加载。

---

## 文件参考

| 文件 | 功能 |
|------|------|
| `cli.py` | CLI 入口点 |
| `config.py` | 配置加载和默认值 |
| `normalize.py` | 将 5 种聊天格式转换为标准记录 |
| `mcp_server.py` | MCP 服务器 —— 19 个工具、AAAK 自动教学、记忆协议 |
| `miner.py` | 项目文件摄取 |
| `convo_miner.py` | 对话摄取 —— 按对话对分块 |
| `searcher.py` | 通过 ChromaDB 进行语义搜索 |
| `layers.py` | 4 层记忆栈 |
| `dialect.py` | AAAK 压缩 —— 30 倍无损 |
| `knowledge_graph.py` | 时间化实体-关系图谱（SQLite） |
| `palace_graph.py` | 基于房间的导航图谱 |
| `onboarding.py` | 引导式设置 —— 生成 AAAK 引导 + 翼配置 |
| `entity_registry.py` | 实体代码注册表 |
| `entity_detector.py` | 从内容中自动检测人物和项目 |
| `split_mega_files.py` | 将串联的对话记录拆分为每个会话的文件 |
| `hooks/mempal_save_hook.sh` | 每 N 条消息自动保存 |
| `hooks/mempal_precompact_hook.sh` | 压缩前紧急保存 |

---

## 项目结构

```
mempalace/
├── README.md                  ← 你在这里
├── mempalace/                 ← 核心包（README）
│   ├── cli.py                 ← CLI 入口点
│   ├── mcp_server.py          ← MCP 服务器（19 个工具）
│   ├── knowledge_graph.py     ← 时间化实体图谱
│   ├── palace_graph.py        ← 房间导航图谱
│   ├── dialect.py             ← AAAK 压缩
│   ├── miner.py               ← 项目文件摄取
│   ├── convo_miner.py         ← 对话摄取
│   ├── searcher.py            ← 语义搜索
│   ├── onboarding.py          ← 引导式设置
│   └── ...                    ← 详见 mempalace/README.md
├── benchmarks/                ← 可复现的基准运行器
│   ├── README.md              ← 复现指南
│   ├── BENCHMARKS.md          ← 完整结果 + 方法
│   ├── longmemeval_bench.py   ← LongMemEval 运行器
│   ├── locomo_bench.py        ← LoCoMo 运行器
│   └── membench_bench.py      ← MemBench 运行器
├── hooks/                     ← Claude Code 自动保存钩子
│   ├── README.md              ← 钩子设置指南
│   ├── mempal_save_hook.sh    ← 每 N 条消息保存
│   └── mempal_precompact_hook.sh ← 紧急保存
├── examples/                  ← 使用示例
│   ├── basic_mining.py
│   ├── convo_import.py
│   └── mcp_setup.md
├── tests/                     ← 测试套件（README）
├── assets/                    ← logo + 品牌资源
└── pyproject.toml             ← 包配置（v3.0.0）
```

---

## 系统要求

- Python 3.9+
- `chromadb>=0.4.0`
- `pyyaml>=6.0`

不需要 API 密钥。安装后不需要互联网。一切本地运行。

```bash
pip install mempalace
```

---

## 贡献

欢迎 PR。请参阅 [CONTRIBUTING.md](CONTRIBUTING.md) 了解设置和指南。

## 许可证

MIT —— 参见 [LICENSE](LICENSE)。

<!-- 链接定义 -->
[version-shield]: https://img.shields.io/badge/version-3.0.0-4dc9f6?style=flat-square&labelColor=0a0e14
[release-link]: https://github.com/milla-jovovich/mempalace/releases
[python-shield]: https://img.shields.io/badge/python-3.9+-7dd8f8?style=flat-square&labelColor=0a0e14&logo=python&logoColor=7dd8f8
[python-link]: https://www.python.org/
[license-shield]: https://img.shields.io/badge/license-MIT-b0e8ff?style=flat-square&labelColor=0a0e14
[license-link]: https://github.com/milla-jovovich/mempalace/blob/main/LICENSE
[discord-shield]: https://img.shields.io/badge/discord-join-5865F2?style=flat-square&labelColor=0a0e14&logo=discord&logoColor=5865F2
[discord-link]: https://discord.com/invite/ycTQQCu6kn
```

如果你需要我针对某个部分做进一步调整（比如术语统一、风格微调），或者单独输出纯文本版本，请告诉我。


# 参考资料

* any list
{:toc}
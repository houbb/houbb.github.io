---
layout: post 
title:  SimpleMem 高效的 LLM 智能体终身记忆系统 — Text & Multimodal
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---


<div align="center">

<img alt="simplemem_logo" src="https://github.com/user-attachments/assets/6ea54ad1-e007-442c-99d7-1174b10d1fec" width="450">

<div align="center">

## 高效的 LLM 智能体终身记忆系统 — Text & Multimodal

<small>通过语义无损压缩实现长期记忆的存储、压缩和检索。支持 Claude、Cursor、LM Studio 等多种平台。</small>

</div>

<p><b>兼容任何支持 MCP 或 Python 集成的 AI 平台</b></p>

<table>
<tr>

<td align="center" width="100">
  <a href="https://www.anthropic.com/claude">
    <img src="https://cdn.simpleicons.org/claude/D97757" width="48" height="48" alt="Claude Desktop" />
  </a><br/>
  <sub>
    <a href="https://www.anthropic.com/claude"><b>Claude Desktop</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://cursor.com">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/cursor/FFFFFF">
      <img src="https://cdn.simpleicons.org/cursor/000000" width="48" height="48" alt="Cursor" />
    </picture>
  </a><br/>
  <sub>
    <a href="https://cursor.com"><b>Cursor</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://lmstudio.ai">
    <img src="https://github.com/lmstudio-ai.png?size=200" width="48" height="48" alt="LM Studio" />
  </a><br/>
  <sub>
    <a href="https://lmstudio.ai"><b>LM Studio</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://cherry-ai.com">
    <img src="https://github.com/CherryHQ.png?size=200" width="48" height="48" alt="Cherry Studio" />
  </a><br/>
  <sub>
    <a href="https://cherry-ai.com"><b>Cherry Studio</b></a>
  </sub>
</td>

<td align="center" width="100">
  <a href="https://pypi.org/project/simplemem/">
    <img src="https://cdn.simpleicons.org/pypi/3775A9" width="48" height="48" alt="PyPI" />
  </a><br/>
  <sub>
    <a href="https://pypi.org/project/simplemem/"><b>PyPI 包</b></a>
  </sub>
</td>

<td align="center" width="100">
  <sub><b>+ 任何 MCP<br/>客户端</b></sub>
</td>

</tr>
</table>

<div align="center">

<br/>

[🇨🇳 **中文**](./README.zh-CN.md) •
[🇯🇵 日本語](./README.ja.md) •
[🇰🇷 한국어](./README.ko.md) •
[🇪🇸 Español](./README.es.md) •
[🇫🇷 Français](./README.fr.md) •
[🇩🇪 Deutsch](./README.de.md) •
[🇧🇷 Português](./README.pt-br.md)<br/>
[🇷🇺 Русский](./README.ru.md) •
[🇸🇦 العربية](./README.ar.md) •
[🇮🇹 Italiano](./README.it.md) •
[🇻🇳 Tiếng Việt](./README.vi.md) •
[🇹🇷 Türkçe](./README.tr.md)

<br/>

[![Project Page](https://img.shields.io/badge/🎬_互动演示-访问官网-FF6B6B?style=for-the-badge&labelColor=FF6B6B&color=4ECDC4&logoColor=white)](https://aiming-lab.github.io/SimpleMem-Page)

<p align="center">
  <a href="https://arxiv.org/abs/2601.02553"><img src="https://img.shields.io/badge/arXiv-2601.02553-b31b1b?style=flat&labelColor=555" alt="arXiv"></a>
  <a href="https://github.com/aiming-lab/SimpleMem"><img src="https://img.shields.io/badge/github-SimpleMem-181717?style=flat&labelColor=555&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/aiming-lab/SimpleMem?style=flat&label=license&labelColor=555&color=2EA44F" alt="License"></a>
  <a href="https://github.com/aiming-lab/SimpleMem/pulls"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat&labelColor=555" alt="PRs Welcome"></a>
  <br/>
  <a href="https://pypi.org/project/simplemem/"><img src="https://img.shields.io/pypi/v/simplemem?style=flat&label=pypi&labelColor=555&color=3775A9&logo=pypi&logoColor=white" alt="PyPI"></a>
  <a href="https://pypi.org/project/simplemem/"><img src="https://img.shields.io/pypi/pyversions/simplemem?style=flat&label=python&labelColor=555&color=3775A9&logo=python&logoColor=white" alt="Python"></a>
  <a href="https://mcp.simplemem.cloud"><img src="https://img.shields.io/badge/MCP-mcp.simplemem.cloud-14B8A6?style=flat&labelColor=555" alt="MCP Server"></a>
  <a href="https://github.com/aiming-lab/SimpleMem"><img src="https://img.shields.io/badge/Claude_Skills-supported-FFB000?style=flat&labelColor=555" alt="Claude Skills"></a>
  <br/>
  <a href="https://discord.gg/KA2zC32M"><img src="https://img.shields.io/badge/Discord-加入聊天-5865F2?style=flat&labelColor=555&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="../../fig/wechat_logo3.JPG"><img src="https://img.shields.io/badge/微信-交流群-07C160?style=flat&labelColor=555&logo=wechat&logoColor=white" alt="WeChat"></a>
</p>

<br/>

[概述](#-概述) • [快速开始](#-快速开始) • [MCP 服务器](#-mcp-服务器) • [评测](#-评测) • [引用](#-引用)

</div>

</div>

<br/>

## 🔥 最新动态

- **[02/09/2026]** 🚀 **跨对话记忆功能上线 - 性能超越 Claude-Mem 64%！** SimpleMem 现已支持**跨对话的持久化记忆**。在 LoCoMo 基准测试中，SimpleMem 相比 Claude-Mem 实现了 **64% 的性能提升**。您的 Agent 现在可以自动回忆之前对话中的上下文、决策和学习成果。[查看跨对话记忆文档 →](../../cross/README.md)
- **[01/20/2026]** **SimpleMem 已上线 PyPI！** 📦 可直接通过 `pip install simplemem` 安装。[查看包使用指南 →](../PACKAGE_USAGE.md)
- **[01/19/2026]** **SimpleMem Skill 新增本地记忆存储功能！** 💾 现已支持在 Claude Skills 中进行本地记忆存储与管理。
- **[01/18/2026]** **SimpleMem 现已支持 Claude Skills！** 🚀 在 claude.ai 中使用 SimpleMem 实现跨会话长期记忆。前往 [mcp.simplemem.cloud](https://mcp.simplemem.cloud) 注册，配置令牌后导入技能即可使用！
- **[01/14/2026]** **SimpleMem MCP 服务器正式上线并开源！** 🎉 云端记忆服务已部署至 [mcp.simplemem.cloud](https://mcp.simplemem.cloud)。支持 LM Studio、Cherry Studio、Cursor、Claude Desktop，通过 **Streamable HTTP** MCP 协议集成。[查看 MCP 文档 →](../../MCP/README.md)
- **[01/08/2026]** 🔥 欢迎加入我们的 [Discord](https://discord.gg/KA2zC32M) 和[微信交流群](../../fig/wechat_logo3.JPG)，一起协作交流！
- **[01/05/2026]** SimpleMem 论文已在 [arXiv](https://arxiv.org/abs/2601.02553) 发布！

---

## 📑 目录

- [🌟 概述](#-概述)
- [🎯 主要贡献](#-主要贡献)
- [🚀 性能亮点](#-性能亮点)
- [📦 安装](#-安装)
- [⚡ 快速开始](#-快速开始)
- [🔌 MCP 服务器](#-mcp-服务器)
- [📊 评测](#-评测)
- [📝 引用](#-引用)
- [📄 许可证](#-许可证)
- [🙏 致谢](#-致谢)

---

## 🌟 概述

<div align="center">
<img src="../../fig/Fig_tradeoff.png" alt="性能与效率权衡" width="900"/>

*SimpleMem 以最少的 token 开销（约 550）实现了最优的 F1 分数（43.24%），占据理想的左上方位置。*
</div>

**SimpleMem** 是一个基于**语义无损压缩**的高效记忆框架，旨在解决 **LLM 智能体高效长期记忆**这一核心挑战。与现有系统被动积累冗余上下文或依赖昂贵迭代推理循环不同，SimpleMem 通过三阶段流水线最大化**信息密度**和 **token 利用率**：

<table>
<tr>
<td width="33%" align="center">

### 🔍 阶段 1
**语义结构化压缩**

将非结构化交互蒸馏为紧凑的多视角索引记忆单元

</td>
<td width="33%" align="center">

### 🗂️ 阶段 2
**在线语义合成**

会话内过程，即时整合相关上下文为统一的抽象表示，消除冗余

</td>
<td width="33%" align="center">

### 🎯 阶段 3
**意图感知检索规划**

推断搜索意图，动态确定检索范围，高效构建精确上下文

</td>
</tr>
</table>

<div align="center">
<img src="../../fig/Fig_framework.png" alt="SimpleMem 框架" width="900"/>

*SimpleMem 架构：(1) 语义结构化压缩过滤低效对话，将信息窗口转换为紧凑、上下文无关的记忆单元。(2) 在线语义合成在写入阶段整合相关片段，维护紧凑连贯的记忆拓扑。(3) 意图感知检索规划推断搜索意图以调整检索范围和查询形式，实现并行多视角检索和高效 token 上下文构建。*
</div>

---

### 🏆 性能对比

<div align="center">

**速度对比演示**

<video src="https://github.com/aiming-lab/SimpleMem/raw/main/fig/simplemem-new.mp4" controls width="900"></video>

*SimpleMem 与基线方法：实时速度对比演示*

</div>

<div align="center">

**LoCoMo-10 基准测试结果（GPT-4.1-mini）**

| 模型 | ⏱️ 构建时间 | 🔎 检索时间 | ⚡ 总时间 | 🎯 平均 F1 |
|:------|:--------------------:|:-----------------:|:-------------:|:-------------:|
| A-Mem | 5140.5s | 796.7s | 5937.2s | 32.58% |
| LightMem | 97.8s | 577.1s | 675.9s | 24.63% |
| Mem0 | 1350.9s | 583.4s | 1934.3s | 34.20% |
| **SimpleMem** ⭐ | **92.6s** | **388.3s** | **480.9s** | **43.24%** |

</div>

> **💡 核心优势：**
> - 🏆 **最高 F1 分数**：43.24%（比 Mem0 高 26.4%，比 LightMem 高 75.6%）
> - ⚡ **最快检索速度**：388.3s（比 LightMem 快 32.7%，比 Mem0 快 51.3%）
> - 🚀 **最快端到端处理**：总处理时间 480.9s（比 A-Mem 快 12.5 倍）

---

## 🎯 主要贡献

### 1️⃣ 语义结构化压缩

SimpleMem 在 LLM 生成过程中集成了**隐式语义密度门控**机制，过滤冗余交互内容。系统将原始对话流重新组织为**紧凑的记忆单元**——带有已消解指代和绝对时间戳的独立事实。每个单元通过三种互补表示进行索引，支持灵活检索：

<div align="center">

| 🔍 层级 | 📊 类型 | 🎯 用途 | 🛠️ 实现 |
|---------|---------|------------|-------------------|
| **语义** | 稠密 | 概念相似性 | 向量嵌入（1024 维） |
| **词汇** | 稀疏 | 精确词项匹配 | BM25 风格关键词索引 |
| **符号** | 元数据 | 结构化过滤 | 时间戳、实体、人物 |

</div>

**✨ 转换示例：**
```diff
- 输入：  "他明天下午2点和Bob见面"  [❌ 相对的、模糊的]
+ 输出： "Alice将于2025-11-16T14:00:00在星巴克与Bob见面"  [✅ 绝对的、原子的]
```

---

### 2️⃣ 在线语义合成

与依赖异步后台维护的传统系统不同，SimpleMem 在**写入阶段即时执行合成**。在当前会话范围内，相关记忆单元被合成为更高级的抽象表示，使重复或结构相似的经验能够**立即被去噪和压缩**。

**✨ 合成示例：**
```diff
- 片段 1: "用户想喝咖啡"
- 片段 2: "用户偏好燕麦奶"
- 片段 3: "用户喜欢热饮"
+ 整合后: "用户偏好加燕麦奶的热咖啡"
```

这种主动合成确保记忆拓扑保持紧凑，避免冗余碎片化。

---

### 3️⃣ 意图感知检索规划

与固定深度检索不同，SimpleMem 利用 LLM 的推理能力生成**全面的检索计划**。给定查询后，规划模块推断**潜在搜索意图**，动态确定检索范围和深度：

$$\{ q_{\text{sem}}, q_{\text{lex}}, q_{\text{sym}}, d \} \sim \mathcal{P}(q, H)$$

系统随后在语义、词汇和符号索引上执行**并行多视角检索**，并通过基于 ID 的去重合并结果：

<table>
<tr>
<td width="50%">

**🔹 简单查询**
- 通过单个记忆单元直接查找事实
- 最小检索深度
- 快速响应

</td>
<td width="50%">

**🔸 复杂查询**
- 跨多个事件聚合
- 扩展检索深度
- 全面覆盖

</td>
</tr>
</table>

**📈 结果**：以比全上下文方法少 **30 倍的 token** 达到 43.24% 的 F1 分数。

---

## 🚀 性能亮点

### 📊 基准测试结果（LoCoMo）

<details>
<summary><b>🔬 高性能模型（GPT-4.1-mini）</b></summary>

| 任务类型 | SimpleMem F1 | Mem0 F1 | 提升 |
|:----------|:------------:|:-------:|:-----------:|
| **多跳** | 43.46% | 30.14% | **+43.8%** |
| **时序** | 58.62% | 48.91% | **+19.9%** |
| **单跳** | 51.12% | 41.3% | **+23.8%** |

</details>

<details>
<summary><b>⚙️ 高效模型（Qwen2.5-1.5B）</b></summary>

| 指标 | SimpleMem | Mem0 | 备注 |
|:-------|:---------:|:----:|:------|
| **平均 F1** | 25.23% | 23.77% | 使用小 99 倍的模型仍具竞争力 |

</details>

---

## 📦 安装

### 📝 初次使用须知

- 确保**活动环境中使用的是 Python 3.10**，而非仅全局安装。
- 运行任何记忆构建或检索之前，必须先配置 OpenAI 兼容的 API 密钥，否则初始化可能失败。
- 使用非 OpenAI 提供商（如 Qwen 或 Azure OpenAI）时，请验证 `config.py` 中的模型名称和 `OPENAI_BASE_URL`。
- 对于大型对话数据集，启用并行处理可显著减少记忆构建时间。

### 📋 环境要求

- 🐍 Python 3.10
- 🔑 OpenAI 兼容 API（OpenAI、Qwen、Azure OpenAI 等）

### 🛠️ 安装步骤

```bash
# 📥 克隆仓库
git clone https://github.com/aiming-lab/SimpleMem.git
cd SimpleMem

# 📦 安装依赖
pip install -r requirements.txt

# ⚙️ 配置 API 设置
cp config.py.example config.py
# 编辑 config.py，填入你的 API 密钥和偏好设置
```

### ⚙️ 配置示例

```python
# config.py
OPENAI_API_KEY = "your-api-key"
OPENAI_BASE_URL = None  # 或 Qwen/Azure 的自定义端点

LLM_MODEL = "gpt-4.1-mini"
EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-0.6B"  # 最先进的检索模型
```

---

## ⚡ 快速开始

### 🧠 理解基本工作流

从宏观层面来看，SimpleMem 是 LLM 智能体的长期记忆系统。工作流程包含三个简单步骤：

1. **存储信息** – 对话或事实经处理后转换为结构化的原子记忆。
2. **索引记忆** – 使用语义嵌入和结构化元数据组织已存储的记忆。
3. **检索相关记忆** – 查询时，SimpleMem 基于语义（而非关键词）检索最相关的存储信息。

这种设计使 LLM 智能体能够维护上下文、高效回忆过往信息，并避免重复处理冗余历史。

### 🎓 基本用法

```python
from main import SimpleMemSystem

# 🚀 初始化系统
system = SimpleMemSystem(clear_db=True)

# 💬 添加对话（阶段 1：语义结构化压缩）
system.add_dialogue("Alice", "Bob，我们明天下午2点在星巴克见面吧", "2025-11-15T14:30:00")
system.add_dialogue("Bob", "好的，我会带上市场分析报告", "2025-11-15T14:31:00")

# ✅ 完成原子编码
system.finalize()

# 🔎 意图感知检索查询（阶段 3：意图感知检索规划）
answer = system.ask("Alice 和 Bob 什么时候在哪里见面？")
print(answer)
# 输出: "2025年11月16日下午2:00在星巴克"
```

---

### 🚄 进阶：并行处理

对于大规模对话处理，启用并行模式：

```python
system = SimpleMemSystem(
    clear_db=True,
    enable_parallel_processing=True,  # ⚡ 并行记忆构建
    max_parallel_workers=8,
    enable_parallel_retrieval=True,   # 🔍 并行查询执行
    max_retrieval_workers=4
)
```

> **💡 小贴士**：并行处理可显著降低批量操作的延迟！

---

## ❓ 常见问题与故障排查

在首次安装或运行 SimpleMem 时遇到问题，请检查以下常见情况：

### 1️⃣ API 密钥未检测到
- 确保 `config.py` 中正确设置了 API 密钥
- 使用 OpenAI 兼容提供商（Qwen、Azure 等）时，验证 `OPENAI_BASE_URL` 配置是否正确
- 更新密钥后重启 Python 环境

### 2️⃣ Python 版本不匹配
- SimpleMem 需要 **Python 3.10**
- 检查版本：
  ```bash
  python --version
  ```

---

---

<div align="center">

# 🧠 Omni-SimpleMem: Multimodal Memory

**NEW** — SimpleMem now handles text, image, audio & video.

</div>

<table>
<tr>
<td align="center" width="140">📈 <b>+411%</b><br><sub>LoCoMo F1</sub></td>
<td align="center" width="140">📈 <b>+214%</b><br><sub>Mem-Gallery F1</sub></td>
<td align="center" width="140">⚡ <b>5.81 q/s</b><br><sub>3.5x faster</sub></td>
<td align="center" width="140">🧠 <b>4 modalities</b><br><sub>Text · Image · Audio · Video</sub></td>
</tr>
</table>

> 📖 Full documentation: [**Omni-SimpleMem →**](../../OmniSimpleMem/)

---

## 🔌 MCP 服务器 *(text memory)*

SimpleMem 作为**云端记忆服务**，通过模型上下文协议（MCP）提供，支持与 Claude Desktop、Cursor 等 AI 助手无缝集成。

**🌐 云服务**：[mcp.simplemem.cloud](https://mcp.simplemem.cloud)

### 核心特性

| 特性 | 描述 |
|---------|-------------|
| **Streamable HTTP** | MCP 2025-03-26 协议，JSON-RPC 2.0 |
| **多租户隔离** | 基于令牌认证的用户级数据表 |
| **混合检索** | 语义搜索 + 关键词匹配 + 元数据过滤 |
| **生产级优化** | 集成 OpenRouter，响应更快 |

### 快速配置

```json
{
  "mcpServers": {
    "simplemem": {
      "url": "https://mcp.simplemem.cloud/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN"
      }
    }
  }
}
```

> 📖 详细的安装说明和自部署指南，请参阅 [MCP 文档](../../MCP/README.md)

---

---

## 🗺️ 路线图

- [ ] Omni cross-session memory
- [ ] Omni MCP server
- [ ] Omni Docker support
- [ ] Omni PyPI package
- [ ] Streaming ingestion
- [ ] Multi-agent memory sharing

---

## 📊 评测

### 🧪 运行基准测试

```bash
# 🎯 完整 LoCoMo 基准测试
python test_locomo10.py

# 📉 子集评测（5 个样本）
python test_locomo10.py --num-samples 5

# 💾 自定义输出文件
python test_locomo10.py --result-file my_results.json
```

---

### 🔬 复现论文结果

使用 `config.py` 中的精确配置：
- **🚀 高性能**：GPT-4.1-mini、Qwen3-Plus
- **⚙️ 高效率**：Qwen2.5-1.5B、Qwen2.5-3B
- **🔍 嵌入模型**：Qwen3-Embedding-0.6B（1024 维）

---

## 📝 引用

如果您在研究中使用了 SimpleMem，请引用：

```bibtex
@article{simplemem2025,
  title={SimpleMem: Efficient Lifelong Memory for LLM Agents},
  author={Liu, Jiaqi and Su, Yaofeng and Xia, Peng and Zhou, Yiyang and Han, Siwei and  Zheng, Zeyu and Xie, Cihang and Ding, Mingyu and Yao, Huaxiu},
  journal={arXiv preprint arXiv:2601.02553},
  year={2025},
  url={https://github.com/aiming-lab/SimpleMem}
}
```

---

## 📄 许可证

本项目采用 **MIT 许可证** - 详见 [LICENSE](../../LICENSE) 文件。

---

## 🙏 致谢

感谢以下项目和团队的贡献：

- 🔍 **嵌入模型**：[Qwen3-Embedding](https://github.com/QwenLM/Qwen) - 最先进的检索性能
- 🗄️ **向量数据库**：[LanceDB](https://lancedb.com/) - 高性能列式存储
- 📊 **基准测试**：[LoCoMo](https://github.com/snap-research/locomo) - 长上下文记忆评测框架


# 参考资料

* any list
{:toc}
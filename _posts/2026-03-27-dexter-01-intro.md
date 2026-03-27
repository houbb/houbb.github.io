---
layout: post
title: Dexter 是一个自主金融研究智能体，能够在工作过程中进行思考、规划和学习。它通过任务规划、自我反思以及实时市场数据来执行分析。可以将其理解为类似 Claude Code，但专门为金融研究打造。
date: 2026-03-27 21:01:55 +0800
categories: [AI]
tags: [ai, finance]
published: true
---

# Dexter 🤖

Dexter 是一个**自主金融研究智能体**，能够在工作过程中进行思考、规划和学习。它通过任务规划、自我反思以及实时市场数据来执行分析。可以将其理解为类似 Claude Code，但专门为金融研究打造。

---

## 目录

* 👋 概览
* ✅ 前置条件
* 💻 安装方式
* 🚀 运行方式
* 📊 评估方式
* 🐛 调试方式
* 📱 如何与 WhatsApp 一起使用
* 🤝 如何贡献
* 📄 许可证

---

## 👋 概览

Dexter 可以将复杂的金融问题转化为清晰的、逐步执行的研究计划。它使用实时市场数据运行这些任务，检查自身工作，并不断优化结果，直到得到一个有信心、数据支撑的答案。

**核心能力：**

* **智能任务规划**：自动将复杂查询拆解为结构化的研究步骤
* **自主执行**：选择并执行合适的工具来获取金融数据
* **自我验证**：检查自身结果并迭代，直到任务完成
* **实时金融数据**：可访问损益表、资产负债表和现金流量表
* **安全机制**：内置循环检测和步骤限制，防止无限执行

---

## ✅ 前置条件

* [Bun](https://bun.com) 运行时（v1.0 或更高版本）
* OpenAI API Key（获取地址：[https://platform.openai.com/api-keys）](https://platform.openai.com/api-keys）)
* Financial Datasets API Key（获取地址：[https://financialdatasets.ai）](https://financialdatasets.ai）)
* Exa API Key（获取地址：[https://exa.ai）（可选，用于网页搜索）](https://exa.ai）（可选，用于网页搜索）)

### 安装 Bun

如果尚未安装 Bun，可以使用 curl 进行安装：

**macOS / Linux：**

```bash
curl -fsSL https://bun.com/install | bash
```

**Windows：**

```bash
powershell -c "irm bun.sh/install.ps1|iex"
```

安装完成后，重启终端并验证：

```bash
bun --version
```

---

## 💻 安装方式

1. 克隆仓库：

```bash
git clone https://github.com/virattt/dexter.git
cd dexter
```

2. 使用 Bun 安装依赖：

```bash
bun install
```

3. 配置环境变量：

```bash
# 复制示例环境变量文件
cp env.example .env

# 编辑 .env 并添加 API Key（如果使用云服务）
# OPENAI_API_KEY=your-openai-api-key
# ANTHROPIC_API_KEY=your-anthropic-api-key（可选）
# GOOGLE_API_KEY=your-google-api-key（可选）
# XAI_API_KEY=your-xai-api-key（可选）
# OPENROUTER_API_KEY=your-openrouter-api-key（可选）

# 面向智能体的机构级市场数据；AAPL、NVDA、MSFT 免费
# FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key

# （可选）如果本地使用 Ollama
# OLLAMA_BASE_URL=http://127.0.0.1:11434

# Web 搜索（优先 Exa，Tavily 作为备用）
# EXASEARCH_API_KEY=your-exa-api-key
# TAVILY_API_KEY=your-tavily-api-key
```

---

## 🚀 运行方式

以交互模式运行 Dexter：

```bash
bun start
```

开发模式（带监听）：

```bash
bun dev
```

---

## 📊 评估方式

Dexter 内置评估套件，可基于金融问题数据集对智能体进行测试。评估使用 LangSmith 进行跟踪，并采用“LLM 作为裁判（LLM-as-judge）”的方法对正确性进行评分。

**运行全部问题：**

```bash
bun run src/evals/run.ts
```

**运行随机样本：**

```bash
bun run src/evals/run.ts --sample 10
```

评估运行器会显示实时 UI，包括进度、当前问题以及实时准确率统计。结果会记录到 LangSmith 以供分析。

---

## 🐛 调试方式

Dexter 会将所有工具调用记录到 scratchpad 文件中，用于调试和历史追踪。每个查询会在 `.dexter/scratchpad/` 下生成一个新的 JSONL 文件。

**scratchpad 目录结构：**

```
.dexter/scratchpad/
├── 2026-01-30-111400_9a8f10723f79.jsonl
├── 2026-01-30-143022_a1b2c3d4e5f6.jsonl
└── ...
```

每个文件包含按行分隔的 JSON 记录，内容包括：

* **init**：原始查询
* **tool_result**：每次工具调用（参数、原始结果、LLM 总结）
* **thinking**：智能体的推理步骤

**示例：**

```json
{"type":"tool_result","timestamp":"2026-01-30T11:14:05.123Z","toolName":"get_income_statements","args":{"ticker":"AAPL","period":"annual","limit":5},"result":{...},"llmSummary":"Retrieved 5 years of Apple annual income statements showing revenue growth from $274B to $394B"}
```

这使得你可以清晰地查看智能体获取了哪些数据，以及如何理解这些结果。

---

## 📱 如何与 WhatsApp 一起使用

通过连接网关，你可以在 WhatsApp 中与 Dexter 进行对话。你发送给自己的消息会由 Dexter 处理，并将回复发送回同一聊天窗口。

**快速开始：**

```bash
# 绑定 WhatsApp 账号（扫描二维码）
bun run gateway:login

# 启动网关
bun run gateway
```

然后打开 WhatsApp，进入“给自己发消息”的聊天窗口，即可向 Dexter 提问。

详细配置、参数说明和故障排查请参考：
`src/gateway/channels/whatsapp/README.md`

---

## 🤝 如何贡献

1. Fork 仓库
2. 创建功能分支
3. 提交修改
4. 推送分支
5. 创建 Pull Request

**重要说明**：请保持 PR 小而聚焦，这将有助于更容易进行审核和合并。

---

## 📄 许可证

本项目基于 MIT License 开源。


# 参考资料

* any list
{:toc}
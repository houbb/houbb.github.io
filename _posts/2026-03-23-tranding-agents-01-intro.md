---
layout: post
title: TradingAgents：多智能体大语言模型金融交易框架
date: 2026-03-23 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# TradingAgents：多智能体大语言模型金融交易框架

## 新闻动态
- [2026年3月] **TradingAgents v0.2.2** 发布，新增对 GPT-5.4/Gemini 3.1/Claude 4.6 模型的支持，引入五级评级量表，集成 OpenAI Responses API、Anthropic effort 控制功能，并提升了跨平台稳定性。
- [2026年2月] **TradingAgents v0.2.0** 发布，新增对多 LLM 提供商的支持（GPT-5.x、Gemini 3.x、Claude 4.x、Grok 4.x），并改进了系统架构。
- [2026年1月] **Trading-R1** [技术报告](https://arxiv.org/abs/2509.11420) 已发布，[Terminal](https://github.com/TauricResearch/Trading-R1) 预计即将上线。

> 🎉 **TradingAgents** 已正式发布！我们收到了大量关于该工作的咨询，感谢社区的热情支持。
>
> 因此，我们决定将该框架完全开源。期待与您共同打造有影响力的项目！

---

## TradingAgents 框架

TradingAgents 是一个多智能体交易框架，模拟了真实交易公司的运作模式。该平台部署了由大语言模型驱动的专业智能体，包括基本面分析师、市场情绪专家、技术分析师，以及交易员、风险管理团队等。这些智能体协同工作，共同评估市场状况并为交易决策提供依据。此外，这些智能体还会进行动态讨论，以确定最优策略。

> TradingAgents 框架仅供研究用途。交易表现可能受多种因素影响，包括所选的大语言模型、模型温度参数、交易周期、数据质量以及其他非确定性因素。[本文不作为财务、投资或交易建议。](https://tauric.ai/disclaimer/)

该框架将复杂的交易任务分解为多个专业角色，确保系统能够以稳健、可扩展的方式进行市场分析和决策制定。

### 分析师团队
- **基本面分析师**：评估公司的财务状况和业绩指标，识别内在价值及潜在风险点。
- **市场情绪分析师**：利用情绪评分算法分析社交媒体和公众情绪，判断短期市场情绪。
- **新闻分析师**：监测全球新闻和宏观经济指标，解读各类事件对市场状况的影响。
- **技术分析师**：运用技术指标（如 MACD、RSI）识别交易模式，预测价格走势。

### 研究员团队
- 包括看涨和看跌研究员，他们对分析师团队提供的见解进行批判性评估。通过结构化的辩论，平衡潜在收益与内在风险。

### 交易员智能体
- 综合分析师和研究员的报告，做出明智的交易决策。它基于全面的市场洞察，确定交易时机和交易规模。

### 风险管理与投资组合经理
- 持续评估投资组合风险，分析市场波动性、流动性及其他风险因素。风险管理团队负责评估和调整交易策略，并向投资组合经理提供评估报告以供最终决策。
- 投资组合经理负责批准或驳回交易提案。如果获批，订单将被发送至模拟交易所并执行。

## 安装与命令行界面

### 安装

克隆 TradingAgents 仓库：
```bash
git clone https://github.com/TauricResearch/TradingAgents.git
cd TradingAgents
```

使用您喜欢的任何环境管理器创建虚拟环境：
```bash
conda create -n tradingagents python=3.13
conda activate tradingagents
```

安装包及其依赖项：
```bash
pip install .
```

### 所需 API

TradingAgents 支持多种大语言模型服务提供商。请为您选择的提供商设置 API 密钥：

```bash
export OPENAI_API_KEY=...          # OpenAI (GPT)
export GOOGLE_API_KEY=...          # Google (Gemini)
export ANTHROPIC_API_KEY=...       # Anthropic (Claude)
export XAI_API_KEY=...             # xAI (Grok)
export OPENROUTER_API_KEY=...      # OpenRouter
export ALPHA_VANTAGE_API_KEY=...   # Alpha Vantage
```

如需使用本地模型，请在配置中将 `llm_provider` 设置为 `"ollama"`。

或者，复制 `.env.example` 文件为 `.env` 并填入您的密钥：
```bash
cp .env.example .env
```

### 命令行界面使用

启动交互式命令行界面：
```bash
tradingagents          # 使用已安装的命令
python -m cli.main     # 或者直接从源码运行
```
您将看到一个界面，可在其中选择所需的股票代码、分析日期、LLM 提供商、研究深度等。

界面会随着结果加载而实时显示，让您能够跟踪智能体的运行进度。

## TradingAgents 包

### 实现细节

我们使用 LangGraph 构建 TradingAgents，以确保灵活性和模块化。该框架支持多种 LLM 提供商：OpenAI、Google、Anthropic、xAI、OpenRouter 和 Ollama。

### Python 使用示例

要在代码中使用 TradingAgents，您可以导入 `tradingagents` 模块并初始化一个 `TradingAgentsGraph()` 对象。`.propagate()` 函数将返回一个决策结果。您可以运行 `main.py`，以下是一个简单示例：

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

ta = TradingAgentsGraph(debug=True, config=DEFAULT_CONFIG.copy())

# 前向传播
_, decision = ta.propagate("NVDA", "2026-01-15")
print(decision)
```

您也可以调整默认配置，设置您自己选择的 LLM、辩论轮次等。

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["llm_provider"] = "openai"        # 可选：openai, google, anthropic, xai, openrouter, ollama
config["deep_think_llm"] = "gpt-5.2"     # 用于复杂推理的模型
config["quick_think_llm"] = "gpt-5-mini" # 用于快速任务的模型
config["max_debate_rounds"] = 2

ta = TradingAgentsGraph(debug=True, config=config)
_, decision = ta.propagate("NVDA", "2026-01-15")
print(decision)
```

有关所有配置选项，请参阅 `tradingagents/default_config.py`。

## 贡献指南

我们欢迎社区贡献！无论是修复错误、改进文档，还是提出新功能建议，您的参与都将帮助这个项目变得更好。如果您对该研究方向感兴趣，请考虑加入我们的开源金融 AI 研究社区 [Tauric Research](https://tauric.ai/)。

## 引用

如果您发现 *TradingAgents* 对您有所帮助，请引用我们的工作 :)

```
@misc{xiao2025tradingagentsmultiagentsllmfinancial,
      title={TradingAgents: Multi-Agents LLM Financial Trading Framework}, 
      author={Yijia Xiao and Edward Sun and Di Luo and Wei Wang},
      year={2025},
      eprint={2412.20138},
      archivePrefix={arXiv},
      primaryClass={q-fin.TR},
      url={https://arxiv.org/abs/2412.20138}, 
}
```

# 参考资料

* any list
{:toc}
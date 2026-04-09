---
layout: post 
title: AI 对冲基金 项目的目标是探索使用 AI 做出交易决策。
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---



# AI 对冲基金

这是一个由 AI 驱动的对冲基金的概念验证项目。项目的目标是探索使用 AI 做出交易决策。本项目**仅用于教育**目的，不适用于真实交易或投资。

该系统使用多个智能体协同工作：

1.  **Aswath Damodaran 智能体** —— 估值院长，专注于故事、数字和严谨估值
2.  **Ben Graham 智能体** —— 价值投资之父，只买入具有安全边际的隐藏宝石
3.  **Bill Ackman 智能体** —— 激进投资者，敢于重仓并推动变革
4.  **Cathie Wood 智能体** —— 成长投资女王，相信创新与颠覆的力量
5.  **Charlie Munger 智能体** —— 沃伦·巴菲特的搭档，只以合理价格买入卓越企业
6.  **Michael Burry 智能体** —— 《大空头》中的逆向投资者，猎取深度价值
7.  **Mohnish Pabrai 智能体** —— Dhandho 投资人，寻找低风险翻倍的机会
8.  **Nassim Taleb 智能体** —— 黑天鹅风险分析师，关注尾部风险、反脆弱性和非对称收益
9.  **Peter Lynch 智能体** —— 务实投资者，在日常生活企业中寻找“十倍股”
10. **Phil Fisher 智能体** —— 细致的成长投资者，采用深度“闲聊”调研法
11. **Rakesh Jhunjhunwala 智能体** —— 印度的大公牛
12. **Stanley Druckenmiller 智能体** —— 宏观传奇，猎取具有成长潜力的非对称机会
13. **Warren Buffett 智能体** —— 奥马哈先知，以公平价格寻找卓越公司
14. **估值智能体** —— 计算股票的内在价值并生成交易信号
15. **情绪智能体** —— 分析市场情绪并生成交易信号
16. **基本面智能体** —— 分析基本面数据并生成交易信号
17. **技术面智能体** —— 分析技术指标并生成交易信号
18. **风险经理** —— 计算风险指标并设置仓位限制
19. **投资组合经理** —— 做出最终交易决策并生成订单

<img width="1042" alt="Screenshot 2025-03-22 at 6 19 07 PM" src="https://github.com/user-attachments/assets/cbae3dcf-b571-490d-b0ad-3f0f035ac0d4" />

注意：该系统实际上并不会执行任何交易。

[![Twitter Follow](https://img.shields.io/twitter/follow/virattt?style=social)](https://twitter.com/virattt)

## 免责声明

本项目**仅用于教育和研究目的**。

- 不适用于真实交易或投资
- 不提供任何投资建议或保证
- 创作者不对财务损失承担任何责任
- 投资决策请咨询财务顾问
- 过去的表现并不预示未来的结果

使用本软件即表示您同意仅将其用于学习目的。

## 目录
- [安装方法](#how-to-install)
- [运行方法](#how-to-run)
  - [⌨️ 命令行界面](#️-command-line-interface)
  - [🖥️ Web 应用程序](#️-web-application)
- [如何贡献](#how-to-contribute)
- [功能请求](#feature-requests)
- [许可证](#license)

## 安装方法

在运行 AI 对冲基金之前，你需要先安装它并设置好 API 密钥。以下步骤对于全栈 Web 应用和命令行界面都是通用的。

### 1. 克隆仓库

```bash
git clone https://github.com/virattt/ai-hedge-fund.git
cd ai-hedge-fund
```

### 2. 设置 API 密钥

创建用于存放 API 密钥的 `.env` 文件：
```bash
# 为你的 API 密钥创建 .env 文件（在根目录下）
cp .env.example .env
```

打开并编辑 `.env` 文件，添加你的 API 密钥：
```bash
# 用于运行 openai 托管的 LLM（gpt-4o、gpt-4o-mini 等）
OPENAI_API_KEY=your-openai-api-key

# 用于获取驱动对冲基金的金融数据
FINANCIAL_DATASETS_API_KEY=your-financial-datasets-api-key
```

**重要**：你必须至少设置一个 LLM API 密钥（例如 `OPENAI_API_KEY`、`GROQ_API_KEY`、`ANTHROPIC_API_KEY` 或 `DEEPSEEK_API_KEY`），对冲基金才能正常运行。

## 运行方法

### ⌨️ 命令行界面

你可以直接在终端中运行 AI 对冲基金。这种方式提供了更精细的控制，适用于自动化、脚本化和集成场景。

<img width="992" alt="Screenshot 2025-01-06 at 5 50 17 PM" src="https://github.com/user-attachments/assets/e8ca04bf-9989-4a7d-a8b4-34e04666663b" />

#### 快速开始

1. 安装 Poetry（如果尚未安装）：
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

2. 安装依赖：
```bash
poetry install
```

#### 运行 AI 对冲基金
```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA
```

你也可以指定 `--ollama` 标志，使用本地 LLM 运行 AI 对冲基金。

```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA --ollama
```

你可以选择指定开始和结束日期，以便在特定时间段内做出决策。

```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA --start-date 2024-01-01 --end-date 2024-03-01
```

#### 运行回测器
```bash
poetry run python src/backtester.py --ticker AAPL,MSFT,NVDA
```

**示例输出：**
<img width="941" alt="Screenshot 2025-01-06 at 5 47 52 PM" src="https://github.com/user-attachments/assets/00e794ea-8628-44e6-9a84-8f8a31ad3b47" />

注意：`--ollama`、`--start-date` 和 `--end-date` 标志同样适用于回测器！

### 🖥️ Web 应用程序

运行 AI 对冲基金的新方式是通过我们的 Web 应用程序，它提供了用户友好的界面。对于更喜欢可视化界面而非命令行工具的用户，我们推荐使用这种方式。

请参阅[此处](https://github.com/virattt/ai-hedge-fund/tree/main/app)关于如何安装和运行 Web 应用程序的详细说明。

<img width="1721" alt="Screenshot 2025-06-28 at 6 41 03 PM" src="https://github.com/user-attachments/assets/b95ab696-c9f4-416c-9ad1-51feb1f5374b" />

## 如何贡献

1. Fork 本仓库
2. 创建一个功能分支
3. 提交你的更改
4. 推送到分支
5. 创建一个拉取请求

**重要**：请保持你的拉取请求小而专注。这将使审核和合并更容易。

## 功能请求

如果你有功能请求，请打开一个 [issue](https://github.com/virattt/ai-hedge-fund/issues) 并确保它被标记为 `enhancement`。

## 许可证

本项目采用 MIT 许可证 —— 详情请参阅 LICENSE 文件。


# 参考资料

* any list
{:toc}
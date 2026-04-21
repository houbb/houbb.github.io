---
layout: post 
title: Fincept Terminal 具备 CFA 级分析能力、AI 自动化能力以及无限数据连接能力的最先进金融智能平台。
date: 2026-04-21 21:01:55 +0800
categories: [Ai]
tags: [finance, ai]
published: true
---

# Fincept Terminal

### **你的思维才是唯一的限制，数据不是。**

具备 CFA 级分析能力、AI 自动化能力以及无限数据连接能力的最先进金融智能平台。

## 关于

**Fincept Terminal v4** 是一个纯原生 C++20 桌面应用程序。

它使用 **Qt6** 进行 UI 与渲染，内嵌 **Python** 用于分析，并以单一原生二进制形式提供媲美 Bloomberg 终端级别的性能。

---

## 特性

| **特性**             | **描述**                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 📊 **CFA 级分析**     | DCF 模型、投资组合优化、风险指标（VaR、Sharpe）、通过内嵌 Python 进行衍生品定价                                                                                                    |
| 🤖 **AI 代理**       | 37 个代理，覆盖交易员/投资者（Buffett、Graham、Lynch、Munger、Klarman、Marks…）、经济与地缘政治框架；支持本地 LLM；多提供商（OpenAI、Anthropic、Gemini、Groq、DeepSeek、MiniMax、OpenRouter、Ollama） |
| 🌐 **100+ 数据连接器**  | DBnomics、Polygon、Kraken、Yahoo Finance、FRED、IMF、世界银行、AkShare、政府 API，以及可选的替代数据（如 Adanos 市场情绪）                                                           |
| 📈 **实时交易**        | 加密货币（Kraken/HyperLiquid WebSocket）、股票、算法交易、模拟交易引擎、16 个券商集成                                                                                            |
| 🔬 **QuantLib 套件** | 18 个量化分析模块——定价、风险、随机过程、波动率、固定收益                                                                                                                       |
| 🚢 **全球情报**        | 海事跟踪、地缘政治分析、关系图谱、卫星数据                                                                                                                                 |
| 🎨 **可视化工作流**      | 自动化流程节点编辑器，支持 MCP 工具集成                                                                                                                                |
| 🧠 **AI 量化实验室**    | 机器学习模型、因子发现、高频交易、强化学习交易                                                                                                                               |

---

## 安装

### 选项 1 — 下载安装包（推荐）

最新版本：**v4.0.2** — [查看所有版本](https://github.com/Fincept-Corporation/FinceptTerminal/releases/tag/v4.0.2)

| 平台                      | 下载                                    | 运行                                |
| ----------------------- | ------------------------------------- | --------------------------------- |
| **Windows x64**         | FinceptTerminal-Windows-x64-setup.exe | 运行安装程序 → 启动 `FinceptTerminal.exe` |
| **Linux x64**           | FinceptTerminal-Linux-x64.run         | `chmod +x` → 运行安装                 |
| **macOS Apple Silicon** | FinceptTerminal-macOS-arm64.dmg       | 打开 DMG → 拖入 Applications          |

---

### 选项 2 — 快速开始（一键构建）

克隆并运行脚本：

```bash
# Linux / macOS
git clone https://github.com/Fincept-Corporation/FinceptTerminal.git
cd FinceptTerminal
chmod +x setup.sh && ./setup.sh
```

该脚本会处理：编译器检查、CMake、Qt6、Python、构建与启动。

> **Windows：** 无脚本，请使用选项 4 的手动构建步骤。

---

### 选项 3 — Docker

```bash
docker pull ghcr.io/fincept-corporation/fincept-terminal:latest
docker run --rm -e DISPLAY=$DISPLAY -v /tmp/.X11-unix:/tmp/.X11-unix \
    ghcr.io/fincept-corporation/fincept-terminal:latest
```

> **注意：** Docker 主要用于 Linux。

---

### 选项 4 — 源码构建（手动）

> **版本已固定。必须使用指定版本。**

#### 前置条件（精确版本）

（表格保持不变，仅翻译说明）

#### 构建步骤

```bash
cmake --preset win-release
cmake --build --preset win-release
```

（其余命令保持原样）

---

### 运行

```bash
./build/<preset>/FinceptTerminal
```

---

### 故障排查

1. 找不到 Qt6 → 检查路径
2. MSVC 版本错误 → 使用 VS2022 17.8+
3. Qt 版本偏移 → `-DFINCEPT_ALLOW_QT_DRIFT=ON`
4. 清理重建 → 删除 build 目录

---

## 差异化优势

**Fincept Terminal** 是一个开源金融平台，专为不愿被传统软件限制的人构建。

* 原生性能（C++20 + Qt6）
* 单一二进制（无 Node.js / 浏览器运行时）
* CFA 级分析
* 100+ 数据源
* 开源（AGPL-3.0）+ 商业许可

---

## 路线图

| 时间      | 里程碑                  |
| ------- | -------------------- |
| 已发布     | 实时流、16 券商、多账户、PIN 认证 |
| 2026 Q2 | 期权策略构建、50+ AI 代理     |
| 2026 Q3 | API、ML UI、机构功能       |
| 未来      | 移动端、云同步、社区市场         |

---

## 贡献

共同构建金融分析的未来。

* 新数据连接器
* AI 代理
* 分析模块
* C++ 界面
* 文档

---

## 项目支持

社区代币仅用于表达支持，不具备任何产品内功能或收益承诺。

---

## 高校与教育

将专业级金融分析引入课堂：

* $799/月（20 账户）
* 完整数据与 API
* 适用于金融/经济/数据科学课程

---

## 许可证

**双重许可：AGPL-3.0 + 商业**

### 开源

* 免费用于个人/教育
* 需开源修改

### 商业许可

* 商业使用需购买

---

## 商标

“Fincept Terminal” 与 “Fincept”为商标。

© 2025-2026 Fincept Corporation

# 参考资料

* any list
{:toc}
---
layout: post
title: DeerFlow（Deep Exploration and Efficient Research Flow）是一个社区驱动的 Deep Research 框架
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, speech, sh]
published: true
---

# 🦌 DeerFlow

> 起源于开源，回馈开源

**DeerFlow（Deep Exploration and Efficient Research Flow）** 是一个 **社区驱动的 Deep Research 框架**。
它结合 **大语言模型（LLM）与多种工具**，例如：

* Web 搜索
* 网页爬取
* Python 代码执行

从而实现自动化研究和信息分析流程，同时也回馈开源社区。 ([GitHub][1])

目前 DeerFlow 已进入火山引擎 FaaS 应用中心，用户可以在线体验其能力，并支持一键部署。

此外，项目还集成了 BytePlus 开发的 **InfoQuest 智能搜索与爬虫工具集**。

---

# Demo

示例演示展示了如何使用 DeerFlow：

* 与 **MCP 服务**无缝集成
* 执行 **Deep Research 流程**
* 自动生成包含图片的 **完整研究报告**
* 根据报告生成 **播客音频**

示例任务包括：

* 埃菲尔铁塔与世界最高建筑高度对比
* GitHub 热门仓库分析
* 南京传统美食文章
* 租房装饰建议

---

# 目录

* 🚀 Quick Start（快速开始）
* 🌟 Features（功能）
* 🏗️ Architecture（架构）
* 🛠 Development（开发）
* 🐳 Docker
* 🗣 Text-to-Speech
* 📚 Examples
* ❓ FAQ
* 📜 License
* 💖 Acknowledgments

---

# 🚀 快速开始

DeerFlow 后端使用 **Python**，前端 Web UI 使用 **Node.js**。

## 推荐工具

* **uv**
  Python 环境与依赖管理工具
  会自动创建虚拟环境并安装依赖

* **nvm**
  Node.js 版本管理

* **pnpm**
  Node.js 依赖管理

---

## 环境要求

最低要求：

* Python **3.12+**
* Node.js **22+**

---

## 安装

```bash
git clone https://github.com/bytedance/deer-flow.git
cd deer-flow

# 安装 Python 依赖
uv sync
```

配置环境变量：

```bash
cp .env.example .env
```

需要配置 API：

* Tavily Search
* Brave Search
* volcengine TTS

配置模型：

```bash
cp conf.yaml.example conf.yaml
```

支持：

* 本地模型（如 Ollama）
* OpenAI API 兼容接口

---

## Console UI（命令行模式）

最快的运行方式：

```bash
uv run main.py
```

---

## Web UI

安装前端依赖：

```bash
cd deer-flow/web
pnpm install
```

运行前后端：

Mac / Linux

```bash
./bootstrap.sh -d
```

Windows

```bash
bootstrap.bat -d
```

浏览器访问：

```
http://localhost:3000
```

---

# 私有知识库

DeerFlow 支持 **RAG 私有知识库**，可以用私有文档回答问题。

支持：

* RAGFlow
* Qdrant
* Milvus
* VikingDB

例如 Qdrant：

```bash
RAG_PROVIDER=qdrant
QDRANT_LOCATION=https://xxx.qdrant.io
QDRANT_COLLECTION=documents
```

---

# 🌟 功能

## 1 LLM 集成

支持通过 **litellm** 接入各种模型：

* OpenAI API
* 开源模型（如 Qwen）
* 本地模型

支持：

* OpenAI API 兼容接口
* 多层 LLM 系统（根据任务复杂度选择模型）

---

## 2 搜索与数据获取

支持：

* Tavily 搜索
* Brave Search
* InfoQuest
* Jina crawler

功能：

* Web 搜索
* 网页抓取
* 内容提取
* 私有知识库检索

---

## 3 RAG 集成

支持多个向量数据库：

* Qdrant
* Milvus
* RAGFlow
* VikingDB
* MOI
* Dify

特点：

* 在输入框中直接引用知识库文件
* 可通过配置快速切换向量数据库

---

## 4 MCP 集成

支持 MCP（Model Context Protocol）服务：

用于扩展能力，例如：

* 私有系统访问
* 知识图谱
* 浏览器工具

---

# 🏗️ 系统架构

DeerFlow 使用 **多 Agent 模块化架构**。

系统基于 **LangGraph** 实现状态驱动工作流。 ([GitHub][1])

核心组件：

---

## 1 Coordinator（协调器）

入口组件：

* 接收用户请求
* 启动研究流程
* 与用户交互

---

## 2 Planner（规划器）

负责任务规划：

* 分析研究目标
* 拆解任务
* 制定执行计划
* 判断是否需要更多信息

---

## 3 Research Team（研究团队）

由多个 Agent 组成：

### Researcher

负责：

* Web 搜索
* 爬虫
* 数据收集

### Coder

负责：

* Python 执行
* 技术任务
* 代码分析

每个 Agent 都有自己的工具集。

---

## 4 Reporter（报告生成器）

最后阶段：

* 汇总研究结果
* 结构化信息
* 生成完整研究报告

---

# 🔊 语音合成（TTS）

支持通过火山引擎 API 生成语音。

示例：

```bash
curl http://localhost:8000/api/tts
```

参数：

* speed_ratio
* volume_ratio
* pitch_ratio

输出：

```
speech.mp3
```

---

# 🛠 开发

## 测试

安装开发依赖：

```bash
uv pip install -e ".[test]"
```

运行测试：

```bash
make test
```

---

## 代码质量

```bash
make lint
make format
```

---

# LangGraph Studio 调试

DeerFlow 可以通过 **LangGraph Studio** 可视化调试。

运行：

```bash
langgraph dev
```

Studio UI：

```
https://smith.langchain.com/studio
```

可以看到：

* Agent workflow
* 每一步执行状态
* 数据流

---

# 🐳 Docker 运行

构建镜像：

```bash
docker build -t deer-flow-api .
```

运行：

```bash
docker run -d -p 127.0.0.1:8000:8000 deer-flow-api
```

也支持：

```
docker compose up
```

同时启动：

* backend
* frontend

---

# License

MIT License

---

# 致谢

项目基于多个开源项目：

* LangChain
* LangGraph
* Novel
* RAGFlow

感谢这些项目的贡献。

---

# 项目简介

**DeerFlow**

* Deep Research AI 框架
* 多 Agent 工作流
* LLM + 搜索 + 爬虫 + Python
* 自动生成研究报告

项目地址：

[https://github.com/bytedance/deer-flow](https://github.com/bytedance/deer-flow)

# 参考资料

* any list
{:toc}
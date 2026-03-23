---
layout: post
title: TradingAgents：多智能体大语言模型金融交易框架
date: 2026-03-23 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

下面是对该 GitHub 项目 README 的**完整中文翻译（结构化 + 精简但不丢关键信息）**：

---

# 📌 PentAGI

**渗透测试人工通用智能（Penetration Testing AGI）**

✨ 一个**完全自主的 AI Agent 系统**，能够执行复杂的渗透测试任务 ([GitHub][1])

---

## 🎯 项目概述（Overview）

PentAGI 是一个用于**自动化安全测试（渗透测试）**的创新工具，利用先进的 AI 技术构建。

适用于：

* 信息安全工程师
* 安全研究人员
* 白帽黑客 / 安全爱好者

目标是提供一个**强大、灵活、自动化**的渗透测试解决方案。 ([GitHub][1])

---

## ✨ 核心特性（Features）

* 🛡️ **安全隔离**

  * 所有操作运行在 Docker 沙箱中，完全隔离

* 🤖 **完全自动化**

  * AI Agent 自动决定并执行渗透测试步骤

* 🔬 **专业工具集**

  * 内置 20+ 渗透工具，例如：

    * nmap
    * metasploit
    * sqlmap

* 🧠 **智能记忆系统**

  * 存储历史经验、成功攻击路径

* 📚 **知识图谱（Graphiti + Neo4j）**

  * 语义关系建模 + 上下文理解

* 🔍 **Web 情报能力**

  * 内置爬虫浏览器获取最新信息

* 🔎 **外部搜索整合**

  * 支持：

    * Google
    * DuckDuckGo
    * Tavily
    * Perplexity
    * Searxng 等

---

## 🏗️ 系统架构（Architecture）

### 核心模块

1. **前端 UI**

   * React + TypeScript

2. **后端 API**

   * Go + GraphQL / REST

3. **向量数据库**

   * PostgreSQL + pgvector

4. **任务队列**

   * 异步执行

5. **AI Agent 系统**

   * 多 Agent 协作

---

### AI Agent 工作流程（核心逻辑）

分为三个阶段：

1. **Research（调研）**

   * 分析目标系统
   * 搜索历史案例
   * 查询漏洞知识库

2. **Planning（规划）**

   * 制定攻击路径
   * 选择工具和技术

3. **Execution（执行）**

   * 实际执行渗透测试

👉 本质上是一个：

> 多 Agent + 记忆系统 + 工具调用 的自动攻击闭环

---

## 🚀 快速开始（Quick Start）

### 系统要求

* Docker + Docker Compose
* ≥ 2 CPU
* ≥ 4GB 内存
* ≥ 20GB 磁盘
* 可联网

---

### 推荐方式：安装器（Installer）

提供交互式安装工具：

```bash
mkdir -p pentagi && cd pentagi
wget -O installer.zip https://pentagi.com/downloads/linux/amd64/installer-latest.zip
unzip installer.zip
```

---

### 手动安装

#### 1️⃣ 初始化

```bash
mkdir pentagi && cd pentagi
curl -o .env https://raw.githubusercontent.com/vxcontrol/pentagi/master/.env.example
```

#### 2️⃣ 配置 API Key

至少配置一个 LLM：

```bash
OPEN_AI_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
```

可选：

* AWS Bedrock
* Ollama（本地模型）
* 搜索 API

---

#### 3️⃣ 启动

```bash
docker compose up -d
```

访问：

```
https://localhost:8443
```

默认账号：

```
admin@pentagi.com / admin
```

---

## 🤖 Assistant（Agent）配置

关键参数：

```bash
ASSISTANT_USE_AGENTS=false
```

含义：

* false → 默认不启用 Agent
* true → 默认启用 Agent

👉 可以在 UI 中手动切换

---

## 🧠 知识图谱（Graphiti）

PentAGI 集成 Graphiti（基于 Neo4j）用于：

### 能力

* 语义记忆
* 关系建模
* 历史经验复用
* 复杂查询（如攻击路径分析）

---

### 开启方式

```bash
GRAPHITI_ENABLED=true
GRAPHITI_URL=http://graphiti:8000
NEO4J_URI=bolt://neo4j:7687
```

启动：

```bash
docker compose -f docker-compose.yml -f docker-compose-graphiti.yml up -d
```

---

## 💻 开发（Development）

### 依赖

* Go
* Node.js
* Docker
* PostgreSQL

---

### 后端初始化

```bash
cd backend
go mod download
```

---

### 运行测试 Agent

```bash
go run cmd/ctester/*.go -verbose
```

---

### Docker 测试

```bash
docker run --rm vxcontrol/pentagi ...
```

---

## 🧪 Embedding（向量配置）

支持：

* OpenAI（默认）
* Ollama
* HuggingFace
* GoogleAI
* VoyageAI 等

配置：

```bash
EMBEDDING_PROVIDER=openai
EMBEDDING_MODEL=text-embedding-3-small
```

---

## 🧰 工具测试（ftester）

支持功能：

* 执行命令
* 文件操作
* 浏览器访问
* 调试 Agent 流程

示例：

```bash
go run cmd/ftester/main.go terminal -command "ls -la"
```

---

## 🏗️ 构建（Build）

```bash
docker build -t local/pentagi:latest .
```

---

## 📄 许可证（License）

### 核心部分

* MIT License

### VXControl SDK 特殊说明

* 官方仓库可使用
* Fork 时需要：

  * 开源全部代码（AGPL）
  * 或购买商业授权

---

## 🧠 总结（核心理解）

PentAGI 本质上是一个：

> **AI驱动的自动化渗透测试系统（Autonomous Pentest System）**

技术核心是：

* 多 Agent 编排（Orchestrator / Researcher / Executor）
* 工具调用（nmap / metasploit 等）
* 长期记忆（Vector + Graph）
* LLM 推理
* 自动化攻击流程闭环

# 参考资料

* any list
{:toc}
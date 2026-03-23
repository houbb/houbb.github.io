---
layout: post
title: AI 之母项目（The Mother of AI Project）
date: 2026-03-23 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

# AI 之母项目（The Mother of AI Project）

## 第一阶段：RAG 系统 —— arXiv 论文整理助手

<div align="center">
  <h3>以学习者为中心的生产级 RAG 系统实践之旅</h3>
  <p>通过动手实践，从零构建现代 AI 系统</p>
  <p>掌握当前最热门的 AI 工程技能：<strong>RAG（检索增强生成）</strong></p>
</div>

---

## 📖 关于本课程

这是一个**以学习者为核心的项目**，你将构建一个完整的研究助手系统，它可以自动获取学术论文、理解其内容，并利用先进的 RAG 技术回答你的研究问题。

**arXiv 论文整理助手**将教你如何基于**行业最佳实践构建生产级 RAG 系统**。

不同于那些直接跳到向量搜索的教程，我们遵循**专业路径**：

> 先掌握关键词搜索基础，再通过向量增强，实现混合检索。

> **🎯 专业方法的核心差异：**
> 我们按照成功公司的方式构建 RAG ——
> 先打好搜索基础，再用 AI 增强，而不是忽略搜索基础、直接以 AI 为中心。

完成本课程后，你将拥有：

* 一个属于自己的 AI 研究助手
* 构建任意领域生产级 RAG 系统的深厚技术能力

---

## 🎓 你将构建的内容

* **第 1 周：** 使用 Docker、FastAPI、PostgreSQL、OpenSearch、Airflow 搭建完整基础设施
* **第 2 周：** 构建自动化数据管道，从 arXiv 获取并解析论文
* **第 3 周：** 实现生产级 BM25 关键词搜索（含过滤与相关性评分）
* **第 4 周：** 智能切分（chunking）+ 混合搜索（关键词 + 语义）
* **第 5 周：** 完整 RAG 流水线（本地 LLM、流式响应、Gradio 界面）
* **第 6 周：** 生产级监控（Langfuse）+ Redis 缓存优化性能
* **第 7 周：** **Agentic RAG（基于 LangGraph）+ Telegram Bot 移动端接入**

---

## 🏗️ 系统架构演进

### 第 7 周：Agentic RAG + Telegram Bot 集成

（展示完整架构图）

### LangGraph Agentic RAG 工作流

（展示决策节点、文档评分、自适应检索流程）

**第 7 周讲解 + 博客：**
Agentic RAG with LangGraph and Telegram

### 第 7 周核心创新

* **智能决策能力：** Agent 可动态调整检索策略
* **文档评分：** 自动语义相关性评估
* **查询重写：** 当结果不足时自动优化查询
* **护栏机制（Guardrails）：** 防止越界问题和幻觉
* **移动端访问：** Telegram Bot 实现跨设备 AI 交互
* **透明性：** 完整推理过程可追踪（便于调试与增强信任）

---

## 🚀 快速开始

### 📋 前置条件

* Docker Desktop（含 Docker Compose）
* Python 3.12+
* UV 包管理器
* 至少 **8GB 内存 + 20GB 磁盘空间**

---

### ⚡ 快速启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd arxiv-paper-curator

# 2. 配置环境（重要）
cp .env.example .env
# 默认配置可直接运行
# 需额外添加：
# - Jina embedding API key
# - Langfuse key

# 3. 安装依赖
uv sync

# 4. 启动服务
docker compose up --build -d

# 5. 验证服务
curl http://localhost:8000/health
```

---

## 📚 每周学习路径

| 周次     | 内容                     |
| ------ | ---------------------- |
| Week 0 | 项目整体介绍                 |
| Week 1 | 基础设施                   |
| Week 2 | 数据摄取                   |
| Week 3 | BM25 搜索                |
| Week 4 | Chunking + 混合搜索        |
| Week 5 | 完整 RAG                 |
| Week 6 | 监控 + 缓存                |
| Week 7 | Agentic RAG + Telegram |

---

## 📊 服务访问地址

| 服务         | 地址                                                       | 作用     |
| ---------- | -------------------------------------------------------- | ------ |
| API 文档     | [http://localhost:8000/docs](http://localhost:8000/docs) | API 测试 |
| Gradio 界面  | [http://localhost:7861](http://localhost:7861)           | 聊天 UI  |
| Langfuse   | [http://localhost:3000](http://localhost:3000)           | 监控     |
| Airflow    | [http://localhost:8080](http://localhost:8080)           | 工作流    |
| OpenSearch | [http://localhost:5601](http://localhost:5601)           | 搜索 UI  |

---

# 📚 第 1 周：基础设施

**核心目标：构建 RAG 的底层基础**

### 学习内容

* Docker Compose 架构搭建
* FastAPI 开发
* PostgreSQL 数据库
* OpenSearch 搜索引擎
* Ollama 本地 LLM
* 服务编排与健康检测

---

# 📚 第 2 周：数据摄取

### 学习内容

* arXiv API 集成
* PDF 解析（Docling）
* Airflow 自动化流程
* 元数据提取与存储

---

# 📚 第 3 周：关键词搜索（核心基础）

### 学习内容

* 为什么关键词搜索是 RAG 基石
* OpenSearch 索引设计
* BM25 算法原理
* Query DSL 查询构建
* 搜索效果评估（precision / recall）

---

# 📚 第 4 周：Chunking + 混合搜索

### 学习内容

* 文档切分策略
* 向量 Embedding（Jina）
* 混合搜索（BM25 + 向量）
* RRF 融合算法

---

# 📚 第 5 周：完整 RAG 系统

### 学习内容

* 本地 LLM（Ollama）
* Prompt 优化（减少 80% Token）
* 流式响应（SSE）
* Gradio UI

---

# 📚 第 6 周：生产级监控与缓存

### 学习内容

* Langfuse 全链路追踪
* Redis 缓存策略
* 延迟与成本监控
* 性能优化（最高 400x 提升）

---

# 📚 第 7 周：Agentic RAG

### 学习内容

* LangGraph Agent 工作流
* 查询校验（Guardrails）
* 文档评分
* 查询重写
* 自适应检索
* Telegram Bot 集成
* 推理透明化

---

## ⚙️ 配置说明

关键环境变量：

* `JINA_API_KEY`（Week 4+ 必需）
* `TELEGRAM__BOT_TOKEN`（Week 7 必需）
* `LANGFUSE__KEY`（Week 6 可选）

---

## 🛠️ 技术栈

| 技术         | 作用     |
| ---------- | ------ |
| FastAPI    | API    |
| PostgreSQL | 数据存储   |
| OpenSearch | 搜索     |
| Airflow    | 调度     |
| Jina AI    | 向量     |
| Ollama     | 本地 LLM |
| Redis      | 缓存     |
| Langfuse   | 监控     |

---

## 🏗️ 项目结构

```
src/
  ├── routers/
  ├── services/
  ├── models/
  ├── schemas/
  └── config.py
```

---

## 📡 API 示例

| 接口             | 说明      |
| -------------- | ------- |
| /health        | 健康检查    |
| /papers        | 论文列表    |
| /search        | BM25 搜索 |
| /hybrid-search | 混合搜索    |

---

## 🔧 常用命令

```bash
make start
make stop
make test
make logs
```

---

## 🎓 适用人群

* AI / ML 工程师
* 软件工程师
* 数据科学家

---

## 🛠️ 故障排查

* 服务未启动：查看 logs
* 端口冲突：检查 8000 / 8080 / 5432 / 9200
* 内存不足：增加 Docker 内存

---

## 💰 成本说明

* 本地开发：**完全免费**
* 云 API：约 $2-5（可选）

## 📄 许可证

MIT License（详见 LICENSE 文件）


# 参考资料

* any list
{:toc}
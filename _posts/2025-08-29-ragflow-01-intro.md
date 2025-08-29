---
layout: post
title: RAGFlow 入门介绍
date: 2025-8-29 20:40:12 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# RAGFlow 简介

[RAGFlow](https://ragflow.io) 是一款开源的 RAG（Retrieval-Augmented Generation，检索增强生成）引擎，基于深度文档理解而构建。

它为各类企业和个人提供一个精简、高效的 RAG 工作流程，结合大语言模型（LLM），能够从各种复杂格式的数据中提供可靠的问答，并附带有据可查的引用。:contentReference[oaicite:0]{index=0}

---

##  在线演示（Demo）

请访问 [demo.ragflow.io](https://demo.ragflow.io) 进行试用。:contentReference[oaicite:1]{index=1}

---

##  最新更新（截至 2025 年 8 月）

- **2025-08-08** 支持 OpenAI 最新的 GPT-5 系列模型。  
- **2025-08-04** 新增对 Kimi K2 和 Grok 4 等模型的支持。  
- **2025-08-01** 支持 agentic 工作流和 MCP。  
- **2025-05-23** Agent 模块新增 Python/JavaScript 代码执行器组件。  
- **2025-05-05** 支持跨语言查询功能。  
- **2025-03-19** 支持使用多模态模型解析 PDF 或 DOCX 中的图像内容。  
- **2025-02-28** 整合互联网搜索（Tavily），为任意大语言模型实现 Deep Research 式推理功能。  
- **2024-12-18** DeepDoc 升级文档布局分析模型。  
- **2024-08-22** 支持通过 RAG 技术将自然语言转换为 SQL 语句。:contentReference[oaicite:2]{index=2}

---

##  主要功能

- **基于深度文档理解**：从格式复杂、无结构的数据中提取有价值的信息，实现“在无限上下文中大海捞针”的能力。:contentReference[oaicite:3]{index=3}  
- **基于模板的分块机制（Chunking）**：智能且可解释，支持多种模板选项。:contentReference[oaicite:4]{index=4}  
- **有理可据的引用，减少幻觉**：提供文档分块可视化，以及关键引用快照，便于追溯答案来源。:contentReference[oaicite:5]{index=5}  
- **兼容异构数据源**：支持 Word、PPT、Excel、TXT、图片、扫描件、结构化数据、网页等多种格式。:contentReference[oaicite:6]{index=6}  
- **自动化且无忧的 RAG 工作流**：支持个体应用与大型企业生态，兼容配置 LLM 和 embedding 模型，支持多重召回技术与融合重排序，以及提供直观 API 以便集成业务。:contentReference[oaicite:7]{index=7}

---

##  系统架构

RAGFlow 的整体架构围绕以下流程设计：用户通过前端上传文件 → 经文档解析模块（DeepDoc）转为结构化内容 → 将内容索引入向量数据库 → 用户提问时，进行相似召回 → 结合 LLM 生成带引用的回答。:contentReference[oaicite:8]{index=8}

---

##  快速入门（Get Started）

###  前提条件

- CPU 至少 4 核心  
- 内存至少 16 GB  
- 磁盘空间至少 50 GB  
- Docker ≥ 24.0.0 & Docker Compose ≥ v2.26.1  
- 若需使用代码执行器（沙箱）功能，则还需安装 gVisor。:contentReference[oaicite:9]{index=9}

###  启动服务器步骤

1. **设置 `vm.max_map_count ≥ 262144`**：这是 Elasticsearch 正常运行所必需的（Linux/macOS/Windows 均适用），并需持久化设置。:contentReference[oaicite:10]{index=10}  
2. **克隆仓库**：  

```bash
   git clone https://github.com/infiniflow/ragflow.git
````

3. **通过 Docker 镜像启动服务**：

   ```bash
   cd ragflow/docker
   # CPU方式运行
   docker compose -f docker-compose.yml up -d
   # GPU方式运行
   docker compose -f docker-compose-gpu.yml up -d
   ```

   镜像版本说明：

   * `v0.20.4` ≈ 9 GB，包含 embedding 模型（稳定版本）。
   * `v0.20.4-slim` ≈ 2 GB，不包含 embedding 模型（稳定版本）。
   * `nightly` ≈ 9 GB，包含 embedding 模型（不稳定版本）。
   * `nightly-slim` ≈ 2 GB，不包含 embedding 模型（不稳定版本）。([GitHub][1])
4. **检查服务状态**：

   ```bash
   docker logs -f ragflow-server
   ```

   出现如下日志即表示启动成功，系统运行于 `0.0.0.0` 上：([GitHub][1])

   ```
   ____   ___    ______ ______ __
   / __ \ /   |  / ____// ____// /____  _      __
   ...
   * Running on all addresses (0.0.0.0)
   ```
5. **访问服务**：在浏览器中输入 `http://服务器_IP` 即可登录（若为默认 HTTP 端口 80，可省略端口号）。([Gitee][2], [GitHub][1])
6. **配置 LLM 支持**：编辑 `service_conf.yaml.template` 文件，在 `user_default_llm` 中选择模型工厂，更新 `API_KEY` 字段以配置模型访问。([Gitee][2], [GitHub][1])

---

## 构建方式

* **构建无 embedding 模型的 Docker 镜像（约 2 GB）**：

  ```bash
  git clone https://github.com/infiniflow/ragflow.git
  cd ragflow/
  docker build --platform linux/amd64 --build-arg LIGHTEN=1 -f Dockerfile -t infiniflow/ragflow:nightly-slim .
  ```

([GitHub][1])

* **构建包含 embedding 模型的 Docker 镜像（约 9 GB）**：

  ```bash
  git clone https://github.com/infiniflow/ragflow.git
  cd ragflow/
  docker build --platform linux/amd64 -f Dockerfile -t infiniflow/ragflow:nightly .
  ```

([GitHub][1])

---

## 源码开发运行流程

可在本地实现完整开发流程，步骤如下：

1. 安装依赖工具 `uv` 和 `pre-commit`（若未安装）：

   ```bash
   pipx install uv pre-commit
   ```
2. 克隆项目并安装 Python 依赖：

   ```bash
   git clone https://github.com/infiniflow/ragflow.git
   cd ragflow/
   uv sync --python 3.10 --all-extras
   uv run download_deps.py
   pre-commit install
   ```
3. 使用 Docker Compose 启动依赖服务：如 MinIO、Elasticsearch/Infinity、Redis、MySQL 等：

   ```bash
   docker compose -f docker/docker-compose-base.yml up -d
   ```

   并在 `/etc/hosts` 中添加以下内容以便解析服务地址：

   ```
   127.0.0.1 es01 infinity mysql minio redis sandbox-executor-manager
   ```
4. 若无法访问 HuggingFace，可设置环境变量使用镜像站点：

   ```bash
   export HF_ENDPOINT=https://hf-mirror.com
   ```

([GitHub][1])
5\. 若系统缺少 jemalloc，可按如下方式安装：

```bash
# Ubuntu
sudo apt-get install libjemalloc-dev
# CentOS
sudo yum install jemalloc
```

([GitHub][1])
6\. 启动后端服务：

```bash
source .venv/bin/activate
export PYTHONPATH=$(pwd)
bash docker/launch_backend_service.sh
```

7. 启动前端服务：

   ```bash
   cd web
   npm install
   npm run dev
   ```
8. 开发完成后可停止前后端服务：

   ```bash
   pkill -f "ragflow_server.py|task_executor.py"
   ```

([GitHub][1])

---

## 文档与社区支持

* **官方文档资源**：Quickstart、Configuration、Release notes、User guides、Developer guides、References、FAQs。([GitHub][1])
* **路线图**：请参阅 RAGFlow Roadmap 2025。([GitHub][1])
* **社区支持渠道**：Discord、Twitter、GitHub Discussions 等均欢迎参与。([GitHub][1])



* any list
{:toc}
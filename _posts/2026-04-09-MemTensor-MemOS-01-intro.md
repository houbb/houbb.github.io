---
layout: post 
title:  增强版 OpenClaw 与 MemOS 插件
date: 2026-04-09 21:01:55 +0800
categories: [AI]
tags: [ai, llm, memory]
published: true
---


# MemOS

  <strong>🎯 相比 OpenAI Memory 准确率提升 +43.70%</strong><br/>
  <strong>🏆 顶尖的长期记忆与个性化能力</strong><br/>
  <strong>💰 节省 35.24% 的记忆 token</strong><br/>
  <sub>LoCoMo 75.80 • LongMemEval +40.43% • PrefEval-10 +2568% • PersonaMem +40.75%</sub>

## 🦞 增强版 OpenClaw 与 MemOS 插件

![](https://cdn.memtensor.com.cn/img/1770612303123_mnaisk_compressed.png)

🦞 你的龙虾现在拥有了工作记忆系统 —— 选择**云端**或**本地**开始使用。

### ☁️ 云端插件 —— 托管式记忆服务

- [**降低 72% 的 token 使用量**](https://x.com/MemOS_dev/status/2020854044583924111) —— 智能记忆检索，无需加载完整聊天历史
- [**多智能体记忆共享**](https://x.com/MemOS_dev/status/2020538135487062094) —— 多个实例的智能体通过相同的 user_id 共享记忆，自动上下文交接

获取 API 密钥：[MemOS 控制台](https://memos-dashboard.openmem.net/cn/login/)
完整教程 → [MemOS-Cloud-OpenClaw-Plugin](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)

### 🧠 本地插件 —— 100% 设备端记忆

- **零云端依赖** —— 所有数据保留在你的机器上，持久化本地 SQLite 存储
- **混合检索 + 任务与技能演化** —— FTS5 + 向量检索，自动任务摘要，可自我升级的可复用技能
- **多智能体协作 + 记忆查看器** —— 记忆隔离、技能共享、完整的 Web 仪表板（7 个管理页面）

 🌐 [主页](https://memos-claw.openmem.net) ·
📖 [文档](https://memos-claw.openmem.net/docs/index.html) · 📦 [NPM](https://www.npmjs.com/package/@memtensor/memos-local-openclaw-plugin)

## 📌 MemOS：面向 AI 智能体的记忆操作系统

**MemOS** 是一个面向大语言模型和 AI 智能体的记忆操作系统，统一了长期记忆的**存储 / 检索 / 管理**，实现了**上下文感知和个性化**的交互，内置**知识库**、**多模态**、**工具记忆**以及**企业级**优化。



### 主要特性

- **统一记忆 API**：通过单一 API 完成记忆的添加、检索、编辑和删除 —— 以图结构组织，设计上可检查、可编辑，而非黑盒的嵌入存储。
- **多模态记忆**：原生支持文本、图像、工具轨迹和人格，在同一个记忆系统中共同检索和推理。
- **多立方体知识库管理**：将多个知识库作为可组合的记忆立方体进行管理，支持跨用户、项目和智能体的隔离、受控共享和动态组合。
- **通过 MemScheduler 异步写入**：以毫秒级延迟异步执行记忆操作，确保高并发下的生产稳定性。
- **记忆反馈与修正**：通过自然语言反馈来完善记忆 —— 随时间推移纠正、补充或替换已有记忆。


### 新闻

- **2026-03-08** · 🦞 **MemOS OpenClaw 插件 —— 云端与本地**
  官方 OpenClaw 记忆插件正式发布。**云端插件**：托管式记忆服务，降低 72% token 使用量，支持多智能体记忆共享（[MemOS-Cloud-OpenClaw-Plugin](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)）。**本地插件**（`v1.0.0`）：100% 设备端记忆，基于 SQLite 持久化存储，混合检索（FTS5 + 向量），任务摘要与技能演化，多智能体协作，以及完整的记忆查看器仪表板。

- **2025-12-24** · 🎉 **MemOS v2.0: 星尘（Stardust）发布**
  全面的知识库（文档/URL 解析 + 跨项目共享）、记忆反馈与精确删除、多模态记忆（图像/图表）、用于智能体规划的工具记忆、Redis Streams 调度 + 数据库优化、流式/非流式对话、MCP 升级，以及轻量级快速/完整部署。
  <details>
    <summary>✨ <b>新特性</b></summary>

  **知识库与记忆**
  - 新增知识库支持，可从文档和 URL 中提取长期记忆

  **反馈与记忆管理**
  - 新增自然语言反馈和记忆修正功能
  - 新增按记忆 ID 删除记忆的 API
  - 新增 MCP 支持，用于记忆删除和反馈

  **对话与检索**
  - 新增具备记忆感知的聊天 API
  - 新增通过自定义标签过滤记忆（云端与开源版）

  **多模态与工具记忆**
  - 新增工具记忆，记录工具使用历史
  - 新增对对话和文档中的图像记忆支持

  </details>

  <details>
    <summary>📈 <b>改进</b></summary>

  **数据与基础设施**
  - 升级数据库，提升稳定性和性能

  **调度器**
  - 使用 Redis Streams 和队列隔离重构任务调度器
  - 新增任务优先级、自动恢复和基于配额的调度

  **部署与工程**
  - 新增轻量级部署，支持快速模式和完整模式

  </details>

  <details>
    <summary>🐞 <b>Bug 修复</b></summary>

  **记忆调度与更新**
  - 修复旧版调度 API，确保正确的记忆隔离
  - 修复记忆更新日志，正确显示新记忆

  </details>

- **2025-08-07** · 🎉 **MemOS v1.0.0（MemCube）发布**
  首个 MemCube 版本，包含文字游戏示例、LongMemEval 评估、BochaAISearchRetriever 集成、搜索能力增强以及官方 Playground 上线。

  <details>
    <summary>✨ <b>新特性</b></summary>

  **Playground**
  - 扩展 Playground 功能与算法性能

  **MemCube 构建**
  - 新增基于 MemCube 小说的文字游戏示例

  **扩展评估集**
  - 新增 LongMemEval 评估结果和脚本

  </details>

  <details>
    <summary>📈 <b>改进</b></summary>

  **明文记忆**
  - 集成 Bocha 进行联网搜索
  - 扩展图数据库支持
  - 为树状结构的明文记忆搜索接口增加上下文理解能力

  </details>

  <details>
    <summary>🐞 <b>Bug 修复</b></summary>

  **KV 缓存拼接**
  - 修复 concat_cache 方法

  **明文记忆**
  - 修复图搜索相关问题

  </details>

- **2025-07-07** · 🎉 **MemOS v1.0：星河（Stellar）预览版发布**
  面向大语言模型的 SOTA 记忆操作系统现已开源。
- **2025-07-04** · 🎉 **MemOS 论文发布**
  [MemOS: A Memory OS for AI System](https://arxiv.org/abs/2507.03724) 已在 arXiv 上发布。
- **2024-07-04** · 🎉 **Memory3 模型在 WAIC 2024 发布**
  采用记忆分层架构的 Memory3 模型在 2024 世界人工智能大会上正式亮相。

<br>

## 🚀 快速入门指南

### ☁️ 1、云端 API（托管）
#### 获取 API 密钥
- 在 [MemOS 控制台](https://memos-dashboard.openmem.net/cn/quickstart/?source=landing) 注册
- 进入 **API Keys** 并复制你的密钥

#### 后续步骤
- [MemOS Cloud 快速上手](https://memos-docs.openmem.net/memos_cloud/quick_start/)
  连接 MemOS Cloud，几分钟内启用记忆功能。
- [MemOS Cloud 平台](https://memos.openmem.net/?from=/quickstart/)
  探索云端控制台、功能和工作流程。

### 🖥️ 2、自托管（本地/私有）
1. 获取代码仓库。
    ```bash
    git clone https://github.com/MemTensor/MemOS.git
    cd MemOS
    pip install -r ./docker/requirements.txt
    ```
2. 配置 `docker/.env.example` 并复制到 `MemOS/.env`
 - `OPENAI_API_KEY`、`MOS_EMBEDDER_API_KEY`、`MEMRADER_API_KEY` 等可以通过 [`百炼`](https://bailian.console.aliyun.com/?spm=a2c4g.11186623.0.0.2f2165b08fRk4l&tab=api#/api) 申请。
 - 在 `MemOS/.env` 文件中填写相应的配置。
 - 支持的 LLM 提供商：**OpenAI**、**Azure OpenAI**、**通义千问（DashScope）**、**DeepSeek**、**MiniMax**、**Ollama**、**HuggingFace**、**vLLM**。设置 `MOS_CHAT_MODEL_PROVIDER` 选择后端（例如 `openai`、`qwen`、`deepseek`、`minimax`）。
3. 启动服务。

- 通过 Docker 启动
  ###### 提示：请确保 Docker Compose 已成功安装，并在执行以下命令前已进入 docker 目录（通过 `cd docker`）。
  ```bash
  # 进入 docker 目录
  docker compose up
  ```
  ##### 详细步骤请参阅 [`Docker 参考`](https://docs.openmem.net/open_source/getting_started/rest_api_server/#method-1-docker-use-repository-dependency-package-imagestart-recommended-use)。

- 通过 uvicorn 命令行界面（CLI）启动
  ###### 提示：请确保在执行以下命令前 Neo4j 和 Qdrant 已运行。
  ```bash
  cd src
  uvicorn memos.api.server_api:app --host 0.0.0.0 --port 8001 --workers 1
  ```
  ##### 详细集成步骤请参阅 [`CLI 参考`](https://docs.openmem.net/open_source/getting_started/rest_api_server/#method-3client-install-with-CLI)。



### 基本用法（自托管）
  - 添加用户消息
    ```python
    import requests
    import json

    data = {
        "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
        "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca",
        "messages": [
            {
                "role": "user",
                "content": "我喜欢草莓"
            }
        ],
        "async_mode": "sync"
    }
    headers = {
        "Content-Type": "application/json"
    }
    url = "http://localhost:8000/product/add"

    res = requests.post(url=url, headers=headers, data=json.dumps(data))
    print(f"结果: {res.json()}")
    ```
  - 搜索用户记忆
    ```python
    import requests
    import json

    data = {
        "query": "我喜欢什么",
        "user_id": "8736b16e-1d20-4163-980b-a5063c3facdc",
        "mem_cube_id": "b32d0977-435d-4828-a86f-4f47f8b55bca"
    }
    headers = {
        "Content-Type": "application/json"
    }
    url = "http://localhost:8000/product/search"

    res = requests.post(url=url, headers=headers, data=json.dumps(data))
    print(f"结果: {res.json()}")
    ```

<br>

## 📚 资源

- **Awesome-AI-Memory**
  这是一个专注于大语言模型记忆及记忆系统资源的精选仓库。它系统性地收集了相关研究论文、框架、工具和实践见解。该仓库旨在整理和展示快速演进的 LLM 记忆研究图景，连接自然语言处理、信息检索、智能体系统和认知科学等多个研究方向。
- **开始探索** 👉 [IAAR-Shanghai/Awesome-AI-Memory](https://github.com/IAAR-Shanghai/Awesome-AI-Memory)
- **MemOS Cloud OpenClaw 插件**
  面向 MemOS Cloud 的官方 OpenClaw 生命周期插件。它在智能体启动前自动从 MemOS 召回上下文，并在智能体运行结束后将对话保存回 MemOS。
- **开始使用** 👉 [MemTensor/MemOS-Cloud-OpenClaw-Plugin](https://github.com/MemTensor/MemOS-Cloud-OpenClaw-Plugin)

<br>

## 💬 社区与支持

加入我们的社区，提出问题、分享项目并与其他开发者交流。

- **GitHub Issues**：在我们的 <a href="https://github.com/MemTensor/MemOS/issues" target="_blank">GitHub Issues</a> 中报告 Bug 或请求功能。
- **GitHub Pull Requests**：通过 <a href="https://github.com/MemTensor/MemOS/pulls" target="_blank">Pull Requests</a> 贡献代码改进。
- **GitHub Discussions**：参与 <a href="https://github.com/MemTensor/MemOS/discussions" target="_blank">GitHub Discussions</a> 提问或分享想法。
- **Discord**：加入我们的 <a href="https://discord.gg/Txbx3gebZR" target="_blank">Discord 服务器</a>。
- **微信**：扫描二维码加入微信群。

<div align="center">
  <img src="https://statics.memtensor.com.cn/memos/qr-code.png" alt="二维码" width="300" />
</div>

<br>

## 📜 引用

> [!NOTE]
> 我们于 **2025 年 5 月 28 日**公开发布了短版论文，这是最早提出大语言模型记忆操作系统概念的工作。

如果你在研究中使用 MemOS，请引用我们的论文。

```bibtex

@article{li2025memos_long,
  title={MemOS: A Memory OS for AI System},
  author={Li, Zhiyu and Song, Shichao and Xi, Chenyang and Wang, Hanyu and Tang, Chen and Niu, Simin and Chen, Ding and Yang, Jiawei and Li, Chunyu and Yu, Qingchen and Zhao, Jihao and Wang, Yezhaohui and Liu, Peng and Lin, Zehao and Wang, Pengyuan and Huo, Jiahao and Chen, Tianyi and Chen, Kai and Li, Kehang and Tao, Zhen and Ren, Junpeng and Lai, Huayi and Wu, Hao and Tang, Bo and Wang, Zhenren and Fan, Zhaoxin and Zhang, Ningyu and Zhang, Linfeng and Yan, Junchi and Yang, Mingchuan and Xu, Tong and Xu, Wei and Chen, Huajun and Wang, Haofeng and Yang, Hongkang and Zhang, Wentao and Xu, Zhi-Qin John and Chen, Siheng and Xiong, Feiyu},
  journal={arXiv preprint arXiv:2507.03724},
  year={2025},
  url={https://arxiv.org/abs/2507.03724}
}

@article{li2025memos_short,
  title={MemOS: An Operating System for Memory-Augmented Generation (MAG) in Large Language Models},
  author={Li, Zhiyu and Song, Shichao and Wang, Hanyu and Niu, Simin and Chen, Ding and Yang, Jiawei and Xi, Chenyang and Lai, Huayi and Zhao, Jihao and Wang, Yezhaohui and others},
  journal={arXiv preprint arXiv:2505.22101},
  year={2025},
  url={https://arxiv.org/abs/2505.22101}
}

@article{yang2024memory3,
author = {Yang, Hongkang and Zehao, Lin and Wenjin, Wang and Wu, Hao and Zhiyu, Li and Tang, Bo and Wenqiang, Wei and Wang, Jinbo and Zeyun, Tang and Song, Shichao and Xi, Chenyang and Yu, Yu and Kai, Chen and Xiong, Feiyu and Tang, Linpeng and Weinan, E},
title = {Memory$^3$: Language Modeling with Explicit Memory},
journal = {Journal of Machine Learning},
year = {2024},
volume = {3},
number = {3},
pages = {300--346},
issn = {2790-2048},
doi = {https://doi.org/10.4208/jml.240708},
url = {https://global-sci.com/article/91443/memory3-language-modeling-with-explicit-memory}
}
```

<br>

## 🙌 贡献

我们欢迎社区的贡献！请阅读我们的[贡献指南](https://memos-docs.openmem.net/open_source/contribution/overview/)开始。

<br>

## 📄 许可证

MemOS 使用 [Apache 2.0 许可证](./LICENSE)。

# 参考资料

* any list
{:toc}
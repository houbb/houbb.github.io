---
layout: post
title: Cognee 6 行代码为 AI Agent 提供记忆
date: 2026-03-16 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# Cognee

**6 行代码为 AI Agent 提供记忆**

---

## Cognee —— 精确且持久的 AI 记忆


使用你的数据为 AI Agent 构建 **个性化且动态的记忆系统**。

Cognee 允许你用 **可扩展且模块化的 ECL（Extract、Cognify、Load）管道** 替代传统的 RAG 系统。 ([GitHub][1])

---

# 关于 Cognee

Cognee 是一个 **开源工具与平台**，可以将原始数据转换为 **持久且动态的 AI 记忆系统**。

它将 **向量搜索** 与 **图数据库** 结合，使文档既可以通过语义进行搜索，也可以通过关系进行连接。 ([GitHub][1])

你可以通过两种方式使用 Cognee：

1. **自托管 Cognee Open Source**
   默认所有数据存储在本地。

2. **连接 Cognee Cloud**
   在托管基础设施上运行相同的开源技术栈，从而简化开发和生产部署。 ([GitHub][1])

---

# Cognee Open Source（自托管）

* 互联 **任意类型的数据**
  （包括历史对话、文件、图像和音频转录）
* 使用 **图 + 向量** 构建统一的 AI 记忆层，替代传统 RAG
* 减少开发工作量与基础设施成本，同时提高质量和准确度
* 提供 Python 风格的数据管道，可从 **30+ 数据源**进行数据摄取
* 通过用户定义任务、模块化管道和内置搜索接口提供高度可定制性 ([GitHub][1])

---

# Cognee Cloud（托管版）

* Web UI 控制台
* 自动版本更新
* 资源使用分析
* 符合 GDPR 的企业级安全机制 ([GitHub][1])

---

# 基本使用与功能指南

要了解更多内容，可以查看 Cognee 的完整教程与示例。

---

# 快速开始（Quickstart）

只需几行代码即可开始使用 Cognee。

## 前置条件

* Python 3.10 — 3.13

---

## 第 1 步：安装 Cognee

可以使用 pip、poetry、uv 或任意 Python 包管理器安装：

```bash
uv pip install cognee
```

---

## 第 2 步：配置 LLM

```python
import os
os.environ["LLM_API_KEY"] = "YOUR OPENAI_API_KEY"
```

也可以通过 `.env` 文件进行配置。

如需集成其他 LLM 提供商，请参考官方文档。

---

## 第 3 步：运行管道

Cognee 会：

1. 接收你的文档
2. 从文档生成 **知识图谱**
3. 基于关系进行查询

示例最小管道：

```python
import cognee
import asyncio
from pprint import pprint


async def main():
    # 添加文本到 cognee
    await cognee.add("Cognee turns documents into AI memory.")

    # 生成知识图谱
    await cognee.cognify()

    # 向图中添加记忆算法
    await cognee.memify()

    # 查询知识图谱
    results = await cognee.search("What does Cognee do?")

    # 显示结果
    for result in results:
        pprint(result)


if __name__ == '__main__':
    asyncio.run(main())
```

输出结果来自之前存储的文档：

```
Cognee turns documents into AI memory.
```

---

# 使用 Cognee CLI

也可以通过命令行使用：

```bash
cognee-cli add "Cognee turns documents into AI memory."

cognee-cli cognify

cognee-cli search "What does Cognee do?"

cognee-cli delete --all
```

打开本地 UI：

```bash
cognee-cli -ui
```

---

# 演示与示例

查看 Cognee 的实际运行示例：

* 持久化 Agent 记忆
* 简单 GraphRAG 示例
* Cognee + Ollama 示例

---

# 社区与支持

## 贡献

欢迎社区贡献！
请查看 `CONTRIBUTING.md` 开始参与。

---

## 行为准则

我们致力于建设包容和尊重的社区环境。
请阅读行为准则了解相关规则。

---

# 研究与引用

我们发布了一篇关于 **知识图谱与 LLM 推理优化** 的研究论文：

```
Optimizing the Interface Between Knowledge Graphs and LLMs for Complex Reasoning
```

作者：

* Vasilije Markovic
* Lazar Obradovic
* Laszlo Hajdu
* Jovan Pavlovic

---

# 项目简介

**6 行代码实现 AI Agent 记忆**

---

# 主题标签

* open-source
* ai
* knowledge graph
* graph database
* ai agents
* rag
* vector database
* graphrag
* ai memory
* context engineering

---

# 许可证

Apache-2.0 License

# 参考资料

* any list
{:toc}
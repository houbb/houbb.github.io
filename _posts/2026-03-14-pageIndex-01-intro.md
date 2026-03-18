---
layout: post
title: PageIndex：无向量、基于推理的 RAG
date: 2026-03-14 21:01:55 +0800
categories: [AI]
tags: [ai, rag, sh]
published: true
---


# PageIndex：无向量、基于推理的 RAG

基于推理的 RAG

无需向量数据库

无需分块

类人检索

**🔥 发布：**

* [**PageIndex Chat**](https://chat.pageindex.ai)：首个面向专业长文档的类人文档分析 Agent 平台。

也可通过 [MCP](https://pageindex.ai/mcp) 或 [API](https://docs.pageindex.ai/quickstart)（beta）集成。

**📝 文章：**

* [**PageIndex 框架**](https://pageindex.ai/blog/pageindex-intro)：介绍 PageIndex 框架 —— 一个 *Agent 化、基于上下文* 的 *树形索引*，使 LLM 能够在长文档上执行 *基于推理*、*类人检索*，无需向量数据库或分块。

**🧪 Cookbook：**

* [Vectorless RAG](https://docs.pageindex.ai/cookbook/vectorless-rag-pageindex)：一个最小化、可动手实践的示例，展示基于推理的 RAG。
* [Vision-based Vectorless RAG](https://docs.pageindex.ai/cookbook/vision-rag-pageindex)：无需 OCR，仅基于视觉的 RAG 工作流，直接处理 PDF 页面图像。

</details>

---

# 📑 PageIndex 简介

你是否对向量数据库在处理长专业文档时的检索准确性感到沮丧？传统的基于向量的 RAG 依赖语义“相似性”，而非真正的“相关性”。

但**相似性 ≠ 相关性**——我们真正需要的是**相关性**，而这需要**推理能力**。

在需要领域知识和多步推理的专业文档场景中，相似性搜索往往力不从心。

受 AlphaGo 启发，我们提出 **[PageIndex](https://vectify.ai/pageindex)** —— 一个**无向量（vectorless）**、**基于推理的 RAG** 系统。它从长文档中构建一个**层级树索引**，并利用 LLM 在该索引之上进行**推理**，实现**Agent 化、上下文感知的检索**。

它模拟*人类专家*通过*树搜索*在复杂文档中导航与提取知识的方式，使 LLM 能够“思考”和“推理”以定位最相关的内容。PageIndex 的检索过程分为两步：

1. 生成文档的“目录式”**树结构索引**
2. 通过**树搜索**执行基于推理的检索

---

### 🎯 核心特性

相比传统向量 RAG，**PageIndex** 具有：

* **无需向量数据库**：基于文档结构和 LLM 推理进行检索，而非向量相似度搜索
* **无需分块**：按自然结构组织文档，而不是人为切分
* **类人检索**：模拟专家阅读复杂文档的方式
* **更强的可解释性与可追溯性**：基于推理，支持页码和章节引用，不再是黑盒“向量匹配”

PageIndex 驱动的 RAG 系统在 FinanceBench 上达到了 **98.7% 的 SOTA 准确率**，显著优于传统向量 RAG。

---

### 📍 了解 PageIndex

更多内容请查看：

* PageIndex 框架介绍
* GitHub 源码
* Cookbook / 教程 / 博客

服务形式：

* Chat 平台
* MCP 集成
* API 接入

---

### 🛠️ 部署方式

* 本地部署（开源）
* 云服务（Chat / MCP / API）
* 企业版（私有部署 / 本地部署）

---

### 🧪 快速上手

* Vectorless RAG notebook
* Vision-based RAG notebook

---

# 🌲 PageIndex 树结构

PageIndex 可将长 PDF 转换为语义化**树结构**，类似“目录”，但针对 LLM 优化。

适用于：

* 财报
* 法规文件
* 学术教材
* 法律/技术文档

示例：

```jsonc
...
{
  "title": "Financial Stability",
  "node_id": "0006",
  "start_index": 21,
  "end_index": 22,
  "summary": "The Federal Reserve ...",
  "nodes": [
    {
      "title": "Monitoring Financial Vulnerabilities",
      "node_id": "0007",
      "start_index": 22,
      "end_index": 28,
      "summary": "The Federal Reserve's monitoring ..."
    },
    {
      "title": "Domestic and International Cooperation and Coordination",
      "node_id": "0008",
      "start_index": 28,
      "end_index": 31,
      "summary": "In 2023, the Federal Reserve collaborated ..."
    }
  ]
}
...
```

---

# ⚙️ 使用方法

### 1. 安装依赖

```bash
pip3 install --upgrade -r requirements.txt
```

### 2. 设置 API Key

```bash
CHATGPT_API_KEY=your_openai_key_here
```

### 3. 运行

```bash
python3 run_pageindex.py --pdf_path /path/to/your/document.pdf
```

---

### 可选参数

```
--model
--toc-check-pages
--max-pages-per-node
--max-tokens-per-node
--if-add-node-id
--if-add-node-summary
--if-add-doc-description
```

---

### Markdown 支持

```bash
python3 run_pageindex.py --md_path /path/to/your/document.md
```

说明：

* 使用 `#` 判断层级
* 不建议直接用 PDF 转 Markdown
* 推荐使用 PageIndex OCR

---

# 📈 案例：Finance QA Benchmark

[Mafin 2.5](https://vectify.ai/mafin) 是基于 PageIndex 的金融文档分析 RAG 系统。

* FinanceBench 准确率：**98.7%**
* 显著优于传统向量 RAG

优势：

* 层级索引
* 推理驱动检索
* 精准定位复杂财报信息

---

# 🧭 资源

* Cookbook
* Tutorials
* Blog
* MCP / API 文档

---

# ⭐ 支持我们

引用：

```
Mingtian Zhang, Yu Tang and PageIndex Team,
"PageIndex: Next-Generation Vectorless, Reasoning-based RAG",
PageIndex Blog, Sep 2025.
```

BibTeX：

```
@article{zhang2025pageindex,
  author = {Mingtian Zhang and Yu Tang and PageIndex Team},
  title = {PageIndex: Next-Generation Vectorless, Reasoning-based RAG},
  journal = {PageIndex Blog},
  year = {2025},
  month = {September},
  note = {https://pageindex.ai/blog/pageindex-intro},
}
```

如果你喜欢这个项目，请点一个 Star 🌟


© 2025 Vectify AI


# 个人理解

这个思想，非常类似于 claude code 得逻辑。

基于 llm 推理===》

# 参考资料

* any list
{:toc}
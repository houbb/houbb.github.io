---
layout: post
title: generative-ai Google Cloud 上的生成式 AI
date: 2026-03-13 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---


# Google Cloud 上的生成式 AI

该仓库包含 **示例代码、Notebook、示例应用和学习资源**，用于演示如何在 **Google Cloud 的生成式 AI 平台**上开发和管理 AI 应用。

核心技术栈包括：

* Vertex AI
* Gemini

这些示例展示了如何使用这些工具构建 **生成式 AI 工作流和应用系统**。 ([GitHub][1])

---

# 仓库内容

该仓库包含多个目录，每个目录对应不同的生成式 AI 功能或应用方向。

---

## gemini/

用于学习和使用 **Gemini 模型** 的示例内容，包括：

* 入门 Notebook
* 实际使用案例
* 函数调用（Function Calling）
* 示例应用

帮助开发者快速理解如何构建 **Gemini AI 应用**。 ([GitHub][1])

---

## search/

用于使用 **Vertex AI Search** 构建搜索系统。

Vertex AI Search 是 Google 提供的一种 **托管搜索解决方案**，可用于：

* 网站搜索
* 企业内部数据搜索
* AI 搜索应用

该服务原名：

> Enterprise Search on Generative AI App Builder。 ([GitHub][1])

---

## rag-grounding/

该目录主要介绍 **RAG（Retrieval Augmented Generation）** 与 **Grounding**。

内容包括：

* RAG 示例
* Notebook
* 代码样例

帮助开发者在生成式 AI 中引入：

* 企业知识库
* 私有数据
* 文档检索

从而提高 AI 回答的准确性。 ([GitHub][1])

---

## vision/

该目录展示如何使用 **Imagen 模型**构建视觉 AI 应用。

支持的能力包括：

* 图像生成（Image generation）
* 图像编辑（Image editing）
* 图像描述（Visual captioning）
* 图像问答（Visual question answering）

这些能力通过 **Vertex AI Imagen API** 提供。 ([GitHub][1])

---

## audio/

该目录介绍如何使用 **Chirp 语音模型**。

Chirp 是 Google **Universal Speech Model（USM）** 的版本之一。

支持功能：

* 语音识别
* 音频处理
* 语音 AI 应用开发。 ([GitHub][1])

---

## embeddings/

包含 **向量嵌入（Embedding）相关示例**。

主要用于：

* 语义搜索
* 文本相似度计算
* RAG 系统
* 向量数据库应用

---

## agents/

用于展示 **AI Agent 的构建方式**。

包括：

* Agent 示例
* Agent 工作流
* 多 Agent 系统

通常结合：

* Gemini
* 工具调用
* RAG

来构建复杂 AI 系统。

---

## search/

该目录提供搜索应用构建示例，包括：

* 企业搜索
* 文档搜索
* AI 搜索系统。

---

## translation/

用于展示 **AI 翻译系统**的实现示例。

---

## sdk/

该目录提供 **Vertex AI SDK 示例代码**，用于：

* 调用生成式 AI API
* 构建 AI 应用
* 集成到后端系统。

---

## setup-env/

该目录包含 **环境配置教程**。

内容包括：

如何配置：

* Google Cloud
* Vertex AI Python SDK
* Google Colab Notebook
* Vertex AI Workbench

帮助开发者快速开始使用生成式 AI。 ([GitHub][1])

---

# 学习资源

仓库中还提供：

```
RESOURCES.md
```

其中包含：

* 技术博客
* YouTube 教程
* 学习资料

用于学习 **Google Cloud Generative AI**。

---

# 相关仓库

该项目还推荐了一些相关开源仓库，例如：

### Agent Development Kit（ADK）

用于构建 AI Agent 的开发工具。

提供：

* 可直接运行的 Agent
* 多 Agent 工作流
* 各种 AI 应用示例

---

### Agent Starter Pack

一套 **生产级 AI Agent 模板**。

解决常见问题：

* 部署
* 运维
* 评估
* 可观测性
* 自定义能力

---

### Gemini Cookbook

用于学习：

* Gemini Prompt
* Gemini API
* Gemini 应用开发。

---

### Applied AI Engineering

包含：

* 架构蓝图
* 代码示例
* AI 工程实践

帮助企业构建 AI 系统。

---

# 贡献方式

欢迎社区贡献代码。

流程：

1. Fork 仓库
2. 创建分支
3. 提交代码
4. 提交 Pull Request

详细规则见 `CONTRIBUTING.md`。

---

# 声明

该仓库：

> **不是官方支持的 Google 产品。**

仓库中的代码主要用于：

* 示例
* 教学
* 演示

不保证生产环境稳定性。 ([GitHub][1])

---

# 项目总结

**GoogleCloudPlatform/generative-ai 本质是：**

> Google Cloud 官方的 **生成式 AI 示例与学习仓库**。

核心内容：

* Gemini API 示例
* Vertex AI 应用
* RAG 示例
* 多模态 AI（图像 / 音频）
* AI Agent 示例
* Notebook 教程

适合：

* 学习 Google AI 技术栈
* 构建 GenAI 应用
* 企业 AI 平台开发。

---

如果你在做 **AI Agent / AI Platform / DevOps AI**（你之前提过在研究这些），这个仓库其实非常关键。

我可以再帮你整理一个：

**Google AI 技术栈全景图（2026）**

包括：

```
Gemini
   ↓
Vertex AI
   ↓
Agent Development Kit
   ↓
RAG / Search
   ↓
GenAI Apps
```

很多人其实没有看懂 **Google 的 AI 平台战略**。我可以给你完整拆开讲清楚。

[1]: https://github.com/GoogleCloudPlatform/generative-ai?utm_source=chatgpt.com "GitHub - GoogleCloudPlatform/generative-ai: Sample code and notebooks for Generative AI on Google Cloud, with Gemini on Vertex AI"

# 参考资料

* any list
{:toc}
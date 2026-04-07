---
layout: post 
title: LiteRT-LM 是 Google 的生产级、高性能、开源推理框架，用于在边缘设备上部署大语言模型（LLMs）
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm, prompt]
published: true
---

# LiteRT-LM

LiteRT-LM 是 Google 的生产级、高性能、开源推理框架，用于在边缘设备上部署大语言模型（LLMs）。

🔗 [产品网站](https://ai.google.dev/edge/litert-lm)

---

## 🔥 最新更新：LiteRT-LM 支持 Gemma 4

通过 LiteRT-LM，在广泛的硬件设备上部署 Gemma 4，并获得卓越性能
（[博客](https://developers.googleblog.com/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/)）。

👉 可通过 [LiteRT-LM CLI](https://ai.google.dev/edge/litert-lm/cli) 在 Linux、macOS、Windows（WSL）或 Raspberry Pi 上尝试：

```bash
litert-lm run  \
   --from-huggingface-repo=litert-community/gemma-4-E2B-it-litert-lm \
   gemma-4-E2B-it.litertlm \
   --prompt="What is the capital of France?"
```

---

## 🌟 核心特性

* 📱 **跨平台支持**：Android、iOS、Web、桌面端以及 IoT（例如 Raspberry Pi）。
* 🚀 **硬件加速**：通过 GPU 和 NPU 加速器实现峰值性能。
* 👁️ **多模态**：支持视觉与音频输入。
* 🔧 **工具调用（Tool Use）**：支持函数调用，用于 Agent 化工作流。
* 📚 **广泛模型支持**：支持 Gemma、Llama、Phi-4、Qwen 等模型。

```md
![](./docs/api/kotlin/demo.gif)
```

---

## 🚀 已在 Google 产品中达到生产可用

LiteRT-LM 为以下设备上的端侧生成式 AI 提供支持：

* Google Chrome
* Chromebook Plus
* Pixel Watch
* 以及更多设备

您也可以使用
[Google AI Edge Gallery](https://github.com/google-ai-edge/gallery) 应用，在您的设备上立即运行模型。

---

## 安装应用

|                                                                                    **立即从 Google Play 安装应用**                                                                                   |                                                                                                 **立即从 App Store 安装应用**                                                                                                 |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| [![Get it on Google Play](https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png)](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery) | [![Download on the App Store](https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1771977600)](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337) |

---

### 📰 博客与公告

| 链接                                                                                                                                                                                      | 描述                                                        |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------- |
| [Bring state-of-the-art agentic skills to the edge with Gemma 4](https://developers.googleblog.com/bring-state-of-the-art-agentic-skills-to-the-edge-with-gemma-4/)                     | 使用 LiteRT-LM 在应用内及更广泛设备上部署 Gemma 4，实现卓越性能与广泛覆盖。           |
| [On-device GenAI in Chrome, Chromebook Plus and Pixel Watch](https://developers.googleblog.com/on-device-genai-in-chrome-chromebook-plus-and-pixel-watch-with-litert-lm/)               | 使用 LiteRT-LM 在可穿戴设备和浏览器平台上大规模部署语言模型。                      |
| [On-device Function Calling in Google AI Edge Gallery](https://developers.googleblog.com/on-device-function-calling-in-google-ai-edge-gallery/)                                         | 探索如何微调 FunctionGemma，并通过 LiteRT-LM Tool Use API 实现函数调用能力。 |
| [Google AI Edge small language models, multimodality, and function calling](https://developers.googleblog.com/google-ai-edge-small-language-models-multimodality-rag-function-calling/) | 关于边缘语言模型的 RAG、多模态与函数调用的最新洞察。                              |

---

## 🏃 快速开始

### 🔗 关键链接

* 👉 [技术概览](https://ai.google.dev/edge/litert-lm/overview)，包括性能基准、模型支持等信息
* 👉 [LiteRT-LM CLI 指南](https://ai.google.dev/edge/litert-lm/cli)，包括安装、入门与高级用法

---

### ⚡ 快速体验（无需代码）

使用 [`uv`](https://docs.astral.sh/uv/getting-started/installation/) 在终端中立即体验 LiteRT-LM，无需编写任何代码：

```bash
uv tool install litert-lm

litert-lm run \
  --from-huggingface-repo=google/gemma-3n-E2B-it-litert-lm \
  gemma-3n-E2B-it-int4 \
  --prompt="What is the capital of France?"
```

---

## 📚 支持的语言 API

准备开始了吗？查看不同语言的指南与配置说明：

| 语言         | 状态     | 适用场景             | 文档                                                                     |
| :--------- | :----- | :--------------- | :--------------------------------------------------------------------- |
| **Kotlin** | ✅ 稳定   | Android 应用 & JVM | [Android (Kotlin) Guide](https://ai.google.dev/edge/litert-lm/android) |
| **Python** | ✅ 稳定   | 原型开发与脚本          | [Python Guide](https://ai.google.dev/edge/litert-lm/python)            |
| **C++**    | ✅ 稳定   | 高性能原生开发          | [C++ Guide](https://ai.google.dev/edge/litert-lm/cpp)                  |
| **Swift**  | 🚀 开发中 | 原生 iOS & macOS   | （即将推出）                                                                 |

---

### 🏗️ 从源码构建

该 [指南](./docs/getting-started/build-and-run.md) 展示了如何从源码编译 LiteRT-LM。
如果您希望从源码构建程序，应检出稳定版本标签：

[![Latest Release](https://img.shields.io/github/v/release/google-ai-edge/LiteRT-LM)](https://github.com/google-ai-edge/LiteRT-LM/releases/latest)

---

## 📦 发布版本

* **v0.10.1**：支持部署 Gemma 4（具备卓越性能），并引入 LiteRT-LM CLI
* **v0.9.0**：增强函数调用能力，提高应用性能稳定性
* **v0.8.0**：支持桌面 GPU 与多模态
* **v0.7.0**：为 Gemma 模型提供 NPU 加速

完整版本列表请参见：
[GitHub Releases](https://github.com/google-ai-edge/LiteRT-LM/releases)


# 参考资料

* any list
{:toc}
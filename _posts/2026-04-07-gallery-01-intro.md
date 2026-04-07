---
layout: post 
title: Google AI Edge Gallery 使用 Google AI Edge 探索、体验并评估端侧生成式 AI 的未来
date: 2026-04-07 21:01:55 +0800
categories: [AI]
tags: [ai, llm, prompt]
published: true
---

# Google AI Edge Gallery ✨

**使用 Google AI Edge 探索、体验并评估端侧生成式 AI 的未来。**

AI Edge Gallery 是在您的移动设备上运行全球最强大的开源大语言模型（LLMs）的首选平台。

直接在您的硬件上体验高性能生成式 AI——完全离线、私密且极速。

**现已支持：Gemma 4**

最新版本带来了对全新发布的 Gemma 4 系列的官方支持。作为本次发布的核心，Gemma 4 让您可以测试端侧 AI 的前沿能力。在无需将数据发送到服务器的情况下，体验先进的推理、逻辑和创造能力。

---

## 安装

| **立即从 Google Play 安装应用**                                                                                                                                                                      | **立即从 App Store 安装应用**                                                                                                                                                                                                 |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Get it on Google Play](https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png)](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery) | [![Download on the App Store](https://toolbox.marketingtools.apple.com/api/v2/badges/download-on-the-app-store/black/en-us?releaseDate=1771977600)](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337) |

对于无法访问 Google Play 的用户，请从 [**最新发布版本**](https://github.com/google-ai-edge/gallery/releases/latest/) 安装 apk。

---

## 应用预览

![01](https://github.com/user-attachments/assets/a809ad78-aef4-4169-91ee-de7213cbb3bd)
![02](https://github.com/user-attachments/assets/1effd10d-f45a-4f7b-9435-f50f1bdd36b6)
![03](https://github.com/user-attachments/assets/e5089e41-2c18-4fbe-9011-ebe9e5a02044)
![04](https://github.com/user-attachments/assets/0f39d3ed-7403-4606-a7c6-b2c7e51ba6c1)
![05](https://github.com/user-attachments/assets/8c229e96-b598-4735-9f60-e96907e1d5d5)
![06](https://github.com/user-attachments/assets/ac9fb77b-81de-4197-9ed3-f6fe58290b3e)
![07](https://github.com/user-attachments/assets/bc86ba07-2eaf-49b1-980f-8a87a85c596f)
![08](https://github.com/user-attachments/assets/061564ed-030f-4630-810b-13a7863fce4c)

---

## ✨ 核心功能

* **Agent Skills（智能体技能）**：将您的 LLM 从对话者转变为主动助手。使用 Agent Skills 面板，通过维基百科等工具进行事实校准，并提供交互式地图和丰富的可视化摘要卡片来增强模型能力。您甚至可以从 URL 加载模块化技能，或在 GitHub Discussions 上浏览社区贡献。

* **带 Thinking Mode 的 AI 聊天**：进行流畅的多轮对话，并可切换新的 Thinking Mode（思考模式）以“窥探内部机制”。该功能允许您查看模型逐步推理过程，非常适合理解复杂问题的解决方式。注意：Thinking Mode 当前仅支持部分模型，从 Gemma 4 系列开始。

* **Ask Image（图像问答）**：利用多模态能力，通过设备相机或相册识别物体、解决视觉问题，或获取详细描述。

* **Audio Scribe（音频转写）**：使用高效的端侧语言模型，将语音录音实时转写并翻译为文本。

* **Prompt Lab（提示实验室）**：一个专用工作区，用于测试不同提示词和单轮使用场景，并可精细控制模型参数（如 temperature 和 top-k）。

* **Mobile Actions（移动操作）**：通过对 FunctionGemma 270m 的微调，实现完全离线的设备控制和自动化任务。

* **Tiny Garden（迷你花园）**：一个有趣的实验性小游戏，基于 FunctionGemma 270m 微调模型，使用自然语言种植和收获虚拟花园。

* **模型管理与基准测试（Model Management & Benchmark）**：Gallery 是一个支持多种开源模型的灵活沙箱。可以轻松从列表下载模型或加载自定义模型。便捷管理模型库，并运行基准测试，以准确了解每个模型在您设备上的性能表现。

* **100% 端侧隐私**：所有模型推理均直接在您的设备硬件上完成。无需互联网连接，确保您的提示、图像和敏感数据的完全隐私。

---

## 🏁 几分钟内快速开始！

1. **检查操作系统要求**：Android 12 及以上，iOS 17 及以上。
2. **下载应用：**

   * 从 [Google Play](https://play.google.com/store/apps/details?id=com.google.ai.edge.gallery) 或 [App Store](https://apps.apple.com/us/app/google-ai-edge-gallery/id6749645337) 安装应用。
   * 无法访问 Google Play 的用户：从 [**最新发布版本**](https://github.com/google-ai-edge/gallery/releases/latest/) 安装 apk
3. **安装并探索：**如需详细安装说明（包括企业设备）以及完整用户指南，请访问我们的 [**项目 Wiki**](https://github.com/google-ai-edge/gallery/wiki)

---

## 🛠️ 技术亮点

* **Google AI Edge：**端侧机器学习的核心 API 与工具
* **LiteRT：**用于优化模型执行的轻量级运行时
* **Hugging Face 集成：**用于模型发现与下载

---

## ⌨️ 开发

查看 [development notes](DEVELOPMENT.md) 获取如何在本地构建应用的说明。

---

## 🤝 反馈

这是一个**实验性 Beta 版本**，您的反馈至关重要！

* 🐞 **发现 Bug？** [在此报告！](https://github.com/google-ai-edge/gallery/issues/new?assignees=&labels=bug&template=bug_report.md&title=%5BBUG%5D)
* 💡 **有想法？** [提交功能建议！](https://github.com/google-ai-edge/gallery/issues/new?assignees=&labels=enhancement&template=feature_request.md&title=%5BFEATURE%5D)

---

## 📄 许可证

本项目基于 Apache License 2.0 版本授权。详情请参阅 [LICENSE](LICENSE) 文件。

---

## 🔗 有用链接

* [**项目 Wiki（详细指南）**](https://github.com/google-ai-edge/gallery/wiki)
* [Hugging Face LiteRT 社区](https://huggingface.co/litert-community)
* [LiteRT-LM](https://github.com/google-ai-edge/LiteRT-LM)
* [Google AI Edge 文档](https://ai.google.dev/edge)




# 参考资料

* any list
{:toc}
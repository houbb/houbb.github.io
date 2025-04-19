---
layout: post
title: AI MCP(大模型上下文)-14-Agent2Agent 协议 A2A google
date: 2025-4-15 17:51:19 +0800
categories: [AI]
tags: [ai, mcp, sh]
published: true
---

# A2A

**_一个开放协议，支持不同代理应用之间的通信与互操作性._**

企业在采用人工智能时面临的最大挑战之一是如何让不同框架和供应商构建的代理能够协同工作。

这就是为什么我们创建了一个开放的 *Agent2Agent (A2A) 协议*，它是一种协作方式，旨在帮助不同生态系统中的代理实现互相通信。

Google 正在推动这一开放协议的行业倡议，因为我们相信，这个协议将对于支持多代理通信至关重要——它为你的代理提供了一个共同的语言，无论它们是基于哪个框架或供应商构建的。

通过 *A2A*，代理可以展示彼此的能力，并协商如何与用户互动（通过文本、表单或双向音视频等方式）——所有这些都在安全的环境中进行。

### **A2A 协议的实际应用**

观看 [这个演示视频](https://storage.googleapis.com/gweb-developer-goog-blog-assets/original_videos/A2A_demo_v4.mp4)，了解 A2A 如何实现不同代理框架之间的无缝通信。

### 概念概述

Agent2Agent (A2A) 协议促进了独立 AI 代理之间的通信。以下是核心概念：

*   **代理卡片（Agent Card）：** 一个公开的元数据文件（通常位于 `/.well-known/agent.json`），描述代理的能力、技能、端点 URL 和身份验证要求。客户端通过此文件进行发现。
*   **A2A 服务器：** 一个代理，公开了一个 HTTP 端点，支持实现 A2A 协议的方法（在 [json 规范](/specification) 中定义）。它接收请求并管理任务执行。
*   **A2A 客户端：** 一个应用或其他代理，使用 A2A 服务。它向 A2A 服务器的 URL 发送请求（如 `tasks/send`）。
*   **任务（Task）：** 工作的核心单元。客户端通过发送消息（`tasks/send` 或 `tasks/sendSubscribe`）来启动任务。任务有唯一的 ID，并且会经历不同的状态（`submitted`、`working`、`input-required`、`completed`、`failed`、`canceled`）。
*   **消息（Message）：** 代表客户端（`role: "user"`）与代理（`role: "agent"`）之间的通信。消息包含 `Parts`。
*   **部分（Part）：** 消息或工件中的基本内容单元。可以是 `TextPart`、`FilePart`（带有内联字节或 URI）或 `DataPart`（用于结构化 JSON，例如表单）。
*   **工件（Artifact）：** 代表代理在任务过程中生成的输出（例如生成的文件或最终的结构化数据）。工件也包含 `Parts`。
*   **流式传输（Streaming）：** 对于长时间运行的任务，支持 `streaming` 功能的服务器可以使用 `tasks/sendSubscribe`。客户端将接收到服务器发送的事件（SSE），这些事件包含 `TaskStatusUpdateEvent` 或 `TaskArtifactUpdateEvent` 消息，提供实时进度更新。
*   **推送通知（Push Notifications）：** 支持 `pushNotifications` 的服务器可以主动将任务更新发送到客户端提供的 Webhook URL，这一设置通过 `tasks/pushNotification/set` 配置。

**典型流程：**

1.  **发现：** 客户端从服务器的已知 URL 获取代理卡片。
2.  **启动：** 客户端发送 `tasks/send` 或 `tasks/sendSubscribe` 请求，包含初始的用户消息和唯一的任务 ID。
3.  **处理：**
    *   **（流式传输）：** 服务器随着任务的进展发送 SSE 事件（状态更新、工件等）。
    *   **（非流式传输）：** 服务器同步处理任务，并在响应中返回最终的 `Task` 对象。
4.  **交互（可选）：** 如果任务进入 `input-required` 状态，客户端通过 `tasks/send` 或 `tasks/sendSubscribe` 使用相同的任务 ID 发送后续消息。
5.  **完成：** 任务最终达到终止状态（`completed`、`failed`、`canceled`）。

### **入门**

* 📚 阅读 [技术文档](https://google.github.io/A2A/#/documentation) 以了解协议的能力
* 📝 查看 [json 规范](/specification) 了解协议结构
* 🎬 使用我们的 [示例](/samples) 观看 A2A 的实际应用
    * A2A 客户端/服务器示例 ([Python](/samples/python/common), [JS](/samples/js/src))
    * [多代理 Web 应用](/demo/README.md)
    * 命令行工具 ([Python](/samples/python/hosts/cli/README.md), [JS](/samples/js/README.md))
* 🤖 使用我们的 [示例代理](/samples/python/agents/README.md) 了解如何将 A2A 集成到代理框架中
    * [Agent 开发工具包 (ADK)](/samples/python/agents/google_adk/README.md)
    * [CrewAI](/samples/python/agents/crewai/README.md)
    * [LangGraph](/samples/python/agents/langgraph/README.md)
    * [Genkit](/samples/js/src/agents/README.md)
    * [LlamaIndex](/samples/python/agents/llama_index_file_chat/README.md)
    * [Marvin](/samples/python/agents/marvin/README.md)
    * [Semantic Kernel](/samples/python/agents/semantickernel/README.md)
* 📑 查看关键主题以了解协议详细信息 
    * [A2A 和 MCP](https://google.github.io/A2A/#/topics/a2a_and_mcp.md)
    * [代理发现](https://google.github.io/A2A/#/topics/agent_discovery.md)
    * [企业级准备](https://google.github.io/A2A/#/topics/enterprise_ready.md)
    * [推送通知](https://google.github.io/A2A/#/topics/push_notifications.md) 

### **贡献**

我们非常重视社区贡献，感谢你对 A2A 协议的关注！以下是你可以参与的方式：
* 想参与？请查看我们的 [贡献指南](CONTRIBUTING.md)。
* 有问题？加入我们的 [GitHub 讨论区](https://github.com/google/A2A/discussions)。
* 想提供协议改进的反馈？请查看 [GitHub 问题区](https://github.com/google/A2A/issues)。
* 私密反馈？请使用这个 [Google 表单](https://docs.google.com/forms/d/e/1FAIpQLScS23OMSKnVFmYeqS2dP7dxY3eTyT7lmtGLUa8OJZfP4RTijQ/viewform)。

### **接下来做什么**

未来计划包括对协议本身的改进和示例的增强：

**协议增强：**

*   **代理发现：**
    *   在 `AgentCard` 中正式加入授权方案和可选的凭证。
*   **代理协作：**
    *   探讨 `QuerySkill()` 方法，以动态检查不支持或意外的技能。
*   **任务生命周期与用户体验（UX）：**
    *   支持在任务中动态协商 UX（例如，代理在对话中途添加音频/视频）。
*   **客户端方法与传输：**
    *   探讨扩展对客户端发起方法的支持（超越任务管理）。
    *   改进流式传输的可靠性和推送通知机制。

**示例与文档增强：**

*   简化 "Hello World" 示例。
*   包括更多不同框架集成的代理示例或展示特定 A2A 特性的示例。
*   提供更全面的客户端/服务器库文档。
*   从 JSON 模式生成易读的 HTML 文档。

### **关于**

A2A 协议是由 Google LLC 发起的开源项目，采用 [许可证](LICENSE)，并开放给整个社区贡献。

# 参考资料

https://github.com/google/A2A/blob/main/README.md

* any list
{:toc}
---
layout: post
title: Open SWE 采用了当前最佳内部编码智能体一致的核心架构设计。
date: 2026-03-19 21:01:55 +0800
categories: [AI]
tags: [ai]
published: true
---

用于构建组织内部编码智能体的开源框架。

像 Stripe、Ramp 和 Coinbase 这样的顶级工程团队，正在构建他们自己的内部编码智能体——包括 Slack 机器人、CLI 工具和 Web 应用，这些工具直接融入工程师已经使用的工作环境中。这些智能体连接到内部系统，具备正确的上下文、权限控制和安全边界，从而可以在最少人工干预的情况下运行。

Open SWE 是这一模式的开源实现版本。基于 [LangGraph](https://langchain-ai.github.io/langgraph/) 和 [Deep Agents](https://github.com/langchain-ai/deepagents) 构建，它为你提供了这些公司内部使用的同款架构：云沙箱、Slack 和 Linear 调用方式、子智能体编排，以及自动创建 PR——并且可以针对你的代码库和工作流进行定制。

> [!NOTE]
> 💬 在**这里阅读公告博客文章**：[Open SWE 开源内部编码智能体框架](https://blog.langchain.com/open-swe-an-open-source-framework-for-internal-coding-agents/)

---

## 架构

Open SWE 采用了当前最佳内部编码智能体一致的核心架构设计。以下是它与 Stripe 的 Minions、Ramp 的 Inspect 以及 Coinbase 的 Cloudbot 在设计模式上的映射关系（参考该概述）：

### 1. Agent Harness —— 基于 Deep Agents 组合构建

与其 fork 一个现有智能体或从零开始构建，Open SWE 选择在 [Deep Agents](https://github.com/langchain-ai/deepagents) 框架之上进行**组合（compose）**——类似 Ramp 在 OpenCode 之上构建的方式。这种方式既保留了升级路径（可以同步上游改进），又允许你自定义编排逻辑、工具以及中间件。



# 参考资料

* any list
{:toc}
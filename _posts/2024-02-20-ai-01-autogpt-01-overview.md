---
layout: post
title: AI-01-autoGPT 根据设定的目标，自主地拆解任务并执行，减少了对人工提示的依赖
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, sh]
published: true
---


# chat

## 详细介绍一下 autoGPT

Auto-GPT 是一个开源的人工智能项目，它利用了 OpenAI 的大型语言模型 GPT-4 来自动执行多步骤项目。这个项目的核心特点是它允许 GPT 模型自主行动，而不需要人工代理来提示每一个动作。以下是关于 Auto-GPT 的一些详细介绍：

1. **自主性和目标导向**：Auto-GPT 能够根据设定的目标，自主地拆解任务并执行，减少了对人工提示的依赖。

2. **文本生成能力**：它能够生成类似人类的文本、回答问题、翻译语言、总结文本并提供建议等任务。

3. **编程和互联网访问**：Auto-GPT 可以编写自己的代码，执行 Python 脚本，并且具有访问互联网的能力，这使得它能够从在线资源中快速搜索和收集信息。

4. **记忆管理**：Auto-GPT 结合了长短期记忆管理功能，允许模型记住和使用来自先前输入的信息，这有助于生成较长文本时保持一致性和准确性。

5. **实验性和技术要求**：虽然 Auto-GPT 是一个强大的工具，但它仍然是一个实验性的项目，需要一定的编程技能才能部署和使用。

6. **开源和定制化**：作为一个开源项目，Auto-GPT 的源代码对所有人开放，用户可以根据自己的需求进行定制和扩展。

7. **应用场景**：Auto-GPT 可以应用于聊天机器人、教育工具、客服系统、文本生成、数据挖掘等多种场景。

8. **API 和依赖**：使用 Auto-GPT 需要获取和配置一些 API keys，例如 OpenAI API-key，以及可能的 Pinecone、Google、HuggingFace 和 ElevenLabs API-keys，用于增强其功能。

9. **局限性**：Auto-GPT 在复杂的业务场景中可能表现不佳，对上下文的理解有限，可能产生与任务无关的结果，需要额外的编辑和细化。

10. **安装和部署**：Auto-GPT 可以在多种环境中运行，包括本地服务器或云平台，但需要一定的技术知识进行安装和配置。

Auto-GPT 展示了 AI 在自动化和自主决策方面的潜力，尽管它还是一个实验性项目，但已经为 AI 社区提供了一个探索和创新的平台。

## 详细介绍一下 evo.ninja

evo.ninja 是一个开源的通用代理项目，它在 AutoGPT Arena 黑客马拉松中获得了第一名，证明了其卓越的性能。

以下是关于 evo.ninja 的一些详细介绍：

1. **实时适应能力**：evo.ninja 的一个显著特点是它能够根据手头的任务实时适应自己。它利用了为特定任务领域量身定制的预定义代理角色（Agent Personas）。

2. **代理角色（Agent Personas）**：evo.ninja 定义了几种不同的代理角色，每个角色都专注于处理特定类型的任务。这些角色包括文本分析、CSV 文件处理、网络搜索、软件开发等专家。

3. **执行循环（Execution Loop）**：evo.ninja 的工作原理包括一个连续的执行循环，该循环通过以下四个步骤运行，直到确定用户的目标已经达成：
    - **预测下一步（Predict Next Step）**：对于执行循环的每次迭代，Evo 首先对最佳的下一步进行知情预测。
    - **选择最佳代理（Select Best Agent）**：基于第一步的预测，Evo 选择最适合的代理角色。
    - **上下文化聊天历史（Contextualize Chat History）**：基于步骤1的预测和步骤2的代理角色，完整的聊天历史被“上下文化”，并且只有最相关的消息被用于最终的评估步骤。
    - **评估和执行（Evaluate and Execute）**：进行最后的评估步骤，以确定执行哪个代理功能以尝试进一步实现用户的目标。

4. **安装和设置**：evo.ninja 可以在本地运行，需要安装一些先决条件，如 git、nodejs、yarn 和 nvm。安装过程包括克隆仓库、复制环境变量文件、添加 API 密钥等步骤。

5. **会话工作区（Session Workspace）**：evo.ninja CLI 运行后，会创建一个 `./sessions` 目录，其中包含命名的会话。这是代理的根目录，并且只有此目录中的文件将被代理读取和写入。每个会话工作区内都有一个 `.evo/` 目录，用于存储内部日志，包括一个 `chat.md` 文件，提供代理输出的 Markdown 版本。

6. **获奖和社区**：evo.ninja 在 SuperAGI 的 Autonomous Agents Hackathon 中获得了金牌，并在 GitHub 上拥有一个活跃的社区，供用户获取支持和参与讨论。

7. **官方网站**：evo.ninja 还拥有一个官方网站，用户可以访问以了解更多信息。

evo.ninja 展示了 AI 在自动化和任务适应性方面的潜力，尽管它还是一个实验性项目，但已经为 AI 社区提供了一个探索和创新的平台。



------------------------------------------------------------------------------------------ 

# AutoGPT: 构建和使用AI代理

**AutoGPT** 是使AI的力量可供每个人访问、使用和构建的愿景。我们的使命是提供工具，让您可以专注于重要的事情：

- 🏗️ **构建** - 为了一些了不起的事情奠定基础。
- 🧪 **测试** - 将您的代理微调至完美。
- 🤝 **委托** - 让AI为您工作，让您的想法变为现实。

成为这场革命的一部分吧！**AutoGPT** 将始终站在AI创新的前沿。

**📖 [文档](https://docs.agpt.co)**
&ensp;|&ensp;
**🚀 [贡献](CONTRIBUTING.md)**
&ensp;|&ensp;
**🛠️ [构建您自己的代理 - 快速入门](QUICKSTART.md)**

## 🥇 当前最佳代理: evo.ninja
[当前最佳代理]: #-current-best-agent-evoninja

AutoGPT竞技场黑客马拉松上，[**evo.ninja**](https://github.com/polywrap/evo.ninja)获得了我们竞技场排行榜的头把交椅，证明自己是最好的开源通用代理。现在就去 https://evo.ninja 尝试吧！

📈 想挑战evo.ninja、AutoGPT和其他代理吗？将您的基准运行提交到 [Leaderboard](#-leaderboard)，也许您的代理将是下一个冠军！

## 🧱 构建模块

### 🏗️ Forge

**打造您自己的代理！** &ndash; Forge是一个用于您的代理应用的即插即用模板。所有的样板代码已经处理好，让您可以将所有的创造力投入到使*您的*代理与众不同的事物中。所有教程都位于 [这里](https://medium.com/@aiedge/autogpt-forge-e3de53cc58ec)。[`forge.sdk`](/autogpts/forge/forge/sdk) 中的组件也可以单独使用，以加速开发并减少代理项目中的样板代码。

🚀 [**开始使用Forge**](https://github.com/Significant-Gravitas/AutoGPT/blob/master/autogpts/forge/tutorials/001_getting_started.md) &ndash;
本指南将带您完成创建自己的代理并使用基准和用户界面的过程。

📘 [了解更多](https://github.com/Significant-Gravitas/AutoGPT/tree/master/autogpts/forge) 关于Forge

### 🎯 基准测试

**衡量您的代理性能！** `agbenchmark` 可与支持代理协议的任何代理一起使用，与项目的[CLI]集成使其与AutoGPT和基于Forge的代理更易于使用。该基准测试提供了严格的测试环境。我们的框架允许自主、客观的性能评估，确保您的代理能够应对实际行动。

<!-- TODO: 插入演示基准测试的可视化 -->

📦 [`agbenchmark`](https://pypi.org/project/agbenchmark/) 在 Pypi 上
&ensp;|&ensp;
📘 [了解更多](https://github.com/Significant-Gravitas/AutoGPT/blob/master/benchmark) 关于基准测试

#### 🏆 [排行榜][leaderboard]
[leaderboard]: https://leaderboard.agpt.co

通过UI提交您的基准测试运行，并在AutoGPT竞技场排行榜上占据您的位置！得分最高的通用代理将获得**[当前最佳代理]**称号，并将被收录到我们的存储库中，以便人们可以通过[CLI]轻松运行它。

[![AutoGPT竞技场排行榜截图](https://github.com/Significant-Gravitas/AutoGPT/assets/12185583/60813392-9ddb-4cca-bb44-b477dbae225d)][leaderboard]

### 💻 用户界面

**使代理易于使用！** `frontend` 为您提供了一个用户友好的界面，用于控制和监视您的代理。它通过[代理协议](#-代理协议)连接到代理，确保与我们生态系统内外的许多代理兼容。

<!-- TODO: 插入前端的截图 -->

该前端与存储库中的所有代理一起即开即用。只需使用[CLI]运行您选择的代理即可！

📘 [了解更多](https://github.com/Significant-Gravitas/AutoGPT/tree/master/frontend) 关于前端

### ⌨️ CLI

[CLI]: #-cli

为了尽可能简化使用存储库提供的所有工具的过程，在存储库的根目录中包含了一个CLI：

```shell
$ ./run
Usage: cli.py [OPTIONS] COMMAND [ARGS]...

Options:
  --help  Show this message and exit.

Commands:
  agent      创建、启动和停止代理的命令
  arena      进入竞技场的命令
  benchmark  启动基准测试和列出测试和类别的命令
  setup     

 安装您系统所需的依赖项。
```

只需克隆存储库，使用`./run setup`安装依赖项，然后您就可以开始使用了！

## 🤔 有问题？遇到困难？有建议吗？

### 获取帮助 - [Discord 💬](https://discord.gg/autogpt)

[![加入我们的Discord](https://invidget.switchblade.xyz/autogpt)](https://discord.gg/autogpt)

要报告错误或请求功能，请创建一个[GitHub Issue](https://github.com/Significant-Gravitas/AutoGPT/issues/new/choose)。请确保其他人没有为相同的主题创建问题。

## 🤝 姊妹项目

### 🔄 代理协议

为了保持统一的标准，并确保与许多当前和未来的应用程序无缝兼容，AutoGPT采用了AI工程师基金会的[代理协议](https://agentprotocol.ai/)标准。这标准化了从您的代理到前端和基准测试的通信路径。

---

<p align="center">
<a href="https://star-history.com/#Significant-Gravitas/AutoGPT">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Significant-Gravitas/AutoGPT&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Significant-Gravitas/AutoGPT&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Significant-Gravitas/AutoGPT&type=Date" />
  </picture>
</a>
</p>

# 参考资料

https://github.com/Significant-Gravitas/AutoGPT

* any list
{:toc}

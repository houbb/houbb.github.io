---
layout: post
title: ai-16-devika AI 软件工程师，Devin 的开源替代方案。程序员会被替代吗？ 
date: 2024-03-26 21:01:55 +0800
categories: [AI]
tags: [ai, sh]
published: true
---

# 拓展阅读

[马斯克开源的 grok-1 底层 Transformer 模型论文 《Attention is All You Need》](https://mp.weixin.qq.com/s/bZP2R97GUD1NxV22Tn7eOQ)

[马斯克开源的 grok-1 大模型底层 Transformer 模型到底是个啥？](https://mp.weixin.qq.com/s/jvpovKSitioC7IQ8IWTumg)

[马斯克开源的 grok-1 大模型硬核源码第 1 弹](https://mp.weixin.qq.com/s/nMeisZVQmhVYCRi7YHTKIA)

[马斯克开源的 grok-1 大模型硬核源码第 2 弹](https://mp.weixin.qq.com/s/gdrP9HXRkRf9zrMuzrCB7g)

[马斯克开源的 grok-1 大模型硬核源码第 3 弹](https://mp.weixin.qq.com/s/mpoEnVvrtVBSk4PfUIKmMg)

[马斯克开源的 grok-1 大模型硬核源码第 4 弹](https://mp.weixin.qq.com/s/fNLbaROZXFEfbREuBV1Kpg)

[devika AI 软件工程师，Devin 的开源替代方案](https://mp.weixin.qq.com/s/Tvs_Z90MK4sZeoBe8n5U_A)

# Devika

Devika 是一款自主 AI 软件工程师，能够理解高水平的人类指令，将其分解为步骤，研究相关信息，并编写代码以实现给定的目标。

Devika 的目标是成为 Cognition AI 的 Devin 的竞争性开源替代方案。

# 关于

Devika 是一款先进的 AI 软件工程师，能够理解高水平的人类指令，将其分解为步骤，研究相关信息，并编写代码以实现给定的目标。

Devika 利用大型语言模型、规划和推理算法以及网络浏览能力来智能地开发软件。

Devika 的目标是通过提供一款 AI 辅助编程工具来彻底改变我们构建软件的方式，这款工具可以在极少的人类指导下承担复杂的编码任务。

无论您需要创建一个新功能、修复一个错误，还是从零开始开发一个完整的项目，Devika 都在这里为您提供帮助。

![Devika](https://img-blog.csdnimg.cn/direct/662a61580ae64a9caab1cf1de95e08b3.png#pic_center)

## 注意

Devika 是根据 Cognition AI 的 Devin 设计的。

该项目旨在成为 Devin 的开源替代方案，其“过度雄心勃勃”的目标是在 SWE-bench 基准测试中达到与 Devin 相同的分数……并最终超越它？


## 主要特点

🤖 支持 Claude 3、GPT-4、GPT-3.5 和通过 Ollama 支持的本地语言模型。为了获得最佳性能：请使用 Claude 3 系列模型。

🧠 先进的 AI 规划和推理能力

🔍 上下文关键字提取，用于专注研究

🌐 无缝的网络浏览和信息收集

💻 支持多种编程语言的代码编写

📊 动态代理状态跟踪和可视化

💬 通过聊天界面进行自然语言交互

📂 基于项目的组织和管理

🔌 可扩展的架构，用于添加新功能和集成

## 系统架构

Devika 的系统架构包括以下关键组件：

用户界面：基于网络的聊天界面，用于与 Devika 进行交互、查看项目文件和监视代理状态。

代理核心：负责协调 AI 规划、推理和执行过程的中心组件。它与各种子代理和模块通信，以完成任务。

大型语言模型：Devika 利用像 Claude、GPT-4 和通过 Ollama 支持的本地语言模型等最先进的语言模型，用于自然语言理解、生成和推理。

规划和推理引擎：负责将高级目标分解为可行动步骤，并根据当前上下文做出决策。

研究模块：利用关键字提取和网络浏览能力，收集与当前任务相关的信息。

代码编写模块：根据计划、研究结果和用户需求生成代码。支持多种编程语言。

浏览器交互模块：使 Devika 能够浏览网站、提取信息，并根据需要与网页元素交互。

知识库：存储和检索项目特定信息、代码片段和学习知识，以实现高效访问。

数据库：持久化项目数据、代理状态和配置设置。


详细文档请阅读 [ARCHITECTURE.md](https://github.com/stitionai/devika/blob/main/ARCHITECTURE.md)。



# 快速入门

在本地运行项目的最简单方法：

安装 uv - Python 包管理器（https://github.com/astral-sh/uv）
安装 bun - JavaScript 运行时（https://bun.sh/）
安装并设置 Ollama（https://ollama.com/）
在 config.toml 文件中设置 API 密钥。（这将很快移动到用户界面，您可以从用户界面设置这些密钥，而无需触碰命令行。想要实现吗？请查看此问题：#3）

然后执行以下一系列命令：

```
ollama serve
git clone https://github.com/stitionai/devika.git
cd devika/
uv venv
uv pip install -r requirements.txt
cd ui/
bun install
bun run dev
cd ..
python3 devika.py
```

Docker 镜像即将发布。🙌

# 安装

## Devika 需要以下依赖项：

Ollama（按照此处的说明安装它：https://ollama.com/）
Bun（按照此处的说明安装它：https://bun.sh/）
要安装 Devika，请按照以下步骤进行操作：

克隆 Devika 存储库：

```
git clone https://github.com/stitionai/devika.git
```

导航到项目目录：

```
cd devika
```

安装所需的依赖项：

```
pip install -r requirements.txt
playwright install --with-deps # 如果需要，安装 playwright 中的浏览器（及其依赖项）
```

设置必要的 API 密钥和配置（请参阅配置部分）。

启动 Devika 服务器：

```
python devika.py
```

编译并运行 UI 服务器：

```
cd ui/
bun install
bun run dev
```

通过打开浏览器并导航到 http://127.0.0.1:3000 访问 Devika 网页界面。


# 入门指南

要开始使用 Devika，请按照以下步骤操作：

在浏览器中打开 Devika 网页界面。

通过单击“New Project”按钮并提供项目名称来创建一个新项目。

为您的项目选择所需的编程语言和模型配置。

在聊天界面中，提供一个高级目标或任务描述，以供 Devika 处理。

Devika 将处理您的请求，将其分解为步骤，并开始执行任务。

监视 Devika 的进度，查看生成的代码，并根据需要提供额外的指导或反馈。

一旦 Devika 完成任务，就可以审查生成的代码和项目文件。

通过提供进一步的指导或修改，按需迭代和完善项目。


## 配置

Devika 需要特定的配置设置和 API 密钥才能正常运行。请更新 config.toml 文件，提供以下信息：

OPENAI_API_KEY：用于访问 GPT 模型的 OpenAI API 密钥。

CLAUDE_API_KEY：用于访问 Claude 模型的 Anthropic API 密钥。

BING_API_KEY：用于进行网络搜索的 Bing 搜索 API 密钥。

DATABASE_URL：数据库连接的 URL。

LOG_DIRECTORY：存储 Devika 日志的目录。

PROJECT_DIRECTORY：存储 Devika 项目的目录。


请确保保护好您的 API 密钥，并不要公开分享。

# 系统内部运行原理

让我们更深入地了解 Devika 中使用的一些关键组件和技术：

## AI 规划和推理

Devika 利用先进的 AI 规划和推理算法将高级目标分解为可操作的步骤。

规划过程包括以下阶段：

目标理解：Devika 分析给定的目标或任务描述，以理解用户的意图和要求。

上下文收集：从对话历史、项目文件和知识库中收集相关上下文，以指导规划过程。

步骤生成：根据目标和上下文，Devika 生成一系列完成任务的高级步骤。

细化和验证：对生成的步骤进行细化和验证，确保它们的可行性和与目标的一致性。

执行：Devika 根据需要执行计划中的每个步骤，利用各种子代理和模块。

推理引擎不断评估进度，并根据执行过程中收到的新信息或反馈进行调整。

## 关键字提取

为了实现专注的研究和信息收集，Devika 使用关键字提取技术。该过程包括以下步骤：

预处理：对输入文本（目标、对话历史或项目文件）进行预处理，包括去除停用词、分词和文本规范化。

关键字识别：Devika 使用 BERT（来自 Transformers 的双向编码器表示）模型从预处理文本中识别重要的关键字和短语。BERT 在大型语料库上的预训练使其能够捕获语义关系，并理解给定上下文中单词的重要性。

关键字排序：根据关键字与当前任务的相关性和重要性对其进行排序。使用 TF-IDF（词频-逆文档频率）和 TextRank 等技术为每个关键字分配分数。

关键字选择：选择排名靠前的关键字作为当前上下文中最相关和最具信息量的关键字。这些关键字用于指导研究和信息收集过程。

通过提取上下文相关的关键字，Devika 可以集中其研究工作，并检索有助于完成任务的相关信息。

## 浏览器交互

Devika 包含浏览器交互功能，以浏览网站、提取信息和与网络元素交互。浏览器交互模块利用 Playwright 库自动化网络交互。该过程包括以下步骤：

导航：Devika 使用 Playwright 导航到特定的 URL，或根据提供的关键字或需求执行搜索。

元素交互：Playwright 允许 Devika 与网络元素交互，如单击按钮、填写表单和从特定元素中提取文本。

页面解析：Devika 解析访问的网页的 HTML 结构，以提取相关信息。它使用 CSS 选择器和 XPath 等技术来定位和提取特定数据点。

JavaScript 执行：Playwright 允许 Devika 在浏览器上下文中执行 JavaScript 代码，从而实现动态交互和数据检索。

截图捕获：Devika 可以捕获所访问网页的截图，这对于视觉参考或调试目的非常有用。


浏览器交互模块赋予了 Devika 从网络中获取信息、与在线资源交互，并将实时数据纳入其决策和代码生成过程的能力。

## 代码编写

Devika 的代码编写模块根据计划、研究结果和用户需求生成代码。该过程包括以下步骤：

语言选择：Devika 根据用户指定的编程语言或项目上下文推断出编程语言。

代码结构生成：根据计划和语言特定的模式，Devika 生成代码的高级结构，包括类、函数和模块。

代码填充：Devika 使用特定的逻辑、算法和数据操作语句填充代码结构。它利用研究结果、知识库中的代码片段和自身对编程概念的理解来生成有效代码。

# 参考资料

* any list
{:toc}

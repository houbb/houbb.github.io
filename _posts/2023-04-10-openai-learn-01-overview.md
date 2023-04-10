---
layout: post
title: OPENAI 学习笔记-01-概览
date:  2023-04-10 +0800
categories: [AI]
tags: [openai, sh]
published: true
---

# 介绍

## 概述

OpenAI API 几乎可以应用于任何涉及理解或生成自然语言、代码或图像的任务。 

我们提供一系列具有不同功率级别的模型，适用于不同的任务，并且能够微调您自己的自定义模型。 这些模型可用于从内容生成到语义搜索和分类的所有领域。

## 关键概念

我们建议您完成我们的快速入门教程，以通过实际操作的交互式示例熟悉关键概念。

### 提示 Prompts

设计提示本质上是您“编程”模型的方式，通常是通过提供一些说明或一些示例。 

这不同于为单一任务设计的大多数其他 NLP 服务，例如情感分类或命名实体识别。 

相反，完成和聊天完成端点可用于几乎任何任务，包括内容或代码生成、摘要、扩展、对话、创意写作、风格转换等。

### 代币 Tokens

我们的模型通过将文本分解为标记来理解和处理文本。 标记可以是单词或只是字符块。 

例如，单词“hamburger”被分解为标记“ham”、“bur”和“ger”，而像“pear”这样的短而常见的单词是一个标记。 许多标记以空格开头，例如“hello”和“bye”。

在给定的 API 请求中处理的令牌数量取决于输入和输出的长度。 

根据粗略的经验法则，对于英文文本，1 个标记大约为 4 个字符或 0.75 个单词。 要记住的一个限制是，您的文本提示和生成的完成组合不能超过模型的最大上下文长度（对于大多数模型，这是 2048 个标记，或大约 1500 个单词）。 查看我们的分词器工具，了解有关文本如何转换为分词的更多信息。

### 模型 Models

API 由一组具有不同功能和价位的模型提供支持。 

GPT-4 是我们最新、最强大的模型。 

GPT-3.5-Turbo 是为 ChatGPT 提供支持的模型，并针对对话格式进行了优化。 

要了解有关这些模型以及我们提供的其他内容的更多信息，请访问我们的模型文档。

# 快速开始

OpenAI 训练了非常擅长理解和生成文本的尖端语言模型。 

我们的 API 提供对这些模型的访问，可用于解决几乎任何涉及处理语言的任务。

在本快速入门教程中，您将构建一个简单的示例应用程序。 

在此过程中，您将学习使用 API 完成任何任务的关键概念和技术，包括：

- 内容生成

- 总结

- 分类、分类和情感分析

- 数据提取

- 翻译

...

## 介绍

完成端点是我们 API 的核心，它提供了一个极其灵活和强大的简单接口。 

您输入一些文本作为提示，API 将返回一个文本补全，尝试匹配您提供的任何指令或上下文。

```
Prompt Write a tagline for an ice cream shop.
Completion We serve up smiles with every scoop!
```

您可以将其视为非常高级的自动完成——模型处理您的文本提示并尝试预测接下来最有可能出现的内容。

# 常见的代码仓库

> [https://platform.openai.com/docs/libraries/community-libraries](https://platform.openai.com/docs/libraries/community-libraries)

其中 java 客户端如下：

> [openai-java](https://github.com/TheoKanning/openai-java)

# 参考资料

https://platform.openai.com/docs/introduction

* any list
{:toc}
---
layout: post
title: dive-into-llms-04-Transformers 简介
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---


# 背景

https://huggingface.co/docs/transformers/main/zh/index



# Transformers 简介

为 PyTorch 打造的先进的机器学习工具.

🤗 Transformers 提供了可以轻松地下载并且训练先进的预训练模型的 API 和工具。

使用预训练模型可以减少计算消耗和碳排放，并且节省从头训练所需要的时间和资源。

这些模型支持不同模态中的常见任务，比如：

📝 自然语言处理：文本分类、命名实体识别、问答、语言建模、摘要、翻译、多项选择和文本生成。
🖼️ 机器视觉：图像分类、目标检测和语义分割。
🗣️ 音频：自动语音识别和音频分类。
🐙 多模态：表格问答、光学字符识别、从扫描文档提取信息、视频分类和视觉问答。

🤗 Transformers 模型可以被导出为 ONNX 和 TorchScript 格式，用于在生产环境中部署。

马上加入在 Hub、论坛 或者 Discord 上正在快速发展的社区吧！

# 目录

这篇文档由以下 5 个章节组成：

开始使用 包含了库的快速上手和安装说明，便于配置和运行。

教程 是一个初学者开始的好地方。本章节将帮助你获得你会用到的使用这个库的基本技能。

操作指南 向你展示如何实现一个特定目标，比如为语言建模微调一个预训练模型或者如何创造并分享个性化模型。

概念指南 对 🤗 Transformers 的模型，任务和设计理念背后的基本概念和思想做了更多的讨论和解释。

API 介绍 描述了所有的类和函数：

主要类别 详述了配置（configuration）、模型（model）、分词器（tokenizer）和流水线（pipeline）这几个最重要的类。

模型 详述了在这个库中和每个模型实现有关的类和函数。

内部帮助 详述了内部使用的工具类和函数。




* any list
{:toc}
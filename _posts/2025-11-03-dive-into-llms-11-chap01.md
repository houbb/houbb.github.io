---
layout: post
title: dive-into-llms-01-快速入门 python 
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---


# 背景

https://github.com/Lordog/dive-into-llms/tree/main/documents/chapter1

# 预训练语言模型微调与部署

导读: 该部分介绍预训练模型微调 想提升预训练模型在指定任务上的性能？让我们选择合适的预训练模型，在特定任务上进行微调，并将微调后的模型部署成方便使用的Demo！

本教程目标：

熟悉使用Transformers工具包

掌握预训练模型的微调、推理（解耦可定制版本 & 默认集成版本）

掌握利用Gradio Spaces进行Demo部署

了解不同类型的预训练模型的选型和应用场景


# 本教程内容：

## 1. 工作准备：

### 1.1 了解工具包：Transformers

https://github.com/huggingface/transformers

🤗 Transformers 提供了可以轻松地下载并且训练先进的预训练模型的 API 和工具。

使用预训练模型可以减少计算消耗和碳排放，并且节省从头训练所需要的时间和资源。

这些模型支持不同模态中的常见任务，

比如： 📝 自然语言处理：文本分类、命名实体识别、问答、语言建模、摘要、翻译、多项选择和文本生成。 

🖼️ 机器视觉：图像分类、目标检测和语义分割。 

🗣️ 音频：自动语音识别和音频分类。 

🐙 多模态：表格问答、光学字符识别、从扫描文档提取信息、视频分类和视觉问答。

详细中文文档：https://huggingface.co/docs/transformers/main/zh/index

![1](https://github.com/Lordog/dive-into-llms/raw/main/documents/chapter1/assets/huggingface.PNG)

### 1.2 安装环境：以文本分类（e.g., 虚假新闻检测）为例

我们进入到文本分类的案例库，参考readme了解关键参数，下载requirements.txt和run_classification.py

https://github.com/huggingface/transformers/tree/main/examples/pytorch/text-classification

安装环境：

- 通过conda创建新的环境：conda create -n llm python=3.9

- 进入虚拟环境：conda activate llm

- pip install transformers

- 删除requirements.txt中自动安装的torch，pip install -r requirements.txt

若下载速度慢，可使用国内源：`pip [Packages] -i https://pypi.tuna.tsinghua.edu.cn/simple`

若使用国内源安装pytorch，将自动选择pytorch的cpu版本，无法运行gpu，因此——

conda install pytorch

若下载速度慢，可按照该博客配置conda镜像：https://blog.csdn.net/weixin_42797483/article/details/132048218

准备数据：我们以Kaggle上的虚假推文数据集为例：https://www.kaggle.com/c/nlp-getting-started/data

### 1.3 处理好的工程包（演示代码和数据）

（1）解耦可定制版本（关键模块解耦，方便理解，可自定义数据加载、模型结构、评价指标等）

TextClassificationCustom下载链接 https://pan.quark.cn/s/00dae5c2b128

（2）默认集成版本（代码较 为丰富、复杂，一般直接超参数调用，略有开发门槛）

TextClassification下载链接 https://pan.quark.cn/s/9d0510f1c98d



* any list
{:toc}
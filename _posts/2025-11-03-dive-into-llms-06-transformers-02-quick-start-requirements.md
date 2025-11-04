---
layout: post
title: dive-into-llms-06-Transformers 基本环境安装快速入门
date: 2025-11-03 20:40:12 +0800
categories: [AI]
tags: [ai, learn-note]
published: true
---

# 快速上手

快来使用 🤗 Transformers 吧！

无论你是开发人员还是日常用户，这篇快速上手教程都将帮助你入门并且向你展示如何使用 pipeline() 进行推理，使用 AutoClass 加载一个预训练模型和预处理器，以及使用 PyTorch 或 TensorFlow 快速训练一个模型。

如果你是一个初学者，我们建议你接下来查看我们的教程或者课程，来更深入地了解在这里介绍到的概念。

## 准备工作

在开始之前，确保你已经安装了所有必要的库：

```
!pip install transformers datasets evaluate accelerate
```

你还需要安装喜欢的机器学习框架：

```
pip install torch
```

### 命令1

命令实际上安装了四个包，下面我分别解释一下：

| 包名               | 作用                                                               | 你为什么需要它                         |
| ---------------- | ---------------------------------------------------------------- | ------------------------------- |
| **transformers** | Hugging Face 的核心库，支持各种大模型（BERT、GPT、Llama、T5、Whisper 等）的加载、推理和微调。 | 🚀 没它就不能用任何 Hugging Face 模型。    |
| **datasets**     | 用来加载、切分和处理各种数据集（文本/图像/音频）。                                       | 📚 训练模型需要数据；这个库让你几行代码就能加载常见数据集。 |
| **evaluate**     | 用来计算评估指标，比如准确率、F1 值、BLEU 分数等。                                    | 📊 当你微调模型或对比效果时，需要它来计算性能。       |
| **accelerate**   | 用来自动管理硬件加速（GPU/多卡/混合精度训练）。                                       | ⚡ 让模型能在显卡、分布式环境下高效运行。           |

前面的 `!` 只是表示在 Jupyter Notebook 或 Colab 中执行 shell 命令。

如果你在命令行（终端 / VSCode Terminal）执行，可以去掉 !：

```
pip install transformers datasets evaluate accelerate
```

### 命令2

这是另一个必须安装的核心库。

因为 transformers 库本身只是“模型层的封装”，它需要依托于底层的深度学习框架，比如：

PyTorch（torch）

TensorFlow

JAX

Hugging Face 的文档默认推荐用 PyTorch（因为社区最活跃，也最常用于大模型训练）。

所以：

pip install torch 就是安装 PyTorch，提供计算、神经网络、GPU 加速等底层功能。

### 实战

我是在 Windows 的命令提示符（CMD）或 PowerShell 中运行这行命令，

而 `!pip` 是 Jupyter Notebook 或 Google Colab 专用语法，在普通命令行里不能用。

```
pip install transformers datasets evaluate accelerate
pip install torch
```

耐心等待安装完成。

确认安装情况：

```
pip show transformers datasets evaluate accelerate torch
```

会展示对应的版本信息

```
pip show transformers datasets evaluate accelerate torch
Name: transformers
Version: 4.57.1
Summary: State-of-the-art Machine Learning for JAX, PyTorch and TensorFlow
Home-page: https://github.com/huggingface/transformers
Author: The Hugging Face team (past and future) with the help of all our contributors (https://github.com/huggingface/transformers/graphs/contributors)
Author-email: transformers@huggingface.co
License: Apache 2.0 License
Location: D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages
Requires: filelock, huggingface-hub, numpy, packaging, pyyaml, regex, requests, safetensors, tokenizers, tqdm
Required-by:
---
Name: datasets
Version: 4.4.0
Summary: HuggingFace community-driven open-source library of datasets
Home-page: https://github.com/huggingface/datasets
Author: HuggingFace Inc.
Author-email: thomas@huggingface.co
License: Apache 2.0
Location: D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages
Requires: dill, filelock, fsspec, httpx, huggingface-hub, multiprocess, numpy, packaging, pandas, pyarrow, pyyaml, requests, tqdm, xxhash
Required-by: evaluate
---
Name: evaluate
Version: 0.4.6
Summary: HuggingFace community-driven open-source library of evaluation
Home-page: https://github.com/huggingface/evaluate
Author: HuggingFace Inc.
Author-email: leandro@huggingface.co
License: Apache 2.0
Location: D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages
Requires: datasets, dill, fsspec, huggingface-hub, multiprocess, numpy, packaging, pandas, requests, tqdm, xxhash
Required-by:
---
Name: accelerate
Version: 1.11.0
Summary: Accelerate
Home-page: https://github.com/huggingface/accelerate
Author: The HuggingFace team
Author-email: zach.mueller@huggingface.co
License: Apache
Location: D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages
Requires: huggingface_hub, numpy, packaging, psutil, pyyaml, safetensors, torch
Required-by:
---
Name: torch
Version: 2.9.0
Summary: Tensors and Dynamic neural networks in Python with strong GPU acceleration
Home-page:
Author:
Author-email: PyTorch Team <packages@pytorch.org>
License: BSD-3-Clause
Location: D:\Users\Administrator\AppData\Local\Programs\Python\Python313\Lib\site-packages
Requires: filelock, fsspec, jinja2, networkx, setuptools, sympy, typing-extensions
Required-by: accelerate
```






# 参考资料

https://huggingface.co/docs/transformers/main/zh/quicktour


* any list
{:toc}
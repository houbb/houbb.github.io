---
layout: post 
title: rasbt/LLMs-from-scratch 使用 PyTorch 从零开始逐步实现一个类似 ChatGPT 的大语言模型
date: 2026-05-13 21:01:55 +0800
categories: [AI]
tags: [ai, agent]
published: true
---

# GitHub - rasbt/LLMs-from-scratch: 使用 PyTorch 从零开始逐步实现一个类似 ChatGPT 的大语言模型

# 构建大语言模型（从零开始）

本仓库包含开发、预训练和微调一个类似 GPT 的大语言模型（LLM）的代码，是《构建大语言模型（从零开始）》一书的官方代码仓库。

在《构建大语言模型（从零开始）》一书中，你将通过从零开始、一步步地编写代码，从内到外学习和理解大语言模型的工作原理。在本书中，我将指导你创建自己的 LLM，并通过清晰的文字、图表和示例来解释每个阶段。

本书中描述的用于训练和开发你自己的小型但功能性模型（用于教育目的）的方法，与创建 ChatGPT 等大规模基础模型所使用的方法如出一辙。此外，本书还包含了加载更大的预训练模型权重以进行微调的代码。

*   指向官方源代码仓库的链接
*   指向 Manning（出版商网站）上本书页面的链接
*   指向 Amazon.com 上本书页面的链接
*   ISBN 9781633437166

要下载本仓库的副本，请单击“Download ZIP”按钮，或在终端中执行以下命令：

```bash
git clone --depth 1 https://github.com/rasbt/LLMs-from-scratch.git
```

（如果你从 Manning 网站下载了代码包，请访问 GitHub 上的官方代码仓库 https://github.com/rasbt/LLMs-from-scratch 以获取最新更新。）

# 目录

请注意，此 `README.md` 文件是一个 Markdown（`.md`）文件。如果你已从 Manning 网站下载此代码包并在本地计算机上查看，建议使用 Markdown 编辑器或预览器以获得正确的显示效果。如果你尚未安装 Markdown 编辑器，Ghostwriter 是一个不错的免费选择。

你也可以在浏览器中通过 GitHub 的 https://github.com/rasbt/LLMs-from-scratch 查看此文件及其他文件，GitHub 会自动渲染 Markdown。

> **提示：** 如果你正在寻求有关安装 Python 和 Python 包以及设置代码环境的指导，建议阅读 `setup` 目录中的 README.md 文件。

*   故障排除指南

| 章节标题 | 主要代码（快速访问） | 所有代码 + 补充材料 |
| :--- | :--- | :--- |
| 设置建议 / 如何最佳阅读本书 | - | - |
| 第 1 章：理解大语言模型 | 无代码 | - |
| 第 2 章：处理文本数据 | - `ch02.ipynb`<br>- `dataloader.ipynb`（摘要）<br>- `exercise-solutions.ipynb` | `./ch02` |
| 第 3 章：编写注意力机制 | - `ch03.ipynb`<br>- `multihead-attention.ipynb`（摘要）<br>- `exercise-solutions.ipynb` | `./ch03` |
| 第 4 章：从零开始实现 GPT 模型 | - `ch04.ipynb`<br>- `gpt.py`（摘要）<br>- `exercise-solutions.ipynb` | `./ch04` |
| 第 5 章：在未标注数据上进行预训练 | - `ch05.ipynb`<br>- `gpt_train.py`（摘要）<br>- `gpt_generate.py`（摘要）<br>- `exercise-solutions.ipynb` | `./ch05` |
| 第 6 章：为文本分类进行微调 | - `ch06.ipynb`<br>- `gpt_class_finetune.py`<br>- `exercise-solutions.ipynb` | `./ch06` |
| 第 7 章：为遵循指令进行微调 | - `ch07.ipynb`<br>- `gpt_instruction_finetuning.py`（摘要）<br>- `ollama_evaluate.py`（摘要）<br>- `exercise-solutions.ipynb` | `./ch07` |
| 附录 A：PyTorch 入门 | - `code-part1.ipynb`<br>- `code-part2.ipynb`<br>- `DDP-script.py`<br>- `exercise-solutions.ipynb` | `./appendix-A` |
| 附录 B：参考文献与进一步阅读 | 无代码 | `./appendix-B` |
| 附录 C：练习解答 | - 练习解答列表 | `./appendix-C` |
| 附录 D：为训练循环添加附加功能 | - `appendix-D.ipynb` | `./appendix-D` |
| 附录 E：使用 LoRA 进行参数高效微调 | - `appendix-E.ipynb` | `./appendix-E` |

以下思维模型总结了本书涵盖的内容。

## 先决条件

最重要的先决条件是扎实的 Python 编程基础。有了这些知识，你将做好充分准备，探索 LLM 的迷人世界，并理解本书中展示的概念和代码示例。

如果你对深度神经网络有一些经验，你可能会发现某些概念更熟悉，因为 LLM 就是建立在这些架构之上的。

本书使用 PyTorch 从零开始实现代码，没有使用任何外部 LLM 库。虽然精通 PyTorch 不是先决条件，但熟悉 PyTorch 基础知识无疑是有用的。如果你是 PyTorch 新手，附录 A 提供了对 PyTorch 的简洁介绍。或者，你可能会发现我的书《一小时学会 PyTorch：从张量到在多 GPU 上训练神经网络》有助于学习基础知识。

## 硬件要求

本书主要章节中的代码设计为在常规笔记本电脑上运行，且耗时合理，不需要专门的硬件。这种方法确保了广泛的受众能够接触这些材料。此外，如果 GPU 可用，代码会自动利用它。（请参阅设置文档以获取其他建议。）

## 视频课程

一个 17 小时 15 分钟的视频配套课程，我在其中逐章编写了本书的代码。该课程按章节和节组织，与本书结构镜像，因此可以作为本书的独立替代品或互补的代码伴随资源。

## 姊妹书 / 续作

《构建推理模型（从零开始）》虽然是一本独立的书，但可以被视为《构建大语言模型（从零开始）》的续作。

它从一个预训练模型开始，并实现了不同的推理方法，包括推理时缩放、强化学习和蒸馏，以提高模型的推理能力。

与《构建大语言模型（从零开始）》类似，《构建推理模型（从零开始）》采用动手实践的方法，从头开始实现这些方法。

*   Amazon 链接（待定）
*   Manning 链接
*   GitHub 仓库

## 练习

本书的每一章都包含几个练习。解答汇总在附录 C 中，相应的代码笔记本可在本仓库的主要章节文件夹中找到（例如，`./ch02/01_main-chapter-code/exercise-solutions.ipynb`）。

除了代码练习，你还可以从 Manning 网站下载一份免费的 170 页 PDF，题为“测试你对《构建大语言模型（从零开始）》的理解”。它包含每章大约 30 个测验问题和解答，以帮助你测试理解程度。

## 额外材料

几个文件夹包含可选材料，供感兴趣的读者作为额外福利：

*   **设置**
    *   Python 设置技巧
    *   安装本书使用的 Python 包和库
    *   Docker 环境设置指南
*   **第 2 章：处理文本数据**
    *   从零开始的字节对编码（BPE）分词器
    *   比较各种字节对编码（BPE）实现
    *   理解嵌入层和线性层之间的区别
    *   使用简单数字直观理解数据加载器
*   **第 3 章：编写注意力机制**
    *   比较高效的多头注意力实现
    *   理解 PyTorch 缓冲区
*   **第 4 章：从零开始实现 GPT 模型**
    *   FLOPs 分析
    *   KV 缓存
    *   注意力替代方案
        *   分组查询注意力
        *   多头潜在注意力
        *   滑动窗口注意力
        *   Gated DeltaNet
    *   混合专家（MoE）
*   **第 5 章：在未标注数据上进行预训练**
    *   替代的权重加载方法
    *   在 Project Gutenberg 数据集上预训练 GPT
    *   为训练循环添加附加功能
    *   优化预训练的超参数
    *   构建一个用户界面与预训练的 LLM 交互
    *   将 GPT 转换为 Llama
    *   内存高效的模型权重加载
    *   使用新标记扩展 Tiktoken BPE 分词器
    *   加速 LLM 训练的 PyTorch 性能技巧
    *   LLM 架构
        *   从零开始的 Llama 3.2
        *   从零开始的 Qwen3 Dense 和混合专家（MoE）
        *   从零开始的 Gemma 3
        *   从零开始的 Olmo 3
        *   从零开始的 Tiny Aya
        *   从零开始的 Qwen3.5
        *   从零开始的 Gemma 4 E2B 和 E4B
    *   第 5 章与其他 LLM 作为即插即用替代品（例如，Llama 3、Qwen 3）
*   **第 6 章：为分类进行微调**
    *   微调不同层和使用更大模型的附加实验
    *   在 5 万条 IMDB 电影评论数据集上微调不同模型
    *   构建一个用户界面与基于 GPT 的垃圾邮件分类器交互
*   **第 7 章：为遵循指令进行微调**
    *   用于查找近似重复项和创建被动语态条目的数据集实用程序
    *   使用 OpenAI API 和 Ollama 评估指令响应
    *   为指令微调生成数据集
    *   改进用于指令微调的数据集
    *   使用 Llama 3.1 70B 和 Ollama 生成偏好数据集
    *   用于 LLM 对齐的直接偏好优化（DPO）
    *   构建一个用户界面与经过指令微调的 GPT 模型交互

来自《从零开始构建推理模型》仓库的更多额外材料：

*   **Qwen3（从零开始）基础**
    *   Qwen3 源代码走读
    *   优化的 Qwen3
*   **评估**
    *   基于验证器的评估（MATH-500）
    *   多项选择评估（MMLU）
    *   LLM 排行榜评估
    *   LLM 作为评判者的评估
*   **推理缩放**
    *   自洽性
    *   自我优化
*   **强化学习（RL）**
    *   使用 GRPO 的 RLVR（基于规则的奖励验证的强化学习）

## 问题、反馈和对本仓库的贡献

我欢迎各种反馈，最好通过 Manning 论坛或 GitHub Discussions 分享。同样，如果你有任何问题或只是想与他人交流想法，请随时也在论坛中发帖。

请注意，由于本仓库包含与纸质书相对应的代码，我目前无法接受会扩展主要章节代码内容的贡献，因为那会引入与实体书的偏差。保持一致性有助于确保每个人都能获得顺畅的体验。

## 引用

如果你发现本书或代码对你的研究有用，请考虑引用它。

芝加哥格式引用：

> Raschka, Sebastian. *Build A Large Language Model (From Scratch)*. Manning, 2024. ISBN: 978-1633437166.

BibTeX 条目：

```bibtex
@book{build-llms-from-scratch-book,
  author       = {Sebastian Raschka},
  title        = {Build A Large Language Model (From Scratch)},
  publisher    = {Manning},
  year         = {2024},
  isbn         = {978-1633437166},
  url          = {https://www.manning.com/books/build-a-large-language-model-from-scratch},
  github       = {https://github.com/rasbt/LLMs-from-scratch}
}
```

## 关于

使用 PyTorch 从零开始逐步实现一个类似 ChatGPT 的大语言模型。

网址：amzn.to/4fqvn0D

# 参考资料

* any list
{:toc}
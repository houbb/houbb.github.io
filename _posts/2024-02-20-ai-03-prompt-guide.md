---
layout: post
title: AI-03-Prompt-Engineering-Guide 提示工程指南
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, chatgpt, gpt, sh]
published: true
---


# 提示工程指南

提示工程是一门相对较新的学科，用于开发和优化提示，以高效地利用语言模型（LMs）来应用于各种各样的应用和研究主题。

提示工程技能有助于更好地理解大型语言模型（LLMs）的能力和局限性。研究人员利用提示工程来提高LLMs在各种常见和复杂任务上的能力，如问答和算术推理。开发人员利用提示工程设计健壮有效的提示技术，与LLMs和其他工具进行接口交互。

受到开发LLMs的高度兴趣的驱动，我们创建了这份新的提示工程指南，其中包含了所有与LLMs的提示工程相关的最新论文、学习指南、讲座、参考资料和工具。

🌐 [提示工程指南（Web 版）](https://www.promptingguide.ai/)

我们与 Maven 合作，提供以下基于团队的现场课程：

- [面向所有人的LLMs](https://maven.com/dair-ai/llms-for-everyone)（初学者）- 了解最新的提示工程技术，以及如何有效地将它们应用于实际用例。
- [LLMs 的提示工程](https://maven.com/dair-ai/prompt-engineering-llms)（高级）- 学习高级提示工程技术，以构建具有LLMs的复杂用例和应用程序。

愉快的提示！

---
## 公告 / 更新

- 🎓 宣布了针对LLMs的新课程！[在此注册](https://maven.com/dair-ai/prompt-engineering-llms)！
- 💼 我们现在提供多种[服务](https://www.promptingguide.ai/services)，如企业培训、咨询和演讲。
- 🌐 我们现在支持13种语言！欢迎更多的翻译。
- 👩‍🎓 我们于2024年1月突破了300万学习者！
- 🎉 我们推出了指南的新Web版本[在此](https://www.promptingguide.ai/)
- 🔥 我们在2023年2月21日登上了 Hacker News 的第一名
- 🎉 提示工程讲座已上线[在此](https://youtu.be/dOxUroR57xs)

[加入我们的 Discord](https://discord.com/invite/SKgkVT8BGJ)

[在 Twitter 上关注我们](https://twitter.com/dair_ai)

[订阅我们的通讯](https://nlpnews.substack.com/)

---
## 指南
您还可以在我们的新网站[https://www.promptingguide.ai/](https://www.promptingguide.ai/)找到最新的指南。

- [提示工程 - 简介](https://www.promptingguide.ai/introduction)
  - [提示工程 - LLM 设置](https://www.promptingguide.ai/introduction/settings)
  - [提示工程 - 提示基础](https://www.promptingguide.ai/introduction/basics)
  - [提示工程 - 提示元素](https://www.promptingguide.ai/introduction/elements)
  - [提示工程 - 设计提示的一般技巧](https://www.promptingguide.ai/introduction/tips)
  - [提示工程 - 提示示例](https://www.promptingguide.ai/introduction/examples)
- [提示工程 - 技术](https://www.promptingguide.ai/techniques)
  - [提示工程 - 零样本提示](https://www.promptingguide.ai/techniques/zeroshot)
  - [提示工程 - 少样本提示](https://www.promptingguide.ai/techniques/fewshot)
  - [提示工程 - 思维链提示](https://www.promptingguide.ai/techniques/cot)
  - [提示工程 - 自我一致性](https://www.promptingguide.ai/techniques/consistency)
  - [提示工程 - 生成知识提示](https://www.promptingguide.ai/techniques/knowledge)
  - [提示工程 - 提示链](https://www.promptingguide.ai/techniques/prompt_chaining)
  - [提示工程 - 思维树（ToT）](https://www.promptingguide.ai/techniques/tot)
  - [提示工程 - 检索增强生成](https://www.promptingguide.ai/techniques/rag)
  - [提示工程 - 自动推理和工具使用（ART）](https://www.promptingguide.ai/techniques/art)
  - [提示工程 - 自动提示工程师](https://www.promptingguide.ai/techniques/ape)
  - [提示工程 - 主动提示](https://www.promptingguide.ai/techniques/activeprompt)
  - [提示工程 - 方向刺激提示](https://www.promptingguide.ai/techniques/dsp)
  - [提示工程 - 程序辅助语言模型](https://www.promptingguide.ai/techniques/pal)
  - [提示工程 - ReAct提示](https://www.promptingguide.ai/techniques/react)
  - [提示工程 - 多模式CoT提示](https://www.promptingguide.ai/techniques/multimodalcot)
  - [提示工程 - 图提示](https://www.promptingguide.ai/techniques/graph)
- [提示工程 - 应用](https://www.promptingguide.ai/applications)
  - [提示工程 - 函数调用](https://www.promptingguide.ai/applications/function_calling)
  - [提示工程 - 生成数据](https://www.promptingguide.ai/applications/generating)
  - [提示工程 - 为RAG生成合成数据集](https://www.promptingguide.ai/applications/synthetic_rag)
  - [提示工程 - 处理生成的数据集多样性](https://www.promptingguide.ai/applications/generating_textbooks)
  - [提示工程 - 生成代码](https://www.promptingguide.ai/applications/coding)


  - [提示工程 - 研究生职位分类案例研究](https://www.promptingguide.ai/applications/workplace_casestudy)
- [提示工程 - 提示中心](https://www.promptingguide.ai/prompts)
  - [提示工程 - 分类](https://www.promptingguide.ai/prompts/classification)
  - [提示工程 - 编码](https://www.promptingguide.ai/prompts/coding)
  - [提示工程 - 创造力](https://www.promptingguide.ai/prompts/creativity)
  - [提示工程 - 评估](https://www.promptingguide.ai/prompts/evaluation)
  - [提示工程 - 信息提取](https://www.promptingguide.ai/prompts/information-extraction)
  - [提示工程 - 图像生成](https://www.promptingguide.ai/prompts/image-generation)
  - [提示工程 - 数学](https://www.promptingguide.ai/prompts/mathematics)
  - [提示工程 - 问答](https://www.promptingguide.ai/prompts/question-answering)
  - [提示工程 - 推理](https://www.promptingguide.ai/prompts/reasoning)
  - [提示工程 - 文本摘要](https://www.promptingguide.ai/prompts/text-summarization)
  - [提示工程 - 真实性](https://www.promptingguide.ai/prompts/truthfulness)
  - [提示工程 - 对抗性提示](https://www.promptingguide.ai/prompts/adversarial-prompting)
- [提示工程 - 模型](https://www.promptingguide.ai/models)
  - [提示工程 - ChatGPT](https://www.promptingguide.ai/models/chatgpt)
  - [提示工程 - Code Llama](https://www.promptingguide.ai/models/code-llama)
  - [提示工程 - Flan](https://www.promptingguide.ai/models/flan)
  - [提示工程 - Gemini](https://www.promptingguide.ai/models/gemini)
  - [提示工程 - GPT-4](https://www.promptingguide.ai/models/gpt-4)
  - [提示工程 - LLaMA](https://www.promptingguide.ai/models/llama)
  - [提示工程 - Mistral 7B](https://www.promptingguide.ai/models/mistral-7b)
  - [提示工程 - Mixtral](https://www.promptingguide.ai/models/mixtral)
  - [提示工程 - OLMo](https://www.promptingguide.ai/models/olmo)
  - [提示工程 - Phi-2](https://www.promptingguide.ai/models/phi-2)
  - [提示工程 - 模型集合](https://www.promptingguide.ai/models/collection)
- [提示工程 - 风险与误用](https://www.promptingguide.ai/risks)
  - [提示工程 - 对抗性提示](https://www.promptingguide.ai/risks/adversarial)
  - [提示工程 - 真实性](https://www.promptingguide.ai/risks/factuality)
  - [提示工程 - 偏见](https://www.promptingguide.ai/risks/biases)
- [提示工程 - 论文](https://www.promptingguide.ai/papers)
  - [提示工程 - 概述](https://www.promptingguide.ai/papers#overviews)
  - [提示工程 - 方法](https://www.promptingguide.ai/papers#approaches)
  - [提示工程 - 应用](https://www.promptingguide.ai/papers#applications)
  - [提示工程 - 集合](https://www.promptingguide.ai/papers#collections)
- [提示工程 - 工具](https://www.promptingguide.ai/tools)
- [提示工程 - 笔记本](https://www.promptingguide.ai/notebooks)
- [提示工程 - 数据集](https://www.promptingguide.ai/datasets)
- [提示工程 - 附加阅读](https://www.promptingguide.ai/readings)

---
## 讲座

我们发布了一小时的讲座，全面介绍了提示技术、应用和工具。
- [视频讲座](https://youtu.be/dOxUroR57xs)
- [带代码的笔记本](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/notebooks/pe-lecture.ipynb)
- [幻灯片](https://github.com/dair-ai/Prompt-Engineering-Guide/blob/main/lecture/Prompt-Engineering-Lecture-Elvis.pdf)

---
## 本地运行指南

要在本地运行指南，例如检查新翻译的正确实现，您需要：

1. 安装 Node >=18.0.0
2. 如果系统中没有安装，请安装 `pnpm`。详细说明请参见[此处](https://pnpm.io/installation)。
3. 安装依赖项：`pnpm i next react react-dom nextra nextra-theme-docs`
4. 使用 `pnpm dev` 启动指南
5. 在 `http://localhost:3000/` 中浏览指南

---
## 出现场合
我们曾经出现过的一些地方：
- 华尔街日报 - [ChatGPT 可以给出很好的答案。但前提是您知道如何提出正确的问题](https://www.wsj.com/articles/chatgpt-ask-the-right-question-12d0f035)
- 福布斯 - [妈妈，爸爸，我想成为提示工程师](https://www.forbes.com/sites/craigsmith/2023/04/05/mom-dad-i-want-to-be-a-prompt-engineer/?sh=7f1213159c8e)
- Markettechpost - [2023年最佳免费提示工程资源](https://www.marktechpost.com/2023/04/04/best-free-prompt-engineering-resources-2023/)

---
如果您正在为您的工作或研究使用该指南，请如下引用我们：

```
@article{Saravia_Prompt_Engineering_Guide_2022,
author = {Saravia, Elvis},
journal = {https://github.com/dair-ai/Prompt-Engineering-Guide},
month = {12},
title = {{Prompt Engineering Guide}},
year = {2022}
}
```

## 许可证

[MIT 许可证](https://github.com

/dair-ai/Prompt-Engineering-Guide/blob/main/LICENSE.md)

如果您认为有什么遗漏，请随时提交 PR。我们始终欢迎反馈和建议。只需提出问题！

# 参考资料

https://github.com/dair-ai/Prompt-Engineering-Guide

https://www.promptingguide.ai/zh/introduction/basics

* any list
{:toc}

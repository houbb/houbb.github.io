---
layout: post
title: AI-09-openai cookbook 网络相关资源
date: 2024-02-20 21:01:55 +0800
categories: [AI]
tags: [ai, aigc, chatgpt, gpt, sh]
published: true
---

# 网络相关资源

人们正在编写出色的工具和论文，以改善 GPT 的输出。以下是我们看到的一些很酷的工具：

## 提示库与工具（按字母顺序排列）

- [Arthur Shield](https://www.arthur.ai/get-started)：用于检测有毒、幻觉、提示注入等的付费产品。
- [Baserun](https://baserun.ai/)：用于测试、调试和监控基于 LLM 的应用程序的付费产品。
- [Chainlit](https://docs.chainlit.io/overview)：用于创建聊天机器人界面的 Python 库。
- [Embedchain](https://github.com/embedchain/embedchain)：用于管理和同步非结构化数据与 LLM 的 Python 库。
- [FLAML（自动机器学习和调优快速库）](https://microsoft.github.io/FLAML/docs/Getting-Started/)：用于自动选择模型、超参数和其他可调选项的 Python 库。
- [Guardrails.ai](https://shreyar.github.io/guardrails/)：用于验证输出和重试失败的 Python 库。仍处于 alpha 阶段，因此请预期存在一些尖锐的边缘和错误。
- [Guidance](https://github.com/microsoft/guidance)：使用 Handlebars 模板将生成、提示和逻辑控制交错的 Microsoft Python 库。
- [Haystack](https://github.com/deepset-ai/haystack)：用于构建可定制、生产就绪的 LLM 应用程序的开源 LLM 编排框架，使用 Python 实现。
- [HoneyHive](https://honeyhive.ai)：用于评估、调试和监控 LLM 应用程序的企业平台。
- [LangChain](https://github.com/hwchase17/langchain)：用于链接语言模型提示序列的流行 Python/JavaScript 库。
- [LiteLLM](https://github.com/BerriAI/litellm)：用于以一致的格式调用 LLM API 的最小 Python 库。
- [LlamaIndex](https://github.com/jerryjliu/llama_index)：用于为 LLM 应用程序增加数据的 Python 库。
- [LMQL](https://lmql.ai)：一种用于 LLM 交互的编程语言，支持类型提示、控制流、约束和工具。
- [OpenAI Evals](https://github.com/openai/evals)：用于评估语言模型和提示任务性能的开源库。
- [Outlines](https://github.com/normal-computing/outlines)：提供领域特定语言以简化提示并限制生成的 Python 库。
- [Parea AI](https://www.parea.ai)：用于调试、测试和监控 LLM 应用程序的平台。
- [Portkey](https://portkey.ai/)：用于 LLM 应用程序的可观察性、模型管理、评估和安全性的平台。
- [Promptify](https://github.com/promptslab/Promptify)：用语言模型执行自然语言处理任务的小型 Python 库。
- [PromptPerfect](https://promptperfect.jina.ai/prompts)：用于测试和改进提示的付费产品。
- [Prompttools](https://github.com/hegelai/prompttools)：用于测试和评估模型、向量数据库和提示的开源 Python 工具。
- [Scale Spellbook](https://scale.com/spellbook)：用于构建、比较和发布语言模型应用程序的付费产品。
- [Semantic Kernel](https://github.com/microsoft/semantic-kernel)：来自 Microsoft 的支持提示模板化、函数链接、矢量化内存和智能规划的 Python/C#/Java 库。
- [Vellum](https://www.vellum.ai/)：用于尝试、评估和部署先进的 LLM 应用程序的付费 AI 产品开发平台。
- [Weights & Biases](https://wandb.ai/site/solutions/llmops)：用于跟踪模型训练和提示工程实验的付费产品。
- [YiVal](https://github.com/YiVal/YiVal)：使用可定制的数据集、评估方法和进化策略调整和评估提示、检索配置和模型参数的开源 GenAI-Ops 工具。

## 提示指南

- [Brex 的提示工程指南](https://github.com/brexhq/prompt-engineering)：Brex 对语言模型和提示工程的介绍。
- [learnprompting.org](https://learnprompting.org/)：提示工程的入门课程。
- [Lil'Log 的提示工程](https://lilianweng.github.io/posts/2023-03-15-prompt-engineering/)：一位 OpenAI 研究员对提示工程文献的回顾（截至 2023 年 3 月）。
- [OpenAI Cookbook: 提高可靠性的技术](https://cookbook.openai.com/articles/techniques_to_improve_reliability)：对提升语言模型提示的技术进行了稍微陈旧（2022 年 9 月）的回顾。
- [promptingguide.ai](https://www.promptingguide.ai/)：演示了许多提示工程技术的提示工程指南。
- [Xavi Amatriain 的提示工程 101 简介](https://amatriain.net/blog/PromptEngineering) 和 [202 高级提示工程](https://amatriain.net/blog/prompt201)：对提示工程的基本但带有偏见的介绍以及一系列包含从 CoT 开始的许多高级方法的跟进收藏。

## 视频课程

- [Andrew Ng 的 DeepLearning.AI](https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/)：面向开发者的提示工程短期课程。
- [Andre

j Karpathy 的 Let's build GPT](https://www.youtube.com/watch?v=kCc8FmEb1nY)：深入探讨 GPT 背后的机器学习。
- [DAIR.AI 的提示工程](https://www.youtube.com/watch?v=dOxUroR57xs)：关于各种提示工程技术的一个小时视频。
- [Scrimba 关于 Assistants API 的课程](https://scrimba.com/learn/openaiassistants)：关于 Assistants API 的 30 分钟互动课程。
- [LinkedIn 课程：提示工程：如何与 AI 对话](https://www.linkedin.com/learning/prompt-engineering-how-to-talk-to-the-ais/talking-to-the-ais?u=0)：提示工程的短视频介绍。

## 用于改善推理的高级提示论文

- [链式思考提示激发大型语言模型的推理](https://arxiv.org/abs/2201.11903)（2022 年）：使用少量提示逐步引导模型思考改善其推理能力。PaLM 在数学问题（GSM8K）上的得分从 18% 提升至 57%。
- [自一致性提高链式思考推理的大型语言模型](https://arxiv.org/abs/2203.11171)（2022 年）：从多个输出中收集投票可以进一步提高准确性。跨 40 个输出进行投票将 PaLM 在数学问题上的得分进一步提高，从 57% 提升至 74%，`code-davinci-002` 的得分从 60% 提升至 78%。
- [思维树：利用大型语言模型进行深思熟虑的问题解决](https://arxiv.org/abs/2305.10601)（2023 年）：在逐步推理的树中搜索比在链式思考的投票中更有帮助。它提高了 `GPT-4` 在创意写作和填字游戏上的得分。
- [语言模型是零射推理器](https://arxiv.org/abs/2205.11916)（2022 年）：告诉遵循指令的模型逐步思考可以提高其推理能力。将 `text-davinci-002` 在数学问题上的得分（GSM8K）从 13% 提升至 41%。
- [大型语言模型是人类级提示工程师](https://arxiv.org/abs/2211.01910)（2023 年）：通过自动搜索可能的提示，找到了一个将数学问题（GSM8K）的得分提高到 43% 的提示，比《语言模型是零射推理器》中人类编写的提示高出 2 个百分点。
- [RePrompting：通过 Gibbs 抽样实现自动链式思考提示推理](https://arxiv.org/abs/2305.09993)（2023 年）：通过自动搜索可能的链式思考提示来改进 ChatGPT 在几个基准测试中的得分，提高了 0–20 个百分点。
- [信实推理使用大型语言模型](https://arxiv.org/abs/2208.14271)（2022 年）：通过一个系统来结合多个因素来提高推理能力：通过选择备用选择和推理提示生成的思维链、选择何时停止选择-推理循环的制动器模型、搜索多个推理路径的值函数以及帮助避免幻觉的句子标签。
- [STaR：利用推理进行推理的启动（2022 年）](https://arxiv.org/abs/2203.14465)：通过微调将思维链式推理嵌入模型。对于有答案键的任务，可以由语言模型生成示例思维链。
- [ReAct：在语言模型中协同推理和行动（2023 年）](https://arxiv.org/abs/2210.03629)：对于具有工具或环境的任务，如果您在**推理**（思考要做什么）和**行动**（从工具或环境获取信息）之间规定性地交替，链式思考效果更好。
- [反思：具有动态记忆和自我反思的自主代理（2023 年）](https://arxiv.org/abs/2303.11366)：通过记忆先前失败来重试任务，可以提高后续性能。
- [演示-搜索-预测：为知识密集型 NLP 组合检索和语言模型](https://arxiv.org/abs/2212.14024)：通过“检索-然后阅读”来增强知识的模型可以通过多跳的搜索链式来改进。
- [通过多代理辩论改善大型语言模型的事实性和推理性（2023 年）](https://arxiv.org/abs/2305.14325)：在几个 ChatGPT 代理之间进行几轮辩论可以提高各种基准测试的得分。数学问题的得分从 77% 提升至 85%。


# 参考资料

https://cookbook.openai.com/articles/related_resources

* any list
{:toc}

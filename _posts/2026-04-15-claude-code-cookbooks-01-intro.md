---
layout: post 
title: Claude Cookbooks 提供了旨在帮助开发者使用 Claude 进行构建的代码和指南
date: 2026-04-15 21:01:55 +0800
categories: [AI]
tags: [ai, llm, claude-code]
published: true
---


# Claude Cookbooks

Claude Cookbooks 提供了旨在帮助开发者使用 Claude 进行构建的代码和指南，提供了可直接复制并轻松集成到您自己项目中的代码片段。

## 前置条件

为了充分利用本 cookbook 中的示例，您需要一个 Claude API 密钥（可[在此处](https://www.anthropic.com)免费注册）。

虽然代码示例主要使用 Python 编写，但这些概念可以适配到任何支持与 Claude API 交互的编程语言。

如果您是 Claude API 的新手，我们建议您从我们的 [Claude API 基础课程](https://github.com/anthropics/courses/tree/master/anthropic_api_fundamentals)开始，以打下坚实的基础。

## 进一步探索

正在寻找更多资源来增强您使用 Claude 和 AI 助手的体验？请查看以下有用的链接：

- [Anthropic 开发者文档](https://docs.claude.com/claude/docs/guide-to-anthropics-prompt-engineering-resources)
- [Anthropic 支持文档](https://support.anthropic.com)
- [Anthropic Discord 社区](https://www.anthropic.com/discord)

## 贡献

Claude Cookbooks 得益于开发者社区的贡献而蓬勃发展。我们重视您的意见，无论是提交想法、修复错别字、添加新指南还是改进现有指南。通过贡献，您将帮助使这个资源对每个人都更有价值。

为避免重复劳动，请在贡献之前查看现有的 issues 和 pull requests。

如果您有新示例或指南的想法，请在 [issues 页面](https://github.com/anthropics/anthropic-cookbook/issues)上分享。

## 示例目录

### 能力
- [分类](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/classification)：探索使用 Claude 进行文本和数据分类的技术。
- [检索增强生成](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/retrieval_augmented_generation)：学习如何使用外部知识增强 Claude 的响应。
- [摘要](https://github.com/anthropics/anthropic-cookbook/tree/main/capabilities/summarization)：探索使用 Claude 进行有效文本摘要的技术。

### 工具使用与集成
- [工具使用](https://github.com/anthropics/anthropic-cookbook/tree/main/tool_use)：学习如何将 Claude 与外部工具和函数集成，以扩展其能力。
  - [客服代理](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/customer_service_agent.ipynb)
  - [计算器集成](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/calculator_tool.ipynb)
  - [SQL 查询](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_make_sql_queries.ipynb)

### 第三方集成
- [检索增强生成](https://github.com/anthropics/anthropic-cookbook/tree/main/third_party)：使用外部数据源补充 Claude 的知识。
  - [向量数据库（Pinecone）](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Pinecone/rag_using_pinecone.ipynb)
  - [维基百科](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/Wikipedia/wikipedia-search-cookbook.ipynb/)
  - [网页](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/read_web_pages_with_haiku.ipynb)
- [使用 Voyage AI 生成嵌入](https://github.com/anthropics/anthropic-cookbook/blob/main/third_party/VoyageAI/how_to_create_embeddings.md)

### 多模态能力
- [Claude 视觉能力](https://github.com/anthropics/anthropic-cookbook/tree/main/multimodal)：
  - [图像入门](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/getting_started_with_vision.ipynb)
  - [视觉最佳实践](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/best_practices_for_vision.ipynb)
  - [解读图表](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/reading_charts_graphs_powerpoints.ipynb)
  - [从表单中提取内容](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/how_to_transcribe_text.ipynb)
- [使用 Claude 生成图像](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/illustrated_responses.ipynb)：将 Claude 与 Stable Diffusion 结合用于图像生成。

### 高级技术
- [子代理](https://github.com/anthropics/anthropic-cookbook/blob/main/multimodal/using_sub_agents.ipynb)：学习如何将 Haiku 作为子代理与 Opus 结合使用。
- [向 Claude 上传 PDF](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/pdf_upload_summarization.ipynb)：将 PDF 解析为文本并传递给 Claude。
- [自动化评估](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_evals.ipynb)：使用 Claude 自动化提示词评估过程。
- [启用 JSON 模式](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb)：确保 Claude 输出一致的 JSON。
- [创建审核过滤器](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/building_moderation_filter.ipynb)：使用 Claude 为您的应用程序创建内容审核过滤器。
- [提示词缓存](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.ipynb)：学习使用 Claude 进行高效提示词缓存的技术。

## 其他资源

- [Anthropic on AWS](https://github.com/aws-samples/anthropic-on-aws)：探索在 AWS 基础设施上使用 Claude 的示例和解决方案。
- [AWS Samples](https://github.com/aws-samples/)：来自 AWS 的代码示例集合，可适配用于 Claude。请注意，某些示例可能需要进行修改才能在 Claude 上达到最佳效果。


# 参考资料

* any list
{:toc}
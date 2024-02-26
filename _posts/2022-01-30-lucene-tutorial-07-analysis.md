---
layout: post
title: Lucene Tutorial-07-Lucene 搜索引擎入门教程 Lucene - Analysis
date: 2022-01-29 21:01:55 +0800 
categories: [Lucene]
tags: [Lucene, search, NLP, sh]
published: true
---

在我们之前的章节中，我们已经了解到Lucene使用IndexWriter对文档进行分析，使用Analyzer创建/打开/编辑所需的索引。在本章中，我们将讨论各种类型的Analyzer对象和其他相关对象，这些对象在分析过程中使用。理解分析过程以及分析器的工作原理将使您深入了解Lucene如何索引文档。

以下是我们将在适当时讨论的对象列表。

| 序号 | 类名及描述 |
|------|-------------|
| 1    | Token  Token表示文档中的文本或单词，并包含相关的详细信息，如其元数据（位置、起始偏移量、结束偏移量、令牌类型及其位置增量）。 |
| 2    | TokenStream  TokenStream是分析过程的输出，它由一系列令牌组成。它是一个抽象类。 |
| 3    | Analyzer  这是每种类型的分析器的抽象基类。 |
| 4    | WhitespaceAnalyzer  此分析器根据空白符拆分文档中的文本。 |
| 5    | SimpleAnalyzer  此分析器根据非字母字符拆分文档中的文本，并将文本转换为小写。 |
| 6    | StopAnalyzer  此分析器的工作方式与SimpleAnalyzer相同，并删除常见词汇，如'a'、'an'、'the'等。 |
| 7    | StandardAnalyzer  这是最复杂的分析器，能够处理名称、电子邮件地址等。它将每个令牌转换为小写，并删除常见词汇和标点符号（如果有）。 |

# 参考资料

https://www.tutorialspoint.com/lucene/lucene_search_operation.htm

* any list
{:toc}
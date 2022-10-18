---
layout: post
title: DeepLearning4j-10-Sentence Iterator 句子迭代器
date:  2022-10-14 09:22:02 +0800  
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# Sentence Iterator 句子迭代器

Word2vec 和 Bag of Words 中都使用了句子迭代器。

它以向量的形式将文本位输入神经网络，还涵盖了文本处理中的文档概念。

在自然语言处理中，文档或句子通常用于封装算法应该学习的上下文。

一些例子包括分析推文和全面的新闻文章。句子迭代器的目的是将文本划分为可处理的位。

请注意，句子迭代器与输入无关。因此，一些文本（文档）可以来自文件系统、Twitter API 或 Hadoop。

根据输入的处理方式，句子迭代器的输出将被传递给分词器以处理单个词，这些词通常是单词，但也可以是 ngram、skipgram 或其他单元。

分词器由分词器工厂基于每个句子创建。标记器工厂是传递给文本处理矢量器的东西。

一些典型的例子如下：

```java
SentenceIterator iter = new LineSentenceIterator(new File("your file"));
```

这假定文件中的每一行都是一个句子。

您还可以将字符串列表作为句子执行，如下所示：

```java
Collection<String> sentences = ...;
SentenceIterator iter = new CollectionSentenceIterator(sentences);
```

这将假设每个字符串都是一个句子（文档）。 

请记住，这可能是推文或文章列表——两者都适用。

您可以按如下方式遍历文件：

```java
SentenceIterator iter = new FileSentenceIterator(new File("your dir or file"));
```

这将逐行解析文件并返回每个句子。

对于任何复杂的事情，我们推荐任何可以实现比空格分隔令牌更深入支持的管道。

# 参考资料

https://deeplearning4j.konduit.ai/deeplearning4j/tutorials/language-processing/sentence-iterator

* any list
{:toc}
---
layout: post
title: DeepLearning4j-12-Vocabulary Cache 词汇缓存
date:  2022-10-14 09:22:02 +0800  
categories: [AI]
tags: [ai, dl4j, ml, sh]
published: true
---

# 词汇缓存

DL4J 中处理一般 NLP 任务的机制。

词汇缓存或词汇缓存是 Deeplearning4j 中用于处理通用自然语言任务的一种机制，包括普通的 TF-IDF、词向量和某些信息检索技术。

词汇缓存的目标是成为文本向量化的一站式商店，封装词袋和词向量常用的技术等。

词汇缓存通过倒排索引处理标记、字数频率、逆文档频率和文档出现的存储。 InMemoryLookupCache 是参考实现。

为了在迭代文本和索引标记时使用词汇缓存，您需要确定标记是否应该包含在词汇中。标准通常是标记是否在语料库中以超过某个预先配置的频率出现。

低于该频率，单个标记不是词汇，它仍然只是一个标记。

我们也跟踪 tokens。为了跟踪 tokens，请执行以下操作：

```java
addToken(new VocabWord(1.0,"myword"));
```

当您要添加词汇时，请执行以下操作：

```java
addWordToIndex(0, Word2Vec.UNK);
putVocabWord(Word2Vec.UNK);
```

将单词添加到索引会设置索引。 然后你将它声明为一个词汇。 

（将其声明为词汇词将从索引中提取该词。）

# 参考资料

https://deeplearning4j.konduit.ai/deeplearning4j/tutorials/language-processing/vocabulary-cache

* any list
{:toc}
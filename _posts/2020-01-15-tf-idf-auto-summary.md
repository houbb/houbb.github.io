---
layout: post
title: TF-IDF 自动生成文章摘要
date:  2020-1-9 10:09:32 +0800
categories: [Search]
tags: [search, reverse-index, nlp, sh]
published: true
---

# 自动摘要

有时候，很简单的数学方法，就可以完成很复杂的任务。

这个系列的前两部分就是很好的例子。

仅仅依靠统计词频，就能找出关键词和相似文章。

虽然它们算不上效果最好的方法，但肯定是最简便易行的方法。

今天，依然继续这个主题。讨论如何通过词频，对文章进行[自动摘要（Automatic summarization）](http://en.wikipedia.org/wiki/Automatic_summarization)。

如果能从3000字的文章，提炼出150字的摘要，就可以为读者节省大量阅读时间。由人完成的摘要叫"人工摘要"，由机器完成的就叫"自动摘要"。

许多网站都需要它，比如论文网站、新闻网站、搜索引擎等等。

2007年，美国学者的论文 [《A Survey on Automatic Text Summarization》](http://www.cs.cmu.edu/~nasmith/LS2/das-martins.07.pdf)（Dipanjan Das, Andre F.T. Martins, 2007）总结了目前的自动摘要算法。

其中，很重要的一种就是词频统计。

这种方法最早出自1958年的IBM公司科学家H.P. Luhn的论文[《The Automatic Creation of Literature Abstracts》](http://www.di.ubi.pt/~jpaulo/competence/general/(1958)Luhn.pdf)。

Luhn博士认为，文章的信息都包含在句子中，有些句子包含的信息多，有些句子包含的信息少。

## 如何寻找自动摘要

"自动摘要"就是要找出那些包含信息最多的句子。

**句子的信息量用"关键词"来衡量。如果包含的关键词越多，就说明这个句子越重要。**

Luhn提出用"簇"（cluster）表示关键词的聚集。所谓"簇"就是包含多个关键词的句子片段。

![cluster](http://www.ruanyifeng.com/blogimg/asset/201303/bg2013032502.png)

上图就是Luhn原始论文的插图，被框起来的部分就是一个"簇"。

只要关键词之间的距离小于"门槛值"，它们就被认为处于同一个簇之中。Luhn建议的门槛值是4或5。也就是说，如果两个关键词之间有5个以上的其他词，就可以把这两个关键词分在两个簇。

## 分值的计算

下一步，对于每个簇，都计算它的重要性分值。

```
簇的重要性=(包含关键字的数量^2)/簇的长度
```

以前图为例，其中的簇一共有7个词，其中4个是关键词。因此，它的重要性分值等于 ( 4 x 4 ) / 7 = 2.3。

然后，找出包含分值最高的簇的句子（比如5句），把它们合在一起，就构成了这篇文章的自动摘要。

具体实现可以参见 [《Mining the Social Web: Analyzing Data from Facebook, Twitter, LinkedIn, and Other Social Media Sites》（O'Reilly, 2011）](http://www.amazon.com/Mining-Social-Web-Analyzing-Facebook/dp/1449388345)一书的第8章，python代码见 [github](https://github.com/ptwobrussell/Mining-the-Social-Web/blob/master/python_code/blogs_and_nlp__summarize.py)。

## 算法的简化

Luhn的这种算法后来被简化，不再区分"簇"，只考虑句子包含的关键词。

下面就是一个例子（采用伪码表示），只考虑关键词首先出现的句子。

```java
Summarizer(originalText, maxSummarySize):

　　　　// 计算原始文本的词频，生成一个数组，比如[(10,'the'), (3,'language'), (8,'code')...]
　　　　wordFrequences = getWordCounts(originalText)

　　　　// 过滤掉停用词，数组变成[(3, 'language'), (8, 'code')...]
　　　　contentWordFrequences = filtStopWords(wordFrequences)

　　　　// 按照词频进行排序，数组变成['code', 'language'...]
　　　　contentWordsSortbyFreq = sortByFreqThenDropFreq(contentWordFrequences)

　　　　// 将文章分成句子
　　　　sentences = getSentences(originalText)

　　　　// 选择关键词首先出现的句子
　　　　setSummarySentences = {}
　　　　foreach word in contentWordsSortbyFreq:
　　　　　　firstMatchingSentence = search(sentences, word)
　　　　　　setSummarySentences.add(firstMatchingSentence)
　　　　　　if setSummarySentences.size() = maxSummarySize:
　　　　　　　　break

　　　　// 将选中的句子按照出现顺序，组成摘要
　　　　summary = ""
　　　　foreach sentence in sentences:
　　　　　　if sentence in setSummarySentences:
　　　　　　　　summary = summary + " " + sentence

　　　　return summary
```

类似的算法已经被写成了工具，比如基于Java的Classifier4J库的SimpleSummariser模块、基于C语言的OTS库、以及基于classifier4J的C#实现和python实现。

# 个人收获

这些算法都可以归结到 segment 框架中，便于统一使用。

后期直接放在 [jieba 分词实现](https://github.com/houbb/segment) 项目中即可。

## 文本样式

目录+关键词+自动摘要

同义词+敏感词+相似度（无法实现，手中没有大量的文档）

# 拓展阅读

前缀树 Trie Tree 算法

Regex 与 DFA 算法

分词算法

关键词提取算法

摘要生成算法

相似度分析算法

倒排索引

# 参考资料

[TF-IDF与余弦相似性的应用（一）：相似性判断](http://www.ruanyifeng.com/blog/2013/03/cosine_similarity.html)

* any list
{:toc}
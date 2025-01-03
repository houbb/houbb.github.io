---
layout: post
title: jieba-fenci 03 结巴分词与繁简体转换 segment
date:  2020-1-8 10:09:32 +0800
categories: [Java]
tags: [java, nlp, sf]
published: true
---

# 拓展阅读

[DFA 算法详解](https://houbb.github.io/2020/01/07/sensitive-word-dfa)

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

> [敏感词 sensitive-word](https://github.com/houbb/sensitive-word)

> [分词 segment](https://github.com/houbb/segment)

## 分词系列专题

[jieba-fenci 01 结巴分词原理讲解 segment](https://houbb.github.io/2020/01/08/jieba-source-01-overview)

[jieba-fenci 02 结巴分词原理讲解之数据归一化 segment](https://houbb.github.io/2020/01/08/jieba-source-02-normalize)

[jieba-fenci 03 结巴分词与繁简体转换 segment](https://houbb.github.io/2020/01/08/jieba-source-03-chinese-format)

[jieba-fenci 04 结巴分词之词性标注实现思路 speechTagging segment](https://houbb.github.io/2020/01/08/jieba-source-04-pos-tagging)

[jieba-fenci 05 结巴分词之简单聊一聊](https://houbb.github.io/2020/01/08/jieba-source-05-chat)


# 结巴分词

请参考 [结巴分词原理](https://houbb.github.io/2020/01/08/jieba-source)。

## 结巴分词的不足

这里是针对如果使用繁简体转换，仅仅想使用分词。

那么结巴分词会有哪些不足呢？

- HMM 是一种面向未来的分词（预测），但是繁体是一种面向过去的（词组/字固定）

看似非常有用的 HMM，到了繁简体转换全部成为了鸡肋。

- 词库较大。

结巴分词是面向全体汉字分组的，所以分词的词库较大，这对于繁简体转换的词组某种程度而言是多余的。

- 前缀树算法内存占用过大

前缀树的性能相对是非常占优势的，但是内存占用较多。

可是繁简体词组一般为 2-4 个字，那么这种空间和时间的平衡能否重新界定？

比如直接存储在一个 set 中，直接截取 2、3、4 个字进行匹配，最多也就三次，而 trie-tree 也要至少两次的匹配。

如果是贪心算法，可以倒过来。从 432 开始匹配。

- 概率

结巴分词需要考虑的是一个概率问题，比如 `台中` 和 `台、中`。

到底是单字还是一个词？这个分词的结果是按照概率来的。

但是如何确定一个词到底是否是一个词，这个界定真的很模糊，除非结合这个词的上下文。

我个人觉得对于繁简体拆分，这个概率是可以牺牲的。

# 判断与替换的同时进行

## 以前的实现

以前的实现 opencc4j 的时候，主要考虑的是将各个部分拆分开，便于后期拓展和优化。

比如分词，可以采用各种不同的分词策略。

## 自定义分词与映射

如果采用自定义分词，其实在分词的时候，可以做到同时进行映射。

但是作用不见得很大，可以考虑下。

# 多线程

对于大文本，使用单线程处理，显然是一件很蠢的事情。

毕竟现在是多核的时代，java 对于多线程的支持也日渐成熟。

后期可以考虑使用多线程对大文本进行拆分，并行处理。

## 代价与收益

如果一个文本很短，拆分的收益反而是不如线程的上线文切换带来的消耗。

所以这里有个阈值去判断，当超过特定长度的文本，使用多线程会受益大于代价。

这个需要进行压测，实际数据说话。

# 参考资料

[对Python中文分词模块结巴分词算法过程的理解和分析](https://blog.csdn.net/rav009/article/details/12196623)

* any list
{:toc}
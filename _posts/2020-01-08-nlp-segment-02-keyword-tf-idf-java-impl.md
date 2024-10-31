---
layout: post
title: NLP segment-03-基于 TF-IDF 实现关键词提取 java 开源实现  
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [ai, nlp, sf]
published: true
---

# 拓展阅读

## 分词系列专题

[jieba-fenci 01 结巴分词原理讲解 segment](https://houbb.github.io/2020/01/08/jieba-source-01-overview)

[jieba-fenci 02 结巴分词原理讲解之数据归一化 segment](https://houbb.github.io/2020/01/08/jieba-source-02-normalize)

[jieba-fenci 03 结巴分词与繁简体转换 segment](https://houbb.github.io/2020/01/08/jieba-source-03-chinese-format)

[jieba-fenci 04 结巴分词之词性标注实现思路 speechTagging segment](https://houbb.github.io/2020/01/08/jieba-source-04-pos-tagging)

## 关键词系列专题

[NLP segment-01-聊一聊分词](https://houbb.github.io/2020/01/08/nlp-segment-01-overview)

[NLP segment-02-聊一聊关键词提取 keyword](https://houbb.github.io/2020/01/08/nlp-segment-02-keyword-chat)

[NLP segment-03-基于 TF-IDF 实现关键词提取 java 开源实现](https://houbb.github.io/2020/01/08/nlp-segment-02-keyword-tf-idf-java-impl)

[NLP segment-20-分词开源项目介绍 HanLP 未来十年的自然语言处理](https://houbb.github.io/2020/01/08/nlp-segment-20-open-source-hannlp)

[NLP segment-21-分词开源项目介绍 ansj_seg](https://houbb.github.io/2020/01/08/nlp-segment-21-open-source-ansj_seg)

[倒排索引原理与实现 reverse-index](https://houbb.github.io/2020/01/09/reverse-index)

[TF-IDF 自动生成文章摘要](https://houbb.github.io/2020/01/09/tf-idf-auto-summary)

[TF-IDF 自动提取关键词](https://houbb.github.io/2020/01/09/tf-idf-keyword)

[相似文章算法之语义指纹-文本内容去重](https://houbb.github.io/2020/01/09/tf-idf-smiliarty-yuyizhiwen)

[TF-IDF 找出相似文章算法](https://houbb.github.io/2020/01/09/tf-idf-smiliarty)

[NLP segment-21-分词开源项目介绍 ansj_seg](https://houbb.github.io/2020/01/08/nlp-segment-21-open-source-ansj_seg)

## 开源项目

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

[nlp-keyword 关键词](https://github.com/houbb/nlp-keyword)

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[segment 高性能中文分词](https://github.com/houbb/segment)

[opencc4j 中文繁简体转换](https://github.com/houbb/opencc4j)

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# 前言

前面一些内容，我们介绍了分词。

以及 TF-IDF 的实现原理。

当然，这些都是知识，但不是工具。

我们将其转换为方便可用的 java 工具。

# nlp-keyword

[nlp-keyword](https://github.com/houbb/nlp-keyword) 高性能的 java 分词关键词提取实现，基于分词 [segment](https://github.com/houbb/segment)。

愿景：成为 java 最好用的关键词工具。

## 特性

- 基于 TF-IDF 算法的关键字算法

- 灵活的条件指定

> [变更日志](https://github.com/houbb/nlp-keyword/blob/master/CHANGELOG.md)

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>keyword</artifactId>
    <version>1.0.0</version>
</dependency>
```

## 快速开始

- 获取关键词

```java
final String text = "这是一个伸手不见五指的黑夜，夜太美。";

List<IKeywordResult> keywords =  KeywordHelper.keyword(text);
Assert.assertEquals("[伸手不见|0.86879235325, 太美|0.70848301840625, 伸手不见五指|0.63371734601875, 黑夜|0.509854654010625, 伸手|0.43563643037625]", keywords.toString());
```

- 指定返回的个数

```java
final String text = "这是一个伸手不见五指的黑夜，夜太美。";

List<IKeywordResult> keywords =  KeywordHelper.keyword(text, 1);
Assert.assertEquals("[伸手不见|0.86879235325]", keywords.toString());
```

- 指定返回的格式

```java
final String text = "这是一个伸手不见五指的黑夜，夜太美。";

List<String> keywords =  KeywordHelper.keyword(text, 1, KeywordResultHandlers.words());
Assert.assertEquals("[伸手不见]", keywords.toString());
```

# ROAD-MAP

- [] 字典数据独立，便于用户自定义选择

- [] 文本相似度

- [] auto-summary 自动摘要

* any list
{:toc}
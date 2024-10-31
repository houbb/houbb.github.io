---
layout: post
title: NLP segment-21-分词开源项目介绍 ansj_seg
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, segment, sh]
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

## 开源项目

为了便于大家学习，项目开源地址如下，欢迎 fork+star 鼓励一下老马~

[nlp-keyword 关键词](https://github.com/houbb/nlp-keyword)

[pinyin 汉字转拼音](https://github.com/houbb/pinyin)

[segment 高性能中文分词](https://github.com/houbb/segment)

[opencc4j 中文繁简体转换](https://github.com/houbb/opencc4j)

[nlp-hanzi-similar 汉字相似度](https://github.com/houbb/nlp-hanzi-similar)

[word-checker 拼写检测](https://github.com/houbb/word-checker)

[sensitive-word 敏感词](https://github.com/houbb/sensitive-word)

# Ansj 中文分词

这是一个基于n-Gram+CRF+HMM的中文分词的java实现。

分词速度达到每秒钟大约200万字左右（mac air下测试），准确率能达到96%以上。

目前实现了中文分词、中文姓名识别、用户自定义词典、关键字提取、自动摘要、关键字标记等功能。

可以应用到自然语言处理等方面，适用于对分词效果要求高的各种项目。

# 快速开始

## maven

```xml
<dependency>
    <groupId>org.ansj</groupId>
    <artifactId>ansj_seg</artifactId>
    <version>5.1.1</version>
</dependency>
```

## demo

```java

 String str = "欢迎使用ansj_seg,(ansj中文分词)在这里如果你遇到什么问题都可以联系我.我一定尽我所能.帮助大家.ansj_seg更快,更准,更自由!" ;
 System.out.println(ToAnalysis.parse(str));
 
 ﻿欢迎/v,使用/v,ansj/en,_,seg/en,,,(,ansj/en,中文/nz,分词/n,),在/p,这里/r,如果/c,你/r,遇到/v,什么/r,问题/n,都/d,可以/v,联系/v,我/r,./m,我/r,一定/d,尽我所能/l,./m,帮助/v,大家/r,./m,ansj/en,_,seg/en,更快/d,,,更/d,准/a,,,更/d,自由/a,!
```

# 参考资料

https://github.com/NLPchina/ansj_seg

* any list
{:toc}
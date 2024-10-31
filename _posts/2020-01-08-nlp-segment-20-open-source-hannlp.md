---
layout: post
title: NLP segment-20-分词开源项目介绍 HanLP 未来十年的自然语言处理
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

# HanLP

借助世界上最大的多语种语料库，HanLP2.1支持包括简繁中英日俄法德在内的104种语言上的10种联合任务：分词（粗分、细分2个标准，强制、合并、校正3种词典模式）、词性标注（PKU、863、CTB、UD四套词性规范）、命名实体识别（PKU、MSRA、OntoNotes三套规范）、依存句法分析（SD、UD规范）、成分句法分析、语义依存分析（SemEval16、DM、PAS、PSD四套规范）、语义角色标注、词干提取、词法语法特征提取、抽象意义表示（AMR）。

量体裁衣， HanLP 提供RESTful和native两种API，分别面向轻量级和海量级两种场景。

无论何种API何种语言，HanLP接口在语义上保持一致，在代码上坚持开源。

## 轻量级 RESTful API

仅数KB，适合敏捷开发、移动APP等场景。服务器算力有限，匿名用户配额较少，建议申请公益API秘钥auth。

# Java

在pom.xml中添加依赖：

```xml
<dependency>
  <groupId>com.hankcs.hanlp.restful</groupId>
  <artifactId>hanlp-restful</artifactId>
  <version>0.0.6</version>
</dependency>
```

创建客户端，填入服务器地址和秘钥：

```java
HanLPClient HanLP = new HanLPClient("https://www.hanlp.com/api", null, "zh"); // auth不填则匿名，zh中文，mul多语种
```

## 快速上手

无论何种开发语言，调用parse接口，传入一篇文章，得到HanLP精准的分析结果。

```java
HanLP.parse("2021年HanLPv2.1为生产环境带来次世代最先进的多语种NLP技术。阿婆主来到北京立方庭参观自然语义科技公司。")
```

# 参考资料

https://github.com/NLPchina/ansj_seg

* any list
{:toc}
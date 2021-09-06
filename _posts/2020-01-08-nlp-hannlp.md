---
layout: post
title: HanLP 未来十年的自然语言处理。 标记化、词性标注、命名实体识别、句法和语义依赖解析、文档分类 
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, segment, sh]
published: true
---

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
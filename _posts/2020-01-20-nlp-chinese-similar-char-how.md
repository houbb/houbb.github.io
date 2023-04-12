---
layout: post
title: java 如何计算两个汉字的相似度？如何获得一个汉字的相似汉字？
date:  2020-1-20 10:09:32 +0800
categories: [NLP]
tags: [chinese, nlp, algorithm, sh]
published: true
---

# 计算汉字相似度

## 情景

有时候我们希望计算两个汉字的相似度，比如文本的 OCR 等场景。用于识别纠正。

## 实现

引入 maven

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>nlp-hanzi-similar</artifactId>
    <version>1.3.0</version>
</dependency>
```

java 实现

```java
double rate1 = HanziSimilarHelper.similar('末', '未');
```

返回对应的相似度：

```
0.9629629629629629
```

# 返回一个汉字的相似列表

## 情景

找到相似的汉字，有很多有趣的场景。

## 实现

```java
List<String> list = HanziSimilarHelper.similarList('爱');
Assert.assertEquals("[爰, 爯, 受, 爭, 妥, 憂, 李, 爳, 叐, 雙]", list.toString());
```

# 开源地址

为了便于大家学习，上述代码已开源

> [https://github.com/houbb/nlp-hanzi-similar](https://github.com/houbb/nlp-hanzi-similar)

# 在线体验

> [在线体验](https://houbb.github.io/opensource/nlp-hanzi-similar)

# 拓展阅读

[NLP 中文形近字相似度计算思路](https://mp.weixin.qq.com/s/i3h_15kYRb89MsApZ5nwPQ)

[中文形近字相似度算法实现，为汉字 NLP 尽一点绵薄之力](https://mp.weixin.qq.com/s/pDt3R04-XWKSvo1hJpTSDg)

[当代中国最贵的汉字是什么？](https://mp.weixin.qq.com/s/SETYeJchvWuqicrHLgG2mQ)

[NLP 开源形近字算法补完计划（完结篇）](https://mp.weixin.qq.com/s/T4ubn_nCr2fkW8jui3anSA)

[NLP 开源形近字算法之形近字列表（番外篇）](https://mp.weixin.qq.com/s/WF4PxVftBnaealOU7a06xQ)

[开源项目在线化 中文繁简体转换/敏感词/拼音/分词/汉字相似度/markdown 目录](https://mp.weixin.qq.com/s/8eEvUtW0xS9rPijzoDYc7w)


* any list
{:toc}
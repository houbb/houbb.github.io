---
layout: post
title: Lucene-09-segment 中文分词
date: 2022-01-10 21:01:55 +0800
categories: [Lucene]
tags: [Lucene, search, sh]
published: true
---

# 为什么要使用lucene中文分词器

在lucene的开发过程中，我们常会遇到分词时中文识别的问题，lucene提供了 `lucene-analyzers-common.jar` 包来支持分词，但多的是对英国，法国，意大利等过语言的支持，

因此我们需要引入中文分词的概念。

# 各种中文分词器及其对比

## jcseg 中文分词器

jcseg 是使用Java开发的一款开源的中文分词器, 使用mmseg算法. 分词准确率高达 98.4%, 支持中文人名识别, 同义词匹配, 停止词过滤...

jcseg 支持三种切分模式：

(1) 简易模式：FMM算法，适合速度要求场合。

(2) 复杂模式-MMSEG四种过滤算法，具有较高的岐义去除，分词准确率达到了98.41%。

(3) 检测模式：只返回词库中已有的词条，很适合某些应用场合。(1.9.4开始)

就分词效率而言，简易模式速度最快

jcseg 词库配置丰富，自我感觉功能最强大，详见jcseg开发文档；

## IKAnalyzer

IK Analyzer是一个开源的，基亍java语言开发的轻量级的中文分词工具包。

采用了特有的“正向迭代最细粒度切分算法“，支持细粒度和智能分词两种切分模式；

在系统环境：Core2 i7 3.4G双核，4G内存，window 7 64位， Sun JDK 1.6_29 64位 普通pc环境测试，IK2012具有160万字/秒（3000KB/S）的高速处理能力。

2012版本的智能分词模式支持简单的分词排歧义处理和数量词合并输出。

采用了多子处理器分析模式，支持：英文字母、数字、中文词汇等分词处理，兼容韩文、日文字符

优化的词典存储，更小的内存占用。支持用户词典扩展定义。特别的，在2012版本，词典支持中文，英文，数字混合词语。

IK Analyzer支持细粒度切分和智能切分两种分词模式;

在细粒度切分下，词语分解到很细的力度，比如“一个苹果”，会被切分成如下

```
一个
一
个
苹果
```

在智能切分模式下，则会分词如下：

```
一个
苹果
```

# 使用例子

## maven 引入

```xml
<!--中文分词-->
<dependency>
    <groupId>com.github.magese</groupId>
    <artifactId>ik-analyzer</artifactId>
    <version>7.6.0</version>
</dependency>
```

## 测试代码

```java
package com.github.houbb.lucene.learn.chap03;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.tokenattributes.CharTermAttribute;
import org.wltea.analyzer.lucene.IKAnalyzer;

import java.io.IOException;

/**
 * 中文分词
 *
 * @author binbin.hou
 * @since 1.0.0
 */
public class ChineseSegAnalyzerTest {

    public static void main(String[] args) {
        String words = "今天是个好日子，心情很好天气也好。";

        try (Analyzer analyzer = new IKAnalyzer();
             TokenStream stream = analyzer.tokenStream("myField", words)) {
            stream.reset();
            CharTermAttribute offsetAtt = stream.addAttribute(CharTermAttribute.class);
            while (stream.incrementToken()) {
                System.out.println(offsetAtt.toString());
            }
            stream.end();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

日志如下：

```
今天是个好日子
今天是
今天
是个
好日子
日子
心情
很好
好天气
好天
天气
也好
```

## 其他

发现 IK 的版本比较混乱，github 也没有特别官方的分词仓库。

后续有时间实现一个基于 segment 的兼容 lucene 的实现。

# 参考资料

[一步一步跟我学习lucene（4）---lucene的中文分词器jcseg和IK Analyzer分词器及其使用说明](https://blog.csdn.net/wuyinggui10000/article/details/45602341)

* any list
{:toc}
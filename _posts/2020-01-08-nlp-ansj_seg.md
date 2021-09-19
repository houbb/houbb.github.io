---
layout: post
title: ansj_seg  ansj分词.ict的真正java实现.分词效果速度都超过开源版的ict. 中文分词,人名识别,词性标注,用户自定义词典
date:  2020-1-8 10:09:32 +0800
categories: [NLP]
tags: [java, nlp, segment, sh]
published: true
---

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
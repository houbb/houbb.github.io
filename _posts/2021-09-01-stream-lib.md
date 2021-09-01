---
layout: post
title: stream-lib Stream summarizer and cardinality estimator.
date: 2021-09-01 21:01:55 +0800
categories: [java]
tags: [java, sh]
published: true
---

# stream-lib

一个 Java 库，用于汇总无法存储所有事件的流中的数据。 

更具体地说，有用于估计的类：基数（即计算事物）； 设置会员资格； 前 k 个元素和频率。 一个特别有用的功能是可以安全地合并具有兼容配置的基数估计器。

这些类可以直接在 JVM 项目中使用，也可以与提供的 shell 脚本和旧的 Unix IO 重定向一起使用。

这里的想法对我们来说不是原创的。 

我们努力通过迭代现有的学术文献来创建有用的实现。 

因此，这个库在很大程度上依赖于其他人的工作。 

请阅读来源和参考部分。

## 例子

```
$ echo -e "foo\nfoo\nbar" | ./bin/topk
item count error
---- ----- -----
 foo     2     0
 bar     1     0

Item count: 3


$ echo -e "foo\nfoo\nbar" | ./bin/cardinality
Item Count Cardinality Estimate
---------- --------------------
         3                    2
```

## maven 引入

```xml
<dependency>
  <groupId>com.clearspring.analytics</groupId>
  <artifactId>stream</artifactId>
  <version>2.9.5</version>
</dependency>
```






# 参考资料

https://github.com/addthis/stream-lib

* any list
{:toc}
---
layout: post
title: 老马学机器学习-04-java 类似于 pandas 的开源库 Joinery
date:  2019-4-16 10:55:13 +0800
categories: [ML]
tags: [ML, ai, math, sh]
published: true
---

# Joinery

[Joinery](https://github.com/cardillo/joinery) 是遵循Pandas或R数据帧精神的数据帧实现。


# 快速开始

## maven 引入

```xml
<dependency>
  <groupId>joinery</groupId>
  <artifactId>joinery-dataframe</artifactId>
  <version>1.9</version>
</dependency>
```

## 例子

以下是一个简单的激励示例。 

使用Java进行工作时，如下所示的数据操作应该很容易。 

下面的代码从Yahoo!检索2008年的S＆P 500每日市场数据。 

财务并返回一年中前三个月的平均月收盘价。

```java
 DataFrame.readCsv(ClassLoader.getSystemResourceAsStream("gspc.csv"))
     .retain("Date", "Close")
     .groupBy(row -> Date.class.cast(row.get(0)).getMonth())
     .mean()
     .sortBy("Close")
     .tail(3)
     .apply(value -> Number.class.cast(value).intValue())
     .col("Close");

 [1370, 1378, 1403] 
```

# 总结

希望本文对你有所帮助，如果喜欢，欢迎点赞收藏转发一波。

我是老马，期待与你的下次相遇。

# 参考资料

《统计学习方法》

http://cardillo.github.io/joinery/v1.9/api/reference/joinery/DataFrame.html

* any list
{:toc}
---
layout: post
title: java base-06-String StringBuilder StringBuffer
date:  2019-2-27 09:48:47 +0800
categories: [Java]
tags: [static, java-base]
published: true
---

# String

## 为什么不可变

jdk 中,String 是被设计为不可变的对象。

[不可变设计模式](https://houbb.github.io/2018/10/08/pattern-immutable)

## 不可变的优点

线程安全

## 缺点

创建大量的对象。

为了弥补，这个问题，引入了 StringBuffer。

# StringBuffer

## 优点

避免创建大量对象

## 缺点

每一个方法都是使用 `synchronized` 修饰，确保线程安全。

[synchronized](https://houbb.github.io/2018/07/25/java-concurrency-09-sync)


# StringBuilder

## 优点

在线程安全情况下，避免加锁带来的额外开销。


## JVM 对于 String 的优化

可能会书写比较麻烦，比如：

``` java
StringBuilder sb = new StringBuilder();
sb.append("a").append("b").append("c").append("d");

String result = sb.toString();
```

### java8

其实 jdk8 中我们可以直接这么写：

```java
String result = "a"+"b"+"c"+"d";
```

会被自动优化为使用 StringBuilder 进行数据的连接。

###  java9

提供了 StringConcatFactory 进行连接优化。

# 字符串缓存

String 就像是金融界的货币，自然界的水。

在 java 中是非常重要，也非常常见。

而且 dump 文件中，很多内容都是 String，其中有很多内容都是相同的。

[String intern](https://houbb.github.io/2018/10/07/java-string-intern)

## 优点

这就引出了我们的字符串缓存机制，用于提升性能，降低存储空间

## 缺点

被缓存的起来的信息，存储在 PerGerm 中（永久代）

这个空间大小有限，也基本不会被 FullGC 回收。

如果使用不当，OOM 就会经常发生。


# G1 GC 字符串排重

# JDK 自身的演化

## char[]

jdk8 及其以前都是用的 char 数组。

但是有个问题，一个 char 是两个 byte。

## byte[]

byte 使得字符串更加紧凑

# 拓展阅读

[String intern](https://houbb.github.io/2018/10/07/java-string-intern)

# 参考资料

* any list
{:toc}
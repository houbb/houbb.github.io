---
layout: post
title: 数据结构-02-ArrayList 与 LinkedList 源码分析
date:  2019-2-19 14:50:42 +0800
categories: [Data-Struct]
tags: [data-struct, list, source-code, sh]
published: true
excerpt: 数据结构-01-IdentityHashMap 详解
---

# ArrayList

以前学习数据结构的时候，自己通过实现过 ArrayList。

但是 jdk 中的源码没有仔细研读过。

本篇查缺补漏，好好学习一下。

> jdk 版本为 11

## 类定义

```java
public class ArrayList<E> extends AbstractList<E>
        implements List<E>, RandomAccess, Cloneable, java.io.Serializable
```

继承自 AbstractList 抽象类。

实现了几个接口 List, RandomAccess, Cloneable, java.io.Serializable。

### RandomAccess 接口

其他几个并不陌生，我们看一下 RandomAccess

```java
public interface RandomAccess {
}
```

没有任何方法和属性，看一下类的









# 参考资料 


* any list
{:toc}
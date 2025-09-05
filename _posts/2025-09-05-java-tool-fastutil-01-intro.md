---
layout: post
title: java 性能工具类值 fastutil 介绍
date: 2025-9-05 20:40:12 +0800
categories: [Java]
tags: [java, fastutil, sh]
published: true
---

# fastutil

## 介绍

`fastutil` 扩展了 [Java™ 集合框架](http://download.oracle.com/javase/1.5.0/docs/guide/collections/)，
提供 **类型特定的 Map、Set、List 和 Queue**，具备 **内存占用小、访问和插入速度快** 的特点；
同时它还提供了 **大容量（64 位）数组、集合和列表**，以及用于二进制和文本文件的快速、实用 I/O 类。
这是一个自由软件，遵循 [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0.html) 许可证发布。

这些类实现了它们对应的标准接口（例如 Map 对应 `Map` 接口），可以无缝接入现有代码。
此外，它们还提供了额外功能（如双向迭代器），标准类中并不提供。

除了对象和基本类型，`fastutil` 类还支持 **引用类型（references）**，
即使用 `==` 判断相等而不是 `equals()` 方法。

源代码使用 C 预处理器生成，从一组驱动文件开始生成。
你可以查看 `javadoc` 生成的文档，其中概述部分解释了 `fastutil` 的设计选择。

---

## 核心 Jar

如果标准的 `fastutil` Jar 文件太大，可以使用 **核心 (core) Jar**，
它只包含针对整数、长整数和双精度浮点数的数据结构。
注意，这些类在标准 Jar 中也有重复，如果项目同时依赖两者（例如由于传递依赖），
应排除核心 Jar，以避免冲突。

你也可以使用 `find-deps.sh` 脚本生成一个 **小型定制 Jar**（可以放在项目仓库或本地 Maven 仓库中）。
此脚本依赖很少，只需要 JDK 8 自带的 `jdeps` 工具即可。
它可以帮助你识别项目中实际使用的 fastutil 类，并生成只包含必要类的最小化 Jar。

---

## 构建

首先，你需要执行 `make sources` 来获取实际的 Java 源码。
之后执行 `ant jar` 会生成单个 Jar 文件；
`ant javadoc` 会生成 API 文档；
`ant junit` 会运行单元测试。

如果想要获取上面提到的两个 Jar，需要先运行脚本 `split.sh`，然后执行 `ant osgi-rest`。

Java 源码是通过 C 预处理器生成的。
`gencsource.sh` 脚本会读取驱动文件（包含预处理器定义的符号和条件编译），
生成一个（伪）C 源文件，该文件包含驱动代码和用于定制环境的定义。

---

## 性能

`fastutil` 在许多情况下提供了最快的实现。
你也可以找到许多其他原始类型集合的实现（如 [HPPC](http://labs.carrotsearch.com/hppc.html)、[Koloboke](https://github.com/leventov/Koloboke) 等）。

有时作者会称自己的实现为“最快可用”，但实际情况是任何实现都需要做一些折中决策，
这些决策会在不同场景下让性能快或慢。
因此建议 **总是在自己的应用中测试速度**，不要仅依赖通用基准测试，并向作者咨询如何最佳使用库。
尤其是测试基于哈希的数据结构时，应该显式设置 **负载因子（load factor）**，因为速度高度依赖碰撞链长度。

---

## 大数据结构

在 `fastutil 6` 中，引入了一套新的类，可以处理 **非常大的集合**，
特别是 **大小超过 2³¹** 的集合。

* 大数组（big arrays）是“数组的数组”，通过丰富的静态方法操作，就像是带有 64 位索引的一维数组。
* 大列表（big lists）提供 64 位列表访问。
* 哈希大集合（hash big set）的大小只受核心内存限制。

---

## 讨论

关于 `fastutil` 有一个 [讨论组](http://groups.google.com/group/fastutil)，
你可以加入讨论，或者 [发送邮件](mailto:fastutil@googlegroups.com) 提问。



* any list
{:toc}
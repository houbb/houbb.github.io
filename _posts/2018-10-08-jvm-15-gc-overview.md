---
layout: post
title: JVM-GC 概览-15
date: 2018-10-08 23:36:46 +0800
categories: [Java]
tags: [jvm, gc, sh]
published: true
excerpt: Java GC 概览
---

# 垃圾收集调整简介

从桌面上的小型applet到大型服务器上的Web服务，各种各样的应用程序都使用Java平台标准版（Java SE）。

为了支持这种多样化的部署，Java HotSpot VM提供了多个垃圾收集器，每个垃圾收集器都旨在满足不同的需求。 

Java SE根据运行应用程序的计算机的类选择最合适的垃圾收集器。

但是，这种选择对于每个应用程序可能都不是最佳的。具有严格性能目标或其他要求的用户，开发人员和管理员可能需要明确选择垃圾收集器并调整某些参数以达到所需的性能级别。

本文档提供了有助于完成这些任务的信息。

首先，在 serial, stop-the-world 的收集器的上下文中描述了垃圾收集器的一般功能和基本调整选项。

然后介绍其他收集器的特定功能以及选择收集器时要考虑的因素。

# 什么是垃圾收集器？

- 垃圾收集器（GC）自动管理应用程序的动态内存分配请求。

垃圾收集器通过以下操作执行自动动态内存管理:

分配给操作系统并将内存返回给操作系统。

在请求时将内存分发给应用程序。

确定应用程序仍在使用该内存的哪些部分。

回收未使用的内存以供应用程序重用。

- Java HotSpot垃圾收集器采用各种技术来提高这些操作的效率:

将世代清理与衰老结合使用，可以将精力集中在堆中最可能包含大量可回收内存区域的区域。

使用多个线程积极地使操作并行，或者在后台与应用程序并发执行一些长时间运行的操作。

尝试通过压缩活动对象来恢复更大的连续可用内存。

# 为什么垃圾收集器的选择至关重要？

垃圾收集器的目的是使应用程序开发人员免于手动动态内存管理。

开发人员无需将分配与解除分配相匹配，并且可以密切关注分配的动态内存的生命周期。

这完全消除了与内存管理相关的一些类错误，但代价是额外的运行时开销。 

Java HotSpot VM提供了一系列垃圾收集算法供您选择。

什么时候垃圾收集器的选择很重要？对于某些应用程序，答案永远不会。也就是说，应用程序可以在存在垃圾收集的情况下很好地执行，并且具有适度的频率和持续时间的暂停。但是，对于大类应用程序来说情况并非如此，特别是那些具有大量数据（多个千兆字节），多个线程和高事务率的应用程序。

Amdahl定律（给定问题的并行加速受到问题的连续部分的限制）意味着大多数工作负载无法完美并行化;某些部分总是顺序的，不会受益于并行性。

在Java平台中，目前有四种受支持的垃圾收集替代方案，除了其中之一外，串行GC，并行工作以提高性能。保持垃圾收集的开销尽可能低是非常重要的。这可以在以下示例中看到。

图1-1中的图形模拟了一个理想的系统，除了垃圾收集之外，它是完全可扩展的。红线是在单处理器系统上仅花费1％的时间用于垃圾收集的应用程序。这意味着在具有32个处理器的系统上，吞吐量损失超过20％。洋红色线显示，对于垃圾收集中10％的应用程序（在单处理器应用程序中不被认为是垃圾收集的过多时间），当扩展到32个处理器时，超过75％的吞吐量会丢失。

![jsgct_dt_005_gph_pc_vs_tp.png](https://docs.oracle.com/javase/9/gctuning/img/jsgct_dt_005_gph_pc_vs_tp.png)

该图显示，在小型系统上进行开发时，可忽略的吞吐量问题可能成为扩展到大型系统时的主要瓶颈。然而，在减少这种瓶颈方面的微小改进可以在性能上产生很大的提高。对于足够大的系统，选择正确的垃圾收集器并在必要时进行调整是值得的。

串行收集器通常适用于大多数小型应用程序，特别是那些在现代处理器上需要高达约100兆字节堆的应用程序。

其他收集器具有额外的开销或复杂性，这是专门行为的代价。如果应用程序不需要备用收集器的特殊行为，请使用串行收集器。预计串行收集器不是最佳选择的一种情况是在具有大量内存和两个或更多处理器的机器上运行的大型，高度线程化的应用程序。

当应用程序在此类服务器级计算机上运行时，默认情况下会选择Garbage-First（G1）收集器;

# GC 的分类

目前主流的有四种类型

- Serial Garbage Collector

- Parallel Garbage Collector

- CMS Garbage Collector

- G1 Garbage Collector

这四种类型中的每一种都有其优点和缺点。

最重要的是, 我们程序员可以选择 jvm 使用的垃圾收集器的类型。

我们可以通过将选择作为 jvm 参数来选择它们。

每种类型都有很大的不同, 可以提供完全不同的应用程序性能。

了解每一种类型的垃圾收集器并根据应用程序正确地使用它是至关重要的。

# 常见参数配置

## 指定 gc 回收器

| 参数 | 说明 |
|:---|:---|
| -XX:+UseSerialGC | 串行垃圾回收器 |
| -XX:+UseParallelGC | 并行垃圾回收器 |
| -XX:+UseConcMarkSweepGC | CMS 垃圾回收器 |
| -XX:+ParallelCMSThreads= | 并行垃圾回收器线程数 |
| -XX:+UseG1GC= | G1 垃圾回收器 |

## 指定堆等信息大小

| 参数 | 说明 |
|:---|:---|
| -Xms | 初始化堆内存 |
| -Xmx | 最大堆内存 |
| -Xmn | 新生代大小 |
| -XX:PermSize | 初始化永久代大小 |
| -XX:MaxPermSize | 最大永久代大小 |

Q:如果满了直接 OOM 吗？

## 简单案例

```
java -Xmx12m -Xms3m -Xmn1m -XX:PermSize=20m -XX:MaxPermSize=20m -XX:+UseSerialGC -jar java-application.jar
```

## 工具

[一只懂JVM参数的狐狸](http://xxfox.perfma.com/)

寒泉子大神的 jvm 参数分析工具。

# JVM 的默认 gc 收集器

直接在安装 jdk 环境的机器运行:

```
$java -XX:+PrintCommandLineFlags -version
```

日志如下:

```
-XX:InitialHeapSize=128975232 -XX:MaxHeapSize=2063603712 -XX:+PrintCommandLineFlags -XX:+UseCompressedClassPointers -XX:+UseCompressedOops -XX:+UseParallelGC 
java version "1.8.0_121"
Java(TM) SE Runtime Environment (build 1.8.0_121-b13)
Java HotSpot(TM) 64-Bit Server VM (build 25.121-b13, mixed mode)
```

使用的是 `UseParallelGC`

## UseParallelGC 对应的垃圾收集器

Parallel Scavenge 收集器 + SerialOld 收集器

# 选择收集器

除非您的应用程序具有相当严格的暂停时间要求，否则首先运行您的应用程序并允许VM选择收集器。

如有必要，请调整堆大小以提高性能。如果性能仍不符合您的目标，请使用以下指南作为选择收集器的起点:

如果应用程序具有较小的数据集（最大约100 MB），则使用选项-XX:+UseSerialGC选择串行收集器。

如果应用程序将在单个处理器上运行且没有暂停时间要求，则使用选项-XX:+UseSerialGC选择串行收集器。

如果（a）峰值应用程序性能是第一优先级并且（b）没有暂停时间要求或暂停一秒或更长时间是可接受的，

那么让VM选择收集器或选择带-XX的并行收集器:+UseParallelGC。

如果响应时间比总吞吐量更重要，并且垃圾收集暂停必须保持短于大约一秒，则选择带-XX的并发收集器:+ UseG1GC或-XX:+UseConcMarkSweepGC。

这些指南仅提供了选择收集器的起点，因为性能取决于堆的大小，应用程序维护的实时数据量以及可用处理器的数量和速度。暂停时间对这些因素特别敏感，因此前面提到的一秒的阈值只是近似值。并行收集器在许多堆大小和硬件组合上将经历超过一秒的暂停时间。相反，在某些情况下，并发收集器可能无法使暂停时间短于一秒。

如果推荐的收集器未达到所需性能，则首先尝试调整堆和生成大小以满足所需目标。如果性能仍然不足，那么尝试使用不同的收集器:使用并发收集器来减少暂停时间，并使用并行收集器来提高多处理器硬件的总吞吐量。

# 参考资料

[java 垃圾收集器的类型](https://javapapers.com/java/types-of-java-garbage-collectors/#serial-garbage-collector)

[java gc 基础知识](https://www.oracle.com/webfolder/technetwork/tutorials/obe/java/gc01/index.html)

[jdk9 标准 gc 文档](https://docs.oracle.com/javase/9/gctuning/toc.htm)

[Java Garbage Collection Algorithms [till Java 9]](https://howtodoinjava.com/java/garbage-collection/all-garbage-collection-algorithms/)

[need-help-to-understand-available-jvm-garbage-collection-algorithm-and-garbag](https://stackoverflow.com/questions/29363689/need-help-to-understand-available-jvm-garbage-collection-algorithm-and-garbag)

[查看JVM使用的默认的垃圾收集器](http://www.cnblogs.com/grey-wolf/p/9217497.html)

* any list
{:toc}
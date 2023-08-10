---
layout: post
title: Apache Flink-01-入门介绍
date: 2018-11-29 07:32:26 +0800
categories: [Big Data]
tags: [big-data, calc-engine, apache, sh]
published: true
---

# Apache Flink

[Apache Flink](https://flink.apache.org/) 是一个框架和分布式处理引擎，用于对无界和有界数据流进行有状态计算。 

Flink设计为在所有常见的集群环境中运行，以内存速度和任何规模执行计算。

# 计算引擎的 4 代发展

## MapReduce

首先第一代的计算引擎，无疑就是 Hadoop 承载的 MapReduce。这里大家应该都不会对 MapReduce 陌生，它将计算分为两个阶段，分别为 Map 和 Reduce。对于上层应用来说，就不得不想方设法去拆分算法，甚至于不得不在上层应用实现多个 Job 的串联，以完成一个完整的算法，例如迭代计算。

## DAG 

由于这样的弊端，催生了支持 DAG 框架的产生。因此，支持 DAG 的框架被划分为第二代计算引擎。如 Tez 以及更上层的 Oozie。这里我们不去细究各种 DAG 实现之间的区别，不过对于当时的 Tez 和 Oozie 来说，大多还是批处理的任务。

## Spark

接下来就是以 Spark 为代表的第三代的计算引擎。

第三代计算引擎的特点主要是 Job 内部的 DAG 支持（不跨越Job），以及强调的实时计算。在这里，很多人也会认为第三代计算引擎也能够很好的运行批处理的 Job。

## Flink

随着第三代计算引擎的出现，促进了上层应用快速发展，例如各种迭代计算的性能以及对流计算和 SQL 等的支持。

Flink 的诞生就被归在了第四代。这应该主要表现在 Flink 对流计算的支持，以及更一步的实时性上面。当然Flink 也可以支持 Batch 的任务，以及 DAG 的运算。

首先，我们可以通过下面的性能测试初步了解两个框架的性能区别，它们都可以基于内存计算框架进行实时计算，所以都拥有非常好的计算性能。

经过测试，Flink计算性能上略好。 

# 参考资料

[Flink简介](https://blog.csdn.net/superzyl/article/details/79748092)

[Apache 流框架 Flink，Spark Streaming，Storm对比分析](https://blog.csdn.net/wangyiyungw/article/details/80237270)

[深入理解Apache Flink核心技术](https://www.cnblogs.com/feiyudemeng/p/8998772.html)

[流计算框架 Flink 与 Storm 的性能对比](https://tech.meituan.com/Flink_Benchmark.html)

* any list
{:toc}
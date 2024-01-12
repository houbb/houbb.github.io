---
layout: post
title:  Apache Hadoop-04-MapReduce 分布式计算的处理技术和程序模型
date:  2017-12-05 05:47:35 +0800
categories: [Apache]
tags: [apache, big-data, hadoop]
published: true
---

# MapReduce

MapReduce 是一个框架，我们可以使用它来编写应用程序，以可靠的方式并行地处理大量商品硬件群集上的大量数据。
 

## 什么是MapReduce？

MapReduce是一种基于 java 的分布式计算的处理技术和程序模型。 
MapReduce算法包含两个重要任务，即Map和Reduce。

Map采用一组数据并将其转换为另一组数据，其中各个元素被分解为元组（键/值对）。

其次，reduce任务，它将map的输出作为输入，并将这些数据元组合并成一组较小的元组。
作为MapReduce名称的顺序，reduce任务总是在map作业之后执行。

MapReduce的主要优点是**易于在多个计算节点上扩展数据处理**。
在MapReduce模型下，数据处理原语称为映射器和缩减器。将数据处理应用程序分解为映射器和简化器有时并不重要。
但是，一旦我们以MapReduce形式编写应用程序，扩展应用程序以在集群中运行数百，
数千甚至数万台机器只是一种配置更改。这种简单的可扩展性是吸引许多程序员使用MapReduce模型的原因。

## 算法

- 通常MapReduce范例是基于将计算机发送到数据所在的位置！

- MapReduce程序在三个阶段执行，即map阶段，shuffle阶段和reduce阶段。

    - Map 阶段 ：映射或映射器的作业是处理输入数据。一般来说，输入数据是以文件或目录的形式存储在Hadoop文件系统（HDFS）中。输入文件逐行传递到映射器函数。映射器处理数据并创建几个小块的数据。
    
    - Reduce 阶段 ：这个阶段是Shuffle阶段和Reduce阶段的组合。 Reducer的工作是处理来自映射器的数据。处理后，它产生一组新的输出，将存储在HDFS中。
    
- 在MapReduce作业期间，Hadoop将Map和Reduce任务发送到集群中的相应服务器。

- 该框架管理数据传递的所有细节，例如发出任务，验证任务完成，以及在节点之间复制集群周围的数据。

- 大多数计算发生在节点上，**本地磁盘上的数据减少了网络流量**。

- 完成给定任务后，集群收集并减少数据以形成适当的结果，并将其发送回Hadoop服务器。


# 输入和输出（Java透视图）

MapReduce框架对<key，value>对进行操作，也就是说，框架将作业的输入视为一组<key，value>对，并生成一组<key，value>对作为作业输出，可能是不同类型。
键和值类应该由框架以序列化的方式，因此，需要实现Writable接口。此外，键类必须实现Writable-Comparable接口，以方便框架进行排序。

MapReduce作业的输入和输出类型：（输入）`<k1，v1> - > map - > <k2，v2> - > reduce - > <k3，v3>`（输出）。
 	
| 输入	    | 输出 |
|:----|:----|
| Map	    | <k1, v1>	list (<k2, v2>) |
| Reduce	| <k2, list(v2)>	list (<k3, v3>) |


## 术语
   
- PayLoad 

应用程序实现Map和Reduce功能，并形成作业的核心。

- Mapper 

映射器将输入键/值对映射到一组中间键/值对。

- NamedNode

管理Hadoop分布式文件系统（HDFS）的节点。

- DataNode

在任何处理发生之前提前呈现数据的节点。

- MasterNode

JobTracker运行并接受来自客户端的作业请求的节​​点。

- SlaveNode

Map和Reduce程序运行的节点。

- JobTracker

计划作业并跟踪将作业分配给任务跟踪器。

- Task Tracker

跟踪任务并向JobTracker报告状态。

- Job

程序是跨数据集的Mapper和Reducer的执行。

- Task

在一个数据片段上执行Mapper或Reducer。

- Task

尝试在SlaveNode上执行任务的特定实例。








* any list
{:toc}
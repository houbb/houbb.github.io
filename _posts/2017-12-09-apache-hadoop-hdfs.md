---
layout: post
title:  Hadoop 03 - HDFS 
date:  2017-12-09 16:23:18 +0800
categories: [Apache]
tags: [apache, big data]
published: true
---


# HDFS

Hadoop文件系统是使用分布式文件系统设计开发的。它运行在商用硬件上。与其他分布式系统不同，HDFS是高度容错的，并且使用低成本硬件设计。

HDFS拥有大量的数据并提供更容易的访问。为了存储这样巨大的数据，文件存储在多个机器。这些文件以**冗余方式存储**，以在发生故障时避免系统可能的数据丢失。 HDFS还使应用程序可用于并行处理。

## 特点

- 它适用于在分布式存储和处理。

- Hadoop提供了一个与HDFS交互的命令接口。

- `namenode` 和 `datanode` 的内置服务器帮助用户轻松检查集群的状态。


- 流式访问文件系统数据。

- HDFS 提供文件权限和身份验证。


### HDFS的目的

- 故障检测和恢复 ：由于HDFS包括大量的商品硬件，组件的故障频繁。因此，HDFS应该具有快速和自动故障检测和恢复的机制。

- 巨大的数据集 ：HDFS应该每个集群有数百个节点来管理具有巨大数据集的应用程序。

- 硬件数据 ：当在数据附近进行计算时，可以有效地完成所请求的任务。特别是在涉及巨大数据集的情况下，它减少了网络流量并增加了吞吐量。


# HDFS架构

下面给出了Hadoop文件系统的体系结构。

![static/app/img/hadoop/2017-12-09-hdfs_architecture.jpg](https://raw.githubusercontent.com/houbb/resource/master/img/hadoop/2017-12-09-hdfs_architecture.jpg)

## Namenode
   
namenode是包含 GNU/Linux操作系统和 namenode 软件的商用硬件。它是一个可以在商用硬件上运行的软件。具有namenode的系统充当主服务器，它执行以下任务：

- 管理文件系统命名空间。

- 调整客户端对文件的访问。

- 它还执行文件系统操作，例如重命名，关闭和打开文件和目录。


## Datanode

datanode是具有 GNU/Linux 操作系统和 datanode 软件的商用硬件。对于集群中的每个节点（商品硬件/系统），都会有一个 datanode。这些节点管理其系统的数据存储。

Datanodes 根据客户端请求对文件系统执行读写操作。

它们还根据 namenode 的指令执行诸如块创建，删除和复制的操作。

## Block

一般用户数据存储在HDFS的文件中。文件系统中的文件将被分成一个或多个段和/或存储在各个数据节点中。这些文件段称为块。换句话说，HDFS可以读取或写入的最小数据量称为块。

默认块大小为`64MB`，但可以根据需要更改HDFS配置来增加。



* any list
{:toc}




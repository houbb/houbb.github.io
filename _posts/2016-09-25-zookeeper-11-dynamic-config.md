---
layout: post
title: ZooKeeper-11-动态配置
date:  2016-09-25 12:21:05 +0800
categories: [Apache]
tags: [zookeeper, config-center]
published: true
---

# 概述

在3.5.0发行版之前，Zookeeper的成员身份和所有其他配置参数是静态的-在引导过程中加载，并且在运行时不可变。

操作员求助于“滚动重启”，这是一种手动配置且容易出错的更改配置的方法，该配置导致数据丢失和生产中的不一致。

从3.5.0版开始，不再需要“滚动重启”！ 

ZooKeeper完全支持自动配置更改：可以动态更改Zookeeper服务器的集合，它们的角色（参与者/观察者），所有端口甚至仲裁系统，而不会中断服务并保持数据一致性。

就像ZooKeeper中的其他操作一样，可以立即执行重新配置。可以使用单个重新配置命令来进行多个更改。

动态重新配置功能不限制操作并发性，不需要在重新配置过程中停止客户端操作，对管理员而言界面非常简单，并且不会给其他客户端操作增加复杂性。

新增的客户端功能允许客户端了解配置更改，并更新存储在其ZooKeeper句柄中的连接字符串（服务器及其客户端端口的列表）。

概率算法用于在新配置服务器之间重新平衡客户端，同时保持客户端迁移的程度与整体成员身份的变化成比例。

本文档提供了用于重新配置的管理员手册。有关重新配置算法，性能测量等的详细说明，请参见我们的论文：

> [https://www.usenix.org/system/files/conference/atc12/atc12-final74.pdf](https://www.usenix.org/system/files/conference/atc12/atc12-final74.pdf)

注意：从3.5.3开始，动态重新配置功能默认情况下处于禁用状态，必须通过reconfigEnabled配置选项显式打开。

# 参考资料

https://zookeeper.apache.org/doc/r3.6.2/zookeeperObservers.html

* any list
{:toc}
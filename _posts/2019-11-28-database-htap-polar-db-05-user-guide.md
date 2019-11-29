---
layout: post
title: POLARDB-05-PolarDB 用户指南
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 概述

POLARDB是阿里云自研的下一代关系型云数据库，兼容MySQL、PostgreSQL、Oracle引擎，存储容量最高可达100TB，单库最多可扩展到16个节点，适用于企业多样化的数据库应用场景。

POLARDB 采用存储和计算分离的架构，所有计算节点共享一份数据，提供分钟级的配置升降级、秒级的故障恢复、全局数据一致性和免费的数据备份容灾服务。

POLARDB 既融合了商业数据库稳定可靠、高性能、可扩展的特征，又具有开源云数据库简单开放、自我迭代的优势。

# 基本概念

集群：一个集群包含一个主节点以及最多15个只读节点（最少一个，用于提供Active-Active高可用）。

集群ID以pc开头（代表POLARDB cluster）。

节点：一个独立占用物理内存的数据库服务进程。节点ID以pi开头（代表POLARDB instance）。

数据库：在节点下创建的逻辑单元，一个节点可以创建多个数据库，数据库在节点内的命名唯一。

地域和可用区：地域是指物理的数据中心。可用区是指在同一地域内，拥有独立电力和网络的物理区域。更多信息请参考阿里云全球基础设施。

# 控制台

阿里云提供了简单易用的Web控制台，方便您操作阿里云的各种产品和服务，包括云数据库POLARDB。

在控制台上，您可以创建、连接和配置POLARDB数据库。


# Oracle 兼容性快速入门

快速入门旨在介绍如何创建POLARDB集群、进行基本设置以及连接数据库集群，使您能够了解从购买POLARDB到开始使用的流程。

## 使用流程

通常，从购买POLARDB（创建新集群）到可以开始使用，您需要完成如下操作。

1. 创建POLARDB数据库集群

2. 设置集群白名单

3. 创建数据库账号

4. 查看连接地址

5. 连接数据库集群 

# 设置集群白名单

POLARDB兼容Oracle语法的引擎暂不支持设置集群白名单。

POLARDB兼容Oracle语法的引擎暂不支持设置集群白名单，只有相同VPC内的实例才可以访问集群。

# 访问方式

![image](https://user-images.githubusercontent.com/18375710/69847785-12ad1380-12b3-11ea-8a2c-c22cda79dc7b.png)

## 控台连接方式

[控台连接方式](https://help.aliyun.com/document_detail/118197.html?spm=a2c4g.11186623.2.19.23ed40b7zaH0Lr)

# 兼容性说明

[Oracle兼容性说明](https://help.aliyun.com/document_detail/116365.html?spm=a2c4g.11186623.6.719.859274fbYcRJj1)

# 参考资料

[概述](https://help.aliyun.com/document_detail/118198.html?spm=a2c4g.11186623.6.682.2aad7654rf2mX2)

* any list
{:toc}
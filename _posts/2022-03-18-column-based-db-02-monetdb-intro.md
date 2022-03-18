---
layout: post
title: 列式数据库-01-monetdb 介绍
date: 2022-03-18 21:01:55 +0800 
categories: [Database]
tags: [database, monetdb, column-based-db, sh]
published: true
---

# MonetDB 简介

本节简要概述了 MonetDB 为开发应用程序提供的主要功能。 

解决了以下主题：

关键概念

获得 MonetDB 架构的概要。

MonetDB 发布模式

了解发布政策。

社区

联系 MonetDB 社区。

科学图书馆

了解 MonetDB 背后的科学原理。

项目库

展示主要资助的研究项目。

生态系统

# 关键概念

当您的数据库增长到分布在许多表中的数百万条记录并且商业智能/科学成为流行的应用程序领域时，就需要列存储数据库管理系统。

与 MySQL 和 PostgreSQL 等传统行存储不同，列存储提供了一种现代且可扩展的解决方案，而无需大量硬件投资。

自 1993 年以来，MonetDB 率先推出了用于商业智能和电子科学的高性能数据仓库的列存储解决方案。它通过在 DBMS 的各个层进行创新来实现其目标，例如基于垂直碎片的存储模型、现代 CPU 调整的查询执行架构、自动和自适应索引、运行时查询优化和模块化软件架构。它基于 SQL 2003 标准，完全支持外键、连接、视图、触发器和存储过程。它完全符合 ACID，并支持丰富的编程接口，如 JDBC、ODBC、PHP、Python、RoR、C/C++、Perl。

MonetDB 在各种平台上以源 tarball、安装包和二进制安装程序的形式分发。最新版本已在 Linux（Fedora、RedHat Enterprise Linux、Debian、Ubuntu）、Gentoo、Mac OS、Windows 7、Windows Sever 2012、Windows 10 上进行了测试。定期发布时间表可确保最新的功能改进能够快速到达社区。

MonetDB 是数据库研究的重点，推动了许多领域的技术发展。它的三层软件堆栈由 SQL 前端、战术优化器和列式抽象机内核组成，提供了一个灵活的环境来定制它的许多不同方式。丰富的链接库集合为时间数据类型、几何数据类型、数学例程、JSON、URL 和 UUID 数据类型、用 Python、R 或 C/C++ 编写的用户定义函数 (UDF) 提供了功能。在我们的科学图书馆中可以找到有关 MonetDB 设计和实施中技术创新的深入信息。

最后但同样重要的是，MonetDB 系统是在自由开源许可下分发的。它允许您以任何您喜欢的方式修改和扩展它，然后在开源和闭源产品中重新分发它。高度赞赏 MonetDB 代码库的错误修复和功能增强。

简而言之，MonetDB 系统具有以下特点：

## 列存储数据库内核。 

MonetDB 建立在数据库关系的规范表示上，即列，也就是数组。它们是由操作系统交换到内存中的相当大的实体（高达千兆字节）。

## 一个高性能的系统。 

MonetDB 在数据库热集（实际接触的部分）可以主要保存在主内存中或广泛关系表的几列足以处理单个请求的应用程序中表现出色。缓存意识算法的进一步开发证明了这些设计决策的有效性。

## 多核动力引擎。 

MonetDB 专为桌面上的多核并行执行而设计，以减少复杂查询处理的响应时间。探索了几种分布式处理技术，但正如许多人发现的那样，没有灵丹妙药可以提高并行处理性能。对于简单的数据并行问题，map-reduce 方案就足够了，但对于更复杂的情况，需要仔细的数据库设计和（部分）复制。

## 一个通用的代数数据库内核。 

MonetDB 旨在通过其专有的代数语言（称为 MonetDB 汇编语言 (MAL)）来适应不同的查询语言。它铺平了从从查询编译器接收的声明性表达式到并包括必要的分布式处理协议以引导各个数据库服务器的执行的路线。分发的主要前端是 SQL 到 MAL 编译器。
适合所有人的尺寸。 MonetDB 支持的最大数据库大小取决于底层处理平台，例如32 位或 64 位操作系统和存储设备，例如文件系统和磁盘 RAID。每个表的列数实际上是无限的。对于每一列都映射到一个文件，其限制由操作系统和硬件平台决定。并发用户线程的数量是一个配置参数。

## 一个可扩展的平台。 

MonetDB 受到科学实验的强烈影响，以了解算法和应用程序需求之间的相互作用。它将 MonetDB 变成了一个可扩展的数据库系统，在软件堆栈的各个级别都有挂钩。这允许使用特定于域的规则扩展优化器管道；内核中针对特定领域算法的批量操作；以及来自现有科学图书馆的传统操作封装。

## 适用范围广。 

MonetDB 通过连接外部提供的库来支持广泛的应用程序域，例如。 pcre、raptor、libxml 和 geos。几种外部文件格式被封装到数据库中，这在数据库处理和某些科学领域中普遍存在的基于文件的遗留处理之间建立了共生和自然的桥梁。
一个开源解决方案。 MonetDB 是 CWI 经过多年研究开发的，其章程确保其他人可以轻松访问结果。 MonetDB 论坛和邮件列表是开发团队的访问点。通过 MonetDB Solutions 公司可以提供交钥匙扩展、高端技术咨询和合资项目。

# MonetDB 发布方案

功能发布大约每年安排两次。 

功能发布是一个重要步骤，可能需要转储和恢复操作。 

此外，界面和功能可能会改变。

在功能发布之间，我们每月发布错误修复版本。 

只需停止服务器、安装错误修复版本并重新启动服务器就足以保持最新状态。

# 社区频道

有几个渠道可以获得支持。

社交媒体

要关注产品和博客公告，请使用 Twitter 提要。

最终用户建议

获取有关使用 MonetDB 的建议，报告其特性以及与其他数据库系统的差异 Stackoverflow 是首选渠道。

错误报告和功能请求

分享您的经验和改进产品的信息收集在 GitHub 上 MonetDB 存储库的“问题”部分。 给它一颗星，留下您的赞赏。

商业支持

对于依赖最新产品信息、路线图和寻求专家建议的公司，可以联系由 MonetDB 的原始开发人员运营的 MonetDB Solutions。

# 科学图书馆

自 1993 年以来，MonetDB 一直被用作 CWI 数据库研究的基础。许多人在有用的代码和用户体验方面都做出了贡献。 

他们的科学成果可通过 Google Scholar 轻松获得。 

下面总结的一些重要出版物为熟悉设计考虑和这些经验提供了一个很好的起点。

提供 bibtex 记录是为了便于在您的科学论文中引用我们的工作。

## 概述文件

Stratos Idreos、Fabian Groffen、Niels Nes、Stefan Manegold、K. Sjoerd Mullender、Martin L. Kersten：MonetDB：面向列的数据库架构的两个十年研究。 IEEE 数据工程公牛。 35（1）：40-45（2012）

Peter A. Boncz、Martin L. Kersten、Stefan Manegold：打破 MonetDB 中的内存墙。交流。 ACM 51（12）：77-85（2008）

## 索引

列印记，一个简单但高效的缓存意识二级索引。列印记是许多小位向量的集合，每个位向量索引单个高速缓存行的数据点。在查询评估期间使用印记来限制数据访问，从而最大限度地减少内存流量。印记的压缩是 cpu 友好的。

Lefteris Sidirourgos、Martin L. Kersten：列印记：二级索引结构。 2013 年 SIGMOD 会议：893-904

## 点云

MonetDB 已用于处理数十亿点云，例如分辨率为 3 厘米的荷兰高度图。已经设计了一个基准来评估这种高要求应用的技术进步。

Oscar Martinez-Rubi、Peter van Oosterom、Romulo Goncalves、Theo Tijssen、Milena Ivanova、Martin L. Kersten、Foteini Alvanaki：基准测试和改进 MonetDB 中的点云数据管理。 SIGSPATIAL 特别 6(2): 11-18 (2014)

## 聚类分析

Blaeu 是一种新颖的视觉分析解决方案，其关键挑战是引导用户在没有预先知识的情况下探索数据集。

Thibault Sellam，Martin L. Kersten：查询空间的集群驱动导航。 IEEE Trans。知道。数据工程28(5): 1118-1131 (2016)

## 创新

MonetDB 团队因其对数据库社区的贡献而获得 VLDB 10 年最佳论文奖。纪念这一场合的邀请文件和 ACM 出版物的相关通讯提供了研究中关键思想的简要总结。

Peter A. Boncz、Stefan Manegold、Martin L. Kersten：数据库架构演进：哺乳动物在恐龙灭绝之前就已繁荣。 PVLDB 2(2)：1648-1653 (2009)。

Peter A. Boncz、Martin L. Kersten、Stefan Manegold：打破 MonetDB.Communications ACM 51(12): 77-85 (2008) 中的记忆墙

## 查询回收

SIGMOD 2009 亚军奖获得了一种在查询处理期间处理中间结果的新颖方法。它针对 Sloane 数字巡天数据库的部署说明了其自动捕获物化视图的能力，吞吐量提高了四倍。

Milena Ivanova、Martin L. Kersten、Niels J. Nes、Romulo Goncalves：在柱式存储中回收中间体的架构。 ACM 翻译。数据库系统。 35（4）：24（2010）。

## 数据库破解

数据库破解是一种将索引维护成本从更新转移到查询处理的技术。这是一个挑战软件堆栈的领域，即使用优化器来按摩查询计划以破解并传播此信息以进一步改善响应时间。它获得了 ACM SIGMOD 2011 J.Gray 最佳论文奖。

Stratos Idreos、Martin L. Kersten、Stefan Manegold：列存储中的自组织元组重建。 SIGMOD 会议 2009：297-308。

Stratos Idreos、Martin L. Kersten、Stefan Manegold：更新破解的数据库。 2007 年 SIGMOD 会议：413-424

## 数据回旋加速器

运行分布式数据库系统通常是提高响应时间或吞吐量的方法。后者是 Data Cyclotron 项目的重点，它假设数据库热集足够小，可以永久地通过网络反复访问所有节点。

Romulo Goncalves、Martin L. Kersten：数据回旋加速器查询处理方案。 ACM 翻译。数据库系统 36(4):2011。原始论文发表于 EDBT 2010: 75-86。

## 数据单元

对流的连续查询处理是一个长期的挑战。高容量率不需要从头开始进行完整的系统设计。在关系引擎中正确使用批量运算符，结合优化器生成增量计划，可为您提供所需的功能和速度。

Erietta Liarou、Romulo Goncalves、Stratos Idreos：利用关系数据库的力量实现高效的流处理。 EDBT 2009：323-334。

## SciBORQ

大型科学数据库的查询处理需要改进。在任何给定时间，只有一小部分数据对特定任务具有主要价值。这部分通过 ad-hoc 查询细化的迭代过程成为科学反思的焦点。引导数据以促进科学发现需要保证查询执行时间。

Lefteris Sidirourgos、Martin L. Kersten、Peter A. Boncz：SciBORQ：具有运行时和质量界限的科学数据管理。 CIDR 2011：296-301

# 项目库

MonetDB 在全球范围内用于教育、研究和企业。 

在大多数情况下，这是一个匿名的接收和部署，直到人们偶然发现缺少功能、故障或缺乏通过社区渠道表达的文档。 

如果您强烈依赖 MonetDB 技术并希望推广您的项目，请联系我们以将其纳入特色项目库。

# 生态系统

MonetDB 社区远远超出了 MonetDB 团队。为了向社区致敬，让更多用户受益，我们收集了一份我们知道的外部维护的 MonetDB 相关软件列表。

我们最诚挚的感谢社区使用 MonetDB 并丰富了 MonetDB 生态系统。诚挚地邀请您向此列表贡献新项目（您自己的工作或我们应该注意的其他 MonetDB 相关软件）。

这些驱动程序/工具/应用程序在此处列出以供考虑，如果您发现任何对您的工作有用的工具，或者是为了获得灵感（如果他们的许可证允许的话）。

## 驱动器和连接器

MonetDB 的纯 Ruby 数据库驱动程序
MonetDB MAPI 和 SQL 客户端 Python API
MonetDB 的 Go 驱动程序
MonetDB 的 golang 驱动程序
用于 PostgreSQL 的 MonetDB 外部数据包装器
Ganglia MonetDB 插件
Django 支持 MonetDB
MonetDB ActiveRecord Ruby 客户端
MonetDB 的 SQLAlchemy 方言
用于 DBI 的 MonetDB 驱动程序
OpenJUMP MonetDB 数据存储插件

## 工具和扩展

用于将表从 MS SQL 数据库复制到 MonetDB 数据库的工具
Lucene 到 MonetDB 转换器
在 MonetDB 上搜索 github.com
用于压力测试的 Sqlsmith
用于压力测试的 Sqlancer
Postgresql 外部文件包装器

## 应用

Tableau 连接器
用于 MonetDB 的简单 GeoTools 基于 JDBC 的数据存储
MonetinR - 基于 MonetDB 的 R 包

# 参考资料

https://www.monetdb.org/documentation-Jan2022/user-guide/introduction-to-monetdb/

* any list
{:toc}
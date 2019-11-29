---
layout: post
title: POLARDB-04-PolarDB 数据迁移 ADAM
date:  2019-11-20 11:18:30 +0800
categories: [Database]
tags: [database, distributed-database, olap, oltp, htap, sh]
published: true
---

# 从自建Oracle迁移至POLARDB

本文介绍如何使用阿里云ADAM产品可以简化Oracle数据库和应用迁移至POLARDB数据库的流程，帮助您完成数据库和应用改造。

# 背景信息

数据库和应用迁移服务（Advanced Database & Application Migration，简称 ADAM）是阿里云结合阿里巴巴多年的内部业务系统和数据库异构迁移经验（Oracle to MySQL/PPAS/PostgreSQL/POLARDB等）研发的，用于帮助企业数据库和应用业务系统高效、轻松上云的产品，能够为迁移Oracle数据库到阿里云相关数据库提供全生命周期支持，特别是对POLARDB 兼容Oracle语法引擎的数据库，

## 主要能力

主要能力如下：

- 客观、全面评估迁移的可行性，并自动给出目标数据库的规格和容量，以及可能存在的风险SQL；

- 协助完成PL/SQL转Java、SQL语法转换；

- 自动完成数据库DDL兼容性转换，无法转换DDL也会给出应用级别的改造建议方案；

- 提供数据库结构割接工具和应用改造建议支持。

## 迁移步骤

1. 下载ADAM产品采集客户端。

2. 采集Oracle数据库相关信息。

3. 上传采集数据库包。

4. 在阿里云ADAM SaaS分析平台完成源库数据分析和解决方案分析。

5. 使用ADAM studio工具迁移Oracle数据库至POLARDB兼容Oracle语法引擎的数据库，请您下载手册后按照手册内容操作。

# 参考资料

[从自建Oracle迁移至POLARDB](https://help.aliyun.com/document_detail/119054.html?spm=a2c4g.11186623.6.578.2aad7654rf2mX2)

* any list
{:toc}
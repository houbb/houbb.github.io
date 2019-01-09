---
layout: post
title: Greenplum Database
date: 2019-1-9 08:44:18 +0800
categories: [Database]
tags: [database, big-data, sh]
published: true
excerpt: Greenplum 数据库
---

# greenplum 

[Experience Greenplum Database](https://greenplum.org/) , an open-source massively parallel data platform for analytics, machine learning and AI.

## greenplum 与 postgresql

greenplum是利用了 postgresql 数据库的框架，也就相当于说是，GP数据库是基于PG数据库进行开发的。

## 特性

如果想在数据仓库中快速查询结果，可以使用greenplum。

Greenplum数据库也简称GPDB。它拥有丰富的特性：

第一，完善的标准支持：GPDB完全支持ANSI SQL 2008标准和SQL OLAP 2003 扩展；从应用编程接口上讲，它支持ODBC和JDBC。完善的标准支持使得系统开发、维护和管理都大为方便。而现在的 NoSQL，NewSQL和Hadoop 对 SQL 的支持都不完善，不同的系统需要单独开发和管理，且移植性不好。

第二，支持分布式事务，支持ACID。保证数据的强一致性。

第三，做为分布式数据库，拥有良好的线性扩展能力。在国内外用户生产环境中，具有上百个物理节点的GPDB集群都有很多案例。

第四，GPDB是企业级数据库产品，全球有上千个集群在不同客户的生产环境运行。这些集群为全球很多大的金融、政府、物流、零售等公司的关键业务提供服务。

第五，GPDB是Greenplum（现在的Pivotal）公司十多年研发投入的结果。GPDB基于PostgreSQL 8.2，PostgreSQL 8.2有大约80万行源代码，而GPDB现在有130万行源码。相比PostgreSQL 8.2，增加了约50万行的源代码。

第六，Greenplum有很多合作伙伴，GPDB有完善的生态系统，可以与很多企业级产品集成，譬如SAS，Cognos，Informatic，Tableau等；也可以很多种开源软件集成，譬如Pentaho,Talend 等。

# 拓展阅读

[postgresql](https://houbb.github.io/2018/01/08/postgresql)

- 列式数据库

[info-bright](https://houbb.github.io/2018/12/27/info-bright)

- 数据查询

[Elasticsearch](https://houbb.github.io/2018/11/15/elasticsearch)

# 参考资料

[官方教程](https://greenplum.org/gpdb-sandbox-tutorials/)

[海量数据处理利器greenplum——初识](https://www.cnblogs.com/skyme/p/5779885.html)

* any list
{:toc}


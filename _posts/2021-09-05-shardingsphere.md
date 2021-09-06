---
layout: post
title: shardingsphere-分布式数据库生态圈
date: 2021-09-05 21:01:55 +0800
categories: [java]
tags: [java, mysql, sh]
published: true
---

# 概述

Apache ShardingSphere 是一个开源生态系统，由一套分布式数据库解决方案组成，包括 JDBC、Proxy & Sidecar（Planning）3 个独立产品。它们都提供了数据横向扩展、分布式事务和分布式治理的功能，适用于Java同构、异构语言、云原生等多种场景。

Apache ShardingSphere 旨在在分布式系统中合理地充分利用现有数据库的计算和存储能力，而不是一个新的数据库。关系型数据库作为企业的基石，依然占据着巨大的市场份额。因此，我们更愿意关注它的增量而不是完全翻转。

Apache ShardingSphere 从 5.x 版本开始专注于可插拔架构，特性可以嵌入到项目的灵活性中。目前支持的数据分片、副本查询、数据加密、影子测试等特性，以及支持的MySQL、PostgreSQL、SQLServer、Oracle等SQL方言/数据库协议，都是通过插件编织而成的。

开发人员可以像构建乐高积木一样自定义他们的 ShardingSphere 系统。现在有很多 Apache ShardingSphere 的 SPI 扩展，并且它们还在不断增加。

ShardingSphere 于 2020 年 4 月 16 日成为 Apache 顶级项目。

![ShardingSphere](https://camo.githubusercontent.com/ba6655c266489b158da6ab82a944f70911f5442e8f2efd6589e544daadbbdbaa/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f646f63756d656e742f63757272656e742f696d672f7368617264696e677370686572652d73636f70655f656e2e706e67)

# ShardingSphere-JDBC

Maven 状态

ShardingSphere-JDBC 将自己定义为一个轻量级的 Java 框架，在 Java JDBC 层提供额外的服务。 

客户端直接连接数据库，以jar的形式提供服务，不需要额外的部署和依赖。 

它可以被认为是一个增强的JDBC驱动程序，它完全兼容JDBC和各种ORM框架。

- 适用于任何基于JDBC的ORM框架，如JPA、Hibernate、Mybatis、Spring JDBC Template或直接使用JDBC。

- 支持任何第三方数据库连接池，如DBCP、C3P0、BoneCP、Druid、HikariCP。

- 支持任何类型的 JDBC 标准数据库：MySQL、Oracle、SQLServer、PostgreSQL 和任何遵循 SQL92 的数据库。

![jdbc](https://camo.githubusercontent.com/f73195e2b233d56ce7b44de6fab7810d1ad39a491cb538572f8209e18ea3a3a1/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f646f63756d656e742f63757272656e742f696d672f7368617264696e677370686572652d6a6462632d62726965662e706e67)


# ShardingSphere-代理

ShardingSphere-Proxy 将自身定义为一个透明的数据库代理，提供一个数据库服务器，封装了数据库二进制协议以支持异构语言。 

对DBA 更友好，现在提供的MySQL/PostgreSQL 版本的代理可以使用任何兼容MySQL/PostgreSQL 协议的客户端访问（如MySQL Command Client、MySQL Workbench、Navicat 等）来操作数据。

- 对应用透明，可直接作为MySQL和PostgreSQL服务器使用。

- 适用于任何兼容MySQL和PostgreSQL协议的兼容客户端。

![ShardingSphere-代理](https://camo.githubusercontent.com/e196be3c6932cf377d864a25cce1e5a429bf88e5c3017b7eeb3a75bf9fbb145b/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f646f63756d656e742f63757272656e742f696d672f7368617264696e677370686572652d70726f78792d62726965662e706e67)

# ShardingSphere-Sidecar(TODO)

ShardingSphere-Sidecar（TODO）将自身定义为Kubernetes环境的云原生数据库代理，以sidecar的形式负责对数据库的所有访问。 

它提供了一个与数据库交互的网格层，我们称之为数据库网格。

数据库网格强调如何将分布式数据访问应用程序与数据库连接起来。 以交互为核心，有效组织杂乱的应用程序和数据库之间的交互。 

使用Database Mesh访问数据库的应用程序和数据库会形成一个庞大的网格系统，只需将它们相应地放置在正确的位置即可。 

它们都由网格层控制。

![ShardingSphere-Sidecar](https://camo.githubusercontent.com/351e403785d13c80cb1f7d4b8bc22dbbc8363faaead96746a9202a7b80ecae9a/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f646f63756d656e742f63757272656e742f696d672f7368617264696e677370686572652d736964656361722d62726965662e706e67)

# 混合架构

ShardingSphere-JDBC采用去中心化架构，适用于Java开发的高性能轻量级OLTP应用； ShardingSphere-Proxy 提供静态入口和全语言支持，适用于OLAP应用和分片数据库的管理和运行情况。

ShardingSphere 是一个由多个端点组成的生态圈。 

通过ShardingSphere-JDBC和ShardingSphere-Proxy的混合使用，以及同一个注册中心统一的分片策略，ShardingSphere可以构建一个适用于各种场景的应用系统。 

架构师可以更自由地将系统架构调整为最适合当前业务的架构。

![混合架构](https://camo.githubusercontent.com/7b7f38eee5154190822c1e5195885a534ac0e621b1a6bbcf7cb88b8348385abd/68747470733a2f2f7368617264696e677370686572652e6170616368652e6f72672f646f63756d656e742f63757272656e742f696d672f7368617264696e677370686572652d6879627269642e706e67)


# 特征

## 数据分片

- 分库分表

- 副本查询

- 分片策略定制

- 无中心分布式主键

## 分布式事务

- 统一交易API

- XA 交易

- 基础交易

## 数据库治理

- 分布式治理

- 数据迁移和横向扩展

- 可观察性（跟踪/指标）支持

- 数据加解密

- 用于性能测试的影子表

# 参考资料

https://github.com/apache/shardingsphere

* any list
{:toc}
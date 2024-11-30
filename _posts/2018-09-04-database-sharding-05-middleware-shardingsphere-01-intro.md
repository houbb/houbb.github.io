---
layout: post
title: sharding database-05-apache shardingsphere 01 分布式的数据库生态系统入门介绍
date: 2021-09-05 21:01:55 +0800
categories: [Databae]
tags: [database, sql, database-sharding, open-source, sh]
published: true
---

# 概述

Apache ShardingSphere 是一个开源生态系统，由一套分布式数据库解决方案组成，包括 JDBC、Proxy & Sidecar（Planning）3 个独立产品。

它们都提供了数据横向扩展、分布式事务和分布式治理的功能，适用于Java同构、异构语言、云原生等多种场景。

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

# 产品功能

| 特性           | 定义                                                                                                                                                              |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 数据分片       | 处理海量数据存储与计算的有效手段。ShardingSphere基于底层数据库提供分布式数据库解决方案，实现了数据的水平扩展、计算和存储的分片化。                                           |
| 分布式事务     | 保障数据库完整、安全的关键技术，也是数据库的核心技术。ShardingSphere基于XA和BASE的混合事务引擎，提供在独立数据库上的分布式事务功能，确保跨数据源的数据安全。        |
| 读写分离       | 应对高压力业务访问的手段。基于对SQL语义理解及底层数据库拓扑感知能力，ShardingSphere提供灵活的读写流量拆分和读流量负载均衡，优化高访问压力下的数据库访问。          |
| 数据迁移       | 打通数据生态的关键能力。ShardingSphere提供跨数据源的数据迁移能力，并支持重分片扩展，使数据在不同环境间实现无缝迁移，确保数据流动和应用平滑升级。                |
| 联邦查询       | 面对复杂数据环境下利用数据的有效手段。ShardingSphere提供跨数据源的复杂查询分析能力，实现跨源的数据关联与聚合，支持联邦查询，让数据在不同源间协同工作。             |
| 数据加密       | 保证数据安全的基本手段。ShardingSphere提供完整、透明、安全、低成本的数据加密解决方案，确保数据在存储和传输过程中的安全性，满足安全合规性的要求。                    |
| 影子库         | 在全链路压测场景下，ShardingSphere支持不同工作负载下的数据隔离，避免测试数据污染生产环境。通过影子库，可以在不影响实际环境的情况下进行全链路压测和性能分析。      |

这些功能涵盖了ShardingSphere在分布式数据库、事务处理、读写优化、数据迁移、查询处理、数据安全和测试环境模拟等方面的解决方案。

# 产品优势

## 极致性能

驱动程序端历经长年打磨，效率接近原生 JDBC，性能极致。

## 生态兼容

代理端支持任何通过 MySQL/PostgreSQL 协议的应用访问，驱动程序端可对接任意实现 JDBC 规范的数据库。

## 业务零侵入

面对数据库替换场景，ShardingSphere 可满足业务无需改造，实现平滑业务迁移。

## 运维低成本

在保留原技术栈不变前提下，对 DBA 学习、管理成本低，交互友好。

## 安全稳定

基于成熟数据库底座之上提供增量能力，兼顾安全性及稳定性。

## 弹性扩展

具备计算、存储平滑在线扩展能力，可满足业务多变的需求。

## 开放生态

通过多层次（内核、功能、生态）插件化能力，为用户提供可定制满足自身特殊需求的独有系统。

# 设计哲学

ShardingSphere 采用 Database Plus 设计哲学，该理念致力于构建数据库上层的标准和生态，在生态中补充数据库所缺失的能力。

![db-plus](https://shardingsphere.apache.org/document/current/img/design_cn.png)

## 连接：打造数据库上层标准

通过对数据库协议、SQL 方言以及数据库存储的灵活适配，快速构建多模异构数据库上层的标准，同时通过内置 DistSQL 为应用提供标准化的连接方式。

## 增强：数据库计算增强引擎

在原生数据库基础能力之上，提供分布式及流量增强方面的能力。前者可突破底层数据库在计算与存储上的瓶颈，后者通过对流量的变形、重定向、治理、鉴权及分析能力提供更为丰富的数据应用增强能力。

## 可插拔：构建数据库功能生态

![可插拔：构建数据库功能生态](https://shardingsphere.apache.org/document/current/img/overview_cn.png)

Apache ShardingSphere 的可插拔架构划分为 3 层，它们是：L1 内核层、L2 功能层、L3 生态层。

L1 内核层

是数据库基本能力的抽象，其所有组件均必须存在，但具体实现方式可通过可插拔的方式更换。 主要包括查询优化器、分布式事务引擎、分布式执行引擎、权限引擎和调度引擎等。

L2 功能层

用于提供增量能力，其所有组件均是可选的，可以包含零至多个组件。 组件之间完全隔离，互无感知，多组件可通过叠加的方式相互配合使用。 主要包括数据分片、读写分离、数据加密、影子库等。 用户自定义功能可完全面向 Apache ShardingSphere 定义的顶层接口进行定制化扩展，而无需改动内核代码。

L3 生态层

用于对接和融入现有数据库生态，包括数据库协议、SQL 解析器和存储适配器，分别对应于 Apache ShardingSphere 以数据库协议提供服务的方式、SQL 方言操作数据的方式以及对接存储节点的数据库类型。

# 部署形态

Apache ShardingSphere 由 ShardingSphere-JDBC 和 ShardingSphere-Proxy 这 2 款既能够独立部署，又支持混合部署配合使用的产品组成。 

它们均提供标准化的基于数据库作为存储节点的增量功能，可适用于如 Java 同构、异构语言、云原生等各种多样化的应用场景。

## ShardingSphere-JDBC 独立部署

ShardingSphere-JDBC 定位为轻量级 Java 框架，在 Java 的 JDBC 层提供的额外服务。 
它使用客户端直连数据库，以 jar 包形式提供服务，无需额外部署和依赖，可理解为增强版的 JDBC 驱动，完全兼容 JDBC 和各种 ORM 框架。

- 适用于任何基于 JDBC 的 ORM 框架，如：JPA, Hibernate, Mybatis, Spring JDBC Template 或直接使用 JDBC；

- 支持任何第三方的数据库连接池，如：DBCP, C3P0, BoneCP, HikariCP 等；

- 支持任意实现 JDBC 规范的数据库，目前支持 MySQL，PostgreSQL，Oracle，SQLServer 以及任何可使用 JDBC 访问的数据库。

![jdbc](https://shardingsphere.apache.org/document/current/img/shardingsphere-jdbc_v3.png)

| 特性             | ShardingSphere-JDBC                  | ShardingSphere-Proxy                |
| ---------------- | ----------------------------------- | ----------------------------------- |
| 数据库           | 任意                                | MySQL/PostgreSQL                   |
| 连接消耗数       | 高                                  | 低                                |
| 异构语言         | 仅 Java                             | 任意                               |
| 性能             | 损耗低                              | 损耗略高                           |
| 无中心化         | 是                                  | 否                                |
| 静态入口         | 无                                  | 有                                |


## ShardingSphere-Proxy 独立部署

ShardingSphere-Proxy 定位为透明化的数据库代理端，通过实现数据库二进制协议，对异构语言提供支持。 

目前提供 MySQL 和 PostgreSQL 协议，透明化数据库操作，对 DBA 更加友好。

- 向应用程序完全透明，可直接当做 MySQL/PostgreSQL 使用；

- 兼容 MariaDB 等基于 MySQL 协议的数据库，以及 openGauss 等基于 PostgreSQL 协议的数据库；

- 适用于任何兼容 MySQL/PostgreSQL 协议的的客户端，如：MySQL Command Client, MySQL Workbench, Navicat 等。

![ShardingSphere-Proxy 独立部署](https://shardingsphere.apache.org/document/current/img/shardingsphere-proxy_v2.png)

## 混合部署架构

ShardingSphere-JDBC 采用无中心化架构，与应用程序共享资源，适用于 Java 开发的高性能的轻量级 OLTP 应用； 

ShardingSphere-Proxy 提供静态入口以及异构语言的支持，独立于应用程序部署，适用于 OLAP 应用以及对分片数据库进行管理和运维的场景。

Apache ShardingSphere 是多接入端共同组成的生态圈。 

通过混合使用 ShardingSphere-JDBC 和 ShardingSphere-Proxy，并采用同一注册中心统一配置分片策略，能够灵活的搭建适用于各种场景的应用系统，使得架构师更加自由地调整适合于当前业务的最佳系统架构。

![mix](https://shardingsphere.apache.org/document/current/img/shardingsphere-hybrid-architecture_v2.png)

# 运行模式

Apache ShardingSphere 提供了两种运行模式，分别是单机模式和集群模式。

## 单机模式

能够将数据源和规则等元数据信息持久化，但无法将元数据同步至多个 Apache ShardingSphere 实例，无法在集群环境中相互感知。 通过某一实例更新元数据之后，会导致其他实例由于获取不到最新的元数据而产生不一致的错误。

适用于工程师在本地搭建 Apache ShardingSphere 环境。

## 集群模式

提供了多个 Apache ShardingSphere 实例之间的元数据共享和分布式场景下状态协调的能力。 它能够提供计算能力水平扩展和高可用等分布式系统必备的能力，集群环境需要通过独立部署的注册中心来存储元数据和协调节点状态。

在生产环境建议使用集群模式。

# 线路规划

![线路规划](https://shardingsphere.apache.org/document/current/img/roadmap_cn.png)

# 参考资料

https://github.com/apache/shardingsphere

https://shardingsphere.apache.org/document/current/cn/overview/

* any list
{:toc}
---
layout: post
title:  BI 可视化工具-Apache Superset 数据库分析工具 
date:  2021-1-25 16:52:15 +0800
categories: [BI]
tags: [bi, apache, database, sh]
published: true
---

# 什么是 Apache Superset？

Apache Superset（Incubating）是一个现代的，可用于企业的商业智能Web应用程序。

它快速，轻巧，直观，并带有各种选项，使所有技能的用户都可以轻松浏览和可视化其数据，从简单的饼图到高度详细的deck.gl地理空间图。

## 主要功能

以下是Superset的主要功能的概述：

- 开箱即用的丰富数据可视化集合

- 易于使用的界面，用于浏览和可视化数据

- 创建和共享仪表板

- 与大型身份验证提供程序（数据库，OpenID，LDAP，OAuth和REMOTE_USER通过Flask AppBuilder集成）集成的企业级身份验证

- 可扩展的高粒度安全性/权限模型，允许有关谁可以访问单个要素和数据集的复杂规则

- 一个简单的语义层，允许用户通过定义哪些字段应显示在哪个下拉列表中以及哪些聚合和功能度量可供用户使用来控制如何在UI中显示数据源

- 通过SQLAlchemy与大多数说SQL的RDBMS集成

- 与Druid.io的深度集成

## 云原生

Superset是云原生的，旨在提供高可用性。

它旨在扩展到大型的分布式环境，并且在容器内可以很好地工作。尽管您可以在适当的设置下或仅在笔记本电脑上轻松测试Superset驱动器，但扩展平台几乎没有任何限制。

从灵活性上讲，Superset还是云原生的，它使您可以选择：

- 网络服务器（Gunicorn，Nginx，Apache），

- 元数据数据库引擎（MySQL，Postgres，MariaDB等），

- 消息队列（Redis，RabbitMQ，SQS等），

- 结果后端（S3，Redis，Memcached等），

- 缓存层（Memcached，Redis等），

Superset还可以与NewRelic，StatsD和DataDog等服务一起很好地工作，并且能够针对大多数流行的数据库技术运行分析工作负载。

目前，Superset已在许多公司大规模运行。

例如，Superset在Kubernetes内的Airbnb生产环境中运行，每天为600多个活跃用户提供服务，每天查看超过10万张图表。

# 其他

## BuiltWith：构建库

Apache Superset 是由 Python 语言编写的，使用了一系列流行的开源库来实现其功能。其中一些关键的库包括：
Flask：一个用于构建 Web 应用程序的微型框架，提供了处理 HTTP 请求、模板渲染和路由等功能。
SQLAlchemy：一个 Python SQL 工具和对象关系映射器，用于处理数据库操作。
Pandas：一个功能强大的数据分析和处理库，提供了高性能、易于使用的数据结构和数据分析工具。
D3.js：一个用于创建动态、交互式数据可视化的 JavaScript 库，为 Superset 提供了丰富的可视化选项。
Redis：一个内存数据库，用于缓存和加速数据查询和分析。
通过这些库的使用，Superset 实现了丰富的功能和灵活的扩展性。

## 功能和特点：

Apache Superset 提供了以下主要功能和特点：

数据连接和导入：Superset 支持与各种数据源的连接，包括关系型数据库、NoSQL 数据库、数据湖和文件存储等。用户可以轻松地导入数据集并进行数据预处理。
交互式数据探索：Superset 提供了交互式的数据探索界面，用户可以使用直观的界面进行数据筛选、排序和分组，探索数据的不同维度和指标之间的关系。
数据可视化：Superset 提供了丰富的数据可视化选项，包括折线图、柱状图、散点图、地图、热力图等。用户可以根据自己的需求选择不同的图表类型，并进行自定义配置。
数据仪表盘：Superset 允许用户创建交互式的数据仪表盘，将多个图表和指标组合在一起，以便更好地展示和共享数据分析结果。
数据查询和分析：Superset 提供了强大的数据查询和分析功能，包括 SQL 编辑器、数据切片和切块、过滤器和聚合等。用户可以使用 SQL 查询语言自定义数据查询，并进行复杂的数据分析和计算。
安全和权限控制：Superset 支持多用户和多角色的权限管理，可以根据用户的角色和权限设置数据的访问权限和操作权限，确保数据的安全性和保密性。

## 应用场景：
Apache Superset 的优势在于其灵活性和易用性，适用于各种数据分析和可视化场景，包括：
业务数据分析：Superset 可以帮助企业和组织对业务数据进行深入分析，发现数据中的模式和趋势，从而支持决策和战略规划。
数据报告和可视化：Superset 提供了丰富的数据可视化选项，可以将数据转化为直观和易于理解的图表和报表，帮助用户更好地理解和传达数据分析结果。
数据监控和实时分析：Superset 支持实时数据流和流式数据分析，可以用于监控业务指标、实时数据处理和实时报表生成。
数据探索和发现：Superset 的交互式数据探索功能使用户能够快速浏览和发现数据的模式和关联性，从而提供洞察和创新的思路。

# 参考资料

[Apollo 配置中心的使用](http://www.bubuko.com/infodetail-3085698.html)

[springboot启动出现Access to DialectResolutionInfo cannot be null when 'hibernate.dialect' not set](https://blog.csdn.net/u010372981/article/details/89857112)

https://ctripcorp.github.io/apollo/#/zh/deployment/quick-start

https://mp.weixin.qq.com/s/r7FQJSTVjK0Td_5IptxpMA

* any list
{:toc}
---
layout: post
title:  Apache Superset 数据库分析工具
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

# 参考资料

[Apollo 配置中心的使用](http://www.bubuko.com/infodetail-3085698.html)

[springboot启动出现Access to DialectResolutionInfo cannot be null when 'hibernate.dialect' not set](https://blog.csdn.net/u010372981/article/details/89857112)

https://ctripcorp.github.io/apollo/#/zh/deployment/quick-start

* any list
{:toc}
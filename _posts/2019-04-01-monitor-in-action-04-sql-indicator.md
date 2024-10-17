---
layout: post
title: 监控系统实战-04-SQL 指标的数据源
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

我们可以考虑设计一套 SQL 指标。

不过SQL指标个人感觉设计的比较好的就是类似于 grafana 这种，可以内置支持常见的数据源最好。

## 拓展阅读

[grafana stack grafana-01-The open and composable observability and data visualization platform.](https://houbb.github.io/2021/06/20/apm-grafana-stack-grafana-01-overview)

# 整体思路

## 核心能力

基础指标信息的管理。

我们开始可以实现最基础的 jdbc 类型的数据库支持。

## 是一套语法，还是方言支持？

最开始其实想通过一套标准的 SQL 语法，实现常见的数据源支持。

比如 [Apache Calcite](https://houbb.github.io/2024/01/10/database-apache-calcite-doc-overview-01-intro)

这种大一统的理念其实挺好的，不过实际还是会发现，不同的 SQL 方言差别太大，这种想通过一种标准，来解决统一问题，兼容效果其实比较差。

最后还是考虑使用具体的方言，这样比较灵活一些。

## 更多类型的支持

后续可以根据用户的需求，引入新的数据源支持：

mysql/oracle/sql server

redis/memcache

es

mongodb

时序数据库 vm


# cmdb 是一切的基石

当然，数据源有两种维护方式，一种是让用户手动配置。

另一种是将应用所有关联的数据源信息，全部放到 cmdb 中管理。

当然，这其实是一个非常难得事情。

需要长久地维护，而且必须保证数据的正确性。

## 权限

方便按照应用等，控制数据源的权限。

### 便捷

用户选择应用后，可以联动出对应的数据库信息。

# 一些设计细节

## 偏移量

执行的时候，允许指定对应的偏移量。

方便用户比如今天执行昨天的数据

## 下次调度的时间

让用户可以自己选择。

# 小结

这种要结合自身的业务，其实 jdbc 可以解决大部分的问题。

另外的可以结合多种数据源一起来解决，比如 CAT / 日志 / 普米 / ZABBIX 等等。

# 参考资料

无

* any list
{:toc}
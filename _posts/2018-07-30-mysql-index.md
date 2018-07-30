---
layout: post
title:  MySQL Index
date:  2018-07-30 18:53:18 +0800
categories: [SQL]
tags: [sql, data struct]
published: true
---

# 摘要

本文以 MySQL 数据库为研究对象，讨论与数据库索引相关的一些话题。

特别需要说明的是，MySQL 支持诸多存储引擎，而各种存储引擎对索引的支持也各不相同，因此 MySQL 数据库支持多种索引类型，如 BTree 索引，哈希索引，全文索引等等。
为了避免混乱，本文将只关注于 [BTree](https://en.wikipedia.org/wiki/B-tree) 索引，因为这是平常使用 MySQL 时主要打交道的索引，至于哈希索引和全文索引本文暂不讨论。

文章主要内容分为三个部分。

第一部分主要从数据结构及算法理论层面讨论 MySQL 数据库索引的数理基础。

第二部分结合 MySQL 数据库中 MyISAM 和 InnoDB 数据存储引擎中索引的架构实现讨论聚集索引、非聚集索引及覆盖索引等话题。

第三部分根据上面的理论基础，讨论 MySQL 中高性能使用索引的策略。

# 数据结构及算法基础

## 索引的本质

MySQL 官方对索引的定义为：索引（Index）是帮助MySQL高效获取数据的数据结构。

提取句子主干，就可以得到索引的本质：**索引是数据结构**。

...TBC

# 参考资料

[MySQL索引背后的数据结构及算法原理](http://blog.codinglabs.org/articles/theory-of-mysql-index.html)

[MySQL索引与Index Condition Pushdown](http://blog.codinglabs.org/articles/index-condition-pushdown.html?utm_source=rss&utm_medium=rss&utm_campaign=rss)

* any list
{:toc}
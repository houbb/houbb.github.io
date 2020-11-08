---
layout: post
title: Mongo Query Plan-12  Mongo 查询计划
date: 2018-12-10 11:35:23 +0800
categories: [Database]
tags: [sql, nosql, explain, mongo, sh]
published: true
---

# 查询计划

mongodb 查询优化器处理查询, 并在给定可用索引的情况下为查询选择最有效的查询计划。然后, 查询系统在每次运行查询时都使用此查询计划。

查询优化器仅缓存那些可以有多个可行计划的查询形状的计划。

对于每个查询, 查询计划程序将在查询计划缓存中搜索适合查询形状的项。如果没有匹配的条目, 查询计划程序将生成候选计划, 以便在试用期内进行评估。查询计划器选择一个获胜计划, 创建一个包含获胜计划的缓存条目, 并使用它来生成结果文档。

如果存在匹配的条目, 查询计划程序将基于该条目生成一个计划, 并通过重新规划机制评估其性能。此机制根据计划性能做出传递失败决策, 并保留或删除缓存项。在逐出时, 查询计划程序使用正常规划选择新计划

![query-planner-diagram.bakedsvg.svg](https://docs.mongodb.com/manual/_images/query-planner-diagram.bakedsvg.svg)

有关触发对计划缓存的更改的其他方案, 请参阅计划缓存刷新。

可以使用 db.collection.explain() 或 cursors.explain() 方法来查看有关给定查询的查询计划的统计信息。

在开发索引策略时, 此信息可能会有所帮助。

db.collection.explain() 项提供了关于执行其他操作的信息, 例如 db.collection.update() 项。

有关详细信息, 请参阅 db.collection.explain()。

在2.6 版中更改: explain() 操作不再读取或写入查询计划程序缓存。

# 索引过滤器

版本2.6中的新功能。

索引过滤器确定优化程序为查询形状评估的索引。查询形状由查询，排序和投影规范的组合组成。如果给定查询形状存在索引过滤器，则优化程序仅考虑过滤器中指定的那些索引。

当查询形状存在索引过滤器时，MongoDB会忽略 hint()。

要查看MongoDB是否为查询形状应用了索引筛选器，请检查 db.collection.explain() 或 cursor.explain() 方法的indexFilterSet字段。

索引过滤器仅影响优化程序评估的索引;优化器仍然可以选择集合扫描作为给定查询形状的获胜计划。

索引筛选器在服务器进程的持续时间内存在，并且在关闭后不会保留。 

MongoDB还提供了手动删除过滤器的命令。

由于索引筛选器会覆盖优化程序的预期行为以及 hint() 方法，因此请谨慎使用索引筛选器。



# 参考资料

[Query Plans](https://docs.mongodb.com/manual/core/query-plans/)

* any list
{:toc}
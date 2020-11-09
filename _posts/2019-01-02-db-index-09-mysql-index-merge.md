---
layout: post
title:  数据库索引-09-MySQL Index Merge 索引合并
date:  2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [sql, mysql, index, sh]
published: true
---

# 索引合并

本文翻译自MySQL 8.0 Reference Manual 8.2.1.3 Index Merge Optimization

Index Merge访问方法(Access method)通过合并多个范围扫描并对结果进行合并，然后获取最终需要返回的行数据。合并多个索引的扫描方法仅仅支持单表访问，不可用于多表关联查询。目前支持的合并方式有并集(unions)，交集(intersections)以及交集的并集(unions of intersections)。

如下的查询可能会采用Index Merge优化

```sql
SELECT * FROM tbl_name WHERE key1 = 10 OR key2 = 20;

SELECT * FROM tbl_name WHERE (key1 = 10 OR key2 = 20) AND non_key = 20;

SELECT * FROM t1, t2
WHERE (t1.keys IN(1, 2) OR t1.key2 LIKE 'value%')
AND t2.key2 = t1.some_col;

SELECT * FROM t1, t2
WHERE t1.key1 = 1
AND (t2.key1 = t1.some_col OR t2.key2 = t1.some_col2);
```

## 限制

注意，Index Merge 算法具有如下限制：

1、如果查询语句具有复杂的WHERE子句，AND/OR具有深层嵌套，那么MySQL也许没法选择最优的查询计划，应该试着对其进行转换。

```sql
(x AND y) OR z => (x OR z) AND (y OR z);

(x OR y) AND z => (x AND z) OR (y AND z);
```


2、Index Merge不支持全文索引。

在EXPLAIN输出中，Index Merge优化会在type列标识为index merge。

在这种场景中，key列则列出了使用了哪些索引， key_len列表示了使用这些索引中的最长key值。

Index Merge优化支持多种算法，在EXPLAIN输出的Extra列中分别为

```
Using intersect(...)
Using union(...)
Using sort_union(...)
```

下面将分别详细介绍这几种算法，优化器通过对多个变量的代价估算来选择Index Merge算法或者其他访问方法。

Index Merge Intersection Access Algorithm 交集访问算法

Index Merge Union Access Algorithm 并集访问算法

Index Merge Sort-Union Access Algorithm 排序-并集访问算法

配置 Index Merge 优化

# 交集访问算法（Index Merge Intersection Access Algorithm）

当查询语句的WHERE子句为多个不同索引的范围条件，并且通过AND连接时，可以使用交集访问算法。

另外，要求AND连接的每个条件必须是如下形式之一：

1、当索引包含多个列时，则每个列都必须被如下等值条件覆盖：

```
key_par1 = const1 AND key_par2 = const2 ... AND key_partN = constN
```

2、InnoDB表主键的范围查询条件。

```sql
SELECT * FROM innodb_table
WHERE primary_key < 10 AND key_col1 = 20;

SELECT * FROM tbl_name
WHERE key1_part1 =1 AND key1_part2 = 2 AND key2 = 2;
```

Index Merge 交集访问算法会在使用到的多个索引上同时进行扫描，并产生这些扫描结果的交集。

如果查询要求的列能够被使用到的所有覆盖（即索引中已经包含了要返回的所有列），那么将不需要进行表行数据的再次读取（这种情况下，EXPLAIN的Extra列会输出Using index），例如：

```
SELECT COUNT(*) FROM t1 WHERE key1 = 1 AND key2 = 1;
```

如果使用的索引没有覆盖要返回的列，那么仅仅需要对满足所有索引条件的数据进行完整行数据获取。

# 并集访问算法（Index Merge Union Access Algorithm）

并集访问算法的使用条件和上面第2节介绍的交易访问算法类似，不同的是多个不同索引的范围查询条件是通过OR进行连接的。另外，要求OR连接的每个条件必须是如下形式之一：

(1) 当索引包含多个列时，则每个列都必须被如下等值条件覆盖：

```
key_par1 = const1 OR key_par2 = const2 ... OR key_partN = constN
```

(2) InnoDB表主键的范围查询条件。

例如

```sql
SELECT * FROM t1
WHERE key1 = 1 OR key2 = 2 OR key3 = 3;

SELECT * FROM innodb_table
WHERE (key1 = 1 AND key2 = 2)
OR (key3 = 'foo' AND key4 = 'bar') AND key5 = 5;
```

# 排序-并集访问算法（Index Merge Sort-Union Access Algorithm）

当WHERE子句是通过OR连接的多个范围查询条件，并且不满足并集访问算法时会使用此算法。

例如：

```sql
SELECT * FROM tbl_name
WHERE key_col1 < 10 OR key_col2 < 20;

SELECT * FROM tbl_name
WHERE (key_col1 > 10 OR key_col2 = 20) AND nonkey_col = 30;
--译者注：上面两个语句查询条件中没有满足多列索引的每个列都是等值条件
```

排序-并集访问算法和并集访问算法的不同在于排序-并集访问算法必须先获取所有满足条件的Row ID进行排序，然后再返回或者访问表数据。

# 配置Index Merge优化

可以通过optimizer_switch系统参数中的index_merge、index_merge_intersection、index_merge_union以及index_merge_sort_union标识控制Index Merge的使用。

默认配置下，这些标识都是启用状态-on。

如果只想启用特定的某种算法，则可以设置index_merge为off，然后将相应启用算法的标识设置为on即可。

# 个人收获

索引合并实际上是一种比较好的方式，避免创建联合索引。

从而使单个字段的查询都可以命中索引，又可以在某种程度降低索引的体积。

# 拓展阅读

[mongodb 索引合并](https://docs.mongodb.com/v4.0/core/index-intersection/)

# 参考资料

[Index Merge Optimization](https://dev.mysql.com/doc/refman/5.6/en/index-merge-optimization.html)

[Index Merge 优化](https://www.jianshu.com/p/1c00dc8be14a)

* any list
{:toc}
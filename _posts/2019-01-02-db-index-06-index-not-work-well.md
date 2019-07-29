---
layout: post
title: 数据库索引-06-索引运行不好的场景
date: 2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [hbase, apache, index, sh]
published: true
---

# 索引不生效的场景

## `!=` 或者 `<>`

负向条件查询不能使用索引

- 实例

```sql
select * from order where status!=0 and stauts!=1
```

not in/not exists都不是好习惯

建议优化为：

```sql
select * from order where status in(2,3)
```

## 在属性上进行计算不能命中索引

```sql
select * from order where YEAR(date) <= '2017'
```

即使date上建立了索引，也会全表扫描，可优化为值计算：

```sql
select * from order where date < = CURDATE()
```

或者：

```sql
select * from order where date < = '2017-01-01'
```
 

## 使用聚合函数

## 表关联的时候。只有当主键和外键具有相同的类型才会生效。

## LIKE, REGEX 只有当第一个不是通配符才会生效。

```sql
like '%abc'   ×
like 'abc%'   √
```

## ORDER BY

只有当条件不是表达式时会生效。多表的时候效果不好。

## 相同的字段太多

比如全是 0/1

- 实例

```
select * from user where sex=1
```

性别大部分只有男女，索引效果不佳。

经验上，能过滤80%数据时就可以使用索引。

对于订单状态，如果状态值很少，不宜使用索引，如果状态值很多，能够过滤大量数据，则应该建立索引。

# 为什么状态值少索引效果不佳

数据库底层的数据结构，都是 B 树（或者 B+ Tree）。

B+ Tree 范围查找优势比较大。

非聚集索引，索引对应的 B 树的叶子存储的就是对应的主键地址，会根据主键查找到对应的记录。

然后取把这条数据查出来，再看是否符合条件。

换言之，必须具有很高的过滤性，这个索引才有意义。

# 拓展阅读

[B Tree](https://houbb.github.io/2018/09/12/b-tree)

[mysql-index](https://houbb.github.io/2018/09/03/mysql-index-tips)

[聚集索引](https://houbb.github.io/2019/01/02/db-index-03-cluster-index)

# 拓展阅读

[为什么状态少的字段不能建索引](https://blog.csdn.net/youzhouliu/article/details/51751860)

* any list
{:toc}
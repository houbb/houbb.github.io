---
layout: post
title:  MySQL Tables 获取 mysql 所有表名称和列名称
date:  2018-09-03 08:57:39 +0800
categories: [SQL]
tags: [sql, mysql, sh]
published: true
---

# 业务背景

有时候我们需要所有的表名称，这个要如何获取呢？

# 解决方案

## 所有表名称

```sql
select table_name from information_schema.tables where table_schema='数据库表名';
```

## 根据表名获取列名与列值

```sql
select ORDINAL_POSITION as Colorder,Column_Name as ColumnName,COLUMN_COMMENT as DeText
from information_schema.columns where table_schema = '数据库名称' and table_name = '表名' 
order by ORDINAL_POSITION asc;
```

## 查询所有的表条数

```sql
select table_name,table_rows from information_schema.tables where TABLE_SCHEMA = '数据库名称' order by 
table_rows desc;
```

# 个人收获

这些都隶属于表的 metadata。


# oracle 的条数查看

```sql
select table_name, num_rows from user_tables order by num_rows desc;
```

# 拓展阅读

oracle 

# 参考资料

[MySql 获取数据库的所有表名](https://www.cnblogs.com/ZengJiaLin/p/11653915.html)

* any list
{:toc}
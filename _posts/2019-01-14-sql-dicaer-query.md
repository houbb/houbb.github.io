---
layout: post
title: SQL 笛卡尔积处理
date: 2019-1-14 18:40:37 +0800
categories: [SQL]
tags: [sql, sh]
published: true
excerpt: SQL 笛卡尔积处理
---

# 笛卡尔积


# 实际问题

查询 A 表，关联 B 表。但是 B 表的记录可能存在多条。

## 原始

```sql
SELECT count(a.ID)
FROM A a 
LEFT JOIN B b
ON a.order_no=b.order_no
WHERE ....
GROUP BY ... 
Having...
```

## 修正

可以将 B 查询关联中用到的数据做一个子查询。

可以如下处理：

```sql
SELECT count(a.ID)
FROM A a 
LEFT JOIN (SELECT DISTINCT order_no FROM B) b
ON a.order_no=b.order_no
WHERE ....
GROUP BY ... 
Having...
```

# 拓展阅读

[1:n 重复问题](https://houbb.github.io/2017/11/20/sql-query#1n)


* any list
{:toc}


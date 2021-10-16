---
layout: post
title:  MySQL group by mysql 分组查询取第一条（时间排序）
date:  2018-09-03 08:57:39 +0800
categories: [SQL]
tags: [sql, mysql, sh]
published: true
---

# 业务背景

mysql 分组后，取每组第一条数据

# 环境

MySQL：5.7

## SQL

```sql
select * from (select distinct(a.id) tid, a.* from template_detail a
               where a.template_id in (3, 4)
              order by a.id desc) tt
group by tt.template_id;
```

思路：先进行排序，然后再进行分组，获取每组的第一条。

## 一些疑问

Q: 为什么要写distinct(a.id)呢？

A：防止合并的构造（derived_merge）；

# 什么是derived_merge？

derived_merge 指的是一种查询优化技术，作用就是把派生表合并到外部的查询中，提高数据检索的效率。

这个特性在MySQL5.7版本中被引入，可以通过如下SQL语句进行查看/开启/关闭等操作。

上面虽然听起来感觉很牛逼的样子，但是实际情况是，这个新特性，不怎么受欢迎，容易引起错误。

可以在子查询中使用以下函数来进行关闭这个特性：

可以通过在子查询中使用任何阻止合并的构造来禁用合并，尽管这些构造对实现的影响并不明确。 

防止合并的构造对于派生表和视图引用是相同的：

1. 聚合函数（ SUM() ， MIN() ， MAX() ， COUNT()等）

2. DISTINCT

3. GROUP BY

4. HAVING

5. LIMIT

6. UNION或UNION ALL

7. 选择列表中的子查询

8. 分配给用户变量

9. 仅引用文字值（在这种情况下，没有基础表）

# 子查询 order by 失效的场景

```sql
select * from (select a.* from template_detail a
               where a.template_id in (3, 4)
              order by a.id desc) tt
group by tt.template_id;
```

假设我们现在把 `distinct(a.id) tid` 去掉，会发现子查询（或者叫：临时表）中的order by a.id desc失效了。

为什么会这样呢？

## 原理分析：

我们这里使用了临时表排序，继而对其结果进行分组，结果显示失败，加了distinct(a.id) tid,后结果正确，原因是因为临时表（派生表derived table）中使用order by且使其生效，必须满足三个条件：

- 外部查询禁止分组或者聚合

- 外部查询未指定having，HAVING， order by

- 外部查询将派生表或者视图作为from句中唯一指定源

不满足这三个条件，order by会被忽略。

一旦外部表使用了group by，那么临时表（派生表 derived table）将不会执行filesort操作（即order by 会被忽略）。

之后我使用了limit可以使其生效，原因是因为要使派生表order by生效，派生表可以通过使用group by、limit、having、distinct等等使其生效（方法有好多，详情可看文档https://dev.mysql.com/doc/refman/5.7/en/derived-table-optimization.html）

# 参考资料

[MYSQL GROUP BY ORDER BY 分组排序获取第一条数据](https://blog.csdn.net/yunzhonghefei/article/details/105634923)

[MySQL实现分组排序并取组内第一条数据](https://www.cnblogs.com/Jimc/p/12485225.html)

https://bbs.csdn.net/topics/392708176

https://blog.csdn.net/u013066244/article/details/116461584

* any list
{:toc}
---
layout: post
title: RocketMQ-12-api 消费者接口文档
date: 2022-03-18 21:01:55 +0800 
categories: [SQL]
tags: [sql, sh]
published: true
---

# 问题

假设有A、B两张表。

如果查询在A表中存在，但是在B表中不存在的记录，应该如何操作？

## 例子数据

假设A表数据：

```
id
1
2
3
4
5
```

B表数据：

```
id	a_id
1	3
```

其中，B表中的a_id是需要排除的A表的id。

这里我们要排除A表中id为3的记录，实际中可能有上万条记录。

## 子查询方法

一般我们首先想到的可能就是not in语句：

```sql
select A.* from A where A.id not in(select B.a_id from B);
```

这样可以查询出正确的结果。

但是如果B表很长，那么执行上述的查询语句，需要用A表中的字段去匹配B表中的每一个字段。

相当于是A表的每一个字段都要遍历一次B表，效率非常低下。

只要A中的字段不在B表中那么肯定要遍历完B表，如果A表中的字段在B表中，那么只要遍历到就退出，进行A表中下一个字段的匹配。

## 使用join方法

连接查询使我们平时进行sql查询用到最多的操作之一了。

相对于not in，使用连接查询的效率更高。

以下我们分步骤解析用join方法的过程。

因为我们需要搜索的是A表中的内容，所以第一步，我们使用A表左连接B表，如下：

```sql
select * from A left join B on A.id = B.a_id;
```

这样B表中会补null，查询结果：

```
id	id1		a_id
1	NULL	NULL
2	NULL	NULL
3	1		3
4	NULL	NULL
5	NULL	NULL
```

因为A、B两表中字段id相同，所以B表中的id字段变成了id1。

仔细观察可以发现，我们需要的结果集[1, 2, 4, 5]所对应的id1字段都是null。

这样，在查询语句中加入条件B.id is null，不就可以完成对只在A表中，但不在B表中的结果集的查询。

另外，我们只需要A表中的数据，B表的数据忽略。

于是最终变成：

```sql
select A.* from A left join B on A.id=B.a_id where B.id is null;
```

结果就是：

```
id
1
2
4
5
```

就是我们需要的结果，在A表中，但是不在B表中的记录。

这样做还有一个好处，如果A、B表的id、和B表的a_id都加了索引，那么join方式就能够命中索引。

而如果是子查询，在MySQL5.6之前的版本，就不会用到A表的索引，查询效率大

# 参考资料

[查询在A表不在B表的数据](https://segmentfault.com/a/1190000015380991)

* any list
{:toc}
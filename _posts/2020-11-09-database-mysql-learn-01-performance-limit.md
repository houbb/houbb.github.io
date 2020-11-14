---
layout: post
title: mysql learn-01-mysql limit 的分页性能很差问题及其解决方案
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [data, mysql, learn-note, sh]
published: true
---

# 业务背景

以前有一个查询是全表扫，感觉对 database 不友好。

所以想改为 limit 进行分页查询。

代码编写时使用 mybatis-pageHelper 分页插件，直接处理分页。

结果实际性能却很差，为什么呢？

# limit 的性能问题

MySQL的limit基本用法很简单。limit接收1或2个整数型参数，如果是2个参数，第一个是指定第一个返回记录行的偏移量，第二个是返回记录行的最大数目。

初始记录行的偏移量是0。

为了与PostgreSQL兼容，limit也支持 `limit # offset #`。

## 性能缺陷

对于小的偏移量，直接使用limit来查询没有什么问题，但**随着数据量的增大，越往后分页，limit语句的偏移量就会越大，速度也会明显变慢**。

为什么会变慢？

```sql
select * from table_name limit 10000,10
```

这句 SQL 的执行逻辑是

1. 从数据表中读取第N条数据添加到数据集中

2. 重复第一步直到 N = 10000 + 10

3. 根据 offset 抛弃前面 10000 条数

4. 返回剩余的 10 条数据

## 优化方式 1

根据数据库这种查找的特性，就有了一种想当然的方法，利用自增索引（假设为id）：

```sql
select * from table_name where (id >= 10000) limit 10
```

由于普通搜索是全表搜索，适当的添加 WHERE 条件就能把搜索从全表搜索转化为范围搜索，大大缩小搜索的范围，从而提高搜索效率。

这个优化思路就是告诉数据库：「你别数了，我告诉你，第10001条数据是这样的，你直接去拿吧。」

但是！！！你可能已经注意到了，这个查询太简单了，没有任何的附加查询条件，如果我需要一些额外的查询条件，比如我只要某个用户的数据 ，这种方法就行不通了。

可以见到这种思路是有局限性的，首先必须要有自增索引列，而且数据在逻辑上必须是连续的，其次，你还必须知道特征值。

如此苛刻的要求，在实际应用中是不可能满足的。

## 第二次优化

说起数据库查询优化，第一时间想到的就是索引，所以便有了第二次优化：

先查找出需要数据的索引列（假设为 id），再通过索引列查找出需要的数据。

```sql
select * from table_name Where id in (Select id From table_name where ( user = xxx )) limit 10000, 10;

select * from table_name where( user = xxx ) limit 10000,10
```

相比较结果是（500w条数据）：第一条花费平均耗时约为第二条的 1/3 左右。

同样是较大的 offset，第一条的查询更为复杂，为什么性能反而得到了提升？

这涉及到 mysql 主索引的数据结构 b+Tree ，这里不展开，基本原理就是：

（1）子查询只用到了索引列，没有取实际的数据，所以不涉及到磁盘IO，所以即使是比较大的 offset 查询速度也不会太差。

（2）利用子查询的方式，把原来的基于 user 的搜索转化为基于主键（id）的搜索，主查询因为已经获得了准确的索引值，所以查询过程也相对较快。

## 第三次优化

在数据量大的时候 in 操作的效率就不怎么样了，我们需要把 in 操作替换掉，使用 join 就是一个不错的选择。

```sql
select * from table_name inner join ( select id from table_name where (user = xxx) limit 10000,10) b using (id)
```

至此 limit 在查询上的优化就告一段落了。如果还有更好的优化方式，欢迎留言告知

## 最终优化

技术上的优化始终是有天花板的，业务的优化效果往往更为显著。

比如在本例中，因为数据的时效性，我们最终决定，只提供最近15天内的操作日志，在这个前提下，偏移值 offset 基本不会超过一万，这样一来，即使是没有经过任何优化的 sql，其执行效率也变得可以接受了，所以优化不能局限于技术层面，有时候对需求进行一下调整，可能会达到意想不到的效果。

ps: 这种优化需要结合具体的业务场景。

比如 alibaba 就是这么做的。

# 解决方案

## 子查询的分页方式或者JOIN分页方式。

JOIN分页和子查询分页的效率基本在一个等级上，消耗的时间也基本一致。

下面举个例子。一般MySQL的主键是自增的数字类型，这种情况下可以使用下面的方式进行优化。

下面以真实的生产环境的80万条数据的一张表为例，比较一下优化前后的查询耗时：

– 传统limit，文件扫描

```sql
SELECT * FROM tableName ORDER BY id LIMIT 500000,2;
受影响的行: 0
时间: 5.371s
```

– 子查询方式，索引扫描

```sql
SELECT * FROM tableName
WHERE id >= (SELECT id FROM tableName ORDER BY id LIMIT 500000 , 1)
LIMIT 2;
受影响的行: 0
时间: 0.274s
```

– JOIN分页方式

```sql
SELECT *
FROM tableName AS t1
JOIN (SELECT id FROM tableName ORDER BY id desc LIMIT 500000, 1) AS t2
WHERE t1.id <= t2.id ORDER BY t1.id desc LIMIT 2;
受影响的行: 0
时间: 0.278s
```

可以看到经过优化性能提高了将近20倍。

## 优化原理

子查询是在索引上完成的，而普通的查询时在数据文件上完成的，通常来说，索引文件要比数据文件小得多，所以操作起来也会更有效率。

因为要取出所有字段内容，第一种需要跨越大量数据块并取出，而第二种基本通过直接根据索引字段定位后，才取出相应内容，效率自然大大提升。

因此，对limit的优化，不是直接使用limit，而是首先获取到offset的id，然后直接使用limit size来获取数据。

在实际项目使用，可以利用类似策略模式的方式去处理分页，例如，每页100条数据，判断如果是100页以内，就使用最基本的分页方式，大于100，则使用子查询的分页方式。

# 参考资料

[MySQL的Limit性能问题](https://blog.csdn.net/weixin_43066287/article/details/90024600)

[MySQL 用 limit 为什么会影响性能？](https://www.cnblogs.com/FYZHANG/p/zhangyachen.html)

[mysql limit 性能优化](https://www.jianshu.com/p/efecd0b66c55)

* any list
{:toc}
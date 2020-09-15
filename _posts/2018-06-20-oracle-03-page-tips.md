---
layout: post
title:  Oracle 系统学习-03-oracle 分页存在数据重复问题
date:  2018-06-20 10:46:06 +0800
categories: [Oracle]
tags: [oracle, sql, ex]
published: true
---

# 现象

以前做页面查询，都是直接通过分页插件实现分页。

可是有一次写了很简单的查询，却发现查询的时候数据重复。

```sql
select * from user where rownum <= 10;
```

这到底是什么原因呢？

在实际应用中偶尔会出现数据重复问题.

# 原因

这里的ROWNUM是一个伪列，它是oracle为查询结果所编的一个号，第一行的ROWNUM为1，第二行为2，以此类推。 

因为oracle是按块进行读取数据的，如果数据按顺序存储，则可能使读取出来的数据是按顺序的，给用户误解为默认排序。

事实上，oracle没有进行任何排序操作，如果sql没有要求排序，oracle会顺序的从数据块中读取符合条件的数据返回到客户端。

所以在没有使用排序sql的时候，分页返回的数据可能是按顺序的，也可能是杂乱无章的，这都取决与数据的存储位置。

在分页查询过程中，如果数据的物理位置发生了改变，就可能会引起分页数据重复的现象。 

所以，**要正确使用分页查询，sql语句中必须有排序条件**。

# 解决方法

1). sql语句中需要有排序条件 且排序条件如果没有唯一性，那么必须在后边跟上一个唯一性的条件，比如主键。

我在开发中是用的是 order by rowid(我使用order by obj_id(主键) 测试了下还有重复)

2). 可以使用Oracle排序中的between...and...进行分页(同事给的解决方法 我没有实际应用).

ps: 个人一般会使用 create_time 精确到毫秒，同时注意这个字段在大批量数据插入的时候，尽量不能重复。

如果是交易系统，一定要做好防重复判断。

# 拓展阅读

[mysql 分页性能很差](https://houbb.github.io/2020/04/19/mysql-learn-01-performance-limit)

oracle 递归查询

oracle exists not exists 

# 参考资料

[针对Oracle分页数据重复问题](http://blog.sina.com.cn/s/blog_1764543ac0102wucy.html)

* any list
{:toc}








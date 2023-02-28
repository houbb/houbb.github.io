---
layout: post
title:  数据库索引-10-Mysql count(*)，count(字段)，count(1)的区别
date:  2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [sql, mysql, index, sh]
published: true
---

# 总数 count

select count(*)应该是一个比较常用的语句，用来统计记录行数。

但是，慢慢地你会发现，这个语句越来越慢了，为什么呢？

## count 的常见问题

关于数据库中行数统计，无论是MySQL还是Oracle，都有一个函数可以使用，那就是COUNT。

但是，就是这个常用的COUNT函数，却暗藏着很多玄机，尤其是在面试的时候，一不小心就会被虐。

不信的话请尝试回答下以下问题：

> 1、COUNT有几种用法？

> 2、COUNT(字段名)和COUNT(*)的查询结果有什么不同？

> 3、COUNT(1)和COUNT(*)之间有什么不同？

> 4、COUNT(1)和COUNT(*)之间的效率哪个更高？

> 5、为什么《阿里巴巴Java开发手册》建议使用COUNT(*)

> 6、MySQL的MyISAM引擎对COUNT(*)做了哪些优化？

> 7、MySQL的InnoDB引擎对COUNT(*)做了哪些优化？

> 8、上面提到的MySQL对COUNT(*)做的优化，有一个关键的前提是什么？

> 9、SELECT COUNT(*) 的时候，加不加where条件有差别吗？

> 10、COUNT(*)、COUNT(1)和COUNT(字段名)的执行过程是怎样的？

以上10道题，如果可以全部准确无误的回答的话，那说明你真的很了解COUNT函数了。


# 1. 初识COUNT

1、COUNT(expr) ，返回SELECT语句检索的行中expr的值不为NULL的数量。结果是一个BIGINT值。

2、如果查询结果没有命中任何记录，则返回0

3、但是，值得注意的是，COUNT(*) 的统计结果中，会包含值为NULL的行数。

除了 COUNT(id) 和 COUNT(`*`) 以外，还可以使用COUNT(常量)（如COUNT(1)）来统计行数，那么这三条SQL语句有什么区别呢？

到底哪种效率更高呢？

为什么《阿里巴巴Java开发手册》中强制要求不让使用 COUNT(列名)或 COUNT(常量)来替代 COUNT(*)呢？

# 2.COUNT(字段)、COUNT(常量)和COUNT(*)之间的区别

COUNT(常量) 和 COUNT(*) 表示的是直接查询符合条件的数据库表的行数。

而COUNT(列名)表示的是查询符合条件的列的值不为NULL的行数。

**COUNT(*)是SQL92定义的标准统计行数的语法，因为是标准语法，所以MySQL数据库进行过很多优化。**

SQL92，是数据库的一个ANSI/ISO标准。它定义了一种语言（SQL）以及数据库的行为（事务、隔离级别等）。

# 3. COUNT(*)的实现及优化

首先，我们来看下它的实现方式。

MySQL 中，不同的存储引擎，count(*)的实现方式是不同的。

1、MyISAM 引擎，比较简单粗暴，直接将表的总行数存储在磁盘上，因此效率很高；

2、InnoDB 引擎中，执行时，需要一行行的把数据查出来，然后累加；

为啥 MyISAM 就可以这样做呢？因为它不支持事务啊，不用担心数据不一致的问题。

而 InnoDB 就不一样了。

## MVCC 

由于 MVCC 的存在，InnoDB 在当前执行环境下，对一共有多少数据行是不确定的，比如：

假设，表 t 中有 1000 条数据，有下面三个用户并行的会话：

1、A 启动事务，查询表的总行数；

2、C 直接插入一条数据，然后查询总行数；

3、B 启动事务，插入一条数据，然后查询总行数；

4、C 查询总行数；

注意，上面启动的事务都没有提交。

![TX](https://upload-images.jianshu.io/upload_images/68057-0da5653abba64536.png)

A、B、C 查询的结果都不相同。

B 读到的是 1002，是因为可重复读隔离级别的存在，而 C 未开启事务，因此无法看到别的事务的更新；

综上，InnoDB 引擎中，在每一个会话中，都需要逐行读取数据，然后计数返回总行数。

## InnoDB 对 count(*) 的优化

InnoDB 中，主键索引存储的是数据，辅助索引存储的只是主键值。

因此，辅助索引比主键索引小得多，轻量得多。

这种情况下，**InnoDB 在执行count(*)时，就会判断使用哪个索引，会选择最小的树来进行遍历**。

在保证逻辑正确的前提下，尽量减少扫描的数据量，是数据库系统设计的通用法则之一。

## 小结

1、由于 MyISAM 引擎不需要支持事务，因此可以快速返回count(*)；

2、show table status 命令虽然返回很快，但是不准确；

3、InnoDB 执行 count(*) 时会遍历全表，因此性能较差；

# 4.COUNT(*)和COUNT(1)

MySQL官方文档这么说：

InnoDB handles SELECT COUNT(*) and SELECT COUNT(1) operations in the same way. There is no performance difference.

所以，对于count(1)和count(*)，MySQL的优化是完全一样的，根本不存在谁更快！

但依旧建议使用count(*)，因为这是SQL92定义的标准统计行数的语法。

# 5.COUNT(字段)

进行全表扫描，判断指定字段的值是否为NULL，不为NULL则累加。

性能比count(1)和count(*)慢。

# 6.总结

COUNT函数的用法，主要用于统计表行数。

主要用法有COUNT(*)、COUNT(字段)和COUNT(1)。

因为COUNT(`*`)是SQL92定义的标准统计行数的语法，所以MySQL对他进行了很多优化，MyISAM中会直接把表的总行数单独记录下来供COUNT(*)查询，而InnoDB则会在扫表的时候选择最小的索引来降低成本。

当然，这些优化的前提都是没有进行where和group的条件查询。

在InnoDB中COUNT(`*`)和COUNT(1)实现上没有区别，而且效率一样，但是COUNT(字段)需要进行字段的非NULL判断，所以效率会低一些。

因为COUNT(`*`)是SQL92定义的标准统计行数的语法，并且效率高，所以请直接使用COUNT(*)查询表的行数！


# 参考资料

[Mysql count(*)，count(字段)，count(1)的区别](https://www.jianshu.com/p/e1229342a5e2)

[MySQL之count(1)和count(*)的区别](https://blog.csdn.net/qq9808/article/details/85264474)

[MySQL count(1) count(*) 比较 详解](https://blog.csdn.net/chenshun123/article/details/79676812)

[MySQL count(1)、count(*)、count(字段)的区别](https://www.jb51.net/article/232645.htm)

* any list
{:toc}
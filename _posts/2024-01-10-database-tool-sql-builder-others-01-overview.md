---
layout: post
title: 数据库查询工具 sql builder 通过代码构建 SQL 语句
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# 前言

自己通过 jdbc 实现了一个 数据库查询工具，不过后来想拓展查询功能时，总觉得不够尽兴。

所以在想能不能把 SQL 的构建单独抽离出来。

## 最好是

where 条件独立，可以兼容目前的 jdbc

update/insert/delete/select

select 的结果处理：distinct sum/avg/min/max

排序：order by desc/ASC

page: 分页

join: inner/left/right join

# 大概想要的效果

通过 java 代码，避免拼接过程的代码编写

```java
select("*")
.from("user")
.where("id=1")
```

等价于：

```sql
select * from where id=1;
```

当然，这里的 where 感觉不够尽兴。

```java
where(
eq("id", "1").like("name", "456")    
);
```

等价于：

```sql
where id=1 and name like '%456%'
```

可能这样更好。可以考虑更加复杂的 and or 的组合。

## 灵活与自定义

感觉最好的还是要有两种模式：

raw 模式，直接写什么就是什么。

oo 模式，通过限制输入，避免出错。

二者可以整合使用。

## 其他

比如考虑和 spring template 整合。

和 mybatis 整合等等。

# 他山之石

当然了，有这种想法的人一定非常多，已经有很多优秀的设计了。

我们可以先看一下，学习一下别人优秀的设计。

这个内容还是比较多的，每一篇单独一个，这里做一个简单的汇总。







# 参考资料

https://github.com/amaembo/streamex

* any list
{:toc}
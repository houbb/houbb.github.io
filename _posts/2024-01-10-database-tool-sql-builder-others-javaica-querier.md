---
layout: post
title: 数据库查询工具 sql builder-javaica querier 入门介绍, 足够简单灵活。
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-01-Hibernate、MyBatis、EclipseLink、Spring Data JPA、TopLink、ActiveJDBC、Querydsl 和 JOOQ 对比](https://houbb.github.io/2016/05/21/orm-01-overview)

[ORM-02-Hibernate 对象关系映射（ORM）框架](https://houbb.github.io/2016/05/21/orm-02-hibernate)

[ORM-02-JPA Java Persistence API 入门介绍](https://houbb.github.io/2016/05/21/orm-03-jpa)

[orm-04-Spring Data JPA 入门介绍](https://houbb.github.io/2016/05/21/orm-04-spring-data-jpa)

[ORM-05-javalite activejdbc](https://houbb.github.io/2016/05/21/orm-05-javalite-activejdbc)

[ORM-06-jooq 入门介绍](https://houbb.github.io/2016/05/21/orm-06-jooq)

[ORM-07-querydsl 入门介绍](https://houbb.github.io/2016/05/21/orm-07-querydsl)

[ORM-08-EclipseLink 入门介绍](https://houbb.github.io/2016/05/21/orm-08-EclipseLink)

[ORM-09-TopLink](https://houbb.github.io/2016/05/21/orm-09-Toplink)

# 前言

自己通过 jdbc 实现了一个 数据库查询工具，不过后来想拓展查询功能时，总觉得不够尽兴。

所以在想能不能把 SQL 的构建单独抽离出来。

这里整理学习下其他的组件。

# javaica/querier

> https://github.com/javaica/querier

# Querier（查询构建器）

简单而实用的 SQL 查询构建器，通过限制操作顺序简化了查询创建过程。

该项目的目的是创建一个真正易于使用的查询构建解决方案，以便如果代码编译通过，
那么查询操作符就是有效的（当然不包括内容）。

## 用法

```java
String query = new Querier()
                .select("col1", "col2")
                .from("Table1")
                .where("col1 > 0")
                .build();
```

结果：
```sql
SELECT col1, col2 FROM Table1 WHERE col1 > 0
```

别名：

```java
String query = new Querier()
                .select("column1").as("first")
                .select("column2").as("second")
                .from("Table1")
                .build();
```

结果：
```sql
SELECT column1 AS first, column2 AS second FROM Table1
```

```java
String query = new Querier()
                .select("t1.col1", "t2.col2", "t3.col3")
                .from("Table1").as("t1")
                .leftJoin("Table2").as("t2")
                .on("t2.col2 = t1.col1")
                .join("Table3").as("t3")
                .on("t3.col3 > t1.col1")
                .build();
```

结果：

```sql
SELECT t1.col1, t2.col2, t3.col3 FROM Table1 AS t1 LEFT JOIN Table2 AS t2 ON t2.col2 = t1.col1 JOIN Table3 AS t3 ON t3.col3 > t1.col1
```

```java
Querier querier = new Querier();
String query = querier
                .select("col1")
                .distinct()
                .from("T001")
                .leftJoin("T002")
                .on("2 < 1")
                .join("T003")
                .on("1 > 2")
                .where("col1 > 0").and("col1 < 10")
                .groupBy("col1")
                .having("col1 > 0").or("col2 > 0")
                .orderBy("col2")
                .limit(1)
                .offset(2)
                .build();
```

PS: 这种写法的呢，可以设计的很简单，比如每一种方法后面是什么就可以拼接什么，足够灵活。缺点是输入的内容有时候并不可信。

我们可以借鉴这种，然后抽象为对象，每一种添加时，后面的方法限制为有限的几个。

### 查询语法定制

可以通过创建自定义的 SyntaxProvider 并将其传递给 QueryBuilder 来定制查询语法

```java
SyntaxProvider provider = new DefaultSyntaxProvider() {
    @Override
    public String delimiter() {
        return "\n";
    }
};
Querier querier = new Querier(provider);
String query = querier
        .select("col1")
        .from("T001")
        .build();
```

结果：
```sql
SELECT col1
FROM T001
```

## 许可证

该项目使用 MIT 许可证。

# 参考资料


* any list
{:toc}
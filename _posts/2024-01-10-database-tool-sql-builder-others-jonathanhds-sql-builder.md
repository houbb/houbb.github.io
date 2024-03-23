---
layout: post
title: 数据库查询工具 sql builder-jonathanhds sql-builder 入门介绍，优雅的 api 设计
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

# jonathanhds/sql-builder

## SQL构建器

一种用于Java语言的动态SQL构建器。

## 用法

要使用此库，请在您的 pom.xml 中添加以下依赖项：

```xml
<dependency>
    <groupId>com.github.jonathanhds</groupId>
    <artifactId>sql-builder</artifactId>
    <version>1.1</version>
</dependency>
```

## 示例

一些用法示例：

### Select

```java
QueryBuilder query = new QueryBuilder().select()
                                       .column("s.name")
                                       .column("count(s.impediments) AS total_impediments")
                                       .from()
                                       .table("sprint s")
                                       .groupBy()
                                       .column("s.name")
                                       .having()
                                       .column("total_impediments > 5");
```

输出为：

```sql
SELECT
    s.name,
    count(s.impediments) AS total_impediemnts
FROM
    sprint s
GROUP BY
    s.name
HAVING
    total_impediemnts > 5
```

### Delete

```java
DeleteQuery query = new DeleteQuery("account a").addWhere("a.id > 666")
                                                .addWhere("a.creation_date > '2013-01-01'");
```

输出为：

```sql
DELETE
FROM
    account a
WHERE
    a.id > 666
    AND a.creation_date > '2013-01-01'
```

### Update

```java
UpdateQuery query = new UpdateQuery("employee e").set("e.salary", "50000")
                                                 .addWhere("e.age > 40")
                                                 .addWhere("e.genre = 'female'");
```

输出为：

```sql
UPDATE
    employee e
SET
    e.salary = '50000'
WHERE
    e.age > 40
    AND e.genre = 'female'
```

### Insert

```java
InsertQuery query = new InsertQuery("persons").columns("id", "name", "age")
                                              .values(1, "foo", 30)
                                              .values(2, "bar", 23)
                                              .values(3, "hello", 54)
                                              .values(4, "world", 19);
```

输出为：

```sql
INSERT INTO
    persons (id, name, age)
VALUES
    (1, 'foo', 30),
    (2, 'bar', 23),
    (3, 'hello', 54),
    (4, 'world', 19)
```


# 小结

这个工具设计的感觉还是很顺眼的。

# 参考资料

https://github.com/alexkasko/query-string-builder

* any list
{:toc}
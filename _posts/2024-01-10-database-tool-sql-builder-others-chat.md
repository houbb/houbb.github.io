---
layout: post
title: 数据库查询工具 sql builder-chat 如何设计一个 sql builder
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

# 需求

我们首先把自己的需求说清楚：

```
java 代码在拼接 sql 时非常的不优雅。

我们想设计一个 sql-builder 工具，用于拼接 SQL。


通过 java 代码，避免拼接过程的代码编写

select("*")
.from("user")
.where("id=1")


等价于：

select * from where id=1;


如何设计对应的 api，让其保持灵活简单优雅？给出你的设计思路，并且提供使用例子。

```

## Q: 

为了设计一个简洁且灵活的 SQL 构建器 API，可以采用方法链（fluent API）的方式来实现。

这种设计风格使得代码易读且结构清晰，可以链式调用方法来构建 SQL 查询语句。以下是一个简单的设计思路和示例：

1. **QueryBuilder 类**：该类用于构建 SQL 查询语句，它包含了构建 SQL 查询所需的各种方法。

2. **方法链设计**：每个方法返回 QueryBuilder 实例本身，以便可以连续调用多个方法来构建 SQL 查询。

3. **灵活参数支持**：方法设计应该支持灵活的参数传递，比如可以传递多个列名、表名、条件等。

下面是一个示例实现：

```java
public class QueryBuilder {
    private StringBuilder query;

    public QueryBuilder() {
        this.query = new StringBuilder();
    }

    public QueryBuilder select(String columns) {
        query.append("SELECT ").append(columns).append(" ");
        return this;
    }

    public QueryBuilder from(String table) {
        query.append("FROM ").append(table).append(" ");
        return this;
    }

    public QueryBuilder where(String condition) {
        query.append("WHERE ").append(condition).append(" ");
        return this;
    }

    public String build() {
        return query.toString().trim() + ";";
    }
}
```

使用示例：

```java
public class Main {
    public static void main(String[] args) {
        QueryBuilder builder = new QueryBuilder();

        String sqlQuery = builder
                .select("*")
                .from("user")
                .where("id = 1")
                .build();

        System.out.println(sqlQuery);
    }
}
```

这个设计保持了代码的简洁性和优雅性，并提供了足够的灵活性来构建各种类型的 SQL 查询语句。可以根据需要扩展 QueryBuilder 类，添加更多的方法来支持其他 SQL 语句的构建，比如 INSERT、UPDATE、DELETE 等。


# 参考资料


* any list
{:toc}
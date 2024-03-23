---
layout: post
title: 数据库查询工具 sql builder-alexkasko query-string-builder 入门介绍
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

# query-string-builder

这是一个用于构建 SQL 查询字符串的小型库。

该库允许通过 API 调用以编程方式构建 SQL 查询字符串。它支持连接词、分离词、否定词和逗号分隔的列表。

该库依赖于 commons-lang。

该库可以在 Maven 中央仓库中获取。

最新版本的 Javadocs 可在此处找到。

## SQL 查询构建问题

假设您正在开发一个基于关系数据库的 Java 项目，并且出于某种原因不使用 Hibernate/JPA（这些工具非常适合适当的任务）。然后，某一天，您可能需要根据用户输入以编程方式构建一些 SQL 查询。

串联逗号并计数括号并不是一项很有趣的任务，因此有许多库可以为您执行此操作。大多数此类库（我不打算进行全面分析）倾向于是应用程序代码与 JDBC 之间的桥梁 - 类似于轻量级 ORM。它们可以使用 API 构建 SQL 查询，执行查询并为您映射结果。但是，如果您不使用 JPA，则可能已经为查询执行具有适当的事务/资源处理、命名参数支持等的 JDBC 包装器进行了优化（例如 spring-jdbc）。

您可以找到一个 SQL 构建器库，它不打算成为 ORM，并只是为您构建查询字符串（例如这个或这个）。但是，然后您会面临另一个问题：选择查询具有复杂的结构（PostgreSQL、Oracle）并且在不同的 RDBMS 之间不可移植。因此，尝试以类型安全的方式构建查询的库需要了解所有可能的查询元素，并为不同的 RDBMS 支持不同的方言。

但是，如果复杂的查询构建不是您业务逻辑的重要部分，那么您可能只想使用某种 API（比 StringBuilder 更聪明）将查询部分连接在一起，并使用您通常的工具执行结果 SQL 字符串。此库（query-string-builder）就是为这种情况创建的。

否则，如果您确实需要类似 ORM 的库，那么这个可能会很有趣。

## 库的用法

Maven 依赖项（可在中央仓库中获取）：

```xml
<dependency>
    <groupId>com.alexkasko.springjdbc</groupId>
    <artifactId>query-string-builder</artifactId>
    <version>1.2</version>
</dependency>
```

注意1：绝对不应该将此库用于连接用户定义的值。可能会发生糟糕的事情。您应该连接包含参数占位符（? 或 :placeholder）的准备好的静态字符串部分，并在执行结果查询时以参数形式提供用户定义的值给 PreparedStatement。

注意2：此库仅构建查询字符串，对 SQL 语义、表、结果列等一无所知，因此不会限制您使用任何“已知”的 SQL 子集。

注意3：此库不打算替换静态 SQL 查询，它只处理需要在运行时构建查询字符串的情况。

QueryBuilder 是入口点类。它使用查询模板字符串创建。然后，您应该创建表达式（或表达式列表）并将它们提供给生成器以填充模板占位符（子句）：

```java
// 查询模板，可能从外部文件加载
String template = "select emp.* from employee emp" +
                    " join departments dep on emp.id_department = dep.id" +
                    " ${where}" +
                    " ${order}" +
                    " limit :limit offset :offset";
// 创建“where”子句
Expression where = Expressions.where()
        .and("emp.surname = :surname")
        .and("emp.name like :name")
        .and(or(expr("emp.salary > :salary").and("emp.position in (:positionList)"),
                not("emp.age > :ageThreshold")))
        .and("status != 'ARCHIVED'");

// 创建“order”子句
ExpressionList order = Expressions.orderBy().add("dep.id desc").add("cust.salary");
// 从模板创建构建器并填充子句
String sql = QueryBuilder.query(template)
        .set("where", where)
        .set("order", order)
        .build();
```

结果 SQL 字符串将如下所示（未格式化）：

```sql
select emp.* from employee emp
    join departments dep on emp.id_department = dep.id
    where emp.surname = :surname
        and emp.name like :name
        and ((emp.salary > :salary and emp.position in (:positionList)) or (not (emp.age > :ageThreshold)))
        and status != 'ARCHIVED
    order by dep.id desc, cust.salary
    limit :limit offset :offset
```

继续阅读下面的内容，我将继续解释如何使用该库以及其重要概念。

#### 查询模板字符串

查询模板字符串是带有某些部分用占位符替换的 SQL 字符串，占位符的语法是 `${placeholder}`（可以通过 `$${not_a_placeholder}` 转义占位符）。

占位符的名称必须符合以下正则表达式：`[a-zA-Z_0-9]+`，并且在模板中不能重复。

#### 表达式

表达式旨在用于 WHERE 子句。所有表达式都实现了 `and` 方法，以便进行简单的方法链接。

表达式通过 `toString` 方法打印为 SQL。

可以使用 Expressions 类的实例方法和静态方法创建内置表达式：

- `expr` - 从字符串文字创建新表达式，用于开始构建，打印为提供的文本

- `and` - 创建新的合取表达式，打印为 `this_expr and arg_expr`

- `or` - 创建新的析取表达式，打印为 `((arg_expr_1) or (arg_expr2) or ... or (arg_expr_N))`

- `not` - 创建新的否定表达式，打印为 `not (arg_expr)`

- 前缀（包括 where 和 and 的前缀类型） - 创建新的前缀表达式，仅当此表达式将与其他表达式合取时，前缀才会被打印，否则将省略空字符串。

所有内置表达式都是不可变的且可序列化的。

#### 表达式列表

表达式列表设计用于在 FROM、GROUP BY、HAVING 中包含多个表达式。ExpressionList 实现了 `comma` 方法，允许向列表中添加新表达式，并返回列表本身。

表达式列表打印为 `expr_1, expr_2, ... expr_N`。

表达式列表还可以具有前缀（listWithPrefix 和 orderBy 方法），前缀将在非空条件列表之前打印，并且如果条件列表为空，则将省略前缀。

#### 使用新表达式扩展库

QueryBuilder 仅使用 Expression 和 ExpressionList 接口，并且对实现一无所知。

它也不对表达式（或列表）进行任何操作，只是使用 `toString` 方法打印它们。

为了简化表达式的构建，`and` 和 `add` 方法直接添加到接口中，您可以在自己的实现中忽略它们。

# 参考资料

https://github.com/alexkasko/query-string-builder

* any list
{:toc}
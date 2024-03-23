---
layout: post
title: 数据库查询工具 sql builder-exasol sql-statement-builder 入门介绍 对 SQL 的理解比较深入
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

# exasol/sql-statement-builder

https://github.com/exasol/sql-statement-builder

这个工具提升的特性，除了 crud 之外，感觉还有许多其他的特性，比如建表语句之类的？

# Exasol SQL 语句构建器

Exasol SQL 语句构建器抽象了 SQL 语句的程序化创建，旨在取代普遍存在的字符串连接解决方案，这些解决方案使代码难以阅读，并容易出错且存在安全风险。

目标：

- 促进清晰易读的代码
- 允许对动态部分进行彻底验证
- 在编译时检测尽可能多的错误
- 不要重复自己（DRY）
- 允许扩展以适应不同的 SQL 方言

# 简而言之

以下示例让您了解 SQL 语句构建器可以实现的功能。

有关更多详细信息，请查阅我们的用户指南。

```java
Select select = StatementFactory.getInstance().select()
    .field("fieldA", "tableA.fieldB", "tableB.*");
select.from().table("schemaA.tableA");
select.limit(10);
StringRendererConfig config = StringRendererConfig.builder().quoteIdentifiers(true).build();
SelectRenderer renderer = new SelectRenderer(config);
select.accept(renderer);
String sql = renderer.render();
```


# Exasol SQL 语句构建器用户指南

您可以按照本指南了解如何使用 SQL 语句构建器。它提供了对当前支持的各种功能的解释，以及各种代码示例。

## 概述

Exasol SQL 语句构建器抽象了 SQL 语句的程序化创建，旨在取代普遍存在的字符串连接解决方案，这些解决方案使代码难以阅读，并容易出错且存在安全风险。

SQL 语句构建器允许用户使用流畅的编程创建 SQL 语句的抽象表示。

一旦您拥有这样一个抽象的语句，您就可以使用该项目提供的各种渲染器之一，将语句渲染为 SQL 字符串。

## 目前支持的 SQL 语句

### 数据定义语言 (DDL)

- CREATE SCHEMA

- DROP SCHEMA

- CREATE TABLE

- DROP TABLE

###  数据查询语言 (DQL)

- SELECT

###  数据修改语言 (DML)

- INSERT

- MERGE

PS: 竟然还不支持 update？delete

我们重点学习一下 select 。

# SELECT

您可以使用 `Select` 类构造 [`SELECT`](https://docs.exasol.com/sql/select.htm) SQL 语句。

## 创建 `SELECT` 语句

您可以像这样创建基本的 `SELECT` 语句：

```java
Select select = StatementFactory.getInstance().select()
    .field("fieldA", "tableA.fieldB", "tableB.*");
select.from().table("schemaA.tableA");
select.limit(10);
```

### `SELECT` 组件

在这里，您可以找到支持的 `SELECT` 语句组成部分的列表：

- [派生列](#derived-column)（字段、函数、算术表达式等）
- [`FROM` 子句](#from-clause)
- [`WHERE` 子句](#where-clause)
- [`LIMIT` 子句](#limit-clause)
- [`GROUP BY` 子句](#group-by-clause)
- [`ORDER BY` 子句](#order-by-clause)

#### 派生列

`SELECT` 语句可以包含一个或多个派生列。以下是我们支持的所有派生列类型的描述。

- `field` 表示表中的列。您可以使用 `Select` 类的 `field( ... )` 方法创建一个或多个字段。

    ```java
    Select selectWithOneField = factory.select().field("fieldA");

    Select selectWithMultipleFileds = factory.select().field("fieldA", "tableA.fieldB", "tableB.*");
    ```

- `asterisk / *` 是表示所有字段的通配符。使用 `all()` 方法创建一个星号。

    ```java
    Select selectWithAllFields = factory.select().all();
    ```

- 工厂方法 `function(...)` 将预定义函数添加到一个将求值为值表达式的语句中。
您只能创建 ESB 支持的函数。请查看[支持的函数列表](../list_of_supported_exasol_functions.md)。

    您还可以为包含函数的派生字段设置名称。
函数接受任意数量的 [`ValueExpression`](../../../src/main/java/com/exasol/sql/expression/ValueExpression.java) 并按添加顺序呈现它们。

    `function(...)` 工厂方法不验证函数参数。

    ```java
    Select select = factory.select()
        .function(ExasolScalarFunction.RANDOM, "RANDOM_1")
        .function(ExasolScalarFunction.RANDOM, "RANDOM_2", ExpressionTerm.integerLiteral(5), ExpressionTerm.integerLiteral(20));
    ```

- 工厂方法 `udf(...)` 将用户定义的函数添加到语句中。
一个 `udf` 接受一个函数名称和任意数量的 [`ValueExpression`](../../../src/main/java/com/exasol/sql/expression/ValueExpression.java)。
您还可以创建一个包含包含列定义的 `EMITS` 部分的 `udf`。
  
    ```java
    Select selectWithoutEmits = StatementFactory.getInstance().select().udf("my_average", column("x"));
    selectWithoutEmits.from().table("t");

    ColumnsDefinition columnsDefinition = ColumnsDefinition.builder().decimalColumn("id", 18, 0)
        .varcharColumn("user_name", 100).decimalColumn("PAGE_VISITS", 18, 0).build();
    Select selectWithEmits = StatementFactory.getInstance().select().udf("sample_simple", columnsDefinition,
            column("id"), column("user_name"), column("page_visits"), integerLiteral(20));
    selectWithEmits.from().table("people");
    ```

- 要将特殊函数（例如分析函数）添加到语句中，您可以使用接受 `Function` 作为参数的 `function()` 方法。有关详细信息，请参阅[关于创建函数的部分](#creating-functions)。

- `arithmetic expression` 是使用以下算术运算符之一的二进制值表达式：`+`、`-`、`*`、`/`。
使用 `arithmeticExpression( ... )` 方法添加算术表达式。您还可以为包含算术表达式的派生字段设置名称。

    ```java
    Select select = factory.select()
        .arithmeticExpression(ExpressionTerm.plus(ExpressionTerm.integerLiteral(1000), ExpressionTerm.integerLiteral(234)),
                              "ADD");
    ```

#### `FROM` 子句

一个 `SELECT` 语句可以包含一个 `FROM` 子句。要开始一个 `FROM` 子句，可以使用 `Select` 类的 `from()` 方法。

您可以使用 `table( ... )` 方法将数据库表的引用附加到 `FROM` 子句。

如果您想用别名引用这样的表，请使用 `tableAs( ... )` 方法附加它。

您还可以添加值表，其中包含用户构造的行集和列集。与实际表不同，内容在查询中预定义。要使用此结构，请首先创建一个 `ValueTable` 对象。然后使用 `Select` 的 `valueTable( ... )` 方法引用该对象。

```java
Select selectFromTable = factory.select().all();
selectFromTable.from().table("table1");

Select selectFromTableAs = factory.select().all();
selectFromTableAs.from().tableAs("table", "t");

ValueTable values = new ValueTable(this.select);
values.appendRow("r1c1", "r1c2").appendRow("r2c1", "r2c2");
Select selectFromValueTable = factory.select().all();
selectFromValueTable.from().valueTable(values);
```

`FROM` 子句还支持不同类型的 `JOIN`：

- join
- inner join
- left join
- right join
- full join
- left outer join
- right outer join
- full outer join

要添加 `JOIN` 子句，您需要添加一个左表，然后使用其中一种连接方法。例如，`innerJoin( ... )`；

```java
Select selectFromTable = factory.select().all();
selectFromTable.from().table("left_table")
        .innerJoin("right_table", "left_table.foo_id = right_table.foo_id");  
```

#### `WHERE` 子句

一个 `SELECT` 语句可以包含一个带有布尔表达式的 `WHERE` 子句作为过滤条件。

要添加 `WHERE` 子句，可以使用 `Select` 类的 `where( ... )` 方法。

```java
Select select = factory.select.all();
select.from().table("person");
select.where(eq(ExpressionTerm.stringLiteral("foo"), ExpressionTerm.stringLiteral("bar")));
```

#### `LIMIT` 子句

一个 `SELECT` 语句可以包含一个带有计数和可选偏移量的 `LIMIT` 子句。要添加 `LIMIT` 子句，可以使用 `Select` 类的 `limit( ... )` 方法。

```java
Select select = factory.select().all();
select.from().table("t");
select.limit(1);
```

#### `GROUP BY` 子句

一个 `SELECT` 语句可以包含一个 `GROUP BY` 子句。要开始 `GROUP BY` 子句，使用 `Select` 类的 `groupBy()` 方法。

`GROUP BY` 子句支持一个 `HAVING` 子句。

要添加它，请使用 `having( ... )` 方法。

```java
Select select = factory.select().all();
select.from().table("t");
select.groupBy(column("t", "city"), column("t", "order"), column("t", "price"))
                   .having(lt(column("t", "price"), integerLiteral(10)));
```

#### `ORDER BY` 子句

一个 `SELECT` 语句可以包含一个 `ORDER BY` 子句。

要开始 `ORDER BY` 子句，使用 `Select` 类的 `orderBy()` 方法。

您还可以在此子句中使用 `nullsFirst()` / `nullsLast()` 和 `asc()` / `desc()` 方法。

```java
Select select = factory.select().all();
select.from().table("t");
select.orderBy(column("t", "city"), column("t", "price"))
        .nullsFirst().asc();
```

## 创建函数

当您需要使用特殊函数，如分析函数时，可以像这样将它们添加到语句中：

```java
Function function = ... // 创建函数
Select select = factory.select().function(function, "<column>");
```

ps: 不得不说，作为组件很多都没有考虑到这一点。支持用户自定义 function。

### 分析函数

Exasol 的 [分析函数](https://docs.exasol.com/sql_references/functions/analyticfunctions.htm) 支持特殊的语法。

您可以指定关键字 `DISTINCT` 和 `ALL`，以及一个 `OVER` 子句。

要创建一个新的 `AnalyticFunction`，可以使用以下代码将其用于 `SELECT` 语句中：

```java
AnalyticFunction function = AnalyticFunction.of(ExasolAnalyticAggregateFunctions.ANY,
            BooleanTerm.lt(column("age"), integerLiteral(30)));
// 配置函数
Select select = factory.select().function(function, "<column>");
```

#### 关键字 `DISTINCT` 和 `ALL`

您可以像这样使用关键字 `DISTINCT` 或 `ALL` 创建分析函数：

```java
AnalyticFunction function = ...
function.keywordDistinct();
// 或者
function.keywordAll();
```

示例：

```java
AnalyticFunction function = AnalyticFunction.of(ExasolAnalyticAggregateFunctions.ANY,
                        BooleanTerm.lt(column("age"), integerLiteral(30)))
        .keywordDistinct();
// -> ANY(DISTINCT(age < 30))
```

#### 添加 `OVER` 子句

您可以直接创建和配置 `OverClause`，也可以使用配置器 lambda：

```java
OverClause over = new OverClause().windowName("window1");
// 配置 over 子句
function.over(over);

// 或者使用配置器 lambda：
function.over(over -> over.windowName("window1"));
```

`OverClause` 提供了四种配置方法：

* `windowName()`
* `orderBy()`
* `partitionBy()`
* `windowFrame()`

##### `windowName()`

像这样添加命名窗口：

```java
over.windowName("window1");
// -> OVER(window1)
```

##### `orderBy()`

您可以像这样添加一个 `ORDER BY` 子句：

```java
over.orderBy(new OrderByClause(select, column("city"), column("price")).asc().nullsFirst());
// -> OVER(ORDER BY city, price ASC NULLS FIRST)
```

##### `partitionBy()`

您可以按一个或多个列进行分区：

```java
over.partitionBy(column("city"), column("price"));
// -> OVER(PARTITION BY city, price)
```

##### `windowFrame()`

要添加窗口框架子句，请使用配置器 lambda：

```java
over.windowFrame(frame -> frame.type(WindowFrameType.ROWS) /* ... */);
```

窗口框架由三个部分组成：

1. 强制性的窗口框架单元类型 (`ROWS`, `RANGE` 或 `GROUPS`)

    您可以这样指定类型：

    ```java
    over.windowFrame(frame -> frame.type(WindowFrameType.ROWS) /* ... */);
    // -> OVER(ROWS ...)
    ```

2. 强制性的单元规范。这可以是单个条件或 `BETWEEN ... AND` 范围：

    * 像这样指定单个条件：

        ```java
        over.windowFrame(frame -> frame.type(WindowFrameType.ROWS)
                .unit(UnitType.CURRENT_ROW));
        // -> ROWS CURRENT ROW

        over.windowFrame(frame -> frame.type(WindowFrameType.ROWS)
                .unit(integerLiteral(1), UnitType.PRECEEDING)));
        // -> ROWS 1 PRECEEDING
        ```
    * 像这样指定一个范围：

        ```java
        over.windowFrame(frame -> frame.type(WindowFrameType.ROWS)
                .unitBetween(UnitType.UNBOUNDED_PRECEEDING, UnitType.UNBOUNDED_FOLLOWING));
        // -> ROWS BETWEEN UNBOUNDED PRECEEDING AND UNBOUNDED FOLLOWING

        over.windowFrame(frame -> frame.type(WindowFrameType.ROWS)
                .unitBetween(column("col1"), UnitType.PRECEEDING, column("col2"), UnitType.FOLLOWING));
        // -> ROWS BETWEEN col1 PRECEEDING AND col2 FOLLOWING
        ```

3. 可选的排除：

    ```java
    over.windowFrame(frame -> frame.type(WindowFrameType.ROWS)
            .unit(UnitType.CURRENT_ROW)
            .exclude(WindowFrameExclusionType.NO_OTHERS));
    // -> ROWS CURRENT ROW EXCLUDE NO OTHERS
    ```

# INSERT 

您可以使用 `Insert` 类构造 [`INSERT`](https://docs.exasol.com/sql/insert.htm) SQL 语句。

## 创建 `INSERT` 语句

创建一个 `INSERT` 语句：

```java
Insert insert = StatementFactory.getInstance()
    .insertInto("tableName")
    .values("value1","value2","value3");
```

为特定字段创建一个 `INSERT` 语句：

```java
Insert insert = StatementFactory.getInstance()
    .insertInto("tableName")
    .field("column1", "column2","column3")
    .values("value1","value2","value3");
```

### 使用占位符

在 SQL 中，您可以在准备的语句中使用值占位符 (`?`)。

这样可以让您以安全的方式稍后添加值。

您可以这样添加单个占位符：

```java
Insert insert = StatementFactory.getInstance()
    .insertInto("testTable")
    .field("column1")
    .valuePlaceholder();
```

以下是一个在一个语句中使用多个占位符的示例：

```java
Insert insert = StatementFactory.getInstance()
    .insertInto("testTable")
    .field("column1", "column2","column3")
    .valuePlaceholders(3);
```

### 使用值表

您还可以在插入中使用值表：

```java
Insert insert = StatementFactory.getInstance().insertInto("tableName");
ValueTable table = new ValueTable(insert);
table.appendRow("a", "b")
     .appendRow("c", "d");
insert.valueTable(table);
``` 

有关值表的更多信息，请参阅 [值表](../common_constructs/value_tables.md)。

### 渲染 `INSERT` 语句

使用 `InsertRenderer` 将 `Insert` 对象渲染为 SQL 字符串。

```java
StringRendererConfig config = StringRendererConfig.builder().quoteIdentifiers(true).build();
InsertRenderer renderer = new InsertRenderer(config);
insert.accept(renderer);
String sql = renderer.render();
``` 

# 渲染 SQL 语句

## 使用默认设置创建渲染器

要渲染 SQL 语句，您需要使用 Renderer 类的 `create()` 方法创建 SQL 语句渲染器的实例（例如 `CreateTableRenderer`）：

```java
CreateTableRenderer renderer = CreateTableRenderer.create();
```

## 自定义渲染

如果您需要对渲染过程进行更多控制，可以创建自己的配置。

当您添加自定义配置时，需要将一个实例传递给 `create()` 方法。

```java
StringRendererConfig config = StringRendererConfig.builder().lowerCase(true).build();
CreateTableRenderer renderer = CreateTableRenderer.create(config);
```

## 渲染语句

接下来，调用语句类的 `accept()` 方法（例如 `CreateTable`）的实例，并将渲染器作为参数传递。

```java
createTable.accept(renderer);
```

在最后一步中，渲染 SQL 语句：

```java
String renderedString = renderer.render();
```

# 参考资料


* any list
{:toc}
---
layout: post
title: 数据库查询工具 sql builder-jkrasnay/sqlbuilder 入门介绍 
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

# jkrasnay/sqlbuilder


## SQL构建器实用工具

该包含了一系列实用工具类，用于简化使用SQL。

## 引入

### maven

将以下依赖项添加到您的POM文件中：

```xml
<dependency>
  <groupId>ca.krasnay</groupId>
  <artifactId>sqlbuilder</artifactId>
  <version>1.2</version>
</dependency>
```

SQL构建器依赖于slf4j和Spring JDBC，请确保将所需版本添加到您的 `<dependencyManagement>` 部分。

### Gradle

将以下依赖项添加到您的build.gradle中：

```groovy
compile 'ca.krasnay:sqlbuilder:1.2'
```

## 构建器

构建器简化了SQL字符串的创建。

它们对SQL语法有一定了解，并使在Java中创建动态SQL变得更加方便。

与Java的StringBuilder类似，它们使用可链接的调用。

以下是使用SelectBuilder的示例。

```java
new SelectBuilder()
    .column("name")
    .column("age")
    .from("Employee")
    .where("dept = 'engineering'")
    .where("salary > 100000")
    .toString();
```

这将生成SQL字符串 

```sql
select name, age from Employee where dept = 'engineering' and salary > 100000
```

注意SelectBuilder知道如何用逗号连接列，并用and连接where子句。

更多信息，请参阅 http://john.krasnay.ca/2010/02/15/building-sql-in-java.html

## ParameterizedPreparedStatementCreator

Spring有一个强大的抽象称为JdbcTemplate，它使得使用JDBC变得容易。

JdbcTemplate负责从DataSource中正确分配和释放JDBC连接。

它从不返回Connection；相反，连接对象被传递给调用者提供的回调函数。

其中一个回调函数是PreparedStatementCreator，用于根据连接创建预处理语句。

在典型的PreparedStatementCreator中，创建具有由问号指示的可替换参数的SQL，然后通过索引设置参数值。

在使用动态SQL时，跟踪这些索引可能会很具有挑战性。

为了简化此过程，ParameterizedPreparedStatementCreator使用了命名参数。

以下是一个示例：

```java
PreparedStatementCreator psc =
    new ParameterizedPreparedStatementCreator()
        .setSql("update Employee set name = :name where id = :id")
        .setParameter("name", "Bob")
        .setParameter("id", 42);

new JdbcTemplate(dataSource).update(psc);
```

## 创建器

每个构建器类都有一个相应的Creator类，它结合了构建器和ParameterizedPreparedStatmentCreator。

```java
PreparedStatementCreator psc =
    new UpdateCreator("Employee")
        .setValue("name", "Bob")
        .whereEquals("id", 42);

new JdbcTemplate(dataSource).update(psc);
```

创建器本身并不添加太多功能，但它们使得使用构建器和ParameterizedPreparedStatementCreators变得更加容易（而且您不必不断地输入那个非常长的类名！）。


# 设计的初衷

在Java应用程序中处理SQL可能会有些棘手。

首先，Java不支持多行字符串常量，因此您可能会得到看起来像这样的代码：

```java
String sql = "select *" +
             "from Employee" +
             "where name like 'Fred%'";
```

这段代码不仅难看，而且容易出错：您注意到Employee和where之间缺少空格了吗？

在使用Java处理SQL时的另一个挑战是我们经常需要动态构建SQL。

假设我们根据用户通过搜索页面输入的数据生成查询。

我们希望根据用户输入的数据动态构建WHERE子句：

```java
List<String> params = new ArrayList<String>();
StringBuilder sqlBuilder = new StringBuilder()
    .append("select * ")
    .append("from Employee ")
    .append("where 1=1 ");

if (name != null) {
    sqlBuilder.append("and name like ? ");
    params.add(name + "%");
}

if (age != null) {
    sqlBuilder.append("and age = ? ");
    params.add(age);
}

String sql = sqlBuilder.toString();
```

请注意，我们添加了一个虚假的谓词（1=1），这样我们就不必总是决定是要在后续谓词前加上where还是and。

这并不总是必要的--我们经常有一个始终需要的谓词，例如active = 'Y'--但这很笨拙。

为了解决这些问题，我创建了一个简单的名为SelectBuilder的类。

SelectBuilder的使用方式如下：

```java
List<String> params = new ArrayList<String>();
SelectBuilder sqlBuilder = new SelectBuilder()
    .column("*")
    .from("Employee");

if (name != null) {
    sqlBuilder.where("name like ?");
    params.add(name + "%");
}

if (age != null) {
    sqlBuilder.where("age = ?");
    params.add(age);
}
```

在这里，我们不需要使用虚假的谓词，因为SelectBuilder会正确地添加我们的where和and关键字。

我们也不必担心在不同SQL片段之间添加空格。

与StringBuilder类似，SelectBuilder使用设置器链接，因此我们可以编写类似SQL语句本身的代码：

```java
SelectBuilder sqlBuilder = new SelectBuilder()
    .column("e.id")
    .column("e.name")
    .column("d.name as deptName")
    .from("Employee e");
    .join("Department d on e.dept_id = d.id")
    .where("e.salary > 100000");
```

SelectBuilder不关心其方法被调用的顺序。

考虑一个表示可以通过子类定制的报表的基类：

```java
public class BaseEmpReport {
    public String buildSelect() {

        SelectBuilder sqlBuilder = new SelectBuilder()
            .column("e.id")
            .column("e.name")
            .from("Employee e");
            .where("e.salary > 100000");
        
        modifySelect(sqlBuilder);

        return sqlBuilder.toString();
    }

    protected void modifySelect(SelectBuilder builder) {
    }
}
```

我们可以将此报表子类化以添加表示员工部门名称的列：

```java
public class DeptReport extends BaseEmpReport {
    protected void modifySelect(SelectBuilder builder) {

        builder
            .column("d.name as deptName")
            .join("Department d on e.dept_id = d.id")
            .where("d.name = 'Marketing'");

    }
}
```

编写了这个类之后，我发现了Squiggle SQL Builder库。

Squiggle的SelectQuery类与SelectBuilder类似，但它使用Java对象和方法管理更多的SQL语法。

例如，使用SelectQuery，您可能会编写如下代码：

```java
Table orders = new Table("orders_table");
SelectQuery select = new SelectQuery(orders);
select.addColumn(orders, "id");
select.addColumn(orders, "total_price");
select.addCriteria(new MatchCriteria(orders, "status", MatchCriteria.EQUALS, "processed"));
select.addCriteria(new MatchCriteria(orders, "items", MatchCriteria.LESS, 5));
```

在SelectBuilder中的等效代码将如下所示：

```java
SelectBuilder select = new SelectBuilder()
    .column("id")
    .column("total_price")
    .from("orders_table")
    .where("status = 'processed'")
    .where("items < 5");
```

我发现后者比Squiggle代码更易读、更灵活。

SelectBuilder的完整代码如下：

PS: 这里还有一种方式：

```java
SelectBuilder select = new SelectBuilder()
    .column("id")
    .column("total_price")
    .from("orders_table")
    .where(eq("status", "processed"))
	.where(lt("items", 5))
```

个人感觉其实还是直接写比价直观，但是可以考虑把 3 种方式作为只是不同的写法。

## 完整代码

```java
package ca.krasnay.common.sql;

import java.util.ArrayList;
import java.util.List;

public class SelectBuilder {

    private List<String> columns = new ArrayList<String>();

    private List<String> tables = new ArrayList<String>();

    private List<String> joins = new ArrayList<String>();

    private List<String> leftJoins = new ArrayList<String>();

    private List<String> wheres = new ArrayList<String>();

    private List<String> orderBys = new ArrayList<String>();

    private List<String> groupBys = new ArrayList<String>();

    private List<String> havings = new ArrayList<String>();

    public SelectBuilder() {

    }

    public SelectBuilder(String table) {
        tables.add(table);
    }

    private void appendList(StringBuilder sql, List<String> list, String init,
String sep) {
        boolean first = true;
        for (String s : list) {
            if (first) {
                sql.append(init);
            } else {
                sql.append(sep);
            }
            sql.append(s);
            first = false;
        }
    }

    public SelectBuilder column(String name) {
        columns.add(name);
        return this;
    }

    public SelectBuilder column(String name, boolean groupBy) {
        columns.add(name);
        if (groupBy) {
            groupBys.add(name);
        }
        return this;
    }

    public SelectBuilder from(String table) {
        tables.add(table);
        return this;
    }

    public SelectBuilder groupBy(String expr) {
        groupBys.add(expr);
        return this;
    }

    public SelectBuilder having(String expr) {
        havings.add(expr);
        return this;
    }

    public SelectBuilder join(String join) {
        joins.add(join);
        return this;
    }

    public SelectBuilder leftJoin(String join) {
        leftJoins.add(join);
        return this;
    }

    public SelectBuilder orderBy(String name) {
        orderBys.add(name);
        return this;
    }

    @Override
    public String toString() {

        StringBuilder sql = new StringBuilder("select ");

        if (columns.size() == 0) {
            sql.append("*");
        } else {
            appendList(sql, columns, "", ", ");
        }

        appendList(sql, tables, " from ", ", ");
        appendList(sql, joins, " join ", " join ");
        appendList(sql, leftJoins, " left join ", " left join ");
        appendList(sql, wheres, " where ", " and ");
        appendList(sql, groupBys, " group by ", ", ");
        appendList(sql, havings, " having ", " and ");
        appendList(sql, orderBys, " order by ", ", ");

        return sql.toString();
    }

    public SelectBuilder where(String expr) {
        wheres.add(expr);
        return this;
    }
}
```

看的出来，这种就是简单粗暴的 string 拼接。

好处是实现简单，缺点是写法可能并不优雅。

# 参考资料

* any list
{:toc}
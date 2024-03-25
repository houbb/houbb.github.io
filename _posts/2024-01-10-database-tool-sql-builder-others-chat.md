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

# chat

## Q: 如何设计？

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

这个设计保持了代码的简洁性和优雅性，并提供了足够的灵活性来构建各种类型的 SQL 查询语句。

可以根据需要扩展 QueryBuilder 类，添加更多的方法来支持其他 SQL 语句的构建，比如 INSERT、UPDATE、DELETE 等。

## Q: 你这个 api 太少了，首先把 mysql 中的所有核心关键词列出来，比如 where/group by ... having/order by 这些

理解了您的需求，我们可以进一步扩展 QueryBuilder 类，以支持更多的 SQL 关键词，比如 WHERE、GROUP BY、HAVING、ORDER BY 等。以下是扩展后的实现：

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

    public QueryBuilder groupBy(String columns) {
        query.append("GROUP BY ").append(columns).append(" ");
        return this;
    }

    public QueryBuilder having(String condition) {
        query.append("HAVING ").append(condition).append(" ");
        return this;
    }

    public QueryBuilder orderBy(String columns) {
        query.append("ORDER BY ").append(columns).append(" ");
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
                .groupBy("name")
                .having("count(*) > 1")
                .orderBy("name ASC")
                .build();

        System.out.println(sqlQuery);
    }
}
```

这样，QueryBuilder 类现在支持更多的 SQL 关键词，使得用户可以更灵活地构建各种类型的 SQL 查询语句。

根据需要，可以进一步扩展该类以支持更多的 SQL 功能。

# mysql 基础知识

## 列出 mysql 所有的关键词，给出表格，序号，关键词，描述，例子。

以下是 MySQL 的所有关键词，包括 SQL 关键词、保留字和函数名称。我将它们按照字母顺序排列，并提供了描述和例子。

| 序号 | 关键词      | 描述                                                         | 例子                                                  |
|------|------------|--------------------------------------------------------------|-------------------------------------------------------|
| 1    | ADD        | 用于在表中添加列或添加索引                                   | `ALTER TABLE table_name ADD column_name datatype;`    |
| 2    | ALL        | 用于指定操作应该应用于查询中的所有行                         | `SELECT * FROM table_name WHERE condition ALL;`       |
| 3    | ALTER      | 用于修改数据库表的结构                                       | `ALTER TABLE table_name ADD column_name datatype;`    |
| 4    | AND        | 用于在 WHERE 子句中将多个条件结合在一起                     | `SELECT * FROM table_name WHERE condition1 AND condition2;` |
| 5    | AS         | 用于重命名列或表                                             | `SELECT column_name AS alias_name FROM table_name;`   |
| 6    | ASC        | 用于按升序对结果集进行排序                                   | `SELECT * FROM table_name ORDER BY column_name ASC;`  |
| 7    | AVG        | 用于计算数值列的平均值                                       | `SELECT AVG(column_name) FROM table_name;`            |
| 8    | BETWEEN    | 用于在给定范围内检索值                                       | `SELECT * FROM table_name WHERE column_name BETWEEN value1 AND value2;` |
| 9    | BY         | 用于指定排序顺序                                             | `SELECT * FROM table_name ORDER BY column_name ASC|DESC;` |
| 10   | CASE       | 用于在 SELECT 子句中执行条件语句                              | `SELECT column_name, CASE WHEN condition THEN result END FROM table_name;` |
| 11   | CAST       | 用于将一个数据类型转换为另一个数据类型                         | `SELECT CAST(column_name AS new_data_type) FROM table_name;` |
| 12   | CHAR       | 定义固定长度的字符串类型                                     | `CREATE TABLE table_name (column_name CHAR(length));` |
| 13   | COLUMN     | 用于定义表中的列                                             | `ALTER TABLE table_name ADD column_name datatype;`    |
| 14   | COUNT      | 用于计算选择的行数                                           | `SELECT COUNT(column_name) FROM table_name;`          |
| 15   | CREATE     | 用于创建数据库或表                                           | `CREATE DATABASE database_name;`                      |
| 16   | DATE       | 用于定义日期格式的数据类型                                   | `CREATE TABLE table_name (column_name DATE);`         |
| 17   | DELETE     | 用于删除表中的行或表                                         | `DELETE FROM table_name WHERE condition;`             |
| 18   | DESC       | 用于按降序对结果集进行排序                                   | `SELECT * FROM table_name ORDER BY column_name DESC;` |
| 19   | DISTINCT   | 用于返回唯一不同的值                                         | `SELECT DISTINCT column_name FROM table_name;`        |
| 20   | DROP       | 用于删除数据库、表、索引、触发器等                           | `DROP TABLE table_name;`                              |
| 21   | EXISTS     | 用于测试子查询是否为空                                       | `SELECT column_name FROM table_name WHERE EXISTS (subquery);` |
| 22   | FOREIGN    | 用于定义外键                                                 | `CREATE TABLE table_name (column_name datatype, FOREIGN KEY (column_name) REFERENCES another_table(column_name));` |
| 23   | FROM       | 用于指定要查询数据的表名或表达式                             | `SELECT * FROM table_name;`                           |
| 24   | GROUP      | 用于将查询结果分组                                           | `SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name;` |
| 25   | HAVING     | 用于在 GROUP BY 子句中指定条件                               | `SELECT column_name, COUNT(*) FROM table_name GROUP BY column_name HAVING condition;` |
| 26   | INDEX      | 用于创建或删除索引                                           | `CREATE INDEX index_name ON table_name(column_name);` |
| 27   | INSERT     | 用于将新行插入表中                                           | `INSERT INTO table_name (column1, column2) VALUES (value1, value2);` |
| 28   | INNER      | 用于根据连接条件返回匹配行                                   | `SELECT * FROM table1 INNER JOIN table2 ON table1.column_name = table2.column_name;` |
| 29   | INTO       | 用于将查询结果插入表中                                       | `INSERT INTO table_name (column1, column2) SELECT column1, column2 FROM another_table_name;` |
| 30   | IS         | 用于测试表达式是否为 true、false 或未知                      | `SELECT * FROM table_name WHERE column_name IS NULL;` |
| 31   | JOIN       | 用于将行从两个或多个表中组合起来                             | `SELECT * FROM table1 JOIN table2 ON table1.column_name = table2.column_name;` |
| 32   | KEY        | 用于定义列或列组合的索引                                     | `CREATE TABLE table_name (column1 datatype, column2 datatype, KEY (column1, column2));` |
| 33   | LEFT       | 用于返回从左表（table1）中的所有记录和右表（table2）中的匹配记录 | `SELECT * FROM table1 LEFT JOIN table2 ON table1.column_name = table2.column_name;` |
| 34   | LIKE       | 用于搜索与指定模式匹配的数据                                 | `SELECT * FROM table_name WHERE column_name LIKE pattern;` |
| 35   | LIMIT      | 用于限制结果集的数量                                         | `SELECT * FROM table_name LIMIT number;`              |
| 36   | MAX        | 用于计算数值列的最大值                                       | `SELECT MAX(column_name) FROM table_name;`            |
| 37   | MIN        | 用于计算数值列的最小值                                       | `SELECT MIN(column_name) FROM table_name;`            |
| 38   | NOT        | 用于否定条件                                                 | `SELECT * FROM table_name WHERE NOT condition;`       |
| 39   | NULL       | 用于测试值是否为 NULL                                        | `SELECT * FROM table_name WHERE column_name IS NULL;`

## mysql 列出 DML 和 DQL 中会用到的所有关键词，group by ... having 之类的也加上。

以下是 MySQL 中在 DML (Data Manipulation Language) 和 DQL (Data Query Language) 中经常使用的关键词，包括 SELECT 查询语句中的聚合函数和分组语句：

### DML (Data Manipulation Language)
1. **SELECT**: 从数据库中检索数据。
2. **INSERT**: 将新行插入数据库表中。
3. **UPDATE**: 更新数据库表中的现有行。
4. **DELETE**: 从数据库表中删除行。
5. **WHERE**: 用于指定条件，过滤要返回的数据。
6. **ORDER BY**: 用于对结果集进行排序。
7. **LIMIT**: 限制结果集的行数。
8. **GROUP BY**: 将结果集按照一个或多个列进行分组。
9. **HAVING**: 在 GROUP BY 中指定条件。
10. **JOIN**: 将两个或多个表中的行组合起来，基于连接条件。
11. **INNER JOIN**: 返回匹配两个表中行的行。
12. **LEFT JOIN**: 返回左表中的所有行，以及右表中匹配的行。
13. **RIGHT JOIN**: 返回右表中的所有行，以及左表中匹配的行。
14. **FULL JOIN**: 返回左表和右表中的所有行，以及匹配的行。
15. **UNION**: 合并两个或多个 SELECT 语句的结果集。

### DQL (Data Query Language)
1. **SELECT**: 从数据库中检索数据。
2. **DISTINCT**: 返回唯一不同的值。
3. **FROM**: 指定要查询数据的表名或表达式。
4. **AS**: 用于为列或表指定别名。
5. **WHERE**: 用于指定条件，过滤要返回的数据。
6. **GROUP BY**: 将结果集按照一个或多个列进行分组。
7. **HAVING**: 在 GROUP BY 中指定条件。
8. **ORDER BY**: 用于对结果集进行排序。
9. **LIMIT**: 限制结果集的行数。
10. **JOIN**: 将两个或多个表中的行组合起来，基于连接条件。
11. **INNER JOIN**: 返回匹配两个表中行的行。
12. **LEFT JOIN**: 返回左表中的所有行，以及右表中匹配的行。
13. **RIGHT JOIN**: 返回右表中的所有行，以及左表中匹配的行。
14. **FULL JOIN**: 返回左表和右表中的所有行，以及匹配的行。
15. **UNION**: 合并两个或多个 SELECT 语句的结果集。
16. **AND**: 在 WHERE 子句中将多个条件结合在一起。
17. **OR**: 在 WHERE 子句中指定多个可能的条件。
18. **IN**: 指定条件范围，条件为多个值之一。
19. **BETWEEN**: 指定范围内的条件。
20. **LIKE**: 用于搜索与指定模式匹配的数据。
21. **IS NULL**: 用于测试值是否为 NULL。
22. **IS NOT NULL**: 用于测试值是否不为 NULL。
23. **COUNT()**: 计算选择的行数。
24. **SUM()**: 计算数值列的总和。
25. **AVG()**: 计算数值列的平均值。
26. **MIN()**: 计算数值列的最小值。
27. **MAX()**: 计算数值列的最大值。

这些关键词在 MySQL 中用于数据查询和操作，可以根据需要进行组合和使用。

## 给出 mysql 关键词语法文档的网址，及相关学习资料

你可以在 MySQL 官方文档中找到关于 MySQL 关键字的详细信息。

以下是 MySQL 官方文档的网址：

[MySQL 8.0 Reference Manual](https://dev.mysql.com/doc/refman/8.0/en/)

在该文档中，你可以找到关于 MySQL 中所有语句、函数、关键字等的详尽说明。

此外，以下是一些学习 MySQL 的相关资源：

1. [MySQL Tutorial](https://www.mysqltutorial.org/): 一个面向初学者的 MySQL 教程，从基础知识到高级概念都有涵盖。

2. [W3Schools MySQL Tutorial](https://www.w3schools.com/sql/sql_intro.asp): W3Schools 提供的 MySQL 教程，包含了大量的例子和练习，适合快速入门和参考。

3. [Coursera - Learn SQL Basics for Data Science](https://www.coursera.org/learn/sql-basics): 由 Coursera 提供的在线课程，适合想要系统学习 SQL 的人群。

4. [MySQL YouTube Channel](https://www.youtube.com/user/MySQL): MySQL 官方 YouTube 频道，提供了许多关于 MySQL 的视频教程和演示。

5. [MySQL Documentation](https://dev.mysql.com/doc/): MySQL 官方文档，提供了详尽的 MySQL 相关资料和文档，适合进行深入学习和参考。

这些资源将帮助你建立对 MySQL 的扎实理解，并能够熟练使用 MySQL 进行数据库管理和查询操作。




# 参考资料


* any list
{:toc}
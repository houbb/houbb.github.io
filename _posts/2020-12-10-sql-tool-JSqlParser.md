---
layout: post
title: JSqlParser JSqlParser 解析 SQL 语句并将其转换为 Java 类的层次结构。 生成的层次结构可以使用访问者模式导航
date:  2020-10-17 16:15:55 +0800
categories: [Tool]
tags: [tool, database, java, sh]
published: true
---

# JSqlParser

[JSqlParser](https://github.com/JSQLParser/JSqlParser) 是一个 SQL 语句解析器。 

它在 Java 类的可遍历层次结构中转换 SQL。 

JSqlParser 不限于一个数据库，而是提供了对很多特殊的 Oracle、SqlServer、MySQL、PostgreSQL 的支持……举个例子，它支持 Oracles join 语法 using (+)、PostgreSQLs cast 语法 using ::、relational != 等运算符。

# 这个怎么运作？

解析器是使用 JavaCC 构建的。 

SQL 的核心 JavaCC 语法取自 Guido Draheim 的站点，并已更改以生成 Java 类的层次结构。 称为解析器的类用于再次构建类层次结构的 SQL 文本。

随着时间的推移，语法得到了扩展，现在是各种数据库系统语法专业的组合。 

它是因需要而生长的。 

因此可以解析某些（不是全部）Oracle、MySql、SQLServer、PostgreSQL 特定方面。

# 入门

## maven 

```xml
<dependency>
	<groupId>com.github.jsqlparser</groupId>
	<artifactId>jsqlparser</artifactId>
	<version>3.2</version>
</dependency>
```

## 转换

https://github.com/JSQLParser/JSqlParser/wiki/Examples-of-SQL-parsing

简单转换：

```java
Statement stmt = CCJSqlParserUtil.parse("SELECT * FROM tab1");
```

SQL 脚本转换：

```java
Statements stmt = CCJSqlParserUtil.parseStatements("SELECT * FROM tab1; SELECT * FROM tab2");
```

简单表达式转换：

```java
Expression expr = CCJSqlParserUtil.parseExpression("a*(5+mycolumn)");
```

# 小结

https://github.com/JSQLParser/JSqlParser

* any list
{:toc}
---
layout: post
title: 数据库查询工具 sql builder-Yeamy SqlBuilder 入门介绍，主要是看约束条件的设计。
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

# Yeamy/SqlBuilder

https://github.com/Yeamy/SqlBuilder

这个项目只是一个Java编写的SQL语句生成器。   

它并不能让提高你的代码执行效率，但是可以让你的Java代码更直观，更纯粹。

### 0. 例子

这个一个简单的例子，像这样:

```java
Column fruit_name = new Column("name");
SQL.delete("fruit", Clause.equal(fruit_name, "apple"));
```
通过上面生成的SQL语句:

```sql
DELETE FROM `fruit` WHERE `name` = "apple";
```

### 1. 插入（INSERT）

```java
String sql = new Insert(String table)
		.addAll(Map<String, Object> cv)          // map<列, 值>批量全部
		.add(String column, Object value)        // 单独添加
		.toString();
```


### 2. 删除（DELETE）

```java
SQL.delete(String table, Clause where);
```

### 3. 修改（UPDATE）

```java
String sql = new Update(String table)
		.addAll(Map<String, Object> cv)          // 批量全部
		.add(String column, Object value)        // 单独添加
		.where(clause)
		.toString();
```

### 4. 查询（SELECT）

简单地搜索全表：

```java
SQL.select(String table, Clause where, int limit);
```

大多数情况，我们需要使用 select builder 来帮助我们事先复杂搜索。  

使用builder不需要单独声明表名，但是所有包含的列的表名都`必须`不能为空，尤其是在多表查询的时候！

```java
Column price_fruitId = new Column("price", "fruitId");
Column fruit_fruitId = new Column("fruit", "fruitId");
Column fruit_name = new Column("fruit", "name");

String sql = new Select()
		.addColumn(new Column("mylike", null))     // 没有搜索列
		.addColumn(new Column("fruit", "*"))       // 表的所有列
		.addColumn(new Column("price", xxx))       // 表的指定列
		.innerJoin(price_fruitId, fruit_fruitId)   // join
		.where(Clause.like(fruit_name, "apple"))   // where
		.orderBy(new Asc(price_fruitId).desc(xxx)) // order by
		.limit(2)                                  // limit
		.toString();
```

### 5. 约束（WHERE）

```java
// 单独条件：
//      in, between, isNull, isNotNull, like,
//      equal(=), lessThan(<), lessEqual(<=), moreThan(>), moreEqual(>=)
Clause.equal(column, pattern)

// 多条件
MultiClause clause = new MultiClause(clause1)
		.and(clause2)
		.or(new MultiClause(xxx)...);
```

总的来说，最复杂的还是这个类。

### 6. 列（Column）

```java
Column(String name);                              // 不带表名
Column(String table, String name);                // 带表名
Column(table, name).as(String alias);             // 带列的“别名”
Column(table, name).as(tableAlias, nameAlias);    // 带表的“别名”
```

# 参考资料


* any list
{:toc}
---
layout: post
title: 数据库查询工具 sql builder-geevisoft sql-query-builder 入门介绍
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

# geevisoft/sql-query-builder

https://github.com/geevisoft/sql-query-builder

# SQL 查询构建器

又一个专注于 Java 传统项目的 SQL 查询构建器。

在为项目添加新功能时，您不必修改任何现有的代码即可开始使用它。

## 入门指南

在您的项目中将 [SqlQueryBuilder.jar](SqlQueryBuilder.jar) 加载为库。

PS: 这个没有放入到 maven 中。

### 先决条件

它是基于 Java 6 构建的，因此适用于大多数项目。

### 示例

###### Select 查询
```java
String builder = new SqlQueryBuilder();
String query = builder
    .select()
    .from("Users")
    .innerJoin("Clients", "ClientID", "ID")
    .whereEqual("LastName", "Doe")
    .orderBy("FirstName")
    .query();
```

###### Update 查询
```java
String builder = new SqlQueryBuilder();
String query = builder
    .update("Users")
    .set("FirstName", "John")
    .set("Age", 21)
    .whereEqual("ID", 1)
    .query();
```

###### Insert 查询
```java
String builder = new SqlQueryBuilder();
String query = builder
    .insertInto("Users")
    .value("FirstName", "John")
    .value("LastName", "Doe")
    .value("Age", 21)
    .query();
```

###### Delete 查询
```java
String builder = new SqlQueryBuilder();
String query = builder
    .delete("Users")
    .whereEquals("ID", 1)
    .query();
```

## 更多示例

您可以在 [测试项目](SqlQueryBuilderTest) 中找到更多示例。

### 删除

```java
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SqlDeleteQueryBuilderTest {

	private SqlQueryBuilder builder;

	@BeforeEach
	void setUp() {
		builder = new SqlQueryBuilder();
	}

	@Test
	void deleteWithWhere(){
		String query = builder
			.delete("Users")
			.whereEquals("ID", 1)
			.query();
		String writtenQuery = "DELETE FROM Users WHERE ID=1";
		Assertions.assertEquals(query, writtenQuery);
	}
}
```

### 插入查询

```java
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SqlInsertQueryBuilderTest {

	private SqlQueryBuilder builder;

	@BeforeEach
	void setUp() {
		builder = new SqlQueryBuilder();
	}

	@Test
	void insertOneWithOneValue(){
		String query = builder
			.insertInto("Users")
			.value("FirstName", "John")
			.query();
		String writtenQuery = "INSERT INTO Users (FirstName) VALUES ('John')";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void insertOneWithThreeValue(){
		String query = builder
			.insertInto("Users")
			.value("FirstName", "John")
			.value("LastName", "Doe")
			.value("Age", 21)
			.query();
		String writtenQuery = "INSERT INTO Users (FirstName, LastName, Age) VALUES ('John', 'Doe', 21)";
		Assertions.assertEquals(writtenQuery, query);
	}
}
```

### 完整的查询例子

```java
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SqlSelectQueryBuilderTest {

	private SqlQueryBuilder builder;

	@BeforeEach
	void setUp() {
		builder = new SqlQueryBuilder();
	}

	@Test
	void simpleSelect(){
		String query = builder
			.select("FirstName", "LastName")
			.from("Users")
			.query();
		String writtenQuery = "SELECT FirstName, LastName FROM Users";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void emptySelect(){
		String query = builder
			.select()
			.from("Users")
			.query();
		String writtenQuery = "SELECT * FROM Users";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithWhereClause(){
		String query = builder
			.select()
			.from("Users")
			.where("LastName = 'Doe'")
			.query();
		String writtenQuery = "SELECT * FROM Users WHERE LastName = 'Doe'";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithAlias(){
		String query = builder
			.select("u.FirstName")
			.from("Users", "u")
			.query();
		String writtenQuery = "SELECT u.FirstName FROM Users u";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithOrderByClause(){
		String query = builder
			.select()
			.from("Users")
			.orderBy("LastName")
			.query();
		String writtenQuery = "SELECT * FROM Users ORDER BY LastName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithWhereInnerJoinAndOrderBy(){
		String query = builder
			.select()
			.from("Users")
			.innerJoin("Clients", "ClientID", "ID")
			.whereEqual("LastName", "Doe")
			.orderBy("FirstName")
			.query();
		String writtenQuery = "SELECT * FROM Users INNER JOIN Clients ON ClientID=ID WHERE LastName='Doe' ORDER BY FirstName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithWhereInnerJoinAndGroupBy(){
		String query = builder
			.select()
			.from("Users")
			.innerJoin("Clients", "ClientID", "ID")
			.whereEqual("LastName", "Doe")
			.groupBy("FirstName")
			.query();
		String writtenQuery = "SELECT * FROM Users INNER JOIN Clients ON ClientID=ID WHERE LastName='Doe' GROUP BY FirstName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithInnerJoinAndGroupBy(){
		String query = builder
			.select()
			.from("Users")
			.innerJoin("Clients", "ClientID", "ID")
			.groupBy("FirstName")
			.query();
		String writtenQuery = "SELECT * FROM Users INNER JOIN Clients ON ClientID=ID GROUP BY FirstName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithInnerJoinGroupByAndOrderBy(){
		String query = builder
			.select()
			.from("Users")
			.innerJoin("Clients", "ClientID", "ID")
			.groupBy("FirstName")
			.orderBy("LastName")
			.query();
		String writtenQuery = "SELECT * FROM Users INNER JOIN Clients ON ClientID=ID GROUP BY FirstName ORDER BY LastName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void innerJoinAndInnerJoin(){
		String query = builder
			.select()
			.from("Users")
			.innerJoin("Clients", "ClientID", "ID")
			.innerJoin("Tickets", "UserID", "ID")
			.query();
		String writtenQuery = "SELECT * FROM Users INNER JOIN Clients ON ClientID=ID INNER JOIN Tickets ON UserID=ID";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectFromAndTwoOrders(){
		String query = builder
			.select()
			.from("Users")
			.orderBy("LastName", "FirstName")
			.query();
		String writtenQuery = "SELECT * FROM Users ORDER BY LastName, FirstName";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithJoinsAndAlias(){
	    String query = builder
			.select("u.ID", "c.ID", "t.ID")
			.from("Users", "u")
			.innerJoinAs("Clients", "c", "c.ID=u.ClientID")
			.leftJoinAs("Tickets", "t", "t.UserID=u.ID")
			.query();
	    String writtenQuery = "SELECT u.ID, c.ID, t.ID FROM Users u INNER JOIN Clients c ON c.ID=u.ClientID LEFT JOIN Tickets t ON t.UserID=u.ID";
	    Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithWhereIn(){
	    String query = builder
			.select()
			.from("Users")
			.whereIn("Username", "jack", "joe")
			.query();
	    String writtenQuery = "SELECT * FROM Users WHERE Username IN ('jack', 'joe')";
	    Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void selectWithAListForWhereIn(){
		int[] validYears = new int[]{5, 7, 8, 25};
	    String query = builder
			.select()
			.from("Users")
			.whereIn("Age", validYears)
			.query();
	    String writtenQuery = "SELECT * FROM Users WHERE Age IN (5, 7, 8, 25)";
	    Assertions.assertEquals(writtenQuery, query);
	}
}
```

### 更新

```java
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class SqlUpdateQueryBuilderTest {

	private SqlQueryBuilder builder;

	@BeforeEach
	void setUp() {
		builder = new SqlQueryBuilder();
	}

	@Test
	void updateOneColumn(){
		String query = builder
			.update("Users")
			.set("FirstName", "John")
			.whereEqual("ID", 1)
			.query();
		String writtenQuery = "UPDATE Users SET FirstName='John' WHERE ID=1";
		Assertions.assertEquals(writtenQuery, query);
	}

	@Test
	void updateTwoColumns(){
		String query = builder
			.update("Users")
			.set("FirstName", "John")
			.set("Age", 21)
			.whereEqual("ID", 1)
			.query();
		String writtenQuery = "UPDATE Users SET FirstName='John', Age=21 WHERE ID=1";
		Assertions.assertEquals(writtenQuery, query);
	}
}
```

## 贡献

目前没有规则。

## 许可证

本项目基于 MIT 许可证 - 有关详情，请参阅 [LICENSE.md](LICENSE.md) 文件。

## 致谢

* 在旧项目中没有使用框架的情况下避免编写原始查询。
* 除了您“想要”添加功能的文件之外，不必编辑任何其他文件。


# 参考资料


* any list
{:toc}
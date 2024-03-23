---
layout: post
title: 数据库查询工具 sql builder-danfickle java-sql-query-builder 入门介绍
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

# java-sql-query-builder

## Java SQL查询构建器

该项目是用于Java的SQL查询构建器。目前仅支持MySql。

然而，它根据接口编程，因此应该很容易添加其他SQL方言。

该项目在宽松的BSD许可证下获得许可。

## 例子

以下是使用该项目生成查询的示例：

```java
/**
 * 使用 java-sql-query-builder 进行各种查询的示例。
 * 重要提示：
 *   为了清晰起见，省略了异常处理和清理操作。
 */
static void 示例() throws SQLException, ClassNotFoundException
{
    Class.forName("com.mysql.jdbc.Driver");
    Connection conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/YourDatabase", "root", "your_password");		
    PreparedStatement stmt;
    
    QbFactory f = new QbFactoryImp();
    
    // 更新给定 id 的 first_name、last_name 和 age...
    QbUpdate up = f.newUpdateQuery();
    up.set(f.newStdField("first_name"), ":first_name")
      .set(f.newStdField("last_name"), ":last_name")
      .set(f.newStdField("age"), ":age")
      .inTable("myTable")
      .where()
      .where(f.newStdField("id"), ":id");
    stmt = conn.prepareStatement(up.getQueryString());
    stmt.setString(up.getPlaceholderIndex(":first_name"), "John");
    stmt.setString(up.getPlaceholderIndex(":last_name"), "Citizen");
    stmt.setInt(up.getPlaceholderIndex(":age"), 32);
    stmt.setInt(up.getPlaceholderIndex(":id"), 1024);
    stmt.executeUpdate();
    
    // 删除所有具有给定年龄值的记录...
    QbDelete del = f.newDeleteQuery();
    del.from("myTable")
       .where()
       .where(f.newStdField("age"), ":age");
    stmt = conn.prepareStatement(del.getQueryString());
    stmt.setInt(del.getPlaceholderIndex(":age"), 32);
    stmt.executeUpdate();
    
    // 插入一个将 egg_hatched 字段设置为 true 的记录...
    QbInsert in = f.newInsertQuery();
    in.set(f.newStdField("egg_hatched"), ":egg_hatched")
      .inTable("myTable");
    stmt = conn.prepareStatement(in.getQueryString());
    stmt.setBoolean(in.getPlaceholderIndex(":egg_hatched"), true);
    stmt.executeUpdate();
    
    // 简单的选择查询，检索不具有给定 id 的记录的 id、age 和 last_name...
    QbSelect sel = f.newSelectQuery();
    sel.select(f.newStdField("id"), f.newStdField("age"), f.newStdField("last_name"))
       .from("myTable")
       .where()
       .where(f.newStdField("id"), QbWhereOperator.NOT_EQUALS, ":id");
    stmt = conn.prepareStatement(sel.getQueryString());
    stmt.setInt(sel.getPlaceholderIndex(":id"), 1024);
    ResultSet rs = stmt.executeQuery();
    
    while (rs.next())
    {
        System.out.println(rs.getInt("id") + ":" + rs.getInt("age") + ":" + rs.getString("last_name"));
    }
    
    // 带有连接的复杂选择查询...
    sel = f.newSelectQuery();
    sel.select(f.newQualifiedField("t1", "id"), f.newQualifiedField("t2", "id"))
       .from("t1")
       .join("t2", f.newQualifiedField("t2", "id"), f.newQualifiedField("t1", "t1_id"), QbJoinType.LEFT)
       .where()
       .where(f.newStdField("age"), ":age");
    stmt = conn.prepareStatement(sel.getQueryString());
    stmt.setInt(sel.getPlaceholderIndex(":age"), 45);
    rs = stmt.executeQuery();
    // 记录枚举被省略...
    
    
    // 带有分组的选择查询...
    sel = f.newSelectQuery();
    sel.select(f.newAvg(f.newStdField("age"), "avg_age"))
       .from("myTable")
       .groupBy(f.newStdField("first_name"))
       .having()
       .where(f.newStdField("avg_age"), QbWhereOperator.GREATER_THAN, ":avg_age");
    stmt = conn.prepareStatement(sel.getQueryString());
    stmt.setInt(sel.getPlaceholderIndex(":avg_age"), 50);
    rs = stmt.executeQuery();
    // 记录枚举被省略...
}
```



# 参考资料

https://github.com/danfickle/java-sql-query-builder

* any list
{:toc}
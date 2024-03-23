---
layout: post
title: 数据库查询工具 sql builder-DenzelCode AdvancedSQL 入门介绍
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

# DenzelCode/AdvancedSQL

AdvancedSQL 是一个 SQL 查询构建器和/或连接器，可以帮助您在数据库上生成/修改信息，而无需编写任何 SQL 代码。

有时编写 SQL 查询代码可能会有些无聊和繁琐，AdvancedSQL 是那些希望继续编码而无需在 Java 代码中编写语法外的代码（SQL 查询）的开发人员的最佳选择。

### 下载

您可以从以下链接下载最新的 JAR 包：[AdvancedSQL Releases](https://github.com/DenzelCode/AdvancedSQL/releases/latest)

### 依赖 Maven

如果您使用 Maven，可以将以下依赖项添加到您的 `pom.xml` 文件中：

```xml
<dependency>
    <groupId>com.code</groupId>
    <artifactId>advancedsql</artifactId>
    <version>2.0.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/lib/AdvancedSQL.jar</systemPath>
</dependency>
```

### 示例

以下是一些使用 AdvancedSQL 的示例：

#### 连接到数据库

```java
import com.code.advancedsql.*;

try {
    MySQL mySQL = new MySQL("127.0.0.1", 3306, "root", "password", "database");

    if (mySQL.isConnected()) {
        System.out.println("Connected!");
    }
} catch (SQLException e) {
    e.printStackTrace();
}
```

#### 创建表格

```java
import com.code.advancedsql.*;
import com.code.advancedsql.table.ITable;

try {
    MySQL mySQL = connect();

    // Table
    ITable table = mySQL.table("users");

    // Create table
    Create create = table.create().ifNotExists();

    // Table columns
    create.id();
    create.string("first_name");
    create.string("last_name");
    create.string("test");

    Boolean result = create.execute();

    // Print query string and result.
    System.out.println(create);
    System.out.println(result);
} catch (SQLException e) {
    e.printStackTrace();
}
```

#### 修改表格

```java
import com.code.advancedsql.*;
import com.code.advancedsql.query.action.Add;
import com.code.advancedsql.query.action.Modify;

try {
    MySQL mySQL = connect();

    // Alter columns
    Alter alter = mySQL.table("users").alter();

    // Add columns
    Add add = alter.add();
    add.string("token").nullable();
    add.string("connection_id").nullable();

    // Drop columns
    com.code.advancedsql.query.action.Drop drop = alter.drop();
    drop.column("test");

    // Modify columns
    Modify modify = alter.modify();
    modify.integer("connection_id").nullable();

    // Execute query
    Boolean result = alter.execute();

    // Print query string and result.
    System.out.println(alter);
    System.out.println(result);
} catch (SQLException e) {
    e.printStackTrace();
}
```

#### 插入数据

```java
import com.code.advancedsql.*;

try {
    MySQL mySQL = connect();

    // Insert
    Insert query = mySQL.table("users").insert();
    
    query.field("first_name", "Denzel");
    query.field("last_name", "Code");
    
    int execute = query.execute();

    // Print query string and result.
    System.out.println(query);
    System.out.println(execute);
} catch (SQLException e) {
    e.printStackTrace();
}
```

### 许可信息

该项目根据 LGPL-3.0 许可证授权。请参阅 LICENSE 文件了解详情。

# 小结

感觉这个做的比较多，不仅仅局限于 DQL + DML，还包含 DDL。



# 参考资料

https://github.com/DenzelCode/AdvancedSQL

* any list
{:toc}
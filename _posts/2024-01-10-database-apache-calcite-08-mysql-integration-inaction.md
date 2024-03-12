---
layout: post
title: Apache Calcite v1.36.0 整合 mysql 实战笔记
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 架构的差异

原生数据源：

![常规数据源](https://img-blog.csdnimg.cn/direct/9957d27c6ca94e5a9a9c6672ce93cbb3.png#pic_center)

引入 apache calcite 之后：

![引入 calcite 之后](https://img-blog.csdnimg.cn/direct/26109dffd92f45d7b611741bd30a4f40.png#pic_center)

# 说明

实战记录一下 mysql 如何整合 apache calcite。

# mysql 数据准备

## 建表语句

```sql
use test;

CREATE TABLE "users" (
  "id" int(11) NOT NULL,
  "username" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
```

## 插入数据

```sql
insert into users (id, username, email) values (1, 'u-1', '1@email.com');
insert into users (id, username, email) values (2, 'u-2', '2@email.com');
insert into users (id, username, email) values (3, 'u-3', '3@email.com');
```

数据确认：

```
mysql> select * from users;
+----+----------+-------------+
| id | username | email       |
+----+----------+-------------+
|  1 | u-1      | 1@email.com |
|  2 | u-2      | 2@email.com |
|  3 | u-3      | 3@email.com |
+----+----------+-------------+
3 rows in set (0.00 sec)
```

# mysql 整合基本例子-v1

## maven 引入

```xml
<dependencies>
<!--        jdbc 应该是 core 的一部分-->
    <dependency>
        <groupId>org.apache.calcite</groupId>
        <artifactId>calcite-core</artifactId>
        <version>1.36.0</version>
    </dependency>
    <!-- MySQL JDBC Driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.47</version> <!-- 或者最新版本 -->
    </dependency>
</dependencies>
```

## java 代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/**
 * https://blog.csdn.net/a17816876003/article/details/125592222
 *
 */
public class CalciteMySQLExample {

    public static void main(String[] args) throws Exception {
        // check driver exist
        Class.forName("org.apache.calcite.jdbc.Driver");
        Class.forName("com.mysql.jdbc.Driver");

        // the properties for calcite connection
        Properties info = new Properties();
        //LEX: 使用传统的 SQL 解析器，也称为 "LEX" 解析器。这是 Calcite 默认的解析器类型，能够处理大多数 SQL 语法。
        //JAVA: 使用 Java 解析器，也称为 "JAVA" 解析器。这个解析器是针对 Calcite 提供的 SQL 格式进行解析。
        info.setProperty("lex", "JAVA");
        // remarks 是指定是否应该包含数据库的备注信息（也称为注释）。当设置为 true 时，表示在元数据中包含数据库对象的备注信息；当设置为 false 时，不包含备注信息。
        info.setProperty("remarks","true");
        // SqlParserImpl can analysis sql dialect for sql parse
        info.setProperty("parserFactory","org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY");

        // create calcite connection and schema
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
        System.out.println(calciteConnection.getProperties());

        // code for mysql datasource
        MysqlDataSource dataSource = new MysqlDataSource();
        // please change host and port maybe like "jdbc:mysql://127.0.0.1:3306/test"
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUser("admin");
        dataSource.setPassword("123456");
        // mysql schema, the sub schema for rootSchema, "test" is a schema in mysql
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        Schema schema = JdbcSchema.create(rootSchema, "test", dataSource, null, "test");
        rootSchema.add("test", schema);

        // run sql query
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery("select * from test.users");
        while (resultSet.next()) {
            System.out.println(resultSet.getObject(1) + ","
                    + resultSet.getObject(2)
                    + "," + resultSet.getObject(3));
        }

        statement.close();
        connection.close();
    }
}
```

输出日志：

```
{lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}
1,u-1,1@email.com
2,u-2,2@email.com
3,u-3,3@email.com
```

# mysql 整合-v2

## 说明 

`select * from test.users` 这个 test 前缀感觉比较别扭，如果不想要呢。

其实加一句就行：

```java
// Set default schema for unqualified table names，这样可以让 sql 不加前缀？
calciteConnection.setSchema("test");
```

## 完整代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/**
 * https://blog.csdn.net/a17816876003/article/details/125592222
 *
 */
public class CalciteMySQLExampleNoPrefix {

    public static void main(String[] args) throws Exception {
        // check driver exist
        Class.forName("org.apache.calcite.jdbc.Driver");
        Class.forName("com.mysql.jdbc.Driver");

        // the properties for calcite connection
        Properties info = new Properties();
        //LEX: 使用传统的 SQL 解析器，也称为 "LEX" 解析器。这是 Calcite 默认的解析器类型，能够处理大多数 SQL 语法。
        //JAVA: 使用 Java 解析器，也称为 "JAVA" 解析器。这个解析器是针对 Calcite 提供的 SQL 格式进行解析。
        info.setProperty("lex", "JAVA");
        // remarks 是指定是否应该包含数据库的备注信息（也称为注释）。当设置为 true 时，表示在元数据中包含数据库对象的备注信息；当设置为 false 时，不包含备注信息。
        info.setProperty("remarks","true");
        // SqlParserImpl can analysis sql dialect for sql parse
        info.setProperty("parserFactory","org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY");

        // create calcite connection and schema
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
        System.out.println(calciteConnection.getProperties());

        // code for mysql datasource
        MysqlDataSource dataSource = new MysqlDataSource();
        // please change host and port maybe like "jdbc:mysql://127.0.0.1:3306/test"
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUser("admin");
        dataSource.setPassword("123456");
        // mysql schema, the sub schema for rootSchema, "test" is a schema in mysql
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        Schema schema = JdbcSchema.create(rootSchema, "test", dataSource, null, "test");
        rootSchema.add("test", schema);

        // Set default schema for unqualified table names，这样可以让 sql 不加前缀？
        calciteConnection.setSchema("test");

        // run sql query
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery("select * from users");
        while (resultSet.next()) {
            System.out.println(resultSet.getObject(1) + ","
                    + resultSet.getObject(2)
                    + "," + resultSet.getObject(3));
        }

        statement.close();
        connection.close();
    }
}
```

效果

```
{lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}
1,u-1,1@email.com
2,u-2,2@email.com
3,u-3,3@email.com
```

# mysql join 场景测试-v2

## java 代码

我们实际测试一下 Left join 的场景，核心 SQL：

```sql
select u.* from users u left join users_fake f ON u.id=f.id where f.id=2
```

如下

```java
package com.github.houbb.calcite.learn.mysql;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/**
 * https://blog.csdn.net/a17816876003/article/details/125592222
 *
 */
public class CalciteMySQLExampleNoPrefixLeftJoin {

    public static void main(String[] args) throws Exception {
        // check driver exist
        Class.forName("org.apache.calcite.jdbc.Driver");
        Class.forName("com.mysql.jdbc.Driver");

        // the properties for calcite connection
        Properties info = new Properties();
        //LEX: 使用传统的 SQL 解析器，也称为 "LEX" 解析器。这是 Calcite 默认的解析器类型，能够处理大多数 SQL 语法。
        //JAVA: 使用 Java 解析器，也称为 "JAVA" 解析器。这个解析器是针对 Calcite 提供的 SQL 格式进行解析。
        info.setProperty("lex", "JAVA");
        // remarks 是指定是否应该包含数据库的备注信息（也称为注释）。当设置为 true 时，表示在元数据中包含数据库对象的备注信息；当设置为 false 时，不包含备注信息。
        info.setProperty("remarks","true");
        // SqlParserImpl can analysis sql dialect for sql parse
        info.setProperty("parserFactory","org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY");

        // create calcite connection and schema
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
        System.out.println(calciteConnection.getProperties());

        // code for mysql datasource
        MysqlDataSource dataSource = new MysqlDataSource();
        // please change host and port maybe like "jdbc:mysql://127.0.0.1:3306/test"
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUser("admin");
        dataSource.setPassword("123456");
        // mysql schema, the sub schema for rootSchema, "test" is a schema in mysql
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        Schema schema = JdbcSchema.create(rootSchema, "test", dataSource, null, "test");
        rootSchema.add("test", schema);

        // Set default schema for unqualified table names，这样可以让 sql 不加前缀？
        calciteConnection.setSchema("test");

        // run sql query
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery("select u.* from users u left join users_fake f ON u.id=f.id where f.id=2");
        while (resultSet.next()) {
            System.out.println(resultSet.getObject(1) + ","
                    + resultSet.getObject(2)
                    + "," + resultSet.getObject(3));
        }

        statement.close();
        connection.close();
    }
}
```

测试效果：

```
{lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}
2,u-2,2@email.com
```

# 引入 druid 数据库池化

## 场景

上面没有引入数据库池化能力。

## java 实现方式

这里我们使用 alibaba druid，其实实现也比较简单。

MysqlDataSource=>DruidDataSource

```java
package com.github.houbb.calcite.learn.mysql;

import com.alibaba.druid.pool.DruidDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/**
 * druid + calcite + mysql
 */
public class DruidCalciteMySQLNoPrefixExample {

    public static void main(String[] args) throws Exception {
        Properties info = new Properties();
        info.setProperty("lex", "JAVA");
        info.setProperty("remarks","true");
        info.setProperty("parserFactory","org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY");

        // create calcite connection and schema
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
        System.out.println(calciteConnection.getProperties());

        // code for mysql datasource
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("admin");
        dataSource.setPassword("123456");
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        Schema schema = JdbcSchema.create(rootSchema, "test", dataSource, null, "test");
        rootSchema.add("test", schema);
        calciteConnection.setSchema("test");

        // run sql query
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery("select * from users");
        while (resultSet.next()) {
            System.out.println(resultSet.getObject(1) + ","
                    + resultSet.getObject(2)
                    + "," + resultSet.getObject(3));
        }

        statement.close();
        connection.close();
    }
}
```

效果：

```
{lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}
三月 12, 2024 10:36:22 上午 com.alibaba.druid.pool.DruidDataSource info
信息: {dataSource-1} inited
1,u-1,1@email.com
2,u-2,2@email.com
3,u-3,3@email.com
```

# 参考资料

https://blog.csdn.net/a17816876003/article/details/125592222

* any list
{:toc}
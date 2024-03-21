---
layout: post
title: Apache Calcite v1.36.0 整合 mysql 实战踩坑 按照时间范围查询不到数据？但是 mysql 原生 jdbc 可以正常运行
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 现象

使用 apache calicte 整合 mysql 测试，使用日期类型的 between and，发现无法查询到数据。

反复测试了多次，发现确实是 apache calicte 的兼容性问题，记录一下。

# mysql 准备

## 版本

```
mysql> select @@version;
+------------+
| @@version  |
+------------+
| 5.7.31-log |
+------------+
1 row in set (0.00 sec)
```

## 建表

```sql
use test;

create table user_info(
    id INT NOT NULL,
    name varchar(32),
    update_time datetime(6)
);

insert into user_info (id, name, update_time) values (1, 'u-1', now());
insert into user_info (id, name, update_time) values (2, 'u-2', now());
```

数据确认：

```
mysql> select * from user_info;
+----+------+----------------------------+
| id | name | update_time                |
+----+------+----------------------------+
|  1 | u-1  | 2024-03-21 17:26:45.000000 |
|  2 | u-2  | 2024-03-21 17:26:46.000000 |
+----+------+----------------------------+
2 rows in set (0.00 sec)
```

# maven 依赖

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
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid</artifactId>
        <version>1.2.15</version>
    </dependency>
</dependencies>
```

# mysql 正常查询

## java 代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.alibaba.druid.pool.DruidDataSource;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * druid 整合 mysql 使用
 */
public class DruidMySQLExampleWhereDate {

    public static void main(String[] args) {
        // 初始化 Druid 数据源
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("admin");
        dataSource.setPassword("123456");

        try (PreparedStatement preparedStatement = dataSource.getConnection().prepareStatement("SELECT id, update_time FROM user_info WHERE update_time BETWEEN ? AND ?")) {
            Timestamp startOfDay = Timestamp.valueOf(LocalDate.now().atStartOfDay());
            Timestamp endOfDay = Timestamp.valueOf(LocalDateTime.now().withHour(23).withMinute(59).withSecond(59));

            // 设置参数
            preparedStatement.setTimestamp(1, startOfDay);
            preparedStatement.setTimestamp(2, endOfDay);
            // 执行查询
            ResultSet resultSet = preparedStatement.executeQuery();

            // 处理结果集
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                Timestamp updateTime = resultSet.getTimestamp("update_time");
                System.out.println("ID: " + id + ", Update Time: " + updateTime);
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
```


效果

```
ID: 1, Update Time: 2024-03-21 17:26:45.0
ID: 2, Update Time: 2024-03-21 17:26:46.0
```

可以正常查询。

# v1-calcite 不正常的版本

## 代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Properties;

/**
 * https://blog.csdn.net/a17816876003/article/details/125592222
 *
 */
public class CalciteMySQLExampleNoPrefixAndWhereDateNotWork {

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

        // 执行SQL查询
        try (PreparedStatement preparedStatement = connection.prepareStatement("SELECT id, update_time FROM user_info WHERE update_time BETWEEN ? AND ?")) {
            Timestamp startOfDay = Timestamp.valueOf(LocalDate.now().atStartOfDay());
            Timestamp endOfDay = Timestamp.valueOf(LocalDateTime.now().withHour(23).withMinute(59).withSecond(59));

            // 设置参数
            preparedStatement.setTimestamp(1, startOfDay);
            preparedStatement.setTimestamp(2, endOfDay);
            // 执行查询
            ResultSet resultSet = preparedStatement.executeQuery();

            // 处理结果集
            while (resultSet.next()) {
                int id = resultSet.getInt("id");
                Timestamp updateTime = resultSet.getTimestamp("update_time");
                System.out.println("ID: " + id + ", Update Time: " + updateTime);
            }
        }

        connection.close();
    }
}
```

## 现象

没有任何报错，但是同时也没有任何结果。

一开始以为是写错了，但是把 where 条件去掉，发现数据就可以正常返回。

猜测最可能的原因应该是类型匹配，导致底层直接被忽略掉了？

这种也不报错，真的麻烦。

# v2-可行的方式1

## java

```java
// 执行SQL查询
try (PreparedStatement preparedStatement = connection.prepareStatement("SELECT id, update_time FROM user_info WHERE update_time BETWEEN TIMESTAMP '2024-03-2100:00:00' AND TIMESTAMP '2024-03-21 23:59:59'")) {
    // 执行查询
    ResultSet resultSet = preparedStatement.executeQuery();
    // 处理结果集
    while (resultSet.next()) {
        int id = resultSet.getInt("id");
        Timestamp updateTime = resultSet.getTimestamp("update_time");
        System.out.println("ID: " + id + ", Update Time: " + updateTime);
    }
}
```

这种写法是可行的。

# v3-可行方案2

TIMESTAMPADD 计算

```java
// 执行SQL查询
try (PreparedStatement preparedStatement = connection.prepareStatement("SELECT id, update_time FROM user_info WHERE update_time BETWEEN TIMESTAMPADD(MINUTE,-30, CURRENT_TIMESTAMP) AND CURRENT_TIMESTAMP")) {
    // 执行查询
    ResultSet resultSet = preparedStatement.executeQuery();
    // 处理结果集
    while (resultSet.next()) {
        int id = resultSet.getInt("id");
        Timestamp updateTime = resultSet.getTimestamp("update_time");
        System.out.println("ID: " + id + ", Update Time: " + updateTime);
    }
}
```

# v4-可行版本 CAST

## java 代码

```java
// 执行SQL查询
try (PreparedStatement preparedStatement = connection.prepareStatement("SELECT id, update_time FROM user_info WHERE update_time BETWEEN CAST(? AS TIMESTAMP) ANDCAST(? AS TIMESTAMP)")) {

    // 获取当前时间和当天的开始时间
    Timestamp startOfDay = Timestamp.valueOf(LocalDate.now().atStartOfDay());
    Timestamp endOfDay = Timestamp.valueOf(LocalDateTime.now().withHour(23).withMinute(59).withSecond(59));
    // 设置参数
    preparedStatement.setString(1, startOfDay.toString());
    preparedStatement.setString(2, endOfDay.toString());
    // 执行查询
    ResultSet resultSet = preparedStatement.executeQuery();
    // 处理结果集
    while (resultSet.next()) {
        int id = resultSet.getInt("id");
        Timestamp updateTime = resultSet.getTimestamp("update_time");
        System.out.println("ID: " + id + ", Update Time: " + updateTime);
    }

}
```

最后还是决定用 v4 CAST 的方式，可能这个更加接近原来的占位符的方式。


# 参考资料

https://blog.csdn.net/a17816876003/article/details/125592222

* any list
{:toc}
---
layout: post
title: 数据库统一查询方案介绍-03-jdbc 查询的一些基础知识 如何获取结果列数量、名称、别称
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, sh]
published: true
---

# 拓展阅读

[calcite简介和使用 quick-sql 查询](https://juejin.cn/post/7174718990818738236)

# 背景

有时候我们通过 jdbc 查询数据，希望拿到一些基本的信息。

# mysql 数据

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

# java 代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.alibaba.druid.pool.DruidDataSource;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * druid 整合 mysql 使用
 */
public class DruidMySQLExampleResult {

    public static void main(String[] args) {
        // 初始化 Druid 数据源
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("admin");
        dataSource.setPassword("123456");

        String sql = "select id userId, update_time  userUpdateTime, name from user_info";
        try (PreparedStatement preparedStatement = dataSource.getConnection().prepareStatement(sql)) {
            // 执行查询
            ResultSet resultSet = preparedStatement.executeQuery();

            // 共计返回列数
            int count = resultSet.getMetaData().getColumnCount();

            // 处理结果集
            while (resultSet.next()) {
                for(int i = 1; i <= count; i++) {
                    Object value = resultSet.getObject(i);

                    String columnName = resultSet.getMetaData().getColumnName(i);
                    String columnLabel = resultSet.getMetaData().getColumnName(i);

                    System.out.println(columnName+","+columnLabel+","+value);
                }

                System.out.println("\r\n");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
```

效果：

```
id,id,1
update_time,update_time,2024-03-21 17:26:45.0
name,name,u-1


id,id,2
update_time,update_time,2024-03-21 17:26:46.0
name,name,u-2
```


# chat

## Q: 这个名称是固定的，我希望知道有哪些别名。

要知道ResultSet中包含的列的别名，你可以使用ResultSetMetaData对象。

ResultSetMetaData对象提供了关于ResultSet中列的元数据信息，包括列的数量、名称、类型等。

下面是一个示例代码，演示如何使用ResultSetMetaData来获取列的别名：

```java
try (Statement statement = connection.createStatement()) {
    ResultSet resultSet = statement.executeQuery("SELECT status AS logStatus, user_id AS userId FROM log");

    // 获取ResultSet的元数据
    ResultSetMetaData metaData = resultSet.getMetaData();
    int columnCount = metaData.getColumnCount();

    // 遍历元数据，获取列的别名
    for (int i = 1; i <= columnCount; i++) {
        String columnName = metaData.getColumnLabel(i); // 获取列的别名
        System.out.println("Column " + i + " Alias: " + columnName);
    }
}
```

在这个示例中，我们使用`getColumnLabel(int column)`方法来获取列的别名。这样就能够遍历所有列，获取它们的别名，并打印出来。

## Q: metaData.getColumnName(i) 获取的是什么？

`metaData.getColumnName(i)`方法用于获取ResultSetMetaData对象中第i列的列名。列名是指在SQL查询中指定的列的名称，而不是别名。

例如，如果你的SQL查询是这样的：`SELECT status AS logStatus, user_id AS userId FROM log`，那么`status`和`user_id`是列的名称，`logStatus`和`userId`是别名。

所以，`metaData.getColumnName(i)`会返回列的名称，而`metaData.getColumnLabel(i)`会返回别名。

## Q: 如果查询没指定 AS 别名，getColumnLabel(int column) 会返回什么？

如果查询中没有指定AS别名，那么`getColumnLabel(int column)`方法将会返回列的名称。

在SQL查询中，列名是指查询结果中的列的标识，如果没有为列指定别名，那么列名就是默认的标识。

例如，如果你的SQL查询是这样的：`SELECT status, user_id FROM log`，那么`status`和`user_id`就是列的名称，如果调用`getColumnLabel(1)`，它将返回`"status"`，调用`getColumnLabel(2)`，它将返回`"user_id"`。

当没有指定别名时，`getColumnLabel(int column)`会返回列的名称，而`getColumnName(int column)`也会返回相同的结果，因为在这种情况下，列的名称就是其标识。




# 参考资料


* any list
{:toc}
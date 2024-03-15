---
layout: post
title:  alibaba druid-01-intro 数据库连接池入门介绍
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# dbcp 系列

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)


# Apache druid

Druid是Java语言中最好的数据库连接池。Druid能够提供强大的监控和扩展功能。

# 快速开始

## maven 

```xml
<dependency>
     <groupId>com.alibaba</groupId>
     <artifactId>druid</artifactId>
     <version>1.2.15</version>
</dependency>
```

## 配置

DruidDataSource大部分属性都是参考DBCP的，如果你原来就是使用DBCP，迁移是十分方便的。

```xml
 <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource" init-method="init" destroy-method="close"> 
     <property name="url" value="${jdbc_url}" />
     <property name="username" value="${jdbc_user}" />
     <property name="password" value="${jdbc_password}" />

     <property name="filters" value="stat" />

     <property name="maxActive" value="20" />
     <property name="initialSize" value="1" />
     <property name="maxWait" value="6000" />
     <property name="minIdle" value="1" />

     <property name="timeBetweenEvictionRunsMillis" value="60000" />
     <property name="minEvictableIdleTimeMillis" value="300000" />

     <property name="testWhileIdle" value="true" />
     <property name="testOnBorrow" value="false" />
     <property name="testOnReturn" value="false" />

     <property name="poolPreparedStatements" value="true" />
     <property name="maxOpenPreparedStatements" value="20" />

     <property name="asyncInit" value="true" />
 </bean>
```

这个是 spring 的配置，其实配置上就是一个 POJO


# 实战例子

## mysql 数据准备

### 建表语句

```sql
use test;

CREATE TABLE "users" (
  "id" int(11) NOT NULL,
  "username" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8 |
```

### 插入数据

```sql
insert into users (id, username, email) values (1, 'u-1', '1@email.com');
insert into users (id, username, email) values (2, 'u-2', '2@email.com');
insert into users (id, username, email) values (3, 'u-3', '3@email.com');
```

### 数据确认：

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

## 数据库准备

## maven 引入

```xml
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
```

## 入门代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.alibaba.druid.pool.DruidDataSource;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * druid 整合 mysql 使用
 * @author 老马啸西风
 */
public class DruidMySQLExample {

    public static void main(String[] args) {
        // 初始化 Druid 数据源
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUsername("admin");
        dataSource.setPassword("123456");

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            // 从连接池获取数据库连接
            conn = dataSource.getConnection();

            // 创建 Statement 对象
            stmt = conn.createStatement();

            // 执行 SQL 查询
            rs = stmt.executeQuery("SELECT * FROM users");

            // 遍历结果集
            while (rs.next()) {
                // 处理每一行数据
                int id = rs.getInt("id");
                String username = rs.getString("username");
                String email = rs.getString("email");
                // 输出到控制台
                System.out.println("ID: " + id + ", username: " + username+ ", email: " + email);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // 关闭资源
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

}
```

输出如下：

```
ID: 1, username: u-1, email: 1@email.com
ID: 2, username: u-2, email: 2@email.com
ID: 3, username: u-3, email: 3@email.com
```

# chat

## 介绍一下 alibaba 的连接池  druid

阿里巴巴的连接池 Druid 是一款高性能的开源数据库连接池，专为大数据场景下的数据库访问而设计。它提供了许多功能强大的特性，使得数据库连接管理更加可靠、高效。

以下是 Alibaba Druid 连接池的一些关键特性和功能：

1. **高性能**：Druid 连接池被设计为高性能的连接池，具有优秀的连接获取、归还速度以及低延迟的特点，能够满足高并发的数据库访问需求。

2. **实时监控**：Druid 连接池提供了丰富的实时监控功能，能够实时地监控连接池的状态、性能指标以及数据库访问情况，帮助用户及时发现和解决潜在的问题。

3. **连接池扩展**：Druid 连接池支持连接池的动态扩展和收缩，能够根据实际的数据库访问负载自动调整连接池的大小，提高资源利用率。

4. **SQL防火墙**：Druid 连接池内置了 SQL 防火墙功能，能够对用户提交的 SQL 进行实时的安全检查和过滤，防止 SQL 注入等安全问题。

5. **连接泄漏检测**：Druid 连接池能够检测连接的泄漏情况，及时发现并处理连接未正确关闭的情况，防止因连接泄漏导致的数据库资源浪费和性能下降。

6. **完善的统计功能**：Druid 连接池提供了丰富的统计功能，能够统计连接池的使用情况、性能指标以及数据库访问情况，帮助用户深入了解数据库访问的情况。

7. **多数据源支持**：Druid 连接池支持多种类型的数据库，包括 MySQL、Oracle、PostgreSQL 等，能够灵活适应不同类型的数据库访问需求。

总的来说，阿里巴巴的连接池 Druid 是一款功能强大、性能优越的数据库连接池，具有高性能、实时监控、连接池扩展、SQL 防火墙等特点，能够帮助用户更加可靠、高效地管理数据库连接。

## 为什么 druid 性能更好？和 commons dbcp 相比做了哪些优化？

Druid 相对于 Commons DBCP（Apache Commons Database Connection Pool）在性能上有一些优势，这主要得益于以下几个方面的优化：

1. **连接池管理**：
   - **懒加载**：Druid 连接池在初始化时并不会创建大量连接，而是等待第一次请求到来时才进行连接的初始化，这种懒加载的方式减少了初始资源的消耗。
   - **连接复用**：Druid 连接池会尝试尽量复用已经存在的连接，减少了连接的创建和销毁次数，提高了性能。
   - **连接验证**：Druid 连接池会对连接进行健康检查，确保连接的可用性，避免了将无效的连接放入池中，提高了连接的质量。

2. **性能优化**：
   - **连接池统计**：Druid 连接池内置了丰富的统计功能，可以实时监控连接池的状态和性能指标，帮助用户及时发现和解决潜在的性能问题。
   - **异步初始化**：Druid 连接池支持异步初始化连接，可以在后台线程中初始化连接，不会阻塞主线程，提高了连接池的初始化速度。

3. **安全性优化**：
   - **SQL 防火墙**：Druid 连接池内置了 SQL 防火墙功能，可以对用户提交的 SQL 进行安全检查和过滤，避免了 SQL 注入等安全问题。

4. **灵活性优化**：
   - **自定义配置**：Druid 连接池提供了丰富的配置选项，用户可以根据自己的需求进行灵活的配置，以达到最佳的性能和资源利用率。

总的来说，Druid 相对于 Commons DBCP 在性能优化、连接管理、安全性和灵活性等方面做了很多优化，提高了数据库连接池的性能和可靠性。

因此，对于大型或高并发的数据库访问场景，使用 Druid 连接池可能会获得更好的性能表现。






# 参考资料

https://github.com/alibaba/druid/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98

https://github.com/alibaba/druid/wiki/%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98

* any list
{:toc}
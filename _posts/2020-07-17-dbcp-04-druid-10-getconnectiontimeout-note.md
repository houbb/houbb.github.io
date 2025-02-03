---
layout: post
title: alibaba druid-10-oracle 域名切库，但是遇到获取链接超时异常 connection 的 getConnectionTimeoutException
date: 2024-03-27 21:01:55 +0800
categories: [Database]
tags: [database, jdbc, sh]
published: true
---

# 现象

有一个数据库的 SQL 执行引擎系统。

涉及到的数据库源较多，定时执行以下 SQL，有些 SQL 一分钟左右执行一次。

近期，发现 oracle 数据库备库切换 ip 的时候，已经切换完成了，但是系统还是长时间会出现异常。

且有多台机器存在这个问题，重启后问题解决。

## 排查过程

首先下流量， jstack 获取堆栈信息，然后服务重启。

发现堆栈日志在 getConnection 时等待，同时观察 CAT 发现等待了 20 分钟才释放资源。

初步猜测，原因是 getConnection 超时时间过长。

## 代码排查

发现 oracle 时，原来默认的 connectProperties 应该没生效。

数据实在 `dataSource.setMaxWait(600000);` 只在这里默认设置了 10min 种的超时时间，导致初始化释放特别慢，卡主相同的 connection 初始化。

## 解决方式

同时降低 `dataSource.setMaxWait(60000);` 到 1min，同时设置 `getConnection(5000)`。

此时后者的优先级更高，5S 超时。

# 代码

为了更好的理解问题，这里用大概得代码，演示一下主要问题。

## maven 依赖

```xml
<dependencies>
    <!-- Druid 连接池 -->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid</artifactId>
        <version>1.2.8</version>
    </dependency>

    <!-- Oracle JDBC 驱动 -->
    <dependency>
        <groupId>com.oracle.database.jdbc</groupId>
        <artifactId>ojdbc8</artifactId>
        <version>21.1.0.0</version>
    </dependency>

    <!-- MySQL JDBC 驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.26</version>
    </dependency>
</dependencies>
```

## 常规配置

一个常规的配置如下。

```java
import com.alibaba.druid.pool.DruidDataSource;

import javax.sql.DataSource;
import java.sql.SQLException;

public class DruidConfig {

    // 配置 Oracle 数据源
    public static DataSource getOracleDataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setUrl("jdbc:oracle:thin:@localhost:1521:orcl");  //url
        dataSource.setUsername("your_oracle_username");  //username
        dataSource.setPassword("your_oracle_password"); // password
        dataSource.setDriverClassName("oracle.jdbc.driver.OracleDriver"); // 驱动

        // 其他 Druid 配置
        dataSource.setInitialSize(5);
        dataSource.setMinIdle(5);
        dataSource.setMaxActive(20);
        dataSource.setMaxWait(60000);
        dataSource.setTimeBetweenEvictionRunsMillis(60000);
        dataSource.setMinEvictableIdleTimeMillis(300000);
        dataSource.setValidationQuery("SELECT 1 FROM DUAL");
        dataSource.setTestWhileIdle(true);
        dataSource.setTestOnBorrow(false);
        dataSource.setTestOnReturn(false);

        try {
            dataSource.init();
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return dataSource;
    }
}
```

获取链接：

```java
datasource.getConnection();
```

## 如何设置 getConnection 的超时时间？

在使用 Druid 连接池时，可以通过配置 maxWait 参数来设置 getConnection 的超时时间。

maxWait 表示从连接池中获取连接的最大等待时间（单位为毫秒）。

如果超过这个时间还没有获取到连接，Druid 会抛出 SQLException。

```java
DruidDataSource dataSource = new DruidDataSource();
//...
// 设置获取连接的超时时间为 5 秒（5000 毫秒）
dataSource.setMaxWait(5000);
```

获取链接

```java
try (Connection conn = dataSource.getConnection()) {
    System.out.println("Connection obtained successfully!");
} catch (SQLException e) {
    System.err.println("Failed to get connection: " + e.getMessage());
}
```

## dataSource.getConnection(long maxWaitMills) 设置超时和 dataSource.setMaxWait(long) 二者的优先级是什么样的？

getConnection(long maxWaitMillis) 的优先级高于 setMaxWait(long)。

如果调用 getConnection(long maxWaitMillis) 时传入了超时时间，则以传入的值为准。

如果没有传入超时时间，则使用 setMaxWait 设置的全局值。

如果既没有调用 getConnection(long maxWaitMillis)，也没有设置 setMaxWait，则 Druid 的默认行为是无限等待（maxWait 默认值为 -1）。

## 解决方式

同时降低 `dataSource.setMaxWait(60000);` 到 1min，同时设置 `getConnection(5000)`。

此时后者的优先级更高，5S 超时。

目前观察中，保证历史功能不受影响。

# 参考资料

https://www.jianshu.com/p/dd9313af62de

* any list
{:toc}

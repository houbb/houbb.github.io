---
layout: post
title: alibaba druid-04-apache druid v1.2.5 mysql 报错 discard long time none received connection
date: 2024-03-27 21:01:55 +0800
categories: [Database]
tags: [database, jdbc, sh]
published: true
---

# 报错

```
discard long time none received connection
```

经过排查发现是Druid版本导致的异常，在1.2.2及以前版本并未出现如此异常。

而在其以上版本均存在此问题，下面就来分析一下异常原因及解决方案。

## 结论

在使用 Apache Druid 版本 1.2.5 的时候，有用户报告了 "discard long time none received connection" 的错误。

这个问题似乎是一个已知的警告，它通常不会影响程序的运行，但是可能会影响性能。这个问题通常是由于连接长时间没有接收到数据而被连接池丢弃。

解决这个问题的方法之一是修改 Druid 连接池的配置。

一个常见的解决方案是设置 `druid.mysql.usePingMethod=false`，这样可以避免使用 MySQL 的 ping 方法来验证空闲连接，而是使用 `select 1` 来刷新时间，从而避免连接因为超过设定的空闲时间而被丢弃。

这个配置可以通过在运行参数中添加 `-Ddruid.mysql.usePingMethod=false` 来实现，或者在项目的 Druid 配置类中设置相应的系统属性。

此外，还有其他的解决方法，比如调整数据库的空闲等待时间、禁用 Druid 连接池的空闲检查、更新 Druid 版本或使用其他数据源配置。

# 源码分析

这段异常，可以看一下源码。

DruidAbstractDataSource#testConnectionInternal

```java
if (validConnectionChecker != null) {
    boolean valid = validConnectionChecker.isValidConnection(conn, validationQuery, validationQueryTimeout);
    long currentTimeMillis = System.currentTimeMillis();
    if (holder != null) {
        holder.lastValidTimeMillis = currentTimeMillis;
        holder.lastExecTimeMillis = currentTimeMillis;
    }

    if (valid && isMySql) { // unexcepted branch
        long lastPacketReceivedTimeMs = MySqlUtils.getLastPacketReceivedTimeMs(conn);
        if (lastPacketReceivedTimeMs > 0) {
            long mysqlIdleMillis = currentTimeMillis - lastPacketReceivedTimeMs;
            if (lastPacketReceivedTimeMs > 0 //
                    && mysqlIdleMillis >= timeBetweenEvictionRunsMillis) {
                discardConnection(holder);
                String errorMsg = "discard long time none received connection. "
                        + ", jdbcUrl : " + jdbcUrl
                        + ", version : " + VERSION.getVersionNumber()
                        + ", lastPacketReceivedIdleMillis : " + mysqlIdleMillis;
                LOG.warn(errorMsg);
                return false;
            }
        }
    }

   //...
}
```

版本再高一些，可能这里的级别直接是 Log.error

# 网上大部分的解决办法

是从 `boolean valid = validConnectionChecker.isValidConnection(conn, validationQuery, validationQueryTimeout);` 入手的。

参见实现 `MySqlValidConnectionChecker` 类。

```java
public boolean isValidConnection(Connection conn,
                                     String validateQuery,
                                     int validationQueryTimeout) throws Exception {
        if (conn.isClosed()) {
            return false;
        }

        // debug 会发现这里默认为 true，会导致下面的 validateQuery 走不到。
        if (usePingMethod) {
            if (conn instanceof DruidPooledConnection) {
                conn = ((DruidPooledConnection) conn).getConnection();
            }

            if (conn instanceof ConnectionProxy) {
                conn = ((ConnectionProxy) conn).getRawObject();
            }

            if (clazz.isAssignableFrom(conn.getClass())) {
                if (validationQueryTimeout <= 0) {
                    validationQueryTimeout = DEFAULT_VALIDATION_QUERY_TIMEOUT;
                }

                try {
                    ping.invoke(conn, true, validationQueryTimeout * 1000);
                } catch (InvocationTargetException e) {
                    Throwable cause = e.getCause();
                    if (cause instanceof SQLException) {
                        throw (SQLException) cause;
                    }
                    throw e;
                }
                return true;
            }
        }

        String query = validateQuery;
        if (validateQuery == null || validateQuery.isEmpty()) {
            query = DEFAULT_VALIDATION_QUERY;
        }

        Statement stmt = null;
        ResultSet rs = null;
        try {
            stmt = conn.createStatement();
            if (validationQueryTimeout > 0) {
                stmt.setQueryTimeout(validationQueryTimeout);
            }
            rs = stmt.executeQuery(query);
            return true;
        } finally {
            JdbcUtils.close(rs);
            JdbcUtils.close(stmt);
        }

    }
```

## usePingMethod 是如何配置的？

初始化构造器

```java
public MySqlValidConnectionChecker(boolean usePingMethod) {
    try {
        //...


        if (clazz != null) {
            ping = clazz.getMethod("pingInternal", boolean.class, int.class);
        }
        if (ping != null && usePingMethod == true) {
            this.usePingMethod = true;
        }
    } catch (Exception e) {
        LOG.warn("Cannot resolve com.mysql.jdbc.Connection.ping method.  Will use 'SELECT 1' instead.", e);
    }
    configFromProperties(System.getProperties());
}
```

属性配置 configFromProperties

```java
public void configFromProperties(Properties properties) {
    if (properties == null) {
        return;
    }

    String property = properties.getProperty("druid.mysql.usePingMethod");
    if ("true".equals(property)) {
        setUsePingMethod(true);
    } else if ("false".equals(property)) {
        setUsePingMethod(false);
    }
}
```

所以我们把 `druid.mysql.usePingMethod` 这个系统属性指定为 false 就可以让 mysql 不再使用 ping 模式。

## 指定系统变量方式

第一，在启动程序时在运行参数中增加：`-Ddruid.mysql.usePingMethod=false`

第二，在Spring Boot项目中，可在启动类中添加如下静态代码快：

```java
static {
    System.setProperty("druid.mysql.usePingMethod","false");
}
```

PS: 比如 springboot 项目，我们可以在 applicatio#main 方法开始指定这个属性。

第三，类文件配置。在项目的DruidConfig类中新增加：

```java
/*
* 解决druid 日志报错：discard long time none received connection:xxx
* */
@PostConstruct
public void setProperties(){
    System.setProperty("druid.mysql.usePingMethod","false");
}
```

# 为什么要清空空闲60秒以上的连接

猜测，阿里给数据库设置的数据库空闲等待时间是60秒，mysql数据库到了空闲等待时间将关闭空闲的连接，以提升数据库服务器的处理能力。

MySQL的默认空闲等待时间是8小时，就是「wait_timeout」的配置值。

如果数据库主动关闭了空闲的连接，而连接池并不知道，还在使用这个连接，就会产生异常。

# 其他

发现把这个禁用之后，会出现 mysql 的另一个异常？（待确认）

似乎遇到了这个问题：

```
mysql 断线重连报错 The last packet successfully received from the server was xxxxxx milliseconds ago
```

> [MySQL 07 mysql 断线重连报错 The last packet successfully received from the server was xxxxxx milliseconds ago](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

## 一般解决方案

禁用 `druid.mysql.usePingMethod=false` 后，如果遇到 `wait_timeout` 报错，这通常意味着数据库连接因为长时间没有活动而被数据库服务器端断开了。

`wait_timeout` 是 MySQL 服务器的一个参数，用来定义一个非交互连接在没有任何活动时可以保持打开状态的最大时间。

如果连接池中的连接空闲时间超过了这个值，MySQL 会关闭这些连接。

解决这个问题，可以考虑以下几个方面：

1. **调整 MySQL 的 `wait_timeout` 参数**：增加这个参数的值，使得它大于你的应用中连接池配置的空闲时间。这样，数据库服务器就不会在连接池检测之前关闭连接。

2. **调整 Druid 连接池的配置**：可以调整 `maxEvictableIdleTimeMillis` 参数，这个参数定义了连接池中连接的最大空闲时间。确保这个值小于 MySQL 的 `wait_timeout` 值。

3. **使用 `testWhileIdle` 属性**：设置 `testWhileIdle=true` 可以在连接池尝试使用连接之前进行有效性检查。如果检测到连接已经断开，Druid 会尝试从连接池中获取另一个连接。

4. **使用 `timeBetweenEvictionRunsMillis` 参数**：这个参数定义了进行空闲连接检查的频率。适当调整这个值，可以确保连接池中的空闲连接不会超过 `wait_timeout` 时间。

5. **使用 `KeepAlive` 配置**：Druid 新版本提供了 `KeepAlive` 参数，当设置为 `true` 时，如果核心连接空闲时间超过一定时间（默认2分钟），Druid 会执行连接检测并初始化客户端和服务端连接。

6. **升级 Druid 版本**：如果使用的是较旧版本的 Druid，考虑升级到最新稳定版本，因为新版本可能修复了与 `wait_timeout` 相关的一些问题。

根据搜索结果[^12^]，Druid 中的时间配置项很多，包括 `maxWait`、`removeAbandonedTimeout`、`validationQueryTimeout`、`timeBetweenEvictionRunsMillis`、`queryTimeout`、`transactionQueryTimeout`、`minEvictableIdleTimeMillis` 和 `maxEvictableIdleTimeMillis` 等。在配置时，需要弄清楚各个配置项的具体作用，避免盲目猜测。特别是 `removeAbandonedTimeout` 参数，它的作用是监测连接泄露，回收长时间游离在连接池之外的空闲连接，而不是简单的过期强制回收[^12^]。

# 小结

解决一个问题还是要看是否会引入其他的问题。

# 参考资料

[解决druid新版本报错 discard long time none received connection.](https://blog.csdn.net/Jason_We/article/details/113538673)

[Spring Boot集成Druid异常discard long time none received connection.](https://juejin.cn/post/6956349355041259557)

* any list
{:toc}

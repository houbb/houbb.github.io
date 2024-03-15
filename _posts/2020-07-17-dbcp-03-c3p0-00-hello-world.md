---
layout: post
title:  c3p0 数据池入门使用教程-00
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


# c3p0 是什么？

c3p0是一个易于使用的库，通过使用jdbc3规范和jdbc2的可选扩展定义的功能来扩展传统JDBC驱动程序，从而使其“企业就绪”。

从0.9.5版开始，c3p0完全支持jdbc4规范。

特别是c3p0提供了一些有用的服务：

一个类，它使传统的基于DriverManager的JDBC驱动程序适应最新的javax.sql.DataSource方案，以获取数据库连接。

DataSources后面的Connection和PreparedStatement的透明池可以“包装”传统驱动程序或任意非池化DataSources。

该库尽力使细节正确：

c3p0数据源既可引用也可序列化，因此适合绑定到各种基于JNDI的命名服务。

检入池中的Connections和Statements时，会仔细清理Statement和ResultSet，以防止客户端使用仅清理其Connections的惰性但常见的资源管理策略时资源耗尽。

该库采用JDBC 2和3规范定义的方法（即使这些与库作者的首选项冲突）。

数据源以JavaBean样式编写，提供了所有必需和大多数可选属性（以及一些非标准属性）以及无参数构造函数。

实现了所有JDBC定义的内部接口（ConnectionPoolDataSource，PooledConnection，生成ConnectionEvent的Connection等）。

您可以将c3p0类与兼容的第三方实现混合使用（尽管并非所有c3p0功能都可以与ConnectionPoolDataSource的外部实现一起使用）。

c3p0希望提供的数据源实现不适合大批量“ J2EE企业应用程序”使用。请提供反馈，错误修复等！



# 入门例子

## maven 导入

```xml
<dependency>
    <groupId>com.mchange</groupId>
    <artifactId>c3p0</artifactId>
    <version>0.9.5.5</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.29</version>
</dependency>
```

## 入门代码

通过代码显式指定配置：

```java
ComboPooledDataSource source = new ComboPooledDataSource();
source.setDriverClass("com.mysql.jdbc.Driver");
source.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf-8");
source.setUser("root");
source.setPassword("123456");

//获取链接
Connection connection = source.getConnection();
System.out.println(connection.getCatalog());
```

- 日志输出

```
七月 17, 2020 4:58:21 下午 com.mchange.v2.log.MLog 
信息: MLog clients using java 1.4+ standard logging.
七月 17, 2020 4:58:22 下午 com.mchange.v2.c3p0.C3P0Registry 
信息: Initializing c3p0-0.9.5.5 [built 11-December-2019 22:18:33 -0800; debug? true; trace: 10]
七月 17, 2020 4:58:22 下午 com.mchange.v2.c3p0.impl.AbstractPoolBackedDataSource 
信息: Initializing c3p0 pool... com.mchange.v2.c3p0.ComboPooledDataSource [ acquireIncrement -> 3, acquireRetryAttempts -> 30, acquireRetryDelay -> 1000, autoCommitOnClose -> false, automaticTestTable -> null, breakAfterAcquireFailure -> false, checkoutTimeout -> 0, connectionCustomizerClassName -> null, connectionTesterClassName -> com.mchange.v2.c3p0.impl.DefaultConnectionTester, contextClassLoaderSource -> caller, dataSourceName -> 1bqqx35abpix6b312lrdzj|7bfcd12c, debugUnreturnedConnectionStackTraces -> false, description -> null, driverClass -> com.mysql.jdbc.Driver, extensions -> {}, factoryClassLocation -> null, forceIgnoreUnresolvedTransactions -> false, forceSynchronousCheckins -> false, forceUseNamedDriverClass -> false, identityToken -> 1bqqx35abpix6b312lrdzj|7bfcd12c, idleConnectionTestPeriod -> 0, initialPoolSize -> 2, jdbcUrl -> jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf-8, maxAdministrativeTaskTime -> 0, maxConnectionAge -> 0, maxIdleTime -> 30, maxIdleTimeExcessConnections -> 0, maxPoolSize -> 10, maxStatements -> 50, maxStatementsPerConnection -> 0, minPoolSize -> 2, numHelperThreads -> 3, preferredTestQuery -> null, privilegeSpawnedThreads -> false, properties -> {user=******, password=******}, propertyCycle -> 0, statementCacheNumDeferredCloseThreads -> 0, testConnectionOnCheckin -> false, testConnectionOnCheckout -> false, unreturnedConnectionTimeout -> 0, userOverrides -> {}, usesTraditionalReflectiveProxies -> false ]
test
```

## 通过配置文件

### 配置

-  c3p0-config.xml

将该配置文件，置于 resources 文件夹下。

```xml
<c3p0-config>
    <!-- 默认配置，如果没有指定则使用这个配置 -->
    <default-config>
        <property name="driverClass">com.mysql.jdbc.Driver</property>
        <property name="jdbcUrl">
            <![CDATA[jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=UTF-8]]>
        </property>
        <property name="user">root</property>
        <property name="password">123456</property>
        <!-- 初始化池大小 -->
        <property name="initialPoolSize">2</property>
        <!-- 最大空闲时间 -->
        <property name="maxIdleTime">30</property>
        <!-- 最多有多少个连接 -->
        <property name="maxPoolSize">10</property>
        <!-- 最少几个连接 -->
        <property name="minPoolSize">2</property>
        <!-- 每次最多可以执行多少个批处理语句 -->
        <property name="maxStatements">50</property>
    </default-config>
</c3p0-config>
```

### 实现

```java
ComboPooledDataSource source = new ComboPooledDataSource();

Connection connection = source.getConnection();
System.out.println(connection.getCatalog());
```

### 日志

```
七月 17, 2020 5:00:41 下午 com.mchange.v2.log.MLog 
信息: MLog clients using java 1.4+ standard logging.
七月 17, 2020 5:00:41 下午 com.mchange.v2.c3p0.C3P0Registry 
信息: Initializing c3p0-0.9.5.5 [built 11-December-2019 22:18:33 -0800; debug? true; trace: 10]
七月 17, 2020 5:00:42 下午 com.mchange.v2.c3p0.impl.AbstractPoolBackedDataSource 
信息: Initializing c3p0 pool... com.mchange.v2.c3p0.ComboPooledDataSource [ acquireIncrement -> 3, acquireRetryAttempts -> 30, acquireRetryDelay -> 1000, autoCommitOnClose -> false, automaticTestTable -> null, breakAfterAcquireFailure -> false, checkoutTimeout -> 0, connectionCustomizerClassName -> null, connectionTesterClassName -> com.mchange.v2.c3p0.impl.DefaultConnectionTester, contextClassLoaderSource -> caller, dataSourceName -> 1bqqx35abpj05mbhotd60|27082746, debugUnreturnedConnectionStackTraces -> false, description -> null, driverClass -> com.mysql.jdbc.Driver, extensions -> {}, factoryClassLocation -> null, forceIgnoreUnresolvedTransactions -> false, forceSynchronousCheckins -> false, forceUseNamedDriverClass -> false, identityToken -> 1bqqx35abpj05mbhotd60|27082746, idleConnectionTestPeriod -> 0, initialPoolSize -> 2, jdbcUrl -> jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=UTF-8, maxAdministrativeTaskTime -> 0, maxConnectionAge -> 0, maxIdleTime -> 30, maxIdleTimeExcessConnections -> 0, maxPoolSize -> 10, maxStatements -> 50, maxStatementsPerConnection -> 0, minPoolSize -> 2, numHelperThreads -> 3, preferredTestQuery -> null, privilegeSpawnedThreads -> false, properties -> {user=******, password=******}, propertyCycle -> 0, statementCacheNumDeferredCloseThreads -> 0, testConnectionOnCheckin -> false, testConnectionOnCheckout -> false, unreturnedConnectionTimeout -> 0, userOverrides -> {}, usesTraditionalReflectiveProxies -> false ]
test
```


# 参考资料

[c3p0-quickstart](https://www.mchange.com/projects/c3p0/#quickstart)

https://github.com/swaldman/c3p0

* any list
{:toc}
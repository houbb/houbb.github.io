---
layout: post
title: vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, dbcp, sh]
published: true
---

# 拓展阅读

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)


# Vibur DBCP

Vibur DBCP 是一个并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能，包括慢 SQL 查询的检测和记录、应用线程的非饥饿保证、语句缓存以及与 Hibernate 集成等特性。

该项目主页包含了对所有 Vibur 特性和配置选项的详细描述，以及与 Hibernate 和 Spring 的各种配置示例等内容。

Vibur DBCP 基于 Vibur Object Pool 构建，后者是一个通用的并发 Java 对象池。

# 介绍

Vibur 是一个使用标准 Java 并发工具完全构建的 JDBC 连接池库。它具有简洁和简单的源代码基础以及模块化设计，包括一个独立的专用对象池。

在底层，它依赖于一个简单而健壮的连接池机制，该机制是在一个由信号量保护的队列之上实现的。

Vibur DBCP 使用 Java 动态代理来创建实现 JDBC API 接口的对象。这些代理是 Java 自 1.3 版本以来存在的强大工具，不依赖于任何第三方字节码操作库，如 Javassist 或 cglib。动态代理允许 Vibur 选择需要实现的 JDBC 接口的方法。例如，Vibur DBCP 提供的主要 JDBC 接口共有约 480 个方法；然而，少于 100 个方法的调用被明确拦截和处理，所有其他方法调用都简单地转发到它们的默认实现。这大大减少了 Vibur 需要提供所有被代理的 JDBC API 接口的静态实现所需的样板代码量。

除了通常的 JDBC 连接池功能之外，Vibur DBCP 还提供了几个高级功能，可帮助识别复杂问题并回答诸如“为什么”和“在哪里”等问题，这些问题发生在具有大量运行部件的生产系统上。此外，自版本 6.0 起，Vibur 还允许应用程序拦截和处理所有下面列出的事件（请参阅连接和方法调用挂钩设置），并在需要时提供自己的这些事件的指标和统计信息。

- 检测和记录在执行时间超过给定时间限制的所有 SQL 查询的应用程序端，例如超过 200 毫秒，包括具体的 SQL 查询参数，以及可选的从中生成查询的完整 Java 堆栈跟踪。如果存在此类日志，可以将其与数据库服务器的类似日志进行进一步匹配和比较。以下是一个应用程序生成日志的示例。
- 检测和记录所有对 DataSource.getConnection() 的调用，如果超过给定限制，例如超过 1000 毫秒。类似于上述情况，日志可能包括调用的完整堆栈跟踪。此日志有助于确定应用程序是否存在任何时期经历了某种连接饥饿，其根本原因可以进一步分析。以下是此类日志的示例。
- 在应用程序端检测和记录所有生成的 ResultSet 长度超过给定限制的 SQL 查询的执行，例如超过 500 行。再次，日志将包括具体的 SQL 查询参数，并可选择包括查询的完整 Java 堆栈跟踪。虽然检索大型 ResultSet 在某些情况下是完全有效和可取的应用程序行为，但在其他情况下，这可能是某些微妙错误的表现，其中从数据库检索大型 ResultSet，但然后应用程序仅处理其中的前几条记录，并且所有其他记录都被丢弃。类似的错误可能会对整个应用程序的性能和内存消耗产生不利影响。
- Vibur 6.0 及更高版本引入了几个编程挂钩，通过这些挂钩，应用程序可以拦截并为重要的连接生命周期事件提供自定义行为，例如初始连接创建或从池中获取和返回连接。这些挂钩不仅可以访问发生的事件，还可以访问与这些事件相关联的时间信息。应用程序还可以注册拦截对不同 JDBC 对象/接口的方法调用的挂钩，如果需要的话。

Vibur DBCP 自 2012 年末以来一直处于活跃开发状态，至今已经发布了超过 30 个版本，并在许多大型 Web 应用程序中进行了生产部署。


# 主要特点一览

- 确保没有线程会被排除在访问 JDBC 连接池连接之外。参见 poolFair 配置参数。
- 检测和记录慢 SQL 查询、大于预期的 ResultSet 和持续时间较长的 getConnection() 方法调用。查看相关的配置属性 这里 和 这里。
- 支持 Hibernate 3.6、4.x 和 5.x 的集成。
- 对 JDBC Statement（Prepared 和 Callable）进行缓存支持。
- 使用标准 Java 并发工具和动态代理构建，不使用任何 synchronized 块或方法。
- Vibur DBCP 需要 Java 1.6+，并且仅有以下外部依赖项：其专用对象池、slf4j/log4j 和 ConcurrentLinkedHashMap。CLHM 依赖项是可选的，只有在启用/使用 JDBC Statement 缓存时，应用程序才需要提供它。

# 其他特点

- 智能池大小调整 - 根据最近使用的连接数量的启发式方法，可以减少 JDBC 池中的空闲连接数量。
- 支持验证间隔；即，在每次使用之前，从 JDBC 池获取的连接并不会被验证，只有在连接上一次使用后经过一定时间后才会进行验证。
- 可以通过调用代理的 unwrap 方法从相应的代理对象中检索原始 JDBC 连接或 Statement 对象。
- 为当前获取的所有 JDBC 连接提供记录（通过 JMX 或日志文件），包括它们被获取时的堆栈跟踪；如果调试丢失/未关闭的连接或者应用程序想知道当前所有连接的来源，这将非常有用。
- JMX 支持 - 池注册了一个 MBean，通过它可以观察和/或设置各种池参数。

# 代码度量和性能结果

下面的源代码度量不考虑项目的测试目录，以及每个源文件顶部的 Apache 许可证注释头部分。

| 项目             | 源文件数 | 代码行数 |
|-----------------|---------|----------|
| Vibur DBCP      | 32      | 约 4.8K   |
| Vibur Object Pool | 14      | 约 1.2K   |

下面的性能结果是通过在具有 Intel i7-4702MQ 2.2GHz 处理器的机器上运行 Java 1.8.0_151，在 Ubuntu 16.04 上运行此测试而获得的。

该测试使用了 500 个线程，每个线程尝试从初始大小为 50，最大大小为 200 的池中进行 100 次获取/还原操作。

每个线程通过调用 Thread.sleep() 来模拟 2 或 5 毫秒的工作，并且池的公平参数设置如下表所示。执行时间是三次连续运行的平均值。

| 池公平性        | 模拟工作时间 | 执行时间   |
|-----------------|-------------|------------|
| true            | 2 毫秒       | 955 毫秒   |
| false           | 2 毫秒       | 1003 毫秒  |
| true            | 5 毫秒       | 1714 毫秒  |
| false           | 5 毫秒       | 1816 毫秒  |

# Maven 依赖项

Vibur 工件坐标和如何从源代码构建

```xml
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp</artifactId>
  <version>25.0</version>
</dependency>
```

要获取 Vibur DBCP 仓库的本地副本，请使用以下命令：

```
git clone https://github.com/vibur/vibur-dbcp.git
```

如果需要，可以通过类似以下的方式检出特定标签：

```
git checkout tags/25.0
```

Vibur DBCP 用于单元/集成测试目的的是一个内存中的 HyperSQL 数据库，并且构建源代码只需要执行：

```
mvn clean install
```

# Hibernate 3.6/4.x/5.x 集成工件

Vibur DBCP 提供了 Hibernate 3.6、Hibernate 4.x 和 Hibernate 5.x 的集成（有关 5.x 的更多细节请参见下文）。

根据项目使用的 Hibernate 版本，添加以下其中一个 Maven 依赖项。请注意，这些依赖项也会传递包含上述 vibur-dbcp 依赖。

Vibur 通过以下 vibur-dbcp-hibernate5 模块提供了 Hibernate 5.0 集成。由于某些 Hibernate 接口的更改，Vibur 没有提供与 Hibernate 5.1 和 5.2 的集成。

然而，自 Hibernate 5.3 起，Vibur 集成已作为标准 Hibernate ORM 分发的一部分包含在 hibernate-vibur 模块中，请参见下文。

希望使用 Vibur 作为底层连接提供程序的 Hibernate 5.1 和 5.2 用户需要升级到 Hibernate 5.3（或更高版本），或者需要将 Hibernate 5.3 中的 Vibur 集成源码调整并包含到他们自己的项目中。

```xml
<!-- 对于 Hibernate 5.3+ 项目： -->
<dependency>
  <groupId>org.hibernate</groupId>
  <artifactId>hibernate-vibur</artifactId>
  <!-- 请注意，此依赖项将传递包含 vibur-dbcp-25.0 依赖。如果需要不同版本的 vibur-dbcp，
       则需要在应用程序中明确指定该版本的依赖项。 -->
  <!-- 这里的 X 是应用程序使用的确切 Hibernate 5.3 版本，
       Designator 通常是单词 Final（或类似 Beta1 或 CR1）。 -->
  <version>5.3.X.Designator</version>
</dependency>
```

请注意，在 Vibur DBCP 发布 21.2 后，下面的 vibur-dbcp-hibernateXYZ Maven 工件不再更新。

这些工件仍可用于将 Vibur DBCP 与 Hibernate 版本 3.6、4.0-4.3 和 5.0 集成，但用户应用程序需要添加对具体（不同于 21.2）版本的 Vibur DBCP 的显式依赖。

```xml
<!-- 对于 Hibernate 5.0 项目： -->
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp-hibernate5</artifactId>
  <version>21.2</version> <!-- 不再更新，请参见上文 -->
</dependency>
<!-- 对于 Hibernate 4.3 项目： -->
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp-hibernate4</artifactId>
  <version>21.2</version> <!-- 不再更新，请参见上文 -->
</dependency>
<!-- 对于 Hibernate 4.0-4.2 项目： -->
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp-hibernate4-012</artifactId>
  <version>21.2</version> <!-- 不再更新，请参见上文 -->
</dependency>
<!-- 对于 Hibernate 3.6 项目： -->
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp-hibernate3</artifactId>
  <version>21.2</version> <!-- 不再更新，请参见上文 -->
</dependency>
```

# Setting Up Connection Pooling - Vibur DBCP

## Hibernate 3.6/4.x/5.x Configuration Snippet

```xml
<hibernate-configuration>
  <session-factory>
    <!-- Database connection settings: -->
    <property name="hibernate.connection.url">jdbc:hsqldb:mem:sakila;shutdown=false</property>
    <property name="hibernate.connection.username">sa</property>
    <property name="hibernate.connection.password"></property>

    <property name="hibernate.dialect">org.hibernate.dialect.HSQLDialect</property>

    <property name="hibernate.current_session_context_class">thread</property>

    <!-- Vibur DBCP specific properties: -->
    <property name="hibernate.connection.provider_class">
        org.vibur.dbcp.integration.ViburDBCPConnectionProvider
    </property>

    <property name="hibernate.vibur.poolInitialSize">10</property>
    <property name="hibernate.vibur.poolMaxSize">100</property>

    <property name="hibernate.vibur.connectionIdleLimitInSeconds">30</property>
    <property name="hibernate.vibur.testConnectionQuery">isValid</property>

    <property name="hibernate.vibur.logQueryExecutionLongerThanMs">500</property>
    <property name="hibernate.vibur.logStackTraceForLongQueryExecution">true</property>

    <property name="hibernate.vibur.statementCacheMaxSize">200</property>
  </session-factory>
</hibernate-configuration>
```

## Spring with Hibernate 3.6/4.x/5.x Configuration Snippet

```xml
<!-- Vibur DBCP dataSource bean definition: -->
<bean id="dataSource" class="org.vibur.dbcp.ViburDBCPDataSource" init-method="start" destroy-method="terminate">
   <property name="jdbcUrl" value="jdbc:hsqldb:mem:sakila;shutdown=false"/>
   <property name="username" value="sa"/>
   <property name="password" value=""/>

   <property name="poolInitialSize">10</property>
   <property name="poolMaxSize">100</property>

   <property name="connectionIdleLimitInSeconds">30</property>
   <property name="testConnectionQuery">isValid</property>

   <property name="logQueryExecutionLongerThanMs" value="500"/>
   <property name="logStackTraceForLongQueryExecution" value="true"/>

   <property name="statementCacheMaxSize" value="200"/>
</bean>

<!-- For Hibernate5 set the sessionFactory class below to org.springframework.orm.hibernate5.LocalSessionFactoryBean -->
<!-- For Hibernate4 set the sessionFactory class below to org.springframework.orm.hibernate4.LocalSessionFactoryBean -->
<bean id="sessionFactory" class="org.springframework.orm.hibernate3.LocalSessionFactoryBean">
   <property name="dataSource" ref="dataSource"/>
   <property name="packagesToScan" value="the.project.packages"/>
   <property name="hibernateProperties">
   <props>
      <prop key="hibernate.dialect">org.hibernate.dialect.HSQLDialect</prop>
      <prop key="hibernate.cache.use_second_level_cache">false</prop>
      <prop key="hibernate.cache.use_query_cache">true</prop>
   </props>
   </property>
</bean>

<!-- For Hibernate5 set the transactionManager class below to org.springframework.orm.hibernate5.HibernateTransactionManager -->
<!-- For Hibernate4 set the transactionManager class below to org.springframework.orm.hibernate4.HibernateTransactionManager -->
<bean id="transactionManager" class="org.springframework.orm.hibernate3.HibernateTransactionManager">
   <property name="sessionFactory" ref="sessionFactory"/>
</bean>
```

## Programming Configuration Snippet

```java
public DataSource createDataSourceWithStatementsCache() {
    ViburDBCPDataSource ds = new ViburDBCPDataSource();

    ds.setJdbcUrl("jdbc:hsqldb:mem:sakila;shutdown=false");
    ds.setUsername("sa");
    ds.setPassword("");

    ds.setPoolInitialSize(10);
    ds.setPoolMaxSize(100);

    ds.setConnectionIdleLimitInSeconds(30);
    ds.setTestConnectionQuery("isValid");

    ds.setLogQueryExecutionLongerThanMs(500);
    ds.setLogStackTraceForLongQueryExecution(true);

    ds.setStatementCacheMaxSize(200);

    ds.start();
    return ds;
}       
```

## Log4j Configuration Snippet

```xml
<logger name="org.vibur.dbcp" additivity="false">
    <level value="debug"/>
    <appender-ref ref="console"/>
</logger>
```

# 配置设置 - Vibur DBCP

除了下文列出的配置设置外，ViburDBCPDataSource 还支持在 ViburDataSource 接口中定义的几种非标准连接操作和跟踪方法。

连接操作方法包括 getNonPooledConnection() 和 severConnection() 方法。

前者允许从池中获取非池化/原始连接。后者允许立即关闭任何池化或非池化的连接；当在池化连接上调用 severConnection() 时，将从底层对象池中移除连接，并且也会关闭与之关联的物理 JDBC 连接。

连接跟踪方法包括 getTakenConnections() 和 getTakenConnectionsStackTraces() 方法。

前者允许检索一个数组/列表，其中包含所有当前从池中获取的连接，包括与之关联的各种计时和其他调试信息。

后者简单地返回一个字符串，其中包含所有当前获取的连接的信息，包括获取它们的线程的堆栈跟踪、线程名称和状态。

有关更多详情，请参阅 ViburDataSource 中上述方法的 javadoc。

## 池大小和公平设置 Pool Sizing and Fairness Settings

| Setting Name              | Type    | Default | Description                                                                                                     |
|---------------------------|---------|---------|-----------------------------------------------------------------------------------------------------------------|
| poolInitialSize           | int     | 5       | 池的初始大小；即，在此 JDBC 池中分配的初始连接数。                                                           |
| poolMaxSize               | int     | 50      | 池的最大大小；即，在此 JDBC 池中可以分配的最大连接数。                                                       |
| poolFair                  | boolean | true    | 如果为 true，则保证调用池的 take 方法的线程将按照先进先出（FIFO）顺序选择从中获取连接，并且没有线程会被排除在访问 JDBC 池连接之外。 |
| poolEnableConnectionTracking | boolean | false | 如果为 true，则 JDBC 连接池将保持获取的每个连接的当前堆栈跟踪信息。                                             |
| name                      | String  | "p" + 自动生成的 ID | 数据源/池的名称，主要用于 JMX 标识和 Vibur 日志分析。此名称必须在所有配置的 Vibur 池的所有名称中是唯一的。默认名称是 "p" + 自动生成的整数 ID。如果配置的名称不是唯一的，则将使用默认名称。 |

## Basic Connection Settings

| Setting Name                 | Type      | Default          | Description                                                                                                                                                                |
|------------------------------|-----------|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| driver                       | Driver    | null             | 首选配置/注入 JDBC Driver 的首选方式，通过它连接将被生成。                                                                                                                   |
| driverProperties             | Properties| null             | 将在调用 Driver.connect() 时使用的驱动程序属性。                                                                                                                            |
| driverClassName              | String    | null             | 数据库驱动程序类名。如果驱动程序符合 JDBC 4，这是一个可选参数。如果指定了，将在 Vibur DBCP 初始化期间发出对 Class.forName(driverClassName).newInstance() 的调用。当在 OSGi 容器中使用 Vibur DBCP 时，这是必需的，也可能对在将其 JDBC 驱动程序 JAR 文件打包到应用程序 WEB-INF/lib 目录中的 Apache Tomcat Web 应用程序中使用 Vibur DBCP 有帮助。如果未指定此属性，则 Vibur DBCP 将回退到标准的 JavaSE 服务提供程序机制以查找驱动程序。 |
| jdbcUrl                      | String    | Supplied by user | 数据库 JDBC 连接字符串。                                                                                                                                                     |
| username                     | String    | Supplied by user | 连接到数据库时使用的用户名。                                                                                                                                                 |
| password                     | String    | Supplied by user | 连接到数据库时使用的密码。                                                                                                                                                   |
| externalDataSource           | String    | null             | 如果指定，将使用此 externalDataSource 作为从池中获取原始连接的替代方式，而不是调用 DriverManager.getConnection()。                                                              |
| allowConnectionAfterTermination | boolean | false            | 在极少数情况下，应用程序可能需要在池被终止后从池中获取非池化连接。这可能发生在一些后缓存或应用程序关闭执行路径中。                                                                                                      |
| allowUnwrapping              | boolean   | true             | 控制池的 DataSource 和从中创建的 JDBC 对象（Connection、Statement 等）是否支持取消包装/暴露基础（代理）JDBC 对象。如果禁用，则对这些对象中的任何一个调用 Wrapper.isWrapperFor() 将始终返回 false。                                |

## 连接超时和重试设置

下面的 connectionTimeoutInMs 和 loginTimeoutInSeconds 设置与下一节中的连接验证设置密切相关。非常重要的是要注意，这些设置都不会影响适用于用户应用程序和远程数据库服务器之间的一般套接字连接和读取超时值。通常，套接字读取超时在操作系统级别设置，并且通常为 10 分钟。这意味着如果发生网络分区，应用程序可能会在数据库读取操作（例如在执行选择查询后检索数据时）上被阻塞，最多达到此超时时间。

如果应用程序希望确保在网络断开连接的情况下应用较小的超时时间（例如 30 秒），应用程序开发人员可以手动调用 setNetworkTimeout() 方法（如果具体的 JDBC 驱动程序支持），或者配置下一节中的 useNetworkTimeout 设置。应用程序还可以利用特定于驱动程序的套接字超时配置选项，这些选项通常由应用程序设置的 jdbcUrl 字符串上的 ampersand 指定。区别在于 setNetworkTimeout() 方法需要在每个连接创建后显式调用，而通过驱动程序选项或通过 useNetworkTimeout 设置配置的超时时间隐含地应用于所有连接。类似驱动程序选项的示例包括 MySQL Connector/J 的 connectTimeout 和 socketTimeout，以及 PostgreSQL 的 pgjdbc 驱动程序的 loginTimeout、connectTimeout 和 socketTimeout 选项。

| Setting Name             | Type  | Default | Description                                                                                                                                                                                                                                                            |
|--------------------------|-------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| connectionTimeoutInMs    | long  | 15000   | 在调用 DataSource.getConnection() 超时并抛出 SQLTimeoutException 之前等待的时间。更准确地说，这是在池中存在准备好和有效的连接时等待从池中获取连接的时间。0 表示永远等待。如果池中没有准备好和有效的连接，并且尚未达到最大池容量，那么调用 getConnection() 可以花费的总时间可能包括懒惰地创建新连接的时间，并且被定义为：maxTimeoutInMs = connectionTimeoutInMs + loginTimeoutInSeconds * 1000 |
| loginTimeoutInSeconds    | int   | 5       | 登录超时，在 DataSource 初始化过程中将传递给 DriverManager.setLoginTimeout() 或 getExternalDataSource().setLoginTimeout() 方法。                                                                                                                                      |
| acquireRetryDelayInMs    | long  | 500     | 在作为 DataSource.getConnection() 流的一部分尝试懒惰地创建 JDBC 连接并因 SQLException 失败后，再次尝试之前等待的时间。                                                                                                                                           |
| acquireRetryAttempt      | int   | 3       | 在作为 DataSource.getConnection() 流的一部分尝试懒惰地创建 JDBC 连接并因 SQLException 失败后，在放弃之前最多重试的次数。                                                                                                                                       |

## Connection Validation Settings

| Setting Name                  | Type      | Default | Description                                                                                                                                                                                                                                                                                              |
|-------------------------------|-----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| connectionIdleLimitInSeconds | int       | 5       | 如果连接在 JDBC 池中保持了至少 connectionIdleLimitInSeconds，它将在交给应用程序之前使用 testConnectionQuery 进行验证。如果设置为 0，则将始终验证从池中获取的连接。如果设置为负数，则永远不会验证从池中获取的连接。具有严格要求和期望的应用程序，即在获取时 JDBC 连接来自池时，它在检查时是有效的的应用程序可能会受益于将 connectionIdleLimitInSeconds 的值减少到 1 秒。将值设置为 0 应该谨慎进行，因为每个连接验证都需要额外的一次返回到数据库的行程。另请参见连接超时和重试设置部分的简介段落。 |
| validateTimeoutInSeconds      | int       | 3       | 当从池中获取的 JDBC 连接在使用之前验证时，或者当执行 initSQL（如果指定）时，将传递给对 testConnectionQuery 的调用的超时时间。0 表示没有限制。                                                                                                                                                          |
| testConnectionQuery          | String    | isValid | 用于测试 JDBC 连接的有效性。如果 connectionIdleLimitInSeconds 设置为非负数，则 testConnectionQuery 应设置为有效的 SQL 查询；例如，SELECT 1 或 isValid，在这种情况下，将使用 Connection.isValid() 方法。类似于 Connection.isValid(int) 的规范，如果指定了自定义 testConnectionQuery，则它将在当前事务的上下文中执行。需要注意的是，如果驱动程序符合 JDBC 4，强烈建议使用默认的 isValid 值，因为驱动程序通常可以使用一些临时的和非常高效的机制来积极验证给定的 JDBC 连接是否仍然有效。 |
| initSQL                       | String    | null    | 当第一次创建 JDBC 连接时仅运行一次的 SQL 查询。此属性应设置为有效的 SQL 查询、空值（表示无查询）或 isValid（表示将使用 Connection.isValid() 方法）。此属性可用的情况之一是当应用程序通过某些中间件连接到数据库时；例如，通过 PgBouncer 连接到 PostgreSQL 服务器。                                                                                   |
| useNetworkTimeout             | boolean   | false   | 此选项仅在启用 testConnectionQuery 或 initSQL 并且其中至少有一个具有与 isValid 不同的值时才适用。如果启用，则验证或初始化 SQL 查询的调用将在调用 setNetworkTimeout() 之前进行，并且然后会恢复原始的网络超时值。需要注意的是，应用程序有责任确保所使用的 JDBC 驱动程序支持 setNetworkTimeout() 方法。此外，需要配置适当的 networkTimeoutExecutor，请参见下一个配置选项。另请参见连接超时和重试设置部分的简介段落。 |
| networkTimeoutExecutor        | Executor  | null    | 此选项仅在启用 useNetworkTimeout 时适用。这是将传递给 setNetworkTimeout() 调用的 Executor。需要注意的是，应用程序有责任提供适用于具体 JDBC 驱动程序需求的 Executor。例如，某些 JDBC 驱动程序可能需要一个同步的 Executor。                                                                                                                                                        |


## Slow SQL Queries and Large ResultSets Logging Settings

| Setting Name                          | Type      | Default | Description                                                                                                                                                                                                                                                                                                                                                                                           |
|---------------------------------------|-----------|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| logQueryExecutionLongerThanMs         | long      | 3000    | 在 JDBC Statement execute... 调用中执行时间超过或等于此时间限制的底层 SQL 查询（包括它们的具体参数）将在 WARN 级别记录。值为 0 将记录所有此类调用。负数将禁用它。需要注意的是，虽然 JDBC Statement execute... 调用持续时间大致相当于底层 SQL 查询的执行时间，但总体调用持续时间也可能包括一些 Java GC 时间、JDBC 驱动程序特定的执行时间和上下文切换时间（如果应用程序具有大量线程，则上述时间可能很重要）。 |
| logStackTraceForLongQueryExecution   | boolean   | false   | 仅当启用 logQueryExecutionLongerThanMs 且设置为 true 时，将在 WARN 级别记录当前 JDBC Statement execute... 调用的堆栈跟踪。Vibur DBCP 生成的慢 SQL 查询的日志示例在此处显示。                                                                                                                                                                                                                           |
| logLargeResultSet                    | long      | 500     | 从 JDBC Statement execute... 调用中生成长度大于或等于此限制的 ResultSets 的底层 SQL 查询（包括它们的具体参数）将在 WARN 级别记录。负数将禁用它。检索大的 ResultSet 可能会对应用程序性能产生负面影响，有时可能是非常微妙的应用程序 bug 的指示，其中整个 ResultSet 被检索，但随后仅读取和处理了前几条记录。日志记录是在应用程序发出对 ResultSet.close() 方法的调用时进行的。依赖于生成它的 Statement 关闭时 ResultSet 的隐式关闭的应用程序将无法从此日志记录功能中受益。ResultSet 大小的计算是基于应用程序对 ResultSet.next() 方法的调用次数进行的。在大多数情况下，这是一种非常准确且不会产生干扰的计算 ResultSet 大小的方法，特别是在使用 Hibernate 或 Spring Framework JDBC 应用程序的情况下。但是，在一些高级情况下，应用程序通过方法（如 first()、last() 或 afterLast()）导航 ResultSet 时，此计算机制可能会产生不准确的结果。 |
| logStackTraceForLargeResultSet       | boolean   | false   | 仅当启用 logLargeResultSet 并设置为 true 时，将在 WARN 级别记录当前 ResultSet.close() 调用的堆栈跟踪。                                                                                                                                                                                                                                                                                                        |
| includeQueryParameters               | boolean   | true    | 启用或禁用 StatementExecution 钩子和 ResultSetRetrieval 钩子的具体 SQL 查询参数的收集。另请参见 logQueryExecutionLongerThanMs 和 logLargeResultSet。如果用户应用程序有特定的合规要求，则禁用参数收集可能会有用。                                                                                                                                                                                  |

## Slow getConnection() Calls and Timeouts Logging Settings

| Setting Name                      | Type     | Default | Description                                                                                                                                                                                                                                                                                                                                                                                                         |
|-----------------------------------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| logConnectionLongerThanMs         | long     | 3000    | DataSource.getConnection() 方法调用时间超过或等于此时间限制的调用将以 WARN 级别记录。值为 0 将记录所有此类调用。负数将禁用它。如果 logConnectionLongerThanMs 的值大于 connectionTimeoutInMs，则 logConnectionLongerThanMs 将设置为 connectionTimeoutInMs 的值。                                                                                                                                                                                             |
| logStackTraceForLongConnection    | boolean  | false   | 仅当启用 logConnectionLongerThanMs 并设置为 true 时，将在 WARN 级别记录当前 getConnection() 调用的堆栈跟踪。Vibur DBCP 生成的慢 getConnection() 调用的日志示例在此处显示。                                                                                                                                                                                                                              |
| logTakenConnectionsOnTimeout      | boolean  | false   | 如果设置为 true，并且已达到 connectionTimeoutInMs 并且调用 getConnection() 失败并引发 SQLTimeoutException，则将在 WARN 级别记录有关所有当前获取的连接的信息，包括获取它们的线程的堆栈跟踪（在获取它们时的时间点）、线程的名称和状态，以及这些线程的当前执行堆栈跟踪（如果它们仍然活动）。此选项意味着 poolEnableConnectionTracking 选项已启用，并且如果未显式启用该选项，则将隐式启用该选项作为此选项的处理的一部分。请注意，此选项仅应用于故障排除目的，因为它可能会生成非常大的日志输出。记录的消息的确切格式由 takenConnectionsFormatter 控制。 |
| logAllStackTracesOnTimeout       | boolean  | false   | 此选项仅在启用 logTakenConnectionsOnTimeout 且设置为 true 时生效，如果设置为 true，将在由 ViburDataSource.getTakenConnectionsStackTraces() 生成的日志中添加 JVM 中所有活动线程的当前堆栈跟踪，这些线程不持有连接。换句话说，这两个选项的组合相当于生成完整的 JVM 线程转储，因此它只能用于故障排除目的，因为它可能会生成非常大的日志输出。                                                                                                        |
| logLineRegex                      | Pattern  | null    | 如果不同于 null，则此正则表达式将与需要根据 logStackTraceForLongConnection、logStackTraceForLargeResultSet、logStackTraceForLongQueryExecution、logTakenConnectionsOnTimeout 和 logAllStackTracesOnTimeout 记录的每个堆栈跟踪行的字符串表示形式匹配。字符串表示形式匹配此正则表达式的堆栈跟踪行将被记录，而所有其他堆栈跟踪行将被跳过。这可能有助于显着减少记录的堆栈跟踪的长度。值为 null 将禁用正则表达式匹配，（默认情况下）将记录所有堆栈跟踪行。                                                                                                                                              |
| takenConnectionsFormatter        | Formatter| Default | 此配置选项实现的接口允许应用程序对 TakenConnection[] 数组的字符串进行自定义格式化。请注意，默认格式化程序使用 logLineRegex 进行过滤。                                                                                                                                                                                                                                                                          |

## 连接和方法调用钩子

请注意，本节中描述的所有编程钩子必须在池配置阶段仅设置一次，并且在池启动后不能修改。

可以注册同一类型的多个钩子，它们将按照注册的顺序执行；即，如果有 N 个特定类型的已注册钩子，则首先执行注册的第一个钩子，然后是第二个，第三个，依此类推。


| 方法 | 类型 | 默认值 | 描述 |
|-----|------|--------|------|
| viburDS.getConnHooks().addOnInit(...) | Hook.InitConnection | n/a | 在原始 JDBC 连接首次创建后仅调用一次的编程钩子。这是执行特定于应用程序的一次性连接设置逻辑的地方，例如设置默认连接网络超时或类似的逻辑。钩子执行时间应尽可能短。此钩子与 DestroyConnection 钩子相辅相成，后者在原始 JDBC 连接被销毁后调用。 |
| viburDS.getConnHooks().addOnGet(...) | Hook.GetConnection | n/a | 在原始 JDBC 连接作为 DataSource.getConnection() 流程的一部分从池中获取后调用的编程钩子。这是执行每次获取连接后特定于应用程序的连接逻辑的地方，例如设置默认数据库模式或角色（如果它们对不同的 getConnection() 调用有所不同）。钩子执行时间应尽可能短。此钩子与 CloseConnection 钩子相辅相成，后者在原始 JDBC 连接被放回池之前调用。 |
| viburDS.getConnHooks().addOnClose(...) | Hook.CloseConnection | n/a | 在原始 JDBC 连接作为 Connection.close() 流程的一部分放回池之前调用的编程钩子。这是执行每次获取连接后特定于应用程序的连接关闭逻辑的地方，如果需要的话。钩子执行时间应尽可能短。此钩子与 GetConnection 钩子相辅相成，后者在原始 JDBC 连接从池中获取后调用。 |
| viburDS.getConnHooks().addOnDestroy(...) | Hook.DestroyConnection | n/a | 在 ConnectionFactory 关闭/销毁原始 JDBC 连接后仅调用一次的编程钩子。钩子执行时间应尽可能短。此钩子与 InitConnection 钩子相辅相成，后者在原始 JDBC 连接首次创建后调用。 |
| viburDS.getConnHooks().addOnTimeout(...) | Hook.GetConnectionTimeout | n/a | 仅在调用 DataSource.getConnection() 超时时调用的编程钩子。实际上，调用此钩子表示当前对 getConnection() 的调用将抛出 SQLTimeoutException。应用程序可以使用此钩子将生成的连接日志格式化并重定向到与通常日志位置不同的位置，例如 Amazon S3。请注意，为了启用已获取连接跟踪，应用程序必须将 poolEnableConnectionTracking 设置为 true。默认钩子使用 takenConnectionsFormatter；可以通过将 logTakenConnectionsOnTimeout 设置为 false 来禁用它。请注意，如果等待 getConnection() 调用的线程被中断，这不算超时。钩子执行时间应尽可能短。 |
| viburDS.getInvocationHooks().addOnMethodInvocation(...) | Hook.MethodInvocation | n/a | 在调用代理的 JDBC 接口上的方法之前调用的编程钩子。它拦截（几乎）所有这样的方法调用。不拦截从 Object 类继承的方法、与 JDBC 对象的关闭状态相关的方法（例如 close()、isClosed()）、以及从 Wrapper 接口继承的方法。钩子执行时间应尽可能短。 |
| viburDS.getInvocationHooks().addOnStatementExecution(...) | Hook.StatementExecution | n/a | 在每个 JDBC Statement 的 "execute..." 方法调用周围调用的编程钩子。该钩子负责使用提供的 StatementProceedingPoint 将调用传递给拦截的 Statement 的 "execute..." 方法或下一个注册的 StatementExecution 钩子。钩子执行时间应尽可能短。 |
| viburDS.getInvocationHooks().addOnResultSetRetrieval(...) | Hook.ResultSetRetrieval | n/a | 作为 ResultSet.close() 流程的一部分，在每次结果集检索结束时调用的编程钩子。有关实现细节，请参阅 logLargeResultSet 的注释。钩子执行时间应尽可能短。 |

## Connection Default Behavior Settings

| 参数名               | 类型     | 默认值  | 描述                                                                                                                                                     |
|---------------------|----------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------|
| clearSQLWarnings    | boolean  | false   | 如果设置为 true，在使用 JDBC 连接后并在将其返回到池之前，将清除 JDBC 连接中的 SQL 警告（如果有）。类似地，如果启用了语句缓存，则在使用 JDBC Prepared 或 Callable Statement 后并在将其返回到语句缓存之前，将清除 SQL 警告（如果有）。 |
| resetDefaultsAfterUse | boolean  | false   | 如果设置为 true，将在连接在使用后恢复（返回）到池之后始终重置以下四个连接默认值。如果调用应用程序从不更改这些默认值，则不需要重置它们。                                                        |
| defaultAutoCommit   | boolean  | Driver's default | 创建连接时的默认自动提交状态。                                                                                                                         |
| defaultReadOnly     | boolean  | Driver's default | 创建连接时的默认只读状态。                                                                                                                             |
| defaultTransactionIsolation | String | Driver's default | 创建连接时的默认事务隔离级别。                                                                                                                         |
| defaultCatalog      | String   | Driver's default | 创建连接时的默认数据库目录。                                                                                                                           |

## JDBC Statement Caching Settings

| 参数名                  | 类型   | 默认值 | 描述                                                                                                                               |
|------------------------|--------|--------|-------------------------------------------------------------------------------------------------------------------------------------|
| statementCacheMaxSize  | int    | 0      | 定义语句缓存的最大大小。0 表示禁用语句缓存，最大允许值为 2000。如果未启用语句缓存，客户端应用程序可以安全地排除对 ConcurrentLinkedHashMap 的依赖。 |

值得注意的是，CLHM 实现采用 LRU 驱逐策略，并且 LRU map 条目的驱逐发生在执行插入（putIfAbsent）map 操作的线程的上下文中 - 在将 CLHM 大小增加到其预定义的 maxSize 之上。

## Pool Size Reduction Settings (advanced)

| 参数名                         | 类型   | 默认值                    | 描述                                                                                                                                                                                                                                                                                                                                                   |
|--------------------------------|--------|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| poolReducerClass               | String | org.vibur.dbcp.pool.PoolReducer | 完全限定的池减少器类名。此池减少器类将通过反射实例化，并且仅当 reducerTimeIntervalInSeconds 大于 0 时才实例化。它必须实现 ThreadedPoolReducer 接口，并且还必须具有一个接受类型为 ViburDBCPConfig 的单个参数的公共构造函数。                                                                                                                             |
|                                |        |                          | 此设置对于需要提供自定义监视当前池中当前分配的连接数量的应用程序非常有用，包括它们自己的用于减少当前未使用连接数量的逻辑。                                                                                                                                                                                                                                   |
| reducerTimeIntervalInSeconds  | int    | 30                       | 在此时间段之后，poolReducer 将尝试（可能）减少此池中创建但未使用的 JDBC 连接的数量。0 禁用它。请注意，启用 poolReducer 将导致启动一个后台守护线程，以满足配置的 poolReducerClass 的需要。此线程是配置的 Vibur DBCP 实例中唯一将被启动的服务线程。                                                                                                               |
| reducerSamples                 | int    | 15                       | poolReducer 在给定的 reducerTimeIntervalInSeconds 周期内将唤醒多少次，以便从池中采样各种统计信息。                                                                                                                                                                                                                                             |

## Critical SQL States (advanced)

| 参数名             | 类型    | 默认值 | 描述                                                                                                                                                                                                                                                               |
|--------------------|---------|--------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| criticalSQLStates  | String  | 08001,08006,08007,08S01,57P01,57P02,57P03,JZ0C0,JZ0C1 | 以逗号分隔的关键 SQL 状态列表，参见此 stackoverflow 回答。如果抛出具有这些 SQL 状态之一的 SQL 异常，则池中的所有连接将被视为无效并将被关闭。                                                                                                             |
| enableJMX          | boolean | true   | 启用或禁用 Vibur DBCP 数据源的 JMX 暴露。还请参阅池名称配置选项。                                                                                                                                                                                                |

# 开发团队

Vibur DBCP由Simeon Malchev及其贡献者设计和开发，并目前由Simeon维护。如果您需要报告任何问题、请求功能，或者只是想提供一些一般性反馈，请使用项目的问题跟踪系统或作者的电子邮件。

所有Vibur项目的源代码均根据Apache许可证2.0版分发，可供商业或非商业用途免费使用。

此开源项目得到了IntelliJ的支持，通过提供出色的Java IDE，并得到了EJ-Technologies的支持，通过他们出色的Java分析工具。

# 参考资料

https://www.vibur.org/

https://github.com/vibur/vibur-dbcp

* any list
{:toc}
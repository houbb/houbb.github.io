---
layout: post
title: web server apache tomcat11-30-The Tomcat JDBC Connection Pool
date:  2016-11-7 17:13:40 +0800
categories: [Web]
tags: [tomcat, server, web]
published: true
---

# 前言

整理这个官方翻译的系列，原因是网上大部分的 tomcat 版本比较旧，此版本为 v11 最新的版本。

## 开源项目

> 从零手写实现 tomcat [minicat](https://github.com/houbb/minicat) 别称【嗅虎】心有猛虎，轻嗅蔷薇。

## 系列文章

[web server apache tomcat11-01-官方文档入门介绍](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-01-intro)

[web server apache tomcat11-02-setup 启动](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-02-setup)

[web server apache tomcat11-03-deploy 如何部署](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-03-deploy)

[web server apache tomcat11-04-manager 如何管理？](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-04-manager)

[web server apache tomcat11-06-Host Manager App -- Text Interface](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-06-host-manager)

[web server apache tomcat11-07-Realm Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-07-relam)

[web server apache tomcat11-08-JNDI Resources](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-08-jndi)

[web server apache tomcat11-09-JNDI Datasource](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-09-jdbc-datasource)

[web server apache tomcat11-10-Class Loader](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-10-classloader-howto)

[web server apache tomcat11-11-Jasper 2 JSP Engine](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-11-jsps)

[web server apache tomcat11-12-SSL/TLS Configuration](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-12-ssl)

[web server apache tomcat11-13-SSI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-13-ssi)

[web server apache tomcat11-14-CGI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-14-cgi)

[web server apache tomcat11-15-proxy](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-15-proxy)

[web server apache tomcat11-16-mbean](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-16-mbean)

[web server apache tomcat11-17-default-servlet](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-17-default-servlet)

[web server apache tomcat11-18-clusting 集群](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-18-clusting)

[web server apache tomcat11-19-load balance 负载均衡](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-19-load-balance)

[web server apache tomcat11-20-connectors 连接器](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-20-connectors)

[web server apache tomcat11-21-monitor and management 监控与管理](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-21-monitor)

[web server apache tomcat11-22-logging 日志](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-22-logging)

[web server apache tomcat11-23-APR](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-23-apr)

[web server apache tomcat11-24-Virtual Hosting and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-24-virtual-host)

[web server apache tomcat11-25-Advanced IO and Tomcat](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-25-aio)

[web server apache tomcat11-26-maven jars](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-26-maven-jars)

[web server apache tomcat11-27-Security Considerations](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-27-security)

[web server apache tomcat11-28-Windows Service](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-28-windows-service)

[web server apache tomcat11-29-Windows Authentication](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-29-windows-auth)

[web server apache tomcat11-30-The Tomcat JDBC Connection Pool](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-30-tomcat-jdbc-pool)

[web server apache tomcat11-31-websocket](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-31-websocket)

[web server apache tomcat11-32-rewrite](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-32-rewrite)

[web server apache tomcat11-33-CDI](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-33-cdi)

[web server apache tomcat11-34-Ahead of Time compilation support](https://houbb.github.io/2016/11/07/web-server-tomcat11-doc-34-aot)


## 简介

JDBC连接池org.apache.tomcat.jdbc.pool是Apache Commons DBCP连接池的替代或替代方案。

那么为什么我们需要一个新的连接池呢？

以下是一些原因：

- Commons DBCP 1.x是单线程的。为了保证线程安全，Commons在对象分配和对象返回期间短暂锁定整个池。请注意，这不适用于Commons DBCP 2.x。
- Commons DBCP 1.x可能会很慢。随着逻辑CPU数量的增长和尝试借用或返回对象的并发线程数量的增加，性能会下降。对于高度并发的系统，影响可能会很大。请注意，这不适用于Commons DBCP 2.x。
- Commons DBCP有60多个类。tomcat-jdbc-pool核心是8个类，因此对未来需求进行修改将需要更少的更改。这就是运行连接池本身所需的全部内容，其他都是附加的。
- Commons DBCP使用静态接口。这意味着您必须使用给定JRE版本的正确版本，否则可能会看到NoSuchMethodException异常。
- 当一个连接池可以通过一个更简单的实现来完成时，重写60多个类是不值得的。

Tomcat jdbc池实现了异步检索连接的能力，而无需向库本身添加额外的线程。Tomcat jdbc池是Tomcat模块，它依赖于Tomcat JULI，这是Tomcat中使用的简化日志记录框架。

### 功能增加

- 支持高度并发的环境和多核/CPU系统。
- 接口的动态实现，将为您的运行时环境支持java.sql和javax.sql接口（只要您的JDBC驱动程序也支持相同的接口），即使使用较低版本的JDK进行编译也是如此。
- 验证间隔 - 我们不必在每次使用连接时都进行验证，我们可以在借用或返回连接时进行验证，但不要比我们可以配置的间隔更频繁。
- 一次性运行查询，在建立与数据库的连接时仅运行一次的可配置查询。在建立连接期间设置会话设置非常有用。
- 能够配置自定义拦截器。这允许您编写自定义拦截器来增强功能。您可以使用拦截器来收集查询统计信息，缓存会话状态，失败时重新连接连接，重试查询，缓存查询结果等等。您的选择是无限的，拦截器是动态的，不限于java.sql/javax.sql接口的JDK版本。
- 高性能 - 我们将在稍后展示一些性能差异
- 极其简单，由于实现非常简化，所以行数和源文件数非常低，与具有超过200个源文件（上次我们检查时）的c3p0相比，Tomcat jdbc有8个文件的核心，连接池本身约为其一半。由于可能会发生错误，因此跟踪错误将更快，更容易修复。从一开始，简化复杂性就是一个重点。
- 异步连接检索 - 您可以排队请求连接并收到 `Future<Connection>`。
- 更好的空闲连接处理。它不直接关闭连接，仍然可以对连接进行池化，并且使用更智能的算法调整空闲池的大小。
- 您可以在什么时候将连接视为被丢弃时进行决定，是在池满时还是在指定的超时时直接进行，通过指定池使用阈值来实现。
- 放弃连接定时器将在语句/查询活动时重置。允许长时间使用的连接不超时。这是通过ResetAbandonedTimer实现的
- 连接在连接一段时间后关闭。基于年龄的返回池后关闭。
- 当怀疑连接被丢弃时，获得JMX通知和日志条目。这类似于removeAbandonedTimeout，但它不采取任何行动，只报告信息。这是通过suspectTimeout属性实现的。
- 连接可以从java.sql.Driver、javax.sql.DataSource或javax.sql.XADataSource中检索。这是通过dataSource和dataSourceJNDI属性实现的。

### 如何使用

Tomcat连接池的使用尽可能简单，对于那些熟悉commons-dbcp的人来说，过渡将非常简单。从其他连接池过渡也相当简单。

### 其他功能

Tomcat连接池提供了一些其他功能，超出了大多数其他池所能做的：

- initSQL - 在连接创建时运行一次SQL语句的能力
- validationInterval - 除了在连接上运行验证之外，还避免运行太频繁。
- jdbcInterceptors - 灵活且可插拔的拦截器，用于在池、查询执行和结果集处理周围创建任何自定义。关于这一点的更多信息请参见高级部分。
- fairQueue - 将fair标志设置为true以实现线程公平性，或者使用异步连接检索
### 在Apache Tomcat容器内部

Tomcat连接池配置为资源，详见Tomcat JDBC文档。唯一的区别是您必须指定factory属性并将值设置为org.apache.tomcat.jdbc.pool.DataSourceFactory

### 独立运行

连接池仅具有另一个依赖项，即tomcat-juli.jar。要在独立项目中使用bean实例化来配置池，要实例化的bean是org.apache.tomcat.jdbc.pool.DataSource。与配置J

NDI资源的连接池相同的属性（下面有文档）被用于配置数据源作为bean。

### JMX

连接池对象公开了一个MBean，可以注册。为了使连接池对象创建MBean，必须将标志jmxEnabled设置为true。这并不意味着池将注册到MBean服务器，仅仅是创建了MBean。

在像Tomcat这样的容器中，Tomcat本身将DataSource注册到MBean服务器，然后org.apache.tomcat.jdbc.pool.DataSource对象将注册实际的连接池MBean。如果在容器外运行，则可以自己将DataSource注册到您指定的任何对象名称下，并将注册传播到底层池。要做到这一点，您将调用mBeanServer.registerMBean(dataSource.getPool().getJmxPool(),objectname)。在调用此方法之前，请确保池已经创建，方法是调用dataSource.createPool()。


### 属性

为了提供一个非常简单的切换从 commons-dbcp 到 tomcat-jdbc-pool 的方式，大多数属性都是相同的，并且具有相同的含义。

#### JNDI 工厂和类型

| 属性      | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| factory   | factory 是必需的，其值应为 org.apache.tomcat.jdbc.pool.DataSourceFactory |
| type      | 类型应始终为 javax.sql.DataSource 或 javax.sql.XADataSource |

根据类型，将创建 org.apache.tomcat.jdbc.pool.DataSource 或 org.apache.tomcat.jdbc.pool.XADataSource。

#### 系统属性

系统属性是 JVM 范围内的，影响 JVM 中创建的所有池。

| 属性                                          | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| org.apache.tomcat.jdbc.pool.onlyAttemptCurrentClassLoader | (布尔值) 控制动态类（如 JDBC 驱动程序、拦截器和验证器）的类加载。如果设置为 false（默认值），池将首先尝试使用当前加载器（即加载池类的类加载器），如果类加载失败，则尝试使用线程上下文加载器加载。如果您希望与 Apache Tomcat 8.0.8 及更早版本保持向后兼容，并且仅尝试使用当前加载器，则将此值设置为 true。如果未设置，则默认值为 false。 |

### 共同属性

这些属性在 commons-dbcp 和 tomcat-jdbc-pool 之间共享，在某些情况下，默认值不同。

| 属性                                      | 描述                                                                                                                                                                                                                                                          |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| defaultAutoCommit                        | (布尔值) 此池创建的连接的默认自动提交状态。如果未设置，则默认为 JDBC 驱动程序的默认值（如果未设置，则不会调用 setAutoCommit 方法）。                                                                                                                                   |
| defaultReadOnly                          | (布尔值) 此池创建的连接的默认只读状态。如果未设置，则不会调用 setReadOnly 方法。（某些驱动程序不支持只读模式，例如：Informix）                                                                                                                               |
| defaultTransactionIsolation              | (字符串) 此池创建的连接的默认事务隔离状态。以下之一：NONE、READ_COMMITTED、READ_UNCOMMITTED、REPEATABLE_READ、SERIALIZABLE（请参阅 javadoc）。如果未设置，则不会调用该方法，并默认为 JDBC 驱动程序的默认值。                                                                 |
| defaultCatalog                           | (字符串) 此池创建的连接的默认目录。                                                                                                                                                                                                                            |
| driverClassName                          | (字符串) 要使用的 JDBC 驱动程序的完全限定的 Java 类名。驱动程序必须从与 tomcat-jdbc.jar 相同的类加载器中访问。                                                                                                                                                |
| username                                 | (字符串) 传递给我们的 JDBC 驱动程序以建立连接的连接用户名。请注意，默认情况下，DataSource.getConnection(username,password) 方法不会使用传递到该方法的凭据，而是使用此处配置的凭据。有关更多详细信息，请参阅 alternateUsernameAllowed 属性。                                              |
| password                                 | (字符串) 传递给我们的 JDBC 驱动程序以建立连接的连接密码。请注意，默认情况下，DataSource.getConnection(username,password) 方法不会使用传递到该方法的凭据，而是使用此处配置的凭据。有关更多详细信息，请参阅 alternateUsernameAllowed 属性。                                              |
| maxActive                                | (整数) 此池同时可分配的最大活动连接数。默认值为 100。                                                                                                                                                                                                         |
| maxIdle                                  | (整数) 应始终保留在池中的最大连接数。默认值为 maxActive:100。空闲连接定期检查（如果启用），并且空闲时间超过 minEvictableIdleTimeMillis 的连接将被释放。（另请参阅 testWhileIdle）                                                                          |
| minIdle                                  | (整数) 应始终保留在池中的最小已建立连接数。如果验证查询失败，连接池可以缩小到此数字以下。默认值由 initialSize:10 派生。（另请参阅 testWhileIdle）                                                                                                             |
| initialSize                              | (整数) 在启动池时创建的连接的初始数量。默认值为 10。                                                                                                                                                                                                           |
| maxWait                                  | (整数) 在没有可用连接时，池将等待连接返回的最大毫秒数，然后抛出异常。默认值为 30000（30 秒）。                                                                                                                                                             |
| testOnBorrow                             | (布尔值) 对象在从池中借用之前是否进行验证的指示。如果对象未能验证，则将其从池中删除，并尝试借用另一个。为了进行更有效的验证，请参阅 validationInterval。默认值为 false。                                                                                               |
| testOnConnect                            | (布尔值) 在首次创建连接时是否验证对象的指示。如果对象未能验证，则会抛出 SQLException。默认值为 false。                                                                                                                                                       |
| testOnReturn                             | (布尔值) 在将对象返回到池之前是否验证对象的指示。默认值为 false。                                                                                                                                                                                             |
| testWhileIdle                            | (布尔值) 是否由空闲对象清除器（如果有）验证对象的指示。如果对象未能验证，则会将其从池中删除。默认值为 false，必须设置此属性才能运行池清理器/测试线程。（另请参阅 timeBetweenEvictionRunsMillis）                                                                  |
| validationQuery                          | (字符串) 将用于在将连接返回给调用方之前验证此池中的连接的 SQL 查询。如果指定，则此查询不必返回任何数据，它只是不能抛出 SQLException。默认值为 null。如果未指定，连接将通过 isValid() 方法进行验证。示例值为 SELECT 1(mysql)、select 1 from dual(oracle)、SELECT 1(MS Sql Server)。                   |
| validationQueryTimeout                   | (整数) 在连接验证查询失败之前的超时时间（以秒为单位）。这通过在执行 validationQuery 的语句上调用 java.sql.Statement.setQueryTimeout(seconds) 来工作。池本身不会超时查询，仍然取决于 JDBC 驱动程序来强制执行查询超时。小于或等于零的值将禁用此功能。默认值为 -1。            |
| validatorClassName                      | (字符串) 实现 org.apache.tomcat.jdbc.pool.Validator 接口并提供无参数构造函数（可以是隐式的）的类的名称。如果指定，则将使用该类来创建 Validator 实例，该实例然后用于验证连接，而不是使用任何验证查询来验证连接。默认值为 null。示例值为 com.mycompany.project.SimpleValidator。 |
| timeBetweenEvictionRunsMillis            | (整数) 空闲连接验证/清理线程运行之间的毫秒数。此值不应设置为 1 秒以下。它规定了我们检查空闲、被丢弃的连接的频率，以及我们验证空闲连接的频率。如果后者是非零且较低，则此值将被 maxAge 覆盖。默认值为 5000（5 秒）。                                                                                                    |
| minEvictableIdleTimeMillis               | (整数) 对象在池中闲置的最短时间，然后才能被清除。默认值为 60000（60 秒）。                                                                                                                                                                                 |
| accessToUnderlyingConnectionAllowed      | (布尔值) 属性未使用。

可以通过对池化连接调用 unwrap 来实现访问。参见 javax.sql.DataSource 接口，或通过反射调用 getConnection 或将对象强制转换为 javax.sql.PooledConnection。                                                                                  |
| removeAbandoned                          | (布尔值) 如果连接超过 removeAbandonedTimeout，则标志为删除废弃的连接。如果设置为 true，连接被视为废弃并且有资格进行删除，如果它的使用时间超过 removeAbandonedTimeout。将此设置为 true 可从未关闭连接的应用程序中恢复 db 连接。另请参阅 logAbandoned，默认值为 false。           |
| removeAbandonedTimeout                   | (整数) 废弃的（正在使用的）连接可以被删除之前的超时时间（以秒为单位）。默认值为 60（60 秒）。该值应设置为应用程序可能具有的最长运行查询时间。                                                                                                                         |
| logAbandoned                             | (布尔值) 记录弃用的连接的应用程序代码的堆栈跟踪的标志。记录弃用的连接会增加每个连接的开销，因为必须生成堆栈跟踪。默认值为 false。                                                                                                                                 |
| connectionProperties                    | (字符串) 在建立新连接时将发送给我们的 JDBC 驱动程序的连接属性。字符串的格式必须是 [propertyName=property;]* 注 - “user” 和 “password” 属性将被明确传递，因此不需要在此处包括它们。默认值为 null。                                                                                                     |
| poolPreparedStatements                  | (布尔值) 属性未使用。                                                                                                                                                                                                                                        |
| maxOpenPreparedStatements               | (整数) 属性未使用。                                                                                                                                                                                                                                          |


### Tomcat JDBC 增强属性

| 属性                                  | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| initSQL                               | (字符串) 第一次创建连接时要运行的自定义查询。默认值为 null。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| jdbcInterceptors                      | (字符串) 扩展 org.apache.tomcat.jdbc.pool.JdbcInterceptor 类的类名的分号分隔列表。有关语法和示例的更详细说明，请参阅下面的配置 JDBC 拦截器。 这些拦截器将被插入到 java.sql.Connection 对象的操作链中。默认值为 null。 预定义的拦截器： org.apache.tomcat.jdbc.pool.interceptor. ConnectionState - 跟踪自动提交、只读、目录和事务隔离级别。 org.apache.tomcat.jdbc.pool.interceptor. StatementFinalizer - 跟踪已打开的语句，并在连接返回到池时关闭它们。 JDBC 拦截器一节中详细描述了更多预定义的拦截器。 |
| validationInterval                    | (长整型) 避免过度验证，最多以此频率运行验证 - 毫秒时间。 如果连接应进行验证，但已在此间隔内先前进行过验证，则不会再次进行验证。 默认值为 3000（3 秒）。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| jmxEnabled                            | (布尔值) 是否将池注册到 JMX。默认值为 true。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| fairQueue                             | (布尔值) 如果希望对 getConnection 调用以真正的 FIFO 方式公平处理，请将其设置为 true。 这使用 org.apache.tomcat.jdbc.pool.FairBlockingQueue 实现对空闲连接列表的处理。 默认值为 true。 当您希望使用异步连接检索时，需要此标志。 设置此标志可确保线程按照它们到达的顺序接收连接。 在性能测试期间，锁和锁等待的实现方式有很大的差异。 当 fairQueue=true 时，会根据系统正在运行的操作系统进行决策。 如果系统正在运行 Linux（属性 os.name=Linux），则会执行一个基于此决策的决策过程。 要禁用此 Linux 特定行为并仍使用公平队列，只需在连接池类加载之前将属性 org.apache.tomcat.jdbc.pool.FairBlockingQueue.ignoreOS=true 添加到系统属性即可。 |
| abandonWhenPercentageFull             | (整数) 如果连接已被废弃（超时），除非正在使用的连接数超过 abandonWhenPercentageFull 定义的百分比，否则不会关闭并报告。 值应在 0-100 之间。 默认值为 0，这意味着一旦达到 removeAbandonedTimeout，连接就有资格被关闭。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| maxAge                                | (长整型) 在重新创建连接之前保留连接的时间（以毫秒为单位）。 当从池中借用连接时，池将检查 now - time-when-connected > maxAge 是否已达到，并且如果是，则在借用之前重新连接。 当连接返回到池时，池将检查 now - time-when-connected > maxAge 是否已达到，并且如果是，则尝试重新连接。 当连接处于空闲状态并且 timeBetweenEvictionRunsMillis 大于零时，池将定期检查 now - time-when-connected > maxAge 是否已达到，并且如果是，则尝试重新连接。 将 maxAge 设置为小于 timeBetweenEvictionRunsMillis 的值将覆盖它（因此空闲连接验证/清理将更频繁地运行）。 默认值为 0，这意味着连接将保持打开状态，并且在从池中借用连接、将连接返回到池或检查空闲连接时不会进行年龄检查。 |
| useEquals                             | (布尔值) 如果希望 ProxyConnection 类使用 String.equals，则设置为 true，当在比较方法名称时希望使用 == 时设置为 false。 此属性不适用于添加的拦截器，因为这些拦截器是单独配置的。 默认值为 true。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| suspectTimeout                        | (整数) 超时值（以秒为单位）。 默认值为 0。 类似于 removeAbandonedTimeout 值，但不是将连接视为废弃并可能关闭连接，而是如果将 logAbandoned 设置为 true，则仅记录警告。 如果此值小于或等于 0，则不会执行可疑检查。 只有在超时值大于 0 且连接未被废弃或如果禁用废弃检查时，才会执行可疑检查。 如果连接被认为是可疑的，则会记录 WARN 消息，并在发生后发送 JMX 通知一次。                                                                                                                                                                                                                                                                    |
| rollbackOnReturn                      | (布尔值) 如果 autoCommit==false，则池可以在将连接返回到池时通过在连接上调用 rollback 终止事务。 默认值为 false。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| commitOnReturn                        | (布尔值) 如果 autoCommit==false，则池可以在将连接返回到池时通过在连接上调用 commit 完成事务。 如果 rollbackOnReturn==true，则会忽略此属性。 默认值为 false。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| alternateUsernameAllowed              | (布尔值) 默认情况下，jdbc-pool 将忽略 DataSource.getConnection(username,password) 调用，并仅返回在全局配置的属性 username 和 password 下之前池化的连接，出于性能原因。 但是，池可以配置为允许每次请求连接时使用不同的凭据。 要启用 DataSource.getConnection(username,password) 调用中描述的功能，请将属性 alternateUsernameAllowed 设置为 true。 如果请求使用凭据 user1

/password1 连接，但是连接之前使用了不同的 user2/password2 连接，则连接将被关闭，并使用请求的凭据重新打开。 这样，池大小仍然在全局级别上进行管理，而不是在每个模式级别上进行管理。 默认值为 false。 此属性作为增强功能添加到 bug 50025。 |
| dataSource                           | (javax.sql.DataSource) 注入数据源到连接池中，池将使用数据源来检索连接，而不是使用 java.sql.Driver 接口建立连接。 当您希望池化 XA 连接或使用数据源而不是连接字符串建立连接时，这很有用。 默认值为 null。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| dataSourceJNDI                      | (字符串) 要在 JNDI 中查找的数据源的 JNDI 名称，然后使用它来建立到数据库的连接。 请参阅 dataSource 属性。 默认值为 null。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| useDisposableConnectionFacade       | (布尔值) 如果希望在关闭后不能再重用它的连接上放置外观，则将其设置为 true。 这可以防止线程持有对已经调用关闭的连接的引用，以在其上执行查询。 默认值为 true。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| logValidationErrors                | (布尔值) 将验证阶段中的错误记录到日志文件中时，将其设置为 true。 如果设置为 true，则错误将作为 SEVERE 记录。 默认值为 false，以确保向后兼容性。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| propagateInterruptState            | (布尔值) 将中断状态传播到已中断的线程（不清除中断状态）时，将其设置为 true。 默认值为 false，以确保向后兼容性。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ignoreExceptionOnPreLoad          | (布尔值) 标志是否在初始化池时忽略连接创建错误。 如果希望在初始化池时忽略连接创建错误，请设置为 true。 如果希望在初始化池时失败并抛出异常，请设置为 false。 默认值为 false。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| useStatementFacade                | (布尔值) 如果希望包装语句以便在关闭语句时调用 equals() 和 hashCode() 方法，则将其设置为 true。 默认值为 true。                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

### org.apache.tomcat.jdbc.pool.JdbcInterceptor

抽象基类，用于所有拦截器，不能实例化。

| 属性         | 描述                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| useEquals    | (布尔值) 如果希望 ProxyConnection 类使用 String.equals，则设置为 true；当希望使用 == 比较方法名称时，设置为 false。默认值为 true。                                                                 |

### org.apache.tomcat.jdbc.pool.interceptor.ConnectionState

缓存以下属性的连接：autoCommit、readOnly、transactionIsolation 和 catalog。这是一种性能增强，可避免在调用 getter 或以已设置值调用 setter 时往返数据库。

### org.apache.tomcat.jdbc.pool.interceptor.StatementFinalizer

跟踪使用 createStatement、prepareStatement 或 prepareCall 创建的所有语句，并在连接返回到池时关闭这些语句。

| 属性    | 描述                                                                                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| trace   | (字符串形式的布尔值) 启用未关闭语句的跟踪。启用后，当关闭连接且语句未关闭时，拦截器将记录所有堆栈跟踪。默认值为 false。                                                                                      |

### org.apache.tomcat.jdbc.pool.interceptor.StatementCache

在连接上缓存 PreparedStatement 和/或 CallableStatement 实例。

| 属性      | 描述                                                                                                                                                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| prepared  | (字符串形式的布尔值) 启用使用 prepareStatement 调用创建的 PreparedStatement 实例的缓存。默认值为 true。                                                                                                 |
| callable  | (字符串形式的布尔值) 启用使用 prepareCall 调用创建的 CallableStatement 实例的缓存。默认值为 false。                                                                                                      |
| max       | (字符串形式的整数) 连接池中缓存的语句计数限制。一旦计数达到最大值，后续语句将不会返回到缓存中并立即关闭。默认值为 50。                                                                                |

### org.apache.tomcat.jdbc.pool.interceptor.StatementDecoratorInterceptor

参见 48392。用于包装语句和结果集以防止使用 ResultSet.getStatement().getConnection() 和 Statement.getConnection() 方法访问实际连接的拦截器。

### org.apache.tomcat.jdbc.pool.interceptor.QueryTimeoutInterceptor

在创建新语句时自动调用 java.sql.Statement.setQueryTimeout(seconds)。池本身不会对查询设置超时，JDBC 驱动程序仍需执行查询超时。

| 属性         | 描述                                                                                                                                                                                      |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| queryTimeout | (字符串形式的整数) 设置查询超时的秒数。值小于等于零将禁用此功能。默认值为 1 秒。                                                                                                         |

### org.apache.tomcat.jdbc.pool.interceptor.SlowQueryReport

跟踪查询性能，并在查询超过失败时间阈值时发出日志条目。使用的日志级别为 WARN。

| 属性        | 描述                                                                                                                                                                                                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| threshold   | (字符串形式的整数) 查询必须超过的毫秒数才能发出日志警报。默认值为 1000 毫秒。                                                                                                                                                                                                             |
| maxQueries  | (字符串形式的整数) 为了保留内存空间，要跟踪的最大查询数。小于等于 0 的值将禁用此功能。默认值为 1000。                                                                                                                                                                                     |
| logSlow     | (字符串形式的布尔值) 如果希望记录慢查询，则设置为 true。默认值为 true。                                                                                                                                                                                                                    |
| logFailed   | (字符串形式的布尔值) 如果希望记录失败的查询，则设置为 true。默认值为 false。                                                                                                                                                                                                                |
### org.apache.tomcat.jdbc.pool.interceptor.SlowQueryReportJmx

扩展了 SlowQueryReport，并且除了发出日志条目外，还向监控工具发出 JMX 通知。继承了其父类的所有属性。此类使用 Tomcat 的 JMX 引擎，因此在 Tomcat 容器外部不起作用。默认情况下，如果启用了 ConnectionPool mbean，则 JMX 通知将通过该 mbean 发送。如果 notifyPool=false，则 SlowQueryReportJmx 还可以注册一个 MBean。

| 属性          | 描述                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| notifyPool    | (字符串形式的布尔值) 如果希望 JMX 通知发送到 SlowQueryReportJmx MBean，则设置为 false。默认值为 true。                    |
| objectName    | (字符串) 定义一个有效的 javax.management.ObjectName 字符串，用于将此对象注册到平台 mbean 服务器。默认值为 null，对象将使用 tomcat.jdbc:type=org.apache.tomcat.jdbc.pool.interceptor.SlowQueryReportJmx,name=pool-name 注册。 |

### org.apache.tomcat.jdbc.pool.interceptor.ResetAbandonedTimer

当从池中检出连接时，丢弃定时器启动。这意味着如果您设置了 30 秒的超时并且使用连接运行 10 次 10 秒的查询，则该连接将被标记为丢弃，并根据 abandonWhenPercentageFull 属性可能被回收。使用此拦截器，每次对连接执行操作或成功执行查询时，都会重置检出计时器。

# 代码例子

```java
 import java.sql.Connection;
  import java.sql.ResultSet;
  import java.sql.Statement;

  import org.apache.tomcat.jdbc.pool.DataSource;
  import org.apache.tomcat.jdbc.pool.PoolProperties;

  public class SimplePOJOExample {

      public static void main(String[] args) throws Exception {
          PoolProperties p = new PoolProperties();
          p.setUrl("jdbc:mysql://localhost:3306/mysql");
          p.setDriverClassName("com.mysql.jdbc.Driver");
          p.setUsername("root");
          p.setPassword("password");
          p.setJmxEnabled(true);
          p.setTestWhileIdle(false);
          p.setTestOnBorrow(true);
          p.setValidationQuery("SELECT 1");
          p.setTestOnReturn(false);
          p.setValidationInterval(30000);
          p.setTimeBetweenEvictionRunsMillis(30000);
          p.setMaxActive(100);
          p.setInitialSize(10);
          p.setMaxWait(10000);
          p.setRemoveAbandonedTimeout(60);
          p.setMinEvictableIdleTimeMillis(30000);
          p.setMinIdle(10);
          p.setLogAbandoned(true);
          p.setRemoveAbandoned(true);
          p.setJdbcInterceptors(
            "org.apache.tomcat.jdbc.pool.interceptor.ConnectionState;"+
            "org.apache.tomcat.jdbc.pool.interceptor.StatementFinalizer");
          DataSource datasource = new DataSource();
          datasource.setPoolProperties(p);

          Connection con = null;
          try {
            con = datasource.getConnection();
            Statement st = con.createStatement();
            ResultSet rs = st.executeQuery("select * from user");
            int cnt = 1;
            while (rs.next()) {
                System.out.println((cnt++)+". Host:" +rs.getString("Host")+
                  " User:"+rs.getString("User")+" Password:"+rs.getString("Password"));
            }
            rs.close();
            st.close();
          } finally {
            if (con!=null) try {con.close();}catch (Exception ignore) {}
          }
      }

  }
```

## AS as resource

```xml
<Resource name="jdbc/TestDB"
          auth="Container"
          type="javax.sql.DataSource"
          factory="org.apache.tomcat.jdbc.pool.DataSourceFactory"
          testWhileIdle="true"
          testOnBorrow="true"
          testOnReturn="false"
          validationQuery="SELECT 1"
          validationInterval="30000"
          timeBetweenEvictionRunsMillis="30000"
          maxActive="100"
          minIdle="10"
          maxWait="10000"
          initialSize="10"
          removeAbandonedTimeout="60"
          removeAbandoned="true"
          logAbandoned="true"
          minEvictableIdleTimeMillis="30000"
          jmxEnabled="true"
          jdbcInterceptors="org.apache.tomcat.jdbc.pool.interceptor.ConnectionState;
            org.apache.tomcat.jdbc.pool.interceptor.StatementFinalizer"
          username="root"
          password="password"
          driverClassName="com.mysql.jdbc.Driver"
          url="jdbc:mysql://localhost:3306/mysql"/>
```

### 异步连接检索

Tomcat JDBC 连接池支持异步连接检索，而无需向连接池库添加额外的线程。它通过向数据源添加一个名为 `Future<Connection> getConnectionAsync()` 的方法来实现这一点。要使用异步检索，必须满足两个条件：

1. 必须将 `fairQueue` 属性配置为 `true`。
2. 您必须将数据源强制转换为 `org.apache.tomcat.jdbc.pool.DataSource`。

以下是使用异步功能的示例：

```java
Connection con = null;
try {
    Future<Connection> future = datasource.getConnectionAsync();
    while (!future.isDone()) {
        System.out.println("连接尚未可用。执行一些后台工作");
        try {
            Thread.sleep(100); // 模拟工作
        } catch (InterruptedException x) {
            Thread.currentThread().interrupt();
        }
    }
    con = future.get(); // 应立即返回
    Statement st = con.createStatement();
    ResultSet rs = st.executeQuery("SELECT * FROM user");
} catch (SQLException e) {
    e.printStackTrace();
}
```

### 拦截器

拦截器是一种强大的方法，可在特定连接或其子组件上启用、禁用或修改功能。拦截器有许多不同的使用情况。出于性能原因，默认情况下，连接池是无状态的。池本身插入的唯一状态是 `defaultAutoCommit`、`defaultReadOnly`、`defaultTransactionIsolation` 和 `defaultCatalog`，如果设置了这些属性。这 4 个属性仅在连接创建时设置。如果在使用连接期间修改了这些属性，池本身将不会重置它们。

拦截器必须扩展 `org.apache.tomcat.jdbc.pool.JdbcInterceptor` 类。这个类非常简单，您只需要一个无参数构造函数：

```java
public JdbcInterceptor() {
}
```

当从池中借用连接时，拦截器可以通过实现 `public abstract void reset(ConnectionPool parent, PooledConnection con)` 方法来初始化或以其他方式对事件做出反应。此方法带有两个参数：对连接池本身的引用 `ConnectionPool parent` 和对底层连接的引用 `PooledConnection con`。

当调用 `java.sql.Connection` 对象上的方法时，它将导致调用 `public Object invoke(Object proxy, Method method, Object[] args) throws Throwable` 方法。`Method method` 是实际调用的方法，`Object[] args` 是参数。例如，可以使对 `java.sql.Connection.close()` 方法的调用在连接已关闭时成为 no-op：

```java
if ("close".equals(method.getName())) {
    if (isClosed()) return null; // 对已关闭的连接进行 no-op
}
return super.invoke(proxy, method, args);
```

如果拦截器具有 `useEquals=true` 标志，则 `compare(String, Method)` 方法将使用该标志，并在 `method` 名称是字符串值时进行字符串值比较。如果使用的是 `useEquals=true` 标志，则 `compare(String, Method)` 方法将使用该标志，并在 `method` 名称是字符串值时进行字符串值比较。

### 池的启动/停止

当启动或关闭连接池时，您可以收到通知。即使它是一个实例方法，也只会对每个拦截器类通知一次，并且您将使用一个当前未附加到池的拦截器进行通知。

```java
public void poolStarted(ConnectionPool pool) {
}

public void poolClosed(ConnectionPool pool) {
}
```

在重写这些方法时，请不要忘记调用 `super`，如果您正在扩展除 `JdbcInterceptor` 之外的类。

### 配置拦截器

使用 `jdbcInterceptors` 属性或 `setJdbcInterceptors` 方法配置拦截器。拦截器可以具有属性，并且配置如下：

```java
String jdbcInterceptors = "org.apache.tomcat.jdbc.pool.interceptor.ConnectionState(useEquals=true,fast=yes)";
```

### 拦截器属性

由于拦截器可以具有属性，因此您需要能够在拦截器内部读取这些属性的值。例如，可以重写 `setProperties(Map<String, InterceptorProperty> properties)` 方法。

```java
public void setProperties(Map<String, InterceptorProperty> properties) {
    super.setProperties(properties);
    final String myprop = "myprop";
    InterceptorProperty p1 = properties.get(myprop);
    if (p1 != null) {
        setMyprop(Long.parseLong(p1.getValue()));
    }
}
```

### 获取实际的 JDBC 连接

连接池会在实际连接周围创建包装器，以便正确地对其进行池化。我们还在这些包装器中创建拦截器以执行某些功能。如果需要检索实际连接，可以使用 `javax.sql.PooledConnection` 接口。

```java
Connection con = datasource.getConnection();
Connection actual = ((javax.sql.PooledConnection)con).getConnection();
```

### 构建

我们使用 1.6 构建 JDBC 池代码，但对于运行时环境，它向下兼容到 1.5。对于单元测试，我们使用 1.6 及更高版本。

可以在 Tomcat 文档中找到 JDBC 使用的其他示例。

### 从源代码构建

构建非常简单。池依赖于 `tomcat-juli.jar`，如果您想要 `SlowQueryReportJmx`，还依赖于它。

```bash
javac -classpath tomcat-juli.jar \
      -d . \
      org/apache/tomcat/jdbc/pool/*.java \
      org/apache/tomcat/jdbc/pool/interceptor/*.java \
      org/apache/tomcat/jdbc/pool/jmx/*.java
```

Tomcat 源代码库中可以找到构建文件。

为方便起见，还包含了一个构建文件，简单的构建命令将生成所有所需的文件。

```bash
ant download  （下载依赖项）
ant build     （编译并生成 .jar 文件）
ant

 dist      （创建一个发布包）
ant test      （运行测试，需要设置测试数据库）
```

系统结构设计为 Maven 构建，但会生成发行版工件。只是库本身。



# 参考资料

https://tomcat.apache.org/tomcat-11.0-doc/jdbc-pool.html

* any list
{:toc}
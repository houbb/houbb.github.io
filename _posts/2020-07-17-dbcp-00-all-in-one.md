---
layout: post
title:  万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比
date:  2020-7-17 16:52:15 +0800
categories: [database]
tags: [database, sql, pool, dbcp, sh]
published: true
---

# 拓展阅读

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://mp.weixin.qq.com/s/YMgj1lsa0hV2TDvfii6grA)

[从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？](https://houbb.github.io/2020/06/21/hand-write-mybatis-03-jdbc-pool)

[万字长文深入浅出数据库连接池 HikariCP/Commons DBCP/Tomcat/c3p0/druid 对比](https://houbb.github.io/2020/07/17/dbcp-00-all-in-one)

[Database Connection Pool 数据库连接池概览](https://houbb.github.io/2020/07/17/dbcp-01-overview)

[c3p0 数据池入门使用教程](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)

[alibaba druid 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[数据库连接池 HikariCP 性能为什么这么快？](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-02-why-so-fast)

[Apache Tomcat DBCP（Database Connection Pool） 数据库连接池-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

[vibur-dbcp 并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能-01-入门介绍](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)


# 前言

数据库连接池在日常开发中几乎是必备的技能，但是很多知识大多比较零散。

这里老马为大家简单做一个汇总，便于查阅学习。

# 连接池的作用

## 资源重用
 
由于数据库连接得到重用，避免了频繁创建、释放连接引起的大量性能开销。在减少系统消耗的基础上，
另一方面也增进了系统运行环境的平稳性（减少内存碎片以及数据库临时进程/线程的数量）。 

## 更快的系统响应速度
 
数据库连接池在初始化过程中，往往已经创建了若干数据库连接置于池中备用。此时连接的初始化工作均已完成。
对于业务请求处理而言，直接利用现有可用连接，避免了数据库连接初始化和释放过程的时间开销，从而缩减了系统整体响应时间。
 
## 新的资源分配手段
 
对于多应用共享同一数据库的系统而言，可在应用层通过数据库连接的配置，使用数据库连接池技术。
设置某一应用最大可用数据库连接数，避免某一应用独占所有数据库资源。 

## 统一的连接管理，避免数据库连接泄漏 

在较为完备的数据库连接池实现中，可根据预先设定的连接占用超时时间，强制收回被超时占用的连接。
从而避免了常规数据库连接操作中可能出现的资源泄漏（当程序存在缺陷时，申请的连接忘记关闭，这时候，就存在连接泄漏了）。

![连接池](https://img-blog.csdnimg.cn/direct/ddd2dd91b0c440deafac18d405ebac30.jpeg#pic_center)

## 常见的优秀开源组件有哪些？

有关数据库连接池的优秀开源组件：

1. **HikariCP：** HikariCP 是一个高性能的 JDBC 连接池，被广泛认为是目前性能最好的 JDBC 连接池之一。它具有快速启动、低资源消耗和高性能等特点，适用于各种规模的应用程序。

2. **Apache Commons DBCP：** Apache Commons DBCP 是 Apache 软件基金会的一个子项目，提供了一个可靠的 JDBC 连接池实现。它支持基本的连接池功能，并且易于集成到各种 Java 应用程序中。

3. **Tomcat JDBC Pool：** Tomcat JDBC Pool 是 Apache Tomcat 项目的一个组件，提供了一个可靠的 JDBC 连接池实现。它专为在 Tomcat 环境下使用而设计，但也可以作为独立的连接池使用。

4. **H2 Database Connection Pool：** H2 Database 是一个嵌入式数据库，它也提供了一个简单而有效的 JDBC 连接池实现。虽然它主要用于嵌入式数据库的应用场景，但也可以作为独立的连接池使用。

5. **c3p0：** c3p0 是一个流行的 JDBC 连接池实现，具有丰富的配置选项和可靠的性能。它支持连接池的高度定制，并且在很多企业级应用中被广泛使用。

6. **Druid：** Druid 是阿里巴巴开源的一个数据库连接池实现，它不仅提供了连接池功能，还提供了监控、统计、防火墙等高级功能。Druid 被广泛应用于大型互联网企业的生产环境中。

## 对比

HikariCP 2.6.0、commons-dbcp2 2.1.1、Tomcat 8.0.24、Vibur 16.1、c3p0 0.9.5.2

以下是对上述数据库连接池组件的详细对比：

| 特性                 | HikariCP           | Apache Commons DBCP | Tomcat JDBC Pool   | H2 Database Connection Pool | c3p0               | Druid              |
|----------------------|--------------------|----------------------|--------------------|------------------------------|--------------------|--------------------|
| 性能                 | 非常高             | 一般                 | 一般               | 一般                         | 一般               | 非常高             |
| 配置简单性           | 高                 | 中等                 | 中等               | 低                           | 中等               | 中等               |
| 可定制性             | 中等               | 中等                 | 低                 | 低                           | 高                 | 高                 |
| 监控和统计功能       | 有                 | 无                   | 无                 | 无                           | 无                 | 有                 |
| 防火墙功能           | 无                 | 无                   | 无                 | 无                           | 无                 | 有                 |
| 社区活跃度           | 高                 | 中等                 | 中等               | 低                           | 中等               | 高                 |
| 适用场景             | 各种场景           | 一般场景             | Tomcat 环境        | 嵌入式数据库场景             | 各种场景           | 大型互联网企业环境 |
| 是否支持连接池复用 | 是                 | 是                   | 是                 | 是                           | 是                 | 是                 |
| 支持的数据库         | 所有主流数据库     | 所有主流数据库       | 所有主流数据库     | H2 Database                  | 所有主流数据库     | 所有主流数据库     |


看得出来，Druid 和 HikariCP 性能是最优异的。

不过别着急，我们慢慢来，先看看其他的。

# DBCP组件

## 介绍

许多Apache项目支持与关系型数据库进行交互。为每个用户创建一个新连接可能很耗时（通常需要多秒钟的时钟时间），以执行可能需要毫秒级时间的数据库事务。对于一个公开托管在互联网上的应用程序，在同时在线用户数量可能非常大的情况下，为每个用户打开一个连接可能是不可行的。因此，开发人员通常希望在所有当前应用程序用户之间共享一组“池化”的打开连接。在任何给定时间实际执行请求的用户数量通常只是活跃用户总数的非常小的百分比，在请求处理期间是唯一需要数据库连接的时间。应用程序本身登录到DBMS，并在内部处理任何用户账户问题。

已经有几个数据库连接池可用，包括Apache产品内部和其他地方。这个Commons包提供了一个机会，来协调创建和维护一个高效、功能丰富的包，以Apache许可证发布。

commons-dbcp2依赖于commons-pool2中的代码，以提供底层的对象池机制。

## maven 引入

```xml
<dependency>
  <groupId>org.apache.commons</groupId>
  <artifactId>commons-dbcp2</artifactId>
  <version>2.9.0</version>
</dependency>
```

## 代码

> [https://github.com/apache/commons-dbcp/tree/HEAD/doc](https://github.com/apache/commons-dbcp/tree/HEAD/doc)

### PoolingDataSourceExample

这里的 datasource 是池化的。

```java
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;

import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.dbcp2.ConnectionFactory;
import org.apache.commons.dbcp2.PoolableConnection;
import org.apache.commons.dbcp2.PoolingDataSource;
import org.apache.commons.dbcp2.PoolableConnectionFactory;
import org.apache.commons.dbcp2.DriverManagerConnectionFactory;

public class PoolingDataSourceExample {

    public static void main(String[] args) {
        //
        // First we load the underlying JDBC driver.
        // You need this if you don't use the jdbc.drivers
        // system property.
        //
        System.out.println("Loading underlying JDBC driver.");
        try {
            Class.forName("org.h2.Driver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
        System.out.println("Done.");

        //
        // Then, we set up the PoolingDataSource.
        // Normally this would be handled auto-magically by
        // an external configuration, but in this example we'll
        // do it manually.
        //
        System.out.println("Setting up data source.");
        DataSource dataSource = setupDataSource(args[0]);
        System.out.println("Done.");

        //
        // Now, we can use JDBC DataSource as we normally would.
        //
        Connection conn = null;
        Statement stmt = null;
        ResultSet rset = null;

        try {
            System.out.println("Creating connection.");
            conn = dataSource.getConnection();
            System.out.println("Creating statement.");
            stmt = conn.createStatement();
            System.out.println("Executing statement.");
            rset = stmt.executeQuery(args[1]);
            System.out.println("Results:");
            int numcols = rset.getMetaData().getColumnCount();
            while(rset.next()) {
                for(int i=1;i<=numcols;i++) {
                    System.out.print("\t" + rset.getString(i));
                }
                System.out.println("");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            try {
                if (rset != null)
                    rset.close();
            } catch (Exception e) {
            }
            try {
                if (stmt != null)
                    stmt.close();
            } catch (Exception e) {
            }
            try {
                if (conn != null)
                    conn.close();
            } catch (Exception e) {
            }
        }
    }

    // 这里的 datasource 是池化的。
    public static DataSource setupDataSource(String connectURI) {
        //
        // First, we'll create a ConnectionFactory that the
        // pool will use to create Connections.
        // We'll use the DriverManagerConnectionFactory,
        // using the connect string passed in the command line
        // arguments.
        //
        ConnectionFactory connectionFactory =
            new DriverManagerConnectionFactory(connectURI, null);

        //
        // Next we'll create the PoolableConnectionFactory, which wraps
        // the "real" Connections created by the ConnectionFactory with
        // the classes that implement the pooling functionality.
        //
        PoolableConnectionFactory poolableConnectionFactory =
            new PoolableConnectionFactory(connectionFactory, null);

        //
        // Now we'll need a ObjectPool that serves as the
        // actual pool of connections.
        //
        // We'll use a GenericObjectPool instance, although
        // any ObjectPool implementation will suffice.
        //
        ObjectPool<PoolableConnection> connectionPool =
                new GenericObjectPool<>(poolableConnectionFactory);
        
        // Set the factory's pool property to the owning pool
        poolableConnectionFactory.setPool(connectionPool);

        //
        // Finally, we create the PoolingDriver itself,
        // passing in the object pool we created.
        //
        PoolingDataSource<PoolableConnection> dataSource =
                new PoolingDataSource<>(connectionPool);

        return dataSource;
    }
}
```

更多内容，可参考

> [apache commons dbcp2](https://houbb.github.io/2020/07/17/dbcp-02-apache-commons-dbcp)

# c3p0

## 是什么？

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

c3p0希望提供的数据源实现不适合大批量“ J2EE企业应用程序”使用。

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

更多内容，可参考

> [c3p0](https://houbb.github.io/2020/07/17/dbcp-03-c3p0-00-hello-world)


# tomcat jdbc pool

## 是什么？

Apache Tomcat DBCP（Database Connection Pool）是一个用于管理数据库连接的组件，通常与Apache Tomcat服务器一起使用。

它提供了一种机制来有效地管理数据库连接，以便在高负载下提供更好的性能和可伸缩性。

以下是Tomcat DBCP的一些关键特性和工作原理：

1. **连接池管理：** Tomcat DBCP通过创建和维护一组预先配置的数据库连接来管理连接池。这些连接在需要时可以被应用程序使用，并在不再需要时释放回池中。

2. **连接池参数配置：** 可以通过Tomcat的配置文件（如context.xml）或者直接在应用程序中的代码中配置连接池的各种参数，例如最大连接数、最小连接数、最大等待时间等。

3. **连接池的工作流程：** 当应用程序需要与数据库进行交互时，它从连接池中请求一个数据库连接。如果连接池中有空闲的连接可用，连接池会将一个连接分配给应用程序。一旦应用程序完成了对数据库的操作，它将连接返回给连接池，以供其他应用程序使用。

4. **连接验证：** Tomcat DBCP可以配置为在从连接池中获取连接时验证连接的有效性。这可以通过执行简单的SQL查询或其他形式的连接测试来实现。这有助于确保从池中获取的连接是可用和有效的。

5. **性能优化：** 通过维护一组已经打开的数据库连接，Tomcat DBCP可以避免在每次数据库请求时都重新创建和销毁连接，从而提高了性能和效率。

6. **异常处理：** Tomcat DBCP能够处理数据库连接的异常情况，例如数据库服务器断开连接或者连接超时。它会尝试重新建立连接或者返回错误信息，以便应用程序能够适当地处理这些异常情况。

7. **监控和管理：** Tomcat DBCP提供了监控和管理连接池的功能，可以通过JMX（Java Management Extensions）接口来查看连接池的状态、活动连接数、空闲连接数等信息，并且可以通过管理工具对连接池进行操作。

## 为什么 tomcat 要自研，而不是用 apache dbcp 这些已有的？

Apache Tomcat 一开始确实使用了像 Commons DBCP 和 Commons Pool 这样的外部组件来管理数据库连接池。

然而，后来 Apache Tomcat 团队决定开发自己的连接池实现，即 Tomcat DBCP。

这是有几个原因的：

1. **更好的集成：** 将连接池功能直接集成到 Tomcat 中可以提供更好的性能和更好的集成。这样做可以更好地与 Tomcat 内部的线程管理、类加载器和上下文生命周期等功能集成，以便提供更一致和更可靠的连接池管理。

2. **性能优化：** Apache Tomcat 团队可以更深入地了解 Tomcat 本身的内部工作原理，以优化连接池的性能，使其更适合与 Tomcat 一起使用。自己实现的连接池可能会针对 Tomcat 的特定需求进行优化，以提供更好的性能和可靠性。

3. **更好的控制：** 通过开发自己的连接池实现，Apache Tomcat 团队可以更好地控制连接池的开发和维护过程。他们可以根据自己的需求进行定制和扩展，而不受外部库的限制。

4. **解决特定问题：** 有时候外部库可能存在一些限制或者问题，而开发自己的实现可以更灵活地解决这些问题。可能是因为在特定的使用情况下，已有的库无法满足 Tomcat 的需求，或者为了解决一些已知的问题而决定开发自己的实现。

## 入门例子

1. 确保你已经在Tomcat的`lib`目录中包含 `commons-dbcp.jar`和`commons-pool.jar`。

2. 在你的Web应用程序的`WEB-INF`目录下创建一个名为`context.xml`的文件，并在其中配置数据库连接池。

以下是一个示例`context.xml`文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Context>
    <Resource name="jdbc/TestDB" auth="Container" type="javax.sql.DataSource"
               maxActive="100" maxIdle="30" maxWait="10000"
               username="#{username}" password="#{password}"
               driverClassName="com.mysql.jdbc.Driver"
               url="jdbc:mysql://localhost:3306/#{database}"/>
</Context>
```

3. 在你的Web应用程序中，你可以通过JNDI查找来获取数据库连接。以下是一个简单的Servlet示例，演示如何获取数据库连接并执行查询：

```java
import java.io.*;
import java.sql.*;
import javax.naming.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.sql.*;

public class MyServlet extends HttpServlet {
    public void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();

        Connection conn = null;
        try {
            // 查找上下文中的数据库连接池
            Context ctx = new InitialContext();
            DataSource ds = (DataSource) ctx.lookup("java:comp/env/jdbc/TestDB");

            // 从连接池获取连接
            conn = ds.getConnection();

            // 执行查询
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery("SELECT * FROM your_table");
            while (rs.next()) {
                out.println("ID: " + rs.getInt("id") + ", Name: " + rs.getString("name"));
                out.println("<br/>");
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            // 关闭连接
            try {
                if (conn != null)
                    conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

拓展阅读：

更多细节，参见 [tomcat dbcp](https://houbb.github.io/2020/07/17/dbcp-06-tomcat-pool-01-intro)

# vibur dbcp

## 是什么？

Vibur DBCP 是一个并发、快速且功能完备的 JDBC 连接池，提供先进的性能监控功能，包括慢 SQL 查询的检测和记录、应用线程的非饥饿保证、语句缓存以及与 Hibernate 集成等特性。

该项目主页包含了对所有 Vibur 特性和配置选项的详细描述，以及与 Hibernate 和 Spring 的各种配置示例等内容。

Vibur DBCP 基于 Vibur Object Pool 构建，后者是一个通用的并发 Java 对象池。

## 特性

### 主要特点一览

- 确保没有线程会被排除在访问 JDBC 连接池连接之外。参见 poolFair 配置参数。

- 检测和记录慢 SQL 查询、大于预期的 ResultSet 和持续时间较长的 getConnection() 方法调用。查看相关的配置属性 这里 和 这里。

- 支持 Hibernate 3.6、4.x 和 5.x 的集成。

- 对 JDBC Statement（Prepared 和 Callable）进行缓存支持。

- 使用标准 Java 并发工具和动态代理构建，不使用任何 synchronized 块或方法。

- Vibur DBCP 需要 Java 1.6+，并且仅有以下外部依赖项：其专用对象池、slf4j/log4j 和 ConcurrentLinkedHashMap。CLHM 依赖项是可
选的，只有在启用/使用 JDBC Statement 缓存时，应用程序才需要提供它。

### 其他特点

- 智能池大小调整 - 根据最近使用的连接数量的启发式方法，可以减少 JDBC 池中的空闲连接数量。

- 支持验证间隔；即，在每次使用之前，从 JDBC 池获取的连接并不会被验证，只有在连接上一次使用后经过一定时间后才会进行验证。

- 可以通过调用代理的 unwrap 方法从相应的代理对象中检索原始 JDBC 连接或 Statement 对象。

- 为当前获取的所有 JDBC 连接提供记录（通过 JMX 或日志文件），包括它们被获取时的堆栈跟踪；如果调试丢失/未关闭的连接或者应用程序
想知道当前所有连接的来源，这将非常有用。

- JMX 支持 - 池注册了一个 MBean，通过它可以观察和/或设置各种池参数。

## maven 依赖

```xml
<dependency>
  <groupId>org.vibur</groupId>
  <artifactId>vibur-dbcp</artifactId>
  <version>25.0</version>
</dependency>
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

vibur 的性能相比较其他的，算是比较优异的。但是 github star 比较少。

配置项特别多，感兴趣的话 参见 [vibur dbcp](https://houbb.github.io/2020/07/17/dbcp-07-vibur-pool-01-intro)


# alibaba druid

这个在国内应该算是家喻户晓了，介绍的文章非常多，这里只做简单介绍。

## 是什么

Druid是Java语言中最好的数据库连接池。Druid能够提供强大的监控和扩展功能。

PS：国内的话，还是非常推荐使用这个的。

## 一些优秀的能力

1. **高性能**：Druid 连接池被设计为高性能的连接池，具有优秀的连接获取、归还速度以及低延迟的特点，能够满足高并发的数据库访问需求。

2. **实时监控**：Druid 连接池提供了丰富的实时监控功能，能够实时地监控连接池的状态、性能指标以及数据库访问情况，帮助用户及时发现和解决潜在的问题。

3. **连接池扩展**：Druid 连接池支持连接池的动态扩展和收缩，能够根据实际的数据库访问负载自动调整连接池的大小，提高资源利用率。

4. **SQL防火墙**：Druid 连接池内置了 SQL 防火墙功能，能够对用户提交的 SQL 进行实时的安全检查和过滤，防止 SQL 注入等安全问题。

5. **连接泄漏检测**：Druid 连接池能够检测连接的泄漏情况，及时发现并处理连接未正确关闭的情况，防止因连接泄漏导致的数据库资源浪费和性能下降。

6. **完善的统计功能**：Druid 连接池提供了丰富的统计功能，能够统计连接池的使用情况、性能指标以及数据库访问情况，帮助用户深入了解数据库访问的情况。

7. **多数据源支持**：Druid 连接池支持多种类型的数据库，包括 MySQL、Oracle、PostgreSQL 等，能够灵活适应不同类型的数据库访问需求。

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

感兴趣的话，可以拓展一下：

[alibaba druid-01-intro 入门介绍](https://houbb.github.io/2020/07/17/dbcp-04-druid-01-intro)

[alibaba druid-02-FAQ druid 常见问题](https://houbb.github.io/2020/07/17/dbcp-04-druid-02-faq)

# druid+mysql 个人实战例子

这里以 durid 做一个实战例子，其他的也都大同小异。

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

我本来以为 druid 已经天下无敌了，没想到 HikariCP 更加勇猛。

HikariCP 是谁的部将？

# HikariCP

## 是什么？

快速、简单、可靠。HikariCP 是一个“零额外开销”的生产就绪的 JDBC 连接池。

该库大小约为130Kb，非常轻量级。

## 构件 Artifacts

**Java 11+** Maven 构件

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP</artifactId>
   <version>5.1.0</version>
</dependency>
```

Java 8 Maven 构件 (*维护模式*)

```xml
<dependency>
   <groupId>com.zaxxer</groupId>
   <artifactId>HikariCP</artifactId>
   <version>4.0.3</version>
</dependency>
```

## 配置使用

这个返回比较简单，都是统一的。

```java
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:mysql://localhost:3306/simpsons");
config.setUsername("bart");
config.setPassword("51mp50n");
config.addDataSourceProperty("cachePrepStmts", "true");
config.addDataSourceProperty("prepStmtCacheSize", "250");
config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

HikariDataSource ds = new HikariDataSource(config);
```

# Hikari 为什么这么快？

为什么 Hikari 可以做到性能基本无损耗？到底是如何实现的。

这也是本文的重点，也是老马为什么写这篇文章的原因。

## 🧠 我们深入到你的字节码中

为了使 HikariCP 的速度达到目前的水平，我们进行了字节码级别的工程处理，甚至更进一步。我们采用了我们所知的所有技巧来帮助 JIT 帮助您。

我们研究了编译器的字节码输出，甚至 JIT 的汇编输出，以将关键的程序例程限制在 JIT 内联阈值以下。

我们展平了继承层次结构，隐藏了成员变量，消除了类型转换。

## 🔬 微优化

HikariCP 包含许多微优化，单独看每个优化几乎无法测量，但总体上对性能有所提升。其中一些优化是以每百万次调用摊销的毫秒为单位进行度量的。

### ArrayList

一个非常重要（就性能而言）的优化是在用于跟踪打开的 Statement 实例的 ConnectionProxy 中消除对 `ArrayList<Statement>` 实例的使用。

当关闭 Statement 时，必须从此集合中删除它，当关闭 Connection 时，必须迭代该集合并关闭任何打开的 Statement 实例，最后必须清空该集合。对于一般用途而言，Java 的 ArrayList 每次执行 get(int index) 调用时都会进行范围检查，这是明智的做法。然而，由于我们可以对我们的范围提供保证，所以这个检查只是额外开销。

此外，remove(Object) 实现执行从头到尾的扫描，然而 JDBC 编程中常见的模式是在使用后立即关闭 Statement，或者按打开顺序的相反顺序关闭。对于这些情况，从尾部开始的扫描将执行得更好。

因此，`ArrayList<Statement>` 被替换为一个自定义类 FastList，它消除了范围检查，并执行从尾部到头部的移除扫描。

PS：这一点在很多工具中可以简单，相对是一个可以想到的优化方案。

### ConcurrentBag

HikariCP 包含一个名为 ConcurrentBag 的自定义无锁集合。这个想法是从 C# .NET 的 ConcurrentBag 类借来的，但内部实现是相当不同的。

ConcurrentBag 提供...

- 无锁设计

- 线程本地缓存

- 队列窃取

- 直接传递优化

...这导致了高度并发性、极低的延迟和最小化的伪共享现象的发生。

PS: 无锁乃是加锁的最高境界，值得以后统一深入学习一下。

### 调用：invokevirtual vs invokestatic

为了为 Connection、Statement 和 ResultSet 实例生成代理，HikariCP 最初使用一个单例工厂，ConnectionProxy 的情况下保存在静态字段（PROXY_FACTORY）中。

以下是十多个类似以下方法的方法：

```java
public final PreparedStatement prepareStatement(String sql, String[] columnNames) throws SQLException
{
    return PROXY_FACTORY.getProxyPreparedStatement(this, delegate.prepareStatement(sql, columnNames));
}
```

使用原始的单例工厂，生成的字节码如下所示：

```
    public final java.sql.PreparedStatement prepareStatement(java.lang.String, java.lang.String[]) throws java.sql.SQLException;
    flags: ACC_PRIVATE, ACC_FINAL
    Code:
      stack=5, locals=3, args_size=3
         0: getstatic     #59                 // Field PROXY_FACTORY:Lcom/zaxxer/hikari/proxy/ProxyFactory;
         3: aload_0
         4: aload_0
         5: getfield      #3                  // Field delegate:Ljava/sql/Connection;
         8: aload_1
         9: aload_2
        10: invokeinterface #74,  3           // InterfaceMethod java/sql/Connection.prepareStatement:(Ljava/lang/String;[Ljava/lang/String;)Ljava/sql/PreparedStatement;
        15: invokevirtual #69                 // Method com/zaxxer/hikari/proxy/ProxyFactory.getProxyPreparedStatement:(Lcom/zaxxer/hikari/proxy/ConnectionProxy;Ljava/sql/PreparedStatement;)Ljava/sql/PreparedStatement;
        18: return
```

可以看到首先是对静态字段 PROXY_FACTORY 的 getstatic 调用，以及（最后）对 ProxyFactory 实例上的 getProxyPreparedStatement() 的 invokevirtual 调用。

我们消除了单例工厂（由 Javassist 生成）并用具有静态方法的最终类替换了它（其方法体由 Javassist 生成）。

Java 代码变为：

```java
    public final PreparedStatement prepareStatement(String sql, String[] columnNames) throws SQLException
    {
        return ProxyFactory.getProxyPreparedStatement(this, delegate.prepareStatement(sql, columnNames));
    }
```

其中 getProxyPreparedStatement() 是在 ProxyFactory 类中定义的静态方法。生成的字节码如下所示：

```
private final java.sql.PreparedStatement prepareStatement(java.lang.String, java.lang.String[]) throws java.sql.SQLException;
flags: ACC_PRIVATE, ACC_FINAL
Code:
  stack=4, locals=3, args_size=3
     0: aload_0
     1: aload_0
     2: getfield      #3                  // Field delegate:Ljava/sql/Connection;
     5: aload_1
     6: aload_2
     7: invokeinterface #72,  3           // InterfaceMethod java/sql/Connection.prepareStatement:(Ljava/lang/String;[Ljava/lang/String;)Ljava/sql/PreparedStatement;
    12: invokestatic  #67                 // Method com/zaxxer/hikari/proxy/ProxyFactory.getProxyPreparedStatement:(Lcom/zaxxer/hikari/proxy/ConnectionProxy;Ljava/sql/PreparedStatement;)Ljava/sql/PreparedStatement;
    15: areturn
```

这里有三件事值得注意：

getstatic 调用消失了。

invokevirtual 调用被替换为更容易由 JVM 优化的 invokestatic 调用。

最后，可能乍一看没有注意到的是，栈的大小从 5 个元素减少到 4 个元素。这是因为在 invokevirtual 的情况下，隐式传递了 ProxyFactory 实例（即 this）到栈上，并且在调用 getProxyPreparedStatement() 时栈上的值还有一个额外的（看不见的）弹出操作。

总的来说，这个变化消除了一个静态字段访问，一个推送和从栈中弹出的操作，并且由于调用点保证不会更改，使得调用更容易由 JIT 进行优化。

PS: 老实说，这个优化点实在是太高了，有 15 楼那么高，一般开发者根本不会有这个高度。

## ¯\_(ツ)_/¯ 是的，但还是...

在我们的基准测试中，显然我们正在运行针对一个存根 JDBC 驱动程序实现，因此 JIT 进行了大量内联。

然而，在基准测试中，其他连接池也在存根级别进行相同的内联。所以，对我们来说没有固有的优势。

但是，在使用真实驱动程序时，内联肯定是方程式的重要部分，这引出了另一个话题...

### ⏱ 调度器量子

一些轻松的阅读材料。

总结起来，显然，当你“同时”运行 400 个线程时，除非你有 400 个核心，否则你实际上并没有“同时”运行它们。操作系统，利用 N 个 CPU 核心，在你的线程之间切换，给每个线程一个小的“切片”时间来运行，称为量子。

在许多应用程序中运行大量线程时，当你的时间片用完时（作为一个线程），可能要“很长时间”才能再次得到调度程序的运行机会。因此，在其时间片内，线程尽可能多地完成工作，避免强制放弃时间片的锁，否则将会产生性能损失。而且不是一点点。

这就引出了...

### 🐌 CPU 缓存行失效

当你无法在量子内完成工作时，另一个很大的影响就是 CPU 缓存行失效。

如果你的线程被调度程序抢占，当它再次有机会运行时，它经常访问的所有数据很可能不再位于核心的 L1 或核心对的 L2 缓存中。更有可能是因为你无法控制下次将被调度到哪个核心。

这两点涉及到一些计算机本身的知识，感兴趣的话，可以看一下老马的翻译文章：

[HikariCP 拓展阅读之伪共享 (False sharing)](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-03-ex-false-sharing)

[HikariCP 拓展阅读 cpu 调度 / CPU Scheduling](https://houbb.github.io/2020/07/17/dbcp-05-HikariCP-03-ex-cpu-scheduling)

伪共享这一点以前李大狗的数据结构源码解析中也提到过，算得上是优化底层的老油条了。

数据源写到这里基本结束了，但是呢。

**纸上得来终觉浅，绝知此事要躬行**。

如果让我们自己实现一个 dbcp 数据库连接池呢？

# 简单版手动实现

自己实现一个简化版，便于理解原理。

## 简单实现

- 连接池接口

```java
public interface IPool {
    /**
     * 获取新的数据库链接
     * @return 数据库链接
     */
    PoolConnection getPoolConnection();
}
```

其中 PoolConnection 如下:

```java
public class PoolConnection {
    /**
     * 是否繁忙
     */
    private volatile boolean isBusy;

    /**
     * 数据库链接信息
     */
    private Connection connection;
}
```

- 核心实现

```java
public class PoolImpl implements IPool {

    /**
     * 数据库驱动
     */
    private final String jdbcDriver;

    /**
     * 数据库连接
     */
    private final String jdbcUrl;

    /**
     * 数据库用户名
     */
    private final String username;

    /**
     * 数据库密码
     */
    private final String passowrd;

    /**
     * 连接池大小
     */
    private final int size;

    /**
     * 数据库连接池列表
     */
    private List<PoolConnection> poolConnections = new ArrayList<>();

    public PoolImpl(String jdbcDriver, String jdbcUrl, String username, String passowrd, int size) {
        this.jdbcDriver = jdbcDriver;
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.passowrd = passowrd;
        this.size = size;

        init();
    }

    private void init() {
        try {
            //1. 注册数据库连接信息
            Driver sqlDriver = (Driver) Class.forName(jdbcDriver).newInstance();
            DriverManager.registerDriver(sqlDriver);

            //2. 初始化连接池
            initConnectionPool();
        } catch (InstantiationException | IllegalAccessException | SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    /**
     * 初始化链接
     * @throws SQLException sql 异常
     */
    private void initConnectionPool() throws SQLException {
        for(int i = 0; i < size; i++) {
            Connection connection = DriverManager.getConnection(jdbcUrl, username, passowrd);
            PoolConnection poolConnection = new PoolConnection(false, connection);
            poolConnections.add(poolConnection);
        }
    }

    @Override
    public PoolConnection getPoolConnection() {
        if(poolConnections.size() <= 0) {
            return null;
        }

        PoolConnection poolConnection = getRealConnection();
        while (poolConnection == null) {
            try {
                TimeUnit.SECONDS.sleep(1);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            poolConnection = getRealConnection();
        }

        return poolConnection;
    }

    /**
     * 获取数据库链接对象
     * @return 数据库链接对象
     */
    private synchronized PoolConnection getRealConnection() {
        for(PoolConnection poolConnection : poolConnections) {
            // 寻找不处于繁忙状态的连接
            if(!poolConnection.isBusy()) {
                Connection connection = poolConnection.getConnection();

                // 测试当前连接是否有效
                try {
                    if(!connection.isValid(5000)) {
                        Connection validConnection = DriverManager.getConnection(jdbcUrl, username, passowrd);
                        poolConnection.setConnection(validConnection);
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                }

                // 设置为繁忙
                poolConnection.setBusy(true);
                return poolConnection;
            }
        }

        return null;
    }
}
```

- 线程池管理类

使用单例

```java
public class PoolManager {

    /**
     * 连接池持有类
     */
    private static class PoolHolder {
        private static String url = "";
        private static String driver = "";
        private static String username = "";
        private static String password = "";
        private static int size = 10;

        private static IPool poolImpl = new PoolImpl(driver, url, username, password, size);
    }

    /**
     * 内部类单利模式产生使用对象
     * @return 单例
     */
    public static IPool getInstance() {
        return PoolHolder.poolImpl;
    }
}
```

当然，上面的例子过于浅尝辄止，想深入学习，可以参考下下面的文章。

第一节 [从零开始手写 mybatis（一）MVP 版本](https://mp.weixin.qq.com/s/8eF7oFxgLsilqLYGOVtkGg)。

第二节 [从零开始手写 mybatis（二）mybatis interceptor 插件机制详解](https://mp.weixin.qq.com/s/83GzYTQCrWiEowN0gjll0Q)

第三节 [从零开始手写 mybatis（三）jdbc pool 从零实现数据库连接池](https://mp.weixin.qq.com/s/pO1XU_PD2pHyq-bBWMAP2w)

第四节 [从零开始手写 mybatis（四）- mybatis 事务管理机制详解](https://mp.weixin.qq.com/s/6Wa5AbOrg4MhRbZL674t8Q)


# 小结

数据库连接池在国内主流还是 druid，但是 HikariCP 可谓在设计上精益求精，值得我们深入学习其理念。

山高路远，行则将至。

* any list
{:toc}
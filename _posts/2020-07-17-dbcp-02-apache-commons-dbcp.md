---
layout: post
title:  apache commons-dbcp Apache Commons DBCP 软件实现数据库连接池  commons-dbcp2
date:  2020-7-17 16:52:15 +0800
categories: [Database]
tags: [database, sql, sh]
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


# DBCP组件

许多Apache项目支持与关系型数据库进行交互。为每个用户创建一个新连接可能很耗时（通常需要多秒钟的时钟时间），以执行可能需要毫秒级时间的数据库事务。对于一个公开托管在互联网上的应用程序，在同时在线用户数量可能非常大的情况下，为每个用户打开一个连接可能是不可行的。因此，开发人员通常希望在所有当前应用程序用户之间共享一组“池化”的打开连接。在任何给定时间实际执行请求的用户数量通常只是活跃用户总数的非常小的百分比，在请求处理期间是唯一需要数据库连接的时间。应用程序本身登录到DBMS，并在内部处理任何用户账户问题。

已经有几个数据库连接池可用，包括Apache产品内部和其他地方。这个Commons包提供了一个机会，来协调创建和维护一个高效、功能丰富的包，以Apache许可证发布。

commons-dbcp2依赖于commons-pool2中的代码，以提供底层的对象池机制。

## 不同版本

DBCP现在有四个不同的版本，支持不同版本的JDBC。

它的工作原理如下：

开发中

DBCP 2.5.0及以上版本在Java 8（JDBC 4.2）及以上版本下编译和运行。

DBCP 2.4.0在Java 7（JDBC 4.1）及以上版本下编译和运行。

运行中

应用程序运行在Java 8及以上版本的情况下，应使用DBCP 2.5.0及以上版本的二进制文件。
应用程序在Java 7下运行时应使用DBCP 2.4.0的二进制文件。
DBCP 2基于Apache Commons Pool，并提供了与DBCP 1.x相比性能增强、JMX支持以及许多其他新功能。升级到2.x的用户应该注意到Java包名称已更改，以及Maven坐标已更改，因为DBCP 2.x与DBCP 1.x不是二进制兼容的。用户还应该注意，一些配置选项（例如maxActive到maxTotal）已更名以与Commons Pool使用的新名称对齐。

# 入门例子

您可以从我们的下载页面下载源代码和二进制文件。

或者，您可以从中央 Maven 存储库中提取它：

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

### BasicDataSourceExample

这个是最基本的例子，不涉及任何池化能力。

```java
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

//
// Here are the dbcp-specific classes.
// Note that they are only used in the setupDataSource
// method. In normal use, your classes interact
// only with the standard JDBC API
//
import org.apache.commons.dbcp2.BasicDataSource;

//
// Here's a simple example of how to use the BasicDataSource.
//

//
// Note that this example is very similar to the PoolingDriver
// example.

//
// To compile this example, you'll want:
//  * commons-pool-2.3.jar
//  * commons-dbcp-2.1.jar 
// in your classpath.
//
// To run this example, you'll want:
//  * commons-pool-2.3.jar
//  * commons-dbcp-2.1.jar 
//  * commons-logging-1.2.jar
// in your classpath.
//
//
// Invoke the class using two arguments:
//  * the connect string for your underlying JDBC driver
//  * the query you'd like to execute
// You'll also want to ensure your underlying JDBC driver
// is registered.  You can use the "jdbc.drivers"
// property to do this.
//
// For example:
//  java -Djdbc.drivers=org.h2.Driver \
//       -classpath commons-pool2-2.3.jar:commons-dbcp2-2.1.jar:commons-logging-1.2.jar:h2-1.3.152.jar:. \
//       BasicDataSourceExample \
//       "jdbc:h2:~/test" \
//       "SELECT 1"
//
public class BasicDataSourceExample {

    public static void main(String[] args) {
        // First we set up the BasicDataSource.
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

    public static DataSource setupDataSource(String connectURI) {
        BasicDataSource ds = new BasicDataSource();
        ds.setDriverClassName("org.h2.Driver");
        ds.setUrl(connectURI);
        return ds;
    }

    public static void printDataSourceStats(DataSource ds) {
        BasicDataSource bds = (BasicDataSource) ds;
        System.out.println("NumActive: " + bds.getNumActive());
        System.out.println("NumIdle: " + bds.getNumIdle());
    }

    public static void shutdownDataSource(DataSource ds) throws SQLException {
        BasicDataSource bds = (BasicDataSource) ds;
        bds.close();
    }
}
```

### PoolingDataSourceExample

这里的 datasource 是池化的。

```java
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.sql.ResultSet;
import java.sql.SQLException;

//
// Here are the dbcp-specific classes.
// Note that they are only used in the setupDataSource
// method. In normal use, your classes interact
// only with the standard JDBC API
//
import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.dbcp2.ConnectionFactory;
import org.apache.commons.dbcp2.PoolableConnection;
import org.apache.commons.dbcp2.PoolingDataSource;
import org.apache.commons.dbcp2.PoolableConnectionFactory;
import org.apache.commons.dbcp2.DriverManagerConnectionFactory;

//
// Here's a simple example of how to use the PoolingDataSource.
//

//
// Note that this example is very similar to the PoolingDriver
// example.  In fact, you could use the same pool in both a
// PoolingDriver and a PoolingDataSource
//

//
// To compile this example, you'll want:
//  * commons-pool2-2.3.jar
//  * commons-dbcp2-2.1.jar
// in your classpath.
//
// To run this example, you'll want:
//  * commons-pool2-2.3.jar
//  * commons-dbcp2-2.1.jar
//  * commons-logging-1.2.jar
//  * the classes for your (underlying) JDBC driver
// in your classpath.
//
// Invoke the class using two arguments:
//  * the connect string for your underlying JDBC driver
//  * the query you'd like to execute
// You'll also want to ensure your underlying JDBC driver
// is registered.  You can use the "jdbc.drivers"
// property to do this.
//
// For example:
//  java -Djdbc.drivers=org.h2.Driver \
//       -classpath commons-pool2-2.3.jar:commons-dbcp2-2.1.jar:commons-logging-1.2.jar:h2-1.3.152.jar:. \
//       PoolingDataSourceExample \
//       "jdbc:h2:~/test" \
//       "SELECT 1"
//
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

### PoolingDriverExample.java

这里用的是 dbcp 的驱动实现池化的？

```java
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.apache.commons.dbcp2.ConnectionFactory;
import org.apache.commons.dbcp2.DriverManagerConnectionFactory;
import org.apache.commons.dbcp2.PoolableConnection;
import org.apache.commons.dbcp2.PoolableConnectionFactory;
import org.apache.commons.dbcp2.PoolingDriver;
//
// Here are the dbcp-specific classes.
// Note that they are only used in the setupDriver
// method. In normal use, your classes interact
// only with the standard JDBC API
//
import org.apache.commons.pool2.ObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPool;

//
// Here's a simple example of how to use the PoolingDriver.
//

// To compile this example, you'll want:
//  * commons-pool-2.3.jar
//  * commons-dbcp-2.1.jar 
// in your classpath.
//
// To run this example, you'll want:
//  * commons-pool-2.3.jar
//  * commons-dbcp-2.1.jar 
//  * commons-logging-1.2.jar
// in your classpath.
//
// Invoke the class using two arguments:
//  * the connect string for your underlying JDBC driver
//  * the query you'd like to execute
// You'll also want to ensure your underlying JDBC driver
// is registered.  You can use the "jdbc.drivers"
// property to do this.
//
// For example:
//  java -Djdbc.drivers=org.h2.Driver \
//       -classpath commons-pool2-2.3.jar:commons-dbcp2-2.1.jar:commons-logging-1.2.jar:h2-1.3.152.jar:. \
//       PoolingDriverExample \
//       "jdbc:h2:~/test" \
//       "SELECT 1"
//
public class PoolingDriverExample {

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
        // Then we set up and register the PoolingDriver.
        // Normally this would be handled auto-magically by
        // an external configuration, but in this example we'll
        // do it manually.
        //
        System.out.println("Setting up driver.");
        try {
            setupDriver(args[0]);
        } catch (Exception e) {
            e.printStackTrace();
        }
        System.out.println("Done.");

        //
        // Now, we can use JDBC as we normally would.
        // Using the connect string
        //  jdbc:apache:commons:dbcp:example
        // The general form being:
        //  jdbc:apache:commons:dbcp:<name-of-pool>
        //

        Connection conn = null;
        Statement stmt = null;
        ResultSet rset = null;

        try {
            System.out.println("Creating connection.");
            conn = DriverManager.getConnection("jdbc:apache:commons:dbcp:example");
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

        // Display some pool statistics
        try {
            printDriverStats();
        } catch (Exception e) {
            e.printStackTrace();
        }

        // closes the pool
        try {
            shutdownDriver();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void setupDriver(String connectURI) throws Exception {
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
        // Next, we'll create the PoolableConnectionFactory, which wraps
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
        // Finally, we create the PoolingDriver itself...
        //
        Class.forName("org.apache.commons.dbcp2.PoolingDriver");
        PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");

        //
        // ...and register our pool with it.
        //
        driver.registerPool("example", connectionPool);

        //
        // Now we can just use the connect string "jdbc:apache:commons:dbcp:example"
        // to access our pool of Connections.
        //
    }

    public static void printDriverStats() throws Exception {
        PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");
        ObjectPool<? extends Connection> connectionPool = driver.getConnectionPool("example");

        System.out.println("NumActive: " + connectionPool.getNumActive());
        System.out.println("NumIdle: " + connectionPool.getNumIdle());
    }

    public static void shutdownDriver() throws Exception {
        PoolingDriver driver = (PoolingDriver) DriverManager.getDriver("jdbc:apache:commons:dbcp:");
        driver.closePool("example");
    }
}
```


# BasicDataSource Configuration Parameters 配置项参数

| 参数名              | 描述                                                         |
|-----------------|------------------------------------------------------------|
| username        | 传递给我们的JDBC驱动程序以建立连接的连接用户名。                       |
| password        | 传递给我们的JDBC驱动程序以建立连接的连接密码。                         |
| url             | 传递给我们的JDBC驱动程序以建立连接的连接URL。                        |
| driverClassName | 要使用的JDBC驱动程序的完全限定的Java类名。                                |
| connectionProperties | 建立新连接时将发送给我们的JDBC驱动程序的连接属性。 字符串的格式必须为[propertyName=property;]*。 “user”和“password”属性将被显式传递，因此不需要在此处包含它们。               |


| 参数名                           | 默认值        | 描述                                                                                                         |
|--------------------------------|--------------|-------------------------------------------------------------------------------------------------------------|
| defaultAutoCommit               | 驱动程序默认值 | 由该池创建的连接的默认自动提交状态。如果未设置，则不会调用setAutoCommit方法。                                               |
| defaultReadOnly                | 驱动程序默认值 | 由该池创建的连接的默认只读状态。如果未设置，则不会调用setReadOnly方法。（某些驱动程序不支持只读模式，例如：Informix）                                  |
| defaultTransactionIsolation     | 驱动程序默认值 | 由该池创建的连接的默认事务隔离状态。NONE/READ_COMMITTED/READ_UNCOMMITTED/REPEATABLE_READ/SERIALIZABLE                                                    |
| defaultCatalog                  | 无            | 由该池创建的连接的默认目录。                                                                                     |
| cacheState                      | true         | 如果为true，则池化连接在首次读取或写入时将缓存当前的readOnly和autoCommit设置，并在所有后续写入时也会缓存。这消除了对于任何进一步调用getter的额外数据库查询的需要。如果直接访问底层连接并更改readOnly和/或autoCommit设置，则缓存的值将不会反映当前状态。在这种情况下，应通过将此属性设置为false来禁用缓存。 |
| defaultQueryTimeout            | null         | 如果非null，则该Integer属性的值确定由池管理的连接创建的语句的查询超时。null意味着将使用驱动程序默认值。                                                    |
| enableAutoCommitOnReturn       | true         | 如果为true，则返回池的连接将被检查并配置为Connection.setAutoCommit(true)，如果连接在返回时的自动提交设置为false。                                                  |
| rollbackOnReturn               | true         | 如果auto commit未启用且连接不是只读，则返回池时连接将回滚。true表示连接在返回池时将被回滚。                                                                          |


| 参数名          | 默认值     | 描述                                                                                                                       |
|---------------|------------|--------------------------------------------------------------------------------------------------------------------------|
| initialSize   | 0          | 当池启动时创建的连接的初始数量。                                                                                                     |
|               |            | 自1.2版本开始                                                                                                               |
| maxTotal      | 8          | 可以同时从该池中分配的活动连接的最大数量，或负数表示没有限制。                                                                                   |
| maxIdle       | 8          | 池中可以保持空闲的最大连接数，而无需释放额外的连接，或负数表示没有限制。                                                                               |
| minIdle       | 0          | 池中可以保持空闲的最小连接数，而无需创建额外的连接，或零表示不创建任何连接。                                                                               |
| maxWaitMillis | 无限期      | 在没有可用连接时，池将等待连接被返回的最大毫秒数，然后抛出异常，或者-1表示无限期等待。                                                                             |

注意：如果在负载较重的系统上将maxIdle设置得太低，可能会看到连接被关闭，几乎立即又打开了新连接。这是由于活动线程暂时关闭连接的速度比打开连接的速度快，导致空闲连接数超过了maxIdle。对于负载较重的系统，maxIdle的最佳值会有所不同，但默认值是一个很好的起点。

| 参数名                                | 默认值        | 描述                                                                                                                                  |
|-------------------------------------|--------------|-------------------------------------------------------------------------------------------------------------------------------------|
| validationQuery                     | 无            | 用于在将连接返回给调用方之前验证该池中连接的SQL查询。如果指定，此查询必须是一个至少返回一行的SQL SELECT语句。如果未指定，将通过调用isValid()方法来验证连接。                                         |
| validationQueryTimeout              | 无超时        | 连接验证查询失败之前的超时时间（以秒为单位）。如果设置为正值，该值将通过用于执行验证查询的Statement的setQueryTimeout方法传递给驱动程序。                                                         |
| testOnCreate                        | false        | 表示在创建对象后是否进行验证。如果对象验证失败，则触发对象创建的借用尝试将失败。                                                                                                           |
| testOnBorrow                        | true         | 表示在从池中借出对象之前是否进行验证。如果对象验证失败，则该对象将从池中移除，然后我们将尝试借用另一个对象。                                                                                         |
| testOnReturn                        | false        | 表示在将对象返回池之前是否进行验证。                                                                                                                                                      |
| testWhileIdle                       | false        | 表示是否由空闲对象逐出器（如果有）验证对象。如果对象验证失败，则该对象将从池中移除。                                                                                                            |
| timeBetweenEvictionRunsMillis       | -1           | 空闲对象逐出器线程运行之间的睡眠毫秒数。当非正值时，将不会运行空闲对象逐出器线程。                                                                                                                  |
| numTestsPerEvictionRun              | 3            | 空闲对象逐出器线程（如果有）在每次运行时检查的对象数量。                                                                                                                                             |
| minEvictableIdleTimeMillis          | 1000 * 60 * 30 | 对象在池中闲置多长时间后，才有资格被空闲对象逐出器（如果有）逐出的最短时间（以毫秒为单位）。                                                                                                      |
| softMinEvictableIdleTimeMillis      | -1           | 连接在池中闲置多长时间后，才有资格由空闲连接逐出器逐出的最短时间（以毫秒为单位），并且至少要求池中保留“minIdle”个连接。当minEvictableIdleTimeMillis设置为正值时，空闲连接逐出器首先检查minEvictableIdleTimeMillis - 即当空闲连接被逐出器访问时，首先将空闲时间与minEvictableIdleTimeMillis进行比较（不考虑池中的空闲连接数量），然后与softMinEvictableIdleTimeMillis进行比较，包括minIdle约束。 |
| maxConnLifetimeMillis               | -1           | 连接的最大生命周期（以毫秒为单位）。超过此时间后，连接将在下一次激活、钝化或验证测试时失败。零或更小的值表示连接的生命周期无限期。                                                                                                     |
| logExpiredConnections               | true         | 标志以记录消息，指示连接由于超过maxConnLifetimeMillis而被池关闭。将此属性设置为false可抑制默认打开的过期连接日志记录。                                                                                                            |
| connectionInitSqls                  | null         | 当首次创建物理连接时将用于初始化连接的SQL语句集合。这些语句仅在配置的连接工厂创建连接时执行一次。                                                                                                     |
| lifo                                | true         | true表示borrowObject返回池中最近使用的（“最后进入”）连接（如果有可用的空闲连接）。false表示池行为类似于FIFO队列 - 从空闲实例池中获取连接的顺序与它们返回到池中的顺序相同。                                                                    |


| 参数名                      | 默认值       | 描述                                                                        |
|--------------------------|-------------|----------------------------------------------------------------------------|
| poolPreparedStatements   | false       | 启用此池的预编译语句池。                                                              |
| maxOpenPreparedStatements | 无限制        | 可以同时从语句池中分配的打开语句的最大数量，或负数表示没有限制。                                                     |

此组件还具有池化PreparedStatements的能力。启用后，将为每个连接创建一个语句池，并且由以下方法之一创建的PreparedStatements将被池化：

- `public PreparedStatement prepareStatement(String sql)`
- `public PreparedStatement prepareStatement(String sql, int resultSetType, int resultSetConcurrency)`

注意 - 确保您的连接还有一些资源供其他语句使用。

池化PreparedStatements可能会在数据库中保持它们的游标打开，导致连接用完游标，特别是如果maxOpenPreparedStatements保持默认值（无限制），并且应用程序对每个连接打开大量不同的PreparedStatements。

为避免此问题，maxOpenPreparedStatements应设置为小于连接上可以打开的最大游标数的值。

| 参数名                              | 默认值      | 描述                                                     |
|-----------------------------------|------------|--------------------------------------------------------|
| accessToUnderlyingConnectionAllowed | false      | 控制PoolGuard是否允许访问底层连接。                                |

允许时，您可以使用以下结构访问底层连接：

```java
Connection conn = ds.getConnection();
Connection dconn = ((DelegatingConnection) conn).getInnermostDelegate();
// ...
conn.close();
```

默认值为false，这是一个潜在的危险操作，不正确的程序可能会做出有害的事情。（关闭底层连接或在保护的连接已关闭时继续使用它）请小心，只有在需要直接访问驱动程序特定扩展时才使用。

注意：不要关闭底层连接，只关闭原始连接。

| 参数名                           | 默认值       | 描述                                                                                                                                                                                                                                                                                                                |
|--------------------------------|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| removeAbandonedOnBorrow         | false       | 如果连接超过removeAbandonedTimeout，则标记为移除废弃的连接。如果连接在removeAbandonedTimeout之后没有被使用，则认为它是废弃的并且可以被移除。创建Statement、PreparedStatement或CallableStatement，或使用其中的一个来执行查询（使用execute方法之一）会重置父连接的lastUsed属性。将其中一个或两个设置为true可以从未能关闭连接的糟糕编写的应用程序中恢复db连接。 |
| removeAbandonedOnMaintenance    | false       | 如果设置为true，则在维护周期（当逐出结束时）移除废弃的连接。除非通过将timeBetweenEvictionRunsMillis设置为正值启用维护，否则此属性无效。                                                                                                                                                                                                |
| removeAbandonedTimeout          | 300         | 废弃的连接可以被移除之前的超时时间（以秒为单位）。                                                                                                                                                                                                                                                                   |
| logAbandoned                    | false       | 是否记录应用程序代码放弃了Statement或Connection的堆栈跟踪的标志。放弃的Statements和Connections的记录会增加每次打开连接或新建Statement时的开销，因为必须生成堆栈跟踪。                                                                                                                                                      |
| abandonedUsageTracking          | false       | 如果为true，连接池在每次对池化连接调用方法时记录堆栈跟踪，并保留最近的堆栈跟踪以帮助调试废弃的连接。设置为true会增加显著的开销。                                                                                                                                                                                               |

如果您已启用了removeAbandonedOnMaintenance或removeAbandonedOnBorrow，则可能会由于被视为废弃而被池重新获取连接。当 (getNumIdle() < 2) 且 (getNumActive() > getMaxTotal() - 3) 且 removeAbandonedOnBorrow 为true时，或者在逐出完成并且 removeAbandonedOnMaintenance 为true时，触发此机制。

例如，如果maxTotal=20，有18个活动连接和1个空闲连接，则会触发removeAbandonedOnBorrow，但只有超过"removeAbandonedTimeout"秒（默认为300秒）未被使用的活动连接才会被移除。遍历结果集不被视为被使用。

创建Statement、PreparedStatement或CallableStatement，或使用其中的一个来执行查询（使用execute方法之一）会重置父连接的lastUsed属性。

| 参数名                       | 默认值    | 描述                                                                                                                                                                                                                                              |
|----------------------------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| fastFailValidation         | false    | 当此属性为true时，对于已经抛出“致命”SQLExceptions的连接，快速验证失败。对于已断开连接的连接，立即失败，不调用驱动程序的isValid方法，也不尝试执行验证查询。默认情况下，被视为信号致命错误的SQL_STATE代码如下：57P01（ADMIN SHUTDOWN）、57P02（CRASH SHUTDOWN）、57P03（CANNOT CONNECT NOW）、01002（SQL92断开连接错误）、JZ0C0（Sybase断开连接错误）、JZ0C1（Sybase断开连接错误）。任何以"08"开头的SQL_STATE代码。要覆盖此默认断开连接代码集，请设置disconnectionSqlCodes属性。 |
| disconnectionSqlCodes      | null     | 逗号分隔的SQL_STATE代码列表，被视为信号致命的断开连接错误。除非将fastFailValidation设置为true，否则设置此属性无效。                                                                                                                                                                                       |
| jmxName                    |          | 将DataSource注册为指定名称的JMX MBean。名称必须符合JMX对象名称语法（参见javadoc）。                                                                                                                                                                       |
| registerConnectionMBean    | true     | 注册Connection JMX MBeans。请参阅DBCP-585。                                                                                                                                                                                                        |


# chat

## 详细介绍一下 apache commons dbcp

Apache Commons DBCP（数据库连接池，Database Connection Pool）是 Apache 软件基金会的一个子项目，提供了一个可靠的 JDBC 连接池实现。

它是 Java 中最受欢迎的连接池之一，被广泛应用于各种类型的 Java 应用程序中。

下面是关于 Apache Commons DBCP 的详细介绍：

1. **功能特点：**
   - 连接池管理：Apache Commons DBCP 提供了连接池管理功能，包括连接的创建、销毁、复用等。
   - 连接可配置性：用户可以根据需要配置连接池的参数，例如最大连接数、最小连接数、连接超时时间、空闲连接超时时间等。
   - 连接状态监控：DBCP 允许用户监控连接池的状态，包括活动连接数、空闲连接数、连接等待时间等。
   - 连接验证：DBCP 支持连接的验证功能，可以确保从连接池中获取的连接是有效的。
   - 连接池复用：DBCP 允许连接的复用，避免了频繁地创建和销毁连接，提高了性能。

2. **配置灵活性：** Apache Commons DBCP 允许用户通过配置文件或者编程方式来配置连接池的参数，使得连接池的行为可以根据具体的需求进行定制。

3. **可集成性：** DBCP 可以很容易地集成到各种类型的 Java 应用程序中，无论是基于 Servlet 容器的 Web 应用程序，还是独立的 Java 应用程序。

4. **与其他 Apache 项目的整合：** Apache Commons DBCP 与其他 Apache 项目（如 Tomcat）紧密相关，因此在与这些项目一起使用时非常方便。

5. **性能和稳定性：** 虽然 DBCP 的性能可能不如一些其他连接池（比如 HikariCP），但它在稳定性和可靠性方面表现良好，被广泛用于生产环境中。

6. **社区支持：** 作为 Apache 项目的一部分，DBCP 拥有活跃的社区支持和维护，用户可以通过官方文档、邮件列表、社区论坛等获取支持和帮助。

总的来说，Apache Commons DBCP 是一个稳定、可靠的 JDBC 连接池实现，适用于各种规模和类型的 Java 应用程序。

它的灵活性和可配置性使得用户可以根据具体需求来定制连接池的行为，而其与其他 Apache 项目的整合也使得它在特定的场景下具有更大的优势。

## 入门例子

以下是一个简单的 Apache Commons DBCP 的入门示例，演示了如何使用 DBCP 创建一个基本的数据库连接池并从中获取连接：

```java
import org.apache.commons.dbcp2.BasicDataSource;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class Main {
    public static void main(String[] args) {
        // 创建一个 BasicDataSource 对象，用于管理数据库连接池
        BasicDataSource dataSource = new BasicDataSource();
        
        // 配置数据库连接信息
        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://localhost:3306/mydatabase");
        dataSource.setUsername("username");
        dataSource.setPassword("password");
        
        // 配置连接池的一些参数
        dataSource.setInitialSize(5); // 初始化连接数
        dataSource.setMaxTotal(10); // 最大连接数
        dataSource.setMaxIdle(5); // 最大空闲连接数
        dataSource.setMinIdle(2); // 最小空闲连接数
        dataSource.setMaxWaitMillis(5000); // 获取连接的最大等待时间（毫秒）
        
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            // 从连接池获取连接
            connection = dataSource.getConnection();
            
            // 使用连接执行 SQL 查询
            String sql = "SELECT * FROM my_table";
            preparedStatement = connection.prepareStatement(sql);
            resultSet = preparedStatement.executeQuery();
            
            // 处理查询结果
            while (resultSet.next()) {
                // 处理每一行数据
                // 示例：假设查询结果中有一个名为 "column_name" 的列
                String value = resultSet.getString("column_name");
                System.out.println(value);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // 关闭连接、语句和结果集
            try { if (resultSet != null) resultSet.close(); } catch (SQLException e) { e.printStackTrace(); }
            try { if (preparedStatement != null) preparedStatement.close(); } catch (SQLException e) { e.printStackTrace(); }
            try { if (connection != null) connection.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
```

在这个示例中，我们首先创建了一个 `BasicDataSource` 对象，然后配置了数据库连接信息和连接池参数。

接着，我们通过 `getConnection()` 方法从连接池获取连接，然后使用连接执行 SQL 查询。

最后，我们在使用完连接后，关闭了连接、语句和结果集，以释放资源。

请注意，这只是一个简单的入门示例。在实际项目中，您可能需要根据具体情况对代码进行修改和扩展，例如处理连接池的初始化和关闭、处理数据库操作中的异常等。

## apache commons dbcp 是支持池化 databsource 和 driver 两种方式吗？为什么？

Apache Commons DBCP 支持池化 `DataSource`，而不支持池化 `Driver`。

这是因为在 JDBC 中，连接池化的主要目的是管理连接对象，而不是驱动程序对象。

下面是为什么 Apache Commons DBCP 支持池化 `DataSource` 而不支持池化 `Driver` 的原因：

1. **DataSource vs. Driver：** 
   - `DataSource` 是用于获取数据库连接的接口，它通常包含了获取连接所需的全部信息，比如数据库 URL、用户名、密码等。连接池化的主要目的是管理和复用这些连接对象，以提高性能和资源利用率。
   - `Driver` 是 JDBC 驱动程序的接口，用于连接 Java 程序与具体的数据库。`Driver` 负责建立与数据库的连接，但它通常只在应用程序启动时被加载一次，并在整个应用程序的生命周期内被共享使用，而不需要连接池来管理。

2. **资源复用：**
   - 连接对象 (`Connection`) 是在应用程序与数据库之间进行通信的关键资源，它的创建和销毁可能会带来性能开销。连接池化的目的是重复利用这些连接对象，避免频繁地创建和销毁。
   - 相比之下，`Driver` 对象通常在应用程序启动时被加载一次，并且在应用程序的生命周期内保持不变。因此，没有必要对 `Driver` 进行池化，因为它不是一种需要频繁创建和销毁的资源。

综上所述，Apache Commons DBCP 支持池化 `DataSource` 而不支持池化 `Driver`，是基于连接对象是通常需要池化和管理的资源，而驱动程序对象则不是这种类型的资源的考虑。

## apache commons dbcp  中 这两个类 PoolingDataSource 和 PoolingDriver 介绍一下，区别？

在 Apache Commons DBCP 中，`PoolingDataSource` 和 `PoolingDriver` 是两个用于连接池化的类，它们的作用和使用场景有所不同。

以下是对它们的介绍和区别：

1. **PoolingDataSource：**
   - `PoolingDataSource` 是 Apache Commons DBCP 提供的一个类，用于管理和提供连接池化的 `DataSource` 实例。
   - 它通常用于在应用程序中直接使用，作为获取数据库连接的入口点。
   - `PoolingDataSource` 在内部维护了一个连接池，并提供了从连接池获取连接、释放连接等方法，使得应用程序可以通过它来获取数据库连接而无需关心连接池的具体实现细节。
   - 使用 `PoolingDataSource` 可以轻松地实现连接池化，提高数据库连接的性能和资源利用率。

2. **PoolingDriver：**
   - `PoolingDriver` 是 Apache Commons DBCP 提供的一个 JDBC 驱动程序，用于实现对 JDBC 连接的池化。
   - 它通常用于需要在现有的 JDBC 应用程序中添加连接池支持的场景。
   - `PoolingDriver` 通过注册为 JDBC 驱动程序，拦截 `DriverManager` 对数据库连接的请求，将这些请求转发给内部的连接池，并从池中获取连接返回给应用程序。
   - 使用 `PoolingDriver` 可以在不修改现有代码的情况下，为 JDBC 应用程序添加连接池支持，提高性能和资源利用率。

**区别：**
- 主要区别在于它们的作用对象不同：`PoolingDataSource` 是用于池化 `DataSource` 实例，而 `PoolingDriver` 是用于池化 JDBC 连接。
- `PoolingDataSource` 是一个独立的类，用于管理和提供连接池化的 `DataSource` 实例，而 `PoolingDriver` 是一个 JDBC 驱动程序，用于实现对 JDBC 连接的池化，并通过 JDBC 驱动程序的方式来实现连接池化。



## 配置

[配置](https://commons.apache.org/proper/commons-dbcp/configuration.html)

# 参考资料

https://github.com/apache/commons-dbcp

https://commons.apache.org/proper/commons-dbcp/configuration.html

* any list
{:toc}
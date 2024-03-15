---
layout: post
title:  Database Connection Pool 数据库连接池-01-概览
date:  2020-7-17 16:52:15 +0800
categories: [database]
tags: [database, sql, pool, dbcp, sh]
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

# 中间件

常见实现对比

![20180904-dbcp-compare.png](https://raw.githubusercontent.com/houbb/resource/master/img/database/pool/20180904-dbcp-compare.png)

参考网上资料Druid > TomcatJDBC > DBCP > C3P0，BoneCP 的性能方面没有深入比较，应该和 Tomcat Jdbc 差不多。

对于小型的系统，并发压力不大时，选择哪一种数据库连接池差别不会很大，主要考虑的应该是连接池的稳定性。

当并发量较高时，一般不会选择使用 DBCP 和C3P0，选 Druid 是较好的。

# 手动实现

自己实现一个简化版，便于理解原理。

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

# chat

## 详细介绍一下数据库连接池

数据库连接池是一种用于管理数据库连接的技术，它能够有效地管理和分配数据库连接，以提高应用程序对数据库的性能和可伸缩性。数据库连接池通常是在应用程序和数据库之间的中间层，它存储了一组预先创建好的数据库连接，并在需要时将它们提供给应用程序使用，而不需要每次都重新创建连接。

以下是数据库连接池的一些详细介绍：

1. **连接的创建和销毁：** 当应用程序需要与数据库进行通信时，它会从连接池中获取一个可用的数据库连接。如果连接池中没有可用的连接，则根据需要创建新的连接。连接使用完毕后，会被释放回连接池而不是被关闭，以便以后重用。这样可以避免频繁地创建和销毁连接，从而提高性能。

2. **连接的复用：** 连接池会重复利用连接。当应用程序释放一个连接回连接池时，连接池会重新初始化这个连接，以确保它处于一个良好的状态，然后将其放回到可用连接池中等待下一次请求。

3. **连接的管理：** 连接池会负责管理连接的状态，包括连接是否有效、是否超时等。一些连接池还提供了监控和统计功能，以便管理员可以监视连接的使用情况和性能。

4. **连接的限制：** 为了防止过多的连接占用数据库资源，连接池通常会限制连接的数量。这个限制可以是连接的总数、每个用户的连接数，或者其他类型的限制。

5. **连接的配置：** 连接池通常允许管理员配置连接的参数，例如最大连接数、最小连接数、连接超时时间、空闲连接超时时间等。这些参数可以根据应用程序的需求和数据库的性能来进行调整。

6. **连接的性能优化：** 通过使用连接池，可以减少连接的创建和销毁次数，从而减少了与数据库的通信开销。此外，连接池还可以通过预先创建连接、连接的复用等技术来优化性能，使得应用程序能够更快地获取到数据库连接。

总的来说，数据库连接池是一种重要的技术，能够有效地管理数据库连接，提高应用程序的性能和可伸缩性，减少与数据库的通信开销，同时也能够保护数据库免受过多连接的影响。

## 常见的优秀开源组件有哪些？

有关数据库连接池的优秀开源组件，以下是一些常见的选择：

1. **HikariCP：** HikariCP 是一个高性能的 JDBC 连接池，被广泛认为是目前性能最好的 JDBC 连接池之一。它具有快速启动、低资源消耗和高性能等特点，适用于各种规模的应用程序。

2. **Apache Commons DBCP：** Apache Commons DBCP 是 Apache 软件基金会的一个子项目，提供了一个可靠的 JDBC 连接池实现。它支持基本的连接池功能，并且易于集成到各种 Java 应用程序中。

3. **Tomcat JDBC Pool：** Tomcat JDBC Pool 是 Apache Tomcat 项目的一个组件，提供了一个可靠的 JDBC 连接池实现。它专为在 Tomcat 环境下使用而设计，但也可以作为独立的连接池使用。

4. **H2 Database Connection Pool：** H2 Database 是一个嵌入式数据库，它也提供了一个简单而有效的 JDBC 连接池实现。虽然它主要用于嵌入式数据库的应用场景，但也可以作为独立的连接池使用。

5. **c3p0：** c3p0 是一个流行的 JDBC 连接池实现，具有丰富的配置选项和可靠的性能。它支持连接池的高度定制，并且在很多企业级应用中被广泛使用。

6. **Druid：** Druid 是阿里巴巴开源的一个数据库连接池实现，它不仅提供了连接池功能，还提供了监控、统计、防火墙等高级功能。Druid 被广泛应用于大型互联网企业的生产环境中。

这些开源组件各有特点，选择合适的连接池取决于项目的需求、性能要求和技术栈。

## 给出上述组件详细的对比表格

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

这个对比表格可以帮助您更好地理解各个数据库连接池组件之间的区别和特点，以便根据您的具体需求选择合适的组件。

# 参考资料

https://my.oschina.net/lgscofield/blog/471187

https://www.codetd.com/article/571174

https://blog.csdn.net/leonardc/article/details/79377021

https://blog.csdn.net/yingfengjia520/article/details/78235843

https://blog.csdn.net/qq_16038125/article/details/80180941

* any list
{:toc}
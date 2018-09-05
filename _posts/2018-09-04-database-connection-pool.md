---
layout: post
title:  Database Connection Pool
date:  2018-09-04 14:12:30 +0800
categories: [database]
tags: [database, sql, pool, sh]
published: true
excerpt: 数据库连接池
---

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

# 参考资料

https://my.oschina.net/lgscofield/blog/471187

https://www.codetd.com/article/571174

https://blog.csdn.net/leonardc/article/details/79377021

https://blog.csdn.net/yingfengjia520/article/details/78235843

https://blog.csdn.net/qq_16038125/article/details/80180941

* any list
{:toc}
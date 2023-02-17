---
layout: post
title:  JCIP-21-thread pool 手写线程池
date:  2019-1-18 11:21:15 +0800
categories: [Concurrency]
tags: [thread, concurrency, thread, sh]
published: true
excerpt: JCIP-21-thread pool 手写线程池
---

# 手写线程池

本文描述了线程池的核心类。

从原理理解线程池

## 线程池的作用

- 降低资源消耗。

通过重复利用已创建的线程降低线程创建和销毁造成的消耗。

- 提高响应速度。

当任务到达时，任务可以不需要的等到线程创建就能立即执行。

- 提高线程的可管理性。

线程是稀缺资源，如果无限制的创建，不仅会消耗系统资源，还会降低系统的稳定性，使用线程池可以进行统一的分配，调优和监控。

# 代码的实现

## IPool-线程池接口 

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * fake All rights reserved.
 */

package com.github.houbb.fake.dbcp;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/8/16 下午2:13  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public interface IPool {

    /**
     * 获取新的数据库链接
     * @return 数据库链接
     */
    PoolConnection getPoolConnection();


}
```

## PoolConnection-线程池连接对象 

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * fake All rights reserved.
 */

package com.github.houbb.fake.dbcp;

import java.sql.Connection;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/8/16 下午2:11  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
public class PoolConnection {

    /**
     * 是否繁忙
     */
    private volatile boolean isBusy;

    /**
     * 数据库链接信息
     */
    private Connection connection;

    public PoolConnection(boolean isBusy, Connection connection) {
        this.isBusy = isBusy;
        this.connection = connection;
    }

    public boolean isBusy() {
        return isBusy;
    }

    public void setBusy(boolean busy) {
        isBusy = busy;
    }

    public Connection getConnection() {
        return connection;
    }

    public void setConnection(Connection connection) {
        this.connection = connection;
    }

}
```

## PoolImpl-线程池实现

```java
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/8/16 下午2:16  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
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

## PoolManager-线程池管理类

```java
/*
 * Copyright (c)  2018. houbinbin Inc.
 * fake All rights reserved.
 */

package com.github.houbb.fake.dbcp;

/**
 * <p> </p>
 *
 * <pre> Created: 2018/8/16 下午2:43  </pre>
 * <pre> Project: fake  </pre>
 *
 * @author houbinbin
 * @version 1.0
 * @since JDK 1.7
 */
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


* any list
{:toc}


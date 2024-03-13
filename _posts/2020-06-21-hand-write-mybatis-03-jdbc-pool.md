---
layout: post
title:  从零开始手写 mybatis （三）jdbc pool 如何从零手写实现数据库连接池 dbcp？
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, jdbc, dbcp, sh]
published: true
---


## 拓展阅读

第一节 [从零开始手写 mybatis（一）MVP 版本](https://mp.weixin.qq.com/s/8eF7oFxgLsilqLYGOVtkGg) 中我们实现了一个最基本的可以运行的 mybatis。

第二节 [从零开始手写 mybatis（二）mybatis interceptor 插件机制详解](https://mp.weixin.qq.com/s/83GzYTQCrWiEowN0gjll0Q)

第三节 [从零开始手写 mybatis（三）jdbc pool 从零实现数据库连接池](https://mp.weixin.qq.com/s/pO1XU_PD2pHyq-bBWMAP2w)

第四节 [从零开始手写 mybatis（四）- mybatis 事务管理机制详解](https://mp.weixin.qq.com/s/6Wa5AbOrg4MhRbZL674t8Q)

本节我们一起来看一下如何实现一个数据库连接池。

## 为什么需要连接池？

数据库连接的创建是非常耗时的一个操作，在高并发的场景，如果每次对于数据库的访问都重新创建的话，成本太高。

于是就有了“池化”这种解决方案。

这种方案在我们日常生活中也是比比皆是，比如资金池，需求池，乃至人力资源池。

思想都是共通的。

我们本节一起来从零实现一个简易版本的数据库连接池，不过麻雀虽小，五脏俱全。

将从以下几个方面来展开：

（1）普通的数据库连接创建

（2）自动适配 jdbc 驱动

（3）指定大小的连接池创建

（4）获取连接时添加超时检测

（5）添加对于连接有效性的检测

## 普通的数据库连接创建

这种就是最普通的不适用池化的实现。

### 实现

mybatis 默认其实也是这种实现，不过我们在这个基础上做了一点优化，那就是可以根据 url 自动适配 driverClass。

```java
public class UnPooledDataSource extends AbstractDataSourceConfig {

    @Override
    public Connection getConnection() throws SQLException {
        DriverClassUtil.loadDriverClass(super.driverClass, super.jdbcUrl);

        return DriverManager.getConnection(super.getJdbcUrl(),
                super.getUser(), super.getPassword());
    }

}
```

### 自动适配

这个特性主要是参考阿里的 druid 连接池实现，在用户没有指定驱动类时，自动适配。

核心代码如下：

```java
/**
 * 加载驱动类信息
 * @param driverClass 驱动类
 * @param url 连接信息
 * @since 1.2.0
 */
public static void loadDriverClass(String driverClass, final String url) {
    ArgUtil.notEmpty(url, url);
    if(StringUtil.isEmptyTrim(driverClass)) {
        driverClass = getDriverClassByUrl(url);
    }
    try {
        Class.forName(driverClass);
    } catch (ClassNotFoundException e) {
        throw new JdbcPoolException(e);
    }
}
```

如何根据 url 获取启动类呢？实际上就是一个 map 映射。

```java
/**
 * 根据 URL 获取对应的驱动类
 *
 * 1. 禁止 url 为空
 * 2. 如果未找到，则直接报错。
 * @param url url
 * @return 驱动信息
 */
private static String getDriverClassByUrl(final String url) {
    ArgUtil.notEmpty(url, "url");
    for(Map.Entry<String, String> entry : DRIVER_CLASS_MAP.entrySet()) {
        String urlPrefix = entry.getKey();
        if(url.startsWith(urlPrefix)) {
            return entry.getValue();
        }
    }
    throw new JdbcPoolException("Can't auto find match driver class for url: " + url);
}
```

其中 DRIVER_CLASS_MAP 映射如下：

| url 前缀 | 驱动类 |
|:----|:----|
| jdbc:sqlite | org.sqlite.JDBC |
| jdbc:derby | org.apache.derby.jdbc.EmbeddedDriver |
| jdbc:edbc | ca.edbc.jdbc.EdbcDriver |
| jdbc:ingres | com.ingres.jdbc.IngresDriver |
| jdbc:hsqldb | org.hsqldb.jdbcDriver |
| jdbc:JSQLConnect | com.jnetdirect.jsql.JSQLDriver |
| jdbc:sybase:Tds | com.sybase.jdbc2.jdbc.SybDriver |
| jdbc:firebirdsql | org.firebirdsql.jdbc.FBDriver |
| jdbc:microsoft | com.microsoft.jdbc.sqlserver.SQLServerDriver |
| jdbc:mckoi | com.mckoi.JDBCDriver |
| jdbc:oracle | oracle.jdbc.driver.OracleDriver |
| jdbc:as400 | com.ibm.as400.access.AS400JDBCDriver |
| jdbc:fake | com.alibaba.druid.mock.MockDriver |
| jdbc:pointbase | com.pointbase.jdbc.jdbcUniversalDriver |
| jdbc:sapdb | com.sap.dbtech.jdbc.DriverSapDB |
| jdbc:postgresql | org.postgresql.Driver |
| jdbc:cloudscape | COM.cloudscape.core.JDBCDriver |
| jdbc:timesten | com.timesten.jdbc.TimesTenDriver |
| jdbc:h2 | org.h2.Driver |
| jdbc:jtds | net.sourceforge.jtds.jdbc.Driver |
| jdbc:odps | com.aliyun.odps.jdbc.OdpsDriver |
| jdbc:db2 | COM.ibm.db2.jdbc.app.DB2Driver |
| jdbc:mysql | com.mysql.jdbc.Driver |
| jdbc:informix-sqli | com.informix.jdbc.IfxDriver |
| jdbc:mock | com.alibaba.druid.mock.MockDriver |
| jdbc:mimer:multi1 | com.mimer.jdbc.Driver |
| jdbc:interbase | interbase.interclient.Driver |
| jdbc:JTurbo | com.newatlanta.jturbo.driver.Driver |


## 池化实现

接下来我们根据指定的大小创建一个初始化的连接池。

### 定义池化的相关信息

我们首先定义一个接口：

```java
/**
 * 池化的连接池
 * @since 1.1.0
 */
public interface IPooledConnection extends Connection {


    /**
     * 是否繁忙
     * @since 1.1.0
     * @return 状态
     */
    boolean isBusy();

    /**
     * 设置状态
     * @param busy 状态
     * @since 1.1.0
     */
    void setBusy(boolean busy);

    /**
     * 获取真正的连接
     * @return 连接
     * @since 1.1.0
     */
    Connection getConnection();

    /**
     * 设置连接信息
     * @param connection 连接信息
     * @since 1.1.0
     */
    void setConnection(Connection connection);

    /**
     * 设置对应的数据源
     * @param dataSource 数据源
     * @since 1.5.0
     */
    void setDataSource(final IPooledDataSourceConfig dataSource);

    /**
     * 获取对应的数据源信息
     * @return 数据源
     * @since 1.5.0
     */
    IPooledDataSourceConfig getDataSource();

}
```

这里我们直接继承了 Connection 接口，实现时全部对 Connection 做一个代理。

内容较多，但是比较简单，此处不再赘述。


### 连接池初始化

根据配置初始化大小：

```java
/**
 * 初始化连接池
 * @since 1.1.0
 */
private void initJdbcPool() {
    final int minSize = super.minSize;
    pool = new ArrayList<>(minSize);
    for(int i = 0; i < minSize; i++) {
        IPooledConnection pooledConnection = createPooledConnection();
        pool.add(pooledConnection);
    }
}
```

createPooledConnection 内容如下：

```java
/**
 * 创建一个池化的连接
 * @return 连接
 * @since 1.1.0
 */
private IPooledConnection createPooledConnection() {
    Connection connection = createConnection();
    IPooledConnection pooledConnection = new PooledConnection();
    pooledConnection.setBusy(false);
    pooledConnection.setConnection(connection);
    pooledConnection.setDataSource(this);
    return pooledConnection;
}
```

我们使用 busy 属性，来标识当前连接是否可用。

新创建的连接默认都是可用的。

### 连接的获取

整体流程如下：

（1）池中有连接，直接获取

（2）池中没有连接，且没达到最大的大小，可以创建一个，然后返回

（3）池中没有连接，但是已经达到最大，则进行等待。

```java
@Override
public synchronized Connection getConnection() throws SQLException {
    //1. 获取第一个不是 busy 的连接
    Optional<IPooledConnection> connectionOptional = getFreeConnectionFromPool();
    if(connectionOptional.isPresent()) {
        return connectionOptional.get();
    }
    //2. 考虑是否可以扩容
    if(pool.size() >= maxSize) {
        //2.1 立刻返回
        if(maxWaitMills <= 0) {
            throw new JdbcPoolException("Can't get connection from pool!");
        }
        //2.2 循环等待
        final long startWaitMills = System.currentTimeMillis();
        final long endWaitMills = startWaitMills + maxWaitMills;
        while (System.currentTimeMillis() < endWaitMills) {
            Optional<IPooledConnection> optional = getFreeConnectionFromPool();
            if(optional.isPresent()) {
                return optional.get();
            }
            DateUtil.sleep(1);
            LOG.debug("等待连接池归还，wait for 1 mills");
        }
        //2.3 等待超时
        throw new JdbcPoolException("Can't get connection from pool, wait time out for mills: " + maxWaitMills);
    }
    //3. 扩容（暂时只扩容一个）
    LOG.debug("开始扩容连接池大小，step: 1");
    IPooledConnection pooledConnection = createPooledConnection();
    pooledConnection.setBusy(true);
    this.pool.add(pooledConnection);
    LOG.debug("从扩容后的连接池中获取连接");
    return pooledConnection;
}
```

getFreeConnectionFromPool() 核心代码如下：

直接获取一个不是繁忙状态的连接即可。

```java
/**
 * 获取空闲的连接
 * @return 连接
 * @since 1.3.0
 */
private Optional<IPooledConnection> getFreeConnectionFromPool() {
    for(IPooledConnection pc : pool) {
        if(!pc.isBusy()) {
            pc.setBusy(true);
            LOG.debug("从连接池中获取连接");
            return Optional.of(pc);
        }
    }
    // 空
    return Optional.empty();
}
```

### 连接的归还

以前 connection 的归还是直接将连接关闭，这里我们做了一个重载。

只是调整下对应的状态即可。

```java
@Override
public void returnConnection(IPooledConnection pooledConnection) {
    // 验证状态
    if(testOnReturn) {
        checkValid(pooledConnection);
    }

    // 设置为不繁忙
    pooledConnection.setBusy(false);
    LOG.debug("归还连接，状态设置为不繁忙");
}
```

## 连接的有效性

池中的连接存在无效的可能，所以需要我们对其进行定期的检测。

### 配置讲解

验证的时机是一门学问，我们可以在获取时检测，可以在归还时检测，但是二者都比较消耗性能。

比较好的方式是在空闲的时候进行校验。

配置主要参考 druid 的配置，对应的接口如下：

```java
/**
 * 设置验证查询的语句
 *
 * 如果这个值为空，那么 {@link #setTestOnBorrow(boolean)}
 * {@link #setTestOnIdle(boolean)}}
 * {@link #setTestOnReturn(boolean)}
 * 都将无效
 * @param validQuery 验证查询的语句
 * @since 1.5.0
 */
void setValidQuery(final String validQuery);
/**
 * 验证的超时秒数
 * @param validTimeOutSeconds 验证的超时秒数
 * @since 1.5.0
 */
void setValidTimeOutSeconds(final int validTimeOutSeconds);
/**
 * 获取连接时进行校验
 *
 * 备注：影响性能
 * @param testOnBorrow 是否
 * @since 1.5.0
 */
void setTestOnBorrow(final boolean testOnBorrow);
/**
 * 归还连接时进行校验
 *
 * 备注：影响性能
 * @param testOnReturn 归还连接时进行校验
 * @since 1.5.0
 */
void setTestOnReturn(final boolean testOnReturn);
/**
 * 闲暇的时候进行校验
 * @param testOnIdle 闲暇的时候进行校验
 * @since 1.5.0
 */
void setTestOnIdle(final boolean testOnIdle);
/**
 * 闲暇时进行校验的时间间隔
 * @param testOnIdleIntervalSeconds 时间间隔
 * @since 1.5.0
 */
void setTestOnIdleIntervalSeconds(final long testOnIdleIntervalSeconds);
```

### 约定优于配置

所有的属性都支持用户自定义，以满足不同的应用场景。

同时也秉承着默认的配置就是最常用的配置，默认的配置如下：

```java
/**
 * 默认验证查询的语句
 * @since 1.5.0
 */
public static final String DEFAULT_VALID_QUERY = "select 1 from dual";

/**
 * 默认的验证的超时时间
 * @since 1.5.0
 */
public static final int DEFAULT_VALID_TIME_OUT_SECONDS = 5;

/**
 * 获取连接时，默认不校验
 * @since 1.5.0
 */
public static final boolean DEFAULT_TEST_ON_BORROW = false;

/**
 * 归还连接时，默认不校验
 * @since 1.5.0
 */
public static final boolean DEFAULT_TEST_ON_RETURN = false;

/**
 * 默认闲暇的时候，进行校验
 *
 * @since 1.5.0
 */
public static final boolean DEFAULT_TEST_ON_IDLE = true;

/**
 * 1min 自动校验一次
 *
 * @since 1.5.0
 */
public static final long DEFAULT_TEST_ON_IDLE_INTERVAL_SECONDS = 60;
```

### 检测的实现

这里我参考了一篇 statckOverflow 的文章，其实还是使用 Connection#isValid 验证比较简单。

```java
/**
 * https://stackoverflow.com/questions/3668506/efficient-sql-test-query-or-validation-query-that-will-work-across-all-or-most
 *
 * 真正支持标准的，直接使用 {@link Connection#isValid(int)} 验证比较合适
 * @param pooledConnection 连接池信息
 * @since 1.5.0
 */
private void checkValid(final IPooledConnection pooledConnection) {
    if(StringUtil.isNotEmpty(super.validQuery)) {
        Connection connection = pooledConnection.getConnection();
        try {
            // 如果连接无效，重新申请一个新的替代
            if(!connection.isValid(super.validTimeOutSeconds)) {
                LOG.debug("Old connection is inValid, start create one for it.");
                Connection newConnection = createConnection();
                pooledConnection.setConnection(newConnection);
                LOG.debug("Old connection is inValid, finish create one for it.");
            }
        } catch (SQLException throwables) {
            throw new JdbcPoolException(throwables);
        }
    } else {
        LOG.debug("valid query is empty, ignore valid.");
    }
}
```

### 闲暇时的线程处理

我们为了不影响性能，单独为闲暇的连接检测开一个线程。

在初始化的创建：

```java
/**
 * 初始化空闲时检验
 * @since 1.5.0
 */
private void initTestOnIdle() {
    if(StringUtil.isNotEmpty(validQuery)) {
        ScheduledExecutorService idleExecutor = Executors.newSingleThreadScheduledExecutor();
        idleExecutor.scheduleAtFixedRate(new Runnable() {
            @Override
            public void run() {
                testOnIdleCheck();
            }
        }, super.testOnIdleIntervalSeconds, testOnIdleIntervalSeconds, TimeUnit.SECONDS);
        LOG.debug("Test on idle config with interval seonds: " + testOnIdleIntervalSeconds);
    }
}
```

testOnIdleCheck 实现如下：

```java
/**
 * 验证所有的空闲连接是否有效
 * @since 1.5.0
 */
private void testOnIdleCheck() {
    LOG.debug("start check test on idle");
    for(IPooledConnection pc : this.pool) {
        if(!pc.isBusy()) {
            checkValid(pc);
        }
    }
    LOG.debug("finish check test on idle");
}
```

## 开源地址

所有源码均已开源：

> [jdbc-pool](https://github.com/houbb/jdbc-pool)

使用方式和常见的连接池一样。

### maven 引入

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>jdbc-pool</artifactId>
    <version>1.5.0</version>
</dependency>
```

### 测试代码

```java
PooledDataSource source = new PooledDataSource();
source.setDriverClass("com.mysql.jdbc.Driver");
source.setJdbcUrl("jdbc:mysql://127.0.0.1:3306/test?useUnicode=true&characterEncoding=utf-8");
source.setUser("root");
source.setPassword("123456");
source.setMinSize(1);

// 初始化
source.init();

Connection connection = source.getConnection();
System.out.println(connection.getCatalog());

Connection connection2 = source.getConnection();
System.out.println(connection2.getCatalog());
```

### 日志

```
[DEBUG] [2020-07-18 10:50:54.536] [main] [c.g.h.t.p.d.PooledDataSource.getFreeConnection] - 从连接池中获取连接
test
[DEBUG] [2020-07-18 10:50:54.537] [main] [c.g.h.t.p.d.PooledDataSource.getConnection] - 开始扩容连接池大小，step: 1
[DEBUG] [2020-07-18 10:50:54.548] [main] [c.g.h.t.p.d.PooledDataSource.getConnection] - 从扩容后的连接池中获取连接
test
```

## 小结

到这里，一个简单版本的连接池就已经实现了。

常见的连接池，比如 dbcp/c3p0/druid/jboss-pool/tomcat-pool 其实都是类似的。

万变不离其宗，实现只是一种思想的差异化表示而已。

但是有哪些不足呢？

性能方面，我们为了简单，都是直接使用 `synchronized` 保证并发安全，这样性能会相对于乐观锁，或者是无锁差一些。

自定义方面，比如 druid 可以支持用户自定义拦截器，添加注入防止 sql 注入，耗时统计等等。

页面管理，druid 比较优异的一点就是自带页面管理，这一点对于日常维护也比较友好。

* any list
{:toc}
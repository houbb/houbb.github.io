---
layout: post
title:  从零开始手写 mybatis（四）- mybatis 事务管理机制详解
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

## 前景回顾

第一节 [从零开始手写 mybatis（一）MVP 版本](https://mp.weixin.qq.com/s/8eF7oFxgLsilqLYGOVtkGg) 中我们实现了一个最基本的可以运行的 mybatis。

第二节 [从零开始手写 mybatis（二）mybatis interceptor 插件机制详解](https://mp.weixin.qq.com/s/83GzYTQCrWiEowN0gjll0Q)

第三节 [从零开始手写 mybatis（三）jdbc pool 从零实现数据库连接池](https://mp.weixin.qq.com/s/pO1XU_PD2pHyq-bBWMAP2w)

第四节 [从零开始手写 mybatis（四）- mybatis 事务管理机制详解](https://mp.weixin.qq.com/s/6Wa5AbOrg4MhRbZL674t8Q)

本节我们一起来学习一下 mybatis 中的事务管理。

## mybatis 中的事务管理

mybatis 事务有两种使用方式：

1. 使用JDBC的事务管理机制：即使用 java.Sql.Connection对象完成对事务的提交，回滚和关闭操作。

2. 使用MANAGED的事务管理机制：mybatis本身不会去实现事务管理的相关操作，而是交个外部容器来管理事务。当与spring整合使用后，一般使用spring来管理事务。

## 事务工厂 TransactionFactory

### 接口定义

这个是对事务的一个工厂，接口如下：

```java
public interface TransactionFactory {

  /**
   * Sets transaction factory custom properties.
   * @param props
   */
  void setProperties(Properties props);

  /**
   * Creates a {@link Transaction} out of an existing connection.
   * @param conn Existing database connection
   * @return Transaction
   * @since 3.1.0
   */
  Transaction newTransaction(Connection conn);
  
  /**
   * Creates a {@link Transaction} out of a datasource.
   * @param dataSource DataSource to take the connection from
   * @param level Desired isolation level
   * @param autoCommit Desired autocommit
   * @return Transaction
   * @since 3.1.0
   */
  Transaction newTransaction(DataSource dataSource, TransactionIsolationLevel level, boolean autoCommit);

}
```

主要就是如何根据一个 DataSource 创建一个 Transaction。

实际上整体感觉意义不大。

最核心的还是要看一下 Transaction 的实现。

### Transaction 接口

```java
public interface Transaction {

  /**
   * Retrieve inner database connection
   * @return DataBase connection
   * @throws SQLException
   */
  Connection getConnection() throws SQLException;

  /**
   * Commit inner database connection.
   * @throws SQLException
   */
  void commit() throws SQLException;

  /**
   * Rollback inner database connection.
   * @throws SQLException
   */
  void rollback() throws SQLException;

  /**
   * Close inner database connection.
   * @throws SQLException
   */
  void close() throws SQLException;

  /**
   * Get transaction timeout if set
   * @throws SQLException
   */
  Integer getTimeout() throws SQLException;
  
}
```

这里最核心的实际上只有 commit() 和 rollback()，其他的都是可以忽略的。

针对 getTimeout() 我们就可以为 mybatis 提供一个操作的超时机制。

### JdbcTransaction 实现

基于 jdbc 机制的一些处理。

```java
public class JdbcTransaction implements Transaction {

  private static final Log log = LogFactory.getLog(JdbcTransaction.class);

  protected Connection connection;
  protected DataSource dataSource;
  protected TransactionIsolationLevel level;
  protected boolean autoCommmit;

  public JdbcTransaction(DataSource ds, TransactionIsolationLevel desiredLevel, boolean desiredAutoCommit) {
    dataSource = ds;
    level = desiredLevel;
    autoCommmit = desiredAutoCommit;
  }

  public JdbcTransaction(Connection connection) {
    this.connection = connection;
  }

  @Override
  public Connection getConnection() throws SQLException {
    if (connection == null) {
      openConnection();
    }
    return connection;
  }

  @Override
  public void commit() throws SQLException {
    if (connection != null && !connection.getAutoCommit()) {
      if (log.isDebugEnabled()) {
        log.debug("Committing JDBC Connection [" + connection + "]");
      }
      connection.commit();
    }
  }

  @Override
  public void rollback() throws SQLException {
    if (connection != null && !connection.getAutoCommit()) {
      if (log.isDebugEnabled()) {
        log.debug("Rolling back JDBC Connection [" + connection + "]");
      }
      connection.rollback();
    }
  }

  @Override
  public void close() throws SQLException {
    if (connection != null) {
      resetAutoCommit();
      if (log.isDebugEnabled()) {
        log.debug("Closing JDBC Connection [" + connection + "]");
      }
      connection.close();
    }
  }

  protected void setDesiredAutoCommit(boolean desiredAutoCommit) {
    try {
      if (connection.getAutoCommit() != desiredAutoCommit) {
        if (log.isDebugEnabled()) {
          log.debug("Setting autocommit to " + desiredAutoCommit + " on JDBC Connection [" + connection + "]");
        }
        connection.setAutoCommit(desiredAutoCommit);
      }
    } catch (SQLException e) {
      // Only a very poorly implemented driver would fail here,
      // and there's not much we can do about that.
      throw new TransactionException("Error configuring AutoCommit.  "
          + "Your driver may not support getAutoCommit() or setAutoCommit(). "
          + "Requested setting: " + desiredAutoCommit + ".  Cause: " + e, e);
    }
  }

  protected void resetAutoCommit() {
    try {
      if (!connection.getAutoCommit()) {
        // MyBatis does not call commit/rollback on a connection if just selects were performed.
        // Some databases start transactions with select statements
        // and they mandate a commit/rollback before closing the connection.
        // A workaround is setting the autocommit to true before closing the connection.
        // Sybase throws an exception here.
        if (log.isDebugEnabled()) {
          log.debug("Resetting autocommit to true on JDBC Connection [" + connection + "]");
        }
        connection.setAutoCommit(true);
      }
    } catch (SQLException e) {
      if (log.isDebugEnabled()) {
        log.debug("Error resetting autocommit to true "
          + "before closing the connection.  Cause: " + e);
      }
    }
  }

  protected void openConnection() throws SQLException {
    if (log.isDebugEnabled()) {
      log.debug("Opening JDBC Connection");
    }
    connection = dataSource.getConnection();
    if (level != null) {
      connection.setTransactionIsolation(level.getLevel());
    }
    setDesiredAutoCommit(autoCommmit);
  }

  @Override
  public Integer getTimeout() throws SQLException {
    return null;
  }
  
}
```

这里整体的实现实际上非常简单，就是主动设置了一下自动提交的属性。

### ManagedDataSource

这个是另一个实现，实际上更加简单。

commit() 和 rollback() 实现都是空的。

```java
public class ManagedTransaction implements Transaction {

  private static final Log log = LogFactory.getLog(ManagedTransaction.class);

  private DataSource dataSource;
  private TransactionIsolationLevel level;
  private Connection connection;
  private boolean closeConnection;

  public ManagedTransaction(Connection connection, boolean closeConnection) {
    this.connection = connection;
    this.closeConnection = closeConnection;
  }

  public ManagedTransaction(DataSource ds, TransactionIsolationLevel level, boolean closeConnection) {
    this.dataSource = ds;
    this.level = level;
    this.closeConnection = closeConnection;
  }

  @Override
  public Connection getConnection() throws SQLException {
    if (this.connection == null) {
      openConnection();
    }
    return this.connection;
  }

  @Override
  public void commit() throws SQLException {
    // Does nothing
  }

  @Override
  public void rollback() throws SQLException {
    // Does nothing
  }

  @Override
  public void close() throws SQLException {
    if (this.closeConnection && this.connection != null) {
      if (log.isDebugEnabled()) {
        log.debug("Closing JDBC Connection [" + this.connection + "]");
      }
      this.connection.close();
    }
  }

  protected void openConnection() throws SQLException {
    if (log.isDebugEnabled()) {
      log.debug("Opening JDBC Connection");
    }
    this.connection = this.dataSource.getConnection();
    if (this.level != null) {
      this.connection.setTransactionIsolation(this.level.getLevel());
    }
  }

  @Override
  public Integer getTimeout() throws SQLException {
    return null;
  }

}
```

### 作用

ManagedTransaction对事务的commit和rollback交给了容器去管理，自己本身并没有做任何处理。

## mybatis 的使用方式

如果Mybatis是单独运行的，没有其他框架管理，此时mybatis内部会对下段代码实现。

```java
con.setAutoCommit(false);
//此处命令通知数据库,从此刻开始从当前Connection通道推送而来的
//SQL语句属于同一个业务中这些SQL语句在数据库中应该保存到同一个
//Transaction中.这个Transaction的行为(commit,rollback)由当前Connection管理.
try{
    //推送sql语句命令……..;
    con.commit();//通知Transaction提交.
}catch(SQLException ex){
    con.rollback();//通知Transaction回滚.
}
```

整体来说这种写法比较原始，我们可以将本来交给 connection 处理的事务，统一调整为使用事务管理器处理。

### spring 整合

当然针对 mybatis，大部分都是单个语句的执行。

用于使用 connection 时，实际上得到的是 mybatis 事务管理器封装之后的 connection。

实际上 spring 的整合，可能适用性更强一些。

## 个人实现

看完了 mybatis 的实现原理之后，我们的实现就变得非常简单。

我们可以简化上面的一些实现，保留核心的部分即可。

### 接口定义

我们只保留核心的 3 个接口。

```java
/**
 * 事务管理
 */
public interface Transaction {

    /**
     * Retrieve inner database connection
     * @return DataBase connection
     */
    Connection getConnection();

    /**
     * Commit inner database connection.
     */
    void commit();

    /**
     * Rollback inner database connection.
     */
    void rollback();

}
```

### ManageTransaction

这个实现，我们的 commit 和 rollback 什么都不做。

```java
/**
 * 事务管理
 *
 * @since 0.0.18
 */
public class ManageTransaction implements Transaction {

    /**
     * 数据信息
     * @since 0.0.18
     */
    private final DataSource dataSource;

    /**
     * 隔离级别
     * @since 0.0.18
     */
    private final TransactionIsolationLevel isolationLevel;

    /**
     * 连接信息
     * @since 0.0.18
     */
    private Connection connection;

    public ManageTransaction(DataSource dataSource, TransactionIsolationLevel isolationLevel) {
        this.dataSource = dataSource;
        this.isolationLevel = isolationLevel;
    }

    public ManageTransaction(DataSource dataSource) {
        this(dataSource, TransactionIsolationLevel.READ_COMMITTED);
    }

    @Override
    public Connection getConnection() {
        try {
            if(this.connection == null) {
                Connection connection = dataSource.getConnection();
                connection.setTransactionIsolation(isolationLevel.getLevel());
                this.connection = connection;
            }

            return connection;
        } catch (SQLException throwables) {
            throw new MybatisException(throwables);
        }
    }

    @Override
    public void commit() {
        //nothing
    }

    @Override
    public void rollback() {
        //nothing
    }

}
```

### JdbcTransaction.java

这里和上面的相比较，多出了 commit 和 rollback 的逻辑处理。

```java
package com.github.houbb.mybatis.transaction.impl;

import com.github.houbb.mybatis.constant.enums.TransactionIsolationLevel;
import com.github.houbb.mybatis.exception.MybatisException;
import com.github.houbb.mybatis.transaction.Transaction;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 事务管理
 *
 * @since 0.0.18
 */
public class JdbcTransaction implements Transaction {

    /**
     * 数据信息
     * @since 0.0.18
     */
    private final DataSource dataSource;

    /**
     * 隔离级别
     * @since 0.0.18
     */
    private final TransactionIsolationLevel isolationLevel;

    /**
     * 自动提交
     * @since 0.0.18
     */
    private final boolean autoCommit;

    /**
     * 连接信息
     * @since 0.0.18
     */
    private Connection connection;

    public JdbcTransaction(DataSource dataSource, TransactionIsolationLevel isolationLevel, boolean autoCommit) {
        this.dataSource = dataSource;
        this.isolationLevel = isolationLevel;
        this.autoCommit = autoCommit;
    }

    public JdbcTransaction(DataSource dataSource) {
        this(dataSource, TransactionIsolationLevel.READ_COMMITTED, true);
    }

    @Override
    public Connection getConnection(){
        try {
            if(this.connection == null) {
                Connection connection = dataSource.getConnection();
                connection.setTransactionIsolation(isolationLevel.getLevel());
                connection.setAutoCommit(autoCommit);
                this.connection = connection;
            }

            return connection;
        } catch (SQLException throwables) {
            throw new MybatisException(throwables);
        }
    }

    @Override
    public void commit() {
        try {
            //非自动提交，才执行 commit 操作
            if(connection != null && !this.autoCommit) {
                connection.commit();
            }
        } catch (SQLException throwables) {
            throw new MybatisException(throwables);
        }
    }

    @Override
    public void rollback() {
        try {
            //非自动提交，才执行 commit 操作
            if(connection != null && !this.autoCommit) {
                connection.rollback();
            }
        } catch (SQLException throwables) {
            throw new MybatisException(throwables);
        }
    }

}
```

# 参考资料

[mybatis-spring 整合](http://mybatis.org/spring/zh/transactions.html)

[Spring-Mybatis运行机制概括](https://segmentfault.com/a/1190000015165470)

[mybatis事务管理机制详解](https://www.cnblogs.com/51life/p/9553762.html)

[MyBatis 事务管理解析：颠覆你心中对事务的理解！](http://blog.itpub.net/69908602/viewspace-2673191/)

* any list
{:toc}
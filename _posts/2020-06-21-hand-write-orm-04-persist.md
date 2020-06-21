---
layout: post
title:  手写 Hibernate ORM 框架 04-持久化实现
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 本节内容

执行建表语句。

执行数据的保存


# 执行建表语句

## Session

```java
package com.ryo.hibernate.simulator.hibernate;

import com.mysql.jdbc.PreparedStatement;
import com.ryo.hibernate.simulator.hibernate.util.ConnectionUtil;
import com.ryo.hibernate.simulator.hibernate.util.FieldUtil;
import com.ryo.hibernate.simulator.hibernate.util.TableUtil;
import com.ryo.hibernate.simulator.model.User;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Session 实现
 * @author houbinbin
 * @date 16/6/5
 */
public class Session {

    /**
     * 获取数据库链接信息
     * @return
     */
    public Connection createConnection() {
        return ConnectionUtil.getConnection();
    }
}
```

## 测试

我们一开始写的数据库 Table 只是生成了脚本，但是没有实际执行。

有了 Connection 之后，我们就可以开始执行脚本啦。

- executeCreateTableTest.java

```java
/**
 * 执行建表语句
 * @throws SQLException SQL 异常
 */
@Test
public void executeCreateTableTest() throws SQLException {
    Session session = new Session();
    Table table = new Table();
    User user = new User();

    Connection connection = session.createConnection();
    PreparedStatement preparedStatement = connection.prepareStatement(table.buildCreateTableSQL(user));
    preparedStatement.execute();
}
```


# 数据的持久化

```java
package com.ryo.hibernate.simulator.hibernate;

import com.mysql.jdbc.PreparedStatement;
import com.ryo.hibernate.simulator.hibernate.util.ConnectionUtil;
import com.ryo.hibernate.simulator.hibernate.util.FieldUtil;
import com.ryo.hibernate.simulator.hibernate.util.TableUtil;
import com.ryo.hibernate.simulator.model.User;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * Session 实现
 * @author houbinbin
 * @date 16/6/5
 */
public class Session {
    /**
     * 插入模板
     */
    private static final String INSERT_FORMAT = "INSERT INTO %s ( %s ) VALUES ( %s ) ;";

    /**
     * 保存用户信息
     * @param user
     * @throws SQLException
     */
    public void save(User user) throws SQLException {
        String sql = buildInsertSQL(user);

        Connection con = createConnection();
        PreparedStatement state =  (PreparedStatement) con.prepareStatement(sql);
        state.execute();
        con.close();
    }

    /**
     * 构建插入语句
     * @param user
     * @return
     */
    public String buildInsertSQL(User user) {
        String tableName = TableUtil.getTableName(user);
        String fieldString = FieldUtil.getFieldNameString(user);
        String valueString = FieldUtil.getFieldValueString(user);

        return String.format(INSERT_FORMAT, tableName, fieldString, valueString);
    }

    /**
     * 获取数据库链接信息
     * @return
     */
    public Connection createConnection() {
        return ConnectionUtil.getConnection();
    }
}
```

## 测试构建

- buildInsertSQLTest.java

```java
@Test
public void buildInsertSQLTest() {
    User user = new User();
    user.setId(3L);
    user.setName("ryo");
    user.setAge(21);
    user.setPassword("123456");
    user.setCreateOn(new Date());
    user.setModifiedOn(new Date());
    System.out.println(new Session().buildInsertSQL(user));
}
```

结果：

```sql
INSERT INTO t_user ( id,name,password,myAge,createOn,modifiedOn ) VALUES ( '3','ryo','123456','21','2018-05-02 22:33:32','2018-05-02 22:33:32' ) ;
```

## 测试入库

- insertUserTest()

```java
@Test
public void insertUserTest() throws SQLException {
    User user = new User();
    user.setId(3L);
    user.setName("ryo");
    user.setAge(21);
    user.setPassword("123456");
    user.setCreateOn(new Date());
    user.setModifiedOn(new Date());

    new Session().save(user);
}
```

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80172300)

* any list
{:toc}
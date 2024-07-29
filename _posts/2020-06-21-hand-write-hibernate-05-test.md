---
layout: post
title:  手写 Hibernate ORM 框架 05-基本效果测试
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 手写 Hibernate 系列

[手写 Hibernate ORM 框架 00-hibernate 简介](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-intro)

[手写 Hibernate ORM 框架 00-环境准备](https://houbb.github.io/2020/06/21/hand-write-hibernate-00-overview)

[手写 Hibernate ORM 框架 01-注解常量定义](https://houbb.github.io/2020/06/21/hand-write-hibernate-01-annotation)

[手写 Hibernate ORM 框架 02-实体 Bean 定义，建表语句自动生成](https://houbb.github.io/2020/06/21/hand-write-hibernate-02-bean)

[手写 Hibernate ORM 框架 03-配置文件读取, 数据库连接构建](https://houbb.github.io/2020/06/21/hand-write-hibernate-03-config)

[手写 Hibernate ORM 框架 04-持久化实现](https://houbb.github.io/2020/06/21/hand-write-hibernate-04-persist)

[手写 Hibernate ORM 框架 05-整体效果测试验证](https://houbb.github.io/2020/06/21/hand-write-hibernate-05-test)

## 从零手写组件系列

[java 从零手写 spring ioc 控制反转](https://github.com/houbb/ioc)

[java 从零手写 spring mvc](https://github.com/houbb/mvc)

[java 从零手写 jdbc-pool 数据库连接池](https://github.com/houbb/jdbc-pool)

[java 从零手写 mybatis](https://github.com/houbb/mybatis)

[java 从零手写 hibernate](https://github.com/houbb/hibernate)

[java 从零手写 rpc 远程调用](https://github.com/houbb/rpc)

[java 从零手写 mq 消息组件](https://github.com/houbb/rpc)

[java 从零手写 cache 缓存](https://github.com/houbb/cache)

[java 从零手写 nginx4j](https://github.com/houbb/nginx4j)

[java 从零手写 tomcat](https://github.com/houbb/minicat)

# 简介

java 从零实现简易版本的 [hibernate](https://github.com/houbb/hibernate)

我们已经实现了 v0.1.0 版本，本节一起来验证一下效果。

# 核心特性

- 简单版本的 hibernate

- 建表语句生成+执行

- 插入语句生成+执行

# 快速开始 

## 需要 

jdk1.3+

maven 3.x+

## maven 引入 

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>hibernate</artifactId>
    <version>0.1.0</version>
</dependency>
```

## 入门测试

### 环境准备

首先准备一个 mysql 对应的测试库 `hibernate`

```
mysql> create database hibernate;
Query OK, 1 row affected (0.00 sec)

mysql> use hibernate;
Database changed
```

### 配置信息

我们配置一下 `hibernate.cfg.xml` 为对应的数据库访问信息：

```xml
<?xml version='1.0' encoding='utf-8'?>
<hibernate-configuration>
        <!-- Database connection settings -->
        <property name="connection.driver_class">com.mysql.jdbc.Driver</property>
        <property name="connection.url">jdbc:mysql://localhost:3306/hibernate</property>
        <property name="connection.username">root</property>
        <property name="connection.password">123456</property>
</hibernate-configuration>
```

### 建表语句

SQL 的生成：

```java
Table table = new Table();
User user = new User();
System.out.println(table.buildCreateTableSQL(user));
```

结果为：

```sql
create table t_user (id BIGINT AUTO_INCREMENT, name VARCHAR(255), password VARCHAR(255), myAge INTEGER , createOn DATETIME, modifiedOn DATETIME , PRIMARY KEY  (`id`) );
```

### 执行建表

我们可以直接通过程序建表

```java
Session session = new Session();
Table table = new Table();
User user = new User();

Connection connection = session.createConnection();
PreparedStatement preparedStatement = connection.prepareStatement(table.buildCreateTableSQL(user));
preparedStatement.execute();
```

执行后：

```
mysql> show tables;
+---------------------+
| Tables_in_hibernate |
+---------------------+
| t_user              |
+---------------------+
1 row in set (0.00 sec)
```

表结构

```
mysql> desc t_user;
+------------+--------------+------+-----+---------+----------------+
| Field      | Type         | Null | Key | Default | Extra          |
+------------+--------------+------+-----+---------+----------------+
| id         | bigint(20)   | NO   | PRI | NULL    | auto_increment |
| name       | varchar(255) | YES  |     | NULL    |                |
| password   | varchar(255) | YES  |     | NULL    |                |
| myAge      | int(11)      | YES  |     | NULL    |                |
| createOn   | datetime     | YES  |     | NULL    |                |
| modifiedOn | datetime     | YES  |     | NULL    |                |
+------------+--------------+------+-----+---------+----------------+
6 rows in set (0.01 sec)
```

PS: 这里可以看到对应的字段没有驼峰转下划线

## 数据的插入

### 插入语句

```java
User user = new User();
user.setId(3L);
user.setName("ryo");
user.setAge(21);
user.setPassword("123456");
user.setCreateOn(new Date());
user.setModifiedOn(new Date());
System.out.println(new Session().buildInsertSQL(user));
```

结果为：

```sql
INSERT INTO t_user ( id,name,password,myAge,createOn,modifiedOn ) VALUES ( '3','ryo','123456','21','2024-07-30 00:37:36','2024-07-30 00:37:36' ) ;
```

### 程序插入

也可以程序直接插入

```java
User user = new User();
user.setId(3L);
user.setName("ryo");
user.setAge(21);
user.setPassword("123456");
user.setCreateOn(new Date());
user.setModifiedOn(new Date());

new Session().save(user);
```

效果

```
mysql> select * from t_user;
+----+------+----------+-------+---------------------+---------------------+
| id | name | password | myAge | createOn            | modifiedOn          |
+----+------+----------+-------+---------------------+---------------------+
|  3 | ryo  | 123456   |    21 | 2024-07-30 00:38:14 | 2024-07-30 00:38:14 |
+----+------+----------+-------+---------------------+---------------------+
1 row in set (0.00 sec)
```

# ROAD-MAP

- [ ] 添加基于 gen-case 的测试用例

- [ ] 建表对应的字段没有驼峰转下划线

- [ ] CRUD 

- [ ] list 等常见查询


* any list
{:toc}
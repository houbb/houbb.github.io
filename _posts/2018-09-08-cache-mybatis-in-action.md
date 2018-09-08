---
layout: post
title:  Mybatis Cache in action
date:  2018-09-08 12:18:10 +0800
categories: [Cache]
tags: [cache, mybatis, in-action, sh]
published: true
excerpt: Mybatis 缓存实战
---

# Mybatis 缓存实战

# 数据准备

## 建表脚本

- db.sql

```sql
CREATE DATABASE mybatis
  DEFAULT CHARACTER SET utf8
  COLLATE utf8_general_ci;

USE mybatis;
```

- init.sql

```sql
DROP TABLE IF EXISTS `user`;
CREATE TABLE user (
  id        BIGINT(20) PRIMARY KEY AUTO_INCREMENT NOT NULL
  COMMENT '主键, 自增',
  username  VARCHAR(64)                           NOT NULL
  COMMENT '用户名',
  password  VARCHAR(128)                          NOT NULL
  COMMENT '密码',
  `created_time` timestamp NULL,
  `updated_time` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE INDEX `username_UNIQUE` (`username`)
)
  COMMENT '用户表';

INSERT INTO `user` (username, password, created_time, updated_time) VALUES (
  'ryo', '123456', NOW(), NOW()
);

DROP TABLE IF EXISTS `role`;
CREATE TABLE role (
  id          BIGINT(20) PRIMARY KEY AUTO_INCREMENT NOT NULL
  COMMENT '主键,自增',
  name        VARCHAR(64)                           NOT NULL
  COMMENT '角色名称',
  code        VARCHAR(64)                           NOT NULL
  COMMENT '角色代码',
  description VARCHAR(128)                          NULL DEFAULT ''
  COMMENT '角色说明',
  `created_time` timestamp NULL,
  `updated_time` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `name`(`name`),
  UNIQUE INDEX `code_UNIQUE`(`code`)
)
  COMMENT '角色表';

INSERT INTO `role` (name, code, description, created_time, updated_time) VALUES (
  '管理员', 'admin', '这个系统里天下第一', NOW(), NOW()
);
```

# 开启测试

[测试代码地址]()

## mybatis 配置

- mybatis-config.xml

```xml
<!DOCTYPE configuration PUBLIC "-//mybatis.org//DTD Config 3.0//EN" "http://mybatis.org/dtd/mybatis-3-config.dtd">
<configuration>

    <settings>
        <!--指定日志为log4j2-->
        <setting name="logImpl" value="LOG4J2" />
        <setting name="localCacheScope" value="SESSION"/>
    </settings>

</configuration>
```

其他配置省略。

## 测试一

- 条件

一级缓存开启 + `localCacheScope=SESSION`

- 测试代码

在同一个 SqlSession 执行两次相同条件的查询。

```java
@Test
public void timesQueryTest() {
    SqlSession sqlSession = sqlSessionFactory.openSession();
    UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
    User user = new User();
    user.setId(1L);
    System.out.println("初次 " + userMapper.selectOne(user));
    System.out.println("再次 " + userMapper.selectOne(user));
}
```

- 测试结果

实际上只执行了一次。第二次直接使用缓存的结果。

```
2018-09-08 13:04:04.109  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==>  Preparing: SELECT ID,USERNAME,PASSWORD,created_time,updated_time FROM uSER WHERE ID = ? 
2018-09-08 13:04:04.133  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==> Parameters: 1(Long)
2018-09-08 13:04:04.150  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - <==      Total: 1
初次 com.github.houbb.mybatis.learn.cache.model.User@201b6b6f
再次 com.github.houbb.mybatis.learn.cache.model.User@201b6b6f
```

- 实际场景

如果在 spring 事务代码中，我们写了两个相同的数据库调用。

比如 `sn.nextVal()` 调用了两次，第二次可能直接就不会调用数据库。

## 测试二

- 条件

一级缓存开启 + `localCacheScope=SESSION`

- 测试代码

在同一个 SqlSession 执行两次相同条件的查询。

但是中间添加一个额外的数据库入库操作。

```java
@Test
public void queryUpdateQueryTest() {
    SqlSession sqlSession = sqlSessionFactory.openSession();
    UserMapper userMapper = sqlSession.getMapper(UserMapper.class);
    User user = new User();
    user.setId(1L);
    System.out.println("初次 " + userMapper.selectOne(user));
    User userNew = new User();
    userNew.setUsername("new");
    userNew.setPassword("123456");
    System.out.println("添加了新用户: " + userNew.getUsername());
    userMapper.insert(userNew);
    System.out.println("再次 " + userMapper.selectOne(user));
}
```

- 日志

这次是调用了 2 次。

说明如果中间有更新操作，则清空了本地缓存。

```
2018-09-08 13:14:29.105  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==>  Preparing: SELECT ID,USERNAME,PASSWORD,created_time,updated_time FROM uSER WHERE ID = ? 
2018-09-08 13:14:29.127  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==> Parameters: 1(Long)
2018-09-08 13:14:29.143  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - <==      Total: 1
初次 com.github.houbb.mybatis.learn.cache.model.User@75459c75
添加了新用户: new
2018-09-08 13:14:29.151  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.insert:145 - ==>  Preparing: INSERT INTO uSER ( ID,USERNAME,PASSWORD,created_time,updated_time ) VALUES( ?,?,?,?,? ) 
2018-09-08 13:14:29.151  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.insert:145 - ==> Parameters: null, new(String), 123456(String), null, null
2018-09-08 13:14:29.157  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.insert:145 - <==    Updates: 1
2018-09-08 13:14:29.160  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.insert!selectKey:145 - ==>  Executing: SELECT LAST_INSERT_ID() 
2018-09-08 13:14:29.161  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.insert!selectKey:145 - <==      Total: 1
2018-09-08 13:14:29.162  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==>  Preparing: SELECT ID,USERNAME,PASSWORD,created_time,updated_time FROM uSER WHERE ID = ? 
2018-09-08 13:14:29.162  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - ==> Parameters: 1(Long)
2018-09-08 13:14:29.164  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectOne:145 - <==      Total: 1
再次 com.github.houbb.mybatis.learn.cache.model.User@4c4d27c8
```

## 测试三

- 测试代码

开启两个SqlSession，在sqlSession1中查询数据，使一级缓存生效，在sqlSession2中更新数据库，验证一级缓存只在数据库会话内部共享。

```java
@Test
public void twoSessionQueryUpdateQueryTest() {
    final Long userKey = 1L;
    SqlSession firstSqlSession = sqlSessionFactory.openSession(true);
    SqlSession secondSqlSession = sqlSessionFactory.openSession(true);
    UserMapper firstUserMapper = firstSqlSession.getMapper(UserMapper.class);
    UserMapper secondUserMapper = secondSqlSession.getMapper(UserMapper.class);
    System.out.println("firstUserMapper 初次 " + firstUserMapper.selectByPrimaryKey(userKey));

    // 另一个 session 更新
    User userUpdate = new User();
    userUpdate.setId(userKey);
    userUpdate.setPassword("new " + RandomStringUtils.randomNumeric(5));
    System.out.println("secondUserMapper 更新: " + secondUserMapper.updateByPrimaryKeySelective(userUpdate));

    System.out.println("firstUserMapper 再次 " + firstUserMapper.selectByPrimaryKey(userKey));
    System.out.println("secondUserMapper 查询 " + secondUserMapper.selectByPrimaryKey(userKey));
}
```

- 日志

firstUserMapper 查询到的是脏数据。

secondSqlSession 的更新并没有清空 firstSqlSession 的本地一级缓存。

```
2018-09-08 14:12:36.465  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,USERNAME,PASSWORD,created_time,updated_time FROM uSER WHERE ID = ? 
2018-09-08 14:12:36.485  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:12:36.503  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - <==      Total: 1
firstUserMapper 初次 User{id=1, username='ryo', password='new 10098', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
2018-09-08 14:12:36.529  DEBUG [main] org.springframework.jdbc.datasource.DataSourceUtils:114 - Fetching JDBC Connection from DataSource
2018-09-08 14:12:36.543  DEBUG [main] org.mybatis.spring.transaction.SpringManagedTransaction:89 - JDBC Connection [jdbc:mysql://127.0.0.1:13306/mybatis?useUnicode=true&characterEncoding=UTF-8&useOldAlias, UserName=root@172.17.0.1, MySQL Connector Java] will not be managed by Spring
2018-09-08 14:12:36.543  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.updateByPrimaryKeySelective:145 - ==>  Preparing: UPDATE uSER SET PASSWORD = ? WHERE ID = ? 
2018-09-08 14:12:36.544  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.updateByPrimaryKeySelective:145 - ==> Parameters: new 99507(String), 1(Long)
2018-09-08 14:12:36.548  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.updateByPrimaryKeySelective:145 - <==    Updates: 1
secondUserMapper 更新: 1
firstUserMapper 再次 User{id=1, username='ryo', password='new 10098', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
2018-09-08 14:12:36.549  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,USERNAME,PASSWORD,created_time,updated_time FROM uSER WHERE ID = ? 
2018-09-08 14:12:36.549  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:12:36.550  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.UserMapper.selectByPrimaryKey:145 - <==      Total: 1
secondUserMapper 查询 User{id=1, username='ryo', password='new 99507', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 06:12:36 CST 2018}
```

## 一级缓存流程

![一级缓存流程](https://tech.meituan.com/img/mybatis-cache/2017-11-15-16-31-11.png)

# 二级缓存

## 介绍

在上文中提到的一级缓存中，其最大的共享范围就是一个SqlSession内部，如果多个SqlSession之间需要共享缓存，则需要使用到二级缓存。

开启二级缓存后，会使用CachingExecutor装饰Executor，进入一级缓存的查询流程前，先在CachingExecutor进行二级缓存的查询，具体的工作流程如下所示。

![sql session](https://tech.meituan.com/img/mybatis-cache/2017-11-15-16-33-42.png)

二级缓存开启后，同一个namespace下的所有操作语句，都影响着同一个Cache，即二级缓存被多个SqlSession共享，是一个全局的变量。
当开启缓存后，数据的查询执行的流程就是 二级缓存 -> 一级缓存 -> 数据库。

## 二级缓存配置

- 全局开启配置

```xml
<setting name="cacheEnabled" value="true"/>
```

- 在 xml 文件中配置

在 MyBatis 的映射 XML 中配置 cach e或者 cache-ref 。

```xml
<cache/>
```

or

cache-ref代表引用别的命名空间的Cache配置，两个命名空间的操作使用的是同一个Cache。

```xml
<cache-ref namespace="com.github.houbb.mybatis.learn.cache.mapper.UserMapper"/>
```

## 实验一

- 场景

两个 session，第一个不提交

- 代码

```java
@Test
public void queryTest() {
    final Long roleKey = 1L;
    SqlSession firstSqlSession = sqlSessionFactory.openSession(true);
    SqlSession secondSqlSession = sqlSessionFactory.openSession(true);
    RoleMapper firstMapper = firstSqlSession.getMapper(RoleMapper.class);
    RoleMapper secondMapper = secondSqlSession.getMapper(RoleMapper.class);

    System.out.println("firstUserMapper 查询：" + firstMapper.selectByPrimaryKey(roleKey));
    System.out.println("secondUserMapper 查询：" + secondMapper.selectByPrimaryKey(roleKey));
}
```

- 日志

查询了两次。第二次查询并没有命中缓存。

```
2018-09-08 14:29:55.104  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,NAME,CODE,DESCRIPTION,created_time,updated_time FROM rOLE WHERE ID = ? 
2018-09-08 14:29:55.125  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:29:55.142  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - <==      Total: 1
firstUserMapper 查询：Role{id=1, name='管理员', code='admin', description='这个系统里天下第一', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
2018-09-08 14:29:55.145  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper:62 - Cache Hit Ratio [com.github.houbb.mybatis.learn.cache.mapper.RoleMapper]: 0.0
2018-09-08 14:29:55.145  DEBUG [main] org.springframework.jdbc.datasource.DataSourceUtils:114 - Fetching JDBC Connection from DataSource
2018-09-08 14:29:55.161  DEBUG [main] org.mybatis.spring.transaction.SpringManagedTransaction:89 - JDBC Connection [jdbc:mysql://127.0.0.1:13306/mybatis?useUnicode=true&characterEncoding=UTF-8&useOldAlias, UserName=root@172.17.0.1, MySQL Connector Java] will not be managed by Spring
2018-09-08 14:29:55.161  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,NAME,CODE,DESCRIPTION,created_time,updated_time FROM rOLE WHERE ID = ? 
2018-09-08 14:29:55.161  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:29:55.163  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - <==      Total: 1
secondUserMapper 查询：Role{id=1, name='管理员', code='admin', description='这个系统里天下第一', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
```

## 实验二

- 场景

两个 session，第一个提交事务

- 代码

```java
@Test
public void firstCommitTest() {
    final Long roleKey = 1L;
    SqlSession firstSqlSession = sqlSessionFactory.openSession(true);
    SqlSession secondSqlSession = sqlSessionFactory.openSession(true);
    RoleMapper firstMapper = firstSqlSession.getMapper(RoleMapper.class);
    RoleMapper secondMapper = secondSqlSession.getMapper(RoleMapper.class);
    System.out.println("firstUserMapper 查询：" + firstMapper.selectByPrimaryKey(roleKey));
    firstSqlSession.commit();
    System.out.println("secondUserMapper 查询：" + secondMapper.selectByPrimaryKey(roleKey));
}
```

- 日志

命中缓存

```
2018-09-08 14:33:27.360  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,NAME,CODE,DESCRIPTION,created_time,updated_time FROM rOLE WHERE ID = ? 
2018-09-08 14:33:27.380  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:33:27.398  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - <==      Total: 1
firstUserMapper 查询：Role{id=1, name='管理员', code='admin', description='这个系统里天下第一', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
2018-09-08 14:33:27.416  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper:62 - Cache Hit Ratio [com.github.houbb.mybatis.learn.cache.mapper.RoleMapper]: 0.5
secondUserMapper 查询：Role{id=1, name='管理员', code='admin', description='这个系统里天下第一', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 04:37:10 CST 2018}
```

## 实验三

不同 sql session 更新的影响。

- 场景

两个 session，第一个提交事务。第三个事务更新，第二个事务查询。

- 代码

```java
@Test
public void firstCommitUpdateTest() {
    final Long roleKey = 1L;
    SqlSession firstSqlSession = sqlSessionFactory.openSession(true);
    SqlSession secondSqlSession = sqlSessionFactory.openSession(true);
    SqlSession thirdSqlSession = sqlSessionFactory.openSession(true);
    RoleMapper firstMapper = firstSqlSession.getMapper(RoleMapper.class);
    RoleMapper secondMapper = secondSqlSession.getMapper(RoleMapper.class);
    RoleMapper thirdMapper = thirdSqlSession.getMapper(RoleMapper.class);
    System.out.println("firstUserMapper 查询：" + firstMapper.selectByPrimaryKey(roleKey));
    firstSqlSession.commit();

    Role role = new Role();
    role.setId(roleKey);
    role.setDescription("新的描述哈哈哈");
    thirdMapper.updateByPrimaryKeySelective(role);
    thirdSqlSession.commit();
    
    System.out.println("secondUserMapper 查询：" + secondMapper.selectByPrimaryKey(roleKey));
}
```

- 日志

执行更新操作之后，需要再次查询数据库。


```
2018-09-08 14:40:48.712  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,NAME,CODE,DESCRIPTION,created_time,updated_time FROM rOLE WHERE ID = ? 
2018-09-08 14:40:48.734  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:40:48.750  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - <==      Total: 1
firstUserMapper 查询：Role{id=1, name='管理员', code='admin', description='新的描述哈哈哈', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 06:39:51 CST 2018}
2018-09-08 14:40:48.785  DEBUG [main] org.springframework.jdbc.datasource.DataSourceUtils:114 - Fetching JDBC Connection from DataSource
2018-09-08 14:40:48.795  DEBUG [main] org.mybatis.spring.transaction.SpringManagedTransaction:89 - JDBC Connection [jdbc:mysql://127.0.0.1:13306/mybatis?useUnicode=true&characterEncoding=UTF-8&useOldAlias, UserName=root@172.17.0.1, MySQL Connector Java] will not be managed by Spring
2018-09-08 14:40:48.795  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.updateByPrimaryKeySelective:145 - ==>  Preparing: UPDATE rOLE SET DESCRIPTION = ? WHERE ID = ? 
2018-09-08 14:40:48.796  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.updateByPrimaryKeySelective:145 - ==> Parameters: 新的描述哈哈哈(String), 1(Long)
2018-09-08 14:40:48.797  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.updateByPrimaryKeySelective:145 - <==    Updates: 1
2018-09-08 14:40:48.798  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper:62 - Cache Hit Ratio [com.github.houbb.mybatis.learn.cache.mapper.RoleMapper]: 0.0
2018-09-08 14:40:48.798  DEBUG [main] org.springframework.jdbc.datasource.DataSourceUtils:114 - Fetching JDBC Connection from DataSource
2018-09-08 14:40:48.806  DEBUG [main] org.mybatis.spring.transaction.SpringManagedTransaction:89 - JDBC Connection [jdbc:mysql://127.0.0.1:13306/mybatis?useUnicode=true&characterEncoding=UTF-8&useOldAlias, UserName=root@172.17.0.1, MySQL Connector Java] will not be managed by Spring
2018-09-08 14:40:48.807  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==>  Preparing: SELECT ID,NAME,CODE,DESCRIPTION,created_time,updated_time FROM rOLE WHERE ID = ? 
2018-09-08 14:40:48.807  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - ==> Parameters: 1(Long)
2018-09-08 14:40:48.808  DEBUG [main] com.github.houbb.mybatis.learn.cache.mapper.RoleMapper.selectByPrimaryKey:145 - <==      Total: 1
secondUserMapper 查询：Role{id=1, name='管理员', code='admin', description='新的描述哈哈哈', createdTime=Sat Sep 08 04:37:10 CST 2018, updatedTime=Sat Sep 08 06:39:51 CST 2018}
```

## 备注

mybatis 缓存不适应于多表关联的场景。

可以再一个表的缓存中，引用另一个关联表的 cache 即可。

# 参考资料

- mybatis

[聊聊 MyBatis 缓存机制](https://tech.meituan.com/mybatis_cache.html)

[源码解读 MyBatis 的缓存](https://www.cnblogs.com/fangjian0423/p/mybatis-cache.html)

* any list
{:toc}
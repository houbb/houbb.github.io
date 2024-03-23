---
layout: post
title: spring jdbctemplate 入门使用
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, orm, jdbc, sql-budiler, spring, sh]
published: true
---

# 拓展阅读

> [linq](https://houbb.github.io/2017/03/20/dotnet-linq)

> [querydsl](https://houbb.github.io/2016/05/21/orm-07-querydsl)

# 个人入门实战

## mysql 表初始化

```sql
create database test_jdbc;
use test_jdbc;

create table user_info
(
    username varchar(32) NOT NULL,
    age      int         NOT NULL
);
```

## maven 依赖

```xml
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.8</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.12</version>
</dependency>
<!-- Spring-jdbc 用于配置JdbcTemplate -->
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>5.0.9.RELEASE</version>
</dependency>
```

## 入门例子

```java
package com.github.houbb.jdbctempalte.test;

import com.github.houbb.jdbctempalte.test.model.UserInfo;
import com.github.houbb.jdbctemplate.core.support.DatasourceUtil;
import com.github.houbb.jdbctemplate.core.support.JdbcTemplateUtil;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.util.List;

public class CrudTest {

    public static void main(String[] args) {
        String className = "com.mysql.jdbc.Driver";
        String url = "jdbc:mysql://localhost:3306/test_jdbc";
        String username = "admin";
        String password = "123456";

        DataSource dataSource = DatasourceUtil.druid(className, url, username, password);

        JdbcTemplate jdbcTemplate = JdbcTemplateUtil.spring(dataSource);

        // 删除全部
        jdbcTemplate.update("delete from user_info");

        // 插入
        jdbcTemplate.update("insert into user_info (username, age) values (?, ?)", "u1", 10);
        jdbcTemplate.update("insert into user_info (username, age) values (?, ?)", "u2", 20);
        jdbcTemplate.update("insert into user_info (username, age) values (?, ?)", "u3", 80);

        // 修改
        jdbcTemplate.update("update user_info set age=? where username=?", 21, "u2");

        // 删除
        jdbcTemplate.update("delete from user_info where username=?", "u3");

        // 查询
//        List<UserInfo> userInfoList = jdbcTemplate.queryForList("select username, age from user_info", BeanPropertyRowMapper<>(UserInfo.class));
//        System.out.println(userInfoList);

        List<UserInfo> userInfoList = jdbcTemplate.query("select username, age from user_info", new BeanPropertyRowMapper<>(UserInfo.class));
        System.out.println(userInfoList);

        UserInfo userInfo = jdbcTemplate.queryForObject("select username, age from user_info where username='u2'", new BeanPropertyRowMapper<>(UserInfo.class));
        System.out.println(userInfo);

        int userCount = jdbcTemplate.queryForObject("select count(*) from user_info", Integer.class);
        System.out.println(userCount);
    }

}
```

### 报错1: Spring Jdbc异常：IncorrectResultSetColumnCountException: Incorrect column count: expected 1, actual 2

```java
List<UserInfo> userInfoList = jdbcTemplate.queryForList("select username, age from user_info", BeanPropertyRowMapper<>(UserInfo.class));
System.out.println(userInfoList);
```

以为是查询返回一个列表，结果报错：

```
org.springframework.jdbc.IncorrectResultSetColumnCountException: Incorrect column count: expected 1, actual 2
	at org.springframework.jdbc.core.SingleColumnRowMapper.mapRow(SingleColumnRowMapper.java:108)
	at org.springframework.jdbc.core.RowMapperResultSetExtractor.extractData(RowMapperResultSetExtractor.java:94)
```

需要改成：

```java
List<UserInfo> userInfoList = jdbcTemplate.query("select username, age from user_info", new BeanPropertyRowMapper<>(UserInfo.class));
```

# 1、JdbcTemplate的基本介绍

JdbcTemplate 是 Spring 对 JDBC 的封装，目的是使JDBC更加易于使用，JdbcTemplate是Spring的一部分。

JdbcTemplate 处理了资源的建立和释放，它帮助我们避免一些常见的错误，比如忘了总要关闭连接。他运行核心的JDBC工作流，如Statement的建立和执行，而我们只需要提供SQL语句和提取结果即可。

Spring为了简化数据库访问，主要做了以下几点工作：

- 提供了简化的访问JDBC的模板类，不必手动释放资源；

- 提供了一个统一的 DAO 类以实现 Data Access Object 模式；

- 把SQLException封装为DataAccessException，这个异常是一个RuntimeException，并且让我们能区分SQL异常的原因，例如，DuplicateKeyException表示违反了一个唯一约束；

- 能方便地集成Hibernate、JPA和MyBatis这些数据库访问框架。

## 1.1、为什么要使用jdbctemplate

如果直接使用JDBC的话，需要我们加载数据库驱动、创建连接、释放连接、异常处理等一系列的动作，繁琐且代码看起来不直观。

而使用 jdbctemplate 则无需关注加载驱动、释放资源、异常处理等一系列操作，我们只需要提供 sql 语句并且提取最终结果即可，大大方便我们编程开发。

此外，Spring提供的JdbcTempate能直接数据对象映射成实体类，不再需要获取ResultSet去获取值、赋值等操作，提高开发效率；

## 1.2、jdbctemplate常用方法

jdbcTemplate 主要提供的5类方法及使用：

（1）execute() 方法：可以执行任何SQL语句，一般用于执行DDL语句。

（2）update(sqlStr, 参数列表) 方法：用于执行新增、修改、删除等语句。

（3）batchUpdate() 方法：用于执行批处理相关语句，batchUpdate方法第二参数是一个元素为 Object[] 数组类型的 List 集合。

（4）query() 方法及 queryForXXX() 方法：用于执行查询相关语句，查询结果为基本数据类型或者是单个对象一般使用 queryForObject()

queryForInt()：查询一行数据并返回 int 型结果。

例子：

```java
jdbcTemplate.queryForInt("select count(*) from user")
```

queryForObject(sqlStr, 指定的数据类型, 参数列表)：查询一行任何类型的数据，最后一个参数指定返回结果类型。

例子：

```java
jdbcTemplate.queryForObject("selct count(*) from user", Integer.class)
```

queryForMap(sqlStr, 参数列表)：查询一行数据并将该行数据转换为 Map 返回。将会将列名作为key，列值作为 value 封装成 map。当查询出来的行数大于1时会报错。

例子：

```java
jdbcTemplate.queryForMap("select * from user where username = ?", "aaa");
```

`List<Map<String, Object>> queryForList(sqlStr, params)`：将查询结果集封装为 list 集合，该集合的每一条元素都是一个 map。

query(sqlStr, RowMapper对象, 参数列表)：查询多行数据，并将结果集封装为元素是 JavaBean 的 list。

（注意，指定的JavaBean的属性最好不要是基本类型，因为查询出来的结果可能是null，而null赋值为基本数据类型将会报错。比如int最好定义为Integer）

（5）call() 方法：用于执行存储过程、函数相关语句。


# 2、JdbcTemplate的基本使用

## 2.1、新增数据（jdbcTemplate.update）

我们用 `jdbcTemplate.update(sqlStr, params)` 的方法来新增数据。

先导入以下依赖包。

Spring框架的JdbcTemplate在spring-jdbc的jar包中，，除了要导入这个 jar 包外，还需要导入一个 spring-tx的jar包（它是和事务相关的）。

当然连接池的jar包也不能忘记，这里使用的是 druid。

### maven 依赖

```xml
<dependencies>
  <dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>4.11</version>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.1.8</version>
  </dependency>
  <dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>5.1.12</version>
  </dependency>
  <!-- Spring-jdbc 用于配置JdbcTemplate -->
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-jdbc</artifactId>
    <version>5.0.9.RELEASE</version>
  </dependency>
 
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>5.0.6.RELEASE</version>
  </dependency>
  <!--事务-->
  <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-tx</artifactId>
    <version>5.0.2.RELEASE</version>
  </dependency>
  <dependency>
    <groupId>commons-logging</groupId>
    <artifactId>commons-logging</artifactId>
    <version>1.2</version>
  </dependency>
 
</dependencies>
```


然后在 spring 的 xml 配置文件中配置数据库连接池和 JdbcTemplate，同时我们也开启组件扫描。

另外我们可以通过一个  jdbc.properties 配置文件来维护数据库的连接配置。

jdbc.properties 配置文件内容：

```ini
prop.driverClass=com.mysql.jdbc.Driver
prop.url=jdbc:mysql://localhost:3306/test
prop.username=root
prop.password=123456
```

spring 的 xml 配置文件内容如下，文件命名可自定义，比如下面我们将其命名为 bean01.xml：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:context="http://www.springframework.org/schema/context"
       xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
                           http://www.springframework.org/schema/context http://www.springframework.org/schema/context/spring-context.xsd">
 
    <!--开启组件扫描-->
    <context:component-scan base-package="test, service, dao"></context:component-scan>
 
    <!--引入外部配置文件-->
    <context:property-placeholder location="classpath:jdbc.properties"/>
 
    <!--配置数据库连接池-->
    <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource">
        <property name="driverClassName" value="${prop.driverClass}"></property>  <!--通过${}使用外部配置文件的值-->
        <property name="url" value="${prop.url}"></property>
        <property name="username" value="${prop.username}"></property>
        <property name="password" value="${prop.password}"></property>
    </bean>
 
    <!-- 配置JdbcTmplate -->
    <bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
        <!-- 注入dataSource -->
        <property name="dataSource" ref="dataSource"></property>
        <!-- <constructor-arg name="dataSource" ref="dataSource"></constructor-arg>-->  <!-- 也可以用构造函数写法 -->
    </bean>
</beans>
```

新建一个实体类 User ：

```java
package entity;
public class User {
    private int id;
    private String name;
    private String password;
    public int getId() {
        return id;
    }
    public void setId(int id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
}
```

新建一个 UserDaoImpl 类：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class UserDaoImpl implements UserDao{
    //注入JdbcTemplate
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public void addUser(User user) {
        //创建SQL语句
        String sql = "insert into user values(?, ?, ?)";
        //调用方法执行SQL
        int updateRow = jdbcTemplate.update(sql, user.getId(), user.getName(), user.getPassword());
        
        System.out.println(updateRow);
    }
}
```

验证代码：

```java
package test;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import org.springframework.jdbc.core.JdbcTemplate;
import entity.User;
import service.UserService;
import service.UserServiceImpl;
public class Test01 {
    ApplicationContext ioc = new ClassPathXmlApplicationContext("bean01.xml");
    //JdbcTemplate jdbcTemplate= ioc.getBean(JdbcTemplate.class);   //我们也可以直接通过获取到的jdbctemplate进行SQL操作，上面使用UserServiceImpl和UserDaoImpl只是为了更符合MVC分层的规范
    //jdbcTemplate.update(sqlStr);
    @Test
    public void test1() {
        User user = new User();
        user.setId(5);
        user.setName("AA");
        user.setPassword("112233");
        UserService userService = ioc.getBean(UserServiceImpl.class);
        userService.addUser(user);   //执行增加方法
    }
}
```

### 2.1.1、批量增加（batchUpdate）

批量增加可以使用 jdbcTemplate.batchUpdate() 方法，示例如下：

UserServiceImpl 增加批量增加方法：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    @Override
    public void addBath(List<Object[]> userList) {
        userDao.addBath(userList);
    }
}
```

UserDaoImpl 增加批量增加方法：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Arrays;
import java.util.List;
@Repository
public class UserDaoImpl implements UserDao {
    //注入JdbcTemplate
    @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public void addBath(List<Object[]> userList) {
        String sql = "insert into user values(?, ?, ?)";
        int[] ints = jdbcTemplate.batchUpdate(sql, userList);  //batchUpdate方法第二个参数是集合，该集合元素是数组，数组里面的每个值对应着添加到数据库表里面的字段值。该方法返回影响行数数组
        System.out.println(Arrays.toString(ints));
    }
}
```

验证：

```java
package test;
import entity.User;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import service.UserService;
import service.UserServiceImpl;
import java.util.ArrayList;
import java.util.List;
public class TestMain {
    ApplicationContext ioc = new ClassPathXmlApplicationContext("bean01.xml");
    @Test
    public void test2() {
        List<Object[]> userList = new ArrayList<>();
        Object[] arr1 = {1, "name1", "password1"};
        Object[] arr2 = {2, "name2", "password2"};
        Object[] arr3 = {3, "name3", "password3"};
        userList.add(arr1);
        userList.add(arr2);
        userList.add(arr3);
        UserService userService = ioc.getBean(UserServiceImpl.class);
        userService.addBath(userList);
    }
}
```

## 2.2、修改和删除数据（jdbcTemplate.update）

修改和删除跟上面的新增操作一样，只是SQL语句不同而已。

UserServiceImpl 增加修改和删除方法：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    @Override
    public void updateUser(User user) {
        userDao.updateUser(user);
    }
    @Override
    public void deleteUser(int userId) {
        userDao.deleteUser(userId);
    }
}
```

UserDaoImpl 增加修改删除方法：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class UserDaoImpl implements UserDao{
    //注入JdbcTemplate
     @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public void updateUser(User user) {
        String sql = "update user set name=?, password=? where id=?";
        int updateRow = jdbcTemplate.update(sql, user.getName(), user.getPassword(), user.getId());
        System.out.println(updateRow);
    }
    @Override
    public void deleteUser(int userId) {
        String sql = "delete from user where id=?";
        int updateRow = jdbcTemplate.update(sql, userId);
        System.out.println(updateRow);
    }
}
```

验证代码：

```java
package test;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;import entity.User;
import service.UserService;
import service.UserServiceImpl;public class Test01 {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean01.xml");
    //修改操作
    @Test
    public void test1() {
        User user = new User();
        user.setId(2);
        user.setName("AA");
        user.setPassword("112233");
        UserService userService = applicationContext.getBean(UserServiceImpl.class);
        userService.updateUser(user);
    }
    //删除操作
    @Test
    public void test2() {
        UserService userService = applicationContext.getBean(UserServiceImpl.class);
        userService.deleteUser(5);
    }
}
```

### 批量修改和删除（batchUpdate）

批量修改和批量删除都可以使用 jdbcTemplate.batchUpdate() 方法，该用于执行批处理相关语句，batchUpdate() 方法第二参数是一个元素为 Object[] 数组类型的 List 集合。

示例如下。

UserServiceImpl 增加批量修改和删除方法：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    //批量修改
    @Override
    public void updateBatch(List<Object[]> listArg) {
        userDao.updateBatch(listArg);
    }
    //批量删除
    @Override
    public void deleteBath(List<Object[]> listArg) {
        userDao.deleteBath(listArg);
    }
}
```

UserDaoImpl 增加批量修改和删除方法：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Arrays;
import java.util.List;
@Repository
public class UserDaoImpl implements UserDao {
    //注入JdbcTemplate
    @Autowired
    private JdbcTemplate jdbcTemplate;
    //批量修改
    @Override
    public void updateBatch(List<Object[]> listArg) {
        String sql = "update user set name=?, password=? where id=?";
        int[] ints = jdbcTemplate.batchUpdate(sql, listArg);
        System.out.println(Arrays.toString(ints));
    }
    //批量删除
    @Override
    public void deleteBath(List<Object[]> listArg) {
        String sql = "delete from user where id=?";
        int[] ints = jdbcTemplate.batchUpdate(sql, listArg);
        System.out.println(Arrays.toString(ints));
    }
}
```

验证：

```java
package test;
import entity.User;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import service.UserService;
import service.UserServiceImpl;
import java.util.ArrayList;
import java.util.List;
public class TestMain {
    ApplicationContext ioc = new ClassPathXmlApplicationContext("bean01.xml");
    //批量修改
    @Test
    public void test3() {
        List<Object[]> userList = new ArrayList<>();
        Object[] arr1 = {"name1changed", "password1", 1};
        Object[] arr2 = {"name2changed", "password2", 2};
        Object[] arr3 = {"name3changed", "password3", 3};
        userList.add(arr1);
        userList.add(arr2);
        userList.add(arr3);
        UserService userService = ioc.getBean(UserServiceImpl.class);
        userService.updateBatch(userList);
    }
    //批量删除
    @Test
    public void test4() {
        List<Object[]> userList = new ArrayList<>();
        Object[] arr1 = {6};
        Object[] arr2 = {7};
        userList.add(arr1);
        userList.add(arr2);
        UserService userService = ioc.getBean(UserServiceImpl.class);
        userService.deleteBath(userList);
    }
}
```

## 2.3、查询数据

### 2.3.1、查询返回某个值（queryForObject）

queryForObject(sqlStr, 指定的数据类型, 参数列表)：查询一行任何类型的数据，最后一个参数指定返回结果类型。

比如查询 user 表内数据总数：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    @Override
    public int getUserCount() {
        return userDao.getUserCount();
    }
}
```

UserDaoImpl 代码：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class UserDaoImpl implements UserDao{
    //注入JdbcTemplate
     @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public int getUserCount() {
        String sql = "select count(*) from user";
        int userCount = jdbcTemplate.queryForObject(sql, int.class);  //第二个参数是返回类型的class
        return userCount;
    }
}
```

验证：

```java
package test;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import entity.User;
import service.UserService;
import service.UserServiceImpl;
public class Test01 {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean01.xml");
    //查询数量
    @Test
    public void test4() {
        UserService userService = applicationContext.getBean(UserServiceImpl.class);
        int userCount = userService.getUserCount();
        System.out.println(userCount);   //将输出user表内数据总数
    }
}
```

## 2.3.2、查询返回一个JavaBean（queryForObject）

比如查询 user 表内某一条数据，然后我们可以将该数据封装成一个 User 对象：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    @Override
    public User getUserInfo(int userId) {
        return userDao.getUserInfo(userId);
    }
}
```

UserDaoImpl 代码：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
@Repository
public class UserDaoImpl implements UserDao{
    //注入JdbcTemplate
     @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public User getUserInfo(int userId) {
        String sql = "select * from user where id=?";
        // rowMapper 是一个接口，可以使用这个接口里面的实现类完成数据的封装，规定每一行记录和JavaBean的属性如何映射
        User user = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(User.class), userId);
        return user;
    }
}
```

验证：

```java
package test;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import entity.User;
import service.UserService;
import service.UserServiceImpl;
public class Test01 {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean01.xml");
    @Test
    public void test3() {
        UserService userService = applicationContext.getBean(UserServiceImpl.class);
        User user = userService.getUserInfo(2);
        System.out.println(user.getName());
    }
}
```

### 2.3.2、查询返回集合（query）

query(sqlStr, RowMapper对象, 参数列表)：查询多行数据，并将结果集封装为元素是 JavaBean 的 list。

（注意，指定的 JavaBean 的属性最好不要是基本类型，因为查询出来的结果可能是null，而null赋值为基本数据类型将会报错。比如int最好定义为Integer）

比如查询 user 表内的所有数据，并且将数据都封装成 User 对象：

```java
package service;
import dao.UserDao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
public class UserServiceImpl implements UserService{
    @Autowired
    private UserDao userDao;
    @Override
    public List<User> getAllUser() {
        return userDao.getAllUser();
    }
}
```

UserDaoImpl 代码：

```java
package dao;
import entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public class UserDaoImpl implements UserDao{
    //注入JdbcTemplate
     @Autowired
    private JdbcTemplate jdbcTemplate;
    @Override
    public List<User> getAllUser() {
        String sql = "select * from user";
        List<User> userList = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(User.class));
        return userList;
    }
}
```

验证：

```java
package test;
import org.junit.Test;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;
import entity.User;
import service.UserService;
import service.UserServiceImpl;
import java.util.List;
public class Test01 {
    ApplicationContext applicationContext = new ClassPathXmlApplicationContext("bean01.xml");
    //查询全部数据
    @Test
    public void test5() {
        UserService userService = applicationContext.getBean(UserServiceImpl.class);
        List<User> userList = userService.getAllUser();
        for (User user: userList) {
            System.out.println(user.getName());
        }
    }
}
```

# 参考资料

https://www.cnblogs.com/wenxuehai/p/14716372.html

https://blog.csdn.net/lizz861109/article/details/120923814

* any list
{:toc}
---
layout: post
title: IM 即时通讯系统 SSO 系列-03-基于 mybatis 实现 CRUD
date: 2024-11-02 21:01:55 +0800
categories: [IM]
tags: [im, opensource, sh]
published: true
---

# 实现基本的 crud

## pom.xml

```xml
<dependency>
	<groupId>org.mybatis.spring.boot</groupId>
	<artifactId>mybatis-spring-boot-starter</artifactId>
	<version>2.2.2</version>
</dependency>
<dependency>
	<groupId>mysql</groupId>
	<artifactId>mysql-connector-java</artifactId>
	<version>8.0.33</version>
</dependency>
<dependency>
	<groupId>com.github.pagehelper</groupId>
	<artifactId>pagehelper-spring-boot-starter</artifactId>
	<version>1.4.6</version>
</dependency>
```

## 实体

- 公司

```java
public class Company {
    private Long id;
    private String name;
    private Date createTime;
    private Date updateTime;
    //...
}
```

- 部门

```java
public class Department {
    private Long id;
    private Long companyId;
    private String name;
    private Date createTime;
    private Date updateTime;
}
```

- 小组

```java
public class Team {
    private Long id;
    private Long departmentId;
    private String name;
    private Date createTime;
    private Date updateTime;
```

- 用户

```java
public class User {
    private Long id;
    private Long teamId;
    private String username;
    private String password;
    private Integer userType;
    private Date createTime;
    private Date updateTime;
```

## mapper

实现 mapper 对应的 crud

## service

实现 service 对应的 crud

## controller

实现 controller 对应的 crud

## 配置文件

- application.properties

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sso?useSSL=false&serverTimezone=UTC&characterEncoding=utf8
spring.datasource.username=admin
spring.datasource.password=123456
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

mybatis.mapper-locations=classpath:mapper/*.xml
mybatis.type-aliases-package=com.example.ssobackend.entity
```

# 参考资料

* any list
{:toc}
---
layout: post
title:  手写 Hibernate ORM 框架 00-环境准备
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, middleware, orm, mybatis, sql, sh]
published: true
---

# 手写框架

类似的还有其他系列，主要用于学习其中的原理。

Hibernate 属于比较早的框架了，后期将实现一套 mybatis。

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

# 前言

Hibernate 相信接触过 java 的人都不会陌生。

今天我们一起写一个简化版的 Hibernate，用于加深对此 ORM 工具的理解。

## 代码地址

> [java 从零手写 hibernate](https://github.com/houbb/hibernate) 

# 环境准备

- maven

本项目使用 maven 管理 jar 包

- jdk

jdk 为 1.8

# pom.xml

## 依赖

pom 核心依赖如下:

```xml
<dependencies>
    <dependency>
        <groupId>com.github.houbb</groupId>
        <artifactId>heaven</artifactId>
    </dependency>
    <!--============================== OTHER ==============================-->
    <dependency>
        <groupId>junit</groupId>
        <artifactId>junit</artifactId>
    </dependency>
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
    </dependency>
    <!--dom4j-->
    <dependency>
        <groupId>dom4j</groupId>
        <artifactId>dom4j</artifactId>
    </dependency>
</dependencies>
```

## jar 包功能说明

| 名称 | 作用 | 备注 |
|:---|:---|:---|
| mysql-connector-java | 用于连接 mysql 数据库 | 本项目以 mysql 为例子 |
| dom4j | 用于模拟读取 `hibernate.cfg.xml` | |
| junit | 用于单元测试 | |

# 整体目录结构

便于鸟瞰整个项目

```
D:.                       
├─java                    
│  └─com                  
│      └─github           
│          └─houbb                   
│              └─hibernate           
│                  │  Session.java   
│                  │  Table.java     
│                  │                 
│                  ├─annotations     
│                  │      Column.java
│                  │      Entity.java
│                  │      GenerateValue.java
│                  │      Id.java
│                  │
│                  ├─constants
│                  │      HibernateConstant.java
│                  │      TypeMap.java
│                  │
│                  ├─model
│                  │      User.java
│                  │
│                  └─util
│                          CollectionUtil.java
│                          ConnectionUtil.java
│                          FieldUtil.java
│                          ReflectionUtil.java
│                          StringBuilderUtil.java
│                          StringUtil.java
│                          TableUtil.java
│
└─resources
```

# 小结

本文主要介绍了基本的依赖，和项目整体结构。

后续我们将用几节的文章，介绍一下如何实现一个简单版本的 hibernate

* any list
{:toc}
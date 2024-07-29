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

> [hibernate-simulator](https://github.com/houbb/hibernate-simulator/tree/release_1.0.1) 

# 环境准备

- maven

本项目使用 maven 管理 jar 包

- jdk

jdk 为 1.8

# pom.xml

## 内容

pom 文件如下:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.github.houbb</groupId>
    <artifactId>hibernate-simulator</artifactId>
    <version>1.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <description>模拟 Hibernate</description>
    
    <properties>
        <!--============================== All Plugins START==============================-->
        <plugin.compiler.version>3.2</plugin.compiler.version>
        <plugin.compiler.version>3.2</plugin.compiler.version>
        <plugin.surefire.version>2.18.1</plugin.surefire.version>
        <plugin.surefire.skip-it>true</plugin.surefire.skip-it>
        <plugin.surefire.ignore-failure>true</plugin.surefire.ignore-failure>
        <!--============================== All Plugins END  ==============================-->

        <!--main-->
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.compiler.level>1.8</project.compiler.level>

        <mysql.version>5.1.34</mysql.version>
        <dom4j.version>1.6.1</dom4j.version>
    </properties>

    <dependencies>

        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>${mysql.version}</version>
        </dependency>

        <!--dom4j-->
        <dependency>
            <groupId>dom4j</groupId>
            <artifactId>dom4j</artifactId>
            <version>${dom4j.version}</version>
        </dependency>

        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
            <version>4.12</version>
            <scope>test</scope>
        </dependency>

    </dependencies>

    <build>
        <finalName>${project.name}</finalName>

        <pluginManagement>
            <!--============================== All Plugins ==============================-->
            <plugins>

                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-compiler-plugin</artifactId>
                    <version>${plugin.compiler.version}</version>
                    <configuration>
                        <source>${project.compiler.level}</source>
                        <target>${project.compiler.level}</target>
                        <encoding>${project.build.sourceEncoding}</encoding>
                    </configuration>
                </plugin>

                <plugin>
                    <groupId>org.apache.maven.plugins</groupId>
                    <artifactId>maven-surefire-plugin</artifactId>
                    <version>${plugin.surefire.version}</version>
                    <configuration>
                        <skipTests>true</skipTests>
                        <testFailureIgnore>true</testFailureIgnore>
                    </configuration>
                </plugin>

            </plugins>
        </pluginManagement>

        <!--use plugins-->
        <plugins>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
            </plugin>

        </plugins>
    </build>

</project>
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
.
├── main
│   ├── java
│   │   └── com
│   │       └── ryo
│   │           └── hibernate
│   │               └── simulator
│   │                   ├── hibernate
│   │                   │   ├── Session.java
│   │                   │   ├── Table.java
│   │                   │   ├── annotations
│   │                   │   │   ├── Column.java
│   │                   │   │   ├── Entity.java
│   │                   │   │   ├── GenerateValue.java
│   │                   │   │   └── Id.java
│   │                   │   ├── constants
│   │                   │   │   ├── HibernateConstant.java
│   │                   │   │   └── TypeMap.java
│   │                   │   └── util
│   │                   │       ├── ConnectionUtil.java
│   │                   │       ├── FieldUtil.java
│   │                   │       └── TableUtil.java
│   │                   ├── model
│   │                   │   └── User.java
│   │                   └── util
│   │                       ├── CollectionUtil.java
│   │                       ├── ReflectionUtil.java
│   │                       ├── StringBuilderUtil.java
│   │                       └── StringUtil.java
│   └── resources
│       └── hibernate.cfg.xml
```

# 目录导航

> [目录导航](https://blog.csdn.net/ryo1060732496/article/details/80172300)

* any list
{:toc}
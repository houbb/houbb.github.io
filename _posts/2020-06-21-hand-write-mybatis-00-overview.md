---
layout: post
title:  从零手写实现 mybatis 系列（零）mybatis 核心特性
date:  2020-6-21 15:11:16 +0800
categories: [Java]
tags: [java, hand-write, orm, mybatis, sql, sh]
published: true
---

## 拓展阅读

第一节 [从零开始手写 mybatis（一）MVP 版本](https://mp.weixin.qq.com/s/8eF7oFxgLsilqLYGOVtkGg) 中我们实现了一个最基本的可以运行的 mybatis。

第二节 [从零开始手写 mybatis（二）mybatis interceptor 插件机制详解](https://mp.weixin.qq.com/s/83GzYTQCrWiEowN0gjll0Q)

第三节 [从零开始手写 mybatis（三）jdbc pool 从零实现数据库连接池](https://mp.weixin.qq.com/s/pO1XU_PD2pHyq-bBWMAP2w)

第四节 [从零开始手写 mybatis（四）- mybatis 事务管理机制详解](https://mp.weixin.qq.com/s/6Wa5AbOrg4MhRbZL674t8Q)


## 什么是 MyBatis ？

MyBatis 是一款优秀的持久层框架，它支持定制化 SQL、存储过程以及高级映射。

MyBatis 避免了几乎所有的 JDBC 代码和手动设置参数以及获取结果集。

MyBatis 可以使用简单的 XML 或注解来配置和映射原生信息，将接口和 Java 的 POJOs(Plain Old Java Objects,普通的 Java对象)映射成数据库中的记录。（这是官网解释）

## MyBatis 运行原理

![MyBatis 运行原理](https://segmentfault.com/img/remote/1460000015117931?w=400&h=343)

当框架启动时，通过configuration解析config.xml配置文件和mapper.xml映射文件，映射文件可以使用xml方式或者注解方式，然后由configuration获得sqlsessionfactory对象，再由sqlsessionfactory获得sqlsession数据库访问会话对象，通过会话对象获得对应DAO层的mapper对象，通过调用mapper对象相应方法，框架就会自动执行SQL语句从而获得结果。

## 手写 mybatis

其实整体流程就是这么简单，我们来一起实现一个简单版本的 mybatis。

### 创作目的

（1）深入学习 mybatis 的原理

一千个读者就有一千个哈姆雷特，一千个作者就有一千个莎士比亚。——老马

（2）实现属于自己的 mybatis 工具。

数据库的种类实际上有几百种，比如工作中就用到过 GreenPlum 这种相对小众的数据库，这时候 mybatis 可能就不能使用了。

感觉大可不必，符合 SQL 标准都应该统一支持下，这样更加方便实用。

### 实现方式

本系列目前共计 17 个迭代版本，基本完成了 mybatis 的核心特性。

耗时大概十天左右，相对实现的方式比较简单。

采用 mvp 的开发策略，逐渐添加新的特性。

本系列将对核心代码进行讲解，完整代码已经全部开源

> [https://github.com/houbb/mybatis](https://github.com/houbb/mybatis)

# 核心特性

## 1. 配置的加载

通过 xml、或者代码创建 SqlSessionFactory

### java api

完整的 java api 抽象

### 配置的细化

properties（属性）
settings（设置）
typeAliases（类型别名）
typeHandlers（类型处理器）
objectFactory（对象工厂）
plugins（插件）
environments（环境配置）
databaseIdProvider（数据库厂商标识）
mappers（映射器）

## 2. 通过 SqlSessionFactory 获取对应的 session 

手写线程池

## 3. SQL 的映射

给予动态代理的 SQL 映射

### SQL 的细化

CRUD

参数

结果映射

自动映射？

### 动态 SQL

各种 sql 的拼接

if
choose (when, otherwise)
trim (where, set)
foreach

### SQL 语句构造器

如何构造一个完整的 sql？

## 4. 拦截器

类似于 dubbo 的拦截器实现

## 5. 日志整合

各种常见的日志整合

## 6. spring/springboot 整合

便于开发

## 7. mybatis-generate 开发

提升效率

可以考虑整合 idea 插件

## 完整代码地址

为了便于学习，完整版本代码以开源：

> [https://github.com/houbb/mybatis](https://github.com/houbb/mybatis/tree/release_0.0.1)

* any list
{:toc}
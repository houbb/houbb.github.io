---
layout: post
title:  Mybatis Plus
date:  2018-08-19 14:51:22 +0800
categories: [ORM]
tags: [orm, sql, mybatis, sf]
published: true
---

# Mybatis Plus

[Mybatis Plus](https://github.com/baomidou/mybatis-plus) is an enhanced toolkit of Mybatis to simplify development.


## 特性

无侵入：Mybatis-Plus 在 Mybatis 的基础上进行扩展，只做增强不做改变，引入 Mybatis-Plus 不会对您现有的 Mybatis 构架产生任何影响，而且 MP 支持所有 Mybatis 原生的特性

依赖少：仅仅依赖 Mybatis 以及 Mybatis-Spring

损耗小：启动即会自动注入基本CURD，性能基本无损耗，直接面向对象操作

预防Sql注入：内置Sql注入剥离器，有效预防Sql注入攻击

通用CRUD操作：内置通用 Mapper、通用 Service，仅仅通过少量配置即可实现单表大部分 CRUD 操作，更有强大的条件构造器，满足各类使用需求

多种主键策略：支持多达4种主键策略（内含分布式唯一ID生成器），可自由配置，完美解决主键问题

支持热加载：Mapper 对应的 XML 支持热加载，对于简单的 CRUD 操作，甚至可以无 XML 启动

支持ActiveRecord：支持 ActiveRecord 形式调用，实体类只需继承 Model 类即可实现基本 CRUD 操作

支持代码生成：采用代码或者 Maven 插件可快速生成 Mapper 、 Model 、 Service 、 Controller 层代码，支持模板引擎，更有超多自定义配置等您来使用（P.S. 比 Mybatis 官方的 Generator 更加强大！）

支持自定义全局通用操作：支持全局通用方法注入（ Write once, use anywhere ）

支持关键词自动转义：支持数据库关键词（order、key......）自动转义，还可自定义关键词

内置分页插件：基于Mybatis物理分页，开发者无需关心具体操作，配置好插件之后，写分页等同于写基本List查询

内置性能分析插件：可输出Sql语句以及其执行时间，建议开发测试时启用该功能，能有效解决慢查询

内置全局拦截插件：提供全表 delete 、 update 操作智能分析阻断，预防误操作


# 想法

重复的轮子总是被制造，所以我们应该学着去完善轮着。

比如 mybatis-plus。

* any list
{:toc}

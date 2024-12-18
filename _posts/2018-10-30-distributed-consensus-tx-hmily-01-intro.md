---
layout: post
title: Hmily-高性能分布式事物框架概览
date:  2018-10-30 06:48:58 +0800
categories: [Distributed]
tags: [distributed, sql, transaction, sh]
published: true
---

# Hmily


Hmily 是一款高性能，零侵入，金[Hmily (How much I love you)](https://github.com/dromara/hmily)融级分布式事务解决方案，目前主要提供柔性事务的支持，包含 TCC, TAC(自动生成回滚SQL) 方案，未来还会支持 XA 等方案。

![hmily](https://dromara.org/img/architecture/hmily-framework.png)

## 功能

高可靠性 ：支持分布式场景下，事务异常回滚，超时异常恢复，防止事务悬挂。

易用性 ：提供零侵入性式的 Spring-Boot, Spring-Namespace 快速与业务系统集成。

高性能 ：去中心化设计，与业务系统完全融合，天然支持集群部署。

可观测性 ：Metrics多项指标性能监控，以及admin管理后台UI展示。

多种RPC ： 支持 Dubbo, SpringCloud,Motan, brpc, tars 等知名RPC框架。

日志存储 ： 支持 mysql, oracle, mongodb, redis, zookeeper 等方式。

复杂场景 ： 支持RPC嵌套调用事务。

## 必要前提

必须使用 JDK8+

TCC模式下，用户必须要使用一款 RPC 框架, 比如 : Dubbo, SpringCloud,Motan

TAC模式下，用户必须使用关系型数据库, 比如：mysql, oracle, sqlsever

# TCC 模式

当使用TCC模式的时候,用户根据自身业务需求提供 try, confirm, cancel 等三个方法， 并且 confirm, cancel 方法由自身完成实现，框架只是负责来调用，来达到事务的一致性。

![TCC mode](https://yu199195.github.io/images/hmily/hmily-tcc.png)

# TAC 模式

当用户使用TAC模式的时候，用户必须使用关系型数据库来进行业务操作，框架会自动生成回滚SQL, 当业务异常的时候，会执行回滚SQL来达到事务的一致性

![TAC mode](https://yu199195.github.io/images/hmily/hmily-tac.png)

# 关于Hmily

Hmily是柔性分布式事务解决方案，提供了TCC 与 TAC 模式。

它以零侵入以及快速集成方式能够方便的被业务进行整合。

在性能上，日志存储异步（可选）以及使用异步执行的方式，不损耗业务方法方法。

之前是由我个人开发，目前在京东数科重启，未来会成为京东数科的分布式事务解决方案。

## 相关博客
  
[高性能](https://mp.weixin.qq.com/s/Eh9CKTU0nwLZ1rl3xmaZGA)
  
[源码解析博客](https://yu199195.github.io/categories/hmily-tcc/)

[TCC原理介绍](https://github.com/yu199195/hmily/wiki/Theory)

# 术语

发起者：全局事务的发起者，在一个请求链路资源方法里面，最先需要对分布式资源进行事务处理的地方，在Hmily框架里面 可以表示为：一个请求最先遇到 @HmilyTCC or @HmilyTAC 注解的方法，该所属方法应用被称为发起者。

参与者：分布式服务或者资源，需要与其他服务一起参与到一次分布式事务场景下。在Hmily框架里面，表现为一个RPC框架的接口被加上@Hmily注解。

协调者：用来协调分布式事务到底是commit，还是 rollback的角色，他可以是远程的，也可以是本地的，可以是中心化的，也可以是去中心化的。在Hmily框架里面的协调者是本地去中心化的角色。

TCC ：Try, Confirm, Cancel 3个阶段的简称。

TAC ：Try Auto Cancel的简称。Try阶段预留资源后，会由框架自动生成反向的操作资源的行为。

# 为什么高性能

1. 采用disruptor进行事务日志的异步读写（disruptor是一个无锁，无GC的并发编程框架）

2. 异步执行 confrim,cancel 方法。

3. ThreadLocal 缓存的使用。 

4. GuavaCache 的使用

# 参考资料

https://dromara.org/zh/projects/hmily/overview/

https://blog.csdn.net/X5fnncxzq4/article/details/82919860

* any list
{:toc}
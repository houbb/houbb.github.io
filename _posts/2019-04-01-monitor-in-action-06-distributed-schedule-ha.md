---
layout: post
title: 监控系统实战-05-分布式调度等如何实现 HA? 跨机房
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

分布式调度，要如何保证多机房可用？

## HA

[高可用篇之异地多活异地双活入门介绍](https://houbb.github.io/2024/09/13/dis-active-01-overview)

## 拓展阅读

[schedule-00-任务调度整体概览](https://houbb.github.io/2024/01/10/schedule-00-overview)

[分布式锁-02-SQL 数据库实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-02-sql)

[分布式锁-01-基于 Zookeeper 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-01-zookeeper)

[分布式锁-03-基于 mysql 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-03-mysql)

## 项目

[基于数据库最简单的分布式任务调度。(The simplest distributed schedule based on database.)](https://github.com/houbb/distributed-schedule)

[The distributed lock tool for java.(java 实现开箱即用基于 redis 的分布式锁，支持可重入锁获取。内置整合 spring、springboot。)](https://github.com/houbb/lock)

# 网络连通性

## 隔离的必要性

一般而言，如果选择双机房这种高可用方案。

那么两个机房的网络+端口隔离有一定的必要性。

## 联通的必要性

但是在分布式调度，或者是分布式服务时。

当一个机房发生故障，因为服务端只剩下一半，但是机房业务服务可用，不可能让业务服务器也一般不可用。

所以要打通两个机房的网络。

不过要优先最近网络访问。

# 小结

隔离是为了避免串，同时保证性能和隔离性。

但是 HA 的要求时，当服务端在一个机房挂掉的时候，必须有服务可以使用，而不是直接不可用。

# 参考资料

无

* any list
{:toc}
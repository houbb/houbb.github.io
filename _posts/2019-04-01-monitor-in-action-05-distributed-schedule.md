---
layout: post
title: 监控系统实战-05-任务的分布式调度
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 背景

在单机时代，我们如果想实现一个调度系统，那么并不难。

但是在分布式服务的今天，如何实现一个分布式调度的服务呢？

## 拓展阅读

[schedule-00-任务调度整体概览](https://houbb.github.io/2024/01/10/schedule-00-overview)

[分布式锁-02-SQL 数据库实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-02-sql)

[分布式锁-01-基于 Zookeeper 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-01-zookeeper)

[分布式锁-03-基于 mysql 实现分布式锁](https://houbb.github.io/2018/09/08/distributed-lock-03-mysql)

## 项目

[基于数据库最简单的分布式任务调度。(The simplest distributed schedule based on database.)](https://github.com/houbb/distributed-schedule)

[The distributed lock tool for java.(java 实现开箱即用基于 redis 的分布式锁，支持可重入锁获取。内置整合 spring、springboot。)](https://github.com/houbb/lock)

# 基于数据库的实现思路

## 任务的调度

一分钟一次，找到待执行的任务列表。

通过分布式锁（数据库实现）来避免并发执行问题。

当然分布式锁的方案可以有很多。

## 任务的执行

任务放在异步线程池中执行。

可以引入 mq，这样拓展性更强。

每次执行完，计算下一次的待执行时间。

# 小结

这种要结合自身的业务，其实 jdbc 可以解决大部分的问题。

另外的可以结合多种数据源一起来解决，比如 CAT / 日志 / 普米 / ZABBIX 等等。

# 参考资料

无

* any list
{:toc}
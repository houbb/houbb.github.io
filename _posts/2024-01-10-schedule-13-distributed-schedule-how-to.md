---
layout: post
title: schedule-13-How to 如何实现分布式调度？
date: 2024-01-10 21:01:55 +0800
categories: [Schedule]
tags: [schedule, apache, distribued, work-flow, sh]
published: true
---



# 需求

如何实现分布式调度？

## 任务的触发

什么时候，知道任务需要触发？

## 任务的执行？

任务应该如何被执行？

#  任务的触发调度

## 要求

保证服务的触发是高可用的。

1. 而不是为了让任务的触发，只保留一台触发调度，这种不满足 HA 的条件。

2. 保证每次只有一台机器可以执行任务，这就需要分布式锁。

## 实现方式

可以参考：

> [基于数据库最简单的分布式任务调度](https://github.com/houbb/distributed-schedule)

或者其他分布式调度。

# 任务的执行。

## 本地异步线程池

可以放在本地的异步线程池中执行。

限制好最大的数量+内存队列大小。

每次异步放入队列中执行。

## 基于 rpc

基于远程访问，异步执行，但是执行均分到每一台机器。

## 基于 MQ

这种是比较推荐的方案。

天然异步。







# 实现

已有实现，放在了 github，暂时不开源。

> [distributed-schedule](https://github.com/houbb/distributed-schedule)


* any list
{:toc}
---
layout: post
title: 监控系统实战-08-指标与规则
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# indicator?

cat

event

sql

event

trace

cmdb

measurement（度量）

# rule?

how to use indicator?

what is risk/alarm

其实按照这个角度，风控和报警的设计理念是一样的。

包括度量平台也是。

# 拆分开的优缺点

## 优点

规则和指标不需要强耦合。

指标可以从很多地方来，比如客诉+舆情+日志+报警 等等。

每个系统只需要关注自己的事情就行。

## 缺点

需要很多人重新理解数据。

比如本来 SQL 指标定时跑，满足条件就执行。目前拆分开，就需要重新理解。

而且存在一定的时间差。

不过整体而言，还是利大于弊。

## 个人理解

如果是前期的小项目，可以不考虑拆分。

* any list
{:toc}
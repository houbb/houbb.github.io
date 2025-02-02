---
layout: post
title: 监控系统实战-11-RCA 根本原因分析(Root Cause Analysis) 如何实现？整体的思路
date: 2018-11-25 09:14:43 +0800
categories: [Devops]
tags: [devops, monitor, apm, zabbix, sh]
published: true
---

# 整体的思路

最好的方式是基于图数据库

cmdb + 图数据库(neo4j) + 逻辑推断（权重）+报警结合

切为子图

ui ==》接口==》实现


# 关系

资源 + 机器 + 报警


## 关系

```
app -- 资源 --- 机器 -- 报警
```

## app 和其他资源

```
app -- database
|
|
redis
```

底层对应的 vm / phy 等物理资源。

## 异常过滤

聚集性的 vm / phy

# 实现思路

## 1. alarm 作为出发点

将和 alarm 相关的所有信息关联出来：

app

phy / vm

redis / database

kafka 

## 2. app 关系

app==>app（trace）

app==>Redis

app==>database

## 3. 从新查询 alarm

app

redis

databse

各种资源

## 4. 重新查询关系资源

查询对应的资源信息

app

redis

database

等等

# UI

## filter

appNameList

levelList

time-range

app-resources: kafka / redis / databse / 

## 全景图

意义不大

antv6

## 子图

为了避免 ui 复杂化，通过卡片的形式

按照权重排序处理。

等级+标题

子图可以进一步点击展开


# 基础数据

## cmdb

如何获取到？

作业平台巡检 +  cmdb 基本数据。

## 数据形式

最基本的就是 mysql 存储。

当然 neo4j 可视化比较直观。


# 实现逻辑

要知道缺什么？

实际推断是什么流程？



# 参考资料


* any list
{:toc}
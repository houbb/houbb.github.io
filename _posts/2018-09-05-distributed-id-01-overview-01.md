---
layout: post
title:  分布式标识 Distributed ID-01-Overview 
date:  2018-09-05 08:53:10 +0800
categories: [Distributed]
tags: [id, distributed, random, sh]
published: true
---

# 分布式 ID 生成的需求

不依赖数据库。

# 详细理解原理 

（1）写文件。提前取1000个，然后将下一个值写入文件。 

（2）预取+时间戳+线程好+机器码

时间时钟怎么保持一致？ 

id 递增的线程安全，持久化。

# 基础知识 

网卡 线程 并发安全 持久化 （如果递增）

位运算，进制转换。 


# 常见参考实现

UUID

GUID

timestampe+randomNum

snowflake

mongo.id

serialId 生成策略

基于 oracle/redis 的设计

# 设计步骤

## 单机版+不停机+单线程

- 基本

long++

## 单机版+不停机+多线程

- 线程安全

AtomicLong

- 线程号

## 停机

持久化：

- 文件

- database

- redis

保证分布式可用的，一般只有后两个。

## 分布式

- uuid  X

- timestampe+randomNum  X

- snowflake

- mongo.id

- zookeeper.id

- 美团 id

- 百度 id

- 时钟回拨问题

# 参考资料

[Hibernate ID 生成策略](https://blog.csdn.net/wh_forever/article/details/51778466)

* any list
{:toc}
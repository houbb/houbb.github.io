---
layout: post
title:  Database Read Write Separation
date:  2018-09-04 08:05:56 +0800
categories: [Design]
tags: [database, sql, read-write, design, sh]
published: true
excerpt: mysql 读写分离。
---

# 读写分离

## 作用

物理服务器增加，机器处理能力提升。拿硬件换性能。

主从只负责各自的读和写，极大程度缓解X锁和S锁争用。(ps: 一般的读 mysql 是 mvcc 控制的，不存在锁竞争。)

slave 可以配置 myiasm 引擎，提升查询性能以及节约系统开销。

master 直接写是并发的，slave 通过主库发送来的 binlog 恢复数据是异步。

slave 可以单独设置一些参数来提升其读的性能。

增加冗余，提高可用性。

## 原理

MySQL 读写分离基本原理是让 master 数据库处理写操作，slave 数据库处理读操作。

master 将写操作的变更同步到各个 slave 节点。

## 概念

- 什么是数据库读写分离？

一主多从，读写分离，主动同步，是一种常见的数据库架构，一般来说：

1. 主库，提供数据库写服务

2. 从库，提供数据库读服务

主从之间，通过某种机制同步数据，例如 mysql 的 binlog

一个组从同步集群通常称为一个**分组**。

- 分组架构究竟解决什么问题？

大部分互联网业务读多写少，数据库的读往往最先成为性能瓶颈，如果希望：

1. 线性提升数据库读性能

2. 通过消除读写锁冲突提升数据库写性能

此时可以使用分组架构。

一句话，分组主要解决**数据库读性能瓶颈**问题，在数据库扛不住读的时候，通常读写分离，通过增加从库线性提升系统读性能。

# 水平切分

## 概念

```
+--------------+  (%2==1)   +-----+
| user-service | ---------> | db1 |
+--------------+            +-----+
  |
  | (%2==0)
  v
+--------------+
|     db2      |
+--------------+
```

水平切分，也是一种常见的数据库架构，一般来说：

每个数据库之间没有数据重合，没有类似 binlog 同步的关联

所有数据并集，组成全部数据。

会用算法，来完成数据分割，例如取模。

一个水平切分集群中的每一个数据库，通常称为一个**分片**。

## 作用

大部分互联网业务数据量很大，单库容量容易成为瓶颈，如果希望：

1. 线性降低单库数据容量

2. 线性提升数据库写性能

此时可以使用水平切分架构。

一句话总结，水平切分主要解决数据库数据量大问题，在数据库容量扛不住的时候，通常水平切分。


# 实现方式

## 应用层实现

在应用层，比如使用SpringJDBC/myBatis/Hibernate访问数据库时配置多数据源，这些组件会通过算法把请求分流到不同的数据源。

```
+-----------+  (如果是写操作)  +---------+
|    服务层  | ---------->    | 主数据库 |
+-----------+                +---------+
  |
  | (如果是读操作)
  v
+-----------+
|  从数据库  |
+-----------+

```

参见 [动态数据源](https://houbb.github.io/2018/09/04/spring-dynamic-datasource.md)

### 优缺点

在应用层实现读写分离不需要做底层复杂的配置，而且性能比较好，但是对应用的侵入性比较强，不利于扩展。

而代理实现完全屏蔽了读写分离的细节，从工程上讲，这是比较好的一种实现方式。

## 代理实现 

这种方式是在应用层和数据库集群之间添加一个代理服务，应用层访问代理，代理根据请求类型(读/写)自动分流到不同的数据库服务器。

比如 [mysql-Proxy](https://houbb.github.io/2018/09/04/database-mysql-proxy.md)

官方出品，但是目前尚不稳定。

# 中间件

## 概览

Atlas

cobar

heisenberg

kingshard

OneProxy

Oceanus

ProxySQL

Sharding-JDBC

TDDL

Mango

Maxscale

MySQL router

mysql-proxy

mycat

vitess

ps: 技术选型很多，建议使用 mycat

## mycat

[mycat](https://houbb.github.io/2018/09/04/database-mycat.md)

## mysql-proxy

[mysql-Proxy](https://houbb.github.io/2018/09/04/database-mysql-proxy.md)

# 不推荐应用层读写分离

## 强理由

- 一般来说，垂直拆分，是按照“子业务”维度进行拆分，而不是按照“读写”维度进行拆分，这是模块化设计的基本准则

- 完全打破了“服务化数据库私有”的微服务初衷

两个服务因为同一份数据库资源访问而耦合在一起，当数据库资源发生变化的时候（例如：ip变化，域名变化，表结构变化，水平切分变化等），有两个依赖点需要修改。

- 没法很好的添加缓存

# 拓展阅读

[主从复制](https://houbb.github.io/2018/09/04/spring-master-slave.md)

# 参考资料

- 读写分离

[读写分离 我不喜欢](https://mp.weixin.qq.com/s/6mov6Ke3kyAUcWygDj-uaQ)

[服务读写分离架构，绝不推荐](https://mp.weixin.qq.com/s/kToQ14qOzBu1l1KkIjDcBg)

[服务读写分离(读服务，写服务)，是否可行？](https://mp.weixin.qq.com/s/YGsEcL2sSsKZq08T3S8EIQ)

https://www.jianshu.com/p/000dfd9bc3cf

- 中间件

http://songwie.com/articlelist/44

https://www.zhihu.com/question/31754653

https://www.guokr.com/blog/475765/

- in action

https://www.guokr.com/blog/475765/

- 读写分离手动

http://www.cnblogs.com/surge/p/3582248.html

https://www.bridgeli.cn/archives/166

https://stackoverflow.com/questions/25911359/read-write-splitting-hibernate

* any list
{:toc}
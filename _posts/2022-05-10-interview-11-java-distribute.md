---
layout: post
title:  distributed 分布式相关专题汇总 
date:  2022-05-10 09:22:02 +0800
categories: [Interview]
tags: [interview, distributed, sh]
published: true
---

# 系列目录

[spring 常见面试题]()

[spring-boot 常见面试题]()

[redis 常见面试题]()

[mysql 常见面试题]()

[mq 常见面试题]()

[rpc/dubbo 常见面试题]()

[ZooKeeper 面试题]()

[jvm/gc/双亲委派/类加载流程/jvm 调优 常见面试题]()

[【面试】mybatis 常见面试题汇总](https://mp.weixin.qq.com/s/NuyZyeCsdZTqKHbUcWaiiQ)

# 分布式

[分布式系统-01-书籍推荐](http://houbb.github.io/2021/03/06/distributed-system-01-books)

[分布式系统-02-基本概念](http://houbb.github.io/2021/03/06/distributed-system-02-basic-concept)

[分布式系统-03-数据分布方式原理](http://houbb.github.io/2021/03/06/distributed-system-03-data-distribution)

[分布式系统-04-基本副本理论](http://houbb.github.io/2021/03/06/distributed-system-04-replication-theory)

[分布式系统-05-Lease 机制，判定节点的状态](http://houbb.github.io/2021/03/06/distributed-system-05-lease)

[分布式系统-06-Quorum 简单高效的副本管理机制](http://houbb.github.io/2021/03/06/distributed-system-06-quorum)

[分布式系统-07-log 日志技术](http://houbb.github.io/2021/03/06/distributed-system-07-log)

[分布式系统-08-two phase commit 两阶段提交协议](http://houbb.github.io/2021/03/06/distributed-system-08-two-phase-commit)

[分布式系统-09-MVCC 多版本并发控制](http://houbb.github.io/2021/03/06/distributed-system-09-mvcc)

[分布式系统中的 CAP 定理是什么？](http://houbb.github.io/2018/09/06/distributed-theory-cap)

[分布式系统中的 BASE 理论是什么？](http://houbb.github.io/2018/09/06/distributed-theory-base)

## 分布式锁

[redis 分布式锁设计 redis lock](http://houbb.github.io/2019/01/07/redis-learn-41-lock)

[ZooKeeper 分布式锁](http://houbb.github.io/2018/09/08/distributed-lock-zookeeper)

## 分布式事务

[Hmily-高性能分布式事物框架](http://houbb.github.io/2018/10/30/hmily)

[Seata-一站式分布式事务解决方案](http://houbb.github.io/2018/10/30/distributed-tx-seata)

## 分布式标识

[Distributed ID-01-Overview](http://houbb.github.io/2018/09/05/distributed-id-01-overview-01)

[Distributed ID-02-UUID](http://houbb.github.io/2018/09/05/distributed-id-02-uuid-02)

[Distributed ID-03-Random](http://houbb.github.io/2018/09/05/distributed-id-03-random-03)

[Distributed ID-04-SnowFlake](http://houbb.github.io/2018/09/05/distributed-id-04-snowflake-04)

PS: 基于 redis/mysql 等集中式资源的标识。

# 数据分布式

[Database Sharding](http://houbb.github.io/2018/09/04/database-sharding-01-overview)

[Database Sharding in action](http://houbb.github.io/2018/09/04/database-sharding-02-in-action)

[Database Sharding-03-最佳实践](http://houbb.github.io/2018/09/04/database-sharding-03-best-practice-03)

# 高可用策略

[高可用之限流-01-入门介绍](http://houbb.github.io/2018/12/23/ha-limit-01-basic)

[高可用之降级](http://houbb.github.io/2018/12/23/ha-downgrade)

[高可用之熔断](http://houbb.github.io/2018/12/23/ha-circuit-breaker)

[更好的 java 重试框架 sisyphus 的 3 种使用方式](http://houbb.github.io/2018/08/08/retry-03-sisyphus-usage)

# 算法

## 哈希

[Hash 哈希](http://houbb.github.io/2018/05/30/hash)

[Hash 完美 hash](http://houbb.github.io/2018/05/30/hash-perfect)

[Hash 算法实现](http://houbb.github.io/2018/05/30/hash-impl)

[Hash 碰撞解决方式](http://houbb.github.io/2018/05/30/hash-conflict)

## 负载均衡

[load balance 01-负载均衡基础知识](https://houbb.github.io/2020/06/19/load-balance-01-basic)

[load balance 02-consistent hash algorithm 一致性哈希算法原理详解](http://houbb.github.io/2018/08/13/load-balance-02-consistent-hash-why)

[load balance 03-consistent hash algorithm 一致性哈希算法 java 实现](https://houbb.github.io/2020/06/19/load-balance-03-consistent-hash-in-java)

## 一致性

什么是著名的拜占庭将军问题？

[分布式系统-05-Lease 机制，判定节点的状态](http://houbb.github.io/2021/03/06/distributed-system-05-lease)

[分布式系统-06-Quorum 简单高效的副本管理机制](http://houbb.github.io/2021/03/06/distributed-system-06-quorum)

PBFT 算法：

Viewstamped Replication. 

[Paxos-一致性算法](http://houbb.github.io/2018/10/30/paxos)

[Raft-一致性算法](http://houbb.github.io/2018/10/30/raft)

[ZAB-一致性算法](http://houbb.github.io/2018/10/30/zab)

[时间戳-分布式一致性算法](http://houbb.github.io/2018/08/31/lock-time-series-02)

[Vector Lock 时钟向量-一致性算法](http://houbb.github.io/2018/08/31/lock-vector-clock-01)

[ZooKeeper-01-overview](http://houbb.github.io/2016/09/25/zookeeper-01-overview)

Gossip





# 注册中心

93、注册中心你了解了哪些？

94、consul 的可靠性你了解吗？

95、consul 的机制你有没有具体深入过？有没有和其他的注册中心对比过？

SOFARegister

# 锁

[JCIP-13-无锁队列](http://houbb.github.io/2019/01/18/jcip-13-free-lock-queue)

[JCIP-40-Lock Free 无锁算法](http://houbb.github.io/2019/01/18/jcip-40-lock-free-overview)

[Disruptor 是一个高性能的线程间消息传递库](https://houbb.github.io/2018/07/02/disruptor-01-introduction)

# 参考资料

https://maimai.cn/article/detail?fid=1724791732&efid=4a9eC-XwLGQzl4F09gPajA

* any list
{:toc}
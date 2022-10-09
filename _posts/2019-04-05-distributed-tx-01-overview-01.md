---
layout: post
title: 分布式事务-01-概览
date:  2019-4-5 10:56:39 +0800
categories: [Distributed]
tags: [distributed-tx, dts, transaction, overview, sh]
published: true
---

# 分布式事务

分布式事务服务（Distributed Transaction Service，DTS）是一个分布式事务框架，用来保障在大规模分布式环境下事务的最终一致性。

CAP理论告诉我们在分布式存储系统中，最多只能实现上面的两点。而由于当前的网络硬件肯定会出现延迟丢包等问题，所以分区容忍性是我们必须需要实现的，所以我们只能在一致性和可用性之间进行权衡。

为了保障系统的可用性，互联网系统大多将强一致性需求转换成最终一致性的需求，并通过系统执行幂等性的保证，保证数据的最终一致性。

## 数据一致性

数据一致性理解：

强一致性：当更新操作完成之后，任何多个后续进程或者线程的访问都会返回最新的更新过的值。这种是对用户最友好的，就是用户上一次写什么，下一次就保证能读到什么。根据 CAP 理论，这种实现需要牺牲可用性。

弱一致性：系统并不保证后续进程或者线程的访问都会返回最新的更新过的值。系统在数据写入成功之后，不承诺立即可以读到最新写入的值，也不会具体的承诺多久之后可以读到。

最终一致性：弱一致性的特定形式。系统保证在没有后续更新的前提下，系统最终返回上一次更新操作的值。在没有故障发生的前提下，不一致窗口的时间主要受通信延迟，系统负载和复制副本的个数影响。DNS 是一个典型的最终一致性系统。


# 拓展阅读

- 理论

[CAP 原理](https://houbb.github.io/2018/08/13/sql-theory)

[Paxos 算法](https://houbb.github.io/2018/10/30/paxos)

[Raft 算法](https://houbb.github.io/2018/10/30/raft)

[一致性 hash 算法](https://houbb.github.io/2018/08/13/consistent-hash)

- no sql

[nosql talk](https://houbb.github.io/2018/01/09/nosql-talk)

- 分布式事务

[jta-分布式事务 API/XA](https://houbb.github.io/2018/09/02/api-jta)

[TCC-Try-Confirm-Cancel](https://houbb.github.io/2018/09/02/sql-distribute-transaction-tcc)

[2PC-二段式提交](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pc)

[补偿模式](https://houbb.github.io/2018/09/02/sql-distribute-transaction-compensating)

[SQL 分布式事务, 二段提交, 本地消息表, Saga 事务, 最大努力通知](https://houbb.github.io/2018/09/02/sql-distribute-transaction)

[本地消息表-MQ实现](https://houbb.github.io/2018/09/02/sql-distribute-transaction-mq)

[NWR 模型]()

# 开源框架

- 框架

[hmily-分布式事务框架](https://houbb.github.io/2018/10/30/hmily)

[Seata-一站式分布式事务解决方案](https://houbb.github.io/2018/10/30/distributed-tx-seata)

- 数据库

[Greenplum](https://houbb.github.io/2019/01/09/database-greenplum)

[TiDB](https://houbb.github.io/2019/03/15/database-tidb)

# 参考资料

[聊聊分布式事务，再说说解决方案](https://www.cnblogs.com/savorboard/p/distributed-system-transaction-consistency.html)

[分布式系统的事务处理几种常见方法](https://blog.csdn.net/elricboa/article/details/78764736)

[解决分布式系统事务一致性的几种方案对比](https://baijiahao.baidu.com/s?id=1578602095301334776&wfr=spider&for=pc)

[分布式系统事务一致性](https://www.cnblogs.com/luxiaoxun/p/8832915.html)

[常用的分布式事务解决方案](https://blog.csdn.net/u010425776/article/details/79516298)

[分布式系统 · 分布式事务的实现原理](https://www.sohu.com/a/247487766_315839)

[分布式系统CAP理论 / 分布式事务一致性](https://blog.51cto.com/13580976/2161507)

[第一次有人把“分布式事务”讲的这么简单明了](https://www.jianshu.com/p/16b1baf015e8)

* any list
{:toc}
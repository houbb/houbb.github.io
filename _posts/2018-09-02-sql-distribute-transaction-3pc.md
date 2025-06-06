---
layout: post
title:  3pc Three-Phase Commit 三阶段提交 分布式事务
date:  2018-09-02 11:03:38 +0800
categories: [SQL]
tags: [sql, transaction, distributed, tx, sh]
published: true
---

# 数据库分布式事务

[SQL 分布式事务 distributed transaction 二段提交, 本地消息表, Saga 事务, 最大努力通知](https://houbb.github.io/2018/09/02/sql-distribute-transaction)

[分布式事务-本地消息表 （经典的ebay模式）](https://houbb.github.io/2018/09/02/sql-distribute-transaction-mq)

[TCC Try-Confirm-Cancel 分布式事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-tcc)

[SQL 2PC-两阶段提交 SQL 分布式事务两阶段提交协议(2PC)是一种原子承诺协议(ACP)。](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pc)

[SQL 2PL-两阶段锁定](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pl)

[3pc Three-Phase Commit 三阶段提交 分布式事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-3pc)

[Compensating Transaction pattern 分布式锁事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-compensating)


# 3PC

在上文中，我们讲解了[二阶段提交协议](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pc)的设计和实现原理，并明确指出了其在实际运行过程中可能存在的诸如同步阻塞、协调者的单点问题、脑裂和太过保守的容错机制等缺陷，因此研究者在二阶段提交协议的基础上进行了改进，提出了三阶段提交协议。

## 协议说明

3PC，是Three-Phase Commit的缩写，即三阶段提交，是2PC的改进版，其将二阶段提交协议的“提交事务请求”过程一分为二，形成了由CanCommit、PreCommit和do Commit三个阶段组成的事务处理协议，

### 阶段一：CanCommit

1) 事务询问。

协调者向所有的参与者发送一个包含事务内容的 canCommit请求，询问是否可以执行事务提交操作，并开始等待各参与者的响应。

2) 各参与者向协调者反馈事务询问的响应。

参与者在接收到来自协调者的 canCommit请求后，正常情况下，如果其自身认为可以顺利执行事务，那么会反馈Yes响应，并进入预备状态，否则反馈No响应。

### 阶段二：PreCommit

在阶段二中，协调者会根据各参与者的反馈情况来决定是否可以进行事务的PreCommit操作，正常情况下，包含两种可能。

#### 执行事务预提交

假如协调者从所有的参与者获得的反馈都是Yes响应，那么就会执行事务预提交。

1) 发送预提交请求。

协调者向所有参与者节点发出preCommit的请求，并进入Prepared阶段。

2) 事务预提交。

参与者接收到preCommit请求后，会执行事务操作，并将Undo和Redo信息记录到事务日志中。

3) 各参与者向协调者反馈事务执行的响应。

如果参与者成功执行了事务操作，那么就会反馈给协调者Ack响应，同时等待最终的指令：提交（commit）或中止（abort）。

#### 中断事务

假如任何一个参与者向协调者反馈了No响应，或者在等待超时之后，协调者尚无法接收到所有参与者的反馈响应，那么就会中断事务。

1) 发送中断请求。

协调者向所有参与者节点发出abort请求。

2）中断事务。

无论是收到来自协调者的abort请求，或者是在等待协调者请求过程中出现超时，参与者都会中断事务。

### 阶段三：doCommit

该阶段将进行真正的事务提交，会存在以下两种可能的情况。

#### 执行提交

1）发送提交请求。

进入这一阶段，假设协调者处于正常工作状态，并且它接收到了来自所有参与者的Ack响应，那么它将从“预提交”状态转换到“提交”状态，并向所有的参与者发送doCommit请求。

2）事务提交。

参与者接收到 doCommit 请求后，会正式执行事务提交操作，并在完成提交之后释放在整个事务执行期间占用的事务资源。

3）反馈事务提交结果。

参与者在完成事务提交之后，向协调者发送Ack消息。

4）完成事务。

协调者接收到所有参与者反馈的Ack消息后，完成事务。

#### 中断事务

进入这一阶段，假设协调者处于正常工作状态，并且有任意一个参与者向协调者反馈了No响应，或者在等待超时之后，协调者尚无法接收到所有参与者的反馈响应，那么就会中断事务。

1、发送中断请求。

协调者向所有的参与者节点发送abort请求。

2、事务回滚。

参与者接收到abort请求后，会利用其在阶段二中记录的Undo信息来执行事务回滚操作，并在完成回滚之后释放在整个事务执行期间占用的资源。

3、反馈事务回滚结果。

参与者在完成事务回滚之后，向协调者发送Ack消息。

4、中断事务。

协调者接收到所有参与者反馈的Ack消息后，中断事务。

需要注意的是，一旦进入阶段三，可能会存在以下两种故障。

- 协调者出现问题。

- 协调者和参与者之间的网络出现故障。

无论出现哪种情况，最终都会导致参与者无法及时接收到来自协调者的doCommit或是abort请求，针对这样的异常情况，参与者都会在等待超时之后，继续进行事务提交。

## 优缺点

三阶段提交协议的优点：相较于二阶段提交协议，三阶段提交协议最大的优点就是**降低了参与者的阻塞范围，并且能够在出现单点故障后继续达成一致**。

三阶段提交协议的缺点：三阶段提交协议在去除阻塞的同时也引入了新的问题，那就是在参与者接收到preCommit消息后，如果网络出现分区，此时协调者所在的节点和参与者无法进行正常的网络通信，在这种情况下，该参与者依然会进行事务的提交，这必然出现**数据的不一致性**。

# 参考资料

《分布式一致性原理与实践》

* any list
{:toc}
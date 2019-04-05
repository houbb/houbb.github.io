---
layout: post
title:  SQL Theory - BASE ACID CAP
date:  2018-08-13 17:37:15 +0800
categories: [SQL]
tags: [sql, nosql, distributed, sf]
published: true
---

# ACID

ACID，是指在数据库管理系统（DBMS）中，事务(transaction)所具有的四个特性：

原子性（Atomicity）、一致性（Consistency）、隔离性（Isolation，又称独立性）、持久性（Durability）。

在数据库系统中，一个事务是指：**由一系列数据库操作组成的一个完整的逻辑过程**。

例如银行转帐，从原账户扣除金额，以及向目标账户添加金额，这两个数据库操作的总和，构成一个完整的逻辑过程，不可拆分。这个过程被称为一个事务，具有ACID特性。

## 原子性：

一个事务(transaction)中的所有操作，要么全部完成，要么全部不完成，不会结束在中间某个环节。事务在执行过程中发生错误，会被回滚（Rollback）到事务开始前的状态，就像这个事务从来没有执行过一样。

## 一致性：

在事务开始之前和事务结束以后，数据库的完整性限制没有被破坏。

## 隔离性：

当两个或者多个事务并发访问（此处访问指查询和修改的操作）数据库的同一数据时所表现出的相互关系。事务隔离分为不同级别，包括读未提交(Read uncommitted)、读提交（read committed）、可重复读（repeatable read）和串行化（Serializable）。

## 持久性：

在事务完成以后，该事务对数据库所作的更改便持久地保存在数据库之中，并且是完全的。

# CAP

一致性(Consistency)可用性(Availability)分区容忍性(Partitiontolerance)CAP原理指的是，这**三个要素最多只能同时实现两点，不可能三者兼顾**。

这是Brewer教授于2000年提出的，后人也论证了CAP理论的正确性。

![CAP 理论](https://ss0.baidu.com/6ONWsjip0QIZ8tyhnq/it/u=1595646483,3153366617&fm=173&s=F2B5E16C92A6E54F1D9A14090300E098&w=640&h=551&img.JPG)

## 一致性（Consistency）

对于分布式的存储系统，一个数据往往会存在多份。

简单的说，一致性会让客户对数据的修改操作（增/删/改），
要么在所有的数据副本（replica）全部成功，要么全部失败。

修改操作对于一份数据的所有副本（整个系统）而言，是原子（atomic）的操作。

如果一个存储系统可以保证一致性，那么则客户读写的数据完全可以保证是最新的。不会发生两个不同的客户端在不同的存储节点中读取到不同副本的情况。

## 可用性（Availability）

可用性很简单，顾名思义，就是指在客户端想要访问数据的时候，可以得到响应。

但是注意，系统可用（Available）并不代表存储系统所有节点提供的数据是一致的。

这种情况，我们仍然说系统是可用的。往往我们会对不同的应用设定一个最长响应时间，超过这个响应时间的服务我们仍然称之为不可用的。


## 分区容忍性（Partition Tolerance）

如果你的存储系统只运行在一个节点上，要么系统整个崩溃，要么全部运行良好。

一旦针对同一服务的存储系统分布到了多个节点后，整个存储系统就存在分区的可能性。

比如，两个存储节点之间联通的网络断开（无论长时间或者短暂的），就形成了分区。

一般来讲，为了提高服务质量，同一份数据放置在不同城市非常正常的。因此节点之间形成分区也很正常。

Gilbert 和Lynch将分区容忍性定义如下：

```
Noset of failures less than total network failure is allowed to cause the systemto respond incorrectly。
```

除全部网络节点全部故障以外，所有子节点集合的故障都不允许导致整个系统不正确响应。

另外一篇文章（BASE: An Acid Alternative）中对分区容忍性的解释：

```
Operationswill complete, even if individual components are unavailable。
```

即使部分的组件不可用，施加的操作也可以完成。

# BASE

接受最终一致性的理论支撑是BASE模型，BASE全称是BasicallyAvailable（基本可用）, Soft-state（软状态/柔性事务）, Eventually Consistent（最终一致性）。

BASE模型在理论逻辑上是相反于ACID（原子性Atomicity、一致性Consistency、隔离性Isolation、持久性Durability）模型的概念，
它**牺牲高一致性，获得可用性和分区容忍性**。

## 最终一致性

最终一致性（Eventually Consistent）。

最终一致性是指：经过一段时间以后，更新的数据会到达系统中的所有相关节点。

这段时间就被称之为最终一致性的时间窗口。

# 一致性模型

数据的一致性模型可以分成以下 3 类：

## 强一致性

数据更新成功后，任意时刻所有副本中的数据都是一致的，一般采用同步的方式实现。

## 弱一致性

数据更新成功后，系统不承诺立即可以读到最新写入的值，也不承诺具体多久之后可以读到。

## 最终一致性

弱一致性的一种形式，数据更新成功后，系统不承诺立即可以返回最新写入的值，但是保证最终会返回上一次更新操作的值。

分布式系统数据的强一致性、弱一致性和最终一致性可以通过Quorum NRW算法分析。

# 参考资料 

https://en.wikipedia.org/wiki/ACID_(computer_science)

https://en.wikipedia.org/wiki/CAP_theorem

https://blog.csdn.net/lengyuhong/article/details/5981872

https://www.jdon.com/concurrent/acid-database.html

https://blog.csdn.net/sunxinhere/article/details/7936485

## 经典论文

![Dynamo: Amazon’s Highly Available Key-value Store](http://www.read.seas.harvard.edu/~kohler/class/cs239-w08/decandia07dynamo.pdf)

* any list
{:toc}
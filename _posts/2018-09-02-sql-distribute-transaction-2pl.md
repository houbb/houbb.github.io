---
layout: post
title:  SQL 2PL-两阶段锁定
date:  2018-09-02 11:03:38 +0800
categories: [SQL]
tags: [sql, transaction, distributed, tx, sh]
published: true
excerpt: 在数据库和事务处理中，两阶段锁定(2PL)是一种保证可串行性的并发控制方法。它也是数据库事务调度(历史)结果集的名称。协议使用事务应用于数据的锁，在事务的生命周期内，锁可能阻止(解释为阻止信号)其他事务访问相同的数据。
---

# 数据库分布式事务

[SQL 分布式事务 distributed transaction 二段提交, 本地消息表, Saga 事务, 最大努力通知](https://houbb.github.io/2018/09/02/sql-distribute-transaction)

[分布式事务-本地消息表 （经典的ebay模式）](https://houbb.github.io/2018/09/02/sql-distribute-transaction-mq)

[TCC Try-Confirm-Cancel 分布式事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-tcc)

[SQL 2PC-两阶段提交 SQL 分布式事务两阶段提交协议(2PC)是一种原子承诺协议(ACP)。](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pc)

[SQL 2PL-两阶段锁定](https://houbb.github.io/2018/09/02/sql-distribute-transaction-2pl)

[3pc Three-Phase Commit 三阶段提交 分布式事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-3pc)

[Compensating Transaction pattern 分布式锁事务](https://houbb.github.io/2018/09/02/sql-distribute-transaction-compensating)


# 2PL

## 概念

在数据库和事务处理中，两阶段锁定(2PL)是一种保证可串行性的并发控制方法。它也是数据库事务调度(历史)结果集的名称。协议使用事务应用于数据的锁，在事务的生命周期内，锁可能阻止(解释为阻止信号)其他事务访问相同的数据。

根据2PL协议，锁的应用和删除分为两个阶段:

扩展阶段:获得锁，不释放锁。

收缩阶段:释放锁，不获取锁。

基本协议使用两种类型的锁:共享锁和独占锁。基础协议的细化可以使用更多的锁类型。使用阻塞进程的锁，2PL可能受到由两个或多个事务的相互阻塞导致的死锁的影响。

## 对比

二阶段加锁与二阶段提交的区别：

```
二阶段加锁：用于单机事务中的一致性和隔离性
二阶段提交：用于分布式事务
```

## 加锁时机

当对记录进行更新操作或者以下操作时，会对记录进行加锁，锁的种类很多，不在此赘述。

```sql
select... for update(X锁)
select... in share mode(S锁)
```

## 何时解锁

在一个事务中，只有在 `commit` 或者 `rollback` 时，才是解锁阶段。

# 最佳实践

下面举个具体的例子，来讲述二段锁对应用性能的影响，我们举个库存扣减的例子：

## 方案一

```sql
begin;
// 扣减库存
update t_inventory set count=count-5 where id=${id} and count >= 5;
// 锁住用户账户表
select * from t_user_account where user_id=123 for update;
// 插入订单记录
insert into t_trans;
commit;
```

## 方案二

```sql
begin;
// 锁住用户账户表
select * from t_user_account where user_id=123 for update;
// 插入订单记录
insert into t_trans;
// 扣减库存
update t_inventory set count=count-5 where id=${id} and count >= 5;
commit;
```

由于在同一个事务之内，这几条对数据库的操作应该是等价的。

但在两阶段加锁下的性能确是有比较大的差距。

两者方案的时序如下图所示:

![20180831-sql-2pl.png](https://raw.githubusercontent.com/houbb/resource/master/img/sql/sql/lock/20180831-sql-2pl.png)

由于库存往往是最重要的热点，是整个系统的瓶颈。那么如果采用第二种方案的话,
tps应该理论上能够提升3rt/rt=3倍。
这还仅仅是业务就只有三条SQL的情况下，多一条sql就多一次rt,就多一倍的时间。

## 锁的时间段

在更新到数据库的那个时间点才算锁成功
提交到数据库的时候才算解锁成功
这两个round_trip的前半段是不会计算在内的

```
时间线：------------------------------------------------------------------>
应用层：锁库存(A1).................其他命令/commit(A2).................(A3)
数据库：............命令到达(B1)....................命令到达(B2)
```

A1-B1 未锁
B1-B2 一直锁
B2-A3 未锁

当前只考虑网络时延，不考虑数据库和应用本身的时间消耗。

## 优化策略

从上面的例子中,可以看出，需要把最热点的记录，

放到事务最后，这样可以显著的提高吞吐量。

更进一步:
越热点记录离事务的终点越近(无论是commit还是rollback)

笔者认为，先后顺序如下图:   

```
BEGIN-》订单级别-》用户级-》库存级-》COMMIT
```

ps: 感觉**锁越重，范围越光的操作放在最后**。



## 死锁

这也是任何SQL加锁不可避免的。

上文提到了按照记录Key的热度在事务中倒序排列。 

那么写代码的时候任何可能并发的SQL都必须按照这种顺序来处理，不然会造成死锁。

如下图所示: 

### 正常

```
事务1：锁定单-》锁用户=》锁库存
事务2：锁定单-》锁用户=》锁库存
```

### 死锁

互相等待，导致死锁

```
事务1：锁定单-》锁用户=》锁库存
事务2：锁库存-》锁定单-》锁用户
```

## 谓词计算

我们可以直接将一些简单的判断逻辑写到update的谓词里面，以减少加锁时间，

考虑下面两种方案:

- 方案1

```sql
 begin:
 int count = select count from t_inventory for update;
 if count >= 5:
 	update t_inventory set count=count-5 where id =123
 	commit 
 else
 	rollback
```

- 方案2

```sql
begin:
 	int rows = update t_inventory set count=count-5 where id =123 and count >=5
	if rows > 0:
		commit;
	ele 
		rollback;
```

方案 2 通过在 update 中加谓词计算，少了 1rt 的时间。 

由于 update 在执行过程中对符合谓词条件的记录加的是和 select for update 一致的排它锁(具体的锁类型较为复杂，不在这里描述),所以两者效果一样。

# 参考资料

- 2PL(二段锁)

https://en.wikipedia.org/wiki/Two-phase_locking

https://my.oschina.net/alchemystar/blog/1438839

https://segmentfault.com/a/1190000012513286

* any list
{:toc}
---
layout: post
title:  MySQL-23-mysql 特别大的表 DDL gh-ost 方案介绍
date:  2017-7-17 10:26:01 +0800
categories: [MySQL]
tags: [sp]
published: true
---

# 拓展阅读

[MySQL 00 View](https://houbb.github.io/2017/02/27/mysql-00-view)

[MySQL 01 Ruler mysql 日常开发规范](https://houbb.github.io/2017/02/27/mysql-01-ruler)

[MySQL 02 truncate table 与 delete 清空表的区别和坑](https://houbb.github.io/2017/02/27/mysql-truncate)

[MySQL 03 Expression 1 of ORDER BY clause is not in SELECT list,references column](https://houbb.github.io/2017/02/27/mysql-03-error)

[MySQL 04 EMOJI 表情与 UTF8MB4 的故事](https://houbb.github.io/2017/02/27/mysql-04-emoj-and-utf8mb4)

[MySQL 05 MySQL入门教程（MySQL tutorial book）](https://houbb.github.io/2017/02/27/mysql-05-learn-book)

[MySQL 06 mysql 如何实现类似 oracle 的 merge into](https://houbb.github.io/2017/02/27/mysql-06-merge-into)

[MySQL 07 timeout 超时异常](https://houbb.github.io/2017/02/27/mysql-07-timeout-errors)

[MySQL 08 datetime timestamp 以及如何自动更新，如何实现范围查询](https://houbb.github.io/2017/02/27/mysql-08-datetime-timestamp)

[MySQL 09 MySQL-09-SP mysql 存储过程](https://houbb.github.io/2017/02/27/mysql-09-sp)

[MySQL 09 MySQL-group by 分组](https://houbb.github.io/2017/02/27/mysql-10-groupby)

# 场景

有一张大表，发现加索引直接导致超时，如何通过 rename 尽可能降低风险？

# GHOST 简单介绍

## 工作原理

1、首先新建一张ghost表，结构与源表相同
2、使用alter命令修改ghost表
3.1、模拟从库命令获取主库上该表的binlog(基于全镜像的行模式的binlog包含更改前和更改后的所有数据)，并解析成语句到ghost表上执行。
3.2、获取源表的数据范围（如按照主键获取到最大值和最小值），然后将数据拆分为多个批次拷贝插入到ghost表中
4、锁住源表，防止用户修改源表数据
5、将源表重命名，将ghost表改名为源表
6、释放表锁，清理gh-ost工具产生的表。

![ghost](https://images2018.cnblogs.com/blog/174228/201805/174228-20180531093435453-1270321978.png)

## GHOST有工作模式

1.连接主库直接修改

    直连主库
    主库上创建ghost表
    新表(ghost表)上直接alter修改表结构
    迁移原表数据到新表
    拉取解析binlog事件,应用到新表
    cut-over阶段,用新表替换掉原表

2.连接从库间接应用到主库

    连接从库
    校验完后,在主库创建新表
    迁移原表数据到新表
    模拟从库的从库,拉取解析增量binlog应用到主库
    cut-over阶段,用新表替换掉原表两者不同的点就在于,通过连接从库来进行变更,对主库的性能影响最小，但使用主库能够减少网络影响，操作速度更快。

##  如何保证源表和新表数据一致：

由于使用binlog获得的数据总是新于或者等于从源表拷贝的数据：
1、在应用binlog导出的数据时，将UPDATE和DELETE直接应用ghost表，将INSERT修改为REPLACE INTO再应用到ghost表。
2、在copy源表数据到ghost表时，使用INSERT IGNORE来忽略掉ghost表已存在的记录
3、对于在gh-ost工作期间发生的DELETE操作：
    A：如果记录在从源表删除前被复制到ghost表， 则ghost表中记录会在应用binlog导出的DELETE命令时删除。
    B：使用记录在从源表复制到ghost表之前被删除，则记录不会被复制到ghost表，应用binlog导出的DELETE命令也不会报错。

##  GHOST支持跨服务器操作

假设有一套主从复制A1-->A2，A1为主库，A2为从库，另有一台服务器B1装有gh-ost，可以在B1上执行对A1上表的修改：
    1、对于数据拷贝操作，B1发送查询到A1上先获取最大值和最小值，然后在B1上进行拆分成不同批次，再从B1上发送命令给A1执行小范围数据拷贝
    2、对于Binlog解析，先模拟B1到A1的搭建复制，从A1上拉取binlog到B1，在B1上解析成SQL命令，再发送到A1上执行。

对于跨服务器执行gh-ost命令，会导致大量数据在数据库服务器到命令服务器之间传输，需要考虑网络带宽和网络稳定

##  重命名原理

在pt-osc或者online ddl中,最后的rename操作一般是耗时比较短,但如果表结构变更过程中,有大查询进来,那么在rename操作的时候,会触发MDL锁的等待,如果在高峰期,这就是个严重的问题。所以gh-ost是怎么做的呢？

gh-ost利用了MySQL的一个特性，就是**原子性的rename请求，在所有被blocked的请求中，优先级永远是最高的**。

gh-ost基于此设计了该方案：一个连接对原表加锁，另启一个连接尝试rename操作，此时会被阻塞住，当释放lock的时候，rename会首先被执行，其他被阻塞的请求会继续应用到新表。

##  唯一索引问题

如果通过gh-ost来新增唯一索引，由于REPLACE INTO和INSERT IGNORE会受到ghost表上唯一索引的影响，当在唯一索引上存在数据重复时，会导致数据丢失。

# gh-ost

gh-ost 也是一种在线的解决 DDL 的方案，不依赖于触发器,它是通过模拟从库，在row binlog中获取增量变更，再异步应用到 gh-ost 表中。

目前 gh-ost 已经收获了将近一万的 star，并且在持续更新中。

# 2.1 主要工作流程

gh-ost 工作流程如下：

## 1. 创建影子表

和在影子表上执行变更这两步和 pt-osc 基本相同，只是创建的影子表名称不一样，这里是_t1_gho；

## 2. 创建 binlog streamer

这一步的作用是为了同步 t1 表上的增量 DML 到 _t1_gho 上。gh-ost 会伪装成一个从库节点，读取数据库（可能是集群中的主节点或者从节点）的 binlog，然后解析 binlog，获取到对于 t1 的相应操作，然后转化成对 _t1_gho 表的操作；

## 3. 同步数据

这一步也是循环同步数据，每次循环也会监控数据库的负载等，只是在确定需要同步数据范围的上下边界和 ppt-osc 有所不同；

a：首先确定全部需要同步数据范围的上限边界

```sql
select /* gh-ost `test`.`t1` */ `id` from `test`.`t1` order by  `id` asc limit 1 
// 确定全部需要同步数据范围的下边界MIN(id)
select /* gh-ost `test`.`t1` */ `id` from `test`.`t1` order by  `id` desc limit 1
// 确定全部需要同步数据范围的上边界MAX(id)
```

b：确认本次循环同步数据范围的上边界

```sql
select  /* gh-ost `test`.`t1` */  `id`
from `test`.`t1`
where ((`id` > _binary'8991')) and ((`id` < _binary'10000') or ((`id` = _binary'10000')))
order by  `id` asc
limit 1
offset 998
// 其中 8991是上次循环的上边界值
// 10000 是需要同步数据范围的上边界MAX(id)
// offset 998 这个值和--chunk-size的设置有关，--chunk-size值减 1
```

c：同步数据

```sql
insert /* gh-ost `test`.`t1` */ ignore into `test`.`_t1_gho` (`id`, `c1`, `c2`, `c3`)
(select `id`, `c1`, `c2`, `c3` from `test`.`t1` 
 force index (`PRIMARY`)
 where (((`id` > _binary'8991'))
 and ((`id` < _binary'9990') or ((`id` = _binary'9990')))) 
 lock in share mode
// 其中 8991 是上次循环的上边界值
// 其中 9990 是步骤b中获取到的数据
```

## 4. 增量应用binlog

这里说明一下，同步数据和增量应用binlog是同时进行的，没有确定的时间先后顺序，只要在binlog里发现有相应变更就会在影子表上重放。

## 5. 同步数据和应用增量binlog

若循环执行3-b时，若获取到数据则正常进入步骤3-c；

若循环执行3-b时未获取到数据，则说明剩余未同步的数据小于 `--chunk-size` 的值，执行以下SQL确认本次的上边界值

```sql
select /* gh-ost `test`.`t1` */ `id`
from (
    select `id`  from   `test`.`t1`
    where ((`id` > _binary'9990')) 
    and ((`id` < _binary'10000') 
    or ((`id` = _binary'10000')))
    order by   `id` asc
    limit 999 ) select_osc_chunk
order by  `id` desc
limit 1
```

若上面SQL获取到值，则循环执行步骤3-c同步数据；若未获取到值则数据已经完全同步。

## 6. 更改表名

在更改表名之前会先对表加写锁，这点需要注意。

原始表和影子表 cut-over 切换是原子性切换，但是基本都是通过两个会话的操作来完成。

大致流程如下：

- 会话 Cn1（这里代表一个或者多个会话）: 对t1表正常执行DML操作。

- 会话 gh1 : 创建_t1_del 防止提前RENAME表，导致数据丢失。

- 会话 gh1 : 执行LOCK TABLES t1 WRITE，_t1_del WRITE。

- 会话 Cn2 : LOCK TABLES之后进来的会话操作会被阻塞。

- 会话 gh2 : 设置锁等待时间并执行RENAME

```sql
set session lock_wait_timeout:=1
rename /* gh-ost */ table `test`.`t1` to `test`.`_t1_del`, `test`.`_t1_gho` to `test`.`t1`;
  // gh2 的操作因为 gh1 锁表而等待，后续有其他新发起的对表t1上的操作也会阻塞
```

会话 gh1 会通过SQL 检查是否已经有会话在执行RENAME操作并且在等待MDL锁，此时会检测到gh2。

会话gh1 : 基于上面执行的结果，执行DROP TABLE _t1_del。

会话gh1 : 执行UNLOCK TABLES; 此时gh2的rename命令第一个被执行。而其他会话如Cn2的请求之后开始执行。

这里涉及到的原理是基于 MySQL 内部机制：被 LOCK TABLE 阻塞之后，执行 RENAME 的优先级高于 DML，也即先执行 RENAME TABLE ，然后执行 DML，即使DML发起的时间早于RENAME的时间。

另外要先在表上加写锁的根本原因其实还是为了保证数据的一致性。

gh-ost 在同步原表上的变更操作是使用的拼接 binlog 的形式，和原表上发生的操作不属于同一个事务。

所以在收尾 cut-over 时要先对表加上写锁，阻塞原表上的变更，待增量的binlog应用完成后再去更改表名，这样才能保证数据不丢失。

而 pt-osc 不需要显式加锁是因为原表和影子表上的更新是在同一个事务里的，原表变更完成，影子表上的表更也就完成了，在做 RENAME 时会阻塞原表上的更新，RENAME 完成后变更就发生在了新表上了（之前的影子表）。


## 收尾

7. 停止binlog streamer，处理收尾工作，结束。

# 2.2 使用限制和风险

## 2.2.1 使用要求和限制

必须有一个从库的 binlog 是 row 模式，并且 binlog_row_image 设置成full。

主节点没有特殊要求；

1. 主备节点上，目标表的结构必须是相同的；
2. 不支持外键约束和触发器
3. 目标表上必须有主键或者唯一键，gh-ost 使用该键遍历表
4. 主键或者唯一键不能包含为空的列。也就是说键中的列的属性应为 NOT NULL，或键中的列是可以为空 但是实际数据中没有 NULL 值。
默认情况下，若是唯一键中包含可为空的列，gh-ost 不会运行，用户可以使用 --allow-nullable-unique-key ，但是依然要确保实际数据没有NULL值，若是有 NULL 值，gh-ost 不能保证能将其完全迁移走。
5. 不允许迁移存在相同名称且大小写不同的表；

6. 不支持多源复制，不过可以尝试使用 --allow-on-master 选项连接到主库

7. 双主复制，只支持一台实例上有写请求的情况

8. 不支持表更名的操作 ：ALTER TABLE ... RENAME TO some_other_name

9. PXC 集群不能使用该工具。gh-ost 在更改表名阶段是使用不同的线程执行LOCK TABLE，RENME ，DROP TABLE 操作的，由于 PXC 的验证机制这会导致执行操作的 PXC 节点发生死锁。

# 使用风险

## 1. 更改列名

### a：使用 change 方式更改非主键或者非唯一键的列名

更改列名 gh-ost 也会发出警告,并退出:

```
FATAL gh-ost believes the ALTER statement renames columns, as follows: map[id:id_new]; as precaution, you are asked to confirm gh-ost is correct, and provide with `--approve-renamed-columns`, and we're all happy. Or you can skip renamed columns via `--skip-renamed-columns`, in which case column data may be lost
```

修改列名也会有丢失数据的风险，所以需要自己先确认 gh-ost 的行为是否符合预期，同时提供了两个选项来告诉gh-ost如何处理重命名的列。

--approve-renamed-columns：该选项是告诉gh-ost要同步重命名列的数据
--skip-renamed-columns：跳过重命名的列，也就是对于重命名的列上的数据不进行同步

### b：更改主键或者唯一键的列名

若表上只有主键或者唯一键，gh-ost 会直接退出，并抛出以下日志：

```
FATAL No shared unique key can be found after ALTER! Bailing out
```

若表上既有主键又有唯一键，更改其中一个的列名，gh-ost会选择另一个键做为 共享唯一键。

### c：先删除列然后添加改名后列

该方式和 pt-online-schema-change 一样会导致数据丢失。

## 2. 对于外键的处理

默认 gh-ost 不支持有外键引用或者包含外键的表变更。但是提供了相应的选项；

--skip-foreign-key-checks ：跳过外键的检查，这时不会对外键进行检查，最终会导致表上外键丢失或者外键引用的表不存在；

-discard-foreign-keys ：该选项明确告诉gh-ost不在影子表上创建外键，最终变更后的表会丢失外键。

## 3. 创建唯一键或者主键

使用 gh-ost 创建唯一键或者主键不会有相关警告，由于使用 insert ignore into 的方式同步数据，所以有可能会造成数据丢失。

## 4. 锁争用问题

在更改表名前会对表加写锁，若表上操作频繁可能会导致锁等待。

## 数据丢失风险

5. 在开启半同步复制情况下，若设置 rpl_semi_sync_master_wait_point = AFTER_SYNC，在获取同步数据的上下边界时，有可能获取不到的最新上下边界，导致数据丢失。（github上已经有人提交相关bug，链接见文末注释1）

# 丰富的监控功能

gh-ost 在运行期间也会监控数据库的负载，和 pt-osc 类似，只是参数不同。

另外 gh-ost 也提供了一些交互功能，动态的修改需要监控的指标和阈值等，这里不再赘述。

# 参考资料

https://www.cnblogs.com/TeyGao/p/9115610.html

* any list
{:toc}
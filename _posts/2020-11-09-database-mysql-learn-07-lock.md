---
layout: post
title:  mysql（6）lock mysql 锁
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, lock, sf]
published: true
---

#  锁

开发多用户、数据库驱动的应用时，最大的一个难点是：一方面要最大程度地利用数据库的并发访问，另外一方面还要确保每个用户能以一致的方式读取和修改数据。

为此就有了锁(locking ) 的机制， 同时这也是数据库系统区别于文件系统的一个关键特性。

InnoDB 存储引擎较之MySQL数据库的其他存储引擎在这方面技高一筹， 其实现方式非常类似于Oracle数据库

。而只有正确了解这些锁的内部机制才能充分发挥InnoDB存储引擎在锁方面的优势。

这一章将详细介绍InnoDB存储引擎对表中数据的锁定， 同时分析InnoDB存储引擎会以怎样的粒度锁定数据。

本章还对MyISAM、Oracle、SQLServer之间的锁进行了比较，主要是为了消除关于行级锁的一个“神话”：人们认为行级锁总会增加开销。

实际上，只有当实现本身会增加开销时， 行级锁才会增加开销。InnoDB存储引擎不需要锁升级， 因为一个锁和多个锁的开销是相同的。

# 什么是锁

锁是数据库系统区别于文件系统的一个关键特性。锁机制用于管理对共享资源的并发访问。(注意：这里说的是“共享资源”而不仅仅是“行记录”。)

InnoDB存储引擎会在行级别上对表数据上锁， 这固然不错。不过InnoDB存储引擎也会在数据库内部其他多个地方使用锁，从而允许对多种不同资源提供并发访问。

例如， 操作缓冲池中的LRU列表， 删除、添加、移动LRU列表中的元素， 为了保证一致性，必须有锁的介人。

数据库系统使用锁是为了支持对共享资源进行并发访问，提供数据的完整性和一致性。

另一点需要理解的是，虽然现在数据库系统做得越来越类似，但是有多少种数据库， 就可能有多少种锁的实现方法。

在SQL语法层面， 因为SQL标准的存在， 要熟悉多个关系数据库系统并不是一件难事。而对于锁，用户可能对某个特定的关系数据库系统的锁定模型有一定的经验， 但这并不意味着知道其他数据库。

在使用InnoDB存储引擎之前，我还使用过MySQL数据库的MyISAM和NDB Cluster存储引擎。

在使用MySQL数据库之前，我还曾经使用过Microsoft SQLServer、Oracle等数据库， 但它们各自对于锁的实现完全不同。

对于MyISAM引擎， 其锁是表锁设计。并发情况下的读没有问题， 但是并发插人时的性能就要差一些了， 若插人是在“底部”，MyISAM存储引擎还是可以有一定的并发写人操作。

对于Microsoft SQLServer数据库，在MicrosoftSQLServer 2005版本之前其都是页锁的， 相对表锁的MyISAM引擎来说， 并发性能有所提高。页锁容易实现， 然而对于热点数据页的并发问题依然无能为力。到2005版本， Microsoft SQLServer开始支持乐观并发和悲观并发，在乐观并发下开始支持行级锁， 但是其实现方式与InnoDB存储引擎的实现方式完全不同。用户会发现在MicrosoftSQLServer下， 锁是一种稀有的资源，锁越多开销就越大，因此它会有锁升级。在这种情况下，行锁会升级到表锁，这时并发的性能又回到了以前。

InnoDB存储引擎锁的实现和Oracle数据库非常类似，提供一致性的非锁定读、行级锁支持。行级锁没有相关额外的开销，并可以同时得到并发性和一致性。

# 6.2 lock与latch

这里还要区分锁中容易令人混淆的概念lock与latch。

在数据库中，lock与latch都可以被称为“锁”。但是两者有着截然不同的含义， 本章主要关注的是lock。

latch一般称为闩锁(轻量级的锁)， 因为其要求锁定的时间必须非常短。若持续的时间长， 则应用的性能会非常差。

在InnoDB存储引擎中，latch又可以分为mutex(互斥量) 和rwlock(读写锁)。其目的是用来保证并发线程操作临界资源的正确性， 并且通常没有死锁检测的机制。

lock的对象是事务，用来锁定的是数据库中的对象， 如表、页、行。并且一般lock的对象仅在事务commit或rollback后进行释放(不同事务隔离级别释放的时间可能不同)。

此外，lock， 正如在大多数数据库中一样， 是有死锁机制的。

- 表6-1显示了lock与latch的不同。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/092921_9190b9aa_508704.png "屏幕截图.png")

mysql 查看对应的信息：

```
mysql> show engine innodb mutex;
+--------+------------------------+---------+
| Type   | Name                   | Status  |
+--------+------------------------+---------+
| InnoDB | rwlock: log0log.cc:846 | waits=2 |
+--------+------------------------+---------+
1 row in set (0.00 sec)
```

参数说明如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/093322_78ea88c9_508704.png "屏幕截图.png")

上述所有的这些信息都是比较底层的，一般仅供开发人员参考。

但是用户还是可以通过这些参数进行调优。

相对于latch的查看，lock信息就显得直观多了。

用户可以通过命令SHOW ENGINEINNODB STATUS及information_schema架构下的表INNODB_TRX、INNODB_LOCKS、INNODB_LOCK_WAITS来观察锁的信息。这将在下节中进行详细的介绍。

# 6.3 InnoDB存储引擎中的锁

## 6.3.1 锁的类型

InnoDB存储引擎实现了如下两种标准的行级锁：

- 共享锁(SLock)， 允许事务读一行数据。

- 排他锁(XLock)， 允许事务删除或更新一行数据。

如果一个事务T1已经获得了行r的共享锁，那么另外的事务T2可以立即获得行r的共享锁， 因为读取并没有改变行r的数据， 称这种情况为锁兼容(LockCompatible)。

但若有其他的事务T3想获得行r的排他锁，则其必须等待事务T1、T2释放行r上的共享锁——这种情况称为锁不兼容。

表 6-3 显示了共享锁和排他锁的兼容性。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/093845_bba2b846_508704.png "屏幕截图.png")

从表6-3可以发现X锁与任何的锁都不兼容，而S锁仅和S锁兼容。

需要特别注意的是，S和X锁都是行锁， 兼容是指对同一记录(row) 锁的兼容性情况。

此外，InnoDB存储引擎支持多粒度(granular) 锁定， 这种锁定允许事务在行级上的锁和表级上的锁同时存在。

### 意向锁

为了支持在不同粒度上进行加锁操作，InnoDB存储引擎支持一种额外的锁方式， 称之为**意向锁(IntentionLock)**。

意向锁是将锁定的对象分为多个层次，意向锁意味着事务希望在更细粒度(finegranularity)上进行加锁， 如图6-3所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/094444_2e0bcfe4_508704.png "屏幕截图.png")

若将上锁的对象看成一棵树，那么对最下层的对象上锁，也就是**对最细粒度的对象进行上锁，那么首先需要对粗粒度的对象上锁**。

例如图6-3，如果需要对页上的记录r进行上X锁，那么分别需要对数据库A、表、页上意向锁IX，最后对记录r上X锁。

若其中任何一个部分导致等待，那么该操作需要等待粗粒度锁的完成。

举例来说，在对记录r加X锁之前，已经有事务对表1进行了S表锁，那么表1上已存在S锁，之后事务需要对记录r在表1上加上IX，由于不兼容，所以该事务需要等待表锁操作的完成。

InnoDB存储引擎支持意向锁设计比较简练， 其意向锁即为表级别的锁。

设计目的主要是为了在一个事务中揭示下一行将被请求的锁类型。

其支持两种意向锁：

1) 意向共享锁(ISLock)， 事务想要获得一张表中某几行的共享锁2)意向排他锁(IXLock)， 事务想要获得一张表中某几行的排他锁由于InnoDB存储引擎支持的是行级别的锁，因此意向锁其实不会阻塞除全表扫以外的任何请求。

故表级意向锁与行级锁的兼容性如表6-4所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/094724_32dbf8ea_508704.png "屏幕截图.png")


查看如下：

```
mysql> show engine innodb status \G;

*************************** 1. row ***************************                   
  Type: InnoDB                                                                   
  Name:                                                                          
Status:                                                                          
=====================================                                            
2020-11-14 09:48:38 0x1d1c INNODB MONITOR OUTPUT                                 
=====================================                                            
Per second averages calculated from the last 16 seconds                          
-----------------                                                                
BACKGROUND THREAD                                                                
-----------------                                                                
srv_master_thread loops: 1 srv_active, 0 srv_shutdown, 2825 srv_idle             
srv_master_thread log flush and writes: 2826                                     
----------                                                                       
SEMAPHORES                                                                       
----------                                                                       
OS WAIT ARRAY INFO: reservation count 6                                          
OS WAIT ARRAY INFO: signal count 6                                               
RW-shared spins 0, rounds 4, OS waits 2                                          
RW-excl spins 0, rounds 1, OS waits 0                                            
RW-sx spins 0, rounds 0, OS waits 0                                              
Spin rounds per wait: 4.00 RW-shared, 1.00 RW-excl, 0.00 RW-sx                   
------------                                                                     
TRANSACTIONS                                                                     
------------                                                                     
Trx id counter 29443                                                             
Purge done for trx's n:o < 0 undo n:o < 0 state: running but idle                
History list length 0                                                            
LIST OF TRANSACTIONS FOR EACH SESSION:                                           
---TRANSACTION 281475151562544, not started                                      
0 lock struct(s), heap size 1136, 0 row lock(s)                                  
--------                                                                         
FILE I/O                                                                         
--------                                                                         
I/O thread 0 state: wait Windows aio (insert buffer thread)                      
I/O thread 1 state: wait Windows aio (log thread)                                
I/O thread 2 state: wait Windows aio (read thread)                               
I/O thread 3 state: wait Windows aio (read thread)                               
I/O thread 4 state: wait Windows aio (read thread)                               
I/O thread 5 state: wait Windows aio (read thread)                               
I/O thread 6 state: wait Windows aio (write thread)                              
I/O thread 7 state: wait Windows aio (write thread)                              
I/O thread 8 state: wait Windows aio (write thread)                              
I/O thread 9 state: wait Windows aio (write thread)                              
Pending normal aio reads: [0, 0, 0, 0] , aio writes: [0, 0, 0, 0] ,              
 ibuf aio reads:, log i/o's:, sync i/o's:                                        
Pending flushes (fsync) log: 0; buffer pool: 0                                   
334 OS file reads, 53 OS file writes, 7 OS fsyncs                                
0.00 reads/s, 0 avg bytes/read, 0.00 writes/s, 0.00 fsyncs/s                     
-------------------------------------                                            
INSERT BUFFER AND ADAPTIVE HASH INDEX                                            
-------------------------------------                                            
Ibuf: size 1, free list len 0, seg size 2, 0 merges                              
merged operations:                                                               
 insert 0, delete mark 0, delete 0                                               
discarded operations:                                                            
 insert 0, delete mark 0, delete 0                                               
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
Hash table size 34679, node heap has 0 buffer(s)                                 
0.00 hash searches/s, 0.00 non-hash searches/s                                   
---                                                                              
LOG                                                                              
---                                                                              
Log sequence number 3143663                                                      
Log flushed up to   3143663                                                      
Pages flushed up to 3143663                                                      
Last checkpoint at  3143654                                                      
0 pending log flushes, 0 pending chkp writes                                     
10 log i/o's done, 0.00 log i/o's/second                                         
----------------------                                                           
BUFFER POOL AND MEMORY                                                           
----------------------                                                           
Total large memory allocated 137297920                                           
Dictionary memory allocated 98222                                                
Buffer pool size   8192                                                          
Free buffers       7851                                                          
Database pages     341                                                           
Old database pages 0                                                             
Modified db pages  0                                                             
Pending reads      0                                                             
Pending writes: LRU 0, flush list 0, single page 0                               
Pages made young 0, not young 0                                                  
0.00 youngs/s, 0.00 non-youngs/s                                                 
Pages read 307, created 34, written 36                                           
0.00 reads/s, 0.00 creates/s, 0.00 writes/s                                      
No buffer pool page gets since the last printout                                 
Pages read ahead 0.00/s, evicted without access 0.00/s, Random read ahead 0.00/s 
LRU len: 341, unzip_LRU len: 0                                                   
I/O sum[0]:cur[0], unzip sum[0]:cur[0]                                           
--------------                                                                   
ROW OPERATIONS                                                                   
--------------                                                                   
0 queries inside InnoDB, 0 queries in queue                                      
0 read views open inside InnoDB                                                  
Process ID=1848, Main thread ID=2400, state: sleeping                            
Number of rows inserted 0, updated 0, deleted 0, read 8                          
0.00 inserts/s, 0.00 updates/s, 0.00 deletes/s, 0.00 reads/s                     
----------------------------                                                     
END OF INNODB MONITOR OUTPUT                                                     
============================                                                     
                                                                                 
1 row in set (0.00 sec)                                                          
                                                                                 
ERROR:                                                                           
No query specified                                                               
```

### INNODB_TRX 事务表

在InnoDB1.0版本之前， 用户只能通过命令 `SHOW FULL PROCESS LIST， SHOWENGINE INNODB STATUS` 等来查看当前数据库中锁的请求， 然后再判断事务锁的情况。

从InnoDB1.0开始， 在INFORMATION_SCHEMA架构下添加了表 INNODB_TRX、INNODB LOCKS、INNODB_LOCK_WAITS。

通过这三张表， 用户可以更简单地监控当前事务并分析可能存在的锁问题。

我们将通过具体的示例来分析这三张表，在之前，首先了来看表6-5中表INNODB_TRX的定义， 其由8个字段组成。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/095254_07c050fb_508704.png "屏幕截图.png")

可以通过下面的命令查看：

```sql
mysql>  select * from information_schema.INNODB_TRX \G;
```

### INNODB LOCKS 锁信息表

上面的方法可以查看处理中的事务，但是无法查看对应的锁信息表。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/095955_14b7e35f_508704.png "屏幕截图.png")

```sql
select * from information_schema.INNODB_LOCKS \G;
```

在通过表INNODB_LOCKS查看了每张表上锁的情况后，用户就可以来判断由此引发的等待情况了。

当事务较小时，用户就可以人为地、直观地进行判断了。但是当事务量非常大，其中锁和等待也时常发生，这个时候就不这么容易判断。

###  INNODB_LOCK_WAITS 锁等待

但是通过表 INNODB_LOCK_WAITS， 可以很直观地反映当前事务的等待。

表 INNODB_LOCK_WAITS 由4个字段组成，如表6-7所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/100157_3fdc8043_508704.png "屏幕截图.png")

```sql
select * from information_schema.INNODB_LOCK_WAITS \G;
```

最好的方式是将 3 张表进行联合查询。

## 6.3.2 一致性非锁定读

一致性的非锁定读(consistent nonlocking read)是指InnoDB存储引擎通过行多版本控制(multi versioning)的方式来读取当前执行时间数据库中行的数据。

如果读取的行正在执行DELETE或UPDATE操作， 这时读取操作不会因此去等待行上锁的释放。

相反地，InnoDB存储引擎会去读取行的一个快照数据。

图6-4直观地展现了InnoDB存储引擎一致性的非锁定读。

- 图6-4InnoDB存储引擎非锁定的一致性读

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/100816_652ceaa7_508704.png "屏幕截图.png")

之所以称其为非锁定读，因为不需要等待访问的行上X锁的释放。 

快照数据是指该行的之前版本的数据， 该实现是通过undo段来完成。

**而 undo 用来在事务中回滚数据，因此快照数据本身是没有额外的开销。此外，读取快照数据是不需要上锁的，因为没有事务需要对历史的数据进行修改操作。**

可以看到， 非锁定读机制极大地提高了数据库的并发性。

在InnoDB存储引擎的默认设置下，这是默认的读取方式，即读取不会占用和等待表上的锁。但是在不同事务隔离级别下，读取的方式不同，并不是在每个事务隔离级别下都是采用非锁定的一致性读。

此外，即使都是使用非锁定的一致性读，但是对于快照数据的定义也各不相同。

通过图6-4可以知道，快照数据其实就是当前行数据之前的历史版本，每行记录可能有多个版本。

就图6-4所显示的，一个行记录可能有不止一个快照数据，一般称这种技术为行多版本技术。由此带来的并发控制， 称之为**多版本并发控制(Multi VersionConcurrency Control， MVCC)**。

在事务隔离级别READ COMMITTED和REPEATABLE READ(InnoDB存储引擎的默认事务隔离级别) 下， InnoDB存储引擎使用非锁定的一致性读。然而， 对于快照数据的定义却不相同。

在READ COMMITTED事务隔离级别下， 对于快照数据， 非一致性读总是读取被锁定行的最新一份快照数据。

而在REPEATABLE READ事务隔离级别下，对于快照数据，非一致性读总是读取事务开始时的行数据版本。

## 6.3.3 一致性锁定读

在前一小节中讲到，在默认配置下， 即事务的隔离级别为REPEATABLEREAD模式下，InnoDB存储引擎的SELECT操作使用一致性非锁定读。

但是在某些情况下，用户需要显式地对数据库读取操作进行加锁以保证数据逻辑的一致性。

而这要求数据库支持加锁语句， 即使是对于SELECT的只读操作。

InnoDB存储引擎对于SELECT语甸支持两种一致性的锁定读(lockingread) 操作：

- SELECT…FOR UPDATE

- SELECT…LOCK IN SHARE MODE

SELECT…FOR UPDATE 对读取的行记录加一个X锁， 其他事务不能对已锁定的行加上任何锁。

SELECT…LOCK IN SHARE MODE对读取的行记录加一个S锁， 其他事务可以向被锁定的行加S锁，但是如果加X锁，则会被阻塞。

对于一致性非锁定读， 即使读取的行已被执行了SELECT…FOR UPDATE， 也是可以进行读取的，这和之前讨论的情况一样。

此外，SELECT…FOR UPDATE，SELECT…LOCK IN SHARE MODE必须在一个事务中，当事务提交了， 锁也就释放了。

因此在使用上述两句SELECT锁定语句时 务必加上BEGIN，START TRANSACTION或者SET AUTOCOMMIT=0。

## 6.3.4 自增长与锁

自增长在数据库中是非常常见的一种属性， 也是很多DBA或开发人员首选的主键方式。

在InnoDB存储引擎的内存结构中，对每个含有自增长值的表都有一个自增长计数器(auto-incrementcounter) 。

当对含有自增长的计数器的表进行插入操作时，这个计数器会被初始化，执行如下的语句来得到计数器的值：

`SELECT MAX(auto_inc_col) FROM t FOR UPDATE`：插人操作会依据这个自增长的计数器值加1赋子自增长列。这个实现方式称做AUTO-INC Locking。

这种锁其实是采用一种特殊的表锁机制，为了提高插人的性能， 锁不是在一个事务完成后才释放， 而是在完成对自增长值插人的SQL语句后立即释放。

虽然AUTO-INC Locking从一定程度上提高了并发插人的效率， 但还是存在一些性能上的问题。

首先，对于有自增长值的列的并发插人性能较差，事务必须等待前一个插人的完成(虽然不用等待事务的完成) 。

其次，对于 INSERT…SELECT 的大数据量的插人会影响插人的性能，因为另一个事务中的插人会被阻塞。

从MySQL 5.1.22版本开始，InnoDB存储引擎中提供了一种轻量级互斥量的自增长实现机制，这种机制大大提高了自增长值插人的性能。

并且从该版本开始，InnoDB存储引擎提供了一个参数 `innodb_auto inc_lock_mode` 来控制自增长的模式， 该参数的默认值为 1。

自增长的分类：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/101817_a950c288_508704.png "屏幕截图.png")

`innodb_auto inc_lock_mode` 一共有 3 种类型，分别如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/102050_3bf90385_508704.png "屏幕截图.png")

此外， 还需要特别注意的是InnoDB存储引擎中自增长的实现和MyISAM不同，MyISAM存储引擎是表锁设计， 自增长不用考虑并发插人的问题。

因此在master上用InnoDB存储引擎， 在slave上用MyISAM存储引擎的replication架构下，用户必须考虑这种情况。

另外， 在InnoDB存储引擎中， 自增长值的列必须是索引， 同时必须是索引的第一个列。

如果不是第一个列， 则MySQL数据库会抛出异常， 而MyISAM存储引擎没有这个问题。

## 6.3.5 外键和锁

前面已经介绍了外键， 外键主要用于引用完整性的约束检查。

在InnoDB存储引擎中， 对于一个外键列， 如果没有显式地对这个列加索引，InnoDB存储引擎自动对其加一个索引， 因为这样可以避免表锁——这比Oracle数据库做得好， Oracle数据库不会自动添加索引， 用户必须自己手动添加， 这也导致了Oracle数据库中可能产生死锁。

对于外键值的插人或更新，首先需要查询父表中的记录， 即SELECT父表。

但是对于父表的SELECT操作， 不是使用一致性非锁定读的方式， 因为这样会发生数据不一致的问题， 因此这时使用的是 `SELECT…LOCK IN SHARE MODE` 方式， 即主动对父表加一个S锁。

如果这时父表上已经这样加X锁，子表上的操作会被阻塞，如表6-11所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/102620_2d2b3e26_508704.png "屏幕截图.png")

在上述的例子中， 两个会话中的事务都没有进行COMMIT或ROLLBACK操作，而会话B的操作会被阻塞。
 
这是因为id为3的父表在会话A中已经加了一个X锁，而，此时在会话B中用户又需要对父表中id为3的行加一个S锁， 这时INSERT的操作会被阻塞。
 
设想如果访问父表时， 使用的是一致性的非锁定读， 这时Session B会读到父表有id=3的记录，可以进行插人操作。
 
但是如果会话A对事务提交了，则父表中就不存在id为3的记录。
 
数据在父、子表就会存在不一致的情况。
 
# 6.4 锁的算法

## 6.4.1 行锁的3种算法

InnoDB存储引擎有3种行锁的算法， 其分别是：

- Record Lock：单个行记录上的锁

- Gap Lock：间锁，锁定一个范围， 但不包含记录本身

- Next-Key Lock：GapLock+RecordLock，锁定一个范围，并且锁定记录本身

Record Lock总是会去锁住索引记录， 如果InnoDB存储引擎表在建立的时候没有设置任何一个索引，那么这时InnoDB存储引擎会使用隐式的主键来进行锁定。

Next-KeyLock是结合了GapLock和RecordLock的一种锁定算法，在Next-KeyLock算法下，InnoDB对于行的查询都是采用这种锁定算法。

例如一个索引有10，11，13和20这四个值，那么该索引可能被Next-KeyLocking的区间为：

```
(-无穷，10]
[10，11]
(11，13]
[13，20]
[20，+无穷)
```

采用Next-KeyLock的锁定技术称为Next-KeyLocking。其设计的目的是**为了解决 Phantom Problem**，这将在下一小节中介绍。

而利用这种锁定技术，锁定的不是单个值， 而是一个范围，是谓词锁(predictlock)的一种改进。

除了next-keylocking， 还有previous-key locking技术。

同样上述的索引10、11、13和20， 若采用 previous-key locking 技术，那么可锁定的区间为：

```
[-无穷，10)
[10，11)
[11，13]
113，20)
120，+无穷]
```

若事务 T1 已经通过 next-key locking锁定了如下范围：

```
[10，11]、(11，13]
```

当插人新的记录12时，则锁定的范围会变成：

```
(10，11]、(11，12]、(12.13]
```

然而， 当**查询的索引含有唯一属性时，InnoDB存储引擎会对Next-KeyLock进行优化， 将其降级为Record Lock， 即仅锁住索引本身， 而不是范围。**

ps: 因为唯一属性查出来的结果是固定的，不会出现幻读。所以不需要使用 next-key locking。
 
## 6.4.2 解决 PhantomProblem

在默认的事务隔离级别下， 即REPEATABLE READ下，InnoDB存储引擎采用Next Key Locking机制来避免Phantom Problem (幻像问题) 。

这点可能不同于与其他的数据库，如Oracle数据库， 因为其可能需要在SERIALIZABLE的事务隔离级别下才能解决PhantomProblem。

**PhantomProblem是指在同一事务下， 连续执行两次同样的SQL语句可能导致不同的结果， 第二次的SQL语句可能会返回之前不存在的行。**

下面将演示这个例子， 使用前一小节所创建的表t。

表t由1、2、5这三个值组成， 若这时事务T 1执行如下的SQL语句：`SELECT * FROM t WHERE a > 2 FOR UPDATE`；

注意这时事务T1并没有进行提交操作，上述应该返回5这个结果。

若与此同时，另一个事务T2插入了4这个值，并且数据库允许该操作，那么事务T1再次执行上述SQL语句会得到结果4和5。

这与第一次得到的结果不同， 违反了事务的隔离性， 即当前事务能够看到其他事务的结果。

其过程如表6-13所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/104154_4a5efad6_508704.png "屏幕截图.png")
![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/104225_9c01b114_508704.png "屏幕截图.png")


InnoDB存储引擎采用Next-KeyLocking的算法避免PhantomProblem。

对于上述的SQL语句 `SELECT * FROM t WHERE a > 2 FOR UPDATE`， 其锁住的不是5这单个值， 而是对(2，+…)这个范围加了X锁。

因此任何对于这个范围的插入都是不被允许的，从而避免PhantomProblem。

ps: 这个设计还是非常巧妙的。

**InnoDB 存储引擎默认的事务隔离级别是 REPEATABLE READ， 在该隔离级别下，其采用Next-KeyLocking的方式来加锁**。

而在事务隔离级别READCOMMITTED下，其仅采用 Record Lock， 因此在上述的示例中， 会话A需要将事务的隔离级别设置为READ COMMITTED。

此外，用户可以通过InnoDB存储引擎的Next-KeyLocking机制在应用层面实现唯一性的检查。

例如：

```sql
SELECT*FROM table WHERE col=xxx LOCK IN SHARE MODE：

If notfound any row：
    #unique for insert value
    INSERT INTO table VALUES (...) ；
```

如果用户通过索引查询一个值， 并对该行加上一个SLock， 那么即使查询的值不在，其锁定的也是一个范围，因此若没有返回任何行，那么新插人的值一定是唯一的。

也许有读者会有疑问，如果在进行第一步 SELECT…LOCK IN SHARE MODE 操作时， 有多个事务并发操作，那么这种唯一性检查机制是否存在问题。

其实并不会，因为这时会导致死锁，只有一个事务的插人操作会成功，而其余的事务会抛出死锁的错误，如表6-14所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/104722_aa10c08d_508704.png "屏幕截图.png")


# 6.5 锁问题

通过锁定机制可以实现事务的隔离性要求，使得事务可以并发地工作。

锁提高了并发，但是却会带来潜在的问题。

不过好在因为事务隔离性的要求，锁只会带来三种问题，如果可以防止这三种情况的发生，那将不会产生并发异常。

## 6.5.1 脏读

在理解脏读(Dirty Read) 之前， 需要理解脏数据的概念。但是脏数据和之前所介绍的脏页完全是两种不同的概念。

脏页指的是在缓冲池中已经被修改的页，但是还没有刷新到磁盘中，即数据库实例内存中的页和磁盘中的页的数据是不一致的，当然在刷新到磁盘之前，日志都已经被写人到了重做日志文件中。而所谓脏数据是指事务对缓冲池中行记录的修改， 并且还没有被提交(commit) 。

对于脏页的读取，是非常正常的。脏页是因为数据库实例内存和磁盘的异步造成的，这并不影响数据的一致性(或者说两者最终会达到一致性，即当脏页都刷回到磁盘)。并且因为脏页的刷新是异步的，不影响数据库的可用性，因此可以带来性能的提高。

脏数据却截然不同，脏数据是指未提交的数据，如果读到了脏数据，即一个事务可以读到另外一个事务中未提交的数据，则显然违反了数据库的隔离性。

**脏读指的就是在不同的事务下，当前事务可以读到另外事务未提交的数据，简单来说就是可以读到脏数据。**

- 表 6-15 的例子显示了一个脏读的例子。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/105048_55e54777_508704.png "屏幕截图.png")

表t为我们之前在6.4.1中创建的表，不同的是在上述例子中，事务的隔离级别进行了更换， 由默认的REPEATABLEREAD换成了READUNCOMMITTED。

因此在会话A中， 在事务并没有提交的前提下， 会话B中的两次SELECT操作取得了不同的结果， 并且2这条记录是在会话A中并未提交的数据，即产生了脏读，违反了事务的隔离性。

脏读现象在生产环境中并不常发生，从上面的例子中就可以发现，脏读发生的条件是需要事务的隔离级别为READ UNCOMMITTED， 而目前绝大部分的数据库都至少设置成READCOMMITTED。

**InnoDB存储引擎默认的事务隔离级别为READREPEATABLE ， Microsoft SQLServer数据库为READ COMMITTED ， Oracle数据库同样也是READCOMMITTED。**

脏读隔离看似毫无用处，但在一些比较特殊的情况下还是可以将事务的隔离级别设置为READUNCOMMITTED。

例如replication环境中的slave节点， 并且在该slave上的查询并不需要特别精确的返回值。

## 6.5.2 不可重复读

不可重复读是指在一个事务内多次读取同一数据集合。

在这个事务还没有结束时，另外一个事务也访问该同一数据集合， 并做了一些DML操作。

因此， 在第一个事务中的两次读数据之间，由于第二个事务的修改，那么第一个事务两次读到的数据可能是不一样的。这样就发生了在一个事务内两次读到的数据是不一样的情况，这种情况称为**不可重复读**。

不可重复读和脏读的区别是：脏读是读到未提交的数据，而不可重复读读到的却是已经提交的数据，但是其违反了数据库事务一致性的要求。

可以通过下面一个例子来观察不可重复读的情况，如表6-16所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/105414_582a2316_508704.png "屏幕截图.png")

在会话A中开始一个事务，第一次读取到的记录是1，在另一个会话B中开始了另一个事务，插入一条为2的记录，在没有提交之前，对会话A中的事务进行再次读取时，读到的记录还是1，没有发生脏读的现象。

但会话Ｂ中的事务提交后，在对会话A中的事务进行读取时，这时读到是1和2两条记录。

这个例子的前提是，在事务开始前， 会话A和会话B的事务隔离级别都调整为READ COMMITTED。

一般来说，不可重复读的问题是可以接受的，因为其读到的是已经提交的数据，本身并不会带来很大的问题。

因此， 很多数据库厂商(如Oracle、Microsoft SQLServer)将其数据库事务的默认隔离级别设置为READ COMMITTED ， 在这种隔离级别下允许不可重复读的现象。

在InnoDB存储引擎中， 通过使用 Next-Key Lock 算法来避免不可重复读的问题。

在MySQL官方文档中将不可重复读的问题定义为Phantom Problem， 即幻像问题。

在 Next-Key Lock 算法下， 对于索引的扫描， 不仅是锁住扫描到的索引， 而且还锁住这些索引覆盖的范围(gap)。

因此在这个范围内的插入都是不允许的。

这样就避免了另外的事务在这个范围内插人数据导致的不可重复读的问题。

因此，InnoDB 存储引擎的默认事务隔离级别是 READ REPEATABLE， 采用 Next-KeyLock 算法， 避免了不可重复读的现象。

## 6.5.3 丢失更新

丢失更新是另一个锁导致的问题，简单来说其就是一个事务的更新操作会被另一个事务的更新操作所覆盖，从而导致数据的不一致。

例如：

1) 事务T1将行记录r更新为vl，但是事务T1并未提交。

2) 与此同时，事务T2将行记录r更新为v2，事务T2未提交。

3) 事务T1提交。

4) 事务T2提交。

但是，在当前数据库的任何隔离级别下，都不会导致数据库理论意义上的丢失更新问题。这是因为， 即使是READ UNCOMMITTED的事务隔离级别，对于行的DML操作，需要对行或其他粗粒度级别的对象加锁。

因此在上述步骤2)中，事务T2并不能对行记录r进行更新操作，其会被阻塞，直到事务T1提交。

虽然数据库能阻止丢失更新问题的产生，但是在生产应用中还有另一个逻辑意义的丢失更新问题，而导致该问题的并不是因为数据库本身的问题。

实际上，在所有多用户计算机系统环境下都有可能产生这个问题。

简单地说来，出现下面的情况时，就会发生丢失更新：

1) 事务 T1 查询一行数据， 放人本地内存， 并显示给一个终端用户 User1。

2) 事务 T2 也查询该行数据， 并将取得的数据显示给终端用户 User2。

3) User 1修改这行记录， 更新数据库并提交。

4) User 2修改这行记录， 更新数据库并提交。

显然， 这个过程中用户User l的修改更新操作“丢失”了， 而这可能会导致一个“恐怖”的结果。

设想银行发生丢失更新现象，例如一个用户账号中有10000元人民币，他用两个网上银行的客户端分别进行转账操作。

第一次转账9000人民币，因为网络和数据的关系，这时需要等待。但是这时用户操作另一个网上银行客户端，转账1元，如果最终两笔操作都成功了，用户的账号余款是9999人民币，第一次转的9000人民币并没有得到更新，但是在转账的另一个账号却会收到这9000元，这导致的结果就是钱变多， 而账不平。

也许有读者会说， 不对， 我的网银是绑定USB Key的， 不会发生这种情况。

是的， 通过USB Key登录也许可以解决这个问题， 但是更重要的是在数据库层解决这个问题，避免任何可能发生丢失更新的情况。

**要避免丢失更新发生，需要让事务在这种情况下的操作变成串行化，而不是并行的操作。**

即在上述四个步骤的1)中，对用户读取的记录加上一个排他X锁。同样，在步骤2)的操作过程中，用户同样也需要加一个排他X锁。通过这种方式，步骤2)就必须等待一步骤1)和步骤3)完成，最后完成步骤4)。

表6-17所示的过程演示了如何避免这种逻辑上丢失更新问题的产生。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/110233_72c81205_508704.png "屏幕截图.png")

有读者可能会问，在上述的例子中为什么不直接允许UPDATE语句， 而首先要进行SELECT…FORUPDATE的操作。的确， 直接使用UPDATE可以避免丢失更新问题的产生。

然而在实际应用中，应用程序可能需要首先检测用户的余额信息，查看是否可以进行转账操作， 然后再进行最后的UPDATE操作， 因此在SELECT与UPDATE操作之间可能还存在一些其他的SQL操作。

我发现， 程序员可能在了解如何使用SELECT、INSERT、UPDATE、DELETE语句后就开始编写应用程序。

因此，丢失更新是程序员最容易犯的错误，也是最不易发现的一个错误，因为这种现象只是随机的、零星出现的，不过其可能造成的后果却十分严重。

ps: 这确实是一个非常常见的错误，也很少有开发回去写 select .... for update 这种语句。

# 6.6 阻塞

因为不同锁之间的兼容性关系，在有些时刻一个事务中的锁需要等待另一个事务中的锁释放它所占用的资源，这就是阻塞。

阻塞并不是一件坏事，其是为了确保事务可以并发且正常地运行。

在InnoDB存储引擎中， 参数innodb_lock_wait_timeout用来控制等待的时间(默认是50秒)，innodb_rollback_on_timeout用来设定是否在等待超时时对进行中的事务进行回滚操作(默认是OFF， 代表不回滚)。

参数innodb_lock_wait_timeout是动态的，可以在MySQL数据库运行时进行调整：

```
mysql>SET@@innodb_lock_wait_timeout=60；
Query OK ，0rowsaffected(0.00sec)
```

而 innodb_rollback_on_timeout 是静态的，不可在启动时进行修改， 如：

```
mysql>SET@@innodb_rollback_on_timeout=on；
ERROR 1238 (HY000) ：Variable 'innodb_rollback_on_timeout 'isa readonlyvariable
```

当发生超时，MySQL数据库会抛出一个1205的错误， 如：

```
mysql>BEGIN；
Query OK ，Orowsaffected(0.00sec)
mysql>SELECT*FROM tWHEREa-1 FOR UPDATE；
ERROR 1205(HY000) ：Lock wait timeout exceeded； try restarting transaction
```

需要牢记的是，在默认情况下InnoDB存储引擎不会回滚超时引发的错误异常。

其实InnoDB存储引擎在大部分情况下都不会对异常进行回滚。

## 例子

我们创建一张表进行测试：

```sql
mysql> create table  t(
    ->    id int
    -> );
Query OK, 0 rows affected (0.01 sec)
```

我们创建一张最简单表，用来测试。

插入数据：

```sql
insert into t (id) values (1);
insert into t (id) values (2);
insert into t (id) values (3);
insert into t (id) values (8);
```

初始化 4 条数据。

### 会话 A

```
mysql> select * from t;
+------+
| id   |
+------+
|    1 |
|    2 |
|    3 |
|    8 |
+------+
4 rows in set (0.00 sec)

mysql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

mysql> select * from t where id < 8 for update;
+------+
| id   |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)
```

这里我们开启一个事务，通过 for update，根据 next-key locking 锁住所有小于 8 的插入数据。

### 会话 B

此时开启另外一个会话。

```
mysql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

mysql> insert into t(id) values (9);
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

执行插入，此时会进入等待。

我这边测试的结果，经过个人测试，发现这里竟然锁住了 9 这个数据的插入？？


# 6.7 死锁

## 6.7.1 死锁的概念

死锁是指两个或两个以上的事务在执行过程中，因争夺锁资源而造成的一种互相等待的现象。若无外力作用，事务都将无法推进下去。

**解决死锁问题最简单的方式是不要有等待，将任何的等待都转化为回滚，并且事务重新开始。**

毫无疑问，这的确可以避免死锁问题的产生。然而在线上环境中，这可能导致并发性能的下降，甚至任何一个事务都不能进行。而这所带来的问题远比死锁问题更为严重，因为这很难被发现并且浪费资源。

解决死锁问题**最简单的一种方法是超时**，即当两个事务互相等待时，当一个等待时间超过设置的某一阈值时，其中一个事务进行回滚，另一个等待的事务就能继续进行。

在InnoDB存储引擎中， 参数innodb_lock_wait_timeout用来设置超时的时间。

超时机制虽然简单，但是其仅通过超时后对事务进行回滚的方式来处理，或者说其是根据FIFO的顺序选择回滚对象。

但若超时的事务所占权重比较大，如事务操作更新了很多行，占用了较多的undolog，这时采用FIFO的方式， 就显得不合适了， 因为回滚这个事务的时间相对另一个事务所占用的时间可能会很多。

因此， 除了超时机制，当前数据库还都普遍采用wait-forgraph(等待图)的方式来进行死锁检测。

较之超时的解决方案，这是一种更为主动的死锁检测方式。InnoDB存储引擎也采用的这种方式。

wait-forgraph要求数据库保存以下两种信息：

- 锁的信息链表

- 事务等待链表


通过上述链表可以构造出一张图，而在这个图中若存在回路，就代表存在死锁，因此资源间相互发生等待。

在wait-forgraph中， 事务为图中的节点。

而在图中， 事务T 1 指向T2边的定义为：

- 事务T1等待事务T2所占用的资源

- 事务T1最终等待T2所占用的资源，也就是事务之间在等待相同的资源，而事务T1发生在事务T2的后面

下面来看一个例子，当前事务和锁的状态如图6-5所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/113213_68bb4ed2_508704.png "屏幕截图.png")

在Transaction Wait Lists中可以看到共有4个事务t1、t2、t3、t4， 故在wait- forgraph中应有4个节点。

而事务t2对rowl占用x锁， 事务tl对row 2占用s锁。

事务t1 需要等待事务t 2中rowl的资源， 因此在wait- for graph中有条边从节点t1指向节点t2。事务t2需要等待事务t 1、t 4所占用的row2对象， 故而存在节点t2到节点t 1、t4的边。

同样， 存在节点t3到节点t1、t2、t4的边， 因此最终的wait-forgraph如图6-6所示。

- 图 6-6 wait-for graph

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/113420_a640f865_508704.png "屏幕截图.png")

通过图6-6可以发现存在回路(t1，t2)，因此存在死锁。

通过上述的介绍，可以发现wait-for graph是一种较为主动的死锁检测机制， 在每个事务请求锁并发生等待时都会判断是否存在回路，若存在则有死锁， tl 12通常来说InnoDB存储引擎选择回滚undo量最小的事务。

wait-forgraph的死锁检测通常采用深度优先的算法实现，t4 t3在InnoDB1.2版本之前， 都是采用递归方式实现。

而从1.2版本开始，对wait-forgraph的死锁检测进行了优化， 将递归用非递归的方式实现， 从而进一步提高了InnoDB存储引擎的性能。

## 6.7.2死锁概率

死锁应该非常少发生，若经常发生，则系统是不可用的。

此外，死锁的次数应该还要少于等待，因为至少需要2次等待才会产生一次死锁。

本节将从纯数学的概率角度来分析，死锁发生的概率是非常小的。


假设当前数据库中共有n+1个线程执行，即当前总共有n+1个事务。并假设每个事务所做的操作相同。若每个事务由r+1个操作组成，每个操作为从R行数据中随机地操作一行数据，并占用对象的锁。

每个事务在执行完最后一个步骤释放所占用的所有锁资源。

最后，假设 `nr << R`，即线程操作的数据只占所有数据的一小部分。

在上述的模型下，事务获得一个锁需要等待的概率是多少呢?当事务获得一个锁，其他任何一个事务获得锁的情况为：

```
(1+2+3+…+r)/(r+1)  ≈ r/2
```

由于每个操作为从R行数据中取一条数据，每行数据被取到的概率为1/R，因此，事务中每个操作需要等待的概率PW为：


```
PW=nr/2R
```

事务是由r个操作所组成，因此事务发生等待的概率PW(T)为：

```
PW(T) =1-(1-PW)'  ≈ r*PW  ≈ nr^2 / 2R
```

死锁是由于产生回路，也就是事务互相等待而发生的，若死锁的长度为2，即两个等待节点间发生死锁，那么其概率为：

```
一个事务发生死锁的概率 ≈ PW(T)^2 / 4 * R^2
```

由于大部分死锁发生的长度为2，因此上述公式基本代表了一个事务发生死锁的概率。从整个系统来看，任何一个事务发生死锁的概率为：

```
    系统中任何一个事务发生死锁的概率 ≈ n^2 * r^4 / 4 * R^2
```

从上述的公式中可以发现，由于 `nr << R`，因此事务发生死锁的概率是非常低的。

同时，事务发生死锁的概率与以下几点因素有关：
    
- 系统中事务的数量(n)，数量越多发生死锁的概率越大。

- 每个事务操作的数量(r)，每个事务操作的数量越多，发生死锁的概率越大。医口操作数据的集合(R)，越小则发生死锁的概率越大。


## 6.7.3 死锁的示例

如果程序是串行的，那么不可能发生死锁。

死锁只存在于并发的情况，而数据库本身就是一个并发运行的程序，因此可能会发生死锁。

### 案例 1

表6-18的操作演示了死锁的一种经典的情况，即A等待B，B在等待A，这种死锁问题被称为AB-BA死锁。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/114014_f13332c2_508704.png "屏幕截图.png")

在上述操作中，会话Ｂ中的事务抛出了1213这个错误提示，即表示事务发生了死锁。

死锁的原因是会话A和B的资源在互相等待。

大多数的死锁InnoDB存储引擎本身可以侦测到，不需要人为进行干预。

但是在上面的例子中，在会话B中的事务抛出死锁异常后，会话A中马上得到了记录为2的这个资源，这其实是因为会话B中的事务发生了回滚，否则会话A中的事务是不可能得到该资源的。

还记得6.6节中所说的内容吗?

InnoDB存储引擎并不会回滚大部分的错误异常， 但是死锁除外。

发现死锁后，InnoDB存储引擎会马上回滚一个事务，这点是需要注意的。因此如果在应用程序中捕获了1213这个错误，其实并不需要对其进行回滚。

发Oracle数据库中产生死锁的常见原因是没有对外键添加索引， 而InnoDB存储擎会自动对其进行添加，因而能够很好地避免了这种情况的发生。

通过上述例子可以看到， 虽然在建立子表时指定了外键， 但是InnoDB存储引擎会自动在外键列上建立了一个索引b。并且，人为地删除这个列是不被允许的。

### 案例 2

此外还存在另一种死锁，即当前事务持有了待插入记录的下一个记录的X锁，但是在等待队列中存在一个S锁的请求，则可能会发生死锁。

来看一个例子，首先根据如下代码创建测试表t，并导人一些数据：

```sql
CREATE TABLE t(
 a INT PRIMARY KEY
) ENGINE=InnoDB；
INSERT INTO t VALUES(1) ， (2) ， (4) ， (5) ；
```

表t仅有一个列a，并插入4条记录。接着运行表6-19所示的查询。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1114/114628_1d76230d_508704.png "屏幕截图.png")

可以看到，会话A中已经对记录4持有了X锁，但是会话A中插人记录3时会导致死锁发生。这个问题的产生是由于会话B中请求记录4的S锁而发生等待，但之前请求的锁对于主键值记录1、2都已经成功，若在事件点5能插人记录，那么会话B在获得记录4持有的S锁后，还需要向后获得记录3的记录，这样就显得有点不合理。

因此InnoDB存储引擎在这里主动选择了死锁，而回滚的是undo log记录大的事务， 这与AB-BA死锁的处理方式又有所不同。

# 6.8 锁升级

锁升级(Lock Escalation) 是指将当前锁的粒度降低。

举例来说， 数据库可以把一个表的1000个行锁升级为一个页锁，或者将页锁升级为表锁。

如果在数据库的设计中认为锁是一种稀有资源，而且想避免锁的开销，那数据库中会频繁出现锁升级现象。

Microsoft SQLServer数据库的设计认为锁是一种稀有的资源， 在适合的时候会自动地将行、键或分页锁升级为更粗粒度的表级锁。

这种升级保护了系统资源，防止系统使用太多的内存来维护锁，在一定程度上提高了效率。

即使在Miro soft SQLServer 2005版本之后， SQLServer数据库支持了行锁， 但是其设计和InnoDB存储引擎完全不同， 在以下情况下依然可能发生锁升级：

- 由一句单独的SQL语句在一个对象上持有的锁的数量超过了阈值， 默认这个阈值为5000。值得注意的是，如果是不同对象，则不会发生锁升级

- 锁资源占用的内存超过了激活内存的40%时就会发生锁升级

在Microsoft SQLServer数据库中， 由于锁是一种稀有的资源， 因此锁升级会带来一定的效率提高。

但是锁升级带来的一个问题却是因为锁粒度的降低而导致并发性能的降低。

InnoDB存储引擎不存在锁升级的问题。因为其不是根据每个记录来产生行锁的，相反，其根据每个事务访问的每个页对锁进行管理的，采用的是位图的方式。因此不管一个事务锁住页中一个记录还是多个记录，其开销通常都是一致的。

假设一张表有3000000个数据页，每个页大约有100条记录，那么总共有300000000条记录。若有一个事务执行全表更新的SQL语句， 则需要对所有记录加X锁。

若根据每行记录产生锁对象进行加锁，并且每个锁占用10字节，则仅对锁管理就需要差不多需要3GB的内存。而InnoDB存储引擎根据页进行加锁， 并采用位图方式， 假设每个页存储的锁信息占用30个字节，则锁对象仅需90MB的内存。

由此可见两者对于锁资源开销的差距之大。


# 小结

# 参考资料

《mysql 技术内幕》

* any list
{:toc}


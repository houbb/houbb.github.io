---
layout: post
title: mysql learn-03-Innodb 引擎介绍
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [data, mysql, learn-note, sh]
published: true
---

# 不同版本特性

![不同版本特性](https://images.gitee.com/uploads/images/2020/1108/170343_1ca767bc_508704.png)

# 体系架构

![体系架构](https://images.gitee.com/uploads/images/2020/1108/170728_4088c13f_508704.png "屏幕截图.png")

## 后台线程

刷新内存池数据,保证内存缓存的是最新的数据,将已修改的数据文件刷新到磁盘中,数据库发生异常时InnoDB能恢复至正常运行状态.

- Master Thread

负责将缓冲池中的数据异步刷新到磁盘,保证数据的一致性,包括脏页的刷新,合并插入缓冲,UNDO页的回收.

- IO Thread

Async IO处理IO请求,四种Thread: write, read, insert buffer, log IO thread, 可

设置: innodb_read_io_threads, innodb_write_io_threads

- Purge Thread

来回收已经使用并分配的 undo 页。

1.1 版本之后从 master thread 中独立出来。

- Page Cleaner Thread

脏页刷新的操作放在该线程中执行

目的：减轻 Master Thread 的负担，进一步提升性能。

# 内存

## 缓冲池

InnoDB存储引擎是基于磁盘存储的，并将其中的记录按照页的方式进行管理。
 
缓冲池简单来说就是一块内存区域，通过内存的速度来弥补磁盘速度较慢对数据库性能的影响。

在数据库中进行读取页的操作，首先将从磁盘读到的页存放在缓冲池中，这个过程称为将页“FIX”在缓冲池中。

下一次再读相同的页时，首先判断该页是否在缓冲池中。若在缓冲池中，称该页在缓冲池中被命中，直接读取该页。否则，读取磁盘上的页。对于数据库中页的修改操作，则首先修改在缓冲池中的页，然后再以一定的频率刷新到磁盘上。

这里需要注意的是，**页从缓冲池刷新回磁盘的操作并不是在每次页发生更新时触发，而是通过一种称为Checkpoint的机制刷新回磁盘。**

同样， 这也是为了提高数据库的整体性能。

综上所述，缓冲池的大小直接影响着数据库的整体性能，强烈建议数据库服务器都采用 64 位的操作系统。

- 参数配置

缓冲池大小可配: innodb_buffer_pool_size

缓冲池个数可配: innodb_buffer_pool_instances

- 缓冲的内容

具体来看， 缓冲池中缓存的数据页类型有：索引页、数据页、undo页、插入缓冲(insertbuffer)、自适应哈希索引(adaptivehashindex)、InnoDB存储的锁信息(lockinfo)、数据字典信息(datadictionary) 等。

不能简单地认为， 缓冲池只是缓存索引页和数据页， 它们只是占缓冲池很大的一部分而已。

![存储信息](https://images.gitee.com/uploads/images/2020/1108/171846_069cb2e4_508704.png)

## 淘汰策略

和所有的缓存一样，内存的大小固定，一定要有对应的淘汰策略。

LRU List, Free List, Flush List

改进LRU算法,该算法为midpoint insertion strategy,默认midpoint的位于列表的5/8处,该位置可以通过innodb_old_blocks_pct控制.

参数innodb_old_blocks_time表示页读取到mid位置后需要等待多久才会被加入到LRU的热端.

脏页既存在于LRU list, Flush list中,LUR列表是用来管理页列表的可用性,而Flush列表是用来管理将页刷新回磁盘,两者互不影响.

## 重做日志缓冲池

可配置参数innodb_log_buffer_size,默认为8MB,以下三种将缓存池内容刷新到磁盘中的情况:

1) Master Thread每一秒将重做日志缓冲刷新到重做日志中;

2) 每个事务提交时会将重做日志缓冲刷新到重做日志中;

3) 当重做日志缓冲池剩余空间小于1/2时,重做日志缓冲刷新到重做日志中.

## 额外的内存池

在InnoDB存储引擎中，对内存的管理是通过一种称为内存堆(heap)的方式进行的。

在对一些数据结构本身的内存进行分配时，需要从额外的内存池中进行申请，当该区域的内存不够时，会从缓冲池中进行申请。

申请较大的缓冲池，也需要同步提高这个参数值。

# Checkpoint技术

倘若每次一个页发生变化，就将新页的版本刷新到磁盘，那么这个**开销是非常大**的。

ps: 这里一致都是吞吐量和实时性的一个 trade-off。

## 事务

为了避免发生数据丢失的问题， 当前事务数据库系统普遍都采用了 `Write Ahead Log` 策略，即当事务提交时，先写重做日志，再修改页。

当由于发生宕机而导致数据丢失时，通过重做日志来完成数据的恢复。

这也是事务ACID中D(Durability持久性) 的要求。

## 为什么需要刷新到磁盘？

如果满足两个前提条件，可以直接根据 redolog 恢复整个 database 的数据。

1. 缓冲池可以缓存数据库中所有的数据；

2. 重做日志可以无限增大。

但是这 2 个条件很难满足，缓冲区需要的是内存，大小不说，成本也是和磁盘比起来贵的多。

重做日志无限大，会导致运维成本直线上升。

就算都满足，恢复时间也是一个大问题。

所以，这个时候我们的 checkpoint 就闪亮登场了。

## checkpoint 的作用

（1）缩短数据库的恢复时间；

（2）缓冲池不够用时，将脏页刷新到磁盘；

（3）重做日志不可用时，刷新脏页。

 当数据库发生宕机时，数据库不需要重做所有的日志， 因为Checkpoint之前的页都已经刷新回磁盘。
 
 故数据库只需对Checkpoint后的重做日志进行恢复。这样就大大缩短了恢复的时间。

此外， 当缓冲池不够用时，根据LRU算法会溢出最近最少使用的页，若此页为脏页，那么需要强制执行Checkpoint， 将脏页也就是页的新版本刷回磁盘。

重做日志出现不可用的情况是因为当前事务数据库系统对重做日志的设计都是循环使用的，并不是让其无限增大的，这从成本及管理上都是比较困难的。

重做日志可以被重用的部分是指这些重做日志已经不再需要，即当数据库发生宕机时，数据库恢复操作不需要这部分的重做日志，因此这部分就可以被覆盖重用。

若此时重做日志还需要使用，那么必须强制产生Checkpoint， 将缓冲池中的页至少刷新到当前重做日志的位置。

对于InnoDB存储引擎而言， 其是通过LSN(LogSequenceNumber) 来标记版本的。

而LSN是8字节的数字，其单位是字节。每个页有LSN，重做日志中也有LSN，Checkpoint也有LSN。

可以通过命令SHOW ENGINE INNODB STATUS来观察：

```
...
---
LOG
---
Log sequence number 436866628
Log flushed up to   436866628
Pages flushed up to 436866628
Last checkpoint at  436866619
```

### 类型

两种 Checkpoint: Sharp Checkpoint(数据库关闭时将所有脏页刷新会磁盘), Fuzzy Checkpoint.

Fuzzy Checkpoint 有以下几种:

Master Thread Checkpoint

FULSH_LRU_LIST Checkpoint

Async/Sync Flush Checkpoint

Dirty Page too much Checkpoint

# Master Thread的工作方式

内部分为多个loop: loop, background loop, flush loop, suspend loop;

## loop

![输入图片说明](https://images.gitee.com/uploads/images/2020/1108/184503_93ceee5a_508704.png "屏幕截图.png")

（1）每秒操作:

日志缓冲刷新到磁盘,即使这个事务还没有提交(总是);

合并插入缓冲(可能);

至多刷新100个脏页到磁盘(可能);

若当前无用户活动,切换到 background loop.

（2）每 10 秒操作:

刷新100个脏页到磁盘;(可能)

合并至多5个插入缓冲;(总是)

将日志缓冲刷新到磁盘;(总是)

删除无用的undo页;(总是)

刷新100个或10个脏页到磁盘(总是).

## background loop

删除无用的undo页(总是);

合并20个插入缓冲(总是);

跳出主循环(总是);

不断刷新100个页直到符合条件(可能,跳转到flush loop完成).

## 1.2.x前增加可选项

innodb_io_capacity

innodb_max_dirty_pages_pct

innodb_adaptive_flushing

innodb_purge_batch_size

## 1.2.x后改进

Master Thread 伪代码:

![输入图片说明](https://images.gitee.com/uploads/images/2020/1108/184715_7693a959_508704.png "屏幕截图.png")

从 Master Thread 中分离出刷新脏页的操作至一个单独的 Page Cleaner Thread.

# InnoDB关键特性

## Insert Buffer

适用对象: 非唯一的辅助索引

内部实现: B+树

Insert/Change Buffer

### 聚集索引插入

在InnoDB存储引擎中， 主键是行唯一的标识符。通常应用程序中行记录的插入顺序是按照主键递增的顺序进行插入的。

因此， 插入聚集索引(PrimaryKey) 一般是顺序的，不需要磁盘的随机读取。

比如按下列SQL定义表：

```sql
CREATE TABLE t(
    a INT AUTO_INCREMENT ，
    b VARCHAR(30)，
    PRIMARY KEY(a)
);
```

其中a列是自增长的， 若对a列插入NULL值， 则由于其具有AUTO_INCREMENT属性，其值会自动增长。

同时页中的行记录按a的值进行顺序存放。在一般情况下，不需要随机读取另一个页中的记录。因此，对于这类情况下的插入操作，速度是非常快的。

注意并不是所有的主键插入都是顺序的。

若主键类是UUID这样的类，那么插入和辅助索引一样，同样是随机的。即使主键是自增类型，但是插入的是指定的值，而不是NULL值，那么同样可能导致插入并非连续的情况。

### 辅助索引插入存在的问题

但是不可能每张表上只有一个聚集索引，更多情况下，一张表上有多个非聚集的辅助索引(secondaryindex) 。

比如，用户需要按照b这个字段进行查找， 并且b这个字段不是唯一的， 即表是按如下的SQL语句定义的：

```sql
CREATE TABLE t(
    a INT AUTO_INCREMENT ，
    b VARCHAR(30)，
    PRIMARY KEY(a),
    key(b)
);
```

在这样的情况下产生了一个非聚集的且不是唯一的索引。

在进行插入操作时，数据页的存放还是按主键a进行顺序存放的，但是对于非聚集索引叶子节点的插入不再是顺序的了，这时就需要离散地访问非聚集索引页，由于随机读取的存在而导致了插入操作性能下降。

当然这并不是这个b字段上索引的错误，而是因为B+树的特性决定了非聚集索引插入的离散性。

需要注意的是，在某些情况下，辅助索引的插入依然是顺序的，或者说是比较顺序的，比如用户购买表中的时间字段。

在通常情况下，用户购买时间是一个辅助索引，用来根据时间条件进行查询。但是在插入时却是根据时间的递增而插入的，因此插入也是“较为”顺序的。

### insert buffer

InnoDB存储引擎开创性地设计了InsertBuffer，对于非聚集索引的插入或更新操作，不是每一次直接插入到索引页中，而是先判断插入的非聚集索引页是否在缓冲池中，若在，则直接插入：若不在，则先放人到一个InsertBuffer对象中，好似欺骗。

数据库这个非聚集的索引已经插到叶子节点，而实际并没有，只是存放在另一个位置。

然后再以一定的频率和情况进行InsertBuffer和辅助索引页子节点的merge(合并) 操作，这时通常能将多个插入合并到一个操作中(因为在一个索引页中)，这就大大提高了对于非聚集索引插入的性能。

ps: 这里实际上就是为了避免 B+ 插入的离散型，通过批量的操作提升吞吐量。

然而Insert Buffer的使用需要同时满足以下两个条件：

(1) 索引是辅助索引(secondaryindex) ；

(2) 索引不是唯一(unique) 的。

当满足以上两个条件时，InnoDB存储引擎会使用Insert Buffer， 这样就能提高插入操作的性能了。

不过考虑这样一种情况：应用程序进行大量的插入操作，这些都涉及了不唯一的非聚集索引，也就是使用了InsertBuffer。

若此时MySQL数据库发生了宕机，这时势必有大量的Insert Buffer并没有合并到实际的非聚集索引中去。

因此这时恢复可能需要很长的时间，在极端情况下甚至需要几个小时。

辅助索引不能是唯一的，因为**在插入缓冲时，数据库并不去查找索引页来判断插入的记录的唯一性**。

如果去查找肯定又会有离散读取的情况发生，从而导致Insert Buffer失去了意义。

### 缓冲信息的查看

用户可以通过命令SHOW ENGINE INNODB STATUS来查看插入缓冲的信息：

```
mysql> SHOW ENGINE INNODB STATUS \G；
```

如下：

```
...
Ibuf: size 1, free list len 0, seg size 2, 0 merges
merged operations:
 insert 0, delete mark 0, delete 0
discarded operations:
 insert 0, delete mark 0, delete 0
...
```

seg size显示了当前Insert Buffer的大小为 2×16KB； 

free list len 代表了空闲列表的长度； 

size代表了已经合并记录页的数量。

Inserts代表了插入的记录数；merged recs代表了合并的插入记录数量； merges代表合并的次数，也就是实际读取页的次数。

merges：mergedrecs大约为1：3，代表了插入缓冲将对于非聚集索引页的离散IO逻辑请求大约降低了2/3。

### insert buffer 的问题

正如前面所说的，目前Insert Buffer存在一个问题是：

在写密集的情况下，插入缓冲会占用过多的缓冲池内存(innodb_buffer_pool)， 默认最大可以占用到1/2的缓冲池内存。

以下是InnoDB存储引擎源代码中对于 insert buffer 的初始化操作：

```c
/**Buffer poolsize per the maximum insert buffersize*/
#define IBUF_POOL_SIZE_PER_MAX_SIZE 2
ibuf->max_size =buf_pool_get_curr_size() / UNIV_PAGE_SIZE / IBUF_POOL_SIZE_PER_MAX_SIZE；
```

这对于其他的操作可能会带来一定的影响。

Percona 上发布一些patch来修正插入缓冲占用太多缓冲池内存的情况，具体可以到Percona官网进行查找。

简单来说，修改 `IBUF_POOL_SIZE_PER_MAX_SIZE` 就可以对插入缓冲的大小进行控制。

## change buffer

InnoDB从1.0.x版本开始引入了Change Buffer，可将其视为InsertBuffer的升级。

从这个版本开始，InnoDB存储引擎可以对DML操作——INSERT、DELETE、UPDATE都进行缓冲，他们分别是：InsertBuffer、DeleteBuffer、Purgebuffer。

当然和之前 Insert Buffer 一样， Change Buffer 适用的对象依然是**非唯一的辅助索引**。

对一条记录进行UPDATE操作可能分为两个过程：

（1）将记录标记为已删除；

（2）真正将记录删除。

因此 Delete Buffer 对应UPDATE操作的第一个过程， 即将记录标记为删除。

PurgeBuffer 对应UPDATE操作的第二个过程，即将记录真正的删除。

同时，InnoDB 存储引擎提供了参数 `innodb_change_buffering`，用来开启各种Buffer的选项。

该参数可选的值为：inserts、deletes、purges、changes、all、none。

inserts、deletes、purges就是前面讨论过的三种情况。

changes表示启用inserts和deletes，all表示启用所有，none表示都不启用。

该参数默认值为all。

从InnoDB1.2.x版本开始， 可以通过参数 `innodb_change_buffer_max_size` 来控制Change Buffer最大使用内存的数量。

## InsertBuffer 的内部实现

通过前一个小节读者应该已经知道了InsertBuffer的使用场景，即非唯一辅助索引的插入操作。

但是对于Insert Buffer具体是什么，以及内部怎么实现可能依然模糊， 这正是本节所要阐述的内容。

可能令绝大部分用户感到吃惊的是，**InsertBuffer 的数据结构是一棵 B+ 树**。

ps: 震惊！

在MySQL 4.1之前的版本中每张表有一棵Insert Buffer B+树。

而在现在的版本中，全局只有一棵Insert Buffer B+树，负责对所有的表的辅助索引进行InsertBuffer。

而这棵B+树存放在共享表空间中， 默认也就是 ibdatal 中。

因此，试图通过独立表空间ibd文件恢复表中数据时，往往会导致CHECK TABLE失败。

这是因为表的辅助索引中的数据可能还在InsertBuffer中，也就是共享表空间中，所以通过ibd文件进行恢复后，还需要进行REPAIR TABLE操作来重建表上所有的辅助索引。

Insert Buffer是一棵B+树， 因此其也由叶节点和非叶节点组成。

非叶节点存放的是查询的searchkey(键值)， 其构造如图2-3所示。

- 2-3 searchkey 内部结构

```
space | marker | offset
```

search key一共占用9个字节， 其中space表示待插入记录所在表的表空间id， 在InnoDB存储引擎中， 每个表有一个唯一的space id， 可以通过space id查询得知是哪张表。space占用4字节。

marker占用1字节， 它是用来兼容老版本的Insert Buffer。offset表示页所在的偏移量，占用4字节。

当一个辅助索引要插入到页(space，offset) 时，如果这个页不在缓冲池中，那么InnoDB存储引擎首先根据上述规则构造一个search key， 接下来查询Insert Buffer这棵B+树， 然后再将这条记录插入到Insert Buffer B+树的叶子节点中。

对于插入到Insert Buffer B+树叶子节点的记录(如图2-4所示) ， 并不是直接将待插入的记录插入，而是需要根据如下的规则进行构造：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1108/191444_18742db2_508704.png "屏幕截图.png")

前面的属性和上面一样，也是共占用 9 个字节。

metadata 共占用 4 个字节，内容如下：

![输入图片说明](https://images.gitee.com/uploads/images/2020/1108/191700_bc8f7fa4_508704.png "屏幕截图.png")

IBUF_REC_OFFSET_COUNT是保存两个字节的整数，用来排序每个记录进入InsertBuffer的顺序。

因为从InnoDB1.0.x开始支持Change Buffer， 所以这个值同样记录进入InsertBuffer的顺序。

通过这个顺序回放(replay) 才能得到记录的正确值。

从InsertBuffer叶子节点的第5列开始， 就是实际插入记录的各个字段了。

因此较之原插入记录， Insert Buffer B+树的叶子节点记录需要额外13字节的开销。

因为启用InsertBuffer索引后， 辅助索引页(space，page_no)中的记录可能被插入到Insert Buffer B+树中， 所以为了保证每次Merge Insert Buffer页必须成功，还需要有一个特殊的页用来标记每个辅助索引页(space，page_no)的可用空间。这个页的类型为Insert Buffer Bitmap。

每个Insert Buffer Bitmap页用来追踪16384个辅助索引页，也就是256个区(Extent) 。

每个Insert Buffer Bitmap页都在16384个页的第二个页中。

关于Insert BufferBitmap页的作用会在下一小节中详细介绍。

每个辅助索引页在InsertBufferBitmap页中占用4位(bit)， 由表2-3中的三个部分组成。

![2-3](https://images.gitee.com/uploads/images/2020/1108/192117_aa6bf103_508704.png)

## 4. Merge Insert Buffer

通过前面的小节读者应该已经知道了Insert/ChangeBuffer是一棵B+树。

若需要实现插入记录的辅助索引页不在缓冲池中，那么需要将辅助索引记录首先插入到这棵B+树中。

但是InsertBuffer中的记录何时合并(merge) 到真正的辅助索引中呢?

概括地说，MergeInsertBuffer的操作可能发生在以下几种情况下：

（1）辅助索引页被读取到缓冲池时；

（2）Insert Buffer Bitmap页追踪到该辅助索引页已无可用空间时；

（3）Master Thread。

第一种情况为当辅助索引页被读取到缓冲池中时，例如这在执行正常的SELECT查询操作，这时需要检查Insert Buffer Bitmap页，然后确认该辅助索引页是否有记录存放于InsertBufferB+树中。

若有，则将Insert Buffer B+树中该页的记录插入到该辅助索引页中。

可以看到对该页多次的记录操作通过一次操作合并到了原有的辅助索引页中，因此性能会有大幅提高。

Insert Buffer Bitmap页用来追踪每个辅助索引页的可用空间， 并至少有1/32页的空间。

若插入辅助索引记录时检测到插入记录后可用空间会小于1/32页，则会强制进行一个合并操作，即强制读取辅助索引页，将Insert Buffer B+树中该页的记录及待插入的记录插入到辅助索引页中。这就是上述所说的第二种情况。

还有一种情况，之前在分析Master Thread时曾讲到，在MasterThread线程中每秒或每10秒会进行一次MergeInsertBuffer的操作，不同之处在于每次进行merge操作的页的数量不同。


在MastrThread中， 执行merge操作的不止是一个页， 而是根据srv_innodb_io_capactiy的百分比来决定真正要合并多少个辅助索引页。

但InnoDB存储引擎又是根据怎样的算法来得知需要合并的辅助索引页呢?

在InsertBufferB+树中， 辅助索引页根据(space，offset) 都已排序好， 故可以根据(space，offset)的排序顺序进行页的选择。

然而，对于InsertBuffer页的选择，InnoDB存储引擎并非采用这个方式，它**随机地选择** Insert Buffer B+树的一个页，读取该页中的space及之后所需要数量的页。

该算法在复杂情况下应有**更好的公平性**。

同时， 若进行merge时，要进行merge的表已经被删除，此时可以直接丢弃已经被 Insert/ChangeBuffer的数据记录。

# 两次写

## 为什么需要 doublewrite

如果说InsertBuffer带给InnoDB存储引擎的是性能上的提升， 那么doublewrite(两次写) 带给InnoDB存储引擎的是数据页的可靠性。

当发生数据库宕机时， 可能InnoDB存储引擎正在写入某个页到表中， 而这个页只写了一部分，比如16KB的页，只写了前4KB，之后就发生了宕机，这种情况被称为部分写失效(partialpagewrite)。

在InnoDB存储引擎未使用doublewrite技术前， 曾经出现过因为部分写失效而导致数据丢失的情况。

有经验的DBA也许会想，如果发生写失效，可以通过重做日志进行恢复。

这是一个办法。但是必须清楚地认识到，重做日志中记录的是对页的物理操作，如偏移量800，写'aaaa'记录。

如果这个页本身已经发生了损坏，再对其进行重做是没有意义的。


## 是什么？

这就是说，**在应用(apply) 重做日志前，用户需要一个页的副本，当写入失效发生时，先通过页的副本来还原该页，再进行重做，这就是doublewrite**。

在InnoDB存储引擎中 doublewrite 的体系架构如图2-5所示。

![体系架构](https://images.gitee.com/uploads/images/2020/1108/192935_9e47cdcc_508704.png)

doublewrite 由两部分组成，一部分是内存中的 doublewritebuffer，大小为2MB，另一部分是物理磁盘上共享表空间中连续的128个页， 即2个区(extent)， 大小同样为2MB。

在对缓冲池的脏页进行刷新时，并不直接写磁盘， 而是会通过memcpy函数将脏页先复制到内存中的doublewritebuffer，之后通过doublewritebuffer再分两次，每次1MB顺序地写入共享表空间的物理磁盘上，然后马上调用fsync函数，同步磁盘， 避免缓冲写带来的问题。

在这个过程中，因为doublewrite页是连续的，因此这个过程是顺序写，开销不大。

完成 doublewrite 写入之后，将 buffer 的内容写入到各个表文件中是分散的。


# 自适应哈希索引

哈希(hash) 是一种非常快的查找方法， 在一般情况下这种查找的时间复杂度为O(1)，即一般仅需要一次查找就能定位数据。

而B+树的查找次数，取决于B+树的高度，在生产环境中，B+树的高度一般为3~4层，故需要3~4次的查询。

InnoDB 存储引擎会监控对表上各索引页的查询。

如果观察到建立哈希索引可以带来速度提升 则建立哈希索引，称之为**自适应哈希索引(AdaptiveHashIndex，AHI)**。

AHI 是通过缓冲池的 B+ 树页构造而来，因此建立的速度很快，而且不需要对整张表构建哈希索引。

InnoDB存储引擎会自动根据访问的频率和模式来自动地为某些热点页建立哈希索引。

AHI有一个要求，即对这个页的**连续访问模式必须是一样的**。

例如对于(a，b) 这

样的联合索引页，其访问模式可以是以下情况：

```
WHERE a=xxx
WHERE a=xxx and b=xxx
```

访问模式一样指的是查询的条件一样，若交替进行上述两种查询， 那么 InonDB 存储引擎不会对该页构造AHI。

此外AHI还有如下的要求：

（1）以该模式访问了100次

（2）页通过该模式访问了N次，其中 `N=页中记录*1/16`

根据InnoDB存储引擎官方的文档显示， 启用AHI后，读取和写入速度可以提高2倍， 辅助索引的连接操作性能可以提高5倍。

毫无疑问，AHI是非常好的优化模式，其设计思想是数据库自优化的(self-tuning) ，即无需DBA对数据库进行人为调整。

通过命令 SHOW ENGINE INNODB STATUS 可以看到当前AHI的使用状况：

```
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
Hash table size 34679, node heap has 0 buffer(s)
0.00 hash searches/s, 0.00 non-hash searches/s
```

ps: 我这里没有使用，所以数据都是空的。

# 异步IO

为了提高磁盘操作性能， 当前的数据库系统都采用异步IO(AsynchronousIO，AIO)的方式来处理磁盘操作。

InnoDB存储引擎亦是如此。

AIO对应的是SyncIO，即每进行一次IO操作， 需要等待此次操作结束才能继续接下来的操作。

但是如果用户发出的是一条索引扫描的查询，那么这条SQL查询语句可能需要扫描多个索引页，也就是需要进行多次的IO操作。

在每扫描一个页并等待其完成后再进行下一次的扫描，这是没有必要的。

用户可以在发出一个IO请求后立即再发出另一个IO请求，当全部IO请求发送完毕后，等待所有IO操作的完成，这就是AIO。

AIO的另一个优势是可以进行 **IO Merge** 操作，也就是将多个IO合并为1个IO， 这样可以提高IOPS的性能。

两个优点：

（1）不阻塞用户 IO 操作

（2）多个操作可以执行 IO MERGE

例如用户需要访问页的(space，page_no) 为：(8，6)、(8，7)，(8，8)

每个页的大小为16KB， 那么同步IO需要进行3次IO操作。
    
而AIO会判断到这三个页是连续的(显然可以通过(space， page_no) 得知)。

因此AIO底层会发送一个IO请求，从(8，6)开始，读取48KB的页。

# 刷新邻接页

InnoDB存储引擎还提供了FlushNeighborPage(刷新邻接页)的特性。

其工作原理为：**当刷新一个脏页时，InnoDB存储引擎会检测该页所在区(extent)的所有页，如果是脏页，那么一起进行刷新**。

这样做的好处显而易见， 通过AIO可以将多个IO写人操作合并为一个IO操作，故该工作机制在传统机械磁盘下有着显著的优势。

但是需要考虑到下面两个问题：

- 是不是可能将不怎么脏的页进行了写人，而该页之后又会很快变成脏页?

- 固态硬盘有着较高的IOPS，是否还需要这个特性?

为此，InnoDB存储引擎从1.2.x版本开始提供了参数 `innodb_flush_neighbors`， 用来控制是否启用该特性。

对于传统机械硬盘建议启用该特性，而对于固态硬盘有着超高IOPS性能的磁盘，则建议将该参数设置为0， 即关闭此特性。

# 参考资料

《MySQL技术内幕 InnoDB存储引擎》

[mysql 的存储引擎介绍](https://www.cnblogs.com/andy6/p/5789248.html)

* any list
{:toc}
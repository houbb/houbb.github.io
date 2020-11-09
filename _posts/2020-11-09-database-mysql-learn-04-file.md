---
layout: post
title:  mysql（4）文件系统
date:  2020-10-17 16:15:55 +0800
categories: [Database]
tags: [database, mysql, sf]
published: true
---

# 二进制日志

二进制日志( binary log) 记录了对MySQL数据库执行更改的所有操作， 但是不包括SELECT和SHOW这类操作， 因为这类操作对数据本身并没有修改。

然而， 若操作本身并没有导致数据库发生变化，那么该操作可能也会写入二进制日志。


## 例子


例如：

```
mysql> insert into user (user_id, user_name, remark) values ('01', '01', ' ');
Query OK, 1 row affected (0.00 sec)

mysql> show master status \G
Empty set (0.00 sec)
```

竟然为空，优点尴尬。

如果用户想记录SELECT和SHOW操作， 那只能使用查询日志， 而不是二进制日志。

此外，二进制日志还包括了执行数据库更改操作的时间等其他额外信息。

## 作用

总的来说，二进制日志主要有以下几种作用。

- 恢复(recovery)：某些数据的恢复需要二进制日志， 例如，在一个数据库全备文件恢复后，用户可以通过二进制日志进行point-in-time的恢复。

- 复制(replication)：其原理与恢复类似，通过复制和执行二进制日志使一台远程的MySQL数据库(一般称为slave或standby) 与一台MySQL数据库(一般称为master或primary) 进行实时同步。

- 审计(audit)：用户可以通过二进制日志中的信息来进行审计， 判断是否有对数据库进行注入的攻击。

## 配置

在默认情况下，二进制日志并不是在每次写的时候同步到磁盘(用户可以理解为缓冲写)。

因此，当数据库所在操作系统发生宕机时，可能会有最后一部分数据没有写入二进制日志文件中，这会给恢复和复制带来问题。

参数 `sync_binlog=[N]` 表示每写缓冲多少次就同步到磁盘。

如果将N设为1， 即sync_binlog=1表示采用同步写磁盘的方式来写二进制日志，这时写操作不使用操作系统的缓冲来写二进制日志。

sync_binlog的默认值为0， 如果使用InnoDB存储引擎进行复制， 并且想得到最大的高可用性， 建议将该值设为ON。不过该值为ON时，确实会对数据库的IO系统带来一定的影响。

但是， 即使将sync_binlog设为1， 还是会有一种情况导致问题的发生。当使用InnoDB存储引擎时，在一个事务发出COMMIT动作之前， 由于sync_binlog为1，因此会将二进制日志立即写入磁盘。如果这时已经写入了二进制日志，但是提交还没有发生， 并且此时发生了宕机， 那么在MySQL数据库下次启动时， 由于COMMIT操作并没有发生，这个事务会被回滚掉。但是二进制日志已经记录了该事务信息，不能被回滚。这个问题可以通过将参数innodb_support_x a设为1来解决， 虽然innodb_support_xa与X A事务有关， 但它同时也确保了二进制日志和InnoDB存储引擎数据文件的同步。

参数binlog-do-db和binlog-ignore-db表示需要写入或忽略写入哪些库的日志。默认为空，表示需要同步所有库的日志到二进制日志。

如果当前数据库是复制中的slave角色， 则它不会将从master取得并执行的二进制日志写入自己的二进制日志文件中去。
    
如果需要写入，要设置log-slave- update。如果需要搭建master =>slave=> slave架构的复制， 则必须设置该参数。

binlog_format参数十分重要， 它影响了记录二进制日志的格式。在MySQL5.1版本之前， 没有这个参数。

所有二进制文件的格式都是基于SQL语句(statement) 级别的，因此基于这个格式的二进制日志文件的复制(Replication) 和Oracle的逻辑Standby有点相似。

同时， 对于复制是有一定要求的。如在主服务器运行rand、uuid等函数，又或者使用触发器等操作，这些都可能会导致主从服务器上表中数据的不一致(notsync) 。

另一个影响是， 会发现InnoDB存储引擎的默认事务隔离级别是REPEATABLEREAD。这其实也是因为二进制日志文件格式的关系， 如果使用READCOMMITTED的事务隔离级别(大多数数据库， 如Oracle ， Microsoft SQLServer数据库的默认隔离级别)， 会出现类似丢失更新的现象，从而出现主从数据库上的数据不一致。

### binlog_format 参数

MySQL 5.1开始引入了binlog_format参数，该参数可设的值有STATEMENT、ROW和MIXED。

(1) STATEMENT格式和之前的MySQL版本一样，二进制日志文件记录的是日志的逻辑SQL语句。

(2) 在ROW格式下，二进制日志记录的不再是简单的SQL语句了， 而是记录表的行更改情况。基于ROW格式的复制类似于Oracle的物理Standby (当然， 还是有些区别)。同时， 对上述提及的Statement格式下复制的问题予以解决。从MySQL 5.1版本开始， 如果设置了binlog_format为ROW，可以将InnoDB的事务隔离基本设为READCOMMITTED ， 以获得更好的并发性。

(3) 在MIXED格式下， MySQL默认采用STATEMENT格式进行二进制日志文件的记录， 但是在一些情况下会使用ROW格式，可能的情况有：

1) 表的存储引擎为NDB， 这时对表的DML操作都会以ROW格式记录。

2) 使用了UUID 0、USER 0、CURRENT_USER 0、FOUND_ROW SO、ROW_COUN TO等不确定函数。

3) 使用了INSERTDELAY语句。

4) 使用了用户定义函数(UDF)。

5) 使用了临时表(temporarytable)。

此外，binlog_format 参数还有对于存储引擎的限制， 如表3-1所示。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/225733_f7e73eb4_508704.png "屏幕截图.png")

### 查看

二进制文件，必须使用 mysql 的 binlog 查看工具进行查看。


# 重做日志文件

在默认情况下， 在InnoDB存储引擎的数据目录下会有两个名为ib_logfile 0和ib_logfilel的文件。

在MySQL官方手册中将其称为InnoDB存储引擎的日志文件， 不过更准确的定义应该是重做日志文件(redologfile) 。

为什么强调是重做日志文件呢?

因为重做日志文件对于InnoDB存储引擎至关重要， 它们记录了对于InnoDB存储引擎的事务日志。

当实例或介质失败(mediafailure) 时， 重做日志文件就能派上用场。

例如， 数据库由于所在主机掉电导致实例失败，InnoDB存储引擎会使用重做日志恢复到掉电前的时刻，以此来保证数据的完整性。

每个InnoDB存储引擎至少有1个重做日志文件组(group)， 每个文件组下至少有2个重做日志文件， 如默认的ib_logfile 0和ib_logfile l。

为了得到更高的可靠性， 用户可以设置多个的镜像日志组(mirroredloggroups)， 将不同的文件组放在不同的磁盘上，以此提高重做日志的高可用性。

在日志组中每个重做日志文件的大小一致，并以循环写入的方式运行。

InnoDB存储引擎先写重做日志文件1， 当达到文件的最后时， 会切换至重做日志文件2，再当重做日志文件2也被写满时，会再切换到重做日志文件1中。图3-2显示了一个拥有3个重做日志文件的重做日志文件组。

- 图 3-2 日志文件组



## 属性

下列参数影响着重做日志文件的属性：

- innodb_log_file_size

- innodb_log_files_in_group

- innodb_mirrored_log_groups

- innodb_log_group_home_dir 

参数innodb_log_file_size指定每个重做日志文件的大小。

在InnoDB 1.2.x版本之前，重做日志文件总的大小不得大于等于4GB，而1.2.x版本将该限制扩大为了512GB。

参数innodb_log_files_in_group指定了日志文件组中重做日志文件的数量， 默认为2。

参数innodb_mirrored_log_groups指定了日志镜像文件组的数量， 默认为1， 表示只有一个日志文件组，没有镜像。

若磁盘本身已经做了高可用的方案，如磁盘阵列，那么可以不开启重做日志镜像的功能。

最后， 参数innodb_log_group_home_dir指定了日志文件组所在路径， 默认为./， 表示在MySQL数据库的数据目录下。

以下显示了一个关于重做日志组的配置：

```
mysql> show variables like '%innodb%log%' \G;
*************************** 1. row ***************************
Variable_name: innodb_api_enable_binlog
        Value: OFF
*************************** 2. row ***************************
Variable_name: innodb_flush_log_at_timeout
        Value: 1
*************************** 3. row ***************************
Variable_name: innodb_flush_log_at_trx_commit
        Value: 1
*************************** 4. row ***************************
Variable_name: innodb_locks_unsafe_for_binlog
        Value: OFF
*************************** 5. row ***************************
Variable_name: innodb_log_buffer_size
        Value: 16777216
*************************** 6. row ***************************
Variable_name: innodb_log_checksums
        Value: ON
*************************** 7. row ***************************
Variable_name: innodb_log_compressed_pages
        Value: ON
*************************** 8. row ***************************
Variable_name: innodb_log_file_size
        Value: 50331648
*************************** 9. row ***************************
Variable_name: innodb_log_files_in_group
        Value: 2
*************************** 10. row ***************************
Variable_name: innodb_log_group_home_dir
        Value: .\
*************************** 11. row ***************************
Variable_name: innodb_log_write_ahead_size
        Value: 8192
*************************** 12. row ***************************
Variable_name: innodb_max_undo_log_size
        Value: 1073741824
*************************** 13. row ***************************
Variable_name: innodb_online_alter_log_max_size
        Value: 134217728
*************************** 14. row ***************************
Variable_name: innodb_undo_log_truncate
        Value: OFF
*************************** 15. row ***************************
Variable_name: innodb_undo_logs
        Value: 128
15 rows in set, 1 warning (0.01 sec)
```

## 都是记日志，和 binlog 有啥区别？

也许有人会问，既然同样是记录事务日志，和之前介绍的二进制日志有什么区别?

首先， 二进制日志会记录所有与MySQL数据库有关的日志记录， 包括InnoDB、MyISAM、Heap等其他存储引擎的日志。

而InnoDB存储引擎的重做日志只记录有关该存储引擎本身的事务。

其次， 记录的内容不同， 无论用户将二进制日志文件记录的格式设为STATEMENT还是ROW， 又或者是MIXED ， 其记录的都是关于一个事务的具体操作内容， 即该日志是逻辑日志。

而InnoDB存储引擎的重做日志文件记录的是关于每个页(Page) 的更改的物理情况。

此外，写入的时间也不同，二进制日志文件仅在事务提交前进行提交，即只写磁盘一次， 不论这时该事务多大。

而在事务进行的过程中， 却不断有重做日志条目(redoentry) 被写入到重做日志文件中。


## 日志格式

在InnoDB存储引擎中， 对于各种不同的操作有着不同的重做日志格式。

到InnoDB1.2.x版本为止，总共定义了51种重做日志类型。虽然各种重做日志的类型不同，但是它们有着基本的格式，表3-2显示了重做日志条目的结构：

- 表3-2重做日志条目结构

```
redo_log_type  | space  |  page_no  |  redo_log_body
```

从表 3-2 可以看到重做日志条目是由4个部分组成：

- redo_log_type占用1字节， 表示重做日志的类型

- space表示表空间的ID， 但采用压缩的方式， 因此占用的空间可能小于4字节

- page_no表示页的偏移量，同样采用压缩的方式

- redo_log_body表示每个重做日志的数据部分， 恢复时需要调用相应的函数进行解析

在第 2 章中已经提到，写入重做日志文件的操作不是直接写，而是先写入一个重做日志缓冲(redologbuffer) 中， 然后按照一定的条件顺序地写入日志文件。

图3-3 很好地诠释了重做日志的写入过程。

![输入图片说明](https://images.gitee.com/uploads/images/2020/1109/230639_3129879b_508704.png "屏幕截图.png")

从重做日志缓冲往磁盘写入时，是按512个字节，也就是一个扇区的大小进行写入。

因为扇区是写入的最小单位，因此可以保证写入必定是成功的。

因此在重做日志的写入过程中不需要有double write。

前面提到了从日志缓冲写入磁盘上的重做日志文件是按一定条件进行的，那这些条件有哪些呢?第2章分析了主线程(masterthread)， 知道在主线程中每秒会将重做日志缓冲写入磁盘的重做日志文件中，不论事务是否已经提交。

另一个触发写磁盘的过程是由参数innodb_flush_log_at_trx_commit控制， 表示在提交(commit) 操作时， 处理重做日志的方式。

### innodb_fush_log_at_trx_commit 参数

参数innodb_fush_log_at_trx_commit的有效值有0、1、2。

0代表当提交事务时，不将事务的重做日志写入磁盘上的日志文件，而是等待主线程每秒的刷新。

1和2不同的地方在于：1表示在执行commit时将重做日志缓冲同步写到磁盘， 即伴有fsync的调用。

2表示将重做日志异步写到磁盘，即写到文件系统的缓存中。因此不能完全保证在执行commit时肯定会写入重做日志文件， 只是有这个动作发生。

因此为了保证事务的ACID中的持久性， 必须将innodb_flush_log_at_trx_commit设置为1，也就是每当有事务提交时，就必须确保事务都已经写入重做日志文件。

那么当数据库因为意外发生宕机时，可以通过重做日志文件恢复，并保证可以恢复已经提交的事务。而将重做日志文件设置为0或2，都有可能发生恢复时部分事务的丢失。

不同之处在于， 设置为2时，当MySQL数据库发生宕机而操作系统及服务器并没有发生宕机时，由于此时未写入磁盘的事务日志保存在文件系统缓存中，当恢复时同样能保证数据不丢失。

# 小结

# 参考资料

《mysql 技术内幕》

* any list
{:toc}
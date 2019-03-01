---
layout: post
title: MySQL TokuDB
date:  2019-3-1 17:23:40 +0800
categories: [SQL]
tags: [sql, sh]
published: true
excerpt: MariaDB
---

# TokuDB

在MySQL最流行的支持全事务的引擎为INNODB。其特点是数据本身是用B-TREE来组织，数据本身即是庞大的根据主键聚簇的B-TREE索引。 

所以在这点上，写入速度就会有些降低，因为要每次写入要用一次IO来做索引树的重排。特别是当数据量本身比内存大很多的情况下，CPU本身被磁盘IO纠缠的做不了其他事情了。这时我们要考虑如何减少对磁盘的IO来排解CPU的处境，

常见的方法有：

把INNODB 个PAGE增大（默认16KB），但增大也就带来了一些缺陷。 比如，对磁盘进行CHECKPOINT的时间将延后。
把日志文件放到更快速的磁盘上，比如SSD。

TokuDB 是一个支持事务的“新”引擎，有着出色的数据压缩功能，由美国 TokuTek 公司（现在已经被 Percona 公司收购）研发。拥有出色的数据压缩功能，如果您的数据写多读少，而且数据量比较大，强烈建议您使用TokuDB，以节省空间成本，并大幅度降低存储使用量和IOPS开销，不过相应的会增加 CPU 的压力。

# TokuDB 的特性

## 1. 丰富的索引类型以及索引的快速创建

TokuDB 除了支持现有的索引类型外， 还增加了(第二)集合索引, 以满足多样性的覆盖索引的查询, 在快速创建索引方面提高了查询的效率

## 2. (第二)集合索引

也可以称作非主键的集合索引, 这类索引也包含了表中的所有列, 可以用于覆盖索引的查询需要, 比如以下示例, 在where 条件中直接命中 index_b 索引, 避免了从主键中再查找一次.

## 3. 索引在线创建(Hot Index Creation)

TokuDB 允许直接给表增加索引而不影响更新语句(insert, update 等)的执行。可以通过变量 tokudb_create_index_online 来控制是否开启该特性, 不过遗憾的是目前还只能通过 CREATE INDEX 语法实现在线创建, 不能通过 ALTER TABLE 实现. 这种方式比通常的创建方式慢了许多, 创建的过程可以通过 show processlist 查看。不过 tokudb 不支持在线删除索引, 删除索引的时候会对标加全局锁。

```
> SET tokudb_create_index_online=ON;
Query OK, 0 rows affected (0.00 sec)
 
> CREATE INDEX index ON table (field_name);
```

## 4. 在线更改列(Add, Delete, Expand, Rename)

TokuDB 可以在轻微阻塞更新或查询语句的情况下， 允许实现以下操作：

增加或删除表中的列

扩充字段: char, varchar, varbinary 和 int 类型的列

重命名列, 不支持字段类型: TIME, ENUM, BLOB, TINYBLOB, MEDIUMBLOB, LONGBLOB

这些操作通常是以表锁级别阻塞(几秒钟时间)其他查询的执行, 当表记录下次从磁盘加载到内存的时候, 系统就会随之对记录进行修改操作(add, delete 或 expand)， 如果是 rename 操作, 则会在几秒钟的停机时间内完成所有操作。

TokuDB的这些操作不同于 InnoDB, 对表进行更新后可以看到 rows affected 为 0, 即更改操作会放到后台执行。

比较快速的原因可能是由于 Fractal-tree 索引的特性, 将随机的 IO 操作替换为顺序 IO 操作， Fractal-tree的特性中， 会将这些操作广播到所有行, 不像 InnoDB, 需要 open table 并创建临时表来完成.

看看官方对该特性的一些指导说明:

所有的这些操作不是立即执行， 而是放到后台中由 Fractal Tree 完成, 操作包括主键和非主键索引。也可以手工强制执行这些操作, 使用 OPTIMIZE TABLE X 命令即可, TokuDB 从1.0 开始OPTIMIZE TABLE命令也支持在线完成, 但是不会重建索引
不要一次更新多列, 分开对每列进行操作
避免同时对一列进行 add, delete, expand 或 drop 操作
表锁的时间主要由缓存中的脏页(dirty page)决定, 脏页越多 flush 的时间就越长. 每做一次更新, MySQL 都会关闭一次表的连接以释放之前的资源
避免删除的列是索引的一部分, 这类操作会特别慢, 非要删除的话可以去掉索引和该列的关联再进行删除操作
扩充类的操作只支持 char, varchar, varbinary 和 int 类型的字段
一次只 rename 一列, 操作多列会降级为标准的 MySQL 行为, 语法中列的属性必须要指定上, 如下:
 
```
ALTER TABLE table
CHANGE column_old column_new
DATA_TYPE REQUIRED_NESS DEFAULT
```

rename 操作还不支持字段: TIME, ENUM, BLOB, TINYBLOB, MEDIUMBLOB, LONGBLOB.
不支持更新临时表;

## 5. 数据压缩

TokuDB中所有的压缩操作都在后台执行, 高级别的压缩会降低系统的性能, 有些场景下会需要高级别的压缩. 按照官方的建议: 6核数以下的机器建议标准压缩, 反之可以使用高级别的压缩。

每个表在 create table 或 alter table 的时候通过 ROW_FORMAT 来指定压缩的算法：

```
CREATE TABLE table (
column_a INT NOT NULL PRIMARY KEY,
column_b INT NOT NULL) ENGINE=TokuDB
ROW_FORMAT=row_format;
ROW_FORMAT默认由变量 tokudb_row_format 控制, 默认为 tokudb_zlib, 可以的值包括:
```

tokudb_zlib: 使用 zlib 库的压缩模式，提供了中等级别的压缩比和中等级别的CPU消耗。

tokudb_quicklz: 使用 quicklz 库的压缩模式， 提供了轻量级的压缩比和较低基本的CPU消耗。

tokudb_lzma: 使用lzma库压缩模式，提供了高压缩比和高CPU消耗。

tokudb_uncompressed: 不使用压缩模式。

## 6. Read free 复制特性

得益于 Fracal Tree 索引的特性, TokuDB 的 slave 端能够以低于读IO的消耗来应用 master 端的变化, 其主要依赖 Fractal Tree 索引的特性，可以在配置里启用特性

insert/delete/update操作部分可以直接插入到合适的 Fractal Tree 索引中, 避免 read-modify-write 行为的开销;

delete/update 操作可以忽略唯一性检查带来的 IO 方面的开销

不好的是, 如果启用了 Read Free Replication 功能, Server 端需要做如下设置:

master：复制格式必须为 ROW， 因为 tokudb 还没有实现对 auto-increment函数进行加锁处理, 所以多个并发的插入语句可能会引起不确定的 auto-increment值, 由此造成主从两边的数据不一致.

slave：开启 read-only; 关闭唯一性检查(set tokudb_rpl_unique_checks=0);关闭查找(read-modify-write)功能(set tokudb_rpl_lookup_rows=0);

slave 端的设置可以在一台或多台 slave 中设置：MySQL5.5 和 MariaDB5.5中只有定义了主键的表才能使用该功能, MySQL 5.6, Percona 5.6 和 MariaDB 10.X 没有此限制


## 7. 事务, ACID 和恢复

默认情况下, TokuDB 定期检查所有打开的表, 并记录 checkpoint 期间所有的更新, 所以在系统崩溃的时候, 可以恢复表到之前的状态(ACID-compliant), 所有的已提交的事务会更新到表里,未提交的事务则进行回滚. 默认的检查周期每60s一次, 是从当前检查点的开始时间到下次检查点的开始时间, 如果 checkpoint 需要更多的信息, 下次的checkpoint 检查会立即开始, 不过这和 log 文件的频繁刷新有关. 用户也可以在任何时候手工执行 flush logs 命令来引起一次 checkpoint 检查; 在数据库正常关闭的时候, 所有开启的事务都会被忽略.
管理日志的大小: TokuDB 一直保存最近的checkpoing到日志文件中, 当日志达到100M的时候, 会起一个新的日志文件; 每次checkpoint的时候, 日志中旧于当前检查点的都会被忽略, 如果检查的周期设置非常大, 日志的清理频率也会减少。 TokuDB也会为每个打开的事务维护回滚日志, 日志的大小和事务量有关， 被压缩保存到磁盘中, 当事务结束后，回滚日志会被相应清理.
恢复: TokuDB自动进行恢复操作, 在崩溃后使用日志和回滚日志进行恢复, 恢复时间由日志大小(包括未压缩的回滚日志)决定.
禁用写缓存: 如果要保证事务安全, 就得考虑到硬件方面的写缓存. TokuDB 在 MySQL 里也支持事务安全特性(transaction safe), 对系统而言, 数据库更新的数据不一样真的写到磁盘里, 而是缓存起来, 在系统崩溃的时候还是会出现丢数据的现象, 比如TokuDB不能保证挂载的NFS卷可以正常恢复, 所以如果要保证安全,最好关闭写缓存, 但是可能会造成性能的降低.通常情况下需要关闭磁盘的写缓存, 不过考虑到性能原因, XFS文件系统的缓存可以开启, 不过穿线错误”Disabling barriers”后，就需要关闭缓存. 一些场景下需要关闭文件系统(ext3)缓存, LVM, 软RAID 和带有 BBU(battery-backed-up) 特性的RAID卡

## 8. 过程追踪

TokuDB 提供了追踪长时间运行语句的机制. 对 LOAD DATA 命令来说，SHOW PROCESSLIST 可以显示过程信息, 第一个是类似 “Inserted about 1000000 rows” 的状态信息, 下一个是完成百分比的信息, 比如 “Loading of data about 45% done”; 增加索引的时候, SHOW PROCESSLIST 可以显示 CREATE INDEX 和 ALTER TABLE 的过程信息, 其会显示行数的估算值, 也会显示完成的百分比; SHOW PROCESSLIST 也会显示事务的执行情况, 比如 committing 或 aborting 状态.

## 9. 迁移到 TokuDB

可以使用传统的方式更改表的存储引擎, 比如 “ALTER TABLE … ENGINE = TokuDB” 或 mysqldump 导出再倒入, INTO OUTFILE 和 LOAD DATA INFILE 的方式也可以。

## 10. 热备

Percona Xtrabackup 还未支持 TokuDB 的热备功能, percona 也为表示有支持的打算 http://www.percona.com/blog/2014/07/15/tokudb-tips-mysql-backups/ ;对于大表可以使用 LVM 特性进行备份, https://launchpad.net/mylvmbackup , 或 mysdumper 进行备份。TokuDB 官方提供了一个热备插件 tokudb_backup.so, 可以进行在线备份, 详见 https://github.com/Tokutek/tokudb-backup-plugin， 不过其依赖 backup-enterprise, 无法编译出 so 动态库, 是个商业的收费版本, 见 https://www.percona.com/doc/percona-server/5.6/tokudb/tokudb_installation.html

# 总结

## TokuDB的优点:

高压缩比，默认使用zlib进行压缩，尤其是对字符串(varchar,text等)类型有非常高的压缩比，比较适合存储日志、原始数据等。官方宣称可以达到1：12。
在线添加索引，不影响读写操作
HCADER 特性，支持在线字段增加、删除、扩展、重命名操作，（瞬间或秒级完成）
支持完整的ACID特性和事务机制
非常快的写入性能， Fractal-tree在事务实现上有优势,无undo log，官方称至少比innodb高9倍。
支持show processlist 进度查看
数据量可以扩展到几个TB；
不会产生索引碎片；
支持hot column addition,hot indexing,mvcc

## TokuDB缺点：

不支持外键(foreign key)功能，如果您的表有外键，切换到 TokuDB引擎后，此约束将被忽略。
TokuDB 不适大量读取的场景，因为压缩解压缩的原因。CPU占用会高2-3倍，但由于压缩后空间小，IO开销低，平均响应时间大概是2倍左右。
online ddl 对text,blob等类型的字段不适用
没有完善的热备工具，只能通过mysqldump进行逻辑备份
适用场景：

访问频率不高的数据或历史数据归档
数据表非常大并且时不时还需要进行DDL操作


# 参考资料 

https://mariadb.org/about/

[为什么MariaDB更优于MySQL](https://cloud.tencent.com/developer/article/1140522)

[MySQL 高性能存储引擎：TokuDB初探](https://www.cnblogs.com/duanxz/p/3514739.html)

* any list
{:toc}
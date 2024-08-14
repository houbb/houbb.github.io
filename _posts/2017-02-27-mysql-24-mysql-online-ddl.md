---
layout: post
title:  MySQL-24-mysql online DDL
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

有一张大表，发现加索引直接导致超时，如何通过 mysql online DDL 尽可能降低风险？

我们要理解这个方案的优缺点。

# MySQL ONLINE DDL 操作

MySQL 的 DDL 包含了 copy 和 inplace 方式，对于不支持 online 的 ddl 操作采用 copy 方式。

对于 inplace 方式，mysql 内部以“是否修改记录格式”为基准也分为两类：一类需要重建表(重新组织记录)，比如 optimize table 、添加索引、添加/删除列、修改列 NULL / NOT NULL 属性等；

另外一类是只需要修改表的元数据，比如删除索引、修改列名、修改列默认值、修改列自增值等。

Mysql 将这两类方式分别称为 rebuild 方式和 no-rebuild 方式。

# 3.1 主要工作流程

MySQL ONLINE DDL 主要包括3个阶段：prepare阶段，ddl执行阶段，commit阶段。

rebuild方式和no-rebuild方式相比实质多了一个ddl执行阶段，prepare阶段和commit阶段类似。

下面看下三个阶段所做的工作：

## Prepare阶段

- 创建新的临时frm文件

- 持有EXCLUSIVE-MDL锁，禁止读写

- 根据alter类型，确定执行方式(copy,online-rebuild,online-norebuild)

- 更新数据字典的内存对象

- 分配row_log对象记录增量

- 生成新的临时ibd文件


## 2. DDL执行阶段

- 降级EXCLUSIVE-MDL锁，允许读写

- 扫描old_table的聚集索引每一条记录rec

- 遍历新表的聚集索引和二级索引，逐一处理

- 根据rec构造对应的索引项

- 将构造索引项插入sort_buffer块

- 将sort_buffer块插入新的索引

- 处理ddl执行过程中产生的增量(仅rebuild类型需要)

## 3. commit阶段

- 升级到EXCLUSIVE-MDL锁，禁止读写

- 重做最后row_log中最后一部分增量

- 更新innodb的数据字典表

- 提交事务(刷事务的redo日志)

- 修改统计信息

- rename临时idb文件，frm文件

- 变更完成

# 3.2 使用限制和风险

## 3.2.1 使用限制

MySQL ONLINE DDL 是在mysql 5.6开始提供的功能，并且不是所有的DDL都是在线的。

具体哪些操作支持ONLINE DDL 请参阅官方文档的Online DDL Operations相关章节，这里不再赘述。（官方文档链接见文末注释2 ）

## 3.2.2 使用风险

由于 MySQL 的 DDL 操作无法限制同步数据的速度，所以对于较大表的操作会造成主从同步的严重延迟，和数据库的负载升高；
部分 DDL 会阻塞 DML 操作，导致对应操作堵塞；

DDL 操作期间会记录临时日志，该日志文件存储在 DDL 操作期间在表上的插入、更新或删除的数据。临时日志文件在需要时根据 innodb_sort_buffer_size 的值进行扩展，直到扩展到innodb_online_alter_log_max_size 指定的值大小。如果临时日志文件超过大小上限，则 ALTER TABLE 操作将失败，并且所有未提交的并发 DML 操作都将回滚；

DDL 操作无法直接监控数据库的负载，并且回滚DDL操作的代价更高，所以对于大表的 DDL 操作若不是采用 no-rebuild 方式，不建议直接操作；

若 DDL 操作需要很长时间，并且并发 DML 对表的修改量很大，以至于临时在线日志的大小超过了 innodb_online_alter_log_max_size 配置选项的值， 这种情况会导致 DB_ONLINE_LOG_TOO_BIG 错误，导致操作失败。未提交的并发DML操作将回滚。较大的innodb_online_alter_log_max_size设置允许在线DDL操作期间使用更多的 DML ，但也会延长锁定表以应用日志DML时DDL操作结束的时间；若是使用 pt-osc 或者 gh-ost 是不需要记录这种日志的，所以不会存在这种风险；

某些并发 DML 对原始表是允许更改的，但新表上可能不允许。而且这种操作仅在最后阶段发现失败。例如，可能会在创建唯一索引时将重复值插入到列中，或者可能会在列上创建主键索引时将 NULL 值插入到列中， 这些 DML 在原始表上能执行成功，但是在 DDL 应用日志阶段无法应用这些变更，这会导致 DDL 回滚。这种情况若是使用 pt-osc 或者 gh-ost 可能更早的发现问题，因为发生在原表的 DML 操作，会及时的在影子表上回放，若出现错误会立刻停止，不至于到最后阶段才发现；

DDL 操作在集群中的从节点回放时，不能和其他的 DDL 和 DML 并行回放，也就是说此时并行复制失效的。而 DDL 操作一般耗时都比较久，这时就会导致集群节点不一致，对于 PXC 或者 MGR 集群严重的可能会导致流控，影响线上服务。


# chat

## 详细介绍一下 mysql ddl ONLINE

MySQL 中的 DDL（数据定义语言）操作通常会对表结构进行修改，比如添加或删除列、修改列类型、创建或删除索引等。传统的 DDL 操作通常是阻塞性的，即在操作执行期间，表会被锁定，无法进行读写操作。这对于高并发的生产环境来说，可能会导致长时间的停机和性能问题。

为了缓解这一问题，MySQL 引入了 **Online DDL** 功能，使得某些 DDL 操作可以在不阻塞读写的情况下在线进行。以下是 MySQL Online DDL 的详细介绍：

### 1. Online DDL 概念
Online DDL 允许在不锁表的情况下执行 DDL 操作，或仅在短时间内锁定表。这样，表仍然可以处理并发的读写请求，从而减少了对应用程序的影响。

### 2. 支持的 MySQL 版本
MySQL 从 5.6 开始支持 Online DDL，InnoDB 存储引擎提供了较为全面的 Online DDL 功能。后续版本如 MySQL 5.7、8.0 对 Online DDL 的支持更加完善，并增加了更多的优化。

### 3. Online DDL 的三种执行方式
在 MySQL 中，Online DDL 操作可以通过以下三种方式执行：

- **INPLACE 模式**：在不创建临时表的情况下直接修改表结构。这是最优的模式，因为它对应用的影响最小。通常情况下，INPLACE 操作不会阻塞表的读写操作，但有时可能需要短暂的写锁。

- **COPY 模式**：通过创建表的副本来执行 DDL 操作。这个模式下，MySQL 会创建一个新的表并将旧表的数据复制到新表。整个复制过程可能会影响性能，且在数据复制过程中，表的写操作会被阻塞。

- **ALGORITHM 选项**：用户可以通过 `ALGORITHM` 选项指定 DDL 操作的模式，如 `ALGORITHM=INPLACE` 或 `ALGORITHM=COPY`。如果 MySQL 无法使用指定的算法，操作将失败并返回错误。

### 4. 常见的 Online DDL 操作
以下是一些常见的 Online DDL 操作及其特性：

- **添加列**：支持 INPLACE 模式，不阻塞读写。
- **删除列**：支持 INPLACE 模式，通常不会阻塞读写。
- **修改列类型**：在某些情况下支持 INPLACE 模式，但可能需要短暂的写锁。
- **添加/删除索引**：支持 INPLACE 模式，不会阻塞读操作，但可能需要短暂的写锁。
- **重命名列**：支持 INPLACE 模式，不会阻塞读写。

### 5. 使用示例
```sql
ALTER TABLE my_table ADD COLUMN new_column INT, ALGORITHM=INPLACE;
```
以上命令通过 INPLACE 模式添加一列 `new_column`，并且在操作期间不阻塞表的读写。

### 6. Online DDL 的优点
- **最小化停机时间**：因为大多数操作不会阻塞表的读写，应用程序的停机时间显著减少。
- **提高并发性**：即使在执行 DDL 操作时，表仍然可以接受读写请求，保证了系统的高并发性。
- **可预测的性能**：由于减少了表锁，系统性能的波动也相对较小。

### 7. Online DDL 的局限性
- **不支持所有操作**：并不是所有的 DDL 操作都能使用 INPLACE 模式，一些复杂的表修改可能仍然需要 COPY 模式。
- **需要额外的存储空间**：某些情况下，INPLACE 操作仍然需要额外的磁盘空间来存储中间数据。
- **性能影响**：尽管 INPLACE 操作不会阻塞读写，但仍可能会对性能产生一定的影响，尤其是在处理大表时。

### 8. 注意事项
- 在执行 DDL 操作前，建议在测试环境中进行验证，确保操作不会对生产环境造成不可预见的影响。
- 对于大表或高并发环境，务必合理选择算法并在业务低峰期进行操作。

Online DDL 提供了一种更加灵活、低风险的方式来管理 MySQL 数据库表结构的变更，是生产环境中不可或缺的重要工具。

# 参考资料

https://www.cnblogs.com/TeyGao/p/9115610.html

* any list
{:toc}
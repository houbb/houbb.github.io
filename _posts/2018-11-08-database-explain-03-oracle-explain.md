---
layout: post
title: Oracle Explain Oracle 执行计划详解
date:  2018-11-8 18:55:36 +0800
categories: [SQL]
tags: [sql, oracle, TODO, sh]
published: true
---

# Oracle Explain

执行计划：一条查询语句在ORACLE中的执行过程或访问路径的描述。即就是对一个查询任务，做出一份怎样去完成任务的详细方案。

如果要分析某条SQL的性能问题，通常我们要先看SQL的执行计划，看看SQL的每一步执行是否存在问题。 

看懂执行计划也就成了SQL优化的先决条件。 

通过执行计划定位性能问题，定位后就通过建立索引、修改sql等解决问题。

# 执行计划的查看

## 设置 autotrace

| 序号 | 命令 | 解释 |
|:---|:---|:---|
| 1 | SET AUTOTRACE OFF | 此为默认值，即关闭Autotrace |
| 2 | SET AUTOTRACE ON EXPLAIN | 只显示执行计划 |
| 3 | SET AUTOTRACE ON STATISTICS | 只显示执行的统计信息 |
| 4 | SET AUTOTRACE ON | 包含2,3两项内容 |
| 5 | SET AUTOTRACE TRACEONLY | 与ON相似，但不显示语句的执行结果 |

### 实战测试

```sql
SET AUTOTRACE ON;
select * from user;
```

自测时候第一句会报错。。。

## 使用 SQL

在执行的sql前面加上 `EXPLAIN PLAN FOR`

```sql
SQL> EXPLAIN PLAN FOR SELECT * FROM USER;

已解释。

SQL> SELECT plan_table_output FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE'));

或者：

SQL> select * from table(dbms_xplan.display);
```


### 实战测试

- 脚本

```sql
EXPLAIN PLAN FOR
select *
from USER
where USER_NAME like '%123%';

SELECT plan_table_output FROM TABLE(DBMS_XPLAN.DISPLAY('PLAN_TABLE'));
```

- 执行计划结果

```
Plan hash value: 856850943
 
----------------------------------------------------------------------------------
| Id  | Operation         | Name         | Rows  | Bytes | Cost (%CPU)| Time     |
----------------------------------------------------------------------------------
|   0 | SELECT STATEMENT  |              |     3 |   216 |    18   (0)| 00:00:01 |
|*  1 |  TABLE ACCESS FULL| USER         |     3 |   216 |    18   (0)| 00:00:01 |
----------------------------------------------------------------------------------
 
Predicate Information (identified by operation id):
---------------------------------------------------
 
   1 - filter("USER_NAME" LIKE '%123%' AND "USER_NAME" IS NOT NULL)
```

## 使用其他工具

常见的客户端工具如PL/SQL Developer，Navicat, Toad都支持查看解释计划。

# 读懂执行计划

## 执行顺序的原则

执行顺序的原则是：由上至下，从右向左。 

由上至下：在执行计划中一般含有多个节点，相同级别(或并列)的节点，靠上的优先执行，靠下的后执行 

从右向左：在某个节点下还存在多个子节点，先从最靠右的子节点开始执行。

一般按缩进长度来判断，缩进最大的最先执行，如果有2行缩进一样，那么就先执行上面的

## 执行计划中字段解释

ID: 一个序号，但不是执行的先后顺序。执行的先后根据缩进来判断。

Operation： 当前操作的内容。

Rows： 当前操作的Cardinality，Oracle估计当前操作的返回结果集。

Cost（CPU）：Oracle 计算出来的一个数值（代价），用于说明SQL执行的代价。

Time：Oracle 估计当前操作的时间。

在看执行计划的时候，除了看执行计划本身，还需要看谓词和统计信息。 通过整体信息来判断SQL效率。

## 谓词说明

### Access

通过某种方式定位了需要的数据，然后读取出这些结果集，叫做Access。

表示这个谓词条件的值将会影响数据的访问路劲（表还是索引）。

### Filter

把所有的数据都访问了，然后过滤掉不需要的数据，这种方式叫做filter。

表示谓词条件的值不会影响数据的访问路劲，只起过滤的作用。

在谓词中主要注意access，要考虑谓词的条件，使用的访问路径是否正确。

# Statistics(统计信息)说明

## 属性说明

- recursive calls

产生的递归sql调用的条数。

当执行一条SQL语句时，产生的对其他SQL语句的调用，这些额外的语句称之为''recursive calls''或''recursive SQL statements''. 我们做一条insert 时，没有足够的空间来保存row记录，Oracle 通过Recursive Call 来动态的分配空间。

- Db block gets:

从buffer cache中读取的block的数量

DB Block Gets:请求的数据块在buffer能满足的个数

当前模式块意思就是在操作中正好提取的块数目，而不是在一致性读的情况下而产生的块数。正常的情况下，一个查询提取的块是在查询开始的那个时间点上存在的数据块，当前块是在这个时刻存在的数据块，而不是在这个时间点之前或者之后的数据块数目。

- consistent gets

从buffer cache中读取的undo数据的block的数量   

(Consistent Gets: 数据请求总数在回滚段Buffer中的数据一致性读所需要的数据块)

这里的概念是在处理你这个操作的时候需要在一致性读状态上处理多少个块，这些块产生的主要原因是因为由于在你查询的过程中，由于其他会话对数据块进行操作，而对所要查询的块有了修改，但是由于我们的查询是在这些修改之前调用的，所以需要对回滚段中的数据块的前映像进行查询，以保证数据的一致性。这样就产 生了一致性读。

- physical reads

从磁盘读取的block的数量  

(Physical Reads:实例启动后，从磁盘读到Buffer Cache数据块数量)

就是从磁盘上读取数据块的数量，其产生的主要原因是：

（1） 在数据库高速缓存中不存在这些块

（2） 全表扫描

（3） 磁盘排序

它们三者之间的关系大致可概括为：

逻辑读指的是Oracle从内存读到的数据块数量。一般来说是'consistent gets' + 'db block gets'。当在内存中找不到所需的数据块的话就需要从磁盘中获取，于是就产生了'physical reads'。

Physical Reads通常是我们最关心的，如果这个值很高，说明要从磁盘请求大量的数据到Buffer Cache里，通常意味着系统里存在大量全表扫描的SQL语句，这会影响到数据库的性能，因此尽量避免语句做全表扫描，对于全表扫描的SQL语句，建议增 加相关的索引，优化SQL语句来解决。

关于physical reads ，db block gets 和consistent gets这三个参数之间有一个换算公式：

数据缓冲区的使用命中率=1 - ( physical reads / (db block gets + consistent gets) )。

用以下语句可以查看数据缓冲区的命中率：

```sql
SQL> SELECT name, value FROM v$sysstat WHERE name IN ('db block gets', 'consistent gets','physical reads');
```

查询出来的结果Buffer Cache的命中率应该在90％以上，否则需要增加数据缓冲区的大小。

清空Buffer Cache和数据字典缓存

```sql
SQL> alter system flush shared_pool;  //请勿随意在生产环境执行此语句  
 
System altered  
 
SQL> alter system flush buffer_cache;  //请勿随意在生产环境执行此语句  
 
System altered  

```

- redo size

DML生成的redo的大小   

- bytes sent via SQL*Net to client

数据库服务器通过SQL*Net向查询客户端发送的查询结果字节数

- bytes received via SQL*Net from client

通过SQL*Net接受的来自客户端的数据字节数

- SQL*Net roundtrips to/from client

服务器和客户端来回往返通信的Oracle Net messages条数

- sorts (memory)

在内存执行的排序量   

完全在内存中执行且不需要任何磁盘写入的排序操作的数量

您不能比内存排序做得更好，除非可能根本没有排序。排序通常由表连接SQL操作中的选择标准规范引起。

- sorts (disk)

在磁盘上执行的排序量

所有的sort都是优先在memory中做的，当要排序的内容太多，在sort area中放不下的时候，会需要临时表空间，产生sorts(disk)

- rows processed

处理的数据的行数

## 动态分析

动态统计量收集是Oracle CBO优化器的一种特性。优化器生成执行计划是依据成本cost公式计算出的，如果相关数据表没有收集过统计量，又要使用CBO的机制，就会引起动态采样。

动态采样（dynamic sampling）就是在生成执行计划是，以一个很小的采用率现进行统计量收集。由于采样率低，采样过程快但是不精确，而且采样结果不会进入到数据字典中。

如果在执行计划中有如下提示：

```
Note
-------------dynamic sampling used for the statement
```

这提示用户CBO当前使用的技术，需要用户在分析计划时考虑到这些因素。 当出现这个提示，说明当前表使用了动态采样。 我们从而推断这个表可没有做过分析。

这里会出现两种情况：

（1） 如果表没有做过分析，那么CBO可以通过动态采样的方式来获取分析数据，也可以或者正确的执行计划。

（2） 如果表分析过，但是分析信息过旧，这时CBO就不会在使用动态采样，而是使用这些旧的分析数据，从而可能导致错误的执行计划。

更多内容，参考 [为准确生成执行计划更新统计信息-analyze与dbms_stats](http://www.cnblogs.com/xqzt/p/4467702.html)

# JOIN 方式

[多表连接的三种方式详解 hash join、merge join、 nested loop](http://www.cnblogs.com/xqzt/p/4469673.html)

# 表访问方式

## 全表扫描（Full Table Scans）

[全表扫描（Full Table Scans, FTS）](http://www.cnblogs.com/xqzt/p/4464120.html)

## 通过ROWID访问表（table access by ROWID）

[通过ROWID访问表（table access by ROWID）](http://www.cnblogs.com/xqzt/p/4464205.html)

## 索引扫描

[索引范围扫描(INDEX RANGE SCAN)](http://www.cnblogs.com/xqzt/p/4464339.html)

[引唯一性扫描(INDEX UNIQUE SCAN)](http://www.cnblogs.com/xqzt/p/4464357.html)

[索引全扫描（INDEX FULL SCAN）](http://www.cnblogs.com/xqzt/p/4464486.html)

[索引快速扫描(index fast full scan)](http://www.cnblogs.com/xqzt/p/4467038.html)

[索引跳跃式扫描（INDEX SKIP SCAN）](http://www.cnblogs.com/xqzt/p/4467482.html)

# 参考资料

[Using EXPLAIN PLAN](https://docs.oracle.com/cd/B19306_01/server.102/b14211/ex_plan.htm#g42231)

[Oracle 执行计划（Explain Plan）](https://www.cnblogs.com/xqzt/p/4467867.html)

[Understanding Oracle Explain Plans](https://logicalread.com/understanding-oracle-explain-plans-h01/#.W-QWtpMzY2w)

* any list
{:toc}
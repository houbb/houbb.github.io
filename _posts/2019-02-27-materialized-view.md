---
layout: post
title: Oracle 物化视图
date:  2019-2-26 09:48:47 +0800
categories: [SQL]
tags: [sql, sh]
published: true
excerpt: Oracle 物化视图
---

# 物化视图

物化视图是包括一个查询结果的数据库对象，它是远程数据的的本地副本，或者用来生成基于数据表求和的汇总表。物化视图存储基于远程表的数据，也可以称为快照（类似于MSSQL Server中的snapshot，静态快照）。对于复制，物化视图允许你在本地维护远程数据的副本，这些副本是只读的。如果你想修改本地副本，必须用高级复制的功能。当你想从一个表或视图中抽取数据时，你可以用从物化视图中抽取。对于数据仓库，创建的物化视图通常情况下是聚合视图，单一表聚合视图和连接视图。（这个是基于本地的基表或者视图的聚合）。

物化视图，说白了，就是物理表，只不过这张表通过oracle的内部机制可以定期更新，将一些大的耗时的表连接用物化视图实现，会提高查询的效率。当然要打开查询重写选项；

# 区别

物化视图和视图类似，反映的是某个查询的结果，但是和视图仅保存SQL定义不同，物化视图本身会存储数据，因此是物化了的视图。

# 分类

## 用于数据复制的物化视图

物化视图的一个主要功能就是用于数据的复制，Oracle推出的高级复制功能分为两个部分，多主复制和物化视图复制。而物化视图复制就是利用了物化视图的功能。

物化视图复制包含只读物化视图复制、可更新物化视图复制和可写物化视图复制。

1、只读物化视图复制建立的是源数据库的只读环境。

2、可更新物化视图复制建立基于物化视图双向复制环境。

3、可写物化视图复制在物化视图建立的时候使用了FOR UPDATE，但是没有像可更新物化视图那样添加到物化视图组中，因此本地物化视图可以修改，但是修改无法发送到源数据库中，因为修改在物化视图刷新后会丢失，这种类型的物化视图复制很少使用。

## 用于预计算的物化视图

这种类型的物化视图一般用于数据仓库系统。主要用于预先计算并保存表连接或聚集等耗时较多的操作的结果，这样，在执行查询时，就可以避免进行这些耗时的操作，而从快速的得到结果。这种物化视图还经常使用查询重写（query rewrite）机制，这样不需要修改原有的查询语句，Oracle会自动选择合适的物化视图进行查询，完全对应用透明。

这种物化视图可以分为以下三种类型：包含聚集的物化视图；只包含连接的物化视图；嵌套物化视图。

三种物化视图的快速刷新的限制条件有很大区别，而对于其他方面则区别不大。

# 相关操作

## 创建

1、创建方式（Build Methods）：Build Immediate 和Build Deferred两种。Build Immediate 是在创建物化视图的时候就生成数据，而Build Deferred则在创建时不生成数据，以后根据需要再生成数据。默认为Build Immediate 。

2、查询重写（Query Rewrite）：Enable Query Rewrite和Disable Query Rewrite两种。分别指出创建的物化视图是否支持查询重写。查询重写是指当对物化视图的基表进行查询时，Oracle会自动判断能否通过查询物化视图来得到结果，如果可以，则避免了聚集或连接操作，而直接从已经计算好的物化视图中读取数据。默认为Disable Query Rewrite。

3、刷新（Refresh）：指当基表发生了DML操作后，物化视图何时采用哪种方式和基表进行同步。刷新的模式有两种：On Demand和On Commit。On Demand指物化视图在用户需要的时候进行刷新，可以手工通过DBMS_MVIEW.REFRESH等方法来进行刷新，也可以通过JOB定时进行刷新。On Commit指物化视图在对基表的DML操作提交的同时进行刷新。刷新的方法有四种：Fast 、Complete 、Force和Never。Fast 刷新采用增量刷新，只刷新自上次刷新以后进行的修改。Complete 刷新对整个物化视图进行完全的刷新。如果选择Force方式，则Oracle在刷新时会去判断是否可以进行快速刷新，如果可以则采用FAST方式，否则采用Complete 的方式。Never指物化视图不进行任何刷新。默认值是Force On Demand。

在建立物化视图的时候可以指定Order by 语句，使生成的数据按照一定的顺序进行保存。不过这个语句不会写入物化视图的定义中，而且对以后的刷新也无效。

4、物化视图日志：如果需要进行快速刷新，则需要建立物化视图日志。物化视图日志根据不同物化视图的快速刷新的需要，可以建立为RowID或Primary Key类型的。还可以选择是否包括Sequence、Including New Values以及指定列的列表。

可以指明On PreBuild Table语句将物化视图建立在一个已经存在的表上。这种情况下，物化视图和表必须同名。当删除物化视图时，不会删除同名的表。这种物化视图的查询重写要求参数Query_Rewrite_integerity必须设置为 trusted或者stale_tolerated。

5、物化视图可以进行分区。而且基于分区的物化视图可以支持分区变化跟踪（PCT）。具有这种特性的物化视图，当基表进行了分区维护操作后，仍然可以进行快速刷新操作。对于聚集物化视图，可以在Group by 列表中使用Cube或RollUp，来建立不同等级的聚集物化视图。

### 示例 1

```sql
create materialized view MV_ DOP_TEST
refresh force on demand
as
select dsso.dop_id,
soo.work_center_no,
soo.operation_description
视图刷新
视图刷新
from SHOP_ORDER_OPERATION SOO,
DOP_SUPPLY_SHOP_ORD DSSO
where soo.order_no=dsso.order_no
and soo.release_no=dsso.release_no
and soo.sequence_no=dsso.sequence_no;
---其中创建与删除物化视图与其表或视图DDL一样:
DROP materialized view log on materialized_view_log_name ;
创建物化视图时创建存储的日志空间（存储物化视图的对象的改变信息）
CREATE MATERIALIZED VIEW LOG ON Dop_Supply_Shop_Ord_Tab --(基表名)
tablespace ifsapp_DATA --日志保存在特定的表空间
WITH ROWID ;
drop materialized view MV_materialized_view_name ;
```

### 示例2

```sql
create materialized view MV_DOP_TEST
TABLESPACE ifsapp_DATA --保存表空间
BUILD DEFERRED --延迟刷新不立即刷新,此建立初始视图一般没数据
refresh force --如果可以快速刷新则进行快速刷新，否则完全刷新
with rowid --根据rowid刷新（默认是主键）
On demand --按照指定方式刷新
start with to_date('2008-12-11 13:20:51','YYYY-MM-DD HH24:MI:SS') next sysdate+1/48
as
select dsso.dop_id,
soo.work_center_no,
soo.operation_description
from SHOP_ORDER_OPERATION SOO,
DOP_SUPPLY_SHOP_ORD DSSO
where soo.order_no=dsso.order_no
and soo.release_no=dsso.release_no
and soo.sequence_no=dsso.sequence_no
```

## 删除

删除物化视图有两种顺序，一是先删除物化视图再删除日志；二是先删除日志再删除物化视图。

如果原数据表只被一个物化视图引用，那么可以采用先删除日志，再删除物化视图，这样删除的速度较快。

```sql
drop materialized view log on test_table;
drop materialized view mv_test_table;
```

如果日志上建立了多个物化视图，那么致删除物化视图即可，因为删除日志后，其他引用该日志的物化视图将无法刷新。

# 参考资料 

https://baike.baidu.com/item/%E7%89%A9%E5%8C%96%E8%A7%86%E5%9B%BE/7576908?fr=aladdin


* any list
{:toc}
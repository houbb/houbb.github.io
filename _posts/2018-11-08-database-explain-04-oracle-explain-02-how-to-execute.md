---
layout: post
title: Oracle Explain-02-查看 oracle 执行计划的几种方式
date:  2018-11-8 18:55:36 +0800
categories: [SQL]
tags: [sql, oracle, sh]
published: true
---

# 如何查看

六种执行计划

（1）explain plan for

（2）set autotrace on

（3）statistics_level=all

（4）dbms_xplan.display_cursor获取

（5）事件10046 trace跟踪

（6）awrsqrpt.sql

这 6 种方法，侧重点各不相同。

# explain plan for

## 测试表

```sql
create table AAA
(
    ID1 NUMBER,
    AMT NUMBER
)
```

## 执行语句

```sql
explain plan for select * from AAA where ID1=1;
select * from table(dbms_xplan.display());
```

结果如下：

```
'Plan hash value: 864433273'
' '
'--------------------------------------------------------------------------'
'| Id  | Operation         | Name | Rows  | Bytes | Cost (%CPU)| Time     |'
'--------------------------------------------------------------------------'
'|   0 | SELECT STATEMENT  |      |     1 |     5 |    11  (37)| 00:00:01 |'
'|*  1 |  TABLE ACCESS FULL| AAA  |     1 |     5 |    11  (37)| 00:00:01 |'
'--------------------------------------------------------------------------'
' '
'Predicate Information (identified by operation id):'
'---------------------------------------------------'
' '
'   1 - filter("ID1"=1)'
```

## 优缺点

优点：无需真正执行，快捷方便；

缺点：

1. 没有输出相关统计信息，例如产生了多少逻辑读，多少次物理读，多少次递归调用的情况；

2. 无法判断处理了多少行；

3. 无法判断表执行了多少次

# set autotrace on

## 命令

| 命令 	  |             作用 |
|:----|:----|
| SET AUTOT[RACE] OFF	         | 停止AutoTrace |
| SET AUTOT[RACE] ON	         | 开启AutoTrace，显示AUTOTRACE信息和SQL执行结果 |
| SET AUTOT[RACE] TRACEONLY	   | 开启AutoTrace，仅显示AUTOTRACE信息 |
| SET AUTOT[RACE] ON EXPLAIN	   | 开启AutoTrace，仅显示AUTOTRACE的EXPLAIN信息 |
| SET AUTOT[RACE] ON STATISTICS	| 开启AutoTrace，仅显示AUTOTRACE的STATISTICS信息 |

## 执行

```sql
set autotrace on;
```

这里执行使用的是 dataGrip，发现是会报错的。

查了下说是需要使用 oracle 的 sqlplus 才能执行。

这个后期有时间执行一下，暂时选取一个例子。

## 执行结果例子

### 执行语句

```sql
SQL> set autotrace on
SQL> select * from employees,jobs where employees.job_id=jobs.job_id and employees.department_id=50;
```

输出信息：

```
执行计划
----------------------------------------------------------
Plan hash value: 303035560

------------------------------------------------------------------------------------------
| Id  | Operation                    | Name      | Rows  | Bytes | Cost (%CPU)| Time     |
------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT             |           |    45 |  4590 |     6  (17)| 00:00:01 |
|   1 |  MERGE JOIN                  |           |    45 |  4590 |     6  (17)| 00:00:01 |
|   2 |   TABLE ACCESS BY INDEX ROWID| JOBS      |    19 |   627 |     2   (0)| 00:00:01 |
|   3 |    INDEX FULL SCAN           | JOB_ID_PK |    19 |       |     1   (0)| 00:00:01 |
|*  4 |   SORT JOIN                  |           |    45 |  3105 |     4  (25)| 00:00:01 |
|*  5 |    TABLE ACCESS FULL         | EMPLOYEES |    45 |  3105 |     3   (0)| 00:00:01 |
------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   4 - access("EMPLOYEES"."JOB_ID"="JOBS"."JOB_ID")
       filter("EMPLOYEES"."JOB_ID"="JOBS"."JOB_ID")
   5 - filter("EMPLOYEES"."DEPARTMENT_ID"=50)

统计信息
----------------------------------------------------------
          0  recursive calls
          0  db block gets
         13  consistent gets
          0  physical reads
          0  redo size
       5040  bytes sent via SQL*Net to client
        433  bytes received via SQL*Net from client
          4  SQL*Net roundtrips to/from client
          1  sorts (memory)
          0  sorts (disk)
         45  rows processed
```

## 常用列解释

### 执行计划

| 序号 | 列名 | 解释 |
|:---|:---|:---|
| 1 | ID_PLUS_EXP           | 每一步骤的行号 |
| 2 | PARENT_ID_PLUS_EXP    | 每一步的Parent的级别号 |
| 3 | PLAN_PLUS_EXP         | 实际的每步 |
| 4 | OBJECT_NODE_PLUS_EXP  | Dblink或并行查询时才会用到 |

### 统计信息常用列

| 序号 | 列名 | 解释 |
|:---|:---|:---|
| 1 | db block gets   | 从buffer cache中读取的block的数量 |
| 2 | consistent gets | 从buffer cache中读取的undo数据的block的数量 |
| 3 | physical reads  | 从磁盘读取的block的数量 |
| 4 | redo size       | DML生成的redo的大小 |
| 5 | sorts (memory)  | 在内存执行的排序量 |
| 7 | sorts (disk)    | 在磁盘上执行的排序量 |


## 优缺点

优点：

1.可以输出运行时的相关统计信息（产生多少逻辑读、多少次递归调用、多少次物理读等）；

2.虽然要等语句执行完才能输出执行计划，但是可以有traceonly开关来控制返回结果不打屏输出；

缺点：

1.必须要等SQL语句执行完，才出结果；

2.无法看到表被访问了多少次；



# statistics_level=all

## 查询流程

```sql
ALTER SESSION SET STATISTICS_LEVEL=ALL;
select * from AAA where ID1=1;
select * from table(dbms_xplan.display_cursor(null,null,'allstats last'));
--select * from table(dbms_xplan.display_cursor(null,null,'advanced'));
```

注意掉的部分可以查看的信息更加详细。

## 实际验证

测试的时候账户权限不足，无法查看结果

```
User has no SELECT privilege on V$SESSION
```

暂时选取一个例子：

```sql
SQL> alter session set statistics_level=all;
SQL> select * from employees,jobs where employees.job_id=jobs.job_id and employees.department_id=50;
--输出结果
SQL> set linesize 1000
SQL> select * from table(dbms_xplan.display_cursor(null,null,'allstats last'));

PLAN_TABLE_OUTPUT
-----------------------------------------------------------------------------------------------------------------------------------
SQL_ID  d8jzhcdwmd9ut, child number 0
-------------------------------------
select * from employees,jobs where employees.job_id=jobs.job_id and
employees.department_id=50

Plan hash value: 303035560

----------------------------------------------------------------------------------------------------------------------------------------
| Id  | Operation                    | Name      | Starts | E-Rows | A-Rows |   A-Time   | Buffers | Reads  |  OMem |  1Mem | Used-Mem |
----------------------------------------------------------------------------------------------------------------------------------------
|   0 | SELECT STATEMENT             |           |      1 |        |     45 |00:00:00.01 |      13 |      8 |       |       |          |

PLAN_TABLE_OUTPUT
-------------------------------------------------------------------------------------------------------------------------------------
|   1 |  MERGE JOIN                  |           |      1 |     45 |     45 |00:00:00.01 |      13 |      8 |       |       |          |
|   2 |   TABLE ACCESS BY INDEX ROWID| JOBS      |      1 |     19 |     19 |00:00:00.01 |       6 |      2 |       |       |          |
|   3 |    INDEX FULL SCAN           | JOB_ID_PK |      1 |     19 |     19 |00:00:00.01 |       3 |      1 |       |       |          |
|*  4 |   SORT JOIN                  |           |     19 |     45 |     45 |00:00:00.01 |       7 |      6 |  6144 |  6144 | 6144  (0)|
|*  5 |    TABLE ACCESS FULL         | EMPLOYEES |      1 |     45 |     45 |00:00:00.01 |       7 |      6 |       |       |          |
----------------------------------------------------------------------------------------------------------------------------------------

Predicate Information (identified by operation id):
---------------------------------------------------

   4 - access("EMPLOYEES"."JOB_ID"="JOBS"."JOB_ID")

PLAN_TABLE_OUTPUT
-----------------------------------------------------------------------------------------------------------------------------
       filter("EMPLOYEES"."JOB_ID"="JOBS"."JOB_ID")
   5 - filter("EMPLOYEES"."DEPARTMENT_ID"=50)

已选择25行。
```

## 关键列说明

1.starts：SQL执行的次数；

2.E-Rows：执行计划预计返回的行数；

3.R-Rows：执行计划实际返回的行数；

4.A-Time：每一步执行的时间(HH:MM:SS.FF)，根据这一行可知SQL耗时在哪些地方；

5.Buffers：每一步实际执行的逻辑读或一致性读；

6.Reads：物理读；

7.OMem：OMem为最优执行模式所需的内存评估值， 这个数据是由优化器统计数据以及前一次执行的性能数据估算得出的；

8.1Mem：1Mem为one-pass模式所需的内存评估值，当工作区大小无法满足操作所需的大小时，需要将部分数据写入临时磁盘空间中(如果仅需要写入一次就可以完成作，就称一次通过，One-Pass;否则为多次通过，Multi-Pass).该列数据为语句最后一次执行中，单次写磁盘所需要的内存大小，这个由优化器统计数据以及前一次行的性能数据估算得出的

9.Used_Mem：Used-Mem则为当前操作实际执行时消耗的内存，括号里面为(发生磁盘交换的次数,1次即为One-Pass,大于1次则为Multi_Pass,如果没有使用磁盘，则显示0)

## 优缺点

优点：

1.可以清晰的从starts得出表被访问多少次；

2.可以从E-Rows和A-Rows得到预测的行数和真实的行数，从而可以准确判断Oracle评估是否准确；

3.虽然没有准确的输出运行时的相关统计信息，但是执行计划中的Buffers就是真实的逻辑读的数值；

缺点：

1.必须要等执行完后才能输出结果；

2.无法控制结果打屏输出，不像autotrace可以设置traceonly保证不输出结果；

3.看不出递归调用，看不出物理读的数值

# dbms_xplan.display_cursor 获取

## 执行流程

步骤 1：

```sql
select * from table( dbms_xplan.display_cursor('&sql_id'));
```

--该方法是从共享池得到，如果SQL已被age out出share pool，则查找不到

注释：

1. 还有1种方法，`select * from table( dbms_xplan.display_awr('&sql_id'));`  --该方法是从awr性能视图里面获取

2. 如果有多个执行计划，可用以下方法查出：

```sql
select * from table(dbms_xplan.display_cursor('&sql_id',0));
select * from table(dbms_xplan.display_cursor('&sql_id',1));
```

## 例子

```sql
SQL>  select * from table(dbms_xplan.display_cursor('5hkd01f03y43d'));

PLAN_TABLE_OUTPUT
--------------------------------------------------------------------------------
SQL_ID  5hkd01f03y43d, child number 0
-------------------------------------
select * from test where table_name = 'LOG$'
Plan hash value: 2408911181
--------------------------------------------------------------------------------
| Id  | Operation                   | Name       | Rows  | Bytes | Cost (%CPU)|
--------------------------------------------------------------------------------
|   0 | SELECT STATEMENT            |            |       |       |     2 (100)|
|   1 |  TABLE ACCESS BY INDEX ROWID| TEST       |     1 |   241 |     2   (0)|
|*  2 |   INDEX RANGE SCAN          | IDX_TEST_1 |     1 |       |     1   (0)|
--------------------------------------------------------------------------------
Predicate Information (identified by operation id):
---------------------------------------------------
   2 - access("TABLE_NAME"='LOG$')
19 rows selected
```

### 查看 sql_id

如何查看1个sql语句的sql_id，可直接查看v$sql

```sql
select * from v$sql where sql_text like '%LOG$%'
```

## 优缺点

优点：

1.知道sql_id即可得到执行计划，与explain plan for一样无需执行；
          
2.可得到真实的执行计划

缺点：

1.没有输出运行的统计相关信息；

2.无法判断处理了多少行；

3.无法判断表被访问了多少次；

# 事件10046 trace跟踪

## 步骤

步骤1：alter session set events '10046 trace name context forever,level 12';            --开启追踪

步骤2：执行sql语句；

步骤3：alter session set events '10046 trace name context off';                                 --关闭追踪

步骤4：select tracefile from v$process where addr=(select paddr from v$session where sid=(select sid from v$mystat where rownum<=1));       --找到跟踪后产生的文件

步骤5：tkprof trc文件     目标文件  sys=no sort=prsela,exeela,fchela                           --格式化命令

## 例子


TODO...

## 优缺点

### 优点

1.可以看出sql语句对应的等待事件；

2.如果函数中有sql调用，函数中有包含sql，将会被列出，无处遁形；

3.可以方便的看处理的行数，产生的逻辑物理读；

4.可以方便的看解析时间和执行时间；

5.可以跟踪整个程序包

### 缺点

1.步骤繁琐；

2.无法判断表被访问了多少次；

3.执行计划中的谓词部分不能清晰的展现出来

# awrsqrpt.sql

## 步骤

步骤1：@?/rdbms/admin/awrsqrpt.sql

步骤2：选择你要的断点（begin snap和end snap）

步骤3：输入要查看的sql_id

# 如何选择

选择时一般遵循以下规则：

1.如果sql执行很长时间才出结果或返回不了结果，用方法1：explain plan for

2.跟踪某条sql最简单的方法是方法1：explain plan for，其次是方法2：set autotrace on

3.如果相关查询某个sql多个执行计划的情况，只能用方法4：dbms_xplan.display_cursor或方法6：awrsqrpt.sql

4.如果sql中含有函数，函数中有含有sql，即存在多层调用，想准确分析只能用方法5：10046追踪

5.想法看到真实的执行计划，不能用方法1：explain plan for和方法2：set autotrace on

6.想要获取表被访问的次数，只能用方法3：statistics_level = all

# 拓展阅读

[Understanding Oracle Explain Plans](https://logicalread.com/understanding-oracle-explain-plans-h01/#.W-QWtpMzY2w)

[如何看懂ORACLE执行计划](https://www.cnblogs.com/cxxjohnson/p/6725967.html)

[在sqlplus中执行set autotrace on 报cannot set autotrace 错误解决方法](https://www.cnblogs.com/cangos/archive/2011/12/19/2293935.html)

[如何看懂Oracle执行计划](https://www.cnblogs.com/cxxjohnson/p/6725967.html)

* any list
{:toc}
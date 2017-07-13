---
layout: post
title:  SQL Server
date:  2017-04-04 22:43:56 +0800
categories: [SQL]
tags: [sql server]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---


# SQL Server

## 常用查询

- 所有数据库名称

```sql
SELECT Name FROM Master..SysDatabases ORDER BY Name
```

- 某库所有表名称

```sql
SELECT Name FROM SysObjects Where XType='U' ORDER BY Name
```

- 某库所有的视图

```sql
SELECT Name FROM sysobjects Where xtype='V' ORDER BY Name;
```

- 查询所有存储过程

```sql
select Name from sys.procedures ORDER BY Name;
```

## 常用操作

- 重置数据库表

```
truncate table ${tableName}
```

## 字段简介

主要字段：
 
1. Name：对象名
2. Object_id：对象标识号，在数据中是唯一的
3. Principal_id ：架构所有者ID
4. Parent_object_id：此对象所属对象的ID，0 = 不是子对象
5. Type：对象类型，常用的类型有, AF = 聚合函数 P = SQL 存储过程  V = 视图  TT = 表类型   U = 表（用户定义类型）
6. Type_desc：对象类型的说明
7. Create_date / Modify_date ：创建日期 / 修改日期
8. is_ms_shipped：是否为 内部 SQL Server 组建所创建的对象，常用来判断 是否是 系统内置或用户自定义 的对象

## 脏读

> [SQL Server with(nolock)详解](http://www.cnblogs.com/running-mydream/p/4059286.html)

> [SQL Server中的事务与锁](http://www.cnblogs.com/knowledgesea/p/3714417.html)

开启读取死锁演示：

1. 窗口一

```sql
BEGIN TRANSACTION
SELECT top 10 * from table with(xlock); 
```

2. 窗口二

```sql
 SELECT top 10 * from table
```

此时因为上一个查询拥有锁，且事务没有提交。这里就会一直卡住。无法查询到结果。[sqlserver withlock的使用](http://www.cnblogs.com/jskingli/archive/2008/07/23/1249340.html)

解决方式:

```sql
 SELECT top 10 * from table with(nolock)
```

## 查询结果当做表继续查询

- 表和数据

| traceId | count | name |
|:---|:---|:----|
| 001	| 1	| one |       
| 001	| 2	| two |      
| 002	| 2	| three |     
| 002	| 1	| four |

查询需求：

1. 将相同 traceId 下，最大 count 的数据查询出来。预期结果:

```
001 2 two
002 2 three
```

- 查询实现

```sql
select a.* from [test].[dbo].[temp] a, 
( SELECT [traceId], max([count]) AS [count] FROM [test].[dbo].[temp] GROUP BY (traceId) ) b
where a.traceId = b.traceId 
and a.[count] = b.[count];
```


# 数据库的复制

> [SQLServer：怎么复制一个已有的数据库成为另一个不同名字的数据库？](https://zhidao.baidu.com/question/71923759.html)

## 备份还原法

> [SQL server 2008数据库的备份与还原](http://www.cnblogs.com/zgqys1980/archive/2012/07/04/2576382.html)


- 备份

数据库右键-》任务-》备份

1） 注意点

备份时，首先将【目标】中的默认路径删除。点击【添加】，指定备份的路径。


- 还原

1. 数据库右键-》任务-》-》还原-》数据库

2. 【源设备】-》右边的省略号选择刚才的备份文件 



<label class="label label-danger">Error</label>

0. 因为数据库正在使用，所以无法获得对数据库的独占访问权

1) 右键数据库“Dsideal_school_db”，然后选择【属性】

2) 在出现的“数据库属性 — Dsideal_school_db ”对话框中，选择“选项”，在“其他选项”下的“状态”中找到“限制访问”。选择【SINGLE_USER】，点击【确定】按钮，


1. [介质集有2个介质簇,但只提供了1个。必须提供所有成员](http://www.cnblogs.com/yc-755909659/p/3725940.html)


2. [sql System.Data.SqlClient.SqlError: 无法覆盖文件 'C:\Program Files\Microsoft SQL Server\MSSQL\data\itsm_Data.MDF'。数据库 'my1' 正在使用该文件的解决方案](http://www.bubuko.com/infodetail-580829.html)


## 分离附加法

你可能会问。既然备份还原已经有了。为什么还有这个？
备份还原法比较安全，但是相对速度较慢。比如数据库有200G及其以上，可能要耗费较多的时间和空间。

> [分离附加](http://blog.csdn.net/ycl295644/article/details/48783525)

<label class="label label-info">Tips</label>

- 分离之后，在【附加】时可以指定附加成为目标数据库的名称。


> [显示只读的解决办法](http://www.cnblogs.com/xueyonglanguan/archive/2012/03/15/2397722.html)

使用sa登录SQL Server2008附加数据库，附加之后数据库为只读的，然后点数据库-->“属性”-->“选项”-->“状态”，发现“数据库为只读”这一项为True，改为false，
如果能够修改的话，那么恭喜你，你的人品不错哦！


## 导入导出法

这个使用起来也比较简单。

> [百度经验](http://jingyan.baidu.com/article/d169e186a6d024436611d826.html)


- 插入只读列报错 

> [无法在只读列XXX中插入数据](http://www.mzwu.com/article.asp?id=3619)

- 导入的时候指定查询条件

> [提供源查询（SQL Server 导入和导出向导）](https://msdn.microsoft.com/zh-cn/library/ms189024(v=sql.130))

1. 不支持多条语句同时执行。

2. 执行的时候不需要带数据库的名称。


## 表之间的复制

> [sql server单表导入、导出](http://zhanjianhua.iteye.com/blog/1011131)


- 跨数据的更新

如下两种方式都行，推荐第二种方式

1、两种嵌套

```sql
update [blog].[dbo].[user] set name=(
select [blog_dev].[dbo].[user].name FROM [blog_dev].[dbo].[user]
where [blog].[dbo].[user].id=[blog_dev].[dbo].[user].id );
```

2、条件或者外联也行

```sql
UPDATE b
SET b.name = a.name,
b.age = a.age
FROM [blog_dev].[dbo].[user] as a, [blog].[dbo].[user] as b 
WHERE a.id = b.id;
```


# SQL SERVER index

联合索引和MySQL不一样。**不会**自动为每一个字段都添加索引。

> [SQL联合索引 与 单一列的索引](http://blog.csdn.net/shellching/article/details/7655793)

联合索引使用结论:

1) 查询条件中出现联合索引第一列,或者全部,则能利用联合索引.

2) 条件列中只要条件相连在一起,以本文例子来说就是:

`last_name=’1′ and first_name=’1′`

与

`first_name=’1′ and last_name=’1′`

,无论前后,都会利用上联合索引.

3) 查询条件中**没有出现联合索引的第一列**,而出现联合索引的第二列,或者第三列,都**不会**利用联合索引查询.


单一列索引的应用结论:

1) 只要条件列中出现索引列,无论在什么位置,都能利用索引查询

两者的共同点:

1) 要想利用索引,都要符合SARG标准.

2) 都是为了提高查询速度.

3) 都需要额外的系统开销,磁盘空间.

补充说明: stmtText信息来产生,在查询语句前面加上:SET STATISTICS PROFILE on.可以通过运行它,来观察你的查询是否合理,这样才能真正做到优化.

本文主旨:讨论什么情况下能利用上索引.

索引:创建索引可以根据查询业务的不同分为两种:单一列的索引,联合索引. 顾名思义,单一列索引就是指在表的某一列上创建索引,联合索引是在多个列上联合创建索引.

优缺点比较:

1) 索引所占用空间:单一列索引相对要小.

2) 索引创建时间:单一列索引相对短.

3) 索引对insert,update,delete的影响程序:单一列索引要相对低.

4) 在**多条件查询时,联合索引效率要高**.

索引的使用范围: 单一列索引可以出现在 where 条件中的任何位置, 而联合索引需要按一定的顺序来写.



# 缺少结构

直接 【安全性】=》【架构】=》右键【新建架构】=》输入对应架构名称。所有者为dbo即可。


# Xml 

> [SQLServer 读取XML类型的节点数据](http://blog.csdn.net/kk185800961/article/details/42277035)


```sql
SELECT * FROM table_name
where MsgBody.exist('/Task/Parameters/key[@value="file_name"]')=1
```

xPath 语法。

* any list
{:toc}






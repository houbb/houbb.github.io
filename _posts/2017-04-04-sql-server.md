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


## 导入导出法

这个使用起来也比较简单。

> [百度经验](http://jingyan.baidu.com/article/d169e186a6d024436611d826.html)


- 插入只读列报错 

> [无法在只读列XXX中插入数据](http://www.mzwu.com/article.asp?id=3619)


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


## SQL SERVER

联合索引和MySQL不一样。**不会**自动为每一个字段都添加索引。


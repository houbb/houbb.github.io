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


## 表之间的复制

> [sql server单表导入、导出](http://zhanjianhua.iteye.com/blog/1011131)

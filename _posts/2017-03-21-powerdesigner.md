---
layout: post
title: PowerDesigner
date:  2017-03-21 19:45:00 +0800
categories: [SQL]
tags: [design, sql]
header-img: "static/app/res/img/kon-bg.jpeg"
published: true
---

# PowerDesigner

[PowerDesigner](http://powerdesigner.de/en/)  is the industry-leading business process / data modeling software and metadata management solution for data architecture, 
information architecture and enterprise architecture. 


# Install

> [blog zh_CN](http://www.cnblogs.com/huangcong/archive/2010/06/14/1757957.html)

> [系列教程](http://www.cnblogs.com/yxonline/archive/2007/04/09/705479.html)

本文将附带讲解 [CodeSmith](http://www.codesmithtools.com/)。

1. 去下载一个。请尽力请支持正版。

2. 普通的安装即可。


# Hello World
 
不同版本可能会有细微不同。此处测试版本为: 15.1 

一、Create Model
 
File -> Create Model -> Model Types -> Physical Data Model -> Physical Diagram 
 
1. 输入对应的 *Model Name*: 
 
2. DBMS属性设置为 *Microsoft SQL Server 2005* 或者其他对应的 数据库。

二、Create table

单击 【Palette】工具栏上 Table 图标，点击创建表格模板。

三、Edit table Name

重新选择【Palette】工具栏上 Pointer 图标, 对刚才创建的表格**双击**进入编辑模式。

默认为 General 导航页，设置Name(对应数据库表名)、Code。

四、Edit columns Info

点击 Columns 导航页, 可设置列属性。

![columns](https://raw.githubusercontent.com/houbb/resource/master/img/powerdesinger/2017-03-21-powerdesinger-columns.jpg)


五、Edit one column Detail

点击最左侧，选中当前列所在行。(会变黑)。点击上面左边第一个LOGO，Properties(Alt+Enter)。可对当前列进行详细编辑。


请依照此法，自行创建2张表。

六、Tables Reference

单击 【Palette】工具栏上 Reference 图标，从一张表出发，按住链接到另一张表。即可自动创建两张表之间的外键。

七、Generate SQL DDL

任意空白处右键，选择Properties。弹出内容如下

![columns](https://raw.githubusercontent.com/houbb/resource/master/img/powerdesinger/2017-03-21-powerdesinger-properties.jpg)


然后点击上方【Database】选择【Generate Database】，设置好文件输出路径和文件名称即可。

在【Preview】中，可以预览生成的脚本。

- 自测随便的数据结果：

```sql
/*==============================================================*/
/* Database name:  Database_1                                   */
/* DBMS name:      Sybase SQL Anywhere 11                       */
/* Created on:     2017/3/21 ÐÇÆÚ¶þ ÉÏÎç 8:45:57                     */
/*==============================================================*/


drop database Database_1;

/*==============================================================*/
/* Database: Database_1                                         */
/*==============================================================*/
create database 'Database_1.db';

/*==============================================================*/
/* Table: Book                                                  */
/*==============================================================*/
create table Book 
(
   UUID                 bigint                         not null,
   asdf                 varchar(32)                    null,
   UK                   varchar(32)                    null,
   name                 varchar(256)                   null
);

alter table Book
   add constraint PK_BOOK primary key clustered (UUID);

/*==============================================================*/
/* Table: Person                                                */
/*==============================================================*/
create table Person 
(
   UUID                 bigint                         not null,
   name                 varchar(20)                    null,
   sex                  bit                            null,
   UK                   varchar(32)                    null
);

alter table Person
   add constraint PK_PERSON primary key clustered (UUID);

alter table Book
   add constraint FK_BOOK_REFERENCE_PERSON foreign key (UUID)
      references Person (UUID)
      on update restrict
      on delete restrict;
      
comment on table Person is 
'ÓÃ»§»ùÀà';
```

<label class="label label-danger">中文乱码</label>

最后一行中文乱码。

解决方式：

1、 指定生成的文字编码。(中文默认应该是GBK2312，经测试UTF-8依然乱码)

![columns](https://raw.githubusercontent.com/houbb/resource/master/img/powerdesinger/2017-03-21-powerdesinger-gbk.png)

2、 数据库链接上指定编码

```
?useUnicode=true&characterEncoding=GB2312
```
 
<label class="label label-danger">生成的SQL带有collate_chinese_*</label>

collate 是排序之用。

1、方式一

直接使用Notepad++等工具全文替换，简单，但是治标不治本。

2、治本

> [blog zh_CN](http://www.cnblogs.com/lukun/archive/2013/04/20/3032881.html)

1.点击：工具栏-》database-》edit current DBMS

2.选择数据源(以SqlServer2005为例)

Microsoft SQLServer2005ScriptObjectsColumnAdd

修改为：

```
%20:COLUMN% [%COMPUTE%?AS (%COMPUTE%):[%.L:DATATYPE%=xml?xml[%XMLSchemaCollection%?([%ContentType% ]%XMLSchemaCollection.GeneratedName%):                 ]:%20:DATATYPE%][%ExtRowGuidCol%? RowGuidCol][%IDENTITY%? %IDENTITY%[[(%ExtIdentitySeedInc%)][%ExtIdtNotForReplication%? not for replication]]:[%ExtNullConstName%? constraint %ExtNullConstName%][ %NULL%][ %NOTNULL%]][[%ExtDeftConstName%? constraint %ExtDeftConstName%] default %DEFAULT%]  
   [%CONSTDEFN%]]  
```

修改的内容就是去掉:`[.Z:[ collate %ExtCollation%]`以及最后一个`]`


# 使用技巧

- 查看所有的列

有时候对所有的列同时编辑比较方便。选中一个模型右键-》【list of columns】即可。


- 报告

PD可以对当前文档输出对应的信息。

直接 【Reports】-》【Dictionary】-》【Title-模型物理对象】-》【Title-表集合】-》【Table - %item%】-》【Table Column - 列】

# 逆向工程

一个比较实用的功能。【File】-》【Reverse Engineer】-》【Database】

指定数据库。





# CodeSmith

[Codesmith](http://www.codesmithtools.com/) is the best developer tools to get your job done faster and avoid repetitive work.

当然这个是为 C# 准备的。如果是 Java 可以使用 Mybatis-Generator，或者直接写一些 freemarker 模板。

> [blog zh_CN](http://www.cnblogs.com/huangcong/archive/2010/06/14/1758201.html)






* any list
{:toc}










 
 






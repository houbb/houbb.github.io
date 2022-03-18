---
layout: post
title: 列式数据库-01-monetdb 入门概览
date: 2022-03-18 21:01:55 +0800 
categories: [Database]
tags: [database, monetdb, column-based-db, sh]
published: true
---

# MonetDB

您是否主要对使用 MonetDB 开发基于 SQL 的应用程序感兴趣？使用它的命令行界面还是开发 JDBC 和 ODBC 应用程序？本指南适合您！

MonetDB 用于许多现实生活中的应用程序设置。它起源于数据库研究界，越来越多地在商业企业中占有一席之地。 MonetDB 被选为使用最广泛的开源列存储；它易于设置、使用和管理。它可以在各种平台上运行。

MonetDB 是一个精心设计的生态系统，用于应对数据管理挑战。以下主题可帮助您快速入门并导航至感兴趣的领域。这些主题侧重于 SQL 语法和特性，因为它们有助于启动和运行应用程序。

开始使用一些基本信息来启动体验。

介绍 MonetDB 的一些关键特性、概念和历史观点。

开始编程数据库应用程序的客户端接口。

将数据加载到 MonetDB

批量数据摄取，例如CSV 文件通常是填充数据库进行分析的第一步。使用这些功能有助于快速达到分析数据以获得业务洞察力的目的。

SQL 参考手册，涵盖 SQL 语言功能。

我们假设用户具有 SQL 的基本知识。 SQL 参考手册包含 MonetDB 支持的 SQL 2008 语言功能的概要以及 SQL 标准的扩展。

基准测试，以获得对知名基准测试的性能印象。

参考课程视频的教程和视频。

博客存档，包含有关 MonetDB 的博客文章集合。

# 入门

您是否主要对使用 MonetDB 开发基于 SQL 的应用程序感兴趣；使用它的命令行界面还是开发 JDBC 和 ODBC 应用程序？

本指南适合您。您应该已经在您的机器上安装了 MonetDB 套件，或者依赖系统管理员预先安装。

MonetDB 是一个精心设计的生态系统，用于应对数据管理挑战。以下主题可帮助您快速入门并导航至感兴趣的领域。

## 在你开始之前

MonetDB 是一个可在许多平台上使用的开源软件包。 
只需下载其中一个预构建版本并开始您的旅程。 

首选平台是：

- Linux 风格

- macOS（64 位）

- Windows（64 位）

如果您打算使用图形 UI 来构建应用程序，例如使用 C、C++、C#、Python、Java、Javascript、Ruby、R、PHP、Ruby、Golang，然后应该安装适当的 API 库。 

在许多情况下，C、ODBC 和 JDBC 库就足够了。 

有关更多详细信息，请参阅编程 API 部分。 JDBC 驱动程序可从 Maven 中央存储库下载：https://clojars.org/monetdb/monetdb-jdbc

如果您找不到合适的预构建包，您可以随时从源代码下载和编译。

基于 JDBC 的图形工作台，例如 e.g. SQuirreL 是基于文本的界面的替代方案。


使用 MonetDB 的系统先决条件和要求。

## 检查设置

MonetDB 套件的安装包括一个教程数据库，涵盖了东印度贸易公司在几个世纪的贸易中的航行。 

要检查此演示是否已安装，请尝试：

```
mclient -d voc
```

为确保一切安装正确，请尝试这个简单的方法。

如果它以 SQl 提示回复，您就可以开始探索了。 否则，请按照教程安装教程数据库。

默认情况下，monetdb 服务器接受数据库管理员凭据名称/密码作为 monetdb/monetdb。 创建新数据库时应更改其密码。 您可以将名称/密码保存在主目录 ~/.monetdb 的文件中以简化连接。

```
cat $HOME/.monetdb
name=yourname
password=yourpassword
```

## 进一步阅读

手册指南根据主要用户角色和兴趣分为三个主要类别。用户指南主要面向对使用命令行界面或 GUI 工作台构建 SQL 应用程序或交互感兴趣的用户。管理员指南旨在让用户管理数据库资源，负责安装和关注资源使用情况。开发人员指南适用于对从源代码构建系统、夜间测试、内部结构或缺少功能和错误报告的交互感兴趣的用户。

这三个角色绝不是要将工作分给三个人。在大多数情况下，用户会根据需要随时间切换角色。

# windows10 安装实战笔记

## 下载安装包

[https://www.monetdb.org/easy-setup/](https://www.monetdb.org/easy-setup/) 选择 windows 安装包。

路径：https://www.monetdb.org/easy-setup/windows/

## 安装

安装目录：`C:\Program Files\MonetDB\MonetDB5`

```
bin/  etc/  lib/  license.rtf  M5server.bat  mclient.bat  msqldump.bat  MSQLserver.bat  share/
```

（1）运行 `M5server.bat` 启动服务端

启动日志：

```
# MonetDB 5 server v11.43.9 (Jan2022-SP1)
# Serving database 'demo', using 16 threads
# Compiled for amd64-pc-windows-msvc/64bit
# Found 15.929 GiB available main-memory of which we use 12.982 GiB
# Copyright (c) 1993 - July 2008 CWI.
# Copyright (c) August 2008 - 2022 MonetDB B.V., all rights reserved
# Visit https://www.monetdb.org/ for further information
# Listening for connection requests on mapi:monetdb://localhost:50000/
```

（2）运行 `mclient.bat` 启动客户端

使用以下凭据连接到数据库：

默认用户：monetdb

默认密码：monetdb

启动日志：

```
Welcome to mclient, the MonetDB/SQL interactive terminal (Jan2022-SP1)
Database: MonetDB v11.43.9 (Jan2022-SP1), 'demo'
FOLLOW US on https://twitter.com/MonetDB or https://github.com/MonetDB/MonetDB
Type \q to quit, \? for a list of available commands
auto commit mode: on

sql>
```

## hello world

```
sql>SELECT 'hello world';
+-------------+
| %2          |
+=============+
| hello world |
+-------------+
1 tuple
```

## 退出

```
sql> \q
```

# 建表

## 查看表

命令 `\d`  可以查看当前库的表，如果你现在啥都没干，应该会是空的。

## 创建表

所以我们现在先创建一个表。

```sql
START TRANSACTION;
 
CREATE TABLE "voyages" (
	"number"            integer,
	"number_sup"        char(1),
	"trip"              integer,
	"trip_sup"          char(1),
	"boatname"          varchar(50),
	"master"            varchar(50),
	"tonnage"           integer,
	"type_of_boat"      varchar(30),
	"built"             varchar(15),
	"bought"            varchar(15),
	"hired"             varchar(15),
	"yard"              char(1),
	"chamber"           char(1),
	"departure_date"    date,
	"departure_harbour" varchar(30),
	"cape_arrival"      date,
	"cape_departure"    date,
	"cape_call"         boolean,
	"arrival_date"      date,
	"arrival_harbour"   varchar(30),
	"next_voyage"       integer,
	"particulars"       varchar(1285)
);
COMMIT;
```

可以查看表：

```
sql>\d
TABLE  sys.voyages
```

## 插入数据

```sql
INSERT INTO "voyages" VALUES (1, '', 1, '', 'AMSTERDAM', 'Jan Jakobsz. Schellinger', 260, NULL, '1594', NULL, NULL, 'A', NULL, '1595-04-02', 'Texel', NULL, NULL, true, '1596-06-06', 'Engano', NULL, 'from 04-08 till 11-08 in the Mosselbaai; from 13-09 till 07-10 in the Ampalazabaai; from 09-10 till 13-12 in S. Augustins Bay, where before departure 127 of the 249 men were still alive; 11-01 till 21-01 at Ste. Marie I.; from 23-01 till 12-02 in the Bay of Antongil. The AMSTERDAM was set on fire near Bawean, 11-01-1597.');
```

## 查询

```sql
select * from voyages;
```

查询结果：

```
+--------+------------+------+----------+-----------+--------------------------+---------+--------------+-------+--------+-------+------+---------+----------------+-------------------+--------------+----------------+-----------+--------------+-----------------+-------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| number | number_sup | trip | trip_sup | boatname  | master                   | tonnage | type_of_boat | built | bought | hired | yard | chamber | departure_date | departure_harbour | cape_arrival | cape_departure | cape_call | arrival_date | arrival_harbour | next_voyage | particulars                                                                                                                                                                                                                                                                                                                        |
+========+============+======+==========+===========+==========================+=========+==============+=======+========+=======+======+=========+================+===================+==============+================+===========+==============+=================+=============+====================================================================================================================================================================================================================================================================================================================================+
|      1 |            |    1 |          | AMSTERDAM | Jan Jakobsz. Schellinger |     260 | null         | 1594  | null   | null  | A    | null    | 1595-04-02     | Texel             | null         | null           | true      | 1596-06-06   | Engano          |        null | from 04-08 till 11-08 in the Mosselbaai; from 13-09 till 07-10 in the Ampalazabaai; from 09-10 till 13-12 in S. Augustins Bay, where before departure 127 of the 249 men were still alive; 11-01 till 21-01 at Ste. Marie I.; from 23-01 till 12-02 in the Bay of Antongil. The AMSTERDAM was set on fire near Bawean, 11-01-1597. |
+--------+------------+------+----------+-----------+--------------------------+---------+--------------+-------+--------+-------+------+---------+----------------+-------------------+--------------+----------------+-----------+--------------+-----------------+-------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
```

# 项目配置

在补充一个，如果你是跟现成项目的话，表都有了，你想看看表：

项目中配置这么写的话：

```properties
monetdb.url:jdbc:monetdb://127.0.0.1/demo
monetdb.driverClassName:nl.cwi.monetdb.jdbc.MonetDriver
monetdb.username:monetdb
monetdb.password:monetdb
```


你就打开小黑框（cmd窗口，不是mclient），到monetdb/bin目录下输入     

mclient -u monetdb -d demo   

monetdb指的是用户名  demo是库名

然后就会叫你输入密码，输入完就可以了用sql语句了。

\d查看表。

# 主流的列式数据库

clickhouse

hbase

hive

greenplum

infobright

infinidb

lucidDB

MonetDB

indexR

vertica

# 可视化平台

grafna

dataease

d3 echarts antv superset

# 参考资料

https://www.monetdb.org/documentation-Jan2022/user-guide/

[windows下使用monetdb](https://blog.csdn.net/cmqwan/article/details/66088472)

* any list
{:toc}
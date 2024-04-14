---
layout: post
title: PowerDesigner 业务流程/数据建模软件和元数据管理解决方案
date:  2017-01-02 00:19:56 +0800
categories: [Design]
tags: [design, design, tool, database, sql]
published: true
---

# 拓展阅读

[数据库设计工具-08-概览](https://houbb.github.io/2017/01/01/design-tool-08-db-overview)

[数据库设计工具-08-powerdesigner](https://houbb.github.io/2017/01/01/design-tool-08-db-powerdesigner-01-intro)

[数据库设计工具-09-mysql workbench](https://houbb.github.io/2017/01/01/design-tool-09-db-mysql-workbench-01-intro)

[数据库设计工具-10-dbdesign](https://houbb.github.io/2017/01/01/design-tool-10-db-dbdesign-4-01-intro)

[数据库设计工具-11-dbeaver](https://houbb.github.io/2017/01/01/design-tool-11-db-dbeaver-01-intro)

[数据库设计工具-12-pgmodeler](https://houbb.github.io/2017/01/01/design-tool-12-db-pqmodeler-01-intro)

[数据库设计工具-13-erdplus](https://houbb.github.io/2017/01/01/design-tool-13-db-erdplus-01-intro)

[数据库设计工具-14-Navicat Data Modeler](https://houbb.github.io/2017/01/01/design-tool-14-db-nav-data-modeler-01-intro)

[数据库设计工具-15-dbdiagram](https://houbb.github.io/2017/01/01/design-tool-15-db-dbdiagram-io-01-intro)

[数据库设计工具-16-sqldbm](https://houbb.github.io/2017/01/01/design-tool-16-db-sqldbm-01-intro)

[数据库设计工具-17-pdman](https://houbb.github.io/2017/01/01/design-tool-17-db-pdman-01-intro)

[数据库设计工具-18-er-studio](https://houbb.github.io/2017/01/01/design-tool-18-er-studio-01-intro)

# PowerDesigner

[PowerDesigner](http://powerdesigner.de/en/) 是业界领先的业务流程/数据建模软件和元数据管理解决方案，适用于数据架构、信息架构和企业架构。

## 介绍

PowerDesigner 是一款由 SAP 公司开发的强大的数据建模工具，它广泛应用于企业级的业务流程和数据建模需求。该工具支持多种建模语言和标准，包括 UML（统一建模语言）、BPMN（业务流程模型和符号）、ER（实体关系）等，使得用户可以进行复杂系统的设计、分析和优化。

### 主要特点

1. **多模型支持**：PowerDesigner 支持多种建模语言，允许用户创建业务流程图、数据模型、系统架构图等，以适应不同的设计需求和标准。

2. **元数据管理**：该工具提供了一个集中的元数据仓库，用户可以在其中存储、管理和共享模型的元数据。这有助于确保数据的一致性和可追溯性。

3. **集成与协作**：PowerDesigner 可以与其他 SAP 产品如 SAP Solution Manager、SAP HANA 等进行集成，支持团队协作和模型的版本控制。

4. **自动化和扩展**：用户可以通过自动化工具生成代码和文档，提高工作效率。同时，PowerDesigner 支持自定义扩展，以满足特定的业务需求。

5. **跨平台**：PowerDesigner 可以在多种操作系统上运行，包括 Windows、Linux 和 macOS，为用户提供了灵活性。

### 应用场景

- **企业架构设计**：企业可以使用 PowerDesigner 来设计和规划整个企业的架构，包括业务流程、数据管理和技术架构等。

- **业务流程优化**：通过创建详细的业务流程模型，企业可以识别流程中的瓶颈和低效环节，进而进行优化和改进。

- **数据管理**：PowerDesigner 可以帮助企业设计和维护数据模型，确保数据的质量和一致性。

- **系统开发**：在软件开发过程中，PowerDesigner 可以用来设计系统架构和数据库模型，为开发团队提供清晰的指导。

- **合规性和标准化**：PowerDesigner 支持多种国际标准，帮助企业确保其系统设计符合行业规范和法规要求。

### 总结

PowerDesigner 是一款功能全面、适应性强的数据建模和业务流程设计工具。

它通过提供强大的建模功能、元数据管理和集成能力，帮助企业在复杂多变的信息技术环境中进行有效的架构设计和管理。

无论是企业架构师、数据分析师还是软件开发人员，都可以利用 PowerDesigner 提高工作效率，确保项目的成功实施。

# Install



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

五、Edit one column Detail

点击最左侧，选中当前列所在行。(会变黑)。点击上面左边第一个LOGO，Properties(Alt+Enter)。可对当前列进行详细编辑。

请依照此法，自行创建2张表。

六、Tables Reference

单击 【Palette】工具栏上 Reference 图标，从一张表出发，按住链接到另一张表。即可自动创建两张表之间的外键。

七、Generate SQL DDL

任意空白处右键，选择Properties。弹出内容如下

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

# 类似的工具

类似于PowerDesigner的开源工具主要是用于数据库设计和建模的工具。以下是一些流行的开源数据库设计和建模工具：

1. **MySQL Workbench**：这是一个针对MySQL数据库的官方工具，提供了数据建模、SQL开发、数据库管理等功能。

官方网址：[https://www.mysql.com/products/workbench/](https://www.mysql.com/products/workbench/)

2. **DBDesigner 4**：一个免费的开源数据库设计工具，支持多种数据库系统，包括MySQL、Oracle、SQLite等。

3. **DBeaver**：虽然主要是一个数据库管理工具，但它也提供了数据建模和ER图设计的功能。

官方网址：[https://dbeaver.io/](https://dbeaver.io/)

4. **pgModeler**：一个专门为PostgreSQL设计的开源数据建模工具，支持ER图、SQL脚本生成等功能。

官方网址：[https://www.pgmodeler.io/](https://www.pgmodeler.io/)

5. **ERDPlus**：一个在线的ER图设计工具，可以免费使用，支持多种数据库系统。

官方网址：[https://erdplus.com/](https://erdplus.com/)

6. **StarUML**：虽然主要是用于UML建模，但也可以用于数据库建模，提供了ER图的设计功能。

官方网址：[http://staruml.io/](http://staruml.io/)

# 参考资料

> [blog zh_CN](http://www.cnblogs.com/huangcong/archive/2010/06/14/1758201.html)

> [blog zh_CN](http://www.cnblogs.com/huangcong/archive/2010/06/14/1757957.html)

> [系列教程](http://www.cnblogs.com/yxonline/archive/2007/04/09/705479.html)

本文将附带讲解 [CodeSmith](http://www.codesmithtools.com/)。

* any list
{:toc}
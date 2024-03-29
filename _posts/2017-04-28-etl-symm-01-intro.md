---
layout: post
title:  SymmetricDS-01-入门介绍 用于数据库和文件同步，支持多主复制、过滤同步和转换
date:  2017-4-28 09:04:21 +0800
categories: [ETL]
tags: [etl]
published: true
---

# SymmetricDS

[SymmetricDS](http://www.symmetricds.org/doc/3.8/html/user-guide.html) 是一个开源软件，用于数据库和文件同步，支持多主复制、过滤同步和转换。

> [csdn 系列教程](http://blog.csdn.net/column/details/symmetricds.html)

一、要求

由于是使用 Java 编写的，所以需要 JDK。

- Java SE Runtime Environment 7 或更高版本

```
>java -version
java version "1.7.0_79"
Java(TM) SE Runtime Environment (build 1.7.0_79-b15)
Java HotSpot(TM) Client VM (build 24.79-b02, mixed mode, sharing)
```

- 内存 - 至少 64 (MB)

- 磁盘 - 至少 256 (MB)

二、概述

![overview](https://raw.githubusercontent.com/houbb/resource/master/img/database/symmdb/2017-05-03-symm-overview.png)

三、架构

数据同步步骤如下：

1. 在源数据库中捕获到运行时表中

2. 将数据路由发送到目标节点并分组成批次

3. 提取和转换为传出批次所需的行、列和值

4. 将传出批次发送到目标节点

5. 在目标节点接收传入批次

6. 将传入批次转换为所需的行、列和值

7. 加载数据并向源节点返回确认

![overview](https://raw.githubusercontent.com/houbb/resource/master/img/database/symmdb/2017-05-03-symm-architeture.png)

四、特性

特性如下：

- 数据同步

关系数据库的变更数据捕获和文件系统的文件同步可以是周期性的或准实时的，并提供初始加载功能以完全填充节点。

- 中央管理

从中央位置配置、监视和排除同步，可以调查和解决冲突和错误。

- 自动恢复

数据传递是持久和低维护的，可以经受停机时间并从网络中断中自动恢复。

- 安全高效

通信使用专为低带宽网络设计的数据协议，并通过 HTTPS 进行加密传输。

- 转换

在多个点对数据进行操作，以进行过滤、子集、翻译、合并和丰富数据。

- 冲突管理

通过配置自动和手动解决规则来强制执行双向同步的一致性。

- 可扩展

可以配置脚本和 Java 代码来处理事件、转换数据和创建自定义行为。

- 部署选项

该软件可以安装为一个独立的服务器，可以独立运行，也可以部署到 Web 应用服务器中，或者嵌入到应用程序中。

# 快速开始

SymmetricDS 的核心是一个 Web 应用程序。SymmetricDS 实例运行在 Web 应用程序容器的上下文中，如 Jetty 或 Tomcat，并使用基于 Web 的协议如 **HTTP** 与其他实例进行通信。

此处选择最简单的安装案例。[Standalone Installation](http://www.symmetricds.org/doc/3.8/html/user-guide.html#_standalone_installation)

> [安装SymmetricDS](http://www.2cto.com/database/201412/358101.html)

零、测试环境

Windows、SQL Server、symmetric-server-3.8.22

一、下载

[最新版下载地址](https://sourceforge.net/projects/symmetricds/files/latest/download)

二、配置 数据库连接

> [properties file](http://www.symmetricds.org/doc/3.8/html/user-guide.html#_node_properties_file)

> [各种数据库资源配置](http://blog.csdn.net/hk9024/article/details/50952572)

- 下载

创建2个文件夹，模拟2台机器。此处创建 Master、Slave 2个文件夹模拟。

将上面下载的压缩文件，分别解压缩到这2个文件夹中。

- 复制配置文件。

`Master\symmetric-server-3.8.22\samples\corp-000.properties` 复制到主库（Master）的**engines**文件夹写。 

`Slave\symmetric-server-3.8.22\samples\store-001.properties` 复制到从库（Slave）的**engines**文件夹写。

- 内容配置

主要修改JDBC相关信息。其他保持默认。

当然要记得首先在对应创建对应的**主从数据库**用于测试。

1、corp-000.properties

```
engine.name=corp-000

# The class name for the JDBC Driver
db.driver=net.sourceforge.jtds.jdbc.Driver

# The JDBC URL used to connect to the database
db.url=jdbc:jtds:sqlserver://localhost:1433/${database_name};useCursors=true;bufferMaxMemory=10240;lobBuffer=5242880

# The user to login as who can create and update tables
db.user=XXX

# The password for the user to login as
db.password=XXX
```

`${database_name}` 请自行替换为设置的主库。


2、store-001.properties

同上。`${database_name}` 请自行替换为设置的从库。

三、主库相关数据库创建

后记：

以下命令都是在 **bin** 目录下运行的。所以找不到那些配置文件。你也可以在 **samples** 目录下运行，同理指定 bin 相关的命令需要正确。

1、在 Master 节点中通过执行下面的命令为item，price和sale创建样例表：

```
dbimport --engine corp-000 --format XML create_sample.xml
```
报错如下：

```
E:\Tools\symm\Master\symmetric-server-3.8.22\bin>dbimport --engine corp-000 --fo
rmat XMLcreate_sample.xml
Log output will be written to E:\Tools\symm\Master\symmetric-server-3.8.22/logs/
symmetric.log
[] - AbstractCommandLauncher - Option: name=engine, value={corp-000}
[] - AbstractCommandLauncher - Option: name=format, value={XMLcreate_sample.xml}

[] - AbstractSymmetricEngine - Initializing connection to database
[] - JdbcDatabasePlatformFactory - Detected database 'Microsoft SQL Server', ver
sion '10', protocol 'jtds'
[] - JdbcDatabasePlatformFactory - The IDatabasePlatform being used is org.jumpm
ind.db.platform.mssql.MsSql2008DatabasePlatform
-------------------------------------------------------------------------------
An exception occurred.  Please see the following for details:
-------------------------------------------------------------------------------
java.lang.IllegalArgumentException: No enum constant org.jumpmind.symmetric.io.d
ata.DbImport.Format.XMLCREATE_SAMPLE.XML
        at java.lang.Enum.valueOf(Enum.java:236)
        at org.jumpmind.symmetric.io.data.DbImport$Format.valueOf(DbImport.java:
72)
        at org.jumpmind.symmetric.DbImportCommand.executeWithOptions(DbImportCom
mand.java:116)
        at org.jumpmind.symmetric.AbstractCommandLauncher.execute(AbstractComman
dLauncher.java:190)
        at org.jumpmind.symmetric.DbImportCommand.main(DbImportCommand.java:72)
-------------------------------------------------------------------------------
```

其实这个 xml 就是创建了四张表。你也可手动创建。可在**samples/create_sample.xml**查看表内容 

或者把位置修改对。如下：

```
dbimport --engine corp-000 --format XML ../samples/create_sample.xml
```

执行成功可在数据库看到对应的4张表。item，item_selling_price，sale_transaction，sale_return_line_item。

2、在 Master 节点的数据库中创建 SymmetricDS 特定的数据库表。

这些表将包含同步操作的**配置信息**。下面的命令使用自动创建的特性创建所有必要的SymmetricDS系统表：

```
symadmin --engine corp-000 create-sym-tables
```
3、最后一步，执行下面的操作，加载样例商品与交易数据和 SymmetricDS 配置信息到 Master 节点的数据库：

```
dbimport --engine corp-000 ../samples/insert_sample.sql  
```
`Insert_sample.sql` 文件主要分两部分，一个是往业务表里插入样例数据，另一部分是往SymmetricDS的系统表里插入本样例的系统数据。
首先创建了两个节点，然后创建了两个channel，又创建了6个trigger，接着创建了3个Router，最后创建了6个Trigger-Router Links，这里所谓的创建，其实就是往系统表里插入创建的信息而已。


四、从库相关数据库创建

在 Slave 数据库中创建对应的测试表。这里和上面一样。创建了几张测试表。

```
dbimport --engine store-001 --format XML ../samples/create_sample.xml  
```

写到这儿。你可以去数据库看看确保所有的表都有。


五、启动 SymmetricDS

打开命令行。

- crop

在 Master 的 **bin** 目录下，执行下面的命令启动 corp SymmetricDS：

这个过程会根据之前的配置文件和在 SymmetricDS 系统表中插入的数据，创建必要的 Trigger 等等的组件。然后等待其他节点的注册。

```
sym --engine corp-000 --port 31415
```

(如果此处的端口号修改，需要在 properties 文件中做对应**修改**)

- store

在 Slave 的 **bin** 目录下，执行下面的命令启动 corp SymmetricDS：

这条命令，启动 SymmetricDS 程序。并根据配置信息尝试连接 crop 节点。当然，由于这时候，crop 端的注册还没开启，这时候，在 crop 端可以收到 store 上的SymmetricDS的注册请求，但是认证会失败。

```
sym --engine store-001 --port 41415
```

(这里我是随便指定了一个没有冲突的PORT)


六、注册节点

当一个未注册的节点启动时，它将尝试注册到registration URL指定的节点（在几乎所有的情况下，就是root节点）。

通过允许注册和为已经注册的节点返回配置信息，Registration 节点集中的管理网络上的其他节点。在本教程中，Registration节点就是 corp 节点，这个节点同时参与与其他节点的同步操作。

因此，下一步，我们需要为 store 节点打开注册，以使 store 节点可以接收到初始负载的数据，然后就可以接收来自 corp 的数据，也可以向 corp 节点发送数据。

有几种方式可以完成这个任务。我们将使用 SymmetricDS 的管理功能，在corp节点上执行一个命令（因为这个节点负责注册管理）。

1、注册节点

前面已经启动了 corp 节点和 store 节点的 SymmetricDS 应用程序，下面打开一个新的命令行提示符，进入到 corp 节点的安装副本的根目录下的 **bin** 目录。

```
symadmin --engine corp-000 open-registration store 001 
```

LOG 如下

```
...
[corp-000] - RegistrationService - Registration was already enabled for 001.  No
 need to reenable it
Opened registration for node group of 'store' external ID of '001'
```

七、发起初始负载

开始我们在 crop 端的数据库的业务表上插入了几条数据，但是 store 上的数据库的业务表都是空的。

(比如 crop 端 item 表中有一条数据。而 store 没有)

既然要同步，那我们必须先把这一部分的数据同步，这一部分数据的同步就叫做同步初始负载。

要发起这个**初始负载同步**，要执行下面的命令，还是在 crop 的 SymmetricD 安装副本的 **bin** 目录下执行：

```
symadmin --engine corp-000 reload-node 001
```

使用这个命令之后，corp 节点排队各个 store 节点拉数据请求。数据的初始负载包括=被配置了同步的每一表中的数据。



八、数据插入测试


- 主库插入数据

```sql
insert into [test_master].[dbo].[item] (item_id, name)
values (20170503, 'master-insert');
```

从库会随之改变。


- 从库插入数据

```sql
insert into [test_slave].[dbo].[item] (item_id, name)
values (20170503, 'slave-insert');
```

主库不会改变。


<lable class="label label-warning">注意</label>

1. 在主表修改数据。从表不会对应修改。




* any list
{:toc}

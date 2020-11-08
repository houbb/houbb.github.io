---
layout: post
title: 数据库索引-04-Apache Phoenix
date: 2019-1-2 10:17:00 +0800
categories: [SQL]
tags: [hbase, apache, index, sh]
published: true
---

# Phoenix

[Phoenix](http://phoenix.apache.org/) 是针对Apache Hadoop的OLTP和运营分析。

# Overview

Apache Phoenix通过结合两个方面的优势，为低延迟应用程序启用Hadoop中的OLTP和操作分析：

1. 具有完整ACID事务功能的标准SQL和JDBC API的功能以及

2. 通过利用HBase作为其后备存储，从NoSQL世界获得最新绑定的读取模式功能的灵活性

Apache Phoenix与其他Hadoop产品（例如Spark，Hive，Pig，Flume和Map Reduce）完全集成。

# Mission（愿景）

通过定义良好的行业标准API，成为OLTP和Hadoop运营分析的受信任数据平台。

# SQL Support

Apache Phoenix接受您的SQL查询，将其编译为一系列HBase扫描，并组织这些扫描的运行以产生常规的JDBC结果集。

直接使用HBase API以及协处理器和自定义过滤器，对于小型查询而言，其性能约为毫秒，而对于数千万行而言，其性能约为秒。

要查看支持的内容的完整列表，请访问我们的语言参考。

支持所有标准SQL查询构造，包括SELECT，FROM，WHERE，GROUP BY，HAVING，ORDER BY等。

它还通过我们的DDL命令支持全套DML命令以及表创建和版本化的增量更改。

## 暂时不支持的

以下是当前不支持的列表：

关系运算符。 减号相交。

其他内置功能。 这些很容易添加-阅读此博客以获取逐步说明。

# Connection

使用JDBC来获得与HBase群集的连接，如下所示：

```java
Connection conn = DriverManager.getConnection("jdbc:phoenix:server1,server2:3333",props);
```

其中props是可选属性，可能包括Phoenix和HBase配置属性，以及由以下内容组成的连接字符串：

```
jdbc:phoenix [ :<zookeeper quorum> [ :<port number> [ :<root node> [ :<principal> [ :<keytab file> ] ] ] ] ] 
```

对于任何遗漏的部分，将从hbase-site.xml配置文件中使用相关的属性值hbase.zookeeper.quorum，hbase.zookeeper.property.clientPort和zookeeper.znode.parent。

可选的principal和keytab文件可用于连接到受Kerberos保护的群集。

如果仅指定了主体，则这将定义用户名，每个不同的用户都具有自己的专用HBase连接（HConnection）。

这提供了一种方法，可以在同一JVM上具有多个不同的连接，每个连接具有不同的配置属性。

例如，以下连接字符串可用于运行时间较长的查询，其中longRunningProps指定具有较长超时的Phoenix和HBase配置属性：

```java
Connection conn = DriverManager.getConnection(“jdbc:phoenix:my_server:longRunning”, longRunningProps);
```

而以下连接字符串可用于运行时间较短的查询：

```java
Connection conn = DriverManager.getConnection("jdbc:phoenix:my_server:shortRunning", shortRunningProps);
```

# Transactions

要启用完整的ACID交易（4.7.0版本中提供的beta功能），请将phoenix.transactions.enabled属性设置为true。

在这种情况下，您还需要运行分发中包含的交易管理器。

启用后，可以选择将表声明为事务表（有关说明，请参见此处）。

事务表上的提交将具有“全有或全无”的行为-将提交所有数据（包括对二级索引的任何更新），或者不提交任何数据（并且将引发异常）。

## 事务的支持粒度

跨表和跨行事务均受支持。

另外，事务表在查询时将看到自己的未提交数据。（脏读）

乐观并发模型用于检测具有首次提交获胜语义的行级冲突。

以后的提交将产生异常，指示检测到冲突。

在语句中引用事务表时，隐式启动事务，这时您将看不到来自其他连接的更新，直到发生提交或回滚为止。

非事务表没有超出行级原子性的HBase保证的保证（请参见此处）。

此外，非事务表将在提交之后才看到其更新。

Apache Phoenix的DML命令，UPSERT VALUES，UPSERT SELECT和DELETE，在客户端批量批处理对HBase表的更改。

提交事务后，这些更改将发送到服务器，而回滚该事务时，则将其丢弃。

如果为连接打开了自动提交功能，那么Phoenix将在可能的情况下通过服务器端的协处理器执行整个DML命令，从而提高性能。

## Timestamps

最常见的是，应用程序将允许HBase管理时间戳。

但是，在某些情况下，应用程序需要自行控制时间戳。

在这种情况下，可以在连接时指定CurrentSCN属性，以控制任何DDL，DML或查询的时间戳。

此功能可用于针对先前的行值运行快照查询，因为Phoenix将此连接属性的值用作扫描的最大时间戳。

事务表的时间戳可能不受控制。

相反，事务管理器分配时间戳，这些时间戳将在提交后成为HBase单元的时间戳。

时间戳仍与壁钟时间相对应，但是它们乘以1,000,000，以确保足够的粒度（粒度）以在整个群集中保持唯一性。

# Schema

Apache Phoenix支持通过DDL命令创建表和版本化增量更改。

表元数据存储在HBase表中并进行了版本控制，因此对先前版本的快照查询将自动使用正确的架构。

Phoenix表是通过CREATE TABLE命令创建的，可以是：

1.从头开始构建，在这种情况下，将自动创建HBase表和列系列。

2.通过创建读写表或只读VIEW映射到现有的HBase表，并提出警告（警告），行键和键值的二进制表示必须与Phoenix数据类型的二进制表示匹配（有关二进制表示形式的详细信息，请参见数据类型参考。

对于可读写的TABLE，如果不存在列族，则会自动创建它们。

空键值将添加到每个现有行的第一列族中，以最小化查询的投影大小。

对于只读VIEW，所有列族必须已经存在。对HBase表的唯一更改将是增加用于查询处理的Phoenix协处理器（协处理器）。

VIEW的主要用例是将现有数据传输到Phoenix表中，因为不允许在VIEW上进行数据修改，并且查询性能可能会低于TABLE。

所有模式均已版本化（最多保留1000个版本）。

基于较旧数据的快照查询将根据您连接的时间（基于CurrentSCN属性）选择并使用正确的架构。

## Altering

Phoenix表可以通过ALTER TABLE命令更改。

当运行引用表的SQL语句时，Phoenix默认情况下将与服务器核对以确保其具有最新的表元数据和统计信息。

如果事先知道表的结构永远不会改变，则可能不需要此RPC。

Phoenix 4.7中添加了UPDATE_CACHE_FREQUENCY属性，以允许用户声明检查服务器多久进行一次元数据更新（例如，添加或删除表列或更新表统计信息）。

可能的值是ALWAYS（默认值），NEVER和毫秒值。

每次执行引用表的语句时（或对于UPSERT VALUES语句，每次提交一次），ALWAYS值将导致客户端与服务器进行检查。

毫秒值表示客户端在与服务器核对更新之前将保留其元数据的缓存版本的时间。

例如，以下DDL命令将创建表FOO并声明客户端仅应每15分钟检查一次表或其统计信息的更新：

```sql
CREATE TABLE FOO (k BIGINT PRIMARY KEY, v VARCHAR) UPDATE_CACHE_FREQUENCY=900000;
```

## Views

Phoenix通过利用HBase的无模式功能（可以向其中添加列）来支持表顶部的可更新视图。

所有视图都共享相同的基础物理HBase表，甚至可以独立地建立索引。

有关更多信息，请点击此处。

## Multi-tenancy（多租户技术）

Phoenix建立在视图支持之上，还支持多租户。

与视图一样，多租户视图可能会添加专为该用户定义的列。

## Schema at Read-time

另一个与模式相关的功能允许在查询时动态定义列。

如果您在创建时不事先知道所有列，这很有用。

您可以在此处找到有关此功能的更多详细信息。

# Mapping to an Existing HBase Table

Apache Phoenix支持通过CREATE TABLE和CREATE VIEW DDL语句映射到现有的HBase表。

在这两种情况下，HBase元数据都保持不变，除了使用CREATE TABLE之外，还启用了KEEP_DELETED_CELLS选项以允许闪回查询正常工作。

对于CREATE TABLE，将创建尚不存在的所有HBase元数据（表，列系列）。

请注意，表和列系列名称区分大小写，Phoenix的所有名称均使用大写字母。

要使名称在DDL语句中区分大小写，请用双引号将其引起来，如下所示：

```sql
CREATE VIEW “MyTable” (“a”.ID VARCHAR PRIMARY KEY)
```

对于CREATE TABLE，还将为每行添加一个空键值，以使查询的行为符合预期（不需要在扫描过程中投影所有列）。

对于CREATE VIEW，将不会执行此操作，也不会创建任何HBase元数据。

相反，现有的HBase元数据必须与DDL语句中指定的元数据匹配，否则将显示ERROR 505（42000）：表将被只读。

另一个警告（警告）是，在HBase中对字节进行序列化的方式必须与Phoenix期望对字节进行序列化的方式相匹配。

对于VARCHAR，CHAR和UNSIGNED_ *类型，Phoenix使用HBase Bytes实用程序方法执行序列化。

CHAR类型期望仅使用单字节字符，而UNSIGNED类型期望使用大于或等于零的值。

我们的复合行键是通过简单地将值连接在一起而形成的，在可变长度类型之后，零字节字符用作分隔符。

有关我们的类型系统的更多信息，请参见数据类型。

# Salting

还可以将表声明为已加盐以防止HBase区域热点。

您只需要声明桌子上有多少个盐桶，Phoenix就会为您透明地管理盐桶。

您可以在此处找到有关此功能的更多详细信息，并在此处对盐析表和未盐析表之间的写入吞吐量进行很好的比较。

# APIs

表的目录，它们的列，主键和类型的目录可通过java.sql元数据接口检索：DatabaseMetaData，ParameterMetaData和ResultSetMetaData。

为了通过DatabaseMetaData接口检索模式，表和列，请像在LIKE表达式中一样指定模式，表模式和列模式（即％和_是通过字符转义的通配符）。

元数据API中的表目录参数用于基于多租户表的租户ID进行过滤。

# 拓展阅读

## 多租户

多租户技术（英语：multi-tenancy technology）或称多重租赁技术，是一种软件架构技术，它是在探讨与实现如何于多用户的环境下共用相同的系统或程序组件，并且仍可确保各用户间数据的隔离性。

多租户简单来说是指一个单独的实例可以为多个组织服务。多租户技术为共用的数据中心内如何以单一系统架构与服务提供多数客户端相同甚至可定制化的服务，并且仍然可以保障客户的数据隔离。

一个支持多租户技术的系统需要在设计上对它的数据和配置进行虚拟分区，从而使系统的每个租户或称组织都能够使用一个单独的系统实例，并且每个租户都可以根据自己的需求对租用的系统实例进行个性化配置。

多租户技术可以实现多个租户之间共享系统实例，同时又可以实现租户的系统实例的个性化定制。

通过使用多租户技术可以保证系统共性的部分被共享，个性的部分被单独隔离。

通过在多个租户之间的资源复用，运营管理维护资源，有效节省开发应用的成本。而且，在租户之间共享应用程序的单个实例，可以实现当应用程序升级时，所有租户可以同时升级。

同时，因为多个租户共享一份系统的核心代码，因此当系统升级时，只需要升级相同的核心代码即可。

# 参考资料

[多租户技术](https://baike.baidu.com/item/%E5%A4%9A%E7%A7%9F%E6%88%B7%E6%8A%80%E6%9C%AF/10061761?fr=aladdin)

* any list
{:toc}
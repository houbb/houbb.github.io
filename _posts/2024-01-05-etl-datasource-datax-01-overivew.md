---
layout: post
title: ETL-01-DataX 是阿里云DataWorks数据集成的开源版本入门介绍
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[DataX集成可视化页面，选择数据源即可一键生成数据同步任务，支持RDBMS、Hive、HBase、ClickHouse、MongoDB等数据源，批量创建RDBMS数据同步任务，集成开源调度系统，支持分布式、增量同步数据、实时查看运行日志、监控执行器资源、KILL运行进程、数据源信息加密等。](https://github.com/WeiYe-Jing/datax-web)

# DataX

[![Leaderboard](https://img.shields.io/badge/DataX-%E6%9F%A5%E7%9C%8B%E8%B4%A1%E7%8C%AE%E6%8E%92%E8%A1%8C%E6%A6%9C-orange)](https://opensource.alibaba.com/contribution_leaderboard/details?projectValue=datax)

DataX 是阿里云 [DataWorks数据集成](https://www.aliyun.com/product/bigdata/ide) 的开源版本，在阿里巴巴集团内被广泛使用的离线数据同步工具/平台。DataX 实现了包括 MySQL、Oracle、OceanBase、SqlServer、Postgre、HDFS、Hive、ADS、HBase、TableStore(OTS)、MaxCompute(ODPS)、Hologres、DRDS, databend 等各种异构数据源之间高效的数据同步功能。

# DataX 商业版本

阿里云DataWorks数据集成是DataX团队在阿里云上的商业化产品，致力于提供复杂网络环境下、丰富的异构数据源之间高速稳定的数据移动能力，以及繁杂业务背景下的数据同步解决方案。目前已经支持云上近3000家客户，单日同步数据超过3万亿条。DataWorks数据集成目前支持离线50+种数据源，可以进行整库迁移、批量上云、增量同步、分库分表等各类同步解决方案。2020年更新实时同步能力，支持10+种数据源的读写任意组合。提供MySQL，Oracle等多种数据源到阿里云MaxCompute，Hologres等大数据引擎的一键全增量同步解决方案。

商业版本参见：  https://www.aliyun.com/product/bigdata/ide

# Features

DataX本身作为数据同步框架，将不同数据源的同步抽象为从源头数据源读取数据的Reader插件，以及向目标端写入数据的Writer插件，理论上DataX框架可以支持任意数据源类型的数据同步工作。

同时DataX插件体系作为一套生态系统, 每接入一套新数据源该新加入的数据源即可实现和现有的数据源互通。

# DataX详细介绍

DataX 是一个异构数据源离线同步工具，致力于实现包括关系型数据库(MySQL、Oracle等)、HDFS、Hive、ODPS、HBase、FTP等各种异构数据源之间稳定高效的数据同步功能。

![sync](https://cloud.githubusercontent.com/assets/1067175/17879841/93b7fc1c-6927-11e6-8cda-7cf8420fc65f.png)

## 设计理念

为了解决异构数据源同步问题，DataX将复杂的网状的同步链路变成了星型数据链路，DataX作为中间传输载体负责连接各种数据源。

当需要接入一个新的数据源的时候，只需要将此数据源对接到DataX，便能跟已有的数据源做到无缝数据同步。

## 当前使用现状

DataX在阿里巴巴集团内被广泛使用，承担了所有大数据的离线同步业务，并已持续稳定运行了6年之久。

目前每天完成同步8w多道作业，每日传输数据量超过300TB。

此前已经开源DataX1.0版本，此次介绍为阿里云开源全新版本DataX3.0，有了更多更强大的功能和更好的使用体验。

Github主页地址：https://github.com/alibaba/DataX

## 二、DataX3.0框架设计

DataX本身作为离线数据同步框架，采用Framework + plugin架构构建。将数据源读取和写入抽象成为Reader/Writer插件，纳入到整个同步框架中。

![struct](https://cloud.githubusercontent.com/assets/1067175/17879884/ec7e36f4-6927-11e6-8f5f-ffc43d6a468b.png)

Reader：Reader 为数据采集模块，负责采集数据源的数据，将数据发送给Framework。

Writer： Writer为数据写入模块，负责不断向Framework取数据，并将数据写入到目的端。

Framework：Framework用于连接reader和writer，作为两者的数据传输通道，并处理缓冲，流控，并发，数据转换等核心技术问题。

## 四、DataX3.0核心架构

DataX 3.0 开源版本支持单机多线程模式完成同步作业运行，本小节按一个DataX作业生命周期的时序图，从整体架构设计非常简要说明DataX各个模块相互关系。

![struct](https://cloud.githubusercontent.com/assets/1067175/17850849/aa6c95a8-6891-11e6-94b7-39f0ab5af3b4.png)

### 核心模块介绍：

DataX完成单个数据同步的作业，我们称之为Job，DataX接受到一个Job之后，将启动一个进程来完成整个作业同步过程。DataX Job模块是单个作业的中枢管理节点，承担了数据清理、子任务切分(将单一作业计算转化为多个子Task)、TaskGroup管理等功能。

DataXJob启动后，会根据不同的源端切分策略，将Job切分成多个小的Task(子任务)，以便于并发执行。Task便是DataX作业的最小单元，每一个Task都会负责一部分数据的同步工作。
切分多个Task之后，DataX Job会调用Scheduler模块，根据配置的并发数据量，将拆分成的Task重新组合，组装成TaskGroup(任务组)。每一个TaskGroup负责以一定的并发运行完毕分配好的所有Task，默认单个任务组的并发数量为5。
每一个Task都由TaskGroup负责启动，Task启动后，会固定启动Reader—>Channel—>Writer的线程来完成任务同步工作。
DataX作业运行起来之后， Job监控并等待多个TaskGroup模块任务完成，等待所有TaskGroup任务完成后Job成功退出。否则，异常退出，进程退出值非0

### DataX调度流程：

举例来说，用户提交了一个DataX作业，并且配置了20个并发，目的是将一个100张分表的mysql数据同步到odps里面。 DataX的调度决策思路是：

DataXJob根据分库分表切分成了100个Task。
根据20个并发，DataX计算共需要分配4个TaskGroup。
4个TaskGroup平分切分好的100个Task，每一个TaskGroup负责以5个并发共计运行25个Task。

## DataX 3.0六大核心优势

### 可靠的数据质量监控

完美解决数据传输个别类型失真问题

DataX旧版对于部分数据类型(比如时间戳)传输一直存在毫秒阶段等数据失真情况，新版本DataX3.0已经做到支持所有的强数据类型，每一种插件都有自己的数据类型转换策略，让数据可以完整无损的传输到目的端。

提供作业全链路的流量、数据量�运行时监控

DataX3.0运行过程中可以将作业本身状态、数据流量、数据速度、执行进度等信息进行全面的展示，让用户可以实时了解作业状态。并可在作业执行过程中智能判断源端和目的端的速度对比情况，给予用户更多性能排查信息。

提供脏数据探测

在大量数据的传输过程中，必定会由于各种原因导致很多数据传输报错(比如类型转换错误)，这种数据DataX认为就是脏数据。DataX目前可以实现脏数据精确过滤、识别、采集、展示，为用户提供多种的脏数据处理模式，让用户准确把控数据质量大关！

### 丰富的数据转换功能

DataX作为一个服务于大数据的ETL工具，除了提供数据快照搬迁功能之外，还提供了丰富数据转换的功能，让数据在传输过程中可以轻松完成数据脱敏，补全，过滤等数据转换功能，另外还提供了自动groovy函数，让用户自定义转换函数。详情请看DataX3的transformer详细介绍。

### 精准的速度控制

还在为同步过程对在线存储压力影响而担心吗？新版本DataX3.0提供了包括通道(并发)、记录流、字节流三种流控模式，可以随意控制你的作业速度，让你的作业在库可以承受的范围内达到最佳的同步速度。

"speed": {
   "channel": 5,
   "byte": 1048576,
   "record": 10000
}

### 强劲的同步性能

DataX3.0每一种读插件都有一种或多种切分策略，都能将作业合理切分成多个Task并行执行，单机多线程执行模型可以让DataX速度随并发成线性增长。在源端和目的端性能都足够的情况下，单个作业一定可以打满网卡。另外，DataX团队对所有的已经接入的插件都做了极致的性能优化，并且做了完整的性能测试。性能测试相关详情可以参照每单个数据源的详细介绍：DataX数据源指南

### 健壮的容错机制

DataX作业是极易受外部因素的干扰，网络闪断、数据源不稳定等因素很容易让同步到一半的作业报错停止。因此稳定性是DataX的基本要求，在DataX 3.0的设计中，重点完善了框架和插件的稳定性。目前DataX3.0可以做到线程级别、进程级别(暂时未开放)、作业级别多层次局部/全局的重试，保证用户的作业稳定运行。

### 线程内部重试

DataX的核心插件都经过团队的全盘review，不同的网络交互方式都有不同的重试策略。

线程级别重试

目前DataX已经可以实现TaskFailover，针对于中间失败的Task，DataX框架可以做到整个Task级别的重新调度。

### 极简的使用体验

易用

下载即可用，支持linux和windows，只需要短短几步骤就可以完成数据的传输。请点击：Quick Start

详细

DataX在运行日志中打印了大量信息，其中包括传输速度，Reader、Writer性能，进程CPU，JVM和GC情况等等。

传输过程中打印传输速度、进度等

datax_run_speed

传输过程中会打印进程相关的CPU、JVM等

datax_run_cpu

在任务结束之后，打印总体运行情况

# Quick Start

##### Download [DataX下载地址](https://datax-opensource.oss-cn-hangzhou.aliyuncs.com/202308/datax.tar.gz)


##### 请点击：[Quick Start](https://github.com/alibaba/DataX/blob/master/userGuid.md)



# Support Data Channels 

DataX目前已经有了比较全面的插件体系，主流的RDBMS数据库、NOSQL、大数据计算系统都已经接入，目前支持数据如下图，详情请点击：[DataX数据源参考指南](https://github.com/alibaba/DataX/wiki/DataX-all-data-channels)

| 类型               | 数据源                          | Reader(读) | Writer(写) |                                                                                                                       文档                                                                                                                       |
|--------------|---------------------------|:---------:|:---------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| RDBMS 关系型数据库 | MySQL                           |     √      |     √      |                                       [读](https://github.com/alibaba/DataX/blob/master/mysqlreader/doc/mysqlreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/mysqlwriter/doc/mysqlwriter.md)                                       |
|                    | Oracle                          |     √      |     √      |                                     [读](https://github.com/alibaba/DataX/blob/master/oraclereader/doc/oraclereader.md) 、[写](https://github.com/alibaba/DataX/blob/master/oraclewriter/doc/oraclewriter.md)                                     |
|                    | OceanBase                       |     √      |     √      | [读](https://open.oceanbase.com/docs/community/oceanbase-database/V3.1.0/use-datax-to-full-migration-data-to-oceanbase) 、[写](https://open.oceanbase.com/docs/community/oceanbase-database/V3.1.0/use-datax-to-full-migration-data-to-oceanbase) |
|                    | SQLServer                       |     √      |     √      |                               [读](https://github.com/alibaba/DataX/blob/master/sqlserverreader/doc/sqlserverreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/sqlserverwriter/doc/sqlserverwriter.md)                               |
|                    | PostgreSQL                      |     √      |     √      |                             [读](https://github.com/alibaba/DataX/blob/master/postgresqlreader/doc/postgresqlreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/postgresqlwriter/doc/postgresqlwriter.md)                             |
|                    | DRDS                            |     √      |     √      |                                         [读](https://github.com/alibaba/DataX/blob/master/drdsreader/doc/drdsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/drdswriter/doc/drdswriter.md)                                         |
|                    | Kingbase                        |     √      |     √      |                                         [读](https://github.com/alibaba/DataX/blob/master/drdsreader/doc/drdsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/drdswriter/doc/drdswriter.md)                                         |
|                    | 通用RDBMS(支持所有关系型数据库) |     √      |     √      |                                       [读](https://github.com/alibaba/DataX/blob/master/rdbmsreader/doc/rdbmsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/rdbmswriter/doc/rdbmswriter.md)                                       |
| 阿里云数仓数据存储 | ODPS                            |     √      |     √      |                                         [读](https://github.com/alibaba/DataX/blob/master/odpsreader/doc/odpsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/odpswriter/doc/odpswriter.md)                                         |
|                    | ADB                             |            |     √      |                                                                             [写](https://github.com/alibaba/DataX/blob/master/adbmysqlwriter/doc/adbmysqlwriter.md)                                                                             |
|                    | ADS                             |            |     √      |                                                                                  [写](https://github.com/alibaba/DataX/blob/master/adswriter/doc/adswriter.md)                                                                                  |
|                    | OSS                             |     √      |     √      |                                           [读](https://github.com/alibaba/DataX/blob/master/ossreader/doc/ossreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/osswriter/doc/osswriter.md)                                           |
|                    | OCS                             |            |     √      |                                                                                  [写](https://github.com/alibaba/DataX/blob/master/ocswriter/doc/ocswriter.md)                                                                                  |
|                    | Hologres                        |            |     √      |                                                                         [写](https://github.com/alibaba/DataX/blob/master/hologresjdbcwriter/doc/hologresjdbcwriter.md)                                                                         |
|                    | AnalyticDB For PostgreSQL       |            |     √      |                                                                                                                       写                                                                                                                        |
| 阿里云中间件       | datahub                         |     √      |     √      |                                                                                                                      读 、写                                                                                                                      |
|                    | SLS                             |     √      |     √      |                                                                                                                      读 、写                                                                                                                      |
| 图数据库           | 阿里云 GDB                      |     √      |     √      |                                           [读](https://github.com/alibaba/DataX/blob/master/gdbreader/doc/gdbreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/gdbwriter/doc/gdbwriter.md)                                           |
|                    | Neo4j                           |            |     √      |                                                                                [写](https://github.com/alibaba/DataX/blob/master/neo4jwriter/doc/neo4jwriter.md)                                                                                |
| NoSQL数据存储      | OTS                             |     √      |     √      |                                           [读](https://github.com/alibaba/DataX/blob/master/otsreader/doc/otsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/otswriter/doc/otswriter.md)                                           |
|                    | Hbase0.94                       |     √      |     √      |                               [读](https://github.com/alibaba/DataX/blob/master/hbase094xreader/doc/hbase094xreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hbase094xwriter/doc/hbase094xwriter.md)                               |
|                    | Hbase1.1                        |     √      |     √      |                                 [读](https://github.com/alibaba/DataX/blob/master/hbase11xreader/doc/hbase11xreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hbase11xwriter/doc/hbase11xwriter.md)                                 |
|                    | Phoenix4.x                      |     √      |     √      |                           [读](https://github.com/alibaba/DataX/blob/master/hbase11xsqlreader/doc/hbase11xsqlreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hbase11xsqlwriter/doc/hbase11xsqlwriter.md)                           |
|                    | Phoenix5.x                      |     √      |     √      |                           [读](https://github.com/alibaba/DataX/blob/master/hbase20xsqlreader/doc/hbase20xsqlreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hbase20xsqlwriter/doc/hbase20xsqlwriter.md)                           |
|                    | MongoDB                         |     √      |     √      |                                   [读](https://github.com/alibaba/DataX/blob/master/mongodbreader/doc/mongodbreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/mongodbwriter/doc/mongodbwriter.md)                                   |
|                    | Cassandra                       |     √      |     √      |                               [读](https://github.com/alibaba/DataX/blob/master/cassandrareader/doc/cassandrareader.md) 、[写](https://github.com/alibaba/DataX/blob/master/cassandrawriter/doc/cassandrawriter.md)                               |
| 数仓数据存储       | StarRocks                       |     √      |     √      |                                                                          读 、[写](https://github.com/alibaba/DataX/blob/master/starrockswriter/doc/starrockswriter.md)                                                                           |
|                    | ApacheDoris                     |            |     √      |                                                                                [写](https://github.com/alibaba/DataX/blob/master/doriswriter/doc/doriswriter.md)                                                                                |
|                    | ClickHouse                      |     √      |     √      |                              [读](https://github.com/alibaba/DataX/blob/master/clickhousereader/doc/clickhousereader.md) 、[写](https://github.com/alibaba/DataX/blob/master/clickhousewriter/doc/clickhousewriter.md)                               |
|                    | Databend                        |            |     √      |                                                                             [写](https://github.com/alibaba/DataX/blob/master/databendwriter/doc/databendwriter.md)                                                                             |
|                    | Hive                            |     √      |     √      |                                         [读](https://github.com/alibaba/DataX/blob/master/hdfsreader/doc/hdfsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hdfswriter/doc/hdfswriter.md)                                         |
|                    | kudu                            |            |     √      |                                                                                 [写](https://github.com/alibaba/DataX/blob/master/hdfswriter/doc/hdfswriter.md)                                                                                 |
|                    | selectdb                        |            |     √      |                                                                             [写](https://github.com/alibaba/DataX/blob/master/selectdbwriter/doc/selectdbwriter.md)                                                                             |
| 无结构化数据存储   | TxtFile                         |     √      |     √      |                                   [读](https://github.com/alibaba/DataX/blob/master/txtfilereader/doc/txtfilereader.md) 、[写](https://github.com/alibaba/DataX/blob/master/txtfilewriter/doc/txtfilewriter.md)                                   |
|                    | FTP                             |     √      |     √      |                                           [读](https://github.com/alibaba/DataX/blob/master/ftpreader/doc/ftpreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/ftpwriter/doc/ftpwriter.md)                                           |
|                    | HDFS                            |     √      |     √      |                                         [读](https://github.com/alibaba/DataX/blob/master/hdfsreader/doc/hdfsreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/hdfswriter/doc/hdfswriter.md)                                         |
|                    | Elasticsearch                   |            |     √      |                                                                        [写](https://github.com/alibaba/DataX/blob/master/elasticsearchwriter/doc/elasticsearchwriter.md)                                                                        |
| 时间序列数据库     | OpenTSDB                        |     √      |            |                                                                             [读](https://github.com/alibaba/DataX/blob/master/opentsdbreader/doc/opentsdbreader.md)                                                                             |
|                    | TSDB                            |     √      |     √      |                                       [读](https://github.com/alibaba/DataX/blob/master/tsdbreader/doc/tsdbreader.md) 、[写](https://github.com/alibaba/DataX/blob/master/tsdbwriter/doc/tsdbhttpwriter.md)                                       |
|                    | TDengine                        |     √      |     √      |                              [读](https://github.com/alibaba/DataX/blob/master/tdenginereader/doc/tdenginereader-CN.md) 、[写](https://github.com/alibaba/DataX/blob/master/tdenginewriter/doc/tdenginewriter-CN.md)                              |

# 阿里云DataWorks数据集成

目前DataX的已有能力已经全部融和进阿里云的数据集成，并且比DataX更加高效、安全，同时数据集成具备DataX不具备的其它高级特性和功能。可以理解为数据集成是DataX的全面升级的商业化用版本，为企业可以提供稳定、可靠、安全的数据传输服务。与DataX相比，数据集成主要有以下几大突出特点：

支持实时同步：

- 功能简介：https://help.aliyun.com/document_detail/181912.html
- 支持的数据源：https://help.aliyun.com/document_detail/146778.html
- 支持数据处理：https://help.aliyun.com/document_detail/146777.html

离线同步数据源种类大幅度扩充：

- 新增比如：DB2、Kafka、Hologres、MetaQ、SAPHANA、达梦等等，持续扩充中
- 离线同步支持的数据源：https://help.aliyun.com/document_detail/137670.html
- 具备同步解决方案：
    - 解决方案系统：https://help.aliyun.com/document_detail/171765.html
    - 一键全增量：https://help.aliyun.com/document_detail/175676.html
    - 整库迁移：https://help.aliyun.com/document_detail/137809.html
    - 批量上云：https://help.aliyun.com/document_detail/146671.html
    - 更新更多能力请访问：https://help.aliyun.com/document_detail/137663.html
    -

# 我要开发新的插件

请点击：[DataX插件开发宝典](https://github.com/alibaba/DataX/blob/master/dataxPluginDev.md)

# 重要版本更新说明

DataX 后续计划月度迭代更新，也欢迎感兴趣的同学提交 Pull requests，月度更新内容会介绍介绍如下。

- [datax_v202309]（https://github.com/alibaba/DataX/releases/tag/datax_v202309)
  - 支持Phoenix 同步数据添加 where条件
  - 支持华为 GuassDB读写插件
  - 修复ClickReader 插件运行报错 Can't find bundle for base name
  - 增加 DataX调试模块
  - 修复 orc空文件报错问题
  - 优化obwriter性能
  - txtfilewriter 增加导出为insert语句功能支持
  - HdfsReader/HdfsWriter 支持parquet读写能力
  
- [datax_v202308]（https://github.com/alibaba/DataX/releases/tag/datax_v202308)
  - OTS 插件更新
  - databend 插件更新
  - Oceanbase驱动修复


- [datax_v202306]（https://github.com/alibaba/DataX/releases/tag/datax_v202306)
  - 精简代码
  - 新增插件（neo4jwriter、clickhousewriter）
  - 优化插件、修复问题（oceanbase、hdfs、databend、txtfile）


- [datax_v202303]（https://github.com/alibaba/DataX/releases/tag/datax_v202303)
  - 精简代码
  - 新增插件（adbmysqlwriter、databendwriter、selectdbwriter）
  - 优化插件、修复问题（sqlserver、hdfs、cassandra、kudu、oss）
  - fastjson 升级到 fastjson2

- [datax_v202210]（https://github.com/alibaba/DataX/releases/tag/datax_v202210)
  - 涉及通道能力更新（OceanBase、Tdengine、Doris等）

- [datax_v202209]（https://github.com/alibaba/DataX/releases/tag/datax_v202209)
    - 涉及通道能力更新（MaxCompute、Datahub、SLS等）、安全漏洞更新、通用打包更新等

- [datax_v202205]（https://github.com/alibaba/DataX/releases/tag/datax_v202205)
    - 涉及通道能力更新（MaxCompute、Hologres、OSS、Tdengine等）、安全漏洞更新、通用打包更新等


# 项目成员

核心Contributions: 言柏 、枕水、秋奇、青砾、一斅、云时

感谢天烬、光戈、祁然、巴真、静行对DataX做出的贡献。



# 参考资料

https://github.com/alibaba/DataX

* any list
{:toc}
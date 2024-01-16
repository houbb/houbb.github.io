---
layout: post
title: canal-02-入门介绍
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, sh]
published: true
---

# 背景

早期，阿里巴巴B2B公司因为存在杭州和美国双机房部署，存在跨机房同步的业务需求。

不过早期的数据库同步业务，主要是基于trigger的方式获取增量变更，不过从2010年开始，阿里系公司开始逐步的尝试基于数据库的日志解析，获取增量变更进行同步，由此衍生出了增量订阅&消费的业务，从此开启了一段新纪元。

ps. 目前内部使用的同步，已经支持mysql5.x和oracle部分版本的日志解析

基于日志增量订阅&消费支持的业务：

- 数据库镜像

- 数据库实时备份

- 多级索引 (卖家和买家各自分库索引)

- search build

- 业务cache刷新

- 价格变化等重要业务消息

# 项目介绍

名称：canal [kə'næl]

译意： 水道/管道/沟渠

语言： 纯java开发

定位： 基于数据库增量日志解析，提供增量数据订阅&消费，目前主要支持了mysql

关键词： mysql binlog parser / real-time / queue&topic

# 工作原理

## mysql 主备复制实现

![master-salve](https://camo.githubusercontent.com/7cbe5fed28a4396eb31a8f349c787df45bf093962014bb15277652b71feb0740/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f63353231646237623135376430653932306136396164666531373234653363392e6a706567)

从上层来看，复制分成三步：

1. master将改变记录到二进制日志(binary log)中（这些记录叫做二进制日志事件，binary log events，可以通过show binlog events进行查看）；

2. slave将master的binary log events拷贝到它的中继日志(relay log)；

3. slave重做中继日志中的事件，将改变反映它自己的数据。

## canal的工作原理：

![canal](https://camo.githubusercontent.com/011b5305a38c302529fa9b0a3795f474364408d80833ff9e178e4a15341ef5b1/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f34613264626561343334656266356563363031366334633830326233393365332e6a706567)

原理相对比较简单：

1. canal模拟mysql slave的交互协议，伪装自己为mysql slave，向mysql master发送dump协议

2. mysql master收到dump请求，开始推送binary log给slave(也就是canal)

3. canal解析binary log对象(原始为byte流)

# 架构

![struct](https://camo.githubusercontent.com/84aa43853a4c8e4c4ce0eb61fed1abb51f194bdf2f09a10ef3f1088e79377019/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f63623630626338666532646430633037373334613864653137346465393938382e6a706567)

## 说明：

server代表一个canal运行实例，对应于一个jvm
instance对应于一个数据队列 （1个server对应1..n个instance)
instance模块：

eventParser (数据源接入，模拟slave协议和master进行交互，协议解析)
eventSink (Parser和Store链接器，进行数据过滤，加工，分发的工作)
eventStore (数据存储)
metaManager (增量订阅&消费信息管理器)

# 知识科普

MySQL 的 Binary Log 介绍

http://dev.mysql.com/doc/refman/5.5/en/binary-log.html
http://www.taobaodba.com/html/474_mysqls-binary-log_details.html

简单点说：

mysql的binlog是多文件存储，定位一个LogEvent需要通过binlog filename + binlog position，进行定位

mysql的binlog数据格式，按照生成的方式，主要分为：statement-based、row-based、mixed。

```
mysql> show variables like 'binlog_format';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| binlog_format | ROW   |
+---------------+-------+
1 row in set (0.00 sec)
```

目前canal支持所有模式的增量订阅(但配合同步时，因为statement只有sql，没有数据，无法获取原始的变更日志，所以一般建议为ROW模式)

# EventParser 设计

大致过程：

![过程](https://camo.githubusercontent.com/413cc75519bbf61bbb44e8bc547a13ad6d222818ecd9bf8bc596a81bbd4ae2cb/68747470733a2f2f75706c6f61642d696d616765732e6a69616e7368752e696f2f75706c6f61645f696d616765732f313534313335302d326336383338656237636139373135632e706e67)

整个parser过程大致可分为几步：

1) Connection获取上一次解析成功的位置 (如果第一次启动，则获取初始指定的位置或者是当前数据库的binlog位点)

2) Connection建立链接，发送BINLOG_DUMP指令
// 0. write command number
// 1. write 4 bytes bin-log position to start at
// 2. write 2 bytes bin-log flags
// 3. write 4 bytes server id of the slave
// 4. write bin-log file name

3) Mysql开始推送Binaly Log

4) 接收到的Binaly Log的通过Binlog parser进行协议解析，补充一些特定信息
// 补充字段名字，字段类型，主键信息，unsigned类型处理

5) 传递给EventSink模块进行数据存储，是一个阻塞操作，直到存储成功

6) 存储成功后，定时记录Binaly Log位置

mysql的Binlay Log网络协议：

![binlay log](https://camo.githubusercontent.com/07ef05200d6abc48debc101c8c2e09b91c6677333abafb931eea0e7d3a043711/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f32643064653564363930656134616533343463343732306132383561313631332e706e67)

说明：

图中的协议4byte header，主要是描述整个binlog网络包的length

binlog event structure，详细信息请参考：
forge.mysql.com/wiki/MySQL_Internals_Binary_Log

https://dev.mysql.com/doc/internals/en/binary-log.html https://dev.mysql.com/doc/internals/en/event-structure.html https://dev.mysql.com/doc/internals/en/binlog-event.html

# EventSink 设计

![EventSink](https://camo.githubusercontent.com/6b19dcf745b5a62ef79a3fa402220b066c21a3d6ff1e443f3da9f88dcd7effb2/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f63316666386666376435373265343130343530376330643062653831393030342e6a706567)

说明：

- 数据过滤：支持通配符的过滤模式，表名，字段内容等

- 数据路由/分发：解决1:n (1个parser对应多个store的模式)

- 数据归并：解决n:1 (多个parser对应1个store)

- 数据加工：在进入store之前进行额外的处理，比如join

## 数据1:n业务

为了合理的利用数据库资源， 一般常见的业务都是按照schema进行隔离，然后在mysql上层或者dao这一层面上，进行一个数据源路由，屏蔽数据库物理位置对开发的影响，阿里系主要是通过cobar/tddl来解决数据源路由问题。

所以，一般一个数据库实例上，会部署多个schema，每个schema会有由1个或者多个业务方关注

## 数据n:1业务

同样，当一个业务的数据规模达到一定的量级后，必然会涉及到水平拆分和垂直拆分的问题，针对这些拆分的数据需要处理时，就需要链接多个store进行处理，消费的位点就会变成多份，而且数据消费的进度无法得到尽可能有序的保证。

所以，在一定业务场景下，需要将拆分后的增量数据进行归并处理，比如按照时间戳/全局id进行排序归并.

# EventStore 设计

1. 目前仅实现了Memory内存模式，后续计划增加本地file存储，mixed混合模式

2. 借鉴了Disruptor的RingBuffer的实现思路

RingBuffer 设计：

![RingBuffer](https://camo.githubusercontent.com/e64b32a2ef421b4ecfc72678f315b1c36024975708bf2e215f0a8d970bc8d3a7/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f33616231306635396433353136366334336236626161386261303532353366312e6a706567)

定义了3个cursor

Put : Sink模块进行数据存储的最后一次写入位置
Get : 数据订阅获取的最后一次提取位置
Ack : 数据消费成功的最后一次消费位置

借鉴 Disruptor 的 RingBuffer 的实现，将RingBuffer拉直来看：

![RingBuffer](https://camo.githubusercontent.com/ef67340770c2954adc1da1242751892e7ecd34aac9b4f1fb527cd026ac53fafd/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f38316231363564353562653964623463623761343535353830393835323761392e6a706567)


实现说明：

Put/Get/Ack cursor用于递增，采用long型存储

buffer的get操作，通过取余或者与操作。(与操作： cusor & (size - 1) , size需要为2的指数，效率比较高)

# Instance设计

![Instance设计](https://camo.githubusercontent.com/84c594d51d380d9c8effc568631791d0eaf217288754369821a8c6d8567b0f43/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f32363933646336323062383435303864313865343734643335653431313437622e6a706567)

instance代表了一个实际运行的数据队列，包括了EventPaser,EventSink,EventStore等组件。

抽象了CanalInstanceGenerator，主要是考虑配置的管理方式：

manager方式： 和你自己的内部web console/manager系统进行对接。(目前主要是公司内部使用)

spring方式：基于spring xml + properties进行定义，构建spring配置.

# Server设计

![Server设计](https://camo.githubusercontent.com/3c18dc9671302a196b6a06de018e2b7a9456e2a897c20518d155cb07c585c062/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f36636664383634343434303136313161336166653162353763656465656665322e6a706567)

server代表了一个canal的运行实例，为了方便组件化使用，特意抽象了Embeded(嵌入式) / Netty(网络访问)的两种实现

Embeded : 对latency和可用性都有比较高的要求，自己又能hold住分布式的相关技术(比如failover)
Netty : 基于netty封装了一层网络协议，由canal server保证其可用性，采用的pull模型，当然latency会稍微打点折扣，不过这个也视情况而定。(阿里系的notify和metaq，典型的push/pull模型，目前也逐步的在向pull模型靠拢，push在数据量大的时候会有一些问题)

# 增量订阅/消费设计

![增量订阅](https://camo.githubusercontent.com/00961a2a6a57b87c2f99c3d24ec26827d119433102261df96ab253b1ed5a31df/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f32306164663062656362623339643535316531636335336265313133353435322e6a706567)

具体的协议格式，可参见：CanalProtocol.proto

get/ack/rollback协议介绍：

- `Message getWithoutAck(int batchSize)`，允许指定batchSize，一次可以获取多条，每次返回的对象为Message，包含的内容为：

a. batch id 唯一标识
b. entries 具体的数据对象，对应的数据对象格式：EntryProtocol.proto

- `void rollback(long batchId)`，顾命思议，回滚上次的get请求，重新获取数据。基于get获取的batchId进行提交，避免误操作

- `void ack(long batchId)`，顾命思议，确认已经消费成功，通知server删除数据。基于get获取的batchId进行提交，避免误操作

canal的get/ack/rollback协议和常规的jms协议有所不同，允许get/ack异步处理，比如可以连续调用get多次，后续异步按顺序提交ack/rollback，项目中称之为流式api.

流式api设计的好处：

get/ack异步化，减少因ack带来的网络延迟和操作成本 (99%的状态都是处于正常状态，异常的rollback属于个别情况，没必要为个别的case牺牲整个性能)
get获取数据后，业务消费存在瓶颈或者需要多进程/多线程消费时，可以不停的轮询get数据，不停的往后发送任务，提高并行化. (作者在实际业务中的一个case：业务数据消费需要跨中美网络，所以一次操作基本在200ms以上，为了减少延迟，所以需要实施并行化)

流式api设计：

![fluent-api-design](https://camo.githubusercontent.com/183083438d3232467cef433ddb2f82adf56434c536396f8919062d3ea25080b8/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f63303662663762313632636334363765343837663561653064313837396563322e6a706567)

- 每次get操作都会在meta中产生一个mark，mark标记会递增，保证运行过程中mark的唯一性

- 每次的get操作，都会在上一次的mark操作记录的cursor继续往后取，如果mark不存在，则在last ack cursor继续往后取

- 进行ack时，需要按照mark的顺序进行数序ack，不能跳跃ack. ack会删除当前的mark标记，并将对应的mark位置更新为last ack cusor

- 一旦出现异常情况，客户端可发起rollback情况，重新置位：删除所有的mark, 清理get请求位置，下次请求会从last ack cursor继续往后取

# 数据对象格式：EntryProtocol.proto

```
Entry
	Header
		logfileName [binlog文件名]
		logfileOffset [binlog position]
		executeTime [binlog里记录变更发生的时间戳]
		schemaName [数据库实例]
		tableName [表名]
		eventType [insert/update/delete类型]
	entryType 	[事务头BEGIN/事务尾END/数据ROWDATA]
	storeValue 	[byte数据,可展开，对应的类型为RowChange]
RowChange
isDdl		[是否是ddl变更操作，比如create table/drop table]
sql		[具体的ddl sql]
rowDatas	[具体insert/update/delete的变更数据，可为多条，1个binlog event事件可对应多条变更，比如批处理]
beforeColumns [Column类型的数组]
afterColumns [Column类型的数组]


Column
index		[column序号]
sqlType		[jdbc type]
name		[column name]
isKey		[是否为主键]
updated		[是否发生过变更]
isNull		[值是否为null]
value		[具体的内容，注意为文本]
```

说明：

可以提供数据库变更前和变更后的字段内容，针对binlog中没有的name,isKey等信息进行补全
可以提供ddl的变更语句

# HA机制设计

canal的ha分为两部分，canal server和canal client分别有对应的ha实现

canal server: 为了减少对mysql dump的请求，不同server上的instance要求同一时间只能有一个处于running，其他的处于standby状态.
canal client: 为了保证有序性，一份instance同一时间只能由一个canal client进行get/ack/rollback操作，否则客户端接收无法保证有序。

整个HA机制的控制主要是依赖了zookeeper的几个特性，watcher和EPHEMERAL节点(和session生命周期绑定)，可以看下我之前zookeeper的相关文章。

Canal Server:

![Canal Server](https://camo.githubusercontent.com/18c736ea4f6793d4294a6b5551d5929f69c446a8b912b4a14bd7adfae463e3bb/68747470733a2f2f7374617469632e73697465737461636b2e636e2f70726f6a656374732f63616e616c2d76312e312e342f39626434613730623562303638613733366237616438326665623166343838312e6a706567)

大致步骤：

1. canal server要启动某个canal instance时都先向zookeeper进行一次尝试启动判断 (实现：创建EPHEMERAL节点，谁创建成功就允许谁启动)

2. 创建zookeeper节点成功后，对应的canal server就启动对应的canal instance，没有创建成功的canal instance就会处于standby状态

3. 一旦zookeeper发现canal server A创建的节点消失后，立即通知其他的canal server再次进行步骤1的操作，重新选出一个canal server启动instance.

4. canal client每次进行connect时，会首先向zookeeper询问当前是谁启动了canal instance，然后和其建立链接，一旦链接不可用，会重新尝试connect.

Canal Client的方式和canal server方式类似，也是利用zookeeper的抢占EPHEMERAL节点的方式进行控制.


# 参考资料 

https://github.com/alibaba/canal/wiki/%E7%AE%80%E4%BB%8B

* any list
{:toc}
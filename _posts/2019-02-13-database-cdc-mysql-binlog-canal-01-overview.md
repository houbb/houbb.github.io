---
layout: post
title: canal 阿里巴巴 MySQL binlog 增量订阅&消费组件
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, sh]
published: true
---

# Canal

[Canal](https://github.com/alibaba/canal)，译意为水道/管道/沟渠，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费

早期阿里巴巴因为杭州和美国双机房部署，存在跨机房同步的业务需求，实现方式主要是基于业务 trigger 获取增量变更。

从 2010 年开始，业务逐步尝试数据库日志解析获取增量变更进行同步，由此衍生出了大量的数据库增量订阅和消费业务。

基于日志增量订阅和消费的业务包括

- 数据库镜像

- 数据库实时备份

- 索引构建和实时维护(拆分异构索引、倒排索引等)

- 业务 cache 刷新

- 带业务逻辑的增量数据处理

当前的 canal 支持源端 MySQL 版本包括 5.1.x , 5.5.x , 5.6.x , 5.7.x , 8.0.x

![mysql](https://camo.githubusercontent.com/63881e271f889d4a424c55cea2f9c2065f63494fecac58432eac415f6e47e959/68747470733a2f2f696d672d626c6f672e6373646e696d672e636e2f32303139313130343130313733353934372e706e67)

# 工作原理

## MySQL主备复制原理

![MySQL主备复制原理](https://camo.githubusercontent.com/c26e367a6ffcce8ae6ecb39476a01bef14af6572124a6df050c4dc0c7f1074f3/687474703a2f2f646c2e69746579652e636f6d2f75706c6f61642f6174746163686d656e742f303038302f333038362f34363863316131342d653761642d333239302d396433642d3434616335303161373232372e6a7067)


MySQL master 将数据变更写入二进制日志( binary log, 其中记录叫做二进制日志事件binary log events，可以通过 show binlog events 进行查看)

MySQL slave 将 master 的 binary log events 拷贝到它的中继日志(relay log)

MySQL slave 重放 relay log 中事件，将数据变更反映它自己的数据

## canal 工作原理

canal 模拟 MySQL slave 的交互协议，伪装自己为 MySQL slave ，向 MySQL master 发送dump 协议

MySQL master 收到 dump 请求，开始推送 binary log 给 slave (即 canal )

canal 解析 binary log 对象(原始为 byte 流)

## 基于canal开发的工具

-  canal2sql(基于binlog生成SQL) : [https://github.com/zhuchao941/canal2sql]

## 相关开源&产品

- [canal 消费端开源项目: Otter](http://github.com/alibaba/otter)
- [阿里巴巴去 Oracle 数据迁移同步工具: yugong](http://github.com/alibaba/yugong)
- [阿里巴巴离线同步开源项目 DataX](https://github.com/alibaba/datax)
- [阿里巴巴数据库连接池开源项目 Druid](https://github.com/alibaba/druid)
- [阿里巴巴实时数据同步工具 DTS](https://www.aliyun.com/product/dts)


# chat

## 介绍下 canal 

Canal是一款基于MySQL数据库的开源、轻量级、高性能的增量订阅&消费组件，主要用于监控MySQL数据库的变更，将变更的数据推送给订阅者。

以下是Canal的一些主要特点和功能：

1. **实时增量数据同步：** Canal能够实时监控MySQL数据库的变更，包括插入、更新和删除操作，然后将这些变更数据实时地推送给订阅者。

2. **支持多种订阅方式：** Canal支持多种订阅方式，包括基于网络的订阅和基于文件的订阅。通过网络订阅，应用程序可以直接连接到Canal服务器，接收变更数据；通过文件订阅，Canal会将变更数据写入本地文件，应用程序通过读取这些文件来获取变更信息。

3. **灵活的过滤配置：** Canal支持配置过滤规则，可以选择性地订阅某些数据库、表或特定的字段，以满足不同业务需求。

4. **数据格式化：** Canal可以将变更的数据以JSON格式或其他自定义格式进行输出，方便订阅者解析和处理。

5. **高性能：** Canal采用了基于网络的通信协议和高性能的异步队列，确保了高吞吐量和低延迟的数据传输。

6. **跨版本支持：** Canal能够适应不同版本的MySQL数据库，并在新的MySQL版本发布后及时更新适配。

7. **监控和管理：** Canal提供了Web界面和RESTful API，方便用户监控和管理Canal的运行状态。

Canal通常被用于数据同步、数据备份、搜索引擎构建等场景，为应用程序提供实时的数据库变更信息。

请注意，由于开源软件的不断更新，可能会有新的功能和改进，建议查阅最新的文档和代码仓库获取详细信息。

## canal 生效，是不是必须要求 mysql 启用 binlog ？

是的，要使Canal生效，MySQL必须启用二进制日志（binlog）。

二进制日志是MySQL的一种记录数据库变更的机制，它将数据库中的更改以二进制格式记录下来，包括插入、更新和删除等操作。Canal通过监控MySQL的binlog，实时捕捉数据库变更并将其传递给订阅者。

在MySQL中，可以通过修改配置文件来启用二进制日志。一般而言，需要在MySQL的配置文件（通常是my.cnf或my.ini）中设置以下参数：

```ini
[mysqld]
log-bin=mysql-bin
server-id=1
```

这里的`log-bin`参数指定了二进制日志的文件名前缀，`server-id`参数为MySQL实例分配一个唯一的ID。启用这些参数后，MySQL就会开始记录二进制日志。

确保在启用binlog之后，Canal配置文件中的相应参数也正确设置，以便Canal能够正确地连接和解析MySQL的binlog。通常，Canal配置文件中包括MySQL的连接信息、binlog位置、过滤规则等。

```ini
canal.instance.master.address = mysql_server_ip:3306
canal.instance.dbUsername = canal
canal.instance.dbPassword = canal
canal.instance.connectionCharset = UTF-8
canal.instance.gtidon = false
canal.instance.tsdb.enable = false
canal.instance.auto.scan = false
canal.instance.tsdb.snapshot.interval = 5
canal.instance.spring.xml = classpath:spring/application.yml
```

请注意，具体的配置可能会因Canal的版本而有所不同，建议查阅最新的Canal文档以获取准确的配置信息。

## canal 的实现原理？

Canal的实现原理主要涉及MySQL的二进制日志解析和网络通信两个方面。以下是Canal的基本实现原理：

1. **连接到MySQL数据库：** Canal通过与MySQL数据库建立连接，获取MySQL数据库的变更信息。在连接时，需要使用MySQL的binlog协议进行通信。

2. **解析MySQL的二进制日志：** 一旦与MySQL建立了连接，Canal开始解析MySQL的二进制日志（binlog）。MySQL的binlog记录了数据库的所有变更操作，包括插入、更新、删除等。Canal通过解析binlog，获取并识别这些变更。

3. **解析binlog的事件：** MySQL的binlog以事件（event）的形式记录了数据库的每个变更操作。Canal需要解析这些事件，包括事件的类型、表名、字段值等信息。Canal支持的事件类型主要包括Query事件、TableMap事件、WriteRows事件等。

4. **过滤规则处理：** Canal支持用户定义的过滤规则，可以选择性地订阅特定的数据库、表或字段。在解析binlog的过程中，Canal会根据这些过滤规则来筛选出符合条件的变更事件，以减少不必要的数据传输。

5. **构建数据结构：** 解析后的binlog事件需要被构建成具体的数据结构，通常是一个包含了变更类型、数据库名、表名、字段值等信息的数据对象。这个数据对象会被传递给订阅者。

6. **数据传输：** Canal通过网络将解析后的变更数据传输给订阅者。订阅者可以是各种应用程序，例如数据同步工具、搜索引擎构建工具等。

7. **订阅者处理：** 订阅者接收到变更数据后，根据业务需求进行相应的处理，例如将数据同步到其他数据库、进行实时计算、构建搜索索引等。

总体而言，Canal通过解析MySQL的binlog，实时捕捉数据库变更，然后通过网络将变更数据传递给订阅者，从而实现了数据库的增量订阅和消费。需要注意的是，具体的实现细节可能会因Canal版本的更新而有所变化，建议查阅最新的Canal文档和代码仓库获取详细信息。

## canal 实时捕获 binlog 变化是如何实现的？一直循环拉取吗？还是基于日志的变更事件？

Canal实时捕获MySQL的binlog变化并不是通过简单的循环拉取实现的，而是基于MySQL的binlog机制和事件的。它采用了基于事件的方式来实时获取数据库的变更。

具体而言，Canal利用MySQL的binlog协议与MySQL数据库建立连接，订阅MySQL的binlog事件。

MySQL的binlog以事件为单位记录了数据库的变更操作，包括插入、更新、删除等。

Canal会实时解析这些binlog事件，并将解析得到的变更数据传递给订阅者。

下面是基于事件的实时捕获的主要步骤：

1. **建立连接：** Canal与MySQL数据库建立长连接，通过MySQL提供的binlog协议进行通信。

2. **订阅binlog事件：** Canal向MySQL发送订阅请求，告诉MySQL它对哪些数据库、表感兴趣。这样，MySQL在产生相关的binlog事件时，会将这些事件推送给Canal。

3. **解析binlog事件：** Canal收到MySQL推送的binlog事件后，进行解析。这包括解析事件的类型、数据库名、表名、字段值等信息。

4. **构建数据结构：** 解析后的binlog事件会被构建成一个具体的数据结构，通常是一个包含了变更类型、数据库名、表名、字段值等信息的数据对象。

5. **传递给订阅者：** 构建好的数据对象会通过网络传递给订阅者，订阅者可以根据业务需求进行相应的处理。

这种基于事件的机制相比简单的循环拉取方式更为高效，因为它避免了不必要的轮询和占用资源。

Canal能够实时地捕获数据库的变更，而不需要不断地主动去询问是否有新的数据。

这种实时的方式对于一些需要及时响应数据库变更的场景非常有用，例如数据同步、搜索引擎构建等。

## 有哪些类似于 canal 的开源组件

在开源领域，有一些类似于Canal的数据库增量订阅和消费组件，它们可以用于捕获数据库的变更并将变更数据传递给订阅者。以下是一些常见的开源组件：

1. **Debezium:**
   - **支持数据库:** MySQL、PostgreSQL、MongoDB、SQL Server等。
   - **特点:** 基于CDC（Change Data Capture）实现，能够捕获数据库的变更并将其作为事件流提供给订阅者。

2. **Maxwell's Daemon:**
   - **支持数据库:** MySQL。
   - **特点:** 轻量级的数据库增量订阅组件，能够捕获MySQL的binlog变更并将其传递给订阅者。

3. **LDBC (LinkedIn Database Change Capture):**
   - **支持数据库:** MySQL。
   - **特点:** 由LinkedIn开发，能够捕获MySQL数据库的变更并支持多租户。

4. **Tungsten Replicator:**
   - **支持数据库:** MySQL。
   - **特点:** 提供了高性能的MySQL数据库复制和变更数据捕获功能，支持多种拓扑结构。

5. **Mushroom:**
   - **支持数据库:** MySQL。
   - **特点:** 基于Java开发的数据库同步工具，支持MySQL binlog的实时捕获和数据同步。

这些组件各自有不同的特点和适用场景，选择其中一个取决于你的具体需求、数据库类型以及系统架构。

在选择之前，建议查阅各个组件的文档和社区反馈，以了解它们的特性、性能和使用经验。

# 参考资料 

[数据库分库分表后如何部署上线](https://mp.weixin.qq.com/s/DvRpJRY3M06-yi7LFPyghg)

[分库分表技术演进&最佳实践](https://mp.weixin.qq.com/s?__biz=MzAxODcyNjEzNQ==&mid=2247486161&idx=1&sn=a8b68997a8e3e1623e66b83d5c21ce88&chksm=9bd0a749aca72e5f240a6ad1b28bcc923ee2874e16d9b9641b7efd99bc368baa963d081e2ba0&scene=21#wechat_redirect)

[为什么分库分表后不建议跨分片查询](https://mp.weixin.qq.com/s/l1I5u3n-lSwDYfxC-V3low)

https://github.com/alibaba/canal

* any list
{:toc}
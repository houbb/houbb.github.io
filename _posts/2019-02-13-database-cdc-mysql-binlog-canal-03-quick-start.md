---
layout: post
title: canal-03-canal windows wsl 实战笔记
date:  2019-2-13 09:48:27 +0800
categories: [Database]
tags: [database, sharding, mysql, cdc, canal, in-action, sh]
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

# windows10 WSL 实战笔记

## 准备工作

确保已经开启 binlog

> [binlog 开启](https://houbb.github.io/2021/08/29/mysql-binlog)

```sql
mysql> show variables where variable_name in ('log_bin', 'binlog_format', 'binlog_row_image', 'gtid_mode', 'enforce_gtid_consistency');
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| binlog_format            | ROW   |
| binlog_row_image         | FULL  |
| enforce_gtid_consistency | ON    |
| gtid_mode                | ON    |
| log_bin                  | ON    |
+--------------------------+-------+
```

## 创建 canal 账户

```sql
CREATE USER 'canal'@'%' IDENTIFIED BY 'canal';
GRANT ALL PRIVILEGES ON *.* TO 'canal'@'%' WITH GRANT OPTION;
flush privileges;
```

## 创建表

```sql
create database test_source;
use test_source;

drop table if exists user_info;
create table user_info
(
    id int unsigned auto_increment comment '主键' primary key,
    username varchar(128) not null comment '用户名',
    create_time timestamp default CURRENT_TIMESTAMP not null comment '创建时间',
    update_time timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间'
) comment '用户信息表' ENGINE=Innodb default charset=utf8mb4 auto_increment=1;
```

初始化数据

```sql
insert into user_info (username) values ('u1');
insert into user_info (username) values ('u2');
insert into user_info (username) values ('u3');
insert into user_info (username) values ('u4');
insert into user_info (username) values ('u5');
```

## 下载 canal

```bash
$ pwd
/home/houbinbin/canal
```

下载 canal, [访问 release 页面 , 选择需要的包下载](https://github.com/alibaba/canal/releases/), 如以 `canal.deployer-1.1.7.tar.gz` 为例

```bash
wget https://github.com/alibaba/canal/releases/download/canal-1.1.7/canal.deployer-1.1.7.tar.gz
```

解压缩

```sh
tar -zxvf canal.deployer-1.1.7.tar.gz
```

如下：

```bash
$ ls
bin  canal.deployer-1.1.7.tar.gz  canal.deployer-1.1.7.tar.gz:Zone.Identifier  conf  lib  logs  plugin
```

## 配置修改

修改对应的配置文件
```ini
vi conf/example/instance.properties

## mysql serverId
canal.instance.mysql.slaveId = 1234
#position info，需要改成自己的数据库信息
canal.instance.master.address = 127.0.0.1:13306 
canal.instance.master.journal.name = 
canal.instance.master.position = 
canal.instance.master.timestamp = 
#canal.instance.standby.address = 
#canal.instance.standby.journal.name =
#canal.instance.standby.position = 
#canal.instance.standby.timestamp = 
#username/password，需要改成自己的数据库信息
canal.instance.dbUsername = canal  
canal.instance.dbPassword = canal
canal.instance.defaultDatabaseName =
canal.instance.connectionCharset = UTF-8
#table regex
canal.instance.filter.regex = .\*\\\\..\*
```

这里主要改一下 canal.instance.master.address 为自己的本地地址，其他的不变化。

canal.instance.connectionCharset 代表数据库的编码方式对应到 java 中的编码类型，比如 UTF-8，GBK , ISO-8859-1

如果系统是1个 cpu，需要将 canal.instance.parser.parallel 设置为 false

## 启动


```sh
sh bin/startup.sh
```

### 查看 server 日志

```sh
cat logs/canal/canal.log
```

日志如下：

```
2024-01-27 19:46:19.266 [main] INFO  com.alibaba.otter.canal.deployer.CanalLauncher - ## load canal configurations
2024-01-27 19:46:19.280 [main] INFO  com.alibaba.otter.canal.deployer.CanalStarter - ## start the canal server.
2024-01-27 19:46:19.333 [main] INFO  com.alibaba.otter.canal.deployer.CanalController - ## start the canal server[172.23.234.67(172.23.234.67):11111]
2024-01-27 19:46:21.108 [main] INFO  com.alibaba.otter.canal.deployer.CanalStarter - ## the canal server is running now ......
```

### 查看 instance 的日志

```sh
cat logs/example/example.log
```

日志如下：

```
2024-01-27 19:46:20.101 [main] INFO  c.a.otter.canal.instance.spring.CanalInstanceWithSpring - start CannalInstance for 1-example
2024-01-27 19:46:21.056 [main] WARN  c.a.o.canal.parse.inbound.mysql.dbsync.LogEventConvert - --> init table filter : ^.*\..*$
2024-01-27 19:46:21.057 [main] WARN  c.a.o.canal.parse.inbound.mysql.dbsync.LogEventConvert - --> init table black filter : ^mysql\.slave_.*$
2024-01-27 19:46:21.063 [main] INFO  c.a.otter.canal.instance.core.AbstractCanalInstance - start successful....
2024-01-27 19:46:21.241 [destination = example , address = /127.0.0.1:13306 , EventParser] WARN  c.a.o.c.p.inbound.mysql.rds.RdsBinlogEventParserProxy - ---> begin to find start position, it will be long time for reset or first position
2024-01-27 19:46:21.241 [destination = example , address = /127.0.0.1:13306 , EventParser] WARN  c.a.o.c.p.inbound.mysql.rds.RdsBinlogEventParserProxy - prepare to find start position just show master status
2024-01-27 19:46:22.484 [destination = example , address = /127.0.0.1:13306 , EventParser] WARN  c.a.o.c.p.inbound.mysql.rds.RdsBinlogEventParserProxy - ---> find start position successfully, EntryPosition[included=false,journalName=mysql-bin.000001,position=4,serverId=223344,gtid=<null>,timestamp=1706355127000] cost : 1231ms , the next step is binlog dump
```
## 关闭

```sh
sh bin/stop.sh
```


# client exmaple

参见：[https://github.com/alibaba/canal/wiki/ClientExample](https://github.com/alibaba/canal/wiki/ClientExample)

## 下载

下载 canal, [访问 release 页面 , 选择需要的包下载](https://github.com/alibaba/canal/releases/), 如以 `canal.example-1.1.7.tar.gz` 为例

```bash
wget https://github.com/alibaba/canal/releases/download/canal-1.1.7/canal.example-1.1.7.tar.gz
```

## 解压

```sh
cd ~/canal/client/
tar -zxvf canal.example-1.1.7.tar.gz

$ ls
bin  canal.example-1.1.7.tar.gz  canal.example-1.1.7.tar.gz:Zone.Identifier  conf  lib  logs
```

## 启动

```sh
sh startup.sh
```

直接看一下日志：

```bash
cd /home/houbinbin/canal/client/logs/example
tail -fn30 entry.log
```

## 插入数据

数据库插入数据：


```sql
insert into user_info (username) values ('u7');
```

对应的客户端日志：

```
================> binlog[mysql-bin.000001:4325] , executeTime : 1706356761000(2024-01-27 19:59:21) , gtid : () , delay : 335ms
 BEGIN ----> Thread id: 8
----------------> binlog[mysql-bin.000001:4481] , name[test_source,user_info] , eventType : INSERT , executeTime : 1706356761000(2024-01-27 19:59:21) , gtid : () , delay : 335 ms
id : 6    type=int unsigned    update=true
username : u7    type=varchar(128)    update=true
create_time : 2024-01-27 19:59:21    type=timestamp    update=true
update_time : 2024-01-27 19:59:21    type=timestamp    update=true
----------------
 END ----> transaction id: 351
================> binlog[mysql-bin.000001:4533] , executeTime : 1706356761000(2024-01-27 19:59:21) , gtid : () , delay : 336ms
```

# 小结 

canal 的设计理念其实已经非常先进了，对于日常的 mysql cdc 完全够用。

实际使用时，可以在 exmaple 的基础之上，做自己的业务能力增强。

不过还有一些类似的更强大的设计，比如 [Debezium-01-为捕获数据更改(change data capture,CDC)提供了一个低延迟的流式处理平台](https://houbb.github.io/2019/02/13/database-sharding-cdc-debezium)

# 参考资料 

https://github.com/alibaba/canal/wiki/QuickStart

* any list
{:toc}
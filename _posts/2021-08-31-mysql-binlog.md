---
layout: post
title: mysql binlog windows10 环境的开启和解析笔记
date: 2021-08-29 21:01:55 +0800
categories: [MySQL]
tags: [mysql, database, sh]
published: true
---

# windows 下 mysql 如何开启 binlog

## windows10 修改笔记

mysql 安装目录：D:\tool\mysql\mysql-5.7.31-winx64

修改 my.ini 文件：

```ini
[mysql]
# 设置mysql客户端默认字符集
default-character-set=utf8
[mysqld]
sql_mode='NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION,PIPES_AS_CONCAT,ANSI_QUOTES'
#设置3306端口
port = 3306
# 设置mysql的安装目录
basedir=D:/tool/mysql/mysql-5.7.31-winx64
# 设置mysql数据库的数据的存放目录
datadir=D:/tool/mysql/mysql-5.7.31-winx64/data
# 允许最大连接数
max_connections=200
# 服务端使用的字符集默认为8比特编码的latin1字符集
character-set-server=utf8
# 创建新表时将使用的默认存储引擎
default-storage-engine=INNODB
```

添加对应的 binlog 信息：

```ini
# Enable binary replication log and set the prefix, expiration, and log format.
# The prefix is arbitrary, expiration can be short for integration tests but would
# be longer on a production system. Row-level info is required for ingest to work.
# Server ID is required, but this will vary on production systems
server-id         = 223344
log_bin           = mysql-bin
expire_logs_days  = 10
binlog_format     = row
binlog_row_image  = FULL

# enable gtid mode
gtid_mode = on
enforce_gtid_consistency = on
```

## 重启服务


以 admin 权限启动命令行。

```
$ cd D:\tool\mysql\mysql-5.7.31-winx64\bin
$ net stop mysql
$ net start mysql
```

再次确认配置

```
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
5 rows in set, 1 warning (0.00 sec)
```

## 验证下 binlog 的效果

```sql
use etl;
```

插入新的数据：

```sql
insert into user_info (username) values ('bin-01');
insert into user_info (username) values ('bin-02');
insert into user_info (username) values ('bin-03');
insert into user_info (username) values ('bin-04');
insert into user_info (username) values ('bin-05');
```


发现会在我们配置的 data 文件夹 `D:\tool\mysql\mysql-5.7.31-winx64\data` 下面，有一个 Binlog

```
-rw-r--r-- 1 dh 197121     1559  1月 15 15:31 mysql-bin.000001
-rw-r--r-- 1 dh 197121       19  1月 15 15:26 mysql-bin.index
```

mysql-bin.000001 内容人应该无法直接读。

# MySQL Binary Log connector

MySQL Binary Log connector. 

@osheroff's fork of @shiyko's project, probably the "official" version of this. With help from the Debezium devs.

## 引入

```xml
<dependency>
    <groupId>com.zendesk</groupId>
    <artifactId>mysql-binlog-connector-java</artifactId>
    <version>0.25.0</version>
</dependency>
```

最初项目是作为开放复制器的一个分支开始的，但最终作为一个完整的重写。 

主要区别/特点：

- 自动二进制日志文件名/位置 / GTID 解析

- 可恢复的断开连接

- 可插拔故障转移策略

- binlog_checksum=CRC32 支持（适用于 MySQL 5.6.2+ 用户）

- 通过 TLS 的安全通信

- JMX 友好

- 实时统计

- Maven Central 中的可用性

- 没有第三方依赖

- 不同版本的 MySQL 版本的测试套件

- 如果您正在寻找其他语言中的类似内容，请查看 siddontang/go-mysql (Go)、noplay/python-mysql-replication (Python)。


或者从这里获取最新的 JAR。

## Reading binary log file

```java
File binlogFile = ...
EventDeserializer eventDeserializer = new EventDeserializer();
eventDeserializer.setCompatibilityMode(
    EventDeserializer.CompatibilityMode.DATE_AND_TIME_AS_LONG,
    EventDeserializer.CompatibilityMode.CHAR_AND_BINARY_AS_BYTE_ARRAY
);
BinaryLogFileReader reader = new BinaryLogFileReader(binlogFile, eventDeserializer);
try {
    for (Event event; (event = reader.readEvent()) != null; ) {
        ...
    }
} finally {
    reader.close();
}
```

## 利用 MySQL 复制流

先决条件：无论您计划为 BinaryLogClient 使用哪个用户，他都必须具有 REPLICATION SLAVE 权限。 

除非您自己指定 binlogFilename/binlogPosition（在这种情况下不会启动自动解析），否则您还需要授予 REPLICATION CLIENT。

```java
BinaryLogClient client = new BinaryLogClient("hostname", 3306, "username", "password");
EventDeserializer eventDeserializer = new EventDeserializer();
eventDeserializer.setCompatibilityMode(
    EventDeserializer.CompatibilityMode.DATE_AND_TIME_AS_LONG,
    EventDeserializer.CompatibilityMode.CHAR_AND_BINARY_AS_BYTE_ARRAY
);
client.setEventDeserializer(eventDeserializer);
client.registerEventListener(new EventListener() {

    @Override
    public void onEvent(Event event) {
        ...
    }
});
client.connect();
```

## 控制事件反序列化

您可能出于以下几个原因需要它：

您不想浪费时间反序列化不需要的事件；

没有为您感兴趣的事件类型定义 EventDataDeserializer（或者有但它包含一个错误）； 

您希望以不同的方式反序列化某些类型的事件（也许 *RowsEventData 应该包含表名而不是 id？）； 等等。

```java
EventDeserializer eventDeserializer = new EventDeserializer();

// do not deserialize EXT_DELETE_ROWS event data, return it as a byte array
eventDeserializer.setEventDataDeserializer(EventType.EXT_DELETE_ROWS,
    new ByteArrayEventDataDeserializer());

// skip EXT_WRITE_ROWS event data altogether
eventDeserializer.setEventDataDeserializer(EventType.EXT_WRITE_ROWS,
    new NullEventDataDeserializer());

// use custom event data deserializer for EXT_DELETE_ROWS
eventDeserializer.setEventDataDeserializer(EventType.EXT_DELETE_ROWS,
    new EventDataDeserializer() {
        ...
    });

BinaryLogClient client = ...
client.setEventDeserializer(eventDeserializer);
```

## Exposing BinaryLogClient through JMX

```java
MBeanServer mBeanServer = ManagementFactory.getPlatformMBeanServer();

BinaryLogClient binaryLogClient = ...
ObjectName objectName = new ObjectName("mysql.binlog:type=BinaryLogClient");
mBeanServer.registerMBean(binaryLogClient, objectName);

// following bean accumulates various BinaryLogClient stats
// (e.g. number of disconnects, skipped events)
BinaryLogClientStatistics stats = new BinaryLogClientStatistics(binaryLogClient);
ObjectName statsObjectName = new ObjectName("mysql.binlog:type=BinaryLogClientStatistics");
mBeanServer.registerMBean(stats, statsObjectName);
```

## Using SSL

```java
System.setProperty("javax.net.ssl.trustStore", "/path/to/truststore.jks");
System.setProperty("javax.net.ssl.trustStorePassword","truststore.password");
System.setProperty("javax.net.ssl.keyStore", "/path/to/keystore.jks");
System.setProperty("javax.net.ssl.keyStorePassword", "keystore.password");

BinaryLogClient client = ...
client.setSSLMode(SSLMode.VERIFY_IDENTITY);
```

# open-replicator

Open Replicator 是一个用 Java 编写的高性能 MySQL 二进制日志解析器。 

它展现了您可以实时解析、过滤和广播 binlog 事件的可能性。

## maven 

```xml
<dependency>
        <groupId>open-replicator</groupId>
        <artifactId>open-replicator</artifactId>
        <version>1.0.7</version>
</dependency>
```

## 使用

```java
final OpenReplicator or = new OpenReplicator();
or.setUser("root");
or.setPassword("123456");
or.setHost("localhost");
or.setPort(3306);
or.setServerId(6789);
or.setBinlogPosition(4);
or.setBinlogFileName("mysql_bin.000001");
or.setBinlogEventListener(new BinlogEventListener() {
    public void onEvents(BinlogEventV4 event) {
        // your code goes here
    }
});
or.start();

System.out.println("press 'q' to stop");
final BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
for(String line = br.readLine(); line != null; line = br.readLine()) {
    if(line.equals("q")) {
        or.stop();
        break;
    }
}
```


# 参考资料

https://github.com/osheroff/mysql-binlog-connector-java

https://github.com/whitesock/open-replicator

* any list
{:toc}
---
layout: post
title: mysql binlog
date: 2021-08-29 21:01:55 +0800
categories: [MySQL]
tags: [mysql, database, sh]
published: true
---

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

- 自动二进制日志文件名/位置 | GTID 解析

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
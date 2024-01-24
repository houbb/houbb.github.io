---
layout: post
title: ETL-24-apache SeaTunnel mysql cdc JSON 到自定义 neo4j 实战笔记 
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# mysql 准备

创建一个测试账户：

```sql
CREATE USER 'admin'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;
flush privileges;
```

# 建表

```sql
create database test;
use test;
```

创建测试表：


```sql
show create table person;
show create table t_distributed_lock;
show create table t_lock;
```

对应结果：

```sql
CREATE TABLE "person" (
  "ID" int(11) NOT NULL,
  "NAME" varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE "t_distributed_lock" (
  "id" bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  "lock_key" varchar(128) NOT NULL COMMENT '唯一约束',
  "lock_holder" varchar(32) NOT NULL DEFAULT '' COMMENT '锁的持有者标识',
  "lock_expire_time" bigint(20) NOT NULL DEFAULT '0' COMMENT '锁的到期时间',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id"),
  UNIQUE KEY "uk_lock_key" ("lock_key")
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COMMENT='数据库分布式锁表'

CREATE TABLE "t_lock" (
  "id" bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  "lock_key" varchar(128) NOT NULL COMMENT '唯一约束',
  "lock_holder" varchar(32) NOT NULL DEFAULT '' COMMENT '锁的持有者标识',
  "lock_expire_time" bigint(20) NOT NULL DEFAULT '0' COMMENT '锁的到期时间',
  "create_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  "update_time" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY ("id"),
  UNIQUE KEY "uk_lock_key" ("lock_key"),
  KEY "IX_KEY_HOLDER" ("lock_key","lock_expire_time")
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COMMENT='数据库分布式锁表'
```


# 类别转换报错

## 报错

场景：从 mysql 同步数据到 neo4j，如果 包含 bigdecimal 类别，那么就会报错失败。

```
Unable to convert java.math.BigDecimal to Neo4j Value
```

## 原因

java neo4j 4.4.9 驱动包，不支持 bigdecimal 类别。

## 解决方式

自己重新实现入库逻辑，如果是 bigdecimal，则转换为 string 入库。

# cdc 模式报错

## 场景

startup.mode = "initial"

使用 mysql cdc 进行数据同步：

```
2024-01-24 16:31:11,593 ERROR org.apache.seatunnel.core.starter.SeaTunnel - 

===============================================================================


2024-01-24 16:31:11,593 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Fatal Error, 

2024-01-24 16:31:11,593 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Please submit bug report in https://github.com/apache/seatunnel/issues

2024-01-24 16:31:11,593 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Reason:SeaTunnel job executed failed 

2024-01-24 16:31:11,594 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Exception StackTrace:org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
	at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
	at org.apache.seatunnel.example.engine.SeaTunnelEngineMysqlCdcJsonToNeo4jDefineExample.main(SeaTunnelEngineMysqlCdcJsonToNeo4jDefineExample.java:44)
Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: java.lang.RuntimeException: java.util.concurrent.ExecutionException: java.lang.RuntimeException: Generate Splits for table test.person error
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.requestSplit(SourceFlowLifeCycle.java:223)
	at org.apache.seatunnel.engine.server.task.context.SourceReaderContext.sendSplitRequest(SourceReaderContext.java:64)
	at org.apache.seatunnel.connectors.cdc.base.source.reader.IncrementalSourceReader.pollNext(IncrementalSourceReader.java:94)
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.collect(SourceFlowLifeCycle.java:150)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.collect(SourceSeaTunnelTask.java:95)
	at org.apache.seatunnel.engine.server.task.SeaTunnelTask.stateProcess(SeaTunnelTask.java:168)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.call(SourceSeaTunnelTask.java:100)
	at org.apache.seatunnel.engine.server.TaskExecutionService$BlockingWorker.run(TaskExecutionService.java:613)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)
Caused by: java.util.concurrent.ExecutionException: java.lang.RuntimeException: Generate Splits for table test.person error
	at com.hazelcast.spi.impl.operationservice.impl.InvocationFuture.returnOrThrowWithGetConventions(InvocationFuture.java:121)
	at com.hazelcast.spi.impl.operationservice.impl.InvocationFuture.resolveAndThrowIfException(InvocationFuture.java:100)
	at com.hazelcast.spi.impl.AbstractInvocationFuture.get(AbstractInvocationFuture.java:617)
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.requestSplit(SourceFlowLifeCycle.java:220)
	... 13 more
Caused by: java.lang.RuntimeException: Generate Splits for table test.person error
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.splitter.AbstractJdbcSourceChunkSplitter.generateSplits(AbstractJdbcSourceChunkSplitter.java:97)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.SnapshotSplitAssigner.getNext(SnapshotSplitAssigner.java:165)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.HybridSplitAssigner.getNext(HybridSplitAssigner.java:94)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.IncrementalSourceEnumerator.assignSplits(IncrementalSourceEnumerator.java:160)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.IncrementalSourceEnumerator.handleSplitRequest(IncrementalSourceEnumerator.java:81)
	at org.apache.seatunnel.engine.server.task.SourceSplitEnumeratorTask.requestSplit(SourceSplitEnumeratorTask.java:226)
	at org.apache.seatunnel.engine.server.task.operation.source.RequestSplitOperation.lambda$run$0(RequestSplitOperation.java:62)
	at org.apache.seatunnel.common.utils.RetryUtils.retryWithException(RetryUtils.java:48)
	at org.apache.seatunnel.engine.server.task.operation.source.RequestSplitOperation.run(RequestSplitOperation.java:52)
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123)
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102)
	at ------ submitted from ------.()
	at com.hazelcast.internal.util.ExceptionUtil.cloneExceptionWithFixedAsyncStackTrace(ExceptionUtil.java:336)
	at com.hazelcast.spi.impl.operationservice.impl.InvocationFuture.returnOrThrowWithGetConventions(InvocationFuture.java:112)
	... 16 more
Caused by: java.lang.UnsupportedOperationException: Incremental snapshot for tables requires primary key/unique key, but table test.person doesn't have primary key.
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.splitter.AbstractJdbcSourceChunkSplitter.getSplitColumn(AbstractJdbcSourceChunkSplitter.java:387)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.splitter.AbstractJdbcSourceChunkSplitter.generateSplits(AbstractJdbcSourceChunkSplitter.java:64)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.SnapshotSplitAssigner.getNext(SnapshotSplitAssigner.java:165)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.HybridSplitAssigner.getNext(HybridSplitAssigner.java:94)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.IncrementalSourceEnumerator.assignSplits(IncrementalSourceEnumerator.java:160)
	at org.apache.seatunnel.connectors.cdc.base.source.enumerator.IncrementalSourceEnumerator.handleSplitRequest(IncrementalSourceEnumerator.java:81)
	at org.apache.seatunnel.engine.server.task.SourceSplitEnumeratorTask.requestSplit(SourceSplitEnumeratorTask.java:226)
	at org.apache.seatunnel.engine.server.task.operation.source.RequestSplitOperation.lambda$run$0(RequestSplitOperation.java:62)
	at org.apache.seatunnel.common.utils.RetryUtils.retryWithException(RetryUtils.java:48)
	at org.apache.seatunnel.engine.server.task.operation.source.RequestSplitOperation.run(RequestSplitOperation.java:52)
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123)
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102)

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
```

## 原因

表必须有主键。

```
Caused by: java.lang.UnsupportedOperationException: Incremental snapshot for tables requires primary key/unique key, but table test.person doesn't have primary key.
```

## 解决方式

```sql
ALTER TABLE person ADD PRIMARY KEY(ID);
```

# mysql rowkind 不对的问题

## 问题

直接使用 mysql cdc 中的 COMPATIBLE_DEBEZIUM_JSON，但是发现对应的 SeaTunnelRow 默认是 INSERT。

这个是不对的。

只有对应的 fields[2] 中获取对应的 op 来判断。

```json
{"before":null,"after":{"ID":1,"NAME":"1"},"source":{"version":"1.6.4.Final","connector":"mysql","name":"merge","ts_ms":0,"snapshot":"false","db":"test","sequence":null,"table":"person","server_id":0,"gtid":null,"file":"","pos":0,"row":0,"thread":null,"query":null},"op":"r","ts_ms":1706086601778,"transaction":null}
```

## 解释

在 MySQL binlog 中，Debezium JSON 格式的 binlog 事件中，`op` 是表示操作类型的字段，用于指示事件执行的操作。

`op` 字段有几个可能的类别，代表不同的操作类型。以下是常见的 `op` 类别及其含义：

1. **`c` - Create（创建）**：表示新数据的插入或新记录的创建。

2. **`u` - Update（更新）**：表示对现有记录的更新或修改。

3. **`d` - Delete（删除）**：表示删除现有记录。

4. **`r` - Read（读取）**：有时用于表示只读的操作，例如 SELECT 查询。

这些操作类型用于描述在 MySQL 数据库中发生的不同类型的事件。Debezium 是一个开源的分布式数据库变更捕获系统，可以监听 MySQL 数据库的 binlog，并将变更事件以 JSON 格式输出，以便轻松地捕获和处理数据库的变更。在 Debezium JSON 格式中，`op` 字段是一个关键的标识，用于理解每个 binlog 事件的操作类型。

## 解释2

发现第二个问题：Debezium JSON 发现启动的时候，对应的 insert 语句，也变成了 r？

### 原因

> [Debezium 特性深入介绍](https://aws.amazon.com/cn/blogs/china/debezium-deep-dive/)

Debezium 支持自定义快照语句（select.statement.overrides），比如加上 WHERE 条件限制，就能只做局部快照。

为了区别于普通的插入操作，快照读取的消息其 op 字段会是 r。

### 解决方式

我们可以认为 op=r 也是 c，自己代码逻辑中做一下兼容。


# neo4j 工具

## 删除脚本

```
MATCH (n:merge_person) delete n;
MATCH (n:merge_t_distributed_lock) delete n;
MATCH (n:merge_t_lock) delete n;
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/contribution/contribute-transform-v2-guide

* any list
{:toc}
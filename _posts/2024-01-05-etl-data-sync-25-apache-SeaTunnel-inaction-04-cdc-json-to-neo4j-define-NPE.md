---
layout: post
title: ETL-25-apache SeaTunnel 实战 mysql CDC json 到 neo4j 自定义插件 NPE java.util.concurrent.ExecutionException java.lang.NullPointerException
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 拓展阅读

[ETL-10-apache SeaTunnel Connector v2 source mysql cdc](https://houbb.github.io/2024/01/05/etl-data-sync-10-apache-SeaTunnel-connector-v2-source-mysql-cdc)

[mysql binlog](https://houbb.github.io/2021/08/29/mysql-binlog)

# 说明 

mysql cdc json 格式，发送到 neo4j 持久化。

但是执行一段时间以后，会报错，服务直接挂掉。

https://github.com/apache/seatunnel/issues/5694

https://github.com/apache/seatunnel/pull/5695

## STREAMING 任务配置

- cdc.conf

```yaml
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  job.name = "allInOne-CDC-JSON-STREAMING"
  checkpoint.interval = 10000
}
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["test.role", "test.role_extra"]

        startup.mode = "initial"
        format = compatible_debezium_json
        debezium = {
           # include schema into kafka message
           key.converter.schemas.enable = false
           value.converter.schemas.enable = false
           # include dd1
           include.schema.changes = false
           # topic.prefix
           database.server.name = "merge"
        }
        result_table_name="allInOne-CDC-JSON-result"
    }

}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    MysqlToNeo4j {
            source_table_name = "allInOne-CDC-JSON-result"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = compatible_debezium_json

            queryConfigList = [
                # 省略
            ]
    }
}
```

## 配置

- seatunnel.yaml

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 100
            timeout: 100
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\

#            storage:
#                type: hdfs
#                max-retained: 3
#                plugin-config:
#                    namespace: /tmp/seatunnel/checkpoint_snapshot/
#                    storage.type: hdfs
#                    fs.defaultFS: file:///tmp/
```

这两个参数比较小的时候，会报错 timeout。


```
checkpoint:
            interval: 100
            timeout: 100
```


## 报错

```
2024-02-21 10:49:07,695 INFO  org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand - run shutdown hook because get close signal
2024-02-21 10:49:07,692 ERROR org.apache.seatunnel.core.starter.SeaTunnel - 

===============================================================================


2024-02-21 10:49:07,692 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Fatal Error, 

2024-02-21 10:49:07,692 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Please submit bug report in https://github.com/apache/seatunnel/issues

2024-02-21 10:49:07,692 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Reason:SeaTunnel job executed failed 

2024-02-21 10:49:07,694 ERROR org.apache.seatunnel.core.starter.SeaTunnel - Exception StackTrace:org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
	at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
	at org.apache.seatunnel.example.engine.cdc.MysqlCdcDefaultToJdbcMultiTablesExampleRefKeyNullV013.main(MysqlCdcDefaultToJdbcMultiTablesExampleRefKeyNullV013.java:47)
Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:255)
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
 
2024-02-21 10:49:07,694 ERROR org.apache.seatunnel.core.starter.SeaTunnel - 
===============================================================================



Exception in thread "main" org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
	at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
	at org.apache.seatunnel.example.engine.cdc.MysqlCdcDefaultToJdbcMultiTablesExampleRefKeyNullV013.main(MysqlCdcDefaultToJdbcMultiTablesExampleRefKeyNullV013.java:47)
Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:255)
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532)
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511)
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266)
	at java.util.concurrent.FutureTask.run(FutureTask.java)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180)
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)

	at org.apache.seatunnel.engine.client.job.ClientJobProxy.waitForJobComplete(ClientJobProxy.java:122)
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:184)
	... 2 more
```

这个是任务在没有完成之前结束，Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml

那我调整大一些。

# 调整大一些

## 配置

- seatunnel.yaml

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 1000
            timeout: 1000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\

#            storage:
#                type: hdfs
#                max-retained: 3
#                plugin-config:
#                    namespace: /tmp/seatunnel/checkpoint_snapshot/
#                    storage.type: hdfs
#                    fs.defaultFS: file:///tmp/
```

看源码：

```java
    public static final Option<Integer> CHECKPOINT_INTERVAL =
            Options.key("interval")
                    .intType()
                    .defaultValue(300000)
                    .withDescription(
                            "The interval (in milliseconds) between two consecutive checkpoints.");

    public static final Option<Integer> CHECKPOINT_TIMEOUT =
            Options.key("timeout")
                    .intType()
                    .defaultValue(30000)
                    .withDescription("The timeout (in milliseconds) for a checkpoint.");
```

但是我们执行的是一个流任务这个单位应该是毫秒。

然后发现会有另外一个错误：

```

2024-02-21 11:04:22,713 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job allInOne-CDC-JSON-STREAMING-refkey-null-v0_13.conf (812519818174398465), Pipeline: [(1/1)] cancel error will retry
java.lang.InterruptedException: null
	at java.util.concurrent.CompletableFuture.reportGet(CompletableFuture.java:347) ~[?:1.8.0_371]
	at java.util.concurrent.CompletableFuture.get(CompletableFuture.java:1908) ~[?:1.8.0_371]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipelineTasks(SubPlan.java:461) ~[classes/:?]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:417) ~[classes/:?]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[classes/:?]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[classes/:?]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_371]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[classes/:?]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[classes/:?]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[classes/:?]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532) ~[classes/:?]
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511) [?:1.8.0_371]
	at java.util.concurrent.FutureTask.run$$$capture(FutureTask.java:266) [?:1.8.0_371]
	at java.util.concurrent.FutureTask.run(FutureTask.java) [?:1.8.0_371]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180) [?:1.8.0_371]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293) [?:1.8.0_371]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_371]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_371]
	at java.lang.Thread.run(Thread.java:750) [?:1.8.0_371]
2024-02-21 11:04:22,715 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job allInOne-CDC-JSON-STREAMING-refkey-null-v0_13.conf (812519818174398465), Pipeline: [(1/1)] count = 1
2024-02-21 11:04:22,721 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job allInOne-CDC-JSON-STREAMING-refkey-null-v0_13.conf (812519818174398465), Pipeline: [(1/1)] count = 0
2024-02-21 11:04:22,724 ERROR org.apache.seatunnel.engine.server.scheduler.PipelineBaseScheduler - scheduler Job allInOne-CDC-JSON-STREAMING-refkey-null-v0_13.conf (812519818174398465), Pipeline: [(1/1)] stop. Because org.apache.seatunnel.engine.common.exception.SchedulerNotAllowException: Job allInOne-CDC-JSON-STREAMING-refkey-null-v0_13.conf (812519818174398465), Pipeline: [(1/1)] turn to state CANCELING, skip SCHEDULED this pipeline.
	at org.apache.seatunnel.engine.server.scheduler.PipelineBaseScheduler.handlePipelineStateTurnError(PipelineBaseScheduler.java:370)
	at org.apache.seatunnel.engine.server.scheduler.PipelineBaseScheduler.schedulerPipeline(PipelineBaseScheduler.java:92)
	at org.apache.seatunnel.engine.server.scheduler.PipelineBaseScheduler.reSchedulerPipeline(PipelineBaseScheduler.java:362)
	at org.apache.seatunnel.engine.server.master.JobMaster.reSchedulerPipeline(JobMaster.java:395)
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.restorePipeline(SubPlan.java:580)
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.lambda$addPhysicalVertexCallBack$2(SubPlan.java:208)
	at java.util.concurrent.CompletableFuture.uniAccept(CompletableFuture.java:670)
	at java.util.concurrent.CompletableFuture$UniAccept.tryFire$$$capture(CompletableFuture.java:646)
	at java.util.concurrent.CompletableFuture$UniAccept.tryFire(CompletableFuture.java)
	at java.util.concurrent.CompletableFuture$Completion.run(CompletableFuture.java:456)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:750)
```


## 最大值的类别

看代码类别虽然是 long，但是实际上会做 int 的最大值校验。

所以最大值最多只能是 int.maxValue。

# 所以这个值应该怎么设置呢？

直接设置的非常大？

TODO 还是感觉没有特别理解这个参数的含义。


后来发现设置了最大值，依然报错，所以应该不是 checkpoint 的问题。

## 其他的问题

后来在 seatunnel 的 logs 下面，看到了 

```
Caused by io.debezizium.DebeziziumException：Error reading MySQL variables: The last packet 
```

大概意思就是读取信息超时了。

建议给 JDBC url 添加上对应的属性 `autoReconnect=true` 来解决这个问题。


### mysql 自动断开

28800单位是秒转化成小时就是8小时，看出MySQL的默认设置，当一个连接的空闲时间超过8小时后，MySQL就会断开该连接。

所以发现问题出在如果超过这个wait_timeout时间(默认是8小时)对数据库没有任何操作，那么MySQL会自动关闭数据库连接以节省资源。

数据库连接自动断开的问题确实是在第二天发生了，也就是在一个晚上没有对数据库进行操作(显然超过了8小时)的情况下发生的这个问题。

```sql
show global variables like '%wait_timeout%';
```

对应的值：

```
+--------------------------+----------+
| Variable_name            | Value    |
+--------------------------+----------+
| innodb_lock_wait_timeout | 50       |
| lock_wait_timeout        | 31536000 |
| mysqlx_wait_timeout      | 28800    |
| wait_timeout             | 28800    |
+--------------------------+----------+
4 rows in set (0.01 sec)
```

这个测试环境可能设置的更加短，也不太好修改，应该是为了解决无用链接占用问题。

看了一下测试环境这个属性只有 1800，也就是 30min。

### 解决方式

```
jdbc:mysql://127.0.0.1:3306/stock_tweet?autoReconnect=true 
```

这个参数表示在mysql超时断开连接后会自动重新连接，配置的话，只需要在连接mysql的语句写上autoReconnect=true：

同时可以看到官网不推荐使用这个参数，因为它有一些副作用，具体介绍下：

- 原有连接上的事务将会被回滚，事务的提交模式将会丢失；

- 原有连接持有的表的锁将会全部释放；

- 原有连接关联的会话Session将会丢失，重新恢复的连接关联的将会是一个新的会话Session；

- 原有连接定义的用户变量将会丢失；

- 原有连接定义的预编译SQL将会丢失；

- 原有连接失效，新的连接恢复后，MySQL将会使用新的记录行来存储连接中的性能数据；

## 测试

```conf
source{
    MySQL-CDC {
        base-url = "jdbc:mysql://127.0.0.1:3306/test?autoReconnect=true&useSSL=false&serverTimezone=Asia/Shanghai&autoReconnect=true"
        driver = "com.mysql.jdbc.Driver"
        username = "admin"
        password = "123456"
        table-names = ["test.role", "test.role_extra"]

        startup.mode = "initial"
        format = compatible_debezium_json
        debezium = {
           # include schema into kafka message
           key.converter.schemas.enable = false
           value.converter.schemas.enable = false
           # include dd1
           include.schema.changes = false
           # topic.prefix
           database.server.name = "merge"
        }
        result_table_name="allInOne-CDC-JSON-result"
    }

}
```

给这里的 cdc url 加上 autoReconnect=true 属性。

# NEXT

学习一下 checkpoint 的源码？

这部分的作用到底是什么？

# 参考资料

https://github.com/apache/seatunnel/issues/5777

https://github.com/apache/seatunnel/issues/6013

https://github.com/apache/seatunnel/issues/5555

https://github.com/apache/seatunnel/issues/5694

https://www.51cto.com/article/707891.html

* any list
{:toc}
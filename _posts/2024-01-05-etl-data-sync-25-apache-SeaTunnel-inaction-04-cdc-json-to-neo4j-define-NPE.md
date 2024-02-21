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


# 所以这个值应该怎么设置呢？

直接设置的非常大？

TODO 还是感觉没有特别理解这个参数的含义。

# 参考资料

https://github.com/apache/seatunnel/issues/5777

https://github.com/apache/seatunnel/issues/6013

https://github.com/apache/seatunnel/issues/5555

https://github.com/apache/seatunnel/issues/5694

* any list
{:toc}
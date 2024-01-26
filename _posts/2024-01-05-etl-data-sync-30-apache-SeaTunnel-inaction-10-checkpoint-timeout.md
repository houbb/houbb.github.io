---
layout: post
title: ETL-30-apache SeaTunnel 实战 Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 场景

seatunnel 版本: v2.3.3

如果 batch 从数据库拉取一个比较大的数据。

但是执行的过程中，会遇到异常：

```
2023-10-26 15:27:04,904 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - trigger checkpoint failed
org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
```


类似这个：[https://github.com/apache/seatunnel/issues/5722](https://github.com/apache/seatunnel/issues/5722)

```
2023-10-26 15:27:04,899 INFO  org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - wait checkpoint completed: 7
2023-10-26 15:27:04,903 INFO  org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - timeout checkpoint: 769824035470049281/1/1, CHECKPOINT_TYPE
2023-10-26 15:27:04,904 INFO  org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - start clean pending checkpoint cause Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
2023-10-26 15:27:04,904 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - trigger checkpoint failed
org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
        at org.apache.seatunnel.engine.server.checkpoint.PendingCheckpoint.abortCheckpoint(PendingCheckpoint.java:172) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$cleanPendingCheckpoint$19(CheckpointCoordinator.java:645) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.ConcurrentHashMap$ValuesView.forEach(ConcurrentHashMap.java:4770) ~[?:?]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.cleanPendingCheckpoint(CheckpointCoordinator.java:643) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:261) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:515) ~[?:?]
        at java.util.concurrent.FutureTask.run(FutureTask.java:264) ~[?:?]
        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:304) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[?:?]
        at java.lang.Thread.run(Thread.java:834) [?:?]
2023-10-26 15:27:04,904 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - trigger checkpoint failed
org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
        at org.apache.seatunnel.engine.server.checkpoint.PendingCheckpoint.abortCheckpoint(PendingCheckpoint.java:172) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$cleanPendingCheckpoint$19(CheckpointCoordinator.java:645) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.ConcurrentHashMap$ValuesView.forEach(ConcurrentHashMap.java:4770) ~[?:?]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.cleanPendingCheckpoint(CheckpointCoordinator.java:643) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:261) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:515) ~[?:?]
        at java.util.concurrent.FutureTask.run(FutureTask.java:264) ~[?:?]
        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:304) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[?:?]
        at java.lang.Thread.run(Thread.java:834) [?:?]
2023-10-26 15:27:04,904 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - trigger checkpoint failed
org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml
        at org.apache.seatunnel.engine.server.checkpoint.PendingCheckpoint.abortCheckpoint(PendingCheckpoint.java:172) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$cleanPendingCheckpoint$19(CheckpointCoordinator.java:645) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.ConcurrentHashMap$ValuesView.forEach(ConcurrentHashMap.java:4770) ~[?:?]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.cleanPendingCheckpoint(CheckpointCoordinator.java:643) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:261) ~[seatunnel-starter.jar:2.3.3]
        at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532) ~[seatunnel-starter.jar:2.3.3]
        at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:515) ~[?:?]
        at java.util.concurrent.FutureTask.run(FutureTask.java:264) ~[?:?]
        at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:304) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1128) ~[?:?]
        at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628) ~[?:?]
        at java.lang.Thread.run(Thread.java:834) [?:?]
```

## 解决方案

按照提示，我们直接修改 seatunnel.yaml 中的 timeout 配置即可。

and i tried increasing checkpoint.timeout and checkpoint.interval in jobConfig env, it worked!

i met this in 2.3.4 version , like: Caused by: org.apache.seatunnel.engine.common.exception.SeaTunnelEngineException: org.apache.seatunnel.engine.server.checkpoint.CheckpointException: Checkpoint expired before completing. Please increase checkpoint timeout in the seatunnel.yaml or jobConfig env. and i tried increasing checkpoint.timeout and checkpoint.interval in jobConfig env, it worked!

## 个人理解

还是在 jobConfig env 中设置比较合理。因为不同的任务不同。

jobConfig 这里只有 interval

建议把 seatunnel.yaml 的配置提升到一个合理的值，比如默认值提升100倍？

10s 检测一次，并且 60min 才超时之类的。

# 实际测试


# 参考资料

https://github.com/apache/seatunnel/issues/5555

[[Bug] [Zeta Engine] the checkpoint lock cause checkpoint-flow blocking with long time](https://github.com/apache/seatunnel/issues/5694)

* any list
{:toc}
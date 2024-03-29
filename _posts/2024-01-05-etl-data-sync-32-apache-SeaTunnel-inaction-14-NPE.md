---
layout: post
title: ETL-33-apache SeaTunnel 实战 14 执行的任务比较慢遇到异常 java.util.concurrent.CompletionException java.lang.NullPointerException
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 参考资料

执行的任务比较长，checkpoint 的配置在文件：


## 异常

大概类似于

> [[Bug] [SeaTunnel Engine] NullPointerException when send data to doris](https://github.com/apache/seatunnel/issues/5777)

### 发生了什么事情：

我想将一亿条数据发送到 Doris，但任务总是因为 NullPointerException 而失败。我尝试了三次。

Doris 版本：1.2.7.1
Doris 表：
```sql
CREATE TABLE IF NOT EXISTS olap.seatunnel_fake (
    id BIGINT COMMENT "主键",
    name VARCHAR(256) COMMENT "名称",
    age INT COMMENT "年龄",
    time DATETIME COMMENT "时间"
) DUPLICATE KEY(id, name, age) DISTRIBUTED BY HASH(id) BUCKETS 8 PROPERTIES ("replication_num" = "1");
```

SeaTunnel 版本：
SeaTunnel 2.3.3
Connector Doris 2.3.3
Connector Fake 2.3.3


### SeaTunnel Config

```conf
env {
  execution.parallelism = 1
  job.mode = "BATCH"
  checkpoint.interval = 10000
}

source {
  FakeSource {
    result_table_name = "user"
    row.num = 100000000
    int.min = 1
    int.max = 120
    bigint.min = 1
    bigint.max = 10000000
    schema = {
      fields {
	id = "bigint"
        name = "string"
        age = "int"
	time = "timestamp"
      }
    }
  }
}

sink {
  Doris {
    source_table_name = "user"
    fenodes = "10.58.33.158:8030"
    username = "root"
    password = ""
    table.identifier = "olap.seatunnel_user"
    sink.label-prefix = "test-seatunnel"
    doris.config {
      format = "json"
      read_json_by_line = "true"
    }
  }
}
```

### Error Exception

```
2023-11-02 17:47:51,825 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - report error from task
org.apache.seatunnel.common.utils.SeaTunnelException: java.lang.RuntimeException: java.util.concurrent.CompletionException: java.lang.NullPointerException
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.received(IntermediateBlockingQueue.java:41)
	at org.apache.seatunnel.engine.server.task.flow.IntermediateQueueFlowLifeCycle.received(IntermediateQueueFlowLifeCycle.java:46)
	at org.apache.seatunnel.engine.server.task.flow.IntermediateQueueFlowLifeCycle.received(IntermediateQueueFlowLifeCycle.java:28)
	at org.apache.seatunnel.engine.server.task.SeaTunnelSourceCollector.sendRecordToNext(SeaTunnelSourceCollector.java:139)
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.triggerBarrier(SourceFlowLifeCycle.java:268)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.triggerBarrier(SourceSeaTunnelTask.java:112)
	at org.apache.seatunnel.engine.server.task.operation.checkpoint.BarrierFlowOperation.lambda$null$0(BarrierFlowOperation.java:90)
	at java.util.concurrent.CompletableFuture$AsyncRun.run(CompletableFuture.java:1640)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
Caused by: java.util.concurrent.CompletionException: java.lang.NullPointerException
	at com.hazelcast.spi.impl.AbstractInvocationFuture.returnOrThrowWithJoinConventions(AbstractInvocationFuture.java:819)
	at com.hazelcast.spi.impl.AbstractInvocationFuture.resolveAndThrowWithJoinConvention(AbstractInvocationFuture.java:835)
	at com.hazelcast.spi.impl.AbstractInvocationFuture.join(AbstractInvocationFuture.java:553)
	at org.apache.seatunnel.engine.server.task.SeaTunnelTask.ack(SeaTunnelTask.java:348)
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.handleRecord(IntermediateBlockingQueue.java:67)
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.received(IntermediateBlockingQueue.java:39)
	... 10 more
Caused by: java.lang.NullPointerException
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.acknowledgeTask(CheckpointCoordinator.java:682)
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.acknowledgeTask(CheckpointManager.java:270)
	at org.apache.seatunnel.engine.server.checkpoint.operation.TaskAcknowledgeOperation.run(TaskAcknowledgeOperation.java:81)
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123)
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102)

	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.reportCheckpointErrorFromTask(CheckpointCoordinator.java:344) [seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.reportCheckpointErrorFromTask(CheckpointManager.java:188) [seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.operation.CheckpointErrorReportOperation.run(CheckpointErrorReportOperation.java:48) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102) [seatunnel-starter.jar:2.3.3]
2023-11-02 17:47:51,825 INFO  org.apache.http.impl.execchain.RetryExec - I/O exception (java.net.SocketException) caught when processing request to {}->http://10.58.33.158:8040: Socket closed
2023-11-02 17:47:51,825 ERROR org.apache.seatunnel.engine.server.checkpoint.operation.TaskAcknowledgeOperation - [localhost]:5801 [seatunnel-121748] [5.1] null
java.lang.NullPointerException: null
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.acknowledgeTask(CheckpointCoordinator.java:682) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.acknowledgeTask(CheckpointManager.java:270) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.operation.TaskAcknowledgeOperation.run(TaskAcknowledgeOperation.java:81) ~[seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102) [seatunnel-starter.jar:2.3.3]
2023-11-02 17:47:51,826 ERROR org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator - report error from task
org.apache.seatunnel.common.utils.SeaTunnelException: java.lang.RuntimeException: java.util.concurrent.CompletionException: java.lang.NullPointerException
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.received(IntermediateBlockingQueue.java:41)
	at org.apache.seatunnel.engine.server.task.flow.IntermediateQueueFlowLifeCycle.received(IntermediateQueueFlowLifeCycle.java:46)
	at org.apache.seatunnel.engine.server.task.flow.IntermediateQueueFlowLifeCycle.received(IntermediateQueueFlowLifeCycle.java:28)
	at org.apache.seatunnel.engine.server.task.SeaTunnelSourceCollector.sendRecordToNext(SeaTunnelSourceCollector.java:139)
	at org.apache.seatunnel.engine.server.task.flow.SourceFlowLifeCycle.triggerBarrier(SourceFlowLifeCycle.java:268)
	at org.apache.seatunnel.engine.server.task.SourceSeaTunnelTask.triggerBarrier(SourceSeaTunnelTask.java:112)
	at org.apache.seatunnel.engine.server.task.operation.checkpoint.BarrierFlowOperation.lambda$null$0(BarrierFlowOperation.java:90)
	at java.util.concurrent.CompletableFuture$AsyncRun.run(CompletableFuture.java:1640)
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149)
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624)
	at java.lang.Thread.run(Thread.java:748)
Caused by: java.util.concurrent.CompletionException: java.lang.NullPointerException
	at com.hazelcast.spi.impl.AbstractInvocationFuture.returnOrThrowWithJoinConventions(AbstractInvocationFuture.java:819)
	at com.hazelcast.spi.impl.AbstractInvocationFuture.resolveAndThrowWithJoinConvention(AbstractInvocationFuture.java:835)
	at com.hazelcast.spi.impl.AbstractInvocationFuture.join(AbstractInvocationFuture.java:553)
	at org.apache.seatunnel.engine.server.task.SeaTunnelTask.ack(SeaTunnelTask.java:348)
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.handleRecord(IntermediateBlockingQueue.java:67)
	at org.apache.seatunnel.engine.server.task.group.queue.IntermediateBlockingQueue.received(IntermediateBlockingQueue.java:39)
	... 10 more
Caused by: java.lang.NullPointerException
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.acknowledgeTask(CheckpointCoordinator.java:682)
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.acknowledgeTask(CheckpointManager.java:270)
	at org.apache.seatunnel.engine.server.checkpoint.operation.TaskAcknowledgeOperation.run(TaskAcknowledgeOperation.java:81)
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248)
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139)
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123)
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102)

	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.reportCheckpointErrorFromTask(CheckpointCoordinator.java:344) [seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.reportCheckpointErrorFromTask(CheckpointManager.java:188) [seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.operation.CheckpointErrorReportOperation.run(CheckpointErrorReportOperation.java:48) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.Operation.call(Operation.java:189) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.call(OperationRunnerImpl.java:273) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:248) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationservice.impl.OperationRunnerImpl.run(OperationRunnerImpl.java:213) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:175) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.process(OperationThread.java:139) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.spi.impl.operationexecutor.impl.OperationThread.executeRun(OperationThread.java:123) [seatunnel-starter.jar:2.3.3]
	at com.hazelcast.internal.util.executor.HazelcastManagedThread.run(HazelcastManagedThread.java:102) [seatunnel-starter.jar:2.3.3]
2023-11-02 17:47:51,838 INFO  org.apache.seatunnel.engine.server.master.JobMaster - release the pipeline Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] resource
2023-11-02 17:47:51,839 INFO  org.apache.seatunnel.engine.server.service.slot.DefaultSlotService - received slot release request, jobID: 772395272109031425, slot: SlotProfile{worker=[localhost]:5801, slotID=1, ownerJobID=772395272109031425, assigned=true, resourceProfile=ResourceProfile{cpu=CPU{core=0}, heapMemory=Memory{bytes=0}}, sequence='db5f11ec-73f2-4f11-a6e2-ce5e1bf4925c'}
2023-11-02 17:47:51,839 INFO  org.apache.seatunnel.engine.server.service.slot.DefaultSlotService - received slot release request, jobID: 772395272109031425, slot: SlotProfile{worker=[localhost]:5801, slotID=2, ownerJobID=772395272109031425, assigned=true, resourceProfile=ResourceProfile{cpu=CPU{core=0}, heapMemory=Memory{bytes=0}}, sequence='db5f11ec-73f2-4f11-a6e2-ce5e1bf4925c'}
2023-11-02 17:47:53,817 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] cancel error will retry
java.lang.InterruptedException: null
	at java.util.concurrent.CompletableFuture.reportGet(CompletableFuture.java:347) ~[?:1.8.0_272]
	at java.util.concurrent.CompletableFuture.get(CompletableFuture.java:1908) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipelineTasks(SubPlan.java:461) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:417) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[seatunnel-starter.jar:2.3.3]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$9(CheckpointCoordinator.java:532) ~[seatunnel-starter.jar:2.3.3]
	at java.util.concurrent.Executors$RunnableAdapter.call(Executors.java:511) [?:1.8.0_272]
	at java.util.concurrent.FutureTask.run(FutureTask.java:266) [?:1.8.0_272]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.access$201(ScheduledThreadPoolExecutor.java:180) [?:1.8.0_272]
	at java.util.concurrent.ScheduledThreadPoolExecutor$ScheduledFutureTask.run(ScheduledThreadPoolExecutor.java:293) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_272]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_272]
2023-11-02 17:47:53,817 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] count = 1
2023-11-02 17:47:53,818 INFO  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] turn to end state FAILED.
2023-11-02 17:47:53,818 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] count = 0
2023-11-02 17:47:53,818 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] is in end state FAILED, can not be cancel
2023-11-02 17:47:53,818 INFO  org.apache.seatunnel.engine.server.dag.physical.PhysicalPlan - cancel job Job SeaTunnel_Job (772395272109031425) because makeJobEndWhenPipelineEnded is true
2023-11-02 17:47:53,818 ERROR org.apache.seatunnel.engine.server.dag.physical.SubPlan - Pipeline is trying to leave terminal state FAILED
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] cancel error
java.lang.IllegalStateException: Pipeline is trying to leave terminal state FAILED
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.updatePipelineState(SubPlan.java:348) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:414) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[seatunnel-starter.jar:2.3.3]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:251) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$7(CheckpointCoordinator.java:474) ~[seatunnel-starter.jar:2.3.3]
	at java.util.concurrent.CompletableFuture.uniWhenComplete(CompletableFuture.java:774) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$UniWhenComplete.tryFire(CompletableFuture.java:750) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$Completion.run(CompletableFuture.java:456) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_272]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_272]
2023-11-02 17:47:53,819 INFO  org.apache.seatunnel.engine.server.dag.physical.PhysicalPlan - Job SeaTunnel_Job (772395272109031425) turn from state RUNNING to CANCELLING.
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] count = 0
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] is in end state FAILED, can not be cancel
2023-11-02 17:47:53,819 ERROR org.apache.seatunnel.engine.server.dag.physical.SubPlan - Pipeline is trying to leave terminal state FAILED
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] cancel error
java.lang.IllegalStateException: Pipeline is trying to leave terminal state FAILED
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.updatePipelineState(SubPlan.java:348) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:414) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[seatunnel-starter.jar:2.3.3]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:251) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$7(CheckpointCoordinator.java:474) ~[seatunnel-starter.jar:2.3.3]
	at java.util.concurrent.CompletableFuture.uniWhenComplete(CompletableFuture.java:774) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$UniWhenComplete.tryFire(CompletableFuture.java:750) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$Completion.run(CompletableFuture.java:456) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_272]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_272]
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] count = 0
2023-11-02 17:47:53,819 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] is in end state FAILED, can not be cancel
2023-11-02 17:47:53,820 ERROR org.apache.seatunnel.engine.server.dag.physical.SubPlan - Pipeline is trying to leave terminal state FAILED
2023-11-02 17:47:53,820 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] cancel error
java.lang.IllegalStateException: Pipeline is trying to leave terminal state FAILED
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.updatePipelineState(SubPlan.java:348) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:414) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[seatunnel-starter.jar:2.3.3]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:251) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$7(CheckpointCoordinator.java:474) ~[seatunnel-starter.jar:2.3.3]
	at java.util.concurrent.CompletableFuture.uniWhenComplete(CompletableFuture.java:774) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$UniWhenComplete.tryFire(CompletableFuture.java:750) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$Completion.run(CompletableFuture.java:456) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_272]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_272]
2023-11-02 17:47:53,820 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - start cancel job Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] count = 0
2023-11-02 17:47:53,820 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] is in end state FAILED, can not be cancel
2023-11-02 17:47:53,820 ERROR org.apache.seatunnel.engine.server.dag.physical.SubPlan - Pipeline is trying to leave terminal state FAILED
2023-11-02 17:47:53,820 WARN  org.apache.seatunnel.engine.server.dag.physical.SubPlan - Job SeaTunnel_Job (772395272109031425), Pipeline: [(1/1)] cancel error
java.lang.IllegalStateException: Pipeline is trying to leave terminal state FAILED
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.updatePipelineState(SubPlan.java:348) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.cancelPipeline(SubPlan.java:414) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.dag.physical.SubPlan.handleCheckpointError(SubPlan.java:659) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.master.JobMaster.lambda$handleCheckpointError$2(JobMaster.java:341) ~[seatunnel-starter.jar:2.3.3]
	at java.util.ArrayList.forEach(ArrayList.java:1259) ~[?:1.8.0_272]
	at org.apache.seatunnel.engine.server.master.JobMaster.handleCheckpointError(JobMaster.java:338) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointManager.handleCheckpointError(CheckpointManager.java:180) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:266) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.handleCoordinatorError(CheckpointCoordinator.java:251) ~[seatunnel-starter.jar:2.3.3]
	at org.apache.seatunnel.engine.server.checkpoint.CheckpointCoordinator.lambda$null$7(CheckpointCoordinator.java:474) ~[seatunnel-starter.jar:2.3.3]
	at java.util.concurrent.CompletableFuture.uniWhenComplete(CompletableFuture.java:774) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$UniWhenComplete.tryFire(CompletableFuture.java:750) [?:1.8.0_272]
	at java.util.concurrent.CompletableFuture$Completion.run(CompletableFuture.java:456) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1149) [?:1.8.0_272]
	at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:624) [?:1.8.0_272]
	at java.lang.Thread.run(Thread.java:748) [?:1.8.0_272]
```


# 如何解决？


## 一些回答

A1

```
我也遇到了类似的情况，我在使用 Hive 场景（数据量：一亿以上）向 Doris 传输数据时遇到了问题。我发现问题的原因是当数据量很大时，栅栏消息滞后，导致检查点超时，而检查点超时又导致回滚任务。我认为可以采用类似 Flink 的解决方案，提高栅栏消息的优先级。
```

> [[Fix][Zeta] Fix CheckpointCoordinator report NPE when ack not existed pending checkpoint](https://github.com/apache/seatunnel/pull/5909)



## 启动脚本调整

或者源头为 cdc，能否把每一次的大小修改小一点

https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/MySQL-CDC

snapshot.fetch.size=1024 整数类型

优化的思路：也可以考虑一下，为什么性能这么差？3/s。

后来发现，依然会报错。可见这个没有用。

## 配置文件

- seatunnel.yaml

可以把这里的检查间隔修改大一些，一个小时？

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
```

这两个单位应该都是 integer，单位毫秒。

所以也不能太大。


可以考虑把时间间隔调整的非常大，然后每天定时用 cron 触发保存 checkpoint?





# 参考资料

https://github.com/apache/seatunnel/issues/5555

* any list
{:toc}
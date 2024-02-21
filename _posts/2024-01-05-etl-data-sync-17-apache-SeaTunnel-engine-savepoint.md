---
layout: post
title: ETL-17-apache SeaTunnel Engine savepoint 如何根据保存点恢复任务？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# savepoint 和使用 savepoint 进行恢复

savepoint 是使用检查点创建的，是作业执行状态的全局镜像，可用于作业或 SeaTunnel 的停止和恢复、升级等操作。

# 使用 savepoint

要使用 savepoint，您需要确保作业使用的连接器支持检查点，否则可能会导致数据丢失或重复。

# 确保作业正在运行

使用以下命令触发 savepoint：

```bash
./bin/seatunnel.sh -s {jobId}
```
执行成功后，将保存检查点数据并结束任务。

# 使用 savepoint 进行恢复

使用 jobId 从 savepoint 恢复

```bash
./bin/seatunnel.sh -c {jobConfig} -r {jobId}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/seatunnel-engine/savepoint

* any list
{:toc}
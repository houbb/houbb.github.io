---
layout: post
title: ETL-29-apache SeaTunnel 实战一些常用的任务命令 command 
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 常用命令

## help

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --help
```

如下：

```
Usage: seatunnel.sh [options]
  Options:
    --async                         Run the job asynchronously, when the job
                                    is submitted, the client will exit
                                    (default: false)
    -can, --cancel-job              Cancel job by JobId
    --check                         Whether check config (default: false)
    -cj, --close-job                Close client the task will also be closed
                                    (default: true)
    -cn, --cluster                  The name of cluster
    -c, --config                    Config file
    --decrypt                       Decrypt config file, When both --decrypt
                                    and --encrypt are specified, only
                                    --encrypt will take effect (default:
                                    false)
    -m, --master, -e, --deploy-mode SeaTunnel job submit master, support
                                    [local, cluster] (default: cluster)
    --encrypt                       Encrypt config file, when both --decrypt
                                    and --encrypt are specified, only
                                    --encrypt will take effect (default:
                                    false)
    --get_running_job_metrics       Gets metrics for running jobs (default:
                                    false)
    -h, --help                      Show the usage message
    -j, --job-id                    Get job status by JobId
    -l, --list                      list job status (default: false)
    --metrics                       Get job metrics by JobId
    -n, --name                      SeaTunnel job name (default: SeaTunnel)
    -r, --restore                   restore with savepoint by jobId
    -s, --savepoint                 savepoint job by jobId
    -i, --variable                  Variable substitution, such as -i
                                    city=beijing, or -i date=20190318
                                    (default: [])
```

## 列表

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

效果如下：

```
Job ID              Job Name   Job Status  Submit Time              Finished Time
------------------  ---------  ----------  -----------------------  -----------------------
802755807811731457  SeaTunnel  RUNNING     2024-01-25 12:24:59.844
801997588281688065  SeaTunnel  CANCELED    2024-01-23 10:12:05.805  2024-01-25 12:26:31.387
```

## 取消一个任务

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh -can 802755807811731457
```

后面指定对应的 jobId 处理。

正常处理后，再次查看。

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

发现这里需要指定一个 jobName，后面查看起来应该更加方便。

# 验证一下

```
vi /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf
```

添加对应的 job 名称。

重新提交任务：

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh -c /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf
```

任务提交之后，查看：

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

发现 jobName 还是不对？

```
2024-01-25 12:35:17,192 INFO  org.apache.seatunnel.engine.client.job.ClientJobProxy - Submit job finished, job id: 802758398431985665, job name: SeaTunnel
```

难道是从命令行获取的？

发现代码：

```java
JobConfig jobConfig = new JobConfig();
JobExecutionEnvironment jobExecutionEnv;
jobConfig.setName(clientCommandArgs.getJobName());
```


### 指定 -n 重新尝试

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh -c /home/dh/bigdata/seatunnel-2.3.3/config/mysql_cdc_to_neo4j_multi.conf -n myDefineJobName
```

此时提交日志：

```
2024-01-25 12:42:39,827 INFO  org.apache.seatunnel.engine.client.job.ClientJobProxy - Submit job finished, job id: 802760255086788609, job name: myDefineJobName
```

任务查看：

```
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --list
```

如下：

```
2024-01-25 12:43:14,071 INFO  com.hazelcast.client.impl.statistics.ClientStatisticsService - Client statistics is enabled with period 5 seconds.
Job ID              Job Name         Job Status  Submit Time              Finished Time
------------------  ---------------  ----------  -----------------------  -----------------------
802760255086788609  myDefineJobName  RUNNING     2024-01-25 12:42:39.785
802758398431985665  SeaTunnel        RUNNING     2024-01-25 12:35:17.127
802755807811731457  SeaTunnel        CANCELED    2024-01-25 12:24:59.844  2024-01-25 12:28:11.373
801997588281688065  SeaTunnel        CANCELED    2024-01-23 10:12:05.805  2024-01-25 12:26:31.387
```

# Q: 如何暂停恢复一个任务？

## 场景

比如 batch 或者一个基于 cdc 的跑批任务，我们执行一半希望暂停一下。如何重新恢复呢?


```java
  @Parameter(
            names = {"-r", "--restore"},
            description = "restore with savepoint by jobId")
    private String restoreJobId;

    @Parameter(
            names = {"-s", "--savepoint"},
            description = "savepoint job by jobId")
    private String savePointJobId;
```

个人理解应该就是这两个参数，但是没有看到具体的信息。


https://blog.csdn.net/weixin_54625990/article/details/130776613

# 参考资料

> [[Bug] [Connector-V2 JDBC] source读取数据为空时，java.lang.NullPointerException](https://github.com/apache/seatunnel/issues/6013)

https://www.cnblogs.com/seatunnel/p/17435413.html

* any list
{:toc}
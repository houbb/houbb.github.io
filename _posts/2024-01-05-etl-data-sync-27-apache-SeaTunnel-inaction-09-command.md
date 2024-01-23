---
layout: post
title: ETL-27-apache SeaTunnel 实战一些常用的任务命令 command 
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 常用命令

## help

```bash
~/apache-seatunnel-2.3.3/bin/seatunnel.sh --help
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

如下：

```
2024-01-23 10:16:44,757 INFO  com.hazelcast.client.impl.statistics.ClientStatisticsService - Client statistics is enabled with period 5 seconds.
Job ID              Job Name   Job Status  Submit Time              Finished Time
------------------  ---------  ----------  -----------------------  -----------------------
801997588281688065  SeaTunnel  RUNNING     2024-01-23 10:12:05.805
801994731839029249  SeaTunnel  FAILED      2024-01-23 10:00:45.014  2024-01-23 10:07:43.266
```

## 取消一个任务

```bash
/home/dh/bigdata/seatunnel-2.3.3/backend/apache-seatunnel-2.3.3/bin/seatunnel.sh --can 801994731839029249
```




# 参考资料

> [[Bug] [Connector-V2 JDBC] source读取数据为空时，java.lang.NullPointerException](https://github.com/apache/seatunnel/issues/6013)

https://www.cnblogs.com/seatunnel/p/17435413.html

* any list
{:toc}
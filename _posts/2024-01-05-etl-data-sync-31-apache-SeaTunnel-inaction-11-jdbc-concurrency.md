---
layout: post
title: ETL-31-apache SeaTunnel 实战 jdbc 并发执行 partition_column 无效？如何批量写入优化？seaTunnel checkpoint timeout 如何解决？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 场景

seatunnel 版本: v2.3.3

从 jdbc batch 模式同步数据，可能数据量会比较大。

看了下默认是单线程执行的，如何并行执行呢？

## jdbc 选项

jdbc 的选项：

| 名称                      | 类型             | 必需     | 默认值     | 描述                                                                                                                   |
|--------------------------|------------------|----------|------------|------------------------------------------------------------------------------------------------------------------------|
| url                      | 字符串            | 是       | -          | JDBC 连接的 URL。示例：jdbc:mysql://localhost:3306:3306/test                                                            |
| driver                   | 字符串            | 是       | -          | 用于连接到远程数据源的 JDBC 类名，如果使用 MySQL，则值为 com.mysql.cj.jdbc.Driver。                                       |
| user                     | 字符串            | 否       | -          | 连接实例的用户名。                                                                                                     |
| password                 | 字符串            | 否       | -          | 连接实例的密码。                                                                                                       |
| query                    | 字符串            | 是       | -          | 查询语句。                                                                                                             |
| connection_check_timeout_sec | 整数            | 否       | 30         | 用于等待验证连接的数据库操作完成的时间，单位为秒。                                                                      |
| partition_column         | 字符串            | 否       | -          | 并行性分区的列名，仅支持数值类型，仅支持数值类型的主键，并且只能配置一个列。                                              |
| partition_lower_bound    | BigDecimal       | 否       | -          | 扫描的 partition_column 的最小值，如果未设置，SeaTunnel 将查询数据库获取最小值。                                         |
| partition_upper_bound    | BigDecimal       | 否       | -          | 扫描的 partition_column 的最大值，如果未设置，SeaTunnel 将查询数据库获取最大值。                                         |
| partition_num            | 整数            | 否       | job parallelism | 分区计数的数量，仅支持正整数，默认值为作业并行性。                                                                    |
| fetch_size               | 整数            | 否       | 0          | 对于返回大量对象的查询，可以配置查询中使用的行获取大小，以减少满足选择条件所需的数据库访问次数，零表示使用 JDBC 的默认值。   |
| common-options           | -               | 否       | -          | 源插件的通用参数，请参阅 Source Common Options 了解详细信息。                                                          |

主要是: partition_column 指定一个仅支持数值类型的主键的列名称，partition_num  分区计数的数量，仅支持正整数，默认值为作业并行性。

我们来来实战测试一下。

# 实战测试

## 表

简单的建表语句，ID 为数值类型的主键。

```sql
CREATE TABLE "person" (
  "ID" int(11) NOT NULL,
  "NAME" varchar(100) NOT NULL,
  PRIMARY KEY ("ID")
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## 初始化数据

我们初始化 10W 数据。

```sql
INSERT INTO person (ID, NAME)
SELECT 
    ones.n + 10 * tens.n + 100 * hundreds.n + 1000 * thousands.n + 10000 * tenThousands.n + 1 as ID,
    CONCAT('Person', ones.n + 10 * tens.n + 100 * hundreds.n + 1000 * thousands.n + 10000 * tenThousands.n + 1) as NAME
FROM 
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) ones,
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tens,
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) hundreds,
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) thousands,
    (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9) tenThousands
LIMIT 100000;
```


日志如下：

```
Query OK, 100000 rows affected (0.83 sec)
Records: 100000  Duplicates: 0  Warnings: 0
```

数据确认：

```sql
mysql> select count(*) from person;
+----------+
| count(*) |
+----------+
|   100000 |
+----------+
```

## 同步脚本

我们把数据从 mysql 查出来，同步到 neo4j。

### 基础版本

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 2
  job.mode = "BATCH"
  job.name = "merge-test-person-BATCH"
  checkpoint.interval = 60000
}
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
    }
}

transform {
}

sink {
    MysqlToNeo4j {
            source_table_name = "merge.test.person"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"

            queryConfigList = [
                {
                    tableName = "merge.test.person"
                    rowKind = "INSERT"
                    query = "create(p:merge_person {ID: $ID, NAME: $NAME})"
                    queryParamPosition = {
                        ID = 0
                        NAME = 1

                    }
                }
            ]
    }
}
```

### 添加并行配置属性

我们根据上面的配置，source jdbc 修改如下：

```conf
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
        # 指定一个仅支持数值类型的主键的列名称
        partition_column = "ID"
        # 分区计数的数量，仅支持正整数，默认值为作业并行性
        partition_num = 10
    }
}
```

## 测试执行

本地单机，直接 examples 指定执行

选取可以看到执行的日志信息：

```
2024-01-26 10:15:09,785 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Starting to calculate splits.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[70001, 80000], splitId=7) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[20001, 30000], splitId=2) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[40001, 50000], splitId=4) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[30001, 40000], splitId=3) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[90001, 100000], splitId=9) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[10001, 20000], splitId=1) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[50001, 60000], splitId=5) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[60001, 70000], splitId=6) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[80001, 90000], splitId=8) to 0 reader.
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assigning JdbcSourceSplit(parameterValues=[1, 10000], splitId=0) to 0 reader.
2024-01-26 10:15:09,787 DEBUG org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assign pendingSplits to readers [0]
2024-01-26 10:15:09,787 INFO  org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Assign splits [JdbcSourceSplit(parameterValues=[70001, 80000], splitId=7), JdbcSourceSplit(parameterValues=[20001, 30000], splitId=2), JdbcSourceSplit(parameterValues=[40001, 50000], splitId=4), JdbcSourceSplit(parameterValues=[30001, 40000], splitId=3), JdbcSourceSplit(parameterValues=[90001, 100000], splitId=9), JdbcSourceSplit(parameterValues=[10001, 20000], splitId=1), JdbcSourceSplit(parameterValues=[50001, 60000], splitId=5), JdbcSourceSplit(parameterValues=[60001, 70000], splitId=6), JdbcSourceSplit(parameterValues=[80001, 90000], splitId=8), JdbcSourceSplit(parameterValues=[1, 10000], splitId=0)] to reader 0
2024-01-26 10:15:09,794 DEBUG org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - No more splits to assign. Sending NoMoreSplitsEvent to reader [0].
```

没仔细看源码，这里应该是全部查出，然后根据 id 拆分。


```
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  803085518936997889
Read Count So Far         :               35727
Write Count So Far        :               33678
Average Read Count        :               145/s
Average Write Count       :               145/s
Last Statistic Time       : 2024-01-26 10:18:09
Current Statistic Time    : 2024-01-26 10:19:09
***********************************************
```

结束日志：

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 10:15:08
End Time                  : 2024-01-26 10:26:59
Total Time(s)             :                 710
Total Read Count          :              100000
Total Write Count         :              100000
Total Failed Count        :                   0
***********************************************
```

## 对比组1-默认 Mysql to neo4j

如果我们用默认的值，不执行并发呢？

### 配置文件

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 1
  job.mode = "BATCH"
  job.name = "merge-test-person-BATCH"
  checkpoint.interval = 60000
}
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
        # 指定一个仅支持数值类型的主键的列名称
        # partition_column = "ID"
        # 分区计数的数量，仅支持正整数，默认值为作业并行性
        # partition_num = 10
    }
}

transform {
}

sink {
    MysqlToNeo4j {
            source_table_name = "merge.test.person"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"

            queryConfigList = [
                {
                    tableName = "merge.test.person"
                    rowKind = "INSERT"
                    query = "create(p:merge_person {ID: $ID, NAME: $NAME})"
                    queryParamPosition = {
                        ID = 0
                        NAME = 1

                    }
                }
            ]
    }
}
```

### 执行测试

日志

```
2024-01-26 10:30:10,355 DEBUG org.apache.seatunnel.engine.server.checkpoint.CheckpointManager - reported task(40000) status READY_START
2024-01-26 10:30:10,355 DEBUG org.apache.seatunnel.connectors.seatunnel.jdbc.source.JdbcSourceSplitEnumerator - Register reader 0 to JdbcSourceSplitEnumerator.
2024-01-26 10:30:10,355 DEBUG org.apache.seatunnel.engine.server.task.SourceSplitEnumeratorTask - reader register complete, current task size 1
2024-01-26 10:30:10,355 DEBUG org.apache.seatunnel.engine.server.TaskExecutionService - [localhost]:5802 [seatunnel-893526] [5.1] remove async execute function from TaskGroupLocation{jobId=803089297803575297, pipelineId=1, taskGroupId=1} with id 4e3993ed-3d16-4405-81fe-f7fd6b9e7341
```

统计日志：

```
***********************************************
           Job Progress Information
***********************************************
Job Id                    :  803089297803575297
Read Count So Far         :               10190
Write Count So Far        :                8141
Average Read Count        :               169/s
Average Write Count       :               135/s
Last Statistic Time       : 2024-01-26 10:30:10
Current Statistic Time    : 2024-01-26 10:31:10
***********************************************
```

***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 10:30:09
End Time                  : 2024-01-26 10:42:04
Total Time(s)             :                 715
Total Read Count          :              100000
Total Write Count         :              100000
Total Failed Count        :                   0
***********************************************

发现性能感觉差别...

猜测原因：很可能是 neo4j 的写入存在性能瓶颈。或者是哪里配置的存在问题。

我们引入对比组2：mysql 读取，直接控台输出。

## 对比组2-默认 Mysql to console

### 配置

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 1
  job.mode = "BATCH"
  job.name = "merge-test-person-BATCH"
  checkpoint.interval = 60000
}
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
        # 指定一个仅支持数值类型的主键的列名称
        # partition_column = "ID"
        # 分区计数的数量，仅支持正整数，默认值为作业并行性
        # partition_num = 10
    }
}

transform {
}

sink {
    ConsoleBinlog {
    }
}
```

ConsoleBinlog 中每次输出到控台，默认沉睡 1ms。

发现直接使用 console，1ms 10W 条就全部执行完了，没有区分度。

### 测试

日志：

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 10:53:05
End Time                  : 2024-01-26 10:55:51
Total Time(s)             :                 165
Total Read Count          :              100000
Total Write Count         :              100000
Total Failed Count        :                   0
***********************************************
```

## 对比组3-10并发 Mysql to console

### 配置

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 10
  job.mode = "BATCH"
  job.name = "merge-test-person-BATCH"
  checkpoint.interval = 60000
}
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
        # 指定一个仅支持数值类型的主键的列名称
        partition_column = "ID"
        # 分区计数的数量，仅支持正整数，默认值为作业并行性
        partition_num = 10
    }
}

transform {
}

sink {
    ConsoleBinlog {
    }
}
```

### 测试

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 10:57:16
End Time                  : 2024-01-26 11:00:51
Total Time(s)             :                 214
Total Read Count          :              100000
Total Write Count         :              100000
Total Failed Count        :                   0
***********************************************
```

发现性能并没有提升，甚至还下降了。

难道是这个属性用错了。

# 疑问1-apache seatunnel partition_column 实际测试无效？

通过对比组2 VS 对比组3，看起来这个属性是完全无效的？

这个可以看一下源码部分。

还是说，所有的瓶颈都还是主要看 sink 的部分？

还是说本地代码测试模式，会忽略这个配置属性？

## linux 单机运行模式

我们用运行的单机服务验证一下。

TODO....

# 如何解决 neo4j 的写入瓶颈问题？

## 优缺点

转 oneByOne 为 batch。

首先：为什么默认用的逐个写入，逐个写入的缺点是性能差，但是优点是没有缓存问题，单条的影响范围最小。比如一条数据已经存在，只影响这1条。批量就可能导致整个失败，不过这个在从零的全量同步，还好。

batch 的问题：看了下 neo4j 默认的 batch 写入模式，如果没理解过，是本地引入一个 buffer 缓存，到达阈值后触发真正的写入。这个在无限流模式还行，不过存在延迟。但是批模式，比如数量为 998，batch_size=100，是否会导致最后 98 个数据无法写入呢？如何解决这个问题呢？

## batch 模式写入端如何解决 bufferList 可能丢失数据问题？

如果是流模式，有新的数据，肯定会填满。或者定时刷新都没有问题。但是批模式，执行结束就结束了，肯不满足最后的阈值。

思路1：添加一个阈值，比如 1W 数据，10 并发，id >= 9900 的时候，就把批量的阈值动态调整为 1，避免写入丢失的问题？这个阈值让用户自己填写。


## 直接根据 batchSize 实现的方式

### 配置

参考 neo4j 的批量入库实现：

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  execution.parallelism = 1
  job.mode = "BATCH"
  job.name = "merge-test-person-BATCH"
  checkpoint.interval = 60000
}
source{
    Jdbc {
        url = "jdbc:mysql://127.0.0.1:3306/test?useSSL=false&serverTimezone=Asia/Shanghai"
        driver = "com.mysql.jdbc.Driver"
        user = "admin"
        password = "123456"
        query = "SELECT ID,NAME FROM person"
        result_table_name = "merge.test.person"
        fetch_size = 1000
        connection_check_timeout_sec = 20000
    }
}

transform {
}

sink {
    MysqlToNeo4j {
            source_table_name = "merge.test.person"

            uri = "bolt://localhost:7687"
            username = "neo4j"
            password = "12345678"
            database = "neo4j"

            max_transaction_retry_time = 30000
            max_connection_timeout = 30000

            format = "default"
            max_batch_size = 1000
            write_mode = "BATCH"

            queryConfigList = [
                {
                    tableName = "merge.test.person"
                    rowKind = "INSERT"

                    query = "unwind $batch as row create(p:merge_person {ID: row.ID, NAME: row.NAME})"
                    queryParamPosition = {
                        ID = 0
                        NAME = 1
                    }
                }
            ]
    }
}
```

### 效果

效果显著，果然写入才是瓶颈。

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 13:04:55
End Time                  : 2024-01-26 13:05:01
Total Time(s)             :                   5
Total Read Count          :              100000
Total Write Count         :              100000
Total Failed Count        :                   0
***********************************************
```


# 测试数据不是 max_batch_size 的整数吧倍时

## 准备

我们把目标库 neo4j 清空

```
MATCH (n:merge_person) delete n;
```

删除掉原始库 mysql 的一条数据

```sql
delete from person where id=1;
select count(*) from person;
```

如下：

```
+----------+
| count(*) |
+----------+
|    99999 |
+----------+
```

## 再次测试

其他不变，再次执行。

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 13:10:34
End Time                  : 2024-01-26 13:10:39
Total Time(s)             :                   5
Total Read Count          :               99999
Total Write Count         :               99999
Total Failed Count        :                   0
***********************************************
```

实际数据库 neo4j 数据：

```
╒════════╕
│count(*)│
╞════════╡
│99000   │
└────────┘
```

最后的 999 因为没有触发条件，而丢失了，如何解决呢？

## 解决方式

在 close 之前，直接处理掉即可。

```java
@Override
public void close() throws IOException {
    flushAllWriteBuffer();
    
    session.close();
    driver.close();
}
```

这里可以看到生命周期的重要性。

## 重新测试

统计日志：

```
***********************************************
           Job Statistic Information
***********************************************
Start Time                : 2024-01-26 13:18:53
End Time                  : 2024-01-26 13:18:59
Total Time(s)             :                   6
Total Read Count          :               99999
Total Write Count         :               99999
Total Failed Count        :                   0
***********************************************
```

目标库数据：

```
MATCH (n:merge_person) RETURN count(*)

╒════════╕
│count(*)│
╞════════╡
│99999   │
└────────┘
```

OK, 问题解决！

## TODO

对应的脚本生成。

# 执行异常

### checkpoint 异常 

```
Exception in thread "main" org.apache.seatunnel.core.starter.exception.CommandExecuteException: SeaTunnel job executed failed
	at org.apache.seatunnel.core.starter.seatunnel.command.ClientExecuteCommand.execute(ClientExecuteCommand.java:191)
	at org.apache.seatunnel.core.starter.SeaTunnel.run(SeaTunnel.java:40)
	at org.apache.seatunnel.example.engine.SeaTunnelEngineMysqlDefaultToNeo4jDefineConcurrencyExample.main(SeaTunnelEngineMysqlDefaultToNeo4jDefineConcurrencyExample.java:46)
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

原因：这个原来解决过。

解决方式：直接修改 seatunnel.yaml checkpoint.timeout and checkpoint.interval

```
D:\_my\seatunnel-2.3.3-release-slim\seatunnel-engine\seatunnel-engine-common\src\main\resources\seatunnel.yaml
```

配置

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 300000
            timeout: 10000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\

```

checkpoint 值改大一点：

```yaml
seatunnel:
    engine:
        backup-count: 1
        queue-type: blockingqueue
        print-execution-info-interval: 60
        slot-service:
            dynamic-slot: true
        checkpoint:
            interval: 6000000
            timeout: 6000000
            storage:
                type: localfile
                max-retained: 3
                plugin-config:
                    namespace: C:\ProgramData\seatunnel\checkpoint\
```






# 参考资料

https://github.com/apache/seatunnel/issues/5555

[[Bug] [Zeta Engine] the checkpoint lock cause checkpoint-flow blocking with long time](https://github.com/apache/seatunnel/issues/5694)

* any list
{:toc}
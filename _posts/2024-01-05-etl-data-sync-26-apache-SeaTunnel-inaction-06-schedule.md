---
layout: post
title: ETL-26-apache SeaTunnel 实战 seaTunnel 如何实现任务的定时调度？增量获取数据？
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 业务需求

如果想 5min 触发一次调度，怎么实现呢？

# v0-参数替换支持

> [批处理方式新增参数替换功能](https://github.com/apache/seatunnel/issues/153)

Waterdrop 中如何在配置中指定变量，之后在运行时，动态指定变量的值？

Waterdrop 从v1.2.4开始，支持在配置中指定变量，此功能常用于做定时或非定时的离线处理时，替换时间、日期等变量，用法如下：

在配置中，配置变量名称，比如:


```sql
...


filter {
  sql {
    table_name = "user_view"
    sql = "select * from user_view where city ='"${city}"' and dt = '"${date}"'"
  }
}

...
```

这里只是以sql filter举例，实际上，配置文件中任意位置的key = value中的value，都可以使用变量替换功能。

详细配置示例，请见variable substitution

启动命令如下：

```bash
# local  模式
./bin/start-waterdrop.sh -c ./config/your_app.conf -e client -m local[2] -i city=shanghai -i date=20190319

# yarn client 模式
./bin/start-waterdrop.sh -c ./config/your_app.conf -e client -m yarn -i city=shanghai -i date=20190319

# yarn cluster 模式
./bin/start-waterdrop.sh -c ./config/your_app.conf -e cluster -m yarn -i city=shanghai -i date=20190319

# mesos, spark standalone  启动方式相同。
```

可以用参数 `-i` 或者 `--variable` 后面指定 key=value来指定变量的值，其中key 需要与配置中的变量名相同。


# v1-定时触发 batch 任务？

## 思路

增量同步数据从mysql到mysql, source端数据没有数据时，报java.lang.NullPointerException异常;

确认用增量条件在源端查询时没有数据。

希望的结果是程序正常结束，统计数据中读写数据为0；

配置文件中增加partition_lower_bound和partition_upper_bound配置时达到希望的结果；但实际应用中不明确参数应该配置什么值 。

### SeaTunnel Version

2.3.3

### SeaTunnel Config

```conf
env {
  execution.parallelism = 2
  job.mode = "BATCH"
}

source {
  Jdbc {
      driver = "com.mysql.cj.jdbc.Driver"
      url = "jdbc:mysql://192.168.0.10:3306/test1?useUnicode=true&characterEncoding=utf8&useSSL=false&allowPublicKeyRetrieval=true"
      user = "username"
      password = "password"

      partition_column = "id"
      partition_num = 2
      query = "select * from t_base where id>"${var}""
  }
}

sink {
  Jdbc {
    driver = "com.mysql.cj.jdbc.Driver"
    url = "jdbc:mysql://192.168.0.32:3306/test?useUnicode=true&characterEncoding=utf8&useSSL=false"
    user = "username"
    password = "password"
    database = "test"
    table = "t_base"
    primary_keys = id
    support_upsert_by_query_primary_key_exist=true
    batch_size = 1000
    connection_check_timeout_sec=30
    generate_sink_sql=true
  }
}
```

### Running Command

```bash
bin/seatunnel.sh --config /data/applications/seatunnel_data/mysql2mysql.config -m local -i var=2355
```

## 优点

这样应该可以通过定时任务触发，传入一个可变的 var 参数。

但是谁来触发呢？

shell 脚本？cron 表达式触发？

java 代码触发？这样的话，是不是需要额外一个任务。

# v2-streaming 模式自己实现

类似于 http source 模式，支持 batch/stream 模式。

ES 这种不支持的，可以自己定义一个。

两种建议方式：

1）兼容开源版本的方式

自己定义一个新的 es-stream 之类的插件，自定义支持流模式，添加时间间隔支持。

优点：比较快，不必等官方迭代

缺点：不利于社区的创建

2）共建模式

直接官方提 PR，实现 ES 的流模式。

优点：优点官方支持

缺点：迭代周期可能会比较长。

# ISSUES

The latest in learning seaTunnel, I'm very grateful to the author for providing such a powerful feature. I have a question and, after reading the official documentation and GitHub issues, I haven't found a particularly good solution.

Version: v2.3.3

Engine: Default seaTunnel engine

Scenario: When wanting to execute a task at regular intervals, such as sourcing data from an Elasticsearch database every 5 minutes and processing the recently collected data into a time-series database, how should this be implemented?

Expectation: The ability to specify the time interval for scheduled execution. Ideally, this should be supported by all sources, and incremental queries based on specified conditions.

Considered Approach: Using `job.mode=batch` and then triggering this task at scheduled intervals. However, the question arises: who should trigger the task? It should ideally be part of the component's capabilities. Could you please provide some clarification on this? Thank you very much.

------------------------------------------------------------------------

最新在学习 seaTunnel，非常感谢作者提供这么强大的功能。

有一个疑问，看完官方文档+github issues 没找到特别好的解决方式。

版本：v2.3.3

引擎：默认 seaTunnel 引擎

场景：希望定时去执行一个任务的时候，应该如何实现呢？比如 source 是 ES 数据库，5min 想执行一次最近 5min 的符合条件的数据，落入到时序数据库。

期望：可以指定定时调度的时间间隔。按理说所有的 source 都应该支持。按照条件增量查询。

考虑到的方式：job.mode=batch，然后定时触发这个任务。但是任务应该由谁触发呢？应该是组件能力的一部分，麻烦解惑。多谢

[[Feature][seatunnel-connectors-v2] How to schedule task and config interval?（如何定时执行一个任务，并可以指定时间间隔?）](https://github.com/apache/seatunnel/issues/6236)


# 参考资料

> [[Bug] [Connector-V2 JDBC] source读取数据为空时，java.lang.NullPointerException](https://github.com/apache/seatunnel/issues/6013)

* any list
{:toc}
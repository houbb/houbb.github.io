---
layout: post
title: ETL-26-apache SeaTunnel 实战 HTTP streaming 调用测试
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# 业务需求

定时执行 http 请求任务？

# source

可以根据 http source，内置了一些工具，我们只测试最基本的，如果有特别的需求，可以自己定义。

# 实际测试笔记

## 引入依赖包

```xml
<!--        引入基础的 http，看的出来，可以自己自定义 http-->
<dependency>
    <groupId>org.apache.seatunnel</groupId>
    <artifactId>connector-http-base</artifactId>
    <version>${project.version}</version>
</dependency>
```

## 配置文件

我们简单测试下，GET 请求 https://www.baidu.com/。

5 秒一次 

```conf
# Defining the runtime environment
env {
  # You can set flink configuration here
  parallelism = 1
  job.mode = "STREAMING"
  checkpoint.interval = 10000
}
source{
    Http {
      url = "https://www.baidu.com/"
      method = "GET"
      format = "text"
      poll_interval_millis = 5000
    }
}

transform {
    # If you would like to get more information about how to configure seatunnel and see full list of transform plugins,
    # please go to https://seatunnel.apache.org/docs/transform-v2/sql
}

sink {
    # 使用自定义的控台输出，避免 console 异常。
    ConsoleBinlog {
    }
}
```

## 输出 sink ConsoleBinlog

这个是我们自定义的简单 console 输出，改自 Console。原来的 console 比较严格，可能会报错。这里仅用于测试。

```java
@Override
@SuppressWarnings("checkstyle:RegexpSingleline")
public void write(SeaTunnelRow element) {
    Date date = new Date();
    String dateStr = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSS").format(date);
    log.info("ConsoleBinlogSinkWriter ================= " + dateStr + " >>>>>>>>>>> " + element.toString());
}
```

# 测试效果

```
2024-01-18 10:15:15,060 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-01-18 10:15:15.060 >>>>>>>>>>> SeaTunnelRow{tableId=, kind=+I, fields=[<!DOCTYPE html>

2024-01-18 10:15:20,080 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-01-18 10:15:20.080 >>>>>>>>>>> SeaTunnelRow{tableId=, kind=+I, fields=[<!DOCTYPE html>

2024-01-18 10:15:25,101 INFO  org.apache.seatunnel.connectors.seatunnel.consolebinlog.sink.ConsoleBinlogSinkWriter - ConsoleBinlogSinkWriter ================= 2024-01-18 10:15:25.101 >>>>>>>>>>> SeaTunnelRow{tableId=, kind=+I, fields=[<!DOCTYPE html>

...
```

5000ms 请求一次。

# 其他

这里也就解答了我上一篇中的疑惑，其实一个请求，所谓的流批一体，应该直接参考这种方式实现。

有一些 source 比如 ES，只支持 batch，想实现流式会比较麻烦。

所以可以自己定义一个跑批实现，然后同时支持流批即可。

这个能力感觉可以直接放在 job 层，而不是每一个组件。

# 参考资料

> [[Bug] [Connector-V2 JDBC] source读取数据为空时，java.lang.NullPointerException](https://github.com/apache/seatunnel/issues/6013)

* any list
{:toc}
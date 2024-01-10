---
layout: post
title: ETL-06-apache SeaTunnel Config
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# **配置文件介绍**

在 SeaTunnel 中，最重要的是配置文件，通过它，用户可以定制自己的数据同步需求，以最大程度地发挥 SeaTunnel 的潜力。

接下来，我将介绍如何配置配置文件。

配置文件的主要格式是 HOCON（Human-Optimized Config Object Notation），关于此格式的更多详细信息，您可以参考 [HOCON-GUIDE](https://github.com/lightbend/config/blob/master/HOCON.md)。顺便提一下，我们也支持 JSON 格式，但是您应该知道配置文件的名称应该以 `.json` 结尾。

# **示例**

在继续阅读之前，您可以在这里和分发包的 `config` 目录中找到配置文件的示例。

**配置文件结构**

配置文件将类似于下面的示例。

## hocon

```hocon
env {
  job.mode = "BATCH"
}

source {
  FakeSource {
    result_table_name = "fake"
    row.num = 100
    schema = {
      fields {
        name = "string"
        age = "int"
        card = "int"
      }
    }
  }
}

transform {
  Filter {
    source_table_name = "fake"
    result_table_name = "fake1"
    fields = [name, card]
  }
}

sink {
  Clickhouse {
    host = "clickhouse:8123"
    database = "default"
    table = "seatunnel_console"
    fields = ["name", "card"]
    username = "default"
    password = ""
    source_table_name = "fake1"
  }
}
```

这是一个简单的配置文件示例，其中定义了执行环境、数据源、转换和汇的设置。配置文件的结构将根据您的需求进行调整，以满足特定的数据同步任务。

## json

```json
{
  "env": {
    "job.mode": "batch"
  },
  "source": [
    {
      "plugin_name": "FakeSource",
      "result_table_name": "fake",
      "row.num": 100,
      "schema": {
        "fields": {
          "name": "string",
          "age": "int",
          "card": "int"
        }
      }
    }
  ],
  "transform": [
    {
      "plugin_name": "Filter",
      "source_table_name": "fake",
      "result_table_name": "fake1",
      "fields": ["name", "card"]
    }
  ],
  "sink": [
    {
      "plugin_name": "Clickhouse",
      "host": "clickhouse:8123",
      "database": "default",
      "table": "seatunnel_console",
      "fields": ["name", "card"],
      "username": "default",
      "password": "",
      "source_table_name": "fake1"
    }
  ]
}
```

正如您所见，配置文件包含几个部分：env、source、transform、sink。不同的模块具有不同的功能。在了解了这些模块之后，您将了解 SeaTunnel 的工作原理。

## **env（环境）**

用于添加一些引擎可选参数，无论使用哪个引擎（Spark或Flink），都应该在此处填写相应的可选参数。

## **source（数据源）**

数据源用于定义 SeaTunnel 需要获取数据的位置，并将获取的数据用于下一步。可以同时定义多个数据源。目前支持的数据源请查看[SeaTunnel的Source](https://github.com/apache/seatunnel/blob/main/connectors/README.md#source)。每个数据源都有自己的具体参数来定义如何获取数据，SeaTunnel还提取了每个数据源将使用的参数，比如 `result_table_name` 参数，用于指定当前数据源生成的数据的名称，方便其他模块在后续使用。

## **transform（转换）**

当我们有了数据源时，可能需要进一步处理数据，因此我们有了转换模块。

当然，这里使用了可能这个词，这意味着我们也可以将转换视为不存在，直接从源到汇。如下所示。

```conf
env {
  job.mode = "BATCH"
}

source {
  FakeSource {
    result_table_name = "fake"
    row.num = 100
    schema = {
      fields {
        name = "string"
        age = "int"
        card = "int"
      }
    }
  }
}

sink {
  Clickhouse {
    host = "clickhouse:8123"
    database = "default"
    table = "seatunnel_console"
    fields = ["name", "age", "card"]
    username = "default"
    password = ""
    source_table_name = "fake1"
  }
}
```

与 source 一样，transform 也有属于每个模块的具体参数。目前支持的 transform 请查看 [SeaTunnel 的 Transform V2](https://github.com/apache/seatunnel/blob/main/connectors/README.md#transform-v2)。

## **sink（汇）**

SeaTunnel 的目标是将数据从一个地方同步到另一个地方，因此定义数据如何以及在哪里写入是至关重要的。

通过 SeaTunnel 提供的 sink 模块，您可以快速而高效地完成此操作。Sink 和 source 非常相似，但区别在于读取和写入。因此，请查看我们支持的 sinks。

## **其他**

当定义了多个源和多个汇时，您会发现每个汇读取哪些数据，每个转换读取哪些数据？我们使用了 `result_table_name` 和 `source_table_name` 两个关键配置。

每个 source 模块将配置一个 `result_table_name` 来指示数据源生成的数据源的名称，其他 transform 和 sink 模块可以使用 `source_table_name` 来引用相应的数据源名称，表示我要读取用于处理的数据。

然后，作为中间处理模块的 transform 可以同时使用 `result_table_name` 和 `source_table_name` 配置。

但是您会发现，在上述示例配置中，并非每个模块都配置了这两个参数，因为在 SeaTunnel 中有一个默认的约定，如果未配置这两个参数，那么将使用上一节点的最后一个模块生成的数据。

在只有一个源时，这样做会更加方便。


# 拓展阅读

[https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-flink](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-flink)

[https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-spark](https://seatunnel.apache.org/docs/2.3.3/start-v2/locally/quick-start-spark)

# 参考资料

https://github.com/apache/seatunnel

https://seatunnel.apache.org/docs/2.3.3/about

* any list
{:toc}
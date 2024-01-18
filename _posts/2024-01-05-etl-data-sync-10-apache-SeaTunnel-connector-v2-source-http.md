---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source HTTP
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Http

> https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/Http

# Support Those Engines

Spark

Flink

SeaTunnel Zeta

# Key Features

√ batch

√ stream

 exactly-once
 column projection
 parallelism
 support user-defined split

# 描述

从 http 请求数据

# 支持的数据源信息

为了使用Http连接器，需要以下依赖项。它们可以通过install-plugin.sh或从Maven中央仓库下载。

> [connector-http](https://mvnrepository.com/artifact/org.apache.seatunnel/seatunnel-connectors-v2/connector-http)

ps: 404-服了，可以通过源码自己编译。

# Source Options

| 名称                   | 类型      | 必需 | 默认值 | 描述                                                                                       |
|------------------------|----------|------|--------|--------------------------------------------------------------------------------------------|
| url                    | 字符串    | 是   | -      | Http请求的URL。                                                                            |
| schema                 | 配置     | 否   | -      | Http和seatunnel数据结构映射。                                                              |
| schema.fields          | 配置     | 否   | -      | 上游数据的模式字段。                                                                      |
| json_field             | 配置     | 否   | -      | 此参数帮助您配置模式，因此必须与模式一起使用。                                              |
| content_json           | 字符串    | 否   | -      | 此参数可以获取一些JSON数据。如果您只需要“book”部分的数据，请配置content_field = "$.store.book.*"。|
| format                 | 字符串    | 否   | json   | 上游数据的格式，现在仅支持JSON文本，默认为JSON。                                            |
| method                 | 字符串    | 否   | get    | Http请求方法，仅支持GET、POST方法。                                                       |
| headers                | Map      | 否   | -      | Http标头。                                                                                |
| params                 | Map      | 否   | -      | Http参数。                                                                                |
| body                   | 字符串    | 否   | -      | Http主体。                                                                                |
| poll_interval_millis       | 整数      | 否   | -      | 在流模式中请求Http API的间隔（毫秒）。                                                     |
| retry                  | 整数      | 否   | -      | 如果请求Http返回IOException，则最大重试次数。                                             |
| retry_backoff_multiplier_ms | 整数 | 否   | 100    | 如果请求Http失败，则重试后退次数（毫秒）的乘数。                                          |
| retry_backoff_max_ms   | 整数      | 否   | 10000  | 如果请求Http失败，则最大重试后退次数（毫秒）。                                            |
| enable_multi_lines     | 布尔值    | 否   | false  | -                                                                                          |
| common-options          | -        | 否   | -      | 源插件通用参数，请参阅详细的源通用选项。                                                 |

PS: 时间间隔这个官方文档写错了，正确应该是：poll_interval_millis。参考源码类：org.apache.seatunnel.connectors.seatunnel.http.config.HttpConfig

# How to Create a Http Data Synchronization Jobs

```conf
env {
  execution.parallelism = 1
  job.mode = "BATCH"
}

source {
  Http {
    result_table_name = "http"
    url = "http://mockserver:1080/example/http"
    method = "GET"
    format = "json"
    schema = {
      fields {
        c_map = "map<string, string>"
        c_array = "array<int>"
        c_string = string
        c_boolean = boolean
        c_tinyint = tinyint
        c_smallint = smallint
        c_int = int
        c_bigint = bigint
        c_float = float
        c_double = double
        c_bytes = bytes
        c_date = date
        c_decimal = "decimal(38, 18)"
        c_timestamp = timestamp
        c_row = {
          C_MAP = "map<string, string>"
          C_ARRAY = "array<int>"
          C_STRING = string
          C_BOOLEAN = boolean
          C_TINYINT = tinyint
          C_SMALLINT = smallint
          C_INT = int
          C_BIGINT = bigint
          C_FLOAT = float
          C_DOUBLE = double
          C_BYTES = bytes
          C_DATE = date
          C_DECIMAL = "decimal(38, 18)"
          C_TIMESTAMP = timestamp
        }
      }
    }
  }
}

# Console printing of the read Http data
sink {
  Console {
    parallelism = 1
  }
}
```

# 参数解释

## **format**

当您指定格式为json时，您还应该指定模式选项，例如：

上游数据如下：

```json
{
  "code": 200,
  "data": "get success",
  "success": true
}
```

您应该将模式指定为以下内容：

```hcl
schema {
  fields {
    code = int
    data = string
    success = boolean
  }
}
```

连接器将生成以下数据：

```
code  data          success
200   get success   true
```

当您指定格式为text时，连接器对上游数据不会执行任何操作，例如：

上游数据如下：

```json
{
  "code": 200,
  "data": "get success",
  "success": true
}
```

连接器将生成以下数据：

```
content
{"code": 200, "data": "get success", "success": true}
```

## **content_json**

此参数可以获取一些JSON数据。

如果您只需要“book”部分的数据，请配置`content_field = "$.store.book.*"`。

如果您的返回数据类似于以下内容：

```json
{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  },
  "expensive": 10
}
```

您可以配置`content_field = "$.store.book.*"`，返回的结果如下：

```json
[
  {
    "category": "reference",
    "author": "Nigel Rees",
    "title": "Sayings of the Century",
    "price": 8.95
  },
  {
    "category": "fiction",
    "author": "Evelyn Waugh",
    "title": "Sword of Honour",
    "price": 12.99
  }
]
```

然后，您可以使用更简单的模式获取所需的结果，例如：

```hcl
Http {
  url = "http://mockserver:1080/contentjson/mock"
  method = "GET"
  format = "json"
  content_field = "$.store.book.*"
  schema = {
    fields {
      category = string
      author = string
      title = string
      price = string
    }
  }
}
```

这是一个示例：

测试数据可以在此链接找到：[mockserver-config.json](https://seatunnel.apache.org/seatunnel-e2e/seatunnel-connector-v2-e2e/connector-http-e2e/src/test/resources/mockserver-config.json)
有关任务配置，请参阅此链接：[http_contentjson_to_assert.conf](https://seatunnel.apache.org/seatunnel-e2e/seatunnel-connector-v2-e2e/connector-http-e2e/src/test/resources/http_contentjson_to_assert.conf)。

## **json_field**

此参数帮助您配置模式，因此必须与模式一起使用。

如果您的数据类似于以下内容：

```json
{ 
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  },
  "expensive": 10
}
```

您可以通过以下方式配置任务，获取'book'的内容：

```hcl
source {
  Http {
    url = "http://mockserver:1080/jsonpath/mock"
    method = "GET"
    format = "json"
    json_field = {
      category = "$.store.book[*].category"
      author = "$.store.book[*].author"
      title = "$.store.book[*].title"
      price = "$.store.book[*].price"
    }
    schema = {
      fields {
        category = string
        author = string
        title = string
        price = string
      }
    }
  }
}
```

这是一个示例：

测试数据可以在此链接找到：[mockserver-config.json](https://seatunnel.apache.org/seatunnel-e2e/seatunnel-connector-v2-e2e/connector-http-e2e/src/test/resources/mockserver-config.json)

有关任务配置，请参阅此链接：[http_jsonpath_to_assert.conf](https://seatunnel.apache.org/seatunnel-e2e/seatunnel-connector-v2-e2e/connector-http-e2e/src/test/resources/http_jsonpath_to_assert.conf)。


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/Http

* any list
{:toc}
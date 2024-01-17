---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source ES Elasticsearch
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Elasticsearch

> https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/Elasticsearch


Elasticsearch 源连接器

## 描述

用于从 Elasticsearch 中读取数据。

支持版本 >= 2.x 和 <= 8.x。

## 关键特性

√ 批处理（batch）
- 流处理（stream）
- 精确一次（exactly-once）
√ 列投影（column projection）
- 并行性（parallelism）
- 支持用户定义的拆分（user-defined split）

## 选项

| 名称                     | 类型                | 必需    | 默认值       |
|------------------------|---------------------|---------|--------------|
| hosts                  | 数组                | 是      | -            |
| username               | 字符串              | 否      | -            |
| password               | 字符串              | 否      | -            |
| index                  | 字符串              | 是      | -            |
| source                 | 数组                | 否      | -            |
| query                  | JSON                | 否      | {"match_all": {}} |
| scroll_time            | 字符串              | 否      | 1m           |
| scroll_size            | 整数                | 否      | 100          |
| schema                 | -                   | 否      | -            |
| tls_verify_certificate | 布尔值              | 否      | true         |
| tls_verify_hostnames   | 布尔值              | 否      | true         |
| tls_keystore_path      | 字符串              | 否      | -            |
| tls_keystore_password  | 字符串              | 否      | -            |
| tls_truststore_path    | 字符串              | 否      | -            |
| tls_truststore_password| 字符串              | 否      | -            |
| common-options         | -                   | 否      | -            |
| hosts [array]          | -                   | -       | -            |

hosts [数组]
Elasticsearch 集群的 HTTP 地址，格式为 host:port，允许指定多个主机。例如 ["host1:9200", "host2:9200"]。

username [字符串]
x-pack 用户名。

password [字符串]
x-pack 密码。

index [字符串]
Elasticsearch 索引名称，支持 * 模糊匹配。

source [数组]
索引的字段。您可以通过指定字段 _id 获取文档 ID。如果将 _id 传送到其他索引，由于 Elasticsearch 的限制，您需要为 _id 指定别名。如果不配置 source，则必须配置 schema。

query [json]
Elasticsearch DSL。您可以通过它来控制所读取数据的范围。

scroll_time [字符串]
Elasticsearch 将保持滚动请求的搜索上下文的时间量。

scroll_size [整数]
每个 Elasticsearch 滚动请求返回的最大命中数。

schema
数据的结构，包括字段名称和字段类型。如果不配置 schema，则必须配置 source。

tls_verify_certificate [布尔值]
为 HTTPS 端点启用证书验证。

tls_verify_hostname [布尔值]
为 HTTPS 端点启用主机名验证。

tls_keystore_path [字符串]
PEM 或 JKS 密钥库的路径。该文件必须可读取，由运行 SeaTunnel 的操作系统用户拥有。

tls_keystore_password [字符串]
指定密钥库的密钥密码。

tls_truststore_path [字符串]
PEM 或 JKS 信任库的路径。该文件必须可读取，由运行 SeaTunnel 的操作系统用户拥有。

tls_truststore_password [字符串]
指定信任库的密钥密码。

# Examples

## simple

```
Elasticsearch {
    hosts = ["localhost:9200"]
    index = "seatunnel-*"
    source = ["_id","name","age"]
    query = {"range":{"firstPacket":{"gte":1669225429990,"lte":1669225429990}}}
}
```

## complex

```
Elasticsearch {
    hosts = ["elasticsearch:9200"]
    index = "st_index"
    schema = {
        fields {
            c_map = "map<string, tinyint>"
            c_array = "array<tinyint>"
            c_string = string
            c_boolean = boolean
            c_tinyint = tinyint
            c_smallint = smallint
            c_int = int
            c_bigint = bigint
            c_float = float
            c_double = double
            c_decimal = "decimal(2, 1)"
            c_bytes = bytes
            c_date = date
            c_timestamp = timestamp
        }
    }
    query = {"range":{"firstPacket":{"gte":1669225429990,"lte":1669225429990}}}
}
```

## SSL (Disable certificates validation)

```
source {
    Elasticsearch {
        hosts = ["https://localhost:9200"]
        username = "elastic"
        password = "elasticsearch"
        
        tls_verify_certificate = false
    }
}
```

## SSL (Disable hostname validation)

```
source {
    Elasticsearch {
        hosts = ["https://localhost:9200"]
        username = "elastic"
        password = "elasticsearch"
        
        tls_verify_hostname = false
    }
}
```

## SSL (Enable certificates validation)

```
source {
    Elasticsearch {
        hosts = ["https://localhost:9200"]
        username = "elastic"
        password = "elasticsearch"
        
        tls_keystore_path = "${your elasticsearch home}/config/certs/http.p12"
        tls_keystore_password = "${your password}"
    }
}
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/concept/JobEnvConfig

* any list
{:toc}
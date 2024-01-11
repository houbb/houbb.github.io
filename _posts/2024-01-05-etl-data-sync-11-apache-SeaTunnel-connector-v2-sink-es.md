---
layout: post
title: ETL-11-apache SeaTunnel Connector v2 sink ES
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Elasticsearch

## 描述

将数据输出到 Elasticsearch。

## 主要特点

- CDC

## 提示

支持的引擎

支持的 Elasticsearch 版本为 >= 2.x 和 <= 8.x。

# 选项

| 名称                           | 类型      | 必需 | 默认值           |
|--------------------------------|-----------|------|------------------|
| hosts                          | 数组      | 是   | -                |
| index                          | 字符串    | 是   | -                |
| index_type                     | 字符串    | 否   | -                |
| primary_keys                   | 列表      | 否   | -                |
| key_delimiter                  | 字符串    | 否   | _                |
| username                       | 字符串    | 否   | -                |
| password                       | 字符串    | 否   | -                |
| max_retry_count                | 整数      | 否   | 3                |
| max_batch_size                 | 整数      | 否   | 10               |
| tls_verify_certificate         | 布尔      | 否   | true             |
| tls_verify_hostnames           | 布尔      | 否   | true             |
| tls_keystore_path              | 字符串    | 否   | -                |
| tls_keystore_password          | 字符串    | 否   | -                |
| tls_truststore_path            | 字符串    | 否   | -                |
| tls_truststore_password        | 字符串    | 否   | -                |
| common-options                 | 无        | 否   | -                |

这是关于 Elasticsearch 输出连接器选项的配置列表。

根据您的需求，您可以适当配置这些选项。

hosts [array]
Elasticsearch 集群的 HTTP 地址，格式为 host:port，允许指定多个主机。例如 ["host1:9200", "host2:9200"]。

index [string]
Elasticsearch 索引名称。索引支持包含字段名称的变量，例如 seatunnel_${age}，并且该字段必须出现在 seatunnel 行中。如果没有，我们将视其为普通索引。

index_type [string]
Elasticsearch 索引类型，在 Elasticsearch 6 及以上版本中建议不指定。

primary_keys [list]
用于生成文档 _id 的主键字段，这是 CDC 所需的选项。

key_delimiter [string]
用于复合键的分隔符（默认为“_”），例如，"$" 将导致文档 _id 为 "KEY1$KEY2$KEY3"。

username [string]
x-pack 用户名

password [string]
x-pack 密码

max_retry_count [int]
单个批量请求的最大尝试次数

max_batch_size [int]
批量批量文档的最大大小

tls_verify_certificate [boolean]
启用 HTTPS 端点的证书验证

tls_verify_hostname [boolean]
启用 HTTPS 端点的主机名验证

tls_keystore_path [string]
PEM 或 JKS 密钥库的路径。该文件必须由运行 SeaTunnel 的操作系统用户可读取。

tls_keystore_password [string]
指定密钥库的密钥密码

tls_truststore_path [string]
PEM 或 JKS 信任库的路径。该文件必须由运行 SeaTunnel 的操作系统用户可读取。

tls_truststore_password [string]
指定信任库的密钥密码

common options
Sink 插件的通用参数，请参阅 Sink Common Options 了解详细信息。

# 示例

简单示例：

```yaml
sink {
    Elasticsearch {
        hosts = ["localhost:9200"]
        index = "seatunnel-${age}"
    }
}
```

CDC（变更数据捕获）事件：

```yaml
sink {
    Elasticsearch {
        hosts = ["localhost:9200"]
        index = "seatunnel-${age}"
        
        # cdc required options
        primary_keys = ["key1", "key2", ...]
    }
}
```

SSL（禁用证书验证）：

```yaml
sink {
    Elasticsearch {
        hosts = ["https://localhost:9200"]
        username = "elastic"
        password = "elasticsearch"
        
        tls_verify_certificate = false
    }
}
```

SSL（禁用主机名验证）：

```yaml
sink {
    Elasticsearch {
        hosts = ["https://localhost:9200"]
        username = "elastic"
        password = "elasticsearch"
        
        tls_verify_hostname = false
    }
}
```

SSL（启用证书验证）：

```yaml
sink {
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

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/Elasticsearch

* any list
{:toc}
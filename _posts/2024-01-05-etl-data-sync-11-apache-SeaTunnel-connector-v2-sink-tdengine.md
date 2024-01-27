---
layout: post
title: ETL-11-apache SeaTunnel Connector v2 sink tdengine
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# TDengine

TDengine 汇聚连接器

## 描述

用于将数据写入 TDengine。在运行 SeaTunnel 任务之前，您需要先创建一个 stable。

## 主要特性

√ 精确一次传输

 变更数据捕获（CDC）

# 选项

| 名称        | 类型     | 是否必需 | 默认值        |
|-------------|----------|----------|--------------|
| url         | 字符串   | 是       | -            |
| username    | 字符串   | 是       | -            |
| password    | 字符串   | 是       | -            |
| database    | 字符串   | 是       | -            |
| stable      | 字符串   | 是       | -            |
| timezone    | 字符串   | 否       | UTC          |

url [字符串]
选择 TDengine 时的 TDengine 的 URL。

例如：

```
jdbc:TAOS-RS://localhost:6041/
```

username [字符串]
选择 TDengine 时的 TDengine 用户名。

password [字符串]
选择 TDengine 时的 TDengine 密码。

database [字符串]
选择 TDengine 时的 TDengine 数据库。

stable [字符串]
选择 TDengine 时的 TDengine Stable。

timezone [字符串]
TDengine 服务器的时区，对于 ts 字段很重要。

# 示例

```conf
sink {
  TDengine {
    url: "jdbc:TAOS-RS://localhost:6041/"
    username: "root"
    password: "taosdata"
    database: "power2"
    stable: "meters2"
    timezone: "UTC"
  }
}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/sink/TDengine/

* any list
{:toc}
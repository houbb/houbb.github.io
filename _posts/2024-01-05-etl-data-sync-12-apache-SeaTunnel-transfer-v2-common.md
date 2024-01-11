---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 Transform Common Options
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Transform Common Options

Transform 插件的通用参数

| 名称                 | 类型    | 必需 | 默认值 |
|----------------------|---------|------|--------|
| result_table_name    | 字符串  | 否   | -      |
| source_table_name    | 字符串  | 否   | -      |

## source_table_name [string]

当未指定 source_table_name 时，当前插件处理配置文件中前一个插件输出的数据集（dataset）；

当指定了 source_table_name 时，当前插件正在处理与该参数对应的数据集。

## result_table_name [string]

当未指定 result_table_name 时，该插件处理的数据将不会被注册为其他插件直接访问的数据集，或称为临时表（table）；

当指定了 result_table_name 时，该插件处理的数据将被注册为其他插件可以直接访问的数据集（dataset），或称为临时表（table）。

在这里注册的数据集可以通过指定 source_table_name 直接被其他插件访问。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/common-options

* any list
{:toc}
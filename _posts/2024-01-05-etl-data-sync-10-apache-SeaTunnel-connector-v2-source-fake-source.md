---
layout: post
title: ETL-10-apache SeaTunnel Connector v2 source FakeSource
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# FakeSource

FakeSource 连接器

## 描述

FakeSource 是一个虚拟数据源，根据用户定义的模式随机生成行数，仅用于一些测试用例，例如类型转换或连接器新功能测试。

## 主要特点

- 批处理
- 流处理
- 精确一次 ×
- 列投影
- 并行性 ×
- 支持用户定义的拆分 ×

# 选项

| 名称                      | 类型       | 必需 | 默认值                    |
|---------------------------|------------|------|---------------------------|
| schema                    | config     | 是   | -                         |
| rows                      | config     | 否   | -                         |
| row.num                   | int        | 否   | 5                         |
| split.num                 | int        | 否   | 1                         |
| split.read-interval       | long       | 否   | 1                         |
| map.size                  | int        | 否   | 5                         |
| array.size                | int        | 否   | 5                         |
| bytes.length              | int        | 否   | 5                         |
| string.length             | int        | 否   | 5                         |
| string.fake.mode          | string     | 否   | range                     |
| tinyint.fake.mode         | string     | 否   | range                     |
| tinyint.min               | tinyint    | 否   | 0                         |
| tinyint.max               | tinyint    | 否   | 127                       |
| tinyint.template          | list       | 否   | -                         |
| smallint.fake.mode        | string     | 否   | range                     |
| smallint.min              | smallint   | 否   | 0                         |
| smallint.max              | smallint   | 否   | 32767                     |
| smallint.template         | list       | 否   | -                         |
| int.fake.template         | string     | 否   | range                     |
| int.min                   | int        | 否   | 0                         |
| int.max                   | int        | 否   | 0x7fffffff                |
| int.template              | list       | 否   | -                         |
| bigint.fake.mode          | string     | 否   | range                     |
| bigint.min                | bigint     | 否   | 0                         |
| bigint.max                | bigint     | 否   | 0x7fffffffffffffff       |
| bigint.template           | list       | 否   | -                         |
| float.fake.mode           | string     | 否   | range                     |
| float.min                 | float      | 否   | 0                         |
| float.max                 | float      | 否   | 0x1.fffffeP+127           |
| float.template            | list       | 否   | -                         |
| double.fake.mode          | string     | 否   | range                     |
| double.min                | double     | 否   | 0                         |
| double.max                | double     | 否   | 0x1.fffffffffffffP+1023  |
| double.template           | list       | 否   | -                         |
| common-options            | 无         | 否   | -                         |

这是关于 FakeSource 连接器选项的配置列表。根据您的需求，您可以适当配置这些选项。


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/connector-v2/source/FakeSource

* any list
{:toc}
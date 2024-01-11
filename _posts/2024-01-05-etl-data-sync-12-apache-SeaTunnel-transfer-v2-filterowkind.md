---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 FilterRowKind
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# FilterRowKind

FilterRowKind transform plugin

## 描述

按 RowKind 进行数据筛选。

## 选项

| 名称         | 类型     | 必需 | 默认值 |
|--------------|----------|------|--------|
| row_kind     | 字符串   | 是   | -      |

row_kind [string]

要保留的行的 RowKind 类型。有效值包括 "INSERT"、"UPDATE_BEFORE"、"UPDATE_AFTER"、"DELETE"。

# Options

| 名称              | 类型   | 必需 | 默认值 |
|-------------------|--------|------|--------|
| include_kinds    | 数组   | 是   | -      |
| exclude_kinds    | 数组   | 是   | -      |

include_kinds [array]

要包含的 RowKind 类型。

exclude_kinds [array]

要排除的 RowKind 类型。

您只能配置 include_kinds 和 exclude_kinds 中的一个。

common options [string]

Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

# 示例

由 FakeSource 生成的数据的 RowKind 是 INSERT。

如果我们使用 FilterRowKind transform 并排除 INSERT 数据，将不会将任何行写入 sink。

```yaml
env:
  job.mode: "BATCH"

source:
  FakeSource:
    result_table_name: "fake"
    row.num: 100
    schema:
      fields:
        id: "int"
        name: "string"
        age: "int"

transform:
  FilterRowKind:
    source_table_name: "fake"
    result_table_name: "fake1"
    exclude_kinds:
      - "INSERT"

sink:
  Console:
    source_table_name: "fake1"
```

这个例子中，FakeSource 生成的数据的 RowKind 是 INSERT，但由于在 FilterRowKind 中设置了 exclude_kinds，因此将不会将任何 INSERT 行写入 Console sink。

如果您有其他问题或需要进一步的帮助，请随时提问。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/filter-rowkind

* any list
{:toc}
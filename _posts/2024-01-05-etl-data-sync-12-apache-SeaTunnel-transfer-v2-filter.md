---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 Filter
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Filter

Filter transform plugin

## 描述

按字段进行筛选。

## 选项

| 名称       | 类型   | 必需 | 默认值 |
|------------|--------|------|--------|
| fields     | 数组   | 是   | -      |

fields [array]
需要保留的字段列表。不在列表中的字段将被删除。

common options [string]
Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

# Example

从源读取的数据是一个类似于以下的表格：

```
name    age    card
Joy Ding    20    123
May Ding    20    123
Kin Dom    20    123
Joy Dom    20    123
```

我们想要删除字段 `age`，我们可以添加如下的 Filter Transform：

```yaml
transform:
  Filter:
    source_table_name: "fake"
    result_table_name: "fake1"
    fields:
      - name
      - card
```

在这个例子中，`fake1` 表中将只包含 `name` 和 `card` 两个字段。


```
name        card
Joy Ding    123
May Ding    123
Kin Dom     123
Joy Dom     123
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/filter

* any list
{:toc}
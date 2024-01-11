---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 Split
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Split

## 描述

将一个字段拆分成多个字段。

# 选项

- name（名称）: 字符串，必填。
- separator（分隔符）: 字符串，必填。用于拆分字段的分隔符。
- split_field（拆分字段）: 字符串，必填。要拆分的字段名称。
- output_fields（输出字段）: 数组，必填。存储拆分后的结果的字段数组。

## 常见选项

- Transform plugin common parameters，请参阅 Transform Plugin 了解详情。

# Example

从源中读取的数据如下：

```
name	age	card
Joy Ding	20	123
May Ding	20	123
Kin Dom	20	123
Joy Dom	20	123
```

我们想要将 name 字段拆分为 first_name 和 second_name，我们可以添加 Split transform，如下所示：

```
transform {
  Split {
    source_table_name = "fake"
    result_table_name = "fake1"
    separator = " "
    split_field = "name"
    output_fields = [first_name, second_name]
  }
}
```

那么，fake1 表中的数据将如下所示：

```
name	age	card	first_name	last_name
Joy Ding	20	123	Joy	Ding
May Ding	20	123	May	Ding
Kin Dom	20	123	Kin	Dom
Joy Dom	20	123	Joy	Dom
```
# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/split

* any list
{:toc}
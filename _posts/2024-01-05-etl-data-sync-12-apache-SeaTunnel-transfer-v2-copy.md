---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 Transform Copy
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Copy

Copy transform plugin

## 描述

将字段复制到新字段。

## 选项

| 名称         | 类型     | 必需 | 默认值 |
|--------------|----------|------|--------|
| fields       | 对象     | 是   | -      |

fields [config]

指定输入和输出之间的字段复制关系。

common options [string]

Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

# 示例

从源读取的数据是一个类似如下的表格：

```
name      age   card
Joy Ding  20    123
May Ding  20    123
Kin Dom   20    123
Joy Dom   20    123
```

我们想要将字段 name、age 复制到新的字段 name1、name2、age1，我们可以添加 Copy Transform，如下所示：

```yaml
transform {
  Copy {
    source_table_name = "fake"
    result_table_name = "fake1"
    fields {
      name1 = name
      name2 = name
      age1 = age
    }
  }
}
```

然后，结果表 `fake1` 中的数据将如下所示：

```
name      age   card  name1     name2     age1
Joy Ding  20    123   Joy Ding  Joy Ding  20
May Ding  20    123   May Ding  May Ding  20
Kin Dom   20    123   Kin Dom   Kin Dom   20
Joy Dom   20    123   Joy Dom   Joy Dom   20
```

这样，我们成功地将字段复制到了新的字段中。

```
name	age	card	name1	name2	age1
Joy Ding	20	123	Joy Ding	Joy Ding	20
May Ding	20	123	May Ding	May Ding	20
Kin Dom	20	123	Kin Dom	Kin Dom	20
Joy Dom	20	123	Joy Dom	Joy Dom	20
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/copy

* any list
{:toc}
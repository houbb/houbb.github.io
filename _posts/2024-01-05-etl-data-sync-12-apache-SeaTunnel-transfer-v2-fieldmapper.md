---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 FieldMapper
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# FieldMapper

FieldMapper transform plugin

## 描述

添加输入模式和输出模式映射。

选项
| 名称            | 类型     | 必需 | 默认值 |
|-----------------|----------|------|--------|
| field_mapper    | 对象     | 是   | -      |

field_mapper [config]

指定输入和输出之间的字段映射关系。

common options [config]

Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

# 示例

从源读取的数据是一个类似如下的表格：

```
id  name      age   card
1   Joy Ding  20    123
2   May Ding  20    123
3   Kin Dom   20    123
4   Joy Dom   20    123
```

我们想要删除 `age` 字段，更新字段的顺序为 `id`、`card`、`name`，并将 `name` 重命名为 `new_name`。

我们可以添加 FieldMapper transform，如下所示：

```yaml
transform {
  FieldMapper {
    source_table_name = "fake"
    result_table_name = "fake1"
    field_mapper = {
        id = id
        card = card
        name = new_name
    }
  }
}
```

然后，结果表 `fake1` 中的数据将如下所示：

```
id  card  new_name
1   123   Joy Ding
2   123   May Ding
3   123   Kin Dom
4   123   Joy Dom
```

这样，我们成功地删除了 `age` 字段，更新了字段的顺序，并重命名了 `name` 字段。

如果您有其他问题或需要进一步的帮助，请随时提问。

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/field-mapper

* any list
{:toc}
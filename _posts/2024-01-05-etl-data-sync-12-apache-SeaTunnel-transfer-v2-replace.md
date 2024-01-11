---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 Replace
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# Replace

Replace transform plugin

## 描述

检查给定字段中的字符串值，并用给定替换替换与给定字符串文字或正则表达式匹配的字符串值的子字符串。

# 选项

| 名称             | 类型      | 必需 | 默认值 |
|------------------|-----------|------|--------|
| replace_field   | 字符串    | 是   | -      |
| pattern         | 字符串    | 是   | -      |
| replacement     | 字符串    | 是   | -      |
| is_regex        | 布尔      | 否   | false  |
| replace_first   | 布尔      | 否   | false  |

## 常见选项 [字符串]

Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

replace_field [string]
要替换的字段。

pattern [string]
将被替换的旧字符串。

replacement [string]
替换的新字符串。

is_regex [boolean]
是否使用正则表达式进行字符串匹配。

replace_first [boolean]
是否只替换第一个匹配的字符串。仅当 is_regex = true 时使用。

common options [string]
Transform 插件的通用参数，请参阅 Transform 插件 了解详细信息。

# Example

从源读取的数据表如下：

```
name      age  card
Joy Ding  20   123
May Ding  20   123
Kin Dom   20   123
Joy Dom   20   123
```

我们想要将`name`字段中的字符替换为下划线 `_`。然后，我们可以添加一个如下的 Replace Transform：

```yaml
transform {
  Replace {
    source_table_name = "fake"
    result_table_name = "fake1"
    replace_field = "name"
    pattern = " "
    replacement = "_"
  }
}
```

然后，结果表 `fake1` 中的数据将如下所示：

```
name      age  card
Joy_Ding  20   123
May_Ding  20   123
Kin_Dom   20   123
Joy_Dom   20   123
```

这样，`name` 字段中的空格字符被替换为了下划线 `_`。如果您有其他问题或需要进一步的帮助，请随时提问。

# Job Config Example

```
env {
  job.mode = "BATCH"
}

source {
  FakeSource {
    result_table_name = "fake"
    row.num = 100
    schema = {
      fields {
        id = "int"
        name = "string"
      }
    }
  }
}

transform {
  Replace {
    source_table_name = "fake"
    result_table_name = "fake1"
    replace_field = "name"
    pattern = ".+"
    replacement = "b"
    is_regex = true
  }
}

sink {
  Console {
    source_table_name = "fake1"
  }
}
```

# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/replace

* any list
{:toc}
---
layout: post
title: ETL-12-apache SeaTunnel Transform v2 SQL
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# SQL

SQL transform plugin

# 描述：

使用 SQL 对给定的输入行进行转换。

SQL 转换使用内存中的 SQL 引擎，我们可以通过 SQL 函数和 SQL 引擎的能力来实现转换任务。

# 选项：

- `source_table_name` [string]
  - 源表的名称，查询 SQL 的表名必须与此字段匹配。

- `query` [string]
  - 查询 SQL，它是一个支持基本函数和条件过滤操作的简单 SQL。但目前尚不支持复杂的 SQL，包括：多个源表/行的 JOIN 操作和 AGGREGATE 操作等。

# Example

从源读取的数据如下：

```
id   name      age
1    Joy Ding  20
2    May Ding  21
3    Kin Dom   24
4    Joy Dom   22
```

我们使用 SQL 查询来对源数据进行转换，如下所示：

```yaml
transform:
  Sql:
    source_table_name: "fake"
    result_table_name: "fake1"
    query: "select id, concat(name, '_') as name, age+1 as age from fake where id>0"
```

结果表 `fake1` 中的数据将如下更新：

```
id   name         age
1    Joy Ding_    21
2    May Ding_    22
3    Kin Dom_     25
4    Joy Dom_     23
```

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
        age = "int"
      }
    }
  }
}

transform {
  Sql {
    source_table_name = "fake"
    result_table_name = "fake1"
    query = "select id, concat(name, '_') as name, age+1 as age from fake where id>0"
  }
}

sink {
  Console {
    source_table_name = "fake1"
  }
}
```


# 参考资料

https://seatunnel.apache.org/docs/2.3.3/transform-v2/sql

* any list
{:toc}
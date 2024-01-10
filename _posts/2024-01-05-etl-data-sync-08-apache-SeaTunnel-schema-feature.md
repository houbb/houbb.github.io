---
layout: post
title: ETL-08-apache SeaTunnel Intro to schema feature
date: 2024-01-05 21:01:55 +0800
categories: [ETL]
tags: [etl, sh]
published: true
---

# **模式特性介绍**

## **为什么需要模式**

一些 NoSQL 数据库或消息队列没有强制的模式，因此无法通过 API 获取模式。此时，需要定义一个模式以转换为 SeaTunnelRowType 并获取数据。

## **目前支持的类型**

SeaTunnel 目前支持多种数据类型，具体支持的类型可以查看 SeaTunnel 的文档或相关资源。

这些类型通常包括基本数据类型（如整数、字符串、日期等）以及可能的复杂数据类型（如数组、嵌套结构等）。

**目前支持的数据类型**

| 数据类型   | Java 值类型            | 描述                                                   |
|------------|-----------------------|--------------------------------------------------------|
| string     | java.lang.String      | 字符串                                                 |
| boolean    | java.lang.Boolean     | 布尔值                                                 |
| tinyint    | java.lang.Byte        | -128 到 127（正常范围）。0 到 255（无符号*）。在括号中指定最大数字位数。 |
| smallint   | java.lang.Short       | -32768 到 32767（一般范围）。0 到 65535（无符号*）。在括号中指定最大数字位数。 |
| int        | java.lang.Integer     | 允许的所有数字范围从 -2,147,483,648 到 2,147,483,647。         |
| bigint     | java.lang.Long        | 允许的所有数字范围从 -9,223,372,036,854,775,808 到 9,223,372,036,854,775,807。 |
| float      | java.lang.Float       | 浮点数，精度从 -1.79E+308 到 1.79E+308。                   |
| double     | java.lang.Double      | 双精度浮点数，处理大多数小数。                            |
| decimal    | java.math.BigDecimal  | 存储为字符串的 DOUBLE 类型，允许固定小数点。                      |
| null       | java.lang.Void        | 空值                                                  |
| bytes      | byte[]                | 字节数组                                               |
| date       | java.time.LocalDate   | 仅存储日期，从公元 1 年 1 月 1 日到 9999 年 12 月 31 日。       |
| time       | java.time.LocalTime   | 仅存储时间，精度为 100 纳秒。                            |
| timestamp  | java.time.LocalDateTime | 存储在每次创建或修改行时更新的唯一数字。时间戳基于内部时钟，不对应实时时间。每个表中只能有一个时间戳变量。 |
| row        | org.apache.seatunnel.api.table.type.SeaTunnelRow | 行类型，可以嵌套。                                         |
| map        | java.util.Map         | Map 是将键映射到值的对象。键类型包括 int string boolean tinyint smallint bigint float double decimal date time timestamp null，值类型包括 int string boolean tinyint smallint bigint float double decimal date time timestamp null array map。 |
| array      | ValueType[]           | 数组是表示元素集合的数据类型。元素类型包括 int string boolean tinyint smallint bigint float double array map。 |

## How to use schema

模式定义了数据的格式，其中包含字段属性。字段定义了字段属性，它是一个键值对，键是字段名，值是字段类型。

以下是一个示例。

```conf
source {
  FakeSource {
    parallelism = 2
    result_table_name = "fake"
    row.num = 16
    schema = {
      fields {
        id = bigint
        c_map = "map<string, smallint>"
        c_array = "array<tinyint>"
        c_string = string
        c_boolean = boolean
        c_tinyint = tinyint
        c_smallint = smallint
        c_int = int
        c_bigint = bigint
        c_float = float
        c_double = double
        c_decimal = "decimal(2, 1)"
        c_bytes = bytes
        c_date = date
        c_timestamp = timestamp
      }
    }
  }
}
```

# chat

## 如何使用 **如何使用模式**

模式是用来定义数据结构的，指明每个字段的类型和名称。

在 SeaTunnel 中，您可以使用模式定义数据源和汇的结构。模式通常以编程方式定义，以确保数据的一致性和准确性。以下是一些使用模式的基本步骤：

1. **定义模式：** 使用支持的数据类型为每个字段定义模式。例如，您可以定义一个包含整数、字符串和日期字段的模式。

```java
SeaTunnelSchema schema = SeaTunnelSchema.builder()
    .field("id", DataTypes.INT())
    .field("name", DataTypes.STRING())
    .field("birthDate", DataTypes.DATE())
    .build();
```

2. **将模式应用于数据源和汇：** 在创建连接器或数据表时，将模式应用于相应的数据源或汇。

```java
SeaTunnelSourceConnector sourceConnector = SeaTunnelSourceConnector.builder()
    .schema(schema)
    .build();

SeaTunnelSinkConnector sinkConnector = SeaTunnelSinkConnector.builder()
    .schema(schema)
    .build();
```

这样，您就可以使用定义好的模式来确保数据的结构一致性。


# 参考资料

https://github.com/apache/seatunnel

https://seatunnel.apache.org/docs/2.3.3/about

* any list
{:toc}
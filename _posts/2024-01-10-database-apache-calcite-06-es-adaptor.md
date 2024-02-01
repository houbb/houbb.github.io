---
layout: post
title: Apache Calcite 动态数据管理框架-06-Es adaptor
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

#  Elasticsearch适配器

有关下载和构建Calcite的说明，请参阅教程。

一旦成功编译项目，您可以在此处开始使用Calcite查询Elasticsearch。

首先，我们需要一个模型定义。该模型为Calcite提供了创建Elasticsearch适配器实例所需的参数。模型可以包含对材料化的定义。在模型定义中定义的表的名称对应于Elasticsearch中的索引。

以下是一个模型文件的基本示例：

```json
{
  "version": "1.0",
  "defaultSchema": "elasticsearch",
  "schemas": [
    {
      "type": "custom",
      "name": "elasticsearch",
      "factory": "org.apache.calcite.adapter.elasticsearch.ElasticsearchSchemaFactory",
      "operand": {
        "coordinates": "{'127.0.0.1': 9200}"
      }
    }
  ]
}
```

假设此文件保存为model.json，您可以通过sqlline连接到Elasticsearch，如下所示：

```bash
$ ./sqlline
sqlline> !connect jdbc:calcite:model=model.json admin admin
```

您还可以在模型定义中使用index和pathPrefix参数指定表示索引和路径前缀的索引名称和路径前缀：

```json
...
  "operand": {
    "coordinates": "{'127.0.0.1': 9200}",
    "index": "usa",
    "pathPrefix": "path"
  }
...
```

sqlline现在将接受访问您的Elasticsearch的SQL查询。

此适配器的目的是通过在可能的情况下直接在Elasticsearch中利用过滤和排序来将查询编译成最有效的Elasticsearch SEARCH JSON。

我们可以发出一个简单的查询，以获取存储在索引usa中的所有州的名称。

```sql
sqlline> SELECT * from "usa";
```

```
_MAP={pop=13367, loc=[-72.505565, 42.067203], city=EAST LONGMEADOW, id=01028, state=MA}
_MAP={pop=1652, loc=[-72.908793, 42.070234], city=TOLLAND, id=01034, state=MA}
_MAP={pop=3184, loc=[-72.616735, 42.38439], city=HATFIELD, id=01038, state=MA}
_MAP={pop=43704, loc=[-72.626193, 42.202007], city=HOLYOKE, id=01040, state=MA}
_MAP={pop=2084, loc=[-72.873341, 42.265301], city=HUNTINGTON, id=01050, state=MA}
_MAP={pop=1350, loc=[-72.703403, 42.354292], city=LEEDS, id=01053, state=MA}
_MAP={pop=8194, loc=[-72.319634, 42.101017], city=MONSON, id=01057, state=MA}
_MAP={pop=1732, loc=[-72.204592, 42.062734], city=WALES, id=01081, state=MA}
_MAP={pop=9808, loc=[-72.258285, 42.261831], city=WARE, id=01082, state=MA}
_MAP={pop=4441, loc=[-72.203639, 42.20734], city=WEST WARREN, id=01092, state=MA}
```

在执行此查询时，Elasticsearch适配器能够识别城市可以由Elasticsearch进行过滤，而州可以按升序由Elasticsearch进行排序。

提供给Elasticsearch的最终源JSON如下：

```json
{
  "query": {
    "constant_score": {
      "filter": {
        "bool": {
          "must": [
            {
              "term": {
                "city": "springfield"
              }
            }
          ]
        }
      }
    }
  },
  "fields": [
    "city",
    "state"
  ],
  "script_fields": {},
  "sort": [
    {
      "state": "asc"
    }
  ]
}
```

您还可以在没有事先视图定义的情况下查询Elasticsearch索引：

```sql
sqlline> SELECT _MAP['city'], _MAP['state'] from "elasticsearch"."usa" order by _MAP['state'];
```

# Scrolling API的使用

对于没有聚合函数（如COUNT、MAX等）的查询，默认情况下，弹性适配器使用滚动API。这确保一致且完整的数据集以惰性和分批次的方式返回给最终用户。

请注意，当所有查询结果都被使用完时，滚动会自动清除（移除）。

# 支持的版本

目前，该适配器支持ElasticSearch版本6.x（或更新版本）。通常，我们尽量遵循官方的支持计划。此外，不支持类型（此适配器仅支持索引）。

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html

* any list
{:toc}
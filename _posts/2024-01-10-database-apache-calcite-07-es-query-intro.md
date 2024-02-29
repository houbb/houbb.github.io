---
layout: post
title: Apache Calcite ES 各种 Query 的基本介绍
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 说明

我们参考了 `org.apache.calcite.adapter.elasticsearch.QueryBuilders` 中各种 query 的实现方式。

为了避免有些内容的混淆，这里对这个类中提到的 query 做一个基本的梳理。


# chat

## termQuery

在Elasticsearch中，`termQuery`是一种用于精确匹配特定词项（term）的查询。

它与其他查询类型（如`matchQuery`）不同之处在于，它会将查询条件视为单个词项，而不会分析该词项。

这意味着，`termQuery`查询会完全匹配指定的词项，而不会将查询字符串分词成词项，也不会对文档中的词项进行分析。

以下是一个使用`termQuery`的简单示例：

```json
{
  "query": {
    "term": {
      "user": "John"
    }
  }
}
```

在这个例子中：
- `query` 指定了一个查询。
- `term` 表示这是一个term查询。
- `"user": "John"` 指定了查询条件，即要求文档中的 `user` 字段的值必须精确匹配 "John"。

需要注意的是，`termQuery`是大小写敏感的，因此如果想要匹配不区分大小写的词项，可以使用`keyword`类型的字段，并使用`lowercase`策略。

另外，`termQuery`通常用于精确匹配单个词项，对于短语或文本匹配，通常会使用其他类型的查询，如`matchQuery`。

虽然`termQuery`在某些情况下非常有用，但也需要注意其局限性，例如无法处理分词或模糊匹配等。

因此，在使用时需要根据具体需求选择合适的查询类型。

## 详细介绍一下 ES 的 matchQuery

在Elasticsearch中，`matchQuery`是一种用于执行全文搜索的查询类型。

它将输入的查询字符串分析成词项，并与文档中的字段进行匹配。

`matchQuery`可以处理分词、模糊匹配等情况，因此在实际使用中非常灵活，并且适用于对文本内容进行搜索。

下面是一个简单的示例，展示了如何使用`matchQuery`：

```json
{
  "query": {
    "match": {
      "message": "quick brown fox"
    }
  }
}
```

在这个例子中：
- `query` 指定了一个查询。
- `match` 表示这是一个match查询。
- `"message": "quick brown fox"` 指定了查询条件，即要求文档中的 `message` 字段中包含 "quick"、"brown" 和 "fox" 中的任何一个或多个词项。

`matchQuery`具有许多参数和选项，可以用于控制搜索的行为，例如设置最小匹配度、指定操作符（and/or）、启用模糊匹配等。

下面是一个更复杂的示例，展示了一些常见的选项：

```json
{
  "query": {
    "match": {
      "message": {
        "query": "quick brown fox",
        "operator": "or",
        "fuzziness": "AUTO"
      }
    }
  }
}
```

在这个示例中：
- `"query": "quick brown fox"` 指定了要搜索的查询字符串。
- `"operator": "or"` 设置了操作符为OR，表示只要匹配到其中任意一个词项即可。
- `"fuzziness": "AUTO"` 启用了模糊匹配，Elasticsearch将尝试纠正拼写错误或包含相似词的查询。

总的来说，`matchQuery`是Elasticsearch中常用的一种查询类型，它可以灵活处理文本搜索的需求，并且具有丰富的选项和参数，可以根据具体场景进行调整以获得最佳匹配结果。

## 详细介绍一下 ES 的 rangeQuery

在Elasticsearch中，`rangeQuery`是一种用于查询某个字段值在指定范围内的文档的查询类型。它允许您根据字段的值是否在给定的范围内来检索文档，这个范围可以包括大于、小于、等于、大于等于或小于等于某个特定值。

下面是一个简单的示例，展示了如何使用`rangeQuery`：

```json
{
  "query": {
    "range": {
      "age": {
        "gte": 20,
        "lte": 30
      }
    }
  }
}
```

在这个例子中：
- `query` 指定了一个查询。
- `range` 表示这是一个range查询。
- `"age"` 是要进行范围匹配的字段名。
- `"gte": 20` 指定了字段值必须大于或等于20。
- `"lte": 30` 指定了字段值必须小于或等于30。

这个查询将匹配age字段值在20到30之间的文档。

`rangeQuery`支持的参数包括：
- `gte`：大于或等于指定值。
- `gt`：大于指定值。
- `lte`：小于或等于指定值。
- `lt`：小于指定值。
- `format`：指定日期字段的格式，用于日期范围查询。
- `time_zone`：指定时区，用于日期范围查询。

例如，对于日期字段，可以使用以下查询：

```json
{
  "query": {
    "range": {
      "date": {
        "gte": "2023-01-01",
        "lte": "2023-12-31",
        "format": "yyyy-MM-dd"
      }
    }
  }
}
```

这个查询将匹配日期字段值在2023年的文档。

总的来说，`rangeQuery`是用于对字段值进行范围匹配的重要查询类型，在许多实际情况下都非常有用，例如对年龄、价格、日期等字段进行范围搜索。

## 详细介绍一下 ES 中的 regexpQuery

Elasticsearch中的`regexpQuery`（正则表达式查询）允许您使用正则表达式模式来匹配文档中的字段。这种查询对于需要更灵活的匹配模式的情况非常有用，因为它允许您指定更复杂的匹配条件，而不仅仅是简单的精确或模糊匹配。

下面是一个使用`regexpQuery`的简单示例：

```json
{
  "query": {
    "regexp": {
      "user": "jo.*"
    }
  }
}
```

在这个示例中：
- `query` 指定了一个查询。
- `regexp` 表示这是一个regexp查询。
- `"user": "jo.*"` 指定了正则表达式模式，要求匹配 `user` 字段值以 "jo" 开头的任意字符串。

需要注意的是，正则表达式查询可能会对性能产生一定影响，特别是在处理大量文档时。因此，应该谨慎使用正则表达式查询，尤其是对于复杂的模式或大型数据集。

此外，为了安全起见，Elasticsearch默认情况下禁用了部分正则表达式的特性，以防止可能的安全风险。您可以通过设置`regex`查询限制参数来调整允许使用的正则表达式功能。

总的来说，`regexpQuery`提供了一种强大的方式来执行基于正则表达式的搜索，但是需要注意性能和安全性方面的考虑，以及使用正则表达式可能导致的复杂性。

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html

* any list
{:toc}
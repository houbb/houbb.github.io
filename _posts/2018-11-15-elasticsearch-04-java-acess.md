---
layout: post
title: Elasticsearch-04-java 访问 ES
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 基本操作

## maven

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
</properties>

<dependencies>
    <dependency>
        <groupId>org.elasticsearch.client</groupId>
        <artifactId>elasticsearch-rest-high-level-client</artifactId>
        <version>7.15.0</version> <!-- 请根据你的 Elasticsearch 版本选择相应版本 -->
    </dependency>
</dependencies>
```

## 入门操作

```java
package org.example;

import org.apache.http.HttpHost;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.client.*;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentType;

import java.io.IOException;

public class EsBasicMain {

    public static void main(String[] args) throws IOException {
        // 创建 Elasticsearch 客户端
        //获取连接客户端  获取连接参数还可以使用另外两种方式:在配置文件中获取,或者是在数据库中配置然后读取数据库中的配置
        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost("172.24.20.97", 9200, "http")));

        // 示例：创建索引
//        createIndex(client, "your_index");

        // 示例：插入文档
        indexDocument(client, "your_index", "2", "{\"field1\":\"valueAdd1\",\"field2\":\"valueAdd2\"}");

        // 示例：获取文档
        getDocument(client, "your_index", "2");
    }

    private static void createIndex(RestHighLevelClient client, String indexName) throws IOException {
        CreateIndexRequest request = new CreateIndexRequest(indexName);
        request.settings(Settings.builder()
                .put("index.number_of_shards", 1)
                .put("index.number_of_replicas", 0)
        );
        client.indices().create(request, RequestOptions.DEFAULT);
    }

    private static void indexDocument(RestHighLevelClient client, String indexName, String documentId, String source) throws IOException {
        client.index(Requests.indexRequest(indexName)
                .id(documentId)
                .source(source, XContentType.JSON), RequestOptions.DEFAULT);
    }

    private static void getDocument(RestHighLevelClient client, String indexName, String documentId) throws IOException {
        //构建请求 这个请求是建立在 book索引存在的情况下  这里可以自己用代码进行一次判断,没有book索引那么我们就先创建book索引
        GetRequest getRequest = new GetRequest(indexName, documentId);
        // 执行  获取返回的结果
        GetResponse getResponse = client.get(getRequest, RequestOptions.DEFAULT);
        // 获取结果
        if (getResponse.isExists()) {
            long version = getResponse.getVersion();
            String sourceAsString = getResponse.getSourceAsString();//检索文档(String形式)
            System.out.println(sourceAsString);
        } else {
            System.out.println("NOT FOUND----------------");
        }
    }

}
```

createIndex 创建索引，多次执行会失败。

## java 如何按照查询 es，比如查询 field2=value2 的数据 

这里需要指定 index 名称。

如下：

```java
import org.apache.http.HttpHost;
import org.elasticsearch.action.get.GetRequest;
import org.elasticsearch.action.get.GetResponse;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.Requests;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.indices.CreateIndexRequest;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentType;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.builder.SearchSourceBuilder;

import java.io.IOException;

public class EsConditionQueryMain {

    public static void main(String[] args) throws IOException {
        // 创建 Elasticsearch 客户端
        //获取连接客户端  获取连接参数还可以使用另外两种方式:在配置文件中获取,或者是在数据库中配置然后读取数据库中的配置
        RestHighLevelClient client = new RestHighLevelClient(
                RestClient.builder(
                        new HttpHost("172.24.20.97", 9200, "http")));

        // 查询请求
        SearchRequest searchRequest = new SearchRequest("your_index");
        SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();
        // 构建查询条件：field1=value1
        searchSourceBuilder.query(QueryBuilders.termQuery("field2", "value2"));
        // 设置查询源
        searchRequest.source(searchSourceBuilder);

        // 执行查询
        SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);

        // 处理查询结果
        // 处理查询结果
        // 这里可以根据实际需求处理返回的文档结果
        // 例如，获取搜索命中的文档
        searchResponse.getHits().forEach(hit -> {
            System.out.println("Document found: " + hit.getSourceAsString());
        });
    }

}
```

直接返回：

```
Document found: {"field1":"value1","field2":"value2"}
```


## java 如何统计等于具体值 ES 的数量？

统计指定 index 中的，field2=value2 的数量。

核心：`QueryBuilders.termQuery("field2", "value2")`

```java
import org.apache.http.HttpHost;
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.core.CountRequest;
import org.elasticsearch.client.core.CountResponse;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.aggregations.AggregationBuilders;
import org.elasticsearch.search.aggregations.metrics.Cardinality;
import org.elasticsearch.search.builder.SearchSourceBuilder;

import java.io.IOException;

public class EsCountQueryMain {

    public static void main(String[] args) {
        try (RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
                new HttpHost("172.24.20.97", 9200, "http")))) {

            // 构建 Count 请求
            CountRequest countRequest = new CountRequest("your_index");

            // 构建查询条件：fieldName=fieldValue
            countRequest.query(QueryBuilders.termQuery("field2", "value2"));

            // 执行 Count 请求
            CountResponse countResponse = client.count(countRequest, RequestOptions.DEFAULT);

            // 获取文档数量
            long documentCount = countResponse.getCount();
            System.out.println("Document count where field2=value2: " + documentCount);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

## 统计以某一个字段开头的数量

核心为 `QueryBuilders.prefixQuery("field2", "value")`

```java
package org.example;

import org.apache.http.HttpHost;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.client.core.CountRequest;
import org.elasticsearch.client.core.CountResponse;
import org.elasticsearch.index.query.QueryBuilders;

import java.io.IOException;

public class EsCountPrefixQueryMain {

    public static void main(String[] args) {
        try (RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
                new HttpHost("172.24.20.97", 9200, "http")))) {

            // 构建 Count 请求
            CountRequest countRequest = new CountRequest("your_index");

            // 构建查询条件：fieldName=fieldValue
            countRequest.query(QueryBuilders.prefixQuery("field2", "value"));

            // 执行 Count 请求
            CountResponse countResponse = client.count(countRequest, RequestOptions.DEFAULT);

            // 获取文档数量
            long documentCount = countResponse.getCount();
            System.out.println("Document count where field2=value2: " + documentCount);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

输出：

```
Document count where field2=value2: 2
```

## 统计字段值，wildcard 通配符查询

matchQuery 感觉是分词之后的匹配。

matchPhraseQuery 则不会进行分词。

`QueryBuilders.wildcardQuery("field2", "*lue*")` 可以用于通配符查询。

```java
public static void main(String[] args) {
        try (RestHighLevelClient client = new RestHighLevelClient(RestClient.builder(
                new HttpHost("172.24.20.97", 9200, "http")))) {

            // 构建 Count 请求
            CountRequest countRequest = new CountRequest("your_index");

            // 构建查询条件：fieldName=fieldValue
            countRequest.query(QueryBuilders.wildcardQuery("field2", "*lue*"));

            // 执行 Count 请求
            CountResponse countResponse = client.count(countRequest, RequestOptions.DEFAULT);

            // 获取文档数量
            long documentCount = countResponse.getCount();
            System.out.println("Document count where field2=value2: " + documentCount);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
```

数量 为 2。

# next 

我们尝试通过标准 sql 直接查询 ES。

# 基本的数据

## 如何统计数量：

命令行直接查询，your_index 是对应的索引名称。

```
curl -X GET "localhost:9200/your_index/_search"
```

如下：

```json
{
    "took":2,
    "timed_out":false,
    "_shards":{
        "total":1,
        "successful":1,
        "skipped":0,
        "failed":0
    },
    "hits":{
        "total":{
            "value":2,
            "relation":"eq"
        },
        "max_score":1,
        "hits":[
            {
                "_index":"your_index",
                "_type":"_doc",
                "_id":"1",
                "_score":1,
                "_source":{
                    "field1":"value1",
                    "field2":"value2"
                }
            },
            {
                "_index":"your_index",
                "_type":"_doc",
                "_id":"2",
                "_score":1,
                "_source":{
                    "field1":"valueAdd1",
                    "field2":"valueAdd2"
                }
            }
        ]
    }
}
```

## Q: ES 插入 doc 之前为什么需要初始化 index?

在Elasticsearch中，在插入文档（document）之前初始化索引（index）是为了确保索引的存在以及其映射（mapping）的定义。

以下是几个主要原因：

1. **索引的存在性检查：** 插入文档之前，通常需要确保要插入的索引已经存在。如果索引不存在，Elasticsearch默认会尝试根据文档的字段动态创建索引，但这可能导致不符合预期的映射。通过在插入文档之前初始化索引，可以确保索引已经存在，或者在不存在时手动创建并定义映射。

2. **映射的定义：** 索引的映射定义了每个字段的数据类型、分词器、存储方式等信息。映射的正确定义对于后续的搜索、排序和聚合操作至关重要。通过初始化索引，你可以明确定义索引的映射，确保文档插入时使用正确的数据类型和设置。

3. **索引的配置：** 初始化索引还可以用于配置索引的一些属性，例如分片数量、副本数量、分词器等。这些配置对于索引的性能和功能有着重要的影响。

示例：在插入文档之前初始化索引

```json
PUT /your_index
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1
  },
  "mappings": {
    "properties": {
      "field1": {
        "type": "text"
      },
      "field2": {
        "type": "keyword"
      }
      // 添加其他字段映射定义
    }
  }
}
```

在这个例子中，我们使用了`PUT /your_index`请求，指定了索引的设置（例如分片数量和副本数量）以及字段的映射定义。

这确保了在插入文档之前，索引`your_index`已经存在，并且字段的映射被正确定义。

在实际应用中，你可以根据需要定义更复杂的映射和配置。

## 各种 query 表格

下表列出了 Elasticsearch 中常见的几种 QueryBuilders 及其简要说明、适用场景和示例：

| QueryBuilder                | 说明                                                         | 适用场景                                                                                         | 示例                                                   |
|-----------------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `QueryBuilders.termQuery`    | 用于精确匹配某个字段的值                                     | 单一关键词搜索，不进行分词                                                                    | `QueryBuilders.termQuery("field", "value")`             |
| `QueryBuilders.matchQuery`   | 用于全文本搜索，支持分词和模糊匹配                           | 常用于全文本搜索，支持分词，适用于对文本内容的模糊匹配                                       | `QueryBuilders.matchQuery("field", "text value")`       |
| `QueryBuilders.matchPhraseQuery` | 用于确保整体文本包含指定的短语                              | 要求整体文本包含指定的短语                                                                    | `QueryBuilders.matchPhraseQuery("field", "full text")`  |
| `QueryBuilders.prefixQuery`  | 用于前缀匹配                                                 | 查找字段值以指定前缀开头的文档                                                               | `QueryBuilders.prefixQuery("field", "prefix")`          |
| `QueryBuilders.rangeQuery`   | 用于范围查询                                                 | 查找在指定范围内的文档，例如时间范围查询                                                     | `QueryBuilders.rangeQuery("dateField").gte("start").lt("end")` |
| `QueryBuilders.boolQuery`    | 用于组合多个查询条件，支持 AND/OR/NOT 等逻辑               | 复杂的查询场景，需要组合多个查询条件                                                           | `QueryBuilders.boolQuery().must(query1).should(query2).mustNot(query3)` |
| `QueryBuilders.existsQuery`  | 用于检查文档中是否存在某个字段                               | 查找文档中存在指定字段的文档                                                                 | `QueryBuilders.existsQuery("field")`                    |
| `QueryBuilders.wildcardQuery`| 用于通配符匹配                                               | 支持通配符的模糊匹配                                                                         | `QueryBuilders.wildcardQuery("field", "wild*")`        |

这只是 QueryBuilders 中的一部分常用查询类型。Elasticsearch 支持多种类型的查询，可以根据具体场景选择适当的查询类型。详细的查询语法和选项，请参考 Elasticsearch 的官方文档：[Elasticsearch Query DSL](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl.html)。

## FuzzyQuery

`FuzzyQuery` 是 Elasticsearch 中的一种模糊查询，用于在搜索时进行近似匹配。它允许你查找与目标词汇在编辑距离上有一定程度差异的文档，从而处理拼写错误或轻微的文本变体。

在模糊查询中，编辑距离（Edit Distance）是指通过插入、删除或替换字符将一个词转换成另一个词所需的最小操作次数。`FuzzyQuery`使用了Levenshtein距离算法来计算编辑距离。

以下是一个简单的示例，演示如何在 Elasticsearch 中使用 `FuzzyQuery`：

```java
import org.elasticsearch.action.search.SearchRequest;
import org.elasticsearch.action.search.SearchResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestHighLevelClient;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.index.query.FuzzyQueryBuilder;
import org.elasticsearch.search.builder.SearchSourceBuilder;

import java.io.IOException;

public class ElasticsearchFuzzyQueryExample {

    public static void main(String[] args) {
        try (RestHighLevelClient client = new RestHighLevelClient()) {

            // 构建查询请求
            SearchRequest searchRequest = new SearchRequest("your_index");
            SearchSourceBuilder searchSourceBuilder = new SearchSourceBuilder();

            // 构建 Fuzzy 查询条件：field 包含 "value" 或相似的文本
            FuzzyQueryBuilder fuzzyQuery = QueryBuilders.fuzzyQuery("field", "value");
            searchSourceBuilder.query(fuzzyQuery);

            // 设置查询源
            searchRequest.source(searchSourceBuilder);

            // 执行查询
            SearchResponse searchResponse = client.search(searchRequest, RequestOptions.DEFAULT);

            // 处理查询结果
            // ...

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

在这个例子中，我们使用了 `QueryBuilders.fuzzyQuery("field", "value")` 构建了一个 Fuzzy 查询条件，表示要查询`field`包含 "value" 或相似文本的文档。

请注意，`FuzzyQuery`的性能可能较低，因为它涉及到计算编辑距离。在实际应用中，应根据需求和性能要求选择适当的查询类型。


# 参考资料

https://mp.weixin.qq.com/s/PlQRorBV03oqcnjWvE-uRg

* any list
{:toc}
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


## java 如何统计满足条件 ES 的数量？

统计指定 index 中的，field2=value2 的数量。

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


# 参考资料

https://mp.weixin.qq.com/s/PlQRorBV03oqcnjWvE-uRg

* any list
{:toc}
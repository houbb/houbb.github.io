---
layout: post
title: Apache Calcite 动态数据管理框架-06-Es 整合官方例子，用 view 视图解决查询写法不优雅的问题？
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 思路

我们直接看一下 calcite es 中的例子代码，本地测试验证一下。

## 拓展阅读

https://github.com/quxiucheng/apache-calcite-tutorial

https://github.com/apache/calcite


# 代码位置

具体见；

https://github.com/apache/calcite/tree/main/elasticsearch/src/test/java/org/apache/calcite

我们可以把代码下载下来。

# 实战测试

## 准备工作

参见 [Apache Calcite 动态数据管理框架-05-java 访问 ES 整合 apache calcite，使用标准 SQL 访问 ES](https://houbb.github.io/2018/11/15/database-apache-calcite-05-es-integration)

## 数据结构

```
$ curl -X GET "http://localhost:9200/booksmapping/_mapping"
```

如下：

```json
{"booksmapping":{"mappings":{"properties":{"author":{"type":"keyword"},"description":{"type":"text"},"id":{"type":"keyword"},"price":{"type":"float"},"publish_time":{"type":"date","format":"yyyy-MM-dd"},"title":{"type":"text","analyzer":"standard"}}}}}
```

## 实现思路-view

看了一下 example 中的代码，是通过 view 视图的方式，当然这也是一种解决方案。

## 实测代码

核心逻辑，添加一个视图，然后查询视图，就可以让查询变得简单一些。

```java
// 添加一个视图（如何自动实现？）
final String viewSql = "select cast(_MAP['id'] AS varchar(5)) AS \"id\", "
        + " cast(_MAP['title'] AS varchar) AS \"title\", \n"
        + " cast(_MAP['author'] AS varchar) AS \"author\", \n"
        + " cast(_MAP['price'] AS float) AS \"price\" \n"
        + " from \"elastic\".\"booksmapping\""
        ;

root.add("booksmapping",
        ViewTable.viewMacro(root, viewSql,
                Collections.singletonList("elastic"),
                Arrays.asList("elastic", "view"), false));
```

完整版本的代码如下：

```java
package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.calcite.schema.impl.ViewTable;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.Collections;
import java.util.Properties;


/**
 * https://www.tabnine.com/code/java/methods/org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema/%3Cinit%3E
 *
 */
public class CalciteElasticsearchViewExample {

    public static void main(String[] args) throws Exception {
        RestClient restClient = null;
        try {
            // 1.构建ElasticsearchSchema对象,在Calcite中,不同数据源对应不同Schema,比如:CsvSchema、DruidSchema、ElasticsearchSchema等
            restClient = RestClient.builder(new HttpHost("172.24.20.97", 9200)).build();
            // 指定索引库
            ElasticsearchSchema elasticsearchSchema = new ElasticsearchSchema(restClient, new ObjectMapper(), null);

            // 2.构建Connection
            // 2.1 设置连接参数
            Properties info = new Properties();
            // 不区分sql大小写
            info.setProperty("caseSensitive", "false");

            // 2.2 获取标准的JDBC Connection
            Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
            // 2.3 获取Calcite封装的Connection
            CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);

            // 3.构建RootSchema，在Calcite中，RootSchema是所有数据源schema的parent，多个不同数据源schema可以挂在同一个RootSchema下
            // 以实现查询不同数据源的目的
            SchemaPlus root = calciteConnection.getRootSchema();

            // 4.将不同数据源schema挂载到RootSchema，这里添加ElasticsearchSchema
            root.add("elastic", elasticsearchSchema);

            // 添加一个视图（如何自动实现？）
            final String viewSql = "select cast(_MAP['id'] AS varchar(5)) AS \"id\", "
                    + " cast(_MAP['title'] AS varchar) AS \"title\", \n"
                    + " cast(_MAP['author'] AS varchar) AS \"author\", \n"
                    + " cast(_MAP['price'] AS float) AS \"price\" \n"
                    + " from \"elastic\".\"booksmapping\""
                    ;
            root.add("booksmapping",
                    ViewTable.viewMacro(root, viewSql,
                            Collections.singletonList("elastic"),
                            Arrays.asList("elastic", "view"), false));

            // 重新执行查询
            // 5.执行SQL查询，通过SQL方式访问object对象实例
            // 条件查询
            // String sql = "SELECT _MAP['id'],_MAP['title'],_MAP['price'] FROM es.books WHERE _MAP['price'] > 60 LIMIT 2";
            // 统计索引数量
            // String sql = "SELECT count(*) FROM es.books WHERE _MAP['price'] > 50 ";
            // 分页查询

            //ALL
            String sql1 = "SELECT * FROM booksmapping";
            Statement statement1 = calciteConnection.createStatement();
            ResultSet resultSet1 = statement1.executeQuery(sql1);
            System.out.println(ResultSetUtil.resultString(resultSet1));

            //condition
            String sql = "SELECT * FROM booksmapping WHERE id = '3' ";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);

            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } finally {
            restClient.close();
        }
    }

    //SELECT * FROM es.booksmapping WHERE "id" = '3'
}
```


# 这个过程如何自动化？

## 思路

其实 connect 在构建的时候，本身就回去访问一次 ES，获取字段的基本信息。

我们可以看一下原来的 calcite 中的代码。

## 源码

```java
  private Map<String, Table> createTables(Iterable<String> indices) {
        ImmutableMap.Builder<String, Table> builder = ImmutableMap.builder();
        Iterator var3 = indices.iterator();

        while(var3.hasNext()) {
            String index = (String)var3.next();
            ElasticsearchTransport transport = new ElasticsearchTransport(this.client, this.mapper, index, this.fetchSize);
            builder.put(index, new ElasticsearchTable(transport));
        }

        return builder.build();
    }
```

会把对应的 mapping 初始化到 ElasticsearchTransport 中。

ElasticsearchTransport#fetchAndCreateMapping 如下：

```java
private ElasticsearchMapping fetchAndCreateMapping() {
    String uri = String.format(Locale.ROOT, "/%s/_mapping", this.indexName);
    ObjectNode root = (ObjectNode)this.rawHttp(ObjectNode.class).apply(new HttpGet(uri));
    ObjectNode properties = (ObjectNode)((JsonNode)root.elements().next()).get("mappings");
    ImmutableMap.Builder<String, String> builder = ImmutableMap.builder();
    ElasticsearchJson.visitMappingProperties(properties, builder::put);
    return new ElasticsearchMapping(this.indexName, builder.build());
}
```

这里直接是一个 http 请求，获取对应的 _mapping 信息。

![mapping](https://img-blog.csdnimg.cn/direct/20451e23bc3640b69750dea31fc98194.png#pic_center)

当然，往前 2 步：

`ObjectNode properties = (ObjectNode)((JsonNode)root.elements().next()).get("mappings");`

对应的信息如下：

```json
{
    "properties":{
        "author":{
            "type":"text",
            "fields":{
                "keyword":{
                    "type":"keyword",
                    "ignore_above":256
                }
            }
        },
        "description":{
            "type":"text",
            "fields":{
                "keyword":{
                    "type":"keyword",
                    "ignore_above":256
                }
            }
        },
        "id":{
            "type":"text",
            "fields":{
                "keyword":{
                    "type":"keyword",
                    "ignore_above":256
                }
            }
        },
        "language":{
            "type":"text",
            "fields":{
                "keyword":{
                    "type":"keyword",
                    "ignore_above":256
                }
            }
        },
        "price":{
            "type":"float"
        },
        "publish_time":{
            "type":"date"
        },
        "title":{
            "type":"text",
            "fields":{
                "keyword":{
                    "type":"keyword",
                    "ignore_above":256
                }
            }
        }
    }
}
```

这里实际上就是我们 ES 中的字段信息，我们可以基于这个信息，做上面的 view SQL 生成。

## ES 基本信息

### 版本 v7.15.0

```
$ curl -X GET 'http://localhost:9200/'

{
  "name" : "d",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "oI184RDVQgqv6Pyac2lKng",
  "version" : {
    "number" : "7.15.0",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "79d65f6e357953a5b3cbcc5e2c7c21073d89aa29",
    "build_date" : "2021-09-16T03:05:29.143308416Z",
    "build_snapshot" : false,
    "lucene_version" : "8.9.0",
    "minimum_wire_compatibility_version" : "6.8.0",
    "minimum_index_compatibility_version" : "6.0.0-beta1"
  },
  "tagline" : "You Know, for Search"
}
```

### mapping

我们以 booksmapping 为例子

```
curl -X GET 'http://localhost:9200/booksmapping/_mapping'
```

如下：

```json
{"booksmapping":{"mappings":{"properties":{"author":{"type":"keyword"},"description":{"type":"text"},"id":{"type":"keyword"},"price":{"type":"float"},"publish_time":{"type":"date","format":"yyyy-MM-dd"},"title":{"type":"text","analyzer":"standard"}}}}}
```

## ES 的 type 有哪些

在提供的映射信息中，字段的类型 (type) 包括以下几种：

1. `text`：用于索引长文本的字段，通常会进行分词处理。
2. `keyword`：用于索引关键词的字段，通常不会进行分词处理，适合用于精确匹配和聚合操作。
3. `float`：浮点数类型，用于存储浮点数。
4. `date`：日期类型，用于存储日期时间。

除了提到的 `text`、`keyword`、`float` 和 `date` 类型之外，Elasticsearch 还有其他一些常见的字段类型。

其中一些类型包括：

1. `integer`：用于存储整数值。
2. `long`：用于存储长整数值，比如存储大整数或时间戳。
3. `double`：用于存储双精度浮点数。
4. `boolean`：用于存储布尔值，即 `true` 或 `false`。
5. `object`：用于存储嵌套的 JSON 对象。
6. `nested`：用于存储嵌套的文档结构，可以单独进行查询和过滤。
7. `geo_point`：用于存储地理坐标点。
8. `geo_shape`：用于存储复杂的地理形状。
9. `ip`：用于存储 IPv4 或 IPv6 地址。
10. `binary`：用于存储二进制数据。
11. `completion`：用于自动补全字段。
12. `token_count`：用于存储被分析器分析后的 token 数量。

这些是一些常见的字段类型，具体使用哪种类型取决于您的数据结构和查询需求。

## ES 的类别与 sql 的 varchar 映射

实现方法如下：

你可以编写一个简单的 Java 方法来实现这个功能。

这个方法可以接受 Elasticsearch 中的类型作为输入，并返回相应的 SQL 类型。以下是一个示例方法：

```java
public class ElasticsearchToSQLConverter {

    public static String convertToSQLType(String esType) {
        switch (esType) {
            case "text":
                return "VARCHAR";
            case "keyword":
                return "VARCHAR"; // Assuming keyword is similar to text
            case "float":
                return "FLOAT";
            case "double":
                return "DOUBLE";
            case "integer":
                return "INT";
            case "long":
                return "BIGINT";
            case "date":
                return "TIMESTAMP";
            case "boolean":
                return "BOOLEAN";
            case "object":
                return "JSON"; // This can vary depending on SQL database
            case "nested":
                return "JSON"; // Nested objects can be represented as JSON
            case "geo_point":
                return "GEOGRAPHY"; // SQL spatial data type
            case "ip":
                return "VARCHAR"; // Assuming IP address is stored as string
            case "binary":
                return "BLOB"; // Binary large object
            case "completion":
                return "VARCHAR"; // Assuming completion is stored as string
            case "token_count":
                return "INT"; // Assuming token count is stored as integer
            default:
                return "VARCHAR"; // Default to VARCHAR if type is unknown
        }
    }

    public static void main(String[] args) {
        // Example usage
        String esType = "text";
        String sqlType = convertToSQLType(esType);
        System.out.println("Elasticsearch type '" + esType + "' maps to SQL type '" + sqlType + "'");
    }
}
```

这个方法通过一个简单的 `switch` 语句将 Elasticsearch 中的类型映射到 SQL 中相应的类型。

需要注意的是，某些类型的映射可能不是唯一的，可以根据实际需求进行调整。


# v2-自动构建 mapping view 的例子

## 思路

我们首先去 es 中获取字段信息，然后根据字段类别构建出 view sql。

## 构建 view sql 实现如下

### step1-获取 es 的字段信息

```java
package org.example;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import org.apache.http.HttpHost;
import org.elasticsearch.action.admin.indices.mapping.get.GetMappingsRequest;
import org.elasticsearch.action.admin.indices.mapping.get.GetMappingsResponse;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.client.RestClient;
import org.elasticsearch.client.RestHighLevelClient;

import java.io.IOException;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * https://www.tabnine.com/code/java/methods/org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema/%3Cinit%3E
 *
 * 自动根据 mapping 生成 viewSql
 */
public class EsGetMappingByClientExample {

    public static Map<String, EsTypeDto> getEsMapping(String indexName) {
        RestHighLevelClient client = null;

        Map<String, EsTypeDto> resultMap = new LinkedHashMap<>();

        try{
            client = new RestHighLevelClient(
                    RestClient.builder(
                            new HttpHost("172.24.20.97", 9200, "http")));


            // 创建 GetMappingsRequest 请求
            GetMappingsRequest request = new GetMappingsRequest().indices(indexName);
            GetMappingsResponse response = client.indices().getMapping(request, RequestOptions.DEFAULT);

            // 如何解析？
            String json = response.toString();
            JSONObject jsonObject = JSON.parseObject(json);

            JSONObject jsonObjectIndexName = (JSONObject) jsonObject.get(indexName);
            JSONObject jsonObjectIndexNameMappings = (JSONObject) jsonObjectIndexName.get("mappings");
            JSONObject jsonObjectIndexNameMappingsProp = (JSONObject) jsonObjectIndexNameMappings.get("properties");

            for(String key : jsonObjectIndexNameMappingsProp.keySet()) {
                EsTypeDto dto = JSON.parseObject(jsonObjectIndexNameMappingsProp.getString(key), EsTypeDto.class);
                resultMap.put(key, dto);
            }

            return resultMap;
        } catch (IOException e) {
            throw new RuntimeException(e);
        } finally {
            try {
                client.close();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
    }

    public static void main(String[] args) {
        System.out.println(getEsMapping("booksmapping"));
    }

}
```

EsTypeDto 和属性对应，简单的类别对象

```java
public class EsTypeDto {

    private String type;

    private String format;

    private String analyzer;

    //...
}
```

效果：

```
{author=EsTypeDto{type='keyword', format='null', analyzer='null'}, price=EsTypeDto{type='float', format='null', analyzer='null'}, publish_time=EsTypeDto{type='date', format='yyyy-MM-dd', analyzer='null'}, description=EsTypeDto{type='text', format='null', analyzer='null'}, id=EsTypeDto{type='keyword', format='null', analyzer='null'}, title=EsTypeDto{type='text', format='null', analyzer='standard'}}
```

### step2-构建 view SQL

```java
public static String buildViewSql(String indexName) {
    // 1. 获取所有的字段及其类别
    Map<String, EsTypeDto> fieldTypeMap = EsGetMappingByClientExample.getEsMapping(indexName);
    //2. 循环构建结果
    String sqlFormat = "SELECT %s FROM " + "\"elastic\".\"%s\"";
    //2.1 构建查询字段的映射
    StringBuilder fieldBuilder = new StringBuilder();
    for(String fieldName : fieldTypeMap.keySet()) {
        EsTypeDto esTypeDto = fieldTypeMap.get(fieldName);
        String fieldSqlType = convertToSQLType(esTypeDto.getType().toLowerCase());
        fieldBuilder.append("cast(_MAP['")
                .append(fieldName).append("'] AS ")
                .append(fieldSqlType)
                .append(") AS \"")
                .append(fieldName).append("\",");
    }
    // 删除最后一个,
    fieldBuilder.deleteCharAt(fieldBuilder.length()-1);
    String sql =  String.format(sqlFormat, fieldBuilder.toString(), indexName);
    System.out.println("--------------SQL: " + sql);
    return sql;
}
```

convertToSQLType 如下，主要是时间类别还是要注意下。因为存在 format，所以这里其实还应该是 varchar。

```java
    /**
     * ES 的类别转换为 SQL 中的建表类别
     * @param esType ES 类别
     * @return SQL 类别
     */
    public static String convertToSQLType(String esType) {
        switch (esType) {
            case "text":
                return "VARCHAR";
            case "keyword":
                return "VARCHAR"; // Assuming keyword is similar to text
            case "float":
                return "FLOAT";
            case "double":
                return "DOUBLE";
            case "integer":
                return "INT";
            case "long":
                return "BIGINT";
            //TODO 这里先从    TIMESTAMP=>varchar 试一下
            case "date":
                return "VARCHAR";
            case "boolean":
                return "BOOLEAN";
            case "object":
                return "JSON"; // This can vary depending on SQL database
            case "nested":
                return "JSON"; // Nested objects can be represented as JSON
            case "geo_point":
                return "GEOGRAPHY"; // SQL spatial data type
            case "ip":
                return "VARCHAR"; // Assuming IP address is stored as string
            case "binary":
                return "BLOB"; // Binary large object
            case "completion":
                return "VARCHAR"; // Assuming completion is stored as string
            case "token_count":
                return "INT"; // Assuming token count is stored as integer
            default:
                return "VARCHAR"; // Default to VARCHAR if type is unknown
        }
    }
```

### step3-替换测试

我们只需要把原来手动写死的 view SQL，改成动态的 sql。其他不变。

生成的 view SQL 如下：

```sql
SELECT cast(_MAP['author'] AS VARCHAR) AS "author",cast(_MAP['price'] AS FLOAT) AS "price",cast(_MAP['publish_time'] AS VARCHAR) AS "publish_time",cast(_MAP['description'] AS VARCHAR) AS "description",cast(_MAP['id'] AS VARCHAR) AS "id",cast(_MAP['title'] AS VARCHAR) AS "title" FROM "elastic"."booksmapping"
```

效果如下：

```
Bruce Eckel, 70.2, 2007-10-01, Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉, 1, Java编程思想
葛一鸣, 46.5, 2012-08-01, 让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法, 2, Java程序性能优化
张惹愚, 81.4, 2016-05-01, 零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库, 3, Python科学计算
Helant, 54.5, 2014-03-01, 经典Python入门教程，层次鲜明，结构严谨，内容翔实, 4, Python基础教程
Nicholas C. Zakas, 66.4, 2012-10-01, JavaScript经典名著, 5, JavaScript高级程序设计
```

# 小结

解决问题的方式还算比较多，但是这里考虑的场景估计还是不够全面。

但是整体的思路是没有问题的，通过 view 简化 sql，不需要修改 calcite 的源码。

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html

* any list
{:toc}
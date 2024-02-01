---
layout: post
title: Apache Calcite 动态数据管理框架-05-java 访问 ES 整合 apache calcite，使用标准 SQL 访问 ES
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 说明

通过 ES 的语法查询，还是有一定的门槛的。

有没有什么方法，可以使用标准的 SQL 查询 ES 呢。


# 初始化 books 数据

## 数据

```json
{"index" : { "_index" : "books" , "_type" : "IT" , "_id" : "1"}}
{ "id" : "1" , "title" : "Java编程思想" , "language" : "java" , "author" :"Bruce Eckel" , "price": 70.20 , "publish_time" : "2007-10-01" , "description" : "Java学习必读经典,殿堂级著作,赢得了全球程序员的广泛赞誉" }
{"index" : { "_index" : "books" , "_type" : "IT" , "_id" : "2"}}
{ "id" : "2" , "title" : "Java程序性能优化" , "language" : "java" , "author" :"葛一鸣" , "price": 46.50 , "publish_time" : "2012-08-01" , "description" : "让你的Java程序更快,更稳定.深入剖析软件层面,代码层面,JVM虚拟机层面的优化方法" }
{"index" : { "_index" : "books" , "_type" : "IT" , "_id" : "3"}}
{ "id" : "3" , "title" : "Python科学计算" , "language" : "python" , "author" :"张惹愚" , "price": 81.40 , "publish_time" : "2016-05-01" , "description" : "零基础学Python,光盘中作者独家整合开发winPython环境,涵盖了Python各个扩展库" }
{"index" : { "_index" : "books" , "_type" : "IT" , "_id" : "4"}}
{ "id" : "4" , "title" : "Python基础教程" , "language" : "python" , "author" :"Helant" , "price": 54.50 , "publish_time" : "2014-03-01" , "description" : "经典Python入门教程,层次鲜明,结构严谨,内容翔实" }
{"index" : { "_index" : "books" , "_type" : "IT" , "_id" : "5"}}
{ "id" : "5" , "title" : "JavaScript高级程序设计" , "language" : "javascript" , "author" :"Nicholas C. Zakas" , "price": 66.40 , "publish_time" : "2012-10-01" , "description" : "JavaScript经典名著" }
```

## 删除数据

删除整个索引。

```
curl -X DELETE "http://localhost:9200/books"
```

删除指定数据：

```
curl -X DELETE "http://localhost:9200/books/_doc/1"
```

## 添加数据

批量初始化

```bash
curl -X POST "http://localhost:9200/books/_bulk" -H 'Content-Type: application/json' -d '
{"index" : { "_index" : "books", "_type" : "IT", "_id" : "1"}}
{ "id" : "1", "title" : "Java编程思想", "language" : "java", "author" :"Bruce Eckel", "price": 70.20, "publish_time" : "2007-10-01", "description" : "Java学习必读经典,殿堂级著作,赢得了全球程序员的广泛赞誉" }
{"index" : { "_index" : "books", "_type" : "IT", "_id" : "2"}}
{ "id" : "2", "title" : "Java程序性能优化", "language" : "java", "author" :"葛一鸣", "price": 46.50, "publish_time" : "2012-08-01", "description" : "让你的Java程序更快,更稳定.深入剖析软件层面,代码层面,JVM虚拟机层面的优化方法" }
{"index" : { "_index" : "books", "_type" : "IT", "_id" : "3"}}
{ "id" : "3", "title" : "Python科学计算", "language" : "python", "author" :"张惹愚", "price": 81.40, "publish_time" : "2016-05-01", "description" : "零基础学Python,光盘中作者独家整合开发winPython环境,涵盖了Python各个扩展库" }
{"index" : { "_index" : "books", "_type" : "IT", "_id" : "4"}}
{ "id" : "4", "title" : "Python基础教程", "language" : "python", "author" :"Helant", "price": 54.50, "publish_time" : "2014-03-01", "description" : "经典Python入门教程,层次鲜明,结构严谨,内容翔实" }
{"index" : { "_index" : "books", "_type" : "IT", "_id" : "5"}}
{ "id" : "5", "title" : "JavaScript高级程序设计", "language" : "javascript", "author" :"Nicholas C. Zakas", "price": 66.40, "publish_time" : "2012-10-01", "description" : "JavaScript经典名著" }
'
```


## 确认查询

```
curl -X GET "localhost:9200/books/_search"
```

如下：

```json
{
    "took":37,
    "timed_out":false,
    "_shards":{
        "total":1,
        "successful":1,
        "skipped":0,
        "failed":0
    },
    "hits":{
        "total":{
            "value":5,
            "relation":"eq"
        },
        "max_score":1,
        "hits":[
            {
                "_index":"books",
                "_type":"IT",
                "_id":"1",
                "_score":1,
                "_source":{
                    "id":"1",
                    "title":"Java编程思想",
                    "language":"java",
                    "author":"Bruce Eckel",
                    "price":70.2,
                    "publish_time":"2007-10-01",
                    "description":"Java学习必读经典,殿堂级著作,赢得了全球程序员的广泛赞誉"
                }
            },
            {
                "_index":"books",
                "_type":"IT",
                "_id":"2",
                "_score":1,
                "_source":{
                    "id":"2",
                    "title":"Java程序性能优化",
                    "language":"java",
                    "author":"葛一鸣",
                    "price":46.5,
                    "publish_time":"2012-08-01",
                    "description":"让你的Java程序更快,更稳定.深入剖析软件层面,代码层面,JVM虚拟机层面的优化方法"
                }
            },
            {
                "_index":"books",
                "_type":"IT",
                "_id":"3",
                "_score":1,
                "_source":{
                    "id":"3",
                    "title":"Python科学计算",
                    "language":"python",
                    "author":"张惹愚",
                    "price":81.4,
                    "publish_time":"2016-05-01",
                    "description":"零基础学Python,光盘中作 者独家整合开发winPython环境,涵盖了Python各个扩展库"
                }
            },
            {
                "_index":"books",
                "_type":"IT",
                "_id":"4",
                "_score":1,
                "_source":{
                    "id":"4",
                    "title":"Python基础教程",
                    "language":"python",
                    "author":"Helant",
                    "price":54.5,
                    "publish_time":"2014-03-01",
                    "description":"经典Python入门教程,层次鲜明,结构严谨,内容翔实"
                }
            },
            {
                "_index":"books",
                "_type":"IT",
                "_id":"5",
                "_score":1,
                "_source":{
                    "id":"5",
                    "title":"JavaScript高级程序设计",
                    "language":"javascript",
                    "author":"Nicholas C. Zakas",
                    "price":66.4,
                    "publish_time":"2012-10-01",
                    "description":"JavaScript经典名著"
                }
            }
        ]
    }
}
```

# java 代码

## 查询信息

```java
package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;


public class CalciteElasticsearchExample {

    public static void main(String[] args) throws Exception {
        // 1.构建ElasticsearchSchema对象,在Calcite中,不同数据源对应不同Schema,比如:CsvSchema、DruidSchema、ElasticsearchSchema等
        RestClient restClient = RestClient.builder(new HttpHost("172.24.20.97", 9200)).build();
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
        SchemaPlus rootSchema = calciteConnection.getRootSchema();

        // 4.将不同数据源schema挂载到RootSchema，这里添加ElasticsearchSchema
        rootSchema.add("es", elasticsearchSchema);

        // 5.执行SQL查询，通过SQL方式访问object对象实例
        // 分页查询
        String sql = "SELECT * FROM es.books WHERE _MAP['price'] > 50";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);
        // 6.遍历打印查询结果集
        System.out.println(ResultSetUtil.resultString(resultSet));

        restClient.close();
    }
}
```

这里的 _MAP['price'] 主要是为了兼容 ES 中的对象内嵌写法。

对应的工具类

```java
package org.example;


import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


public class ResultSetUtil {
    public static String resultString(ResultSet resultSet) throws SQLException {
        return resultString(resultSet, false);
    }

    public static String resultString(ResultSet resultSet, boolean printHeader) throws SQLException {
        List<List<Object>> resultList = resultList(resultSet, printHeader);
        return resultString(resultList);
    }

    public static List<List<Object>> resultList(ResultSet resultSet) throws SQLException {
        return resultList(resultSet, false);
    }

    public static String resultString(List<List<Object>> resultList) throws SQLException {
        StringBuilder builder = new StringBuilder();
        resultList.forEach(row -> {
            String rowStr = row.stream()
                    .map(columnValue -> columnValue + ", ")
                    .collect(Collectors.joining());
            rowStr = rowStr.substring(0, rowStr.lastIndexOf(", ")) + "\n";
            builder.append(rowStr);
        });
        return builder.toString();
    }

    public static List<List<Object>> resultList(ResultSet resultSet, boolean printHeader) throws SQLException {
        ArrayList<List<Object>> results = new ArrayList<>();
        final ResultSetMetaData metaData = resultSet.getMetaData();
        final int columnCount = metaData.getColumnCount();
        if (printHeader) {
            ArrayList<Object> header = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                header.add(metaData.getColumnName(i));
            }
            results.add(header);
        }
        while (resultSet.next()) {
            ArrayList<Object> row = new ArrayList<>();
            for (int i = 1; i <= columnCount; i++) {
                row.add(resultSet.getObject(i));
            }
            results.add(row);
        }
        return results;
    }

}
```

这里的 


## 测试效果

```
{id=1, title=Java编程思想, language=java, author=Bruce Eckel, price=70.2, publish_time=2007-10-01, description=Java学习必读经典,殿堂级著作,赢得了全球程序员的广泛赞誉}
{id=3, title=Python科学计算, language=python, author=张惹愚, price=81.4, publish_time=2016-05-01, description=零基础学Python,光盘中作者独家整合开发winPython环境,涵盖了Python各个扩展库}
{id=4, title=Python基础教程, language=python, author=Helant, price=54.5, publish_time=2014-03-01, description=经典Python入门教程,层次鲜明,结构严谨,内容翔实}
{id=5, title=JavaScript高级程序设计, language=javascript, author=Nicholas C. Zakas, price=66.4, publish_time=2012-10-01, description=JavaScript经典名著}
```

## count 数量测试

```java
String sql2 = "SELECT count(*) FROM es.books WHERE _MAP['price'] > 50";
ResultSet resultSet2 = statement.executeQuery(sql2);
// 6.遍历打印查询结果集
System.out.println(ResultSetUtil.resultString(resultSet2));
```

数量为 4

# 指定 mapping 的实战

## 设置

# 如何给 books index 指定对应的 mapping？

## 设置

```bash
curl -X PUT "localhost:9200/booksmapping" -H 'Content-Type: application/json' -d '
{
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "standard"
      },
      "author": {
        "type": "keyword"
      },
      "price": {
        "type": "float"
      },
      "publish_time": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "description": {
        "type": "text"
      }
    }
  }
}
'
```

确认：

```sh
curl -X GET "http://localhost:9200/booksmapping/_mapping"
```

```
$ curl -X GET "http://localhost:9200/booksmapping/_mapping"

{"booksmapping":{"mappings":{"properties":{"author":{"type":"keyword"},"description":{"type":"text"},"id":{"type":"keyword"},"price":{"type":"float"},"publish_time":{"type":"date","format":"yyyy-MM-dd"},"title":{"type":"text","analyzer":"standard"}}}}}
```

## 初始化数据

批量初始化

```bash
curl -X POST "localhost:9200/booksmapping/_bulk" -H 'Content-Type: application/json' -d '
{"index" : { "_index" : "booksmapping", "_id" : "1"}}
{ "id" : "1", "title" : "Java编程思想", "author" : "Bruce Eckel", "price": 70.20, "publish_time" : "2007-10-01", "description" : "Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉" }
{"index" : { "_index" : "booksmapping", "_id" : "2"}}
{ "id" : "2", "title" : "Java程序性能优化", "author" : "葛一鸣", "price": 46.50, "publish_time" : "2012-08-01", "description" : "让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法" }
{"index" : { "_index" : "booksmapping", "_id" : "3"}}
{ "id" : "3", "title" : "Python科学计算", "author" : "张惹愚", "price": 81.40, "publish_time" : "2016-05-01", "description" : "零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库" }
{"index" : { "_index" : "booksmapping", "_id" : "4"}}
{ "id" : "4", "title" : "Python基础教程", "author" : "Helant", "price": 54.50, "publish_time" : "2014-03-01", "description" : "经典Python入门教程，层次鲜明，结构严谨，内容翔实" }
{"index" : { "_index" : "booksmapping", "_id" : "5"}}
{ "id" : "5", "title" : "JavaScript高级程序设计", "author" : "Nicholas C. Zakas", "price": 66.40, "publish_time" : "2012-10-01", "description" : "JavaScript经典名著" }
'
```

查询确认：

```
curl -X GET "localhost:9200/booksmapping/_search"
```

如下:

```json
{
    "took":337,
    "timed_out":false,
    "_shards":{
        "total":1,
        "successful":1,
        "skipped":0,
        "failed":0
    },
    "hits":{
        "total":{
            "value":5,
            "relation":"eq"
        },
        "max_score":1,
        "hits":[
            {
                "_index":"booksmapping",
                "_type":"_doc",
                "_id":"1",
                "_score":1,
                "_source":{
                    "id":"1",
                    "title":"Java编程思想",
                    "author":"Bruce Eckel",
                    "price":70.2,
                    "publish_time":"2007-10-01",
                    "description":"Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉"
                }
            },
            {
                "_index":"booksmapping",
                "_type":"_doc",
                "_id":"2",
                "_score":1,
                "_source":{
                    "id":"2",
                    "title":"Java程序性能优化",
                    "author":"葛一鸣",
                    "price":46.5,
                    "publish_time":"2012-08-01",
                    "description":"让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法"
                }
            },
            {
                "_index":"booksmapping",
                "_type":"_doc",
                "_id":"3",
                "_score":1,
                "_source":{
                    "id":"3",
                    "title":"Python科学计算",
                    "author":"张惹 愚",
                    "price":81.4,
                    "publish_time":"2016-05-01",
                    "description":"零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库"
                }
            },
            {
                "_index":"booksmapping",
                "_type":"_doc",
                "_id":"4",
                "_score":1,
                "_source":{
                    "id":"4",
                    "title":"Python基础教程",
                    "author":"Helant",
                    "price":54.5,
                    "publish_time":"2014-03-01",
                    "description":"经典Python 入门教程，层次鲜明，结构严谨，内容翔实"
                }
            },
            {
                "_index":"booksmapping",
                "_type":"_doc",
                "_id":"5",
                "_score":1,
                "_source":{
                    "id":"5",
                    "title":"JavaScript高级程序设计",
                    "author":"Nicholas C. Zakas",
                    "price":66.4,
                    "publish_time":"2012-10-01",
                    "description":"JavaScript经典名著"
                }
            }
        ]
    }
}
```

## 重新代码测试一下是不是可以不写 _MAP 呢？

### _MAP 形式

其他代码和上面完全一致：

```sql
String sql = "SELECT * FROM es.booksmapping WHERE _MAP['id'] = '3'";
```

结果：

```
{id=1, title=Java编程思想, language=java, author=Bruce Eckel, price=70.2, publish_time=2007-10-01, description=Java学习必读经典,殿堂级著作,赢得了全球程序员的广泛赞誉}
```

### 不用 _MAP 呢


```
curl -X GET "localhost:9200/booksmapping/_doc/3"
```

改一下 sql 呢

发现不行

# like 测试

写法：

```sql
String sql = "SELECT * FROM es.booksmapping WHERE _MAP['title'] like 'Python%' ";
```

想尝试一下正则表达式，或者 like？

```
	Suppressed: java.lang.UnsupportedOperationException: LIKE not yet supported
		at org.apache.calcite.adapter.elasticsearch.PredicateAnalyzer$Visitor.binary(PredicateAnalyzer.java:358)
		at org.apache.calcite.adapter.elasticsearch.PredicateAnalyzer$Visitor.visitCall(PredicateAnalyzer.java:236)
		at org.apache.calcite.adapter.elasticsearch.PredicateAnalyzer$Visitor.visitCall(PredicateAnalyzer.java:150)
		at org.apache.calcite.rex.RexCall.accept(RexCall.java:288)
		at org.apache.calcite.adapter.elasticsearch.PredicateAnalyzer.analyze(PredicateAnalyzer.java:110)
		at org.apache.calcite.adapter.elasticsearch.ElasticsearchFilter$PredicateAnalyzerTranslator.translateMatch(ElasticsearchFilter.java:85)
		at org.apache.calcite.adapter.elasticsearch.ElasticsearchFilter.implement(ElasticsearchFilter.java:61)
		at org.apache.calcite.adapter.elasticsearch.ElasticsearchRel$Implementor.visitChild(ElasticsearchRel.java:129)
		at org.apache.calcite.adapter.elasticsearch.ElasticsearchToEnumerableConverter.implement(ElasticsearchToEnumerableConverter.java:64)
		at org.apache.calcite.adapter.enumerable.EnumerableRelImplementor.implementRoot(EnumerableRelImplementor.java:108)
		... 13 more
```


发现不支持！


# 疑问

这里的 _MAP 看起来真的比较别扭，为什么不能直接实现呢？

## Q: 为什么要有 _MAP 属性呢？

在 Calcite 的 Elasticsearch adapter 中，使用 `_MAP` 是为了处理 Elasticsearch 中的嵌套字段结构。

Elasticsearch 的数据模型允许文档中的字段嵌套在复杂的层次结构中，而不是简单的平坦键值对。

当你执行 Calcite 查询时， `_MAP` 提供了一种通用的机制，用于访问嵌套字段。它允许你通过键值对的方式访问文档中的嵌套字段，确保在 SQL 查询中能够准确指定字段路径。

在 Elasticsearch 中，实际的文档数据存储在 `_source` 字段中。

因此，当你使用 `_MAP` 时，实际上是在访问 `_source` 中的字段。

具体来说，对于你的数据结构：

```json
{
    "_index":"books",
    "_type":"IT",
    "_id":"3",
    "_score":1,
    "_source":{
        "id":"3",
        "title":"Python科学计算",
        "language":"python",
        "author":"张惹愚",
        "price":81.4,
        "publish_time":"2016-05-01",
        "description":"零基础学Python,光盘中作者独家整合开发winPython环境,涵盖了Python各个扩展库"
    }
}
```

你可以使用 `_MAP['price']` 来访问 `price` 字段，因为 `price` 实际上是在 `_source` 中的一个键。

这种写法允许 Calcite 处理各种复杂的嵌套结构，确保在 SQL 查询中能够正确指定字段路径。

虽然在某些情况下可能感觉繁琐，但它提供了一种通用的方式来处理 Elasticsearch 数据的复杂性。


## Q: 详细介绍一下 es 中的 mapping

在 Elasticsearch 中，Mapping 是用于定义索引中字段的数据类型和其他属性的一种方式。

Mapping 在 Elasticsearch 中起到了模式定义的作用，它定义了索引中文档的结构，包括每个字段的类型、分析器、索引选项等信息。

以下是 Elasticsearch Mapping 中常见的一些属性：

1. **Type（数据类型）：**
   - 字符串类型（String）：包括 text 和 keyword 两种，text 用于全文搜索，keyword 用于精确匹配。
   - 数值类型（Numeric）：包括 long、integer、short、byte、double、float 等。
   - 日期类型（Date）：用于处理日期和时间。
   - 布尔类型（Boolean）：包括 true 和 false。
   - 二进制类型（Binary）：用于存储二进制数据。

2. **分析器（Analyzer）：**
   - 分析器定义了在索引和搜索时如何处理文本数据。常见的分析器包括 Standard Analyzer、Whitespace Analyzer、Keyword Analyzer 等。

3. **索引选项（Index Options）：**
   - 控制索引中是否存储字段的原始值。可选的选项包括 `docs`、`freqs`、`positions`、`offsets` 等。

4. **字段属性（Field Properties）：**
   - 包括 `index`（是否索引）、`store`（是否存储原始值）、`fielddata`（是否构建 fielddata 用于排序和聚合）等。

5. **嵌套字段（Nested Fields）：**
   - 允许在文档中嵌套其他文档，形成复杂的数据结构。

6. **动态映射（Dynamic Mapping）：**
   - 允许 Elasticsearch 根据插入的文档自动推断字段类型并创建映射。

以下是一个简单的 Elasticsearch Mapping 示例，表示一个书籍的索引：

```json
{
  "mappings": {
    "properties": {
      "id": {
        "type": "keyword"
      },
      "title": {
        "type": "text",
        "analyzer": "standard"
      },
      "author": {
        "type": "keyword"
      },
      "price": {
        "type": "float"
      },
      "publish_time": {
        "type": "date",
        "format": "yyyy-MM-dd"
      },
      "description": {
        "type": "text"
      }
    }
  }
}
```

在这个示例中，我们定义了一个名为 "books" 的索引，包含了 id、title、author、price、publish_time 和 description 这些字段，每个字段都有特定的类型和属性。这个 Mapping 可以通过 API 或在创建索引时提供 JSON 配置来应用。

Mapping 的设计使得 Elasticsearch 能够有效地索引和搜索大量的文档，并提供灵活性以适应各种数据模型。在使用 Elasticsearch 时，合理的 Mapping 设计对于性能和查询的效果非常重要。

#



# 参考资料

https://www.lixin.help/2021/04/11/Calcite-SQL-ES.html

https://blog.csdn.net/china_world/article/details/51141072

* any list
{:toc}
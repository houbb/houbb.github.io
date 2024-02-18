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

> ES 安装 [elasticsearch-03-install-on-windows](https://houbb.github.io/2018/11/15/elasticsearch-03-install-on-windows)

# sql ON ES 设想

## 为什么？

Elasticsearch是搜索的王者，其强大的DSL不让SQL，但缺少SQL的关键特性，如Join。

ES的策略是紧紧拥抱Hadoop/Hive，Spark，有个ES-hadoop方案。Hadoop本身就很笨重，这和轻快的ES是背道而驰的。

ES的主要方向目前还在搜索上，SQL也不是它的主要关注点。所以，可预见的一段时间内，SQL on ES只能通过开发或集成第三方软件来完成，如通过Presto或Drill的插件来实现。我们已经测试了Presto Elasticsearch Connector。我们认为，基于插件的方案难以充分发挥ES的性能优势。

因此，我们提出了基于Calcite Elasticsearch实现的SQL  ON ES方案设想。

## 方案思路

### 1、Apache Calcite

Apache Calcite是面向Hadoop新的查询引擎，它提供了标准的SQL语言、多种查询优化和连接各种数据源的能力，除此之外，Calcite还提供了OLAP和流处理的查询引擎。

正是有了这些诸多特性，Calcite项目在Hadoop中越来越引入注目，并被众多项目集成。

Calcite之前的名称叫做optiq，optiq起初在Hive项目中，为Hive提供基于成本模型的优化，即CBO（Cost Based Optimizatio）。

2014年5月optiq独立出来，成为Apache社区的孵化项目，2014年9月正式更名为Calcite。

Calcite项目的创建者是Julian Hyde，他在数据平台上有非常多的工作经历，曾经是Oracle、 Broadbase公司SQL引擎的主要开发者、SQLStream公司的创始人和主架构师、Pentaho BI套件中OLAP部分的架构师和主要开发者。现在他在Hortonworks公司负责Calcite项目，其工作经历对Calcite项目有很大的帮助。

除了Hortonworks，该项目的代码提交者还有MapR、Salesforce等公司，并且还在不断壮大。

Calcite的目标是“one size fits all（一种方案适应所有需求场景），希望能为不同计算平台和数据源提供统一的查询引擎，以类似传统数据库的访问方式（SQL和高级查询优化）来访问Hadoop上的数据。

Apache Calcite具有以下几个技术特性：

- 支持标准SQL语言；

- 独立于编程语言和数据源，可以支持不同的前端和后端；

- 支持关系代数、可定制的逻辑规划规则和基于成本模型优化的查询引擎；

- 持物化视图（materialized view）的管理（创建、丢弃、持久化和自动识别）；

- 基于物化视图的Lattice和Tile机制，以应用于OLAP分析；

- 支持对流数据的查询。

### 里程碑事件      

Apache Calcite  1.8.0 / 2016-06-13 Permalink

这个版本加入了Elasticsearch 和 Druid 适配器，支持ES 2.3.3版本。这进一步增加了SQL on ES方案的可行性。

### 适配器

1、calcite-elasticsearch

https://github.com/LeeBeomYong/calcite-elasticsearch

2、elasticsearch-sql

https://github.com/NLPchina/elasticsearch-sql

3、SQL on Elasticsearch

参考Calcite-elasticsearch、elasticsearch-sql，利用Elasticsearch插件机制，实现SQL on Elasticsearch方案。

这样，在ES上实现了SQL，有以下几点优势：

简化了系统架构；

减少了数据在ES和Presto之间的传输时间；

充分利用了ES的高性能、Calcite强大的SQL和内存列数据能力；

提供了带有Join能力的ES JDBC Driver


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

# 统一查询项目整合Calcite（他人）

参考资料：[统一查询项目整合Calcite](https://code0xff.org/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E6%95%B4%E5%90%88calcite/)

如何自定义 model/schema: https://github.com/quxiucheng/apache-calcite-tutorial

## 问题描述

通过 Calcite 查询 ES，只能做 SELECT 查询，加一个 WHERE条件都会报错。

注册到 Calcite 的model.json如下：

```json
inline:{
  "version": "1.0",
  "defaultSchema": "TEST_CSV",
  "schemas": [
    {
      "type": "custom",
      "name": "esTest",
      "factory": "io.myproject.schema.elasticsearch.ElasticsearchSchemaFactory",
      "operand": {
        "coordinates": "{'localhost': 9025}",
        "userConfig": "{'bulk.flush.max.actions': 10, 'bulk.flush.max.size.mb': 1,'esUser':'username','esPass':'password'}",
        "index": "student"
      }
    }
  ]
}
```

服务端是本地启动的 ES，查询的SQL如下：

```sql
SELECT * FROM esTest.student
```

如果改成下面这样就报错了：

```sql
SELECT * FROM esTest.student  WHERE city in ('FRAMINGHAM', 'BROCKTON', 'CONCORD')
SELECT * FROM esTest.student AS t WHERE t.city = 'FRAMINGHAM' 
```

报错原因是在校验的时候，找不到city这个字段。

## 解析问题

首先看下 ES包下的整体结构，类图如下：

![struct](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%95%B4%E5%90%88Calcite/8.jpg)

Calcite 在校验的时，会根据注册的RelDataType做校验，RelDataType是在查询元数据信息时生成的。

比如，查询MySql时，会返回当前库下所有的表信息，然后拿到这个表的所有字段信息，并生成RelDataType对象，注册到Calcite中。

具体是在ElasticsearchTable#getRowType中实现的，正确的 RelDataType 大致是这样的：

```
RecordType(VARCHAR stu_id, VARCHAR province, VARCHAR city, BIGINT digest, VARCHAR type) NOT NULL
```

未修改前，错误的RelDataType是这样的：

```
RecordType((VARCHAR NOT NULL, ANY) MAP NOT NULL _MAP) NOT NULL
```

代码中，这段生成的逻辑是固定的，根本不管表中的类型是啥，字段名叫啥，每次都返回这么一个固定的RelDataType。

后面SqlValidatorImpl在做校验的时候，会判断 SELECT 中的每个字段，以及 WHERE 中的字段信息，这会触发到DelegatingScope#fullyQualify这个函数。

这个函数很长，出错的原因是，拿一个具体的字段比如city去RelDataType中查询，这当然找不到了，于是报错。

### 解决办法：

在创建ElasticsearchSchema时，会生成一个HTTP请求，去 ES 那边拿到索引下的所有字段和类型，也就是说字段名、类型这些都是可以拿到的，他们就保存在ElasticsearchTransport中。

在ElasticsearchTable#getRowType中，根据已经拿到的具体字段名、字段类型再创建对应的 RelDataType就可以了。

具体修改内容参考：ElasticsearchTable#getRowType

## 生成JSON问题

经过上面一通修改后，校验就可以通过了。但后面还是会报错，比如这个 SQL:

```sql
SELECT * FROM esTest.student AS t WHERE t.city = 'FRAMINGHAM'
```

在生成物理表达式时，会将 一个 SQL 节点，转换为对应的 JSON，具体是在PredicateAnalyzer中完成的。

而执行到

```java
public Expression visitCall(RexCall call) {
```

这句时，上述的 SQL 的节点类型是：INTERNAL，由不认这个类型，所以报错了。

这个简单，直接在 switch 中把这个类型加上即可。

在执行，会发现虽然执行是成功了，但是没结果。

这是因为在ElasticsearchFilter中，生成的 JSON 内容不对。

具体是在ElasticsearchFilter#implement中出问题的，而这个函数 是通过访问者模式，一层一层的被调用下来的。

在ElasticsearchFilter#translateMatch中，返回的 JSON如下：

```json
{
	"query": {
		"constant_score": {
			"filter": {
				"term": {
					"$0": "FRAMINGHAM"
				}
			}
		}
	}
}
```

term中有一个$0，这个生成的不对，如果改成city，这个 FILTER 条件就对了，最后就能查询出结果了。

## ES 查询语句：

查询索引

```
POST /[索引名]/_search?scroll=1m HTTP/1.1
```

如下：

```json
{
	"query": {
		"constant_score": {
			"filter": {
				"term": {
					"city": "FRAMINGHAM"
				}
			}
		}
	},
	"size": 5196
}
```

一个 MySql -> ES 的在线转换工具： http://www.ischoolbar.com/EsParser/

## 目前 ES 的问题

ES 不支持 JOIN、不支持子查询，CASE-WHEN等，只能做单表(索引)查询
支持的函数有限，包括：


max
min
avg
sum
count

经过测试和修改，已支持的功能：
1、四个比较 >=、>、<=、<
2、SELECT *、SELECT 某些字段
3、ORDER BY、ORDER BY DESC
4、GROUP BY
5、LIKE
6、BETWEEN
7、IN
8、NOT AND OR

目前发现的问题：
1、HAVING
这个功能还没实现
2、range
BETWEEN、IN 都会被优化为 Sarg类型，这是一个范围集合，类似List、List这样。
整数类型 和 字符串类型 所处理的方式不同
具体修改参见： PredicateAnalyzer$SimpleQueryExpression#range

# 疑问 chat

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


# 参考资料

https://www.lixin.help/2021/04/11/Calcite-SQL-ES.html

https://blog.csdn.net/china_world/article/details/51141072

https://help.aliyun.com/zh/es/user-guide/query-syntax?spm=a2c4g.11186623.0.nextDoc.61b072a3ErIUK2

[玩转 Elasticsearch 的 SQL 功能](https://elasticsearch.cn/article/687)

[elasticsearch-sql 增加 jdbc支持](https://cloud.tencent.com/developer/article/1195425)

[Is there any plan for JDBC drivers?](https://github.com/NLPchina/elasticsearch-sql/issues/28)

[Elasticsearch adapter](https://calcite.apache.org/docs/elasticsearch_adapter.html)

[Apache Calcite整合异构数据源查询 以csv、ES、内存表为例](https://blog.csdn.net/imsugar/article/details/107635564)

[通过编写SQL,即可实现对ES文档进行检索](https://www.lixin.help/2021/04/11/Calcite-SQL-ES.html)

[基于Calcite Elasticsearch实现的SQL ON ES方案设想](https://blog.csdn.net/china_world/article/details/51141072)

[Apache Calcite 论文学习笔记](https://juejin.cn/post/6844903891482476552)

[深入浅出Calcite与SQL CBO（Cost-Based Optimizer）优化 ](https://www.cnblogs.com/listenfwind/p/13192259.html)

[Apache Calcite论文翻译](https://zhuanlan.zhihu.com/p/673941313)

https://patentimages.storage.googleapis.com/4d/ab/6e/f1a74862fef0ca/CN106934062A.pdf

[aliyun-sql](https://help.aliyun.com/zh/es/user-guide/query-syntax?spm=a2c4g.11186623.0.nextDoc.61b072a3ErIUK2)

[Apache Calcite精简入门与学习指导](https://blog.51cto.com/xpleaf/2639844)

https://www.amazon.com/-/es/%E5%88%98%E9%92%A7%E6%96%87-ebook/dp/B09WHWX1V9

https://issues.apache.org/jira/browse/CALCITE-4180

* any list
{:toc}
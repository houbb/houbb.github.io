---
layout: post
title: Apache Calcite 动态数据管理框架-06-Es 整合之 like 关键词支持
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 说明 

apache calcite 在 v1.36.0 中，默认 ES 是不支持 like 的，同时 contains 必须要求是 date 类型。

我们有时候希望实现一个类似于 like 或者说 regex 的实现，这种常见需求就会变得比较麻烦。

这里演示一下一种可行的实现方式，作为参考。

需要修改源码。

# ES 数据准备

## 数据结构

```
$ curl -X GET "localhost:9200/booksmapping"

{"booksmapping":{"aliases":{},"mappings":{"properties":{"author":{"type":"keyword"},"description":{"type":"text"},"id":{"type":"keyword"},"price":{"type":"float"},"publish_time":{"type":"date","format":"yyyy-MM-dd"},"title":{"type":"text","analyzer":"standard"}}},"settings":{"index":{"routing":{"allocation":{"include":{"_tier_preference":"data_content"}}},"number_of_shards":"1","provided_name":"booksmapping","creation_date":"1706773773494","number_of_replicas":"1","uuid":"gxDMFnVxR4CrCevzCTEuXQ","version":{"created":"7150099"}}}}}d
```

## 数据本身

```
$ curl -X GET "localhost:9200/booksmapping/_search"

{"took":2,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":5,"relation":"eq"},"max_score":1.0,"hits":[{"_index":"booksmapping","_type":"_doc","_id":"1","_score":1.0,"_source":{ "id" : "1", "title" : "Java编程思想", "author" : "Bruce Eckel", "price": 70.20, "publish_time" : "2007-10-01", "description" : "Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉" }},{"_index":"booksmapping","_type":"_doc","_id":"2","_score":1.0,"_source":{ "id" : "2", "title" : "Java程序性能优化", "author" : "葛一鸣", "price": 46.50, "publish_time" : "2012-08-01", "description" : "让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法" }},{"_index":"booksmapping","_type":"_doc","_id":"3","_score":1.0,"_source":{ "id" : "3", "title" : "Python科学计算", "author" : "张惹愚", "price": 81.40, "publish_time" : "2016-05-01", "description" : "零基础学Python，光盘中作者独家整合开发winPython环境， 涵盖了Python各个扩展库" }},{"_index":"booksmapping","_type":"_doc","_id":"4","_score":1.0,"_source":{ "id" : "4", "title" : "Python基础教程", "author" : "Helant", "price": 54.50, "publish_time" : "2014-03-01", "description" : "经典Python入 门教程，层次鲜明，结构严谨，内容翔实" }},{"_index":"booksmapping","_type":"_doc","_id":"5","_score":1.0,"_source":{ "id" : "5", "title" : "JavaScript高级程序设计", "author" : "Nicholas C. Zakas", "price": 66.40, "publish_time" : "2012-10-01", "description" : "JavaScript经典名著" }}]}}
```

# 测试验证

## maven 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.example</groupId>
        <artifactId>calcite-learn</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>

    <artifactId>calcite-learn-es-define</artifactId>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>

        <calcite.version>1.36.0</calcite.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.calcite</groupId>
            <artifactId>calcite-core</artifactId>
            <version>${calcite.version}</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.apache.calcite/calcite-elasticsearch -->
<!--        <dependency>-->
<!--            <groupId>org.apache.calcite</groupId>-->
<!--            <artifactId>calcite-elasticsearch</artifactId>-->
<!--            <version>${calcite.version}</version>-->
<!--        </dependency>-->

        <!-- https://mvnrepository.com/artifact/org.apache.calcite/calcite-avatica -->
        <dependency>
            <groupId>org.apache.calcite</groupId>
            <artifactId>calcite-avatica</artifactId>
            <version>1.6.0</version>
        </dependency>

        <dependency>
            <groupId>com.google.protobuf</groupId>
            <artifactId>protobuf-java</artifactId>
            <version>3.17.3</version> <!-- 使用最新的 protobuf 版本 -->
        </dependency>

        <dependency>
            <groupId>org.elasticsearch.client</groupId>
            <artifactId>elasticsearch-rest-high-level-client</artifactId>
            <version>7.15.0</version> <!-- 请根据你的 Elasticsearch 版本选择相应版本 -->
        </dependency>

        <dependency>
            <groupId>com.alibaba</groupId>
            <artifactId>fastjson</artifactId>
            <version>1.2.78</version> <!-- 根据需要替换成最新版本 -->
        </dependency>

    </dependencies>


</project>
```

这里故意把 calcite-elasticsearch 的代码注释掉了。

我们可以把这个模块下的代码全部复制出来，拷贝到自定义的模块中。

## 拷贝代码

对应的代码文件其实不多：

```
    ElasticsearchAggregate.java
    ElasticsearchConstants.java
    ElasticsearchEnumerators.java
    ElasticsearchFilter.java
    ElasticsearchJson.java
    ElasticsearchMapping.java
    ElasticsearchMethod.java
    ElasticsearchProject.java
    ElasticsearchRel.java
    ElasticsearchRules.java
    ElasticsearchToEnumerableConverterRule.java
    ElasticsearchTransport.java
    ElasticsearchVersion.java
    MapProjectionFieldVisitor.java
    package-info.java
    PredicateAnalyzer.java
    QueryBuilders.java
    Scrolling.java
```

## 测试代码

这里主要演示一下 `SELECT title, id FROM booksmapping WHERE title like '.*'` 的可行性。具体的依赖其他文章中，此处不再赘述。

```java
package com.github.houbb.es.define;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.calcite.schema.impl.ViewTable;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import java.sql.*;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;
import java.util.Properties;


/**
 * https://www.tabnine.com/code/java/methods/org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema/%3Cinit%3E
 *
 * 自动根据 mapping 生成 viewSql
 */
public class CalciteElasticsearchViewAutoByMappingLikeExample {

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
            final String viewSql = buildViewSql("booksmapping");
            root.add("booksmapping",
                    ViewTable.viewMacro(root, viewSql,
                            Collections.singletonList("elastic"),
                            Arrays.asList("elastic", "view"), false));

            // 重新执行查询
            // 5.执行SQL查询，通过SQL方式访问object对象实例
            //condition
            // https://stackoverflow.com/questions/51860219/how-to-use-apache-calcite-like-regex
            showAll(calciteConnection);

            //https://github.com/apache/calcite/pull/1530
            showLikeAll(calciteConnection);
            showLikeRegex(calciteConnection);
        } finally {
            restClient.close();
        }
    }


    //SELECT cast(_MAP['author'] AS VARCHAR) AS "author",
    // cast(_MAP['price'] AS FLOAT) AS "price",cast(_MAP['publish_time'] AS VARCHAR) AS "publish_time",
    // cast(_MAP['description'] AS VARCHAR) AS "description",cast(_MAP['id'] AS VARCHAR) AS "id",
    // cast(_MAP['title'] AS VARCHAR) AS "title" FROM "elastic"."booksmapping"
    private static void showLikeAll(CalciteConnection calciteConnection) {
        try {
            System.out.println("LIKE ALL------------------------- ");
            String sql = "SELECT title, id FROM booksmapping WHERE title like '.*'";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showLikeRegex(CalciteConnection calciteConnection) {
        try {
            System.out.println("LIKE Regex------------------------- ");
            String sql = "SELECT title, id, author FROM booksmapping WHERE author like 'Bruce.*'";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showAll(CalciteConnection calciteConnection) {
        try {
            System.out.println("ALLLLLL------------------------- ");
            String sql = "SELECT * FROM booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

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

}
```

## 测试效果

```
--------------SQL: SELECT cast(_MAP['author'] AS VARCHAR) AS "author",cast(_MAP['price'] AS FLOAT) AS "price",cast(_MAP['publish_time'] AS VARCHAR) AS "publish_time",cast(_MAP['description'] AS VARCHAR) AS "description",cast(_MAP['id'] AS VARCHAR) AS "id",cast(_MAP['title'] AS VARCHAR) AS "title" FROM "elastic"."booksmapping"
ALLLLLL------------------------- 
二月 29, 2024 11:15:48 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/booksmapping/_search?scroll=1m] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:15:48 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:15:48 上午 org.elasticsearch.client.RestClient logResponse
警告: request [DELETE http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
Bruce Eckel, 70.2, 2007-10-01, Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉, 1, Java编程思想
葛一鸣, 46.5, 2012-08-01, 让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法, 2, Java程序性能优化
张惹愚, 81.4, 2016-05-01, 零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库, 3, Python科学计算
Helant, 54.5, 2014-03-01, 经典Python入门教程，层次鲜明，结构严谨，内容翔实, 4, Python基础教程
Nicholas C. Zakas, 66.4, 2012-10-01, JavaScript经典名著, 5, JavaScript高级程序设计

LIKE ALL------------------------- 
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/booksmapping/_search?scroll=1m] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [DELETE http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
Java编程思想, 1
Java程序性能优化, 2
Python科学计算, 3
Python基础教程, 4
JavaScript高级程序设计, 5

LIKE Regex------------------------- 
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/booksmapping/_search?scroll=1m] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [POST http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
二月 29, 2024 11:16:06 上午 org.elasticsearch.client.RestClient logResponse
警告: request [DELETE http://172.24.20.97:9200/_search/scroll] returned 1 warnings: [299 Elasticsearch-7.15.0-79d65f6e357953a5b3cbcc5e2c7c21073d89aa29 "Elasticsearch built-in security features are not enabled. Without authentication, your cluster could be accessible to anyone. See https://www.elastic.co/guide/en/elasticsearch/reference/7.15/security-minimal-setup.html to enable security."]
Java编程思想, 1, Bruce Eckel
```

# 源码要如何修改呢？

默认 ES 是不支持 LIKE 关键词的。

需要修改的有两个类：

QueryBuilders

PredicateAnalyzer

## PredicateAnalyzer

```java
case LIKE:
        return QueryExpression.create(pair.getKey()).like(pair.getValue());
//        throw new UnsupportedOperationException("LIKE not yet supported v-define!!!!");
```

把原来报错的 UnsupportedOperationException 改成 like。

## QueryBuilders

like 策略的 writeJson 默认也是不支持的。

我们修改一下 RegexpQueryBuilder#writeJson 方法，默认这里也是空的。

```java
/**
   * A Query that does fuzzy matching for a specific value.
   */
  static class RegexpQueryBuilder extends QueryBuilder {
    @SuppressWarnings("unused")
    private final String fieldName;
    @SuppressWarnings("unused")
    private final String value;

    RegexpQueryBuilder(final String fieldName, final String value) {
      this.fieldName = fieldName;
      this.value = value;
    }

    @Override void writeJson(final JsonGenerator generator) throws IOException {
      generator.writeStartObject();
      generator.writeFieldName("regexp");
      generator.writeStartObject();
      generator.writeFieldName(fieldName);
      writeObject(generator, value);
      generator.writeEndObject();
      generator.writeEndObject();
    }
  }
```

# 小结

整体来说不是很难，但是需要同时理解 ES 和 calcite。

官方这个地方为什么默认不支持呢？

这个写了邮件问暂时也没有回复。

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html

* any list
{:toc}
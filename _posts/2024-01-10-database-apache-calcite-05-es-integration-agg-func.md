---
layout: post
title: Apache Calcite 动态数据管理框架-05-java 访问 ES 整合常见聚合函数验证 sum/count/min/max/avg 支持
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 实战测试

## 说明

验证一下 es calcite 整合时，对于聚合函数的支持情况。

## 准备工作

参见 [Apache Calcite 动态数据管理框架-05-java 访问 ES 整合 apache calcite，使用标准 SQL 访问 ES](https://houbb.github.io/2018/11/15/database-apache-calcite-05-es-integration)

## 测试代码

这里我们除了输出所有信息之外，还同时输出了 min/max/avg/count/sum

```java
package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.calcite.adapter.elasticsearch.ElasticsearchSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;
import org.apache.http.HttpHost;
import org.elasticsearch.client.RestClient;

import java.sql.*;
import java.util.Properties;

/**
 * 聚合函数测试
 */
public class CalciteElasticsearchAggFuncExample {

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
        info.setProperty("calcite.default.charset", "UTF8");

        // 2.2 获取标准的JDBC Connection
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        // 2.3 获取Calcite封装的Connection
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);

        // 3.构建RootSchema，在Calcite中，RootSchema是所有数据源schema的parent，多个不同数据源schema可以挂在同一个RootSchema下
        SchemaPlus rootSchema = calciteConnection.getRootSchema();

        // 4.将不同数据源schema挂载到RootSchema，这里添加ElasticsearchSchema
        rootSchema.add("es", elasticsearchSchema);

        // 5.执行SQL查询，通过SQL方式访问object对象实例
        showAll(calciteConnection);

        showMin(calciteConnection);
        showMax(calciteConnection);
        showAvg(calciteConnection);
        showCount(calciteConnection);
        showSum(calciteConnection);

        restClient.close();
    }

    private static void showCount(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT count(_MAP['price']) FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println("COUNT -------------------------------------");
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showSum(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT sum(_MAP['price']) FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println("SUM -------------------------------------");
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showMin(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT min(_MAP['price']) FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println("MIN -------------------------------------");
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showMax(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT max(_MAP['price']) FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println("MAX -------------------------------------");
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showAvg(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT avg(_MAP['price']) FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println("AVG -------------------------------------");
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

    private static void showAll(CalciteConnection calciteConnection) {
        try {
            String sql = "SELECT * FROM es.booksmapping";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }

}
```

## 效果

```
{id=1, title=Java编程思想, author=Bruce Eckel, price=70.2, publish_time=2007-10-01, description=Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉}
{id=2, title=Java程序性能优化, author=葛一鸣, price=46.5, publish_time=2012-08-01, description=让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法}
{id=3, title=Python科学计算, author=张惹愚, price=81.4, publish_time=2016-05-01, description=零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库}
{id=4, title=Python基础教程, author=Helant, price=54.5, publish_time=2014-03-01, description=经典Python入门教程，层次鲜明，结构严谨，内容翔实}
{id=5, title=JavaScript高级程序设计, author=Nicholas C. Zakas, price=66.4, publish_time=2012-10-01, description=JavaScript经典名著}

MIN -------------------------------------
46.5

MAX -------------------------------------
81.4000015258789

AVG -------------------------------------
63.8

COUNT -------------------------------------
5

SUM -------------------------------------
319.0
```

## 疑问


1）avg/sum 对吗？

sum 正确

avg 正确


2) max 为什么这么奇怪？

主要是浮点数的精度导致的，我们可以调整语句为：

```sql
SELECT ROUND(MAX(price), 2) AS max_price FROM your_table;
```

实际测试发现不支持精度设置。

# 参考资料

* any list
{:toc}
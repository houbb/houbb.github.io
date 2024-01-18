---
layout: post
title: Apache Calcite 动态数据管理框架-20-实战笔记之入门例子
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 入门例子

## 依赖

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.example</groupId>
    <artifactId>calcite-learn</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>pom</packaging>
    <modules>
        <module>calcite-learn-basic</module>
    </modules>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <calcite.version>1.20.0</calcite.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.apache.calcite</groupId>
            <artifactId>calcite-core</artifactId>
            <version>${calcite.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.calcite</groupId>
            <artifactId>calcite-example-csv</artifactId>
            <version>${calcite.version}</version>
        </dependency>
        <!-- Add other dependencies, e.g., database driver -->
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>1.8</source>
                    <target>1.8</target>
                </configuration>
            </plugin>
        </plugins>
    </build>

</project>
```

## 测试 csv

创建文件夹：

```
D:\github\calcite-learn\calcite-learn-basic\src\main\resources\csv
```

下面防对应的测试 csv 文件：

- depts.csv

```csv
EMPNO:long,NAME:string,DEPTNO:int,GENDER:string,CITY:string,EMPID:int,AGE:int,SLACKER:boolean,MANAGER:boolean,JOINEDAT:date
100,"Fred",10,,,30,25,true,false,"1996-08-03"
110,"Eric",20,"M","San Francisco",3,80,,false,"2001-01-01"
110,"John",40,"M","Vancouver",2,,false,true,"2002-05-03"
120,"Wilma",20,"F",,1,5,,true,"2005-09-07"
130,"Alice",40,"F","Vancouver",2,,false,true,"2007-01-01"
```

## 测试类

```java
package com.github.houbb.calcite.learn.basic;

import org.apache.calcite.adapter.csv.CsvSchema;
import org.apache.calcite.adapter.csv.CsvTable;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;

import java.io.File;
import java.sql.*;
import java.util.Properties;

public class CsvDemo {

    public static void main(String[] args) throws Exception {
        // 0.获取csv文件的路径，注意获取到文件所在上层路径就可以了
        String path = "D:\\github\\calcite-learn\\calcite-learn-basic\\src\\main\\resources\\csv\\";

        // 1.构建CsvSchema对象，在Calcite中，不同数据源对应不同Schema，比如CsvSchema、DruidSchema、ElasticsearchSchema等
        CsvSchema csvSchema = new CsvSchema(new File(path), CsvTable.Flavor.SCANNABLE);

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

        // 4.将不同数据源schema挂载到RootSchema，这里添加CsvSchema
        rootSchema.add("csv", csvSchema);

        // 5.执行SQL查询，通过SQL方式访问csv文件
        String sql = "select * from csv.depts";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);

        // 6.遍历打印查询结果集
        printResultSet(resultSet);
    }

    public static void printResultSet(ResultSet resultSet) throws SQLException {
        // 获取 ResultSet 元数据
        ResultSetMetaData metaData = resultSet.getMetaData();

        // 获取列数
        int columnCount = metaData.getColumnCount();
        System.out.println("Number of columns: " + columnCount);

        // 遍历 ResultSet 并打印结果
        while (resultSet.next()) {
            // 遍历每一列并打印
            for (int i = 1; i <= columnCount; i++) {
                String columnName = metaData.getColumnName(i);
                String columnValue = resultSet.getString(i);
                System.out.println(columnName + ": " + columnValue);
            }
            System.out.println(); // 换行
        }
    }

}
```

## 测试效果

```
Number of columns: 10
EMPNO: 100
NAME: Fred
DEPTNO: 10
GENDER: 
CITY: 
EMPID: 30
AGE: 25
SLACKER: true
MANAGER: false
JOINEDAT: 1996-08-03

EMPNO: 110
NAME: Eric
DEPTNO: 20
GENDER: M
CITY: San Francisco
EMPID: 3
AGE: 80
SLACKER: null
MANAGER: false
JOINEDAT: 2001-01-01

EMPNO: 110
NAME: John
DEPTNO: 40
GENDER: M
CITY: Vancouver
EMPID: 2
AGE: null
SLACKER: false
MANAGER: true
JOINEDAT: 2002-05-03

EMPNO: 120
NAME: Wilma
DEPTNO: 20
GENDER: F
CITY: 
EMPID: 1
AGE: 5
SLACKER: null
MANAGER: true
JOINEDAT: 2005-09-07

EMPNO: 130
NAME: Alice
DEPTNO: 40
GENDER: F
CITY: Vancouver
EMPID: 2
AGE: null
SLACKER: false
MANAGER: true
JOINEDAT: 2007-01-01
```


# next 

如何把一个语句转换为特定数据库的语言？

# chat

## 详细介绍一下 Apache Calcite

Apache Calcite是一个开源的数据管理框架，旨在提供一种通用的、可扩展的查询优化器和查询解析器。

它是一个独立的项目，是Apache Software Foundation的一部分。

Calcite的目标是为各种数据存储和处理系统提供一个统一的、灵活的查询处理引擎，使得用户可以通过统一的SQL接口查询和操作不同的数据源。

以下是Apache Calcite的一些主要特点和组成部分：

1. **查询解析器（Parser）：** Calcite包含一个灵活的查询解析器，它能够解析SQL查询语句并将其转换为内部的查询表示形式。

2. **查询优化器（Optimizer）：** Calcite提供了强大的查询优化器，能够根据特定的数据源和查询条件，生成最优化的查询计划。这使得Calcite非常适用于多样化的数据存储引擎，包括关系型数据库、NoSQL数据库、数据仓库等。

3. **逻辑和物理查询计划：** Calcite将查询计划分为逻辑计划和物理计划两个阶段。逻辑计划是与数据源无关的抽象表示，而物理计划是针对具体数据源的优化表示。

4. **扩展性：** Calcite是一个高度可扩展的框架，允许开发人员定义和集成自定义的规则和转换器，以适应不同的数据存储和查询需求。

5. **多数据源支持：** Calcite支持同时查询多个不同的数据源，包括关系型数据库、文件系统、NoSQL数据库等。这使得它成为一个在多样化数据环境中进行统一查询的理想选择。

6. **Calcite模型（Calcite model）：** Calcite使用一个称为Calcite模型的元数据模型，描述了数据源的结构、关系和特性。这个模型可以通过简单的JSON文件来定义，并且允许用户轻松地定制和扩展。

7. **SQL标准兼容性：** Calcite遵循SQL标准，使得用户可以使用熟悉的SQL语言来查询各种数据源，而无需关心底层数据存储的具体细节。

总体而言，Apache Calcite 提供了一个通用的、可插拔的查询处理框架，使得开发人员能够轻松地构建支持多数据源的查询系统，而无需为每个数据源单独实现查询逻辑。

## Apache Calcite 支持哪些数据库类型？

Apache Calcite 是一个通用的查询优化框架，它并不直接提供对特定数据库类型的支持。

相反，Calcite 的设计目标之一是为多种数据源和数据处理引擎提供通用的查询解析和优化能力。

这包括但不限于以下类型的数据库和数据源：

1. **关系型数据库：** Calcite支持关系型数据库，如MySQL、PostgreSQL、Oracle、SQL Server等。通过标准的JDBC连接，你可以使用Calcite查询这些关系型数据库。

2. **NoSQL数据库：** Calcite可以与一些NoSQL数据库协同工作，例如Apache HBase、Apache Cassandra等。通过适当的Calcite模型定义，你可以使用SQL查询这些NoSQL数据库。

3. **文件系统：** Calcite支持通过适当的模型定义对文件系统中的数据进行查询，例如查询CSV文件、JSON文件等。

4. **内存数据结构：** 你可以使用Calcite来查询内存中的数据结构，例如Java集合、数组等。通过实现自定义的Calcite模型和表，你可以在内存中查询数据。

5. **自定义数据源：** Calcite是高度可扩展的，允许用户定义和集成自己的数据源。通过实现Calcite的接口，你可以为特定的数据存储和处理引擎创建定制的查询优化逻辑。

总体来说，Calcite的灵活性和可扩展性使其能够与多种数据存储和处理系统协同工作，为用户提供一个统一的查询界面。

在使用Calcite时，你需要根据具体的数据源类型来配置和定义适当的模型和规则，以确保查询能够正确解析和优化。

## 还有哪些类似 Apache Calcite 的开源组件？  

有几个开源组件类似于 Apache Calcite，它们提供了类似的查询优化和查询引擎的功能。

以下是其中一些：

1. **Apache Drill:**
   - **官网：** [Apache Drill](https://drill.apache.org/)
   - **描述：** Apache Drill是一个分布式的、高性能的分析数据库，支持大规模数据集上的SQL查询。它可以查询多种数据源，包括关系型数据库、NoSQL数据库、文件系统等。

2. **PrestoDB:**
   - **官网：** [PrestoDB](https://prestodb.io/)
   - **描述：** PrestoDB（简称Presto）是一个分布式SQL查询引擎，支持高并发查询，能够查询多种数据源，包括关系型数据库、Hive、Cassandra等。Presto的设计目标之一是提供低延迟的查询性能。

3. **Apache Hive:**
   - **官网：** [Apache Hive](https://hive.apache.org/)
   - **描述：** Apache Hive是建立在Hadoop上的数据仓库基础架构，提供类似SQL的查询语言HiveQL。它将SQL查询转换为MapReduce任务，用于在大规模数据集上执行查询。

4. **Spark SQL:**
   - **官网：** [Spark SQL](https://spark.apache.org/sql/)
   - **描述：** Spark SQL是Apache Spark的一个模块，提供了在Spark上执行SQL查询的功能。它支持多种数据源，包括Parquet、Avro、JSON、Hive等，还可以通过 JDBC 连接关系型数据库。

5. **CockroachDB:**
   - **官网：** [CockroachDB](https://www.cockroachlabs.com/)
   - **描述：** CockroachDB是一个分布式、支持SQL的数据库系统，具有强大的分布式事务支持。它的查询引擎支持类似于PostgreSQL的SQL语法。

6. **Apache Tajo:**
   - **官网：** [Apache Tajo](https://tajo.apache.org/)
   - **描述：** Apache Tajo是一个开源的数据仓库系统，支持SQL查询。它设计用于在大规模数据集上进行高性能的查询和分析。

这些工具在设计目标、使用场景以及支持的数据源上可能有所不同，因此在选择时需要根据具体的需求进行评估。

如果你需要一个通用的查询优化框架，类似于 Apache Calcite，那么它可能是一个很好的选择。如果你的需求更具体，可以考虑针对性更强的工具。

# 参考资料

[Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html)

[Apache Calcite精简入门与学习指导](https://blog.51cto.com/xpleaf/2639844)

* any list
{:toc}
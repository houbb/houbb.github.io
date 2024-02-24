---
layout: post
title: Apache Calcite 动态数据管理框架整合 csv 实战笔记
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 序言

我们在 [Apache Calcite 动态数据管理框架介绍](https://houbb.github.io/2024/01/10/database-apache-calcite-doc-overview-01-intro) 介绍了 calcite 的基本功能，本文一起来看一下如何实现一个 csv 的 sql 查询。

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

# 参考资料

[Apache Calcite 快速入门指南](https://strongduanmu.com/blog/apache-calcite-quick-start-guide.html)

[Apache Calcite精简入门与学习指导](https://blog.51cto.com/xpleaf/2639844)

* any list
{:toc}
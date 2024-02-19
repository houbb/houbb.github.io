---
layout: post
title: Apache Calcite 如何基于 calcite 自定义实现一个数据库-51-简单版本 csv？
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, apache, calcite, sh]
published: true
---

# 思路

直接参考 calcite csv 模块的代码，实现一个最简单版本的 csv database.

# csv 官方的使用方法

我们先学习下，原来的官方 csv 如何使用的。

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
        // 结果输出
    }

}
```

## 核心实现

CsvSchema 对应 csv 的数据库实现，主要入口在这里。

我们学习一下如何实现。

## maven 依赖

我们先引入核心依赖。

```xml
<dependency>
    <groupId>org.apache.calcite</groupId>
    <artifactId>calcite-core</artifactId>
    <version>1.36.0</version>
</dependency>
```

## CsvSchema-数据库

我们先模仿这个，实现一下 csv 的 schema

当然，这里还有一个 CsvSchemaFactory 属于一个工厂类，我们先忽略。

直接遍历 dir，针对每一个文件构建出对应的表。

```java
package com.github.houbb.calcite.adaptor.csv;

import com.github.houbb.heaven.util.io.FileUtil;
import org.apache.calcite.schema.Table;
import org.apache.calcite.schema.impl.AbstractSchema;
import org.apache.calcite.schema.impl.AbstractTable;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

/**
 * csv 数据库
 *
 * @since 0.1.0
 */
public class CsvSchema extends AbstractSchema {

    /**
     * csv 文件夹目录
     */
    private final File dir;

    private final String charset;
    private final Map<String, Table> innerTableMap = new HashMap<>();

    public CsvSchema(File dir, String charset) {
        this.dir = dir;
        this.charset = charset;
        this.initTableMap();
    }

    private void initTableMap() {
        File[] files = dir.listFiles();
        for(File file : files) {
            String fileName = file.getName();
            if(fileName.endsWith(".csv")) {
                // 构建最简单的 scan table
                AbstractTable abstractTable = new CsvScannableTable(file, charset);

                innerTableMap.put(FileUtil.getFileName(fileName), abstractTable);
            }
        }
    }

    @Override
    protected Map<String, Table> getTableMap() {
        // 这里需要遍历其中de
        return innerTableMap;
    }

}
```

## CsvScannableTable-简单的全表扫描表实现

这里我们为了简单，暂时直接把所有的列都定为字符串类别。

```java
package com.github.houbb.calcite.adaptor.csv;

import com.github.houbb.heaven.util.io.FileUtil;
import com.github.houbb.heaven.util.lang.StringUtil;
import org.apache.calcite.DataContext;
import org.apache.calcite.adapter.java.JavaTypeFactory;
import org.apache.calcite.linq4j.Enumerable;
import org.apache.calcite.rel.type.RelDataType;
import org.apache.calcite.rel.type.RelDataTypeFactory;
import org.apache.calcite.schema.ScannableTable;
import org.apache.calcite.schema.impl.AbstractTable;
import org.apache.calcite.sql.type.SqlTypeName;
import org.apache.calcite.util.ImmutableIntList;
import org.apache.calcite.util.Pair;

import java.io.File;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * csv 数据库
 *
 * @since 0.1.0
 */
public class CsvScannableTable extends AbstractTable implements ScannableTable  {

    /**
     * csv 文件
     */
    private final File csvFile;

    private final String charset;

    public CsvScannableTable(File csvFile, String charset) {
        this.csvFile = csvFile;
        this.charset = charset;
    }

    // 行类别
    @Override
    public RelDataType getRowType(RelDataTypeFactory relDataTypeFactory) {
        // 这里需要处理各种类别
        final JavaTypeFactory javaTypeFactory = (JavaTypeFactory) relDataTypeFactory;

        // fieldName 哪里来？直接解析第一行
        List<String> allLines = FileUtil.readAllLines(csvFile, charset, 0, 2, true);
        String headLine = allLines.get(0);

        // 所有的列名称 csv 第一行获取
        final List<String> fieldNameList = StringUtil.splitToList(headLine, ",");

        // 可以根据不同的内容处理，简单起见，全部设置为 varchar? 后续可以细化为不同的类别
//        String firstDataLine = allLines.get(1);
        final List<RelDataType> fieldTypeList = fieldNameList.stream()
                .map(new Function<String, RelDataType>() {
                    @Override
                    public RelDataType apply(String s) {
                        return javaTypeFactory.createSqlType(SqlTypeName.VARCHAR);
                    }
                })
                .collect(Collectors.toList());

        // 结果
        return javaTypeFactory.createStructType(Pair.zip(fieldNameList, fieldTypeList));
    }

    // 可以和 row 优化到一起，暂时不动
    private List<RelDataType> getFieldTypes(final JavaTypeFactory javaTypeFactory) {
        List<String> allLines = FileUtil.readAllLines(csvFile, charset, 0, 2, true);
        String headLine = allLines.get(0);

        // 所有的列名称 csv 第一行获取
        final List<String> fieldNameList = StringUtil.splitToList(headLine, ",");

        // 可以根据不同的内容处理，简单起见，全部设置为 varchar? 后续可以细化为不同的类别
        final List<RelDataType> fieldTypeList = fieldNameList.stream()
                .map(new Function<String, RelDataType>() {
                    @Override
                    public RelDataType apply(String s) {
                        return javaTypeFactory.createSqlType(SqlTypeName.VARCHAR);
                    }
                })
                .collect(Collectors.toList());

        return fieldTypeList;
    }

    // 如何 scan 一个表的数据？
    @Override
    public Enumerable<Object[]> scan(DataContext root) {
        JavaTypeFactory typeFactory = root.getTypeFactory();
        final List<RelDataType> fieldTypes = getFieldTypes(typeFactory);
        final List<Integer> fields = ImmutableIntList.identity(fieldTypes.size());

        // 这个做什么的？
        final AtomicBoolean cancelFlag = DataContext.Variable.CANCEL_FLAG.get(root);

        // 构建一个遍历结果
        List<String> dataLines = FileUtil.readAllLines(csvFile, charset, 1, Integer.MAX_VALUE, false);

        return new CsvEnumerable(dataLines, fieldTypes);
    }

}
```

## CsvEnumerable-行信息的遍历实现

处理好了行的列字段，那么如何遍历每一行数据呢？

```java
package com.github.houbb.calcite.adaptor.csv;

import org.apache.calcite.linq4j.AbstractEnumerable;
import org.apache.calcite.linq4j.Enumerator;
import org.apache.calcite.rel.type.RelDataType;

import java.util.List;

/**
 * csv 数据库
 *
 * @since 0.1.0
 */
public class CsvEnumerable extends AbstractEnumerable<Object[]> {

    /**
     * csv 文件
     */
    private final List<String> dataLines;

    private final List<RelDataType> fieldTypes;

    private int index = 0;

    public CsvEnumerable(List<String> allLines, List<RelDataType> fieldTypes) {
        this.dataLines = allLines;
        this.fieldTypes = fieldTypes;
        index = 0;
    }

    private Object[] buildRowDataArray(String rowLine) {
        Object[] dataArray = new Object[fieldTypes.size()];

        // 逗号拆分
        String[] datas = rowLine.split(",");
        int index = 0;
        for(String data : datas) {
            // 根据类别转换处理，此处省略。
            dataArray[index++] = data;
        }
        return dataArray;
    }

    @Override
    public Enumerator<Object[]> enumerator() {
        return new Enumerator<Object[]>() {
            @Override
            public Object[] current() {
                // 当前
                String line = dataLines.get(0);
                
                return buildRowDataArray(line);
            }

            @Override
            public boolean moveNext() {
                index++;
                return index < dataLines.size();
            }

            @Override
            public void reset() {
                index = 0;
            }

            @Override
            public void close() {
                // 这个是什么概念？
                // 我们一次读取完成的，暂时不需要考虑。
                // 如果是文件流，这里需要做流的关闭
            }
        };
    }

}
```

到这里，完整的 csv 的数据库查询就已经完成了。

# 实际测试

## maven 依赖

```xml
<dependency>
    <groupId>com.github.houbb</groupId>
    <artifactId>calcite-adaptor-csv</artifactId>
    <version>0.1.0</version>
</dependency>
```

## 测试 csv 文件

- depts.csv

```csv
EMPNO:long,NAME:string,DEPTNO:int,GENDER:string,CITY:string,EMPID:int,AGE:int,SLACKER:boolean,MANAGER:boolean,JOINEDAT:date
100,"Fred",10,,,30,25,true,false,"1996-08-03"
110,"Eric",20,"M","San Francisco",3,80,,false,"2001-01-01"
110,"John",40,"M","Vancouver",2,,false,true,"2002-05-03"
120,"Wilma",20,"F",,1,5,,true,"2005-09-07"
130,"Alice",40,"F","Vancouver",2,,false,true,"2007-01-01"
```

## 测试代码

基本和原来一行，唯一的区别是变成了我们自己定义的实现。

```java
package com.github.houbb.calcite.adaptor.csv;

import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.SchemaPlus;

import java.io.File;
import java.sql.*;
import java.util.Properties;

public class MyCsvDemo {

    public static void main(String[] args) throws Exception {
        // 0.获取csv文件的路径，注意获取到文件所在上层路径就可以了
        String path = "D:\\code\\github\\calcite-adaptor\\calcite-adaptor-test\\src\\main\\resources\\csv\\";

        // 1.构建CsvSchema对象，在Calcite中，不同数据源对应不同Schema，比如CsvSchema、DruidSchema、ElasticsearchSchema等
        CsvSchema csvSchema = new CsvSchema(new File(path), "UTF-8");

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

测试效果：

```
Number of columns: 10
EMPNO:long: 100
NAME:string: "Fred"
DEPTNO:int: 10
GENDER:string: 
CITY:string: 
EMPID:int: 30
AGE:int: 25
SLACKER:boolean: true
MANAGER:boolean: false
JOINEDAT:date: "1996-08-03"

EMPNO:long: 100
NAME:string: "Fred"
DEPTNO:int: 10
GENDER:string: 
CITY:string: 
EMPID:int: 30
AGE:int: 25
SLACKER:boolean: true
MANAGER:boolean: false
JOINEDAT:date: "1996-08-03"

EMPNO:long: 100
NAME:string: "Fred"
DEPTNO:int: 10
GENDER:string: 
CITY:string: 
EMPID:int: 30
AGE:int: 25
SLACKER:boolean: true
MANAGER:boolean: false
JOINEDAT:date: "1996-08-03"

EMPNO:long: 100
NAME:string: "Fred"
DEPTNO:int: 10
GENDER:string: 
CITY:string: 
EMPID:int: 30
AGE:int: 25
SLACKER:boolean: true
MANAGER:boolean: false
JOINEDAT:date: "1996-08-03"
```

# 小结

整体而言，calcite 封装的非常强大，我们自己实现也并不困难。

这种的意义是非常大的，现在有各种数据库/文件之类的，学习成本比较高。

比如 redis/kafka/mongodb/es，每一种语言过一段时间不用就会忘记，还是 SQL 用的最多。

下一节，我们可以一起学习一下如何实现一个支持条件过滤的 csv 表。

# 参考资料

[10分钟教你写一个数据库](https://cloud.tencent.com/developer/article/2186646)

* any list
{:toc}
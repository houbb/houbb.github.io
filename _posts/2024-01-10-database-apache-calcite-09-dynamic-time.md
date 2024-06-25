---
layout: post
title: Apache Calcite v1.36.0 整合 mysql + 动态的时间参数 实战笔记
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---


# 业务背景

如果我每一次调用的参数都是动态的。

```sql
select count(*) from users where create_time between #{startTime} and #{endTime}
```

接下来，让我们一步步的实现。

# 说明

实战记录一下 mysql 如何整合 apache calcite。

# mysql 数据准备

## 建表语句

```sql
use test;

drop table if exists users;
CREATE TABLE "users" (
  "id" int(11) NOT NULL,
  "username" varchar(255) NOT NULL,
  "email" varchar(255) NOT NULL,
   `create_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) COMMENT '创建时间',
   `update_time` datetime(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3) COMMENT '更新时间',
  PRIMARY KEY ("id")
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## 插入数据

```sql
insert into users (id, username, email) values (1, 'u-1', '1@email.com');
insert into users (id, username, email) values (2, 'u-2', '2@email.com');
insert into users (id, username, email) values (3, 'u-3', '3@email.com');
```

数据确认：

```
mysql> select * from users;
+----+----------+-------------+-------------------------+-------------------------+
| id | username | email       | create_time             | update_time             |
+----+----------+-------------+-------------------------+-------------------------+
|  1 | u-1      | 1@email.com | 2024-06-25 21:28:33.871 | 2024-06-25 21:28:33.871 |
|  2 | u-2      | 2@email.com | 2024-06-25 21:28:33.881 | 2024-06-25 21:28:33.881 |
|  3 | u-3      | 3@email.com | 2024-06-25 21:28:34.616 | 2024-06-25 21:28:34.616 |
+----+----------+-------------+-------------------------+-------------------------+
3 rows in set (0.00 sec)
```

# mysql 整合基本例子-v1

## maven 引入

```xml
<dependencies>
<!--        jdbc 应该是 core 的一部分-->
    <dependency>
        <groupId>org.apache.calcite</groupId>
        <artifactId>calcite-core</artifactId>
        <version>1.36.0</version>
    </dependency>
    <!-- MySQL JDBC Driver -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>5.1.47</version> <!-- 或者最新版本 -->
    </dependency>
</dependencies>
```

## java 代码

```java
package com.github.houbb.calcite.learn.mysql;

import com.mysql.jdbc.jdbc2.optional.MysqlDataSource;
import org.apache.calcite.adapter.jdbc.JdbcSchema;
import org.apache.calcite.jdbc.CalciteConnection;
import org.apache.calcite.schema.Schema;
import org.apache.calcite.schema.SchemaPlus;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Properties;

/**
 * https://blog.csdn.net/a17816876003/article/details/125592222
 */
public class CalciteMySQLExample {

    public static void main(String[] args) throws Exception {
        // check driver exist
        Class.forName("org.apache.calcite.jdbc.Driver");
        Class.forName("com.mysql.jdbc.Driver");

        // the properties for calcite connection
        Properties info = new Properties();
        //LEX: 使用传统的 SQL 解析器，也称为 "LEX" 解析器。这是 Calcite 默认的解析器类型，能够处理大多数 SQL 语法。
        //JAVA: 使用 Java 解析器，也称为 "JAVA" 解析器。这个解析器是针对 Calcite 提供的 SQL 格式进行解析。
        info.setProperty("lex", "JAVA");
        // remarks 是指定是否应该包含数据库的备注信息（也称为注释）。当设置为 true 时，表示在元数据中包含数据库对象的备注信息；当设置为 false 时，不包含备注信息。
        info.setProperty("remarks","true");
        // 所有函数
        info.setProperty("fun","all");
        // 大小写敏感
        info.setProperty("caseSensitive","false");
        // SqlParserImpl can analysis sql dialect for sql parse
        info.setProperty("parserFactory","org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY");

        // create calcite connection and schema
        Connection connection = DriverManager.getConnection("jdbc:calcite:", info);
        CalciteConnection calciteConnection = connection.unwrap(CalciteConnection.class);
        System.out.println(calciteConnection.getProperties());

        // code for mysql datasource
        MysqlDataSource dataSource = new MysqlDataSource();
        // please change host and port maybe like "jdbc:mysql://127.0.0.1:3306/test"
        dataSource.setUrl("jdbc:mysql://localhost:3306/test?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC");
        dataSource.setUser("admin");
        dataSource.setPassword("123456");
        // mysql schema, the sub schema for rootSchema, "test" is a schema in mysql
        SchemaPlus rootSchema = calciteConnection.getRootSchema();
        Schema schema = JdbcSchema.create(rootSchema, "test", dataSource, null, "test");
        rootSchema.add("test", schema);

        // Set default schema for unqualified table names，这样可以让 sql 不加前缀？
        calciteConnection.setSchema("test");

        // run sql query
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery("select count(*) from users");
        while (resultSet.next()) {
            System.out.println(resultSet.getObject(1));
        }

        statement.close();
        connection.close();
    }
}
```

输出日志：

```
{caseSensitive=false, fun=all, lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}

3
```

输出对应的个数为 3

## 配置信息

Properties 主要用于指定一些配置文件，可以参见 `CalciteConnectionProperty` 类。

```java
  APPROXIMATE_DISTINCT_COUNT("approximateDistinctCount", Type.BOOLEAN, false,
      false),

  /** Whether approximate results from "Top N" queries
   * ({@code ORDER BY aggFun DESC LIMIT n}) are acceptable. */
  APPROXIMATE_TOP_N("approximateTopN", Type.BOOLEAN, false, false),

  /** Whether approximate results from aggregate functions on
   * DECIMAL types are acceptable. */
  APPROXIMATE_DECIMAL("approximateDecimal", Type.BOOLEAN, false, false),

  /** Whether to treat empty strings as null for Druid Adapter.
   */
  NULL_EQUAL_TO_EMPTY("nullEqualToEmpty", Type.BOOLEAN, true, false),

  /** Whether to store query results in temporary tables. */
  AUTO_TEMP("autoTemp", Type.BOOLEAN, false, false),

  /** Whether Calcite should use materializations. */
  MATERIALIZATIONS_ENABLED("materializationsEnabled", Type.BOOLEAN, true,
      false),

  /** Whether Calcite should create materializations. */
  CREATE_MATERIALIZATIONS("createMaterializations", Type.BOOLEAN, true, false),

  /** How NULL values should be sorted if neither NULLS FIRST nor NULLS LAST are
   * specified. The default, HIGH, sorts NULL values the same as Oracle. */
  DEFAULT_NULL_COLLATION("defaultNullCollation", Type.ENUM, NullCollation.HIGH,
      true, NullCollation.class),

  /** How many rows the Druid adapter should fetch at a time when executing
   * "select" queries. */
  DRUID_FETCH("druidFetch", Type.NUMBER, 16384, false),

  /** URI of the model. */
  MODEL("model", Type.STRING, null, false),

  /** Lexical policy. */
  LEX("lex", Type.ENUM, Lex.ORACLE, false),

  /** Collection of built-in functions and operators. Valid values include
   * "standard", "mysql", "oracle", "postgresql" and "spatial", and also
   * comma-separated lists, for example "oracle,spatial". */
  FUN("fun", Type.STRING, "standard", true),

  /** How identifiers are quoted.
   *  If not specified, value from {@link #LEX} is used. */
  QUOTING("quoting", Type.ENUM, null, false, Quoting.class),

  /** How identifiers are stored if they are quoted.
   *  If not specified, value from {@link #LEX} is used. */
  QUOTED_CASING("quotedCasing", Type.ENUM, null, false, Casing.class),

  /** How identifiers are stored if they are not quoted.
   *  If not specified, value from {@link #LEX} is used. */
  UNQUOTED_CASING("unquotedCasing", Type.ENUM, null, false, Casing.class),

  /** Whether identifiers are matched case-sensitively.
   *  If not specified, value from {@link #LEX} is used. */
  CASE_SENSITIVE("caseSensitive", Type.BOOLEAN, null, false),

  /** Parser factory.
   *
   * <p>The name of a class that implements
   * {@link org.apache.calcite.sql.parser.SqlParserImplFactory}. */
  PARSER_FACTORY("parserFactory", Type.PLUGIN, null, false),

  /** Name of initial schema. */
  SCHEMA("schema", Type.STRING, null, false),

  /** Schema factory.
   *
   * <p>The name of a class that implements
   * {@link org.apache.calcite.schema.SchemaFactory}.
   *
   * <p>Ignored if {@link #MODEL} is specified. */
  SCHEMA_FACTORY("schemaFactory", Type.PLUGIN, null, false),

  /** Schema type.
   *
   * <p>Value may be null, "MAP", "JDBC", or "CUSTOM"
   * (implicit if {@link #SCHEMA_FACTORY} is specified).
   *
   * <p>Ignored if {@link #MODEL} is specified. */
  SCHEMA_TYPE("schemaType", Type.ENUM, null, false, JsonSchema.Type.class),

  /** Specifies whether Spark should be used as the engine for processing that
   * cannot be pushed to the source system. If false (the default), Calcite
   * generates code that implements the Enumerable interface. */
  SPARK("spark", Type.BOOLEAN, false, false),

  /** Returns the time zone from the connect string, for example 'gmt-3'.
   * If the time zone is not set then the JVM time zone is returned.
   * Never null. */
  TIME_ZONE("timeZone", Type.STRING, TimeZone.getDefault().getID(), false),

  /** If the planner should try de-correlating as much as it is possible.
   * If true (the default), Calcite de-correlates the plan. */
  FORCE_DECORRELATE("forceDecorrelate", Type.BOOLEAN, true, false),

  /** Type system. The name of a class that implements
   * {@link org.apache.calcite.rel.type.RelDataTypeSystem} and has a public
   * default constructor or an {@code INSTANCE} constant. */
  TYPE_SYSTEM("typeSystem", Type.PLUGIN, null, false),

  /** SQL conformance level. */
  CONFORMANCE("conformance", Type.ENUM, SqlConformanceEnum.DEFAULT, false);

  private final String camelName;
  private final Type type;
  private final Object defaultValue;
  private final boolean required;
  private final Class valueClass;
```


# mysql 整合-v2

## 说明 

我们想加一个时间限制，来读取数据。

## 数据准备

为了便于区分，我们再插入一些数据

```sql
insert into users (id, username, email) values (4, 'u-4', '4@email.com');
insert into users (id, username, email) values (5, 'u-5', '5@email.com');
insert into users (id, username, email) values (6, 'u-6', '6@email.com');
```

结果：

```
mysql> select * from users;
+----+----------+-------------+-------------------------+-------------------------+
| id | username | email       | create_time             | update_time             |
+----+----------+-------------+-------------------------+-------------------------+
|  1 | u-1      | 1@email.com | 2024-06-25 21:28:33.871 | 2024-06-25 21:28:33.871 |
|  2 | u-2      | 2@email.com | 2024-06-25 21:28:33.881 | 2024-06-25 21:28:33.881 |
|  3 | u-3      | 3@email.com | 2024-06-25 21:28:34.616 | 2024-06-25 21:28:34.616 |
|  4 | u-4      | 4@email.com | 2024-06-25 21:33:54.436 | 2024-06-25 21:33:54.436 |
|  5 | u-5      | 5@email.com | 2024-06-25 21:33:54.446 | 2024-06-25 21:33:54.446 |
|  6 | u-6      | 6@email.com | 2024-06-25 21:33:55.137 | 2024-06-25 21:33:55.137 |
+----+----------+-------------+-------------------------+-------------------------+
```

## 失败的方式1

```sql
select * from users where create_time between '2024-06-25 21:28:33' and '2024-06-25 21:29:33'
```

直接把时间用字符串表示，mysql 测试正常。

### oracle 异常

但是 oracle 会报错。

1) CAST 失败

测试发现 `SELECT CAST('2024-06-25 10:30:00' AS TIMESTAMP) FROM DUAL;` oracle 报错无效的月份，为什么？

这个问题发现

`SELECT * FROM NLS_SESSION_PARAMETERS WHERE PARAMETER = 'NLS_DATE_FORMAT';` 发现这个值是 DD-MON-RR

这个和我们指定的格式字符串不是相同的。

2) 尝试 TO_TIMESTAMP

`SELECT TO_TIMESTAMP('2024-06-25 10:30:00', 'YYYY-MM-DD HH24:MI:SS') FROM DUAL;`

发现会报错 这个报错内部缓冲区的字符串过长

直接使用字符串，最后会使用 TO_TIMESTAMP，依然会导致失败。

## 失败的方式2

采用占位符设置。

```java
String sql = "select count(*) from users where create_time between ? and ?";
PreparedStatement statement = calciteConnection.prepareStatement(sql);
statement.setTimestamp(1, Timestamp.valueOf("2024-06-25 21:28:33"));
statement.setTimestamp(2, Timestamp.valueOf("2024-06-25 21:29:33"));
ResultSet resultSet = statement.executeQuery();
while (resultSet.next()) {
    System.out.println(resultSet.getObject(1));
}
statement.close();
connection.close();
```

### mysql

mysql 执行时不会错误，但是结果是不对的。

```
{caseSensitive=false, fun=all, lex=JAVA, parserFactory=org.apache.calcite.sql.parser.impl.SqlParserImpl#FACTORY, remarks=true}
0
```

但是实际上应该是 3 才对。

### oracle

oracle 这种会直接报错，估计是 calcite 的实现问题。

发现 apache calcite 把 TIMESTAMP 转转为了 LONG，导致 oracle 执行类型不匹配。预期需要 timestamp，但是为 number

## 尝试方式3

最后，尝试首先采用 calcite 内置函数，比如 PARSE_DATETIME 把结果转化为时间戳，这样才能匹配。

可以参考文档：

> [standard-sql/format-elements](https://cloud.google.com/bigquery/docs/reference/standard-sql/format-elements)

比如：

```sql
SELECT PARSE_DATETIME('%Y-%m-%d %H:%M:%S', '1998-10-18 13:45:55') AS datetime;

/*---------------------*
 | datetime            |
 +---------------------+
 | 1998-10-18T13:45:55 |
 *---------------------*/
```

### java 实现

注意：`info.setProperty("fun","all");` 这个比较重要，否则报错方法不存在。

```java
String sql = "select count(*) from users where create_time between PARSE_DATETIME('%Y-%m-%d %H:%M:%S', ?) and PARSE_DATETIME('%Y-%m-%d %H:%M:%S', ?)";
PreparedStatement statement = calciteConnection.prepareStatement(sql);
statement.setTimestamp(1, Timestamp.valueOf("2024-06-25 21:28:33"));
statement.setTimestamp(2, Timestamp.valueOf("2024-06-25 21:29:33"));
ResultSet resultSet = statement.executeQuery();
while (resultSet.next()) {
    System.out.println(resultSet.getObject(1));
}
statement.close();
connection.close();
```

但是这样会报错：

```
Exception in thread "main" java.sql.SQLException: Error while preparing statement [select count(*) from users where create_time between PARSE_DATETIME('%Y-%m-%d %H:%M:%S', ?) and PARSE_DATETIME('%Y-%m-%d %H:%M:%S', ?)]
	at org.apache.calcite.avatica.Helper.createException(Helper.java:56)
	at org.apache.calcite.avatica.Helper.createException(Helper.java:41)
	at org.apache.calcite.jdbc.CalciteConnectionImpl.prepareStatement_(CalciteConnectionImpl.java:226)
	at org.apache.calcite.jdbc.CalciteConnectionImpl.prepareStatement(CalciteConnectionImpl.java:205)
	at org.apache.calcite.jdbc.CalciteConnectionImpl.prepareStatement(CalciteConnectionImpl.java:101)
	at org.apache.calcite.avatica.AvaticaConnection.prepareStatement(AvaticaConnection.java:178)
	at com.github.houbb.calcite.learn.mysql.CalciteMySQLExampleDynamicVarV2.main(CalciteMySQLExampleDynamicVarV2.java:59)
Caused by: org.apache.calcite.runtime.CalciteContextException: At line 1, column 90: Illegal use of dynamic parameter
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at org.apache.calcite.runtime.Resources$ExInstWithCause.ex(Resources.java:507)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:948)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:933)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.newValidationError(SqlValidatorImpl.java:5517)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.inferUnknownTypes(SqlValidatorImpl.java:2039)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.inferUnknownTypes(SqlValidatorImpl.java:2121)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.inferUnknownTypes(SqlValidatorImpl.java:2121)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateWhereOrOn(SqlValidatorImpl.java:4584)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateWhereClause(SqlValidatorImpl.java:4576)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateSelect(SqlValidatorImpl.java:3829)
	at org.apache.calcite.sql.validate.SelectNamespace.validateImpl(SelectNamespace.java:61)
	at org.apache.calcite.sql.validate.AbstractNamespace.validate(AbstractNamespace.java:88)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateNamespace(SqlValidatorImpl.java:1154)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateQuery(SqlValidatorImpl.java:1125)
	at org.apache.calcite.sql.SqlSelect.validate(SqlSelect.java:282)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateScopedExpression(SqlValidatorImpl.java:1091)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validate(SqlValidatorImpl.java:797)
	at org.apache.calcite.sql2rel.SqlToRelConverter.convertQuery(SqlToRelConverter.java:607)
	at org.apache.calcite.prepare.Prepare.prepareSql(Prepare.java:257)
	at org.apache.calcite.prepare.Prepare.prepareSql(Prepare.java:220)
	at org.apache.calcite.prepare.CalcitePrepareImpl.prepare2_(CalcitePrepareImpl.java:666)
	at org.apache.calcite.prepare.CalcitePrepareImpl.prepare_(CalcitePrepareImpl.java:519)
	at org.apache.calcite.prepare.CalcitePrepareImpl.prepareSql(CalcitePrepareImpl.java:487)
	at org.apache.calcite.jdbc.CalciteConnectionImpl.parseQuery(CalciteConnectionImpl.java:236)
	at org.apache.calcite.jdbc.CalciteConnectionImpl.prepareStatement_(CalciteConnectionImpl.java:216)
	... 4 more
Caused by: org.apache.calcite.sql.validate.SqlValidatorException: Illegal use of dynamic parameter
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at org.apache.calcite.runtime.Resources$ExInstWithCause.ex(Resources.java:507)
	at org.apache.calcite.runtime.Resources$ExInst.ex(Resources.java:601)
	... 28 more
```

## 尝试方案4

既然必须要转换为 timestamp，还不能占位符。

那留给我们的路就不多了

```java
String sql = "select count(*) from users where create_time between PARSE_DATETIME('%Y-%m-%d %H:%M:%S', '2024-06-25 21:28:33') and PARSE_DATETIME('%Y-%m-%d %H:%M:%S', '2024-06-25 21:29:33')";
PreparedStatement statement = calciteConnection.prepareStatement(sql);
ResultSet resultSet = statement.executeQuery();
while (resultSet.next()) {
    System.out.println(resultSet.getObject(1));
}
```

此时 mysql 是支持的，结果为 3

正确。

# 小结

总的来说，这样的一个插件引入，导致我们最简单的方式都变得非常复杂。

解决方案也是有的，就是过于曲折。

# 参考资料

https://blog.csdn.net/a17816876003/article/details/125592222

* any list
{:toc}
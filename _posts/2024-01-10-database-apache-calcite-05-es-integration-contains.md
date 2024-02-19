---
layout: post
title: Apache Calcite 动态数据管理框架-06-Es 整合 contains 方法如何使用？
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

## 实现思路-contains

一开始尝试了很多方法，发现都不对。

calcite ES like 不支持，看到 contains 应该是支持的，但是 SQL 应该如何编写？

同时发现网上的资料其实并不多，也可能是搜索的问题。

当然最后还是回到了 es 的官方代码用例。

### 官方例子

MatchTest#testMatchQuery

```java
/**
   * Tests the ElasticSearch match query. The match query is translated from
   * CONTAINS query which is build using RelBuilder, RexBuilder because the
   * normal SQL query assumes CONTAINS query is for date/period range.
   *
   * <p>Equivalent SQL query:
   *
   * <blockquote>
   * <code>select * from zips where city contains 'waltham'</code>
   * </blockquote>
   *
   * <p>ElasticSearch query for it:
   *
   * <blockquote><code>
   * {"query":{"constant_score":{"filter":{"match":{"city":"waltham"}}}}}
   * </code></blockquote>
   */
```

这里演示了 contains 的用法，会被转换为 ES 中的 match 查询（包含部分匹配）。

# 实际测试

## maven 版本依赖

calcite-elasticsearch 已经是当前最新的版本，v1.36.0，发现依然不支持。

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

    <artifactId>calcite-learn-es</artifactId>

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
        <dependency>
            <groupId>org.apache.calcite</groupId>
            <artifactId>calcite-elasticsearch</artifactId>
            <version>${calcite.version}</version>
        </dependency>

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

## 实现

我们主要看最上面的 contains 用法：

```java
private static void showContains(CalciteConnection calciteConnection) {
        try {
            System.out.println("CONTAINS ------------------------- ");
            String sql = "SELECT * FROM booksmapping WHERE title contains 'Java'";
            Statement statement = calciteConnection.createStatement();
            ResultSet resultSet = statement.executeQuery(sql);
            // 6.遍历打印查询结果集
            System.out.println(ResultSetUtil.resultString(resultSet));
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
```

发现依然还是报错。

## 报错

报错信息如下：

```
Exception in thread "main" java.lang.RuntimeException: java.sql.SQLException: Error while executing SQL "SELECT * FROM booksmapping WHERE title CONTAINS 'Java'": From line 1, column 34 to line 1, column 54: Cannot apply 'CONTAINS' to arguments of type '<VARCHAR> CONTAINS <CHAR(4)>'. Supported form(s): '<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <INTERVAL>'
'<DATETIME> CONTAINS <INTERVAL>'
	at org.example.CalciteElasticsearchViewAutoByMappingContainsExample.showContains(CalciteElasticsearchViewAutoByMappingContainsExample.java:81)
	at org.example.CalciteElasticsearchViewAutoByMappingContainsExample.main(CalciteElasticsearchViewAutoByMappingContainsExample.java:65)
Caused by: java.sql.SQLException: Error while executing SQL "SELECT * FROM booksmapping WHERE title CONTAINS 'Java'": From line 1, column 34 to line 1, column 54: Cannot apply 'CONTAINS' to arguments of type '<VARCHAR> CONTAINS <CHAR(4)>'. Supported form(s): '<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <INTERVAL>'
'<DATETIME> CONTAINS <INTERVAL>'
	at org.apache.calcite.avatica.Helper.createException(Helper.java:56)
	at org.apache.calcite.avatica.Helper.createException(Helper.java:41)
	at org.apache.calcite.avatica.AvaticaStatement.executeInternal(AvaticaStatement.java:164)
	at org.apache.calcite.avatica.AvaticaStatement.executeQuery(AvaticaStatement.java:228)
	at org.example.CalciteElasticsearchViewAutoByMappingContainsExample.showContains(CalciteElasticsearchViewAutoByMappingContainsExample.java:77)
	... 1 more
Caused by: org.apache.calcite.runtime.CalciteContextException: From line 1, column 34 to line 1, column 54: Cannot apply 'CONTAINS' to arguments of type '<VARCHAR> CONTAINS <CHAR(4)>'. Supported form(s): '<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <INTERVAL>'
'<DATETIME> CONTAINS <INTERVAL>'
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at org.apache.calcite.runtime.Resources$ExInstWithCause.ex(Resources.java:507)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:948)
	at org.apache.calcite.sql.SqlUtil.newContextException(SqlUtil.java:933)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.newValidationError(SqlValidatorImpl.java:5517)
	at org.apache.calcite.sql.SqlCallBinding.newValidationSignatureError(SqlCallBinding.java:399)
	at org.apache.calcite.sql.type.OperandTypes$PeriodOperandTypeChecker.checkSingleOperandType(OperandTypes.java:1315)
	at org.apache.calcite.sql.fun.SqlOverlapsOperator.checkOperandTypes(SqlOverlapsOperator.java:104)
	at org.apache.calcite.sql.SqlOperator.validateOperands(SqlOperator.java:498)
	at org.apache.calcite.sql.SqlOperator.deriveType(SqlOperator.java:607)
	at org.apache.calcite.sql.SqlBinaryOperator.deriveType(SqlBinaryOperator.java:178)
	at org.apache.calcite.sql.validate.SqlValidatorImpl$DeriveTypeVisitor.visit(SqlValidatorImpl.java:6575)
	at org.apache.calcite.sql.validate.SqlValidatorImpl$DeriveTypeVisitor.visit(SqlValidatorImpl.java:6562)
	at org.apache.calcite.sql.SqlCall.accept(SqlCall.java:166)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.deriveTypeImpl(SqlValidatorImpl.java:1926)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.deriveType(SqlValidatorImpl.java:1911)
	at org.apache.calcite.sql.validate.SqlValidatorImpl.validateWhereOrOn(SqlValidatorImpl.java:4590)
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
	at org.apache.calcite.jdbc.CalciteMetaImpl.prepareAndExecute(CalciteMetaImpl.java:702)
	at org.apache.calcite.avatica.AvaticaConnection.prepareAndExecuteInternal(AvaticaConnection.java:677)
	at org.apache.calcite.avatica.AvaticaStatement.executeInternal(AvaticaStatement.java:157)
	... 3 more
Caused by: org.apache.calcite.sql.validate.SqlValidatorException: Cannot apply 'CONTAINS' to arguments of type '<VARCHAR> CONTAINS <CHAR(4)>'. Supported form(s): '<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <INTERVAL>'
'<DATETIME> CONTAINS <INTERVAL>'
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
	at org.apache.calcite.runtime.Resources$ExInstWithCause.ex(Resources.java:507)
	at org.apache.calcite.runtime.Resources$ExInst.ex(Resources.java:601)
	... 37 more
```

### 错误原因

可以发现，最主要的还是 contains 支持的类别问题。

```
Cannot apply 'CONTAINS' to arguments of type '<VARCHAR> CONTAINS <CHAR(4)>'. Supported form(s): '<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <DATETIME>'
'<DATETIME> CONTAINS <INTERVAL>'
'<DATETIME> CONTAINS <INTERVAL>'
```

不支持 varchar 字符串的 contains。


正如上面注释中写的一样，正常情况下 SQL query 已经限制了 contains 的类别。

```
   * Tests the ElasticSearch match query. The match query is translated from
   * CONTAINS query which is build using RelBuilder, RexBuilder because the
   * normal SQL query assumes CONTAINS query is for date/period range.
   *
```

github 提了一个疑问：

> [https://github.com/apache/calcite/pull/1530](https://github.com/apache/calcite/pull/1530)

## 如何解决这个问题呢？

???

自己重新实现，在 es adaptor 的基础上拓展?

# 小结

解决问题的方式还算比较多，但是这里考虑的场景估计还是不够全面。

但是整体的思路是没有问题的，通过 view 简化 sql，不需要修改 calcite 的源码。

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html

* any list
{:toc}
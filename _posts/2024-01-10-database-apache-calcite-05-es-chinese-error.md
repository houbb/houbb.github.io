---
layout: post
title: Apache Calcite 动态数据管理框架-06-Es 整合时中文乱码报错 org.apache.calcite.runtime.CalciteException  Failed to encode in character set 'ISO-8859-1'
date:  2018-11-15 08:38:35 +0800
categories: [Search]
tags: [apache, search, index, es, sh]
published: true
---

# 报错1-中文报错

## 准备工作

参见 [Apache Calcite 动态数据管理框架-05-java 访问 ES 整合 apache calcite，使用标准 SQL 访问 ES](https://houbb.github.io/2018/11/15/database-apache-calcite-05-es-integration)

## 测试代码

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


public class CalciteElasticsearchLikeExample {

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
        SchemaPlus rootSchema = calciteConnection.getRootSchema();

        // 4.将不同数据源schema挂载到RootSchema，这里添加ElasticsearchSchema
        rootSchema.add("es", elasticsearchSchema);

        // 5.执行SQL查询，通过SQL方式访问object对象实例
        String sql = "SELECT * FROM es.books WHERE _MAP['title'] = 'Java编程思想'";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);
        // 6.遍历打印查询结果集
        System.out.println(ResultSetUtil.resultString(resultSet));
        restClient.close();
    }
}
```

## sql 中文报错

如果 sql 涉及到中文，会报错如下：

```
String sql = "SELECT * FROM es.books WHERE _MAP['title'] = 'Java编程思想'";

会被 calcite 变成  while converting `books`.`_MAP`['title'] = u&'Java\7f16\7a0b\601d\60f3'，报错

Caused by: org.apache.calcite.runtime.CalciteException: Failed to encode 'Java编程思想' in character set 'ISO-8859-1'
	at sun.reflect.NativeConstructorAccessorImpl.newInstance0(Native Method)
	at sun.reflect.NativeConstructorAccessorImpl.newInstance(NativeConstructorAccessorImpl.java:62)
	at sun.reflect.DelegatingConstructorAccessorImpl.newInstance(DelegatingConstructorAccessorImpl.java:45)
	at java.lang.reflect.Constructor.newInstance(Constructor.java:423)
```

## 报错原因

通过代码追踪，字符串的编码最终在此处获取

```java
//RexBuilder.java
public RexLiteral makeCharLiteral(NlsString str) {
    assert str != null;
    //此处获取字符串的编码
    RelDataType type = SqlUtil.createNlsStringType(typeFactory, str);
    return makeLiteral(str, type, SqlTypeName.CHAR);
  }
  //SqlUtil.java
 public static RelDataType createNlsStringType(
      RelDataTypeFactory typeFactory,
      NlsString str) {
    Charset charset = str.getCharset();
    if (null == charset) {
      charset = typeFactory.getDefaultCharset();
    }
   ...
    return type;
  }
```

可以看到如果NlsString的编码为null的话，就会采用RelDataTypeFactory的默认编码，否则直接采用NlsString的编码。

那么NlsString的编码是如何设置呢?找到Calcite parser中关于String常量提取的地方:

```
//带编码的字符串
<PREFIXED_STRING_LITERAL>
    //获取ChartSet
    { charSet = SqlParserUtil.getCharacterSet(token.image); }
|   <QUOTED_STRING>
|   <UNICODE_STRING_LITERAL> {
        // TODO jvs 2-Feb-2009:  support the explicit specification of
        // a character set for Unicode string literals, per SQL:2003
        unicodeEscapeChar = BACKSLASH;
        charSet = "UTF16";
    }
)
{
    p = SqlParserUtil.parseString(token.image);
    SqlCharStringLiteral literal;
    try {
        literal = SqlLiteral.createCharString(p, charSet, getPos());
    } catch (java.nio.charset.UnsupportedCharsetException e) {
        throw SqlUtil.newContextException(getPos(),
            RESOURCE.unknownCharacterSet(charSet));
    }
    frags = startList(literal);
    nfrags++;
}
... 
//编码字符串的内容 
< PREFIXED_STRING_LITERAL: ("_" <CHARSETNAME> | "N") <QUOTED_STRING> >
```

从以上代码不难理解，可以直接设置字符串常量的编码，格式为 _UTF8 ''中国" 这种形式，即上述SQL 可以写成

```sql
select id from user_behavior where rlike(text, _UTF8 '.*中国.*')
```

那么支持哪些编码呢？

Calcite 支持UTF8、UTF16、ISO-8859-1等，关于这几个编码的区别，请自行Google。 

回到问题，那么 `select id from user_behavior where rlike(text, '.*中国.*')` 为什么会报错呢？ 

根据代码逻辑，如果没有显示的指定字符集的话，就使用RelDataTypeFactory 的默认字符集, RelDataTypeFactory的默认字符集在

```java
//RelDataTypeFactoryImpl.java
  public Charset getDefaultCharset() {
    return Util.getDefaultCharset();
  }
//Util.java
  public static Charset getDefaultCharset() {
    return DEFAULT_CHARSET;
  }
  private static final Charset DEFAULT_CHARSET =
      Charset.forName(CalciteSystemProperty.DEFAULT_CHARSET.value());

//CalciteSystemProperty.java
  public static final CalciteSystemProperty<String> DEFAULT_CHARSET =
      stringProperty("calcite.default.charset", "ISO-8859-1");
```

原因总结如下: 如果没有显示指定String常量的编码时，采用TypeFactory的编码，而TypeFactory的默认编码是'ISO-8859-1', 这是一种单字节编码，中文会出现乱码情况，所以Calcite会报错

## 解决方案

### 核心步骤

1）添加 saffron.properties 指定编码

在项目的资源文件新建一个 saffron.properties 文件（根目录）

内容如下

```ini
calcite.default.charset = utf8
```

然后在org.apache.calcite.config.CalciteSystemProperty#loadProperties函数打断点查看是否加载该配置文件即可

此时发现不再报错，但是依然无法查询到数据。数据命名存在。

2) 在配置信息中指定

指定编码属性

```java
Properties info = new Properties();
// 不区分sql大小写
info.setProperty("caseSensitive", "false");
info.setProperty("calcite.default.charset", "UTF8");
```

## 完整代码

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


public class CalciteElasticsearchChineseExample {

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

        System.out.println("where start------------------------------------------------- ");
        String sql = "SELECT * FROM es.booksmapping WHERE _MAP['author'] = '张惹愚'";
        Statement statement = calciteConnection.createStatement();
        ResultSet resultSet = statement.executeQuery(sql);
        // 6.遍历打印查询结果集
        System.out.println(ResultSetUtil.resultString(resultSet));
        restClient.close();
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

测试效果：

```

{id=1, title=Java编程思想, author=Bruce Eckel, price=70.2, publish_time=2007-10-01, description=Java学习必读经典，殿堂级著作，赢得了全球程序员的广泛赞誉}
{id=2, title=Java程序性能优化, author=葛一鸣, price=46.5, publish_time=2012-08-01, description=让你的Java程序更快，更稳定。深入剖析软件层面，代码层面，JVM虚拟机层面的优化方法}
{id=3, title=Python科学计算, author=张惹愚, price=81.4, publish_time=2016-05-01, description=零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库}
{id=4, title=Python基础教程, author=Helant, price=54.5, publish_time=2014-03-01, description=经典Python入门教程，层次鲜明，结构严谨，内容翔实}
{id=5, title=JavaScript高级程序设计, author=Nicholas C. Zakas, price=66.4, publish_time=2012-10-01, description=JavaScript经典名著}

where start------------------------------------------------- 
...
{id=3, title=Python科学计算, author=张惹愚, price=81.4, publish_time=2016-05-01, description=零基础学Python，光盘中作者独家整合开发winPython环境，涵盖了Python各个扩展库}
```

# 参考资料

https://calcite.apache.org/docs/elasticsearch_adapter.html


## 中文报错

Calcite中文乱码问题： https://blog.csdn.net/qq_45859375/article/details/130698293

Calcite 中文编码问题： https://zhuanlan.zhihu.com/p/65584894

https://guosmilesmile.github.io/2020/09/05/Calcite-%E5%B8%A6%E6%9C%89%E4%B8%AD%E6%96%87%E5%BC%95%E5%8F%91%E7%9A%84%E8%A1%80%E6%A1%88/

https://bbs.huaweicloud.com/blogs/261477

https://blog.csdn.net/weixin_39133753/article/details/115470036

https://developer.aliyun.com/ask/437115

https://lists.apache.org/thread/xsmfzh74r9qkobmnlqhygnwz013qff5h

https://www.cnblogs.com/s1023/p/12583935.html

https://github.com/Qihoo360/Quicksql/issues/202

https://juejin.cn/s/utf8%20string%20to%20iso-8859-1


* any list
{:toc}
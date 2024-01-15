---
layout: post
title: database JDBC-01-overview
date:  2018-10-07 14:51:25 +0800
categories: [Database]
tags: [sql, java, jdbc, TODO, sf]
published: true
---

# JDBC

## 概念

Java数据库连接(JDBC)API的行业标准数据库之间的连接数据库的Java编程语言和一系列SQL数据库和其他数据源表格,如电子表格或文本文件。JDBC API为基于sql的数据库访问提供了一个调用级别的API。

JDBC技术允许您使用Java编程语言为需要访问企业数据的应用程序开发“一次编写、在任何地方运行”的功能。使用支持JDBC技术的驱动程序，您甚至可以在异构环境中连接所有公司数据。

# 架构

JDBC API 支持两层和三层处理模型进行数据库访问，但在一般的JDBC体系结构由两层组成：

JDBC API: 提供了应用程序对JDBC的管理连接。

JDBC Driver API: 支持JDBC管理到驱动器连接。

JDBC API的使用驱动程序管理器和数据库特定的驱动程序提供透明的连接到异构数据库。

JDBC驱动程序管理器可确保正确的驱动程序来访问每个数据源。

该驱动程序管理器能够支持连接到多个异构数据库的多个并发的驱动程序。

![jdbc-struct](http://www.yiibai.com/uploads/images/201706/0206/392080659_56700.jpg)

## 核心组件

JDBC API提供了以下接口和类：

DriverManager: 这个类管理数据库驱动程序的列表。确定内容是否符合从Java应用程序使用的通信子协议正确的数据库驱动程序的连接请求。识别JDBC在一定子协议的第一个驱动器将被用来建立数据库连接。

Driver: 此接口处理与数据库服务器通信。很少直接直接使用驱动程序（Driver）对象，一般使用DriverManager中的对象，它用于管理此类型的对象。它也抽象与驱动程序对象工作相关的详细信息

Connection: 此接口与接触数据库的所有方法。连接对象表示通信上下文，即，与数据库中的所有的通信是通过此唯一的连接对象。

Statement: 可以使用这个接口创建的对象的SQL语句提交到数据库。一些派生的接口接受除执行存储过程的参数。

ResultSet: 这些对象保存从数据库后，执行使用Statement对象的SQL查询中检索数据。它作为一个迭代器，可以通过移动它来检索下一个数据。

SQLException: 这个类用于处理发生在数据库应用程序中的任何错误。

# 类型映射

| SQL类型	| Java类型 |
|:---|:---|
| CHAR	           |     java.lang.String |
| VARCHAR	        |    java.lang.String |
| LONGVARCHAR	    |    java.lang.String |
| NUMERIC	        |    java.math.BigDecimal |
| DECIMAL	        |    java.math.BigDecimal |
| BIT	            |    boolean |
| TINYINT	        |    byte |
| SMALLINT	       | short |
| INTEGER	        |    int |
| BIGINT	         |   long |
| REAL	           | float |
| FLOAT	          |  double |
| DOUBLE	         |   double |
| BINARY	         |   byte[] |
| VARBINARY	      |  byte[] |
| LONGVARBINARY   | 	byte[] |
| DATE	           | java.sql.Date |
| TIME	           | java.sql.Time |
| TIMESTAMP	      |  java.sql.Timestamp |
| BLOB	           | java.sql.Blob |
| CLOB	           | java.sql.Clob |
| Array	          |  java.sql.Array |
| REF	            |    java.sql.Ref |
| Struct |   java.sql.Struct |

# 数据库链接

## 步骤

以下是基本的四个步骤 

1. 导入JDBC包：使用Java语言的import语句在Java代码开头位置导入所需的类。

2. 注册JDBC驱动程序：使JVM将所需的驱动程序实现加载到内存中，从而可以满足JDBC请求。

3. 数据库URL配置：创建一个正确格式化的地址，指向要连接到的数据库(如：MySQL,Oracle和MSSQL等等)。

4. 创建连接对象：最后，调用DriverManager对象的getConnection()方法来建立实际的数据库连接。

## 1. 导入JDBC包

```java
import java.sql.* ;  // for standard JDBC programs
import java.math.* ; // for BigDecimal and BigInteger support
```

## 2. 注册JDBC驱动程序

### 2.1 forName()

Java使用JDBC驱动程序连接MySQL数据库的示例代码片段

```java
Class.forName("com.mysql.jdbc.Driver");
```

- 不合规的JVM

使用 `getInstance()` 方法来解决不合规的JVM，但是必须编写两个额外的异常:

```java
Class.forName("com.mysql.jdbc.Driver").newInstance();
```

### 2.2 DriverManager.registerDriver()

如果使用的是非JDK兼容的JVM(如Microsoft提供的)，则应使用registerDriver()方法。

```java
Driver mysqlDriver = new com.mysql.jdbc.Driver();
DriverManager.registerDriver(mysqlDriver);
```

## 3. 数据库URL配置

数据库URL是指向数据库的地址。制定数据库URL是建立连接相关联的大多数错误问题发生的地方。

下表列出了常用的JDBC驱动程序名称和数据库URL。

| RDBMS	 | JDBC驱动程序名称	| URL格式 |
|:---|:---|:---|
| MySQL	        | com.mysql.jdbc.Driver	            | jdbc:mysql://hostname/databaseName |
| ORACLE	    | oracle.jdbc.driver.OracleDriver	| jdbc:oracle:thin:@hostname:portNumber:databaseName |
| PostgreSQL	| org.postgresql.Driver	            | jdbc:postgresql://hostname:port/dbname |
| DB2	        | com.ibm.db2.jdbc.net.DB2Driver	| jdbc:db2:hostname:port Number/databaseName |
| Sybase	    | com.sybase.jdbc.SybDriver	        | jdbc:sybase:Tds:hostname: portNumber/databaseName |

URL格式的所有突出部分都是静态的，只需要根据数据库设置更改对应的部分。

## 4. 创建连接对象

### 4.1 接口 

```java
Connection getConnection(String url)
Connection getConnection(String url, java.util.Properties info) 
Connection getConnection(String url, String user, String password)
```

### 4.2 创建连接

- getConnection(String url)

```java
final String url = "jdbc:MySQL://localhost:3306/test?user=root&password=123456";
Connection connection = DriverManager.getConnection(url);
```

- getConnection(String url, String user, String password)

```java
final String url = "jdbc:MySQL://localhost:3306/test";
Connection connection = DriverManager.getConnection(url, "root", "123456");
```

- getConnection(String url, java.util.Properties info)

```java
final String url = "jdbc:MySQL://localhost:3306/test";
Properties properties = new Properties();
properties.put("user", "root");
properties.put("password", "123456");
Connection connection = DriverManager.getConnection(url, properties);
```

### 4.3 关闭JDBC连接

在JDBC程序结束之后，显式地需要关闭与数据库的所有连接以结束每个数据库会话。 

但是，如果在编写程序中忘记了关闭也没有关系，Java的垃圾收集器将在清除过时的对象时也会关闭这些连接。

依靠垃圾收集，特别是数据库编程，是一个非常差的编程实践。所以应该要使用与连接对象关联的close()方法关闭连接。

要确保连接已关闭，可以将关闭连接的代码中编写在“finally”块中。 

一个finally块总是会被执行，不管是否发生异常。要关闭上面打开的连接，应该调用close()方法如下

```java
connection.close();
```

## 实战代码

这个例子需要 JDK1.7+，使用了 TWR 语法。

```java
public static void main(String[] args) throws ClassNotFoundException,
        IllegalAccessException, InstantiationException, SQLException {
    Class.forName("com.mysql.jdbc.Driver");

    final String url = "jdbc:MySQL://localhost:3306/test";
    Properties properties = new Properties();
    properties.put("user", "root");
    properties.put("password", "123456");
    try (Connection connection = DriverManager.getConnection(url, properties)) {
        //....
    }
}
```

# 参考资料

https://www.oracle.com/technetwork/java/javase/jdbc/index.html

[Java数据库连接](https://zh.wikipedia.org/wiki/Java%E6%95%B0%E6%8D%AE%E5%BA%93%E8%BF%9E%E6%8E%A5)

[jdk8 sqp doc](https://docs.oracle.com/javase/8/docs/api/javax/sql/package-summary.html)

[JDBC 入门教程](https://www.javacodegeeks.com/2015/03/jdbc%E5%85%A5%E9%97%A8%E6%95%99%E7%A8%8B.html)

- 数据库链接

https://www.yiibai.com/jdbc/jdbc-db-connections.html#article-start

http://database.51cto.com/art/201005/199278.htm

* any list
{:toc}
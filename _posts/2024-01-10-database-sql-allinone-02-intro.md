---
layout: post
title: 数据库统一查询方案介绍-01-intro 
date: 2024-01-10 21:01:55 +0800
categories: [Database]
tags: [database, sql, sh]
published: true
---

# 拓展阅读

[calcite简介和使用 quick-sql 查询](https://juejin.cn/post/7174718990818738236)

# 背景介绍

## 背景说明

项目相关组件现状：

- 多个引擎需要投入多倍的人力，在人员有限的情况下，对引擎的掌控力会减弱

- 语法兼容问题(Hive/Impala/Spark)

- 语义支持问题(Hive/Impala/Oracle)

- 扩展时重复工作量多

- 每一个新引擎的学习成本(Hive/Impala/GreenPlum/Presto/…)

- 每个新功能的维护成本(…)

不能赋能中台：

- 不利于专家知识库的建设（重复问题）

- 多项目会造成成本飙升（…）

## 项目目标

整体目标

公司内部统一的SQL分析中间件，作为一个简单，安全，快速的跨数据源统一SQL 查询引擎

- 减少在使用不同数据引擎时需要的学习成本和切换成本；

- 忽略不同数据引擎底层存储和数据查询方式的差异

- 使用户仅需要关注查询的业务逻辑和数据本身。

## 应用场景

数据分析

- 数据分析/挖掘

- 生成报表

- ETL

即时查询

- 数据采样

- 小数据交互查询

支持多数据源查询

- MySQL join ElasticSearch union Hive

运维监控

## 研发策略

自研不等于自主可控，以“集成式创新”为出发点，拥抱开源和构建开源生态。

### 拥抱开源

积极参与社区贡献，加深和社区的合作，和社区融为一体 - 插件化

将特异性的需求独立出来，形成插件，降低与主干的耦合性，轻量化的迭代

### 生态化

- 通用易用的数据访问方式

- 高性能的数据查询能力

- 完备的企业级特性支持

- 丰富的生态支持与构建

# 产品起步

## 产品调研

目前市面上已有的产品：

- presto

- quick-sql

- linkis

- XQL/IQL

[https://github.com/luons/query-engine](https://github.com/luons/query-engine)


## 已有的开源产品的问题

### presto:

优点
性能优越
跨源查询
SQL支持
缺点：
容错性差，当某个worker的查询失败后，整个query失效，没有重试机制
容易OOM，运行过程中对于内存极为敏感,连表查，可能产生大量的临时数据，因此速度会变慢
不支持实时
学习成本高

### linkis

缺点：
仅作转发
学习成本较高

### XQL/IQL

缺点：
不开源

### quick-sql：

优点：
支持实时
多引擎支持
基本满足当前需求

缺点：
修改了SQL解析开源实现Calcite，无法跟社区同步

## 选择自研

调研最终选择的QuickSql，其自身有很多的问题：

- 它将Calcite以源码形式导入到了工程中并做了十几处改动

- 由于导入的Calcite版本较低，很多新功能都无法使用

- QuickSQL去掉导入的Calcite部分，本身只有1万多行

- 我们列出的很多扩展性的功能，QuickSQL也不支持

基于上述原因，我们选择自研，而不是基于QuickSQL做二次开发。

在 第一阶段、第二阶段，整体架构逻辑都参考自QuickSql。

自研时，我们对Calcite不做源码修改，只依赖。
Calcite选择最新的1.26版本
除SQL解析赖于 Calcite，其他并无特别依赖。

其他依赖：

- calcite和avatica

- 日志、commons组件、guava

- jetty

- spark(可选)，flink(可选)

## 产品优势

- 支持跨数据源查询（mysql、oracle、hive、es等），消除数据孤岛，针对数据价值挖掘有着更强大的功能

- 多引擎支持（目前计划支持spark、flink，目前需手动指定）

- 所有查询采用统一的sql语法（减少开发人员使用不同的组件的学习成本和开发成本）

- 易扩展（扩展更多的数据源，目前理论支持所有可JDBC连接的数据源）

- 拥抱开源，核心calcite紧跟开源社区（社区活跃且强大）

# 架构概述

## 整体架构

my-project 整体分为四层：

客户端
接入层
解析层
引擎层

![struct](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/1.jpg)

如上图，my-project的核心包括了接入层、解析层、引擎层
接入层提供一个TCP服务，供客户端调用
解析层是最重要的一层，在这一层里会将接入层获取到的查询信息进行分析，之后交给引擎层
引擎层根据解析层的指示，选择spark、flink或者JDBC直连的方式进行查询
引擎层最终调用的就是一个个具体的存储服务

下面是更细节的架构图

![细节结构图](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/2.jpg)

my-project需要将元数据信息注入到服务中，这里的元数据指的是客户端查询的库、表等信息。比如：

```sql
SELECT t.id,t.name,t.info FROM my_db.my_table AS t WHERE t.id > 10;
```

在这个SQL中，客户需要查询my_db这个库，但他并没有将my_db库的配置信息(url、用户名、密码等)告诉my-project，所以要完成上述的SQL查询，需要先将my_db库的配置信息注入到my-project中。
而meta模块就是用来完成元数据注入的，它下面指向的mysql是内部库，仅供my-project使用。

Core模块中，由runner子模块接收服务端解析的请求内容，也就是一个具体的SQL语句，以及相关的配置信息(可选)。

在Core模块中，会将接收到的SQL做法语解析，生成语法树，并根据语法树决定是单数据源查询、还是多数据源查询，而具体的查询动作是交给pipeline子模块完成的，由这个子模块去调用 spark 或者 JDBC完成具体的查询操作。

Core模块中还有一个Optimze子模块，负责对语法树进行优化，将一个查询效率比较差的SQL语句，优化成一个查询效果更高的SQL语句，Optimze这个子模块是可选的。

上图中的my-project是一个JVM进程，my-project本身是无状态的，可以方便的扩容/缩量。

## 接入层架构

JDBC 方式的服务端架构如下：

![JDBC 方式](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/3.jpg)

客户端需要先引入my-project驱动。 

只需要对传统JDBC方式方式稍作配置即可，传统JDBC查询代码如下：

```java
Class.forName("com.mysql.jdbc.Driver");
String url = "jdbc:mysql://localhost:3306/my_db";
Connection  conn = DriverManager.getConnection(url, properties);
ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM my_db.my_table");
// some logic .....
```

使用my-project驱动后，将url和driver替换掉即可使用：

```java
Class.forName("com.my-project.client.Driver");
String url = "jdbc:my-project:http//localhost:15888/my_db";
Connection  conn = DriverManager.getConnection(url, properties);
ResultSet rs = conn.createStatement().executeQuery("SELECT * FROM my_db.my_table");
// some logic .....
```

my-project驱动底层是HTTP方式的通讯，服务端是内嵌的Jetty。

客户端发送的JDBC请求实际是一个HTTP请求，而JDBC的请求内容被封装到HTTP的body中。

HTTP body有两种编码方式：

JSON
protobuf

服务端解析到请求后，会交给自定义的my-projectHandler来处理。

my-projectHandler首先会解析请求，根据指定的 JSON 方式或者 protobuf 得到具体的内容，也就是一个具体的SQL。

之后就是执行这个SQL，通过调用my-project-Core模块完成具体的查询操作。

## 解析层

解析层的执行流程如下：

![解析层](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/4.jpg)

对于一个跨数据源的SQL:

```sql
SELECT * FROM Oracle_db.a Join MySQL_db.b ON a.id = b.id WHERE b.id > 10
```

解析层首先将这个SQL解析，得到一个语法树。

再遍历这棵树，就能确定需要查询的数据源，通过数据源的数量，也就确定了是否为跨数据源查询。

在具体执行之前，有一步可选的优化：

RBO：基于规则的优化，包括谓词下推、列裁剪、常量折叠等
CBO：基于代价的优化

如果是单数据源查询，对应的就是一个普通的JDBC查询。

如果是跨数据源查询，则交给 Spark 或者 Flink 去执行。

## 引擎层

可插拔的引擎层架构如下：

![引擎层](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/5.jpg)

根据前面解析得到语法树，交给pipeline去调用一个具体的引擎来执行。
这里的引擎可以是JDBC、可以是Flink、也可以是Spark。

**每种类型的引擎都是以独立的ClassLoader方式引入的，这样可以保证引擎执行不会出现jar冲突**。

对于上述的架构，可以引入Spark 2.x作为引擎层；也可以同时引入Spark 3.x作为引擎层；或者可以引入其他任意类型的执行引擎。
my-project并不依赖于某一种具体的引擎，只是把具体的引擎当作黑盒使用。

对于跨数据源查询时(比如选用Spark)，会动态的生成一些代码，然后将这些代码提交到 Spark的集群执行:

生成import 语句
生成查询 Oracle 的代码，并将结果写入到 tempView A 中
生成查询 MySQL 的代码，并将结果写入到 tempView B 中
最后执行对 A 和 B 执行一个联合查询


# JDBC服务端解析

## 架构

服务端整体架构如下：

![架构](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%95%B4%E5%90%88Calcite/1.jpg)

服务端依托于Jetty运行的，通过内嵌的方式启动一个jetty，将AvaticaJsonHandler注册到jeety中。

客户端发送的是JSON或者Protobuf格式的协议，服务端接收到请求后会调用AvaticaJsonHandler来处理这个请求。

AvaticaJsonHandler首先解析请求，然后执行请求内容，在执行的时候根据是否是直连会选择两种执行方式：

- 原始的JDBC方式执行

- 调用my-project来执行，这里就是调用SqlRunner、Pipeline那套流程

客户端和服务端进行交互的时候，是根据不同的操作，调用对应的对象，再将这些对象 编码/解码

比如，要执行创建连接，那么会触发一个openConnection的操作，之后生成OpenConnectionRequest的对象。客户端会将这个对象编码为 JSON 或者 Protobuf。

类似的，服务端会接收到这个 JSON，然后将其解码成OpenConnectionRequest对象，再触发对应的操作。

客户端封装的请求类型如下(下面的都是一系列操作对象，发送前会被编码为JSON格式)：

客户端 -> 服务端的交互概览如下：

![交互概览](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%95%B4%E5%90%88Calcite/4.jpg)

客户端执行 JDBC 查询，比如openConnect、createStatement等操作，这会委托给 AvaticaConnection 这个类去做。

AvaticaConnection 又会调用到Meta，Meta只是一个接口，所以需要一个具体的实现类。

这里的实现类是QuicksqlRemoteMeta，但看起来RemoteMeta也能完成，不清楚 quicksql 的实现有何用处

似乎Meta的实现类只是作为一个桥接用的，用来连接 AvaticaConnection 和 具体发送者之间的桥梁。

RemoteMeta 最后会交给 JsonService 来完成。在 JsonService 内部完成对象的编码 和 解码，HTTP发送动作是由 RemoteService来做的。 以上就是客户端的工作了，再看服务端：
服务端是依托于 Jetty 的，jetty 接收到请求会交给自定义的 AvaticaJsonHandler， 再交给 JsonHandler 来完成 decode 和 encode

所谓的 decode 就是将请求的 json 解码(用jackson将json解析成对象类型)，之后交给 my-projectServiceMeta，这个类也类似于桥梁的作用，真正执行的是交给后面的 my-project-code去做的。

## 查询过程

### 创建连接

执行一个创建连接的动作:

```java
Connection connection = DriverManager.getConnection(url, properties);
```

客户端会发送一个UUID，服务端根据这个UUID会将连接java.sql.Connection、java.sql.Statement给缓存(Guava)起来。

下次再有请求过来会首先从缓存中查找。

这里客户端需要服务端执行一个openConnection操作，也就是下面 json 中request中表示的 客户端发送json：

```json
{
	"request": "openConnection",
	"connectionId": "cebe4551-9788-439e-8d1a-792064cd7a00",
	"info": {
		"schemaPath": {
			"version": "1.0",
			"defaultSchema": "my_test",
			"schemas": [{
				"name": "my_test",
				"type": "custom",
				"factory": "org.apache.calcite.adapter.jdbc.JdbcSchema$Factory",
				"operand": {
					"jdbcDriver": "com.mysql.jdbc.Driver",
					"jdbcUrl": "jdbc:mysql://10.200.64.11:3306/my_test?useSSL=false",
					"jdbcUser": "name",
					"jdbcPassword": "password",
					"dbType": "mysql"
				}
			}]
		}

	}
}
```

服务端返回的json：

```json
{
	"response": "openConnection",
	"rpcMetadata": {
		"response": "rpcMetadata",
		"serverAddress": "KJBJ-01-DN-004889:15888"
	}
}
```

### 创建statement

再执行一个创建statement的动作：

```java
Statement statement1 = connection.createStatement();
```

这里会继续触发一个 HTTP 请求，客户端会继续使用之前的 UUID，服务端根据 请求的 UUID 从缓存中取出连接。

这次客户端会要求执行connectionSync这个操作： 客户端发送的json：

```json
{
	"request": "connectionSync",
	"connectionId": "cebe4551-9788-439e-8d1a-792064cd7a00",
	"connProps": {
		"connProps": "connPropsImpl",
		"autoCommit": null,
		"readOnly": null,
		"transactionIsolation": null,
		"catalog": null,
		"schema": null,
		"dirty": true
	}
}
```

服务端返回的json：

```json
{
	"response": "connectionSync",
	"connProps": {
		"connProps": "connPropsImpl",
		"autoCommit": null,
		"readOnly": null,
		"transactionIsolation": null,
		"catalog": null,
		"schema": null,
		"dirty": false
	},
	"rpcMetadata": {
		"response": "rpcMetadata",
		"serverAddress": "KJBJ-01-DN-004889:15888"
	}
}
```

之后客户端会要求执行createStatement这个操作 客户端再次发送：

```json
{
	"request": "createStatement",
	"connectionId": "cebe4551-9788-439e-8d1a-792064cd7a00"
}
```

服务端响应：

```json
{
	"response": "createStatement",
	"connectionId": "cebe4551-9788-439e-8d1a-792064cd7a00",
	"statementId": 0,
	"rpcMetadata": {
		"response": "rpcMetadata",
		"serverAddress": "KJBJ-01-DN-004889:15888"
	}
}
```

## 执行查询

执行的时序图如下：

![时序图](https://woquhaha.gitee.io/pic_tech_1/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E6%95%B4%E5%90%88Calcite/5.jpg)

首先客户端发送请求给jetty，jetty接受到请求后，会调用到自定义的handler，也就是AvaticaJsonHandler。
AvaticaJsonHandler是真正执行具体逻辑的地方，这里主要干两件事：

根据请求对象解析出传递的内容，也就是解析json；根据json格式生成对应的对象
执行这个对象，并生成json结果，最后返回给客户端
这里解析完json后，得到的是PrepareAndExecuteRequest这么一个对象，之后会触发到QuicksqlServerMeta来执行prepareAndExecute函数。
这个函数就是用于执行具体sql的，它会根据客户端传递的参数，来决定执行方式：

如果客户端传递的直连查询，就用原始的JDBC方式查询，比如创建mysql驱动再查询mysql，或者创建oracle驱动再查询oracle
非直连查询，这里走的就是正常的calcite逻辑，也就是调用 SqlRunner解析sql并得到一个pipeline，再执行pipeline，最后将结果封装成ExecuteResutl并返回给客户端

客户端发送查询，要求执行prepareAndExecute操作

```json
{
	"request": "prepareAndExecute",
	"connectionId": "0f276a88-335f-4f01-8916-36d11075e223",
	"statementId": 1,
	"sql": "select * from my_test",
	"maxRowsInFirstFrame": -1,
	"maxRowCount": -1
}
```

服务端返回结果：

```json
{
	"response": "executeResults",
	"missingStatement": false,
	"rpcMetadata": {
		"response": "rpcMetadata",
		"serverAddress": "KJBJ-01-DN-004889:5888"
	},
	"results": [{
		"response": "resultSet",
		"connectionId": "0f276a88-335f-4f01-8916-36d11075e223",
		"statementId": 1,
		"ownStatement": true,
		"signature": {
			"columns": [{
				"ordinal": 0,
				"autoIncrement": true,
				"caseSensitive": false,
				"searchable": true,
				"currency": false,
				"nullable": 0,
				"signed": true,
				"displaySize": 11,
				"label": "id",
				"columnName": "id",
				"schemaName": "",
				"precision": 11,
				"scale": 0,
				"tableName": "my_test",
				"catalogName": "linkis_test",
				"type": {
					"type": "scalar",
					"id": 4,
					"name": "INT",
					"rep": "PRIMITIVE_INT"
				},
				"readOnly": false,
				"writable": true,
				"definitelyWritable": true,
				"columnClassName": "java.lang.Integer"
			}, {
				"ordinal": 1,
				"autoIncrement": false,
				"caseSensitive": false,
				"searchable": true,
				"currency": false,
				"nullable": 1,
				"signed": false,
				"displaySize": 200,
				"label": "name",
				"columnName": "name",
				"schemaName": "",
				"precision": 200,
				"scale": 0,
				"tableName": "my_test",
				"catalogName": "linkis_test",
				"type": {
					"type": "scalar",
					"id": 12,
					"name": "VARCHAR",
					"rep": "STRING"
				},
				"readOnly": false,
				"writable": true,
				"definitelyWritable": true,
				"columnClassName": "java.lang.String"
			}],
			"sql": null,
			"parameters": [],
			"cursorFactory": {
				"style": "LIST",
				"clazz": null,
				"fieldNames": null
			},
			"statementType": null
		},
		"firstFrame": {
			"offset": 0,
			"done": true,
			"rows": [
				[1, "aaaaa"],
				[2, "bbbb"],
				[3, "ccccc"],
				[4, "dddd"],
				[5, "eeee"],
				[8, "xxxxxxxx!!!"],
				[9, "kkkkkkk"],
				[10, "wokao"],
				[11, null],
				[12, "xxxxx!!!"]
			]
		},
		"updateCount": -1,
		"rpcMetadata": {
			"response": "rpcMetadata",
			"serverAddress": "KJBJ-01-DN-004889:5888"
		}
	}]
}
```



# 参考资料

https://code0xff.org/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E9%A1%B9%E7%9B%AE%E4%BB%8B%E7%BB%8D/

https://code0xff.org/post/2021/12/%E7%BB%9F%E4%B8%80%E6%9F%A5%E8%AF%A2%E6%95%B4%E5%90%88calcite/

* any list
{:toc}
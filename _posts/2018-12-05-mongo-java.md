---
layout: post
title: Mongo Java
date: 2018-12-05 11:35:23 +0800
categories: [SQL]
tags: [nosql, mongo, spring, sh]
published: true
excerpt: Mongo Java 入门，结合 spring-data 操作 mongo
---

# MongoDB 快速开始

## Mongo 基础知识

[Mongo 系列学习笔记](https://houbb.github.io/2017/05/31/mongodb-01-install)

## Mongo Docker 启动

[Mongo Docker](https://houbb.github.io/2018/11/22/docker-mongodb)

```
$ docker run -p 27017:27017 -d mongo
c120a2890d511b7c11dfb605d0c66544719d6a6d5f7408b4e1cb2495e31c8285
```

## Mongo 可视化工具

[nosqlbooster for mongo](https://nosqlbooster.com/)

[robomongo](https://robomongo.org/)


# java 访问 mongo 

访问 [mongodb 官网](https://mongodb.github.io/mongo-java-driver/)

目前本地的 JDK 版本为 1.8，于是选择了版本较低的。

> [mongodb 3.2](http://mongodb.github.io/mongo-java-driver/3.2/driver/getting-started/installation-guide/)

## jar 导入

```xml
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongodb-driver</artifactId>
    <version>3.2.2</version>
</dependency>
```

## mongo 创建数据库 

命令行执行

```
use test;
```

- 结果如下：

```
switched to db test;
```

## java 代码连接数据库

官网初始化的方式，非常便捷。

```java
// To directly connect to a single MongoDB server
// (this will not auto-discover the primary even if it's a member of a replica set)
MongoClient mongoClient = new MongoClient();

// or
MongoClient mongoClient = new MongoClient( "localhost" );

// or
MongoClient mongoClient = new MongoClient( "localhost" , 27017 );

// or, to connect to a replica set, with auto-discovery of the primary, supply a seed list of members
MongoClient mongoClient = new MongoClient(
  Arrays.asList(new ServerAddress("localhost", 27017),
                new ServerAddress("localhost", 27018),
                new ServerAddress("localhost", 27019)));

// or use a connection string
MongoClientURI connectionString = new MongoClientURI("mongodb://localhost:27017,localhost:27018,localhost:27019");
MongoClient mongoClient = new MongoClient(connectionString);

MongoDatabase database = mongoClient.getDatabase("mydb");
```

- 个人测试代码

```java
@Test
public void initTest() {
    MongoClient mongoClient = new MongoClient( "localhost" , 27017 );
    MongoDatabase database = mongoClient.getDatabase("test");
}
```

日志输出如下：

```
十二月 05, 2018 7:49:57 下午 com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[localhost:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
```

# 基础方法实例

## 插入信息

```java
/**
 * 在表中插入信息
 */
@Test
public void insertCollectionTest() {
    MongoClient mongoClient = new MongoClient( "localhost" , 27017 );
    MongoDatabase database = mongoClient.getDatabase("test");
    //1. 获取对象
    MongoCollection<Document> collection = database.getCollection("person");
    //2. 插入
    Document doc = new Document("name", "MongoDB")
            .append("type", "database")
            .append("count", 1)
            .append("info", new Document("x", 203).append("y", 102));
    collection.insertOne(doc);
}
```

## 查询表的相关信息

### 基础查询

```java
/**
 * 查询相关信息
 */
@Test
public void queryCollectTest() {
    MongoClient mongoClient = new MongoClient( "localhost" , 27017 );
    MongoDatabase database = mongoClient.getDatabase("test");
    //1. 获取对象
    MongoCollection<Document> collection = database.getCollection("person");
    //2. 查询总数
    long count = collection.count();
    System.out.println("总数: " + count);
    //3. 查询具体信息
    Document query = collection.find().first();
    System.out.println("查询信息: " + query.toJson());
}
```

日志：

```
总数: 2
查询信息: { "_id" : { "$oid" : "5c07bc41fd7bbd038830240f" }, "name" : "MongoDB", "type" : "database", "count" : 1, "info" : { "x" : 203, "y" : 102 } }
```

### 过滤查询

按照指定的条件过滤

```java
// i=71
 collection.find(Filters.eq("i", 71)).first();
 // i< 50 <= 100
 collection.find(Filters.and(Filters.gt("i", 50),
         Filters.lte("i", 100))).first();
```

### 排序

按照指定的字段排序

```java
collection.find(Filters.exists("i")).sort(Sorts.descending("i")).first();
```

### 指定查询字段

`Projections` 可以帮我们指定想返回的字段。

```java
collection.find().projection(Projections.excludeId()).first();
```

## 函数聚合

有时我们需要聚合存储在MongoDB中的数据。 

Aggregates帮助程序为每种类型的聚合阶段提供构建器。

下面我们将进行一个简单的两步转换，计算i * 10的值。

首先，我们通过使用Aggregates.match帮助器找到i> 0的所有文档。

然后我们使用Aggregates.project和$multiply运算符重新整理文档，以计算“ITimes10”值：

```java
collection.aggregate(asList(
        match(gt("i", 0)),
        project(Document.parse("{ITimes10: {$multiply: ['$i', 10]}}")))
).forEach(printBlock);
```

对于 `$group` 操作，使用Accumulators帮助程序进行任何累加器操作。

下面我们通过将Aggregates.group帮助器与Accumulators.sum帮助器结合使用来总结i的所有值：

```java
collection.aggregate(singletonList(group(null, sum("total", "$i")))).first();
```

## 更新 Document

```java
collection.updateOne(eq("i", 10), Updates.set("i", 110));
```

可以同时更新多个：

```java
UpdateResult updateResult = collection.updateMany(lt("i", 100), inc("i", 100));
System.out.println(updateResult.getModifiedCount());
```

## 删除 Document

### 删除一个

```java
collection.deleteOne(eq("i", 110));
```

### 删除多个

```java
DeleteResult deleteResult = collection.deleteMany(gte("i", 100));
System.out.println(deleteResult.getDeletedCount());
```

## 批量操作

这些新命令允许执行批量插入/更新/删除操作。

有两种类型的批量操作：

1、订购批量操作。

按顺序执行所有操作，并在第一次写入错误时输出错误。

2、无序批量操作。

执行所有操作并报告任何错误。

无序批量操作不保证执行顺序。

让我们看看使用有序和无序操作的两个简单示例：

```java
// 2. Ordered bulk operation - order is guarenteed
collection.bulkWrite(
  Arrays.asList(new InsertOneModel<>(new Document("_id", 4)),
                new InsertOneModel<>(new Document("_id", 5)),
                new InsertOneModel<>(new Document("_id", 6)),
                new UpdateOneModel<>(new Document("_id", 1),
                                     new Document("$set", new Document("x", 2))),
                new DeleteOneModel<>(new Document("_id", 2)),
                new ReplaceOneModel<>(new Document("_id", 3),
                                      new Document("_id", 3).append("x", 4))));


 // 2. Unordered bulk operation - no guarantee of order of operation
collection.bulkWrite(
  Arrays.asList(new InsertOneModel<>(new Document("_id", 4)),
                new InsertOneModel<>(new Document("_id", 5)),
                new InsertOneModel<>(new Document("_id", 6)),
                new UpdateOneModel<>(new Document("_id", 1),
                                     new Document("$set", new Document("x", 2))),
                new DeleteOneModel<>(new Document("_id", 2)),
                new ReplaceOneModel<>(new Document("_id", 3),
                                      new Document("_id", 3).append("x", 4))),
  new BulkWriteOptions().ordered(false));
```

> 注意

当连接到2.6之前的MongoDB服务器时，不建议使用bulkWrite方法，因为这是第一个支持批量写入命令以进行插入，更新和删除的服务器版本，允许驱动程序为BulkWriteResult实现正确的语义。

和BulkWriteException。

这些方法仍适用于2.6之前的服务器，但性能会受到影响，因为每次写操作必须一次执行一次。


# Admin 相关操作

还有相关的创建索引。数据库的管理等。


## setup

和前面一样

```java
MongoClient mongoClient = new MongoClient();
MongoDatabase database = mongoClient.getDatabase("mydb");
MongoCollection<Document> collection = database.getCollection("test");
```

## 数据库

### 列举数据库

```java
for (String name: mongoClient.listDatabaseNames()) {
    System.out.println(name);
}
```

###  Drop 数据库

```java
mongoClient.getDatabase("databaseToBeDropped").drop();
```

## Collection

### 新建

MongoDB中的集合只需将文档插入其中即可自动创建。

使用createCollection方法，您还可以显式创建集合以自定义其配置。

例如，要创建大小为1兆字节的上限集合：

```java
database.createCollection("cappedCollection",
  new CreateCollectionOptions().capped(true).sizeInBytes(0x100000));
```

### 列举

```java
for (String name : database.listCollectionNames()) {
    System.out.println(name);
}
```

### Drop

```java
collection.drop();
```

## 索引相关

### 创建

MongoDB支持二级索引。

要创建索引，只需指定字段或字段组合，并为每个字段指定该字段的索引方向。

我们可以使用Indexes帮助程序来创建索引键：

```java
// create an ascending index on the "i" field
collection.createIndex(Indexes.ascending("i"));
```

### 列举

```java
for (final Document index : collection.listIndexes()) {
    System.out.println(index.toJson());
}
```

### 文本索引


MongoDB还提供文本索引以支持字符串内容的文本搜索。文本索引可以包括其值为字符串或字符串元素数组的任何字段。要创建文本索引，请使用Indexes.text静态助手：

```java
// create a text index on the "content" field
coll.createIndex(Indexes.text("content"));
```

从MongoDB 2.6开始，文本索引现在已集成到主查询语言中并默认启用（这里我们使用Filters.text帮助程序）：

```java
// Insert some documents
collection.insertOne(new Document("_id", 0).append("content", "textual content"));
collection.insertOne(new Document("_id", 1).append("content", "additional content"));
collection.insertOne(new Document("_id", 2).append("content", "irrelevant content"));

// Find using the text index
long matchCount = collection.count(Filters.text("textual content -irrelevant"));
System.out.println("Text search matches: " + matchCount);

// Find using the $language operator
Bson textSearch = Filters.text("textual content -irrelevant", new TextSearchOptions().language("english"));
matchCount = collection.count(textSearch);
System.out.println("Text search matches (english): " + matchCount);

// Find the highest scoring match
Document projection = new Document("score", new Document("$meta", "textScore"));
Document myDoc = collection.find(textSearch).projection(projection).first();
System.out.println("Highest scoring document: " + myDoc.toJson());
```

结果如下：

```
Text search matches: 2
Text search matches (english): 2
Highest scoring document: { "_id" : 1, "content" : "additional content", "score" : 0.75 }
```

## 运行命令

有些命令没有封装，你可以直接使用 command 运行

```java
Document buildInfo = database.runCommand(new Document("buildInfo", 1));
System.out.println(buildInfo);
```


# spring data

## mongo config

```java
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.authentication.UserCredentials;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoDbFactory;

import java.util.ArrayList;
import java.util.Arrays;

/**
 * mongo 数据库连接池配置
 *
 * @author binbin.hou
 */
@Configuration
@ComponentScan("com.github.houbb")
public class MongoConfig {

    @Bean
    public UserCredentials userCredentials() {
        return new UserCredentials(mongoUsername, mongoPassword);
    }

    public @Bean
    MongoClient mongoClient() {
        ServerAddress serverAddress = new ServerAddress(mongoHost1, mongoPort1);
        ServerAddress serverAddress2 = new ServerAddress(mongoHost2, mongoPort2);
        return new MongoClient(Arrays.asList(serverAddress, serverAddress2), new ArrayList<MongoCredential>() {
            {
                add(MongoCredential.createCredential(mongoUsername, mongoDbName, mongoPassword.toCharArray()));
            }
        });
    }

    @Bean
    public MongoDbFactory mongoDbFactory() throws Exception {
        return new SimpleMongoDbFactory(mongoClient(), mongoDbName);
    }

    public @Bean MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoDbFactory());
    }

}
```

# 参考资料

[MongoDB Java](http://www.runoob.com/mongodb/mongodb-java.html)

* any list
{:toc}
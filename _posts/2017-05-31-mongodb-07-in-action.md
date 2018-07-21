---
layout: post
title:  MongoDB-07-java in action
date:  2017-05-31 16:41:22 +0800
categories: [SQL]
tags: [sql, nosql, mongodb]
published: true
---


# Java 实战

[官方快速开始](http://mongodb.github.io/mongo-java-driver/3.0/driver/getting-started/quick-tour/)

# 快速开始

## jar 引入

- mongodb

```xml
<!--mongodb-->
<dependency>
    <groupId>org.mongodb</groupId>
    <artifactId>mongo-java-driver</artifactId>
    <version>3.4.2</version>
</dependency>
```

- test & log

```xml
<!--test-->
<dependency>
    <groupId>junit</groupId>
    <artifactId>junit</artifactId>
    <version>${junit.version}</version>
</dependency>

<!--log4j2-->
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-api</artifactId>
    <version>${log4j2.api.version}</version>
</dependency>
<dependency>
    <groupId>org.apache.logging.log4j</groupId>
    <artifactId>log4j-core</artifactId>
    <version>${log4j2.api.version}</version>
</dependency>
```

## log4j-test.xml

日志输出配置

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration status="off" monitorInterval="1800">
    <properties>
        <property name="LOG_HOME">${sys:user.home}/logs/log4j2/mongodb</property>
    </properties>

    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d{yyyy-MM-dd HH:mm:ss.SSS}  %-5level [%t] %logger{36}:%L - %msg%n"/>
        </Console>
    </Appenders>

    <Loggers>
        <Root level="DEBUG">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>

</Configuration>
```

## 测试代码

```java
package base;

import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import com.mongodb.client.FindIterable;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.bson.Document;
import org.junit.Test;

import java.util.ArrayList;
import java.util.List;

/**
 *
 * MonogoDB 基础测试
 * @author houbinbin
 * @version 1.0
 * @on 2017/6/10
 * @since 1.7
 */
public class MongoDBTest {

    private Logger LOG = LogManager.getLogger(MongoDBTest.class);

    @Test
    public void connectionTest() {
        LOG.info("Start to connection.");
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);

        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");
    }

    @Test
    public void connectionWithPwdTest() {
        //连接到MongoDB服务 如果是远程连接可以替换“localhost”为服务器所在IP地址
        //ServerAddress()两个参数分别为 服务器地址 和 端口
        ServerAddress serverAddress = new ServerAddress("localhost", 27017);
        List<ServerAddress> addrs = new ArrayList<ServerAddress>();
        addrs.add(serverAddress);

        //MongoCredential.createScramSha1Credential()三个参数分别为 用户名 数据库名称 密码
        MongoCredential credential = MongoCredential.createScramSha1Credential("username", "databaseName", "password".toCharArray());
        List<MongoCredential> credentials = new ArrayList<>();
        credentials.add(credential);

        //通过连接认证获取MongoDB连接
        MongoClient mongoClient = new MongoClient(addrs, credentials);

        //连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("databaseName");
        System.out.println("Connect to database successfully");
    }


    @Test
    public void createCollectionTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);


        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");
        mongoDatabase.createCollection("mongodb");
        LOG.info("create collection success!");
    }


    @Test
    public void getCollectionTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);


        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");
        MongoCollection<Document> documentMongoCollection = mongoDatabase.getCollection("mongodb");
        LOG.info("get collection success!");
    }

    @Test
    public void insertDocumentTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);

        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");

        MongoCollection<Document> collection = mongoDatabase.getCollection("mongodb");
        LOG.info("集合 mongodb 选择成功");

        /**
         * 1. 创建文档 org.bson.Document 参数为key-value的格式
         * 2. 创建文档集合List<Document>
         * 3. 将文档集合插入数据库集合中 mongoCollection.insertMany(List<Document>) 插入单个文档可以用 mongoCollection.insertOne(Document)
         * */
        Document document = new Document("title", "MongoDB").
                append("description", "database").
                append("likes", 100).
                append("by", "Fly");
        List<Document> documents = new ArrayList<Document>();
        documents.add(document);
        collection.insertMany(documents);
        LOG.info("文档插入成功");
    }


    @Test
    public void findDocumentTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);

        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");

        MongoCollection<Document> collection = mongoDatabase.getCollection("mongodb");
        LOG.info("集合 mongodb 选择成功");

        //检索所有文档
        /**
         * 1. 获取迭代器FindIterable<Document>
         * 2. 获取游标MongoCursor<Document>
         * 3. 通过游标遍历检索出的文档集合
         * */
        FindIterable<Document> findIterable = collection.find();
        MongoCursor<Document> mongoCursor = findIterable.iterator();
        while (mongoCursor.hasNext()) {
            LOG.info(mongoCursor.next());
        }
    }


    @Test
    public void updateDocumentTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);

        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");

        MongoCollection<Document> collection = mongoDatabase.getCollection("mongodb");
        LOG.info("集合 mongodb 选择成功");


        //更新文档   将文档中likes=100的文档修改为likes=200
        collection.updateMany(Filters.eq("likes", 100), new Document("$set",new Document("likes",200)));
        //检索查看结果
        FindIterable<Document> findIterable = collection.find();
        MongoCursor<Document> mongoCursor = findIterable.iterator();
        while(mongoCursor.hasNext()){
            LOG.info(mongoCursor.next());
        }
    }

    @Test
    public void removeDocumentTest() {
        // 连接到 mongodb 服务
        MongoClient mongoClient = new MongoClient("localhost", 27017);

        // 连接到数据库
        MongoDatabase mongoDatabase = mongoClient.getDatabase("col");
        LOG.info("Connect to database successfully");

        MongoCollection<Document> collection = mongoDatabase.getCollection("mongodb");
        LOG.info("集合 mongodb 选择成功");

        //删除符合条件的第一个文档
        collection.deleteOne(Filters.eq("likes", 200));
        //删除所有符合条件的文档
//        collection.deleteMany (Filters.eq("likes", 200));

        //检索查看结果
        FindIterable<Document> findIterable = collection.find();
        MongoCursor<Document> mongoCursor = findIterable.iterator();
        while(mongoCursor.hasNext()){
            LOG.info(mongoCursor.next());
        }
    }
}
```

- connectionTest() 运行日志

```
2017-05-31 09:45:10.084  INFO  [main] base.MongoDBTest:34 - Start to connection.
May 21, 2017 9:45:10 AM com.mongodb.diagnostics.logging.JULLogger log
信息: Cluster created with settings {hosts=[localhost:27017], mode=SINGLE, requiredClusterType=UNKNOWN, serverSelectionTimeout='30000 ms', maxWaitQueueSize=500}
2017-05-31 09:45:10.400  INFO  [main] base.MongoDBTest:40 - Connect to database successfully
```

* any list
{:toc}

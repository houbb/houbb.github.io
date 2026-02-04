---
layout: post
title: 向量数据库 milvus 入门-17-实战入门例子
date: 2026-01-16 21:01:55 +0800
categories: [Database]
tags: [ai, memgraph, sh]
published: true
---

# 数据库服务端

本地使用 docker 测试

```
docker ps
CONTAINER ID   IMAGE                                      COMMAND                   CREATED      STATUS                       PORTS                                                                                          NAMES
2d2e75a29937   zilliz/attu:v2.6.3                         "docker-entrypoint.s…"   5 days ago   Up About an hour             0.0.0.0:3000->3000/tcp, [::]:3000->3000/tcp                                                    attu
78fa9d4794db   milvusdb/milvus:v2.6.9                     "/tini -- milvus run…"   5 days ago   Up About an hour (healthy)   0.0.0.0:9091->9091/tcp, [::]:9091->9091/tcp, 0.0.0.0:19530->19530/tcp, [::]:19530->19530/tcp   milvus-standalone
39ddccd453ca   minio/minio:RELEASE.2024-12-18T13-15-44Z   "/usr/bin/docker-ent…"   5 days ago   Up About an hour (healthy)   0.0.0.0:9000-9001->9000-9001/tcp, [::]:9000-9001->9000-9001/tcp                                milvus-minio
09ddcb5fa334   quay.io/coreos/etcd:v3.5.25                "etcd -advertise-cli…"   5 days ago   Up About an hour (healthy)   2379-2380/tcp                                                                                  milvus-etcd
```

# 测试

## maven 

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>embed-milvus-demo</artifactId>
    <version>1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>io.milvus</groupId>
            <artifactId>milvus-sdk-java</artifactId>
            <version>2.6.13</version>
        </dependency>

        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.9</version>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>11</source>
                    <target>11</target>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>exec-maven-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <mainClass>com.example.MilvusExample</mainClass>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

## 配置类

这个测试下来，还是要用 localhost，其他的 docker ip 、镜像全部测试失败。

```java
package com.example.config;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DescribeDatabaseReq;
import io.milvus.v2.service.database.response.DescribeDatabaseResp;
import io.milvus.v2.service.database.response.ListDatabasesResp;

public class MilvusConfig {
//    private static final String HOST = "172.18.0.4";
    private static final String HOST = "localhost";
    private static final int PORT = 19530;
    private static final String TOKEN = "root:Milvus";

    public static MilvusClientV2 createClient() {
        System.out.println("========================================");
        System.out.println("[MilvusConfig] 开始创建Milvus v2客户端连接");
        System.out.println("[MilvusConfig] 连接配置:");
        System.out.println("  - URI: http://" + HOST + ":" + PORT);
        System.out.println("  - Token: " + TOKEN);
        System.out.println("========================================");
        
        try {
            String uri = "http://" + HOST + ":" + PORT;
            ConnectConfig connectConfig = ConnectConfig.builder()
                    .uri(uri)
                    .token(TOKEN)
                    .build();
            
            System.out.println("[MilvusConfig] 连接参数配置完成，正在创建v2客户端...");
            MilvusClientV2 client = new MilvusClientV2(connectConfig);
            System.out.println("[MilvusConfig] Milvus v2客户端创建成功");

            ListDatabasesResp listDatabasesResp = client.listDatabases();

            // 默认数据库
            DescribeDatabaseResp descDBResp = client.describeDatabase(DescribeDatabaseReq.builder()
                    .databaseName("default")
                    .build());

            return client;
        } catch (Exception e) {
            System.err.println("[MilvusConfig] 创建Milvus v2客户端失败");
            System.err.println("[MilvusConfig] 错误类型: " + e.getClass().getName());
            System.err.println("[MilvusConfig] 错误信息: " + e.getMessage());
            System.err.println("[MilvusConfig] 请检查:");
            System.err.println("  1. Milvus服务是否已启动");
            System.err.println("  2. URI地址是否正确: http://" + HOST + ":" + PORT);
            System.err.println("  3. Token是否正确");
            System.err.println("  4. 网络连接是否正常");
            System.err.println("  5. 防火墙是否阻止连接");
            System.err.println("========================================");
            throw new RuntimeException("无法连接到Milvus服务: " + e.getMessage(), e);
        }
    }
}
```

## 文本向量化

你可以用大模型，这里简单起见直接让大模型帮我生成

```java
package com.example.model;

import java.util.Arrays;
import java.util.List;

public class TextEmbedding {
    private String text;
    private List<Float> embedding;

    public TextEmbedding(String text, List<Float> embedding) {
        this.text = text;
        this.embedding = embedding;
    }

    public String getText() {
        return text;
    }

    public List<Float> getEmbedding() {
        return embedding;
    }

    public static List<TextEmbedding> getSampleEmbeddings() {
        return Arrays.asList(
            new TextEmbedding("人工智能是计算机科学的一个分支", Arrays.asList(
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f
            )),
            new TextEmbedding("机器学习是人工智能的核心技术", Arrays.asList(
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f
            )),
            new TextEmbedding("深度学习是机器学习的一个重要分支", Arrays.asList(
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f
            )),
            new TextEmbedding("自然语言处理是人工智能的重要应用领域", Arrays.asList(
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f,
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f,
                0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f, 0.7890f, -0.8901f,
                0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f, 0.5678f, -0.6789f,
                0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f, 0.3456f, -0.4567f
            )),
            new TextEmbedding("向量数据库用于存储和检索高维向量", Arrays.asList(
                0.5678f, -0.6789f, 0.7890f, -0.8901f, 0.9012f, -0.0123f, 0.1234f, -0.2345f,
                0.3456f, -0.4567f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f,
                0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f,
                0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f, 0.0123f, -0.1234f,
                0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f, 0.8901f, -0.9012f,
                0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f, 0.6789f, -0.7890f,
                0.8901f, -0.9012f, 0.0123f, -0.1234f, 0.2345f, -0.3456f, 0.4567f, -0.5678f
            ))
        );
    }
}
```

## 测试类

```java
package com.example;

import com.example.config.MilvusConfig;
import com.example.model.TextEmbedding;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.*;
import io.milvus.v2.service.collection.response.*;
import io.milvus.v2.service.index.request.CreateIndexReq;
import io.milvus.v2.service.vector.request.*;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.*;

import java.util.*;

public class MilvusExample {

    private static final String COLLECTION_NAME = "text_collection";
    private static final int DIMENSION = 360;
    private static final int MAX_RETRY_TIMES = 3;
    private static final long RETRY_INTERVAL_MS = 2000;

    public static void main(String[] args) {
        System.out.println("========================================");
        System.out.println("Milvus示例程序开始执行");
        System.out.println("========================================");
        
        MilvusClientV2 milvusClient = MilvusConfig.createClient();
        System.out.println("成功连接到Milvus服务");

        try {
            checkMilvusHealth(milvusClient);
            dropCollectionIfExists(milvusClient);
            createCollection(milvusClient);
            createIndex(milvusClient);
            loadCollection(milvusClient);
            insertData(milvusClient);
            searchData(milvusClient);
            
            System.out.println("========================================");
            System.out.println("Milvus示例程序执行完成");
            System.out.println("========================================");
        } catch (Exception e) {
            System.err.println("程序执行过程中发生异常: " + e.getMessage());
            e.printStackTrace();
        } finally {
            System.out.println("正在关闭Milvus客户端连接...");
            milvusClient.close();
            System.out.println("Milvus客户端连接已关闭");
        }
    }

    private static void checkMilvusHealth(MilvusClientV2 client) {
        System.out.println("\n[checkMilvusHealth] 开始检查Milvus服务健康状态...");
        
        int retryCount = 0;
        while (retryCount < MAX_RETRY_TIMES) {
            try {
                ListCollectionsResp resp = client.listCollections();
                
                System.out.println("[checkMilvusHealth] Milvus服务健康检查通过");
                System.out.println("[checkMilvusHealth] 当前collection数量: " + resp.getCollectionNames().size());
                System.out.println("[checkMilvusHealth] 方法执行完成");
                return;
            } catch (Exception e) {
                System.err.println("[checkMilvusHealth] 健康检查失败 (尝试 " + (retryCount + 1) + "/" + MAX_RETRY_TIMES + "): " + e.getMessage());
            }
            
            retryCount++;
            if (retryCount < MAX_RETRY_TIMES) {
                System.out.println("[checkMilvusHealth] 等待 " + RETRY_INTERVAL_MS + "ms 后重试...");
                try {
                    Thread.sleep(RETRY_INTERVAL_MS);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("健康检查被中断", ie);
                }
            }
        }
        
        throw new RuntimeException("Milvus服务健康检查失败，请检查服务状态");
    }

    private static void dropCollectionIfExists(MilvusClientV2 client) {
        System.out.println("\n[dropCollectionIfExists] 开始检查并删除已存在的collection...");
        
        try {
            ListCollectionsResp resp = client.listCollections();
            
            if (resp.getCollectionNames().contains(COLLECTION_NAME)) {
                System.out.println("[dropCollectionIfExists] 发现已存在的collection: " + COLLECTION_NAME);
                
                DropCollectionReq dropReq = DropCollectionReq.builder()
                        .collectionName(COLLECTION_NAME)
                        .build();
                client.dropCollection(dropReq);
                
                System.out.println("[dropCollectionIfExists] 成功删除collection: " + COLLECTION_NAME);
            } else {
                System.out.println("[dropCollectionIfExists] collection不存在，无需删除");
            }
        } catch (Exception e) {
            System.err.println("[dropCollectionIfExists] 删除collection时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[dropCollectionIfExists] 方法执行完成");
    }

    private static void createCollection(MilvusClientV2 client) {
        System.out.println("\n[createCollection] 开始创建collection...");
        
        try {
            CreateCollectionReq.CollectionSchema schema = client.createSchema();

            schema.addField(AddFieldReq.builder()
                    .fieldName("id")
                    .dataType(DataType.Int64)
                    .isPrimaryKey(true)
                    .autoID(true)
                    .build());

            schema.addField(AddFieldReq.builder()
                    .fieldName("text")
                    .dataType(DataType.VarChar)
                    .maxLength(255)
                    .build());

            schema.addField(AddFieldReq.builder()
                    .fieldName("embedding")
                    .dataType(DataType.FloatVector)
                    .dimension(DIMENSION)
                    .build());

            System.out.println("[createCollection] 字段schema定义完成，包含3个字段: id, text, embedding");

            CreateCollectionReq request = CreateCollectionReq.builder()
                    .collectionName(COLLECTION_NAME)
                    .collectionSchema(schema)
                    .build();

            client.createCollection(request);
            System.out.println("[createCollection] 成功创建collection: " + COLLECTION_NAME);
        } catch (Exception e) {
            System.err.println("[createCollection] 创建collection时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[createCollection] 方法执行完成");
    }

    private static void createIndex(MilvusClientV2 client) {
        System.out.println("\n[createIndex] 开始创建索引...");
        
        try {
            IndexParam indexParam = IndexParam.builder()
                    .fieldName("embedding")
                    .indexType(IndexParam.IndexType.IVF_FLAT)
                    .metricType(IndexParam.MetricType.L2)
                    .build();

            CreateIndexReq request = CreateIndexReq.builder()
                    .collectionName(COLLECTION_NAME)
                    .indexParams(Collections.singletonList(indexParam))
                    .build();

            System.out.println("[createIndex] 索引类型: IVF_FLAT, 度量类型: L2");
            
            client.createIndex(request);
            System.out.println("[createIndex] 成功创建索引");
        } catch (Exception e) {
            System.err.println("[createIndex] 创建索引时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[createIndex] 方法执行完成");
    }

    private static void loadCollection(MilvusClientV2 client) {
        System.out.println("\n[loadCollection] 开始加载collection到内存...");
        
        try {
            LoadCollectionReq request = LoadCollectionReq.builder()
                    .collectionName(COLLECTION_NAME)
                    .build();

            client.loadCollection(request);
            System.out.println("[loadCollection] 成功加载collection到内存");
        } catch (Exception e) {
            System.err.println("[loadCollection] 加载collection时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[loadCollection] 方法执行完成");
    }

    private static void insertData(MilvusClientV2 client) {
        System.out.println("\n[insertData] 开始插入数据...");
        
        try {
            List<TextEmbedding> embeddings = TextEmbedding.getSampleEmbeddings();
            System.out.println("[insertData] 准备插入 " + embeddings.size() + " 条文本向量数据");
            
            Gson gson = new Gson();
            List<JsonObject> data = new ArrayList<>();
            
            for (int i = 0; i < embeddings.size(); i++) {
                TextEmbedding embedding = embeddings.get(i);
                JsonObject json = new JsonObject();
                json.addProperty("text", embedding.getText());
                json.add("embedding", gson.toJsonTree(embedding.getEmbedding()));
                data.add(json);
                System.out.println("[insertData] 准备第 " + (i + 1) + " 条数据: " + embedding.getText());
            }

            InsertReq request = InsertReq.builder()
                    .collectionName(COLLECTION_NAME)
                    .data(data)
                    .build();

            System.out.println("[insertData] 正在向Milvus插入数据...");
            client.insert(request);
            System.out.println("[insertData] 成功插入 " + embeddings.size() + " 条数据");
            
            System.out.println("[insertData] 等待索引构建完成...");
            try {
                Thread.sleep(3000);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                System.err.println("[insertData] 等待被中断");
            }
            System.out.println("[insertData] 索引构建等待完成");
        } catch (Exception e) {
            System.err.println("[insertData] 插入数据时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[insertData] 方法执行完成");
    }

    private static void searchData(MilvusClientV2 client) {
        System.out.println("\n[searchData] 开始执行向量搜索...");
        
        try {
            List<TextEmbedding> embeddings = TextEmbedding.getSampleEmbeddings();
            List<Float> queryVector = embeddings.get(0).getEmbedding();
            String queryText = embeddings.get(0).getText();
            
            System.out.println("[searchData] 查询文本: " + queryText);
            System.out.println("[searchData] 查询向量维度: " + queryVector.size());
            System.out.println("[searchData] 返回最相似的 TopK: 3");

            float[] floatArray = new float[queryVector.size()];
            for (int i = 0; i < queryVector.size(); i++) {
                floatArray[i] = queryVector.get(i);
            }
            FloatVec floatVec = new FloatVec(floatArray);
            SearchReq request = SearchReq.builder()
                    .collectionName(COLLECTION_NAME)
                    .data(Collections.singletonList(floatVec))
                    .annsField("embedding")
                    .topK(3)
                    .outputFields(Arrays.asList("text"))
                    .build();

            System.out.println("[searchData] 正在执行搜索...");
            SearchResp response = client.search(request);

            System.out.println("[searchData] 搜索成功，开始解析结果...");
            System.out.println("\n========== 搜索结果 ==========");
            
            List<List<SearchResp.SearchResult>> searchResults = response.getSearchResults();
            for (List<SearchResp.SearchResult> results : searchResults) {
                System.out.println("TopK results:");
                for (int i = 0; i < results.size(); i++) {
                    SearchResp.SearchResult result = results.get(i);
                    float score = result.getScore();
                    Map<String, Object> fields = result.getEntity();
                    String text = (String) fields.get("text");
                    System.out.println("排名 " + (i + 1) + " - 相似度: " + score + ", 文本: " + text);
                }
            }
            System.out.println("================================\n");
        } catch (Exception e) {
            System.err.println("[searchData] 搜索时发生异常: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
        
        System.out.println("[searchData] 方法执行完成");
    }
}
```

## 测试日志

```
========================================
Milvus示例程序开始执行
========================================
========================================
[MilvusConfig] 开始创建Milvus v2客户端连接
[MilvusConfig] 连接配置:
  - URI: http://localhost:19530
  - Token: root:Milvus
========================================
[MilvusConfig] 连接参数配置完成，正在创建v2客户端...
[MilvusConfig] Milvus v2客户端创建成功
成功连接到Milvus服务

[checkMilvusHealth] 开始检查Milvus服务健康状态...
[checkMilvusHealth] Milvus服务健康检查通过
[checkMilvusHealth] 当前collection数量: 2
[checkMilvusHealth] 方法执行完成

[dropCollectionIfExists] 开始检查并删除已存在的collection...
[dropCollectionIfExists] 发现已存在的collection: text_collection
[dropCollectionIfExists] 成功删除collection: text_collection
[dropCollectionIfExists] 方法执行完成

[createCollection] 开始创建collection...
[createCollection] 字段schema定义完成，包含3个字段: id, text, embedding
[createCollection] 成功创建collection: text_collection
[createCollection] 方法执行完成

[createIndex] 开始创建索引...
[createIndex] 索引类型: IVF_FLAT, 度量类型: L2
[createIndex] 成功创建索引
[createIndex] 方法执行完成

[loadCollection] 开始加载collection到内存...
[loadCollection] 成功加载collection到内存
[loadCollection] 方法执行完成

[insertData] 开始插入数据...
[insertData] 准备插入 5 条文本向量数据
[insertData] 准备第 1 条数据: 人工智能是计算机科学的一个分支
[insertData] 准备第 2 条数据: 机器学习是人工智能的核心技术
[insertData] 准备第 3 条数据: 深度学习是机器学习的一个重要分支
[insertData] 准备第 4 条数据: 自然语言处理是人工智能的重要应用领域
[insertData] 准备第 5 条数据: 向量数据库用于存储和检索高维向量
[insertData] 正在向Milvus插入数据...
[insertData] 成功插入 5 条数据
[insertData] 等待索引构建完成...
[insertData] 索引构建等待完成
[insertData] 方法执行完成

[searchData] 开始执行向量搜索...
[searchData] 查询文本: 人工智能是计算机科学的一个分支
[searchData] 查询向量维度: 360
[searchData] 返回最相似的 TopK: 3
[searchData] 正在执行搜索...
[searchData] 搜索成功，开始解析结果...

========== 搜索结果 ==========
TopK results:
排名 1 - 相似度: 0.0, 文本: 人工智能是计算机科学的一个分支
排名 2 - 相似度: 31.920082, 文本: 机器学习是人工智能的核心技术
排名 3 - 相似度: 62.22575, 文本: 深度学习是机器学习的一个重要分支
================================

[searchData] 方法执行完成
========================================
Milvus示例程序执行完成
========================================
正在关闭Milvus客户端连接...
Milvus客户端连接已关闭
```

补充：我们使用的是 L2（欧几里得）距离 作为度量标准，所以 0.0 代表完全相似。

# 参考资料

https://milvus.io/docs/zh/glossary.md

* any list
{:toc}
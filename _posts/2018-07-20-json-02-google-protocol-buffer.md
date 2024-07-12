---
layout: post
title:  Google Protocol Buffer
date:  2018-07-20 09:24:03 +0800
categories: [Tool]
tags: [tool, json, xml]
published: true
---

# Google Protocol Buffer

[Protocol Buffers](https://github.com/google/protobuf) 是 Google 的一种语言无关、平台无关的可扩展机制，用于序列化结构化数据。

## 优点

protobuf是google提供的一个开源序列化框架，类似于XML，JSON这样的数据表示语言，其最大的特点是基于二进制，因此比统的 XML表示高效短小得多。

虽然是二进制数据格式，但并没有因此变得复杂，可以很方便的对其基于二进制的协议进行扩展，且很方便的能让新版本的协议兼容老的版本。

如果说xml太臃肿，json易解析，比xml更高效，易扩展，那么protobuf可以说相对于json更高效，更易扩展，而且协议的保密性更强。

并且protobuf是跨语言的，可以支持c(c++),java，python等主流言，非常方便大系统的设计。

protobuf号称也有service，可以基于其service的接口和回调，来完成客户端和服务器的逻辑但是，目前版本service还仅仅停留在接口层，其底层的通讯，还需要自己实现，这点确实远不如thrift完备。

# Google Protocol Buffer 入门案例

以下是一个简单的 Google Protocol Buffer 使用案例：

## Maven 依赖

添加依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.google.protobuf</groupId>
        <artifactId>protobuf-java</artifactId>
        <version>3.21.0</version> <!-- 请使用最新版本 -->
    </dependency>
    <dependency>
        <groupId>com.google.protobuf</groupId>
        <artifactId>protobuf-java-util</artifactId>
        <version>3.21.0</version> <!-- 请使用最新版本 -->
    </dependency>
</dependencies>
```

## 创建 `.proto` 文件

创建一个名为 `example.proto` 的文件，定义你的数据结构：

```proto
syntax = "proto3";

package example;

// 定义消息
message Person {
    string name = 1;
    int32 id = 2;
    string email = 3;
}
```

## 编译 `.proto` 文件

使用 `protoc` 编译器生成 Java 代码：

```bash
protoc --java_out=src/main/java example.proto
```

## 使用示例

以下是一个简单的 Java 示例，展示如何使用生成的代码：

```java
import example.Person;

public class Main {
    public static void main(String[] args) {
        // 创建一个 Person 实例
        Person person = Person.newBuilder()
                .setName("Alice")
                .setId(1234)
                .setEmail("alice@example.com")
                .build();

        // 序列化为字节数组
        byte[] bytes = person.toByteArray();

        // 反序列化
        try {
            Person deserializedPerson = Person.parseFrom(bytes);
            System.out.println("Name: " + deserializedPerson.getName());
            System.out.println("ID: " + deserializedPerson.getId());
            System.out.println("Email: " + deserializedPerson.getEmail());
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

# json 系列

## 字符串

[DSL-JSON 最快的 java 实现](https://houbb.github.io/2018/07/20/json-01-dsl-json)

[Ali-FastJson](https://houbb.github.io/2018/07/20/json-01-fastjson)

[Google-Gson](https://houbb.github.io/2018/07/20/json-01-gson)

[Jackson](https://houbb.github.io/2018/07/20/json-01-jackson)

## 二进制

[Google protocol buffer](https://houbb.github.io/2018/07/20/json-02-google-protocol-buffer)

[Apache Thrift](https://houbb.github.io/2018/09/20/json-02-apache-thirft)

[Hession](https://houbb.github.io/2018/07/20/json-02-hession)

[Kryo](https://houbb.github.io/2018/07/20/json-02-kryo)

[Fst](https://houbb.github.io/2018/07/20/json-01-fst)

[Messagepack](https://houbb.github.io/2018/07/20/json-02-messagepack)

[Jboss Marshaling](https://houbb.github.io/2018/07/20/json-02-jboss-marshaling)

## 其他

[JsonPath](https://houbb.github.io/2018/07/20/json-03-jsonpath)

[JsonIter](https://houbb.github.io/2018/07/20/json-01-jsoniter)


# 参考资料

[原理解密](http://blog.csdn.net/carson_ho/article/details/70568606)

http://bijian1013.iteye.com/blog/2232207

* any list
{:toc}


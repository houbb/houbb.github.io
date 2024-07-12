---
layout: post
title:  Json 之 Jackson
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# jackson 入门例子

简单的 Jackson 入门示例

### Maven 依赖

添加 Jackson 依赖：

```xml
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
    <version>2.15.0</version>
</dependency>
```

### 示例代码

下面是一个简单的示例，演示如何使用 Jackson 将 Java 对象转换为 JSON 字符串，以及如何将 JSON 字符串解析为 Java 对象。

#### Java 对象转 JSON 字符串

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonExample {
    public static void main(String[] args) {
        // 创建一个示例对象
        User user = new User();
        user.setId(1);
        user.setName("Alice");
        user.setEmail("alice@example.com");

        // 创建 ObjectMapper 实例
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // 将对象转换为 JSON 字符串
            String jsonString = objectMapper.writeValueAsString(user);
            System.out.println("JSON String: " + jsonString);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }
}

class User {
    private int id;
    private String name;
    private String email;

    // Getter and Setter methods
}
```

#### JSON 字符串转 Java 对象

```java
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

public class JacksonExample {
    public static void main(String[] args) {
        // JSON 字符串
        String jsonString = "{\"id\":1,\"name\":\"Alice\",\"email\":\"alice@example.com\"}";

        // 创建 ObjectMapper 实例
        ObjectMapper objectMapper = new ObjectMapper();

        try {
            // 将 JSON 字符串解析为对象
            User user = objectMapper.readValue(jsonString, User.class);
            System.out.println("User ID: " + user.getId());
            System.out.println("User Name: " + user.getName());
            System.out.println("User Email: " + user.getEmail());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }
}

class User {
    private int id;
    private String name;
    private String email;

    // Getter and Setter methods
}
```

以上示例展示了如何使用 Jackson 将 Java 对象转换为 JSON 字符串以及将 JSON 字符串解析为 Java 对象。

# jackson

[jackson](https://github.com/FasterXML/jackson) 是一个用于 Java（以及 JVM 平台）的数据处理工具套件，包括旗舰流 JSON 解析器/生成器库、匹配的数据绑定库（POJOs 到 JSON 以及从 JSON 到 POJOs），以及附加的数据格式模块，用于处理 Avro、BSON、CBOR、CSV、Smile、（Java）Properties、Protobuf、XML 或 YAML 编码的数据；甚至还有大量的数据格式模块，用于支持广泛使用的数据类型，如 Guava、Joda、PCollections 等等（见下文）。

## 个人感受

支持多种格式，多种语言（JVM），甚至其他常见框架。

比如 Guava/Joda/PCollections

换言之，这些工具也值得学习。所有的格式也应该值得学习。

## 核心组成部分

虽然实际的核心组件都在各自的项目中——包括三个核心包（流、数据绑定、注解）；

数据格式库；数据类型库；JAX-RS 提供者；以及其他扩展模块的杂项集合——这个项目作为连接所有部分的中心枢纽。

## 核心模块

核心模块是扩展（模块）构建的基础。

目前（Jackson 2.x）有三个这样的模块：

- 流（docs）("jackson-core") 定义低级流 API，并包括特定于 JSON 的实现。
- 注解（docs）("jackson-annotations") 包含标准的 Jackson 注解。
- 数据绑定（docs）("jackson-databind") 在流包上实现数据绑定（和对象序列化）支持；它依赖于流和注解包。

### 个人感受

实际上这三个部分是互相独立的。所以可以各自发展。

这个框架将三者结合起来，形成一个序列化的框架。

## 数据类型模块支持

支持多种第三方格式类型。

Jackson 团队直接维护的数据类型模块在以下 GitHub 仓库中：

### 标准集合类型

- Guava: 支持许多 Guava 数据类型。
- HPPC: 支持高性能原始容器。
- PCollections: 支持 PCollections 数据类型（Jackson 2.7 中新增！）

### 其他框架

- Hibernate: 支持 Hibernate 特性（延迟加载、代理）。
- Joda: 支持 Joda 日期/时间库的数据类型。

### JDK

- JDK7: 支持 JDK 7 中包含但以前版本不包含的数据类型。
  在 2.7 中弃用，因为基线 JDK 变为 7，支持将包含在 jackson-databind 中。
- Java 8 模块: 通过三个独立模块支持 JDK 8 的功能和数据类型。

### JSON 相关

- JSR-353: 支持“Java JSON API”类型（特别是其树模型对象）。
- org.json: 支持“org.json JSON lib”类型，如 JSONObject、JSONArray。

## JAX-RS 支持

Jackson JAX-RS 提供者有处理程序来为 JAX-RS 实现（如 Jersey、RESTeasy、CXF）添加数据格式支持。

提供者实现了 MessageBodyReader 和 MessageBodyWriter。

当前支持的格式包括 JSON、Smile、XML、YAML 和 CBOR。

## 数据格式模块

支持多种常见格式：

- Avro: 支持 Avro 数据格式，具有流实现以及对 Avro Schema 的附加数据绑定支持。
- CBOR: 支持 CBOR 数据格式（一种二进制 JSON 变体）。
- CSV: 支持逗号分隔值格式——流 API，可选的便捷数据绑定附加。
- Ion (Jackson 2.9 新增！): 支持 Amazon Ion 二进制数据格式（类似于 CBOR、Smile，即二进制 JSON）。
- (Java) Properties (2.8): 从隐含的符号（默认点符号，可配置）创建嵌套结构，在序列化时类似地展平。
- Protobuf (2.6): 支持类似于 Avro。
- Smile: 支持 Smile（二进制 JSON）——通过流 API 实现 100% 的 API/逻辑模型兼容性，数据绑定无变化。
- XML: 支持 XML；提供流和数据绑定实现。类似于 JAXB 的“代码优先”模式（不支持“XML Schema 优先”，但可以使用 JAXB beans）。
- YAML: 支持 YAML，由于其与 JSON 类似，通过简单的流实现完全支持。

## 小结

Jackson 支持大量丰富的数据类型和数据格式，侧重点在于丰富的支持。

要完成类似的框架，需要付出大量的时间。

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


* any list
{:toc}
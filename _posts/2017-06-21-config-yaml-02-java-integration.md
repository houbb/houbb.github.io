---
layout: post
title: YAML-02-yml 配置文件 java 整合使用  yamlbeans + snakeyaml + jackson-dataformat-yaml
date:  2017-06-21 13:59:45 +0800
categories: [Config]
tags: [yaml, config]
published: true
---

# 拓展阅读

[config 配置方式概览-8 种配置文件介绍对比 xml/json/proeprties/ini/yaml/TOML/hcl/hocon](https://houbb.github.io/2017/06/21/config-00-overivew)

[config HCL（HashiCorp Configuration Language） 配置文件介绍](https://houbb.github.io/2017/06/21/config-hcl-01-intro)

[config HCL（HashiCorp Configuration Language） 官方文档翻译](https://houbb.github.io/2017/06/21/config-hcl-02-doc)

[config HOCON（Human-Optimized Config Object Notation）配置文件介绍](https://houbb.github.io/2017/06/21/config-hocon-01-intro)

[config ini 配置文件介绍](https://houbb.github.io/2017/06/21/config-ini-01-intro)

[config properties 配置文件介绍](https://houbb.github.io/2017/06/21/config-properties-01-intro)

[toml-01-toml 配置文件介绍](https://houbb.github.io/2017/06/21/config-toml-01-overview)

[XStream java 实现 xml 与对象 pojo 之间的转换](https://houbb.github.io/2017/06/21/config-xml-XStream-intro)

[java 实现 xml 与对象 pojo 之间的转换的几种方式 dom4j/xstream/jackson](https://houbb.github.io/2017/06/21/config-xml-to-pojo)

[YAML-01-yml 配置文件介绍](https://houbb.github.io/2017/06/21/config-yaml-01-intro)

[YAML-02-yml 配置文件 java 整合使用 yamlbeans + snakeyaml + jackson-dataformat-yaml](https://houbb.github.io/2017/06/21/config-yaml-02-java-integration)

[YAML-03-yml 配置文件介绍官方文档翻译](https://houbb.github.io/2017/06/21/config-yaml-03-doc)

[json 专题系列](https://houbb.github.io/2018/07/20/json-00-overview)

# java 中处理 yml 的开源组件是什么？

在Java中处理YAML（YAML Ain't Markup Language）格式的开源组件有很多，其中一些比较常用的包括：

1. **SnakeYAML：** SnakeYAML 是一个Java库，用于解析和生成YAML格式的数据。它支持YAML 1.1规范，并提供了一个简单易用的API，用于在Java应用程序中处理YAML数据。

   GitHub 地址：[https://bitbucket.org/asomov/snakeyaml](https://bitbucket.org/asomov/snakeyaml)

   Maven依赖：
   ```xml
   <dependency>
       <groupId>org.yaml</groupId>
       <artifactId>snakeyaml</artifactId>
       <version>1.29</version> 
   </dependency>
   ```

2. **Jackson YAML：** Jackson是一个流行的Java JSON处理库，它也提供了对YAML格式的支持。Jackson YAML模块允许你在Java对象和YAML之间进行转换。

   GitHub 地址：[https://github.com/FasterXML/jackson-dataformats-text](https://github.com/FasterXML/jackson-dataformats-text)

   Maven依赖：
   ```xml
   <dependency>
       <groupId>com.fasterxml.jackson.dataformat</groupId>
       <artifactId>jackson-dataformat-yaml</artifactId>
       <version>2.13.0</version> 
   </dependency>
   ```

3. **YAMLBeans：** YAMLBeans 是一个轻量级的Java库，用于将Java对象与YAML数据进行互相转换。它提供了简单的API，使得YAML数据的读写变得容易。

   GitHub 地址：[https://github.com/EsotericSoftware/yamlbeans](https://github.com/EsotericSoftware/yamlbeans)

   Maven依赖：
   ```xml
   <dependency>
       <groupId>net.sourceforge.yamlbeans</groupId>
       <artifactId>yamlbeans</artifactId>
       <version>1.14</version> 
   </dependency>
   ```

这些开源库都提供了方便的方式来处理YAML格式的数据，你可以根据自己的需求选择其中一个进行使用。

# 对比表格

以下是SnakeYAML、Jackson YAML和YAMLBeans这三个Java中处理YAML格式的开源组件的对比表格：

| 特点 | SnakeYAML | Jackson YAML | YAMLBeans |
| --- | --- | --- | --- |
| **简单易用性** | 易用，提供简洁的API | 易用，与Jackson库集成，熟悉Jackson的用户可以方便使用 | 易用，提供简单的API |
| **性能** | 相对较慢 | 较快，性能较高 | 相对较慢 |
| **功能丰富性** | 中等，支持基本的YAML 1.1规范 | 高，支持丰富的特性，包括多文档处理、自定义类型等 | 低，功能较为基础 |
| **扩展性** | 中等，支持自定义标签和类型处理 | 高，支持自定义序列化和反序列化逻辑 | 低，较难扩展 |
| **与Java对象的绑定** | 易用，支持Java对象与YAML数据的转换 | 易用，通过Jackson库支持Java对象与YAML数据的转换 | 易用，支持Java对象与YAML数据的转换 |
| **流行度和社区支持** | 相对较高，有活跃的社区和用户群 | 非常高，Jackson是非常流行的Java JSON处理库之一 | 相对较低，较小的社区支持 |

选择使用哪个库取决于你的具体需求。如果你需要一个简单易用、轻量级的库，SnakeYAML是一个不错的选择。

如果你希望拥有更高的性能和丰富的特性，同时也需要支持JSON和其他数据格式，那么Jackson YAML是一个强大的工具。

如果你只需要基本的YAML处理功能，并且希望使用简单的API，YAMLBeans可以满足你的需求。

# SnakeYAML

## maven

```xml
<dependency>
    <groupId>org.yaml</groupId>
    <artifactId>snakeyaml</artifactId>
    <version>1.29</version> 
</dependency>
```

## 入门

```java
package com.github.houbb.yaml.test;

import org.yaml.snakeyaml.Yaml;
import java.io.FileWriter;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class SnakeYAMLExample {

    public static void main(String[] args) throws IOException {
        // 定义一个Java对象

        Map<String, Object> data = new HashMap<>();
        data.put("name", "John Doe");
        data.put("age", 30);
        data.put("isEmployed", true);

        Map<String, Object> addressData = new HashMap<>();
        addressData.put("city", "New York");
        addressData.put("zip", "10001");
        data.put("address", addressData);

        // 将Java对象写入YAML文件
        try (FileWriter writer = new FileWriter("snakeyaml_output.yaml")) {
            Yaml yaml = new Yaml();
            yaml.dump(data, writer);
            System.out.println("YAML文件已生成。");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 从YAML文件中读取数据
        try (FileReader reader = new FileReader("snakeyaml_output.yaml")) {
            Yaml yaml = new Yaml();
            Map<String, Object> loadedData = yaml.load(reader);
            System.out.println("从YAML文件中读取的数据：" + loadedData);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 效果

```yml
address: {zip: '10001', city: New York}
name: John Doe
isEmployed: true
age: 30
```

# Jackson YAML

## maven

```xml
<dependency>
    <groupId>com.fasterxml.jackson.dataformat</groupId>
    <artifactId>jackson-dataformat-yaml</artifactId>
    <version>2.13.0</version> 
</dependency>
```

## java 

```java
package com.github.houbb.yaml.test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class JacksonYAMLExample {

    public static void main(String[] args) {
        // 定义一个Java对象
        Map<String, Object> data = new HashMap<>();
        data.put("name", "John Doe");
        data.put("age", 30);
        data.put("isEmployed", true);

        Map<String, Object> addressData = new HashMap<>();
        addressData.put("city", "New York");
        addressData.put("zip", "10001");
        data.put("address", addressData);

        // 将Java对象写入YAML文件
        try {
            ObjectMapper objectMapper = new ObjectMapper(new YAMLFactory());
            objectMapper.writeValue(new File("JacksonYAML_output.yaml"), data);
            System.out.println("YAML文件已生成。");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 从YAML文件中读取数据
        try {
            ObjectMapper objectMapper = new ObjectMapper(new YAMLFactory());
            Map<String, Object> loadedData = objectMapper.readValue(new File("JacksonYAML_output.yaml"), Map.class);
            System.out.println("从YAML文件中读取的数据：");
            System.out.println(loadedData);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
```

## 效果

```yml
---
address:
  zip: "10001"
  city: "New York"
name: "John Doe"
isEmployed: true
age: 30
```

# YAMLBeans

## maven

```xml
<dependency>
    <groupId>com.esotericsoftware.yamlbeans</groupId>
    <artifactId>yamlbeans</artifactId>
    <version>1.15</version>
</dependency>
```

## java

```java
package com.github.houbb.yaml.test;

import com.esotericsoftware.yamlbeans.YamlReader;
import com.esotericsoftware.yamlbeans.YamlWriter;

import java.io.FileWriter;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class YAMLBeansExample {

    public static void main(String[] args) {
        Map<String, Object> data = new HashMap<>();
        data.put("name", "John Doe");
        data.put("age", 30);
        data.put("isEmployed", true);

        Map<String, Object> addressData = new HashMap<>();
        addressData.put("city", "New York");
        addressData.put("zip", "10001");
        data.put("address", addressData);

        // 将 Java 对象写入 YAML 文件
        try (FileWriter writer = new FileWriter("YAMLBeans_output.yaml")) {
            YamlWriter yamlWriter = new YamlWriter(writer);
            yamlWriter.write(data);
            yamlWriter.close();
            System.out.println("YAML 文件已生成。");
        } catch (IOException e) {
            e.printStackTrace();
        }

        // 从 YAML 文件中读取数据
        try (FileReader reader = new FileReader("YAMLBeans_output.yaml")) {
            YamlReader yamlReader = new YamlReader(reader);
            Map loadedData = (Map) yamlReader.read();
            System.out.println("从 YAML 文件中读取的数据：");
            System.out.println(loadedData);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

## 输出

```yml
address: 
   zip: 10001
   city: New York
name: John Doe
isEmployed: true
age: 30
```

# 小结

yaml 解析的组件比较多，可以选择自己合适的。

也可以考虑实现一个我们自己的 yaml 解析工具。

考虑技术的矩阵：

xml

property

json

csv

java-bean

* any list
{:toc}
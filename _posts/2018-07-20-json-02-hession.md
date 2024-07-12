---
layout: post
title:  Json 之 Hession
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# Hessian

## 概念

Hessian是一个动态类型,二进制序列化,也是网络协议为了对象的定向传输。

## 优点

Hessian二进制的网络协议使不需要引入大型框架下就可以使用，并且不需要学习其它的入门的协议。

因为它是二进制协议，它更擅长于发送二进制数据，而不需要引入其它附件去扩展它的协议。

Hessian支持很多种语言，例如Java，Flash/Flex,python,c++,.net/c#,D,Erlang,PHP,Ruby,Object C等

## 设计目标

Hessian是一个动态类型，简洁的，可以移植到各个语言

Hessian协议有以下的设计目标：

- 它必须自我描述序列化的类型，即不需要外部架构和接口定义

- 它必须是语言语言独立的，要支持包括脚本语言

- 它必须是可读可写的在单一的途径

- 它要尽可能的简洁

- 它必须是简单的，它可以有效地测试和实施

- 尽可能的快

- 必须要支持Unicode编码

- 它必须支持八位二进制文件，而不是逃避或者用附件

- 它必须支持加密,压缩,签名,还有事务的上下文

# Hessian 入门示例

以下是一个简单的 Hessian 使用示例，包括 Maven 依赖和代码示例。

## Maven 依赖

在你的 `pom.xml` 中添加以下依赖：

```xml
<dependencies>
    <dependency>
        <groupId>com.caucho</groupId>
        <artifactId>hessian</artifactId>
        <version>4.0.68</version> <!-- 请使用最新版本 -->
    </dependency>
</dependencies>
```

## 创建可序列化的类

创建一个简单的 Java 类，例如 `Person`：

```java
import java.io.Serializable;

public class Person implements Serializable {
    private String name;
    private int age;

    // 构造函数、getter 和 setter
}
```

## 序列化和反序列化示例

以下是使用 Hessian 进行序列化和反序列化的示例：

```java
import com.caucho.hessian.client.HessianProxyFactory;
import com.caucho.hessian.io.HessianInput;
import com.caucho.hessian.io.HessianOutput;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

public class Main {
    public static void main(String[] args) {
        try {
            // 创建一个 Person 对象
            Person person = new Person("Alice", 30);

            // 序列化
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            HessianOutput hessianOutput = new HessianOutput(outputStream);
            hessianOutput.writeObject(person);
            byte[] bytes = outputStream.toByteArray();

            // 反序列化
            ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);
            HessianInput hessianInput = new HessianInput(inputStream);
            Person deserializedPerson = (Person) hessianInput.readObject();

            // 输出反序列化的结果
            System.out.println("Name: " + deserializedPerson.getName());
            System.out.println("Age: " + deserializedPerson.getAge());

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

- Hessian

[Hessian](http://hessian.caucho.com/doc/hessian-serialization.html)

https://www.jianshu.com/p/e800d8af4e22

* any list
{:toc}
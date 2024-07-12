---
layout: post
title: 跨语言传输协议-Thirft
date:  2018-09-20 10:06:48 +0800
categories: [Protocol]
tags: [protocol, google, sh]
published: true
---

# Apache Thrift

[Apache Thrift](https://thrift.apache.org/) 软件框架，用于可伸缩的跨语言服务开发，它将软件堆栈和代码生成引擎结合在一起，构建了在c++、Java、Python、PHP、Ruby、Erlang、Perl、Haskell、c#、Cocoa、JavaScript、Node之间高效无缝地工作的服务。js、Smalltalk、OCaml、Delphi等语言。

## 优点

Thrift实际上是实现了C/S模式，通过代码生成工具将接口定义文件生成服务器端和客户端代码（可以为不同语言），从而实现服务端和客户端跨语言的支持。用户在Thirft描述文件中声明自己的服务，这些服务经过编译后会生成相应语言的代码文件，然后用户实现服务（客户端调用服务，服务器端提服务）便可以了。其中protocol（协议层, 定义数据传输格式，可以为二进制或者XML等）和transport（传输层，定义数据传输方式，可以为TCP/IP传输，内存共享或者文件共享等）被用作运行时库。

Thrift支持二进制，压缩格式，以及json格式数据的序列化和反序列化。这让用户可以更加灵活的选择协议的具体式。更完美的是，协议是可自由扩展的，新版本的协议，完全兼容老的版本！

## 缺点

文档不是很全。

# 跨语言传输协议

在现在的技术体系中，能用于描述通讯协议的方式很多，如 [xml](https://houbb.github.io/2017/06/21/xml)、
[json](https://houbb.github.io/2018/07/20/json)、[protobuf](https://houbb.github.io/2018/03/16/google-protocol-buffer)、thrift。

# Apache Thrift 入门示例

以下是一个简单的 Apache Thrift 使用示例：

## Maven 依赖

在你的 `pom.xml` 中添加以下依赖：

```xml
<dependencies>
    <dependency>
        <groupId>org.apache.thrift</groupId>
        <artifactId>libthrift</artifactId>
        <version>0.16.0</version> <!-- 请使用最新版本 -->
    </dependency>
</dependencies>
```

## 创建 Thrift IDL 文件

创建一个名为 `person.thrift` 的文件，定义你的数据结构和服务：

```thrift
namespace java example

struct Person {
    1: string name,
    2: i32 age
}

service PersonService {
    Person getPerson(1: string name);
}
```

## 生成 Java 代码

使用 Thrift 编译器生成 Java 代码：

```bash
thrift --gen java person.thrift
```

这将生成一个 `gen-java` 目录，包含所需的 Java 文件。

## 实现服务

创建一个简单的服务实现类：

```java
import example.Person;
import example.PersonService;
import org.apache.thrift.TException;

public class PersonServiceImpl implements PersonService.Iface {
    @Override
    public Person getPerson(String name) throws TException {
        return new Person(name, 30); // 示例：返回一个默认年龄的 Person
    }
}
```

## 启动服务

创建一个简单的服务器来运行你的服务：

```java
import org.apache.thrift.TProcessor;
import org.apache.thrift.server.TSimpleServer;
import org.apache.thrift.transport.TServerSocket;
import org.apache.thrift.transport.TServerTransport;

public class Main {
    public static void main(String[] args) {
        try {
            TProcessor processor = new PersonService.Processor<>(new PersonServiceImpl());
            TServerTransport serverTransport = new TServerSocket(9090);
            TSimpleServer server = new TSimpleServer(new TSimpleServer.Args(serverTransport).processor(processor));

            System.out.println("Starting the server...");
            server.serve();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

## 客户端调用

创建一个简单的客户端来调用服务：

```java
import example.Person;
import example.PersonService;
import org.apache.thrift.TException;
import org.apache.thrift.transport.TSocket;
import org.apache.thrift.transport.TTransport;
import org.apache.thrift.protocol.TBinaryProtocol;

public class Client {
    public static void main(String[] args) {
        TTransport transport = new TSocket("localhost", 9090);
        try {
            transport.open();
            PersonService.Client client = new PersonService.Client(new TBinaryProtocol(transport));

            Person person = client.getPerson("Alice");
            System.out.println("Name: " + person.getName());
            System.out.println("Age: " + person.getAge());
        } catch (TException e) {
            e.printStackTrace();
        } finally {
            transport.close();
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

[比较跨语言通讯框架：thrift和Protobuf](http://bijian1013.iteye.com/blog/2232207)


* any list
{:toc}
---
layout: post
title:  Json 之 Jboss Marshaling
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# About JBoss Marshalling

[JBoss Marshalling](https://jbossmarshalling.jboss.org/) is an alternative serialization API that fixes many of the problems found in the JDK serialization API while remaining fully compatible with java.io.Serializable and its relatives, and adds several new tunable parameters and additional features, all of which are pluggable via factory configuration (externalizers, class/instance lookup tables, class resolution, and object replacement, to name a few).

## 特性

该框架的灵感来自对标准Object * Stream类不具备的某些功能的需求：

可插拔的类解析器，通过实现一个小的接口（而不是子类化Object * Stream类），可以轻松自定义类加载器策略

可插拔对象替换（也无需子类化）

可插拔的预定义类表，对于经常使用一组通用类的流类型，可以显着减少流大小和序列化时间

可插拔的预定义实例表，可轻松处理远程引用

可插拔的外部化程序，可用于序列化不可序列化的类，或者需要替代策略的类

可自定义的流头

每个编组器实例都是高度可配置和可调的，以根据预期的使用模式最大化性能

可以支持许多不同协议实现的通用API，包括不一定提供所有上述功能的协议

廉价的实例创建，对于使用许多短期流的应用程序有利

如果协议允许，则支持单独的类和实例缓存；对于通过单个流发送多个消息或请求，使用单独的对象图但保留类高速缓存很有用

# 概览

存储和检索JavaTM对象的能力对于构建除了最短暂的应用程序以外的所有应用程序都是必不可少的。

以序列化形式存储和检索对象的关键是表示足以重建对象的对象状态。

流中要保存的对象可以支持Serializable或Externalizable接口。

对于JavaTM对象，序列化的表单必须能够识别和验证从中保存对象内容的JavaTM类，并将内容还原到新实例。

对于可序列化的对象，流包含足够的信息以将流中的字段还原到该类的兼容版本。对于Externalizable对象，该类仅负责其内容的外部格式。

要存储和检索的对象经常引用其他对象。这些其他对象必须同时存储和检索，以保持对象之间的关系。存储对象时，也将存储从该对象可访问的所有对象。

## 序列化JavaTM对象的目标是：

- 具有简单但可扩展的机制。

- 保持序列化形式的JavaTM对象类型和安全属性。

- 可扩展以支持远程对象所需的封送处理和拆封处理。

- 可扩展以支持JavaTM对象的简单持久性。

- 仅针对自定义要求每个类的实现。

- 允许对象定义其外部格式。


# 入门

## 序列化

Writing objects and primitives to a stream is a straightforward process. 

For example:

```java
// Serialize today's date to a file.
FileOutputStream f = new FileOutputStream("tmp");
ObjectOutput s = new ObjectOutputStream(f);
s.writeObject("Today");
s.writeObject(new Date());
s.flush();
```

## 反序列化

Reading an object from a stream, like writing, is straightforward:

```java
FileInputStream in = new FileInputStream("tmp");
ObjectInputStream s = new ObjectInputStream(in);
String today = (String)s.readObject();
Date date = (Date)s.readObject();
```

# 参考资料

[https://jbossmarshalling.jboss.org/](https://jbossmarshalling.jboss.org/)

[https://docs.oracle.com/javase/6/docs/platform/serialization/spec/serial-arch.html](https://docs.oracle.com/javase/6/docs/platform/serialization/spec/serial-arch.html)

* any list
{:toc}
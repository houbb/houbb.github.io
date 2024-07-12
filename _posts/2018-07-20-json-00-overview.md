---
layout: post
title:  Json-00-json 11 种序列化库对比 DSL、fastjson、gson、jackson、Google protocol buffer、Apache Thrift、Hession、Kryo、Fst、Messagepack、Jboss Marshaling 
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, overivew, sf]
published: true
---

# 为什么需要 json

不同语言之间，或者相同语言之间。需要一种对象到 json （持久化）的一种实现方式。以及反序列化的方式。

# 常见的序列化库对比

以下是 DSL、fastjson、Gson、Jackson、Google Protocol Buffers、Apache Thrift、Hessian、Kryo、Fst、MessagePack 和 JBoss Marshalling 的详细对比表格：

| 特性                     | DSL-Json             | Fastjson             | Gson                 | Jackson             | Google Protocol Buffers | Apache Thrift       | Hessian              | Kryo                  | FST                   | MessagePack          | JBoss Marshalling   |
|------------------------|----------------------|----------------------|----------------------|----------------------|-------------------------|----------------------|----------------------|----------------------|----------------------|----------------------|----------------------|
| **类型**                | JSON库               | JSON库               | JSON库               | JSON库               | 二进制序列化           | 跨语言序列化         | 二进制序列化         | 二进制序列化         | 二进制序列化         | 二进制序列化         | 二进制序列化         |
| **序列化性能**          | 高效                 | 快速                 | 一般                 | 高效                 | 高效                    | 高效                 | 一般                 | 高效                 | 超高效               | 高效                 | 高效                 |
| **反序列化性能**        | 高效                 | 快速                 | 一般                 | 高效                 | 高效                    | 高效                 | 一般                 | 高效                 | 超高效               | 高效                 | 高效                 |
| **支持的数据格式**      | JSON                 | JSON                 | JSON                 | JSON, XML, YAML等    | Protobuf                | Thrift               | 二进制, JSON         | 二进制               | 二进制               | 二进制, JSON         | 二进制               |
| **数据类型支持**        | JVM数据类型          | JVM数据类型          | JVM数据类型          | 广泛支持             | 结构化数据             | 结构化数据           | 结构化数据           | 结构化数据           | 结构化数据           | 结构化数据           | 结构化数据           |
| **跨语言支持**          | 否                   | 否                   | 否                   | 否                   | 是                      | 是                   | 否                   | 否                   | 否                   | 是                   | 否                   |
| **版本兼容性**          | 较好                 | 较好                 | 较好                 | 较好                 | 良好                   | 良好                 | 良好                 | 较好                 | 较好                 | 较好                 | 良好                 |
| **复杂对象支持**        | 支持                 | 支持                 | 支持                 | 支持                 | 支持                   | 支持                 | 支持                 | 支持                 | 支持                 | 支持                 | 支持                 |
| **可扩展性**            | 高                   | 中                   | 中                   | 高                   | 高                     | 高                   | 中                   | 中                   | 中                   | 中                   | 高                   |
| **序列化/反序列化库**   | 自带                 | 自带                 | 自带                 | 自带                 | 自带                   | 自带                 | 自带                 | 自带                 | 自带                 | 自带                 | 自带                 |
| **学习曲线**            | 低                   | 低                   | 低                   | 中                   | 中                     | 中                   | 低                   | 低                   | 低                   | 中                   | 中                   |
| **社区支持**            | 较小                 | 大                   | 大                   | 大                   | 大                     | 大                   | 中                   | 中                   | 中                   | 中                   | 中                   |

### 总结

- **DSL-Json** 和 **Jackson** 提供了高效的 JSON 序列化性能。
- **Fastjson** 和 **Gson** 是常用的 JSON 库，易于使用但性能稍逊。
- **Google Protocol Buffers** 和 **Apache Thrift** 提供跨语言支持的高效序列化方案。
- **Kryo** 和 **FST** 提供了非常高效的二进制序列化。
- **Hessian** 和 **JBoss Marshalling** 是稳定的二进制序列化方案，适用于 Java 应用。

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

## 开源库

> [json 针对常见 json 的统一封装](https://github.com/houbb/json)

# chat

## 为什么需要序列化？

序列化的必要性主要体现在以下几个方面：

1. **数据持久化**：将对象的状态保存到文件或数据库中，以便在系统重启后能够恢复对象状态。

2. **网络传输**：在分布式系统中，序列化可以将对象转换为字节流，以便通过网络进行传输，支持不同平台之间的数据交换。

3. **远程调用**：在远程过程调用（RPC）中，序列化用于将方法参数和返回值转换为可传输的格式，以便在客户端和服务器之间进行通信。

4. **缓存**：序列化可以将对象存储在缓存中，减少重复计算和数据库访问，提高系统性能。

5. **对象存储**：在一些场景中，应用程序需要将对象存储到非内存的存储介质中，如消息队列或对象存储服务。

6. **版本控制**：序列化提供了对象的版本控制能力，允许对象在不同版本之间进行兼容性处理。

通过序列化，可以实现数据的持久性和传输的高效性，支持现代应用程序的多种需求。

# 文件格式

Avro, 

BSON, 

CBOR, 

CSV, 

Smile, 

(Java) Properties, 

Protobuf, 

XML 

YAML

# 拓展阅读

## 序列化

[Serializable](https://houbb.github.io/2018/09/06/java-serial)

[序列化标识](https://houbb.github.io/2018/09/06/java-serial-id-02)

# 参考资料

[json 汇总](https://github.com/akullpp/awesome-java#json)

* any list
{:toc}
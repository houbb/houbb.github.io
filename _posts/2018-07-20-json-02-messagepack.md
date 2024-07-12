---
layout: post
title:  Json 之 MessagePack
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# MessagePack

[MessagePack](https://msgpack.org/) 是一种高效的二进制序列化格式。

它可以像 JSON 一样在多种语言之间交换数据。

但它更快且更小。

小整数被编码成一个字节，典型的短字符串只需要一个额外的字节来存储字符串本身。

## 特性

- 支持语言丰富

## 压缩比例

原始大小为 27 byte

```json
{"compact":true,"schema":0}
```

压缩后：

18 bytes 67 %

```
82 a7 63 6f 6d 70 61 63 74 c3 a6 73 63 68 65 6d 61 00
```

# 快速开始

## maven 引入

```xml
<dependency>
    <groupId>org.msgpack</groupId>
    <artifactId>msgpack-core</artifactId>
    <version>0.8.22</version>
</dependency>
```

## 代码案例

```java
// Create serialize objects.
List<String> src = new ArrayList<String>();
src.add("msgpack");
src.add("kumofs");
src.add("viver");

MessagePack msgpack = new MessagePack();
// Serialize
byte[] raw = msgpack.write(src);

// Deserialize directly using a template
List<String> dst1 = msgpack.read(raw, Templates.tList(Templates.TString));
System.out.println(dst1.get(0));
System.out.println(dst1.get(1));
System.out.println(dst1.get(2));

// Or, Deserialze to Value then convert type.
Value dynamic = msgpack.read(raw);
List<String> dst2 = new Converter(dynamic)
    .read(Templates.tList(Templates.TString));
System.out.println(dst2.get(0));
System.out.println(dst2.get(1));
System.out.println(dst2.get(2));
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


* any list
{:toc}
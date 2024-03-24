---
layout: post
title:  Json 之 MessagePack
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# MessagePack

[MessagePack](https://msgpack.org/) is an efficient binary serialization format. 

It lets you exchange data among multiple languages like JSON. 

But it's faster and smaller. 

Small integers are encoded into a single byte, and typical short strings require only one extra byte in addition to the strings themselves.

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

* any list
{:toc}
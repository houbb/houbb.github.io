---
layout: post
title:  Json 之 Jackson
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# jackson

[jackson](https://github.com/FasterXML/jackson) is a suite of data-processing tools for Java (and the JVM platform), including the flagship streaming JSON parser / generator library, matching data-binding library (POJOs to and from JSON) and additional data format modules to process data encoded in Avro, BSON, CBOR, CSV, Smile, (Java) Properties, Protobuf, XML or YAML; and even the large set of data format modules to support data types of widely used data types such as Guava, Joda, PCollections and many, many more (see below).

## 个人感受

支持多种格式，多种语言（JVM），甚至其他常见框架。

比如 Guava/Joda/PCollections

换言之，这些工具也值得学习。所有的格式也应该值得学习。

## 核心组成部分

While the actual core components live under their own projects -- including the three core packages (streaming, databind, annotations); 

data format libraries; data type libraries; JAX-RS provider; and a miscellaneous set of other extension modules -- this project act as the central hub for linking all the pieces together.

## 核心模块

Core modules are the foundation on which extensions (modules) build upon. 

There are 3 such modules currently (as of Jackson 2.x):

Streaming (docs) ("jackson-core") defines low-level streaming API, and includes JSON-specific implementations

Annotations (docs) ("jackson-annotations") contains standard Jackson annotations

Databind (docs) ("jackson-databind") implements data-binding (and object serialization) support on streaming package; it depends both on streaming and annotations packages

- 个人感受

实际上这三个部分是互相独立的。所以可以各自发展。

这个框架将三者结合起来，形成一个序列化的框架。


# Datatype modules 支持

支持多种三方的格式类型。

Datatype modules directly maintained by Jackson team are under the following Github repositories:

## 标准集合类型

Guava: support for many of Guava datatypes.

HPPC: support for High-Performance Primitive Containers containers

PCollections: support for PCollections datatypes (NEW in Jackson 2.7!)

## 其他框架

Hibernate: support for Hibernate features (lazy-loading, proxies)

Joda: support for types of Joda date/time library datatypes

## jdk

JDK7: support for JDK 7 data types not included in previous versions

Deprecated in 2.7, as baseline JDK becomes 7, support to be included in jackson-databind

Java 8 Modules: support or JDK 8 features and datatypes through 3 separate modules

## JSON 相关

JSR-353: support for "Java JSON API" types (specifically, its tree model objects)

org.json: support for "org.json JSON lib" types like JSONObject, JSONArray

# JAX-RS 支持

Jackson JAX-RS Providers has handlers to add dataformat support for JAX-RS implementations (like Jersey, RESTeasy, CXF). 

Providers implement MessageBodyReader and MessageBodyWriter. 

Supported formats currently include JSON, Smile, XML, YAML and CBOR.

# Data format modules

多种常见格式的支持：

Avro: supports Avro data format, with streaming implementation plus additional databind-level support for Avro Schemas

CBOR: supports CBOR data format (a binary JSON variant).

CSV: supports Comma-separated values format -- streaming api, with optional convenience databind additions

Ion (NEW with Jackson 2.9!): support for Amazon Ion binary data format (similar to CBOR, Smile, i.e. binary JSON - like)

(Java) Properties (2.8): creating nested structure out of implied notation (dotted by default, configurable), flattening similarly on serialization

Protobuf (2.6): supported similar to Avro

Smile: supports Smile (binary JSON) -- 100% API/logical model compatible via streaming API, no changes for databind

XML: supports XML; provides both streaming and databind implementations. Similar to JAXB' "code-first" mode (no support for "XML Schema first", but can use JAXB beans)

YAML: supports YAML, which being similar to JSON is fully supported with simple streaming implementation

# 小结

jackson 支持大量丰富的数据类型和数据格式，侧重点在于丰富的支持。

想完成类似的框架，需要付出大量的时间。

* any list
{:toc}
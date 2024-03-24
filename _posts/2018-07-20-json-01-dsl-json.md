---
layout: post
title:  Json 之 DSL-Json
date:  2018-07-20 09:24:03 +0800
categories: [Java]
tags: [java, json, config, sf]
published: true
---

# DSL-Json
 
[dsl-json](https://github.com/ngs-doo/dsl-json) is Fastest JVM (Java/Android/Scala/Kotlin) JSON library with advanced compile-time databinding support. 

Compatible with DSL Platform.

Java JSON library designed for performance. 

Built for invasive software composition with DSL Platform compiler.

## 备注

编译时注解的效率，在于编译时就将所有的字节码生成完成，而保证源码的简洁性。同时不像运行时注解一样损失性能。

# 特性

- 支持外部架构 - 域规范语言（DSL）

- 通过注释处理器在现有的POJO类上工作

- 性能 - 比任何其他Java JSON库更快。与最快的二进制JVM编解码器相提并论

- 在字节级别上工作 - 反序列化可以在byte[]或InputStream上工作。它不需要中间字符表示

- 可扩展性 - 支持自定义类型，自定义分析器，注释处理器扩展......

- 流支持 - 大型JSON列表支持流媒体，内存使用量最少

- 零拷贝操作 - 转换器避免产生垃圾

- 最小大小 - 运行时依赖性权重约为200KB

- 没有不安全的代码 - 库不依赖于Java UNSAFE /内部方法

- POJO < - >对象和/或数组格式 - 数组格式避免序列化名称，而对象格式可用于最小序列化模式

- 遗留名称映射 - 可以使用alternativeNames批注将多个版本的JSON属性名称映射到单个POJO中

- 绑定到现有实例 - 在反序列化期间，可以提供现有实例以减少GC

- 泛型，构建器模式，工厂模式和带参数的ctor  -  Java8版本支持所有相关的初始化方法

- 编译时检测到不安全的转换 -  Java8版本可能会导致转换的编译时错误，这可能会在运行时失败

- 高级注释处理器支持 - 通过将Java代码转换为DSL模式，支持仅Java编译或DSL平台集成

- 可定制的运行时开销 - 在反射模式下，在Java8注释处理器模式或DSL平台模式下工作。基于模式和注释的POJO是在编译时准备的

- 支持其他库注释 - 将使用Jackson和JsonB注释，并且可以以各种方式扩展编译时间分析

- Scala类型支持 -  Scala集合，基元和盒装基元无需任何额外的注释或配置即可工作

- Kotlin支持 - 注释处理器可以在Kotlin中使用。支持NonNull注释

- JsonB支持 - 对JsonB String和Stream API的高级支持。只有最低限度的配置支持

# 基于模式的序列化

DSL可用于定义架构，从中构造具有嵌入式JSON转换的POJO类。 

这在大型多语言项目中很有用，其中模型是在Java类之外定义的。 有

关DSL的更多信息，请访问[DSL平台网站](https://dsl-platform.com/)。

# @CompiledJson annotation

注释处理器通过分析Java类及其显式或隐式引用来工作。

处理器在编译时输出编码/解码代码/描述。

这避免了对反射的需要，提供了编译时安全性并允许一些高级配置。

处理器将优化的转换器注册到 META-INF/services。

这将在使用ServiceLoader进行DslJson初始化期间加载。

由于v1.8.0命名约定将用于Java8转换器（package._NAME_DslJsonConverter），即使不预先加载服务也可以使用。

即使对于没有@CompiledJson注释的依赖对象，也将创建转换器。

这可用于为预先存在的类创建序列化程序，而无需对其进行注释。

## Java8注释处理器

从v1.7.0开始，DSL-JSON支持没有 Mono/.NET 依赖性的编译时数据绑定。 

由于与运行时分析集成以及各种通用分析的组合，它提供了大多数功能和灵活性。 

支持Bean属性，公共字段，没有空构造函数的类，工厂和构建器模式。 

可以使用包私有类和工厂方法。 阵列格式可用于有效的有效载荷传输。

要使用Java8注释处理器，它只需引用Java8版本的库：

```xml
<dependency>
  <groupId>com.dslplatform</groupId>
  <artifactId>dsl-json-java8</artifactId>
  <version>1.9.3</version>
</dependency>
```

For use in Android, Gradle can be configured with:

```
android {
  compileOptions {
    sourceCompatibility 1.8
    targetCompatibility 1.8
  }
}
dependencies {
  compile 'com.dslplatform:dsl-json-java8:1.9.3'
  annotationProcessor 'com.dslplatform:dsl-json-java8:1.9.3'
  provided 'javax.json.bind:javax.json.bind-api:1.0'
}
```


# 个人收获

## 运行时注解

使用运行时注解，提升性能

## DSL 标准

使用 DSL 标准，使得可以兼容所有的 JVM 语言。

而不是仅仅局限于 Java。

* any list
{:toc}
---
layout: post
title: javaparser-Java 1-15 Parser and Abstract Syntax Tree for Java, including preview features to Java 13
date: 2021-08-29 21:01:55 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# javaparser

该项目包含一组实现具有高级分析功能的 Java 1.0 - Java 15 Parser 的库。 

这包括 Java 13 的预览功能，Java 14 预览功能正在进行中。

我们的主要站点位于 JavaParser.org

# 快速开始

项目二进制文件在 Maven Central 中可用。

我们强烈建议用户为他们的项目采用 Maven、Gradle 或其他构建系统。 

如果您不熟悉它们，我们建议您查看 maven 快速入门项目（javaparser-maven-sample、javasymbolsolver-maven-sample）。

只需将以下内容添加到您的 Maven 配置或定制您自己的依赖管理系统。

从 2.5.1 升级到 3.0.0+ 时请参考迁移指南

## maven 引入

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-symbol-solver-core</artifactId>
    <version>3.23.0</version>
</dependency>
```


从版本 3.5.10 开始，JavaParser 项目包括 JavaSymbolSolver。 

JavaParser 生成抽象语法树时，JavaSymbolSolver 分析该 AST 并能够找到元素与其声明之间的关系（例如，对于变量名，它可以是方法的参数，提供有关其类型、在 AST 中的位置的信息） 等）。

使用上面的依赖项会将 JavaParser 和 JavaSymbolSolver 添加到您的项目中。 

如果您只需要解析 Java 源代码的核心功能来遍历和操作生成的 AST，您可以通过仅在项目中包含 JavaParser 来减少项目样板：

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-core</artifactId>
    <version>3.23.0</version>
</dependency>
```

从 3.6.17 版本开始，AST 可以序列化为 JSON。 

有一个单独的模块：

```xml
<dependency>
    <groupId>com.github.javaparser</groupId>
    <artifactId>javaparser-core-serialization</artifactId>
    <version>3.23.0</version>
</dependency>
```

# 参考资料

https://github.com/javaparser/javaparser

* any list
{:toc}
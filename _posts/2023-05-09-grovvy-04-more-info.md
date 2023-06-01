---
layout: post
title: grovvy-04-核心内容概览
date:  2023-05-09 +0800
categories: [Lang]
tags: [grovvy, lang, sh]
published: true
---

# 说明

把一些常用内容大概介绍，便于后续查阅。

# 开发工具包

https://groovy-lang.org/groovy-dev-kit.html

Groovy为处理I/O提供了许多辅助方法。虽然您可以在Groovy中使用标准的Java代码来处理这些问题，但Groovy提供了更方便的方式来处理文件、流、读取器等等。

特别是，您应该查看添加到以下方法中的内容：

- File类：Groovy对File类进行了扩展，提供了更简洁的文件操作方法，例如读取文件内容、写入文件、创建目录等。
- InputStream和OutputStream类：Groovy为这些类添加了许多便捷的方法，用于读取和写入字节流数据，例如将字节流转换为字符串、从URL下载文件等。
- Reader和Writer类：Groovy通过添加一些实用方法，使读取和写入字符流变得更加简单，例如逐行读取文件、写入字符串到文件等。

通过利用Groovy提供的这些辅助方法，您可以以更简洁、更方便的方式处理I/O操作，而无需编写繁琐的Java代码。

# 编译/运行时的元数据变成

https://groovy-lang.org/metaprogramming.html

这个可以后续进阶使用。

Groovy语言支持两种元编程方式：运行时元编程和编译时元编程。前者允许在运行时修改类模型和程序行为，而后者仅在编译时发生。两种方式都有各自的优缺点，我们将在本节中详细介绍。

1. 运行时元编程：
   - 优点：
     - 灵活性：运行时元编程允许在运行时动态修改类模型和程序行为，提供了灵活性和适应性。
     - 动态行为修改：它能够在运行时添加或修改对象的方法、属性和行为，可以用于添加新功能或自定义现有行为。
     - 简化的API：它可以通过提供更简洁和表达力强的方法和运算符来简化类或库的API。

   - 缺点：
     - 运行时性能影响：运行时元编程会带来性能开销，因为修改需要在运行时应用和解析。
     - 调试复杂性：在运行时进行的修改可能使代码更难调试和理解，因为行为可能在源代码中没有明确定义。

2. 编译时元编程：
   - 优点：
     - 性能优化：编译时元编程允许在编译过程中进行优化，可能导致更快和更高效的代码执行。
     - 静态代码分析：它可以进行静态代码分析和类型检查，捕捉潜在错误并提供更好的工具支持。

   - 缺点：
     - 动态行为受限：编译时元编程仅限于在编译阶段可以确定和应用的修改，限制了运行时元编程的动态性。
     - 增加的复杂性：编写和管理编译时元编程代码可能更复杂，需要更深入地理解语言和编译器机制。

无论是运行时元编程还是编译时元编程，都提供了强大的能力来扩展和定制Groovy程序的行为。选择哪种方式取决于具体项目的要求和权衡。

# Grape JAR 管理

Grape是嵌入在Groovy中的JAR依赖管理器。它允许您快速将Maven仓库中的依赖项添加到类路径中，从而简化脚本编写。最简单的用法是在脚本中添加一个注解：

```groovy
@Grab('group:artifact:version')
```

默认情况下，Grape会从Maven中央仓库下载依赖项。但是，您可以配置Grape使用其他仓库或本地文件系统目录。要配置Grape，您可以在项目的根目录中创建一个GrapeConfig.xml文件，或者以编程方式指定配置。以下是以编程方式配置Grape的示例：

```groovy
import groovy.grape.Grape

Grape.grab(group: 'group', module: 'artifact', version: 'version')
```

这将使用指定的组、模块和版本下载依赖项。您可以根据项目的需求配置Grape，以满足特定的依赖管理要求。

> [https://groovy-lang.org/grape.html](https://groovy-lang.org/grape.html)

# 测试指南

## 1. 简介

Groovy编程语言提供了强大的测试支持。除了语言特性和与最先进的测试库和框架集成，Groovy生态系统还孕育了丰富的测试库和框架。

本章将从语言特定的测试功能开始，然后深入了解JUnit集成、用于规范的Spock和用于功能测试的Geb。最后，我们将概述其他已知适用于Groovy的测试库。

## 2. 语言特性

除了与JUnit的集成支持外，Groovy编程语言还提供了一些在测试驱动开发中非常有价值的特性。本节将对这些特性进行介绍。

> [https://groovy-lang.org/testing.html](https://groovy-lang.org/testing.html)


# 参考资料

chatGPT

https://groovy-lang.org/differences.html

* any list
{:toc}
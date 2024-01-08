---
layout: post
title: 获取 jar 包的依赖包等信息
date: 2024-01-05 21:01:55 +0800
categories: [Java]
tags: [java, sh]
published: true
---

# 思路

直接解析的话，可能会有一些限制。



# chat

## 有没有什么开源工具，可以直接获取 java war 中依赖的 jar 对应的 maven 坐标信息？

是的，有一些开源工具可以直接获取Java WAR文件中依赖的JAR对应的Maven坐标信息。其中一些工具如下：

1. **JARAnalyzer:**
   - JARAnalyzer 是一个用于分析JAR文件的工具，可以识别JAR文件中包含的类、资源以及依赖关系。它提供了图形用户界面（GUI）和命令行界面（CLI）两种方式。
   - GitHub 地址：[JARAnalyzer](https://github.com/skyscreamer/JARAnalyzer)

2. **Tattletale:**
   - Tattletale 是一个Java应用程序，用于分析JAR文件、WAR文件以及EAR文件，以查找重复的类、资源以及提供关于依赖关系的报告。
   - 官方网站：[Tattletale](http://www.jboss.org/tattletale)

3. **JHades:**
   - JHades 是一个用于分析JAR文件、WAR文件以及EAR文件的轻量级工具。它可以帮助你查找冲突、重复的类等，并提供有关依赖关系的信息。
   - GitHub 地址：[JHades](https://github.com/peter-lawrey/Java-Thread-Affinity)

4. **JDepend:**
   - JDepend 是一个用于分析Java包的工具，它可以查找包之间的依赖关系。虽然不直接用于分析WAR文件，但如果你拥有解压后的类文件，可以使用 JDepend 进行包的依赖分析。
   - 官方网站：[JDepend](https://github.com/clarkware/jdepend)

请注意，这些工具的适用性可能会因项目结构、构建工具使用情况等而有所不同。你可以根据具体的需求选择适合你项目的工具。在实际使用中，结合构建工具（如Maven或Gradle）以及上述工具可以更全面地分析和管理依赖关系。

## 有没有什么开源 maven 包，可以分析 java war 包？

有几个开源工具包可以用于分析Java WAR包，这些工具提供了对WAR文件结构、依赖关系、类和资源的详细信息。以下是其中的一些工具：

1. **Apache Tika:**
   - Apache Tika 是一个通用的文档识别和提取工具，可以用于分析WAR文件中的内容。它可以提供有关文档、元数据和语言的信息。
   - 项目主页：[Apache Tika](https://tika.apache.org/)

2. **Java Archive Grinder (JARGrinder):**
   - JARGrinder 是一个用于分析JAR和WAR文件的工具，它提供了对类、资源和依赖项的详细信息。它还能够生成依赖图。
   - GitHub 地址：[JARGrinder](https://github.com/Netflix-Skunkworks/jar-grinder)

3. **Bytecode Viewer:**
   - Bytecode Viewer 是一个用于查看和分析Java字节码的工具，它支持查看WAR文件中的类文件。你可以查看类的字节码、反编译代码等。
   - 项目主页：[Bytecode Viewer](https://bytecodeviewer.com/)

4. **Javaparser:**
   - Javaparser 是一个Java解析器，可以用于分析Java源代码。虽然主要用于源代码，但在某些情况下，你可能需要解压WAR文件并查看其中的类文件。
   - 项目主页：[Javaparser](https://javaparser.org/)

这些工具提供了从不同角度来分析Java WAR包的选项，具体选择取决于你的需求。如果你主要关注类和依赖关系，JARGrinder可能是一个不错的选择。如果你更关注文档、元数据等信息，Apache Tika可能更适合。Bytecode Viewer 和 Javaparser 则更专注于类文件的查看和分析。


# 参考资料


* any list
{:toc}
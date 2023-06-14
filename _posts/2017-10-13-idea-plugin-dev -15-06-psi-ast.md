---
layout: post
title:  Idea Plugin Dev-15-06-UAST - Unified Abstract Syntax Tree
date:  2017-10-13 10:24:52 +0800
categories: [Java]
tags: [java, idea, idea-plugin]
published: true
---

# UAST

UAST（统一抽象语法树）是针对 JVM（Java 虚拟机）的不同编程语言的 PSI 上的抽象层。 

它提供了一个统一的 API，用于处理公共语言元素，如类和方法声明、文字值和控制流运算符。

不同的 JVM 语言有自己的 PSI，但许多 IDE 功能，如检查、装订线标记、引用注入和许多其他功能，对所有这些语言都以相同的方式工作。 

使用 UAST 允许使用单一实现提供可在所有支持的 JVM 语言中工作的特性。

为 Kotlin 编写 IntelliJ 插件的演示文稿提供了在真实场景中使用 UAST 的全面概述。

# 我什么时候应该使用 UAST？

对于插件，这应该以相同的方式适用于所有 JVM 语言。

一些已知的例子是：

Spring Framework

Android Studio

Plugin DevKit

# 支持哪些语言？

Java：完全支持

Kotlin：全力支持

Scala：测试版，但完全支持

Groovy：仅声明，不支持方法体

# 修改 PSI 怎么样？

UAST 是只读 API。 有实验性的 UastCodeGenerationPlugin 和 JvmElementActionsFactory 类，但目前不建议外部使用。



# 参考资料

https://plugins.jetbrains.com/docs/intellij/uast.html#which-languages-are-supported

* any list
{:toc}